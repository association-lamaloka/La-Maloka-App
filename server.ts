import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to extract stats from HelloAsso HTML
function parseHelloAssoHtml(html: string, fallbackMaxSpots = 30) {
  let subscribersCount: number | null = null;
  let daysRemaining: number | null = null;
  let placesRestantes: number | null = null;
  let collectedAmount: number | null = null;

  // 1. Try parsing JSON-LD or embedded Next/React data if present
  try {
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (nextDataMatch && nextDataMatch[1]) {
      const data = JSON.parse(nextDataMatch[1]);
      const pageProps = data?.props?.pageProps;
      if (pageProps?.form) {
        if (typeof pageProps.form.participantsCount === 'number') {
          subscribersCount = pageProps.form.participantsCount;
        }
        if (typeof pageProps.form.amount === 'number') {
          collectedAmount = Math.round(pageProps.form.amount / 100);
        }
      }
    }
  } catch (e) {
    // Ignore and fallback to regex
  }

  // 2. Parse Adherents / Participants count
  if (subscribersCount === null) {
    // Pattern: "4 adhérents", "4 participants", "<span>4</span> adhérents"
    const adherentPatterns = [
      /(\d+)\s*(?:adhérents?|adherents?)/i,
      /<[^>]+>(\d+)<\/[^>]+>\s*(?:adhérents?|adherents?)/i,
      /(?:adhérents?|adherents?)[^0-9]*(\d+)/i,
      /(\d+)\s*(?:participants?|contributeurs?|membres?|inscrits?)/i,
      /"participantCount"\s*:\s*(\d+)/i,
      /"participantsCount"\s*:\s*(\d+)/i,
      /"subscribersCount"\s*:\s*(\d+)/i,
      /"membersCount"\s*:\s*(\d+)/i,
    ];

    for (const pattern of adherentPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val >= 0) {
          subscribersCount = val;
          break;
        }
      }
    }
  }

  // 3. Parse "Fin dans X jours"
  const daysPatterns = [
    /Fin dans\s*<[^>]*>?\s*(\d+)\s*jours?/i,
    /Fin dans\s*(\d+)\s*jours?/i,
    /Plus que\s*(\d+)\s*jours?/i,
    /"daysRemaining"\s*:\s*(\d+)/i,
  ];
  for (const pattern of daysPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const val = parseInt(match[1], 10);
      if (!isNaN(val) && val >= 0) {
        daysRemaining = val;
        break;
      }
    }
  }

  // 4. Parse "23 places restantes"
  const placesPatterns = [
    /(\d+)\s*places?\s*restantes?/i,
    /(\d+)\s*places?\s*disponibles?/i,
    /<[^>]+>(\d+)<\/[^>]+>\s*places?\s*restantes?/i,
  ];
  for (const pattern of placesPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const val = parseInt(match[1], 10);
      if (!isNaN(val) && val >= 0) {
        placesRestantes = val;
        break;
      }
    }
  }

  // 5. Parse collected amount
  if (collectedAmount === null) {
    const amountPatterns = [
      /([\d\s]+)\s*€\s*collectés?/i,
      /(\d+[\d\s]*)\s*€/i,
      /"amountTotal"\s*:\s*(\d+)/i,
    ];
    for (const pattern of amountPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const cleaned = match[1].replace(/\s+/g, '');
        const val = parseInt(cleaned, 10);
        if (!isNaN(val) && val >= 0) {
          collectedAmount = val;
          break;
        }
      }
    }
  }

  // Calculate spots remaining based on max capacity (aforo) and subscribers
  const finalSubscribers = subscribersCount ?? 0;
  const maxCap = fallbackMaxSpots > 0 ? fallbackMaxSpots : 30;
  const calculatedRemaining = placesRestantes !== null 
    ? placesRestantes 
    : Math.max(0, maxCap - finalSubscribers);

  return {
    subscribersCount: finalSubscribers,
    maxSpots: maxCap,
    spotsRemaining: calculatedRemaining,
    daysRemaining: daysRemaining ?? 300,
    collectedAmount: collectedAmount ?? (finalSubscribers * 198),
    placesRestantesFromPage: placesRestantes,
    parsedSuccessfully: subscribersCount !== null || placesRestantes !== null
  };
}

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API: Scrape a single HelloAsso URL
app.post("/api/helloasso/scrape", async (req, res) => {
  try {
    const { url, maxSpots = 30 } = req.body;
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return res.status(400).json({ error: "Lien URL HelloAsso invalide" });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return res.status(502).json({ 
        error: `Erreur HTTP ${response.status} en contactant HelloAsso`,
        url 
      });
    }

    const html = await response.text();
    const stats = parseHelloAssoHtml(html, maxSpots);

    return res.json({
      url,
      ...stats,
      syncedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error scraping HelloAsso:", error?.message || error);
    return res.status(500).json({ 
      error: error?.message || "Impossible de récupérer les données HelloAsso",
      fallback: true
    });
  }
});

// API: Sync multiple classes/campaigns in batch
app.post("/api/helloasso/sync-classes", async (req, res) => {
  try {
    const { classes } = req.body;
    if (!Array.isArray(classes)) {
      return res.status(400).json({ error: "Liste de cours invalide (tableau requis)" });
    }

    const results = await Promise.all(
      classes.map(async (cls: any) => {
        if (!cls.helloAssoUrl || !cls.helloAssoUrl.startsWith('http')) {
          const maxCap = cls.maxSpots || 30;
          const currentSubs = cls.subscribersCount || 0;
          return {
            id: cls.id,
            name: cls.name,
            subscribersCount: currentSubs,
            maxSpots: maxCap,
            spotsRemaining: Math.max(0, maxCap - currentSubs),
            daysRemaining: cls.daysRemaining || 300,
            collectedAmount: cls.collectedAmount || 0,
            synced: false,
            reason: 'Pas d\'URL HelloAsso spécifique'
          };
        }

        try {
          const response = await fetch(cls.helloAssoUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(8000)
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const html = await response.text();
          const parsed = parseHelloAssoHtml(html, cls.maxSpots || 30);

          return {
            id: cls.id,
            name: cls.name,
            helloAssoUrl: cls.helloAssoUrl,
            subscribersCount: parsed.subscribersCount,
            maxSpots: parsed.maxSpots,
            spotsRemaining: parsed.spotsRemaining,
            daysRemaining: parsed.daysRemaining,
            collectedAmount: parsed.collectedAmount,
            synced: true,
            syncedAt: new Date().toISOString()
          };
        } catch (err: any) {
          const maxCap = cls.maxSpots || 30;
          const currentSubs = cls.subscribersCount || 0;
          return {
            id: cls.id,
            name: cls.name,
            helloAssoUrl: cls.helloAssoUrl,
            subscribersCount: currentSubs,
            maxSpots: maxCap,
            spotsRemaining: Math.max(0, maxCap - currentSubs),
            daysRemaining: cls.daysRemaining || 300,
            collectedAmount: cls.collectedAmount || 0,
            synced: false,
            error: err.message
          };
        }
      })
    );

    return res.json({
      success: true,
      syncedCount: results.filter(r => r.synced).length,
      totalCount: results.length,
      timestamp: new Date().toISOString(),
      classes: results
    });
  } catch (error: any) {
    console.error("Batch sync error:", error);
    return res.status(500).json({ error: error?.message || "Erreur de synchronisation batch" });
  }
});

// Vite Middleware for development / Static file serving for production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Maloka full-stack server running on http://localhost:${PORT}`);
  });
}

setupServer();
