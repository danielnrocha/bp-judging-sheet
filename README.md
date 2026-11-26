# BP Judging Sheet

<img width="1469" height="935" alt="Screenshot 2026-11-26 at 13 34 26" src="https://github.com/user-attachments/assets/7cd4d0a9-2452-456d-b920-0f7ecd23b7da" />

A flow sheet for judging British Parliamentary (BP) debates: take notes, deliberate and keep a history of every round, following the WUDC adjudication manual. The app itself is titled "Ficha BP" (Portuguese for "BP sheet").

- Flow by speech: claims, mechanism, impact, quality, and whether each argument stood.
- Clashes between arguments and who won each one.
- Deliberation with all 6 pairwise comparisons, wing votes, splits resolved per comparison and Ranked Pairs for cycles.
- Speaker points checked against the ranking.
- Tournaments with prelims, octos, quarters, semis and final.
- Practices, separate from tournaments: internal to your debating society (SD), joint with another debating society, or external.
- Queries and export to JSON and CSV.

It is a single `index.html` file: no build step and nothing to install. The interface is available in Portuguese (default), English and Spanish; switch with the language selector in the header.

## How to use

### 1. Just open it (simplest)

Open the project's GitHub Pages link. Opening `index.html` straight from your disk (file://) is not recommended: browsers do not always keep data reliably that way and the app cannot work offline.

Your data is saved **only in your browser** (localStorage). There is no account and no server. Use **Consultas > Exportar tudo (JSON)** now and then as a backup. To move your data to another device, export on one and use **Importar JSON** on the other.

Caveat: if you clear your browser data, you lose anything you have not exported.

### 2. With your own Supabase (syncs across devices)

Takes about 10 minutes on Supabase's free tier.

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql).
3. In **Authentication > Users**, add your own user with your email. Magic-link login does not create new accounts on its own, so only the users you add can sign in.
4. In **Authentication > URL Configuration**, put the address where you open the app (for example, your GitHub Pages link) in **Site URL** and **Redirect URLs**.
5. In **Project Settings > API Keys**, copy the **project URL** and the **publishable** key (or the legacy **anon** key).
6. In the app, click **Armazenamento** (Storage), paste the URL and key, click **Conectar** (Connect), then sign in with the link sent to your email.

Never use the `secret` or `service_role` key in the browser. The app rejects those keys.

Google sign-in is optional and only works if you enable the Google provider in your project.

To bring over notes you took in local mode, export the JSON before connecting and use **Importar JSON** afterwards.

Already set up with an older `schema.sql`? Run the files in [`supabase/migrations`](supabase/migrations) that came after your version, in order (002 enables practices, 003 tightens access rules).

Each user only sees their own tournaments and debates (Row Level Security). For analysis, the schema creates the views `bp.v_debates`, `bp.v_arguments` and `bp.v_speaks`, which you can query in the SQL Editor.

### 3. Host your own copy

Any static hosting works: GitHub Pages, Vercel, Netlify or Cloudflare Pages. Docker is not needed, since the app is a static HTML file. To make your instance point to your Supabase by default, add this near the top of `<body>`, before the script that loads `vendor/supabase`:

```html
<script>window.BP_CONFIG={supabaseUrl:'https://YOUR-PROJECT.supabase.co',supabaseKey:'sb_publishable_...'}</script>
```

## Reliability

Every keystroke is saved on the device right away, so a closed tab, a reload, a dead battery or a laptop going to sleep does not lose the debate.

- **Two copies on the device.** Notes go to localStorage at once and to an IndexedDB mirror written with durable commits about 100 ms later. If the browser is killed before localStorage reaches the disk (a power cut), the app restores from the mirror on the next open. In tests that kill the browser mid-debate, everything typed more than about 0.1 s before the cut survived.
- **Half-typed ideas** in the "new idea" boxes are kept as drafts until you press Enter.
- **Works offline.** After the first visit a service worker keeps the app available without internet. In local mode nothing needs the network.
- **Supabase mode without internet.** Edits stay on the device, the status says so, and they sync automatically when the connection returns. A debate can be reopened offline from the copy on the device.
- **Several tabs** can be open at once without overwriting each other.
- **Full storage** is reported loudly as NOT SAVED, never as saved.

What the app cannot protect against in local mode: clearing the browser's data, private/incognito windows, losing the device, and Safari erasing site data after 7 days without opening the app (installing it to the home screen avoids this). Use **Export all (JSON)** as a backup; the app reminds you after 7 days without one. Supabase mode keeps a copy off the device.

## Languages

Portuguese (pt-BR) is the source language and the default. English and Spanish come from a translation table (`DICT`) and a few pattern rules (`RULES`) in the language script near the top of `index.html`, applied to the interface as it renders. To fix a translation, edit its entry in `DICT`. To add a language, add a column to each `DICT` entry, a branch to the rules and an option to the selector. Your notes are never translated.

## Privacy

The app makes no third-party requests: fonts and the Supabase client library are served from this repository, and the Supabase library is only loaded if you connect a Supabase project.


This repository contains no debate data. Notes live in the user's browser or in a Supabase project the user sets up. Adjudication notes are often confidential: do not export or share them without the consent of the teams and the tournament.

## Tests

```bash
pip install playwright && playwright install chromium
python tests/test_local.py   # local mode, export and import
python tests/test_flow.py    # full flow against a mocked Supabase
```

## License

MIT. This project is not affiliated with WUDC; the rules follow the public adjudication manual.
