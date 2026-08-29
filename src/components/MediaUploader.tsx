import { useState } from 'react';
import { Upload } from 'lucide-react';
import { auth } from '../firebase';

interface UploadedMedia { url: string; pathname: string; contentType: string; size: number }
export function MediaUploader({ label, currentUrl, onUploaded }: { label: string; currentUrl?: string; onUploaded: (media: UploadedMedia) => void }) {
  const [preview, setPreview] = useState(currentUrl || '');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const upload = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) return setStatus('Format refusé : JPEG, PNG, WebP ou AVIF uniquement.');
    if (file.size > 5 * 1024 * 1024) return setStatus('Image trop volumineuse : 5 Mo maximum.');
    const localPreview = URL.createObjectURL(file); setPreview(localPreview); setProgress(0); setStatus('Mise en ligne…');
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('AUTH_REQUIRED');
      const result = await new Promise<UploadedMedia>((resolve, reject) => {
        const xhr = new XMLHttpRequest(); xhr.open('POST', '/api/media/upload'); xhr.setRequestHeader('Authorization', `Bearer ${token}`); xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (event) => event.lengthComputable && setProgress(Math.round(event.loaded / event.total * 100));
        xhr.onload = () => { const data = JSON.parse(xhr.responseText || '{}'); xhr.status >= 200 && xhr.status < 300 ? resolve(data) : reject(new Error(data.error || 'UPLOAD_FAILED')); }; xhr.onerror = () => reject(new Error('NETWORK_ERROR')); xhr.send(file);
      });
      setPreview(result.url); setStatus('Image mise en ligne avec succès.'); onUploaded(result);
    } catch (error) { setStatus(error instanceof Error && error.message !== 'UPLOAD_FAILED' ? error.message : 'Vercel Blob n’est pas configuré ou la mise en ligne a échoué. Configurez BLOB_READ_WRITE_TOKEN pour cette Preview.'); }
    finally { URL.revokeObjectURL(localPreview); }
  };
  return <div className="rounded-xl border p-3"><label className="text-sm font-bold">{label}<span className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 p-3 text-white dark:bg-white dark:text-zinc-900"><Upload size={17} /> Choisir une image<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void upload(event.target.files?.[0])} /></span></label>{preview && <img src={preview} alt="Aperçu" className="mt-3 h-32 w-full rounded-xl object-cover" />}{progress > 0 && progress < 100 && <progress className="mt-2 w-full" value={progress} max="100">{progress}%</progress>}{status && <p role="status" className="mt-2 text-xs">{status}</p>}</div>;
}
