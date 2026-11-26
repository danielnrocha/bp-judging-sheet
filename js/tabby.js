/* ---------- Tabbycat ----------
 * Cole a URL privada do Tabbycat (https://<site>/<torneio>/privateurls/<chave>/) e a ficha puxa
 * fase, rodada, moção, info slide, equipes, oradores e painel.
 *
 * Como funciona (API pública do Tabbycat, /api/v1, que libera CORS):
 *  1. /me com "Authorization: Key <chave>" diz quem é você (só nome e id);
 *  2. a rodada, a chave (pairings), as equipes e os juízes vêm dos endpoints públicos, que dependem
 *     do torneio ter liberado a chave e a lista de participantes;
 *  3. o debate certo é o que tem você no painel. Se a chave ainda não saiu, sobra o seu nome e as
 *     listas de nomes viram sugestões nos campos, para completar à mão.
 * A URL privada fica só neste navegador (não vai para o Supabase nem para a exportação).
 */
const tabKey = () => 'bp.tab.' + (D?.tournament_id || 'none');
const tabDataKey = () => 'bp.tabdata.' + (D?.tournament_id || 'none');
let TAB = null; // { api, me, rounds, pairings, seq, teams, adjs, venues }
function parseTabUrl(u) {
  let url;
  try {
    url = new URL(u.trim());
  } catch (e) {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;
  const p = url.pathname.split('/').filter(Boolean);
  if (!p.length) return null;
  let slug = p[0],
    key = null,
    round = null;
  if (p[0] === 'api' && p[1] === 'v1' && p[2] === 'tournaments') slug = p[3];
  const i = p.indexOf('privateurls');
  if (i >= 0 && p[i + 1]) key = p[i + 1];
  const r = p.indexOf('round');
  if (r >= 0 && /^\d+$/.test(p[r + 1] || '')) round = +p[r + 1];
  if (!slug || !/^[\w-]+$/.test(slug)) return null;
  return { origin: url.origin, slug, key, round, api: url.origin + '/api/v1/tournaments/' + slug };
}
async function tabGet(api, path, key) {
  const ctl = new AbortController();
  const tm = setTimeout(() => ctl.abort(), 15000);
  try {
    const sep = path.includes('?') ? '&' : '?';
    const r = await fetch(api + path + (path === '/me' ? '' : sep + 'limit=1000'), {
      headers: key ? { Authorization: 'Key ' + key, Accept: 'application/json' } : { Accept: 'application/json' },
      signal: ctl.signal,
      credentials: 'omit'
    });
    if (!r.ok) throw Object.assign(new Error('HTTP ' + r.status), { status: r.status });
    const j = await r.json();
    return Array.isArray(j) ? j : Array.isArray(j?.results) ? j.results : j;
  } finally {
    clearTimeout(tm);
  }
}
/* URLs da API viram ids estáveis (ignora http/https e barra final) */
const tabId = u => (typeof u === 'string' ? u.replace(/\/+$/, '').split('/').slice(-2).join('/') : String(u ?? ''));
const tabTeamName = t => String(t?.short_name || t?.long_name || t?.code_name || t?.name || '').slice(0, 200);
const SIDES = { og: 'OG', oo: 'OO', cg: 'CG', co: 'CO', 0: 'OG', 1: 'OO', 2: 'CG', 3: 'CO' };
function tabStage(r) {
  if (!r || r.stage !== 'E') return 'preliminar';
  const n = String(r.name || r.abbreviation || '').toLowerCase();
  if (/semi/.test(n)) return 'semi';
  if (/quart|qf/.test(n)) return 'quartas';
  if (/oct|oit|of\b/.test(n)) return 'octavas';
  if (/final|gf/.test(n)) return 'final';
  return 'outra';
}
const stripHtml = h => {
  const d = document.createElement('div');
  d.innerHTML = String(h || '');
  return d.textContent.trim();
};
function adjsOf(p) {
  const A = p?.adjudicators || {};
  return [
    ...(A.chair ? [[A.chair, 'chair']] : []),
    ...(A.panellists || []).map(x => [x, 'wing']),
    ...(A.trainees || []).map(x => [x, 'trainee'])
  ];
}
function teamsLine(p) {
  const T = Object.fromEntries((TAB.teams || []).map(t => [tabId(t.url), t]));
  return (p.teams || [])
    .map(x => (SIDES[String(x.side).toLowerCase()] || '?') + ' ' + (tabTeamName(T[tabId(x.team)]) || '?'))
    .join(' · ');
}
function fillDatalists() {
  let d = null;
  try {
    d = JSON.parse(localStorage.getItem(tabDataKey()));
  } catch (e) {}
  const opt = L => (L || []).map(n => `<option value="${esc(n)}"></option>`).join('');
  $('#dlTeam').innerHTML = opt(d?.teams);
  $('#dlSpk').innerHTML = opt(d?.speakers);
  $('#dlAdj').innerHTML = opt(d?.adjs);
}
function renderTabSetup(msg) {
  let u = '';
  try {
    u = localStorage.getItem(tabKey()) || '';
  } catch (e) {}
  const prev = $('#tabUrl');
  if (prev && prev.value) u = prev.value;
  $('#tabSetup').innerHTML =
    `<label class="l" for="tabUrl">Tabbycat: cole a sua URL privada (ou o link do torneio) e puxe fase, moção, equipes e painel</label>
<div class="row" style="flex-wrap:nowrap"><input id="tabUrl" type="url" inputmode="url" autocomplete="off" value="${esc(u)}" placeholder="https://torneio.calicotab.com/slug/privateurls/abc123/"><button class="pri sm" data-act="tabPull" style="flex:0 0 auto">Puxar</button></div>
<div id="tabMsg" class="small" style="margin-top:6px">${msg || '<span class="muted">A URL fica só neste navegador. Se algo não vier, os nomes do torneio aparecem como sugestão nos campos abaixo.</span>'}</div><div id="tabPick"></div>`;
  fillDatalists();
}
function tabMsg(h, cls) {
  const m = $('#tabMsg');
  if (m) m.innerHTML = `<span class="${cls || ''}">${h}</span>`;
}
async function tabPull() {
  const raw = $('#tabUrl')?.value || '';
  const P = parseTabUrl(raw);
  if (!P) {
    tabMsg('Esse link não parece do Tabbycat. Use algo como https://site/torneio/privateurls/chave/', 'err');
    return;
  }
  try {
    localStorage.setItem(tabKey(), raw.trim());
  } catch (e) {}
  tabMsg('Falando com o Tabbycat...', 'muted');
  TAB = { api: P.api, key: P.key };
  const notes = [];
  if (P.key) {
    try {
      TAB.me = await tabGet(P.api, '/me', P.key);
    } catch (e) {
      notes.push(
        e.status === 401 || e.status === 403 ? 'a URL privada não foi aceita' : 'não consegui ler quem é você'
      );
    }
  }
  try {
    TAB.rounds = await tabGet(P.api, '/rounds');
  } catch (e) {
    tabMsg(
      e.status
        ? 'O Tabbycat respondeu ' + e.status + ' para as rodadas. A API pode estar desligada neste torneio.'
        : 'Não consegui falar com o Tabbycat (sem internet, link errado ou API desligada).',
      'err'
    );
    if (TAB.me?.name) applyMe();
    return;
  }
  const [teams, adjs, venues] = await Promise.all(
    ['/teams', '/adjudicators', '/venues'].map(p => tabGet(P.api, p).catch(() => null))
  );
  TAB.teams = Array.isArray(teams) ? teams : [];
  TAB.adjs = Array.isArray(adjs) ? adjs : [];
  TAB.venues = Array.isArray(venues) ? venues : [];
  try {
    localStorage.setItem(
      tabDataKey(),
      JSON.stringify({
        teams: TAB.teams.map(tabTeamName).filter(Boolean),
        speakers: TAB.teams.flatMap(t => (t.speakers || []).map(s => s.name)).filter(Boolean),
        adjs: TAB.adjs.map(a => a.name).filter(Boolean)
      })
    );
  } catch (e) {}
  fillDatalists();
  const R = (Array.isArray(TAB.rounds) ? TAB.rounds : []).slice().sort((a, b) => a.seq - b.seq);
  TAB.rounds = R;
  let round = P.round ? R.find(r => r.seq === P.round) : null;
  if (!round)
    round =
      [...R].reverse().find(r => r.draw_status === 'R') || [...R].reverse().find(r => !r.completed) || R[R.length - 1];
  if (!round) {
    tabMsg('O torneio ainda não tem rodadas públicas.', 'err');
    return;
  }
  await tabRound(round.seq, notes);
}
async function tabRound(seq, notes = []) {
  const round = TAB.rounds.find(r => r.seq === seq);
  TAB.seq = seq;
  try {
    TAB.pairings = await tabGet(TAB.api, '/rounds/' + seq + '/pairings');
  } catch (e) {
    TAB.pairings = [];
  }
  const meId = TAB.me?.url ? tabId(TAB.me.url) : null;
  const mine = meId ? TAB.pairings.find(p => adjsOf(p).some(([u]) => tabId(u) === meId)) : null;
  if (mine) return applyPairing(mine, round, notes);
  if (TAB.me?.name) applyMe(round);
  const why = !TAB.pairings.length
    ? 'A chave de ' + esc(round?.name || 'rodada ' + seq) + ' ainda não está pública.'
    : meId
      ? 'Não achei você no painel de ' + esc(round?.name || 'rodada ' + seq) + '. Escolha a sala:'
      : 'Escolha a sala:';
  tabMsg(why + (notes.length ? ' (' + notes.join('; ') + ')' : ''), TAB.pairings.length ? '' : 'err');
  renderTabPick();
}
function renderTabPick() {
  const R = TAB.rounds || [];
  $('#tabPick').innerHTML =
    `<div class="row" style="margin-top:6px"><select id="tabRound" aria-label="Rodada" style="flex:0 1 200px">${R.map(
      r =>
        `<option value="${r.seq}" ${r.seq === TAB.seq ? 'selected' : ''}>${esc(r.name || 'Rodada ' + r.seq)}</option>`
    ).join('')}</select>${
      TAB.pairings?.length
        ? `<select id="tabRoom" aria-label="Sala" style="flex:1 1 260px"><option value="">Escolher sala...</option>${TAB.pairings
            .map(
              (p, i) => `<option value="${i}">${esc(venueName(p) || 'Sala ' + (i + 1))}: ${esc(teamsLine(p))}</option>`
            )
            .join('')}</select>`
        : ''
    }</div>`;
}
const venueName = p => {
  if (!p?.venue) return '';
  if (typeof p.venue === 'object') return p.venue.display_name || p.venue.name || '';
  const v = (TAB.venues || []).find(x => tabId(x.url) === tabId(p.venue));
  return v ? v.display_name || v.name || '' : '';
};
function applyMe(round) {
  if (TAB.me?.name) S.panel.me.name = String(TAB.me.name).slice(0, 200);
  if (round) applyRound(round);
  save();
  renderSetup();
  renderFlow();
}
function applyRound(round) {
  S.stage = tabStage(round);
  S.speaksOn = S.stage === 'preliminar';
  S.round_no = S.stage === 'preliminar' ? round.seq : null;
  const m = (round.motions || []).slice().sort((a, b) => (a.seq || 0) - (b.seq || 0));
  if (m.length === 1 || (m.length && !S.motion)) {
    S.motion = String(m[0].text || '').slice(0, 2000);
    const info = m[0].info_slide_plain || stripHtml(m[0].info_slide);
    if (info) S.info = String(info).slice(0, 5000);
  }
  return m.length;
}
function applyPairing(p, round, notes = []) {
  const T = Object.fromEntries((TAB.teams || []).map(t => [tabId(t.url), t]));
  const A = Object.fromEntries((TAB.adjs || []).map(a => [tabId(a.url), a]));
  const got = [];
  if (round) {
    const nm = applyRound(round);
    got.push(round.name || 'rodada ' + round.seq);
    if (nm) got.push(nm > 1 ? nm + ' moções (usei a 1ª)' : 'moção');
  }
  let nt = 0;
  for (const x of p.teams || []) {
    const side = SIDES[String(x.side).toLowerCase()];
    const t = T[tabId(x.team)];
    if (!side || !t) continue;
    S.teams[side].name = tabTeamName(t);
    const sp = (t.speakers || []).map(s => String(s.name || '').slice(0, 200));
    S.teams[side].sp = [sp[0] || '', sp[1] || ''];
    nt++;
  }
  if (nt) got.push(nt + ' equipes');
  const meId = TAB.me?.url ? tabId(TAB.me.url) : null;
  const panel = adjsOf(p).map(([u, role]) => ({
    id: tabId(u),
    name: String(A[tabId(u)]?.name || '').slice(0, 200),
    role
  }));
  const me = panel.find(x => x.id === meId);
  if (me) {
    S.panel.me = { name: me.name || TAB.me.name || S.panel.me.name, role: me.role };
  } else if (TAB.me?.name) S.panel.me.name = TAB.me.name;
  const others = panel.filter(x => x !== me && x.name);
  if (others.length) {
    S.panel.others = others.map(x => ({ name: x.name, role: x.role }));
    S.panel.others.forEach((o, i) => {
      S.wv[i] = S.wv[i] || blankPairs();
      S.wadv[i] = S.wadv[i] || [];
    });
    got.push('painel com ' + (others.length + 1) + ' juízes');
  }
  const v = venueName(p);
  if (v) {
    S.label = v.slice(0, 300);
    got.push('sala ' + v);
  }
  save();
  renderSetup();
  renderFlow();
  tabMsg(
    'Puxado do Tabbycat: ' +
      got.map(esc).join(', ') +
      '.' +
      (notes.length ? ' Atenção: ' + notes.join('; ') + '.' : ''),
    'okc'
  );
  renderTabPick();
}
ACTS.tabPull = () => {
  tabPull();
  return false;
};
document.addEventListener('keydown', e => {
  if (e.target.id === 'tabUrl' && e.key === 'Enter') {
    e.preventDefault();
    tabPull();
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (!S || !TAB) return;
  if (t.id === 'tabRound') tabRound(+t.value);
  else if (t.id === 'tabRoom' && t.value !== '') {
    const p = TAB.pairings[+t.value];
    if (p)
      applyPairing(
        p,
        TAB.rounds.find(r => r.seq === TAB.seq)
      );
  }
});
/* escolher uma equipe da lista do Tabbycat preenche os oradores vazios */
document.addEventListener('change', e => {
  const t = e.target;
  if (!S || !t.dataset || !t.dataset.tn || !TAB?.teams) return;
  const tm = TAB.teams.find(x => tabTeamName(x) === t.value);
  if (!tm) return;
  const sp = (tm.speakers || []).map(s => s.name || '');
  const X = S.teams[t.dataset.tn];
  if (!X.sp[0] && !X.sp[1]) {
    X.sp = [sp[0] || '', sp[1] || ''];
    save();
    renderSetup();
  }
});
