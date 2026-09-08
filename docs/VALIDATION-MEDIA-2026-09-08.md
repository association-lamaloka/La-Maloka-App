# La Maloka — review and validation, 8 September 2026

## Audited baseline and deployment evidence

Repository: `association-lamaloka/La-Maloka-App`. Audited main: `3b61d0a7061fbf25fd3985b207beefd105533a6f`.

- PR #6, head `de58bb9`, merged 4 September at 06:15:58 UTC as `ee10f6d`.
- PR #6 Vercel status: success / Ready. [Deployment](https://vercel.com/associationlamaloka-4974s-projects/la-maloka/4TqKN63aUsZ8xb7kGSQNwYEc3Fqf).
- Main `3b61d0a` Vercel status: success. [Deployment](https://vercel.com/associationlamaloka-4974s-projects/la-maloka/BV3XdJyzq2aXoNfnSX29TSzxKHCe).
- These are GitHub-reported deployment statuses, not proof of successful uploads, correct deployed Firebase rules, or which version the custom domain serves.

## Findings on current main

1. **P1 — Missing homepage controls and dropped settings.** Hero renders Salsa/Cardio cards from `site_settings/global.vignettes`. SimpleAdmin has no editor for them; its settings save omits vignettes and replaces the document. Existing rules also exclude vignettes. Registration dates have the same mismatch.
2. **P1 — Previous content was left in another store.** Git history confirms the change from project `western-theater-sds98`, named database `ai-studio-lamaloka-0621b906-ebb7-4b2a-82bf-a51c02ec390b`, to `la-maloka-production-2026/(default)`. A public read recovered the old settings, last updated `2026-08-29T12:01:25.597Z`: two cards, actual contact details, five saved course pricing plans, dates and conditions. Current settings contain the sample telephone and no vignettes. An allowlisted snapshot is included; credentials and unrelated records were excluded. Old `classes` access returned 403; it was not bypassed.
3. **P1 — Local media were disconnected.** The pre-migration app stored photos and videos under `maloka_gallery_photos` and `maloka_gallery_videos` in browser localStorage. Main reads Firestore exclusively. Main also deletes `maloka_site_settings` on startup. Git cannot recover browser-only media; they must still exist on the original device/browser/origin.
4. **P1 — Silent substitution.** Empty, invalid or inaccessible collections normalize to example records. Removing the last photo can resurrect sample photos. Most read errors are swallowed. Missing `active:true` also excludes old records from anonymous queries.
5. **P2 — Media previews incomplete.** Main includes gallery file upload (added after PR #6), but saved photo/video rows have no visual preview. The new video normalizer discards old records with only `youtubeUrl`; the editor accepts fewer YouTube formats than the previous one. Public gallery images lack the shared error fallback.
6. **P2 — Upload and persistence are separate.** Upload completion does not save Firestore. Main allows early form submission and overlapping uploads. The standalone Express server does not mount `/api/media/*`, so it cannot support the same uploader outside Vercel.

## Changes prepared in this branch

- Homepage card image/text/date editing, matching persistence/rules, and merge writes for general settings.
- Device photo uploads, saved-photo thumbnails, YouTube preview/link handling in editor and public gallery. Legacy URL formats are normalized.
- Empty collections stay empty; examples are no longer seeded. Read failures are visible, writes are blocked until content loads, and auth transitions reset protected content.
- Explicit recovery comparison: old public settings and remaining local media; only unchanged example records are proposed for deletion. Current edits are preserved. Recovered media/courses start as drafts. A transaction rechecks the compared documents before applying changes; no partial recovery or silent overwrite.
- Upload race/early-save safeguards, shared image fallback, stricter UUID pathname, no overwrites, request-body limit for all body forms and standalone API routes.

## Focused release checklist

| Area | Required test | Expected result | Evidence / remaining gap |
|---|---|---|---|
| Admin authorization | Official verified Google account; anonymous, other account, unverified, invalid/expired token | Only `association.lamaloka@gmail.com` verified can authorize uploads and write content | Authorizer tested with mocked Firebase lookup. Real Google sign-in and deployed Firestore rules still need testing. |
| Allowed types | Real JPEG, PNG, WebP, AVIF; GIF, SVG, HEIC, MP4 and falsified MIME | Four image formats accepted; unsupported types rejected even outside UI | Policy checked locally. Provider rejection and actual byte/content mismatch remain live tests; MIME checking alone is not image decoding. |
| 5 MB limit | 5,242,879; 5,242,880; 5,242,881 byte files | First two allowed; last rejected in client and Blob token policy | Exact 5 MiB policy tested. Actual boundary uploads to Blob pending. |
| Upload paths | Generated date/UUID path; foreign prefix, traversal, encoded traversal, extra folder, bad extension/UUID, existing path | Only intended prefix and UUID filename allowed; no overwrite | Invalid paths and token policy tested locally. Live existing-object rejection pending. |
| Preview/publication | Upload → preview → save → reload → anonymous public visit | Preview immediately; publication only after save; same image after reload | Real browser cycle pending. Uploaded public Blob bytes are accessible by URL before CMS publication; drafts are not private file storage. |
| Failure/cancel | Lost network/token, missing Blob token, cancel during upload, save during upload, unmount, retry | Prior image retained; explicit error; no stale completion or premature save | Guards implemented; browser race/error tests pending. Unreferenced uploaded blobs are not automatically deleted. |
| Photos | Upload/edit/delete in ÉQUIPE; inspect public gallery; broken image URL | Thumbnail, persistence and fallback; deleting last photo leaves empty gallery | Empty rendering tested; authenticated full cycle pending. |
| YouTube | watch, youtu.be, shorts, embed, live, mobile URL; old youtubeUrl-only record | Preview and saved public playback; invalid hosts rejected | Parsing/legacy conversion tested. Private/deleted/embedding-disabled videos require YouTube and fall back to an external link. |
| Homepage | Edit Salsa/Cardio image and schedule independently; reload; hide disciplines section | Saved card changes appear on homepage; new hero/logo kept | Controls/persistence updated; live rules and save/reload pending. |
| Recovery | Inspect original browser; compare old/current data; recover twice; concurrent edit | No secrets imported, no current uploads overwritten, second run idempotent, concurrent change aborts transaction | Pure plan tests passed. Live recovery has not been executed. |
| Data errors | Deny Firestore read / offline; sign in and out | Visible failure; no example substitution; no saving unloaded forms or displaying previous admin drafts | Implemented; browser and emulator/live rules tests pending. |
| Hosting | Vercel preview + intended production domain; JSON API routes | Correct commit and API response, not SPA HTML | Build passed. Production domain/credentials/rules not verified by build success. |

## Before continuing to update the live site

1. Publish the updated `firestore.rules` to **la-maloka-production-2026 / (default)**. Vercel does not publish Firestore rules. The added settings/video fields require these rules; do not treat a green Vercel build as this step being complete.
2. Validate the PR preview with the official Google account; confirm its Firebase authorized domain and Blob token configuration.
3. In **ÉQUIPE → Configuration → Retrouver le contenu précédent → Rechercher et comparer**, review/select the recovered settings and unchanged examples. Recovered historic dates/addresses can be outdated or inconsistent: edit them before public use.
4. For local media recovery, use the same browser/device and origin as before. A different preview hostname cannot read the original origin’s localStorage. Do not clear browser data. Recovery cannot recreate files/caches already deleted.
5. Complete one photo save/reload/public-display test, one YouTube test and both homepage card tests. Publish recovered drafts only after review.

No production content was changed during this review. No real admin session or Blob upload was used. Local tests do not replace the live release checks above.
