/* ---------- routing ---------- */
const VIEWS = ['home', 'treinos', 'tour', 'ficha', 'delib', 'consultas', 'guia'];
async function router() {
  if (!user) return;
  const h = (location.hash || '#/').slice(1).split('/').filter(Boolean);
  let v = 'home',
    id = null;
  if (h[0] === 't') {
    v = 'tour';
    id = h[1];
  } else if (h[0] === 'd') {
    v = h[2] === 'delib' ? 'delib' : 'ficha';
    id = h[1];
  } else if (h[0] === 'treinos') v = 'treinos';
  else if (h[0] === 'consultas') v = 'consultas';
  else if (h[0] === 'guia') v = 'guia';
  if (saveT && route.v !== v && !['ficha', 'delib'].includes(v)) {
    clearTimeout(saveT);
    saveT = null;
    await push();
  }
  route = { v, id };
  VIEWS.forEach(x => ($('#v-' + x).hidden = x !== v));
  document
    .querySelectorAll('#mainTabs a')
    .forEach(a =>
      a.classList.toggle('on', a.dataset.v === v || (v === 'tour' && a.dataset.v === (route.tr ? 'treinos' : 'home')))
    );
  const inD = v === 'ficha' || v === 'delib';
  $('#dbar').hidden = !inD;
  if (inD) {
    if (!(await openDebate(id))) return;
    $('#backT').href = D.tournament_id ? '#/t/' + D.tournament_id : '#/';
    {
      let tt = TOURS.find(x => x.id === D.tournament_id);
      if (!tt && D.tournament_id) {
        const { data } = await sb.from('bp_tournaments').select('*').eq('id', D.tournament_id).single();
        tt = data;
        if (tt) TOURS.push(tt);
      }
      $('#backT').textContent = isTr(tt) ? '← Treino' : '← Torneio';
    }
    document.querySelectorAll('#dTabs a').forEach(a => {
      a.href = '#/d/' + id + (a.dataset.v === 'delib' ? '/delib' : '');
      a.classList.toggle('on', a.dataset.v === v);
    });
    renderSetup();
    if (v === 'ficha') renderFlow();
    else renderDelib();
    setSt(D.updated_at ? 'Salvo' : '');
  } else {
    D = null;
    S = null;
    if (v === 'home') renderHome();
    if (v === 'treinos') renderTreinos();
    if (v === 'tour') renderTour(id);
    if (v === 'consultas') renderConsultas();
  }
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', router);
