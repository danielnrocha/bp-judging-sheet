# BP Judging Sheet

<img width="1469" height="935" alt="Screenshot 2026-11-26 at 13 34 26" src="https://github.com/user-attachments/assets/7cd4d0a9-2452-456d-b920-0f7ecd23b7da" />

A flow sheet for judging British Parliamentary (BP) debates: take notes, deliberate and keep a history of every round, following the WUDC adjudication manual. The app itself is titled "Ficha BP" (Portuguese for "BP sheet").

- Flow by speech: claims, mechanism, impact, quality, and whether each argument stood.
- Typed links between arguments, always from a later speech to something said earlier. With the opposing team: responds, flips, mitigates (reduces its weight without refuting it) and weighs ("sopesa": grants it, but says what matters more). With your own side: complements (second speaker on their partner) and, from closing to its own opening, deepens ("verticaliza", with strength), mitigates or weighs. Drag an argument's code onto another argument; the menu shows the two groups separately and explains when a link is not allowed.
- Clashes, metrics and characterizations: name the central clashes, weighing metrics and characterizations (how each side describes an actor or the world of the motion), link arguments to them with a strength (contributing to the axis, or weighing it), set relevance, who introduced and who won each one, and write the weighing between them.
- POIs: a POI button (or `P`) opens a small dialog with its own timer; only the other side can offer. Log who offered, the POI, the answer and how it went, or that it was declined. Speeches that took no POI are flagged.
- A "to check" list before voting: unanswered strong arguments, arguments without a verdict, closing material that may not be new, axes without a winner, missing weighing, speeches without a POI.
- An interactive tutorial (button at the top) that highlights each part of the screen with a tip; it can be skipped.
- Three views of the same debate: by speech, by idea (each idea with everything that came after it) and by metric (how each team engaged each clash or metric).
- Focus mode that dims everything not related to the selected argument (or to the current speech) and shrinks the top bar to one line. The top bar also shrinks while you type in the flow or scroll down.
- Click a team's header to see everything about it: names, numbers, arguments per speech, clashes and metrics, and your comparisons.
- Direct clashes between arguments and who won each one.
- Deliberation with all 6 pairwise comparisons, wing votes, splits resolved per comparison and Ranked Pairs for cycles.
- Speaker points checked against the ranking.
- Tournaments with prelims, octos, quarters, semis and final.
- Practices, separate from tournaments: internal to your debating society (SD), joint with another debating society, or external.
- Adjustable timer (speech length, protected time, grace, deliberation) and keyboard shortcuts (press `?` in a debate).
- Tabbycat: paste your private URL and the sheet pulls round, motion, info slide, teams, speakers and panel.
- Queries and export to JSON and CSV.

It is a static site: `index.html`, one stylesheet and a few plain scripts. No build step and nothing to install (see [Code layout](#code-layout)). The interface is available in Portuguese (default), English and Spanish; switch with the language selector in the header.

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

## Taking notes fast

- Type an idea and press Enter. Prefixes link it as you type: `>LO1 text` responds to LO1, `~LO1` flips it, `-LO1` mitigates it, `=LO1` weighs against it, `+PM1` complements PM1, `^PM1` deepens it (`^3PM1` strong, `^1PM1` weak). `*text` is a characterization. `#2` links it to the 2nd clash or metric (`#2s` weighs that axis). Ending with ` !` marks it strong, ` ?` weak. A link the rules do not allow is not made, and a message says why.
- Drag the code of an argument (e.g. `LO1`) onto another argument to link them, or onto a clash, metric or characterization in the bar above the flow.
- With an argument selected: `1` `2` `3` quality, `S` `M` `C` standing / mitigated / fell, `E` details, `Del` delete. Elsewhere: `Space` timer, `N` new idea, `P` POI, `]` `[` next / previous speech, `+` `-` adjust 10 s, `F` focus, `V` switch view, `D` deliberation, `?` all shortcuts. Hold `Alt` to see each button's shortcut on the button itself.
- Click the clock to change speech length (7, 5, 4, 3 minutes or any value), protected time and deliberation time.

## Tabbycat

In **Preparação**, paste your Tabbycat private URL (`https://<site>/<tournament>/privateurls/<key>/`) and press **Puxar** (Pull). The app uses Tabbycat's public API (`/api/v1`, which allows cross-origin requests):

1. `/me` with your private key says who you are;
2. rounds, the draw, teams and adjudicators come from the public endpoints, so they depend on the tournament having released the draw and the participants list;
3. the debate is the one with you on the panel, and your role (chair, wing, trainee) is set from it.

If the draw is not public yet, the app fills your name and offers the tournament's teams, speakers and adjudicators as suggestions in the fields, or lets you pick another round and room. A public tournament link also works (you then pick the room). The private URL stays in your browser: it is not saved in the debate, sent to Supabase or exported.

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

Portuguese (pt-BR) is the source language and the default. English and Spanish come from a translation table (`DICT`) and a few pattern rules (`RULES`) in `js/i18n.js` (plus `js/i18n-extra.js` for the newer features), applied to the interface as it renders. To fix a translation, edit its entry in `DICT`. To add a language, add a column to each `DICT` entry, a branch to the rules and an option to the selector. Your notes are never translated.

## Privacy

The app makes no third-party requests: fonts and the Supabase client library are served from this repository, and the Supabase library is only loaded if you connect a Supabase project. The only other request is to the Tabbycat site whose link you paste, and only when you press Pull.


This repository contains no debate data. Notes live in the user's browser or in a Supabase project the user sets up. Adjudication notes are often confidential: do not export or share them without the consent of the teams and the tournament.

## Code layout

No build step: plain scripts that share globals, loaded in order by `index.html`.

| File | What it does |
| --- | --- |
| `css/app.css` | All styles |
| `js/theme.js` | Light/dark theme (runs in `<head>`, before paint) |
| `js/i18n-extra.js`, `js/i18n.js` | English and Spanish translation of the interface |
| `js/store.js` | IndexedDB mirror, local database client, Supabase client |
| `js/model.js` | Constants, the debate data shape, `migrate` (sanitizes anything loaded) |
| `js/state.js` | Current debate state and helpers (links, status, judges) |
| `js/save.js` | Saving and syncing |
| `js/results.js` | Pairwise results, Ranked Pairs, out-rounds, speaker points |
| `js/flow.js` | Argument cards, speech view, setup, direct clashes |
| `js/lenses.js` | View switcher, by-idea view, focus mode, selection, compact top bar |
| `js/axes.js` | Clashes, metrics and characterizations: bar, editor, by-metric view |
| `js/drag.js` | Drag to link, and the link menus (pointer events: mouse, pen and touch) |
| `js/teams.js` | Team modal |
| `js/poi.js` | POI dialog, POI timer, POIs shown in each speech |
| `js/pending.js` | The "to check" list before voting |
| `js/tour.js` | Interactive tutorial |
| `js/delib.js` | Deliberation and oral adjudication script |
| `js/home.js`, `js/consultas.js`, `js/router.js` | Tournaments, queries and exports, routing |
| `js/ui.js`, `js/events.js` | Toast, modal and the event handlers |
| `js/timer.js`, `js/shortcuts.js` | Timer, keyboard shortcuts, quick syntax, Alt key hints |
| `js/tabby.js` | Tabbycat import |
| `js/boot.js` | Sign-in, storage modal, import, start-up |

Feature modules register their buttons in `ACTS` (`data-act="name"`), so `events.js` does not need to know about them. A button gets a shortcut badge (shown while Alt is held) with `data-key="X"`. New interface text in Portuguese needs its English and Spanish entry in `js/i18n-extra.js`. The service worker (`sw.js`) lists every file to cache: add new files there too.

## Tests

```bash
pip install playwright && playwright install chromium
python tests/serve.py &        # static server for the tests that need http://localhost:8765
python tests/test_local.py     # local mode, export and import
python tests/test_flow.py      # full flow against a mocked Supabase
python tests/test_v2.py        # links and their rules, axes, views, focus, POIs, to-check list, tutorial, timer, shortcuts, Tabbycat (mocked)
```

Use `tests/serve.py` rather than `python -m http.server`: the stock server refuses some of the app's parallel requests on Windows.

## License

MIT. This project is not affiliated with WUDC; the rules follow the public adjudication manual.
