/* ---------- clashes e métricas ----------
 * Eixos do debate, definidos pelo juiz: clashes (choques centrais) e métricas (critérios de pesagem).
 * Cada argumento pode engajar um eixo com força 1-3. A barra fica acima do flow; a lente "Por métrica"
 * mostra, por eixo, como cada bancada engajou, quem levou, a relevância e o sopesamento entre eixos.
 */
const axById = id => S.axes.find(x => x.id === id);
function axEngage(x) {
  return Object.fromEntries(
    TEAMS.map(t => {
      const L = S.args.filter(a => teamOf(a) === t && a.ax[x.id]);
      return [t, { args: L, sum: L.reduce((s, a) => s + a.ax[x.id], 0) }];
    })
  );
}
/* " · ⚖ 1 · ★ 1": quantos argumentos de comparativa e de relevância a bancada fez neste eixo */
function axKinds(L, x) {
  return ['c', 'r']
    .map(t => {
      const n = L.filter(a => axType(a, x.id) === t).length;
      return n ? ' · ' + AXTI[t] + ' ' + n : '';
    })
    .join('');
}
function renderAxesBar() {
  const chips = S.axes
    .map(
      x =>
        `<span class="axchip ${AXF === x.id ? 'on' : ''} K${x.kind}" data-ax="${x.id}"><button class="axmain" data-act="axf" data-v="${x.id}" title="Destacar argumentos deste ${AXK[x.kind].toLowerCase()}"><b>${AXI[x.kind]}</b> ${esc(x.title) || '?'} <i title="Relevância ${REL[x.rel].toLowerCase()}">${dots(x.rel)}</i>${x.win ? ` <span class="T${x.win}"><span class="tc">${x.win}</span></span>` : ''}</button><button class="axedit" data-act="axedit" data-v="${x.id}" aria-label="Editar ${esc(x.title)}">⋯</button></span>`
    )
    .join('');
  $('#axesBar').innerHTML =
    `<div class="axes"><span class="axlbl">Clashes e métricas</span>${chips}<form class="axadd"><input placeholder="${S.axes.length ? '+ outro' : '+ clash, m: métrica ou k: caracterização'}, Enter" aria-label="Novo clash ou métrica"></form></div>`;
}
document.addEventListener('submit', e => {
  const f = e.target.closest('form.axadd');
  if (!f || !S) return;
  e.preventDefault();
  const i = f.querySelector('input');
  let v = i.value.trim();
  if (!v) return;
  let kind = 'c';
  const m = v.match(/^(m|métrica|metrica|c|clash|k|car|caracterização|caracterizacao)\s*:\s*(.+)$/i);
  if (m) {
    kind = /^m/i.test(m[1]) ? 'm' : /^(k|car)/i.test(m[1]) ? 'k' : 'c';
    v = m[2].trim();
  }
  S.axes.push({ id: uid(), title: v, kind, rel: 2, by: '', win: '', note: '' });
  save();
  renderFlow();
  document.querySelector('form.axadd input')?.focus();
});
function axModal(id) {
  const x = axById(id);
  if (!x) return;
  const E = axEngage(x);
  const pick = (act, val, list) =>
    list
      .map(
        ([k, v, cls]) =>
          `<button class="chip ${cls || ''} ${val === k ? 'on' : ''}" data-act="${act}" data-ax="${x.id}" data-v="${k}">${v}</button>`
      )
      .join('');
  modal(`<h2>${AXK[x.kind]}</h2>
<label class="l" for="axTitle">Nome</label><input id="axTitle" data-axf="title" data-ax="${x.id}" value="${esc(x.title)}">
<label class="l">Tipo</label><div class="chips">${pick(
    'axset',
    x.kind,
    Object.entries(AXK).map(([k, v]) => [k, v])
  )}<span class="small muted" style="padding-top:4px">Clash: choque central. Métrica: critério para pesar. Caracterização: como cada lado descreve um ator ou o mundo.</span></div>
<label class="l">Relevância para a decisão</label><div class="chips">${pick('axrel', String(x.rel), Object.entries(REL))}</div>
<label class="l">Quem introduziu</label><div class="chips">${pick(
    'axby',
    x.by,
    TEAMS.map(t => [t, t, 'T' + t])
  )}</div>
<label class="l">Quem levou</label><div class="chips">${pick(
    'axwin',
    x.win,
    TEAMS.map(t => [t, t, 'T' + t])
  )}</div>
<label class="l" for="axNote">Por quê / nota</label><textarea id="axNote" data-axf="note" data-ax="${x.id}" rows="2">${esc(x.note)}</textarea>
<label class="l">Engajamento</label><div class="axeng">${TEAMS.map(
    t =>
      `<div class="T${t}"><span class="tc">${t}</span> <span class="small">${E[t].args.map(a => code(a) + ' ' + axTag(a, x.id)).join(', ') || '<span class="muted">nada</span>'}</span></div>`
  ).join('')}</div>
<div class="row" style="margin-top:12px"><button class="sm" data-act="axdel" data-v="${x.id}">Apagar</button><span style="flex:1"></span><button class="pri" data-act="close">Fechar</button></div>`);
  modal.onclose = () => renderFlow();
}
function axTeamPicks(x) {
  return TEAMS.map(
    t =>
      `<button class="pick sm T${t} ${x.win === t ? 'on' : ''}" data-act="axwin" data-ax="${x.id}" data-v="${t}">${t}</button>`
  ).join('');
}
function renderAxisLens() {
  if (!S.axes.length) {
    $('#lensAxis').innerHTML =
      '<div class="panel"><p>Nenhum clash, métrica ou caracterização ainda.</p><p class="small muted">Escreva na barra acima e dê Enter. Comece com m: para métrica ou k: para caracterização. Depois ligue os argumentos: arraste o código até o eixo, ou abra os detalhes do cartão. Um argumento pode argumentar dentro do eixo, fazer comparativa ou sopesamento, ou mostrar por que o eixo é relevante.</p></div>';
    return;
  }
  const none = S.args.filter(a => !Object.keys(a.ax).length);
  $('#lensAxis').innerHTML =
    `<p class="hint">Na ordem de peso (use ↑ ↓). Força de cada argumento em ●, soma por bancada, e quem levou.</p>
<div class="scroll"><table class="axtable"><thead><tr><th></th><th>Clash ou métrica</th>${TEAMS.map(t => `<th class="T${t}"><span class="tc">${t}</span></th>`).join('')}<th>Quem levou</th></tr></thead><tbody>${S.axes
      .map((x, i) => {
        const E = axEngage(x);
        const max = Math.max(...TEAMS.map(t => E[t].sum));
        return `<tr data-ax="${x.id}"><td class="n"><button class="x" data-act="axmove" data-v="${x.id}" data-d="-1" ${i ? '' : 'disabled'} aria-label="Subir">↑</button><button class="x" data-act="axmove" data-v="${x.id}" data-d="1" ${i < S.axes.length - 1 ? '' : 'disabled'} aria-label="Descer">↓</button></td>
<td><button class="linkbtn" data-act="axedit" data-v="${x.id}"><b>${AXI[x.kind]} ${esc(x.title) || '?'}</b></button><div class="small muted">${AXK[x.kind]} · relevância <button class="linkbtn" data-act="axrel" data-ax="${x.id}" data-v="${(x.rel % 3) + 1}" title="Trocar relevância">${dots(x.rel)}</button>${x.by ? ' · trazido por ' + x.by : ''}</div>${x.note ? `<div class="small">${esc(x.note)}</div>` : ''}</td>
${TEAMS.map(
  t =>
    `<td class="T${t} ${E[t].sum && E[t].sum === max ? 'axtop' : ''}">${
      E[t].args
        .map(
          a =>
            `<div class="small"><a href="#" class="go" data-go="${a.id}"><span class="tc">${code(a)}</span></a> <i>${axTag(a, x.id)}</i> ${esc(a.title).slice(0, 40)}</div>`
        )
        .join('') || '<span class="muted small">não engajou</span>'
    }${E[t].sum ? `<div class="small muted">soma ${E[t].sum}${axKinds(E[t].args, x)}</div>` : ''}</td>`
).join('')}
<td><div class="row" style="gap:4px">${axTeamPicks(x)}</div></td></tr>`;
      })
      .join('')}</tbody></table></div>
<div class="panel" style="margin-top:12px"><label class="l" for="weigh">Sopesamento entre clashes e métricas</label><textarea id="weigh" rows="3" placeholder="Qual eixo pesa mais e por quê; quem fez essa pesagem (ou se fui eu)">${esc(S.weigh)}</textarea></div>
${none.length ? `<p class="small muted" style="margin-top:10px">Sem eixo: ${none.map(a => `<a href="#" class="go" data-go="${a.id}">${code(a)}</a>`).join(', ')}</p>` : ''}`;
}
document.addEventListener('input', e => {
  const t = e.target;
  if (!S) return;
  if (t.dataset.axf) {
    const x = axById(t.dataset.ax);
    if (!x) return;
    x[t.dataset.axf] = t.value;
    save();
  } else if (t.id === 'weigh') {
    S.weigh = t.value;
    save();
  }
});
const axAct = fn => b => {
  const x = axById(b.dataset.ax || b.dataset.v);
  if (!x) return false;
  fn(x, b);
  save();
  if ($('#modal').classList.contains('on') && $('#mbox [data-axf]')) axModal(x.id);
  else renderFlow();
  return false;
};
ACTS.axf = b => {
  AXF = AXF === b.dataset.v ? null : b.dataset.v;
  SEL = null;
  renderAxesBar();
  applyFocus();
  return false;
};
ACTS.axedit = b => {
  axModal(b.dataset.v);
  return false;
};
ACTS.axset = axAct((x, b) => (x.kind = b.dataset.v));
ACTS.axrel = axAct((x, b) => (x.rel = +b.dataset.v));
ACTS.axby = axAct((x, b) => (x.by = x.by === b.dataset.v ? '' : b.dataset.v));
ACTS.axwin = axAct((x, b) => (x.win = x.win === b.dataset.v ? '' : b.dataset.v));
ACTS.axmove = b => {
  const i = S.axes.findIndex(x => x.id === b.dataset.v);
  const j = i + +b.dataset.d;
  if (i < 0 || j < 0 || j >= S.axes.length) return false;
  [S.axes[i], S.axes[j]] = [S.axes[j], S.axes[i]];
  save();
  renderFlow();
  return false;
};
ACTS.axdel = b => {
  const i = S.axes.findIndex(x => x.id === b.dataset.v);
  if (i < 0) return false;
  const x = S.axes[i];
  const had = S.args.filter(a => a.ax[x.id]).map(a => [a, a.ax[x.id]]);
  S.axes.splice(i, 1);
  had.forEach(([a]) => delete a.ax[x.id]);
  if (AXF === x.id) AXF = null;
  closeM();
  save();
  renderFlow();
  toast('Eixo apagado', () => {
    S.axes.splice(i, 0, x);
    had.forEach(([a, s]) => (a.ax[x.id] = s));
    save();
    renderFlow();
  });
  return false;
};
/* resumo dos eixos entre duas bancadas, para a deliberação */
function axesEvidence(a, b) {
  return S.axes
    .map(x => {
      const E = axEngage(x);
      if (!E[a].sum && !E[b].sum && x.win !== a && x.win !== b) return '';
      return `<div class="ev">${AXK[x.kind]} ${esc(x.title)} (relevância ${REL[x.rel].toLowerCase()}): ${a} ${dots(Math.min(3, E[a].sum))} x ${dots(Math.min(3, E[b].sum))} ${b}${x.win ? ' · levou <b>' + x.win + '</b>' : ''}</div>`;
    })
    .join('');
}
