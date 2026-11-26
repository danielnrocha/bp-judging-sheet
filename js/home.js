/* ---------- home / tournament ---------- */
async function loadTours() {
  const { data, error } = await sb
    .from('bp_tournaments')
    .select('*')
    .order('starts_on', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) {
    toast('Erro ao carregar: ' + error.message);
    return [];
  }
  TOURS = data || [];
  return TOURS;
}
async function renderHome() {
  const el = $('#v-home');
  el.innerHTML = '<p class="muted">Carregando...</p>';
  await loadTours();
  const { data: cnt } = await sb.from('bp_debates').select('id,tournament_id,stage');
  const by = {};
  (cnt || []).forEach(d => {
    by[d.tournament_id] = (by[d.tournament_id] || 0) + 1;
  });
  el.innerHTML =
    backupBanner((cnt || []).length) +
    `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 style="margin:0">Torneios</h2><button class="pri" data-act="newT">Novo torneio</button></div>${
      TOURS.filter(t => !isTr(t)).length
        ? `<div class="cards">${TOURS.filter(t => !isTr(t))
            .map(
              t =>
                `<a class="tcard" href="#/t/${t.id}"><h3>${esc(t.name)}</h3><div class="small muted">${[t.location, fmtDates(t)].filter(Boolean).map(esc).join(' · ')}</div><div class="small" style="margin-top:6px">${by[t.id] || 0} debates</div></a>`
            )
            .join('')}</div>`
        : '<div class="panel"><p>Nenhum torneio ainda. Crie o primeiro e cadastre as rodadas conforme forem acontecendo.</p></div>'
    }`;
}
function backupBanner(n) {
  const fileWarn =
    location.protocol === 'file:'
      ? '<div class="panel" style="margin-bottom:12px;border-color:var(--bad)"><p class="small" style="margin:0"><b>Você abriu o arquivo direto do computador.</b> Assim o navegador pode não guardar suas anotações com segurança e o app não funciona sem internet. Use o endereço publicado do app.</p></div>'
      : '';
  return fileWarn + backupBanner2(n);
}
function backupBanner2(n) {
  if (MODE !== 'local') return '';
  let last = 0;
  try {
    last = +(localStorage.getItem('bp.lastExport') || 0);
  } catch (x) {}
  if (!n) return '';
  const days = last ? Math.floor((Date.now() - last) / 864e5) : null;
  if (days !== null && days < 7) return '';
  return `<div class="panel" style="margin-bottom:12px;border-color:var(--warn)"><p class="small" style="margin:0 0 8px"><b>Modo local: faça backup.</b> Seus debates estão só neste navegador. Limpar os dados do navegador, usar janela anônima ou (no Safari) ficar 7 dias sem abrir o app pode apagá-los.</p><div class="row"><a class="sm" href="#/consultas">Ir para Consultas e exportar o JSON</a><span class="small muted">${days === null ? 'Nenhum backup feito ainda.' : 'Último backup há ' + days + ' dias.'}</span></div></div>`;
}
async function renderTreinos() {
  const el = $('#v-treinos');
  el.innerHTML = '<p class="muted">Carregando...</p>';
  await loadTours();
  const { data: cnt } = await sb.from('bp_debates').select('id,tournament_id');
  const by = {};
  (cnt || []).forEach(d => {
    by[d.tournament_id] = (by[d.tournament_id] || 0) + 1;
  });
  const f = window._trf || '';
  const all = TOURS.filter(isTr),
    L = all.filter(t => !f || t.scope === f);
  el.innerHTML =
    backupBanner((cnt || []).length) +
    `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 style="margin:0">Treinos</h2><button class="pri" data-act="newTr">Novo treino</button></div>${all.length ? `<div class="chips" style="margin-bottom:12px"><button class="chip ${!f ? 'on' : ''}" data-act="trf" data-v="">Todos</button>${SCOPES.map(([k, v]) => `<button class="chip ${f === k ? 'on' : ''}" data-act="trf" data-v="${k}">${v} (${all.filter(t => t.scope === k).length})</button>`).join('')}</div>` : ''}${L.length ? `<div class="cards">${L.map(t => `<a class="tcard" href="#/t/${t.id}"><h3>${esc(t.name)}</h3><div class="small"><span class="badge ${t.scope === 'interno' ? '' : t.scope === 'parceria' ? 'g' : 'w'}">${SCN[t.scope] || ''}</span>${t.partner ? ' <span class="small">' + esc(t.partner) + '</span>' : ''}</div><div class="small muted" style="margin-top:4px">${[t.location, fmtDates(t)].filter(Boolean).map(esc).join(' · ')}</div><div class="small" style="margin-top:6px">${by[t.id] || 0} debates</div></a>`).join('')}</div>` : `<div class="panel"><p>${all.length ? 'Nenhum treino desse tipo.' : 'Nenhum treino ainda. Registre treinos internos da SD, em parceria com outras SDs ou externos.'}</p></div>`}`;
}
const fmtDates = t =>
  t.starts_on
    ? t.starts_on.split('-').reverse().join('/') +
      (t.ends_on && t.ends_on !== t.starts_on ? ' a ' + t.ends_on.split('-').reverse().join('/') : '')
    : '';
function trForm(t) {
  t = t || { kind: 'treino', scope: 'interno', starts_on: new Date().toISOString().slice(0, 10) };
  const sc = t.scope || 'interno';
  modal(
    `<h2>${t.id ? 'Editar treino' : 'Novo treino'}</h2><label class="l" for="fScope">Tipo</label><select id="fScope">${SCOPES.map(([k, v]) => `<option value="${k}" ${sc === k ? 'selected' : ''}>${v}</option>`).join('')}</select><div id="fPw" ${sc === 'interno' ? 'hidden' : ''}><label class="l" for="fP" id="fPl">${sc === 'externo' ? 'Quem organiza' : 'Sociedade parceira'}</label><input id="fP" value="${esc(t.partner)}" placeholder="${sc === 'externo' ? 'ex.: SDUFRJ, Liga, torneio-treino' : 'ex.: SDUSP'}"></div><label class="l" for="fName">Nome (opcional)</label><input id="fName" value="${esc(t.name)}" placeholder="ex.: Treino de quinta"><div class="row"><div style="flex:1 1 140px"><label class="l" for="fS">Data</label><input id="fS" type="date" value="${esc(t.starts_on)}"></div><div style="flex:1 1 140px"><label class="l" for="fL">Local</label><input id="fL" value="${esc(t.location)}"></div></div><label class="l" for="fN">Notas (formato, moções, quem participou)</label><textarea id="fN" rows="3">${esc(t.notes)}</textarea><div class="row" style="margin-top:12px"><button class="pri" data-act="saveT" data-kind="treino" data-id="${t.id || ''}">Salvar</button><button data-act="close">Cancelar</button>${t.id ? `<span style="flex:1"></span><button data-act="delT" data-id="${t.id}" data-kind="treino">Apagar treino</button>` : ''}</div>`
  );
  $('#fScope').onchange = () => {
    const v = $('#fScope').value;
    $('#fPw').hidden = v === 'interno';
    const T = x => (window.BP_T ? BP_T(x) : x);
    $('#fPl').textContent = T(v === 'externo' ? 'Quem organiza' : 'Sociedade parceira');
    $('#fP').placeholder = T(v === 'externo' ? 'ex.: SDUFRJ, Liga, torneio-treino' : 'ex.: SDUSP');
  };
}
function tourForm(t) {
  t = t || {};
  if (isTr(t)) return trForm(t);
  modal(
    `<h2>${t.id ? 'Editar torneio' : 'Novo torneio'}</h2><label class="l" for="fName">Nome</label><input id="fName" value="${esc(t.name)}"><div class="row"><div style="flex:1 1 140px"><label class="l" for="fS">Início</label><input id="fS" type="date" value="${esc(t.starts_on)}"></div><div style="flex:1 1 140px"><label class="l" for="fE">Fim</label><input id="fE" type="date" value="${esc(t.ends_on)}"></div></div><label class="l" for="fL">Local</label><input id="fL" value="${esc(t.location)}"><label class="l" for="fN">Notas (formato, CAP, regras específicas)</label><textarea id="fN" rows="3">${esc(t.notes)}</textarea><div class="row" style="margin-top:12px"><button class="pri" data-act="saveT" data-id="${t.id || ''}">Salvar</button><button data-act="close">Cancelar</button>${t.id ? `<span style="flex:1"></span><button data-act="delT" data-id="${t.id}">Apagar torneio</button>` : ''}</div>`
  );
  $('#fName').focus();
}
async function renderTour(id) {
  const el = $('#v-tour');
  el.innerHTML = '<p class="muted">Carregando...</p>';
  const [{ data: t }, { data: ds }] = await Promise.all([
    sb.from('bp_tournaments').select('*').eq('id', id).single(),
    sb.from('bp_debates').select('id,stage,round_no,label,motion,my_role,result,updated_at').eq('tournament_id', id)
  ]);
  if (!t) {
    el.innerHTML = '<p>Torneio não encontrado.</p>';
    return;
  }
  const tr = isTr(t);
  route.tr = tr;
  document
    .querySelectorAll('#mainTabs a')
    .forEach(a => a.classList.toggle('on', a.dataset.v === (tr ? 'treinos' : 'home')));
  const order = Object.fromEntries(STAGES.map(([k], i) => [k, i]));
  const L = (ds || []).sort((a, b) => order[a.stage] - order[b.stage] || (a.round_no || 0) - (b.round_no || 0));
  const nextR = Math.max(0, ...L.filter(d => d.stage === 'preliminar').map(d => d.round_no || 0)) + 1;
  el.innerHTML = `<div class="row" style="justify-content:space-between"><div>${tr ? '<a href="#/treinos" class="small">← Treinos</a>' : '<a href="#/" class="small">← Torneios</a>'}<h2 style="margin:4px 0 0">${esc(t.name)}</h2><div class="small muted">${[tr ? SCN[t.scope] || '' : '', tr ? t.partner : '', t.location, fmtDates(t)].filter(Boolean).map(esc).join(' · ')}</div></div><div class="row"><button class="sm" data-act="editT">Editar</button><button class="sm" data-act="importD">Importar ficha JSON</button></div></div>${t.notes ? `<p class="small" style="white-space:pre-wrap">${esc(t.notes)}</p>` : ''}
<div class="panel" style="margin-top:12px"><div class="row"><span class="small muted">Novo debate:</span>${
    tr
      ? `<button class="pri sm" data-act="newD" data-stage="preliminar" data-r="${nextR}">Debate ${nextR}</button><button class="sm" data-act="newD" data-stage="semi">Formato eliminatória (2 avançam)</button><button class="sm" data-act="newD" data-stage="final">Formato final (1 campeã)</button>`
      : `<button class="pri sm" data-act="newD" data-stage="preliminar" data-r="${nextR}">Rodada ${nextR}</button>${STAGES.slice(
          1
        )
          .map(([k, v]) => `<button class="sm" data-act="newD" data-stage="${k}">${v}</button>`)
          .join('')}`
  }</div></div>
${
  STAGES.map(([k, v]) => {
    const sub = L.filter(d => d.stage === k);
    return sub.length
      ? `<div class="stage"><h3>${tr ? (k === 'preliminar' ? 'Debates' : v) : v}</h3><div class="scroll"><table><thead><tr><th>${tr ? 'Debate' : 'Rodada'}</th><th>Moção</th><th>Papel</th><th>Resultado</th></tr></thead><tbody>${sub.map(d => `<tr class="click" data-open="${d.id}"><td class="n" style="text-align:left">${d.round_no ? (tr ? '#' : 'R') + d.round_no : ''} ${esc(d.label)}</td><td>${esc(d.motion) || '<span class="muted">sem moção</span>'}</td><td class="small">${ROLE[d.my_role] || ''}</td><td>${resLine(d.result)}</td></tr>`).join('')}</tbody></table></div></div>`
      : '';
  }).join('') || '<p class="muted" style="margin-top:14px">Nenhum debate ainda.</p>'
}`;
  el.dataset.tid = id;
  el._t = t;
}
function resLine(r) {
  r = cleanResult(r);
  if (!r || (!r.order && !r.advance)) return '<span class="muted small">em aberto</span>';
  let s = '';
  if (r.order) s = r.order.map((t, i) => `<span class="T${t}"><span class="tc">${i + 1}${t}</span></span>`).join(' ');
  else if (r.advance)
    s =
      (r.winner ? 'Campeã ' : 'Avançam ') +
      r.advance.map(t => `<span class="T${t}"><span class="tc">${t}</span></span>`).join(' ');
  else return '<span class="muted small">em aberto</span>';
  return (
    s +
    (r.split ? ' <span class="badge w">split</span>' : '') +
    (r.me_minority ? ' <span class="badge">você na minoria</span>' : '')
  );
}
async function newDebate(tid, stage, r, data) {
  const s = data ? migrate(data) : blankS(stage);
  if (!data) {
    s.stage = stage;
    s.round_no = r ? +r : null;
    s.speaksOn = stage === 'preliminar';
    const prev = lastPanel(tid);
    if (prev) s.panel = prev;
  }
  const { data: row, error } = await sb
    .from('bp_debates')
    .insert({
      tournament_id: tid,
      stage: s.stage,
      round_no: s.round_no,
      motion: s.motion,
      data: s,
      my_role: s.panel.me.role
    })
    .select('id')
    .single();
  if (error) {
    toast('Erro: ' + error.message);
    return;
  }
  location.hash = '#/d/' + row.id;
  setTimeout(() => {
    const b = $('#setupBox');
    if (b) b.open = true;
  }, 300);
}
let lastPanelCache = {};
function lastPanel(tid) {
  return lastPanelCache[tid] ? JSON.parse(JSON.stringify(lastPanelCache[tid])) : null;
}
async function openDebate(id) {
  if (D && D.id === id && S) return true;
  let data = null,
    error = null;
  try {
    ({ data, error } = await sb.from('bp_debates').select('*').eq('id', id).single());
  } catch (e) {
    error = e;
  }
  if ((error || !data) && MODE !== 'local') {
    try {
      const c = JSON.parse(localStorage.getItem('bp.cache.' + id)),
        m = JSON.parse(localStorage.getItem('bp.meta.' + id));
      if (c && m) {
        data = { ...m, data: c };
        pending = true;
        toast('Sem conexão: aberto com a cópia salva neste aparelho');
      }
    } catch (e) {}
  }
  if (!data) {
    toast('Debate não encontrado');
    location.hash = '#/';
    return false;
  }
  let s = migrate(data.data);
  try {
    const loc = JSON.parse(localStorage.getItem('bp.cache.' + id));
    if (loc && loc._t && (!s._t || loc._t > s._t)) {
      s = migrate(loc);
      setTimeout(push, 500);
    }
  } catch (e) {}
  D = data;
  S = s;
  lastPanelCache[data.tournament_id] = { me: { ...S.panel.me }, others: S.panel.others.map(o => ({ ...o })) };
  resetT();
  return true;
}
