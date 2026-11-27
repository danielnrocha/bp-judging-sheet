/* ---------- pendências ----------
 * Lista do que ainda falta decidir ou checar antes de votar, tirada do próprio flow.
 * Aparece no topo da deliberação e num botão "⚠ N" na barra de lentes da ficha.
 */
function pendings() {
  if (!S) return [];
  const L = [];
  const add = (txt, id, kind) => L.push({ txt, id, kind });
  const go = a => `<a href="#" class="go" data-go="${a.id}" data-close="1"><span class="tc">${code(a)}</span></a>`;
  for (const a of S.args) {
    const st = status(a);
    if (st === 'sem' && a.q === 'f' && a.kind !== 'i')
      add(`${go(a)} é forte e ninguém respondeu: pesa na comparação.`, a.id, 'arg');
    if (st === 'resp') add(`${go(a)} foi respondido: ficou de pé, mitigado ou caiu?`, a.id, 'arg');
    if (st === 'flip') add(`${go(a)} foi flipado: o flip se sustenta? Marque o veredito.`, a.id, 'arg');
    if (isClosing(teamOf(a)) && a.kind === 'c' && !a.links.length)
      add(`${go(a)} (closing): é novo em relação ao opening? Se aprofunda, ligue com verticaliza.`, a.id, 'arg');
  }
  for (const x of S.axes) {
    const E = axEngage(x);
    if (!TEAMS.some(t => E[t].sum)) add(`${AXI[x.kind]} ${esc(x.title)}: nenhum argumento ligado ainda.`, null, 'ax');
    else if (!x.win) add(`${AXI[x.kind]} ${esc(x.title)}: quem levou?`, null, 'ax');
  }
  if (S.axes.length > 1 && !S.weigh.trim())
    add('Falta o sopesamento entre clashes e métricas (lente Por métrica).', null, 'ax');
  for (const c of S.clashes)
    if (!c.win && argById(c.a) && argById(c.b))
      add(`Confronto ${go(argById(c.a))} x ${go(argById(c.b))}: quem levou?`, null, 'clash');
  SP.forEach(x => {
    const st = poiStatus(x.k);
    if (st === 'recusou') add(`${x.k} recusou todos os POIs oferecidos: pesa no engajamento.`, null, 'poi');
    else if (st === 'vazio')
      add(
        `${x.k}: nenhum POI registrado. Ofereceram? <button class="chip" data-act="poinone" data-v="${x.k}">ninguém ofereceu</button>`,
        null,
        'poi'
      );
  });
  PAIRS.forEach(([a, b]) => {
    const p = S.my[pk(a, b)];
    if (p?.w && !p.why.trim()) add(`${a} x ${b}: falta o porquê da sua comparativa (vai para a oral).`, null, 'delib');
  });
  return L;
}
function pendingHTML() {
  const L = pendings();
  return L.length
    ? `<ul class="pend">${L.map(p => `<li>${p.txt}</li>`).join('')}</ul>`
    : '<p class="okc small">Nada pendente no flow.</p>';
}
function pendModal() {
  modal(
    `<div class="row" style="justify-content:space-between"><h2 style="margin:0">Pendências</h2><button class="x" data-act="close" aria-label="Fechar">✕</button></div><p class="hint">O que ainda falta decidir ou checar antes de votar.</p>${pendingHTML()}`
  );
}
ACTS.pend = () => {
  pendModal();
  return false;
};
function renderPendBox() {
  const el = $('#pendBox');
  if (!el || !S) return;
  const n = pendings().length;
  el.innerHTML = `<details class="panel" ${n ? 'open' : ''}><summary><b>Pendências</b> <span class="badge ${n ? 'w' : 'g'}">${n}</span></summary>${pendingHTML()}</details>`;
}
