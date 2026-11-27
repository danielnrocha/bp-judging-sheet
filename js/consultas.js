/* ---------- consultas ---------- */
let ALL = null;
async function loadAll() {
  const [{ data: ds }, { data: ts }] = await Promise.all([
    sb.from('bp_debates').select('*'),
    sb.from('bp_tournaments').select('*')
  ]);
  ALL = {
    ds: (ds || []).map(d => ({
      ...d,
      stage: cleanStage(d.stage),
      my_role: cleanRole(d.my_role),
      result: cleanResult(d.result),
      data: migrate(d.data)
    })),
    ts: ts || []
  };
  return ALL;
}
async function renderConsultas() {
  const el = $('#v-consultas');
  el.innerHTML = '<p class="muted">Carregando todos os debates...</p>';
  await loadAll();
  const f = window._cf || { t: '', s: '', r: '', q: '', k: '' };
  el.innerHTML = `<div class="row" style="justify-content:space-between"><h2 style="margin:0">Consultas</h2><div class="row"><button class="sm" data-act="exp" data-v="json">Exportar tudo (JSON)</button><button class="sm" id="impBtn">Importar JSON</button><button class="sm" data-act="exp" data-v="deb">CSV debates</button><button class="sm" data-act="exp" data-v="arg">CSV argumentos</button><button class="sm" data-act="exp" data-v="spk">CSV speaks</button></div></div>
<div class="panel" style="margin:12px 0"><div class="grid3" style="grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr))"><div><label class="l" for="qK">Evento</label><select id="qK" data-q="k"><option value="">Todos</option><option value="torneio" ${f.k === 'torneio' ? 'selected' : ''}>Torneios</option><option value="treino" ${f.k === 'treino' ? 'selected' : ''}>Treinos (todos)</option>${SCOPES.map(([k, v]) => `<option value="${k}" ${f.k === k ? 'selected' : ''}>Treino: ${v}</option>`).join('')}</select></div><div><label class="l" for="qT">Torneio ou treino</label><select id="qT" data-q="t"><option value="">Todos</option>${ALL.ts.map(t => `<option value="${t.id}" ${f.t === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div><div><label class="l" for="qS">Fase</label><select id="qS" data-q="s"><option value="">Todas</option>${STAGES.map(([k, v]) => `<option value="${k}" ${f.s === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div><div><label class="l" for="qR">Meu papel</label><select id="qR" data-q="r"><option value="">Qualquer</option>${['chair', 'wing', 'trainee'].map(k => `<option value="${k}" ${f.r === k ? 'selected' : ''}>${ROLE[k]}</option>`).join('')}</select></div><div><label class="l" for="qQ">Buscar (moção, equipe, argumento)</label><input id="qQ" data-q="q" value="${esc(f.q)}" placeholder="ex.: apostas, USP, vício"></div></div></div><div id="qOut"></div>`;
  runQuery();
}
function runQuery() {
  const f = window._cf || { t: '', s: '', r: '', q: '' };
  const q = (f.q || '').toLowerCase().trim();
  const tn = Object.fromEntries(ALL.ts.map(t => [t.id, t.name]));
  const tk = Object.fromEntries(ALL.ts.map(t => [t.id, t]));
  const evOk = d => {
    const t = tk[d.tournament_id];
    if (!f.k) return true;
    if (f.k === 'torneio') return !isTr(t);
    if (f.k === 'treino') return isTr(t);
    return isTr(t) && t.scope === f.k;
  };
  let L = ALL.ds.filter(
    d => evOk(d) && (!f.t || d.tournament_id === f.t) && (!f.s || d.stage === f.s) && (!f.r || d.my_role === f.r)
  );
  const argHits = [];
  if (q) {
    L = L.filter(d => {
      const s = d.data;
      const hay = [d.motion, s.info, ...TEAMS.map(t => s.teams[t].name + ' ' + s.teams[t].sp.join(' '))]
        .join(' ')
        .toLowerCase();
      const ah = s.args.filter(a =>
        (a.title + ' ' + a.why + ' ' + a.imp + ' ' + (a.note || '')).toLowerCase().includes(q)
      );
      ah.forEach(a => argHits.push({ d, a }));
      return hay.includes(q) || ah.length;
    });
  }
  const pre = L.filter(d => d.result?.order);
  const bench = TEAMS.map(t => {
    const p = pre.map(d => d.result.order.indexOf(t) + 1);
    return { t, avg: p.length ? p.reduce((a, b) => a + b, 0) / p.length : null, first: p.filter(x => x === 1).length };
  });
  const spk = [];
  L.forEach(d => Object.entries(d.result?.speaks || {}).forEach(([k, v]) => spk.push({ k, v: +v })));
  const avgSpk = spk.length ? (spk.reduce((a, b) => a + b.v, 0) / spk.length).toFixed(1) : '-';
  const bySp = SP.map(x => {
    const v = spk.filter(s => s.k === x.k).map(s => s.v);
    return { k: x.k, t: x.t, avg: v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '-' };
  });
  const decided = L.filter(d => d.result && (d.result.order || d.result.advance));
  $('#qOut').innerHTML =
    `<div class="kpis"><div class="kpi"><b>${L.length}</b>debates</div><div class="kpi"><b>${decided.filter(d => d.result.split).length}</b>com split</div><div class="kpi"><b>${decided.filter(d => d.result.me_minority).length}</b>você na minoria</div><div class="kpi"><b>${L.filter(d => d.my_role === 'chair').length}</b>como chair</div><div class="kpi"><b>${L.reduce((s, d) => s + d.data.args.length, 0)}</b>argumentos anotados</div><div class="kpi"><b>${avgSpk}</b>speak médio dado</div></div>
<div class="grid2" style="margin-top:12px"><div class="panel"><h3>Posição média por bancada (preliminares)</h3><div class="scroll"><table><thead><tr><th>Bancada</th><th class="n">Posição média</th><th class="n">1º lugares</th></tr></thead><tbody>${bench.map(b => `<tr class="T${b.t}"><td><span class="tc">${b.t}</span></td><td class="n">${b.avg ? b.avg.toFixed(2) : '-'}</td><td class="n">${b.first}</td></tr>`).join('')}</tbody></table></div><p class="small muted">${pre.length} debates com resultado completo.</p></div>
<div class="panel"><h3>Speak médio por posição</h3><div class="scroll"><table><tbody>${bySp.map(b => `<tr class="T${b.t}"><td><span class="tc">${b.k}</span></td><td class="n">${b.avg}</td></tr>`).join('')}</tbody></table></div></div></div>
<div class="panel" style="margin-top:12px"><h3>Debates</h3><div class="scroll"><table><thead><tr><th>Torneio ou treino</th><th>Fase</th><th>Moção</th><th>Papel</th><th>Resultado</th></tr></thead><tbody>${
      L.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
        .map(
          d =>
            `<tr class="click" data-open="${d.id}"><td>${esc(tn[d.tournament_id] || '-')}</td><td class="small">${STN[d.stage]}${d.round_no ? ' R' + d.round_no : ''}</td><td>${esc(d.motion)}</td><td class="small">${ROLE[d.my_role] || ''}</td><td>${resLine(d.result)}</td></tr>`
        )
        .join('') || '<tr><td colspan="5" class="muted">Nada encontrado.</td></tr>'
    }</tbody></table></div></div>
${q ? `<div class="panel" style="margin-top:12px"><h3>Argumentos que batem com "${esc(f.q)}"</h3>${argHits.length ? argHits.map(({ d, a }) => `<div class="ev T${spOf(a.sp).t}" style="cursor:pointer" data-open="${d.id}"><span class="tc">${a.sp}</span> ${esc(a.title)} <span class="small muted">· ${esc(d.motion)} · ${QUAL[a.q] || 'sem nota'} · ${RES[a.res] || 'sem veredito'}</span></div>`).join('') : '<p class="muted small">Nenhum.</p>'}</div>` : ''}`;
}
function csv(rows) {
  return rows
    .map(r =>
      r
        .map(v => {
          v = v == null ? '' : String(v);
          if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
          return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
        })
        .join(',')
    )
    .join('\n');
}
function download(name, text, type) {
  const b = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}
function exportAll(kind) {
  try {
    localStorage.setItem('bp.lastExport', String(Date.now()));
    BPS.mark('bp.lastExport');
  } catch (x) {}
  const tn = Object.fromEntries(ALL.ts.map(t => [t.id, t.name]));
  const day = new Date().toISOString().slice(0, 10);
  if (kind === 'json')
    return download(
      `ficha-bp-${day}.json`,
      JSON.stringify({ exported_at: new Date().toISOString(), tournaments: ALL.ts, debates: ALL.ds }, null, 1),
      'application/json'
    );
  if (kind === 'deb')
    return download(
      `debates-${day}.csv`,
      csv(
        [
          [
            'torneio',
            'evento',
            'tipo_treino',
            'parceiro',
            'fase',
            'rodada',
            'label',
            'mocao',
            'meu_papel',
            'OG',
            'OO',
            'CG',
            'CO',
            'ordem_final',
            'avancam',
            'campea',
            'split',
            'eu_minoria',
            'n_argumentos',
            'atualizado'
          ]
        ].concat(
          ALL.ds.map(d => {
            const r = d.result || {};
            const tt = ALL.ts.find(x => x.id === d.tournament_id) || {};
            return [
              tn[d.tournament_id],
              isTr(tt) ? 'treino' : 'torneio',
              isTr(tt) ? tt.scope : '',
              isTr(tt) ? tt.partner || '' : '',
              d.stage,
              d.round_no,
              d.label,
              d.motion,
              d.my_role,
              ...TEAMS.map(t => d.data.teams[t].name),
              (r.order || []).join('>'),
              (r.advance || []).join('+'),
              r.winner,
              r.split,
              r.me_minority,
              d.data.args.length,
              d.updated_at
            ];
          })
        )
      ),
      'text/csv'
    );
  if (kind === 'arg') {
    const keep = S;
    try {
      return download(
        `argumentos-${day}.csv`,
        csv(
          [
            [
              'torneio',
              'fase',
              'rodada',
              'mocao',
              'discurso',
              'equipe',
              'argumento',
              'mecanismo',
              'impacto',
              'qualidade',
              'tipo',
              'veredito',
              'responde_a',
              'nota'
            ]
          ].concat(
            ALL.ds.flatMap(d => {
              const s = d.data;
              S = s;
              return s.args.map(a => [
                tn[d.tournament_id],
                d.stage,
                d.round_no,
                d.motion,
                a.sp,
                teamOf(a),
                a.title,
                a.why,
                a.imp,
                QUAL[a.q],
                KIND[a.kind],
                RES[a.res],
                a.to
                  .map(id => {
                    const x = s.args.find(y => y.id === id);
                    return x ? code(x) : '';
                  })
                  .join(' '),
                a.note
              ]);
            })
          )
        ),
        'text/csv'
      );
    } finally {
      S = keep;
    }
  }
  if (kind === 'spk')
    return download(
      `speaks-${day}.csv`,
      csv(
        [['torneio', 'fase', 'rodada', 'mocao', 'discurso', 'equipe', 'orador', 'final']].concat(
          ALL.ds.flatMap(d =>
            Object.entries(d.result?.speaks || {}).map(([k, v]) => [
              tn[d.tournament_id],
              d.stage,
              d.round_no,
              d.motion,
              k,
              spOf(k).t,
              d.data.teams[spOf(k).t].sp[spOf(k).i],
              v
            ])
          )
        )
      ),
      'text/csv'
    );
}
