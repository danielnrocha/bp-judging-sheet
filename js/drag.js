/* ---------- arrastar para ligar ----------
 * Arraste o código de um argumento (ex.: LO1):
 *  - até outro argumento: escolhe responde / flipa / confronto (lado oposto) ou complementa / verticaliza (mesmo lado);
 *  - até um clash ou métrica na barra de cima: liga o argumento a esse eixo.
 * Usa pointer events, então funciona com mouse, caneta e toque.
 */
let DRAG = null;
function dropTarget(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const ax = el.closest('.axchip[data-ax]');
  if (ax) return { ax: ax.dataset.ax, el: ax };
  const ar = el.closest('#flow .arg[data-id], #lensIdea [data-id]');
  if (ar && ar.dataset.id !== DRAG.id) return { id: ar.dataset.id, el: ar };
  return null;
}
function clearDrop() {
  document.querySelectorAll('.droptgt').forEach(n => n.classList.remove('droptgt'));
}
document.addEventListener('pointerdown', e => {
  const g = e.target.closest('.grip');
  if (!g || !S || e.button > 0) return;
  const card = g.closest('[data-id]');
  if (!card) return;
  DRAG = { id: card.dataset.id, x: e.clientX, y: e.clientY, on: false, pid: e.pointerId };
  e.preventDefault();
  // o preventDefault impede o foco de sair do campo de texto; tira à mão para os atalhos funcionarem
  if (document.activeElement && document.activeElement.matches('input,textarea,select')) document.activeElement.blur();
});
document.addEventListener('pointermove', e => {
  if (!DRAG || e.pointerId !== DRAG.pid) return;
  if (!DRAG.on) {
    if (Math.hypot(e.clientX - DRAG.x, e.clientY - DRAG.y) < 6) return;
    const a = argById(DRAG.id);
    if (!a) return (DRAG = null);
    DRAG.on = true;
    const gh = document.createElement('div');
    gh.className = 'ghost T' + teamOf(a);
    gh.innerHTML = `<span class="tc">${code(a)}</span> ${esc(a.title).slice(0, 40)}`;
    document.body.appendChild(gh);
    DRAG.gh = gh;
    document.body.classList.add('dragging');
  }
  DRAG.gh.style.transform = `translate(${e.clientX + 12}px,${e.clientY + 12}px)`;
  clearDrop();
  const t = dropTarget(e.clientX, e.clientY);
  if (t) t.el.classList.add('droptgt');
  // rolagem automática perto das bordas
  const m = 60;
  if (e.clientY < m + 120) window.scrollBy(0, -12);
  else if (e.clientY > innerHeight - m) window.scrollBy(0, 12);
});
function endDrag(e) {
  if (!DRAG || e.pointerId !== DRAG.pid) return;
  const d = DRAG;
  DRAG = null;
  clearDrop();
  document.body.classList.remove('dragging');
  d.gh?.remove();
  if (!d.on) {
    selectArg(d.id);
    return;
  }
  if (e.type === 'pointercancel') return;
  DRAG = d;
  const t = dropTarget(e.clientX, e.clientY);
  DRAG = null;
  if (!t) return;
  const a = argById(d.id);
  if (t.ax) {
    const x = axById(t.ax);
    if (!a || !x) return;
    if (a.ax[x.id]) {
      toast(code(a) + ' já está em ' + x.title + '. Ajuste a força no cartão.');
      return;
    }
    a.ax[x.id] = 2;
    save();
    renderFlow();
    toast(code(a) + ' → ' + x.title, () => {
      delete a.ax[x.id];
      save();
      renderFlow();
    });
    return;
  }
  linkMenu(a, argById(t.id), e.clientX, e.clientY);
}
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);

/* menu que aparece ao soltar sobre outro argumento */
function closePop() {
  document.querySelector('.pop')?.remove();
}
function linkMenu(a, b, x, y) {
  if (!a || !b) return;
  closePop();
  const opts = linkOptions(a, b);
  const opp = side(teamOf(a)) !== side(teamOf(b));
  const btn = (t, label, s, n) =>
    `<button data-act="lk" data-src="${a.id}" data-tgt="${b.id}" data-t="${t}" ${s ? `data-s="${s}"` : ''}><kbd>${n}</kbd> ${label}</button>`;
  let n = 0;
  const rows = [];
  for (const t of opts) {
    if (t === 'v')
      rows.push(
        `<div class="poprow"><span class="small muted">Verticaliza:</span>${[1, 2, 3].map(s => btn('v', FORCE[s], s, ++n)).join('')}</div>`
      );
    else rows.push(btn(t, LINK[t], 0, ++n));
  }
  if (opp) rows.push(btn('clash', 'Confronto direto', 0, ++n));
  const p = document.createElement('div');
  p.className = 'pop';
  p.innerHTML = `<div class="small"><span class="T${teamOf(a)}"><span class="tc">${code(a)}</span></span> → <span class="T${teamOf(b)}"><span class="tc">${code(b)}</span></span></div>${rows.join('')}<button data-act="popx" class="x">Cancelar (Esc)</button>`;
  document.body.appendChild(p);
  const r = p.getBoundingClientRect();
  p.style.left = Math.max(8, Math.min(x, innerWidth - r.width - 8)) + 'px';
  p.style.top = Math.max(8, Math.min(y, innerHeight - r.height - 8)) + 'px';
  p.querySelector('button')?.focus();
}
ACTS.lk = b => {
  const a = argById(b.dataset.src),
    t = argById(b.dataset.tgt);
  closePop();
  if (!a || !t) return false;
  if (b.dataset.t === 'clash') {
    if (S.clashes.some(c => (c.a === a.id && c.b === t.id) || (c.a === t.id && c.b === a.id))) {
      toast('Esse confronto já existe');
      return false;
    }
    S.clashes.push({ id: uid(), a: a.id, b: t.id, cmp: '', win: '', why: '' });
    toast('Confronto criado: ' + code(a) + ' x ' + code(t));
  } else setLink(a, t.id, b.dataset.t, +b.dataset.s || 0);
  SEL = a.id;
};
ACTS.popx = () => {
  closePop();
  return false;
};
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('.pop')) closePop();
});
document.addEventListener('keydown', e => {
  const p = document.querySelector('.pop');
  if (!p) return;
  if (e.key === 'Escape') {
    closePop();
    e.stopImmediatePropagation();
  } else if (/^[1-9]$/.test(e.key)) {
    const k = [...p.querySelectorAll('kbd')].find(x => x.textContent === e.key);
    if (k) {
      e.preventDefault();
      e.stopImmediatePropagation();
      k.closest('button').click();
    }
  }
});
