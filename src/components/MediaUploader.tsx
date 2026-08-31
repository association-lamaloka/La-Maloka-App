import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { auth } from '../firebase';

interface UploadedMedia { url: string; pathname: string; contentType: string; size: number }
const UPLOAD_TIMEOUT_MS = 60_000;
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export function MediaUploader({ label, currentUrl, onUploaded }: { label: string; currentUrl?: string; onUploaded: (media: UploadedMedia) => void }) {
  const [preview, setPreview] = useState(currentUrl || '');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const previewUrl = useRef<string | null>(null);
  const request = useRef<XMLHttpRequest | null>(null);

  useEffect(() => setPreview(currentUrl || ''), [currentUrl]);
  useEffect(() => () => {
    request.current?.abort();
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  const upload = async (file?: File) => {
    if (!file) return;
    if (!allowedImageTypes.includes(file.type)) return setStatus('Format refusé : JPEG, PNG, WebP ou AVIF uniquement.');
    if (file.size > 5 * 1024 * 1024) return setStatus('Image trop volumineuse : 5 Mo maximum.');

    const previousUrl = currentUrl || '';
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    const localPreview = URL.createObjectURL(file);
    previewUrl.current = localPreview;
    setPreview(localPreview);
    setProgress(0);
    setStatus('Mise en ligne…');
    setUploading(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('AUTH_REQUIRED');
      const result = await new Promise<UploadedMedia>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        request.current = xhr;
        xhr.open('POST', '/api/media/upload');
        xhr.timeout = UPLOAD_TIMEOUT_MS;
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (event) => event.lengthComputable && setProgress(Math.round(event.loaded / event.total * 100));
        xhr.onload = () => {
          let data: Partial<UploadedMedia> & { error?: string } = {};
          try { data = JSON.parse(xhr.responseText || '{}'); }
          catch { reject(new Error('INVALID_SERVER_RESPONSE')); return; }
          if (xhr.status >= 200 && xhr.status < 300 && data.url && data.pathname && data.contentType && typeof data.size === 'number') resolve(data as UploadedMedia);
          else reject(new Error(data.error || 'UPLOAD_FAILED'));
        };
        xhr.onerror = () => reject(new Error('NETWORK_ERROR'));
        xhr.ontimeout = () => reject(new Error('UPLOAD_TIMEOUT'));
        xhr.onabort = () => reject(new Error('UPLOAD_CANCELLED'));
        xhr.send(file);
      });
      setPreview(result.url);
      setProgress(100);
      setStatus('Image mise en ligne avec succès. Elle sera enregistrée uniquement après avoir cliqué sur « Enregistrer ».');
      onUploaded(result);
    } catch (error) {
      const code = error instanceof Error ? error.message : 'UPLOAD_FAILED';
      setPreview(previousUrl);
      setProgress(0);
      setStatus(code === 'UPLOAD_TIMEOUT'
        ? 'Le serveur ne répond pas. La mise en ligne a été annulée après 60 secondes. Vous pouvez réessayer.'
        : code === 'UPLOAD_CANCELLED'
          ? 'Mise en ligne annulée. L’image précédente a été conservée.'
          : code === 'AUTH_REQUIRED'
            ? 'Votre session a expiré. Reconnectez-vous puis réessayez.'
            : 'La mise en ligne a échoué. L’image précédente a été conservée ; vous pouvez réessayer.');
    } finally {
      request.current = null;
      URL.revokeObjectURL(localPreview);
      previewUrl.current = null;
      setUploading(false);
    }
  };

  const choose = (event: ChangeEvent<HTMLInputElement>) => { void upload(event.target.files?.[0]); event.target.value = ''; };
  return <div className="rounded-xl border p-3"><label className="text-sm font-bold">{label}<span className={`mt-2 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 p-3 text-white dark:bg-white dark:text-zinc-900 ${uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}><Upload size={17} /> Choisir une image<input className="sr-only" type="file" disabled={uploading} accept="image/jpeg,image/png,image/webp,image/avif" onChange={choose} /></span></label><p className="mt-2 text-xs text-zinc-500">JPEG, PNG, WebP ou AVIF · 5 Mo maximum</p>{preview && <img src={preview} alt="Aperçu de l’image sélectionnée" className="mt-3 h-32 w-full rounded-xl object-cover" />}{progress > 0 && <div className="mt-2 flex items-center gap-2"><progress className="w-full" value={progress} max="100">{progress}%</progress><span className="text-xs">{progress}%</span></div>}{uploading && <button type="button" onClick={() => request.current?.abort()} className="mt-2 flex items-center gap-1 text-xs font-bold text-rose-600"><X size={14} /> Annuler la mise en ligne</button>}{status && <p role="status" className="mt-2 text-xs">{status}</p>}</div>;
}
