/* ---------- modal da bancada ----------
 * Clique no cabeçalho de uma bancada (OG, OO, CG, CO) para ver tudo dela num lugar:
 * nomes, números, argumentos por discurso, ligações, clashes/métricas, confrontos e o que você já decidiu.
 */
function teamModal(t) {
  const L = S.args.filter(a => teamOf(a) === t);
  const st = stats(t);
  const recvBy = L.flatMap(a => incoming(a).filter(x => teamOf(x.a) !== t));
  const gave = L.flatMap(a => a.links.filter(l => argById(l.id) && side(teamOf(argById(l.id))) !== side(t)));
  const kpi = (n, l) => `<div class="kpi"><b>${n}</b>${l}</div>`;
  const cl = S.clashes.filter(c => [c.a, c.b].some(id => argById(id) && teamOf(argById(id)) === t));
  const won = cl.filter(c => c.win && c.win !== 'e' && teamOf(argById(c.win === 'a' ? c.a : c.b)) === t).length;
  const lost = cl.filter(c => c.win && c.win !== 'e' && teamOf(argById(c.win === 'a' ? c.a : c.b)) !== t).length;
  const axes = S.axes
    .map(x => {
      const E = axEngage(x)[t];
      if (!E.sum && x.win !== t && x.by !== t) return '';
      return `<div class="ev">${AXI[x.kind]} ${esc(x.title)} · ${E.args.map(a => code(a) + ' ' + axTag(a, x.id)).join(', ') || 'não engajou'}${x.by === t ? ' · trouxe o eixo' : ''}${x.win === t ? ' · <b>levou</b>' : x.win ? ' · levou ' + x.win : ''}</div>`;
    })
    .join('');
  const pairs = PAIRS.filter(p => p.includes(t))
    .map(([a, b]) => {
      const p = S.my[pk(a, b)];
      const o = a === t ? b : a;
      if (!p || !p.w) return `<div class="ev muted">${t} x ${o}: ainda não decidido</div>`;
      return `<div class="ev">${t} x ${o}: <b>${p.w === t ? 'ganhou' : 'perdeu'}</b>${p.c ? ' (' + p.c + ')' : ''}${p.why ? ' · ' + esc(p.why) : ''}</div>`;
    })
    .join('');
  const P = S.pois || [];
  const pm = P.filter(p => spOf(p.by).t === t && !p.no);
  const pr = P.filter(p => spOf(p.sp).t === t);
  const poiTxt = p =>
    `<div class="ev"><button class="linkbtn" data-act="poi" data-sp="${p.sp}" data-v="${p.id}"><span class="tc">${p.by}</span> → ${p.sp}</button>${p.no ? ' · recusado' : ''}${p.q ? ' · ' + esc(p.q) : ''}${p.a ? ' → ' + esc(p.a) : ''}${p.ev ? ' · ' + POIEV[p.ev].toLowerCase() : ''}</div>`;
  const pois =
    pm.length || pr.length
      ? `<h3 style="margin:14px 0 4px">POIs</h3>${pm.map(poiTxt).join('')}${pr.map(poiTxt).join('')}<div class="small muted">${SP.filter(
          x => x.t === t
        )
          .map(
            x =>
              x.k +
              ': ' +
              pr.filter(p => p.sp === x.k && !p.no).length +
              ' aceitos, ' +
              pr.filter(p => p.sp === x.k && p.no).length +
              ' recusados' +
              ({ recusou: ' (recusou todos)', ninguem: ' (ninguém ofereceu)' }[poiStatus(x.k)] || '')
          )
          .join(' · ')}</div>`
      : '';
  const speech = x => {
    const A = S.args.filter(a => a.sp === x.k);
    return `<div class="tm-sp"><div><span class="role">${x.k}</span> <span class="small muted">${esc(S.teams[t].sp[x.i] || SPN[x.k])}</span>${S.speaksOn && finalScore(x.k) ? ` <span class="badge">${finalScore(x.k)}</span>` : ''}</div>${
      A.map(
        a =>
          `<div class="ev"><a href="#" class="go" data-go="${a.id}" data-close="1"><span class="tc">${code(a)}</span></a> ${esc(a.title)} ${a.q ? `<span class="badge ${a.q === 'f' ? 'g' : a.q === 'w' ? 'b' : ''}">${QUAL[a.q]}</span>` : ''} ${STBADGE[status(a)]}${a.links.length ? `<div class="small muted">${a.links.map(l => (argById(l.id) ? linkLabel(l) + ' ' + code(argById(l.id)) : '')).join(' · ')}</div>` : ''}</div>`
      ).join('') || '<div class="small muted">Nada anotado.</div>'
    }</div>`;
  };
  modal(`<div class="T${t}"><div class="row" style="justify-content:space-between"><h2 style="margin:0"><span class="tc">${t}</span> <span class="small muted">${{ OG: 'Opening Government', OO: 'Opening Opposition', CG: 'Closing Government', CO: 'Closing Opposition' }[t]}</span></h2><button class="x" data-act="close" aria-label="Fechar">✕</button></div>
<div class="row" style="margin-top:8px"><input data-tn="${t}" list="dlTeam" value="${esc(S.teams[t].name)}" placeholder="Equipe" style="flex:2 1 140px">${[0, 1].map(i => `<input data-sn="${t}" data-i="${i}" list="dlSpk" value="${esc(S.teams[t].sp[i])}" placeholder="${SP.find(x => x.t === t && x.i === i).k}" style="flex:1 1 100px">`).join('')}</div></div>
<div class="kpis" style="margin-top:12px">${kpi(st.n, 'ideias')}${kpi(st.f, 'fortes')}${kpi(st.pe, 'de pé')}${kpi(recvBy.length, 'ataques recebidos')}${kpi(gave.length, 'ataques feitos')}${pm.length ? kpi(pm.length, 'POIs feitos') : ''}${cl.length ? kpi(won + '-' + lost, 'confrontos (V-D)') : ''}</div>
<h3 style="margin:14px 0 4px">Por discurso</h3>${SP.filter(x => x.t === t)
    .map(speech)
    .join('')}
${axes ? `<h3 style="margin:14px 0 4px">Clashes e métricas</h3>${axes}` : ''}
${pois}
<h3 style="margin:14px 0 4px">Minhas comparativas</h3>${pairs}`);
  modal.onclose = () => {
    renderSetup();
    renderFlow();
  };
}
ACTS.team = b => {
  teamModal(b.dataset.v);
  return false;
};
document.addEventListener('keydown', e => {
  const th = e.target.closest && e.target.closest('.th[data-act=team]');
  if (th && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    teamModal(th.dataset.v);
  }
});
/* links "ir até" dentro de um modal fecham o modal antes */
document.addEventListener(
  'click',
  e => {
    if (e.target.closest('[data-close]')) closeM();
  },
  true
);
