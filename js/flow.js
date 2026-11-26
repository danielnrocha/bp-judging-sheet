/* ---------- flow ---------- */
const fit = t => {
  t.style.height = 'auto';
  t.style.height = t.scrollHeight + 'px';
};
function argCard(a) {
  const t = teamOf(a);
  const st = status(a);
  const r = recv(a);
  const sb2 =
    st === 'sem'
      ? '<span class="badge w">sem resposta</span>'
      : st === 'resp'
        ? '<span class="badge">respondido, avaliar</span>'
        : st === 'pe'
          ? '<span class="badge g">de pé</span>'
          : st === 'mi'
            ? '<span class="badge w">mitigado</span>'
            : '<span class="badge b">caiu</span>';
  const cl = S.clashes.filter(c => c.a === a.id || c.b === a.id);
  const opts = S.args
    .filter(x => x.id !== a.id && !a.to.includes(x.id))
    .map(x => `<option value="${x.id}">${code(x)} · ${esc(x.title).slice(0, 40)}</option>`)
    .join('');
  return `<div class="arg T${t} ${a.res === 'cai' ? 'fallen' : ''}" data-id="${a.id}"><div class="ah"><span class="code">${code(a)}</span><textarea class="t" data-f="title" rows="1" aria-label="Ideia">${esc(a.title)}</textarea><button class="x" data-act="toggle" title="Detalhes">${a.open ? '▴' : '▾'}</button></div>
<div class="chips">${Object.entries(QUAL)
    .map(([k, v]) => `<button class="chip q-${k} ${a.q === k ? 'on' : ''}" data-act="q" data-v="${k}">${v}</button>`)
    .join('')}<select class="ksel" data-act="kind" aria-label="Tipo">${Object.entries(KIND)
    .map(([k, v]) => `<option value="${k}" ${a.kind === k ? 'selected' : ''}>${v}</option>`)
    .join('')}</select></div>
<div class="row" style="gap:6px">${sb2}${
    a.to.length
      ? `<span class="links">${a.to
          .map(id => {
            const x = S.args.find(y => y.id === id);
            return x
              ? `<span class="lnk">responde ${code(x)}<button data-act="unlink" data-v="${id}" aria-label="remover">×</button></span>`
              : '';
          })
          .join('')}</span>`
      : ''
  }</div>
${
  cl.length
    ? `<div class="recv">Em confronto: ${cl
        .map(c => {
          const o = S.args.find(z => z.id === (c.a === a.id ? c.b : c.a));
          const won = (c.win === 'a' && c.a === a.id) || (c.win === 'b' && c.b === a.id);
          return o ? code(o) + (c.win ? (c.win === 'e' ? ' (empate)' : won ? ' (levou)' : ' (perdeu)') : '') : '';
        })
        .join(', ')}</div>`
    : ''
}
${r.length ? `<div class="recv">Respostas recebidas: ${r.map(x => code(x) + (x.q ? ' (' + QUAL[x.q].toLowerCase() + ')' : '')).join(', ')}</div>` : ''}
${
  a.open
    ? `<div class="det"><label>Por que se sustenta (mecanismo)</label><textarea data-f="why" rows="2">${esc(a.why)}</textarea><label>Impacto</label><input data-f="imp" value="${esc(a.imp)}"><label>Responde a</label><select data-act="link"><option value="">Escolher argumento...</option>${opts}</select><label>Ao fim do debate, este argumento</label><div class="chips">${Object.entries(
        RES
      )
        .map(([k, v]) => `<button class="chip ${a.res === k ? 'on' : ''}" data-act="res" data-v="${k}">${v}</button>`)
        .join(
          ''
        )}</div><label>Nota</label><input data-f="note" value="${esc(a.note)}"><div class="row"><button class="sm" data-act="clashFrom">Criar confronto</button><button class="sm" data-act="del">Apagar</button></div></div>`
    : ''
}</div>`;
}
function renderFlow() {
  const cur = SP[S.cur].k;
  $('#flow').innerHTML = TEAMS.map(t => {
    const st = stats(t);
    return `<div class="team T${t} ${mobTeam === t ? 'show' : ''}"><div class="th"><span><span class="tag">${t}</span> <span class="small muted">${esc(S.teams[t].name)}</span></span><span class="stats">${st.n} ideias · ${st.f} fortes<br>${st.pe} de pé · ${st.cai} caíram</span></div>
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
  const o = S.args.map(x => `<option value="${x.id}">${code(x)} · ${esc(x.title).slice(0, 50)}</option>`).join('');
  const ka = $('#cA').value,
    kb = $('#cB').value;
  $('#cA').innerHTML = o;
  $('#cB').innerHTML = o;
  if (ka) $('#cA').value = ka;
  if (kb) $('#cB').value = kb;
  renderClashes();
  document.querySelectorAll('form.add').forEach(f => {
    const i = f.querySelector('input');
    let v = null;
    try {
      v = localStorage.getItem('bp.draft.' + D.id + '.' + f.dataset.sp);
    } catch (x) {}
    if (v && i && !i.value) i.value = v;
  });
}
function renderClashes() {
  $('#clashes').innerHTML = S.clashes.length
    ? S.clashes
        .map(c => {
          const a = S.args.find(x => x.id === c.a),
            b = S.args.find(x => x.id === c.b);
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
    : '<p class="muted small">Nenhum confronto ainda.</p>';
}
function renderSetup() {
  $('#motion').value = S.motion;
  $('#metaSetup').innerHTML =
    `<label class="l" for="mStage">Fase</label><select id="mStage">${STAGES.map(([k, v]) => `<option value="${k}" ${S.stage === k ? 'selected' : ''}>${v}</option>`).join('')}</select><div class="row"><div style="flex:1 1 90px"><label class="l" for="mRound">Rodada nº</label><input id="mRound" type="number" min="1" value="${esc(S.round_no)}"></div><div style="flex:2 1 140px"><label class="l" for="mLabel">Nome / sala</label><input id="mLabel" value="${esc(S.label)}"></div></div><label class="l" for="mInfo">Info slide</label><textarea id="mInfo" rows="2">${esc(S.info)}</textarea><label class="row small" style="margin-top:8px"><input type="checkbox" id="mSpk" style="width:auto" ${S.speaksOn ? 'checked' : ''}> Registrar speaker points</label><div class="row" style="margin-top:10px"><button class="sm" data-act="dupD">Duplicar painel em novo debate</button><button class="sm" data-act="delD">Apagar debate</button></div>`;
  $('#panelSetup').innerHTML =
    `<label class="l">Você neste debate</label><div class="row"><input data-me="name" value="${esc(S.panel.me.name)}" aria-label="Seu nome" style="flex:1 1 120px"><select data-mer="1" aria-label="Seu papel" style="flex:0 1 160px">${['chair', 'wing', 'trainee'].map(k => `<option value="${k}" ${S.panel.me.role === k ? 'selected' : ''}>${ROLE[k]}</option>`).join('')}</select></div><label class="l">Outros juízes</label>` +
    S.panel.others
      .map(
        (w, i) =>
          `<div class="row" style="margin-top:6px"><input data-w="${i}" value="${esc(w.name)}" placeholder="Nome" aria-label="Nome do juiz ${i + 2}" style="flex:1 1 120px"><select data-wr="${i}" aria-label="Papel do juiz ${i + 2}" style="flex:0 1 160px">${Object.entries(
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
        `<div class="row T${t}" style="margin-top:6px"><span class="tc" style="width:30px">${t}</span><input data-tn="${t}" value="${esc(S.teams[t].name)}" placeholder="Equipe" style="flex:1 1 100px">${[0, 1].map(i => `<input data-sn="${t}" data-i="${i}" value="${esc(S.teams[t].sp[i])}" placeholder="${SP.find(x => x.t === t && x.i === i).k}" style="flex:1 1 80px">`).join('')}</div>`
    ).join('');
  $('#curSp').innerHTML = SP.map((x, i) => `<option value="${i}">${x.k} · ${x.t}</option>`).join('');
  $('#curSp').value = S.cur;
}
