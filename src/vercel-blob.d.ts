declare module '@vercel/blob' {
  interface PutOptions {
    access: 'public';
    contentType?: string;
    token?: string;
    addRandomSuffix?: boolean;
  }

  interface PutResult { url: string; pathname: string }

  export function put(pathname: string, body: Buffer, options: PutOptions): Promise<PutResult>;
}
