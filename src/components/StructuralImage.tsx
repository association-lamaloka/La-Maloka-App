import { ImgHTMLAttributes, useState } from 'react';
const fallbackImage = '/image-fallback.svg';

/** An image backed by a bundled asset when remote structural media is unavailable. */
export function StructuralImage({ src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const requestedSrc = typeof src === 'string' ? src : '';
  const resolvedSrc = !requestedSrc || failedSrc === requestedSrc ? fallbackImage : requestedSrc;
  return <img {...props} src={resolvedSrc} onError={() => setFailedSrc(requestedSrc)} />;
}
