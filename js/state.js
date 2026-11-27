/* ---------- state ---------- */
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
const recv = a => S.args.filter(x => x.to.includes(a.id));
const status = a => a.res || (recv(a).length ? 'resp' : 'sem');
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
