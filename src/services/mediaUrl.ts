const DRIVE_ID = /^[A-Za-z0-9_-]{20,100}$/;

export function extractGoogleDriveFileId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['drive.google.com', 'www.drive.google.com'].includes(url.hostname)) return null;
    const queryId = url.searchParams.get('id');
    const pathId = url.pathname.match(/\/file\/d\/([A-Za-z0-9_-]+)/)?.[1];
    const fileId = queryId || pathId || '';
    return DRIVE_ID.test(fileId) ? fileId : null;
  } catch {
    return null;
  }
}

export function publicImageUrl(value: string): string {
  const fileId = extractGoogleDriveFileId(value);
  return fileId ? `/api/media/drive-image?fileId=${encodeURIComponent(fileId)}` : value;
}
