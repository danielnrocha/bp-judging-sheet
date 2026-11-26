# BP Judging Sheet

A flow sheet for judging British Parliamentary (BP) debates: take notes, deliberate and keep a history of every round, following the WUDC adjudication manual. The app itself is titled "Ficha BP" (Portuguese for "BP sheet").

- Flow by speech: claims, mechanism, impact, quality, and whether each argument stood.
- Clashes between arguments and who won each one.
- Deliberation with all 6 pairwise comparisons, wing votes, splits resolved per comparison and Ranked Pairs for cycles.
- Speaker points checked against the ranking.
- Tournaments with prelims, octos, quarters, semis and final.
- Queries and export to JSON and CSV.

It is a single `index.html` file: no build step and nothing to install. The interface is currently in Portuguese.

## How to use

### 1. Just open it (simplest)

Open the project's GitHub Pages link, or download `index.html` and open it in your browser.

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

Each user only sees their own tournaments and debates (Row Level Security). For analysis, the schema creates the views `bp.v_debates`, `bp.v_arguments` and `bp.v_speaks`, which you can query in the SQL Editor.

### 3. Host your own copy

Any static hosting works: GitHub Pages, Vercel, Netlify or Cloudflare Pages. Docker is not needed, since the app is a static HTML file. To make your instance point to your Supabase by default, add this before the main script:

```html
<script>window.BP_CONFIG={supabaseUrl:'https://YOUR-PROJECT.supabase.co',supabaseKey:'sb_publishable_...'}</script>
```

## Privacy

This repository contains no debate data. Notes live in the user's browser or in a Supabase project the user sets up. Adjudication notes are often confidential: do not export or share them without the consent of the teams and the tournament.

## Tests

```bash
pip install playwright && playwright install chromium
python tests/test_local.py   # local mode, export and import
python tests/test_flow.py    # full flow against a mocked Supabase
```

## License

MIT. This project is not affiliated with WUDC; the rules follow the public adjudication manual.
