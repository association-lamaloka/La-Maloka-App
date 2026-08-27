import { DanceClass } from '../types';

export interface HelloAssoSyncResult {
  id: string;
  name: string;
  helloAssoUrl?: string;
  subscribersCount: number;
  maxSpots: number;
  spotsRemaining: number;
  daysRemaining: number;
  collectedAmount: number;
  synced: boolean;
  syncedAt?: string;
  error?: string;
}

/**
 * Computes available spots accurately from class maxSpots and subscribersCount
 */
export function getAvailableSpots(danceClass: DanceClass): {
  maxSpots: number;
  subscribersCount: number;
  spotsRemaining: number;
  isFull: boolean;
  percentFilled: number;
} {
  const maxSpots = danceClass.maxSpots && danceClass.maxSpots > 0 ? danceClass.maxSpots : 30;
  const subscribersCount = danceClass.subscribersCount ?? 0;
  const spotsRemaining = Math.max(0, maxSpots - subscribersCount);
  const isFull = spotsRemaining === 0;
  const percentFilled = Math.min(100, Math.round((subscribersCount / maxSpots) * 100));

  return {
    maxSpots,
    subscribersCount,
    spotsRemaining,
    isFull,
    percentFilled
  };
}

/**
 * Synchronize a single class directly with HelloAsso via the backend scraping proxy
 */
export async function syncSingleClassWithHelloAsso(danceClass: DanceClass): Promise<DanceClass> {
  if (!danceClass.helloAssoUrl || !danceClass.helloAssoUrl.startsWith('http')) {
    const spots = getAvailableSpots(danceClass);
    return {
      ...danceClass,
      spotsRemaining: spots.spotsRemaining,
      lastHelloAssoSync: new Date().toISOString()
    };
  }

  try {
    const response = await fetch('/api/helloasso/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: danceClass.helloAssoUrl,
        maxSpots: danceClass.maxSpots || 30
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const maxSpots = danceClass.maxSpots || 30;
    const subscribersCount = typeof data.subscribersCount === 'number' ? data.subscribersCount : (danceClass.subscribersCount || 0);
    const spotsRemaining = typeof data.spotsRemaining === 'number' ? data.spotsRemaining : Math.max(0, maxSpots - subscribersCount);

    return {
      ...danceClass,
      subscribersCount,
      spotsRemaining,
      daysRemaining: typeof data.daysRemaining === 'number' ? data.daysRemaining : danceClass.daysRemaining,
      collectedAmount: typeof data.collectedAmount === 'number' ? data.collectedAmount : danceClass.collectedAmount,
      lastHelloAssoSync: data.syncedAt || new Date().toISOString()
    };
  } catch (error) {
    console.warn(`[HelloAssoSync] Could not fetch live data for ${danceClass.name}:`, error);
    const spots = getAvailableSpots(danceClass);
    return {
      ...danceClass,
      spotsRemaining: spots.spotsRemaining,
      lastHelloAssoSync: new Date().toISOString()
    };
  }
}

/**
 * Synchronizes all classes in batch with HelloAsso
 */
export async function syncAllClassesWithHelloAsso(
  classes: DanceClass[]
): Promise<{ updatedClasses: DanceClass[]; successCount: number }> {
  if (!classes || classes.length === 0) {
    return { updatedClasses: [], successCount: 0 };
  }

  try {
    const response = await fetch('/api/helloasso/sync-classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ classes })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.classes)) {
        const resultMap = new Map<string, any>(data.classes.map((r: any) => [r.id, r]));

        const updated = classes.map((c) => {
          const res = resultMap.get(c.id);
          if (res) {
            const maxCap = c.maxSpots || 30;
            const subs = typeof res.subscribersCount === 'number' ? res.subscribersCount : (c.subscribersCount || 0);
            const remaining = typeof res.spotsRemaining === 'number' ? res.spotsRemaining : Math.max(0, maxCap - subs);

            return {
              ...c,
              subscribersCount: subs,
              maxSpots: maxCap,
              spotsRemaining: remaining,
              daysRemaining: res.daysRemaining ?? c.daysRemaining,
              collectedAmount: res.collectedAmount ?? c.collectedAmount,
              lastHelloAssoSync: res.syncedAt || new Date().toISOString()
            };
          }
          const spots = getAvailableSpots(c);
          return {
            ...c,
            spotsRemaining: spots.spotsRemaining
          };
        });

        return {
          updatedClasses: updated,
          successCount: data.syncedCount || 0
        };
      }
    }
  } catch (err) {
    console.warn('[HelloAssoSync] Batch sync error, fallback to individual sync:', err);
  }

  // Fallback: sync individually
  const results = await Promise.all(classes.map(c => syncSingleClassWithHelloAsso(c)));
  return {
    updatedClasses: results,
    successCount: results.length
  };
}
