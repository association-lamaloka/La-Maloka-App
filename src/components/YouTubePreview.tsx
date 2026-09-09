import { extractYouTubeId } from '../services/youtube';

export function YouTubePreview({ value, title }: { value: string; title: string }) {
  const id = extractYouTubeId(value);
  if (!id) return <p role="status" className="rounded-xl bg-zinc-100 p-4 text-sm dark:bg-zinc-800">Ajoutez un lien YouTube valide pour afficher l’aperçu.</p>;
  return <div className="space-y-2">
    <iframe key={id} className="aspect-video w-full rounded-xl" src={`https://www.youtube-nocookie.com/embed/${id}`} title={title || 'Aperçu YouTube'} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    <a className="text-sm underline" href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">Ouvrir sur YouTube si la lecture intégrée est indisponible</a>
  </div>;
}
