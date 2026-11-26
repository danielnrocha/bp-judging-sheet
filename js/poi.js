/* ---------- POIs (pontos de informação) ----------
 * Botão POI na barra de cima ou tecla P: abre um mini modal para o discurso atual, já com um cronômetro
 * do POI rodando. Só oradores do lado oposto podem fazer POI. Registra quem fez, o POI, a resposta,
 * como foi, e também POIs recusados (cada orador deve aceitar pelo menos um).
 */
const POIEV = { poi: 'POI levou', resp: 'Resposta levou', neu: 'Neutro' };
const POILONG = 15; // segundos: POI acima disso está longo
let POIT = null; // { t0, acc, run, iv }
const poiOffer = sp => SP.filter(x => side(x.t) !== side(spOf(sp).t));
const poiOf = sp => (S.pois || []).filter(p => p.sp === sp);
const poiName = k => {
  const x = spOf(k);
  return S.teams[x.t].sp[x.i] || SPN[k];
};
function poiElapsed() {
  return POIT ? POIT.acc + (POIT.run ? (Date.now() - POIT.t0) / 1000 : 0) : 0;
}
function poiTick() {
  const el = $('#poiClock');
  if (!el) return stopPoiTimer();
  const s = poiElapsed();
  el.textContent = fmt(s);
  el.classList.toggle('long', s >= POILONG);
  $('#poiZone').textContent = s >= POILONG ? 'POI longo: o orador pode cortar' : '';
}
function stopPoiTimer() {
  if (POIT) clearInterval(POIT.iv);
  POIT = null;
}
/* sp: discurso que recebe; id: POI existente (editar) */
function poiModal(sp, id) {
  if (!S) return;
  sp = sp || SP[S.cur].k;
  const P = id ? (S.pois || []).find(p => p.id === id) : null;
  const at = P ? P.at : Math.floor(el());
  const live = !P && sp === SP[S.cur].k;
  const out = live && TCFG.prot && (at < TCFG.prot || at > TCFG.len - TCFG.prot);
  const by = P?.by || '';
  const offer = poiOffer(sp);
  modal(`<div class="poim" data-poi="${P ? P.id : ''}" data-sp="${sp}" data-at="${at}">
<div class="row" style="justify-content:space-between"><h2 style="margin:0">POI em ${sp} <span class="small muted">${esc(poiName(sp))}${live || P ? ' · ' + fmt(at) + ' do discurso' : ''}</span></h2><button class="x" data-act="close" aria-label="Fechar">✕</button></div>
${out ? '<p class="err small" style="margin:6px 0 0">Fora da janela de POIs (tempo protegido).</p>' : ''}
<div class="row" style="margin:10px 0 4px"><span class="clock" id="poiClock">${fmt(P?.dur || 0)}</span><button class="sm" data-act="poit">${P ? 'Cronometrar' : 'Pausar'}</button><button class="sm" data-act="poi0">Zerar</button><span class="zone" id="poiZone"></span></div>
<label class="l">Quem fez</label><div class="chips">${offer
    .map(
      (x, i) =>
        `<button class="pick sm T${x.t} ${by === x.k ? 'on' : ''}" data-act="poiby" data-v="${x.k}"><kbd>${i + 1}</kbd> ${x.k}<span class="small"> ${esc(S.teams[x.t].sp[x.i])}</span></button>`
    )
    .join('')}</div>
<label class="l" for="poiQ">POI</label><textarea id="poiQ" rows="2" placeholder="O que foi perguntado ou afirmado">${esc(P?.q)}</textarea>
<label class="l" for="poiA">Resposta</label><textarea id="poiA" rows="2" placeholder="Como ${sp} respondeu">${esc(P?.a)}</textarea>
<label class="l">Como foi</label><div class="chips">${Object.entries(POIEV)
    .map(([k, v]) => `<button class="chip ${P?.ev === k ? 'on' : ''}" data-act="poiev" data-v="${k}">${v}</button>`)
    .join('')}</div>
<div class="row" style="margin-top:12px"><button class="pri" data-act="poisave">Salvar <kbd>Ctrl+Enter</kbd></button><button data-act="poidecl" title="Oferecido e recusado pelo orador">Recusado</button>${P ? '<span style="flex:1"></span><button data-act="poidel">Apagar</button>' : ''}</div></div>`);
  stopPoiTimer();
  POIT = { t0: Date.now(), acc: P?.dur || 0, run: !P, iv: setInterval(poiTick, 200) };
  poiTick();
  modal.onclose = stopPoiTimer;
  // foco no primeiro orador: 1-4 escolhem quem fez e levam o cursor para o campo do POI
  if (!P) setTimeout(() => poiBox()?.querySelector('[data-act=poiby]')?.focus(), 30);
}
const poiBox = () => $('#mbox .poim');
function poiSave(declined) {
  const box = poiBox();
  if (!box) return false;
  const by = box.querySelector('[data-act=poiby].on')?.dataset.v || '';
  if (!by) {
    toast('Escolha quem fez o POI');
    return false;
  }
  S.pois = S.pois || [];
  const id = box.dataset.poi;
  const ev = box.querySelector('[data-act=poiev].on')?.dataset.v || '';
  const row = {
    id: id || uid(),
    sp: box.dataset.sp,
    by,
    at: +box.dataset.at || 0,
    dur: declined ? 0 : Math.round(poiElapsed()),
    q: declined ? '' : $('#poiQ').value.trim(),
    a: declined ? '' : $('#poiA').value.trim(),
    ev: declined ? '' : ev,
    no: !!declined
  };
  const i = S.pois.findIndex(p => p.id === id);
  if (i >= 0) S.pois[i] = row;
  else S.pois.push(row);
  closeM();
  toast(declined ? 'POI recusado registrado' : 'POI registrado');
}
ACTS.poi = b => {
  poiModal(b.dataset.sp, b.dataset.v);
  return false;
};
ACTS.poiby = b => {
  poiBox()
    ?.querySelectorAll('[data-act=poiby]')
    .forEach(x => x.classList.toggle('on', x === b));
  $('#poiQ')?.focus();
  return false;
};
ACTS.poiev = b => {
  const on = b.classList.contains('on');
  poiBox()
    ?.querySelectorAll('[data-act=poiev]')
    .forEach(x => x.classList.remove('on'));
  if (!on) b.classList.add('on');
  return false;
};
ACTS.poit = b => {
  if (!POIT) return false;
  if (POIT.run) {
    POIT.acc = poiElapsed();
    POIT.run = false;
    b.textContent = 'Continuar';
  } else {
    POIT.t0 = Date.now();
    POIT.run = true;
    b.textContent = 'Pausar';
  }
  return false;
};
ACTS.poi0 = () => {
  if (POIT) {
    POIT.acc = 0;
    POIT.t0 = Date.now();
  }
  poiTick();
  return false;
};
ACTS.poisave = () => poiSave(false);
ACTS.poidecl = () => poiSave(true);
ACTS.poidel = () => {
  const id = poiBox()?.dataset.poi;
  const i = (S.pois || []).findIndex(p => p.id === id);
  if (i < 0) return false;
  const p = S.pois.splice(i, 1)[0];
  closeM();
  toast('POI apagado', () => {
    S.pois.splice(i, 0, p);
    save();
    renderFlow();
  });
};
/* teclado dentro do modal: 1-4 escolhe quem fez (fora dos campos), Ctrl+Enter salva */
document.addEventListener(
  'keydown',
  e => {
    const box = poiBox();
    if (!box || !$('#modal').classList.contains('on')) return;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      box.querySelector('[data-act=poisave]').click();
      return;
    }
    if (e.target.closest('textarea,input') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[1-4]$/.test(e.key)) {
      const b = box.querySelectorAll('[data-act=poiby]')[+e.key - 1];
      if (b) {
        e.preventDefault();
        e.stopImmediatePropagation();
        b.click();
      }
    }
  },
  true
);
/* linha de POIs dentro de cada discurso */
function poiLine(sp) {
  const L = poiOf(sp);
  const past = SP.findIndex(x => x.k === sp) < S.cur;
  const acc = L.filter(p => !p.no).length;
  const warn = past && !acc ? '<span class="badge w">nenhum POI aceito</span>' : '';
  if (!L.length && !warn) return '';
  return `<div class="pois">${warn}${L.map(
    p =>
      `<button class="poichip T${spOf(p.by).t} ${p.no ? 'no' : ''}" data-act="poi" data-sp="${sp}" data-v="${p.id}" title="${esc(p.q)}${p.a ? ' → ' + esc(p.a) : ''}"><span class="tc">${p.by}</span> ${p.no ? 'recusado' : fmt(p.at)}${p.ev === 'poi' ? ' ▲' : p.ev === 'resp' ? ' ▼' : ''}${p.q ? ' · ' + esc(p.q).slice(0, 32) : ''}</button>`
  ).join('')}</div>`;
}
$('#poiBtn').onclick = () => {
  if (route.v === 'ficha') poiModal();
};
