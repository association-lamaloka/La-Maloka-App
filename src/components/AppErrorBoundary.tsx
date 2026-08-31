import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { failed: boolean }
export class AppErrorBoundary extends Component<Props, State> {
  declare readonly props: Readonly<Props>;
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Erreur de rendu La Maloka', error.name, error.message, info.componentStack); }
  render() {
    if (this.state.failed) return <main className="flex min-h-screen items-center justify-center bg-white p-6 text-zinc-900 dark:bg-zinc-950 dark:text-white"><div role="alert" className="max-w-lg rounded-3xl border border-rose-200 p-8 text-center shadow-xl dark:border-rose-900"><h1 className="text-2xl font-black">Impossible d’afficher cette page</h1><p className="mt-3 text-zinc-600 dark:text-zinc-300">Une erreur inattendue est survenue. Aucun contenu ni secret n’a été envoyé.</p><button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-rose-600 px-5 py-3 font-bold text-white">Recharger le site</button></div></main>;
    return this.props.children;
  }
}
