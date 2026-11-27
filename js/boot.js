/* ---------- auth ---------- */
$('#gLogin').onclick = () =>
  sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
$('#mForm').onsubmit = async e => {
  e.preventDefault();
  const { error } = await sb.auth.signInWithOtp({
    email: $('#mEmail').value.trim(),
    options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: false }
  });
  $('#lMsg').textContent = error
    ? 'Não foi possível enviar: ' + error.message
    : 'Link enviado. Abra o e-mail neste aparelho.';
};
$('#logout').onclick = async () => {
  await sb.auth.signOut();
  location.hash = '';
  location.reload();
};
function setUser(u) {
  user = u;
  $('#v-login').hidden = !!u;
  $('#hdr').hidden = !u;
  $('#app').hidden = !u;
  if (u) {
    $('#who').textContent = u.email || '';
    router();
  }
}
function storeModal() {
  const cur =
    MODE === 'supabase'
      ? `Conectado ao Supabase <code>${esc(CFG.supabaseUrl)}</code>.`
      : 'Modo local: os dados ficam só neste navegador. Exporte o JSON de vez em quando como backup.';
  modal(
    `<h2>Armazenamento</h2><p class="small">${cur}</p><h3>Usar o seu próprio Supabase</h3><p class="small muted">Rode o arquivo <code>supabase/schema.sql</code> no seu projeto e cole aqui a URL e a chave publishable (ou anon). Os detalhes estão no README do projeto.</p><label class="l" for="cfU">URL do projeto</label><input id="cfU" placeholder="https://xxxx.supabase.co" value="${esc(CFG ? CFG.supabaseUrl : '')}"><label class="l" for="cfK">Chave publishable ou anon</label><input id="cfK" placeholder="sb_publishable_..." value="${esc(CFG ? CFG.supabaseKey : '')}"><p class="small muted">Nunca cole a chave secret ou service_role.</p><div class="row" style="margin-top:12px"><button class="pri" id="cfSave">Conectar</button><button id="cfLocal">Usar modo local</button><button id="cfCancel">Fechar</button></div><p id="cfMsg" class="small"></p>`
  );
  $('#cfCancel').onclick = closeM;
  $('#cfLocal').onclick = () => {
    try {
      localStorage.removeItem('bp.config');
      BPS.mark('bp.config');
      BPS.now();
    } catch (e) {}
    location.hash = '';
    location.reload();
  };
  $('#cfSave').onclick = () => {
    const u = $('#cfU').value.trim().replace(/\/+$/, ''),
      k = $('#cfK').value.trim();
    if (!/^https:\/\/.+/.test(u) || !k) {
      $('#cfMsg').textContent = 'Preencha a URL (https://...) e a chave.';
      return;
    }
    if (/service_role|^sb_secret_/.test(k)) {
      $('#cfMsg').textContent = 'Essa é uma chave secreta. Use a publishable ou anon.';
      return;
    }
    localStorage.setItem('bp.config', JSON.stringify({ supabaseUrl: u, supabaseKey: k }));
    BPS.mark('bp.config');
    BPS.now();
    location.hash = '';
    location.reload();
  };
}
async function importJSON(file) {
  let j;
  try {
    j = JSON.parse(await file.text());
  } catch (e) {
    toast('Arquivo inválido');
    return;
  }
  if (!j || !Array.isArray(j.debates)) {
    toast('Esse JSON não veio do Exportar tudo');
    return;
  }
  const map = {};
  let nt = 0,
    nd = 0;
  for (const t of j.tournaments || []) {
    const { data, error } = await sb
      .from('bp_tournaments')
      .insert({
        name: String(t.name || 'Sem nome').slice(0, 300),
        starts_on: /^\d{4}-\d{2}-\d{2}$/.test(t.starts_on || '') ? t.starts_on : null,
        ends_on: /^\d{4}-\d{2}-\d{2}$/.test(t.ends_on || '') ? t.ends_on : null,
        location: t.location ? String(t.location).slice(0, 300) : null,
        notes: t.notes ? String(t.notes).slice(0, 5000) : null,
        ...(t.kind === 'treino'
          ? {
              kind: 'treino',
              scope: SCN[t.scope] ? t.scope : 'interno',
              partner: t.partner ? String(t.partner).slice(0, 300) : null
            }
          : { kind: 'torneio' })
      })
      .select('id')
      .single();
    if (error) {
      toast('Erro: ' + error.message);
      return;
    }
    map[t.id] = data.id;
    nt++;
  }
  for (const d of j.debates) {
    const { error } = await sb
      .from('bp_debates')
      .insert({
        tournament_id: d.tournament_id ? map[d.tournament_id] || null : null,
        stage: cleanStage(d.stage),
        round_no: Number.isInteger(d.round_no) ? d.round_no : null,
        label: d.label ? String(d.label).slice(0, 300) : null,
        motion: d.motion ? String(d.motion).slice(0, 2000) : null,
        my_role: cleanRole(d.my_role),
        data: migrate(d.data || {}),
        result: cleanResult(d.result)
      })
      .select('id')
      .single();
    if (error) {
      toast('Erro: ' + error.message);
      return;
    }
    nd++;
  }
  ALL = null;
  TOURS = [];
  toast(`Importados ${nt} torneios e ${nd} debates`);
  location.hash = '#/';
  router();
}
document.querySelectorAll('.themeBtn').forEach(b => (b.onclick = () => window.BP_THEME && BP_THEME.toggle()));
window.BP_THEME && BP_THEME.apply();
for (const id of ['#langSel', '#langSel2']) {
  const e = $(id);
  if (!e) continue;
  e.value = window.BP_LANG || 'pt';
  e.onchange = async () => {
    try {
      localStorage.setItem('bp.lang', e.value);
      BPS.mark('bp.lang');
      await BPS.flush();
    } catch (x) {}
    location.reload();
  };
}
$('#stBtn').onclick = storeModal;
$('#lStore').onclick = e => {
  e.preventDefault();
  storeModal();
};
document.addEventListener('click', e => {
  if (e.target.id !== 'impBtn') return;
  const i = document.createElement('input');
  i.type = 'file';
  i.accept = 'application/json,.json';
  i.onchange = () => {
    if (i.files[0]) importJSON(i.files[0]);
  };
  i.click();
});
if (MODE === 'local') {
  $('#logout').hidden = true;
}
sb.auth.onAuthStateChange((ev, session) => {
  BP_READY.then(go => {
    if (!go) return;
    const u = session?.user || null;
    if (u?.id !== user?.id) setUser(u);
  });
});
BP_READY.then(go => {
  if (go) sb.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
});
window.__bp = {
  get S() {
    return S;
  },
  panelResult,
  advResult,
  computeResult,
  migrate,
  blankS
};
/* Se algum módulo não carregou (rede instável no primeiro acesso), avisa em vez de falhar em silêncio. */
{
  const need = [
    'renderFlow',
    'renderDelib',
    'toggleT',
    'renderIdeas',
    'renderAxesBar',
    'linkMenu',
    'teamModal',
    'parseQuick',
    'renderTabSetup'
  ];
  const miss = need.filter(n => typeof window[n] !== 'function');
  if (miss.length) {
    const d = document.createElement('div');
    d.className = 'loadfail';
    d.setAttribute('role', 'alert');
    d.innerHTML =
      '<b>Parte do app não carregou.</b> Recarregue a página. Suas anotações estão salvas neste aparelho. <button class="sm">Recarregar</button>';
    d.querySelector('button').onclick = () => location.reload();
    document.body.prepend(d);
  }
}
