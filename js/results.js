/* ---------- results ---------- */
function rankFrom(pairs) {
  const wins = Object.fromEntries(TEAMS.map(t => [t, 0]));
  let miss = 0;
  PAIRS.forEach(([a, b]) => {
    const w = pairs?.[pk(a, b)]?.w;
    if (!w) miss++;
    else wins[w]++;
  });
  if (miss) return { miss };
  const order = [...TEAMS].sort((x, y) => wins[y] - wins[x]);
  return { order, ok: order.map(t => wins[t]).join() === '3,2,1,0' };
}
function panelResult() {
  const V = judges().filter(v => v.vote);
  const ch = chairJ();
  const rows = PAIRS.map(([a, b]) => {
    const k = pk(a, b);
    const va = V.filter(v => v.pairs[k]?.w === a),
      vb = V.filter(v => v.pairs[k]?.w === b);
    const cw = ch.pairs[k]?.w;
    let win = '',
      tb = false;
    if (va.length > vb.length) win = a;
    else if (vb.length > va.length) win = b;
    else if (va.length && cw) {
      win = cw;
      tb = true;
    }
    return {
      k,
      a,
      b,
      va,
      vb,
      win,
      lose: win === a ? b : a,
      tb,
      margin: Math.abs(va.length - vb.length),
      unan: !!win && (!va.length || !vb.length),
      missing: V.filter(v => !v.pairs[k]?.w).map(v => v.name)
    };
  });
  if (rows.some(r => !r.win)) return { rows, incomplete: true };
  const wins = Object.fromEntries(TEAMS.map(t => [t, 0]));
  rows.forEach(r => wins[r.win]++);
  let order = [...TEAMS].sort((x, y) => wins[y] - wins[x]);
  if (order.map(t => wins[t]).join() === '3,2,1,0') return { rows, order, cyclic: false };
  const pri = k => {
    const i = S.tie.indexOf(k);
    return i < 0 ? 99 : i;
  };
  const agree = r => (ch.pairs[r.k]?.w === r.win ? 0 : 1);
  const cr = rankFrom(ch.pairs);
  const crank = t => (cr.order ? cr.order.indexOf(t) : 9);
  const sorted = [...rows].sort(
    (x, y) =>
      y.margin - x.margin ||
      pri(x.k) - pri(y.k) ||
      agree(x) - agree(y) ||
      crank(x.win) - crank(y.win) ||
      (S.my[x.k]?.c === 'clara' ? 0 : 1) - (S.my[y.k]?.c === 'clara' ? 0 : 1)
  );
  const edges = [];
  const reach = (f, t) => {
    const st = [f],
      seen = new Set();
    while (st.length) {
      const n = st.pop();
      if (n === t) return true;
      if (seen.has(n)) continue;
      seen.add(n);
      edges.filter(e => e[0] === n).forEach(e => st.push(e[1]));
    }
    return false;
  };
  const steps = sorted.map(r => {
    if (reach(r.lose, r.win)) return { r, lock: false };
    edges.push([r.win, r.lose]);
    return { r, lock: true };
  });
  const beats = Object.fromEntries(TEAMS.map(t => [t, TEAMS.filter(u => u !== t && reach(t, u)).length]));
  order = [...TEAMS].sort((x, y) => beats[y] - beats[x]);
  return { rows, order, cyclic: true, steps };
}
function advResult() {
  const n = need();
  const V = judges().filter(v => v.vote);
  const missing = V.filter(v => (v.adv || []).length !== n).map(v => v.name);
  const cnt = Object.fromEntries(TEAMS.map(t => [t, V.filter(v => (v.adv || []).includes(t)).length]));
  if (missing.length) return { cnt, missing, incomplete: true };
  const sorted = [...TEAMS].sort((a, b) => cnt[b] - cnt[a]);
  const cut = cnt[sorted[n - 1]];
  const above = sorted.filter(t => cnt[t] > cut);
  const tied = sorted.filter(t => cnt[t] === cut);
  const slots = n - above.length;
  let adv = null,
    how = '';
  if (tied.length === slots) {
    adv = above.concat(tied);
  } else {
    const ch = chairJ();
    const pref = tied.filter(t => ch.adv.includes(t));
    if (pref.length === slots) {
      adv = above.concat(pref);
      how = 'chair';
    } else {
      const man = S.advTie.filter(t => tied.includes(t));
      if (man.length === slots) {
        adv = above.concat(man);
        how = 'manual';
      }
    }
  }
  return {
    cnt,
    adv,
    tied: adv ? null : tied,
    slots,
    how,
    unan: adv && V.every(v => v.adv.every(t => adv.includes(t)))
  };
}
const finalScore = k => {
  const f = S.speaks.f?.[k];
  if (f !== undefined && f !== '') return +f;
  return suggest(k);
};
function suggest(k) {
  const vals = judges()
    .filter(v => v.vote)
    .map(v => S.speaks[v.id]?.[k])
    .filter(x => x !== undefined && x !== '')
    .map(Number)
    .sort((x, y) => x - y);
  if (!vals.length) return '';
  if (vals.length === 2) return Math.round((vals[0] + vals[1]) / 2);
  return vals[Math.floor(vals.length / 2)];
}
function computeResult() {
  const out = { stage: S.stage };
  if (isOut()) {
    const R = advResult();
    if (R.adv) {
      out.advance = R.adv;
      if (S.stage === 'final') out.winner = R.adv[0];
      out.split = !R.unan;
      out.me_minority = S.panel.me.role !== 'trainee' && !S.myAdv.every(t => R.adv.includes(t));
    }
    out.votes = R.cnt;
  } else {
    const R = panelResult();
    if (!R.incomplete) {
      out.order = R.order;
      out.split = R.rows.some(r => !r.unan);
      out.cyclic = R.cyclic;
      out.splits = R.rows
        .filter(r => !r.unan)
        .map(
          r =>
            r.win + '>' + r.lose + ' ' + Math.max(r.va.length, r.vb.length) + '-' + Math.min(r.va.length, r.vb.length)
        );
      out.me_minority = S.panel.me.role !== 'trainee' && R.rows.some(r => S.my[r.k]?.w && S.my[r.k].w !== r.win);
    }
  }
  if (S.speaksOn) {
    out.speaks = {};
    SP.forEach(x => {
      const v = finalScore(x.k);
      if (v !== '') out.speaks[x.k] = v;
    });
  }
  return out;
}
