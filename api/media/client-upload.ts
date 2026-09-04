import { IncomingMessage, ServerResponse } from 'node:http';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import firebaseConfig from '../../firebase-applet-config.json';

const ADMIN_EMAIL = 'association.lamaloka@gmail.com';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const VALID_PATHNAME = /^la-maloka\/[0-9]{4}-[0-9]{2}-[0-9]{2}\/[a-f0-9-]+\.(?:jpg|png|webp|avif)$/;

interface FirebaseAccount {
  email?: string;
  emailVerified?: boolean;
}

const json = (response: ServerResponse, status: number, body: object) => {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json');
  response.end(JSON.stringify(body));
};

type VercelRequest = IncomingMessage & { body?: unknown };

const readJsonBody = async (request: VercelRequest) => {
  if (request.body !== undefined) {
    if (typeof request.body === 'string') {
      return JSON.parse(request.body) as HandleUploadBody;
    }
    if (request.body !== null && typeof request.body === 'object') {
      return request.body as HandleUploadBody;
    }
    throw new Error('INVALID_REQUEST_BODY');
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error('REQUEST_TOO_LARGE');
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');
  if (!rawBody) throw new Error('EMPTY_REQUEST_BODY');
  return JSON.parse(rawBody) as HandleUploadBody;
};

const verifyAdmin = async (idToken: string): Promise<FirebaseAccount> => {
  if (!idToken || idToken.length > 10_000) throw new Error('AUTH_REQUIRED');
  const authResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  );
  const authData = await authResponse.json() as { users?: FirebaseAccount[] };
  const user = authData.users?.[0];
  if (!authResponse.ok || user?.email !== ADMIN_EMAIL || user.emailVerified !== true) {
    throw new Error('AUTH_FORBIDDEN');
  }
  return user;
};

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') return json(response, 405, { error: 'Méthode non autorisée.' });

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    return json(response, 503, { error: 'BLOB_READ_WRITE_TOKEN absent de ce déploiement.' });
  }

  try {
    const body = await readJsonBody(request as VercelRequest);
    const result = await handleUpload({
      body,
      request,
      token: blobToken,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!VALID_PATHNAME.test(pathname)) throw new Error('INVALID_PATHNAME');
        await verifyAdmin(clientPayload ?? '');
        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_IMAGE_SIZE,
          tokenPayload: JSON.stringify({ admin: ADMIN_EMAIL }),
        };
      },
      onUploadCompleted: async () => {
        // The CMS keeps publication explicit: Firestore is updated only when
        // the administrator clicks “Enregistrer”.
      },
    });
    return json(response, 200, result);
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'AUTH_REQUIRED') return json(response, 401, { error: 'Authentification Firebase requise.' });
    if (code === 'AUTH_FORBIDDEN') return json(response, 403, { error: 'Ce compte Google n’est pas autorisé à administrer La Maloka.' });
    if (code === 'INVALID_PATHNAME') return json(response, 400, { error: 'Chemin de fichier invalide.' });
    return json(response, 400, { error: 'Impossible d’autoriser la mise en ligne de cette image.' });
  }
}
