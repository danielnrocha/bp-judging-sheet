/* ---------- lentes e foco ----------
 * Três jeitos de ler o mesmo debate:
 *  - por fala: quem falou o quê (a ficha clássica, em flow.js);
 *  - por ideia: cada ideia com tudo o que veio depois (respostas, flips, complementos, verticalizações);
 *  - por métrica: como cada bancada engajou cada clash/métrica (axes.js).
 * Foco: apaga tudo que não tem a ver com o argumento selecionado (ou com o discurso atual).
 */
const pref = (k, d) => {
  try {
    return localStorage.getItem(k) ?? d;
  } catch (e) {
    return d;
  }
};
const setPref = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch (e) {}
};
const LENSES = [
  ['fala', 'Por fala'],
  ['ideia', 'Por ideia'],
  ['metrica', 'Por métrica']
];
let LENS = ['fala', 'ideia', 'metrica'].includes(pref('bp.lens', 'fala')) ? pref('bp.lens', 'fala') : 'fala';
let FOCUS = pref('bp.focus', '0') === '1';
let AXF = null; // eixo destacado na barra de clashes e métricas
function setLens(l) {
  LENS = l;
  setPref('bp.lens', l);
  renderFlow();
}
function renderLensBar() {
  $('#lensBar').innerHTML = `<div class="lensbar"><div class="seg" role="tablist">${LENSES.map(
    ([k, v]) =>
      `<button role="tab" aria-selected="${LENS === k}" class="${LENS === k ? 'on' : ''}" data-act="lens" data-v="${k}" data-key="V">${v}</button>`
  ).join(
    ''
  )}</div><span class="grow"></span>${(n => (n ? `<button class="sm pendbtn" data-act="pend" title="Pendências antes de votar">⚠ ${n}</button>` : ''))(pendings().length)}<button class="sm ${FOCUS ? 'pri' : ''}" data-act="focus" data-key="F" aria-pressed="${FOCUS}" title="Atalho: F">◎ Foco</button><button class="sm" data-act="keys" data-key="?" title="Atalhos (?)">⌨ Atalhos</button></div>`;
}
/* conjunto de argumentos "em foco" */
function focusSet() {
  if (SEL) {
    const a = argById(SEL);
    if (!a) return null;
    const s = new Set([a.id]);
    a.links.forEach(l => s.add(l.id));
    incoming(a).forEach(x => s.add(x.a.id));
    S.clashes.forEach(c => {
      if (c.a === a.id) s.add(c.b);
      if (c.b === a.id) s.add(c.a);
    });
    return s;
  }
  if (AXF) return new Set(S.args.filter(a => a.ax[AXF]).map(a => a.id));
  if (FOCUS) {
    const k = SP[S.cur].k;
    const s = new Set();
    S.args
      .filter(a => a.sp === k)
      .forEach(a => {
        s.add(a.id);
        a.links.forEach(l => s.add(l.id));
      });
    return s;
  }
  return null;
}
function applyFocus() {
  if (!S) return;
  updateCompact();
  const set = focusSet();
  const dim = !!set && (FOCUS || !!AXF);
  for (const box of ['#flow', '#lensIdea']) {
    const el = $(box);
    if (!el) continue;
    el.classList.toggle('focusing', dim);
    el.querySelectorAll('[data-id]').forEach(n => {
      const id = n.dataset.id;
      n.classList.toggle('hit', !!set && set.has(id));
      n.classList.toggle('sel', id === SEL);
    });
  }
  if (FOCUS && !SEL && !AXF) document.querySelector(`#flow .speech[data-sp="${SP[S.cur].k}"]`)?.classList.add('hit');
}
function selectArg(id, scroll) {
  SEL = id;
  if (scroll && LENS !== 'fala') {
    LENS = 'fala';
    setPref('bp.lens', 'fala');
    renderFlow();
  }
  applyFocus();
  if (scroll) {
    const a = argById(id);
    if (a && window.innerWidth <= 640 && mobTeam !== teamOf(a)) {
      mobTeam = teamOf(a);
      renderFlow();
    }
    const n = document.querySelector(
      `#flow:not([hidden]) .arg[data-id="${id}"], #lensIdea:not([hidden]) [data-id="${id}"]`
    );
    n?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    n?.classList.add('flash');
    setTimeout(() => n?.classList.remove('flash'), 900);
  }
}
/* tocar num cartão seleciona; tocar fora limpa */
document.addEventListener('pointerdown', e => {
  if (!S || !['ficha'].includes(route.v)) return;
  if (e.target.closest('.pop,.modal')) return;
  const n = e.target.closest('#flow .arg[data-id], #lensIdea [data-id]');
  if (n) {
    if (SEL !== n.dataset.id) {
      SEL = n.dataset.id;
      applyFocus();
    }
  } else if (e.target.closest('#flow, #lensIdea') && SEL) {
    SEL = null;
    applyFocus();
  }
});
ACTS.lens = b => {
  setLens(b.dataset.v);
  return false;
};
ACTS.focus = () => {
  FOCUS = !FOCUS;
  setPref('bp.focus', FOCUS ? '1' : '0');
  renderLensBar();
  applyFocus();
  return false;
};

/* ---------- por ideia ---------- */
function threadTeams(a, seen = new Set()) {
  if (seen.has(a.id)) return [];
  seen.add(a.id);
  return [teamOf(a), ...incoming(a).flatMap(x => threadTeams(x.a, seen))];
}
function ideaNode(a, rel, depth, seen) {
  if (seen.has(a.id))
    return `<div class="inode T${teamOf(a)}" data-id="${a.id}" style="--d:${depth}"><span class="irel">${rel ? linkLabel(rel) : ''}</span> <a href="#" class="go" data-go="${a.id}"><span class="tc">${code(a)}</span></a> <span class="muted small">(já aparece acima)</span></div>`;
  seen.add(a.id);
  const kids = incoming(a).sort((x, y) => S.args.indexOf(x.a) - S.args.indexOf(y.a));
  return `<div class="inode T${teamOf(a)} ${a.res === 'cai' ? 'fallen' : ''}" data-id="${a.id}" style="--d:${depth}">${rel ? `<span class="irel L${rel.t}">↳ ${linkLabel(rel)}</span> ` : ''}<a href="#" class="go" data-go="${a.id}" title="Ir até o cartão"><span class="tc">${code(a)}</span></a> <span class="ititle">${esc(a.title) || '<span class="muted">sem título</span>'}</span> ${a.q ? `<span class="badge ${a.q === 'f' ? 'g' : a.q === 'w' ? 'b' : ''}">${QUAL[a.q]}</span>` : ''} ${STBADGE[status(a)]}</div>${kids.map(x => ideaNode(x.a, x.l, depth + 1, seen)).join('')}`;
}
function renderIdeas() {
  const roots = S.args
    .filter(a => !a.links.length)
    .sort((x, y) => {
      const i = SP.findIndex(s => s.k === x.sp),
        j = SP.findIndex(s => s.k === y.sp);
      return i - j || S.args.indexOf(x) - S.args.indexOf(y);
    });
  const orphans = S.args.filter(a => a.links.length && a.links.every(l => !argById(l.id)));
  const seen = new Set();
  const html = roots
    .concat(orphans)
    .map(a => {
      const tc = threadTeams(a);
      const by = TEAMS.filter(t => tc.includes(t))
        .map(t => `<span class="T${t}"><span class="tc">${t}</span> ${tc.filter(x => x === t).length}</span>`)
        .join(' ');
      const axs = S.axes
        .filter(x => a.ax[x.id])
        .map(x => `<span class="axt">${esc(x.title)}</span>`)
        .join('');
      return `<div class="thread T${teamOf(a)}"><div class="thh"><span class="small muted">Contribuíram:</span> ${by}${axs ? ' · ' + axs : ''}</div>${ideaNode(a, null, 0, seen)}</div>`;
    })
    .join('');
  $('#lensIdea').innerHTML = S.args.length
    ? `<p class="hint">Cada ideia de partida e tudo o que veio depois dela. Toque num item para destacar; toque no código para ir até o cartão.</p><div class="threads">${html}</div>`
    : '<p class="muted">Nenhuma ideia anotada ainda. Anote em "Por fala".</p>';
}

/* ---------- barra de cima compacta ----------
 * Na ficha, o cabeçalho encolhe para uma linha quando você está digitando no flow ou rolou a página;
 * no modo foco fica mínimo (sem preparação, dicas nem campo de novo eixo) para sobrar espaço.
 */
let typingFlow = false;
let compactHold = 0; // até quando manter compacto depois de sair de um campo (evita a tela pular)
function updateCompact() {
  const inF = route.v === 'ficha' && !!S;
  document.body.classList.toggle('focusmode', inF && FOCUS);
  // histerese: encolhe depois de 200 px e só volta perto do topo
  const was = document.body.classList.contains('compact');
  const scrolled = was ? scrollY > 12 : scrollY > 200;
  const want = inF && (FOCUS || typingFlow || scrolled);
  if (!want && inF && (DRAG || document.querySelector('.pop') || Date.now() < compactHold)) return;
  if (want === was) return;
  const hdr = $('#hdr');
  const h0 = hdr.offsetHeight;
  document.body.classList.toggle('compact', want);
  // Quando encolhe só por rolagem, um espaço do tamanho da diferença fica abaixo da barra:
  // o conteúdo não se mexe (sem "pulo") e a área visível ganha o espaço do mesmo jeito.
  // No foco e digitando, o espaço é liberado de verdade.
  hdr.style.marginBottom = '';
  if (want && !FOCUS && !typingFlow) hdr.style.marginBottom = Math.max(0, h0 - hdr.offsetHeight) + 'px';
}
addEventListener('scroll', updateCompact, { passive: true });
document.addEventListener('focusin', e => {
  typingFlow = !!e.target.closest('#flow input, #flow textarea, #lensAxis textarea, .axadd input');
  updateCompact();
});
document.addEventListener('focusout', () => {
  if (!typingFlow) return;
  typingFlow = false;
  compactHold = Date.now() + 1500;
  setTimeout(updateCompact, 1600);
});
addEventListener('hashchange', () => setTimeout(updateCompact, 0));
