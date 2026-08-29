import { Calendar, Clock, ExternalLink, MapPin, Music, Users } from 'lucide-react';
import { ReactNode } from 'react';
import { DanceClass, DanceEvent, PhotoItem } from '../types';

interface Props {
  section: 'cours' | 'agenda' | 'galerie';
  classes?: DanceClass[];
  events?: DanceEvent[];
  photos?: PhotoItem[];
}

export function LandingContent({ section, classes = [], events = [], photos = [] }: Props) {
  if (section === 'cours') {
    return (
      <Page title="Nos cours" subtitle="Découvrez les activités proposées par l'association. Pour toute inscription, contactez directement notre équipe.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.filter((item) => item.active !== false).map((item) => (
            <article key={item.id} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <img src={item.image} alt="" className="h-48 w-full object-cover" />
              <div className="space-y-3 p-6">
                <h2 className="text-xl font-black">{item.name}</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.description}</p>
                <p className="flex items-center gap-2 text-sm"><Clock size={16} /> {item.schedule}</p>
                <p className="flex items-center gap-2 text-sm"><MapPin size={16} /> {item.location}</p>
                <div className="rounded-2xl bg-lime-50 p-4 dark:bg-lime-950/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Tarif saison</p>
                  <p className="mt-1 text-2xl font-black text-[#557219] dark:text-lime-400">{item.annualPrice === 0 ? 'Gratuit' : `${item.annualPrice} €`}</p>
                </div>
                {item.helloAssoUrl && <a href={item.helloAssoUrl} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 font-bold text-white shadow-md transition-colors hover:bg-rose-700">S’inscrire <ExternalLink size={16} /></a>}
              </div>
            </article>
          ))}
        </div>
      </Page>
    );
  }

  if (section === 'agenda') {
    return (
      <Page title="Agenda" subtitle="Les rendez-vous, stages et rencontres de La Maloka.">
        <div className="grid gap-5 md:grid-cols-2">
          {events.map((event) => (
            <article key={event.id} className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <Calendar className="mb-4 text-orange-500" />
              <h2 className="text-xl font-black">{event.title}</h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">{event.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm"><span>{event.date}</span><span>{event.time}</span><span>{event.location}</span></div>
            </article>
          ))}
        </div>
      </Page>
    );
  }

  return (
    <Page title="La Maloka en images" subtitle="Quelques souvenirs de nos cours et événements.">
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {photos.map((photo) => (
          <figure key={photo.id} className="mb-5 break-inside-avoid overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900">
            <img src={photo.url} alt={photo.title} loading="lazy" className="w-full object-cover" />
            <figcaption className="p-4"><strong>{photo.title}</strong>{photo.description && <p className="mt-1 text-sm text-zinc-500">{photo.description}</p>}</figcaption>
          </figure>
        ))}
      </div>
    </Page>
  );
}

function Page({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <section className="relative mx-auto min-h-[70vh] max-w-7xl px-4 py-16 sm:px-6"><header className="mx-auto mb-12 max-w-2xl text-center"><Music className="mx-auto mb-4 text-rose-500" /><h1 className="text-4xl font-black">{title}</h1><p className="mt-3 text-zinc-600 dark:text-zinc-400">{subtitle}</p></header>{children}</section>;
}
