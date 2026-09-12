import { useState } from 'react';
import { collection, doc, getDocs, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { buildRecoveryPlan, localRecoveryData, RecoveryChange, equal } from '../services/contentRecovery';

export function RecoveryPanel() {
  const [changes,setChanges] = useState<RecoveryChange[]>([]);
  const [selected,setSelected] = useState<string[]>([]);
  const [status,setStatus] = useState('');
  const [busy,setBusy] = useState(false);
  const inspect = async () => {
    setBusy(true); setStatus('Recherche des données antérieures…');
    try {
      const current: Record<string, Record<string, unknown>> = {};
      for (const name of ['site_settings','pages','courses','events','gallery','videos']) {
        const snapshot = await getDocs(collection(db,name));
        snapshot.docs.forEach(item => { current[`${name}/${item.id}`] = item.data(); });
      }
      const plan = buildRecoveryPlan(current, localRecoveryData(localStorage));
      setChanges(plan); setSelected([]); setStatus(plan.length ? 'Vérifiez les propositions ci-dessous puis sélectionnez celles à appliquer.' : 'Aucune donnée supplémentaire retrouvée sur cet appareil.');
    } catch { setStatus('Impossible de lire le contenu. Vérifiez la connexion et les droits avant toute récupération.'); }
    finally { setBusy(false); }
  };
  const apply = async () => {
    const chosen = changes.filter(item => selected.includes(item.path));
    if (!chosen.length) return;
    setBusy(true);
    try {
      await runTransaction(db, async transaction => {
        const snapshots = await Promise.all(chosen.map(item => transaction.get(doc(db,item.path))));
        snapshots.forEach((snapshot,index) => {
          const item = chosen[index];
          if (!equal(snapshot.exists() ? snapshot.data() : null, item.before)) throw new Error('CONTENT_CHANGED');
        });
        chosen.forEach(item => transaction.set(doc(db,item.path),item.after));
      });
      setChanges([]); setSelected([]); setStatus('Récupération enregistrée. Les photos, vidéos et cours récupérés sont en brouillon : ouvrez-les pour les vérifier et les publier.');
    } catch (error) { setStatus(error instanceof Error && error.message === 'CONTENT_CHANGED' ? 'Le contenu a changé depuis la comparaison. Relancez la recherche avant de réessayer.' : 'Récupération non enregistrée. Vérifiez que les règles Firestore mises à jour sont publiées. Aucun changement partiel n’a été appliqué.'); }
    finally { setBusy(false); }
  };
  return <section className="space-y-4 rounded-2xl border border-amber-300 p-5">
    <h2 className="text-xl font-bold">Retrouver le contenu précédent</h2>
    <p>Configuration publique retrouvée du 29 août 2026 et photos/vidéos conservées sur cet appareil. Pour les anciens médias, ouvrez cette rubrique dans le navigateur et à l’adresse utilisés lors de leur ajout.</p>
    <button type="button" disabled={busy} onClick={inspect} className="rounded-xl border px-4 py-3 disabled:opacity-50">Rechercher et comparer</button>
    {status && <p role="status">{status}</p>}
    {changes.map(item => <div key={item.path} className="rounded-xl border p-3">
      <label className="flex gap-3"><input type="checkbox" checked={selected.includes(item.path)} disabled={busy} onChange={event => setSelected(current => event.target.checked ? [...current,item.path] : current.filter(path => path !== item.path))} /><span>{item.reason} — {String(item.after?.title || item.after?.name || item.path)}</span></label>
      <details className="mt-2"><summary>Voir les valeurs avant / après</summary><div className="grid gap-3 md:grid-cols-2"><pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(item.before,null,2)}</pre><pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(item.after,null,2)}</pre></div></details>
    </div>)}
    {changes.length > 0 && <button type="button" disabled={busy || !selected.length} onClick={apply} className="rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white disabled:opacity-50">Appliquer les {selected.length} changements sélectionnés</button>}
  </section>;
}
