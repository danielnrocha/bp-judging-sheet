/* ---------- flow ----------
 * A ficha do debate: cartões de argumento por discurso, preparação e confrontos diretos.
 * As outras lentes (por ideia, por métrica) ficam em lenses.js e axes.js.
 */
const fit = t => {
  t.style.height = 'auto';
  t.style.height = t.scrollHeight + 'px';
};
const dots = n => '●'.repeat(n) + '○'.repeat(3 - n);
const STBADGE = {
  sem: '<span class="badge w">sem resposta</span>',
  resp: '<span class="badge">respondido, avaliar</span>',
  flip: '<span class="badge b">flipado</span>',
  pe: '<span class="badge g">de pé</span>',
  mi: '<span class="badge w">mitigado</span>',
  cai: '<span class="badge b">caiu</span>'
};
/* "Respondido por: LO1 (forte), DLO2" agrupado por tipo de ligação */
function incomingHTML(a) {
  const inc = incoming(a);
  return Object.keys(LINK)
    .map(t => {
      const L = inc.filter(x => x.l.t === t);
      if (!L.length) return '';
      return `<div class="recv">${LINKIN[t]}: ${L.map(
        ({ a: x, l }) =>
          `<a href="#" class="go" data-go="${x.id}">${code(x)}</a>` +
          (t === 'v' ? ' (' + FORCE[l.s].toLowerCase() + ')' : x.q ? ' (' + QUAL[x.q].toLowerCase() + ')' : '')
      ).join(', ')}</div>`;
    })
    .join('');
}
function argCard(a) {
  const t = teamOf(a);
  const cl = S.clashes.filter(c => c.a === a.id || c.b === a.id);
  const linked = new Set(a.links.map(l => l.id));
  const opts = S.args
    .filter(x => x.id !== a.id && !linked.has(x.id))
    .map(x => `<option value="${x.id}">${code(x)} · ${esc(x.title).slice(0, 40)}</option>`)
    .join('');
  const out = a.links
    .map(l => {
      const x = argById(l.id);
      return x
        ? `<span class="lnk L${l.t}"><a href="#" class="go" data-go="${x.id}">${linkLabel(l)} ${code(x)}</a><button data-act="unlink" data-v="${x.id}" aria-label="remover">×</button></span>`
        : '';
    })
    .join('');
  const tags = S.axes
    .filter(x => a.ax[x.id])
    .map(x => `<span class="axt" title="${esc(AXK[x.kind])}">${esc(x.title) || '?'} <i>${dots(a.ax[x.id])}</i></span>`)
    .join('');
  return `<div class="arg T${t} ${a.res === 'cai' ? 'fallen' : ''} ${SEL === a.id ? 'sel' : ''}" data-id="${a.id}"><div class="ah"><span class="code grip" title="Arraste até outro argumento ou até um clash/métrica para ligar">${code(a)}</span><textarea class="t" data-f="title" rows="1" aria-label="Ideia">${esc(a.title)}</textarea><button class="x" data-act="toggle" title="Detalhes">${a.open ? '▴' : '▾'}</button></div>
<div class="chips">${Object.entries(QUAL)
    .map(([k, v]) => `<button class="chip q-${k} ${a.q === k ? 'on' : ''}" data-act="q" data-v="${k}">${v}</button>`)
    .join('')}<select class="ksel" data-act="kind" aria-label="Tipo">${Object.entries(KIND)
    .map(([k, v]) => `<option value="${k}" ${a.kind === k ? 'selected' : ''}>${v}</option>`)
    .join('')}</select></div>
<div class="row" style="gap:6px">${STBADGE[status(a)]}${out ? `<span class="links">${out}</span>` : ''}${tags ? `<span class="links">${tags}</span>` : ''}</div>
${
  cl.length
    ? `<div class="recv">Em confronto: ${cl
        .map(c => {
          const o = argById(c.a === a.id ? c.b : c.a);
          const won = (c.win === 'a' && c.a === a.id) || (c.win === 'b' && c.b === a.id);
          return o ? code(o) + (c.win ? (c.win === 'e' ? ' (empate)' : won ? ' (levou)' : ' (perdeu)') : '') : '';
        })
        .join(', ')}</div>`
    : ''
}
${incomingHTML(a)}
${a.open ? detHTML(a, opts) : ''}</div>`;
}
function detHTML(a, opts) {
  const ax = S.axes.length
    ? `<label>Clashes e métricas (toque para dar força)</label><div class="chips">${S.axes
        .map(
          x =>
            `<button class="chip ${a.ax[x.id] ? 'on' : ''}" data-act="argax" data-v="${x.id}">${esc(x.title) || '?'} <i>${dots(a.ax[x.id] || 0)}</i></button>`
        )
        .join('')}</div>`
    : '';
  return `<div class="det"><label>Por que se sustenta (mecanismo)</label><textarea data-f="why" rows="2">${esc(a.why)}</textarea><label>Impacto</label><input data-f="imp" value="${esc(a.imp)}">
<label>Ligar a outro argumento <span class="muted">(ou arraste o código ${code(a)})</span></label><div class="row" style="flex-wrap:nowrap"><select data-act="ltype" aria-label="Tipo de ligação" style="flex:0 0 auto;width:auto">${Object.entries(
    LINK
  )
    .map(([k, v]) => `<option value="${k}">${v}</option>`)
    .join(
      ''
    )}</select><select data-act="link" aria-label="Argumento"><option value="">Escolher argumento...</option>${opts}</select></div>
${ax}${
    a.links.some(l => l.t === 'v')
      ? `<label>Força da verticalização</label>${a.links
          .filter(l => l.t === 'v')
          .map(
            l =>
              `<div class="chips"><span class="small muted" style="padding-top:4px">${code(argById(l.id))}:</span>${[
                1, 2, 3
              ]
                .map(
                  n =>
                    `<button class="chip ${l.s === n ? 'on' : ''}" data-act="vforce" data-k="${l.id}" data-v="${n}">${FORCE[n]}</button>`
                )
                .join('')}</div>`
          )
          .join('')}`
      : ''
  }
<label>Ao fim do debate, este argumento</label><div class="chips">${Object.entries(RES)
    .map(([k, v]) => `<button class="chip ${a.res === k ? 'on' : ''}" data-act="res" data-v="${k}">${v}</button>`)
    .join(
      ''
    )}</div><label>Nota</label><input data-f="note" value="${esc(a.note)}"><div class="row"><button class="sm" data-act="clashFrom">Criar confronto</button><button class="sm" data-act="del">Apagar</button></div></div>`;
}
function renderSpeeches() {
  const cur = SP[S.cur].k;
  $('#flow').innerHTML = TEAMS.map(t => {
    const st = stats(t);
    return `<div class="team T${t} ${mobTeam === t ? 'show' : ''}"><div class="th" data-act="team" data-v="${t}" role="button" tabindex="0" title="Ver tudo da bancada"><span><span class="tag">${t}</span> <span class="small muted">${esc(S.teams[t].name)}</span></span><span class="stats">${st.n} ideias · ${st.f} fortes<br>${st.pe} de pé · ${st.cai} caíram</span></div>
${SP.filter(x => x.t === t)
  .map(
    x =>
      `<div class="speech ${x.k === cur ? 'live' : ''}" data-sp="${x.k}"><div class="sh"><span><span class="role">${x.k}</span> <span class="small muted">${esc(S.teams[t].sp[x.i] || SPN[x.k])}</span></span><button class="sm" data-act="setcur">${x.k === cur ? 'Falando' : 'Marcar'}</button></div><form class="add" data-sp="${x.k}"><input placeholder="Nova ideia, Enter" aria-label="Nova ideia em ${x.k}"><button class="sm">+</button></form>${S.args
        .filter(a => a.sp === x.k)
        .map(argCard)
        .join('')}</div>`
  )
  .join('')}</div>`;
  }).join('');
  document.querySelectorAll('.arg .t').forEach(fit);
  $('#mobTeams').innerHTML = TEAMS.map(
    t => `<button class="pick T${t} ${mobTeam === t ? 'on' : ''}" data-act="mob" data-v="${t}">${t}</button>`
  ).join('');
  document.querySelectorAll('form.add').forEach(f => {
    const i = f.querySelector('input');
    let v = null;
    try {
      v = localStorage.getItem('bp.draft.' + D.id + '.' + f.dataset.sp);
    } catch (x) {}
    if (v && i && !i.value) i.value = v;
  });
}
function renderFlow() {
  if (!S) return;
  if (SEL && !argById(SEL)) SEL = null;
  renderAxesBar();
  renderLensBar();
  const lens = LENS;
  $('#flow').hidden = lens !== 'fala';
  $('#mobTeams').hidden = lens !== 'fala';
  $('#lensIdea').hidden = lens !== 'ideia';
  $('#lensAxis').hidden = lens !== 'metrica';
  if (lens === 'ideia') renderIdeas();
  else if (lens === 'metrica') renderAxisLens();
  else renderSpeeches();
  const o = S.args.map(x => `<option value="${x.id}">${code(x)} · ${esc(x.title).slice(0, 50)}</option>`).join('');
  const ka = $('#cA').value,
    kb = $('#cB').value;
  $('#cA').innerHTML = o;
  $('#cB').innerHTML = o;
  if (ka) $('#cA').value = ka;
  if (kb) $('#cB').value = kb;
  renderClashes();
  applyFocus();
}
function renderClashes() {
  $('#clashes').innerHTML = S.clashes.length
    ? S.clashes
        .map(c => {
          const a = argById(c.a),
            b = argById(c.b);
          if (!a || !b) return '';
          const ta = teamOf(a),
            tb = teamOf(b);
          return `<div class="clash" data-cid="${c.id}"><div class="T${ta}"><span class="tc">${code(a)}</span> ${esc(a.title)}</div><div class="vs">x</div><div class="T${tb}"><span class="tc">${code(b)}</span> ${esc(b.title)}</div><div style="grid-column:1/-1"><div class="chips">${Object.entries(
            CMP
          )
            .map(
              ([k, v]) => `<button class="chip ${c.cmp === k ? 'on' : ''}" data-act="ccmp" data-v="${k}">${v}</button>`
            )
            .join(
              ''
            )}</div><div class="chips"><span class="small muted" style="padding-top:4px">Quem levou:</span><button class="chip ${c.win === 'a' ? 'on' : ''}" data-act="cwin" data-v="a">${code(a)} (${ta})</button><button class="chip ${c.win === 'e' ? 'on' : ''}" data-act="cwin" data-v="e">Empate</button><button class="chip ${c.win === 'b' ? 'on' : ''}" data-act="cwin" data-v="b">${code(b)} (${tb})</button></div><div class="row"><input data-cf="why" value="${esc(c.why)}" placeholder="Por que essa comparação foi para esse lado" style="flex:1"><button class="x" data-act="cdel" aria-label="Apagar">×</button></div></div></div>`;
        })
        .join('')
    : '<p class="muted small">Nenhum confronto ainda. Dica: arraste o código de um argumento até um argumento adversário e escolha Confronto.</p>';
}
function renderSetup() {
  $('#motion').value = S.motion;
  renderTabSetup();
  $('#metaSetup').innerHTML =
    `<label class="l" for="mStage">Fase</label><select id="mStage">${STAGES.map(([k, v]) => `<option value="${k}" ${S.stage === k ? 'selected' : ''}>${v}</option>`).join('')}</select><div class="row"><div style="flex:1 1 90px"><label class="l" for="mRound">Rodada nº</label><input id="mRound" type="number" min="1" value="${esc(S.round_no)}"></div><div style="flex:2 1 140px"><label class="l" for="mLabel">Nome / sala</label><input id="mLabel" value="${esc(S.label)}"></div></div><label class="l" for="mInfo">Info slide</label><textarea id="mInfo" rows="2">${esc(S.info)}</textarea><label class="row small" style="margin-top:8px"><input type="checkbox" id="mSpk" style="width:auto" ${S.speaksOn ? 'checked' : ''}> Registrar speaker points</label><div class="row" style="margin-top:10px"><button class="sm" data-act="dupD">Duplicar painel em novo debate</button><button class="sm" data-act="delD">Apagar debate</button></div>`;
  $('#panelSetup').innerHTML =
    `<label class="l">Você neste debate</label><div class="row"><input data-me="name" list="dlAdj" value="${esc(S.panel.me.name)}" aria-label="Seu nome" style="flex:1 1 120px"><select data-mer="1" aria-label="Seu papel" style="flex:0 1 160px">${['chair', 'wing', 'trainee'].map(k => `<option value="${k}" ${S.panel.me.role === k ? 'selected' : ''}>${ROLE[k]}</option>`).join('')}</select></div><label class="l">Outros juízes</label>` +
    S.panel.others
      .map(
        (w, i) =>
          `<div class="row" style="margin-top:6px"><input data-w="${i}" list="dlAdj" value="${esc(w.name)}" placeholder="Nome" aria-label="Nome do juiz ${i + 2}" style="flex:1 1 120px"><select data-wr="${i}" aria-label="Papel do juiz ${i + 2}" style="flex:0 1 160px">${Object.entries(
            ROLE
          )
            .map(([k, v]) => `<option value="${k}" ${w.role === k ? 'selected' : ''}>${v}</option>`)
            .join('')}</select></div>`
      )
      .join('') +
    `<button class="sm" data-act="addJ" style="margin-top:8px">Adicionar juiz</button>`;
  $('#namesSetup').innerHTML =
    `<label class="l">Equipes e oradores</label>` +
    TEAMS.map(
      t =>
        `<div class="row T${t}" style="margin-top:6px"><span class="tc" style="width:30px">${t}</span><input data-tn="${t}" list="dlTeam" value="${esc(S.teams[t].name)}" placeholder="Equipe" style="flex:1 1 100px">${[0, 1].map(i => `<input data-sn="${t}" data-i="${i}" list="dlSpk" value="${esc(S.teams[t].sp[i])}" placeholder="${SP.find(x => x.t === t && x.i === i).k}" style="flex:1 1 80px">`).join('')}</div>`
    ).join('');
  $('#curSp').innerHTML = SP.map((x, i) => `<option value="${i}">${x.k} · ${x.t}</option>`).join('');
  $('#curSp').value = S.cur;
}
/* clique numa referência (PM1, LO2...) leva até o cartão e o seleciona */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (!g || !S) return;
  e.preventDefault();
  selectArg(g.dataset.go, true);
});
ACTS.argax = (b, a) => {
  const k = b.dataset.v;
  const n = ((a.ax[k] || 0) + 1) % 4;
  if (n) a.ax[k] = n;
  else delete a.ax[k];
};
ACTS.vforce = (b, a) => {
  const l = a.links.find(x => x.id === b.dataset.k && x.t === 'v');
  if (l) l.s = +b.dataset.v;
};
