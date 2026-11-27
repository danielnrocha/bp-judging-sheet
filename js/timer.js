/* ---------- timers ---------- */
let tRun = false,
  t0 = 0,
  acc = 0;
const LIM = 420;
const el = () => acc + (tRun ? (Date.now() - t0) / 1000 : 0);
const fmt = s => {
  s = Math.floor(s);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};
let dRun = false,
  d0 = 0,
  dAcc = 0;
const del = () => dAcc + (dRun ? (Date.now() - d0) / 1000 : 0);
function tick() {
  const s = el();
  $('#clock').textContent = fmt(s);
  $('#tfill').style.width = Math.min(100, (s / LIM) * 100) + '%';
  let z,
    col = 'var(--mut)';
  if (s < 60) z = 'Tempo protegido';
  else if (s < 360) {
    z = 'POIs liberados';
    col = 'var(--ok)';
  } else if (s < LIM) {
    z = 'Protegido, final';
    col = 'var(--warn)';
  } else if (s < LIM + 15) {
    z = 'Tolerância de 15s';
    col = 'var(--warn)';
  } else {
    z = 'Estourou o tempo';
    col = 'var(--bad)';
  }
  $('#zone').textContent = z;
  $('#zone').style.color = col;
  $('#tfill').style.background = col === 'var(--mut)' ? 'var(--ink)' : col;
  const d = del();
  $('#dclock').textContent = fmt(d);
  $('#dzone').textContent = d >= 1200 ? 'Tempo esgotado' : d >= 1020 ? 'Hora de votar' : '';
  $('#dzone').style.color = d >= 1020 ? 'var(--bad)' : '';
}
function resetT() {
  tRun = false;
  acc = 0;
  $('#tStart').textContent = 'Iniciar';
}
$('#tStart').onclick = () => {
  if (tRun) {
    acc = el();
    tRun = false;
    $('#tStart').textContent = 'Continuar';
  } else {
    t0 = Date.now();
    tRun = true;
    $('#tStart').textContent = 'Pausar';
  }
};
$('#tReset').onclick = resetT;
$('#tNext').onclick = () => {
  if (!S) return;
  S.cur = Math.min(7, S.cur + 1);
  $('#curSp').value = S.cur;
  resetT();
  save();
  if (route.v === 'ficha') {
    renderFlow();
    document.querySelector(`form.add[data-sp="${SP[S.cur].k}"] input`)?.focus();
  }
};
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
setInterval(tick, 250);
document.addEventListener('keydown', e => {
  if (e.target.closest('input,textarea,select,button') || route.v !== 'ficha') return;
  if (e.code === 'Space') {
    e.preventDefault();
    $('#tStart').click();
  }
  if (e.key === 'n') {
    const f = document.querySelector(`form.add[data-sp="${SP[S.cur].k}"] input`);
    if (f) {
      e.preventDefault();
      f.focus();
    }
  }
});
