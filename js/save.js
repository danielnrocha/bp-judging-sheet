/* ---------- saving ---------- */
let saveT = null,
  saving = false;
function setSt(t, c) {
  const e = $('#saveSt');
  if (e) {
    e.textContent = t;
    e.style.color = c || '';
  }
}
let pending = false,
  storeFail = false;
function save() {
  if (!D) return;
  S.args.forEach(syncTo);
  dropInc();
  S._t = Date.now();
  try {
    localStorage.setItem('bp.cache.' + D.id, JSON.stringify(S));
    localStorage.setItem(
      'bp.meta.' + D.id,
      JSON.stringify({ id: D.id, tournament_id: D.tournament_id, stage: S.stage, updated_at: D.updated_at })
    );
    BPS.mark('bp.cache.' + D.id, 'bp.meta.' + D.id);
    storeFail = false;
  } catch (e) {
    storeFail = true;
    setSt('NÃO SALVO: armazenamento do navegador cheio. Exporte agora.', 'var(--bad)');
    toast('NÃO SALVO: armazenamento do navegador cheio. Exporte agora.');
  }
  if (!storeFail) setSt('Salvando...', 'var(--mut)');
  pending = true;
  clearTimeout(saveT);
  saveT = setTimeout(push, 900);
}
let pushing = null,
  pushAgain = false;
async function push() {
  if (pushing) {
    pushAgain = true;
    return pushing;
  }
  pushing = pushNow().finally(() => {
    pushing = null;
    if (pushAgain) {
      pushAgain = false;
      push();
    }
  });
  return pushing;
}
async function pushNow() {
  if (!D) return;
  const res = computeResult();
  const row = {
    data: S,
    motion: S.motion,
    stage: S.stage,
    round_no: S.round_no || null,
    label: S.label || null,
    my_role: S.panel.me.role === 'off' ? null : S.panel.me.role,
    result: res
  };
  let error = null;
  try {
    ({ error } = await sb.from('bp_debates').update(row).eq('id', D.id));
  } catch (e) {
    error = e;
  }
  saveT = null;
  if (error) {
    if (MODE === 'local') {
      setSt('NÃO SALVO: ' + (error.message || 'erro'), 'var(--bad)');
      toast('NÃO SALVO: ' + (error.message || 'erro'));
    } else if (!storeFail) setSt('Sem conexão. Salvo neste aparelho; envio quando a internet voltar.', 'var(--warn)');
  } else {
    pending = false;
    if (!storeFail) setSt('Salvo', 'var(--ok)');
    Object.assign(D, row);
    if (MODE === 'local' && !saveT) {
      try {
        const ck = 'bp.cache.' + D.id;
        const c = JSON.parse(localStorage.getItem(ck));
        if (c && c._t === S._t) {
          localStorage.removeItem(ck);
          localStorage.removeItem('bp.meta.' + D.id);
          BPS.mark(ck, 'bp.meta.' + D.id);
        }
      } catch (x) {}
    }
  }
}
window.addEventListener('online', () => {
  if (pending && D) push();
});
window.addEventListener('storage', e => {
  if (!D || !S || e.key !== 'bp.cache.' + D.id || !e.newValue) return;
  let n;
  try {
    n = JSON.parse(e.newValue);
  } catch (x) {
    return;
  }
  if (!n || !(n._t > (S._t || 0))) return;
  S = migrate(n);
  const ae = document.activeElement;
  const typing = ae && ae.matches && ae.matches('input,textarea');
  if (!typing || ae.id !== 'motion') $('#motion').value = S.motion || '';
  if (!typing) {
    renderSetup();
    if (route.v === 'ficha') renderFlow();
    else if (route.v === 'delib') renderDelib();
  }
});
setInterval(() => {
  if (pending && D && !saveT && MODE !== 'local') push();
}, 20000);
window.addEventListener('beforeunload', e => {
  BPS.now();
  if (saveT) {
    clearTimeout(saveT);
    push();
  }
  if (storeFail || (pending && MODE !== 'local' && !navigator.onLine)) e.preventDefault();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && saveT) {
    clearTimeout(saveT);
    push();
  }
});
