/* ---------- state ---------- */
/* Ações extras registradas pelos módulos de funcionalidade (axes, lenses, drag, tabby...).
 * ACTS[nome](botão, argumento, confronto, evento): devolver false evita salvar e redesenhar o flow. */
const ACTS = {};
/* argumento selecionado (foco e atalhos); não é salvo */
let SEL = null;
let user = null,
  S = null,
  D = null,
  TOURS = [],
  mobTeam = 'OG',
  route = { v: 'home' };
const spOf = k => SP.find(x => x.k === k);
const teamOf = a => spOf(a.sp).t;
const tName = t => (S.teams[t].name ? t + ' (' + S.teams[t].name + ')' : t);
const isOut = () => S.stage !== 'preliminar';
const need = () => (S.stage === 'final' ? 1 : 2);
function code(a) {
  return a.sp + (S.args.filter(x => x.sp === a.sp).indexOf(a) + 1);
}
/* ligações: a.links é a fonte; a.to (respostas e flips) é mantido para exportação e views SQL */
const argById = id => S.args.find(x => x.id === id);
const side = t => (t === 'OG' || t === 'CG' ? 'gov' : 'opp');
const isClosing = t => t === 'CG' || t === 'CO';
const syncTo = a => (a.to = a.links.filter(l => l.t === 'r' || l.t === 'f').map(l => l.id));
const incoming = (a, types) =>
  S.args.flatMap(x => x.links.filter(l => l.id === a.id && (!types || types.includes(l.t))).map(l => ({ a: x, l })));
const recv = a => incoming(a, 'rf').map(x => x.a);
const flipped = a => incoming(a, 'f').length > 0;
const status = a => a.res || (flipped(a) ? 'flip' : recv(a).length ? 'resp' : 'sem');
/* que ligações fazem sentido de "a" para "b" (a primeira é a sugerida) */
function linkOptions(a, b) {
  const ta = teamOf(a),
    tb = teamOf(b);
  if (side(ta) !== side(tb)) return ['r', 'f'];
  if (ta === tb) return ['c'];
  return isClosing(ta) && !isClosing(tb) ? ['v', 'c'] : ['c'];
}
function setLink(a, id, t, s) {
  a.links = a.links.filter(l => l.id !== id);
  a.links.push(t === 'v' ? { id, t, s: s || 2 } : { id, t });
  if (a.kind === 'c' && (t === 'r' || t === 'f')) a.kind = 'r';
  if (a.kind === 'c' && t === 'v') a.kind = 'x';
  syncTo(a);
}
function unsetLink(a, id) {
  a.links = a.links.filter(l => l.id !== id);
  syncTo(a);
}
const linkLabel = l => LINKV[l.t] + (l.t === 'v' ? ' (' + FORCE[l.s].toLowerCase() + ')' : '');
function stats(t) {
  const L = S.args.filter(a => teamOf(a) === t);
  return {
    n: L.length,
    f: L.filter(a => a.q === 'f').length,
    pe: L.filter(a => a.res !== 'cai').length,
    cai: L.filter(a => a.res === 'cai').length
  };
}
function judges() {
  const L = [{ id: 'me', name: S.panel.me.name || 'Você', role: S.panel.me.role, pairs: S.my, adv: S.myAdv }];
  S.panel.others.forEach((o, i) => {
    if (o.role === 'off') return;
    S.wv[i] = S.wv[i] || blankPairs();
    S.wadv[i] = S.wadv[i] || [];
    L.push({ id: 'o' + i, idx: i, name: o.name || 'Juiz ' + (i + 2), role: o.role, pairs: S.wv[i], adv: S.wadv[i] });
  });
  return L.map(j => ({ ...j, vote: j.role !== 'trainee', chair: j.role === 'chair' }));
}
const chairJ = () => judges().find(j => j.chair) || judges()[0];
