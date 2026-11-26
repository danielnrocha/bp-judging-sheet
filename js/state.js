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
/* PM1, LO2...: posição do argumento dentro do discurso. Cacheado junto com o índice de ligações. */
let CODES = null,
  CODESS = null;
function code(a) {
  if (!CODES || CODESS !== S || !CODES.has(a)) {
    CODES = new Map();
    CODESS = S;
    const n = {};
    for (const x of S.args) CODES.set(x, x.sp + (n[x.sp] = (n[x.sp] || 0) + 1));
  }
  return CODES.get(a) || a.sp + '?';
}
/* ligações: a.links é a fonte; a.to (respostas, flips, mitigações e sopesamentos) é mantido para exportação e views SQL */
const argById = id => S.args.find(x => x.id === id);
const side = t => (t === 'OG' || t === 'CG' ? 'gov' : 'opp');
const isClosing = t => t === 'CG' || t === 'CO';
const syncTo = a => (a.to = a.links.filter(l => ATTACK.includes(l.t)).map(l => l.id));
/* ligações recebidas, indexadas por alvo; o índice é refeito quando o debate muda (dropInc) */
let INC = null,
  INCS = null;
const dropInc = () => {
  INC = null;
  CODES = null;
};
function incoming(a, types) {
  if (!INC || INCS !== S) {
    INC = new Map();
    INCS = S;
    for (const x of S.args)
      for (const l of x.links) {
        if (!INC.has(l.id)) INC.set(l.id, []);
        INC.get(l.id).push({ a: x, l });
      }
  }
  const L = INC.get(a.id) || [];
  return types ? L.filter(x => types.includes(x.l.t)) : L.slice();
}
const recv = a => incoming(a, ATTACK).map(x => x.a);
const flipped = a => incoming(a, 'f').length > 0;
const status = a => a.res || (flipped(a) ? 'flip' : recv(a).length ? 'resp' : 'sem');
const spIdx = k => SP.findIndex(x => x.k === k);
/* Que ligações "a" pode fazer até "b" (a primeira é a sugerida). Regras de BP:
 *  - só se liga a algo dito antes (um discurso anterior);
 *  - com a bancada oposta: responde, flipa, mitiga, sopesa;
 *  - com a própria mesa: complementa (só a segunda fala, na primeira da própria dupla) e, do closing para
 *    o opening da mesma mesa, verticaliza, mitiga ou sopesa (o closing precisa superar o seu opening). */
const isSecond = a => spOf(a.sp).i === 1;
const isOpp = (a, b) => side(teamOf(a)) !== side(teamOf(b));
function linkOptions(a, b) {
  if (a.id === b.id || spIdx(a.sp) <= spIdx(b.sp)) return [];
  const ta = teamOf(a),
    tb = teamOf(b);
  if (side(ta) !== side(tb)) return LINK_OPP.slice();
  if (ta === tb) return isSecond(a) && !isSecond(b) ? ['c'] : [];
  return isClosing(ta) && !isClosing(tb) ? ['v', 'm', 'w'] : [];
}
/* por que não dá para ligar (para avisar o juiz) */
function linkWhyNot(a, b) {
  const ta = teamOf(a),
    tb = teamOf(b);
  if (a.id === b.id) return 'Um argumento não se liga a ele mesmo.';
  if (spIdx(a.sp) < spIdx(b.sp)) return a.sp + ' fala antes de ' + b.sp + ': ligue a partir de ' + b.sp + '.';
  if (a.sp === b.sp) return 'Os dois são do mesmo discurso.';
  if (ta === tb)
    return 'Complementa só vale da segunda fala (' + SP.find(x => x.t === ta && x.i === 1).k + ') para a primeira.';
  return 'Ligações na mesma mesa vão do closing para o opening.';
}
const axType = (a, id) => a.axt?.[id] || 'a';
function setAx(a, id, s, t) {
  if (!s) {
    delete a.ax[id];
    delete a.axt[id];
    return;
  }
  a.ax[id] = s;
  if (t && t !== 'a') a.axt[id] = t;
  else if (t === 'a') delete a.axt[id];
  if (t === 'c' && a.kind === 'c') a.kind = 'p';
}
/* "⚖ ●●○" */
const axTag = (a, id) => (AXTI[axType(a, id)] ? AXTI[axType(a, id)] + ' ' : '') + dots(a.ax[id]);
function setLink(a, id, t, s) {
  dropInc();
  a.links = a.links.filter(l => l.id !== id);
  a.links.push(t === 'v' ? { id, t, s: s || 2 } : { id, t });
  if (a.kind === 'c' && ['r', 'f', 'm'].includes(t)) a.kind = 'r';
  if (a.kind === 'c' && t === 'w') a.kind = 'p';
  if (a.kind === 'c' && t === 'v') a.kind = 'x';
  syncTo(a);
}
function unsetLink(a, id) {
  dropInc();
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
