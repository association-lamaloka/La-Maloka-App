import { IncomingMessage, ServerResponse } from 'node:http';
export const isDriveFileId = (value: string) => /^[A-Za-z0-9_-]{20,100}$/.test(value);
export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url || '', 'https://localhost');
  const fileId = url.searchParams.get('fileId') || '';
  response.setHeader('content-type', 'application/json');
  if (!isDriveFileId(fileId)) { response.statusCode = 400; return response.end(JSON.stringify({ public: false, error: 'Lien Google Drive invalide.' })); }
  try {
    const check = await fetch(`https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`, { redirect: 'follow' });
    const contentType = check.headers.get('content-type') || '';
    const isPublic = check.ok && contentType.startsWith('image/');
    response.statusCode = isPublic ? 200 : 422;
    return response.end(JSON.stringify({ public: isPublic, url: `https://drive.google.com/uc?export=view&id=${fileId}`, error: isPublic ? undefined : 'Rendez le fichier accessible à « Toute personne disposant du lien ».' }));
  } catch { response.statusCode = 502; return response.end(JSON.stringify({ public: false, error: 'Impossible de vérifier Google Drive actuellement.' })); }
}
