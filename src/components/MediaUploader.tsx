import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { upload as uploadToBlob } from '@vercel/blob/client';
import { auth } from '../firebase';

interface UploadedMedia { url: string; pathname: string; contentType: string; size: number }
const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };
export function MediaUploader({ label, currentUrl, onUploaded }: { label: string; currentUrl?: string; onUploaded: (media: UploadedMedia) => void }) {
  const [preview, setPreview] = useState(currentUrl || '');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const previewUrl = useRef<string | null>(null);
  useEffect(() => setPreview(currentUrl || ''), [currentUrl]);
  useEffect(() => () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, []);
  const upload = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) return setStatus('Format refusé : JPEG, PNG, WebP ou AVIF uniquement.');
    if (file.size > 5 * 1024 * 1024) return setStatus('Image trop volumineuse : 5 Mo maximum.');
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    const localPreview = URL.createObjectURL(file); previewUrl.current = localPreview; setPreview(localPreview); setProgress(0); setStatus('Mise en ligne…');
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('AUTH_REQUIRED');
      const date = new Date().toISOString().slice(0, 10);
      const pathname = `la-maloka/${date}/${crypto.randomUUID()}.${extensions[file.type]}`;
      const blob = await uploadToBlob(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/media/client-upload',
        clientPayload: token,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      const result = { url: blob.url, pathname: blob.pathname, contentType: file.type, size: file.size };
      setPreview(blob.url); setProgress(100); setStatus('Image mise en ligne avec succès. Elle sera enregistrée uniquement après avoir cliqué sur « Enregistrer ».'); onUploaded(result);
    } catch (error) { setPreview(currentUrl || ''); setProgress(0); setStatus(error instanceof Error && error.message !== 'UPLOAD_FAILED' ? error.message : 'Vercel Blob n’est pas configuré ou la mise en ligne a échoué. Configurez BLOB_READ_WRITE_TOKEN pour cette Preview.'); }
    finally { URL.revokeObjectURL(localPreview); previewUrl.current = null; }
  };
  const choose = (event: ChangeEvent<HTMLInputElement>) => { void upload(event.target.files?.[0]); event.target.value = ''; };
  return <div className="rounded-xl border p-3"><label className="text-sm font-bold">{label}<span className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 p-3 text-white dark:bg-white dark:text-zinc-900"><Upload size={17} /> Choisir une image<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={choose} /></span></label><p className="mt-2 text-xs text-zinc-500">JPEG, PNG, WebP ou AVIF · 5 Mo maximum</p>{preview && <img src={preview} alt="Aperçu de l’image sélectionnée" className="mt-3 h-32 w-full rounded-xl object-cover" />}{progress > 0 && <div className="mt-2 flex items-center gap-2"><progress className="w-full" value={progress} max="100">{progress}%</progress><span className="text-xs">{progress}%</span></div>}{status && <p role="status" className="mt-2 text-xs">{status}</p>}</div>;
}
