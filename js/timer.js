/* ---------- timers ----------
 * Cronômetro do discurso e da deliberação. Durações configuráveis (clique no relógio),
 * guardadas neste navegador e válidas para todos os debates.
 */
const TDEF = { len: 420, prot: 60, grace: 15, delib: 1200 };
let TCFG = { ...TDEF };
try {
  const x = JSON.parse(localStorage.getItem('bp.timer'));
  if (x && typeof x === 'object')
    for (const k of Object.keys(TDEF)) if (Number.isFinite(+x[k]) && +x[k] >= 0) TCFG[k] = +x[k];
} catch (e) {}
function saveTimerCfg() {
  try {
    localStorage.setItem('bp.timer', JSON.stringify(TCFG));
    BPS.mark('bp.timer');
  } catch (e) {}
  placeMarks();
}
let tRun = false,
  t0 = 0,
  acc = 0;
const el = () => acc + (tRun ? (Date.now() - t0) / 1000 : 0);
const fmt = s => {
  const neg = s < 0;
  s = Math.floor(Math.abs(s));
  return (neg ? '-' : '') + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};
let dRun = false,
  d0 = 0,
  dAcc = 0;
const del = () => dAcc + (dRun ? (Date.now() - d0) / 1000 : 0);
/* ajusta o tempo corrido do discurso (ex.: começou a cronometrar atrasado) */
function shiftT(sec) {
  const now = el();
  acc = Math.max(0, now + sec);
  if (tRun) t0 = Date.now();
  tick();
}
function placeMarks() {
  const b = document.querySelectorAll('.tbar b');
  const L = TCFG.len || 1;
  if (b[0]) b[0].style.left = Math.min(100, (TCFG.prot / L) * 100) + '%';
  if (b[1]) b[1].style.left = Math.max(0, ((L - TCFG.prot) / L) * 100) + '%';
}
function tick() {
  const s = el();
  const L = TCFG.len,
    P = TCFG.prot;
  $('#clock').textContent = fmt(s);
  $('#tfill').style.width = Math.min(100, (s / L) * 100) + '%';
  let z,
    col = 'var(--mut)';
  if (P && s < P) z = 'Tempo protegido';
  else if (s < L - P) {
    z = P ? 'POIs liberados' : 'Em andamento';
    col = 'var(--ok)';
  } else if (s < L) {
    z = 'Protegido, final';
    col = 'var(--warn)';
  } else if (s < L + TCFG.grace) {
    z = 'Tolerância';
    col = 'var(--warn)';
  } else {
    z = 'Estourou o tempo';
    col = 'var(--bad)';
  }
  $('#zone').textContent = z;
  $('#zone').style.color = col;
  $('#tfill').style.background = col === 'var(--mut)' ? 'var(--ink)' : col;
  const d = del();
  const vote = Math.max(0, TCFG.delib - 180);
  $('#dclock').textContent = fmt(d);
  $('#dzone').textContent = d >= TCFG.delib ? 'Tempo esgotado' : d >= vote ? 'Hora de votar' : '';
  $('#dzone').style.color = d >= vote ? 'var(--bad)' : '';
}
function resetT() {
  tRun = false;
  acc = 0;
  $('#tStart').textContent = 'Iniciar';
}
function toggleT() {
  if (tRun) {
    acc = el();
    tRun = false;
    $('#tStart').textContent = 'Continuar';
  } else {
    t0 = Date.now();
    tRun = true;
    $('#tStart').textContent = 'Pausar';
  }
}
function gotoSpeech(i) {
  if (!S) return;
  S.cur = Math.max(0, Math.min(7, i));
  $('#curSp').value = S.cur;
  resetT();
  save();
  if (route.v === 'ficha') {
    renderFlow();
    document.querySelector(`form.add[data-sp="${SP[S.cur].k}"] input`)?.focus();
  }
}
$('#tStart').onclick = toggleT;
$('#tReset').onclick = resetT;
$('#tNext').onclick = () => S && gotoSpeech(S.cur + 1);
$('#dStart').onclick = () => {
  if (dRun) {
    dAcc = del();
    dRun = false;
    $('#dStart').textContent = 'Continuar';
  } else {
    d0 = Date.now();
    dRun = true;
    $('#dStart').textContent = 'Pausar';
  }
};
$('#dReset').onclick = () => {
  dRun = false;
  dAcc = 0;
  $('#dStart').textContent = 'Iniciar';
};
const mm = s => +(s / 60).toFixed(2);
function timerModal() {
  const preset = (key, list) =>
    list
      .map(
        m =>
          `<button class="chip ${TCFG[key] === m * 60 ? 'on' : ''}" data-act="tcfg" data-k="${key}" data-v="${m * 60}">${m} min</button>`
      )
      .join('');
  modal(`<h2>Cronômetro</h2>
<label class="l">Duração do discurso</label><div class="chips">${preset('len', [7, 5, 4, 3])}<input id="tcLen" type="number" min="0.5" step="0.5" value="${mm(TCFG.len)}" aria-label="Duração em minutos" style="width:90px"> <span class="small muted">min</span></div>
<label class="l">Tempo protegido no início e no fim (POIs fora dele)</label><div class="chips">${[1, 0.5, 0]
    .map(
      m =>
        `<button class="chip ${TCFG.prot === m * 60 ? 'on' : ''}" data-act="tcfg" data-k="prot" data-v="${m * 60}">${m ? m * 60 + ' s' : 'Sem POIs'}</button>`
    )
    .join('')}</div>
<label class="l">Tolerância depois do tempo</label><div class="chips">${[15, 20, 30]
    .map(
      s =>
        `<button class="chip ${TCFG.grace === s ? 'on' : ''}" data-act="tcfg" data-k="grace" data-v="${s}">${s} s</button>`
    )
    .join('')}</div>
<label class="l">Ajustar o tempo corrido agora (${fmt(el())})</label><div class="chips">${[-30, -10, 10, 30]
    .map(s => `<button class="chip" data-act="tshift" data-v="${s}">${s > 0 ? '+' : '−'}${Math.abs(s)} s</button>`)
    .join('')}</div>
<label class="l">Deliberação</label><div class="chips">${preset('delib', [20, 15, 10])}</div>
<p class="small muted">Vale para todos os debates neste navegador. Atalhos: + e − ajustam 10 s.</p>
<div class="row" style="margin-top:8px"><button class="sm" data-act="tcfg" data-k="reset">Voltar ao padrão (BP: 7 min)</button><span style="flex:1"></span><button class="pri" data-act="close">Fechar</button></div>`);
  $('#tcLen').onchange = e => {
    const v = +e.target.value;
    if (v > 0) {
      TCFG.len = Math.round(v * 60);
      saveTimerCfg();
      timerModal();
    }
  };
}
$('#clock').onclick = timerModal;
$('#clock').title = 'Ajustar cronômetro';
$('#clock').setAttribute('role', 'button');
$('#clock').tabIndex = 0;
placeMarks();
setInterval(tick, 250);
ACTS.tcfg = b => {
  if (b.dataset.k === 'reset') TCFG = { ...TDEF };
  else TCFG[b.dataset.k] = +b.dataset.v;
  saveTimerCfg();
  timerModal();
  return false;
};
ACTS.tshift = b => {
  shiftT(+b.dataset.v);
  timerModal();
  return false;
};
