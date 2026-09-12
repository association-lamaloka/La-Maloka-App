import { IncomingMessage, ServerResponse } from 'node:http';
import { isDriveFileId } from './drive';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
class ImageTooLargeError extends Error {}

async function readLimitedBody(body: ReadableStream<Uint8Array> | null) {
  if (!body) return Buffer.alloc(0);
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_IMAGE_SIZE) {
      await reader.cancel();
      throw new ImageTooLargeError();
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), size);
}

const sendJson = (response: ServerResponse, status: number, error: string) => {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('x-content-type-options', 'nosniff');
  response.end(JSON.stringify({ error }));
};

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') return sendJson(response, 405, 'Méthode non autorisée.');

  const url = new URL(request.url || '', 'https://localhost');
  const fileId = url.searchParams.get('fileId') || '';
  if (!isDriveFileId(fileId)) return sendJson(response, 400, 'Identifiant Google Drive invalide.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const upstream = await fetch(`https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`, {
      redirect: 'follow',
      signal: controller.signal,
    });
    const contentType = (upstream.headers.get('content-type') || '').split(';')[0].toLowerCase();
    const declaredSize = Number(upstream.headers.get('content-length') || '0');
    if (!upstream.ok) return sendJson(response, 502, 'Google Drive n’a pas fourni cette image.');
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) return sendJson(response, 415, 'Le fichier Google Drive n’est pas une image autorisée.');
    if (declaredSize > MAX_IMAGE_SIZE) return sendJson(response, 413, 'L’image Google Drive dépasse 5 Mo.');

    const bytes = await readLimitedBody(upstream.body);

    response.statusCode = 200;
    response.setHeader('content-type', contentType);
    response.setHeader('content-length', String(bytes.byteLength));
    response.setHeader('cache-control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    response.setHeader('x-content-type-options', 'nosniff');
    response.end(bytes);
  } catch (caught) {
    if (caught instanceof ImageTooLargeError) return sendJson(response, 413, 'L’image Google Drive dépasse 5 Mo.');
    const message = caught instanceof Error && caught.name === 'AbortError'
      ? 'Google Drive n’a pas répondu à temps.'
      : 'Impossible de charger l’image Google Drive.';
    return sendJson(response, 502, message);
  } finally {
    clearTimeout(timeout);
  }
}
