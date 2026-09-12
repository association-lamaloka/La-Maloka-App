import assert from 'node:assert/strict';
import type { IncomingMessage, ServerResponse } from 'node:http';
import driveImage from '../api/media/drive-image';

function responseRecorder() {
  const headers = new Map<string, string>();
  const response = {
    statusCode: 0,
    body: Buffer.alloc(0),
    setHeader(name: string, value: string | number) { headers.set(name.toLowerCase(), String(value)); },
    end(chunk?: string | Uint8Array) { this.body = chunk === undefined ? Buffer.alloc(0) : Buffer.from(chunk); },
  };
  return { response: response as unknown as ServerResponse, result: response, headers };
}

const validId = '1gEYbTTpomRaa-mnuR6pwtQNivalsYeFV';
const originalFetch = globalThis.fetch;

try {
  let fetchCalls = 0;
  globalThis.fetch = async () => { fetchCalls += 1; return new Response(); };
  const invalid = responseRecorder();
  await driveImage({ method: 'GET', url: '/api/media/drive-image?fileId=bad' } as IncomingMessage, invalid.response);
  assert.equal(invalid.result.statusCode, 400);
  assert.equal(fetchCalls, 0, 'Un identifiant invalide ne doit jamais atteindre Google Drive.');

  const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
  let requestedUrl = '';
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    return new Response(bytes, { status: 200, headers: { 'content-type': 'image/jpeg', 'content-length': String(bytes.byteLength) } });
  };
  const success = responseRecorder();
  await driveImage({ method: 'GET', url: `/api/media/drive-image?fileId=${validId}` } as IncomingMessage, success.response);
  assert.equal(success.result.statusCode, 200);
  assert.equal(requestedUrl, `https://lh3.googleusercontent.com/d/${validId}=w2000`);
  assert.equal(success.headers.get('content-type'), 'image/jpeg');
  assert.equal(success.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(success.result.body, Buffer.from(bytes));

  globalThis.fetch = async () => new Response('<html>not an image</html>', { status: 200, headers: { 'content-type': 'text/html' } });
  const rejected = responseRecorder();
  await driveImage({ method: 'GET', url: `/api/media/drive-image?fileId=${validId}` } as IncomingMessage, rejected.response);
  assert.equal(rejected.result.statusCode, 415);

  globalThis.fetch = async () => new Response(new Uint8Array(5 * 1024 * 1024 + 1), { status: 200, headers: { 'content-type': 'image/png' } });
  const oversizedStream = responseRecorder();
  await driveImage({ method: 'GET', url: `/api/media/drive-image?fileId=${validId}` } as IncomingMessage, oversizedStream.response);
  assert.equal(oversizedStream.result.statusCode, 413, 'Le flux doit être interrompu même sans en-tête content-length.');

  console.log('Verified Drive image proxy: strict IDs, MIME validation, size policy and safe binary response.');
} finally {
  globalThis.fetch = originalFetch;
}
