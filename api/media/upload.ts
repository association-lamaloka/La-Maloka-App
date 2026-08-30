import { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import firebaseConfig from '../../firebase-applet-config.json';

export const ALLOWED_IMAGE_TYPES = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp'], ['image/avif', 'avif']]);
export const safeBlobName = (contentType: string) => `la-maloka/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ALLOWED_IMAGE_TYPES.get(contentType)}`;
export const isAuthorizedAdmin = (user: { email?: string; emailVerified?: boolean }) => user.email === 'association.lamaloka@gmail.com' && user.emailVerified === true;

const json = (response: ServerResponse, status: number, body: object) => { response.statusCode = status; response.setHeader('content-type', 'application/json'); response.end(JSON.stringify(body)); };
const readBody = async (request: IncomingMessage, limit: number) => { const chunks: Buffer[] = []; let size = 0; for await (const chunk of request) { size += chunk.length; if (size > limit) throw new Error('FILE_TOO_LARGE'); chunks.push(chunk); } return Buffer.concat(chunks); };

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') return json(response, 405, { error: 'Méthode non autorisée.' });
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return json(response, 503, { error: 'Vercel Blob n’est pas configuré. Ajoutez BLOB_READ_WRITE_TOKEN dans les variables Vercel de la Preview.' });
  const idToken = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!idToken) return json(response, 401, { error: 'Authentification Firebase requise.' });
  try {
    const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idToken }) });
    const authData = await authResponse.json() as { users?: Array<{ email?: string; emailVerified?: boolean }> };
    if (!authResponse.ok || !authData.users?.[0] || !isAuthorizedAdmin(authData.users[0])) return json(response, 403, { error: 'Ce compte Google n’est pas autorisé à administrer La Maloka.' });
    const contentType = String(request.headers['content-type'] ?? '').split(';')[0];
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) return json(response, 415, { error: 'Format refusé. Utilisez JPEG, PNG, WebP ou AVIF.' });
    const maxBytes = Number(process.env.BLOB_MAX_FILE_SIZE_MB || 5) * 1024 * 1024;
    const contentLength = Number(request.headers['content-length'] || 0);
    if (!contentLength || contentLength > maxBytes) return json(response, 413, { error: `Image trop volumineuse. Limite : ${maxBytes / 1024 / 1024} Mo.` });
    const body = await readBody(request, maxBytes);
    const pathname = safeBlobName(contentType);
    const blobResponse = await fetch(`https://blob.vercel-storage.com/${pathname}`, { method: 'PUT', headers: { authorization: `Bearer ${blobToken}`, 'x-api-version': '7', 'content-type': contentType, 'x-content-type': contentType, 'content-length': String(body.length) }, body });
    const blob = await blobResponse.json() as { url?: string; pathname?: string; error?: { message?: string } };
    if (!blobResponse.ok || !blob.url) throw new Error(blob.error?.message || 'BLOB_UPLOAD_FAILED');
    return json(response, 201, { url: blob.url, pathname: blob.pathname ?? pathname, contentType, size: body.length });
  } catch (error) {
    if (error instanceof Error && error.message === 'FILE_TOO_LARGE') return json(response, 413, { error: 'Image trop volumineuse.' });
    return json(response, 500, { error: 'Échec de la mise en ligne vers Vercel Blob. Vérifiez la configuration de la Preview.' });
  }
}
