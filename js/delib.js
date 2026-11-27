/* ---------- deliberation ---------- */
function evidence(a, b) {
  const L = [];
  S.clashes.forEach(c => {
    const A = S.args.find(x => x.id === c.a),
      B = S.args.find(x => x.id === c.b);
    if (!A || !B) return;
    const ts = [teamOf(A), teamOf(B)];
    if (ts.includes(a) && ts.includes(b)) {
      const w = c.win === 'a' ? teamOf(A) : c.win === 'b' ? teamOf(B) : c.win === 'e' ? 'empate' : 'sem veredito';
      L.push(
        `<div class="ev">Confronto ${code(A)} x ${code(B)}: <b>${w}</b>${c.cmp ? ' · ' + CMP[c.cmp].toLowerCase() : ''}${c.why ? '. ' + esc(c.why) : ''}</div>`
      );
    }
  });
  S.args.forEach(x => {
    const tx = teamOf(x);
    if (tx !== a && tx !== b) return;
    x.links.forEach(l => {
      const y = argById(l.id);
      if (!y) return;
      const ty = teamOf(y);
      if ((tx === a && ty === b) || (tx === b && ty === a))
        L.push(
          `<div class="ev">${code(x)} ${linkLabel(l)} ${code(y)} (${esc(y.title).slice(0, 40)}): alvo ${status(y) === 'flip' ? 'flipado' : RES[y.res]?.toLowerCase() || 'sem veredito'}</div>`
        );
    });
  });
  L.push(axesEvidence(a, b));
  const sa = stats(a),
    sbb = stats(b);
  L.push(
    `<div class="ev small muted">${a}: ${sa.n} ideias, ${sa.f} fortes, ${sa.cai} caíram · ${b}: ${sbb.n} ideias, ${sbb.f} fortes, ${sbb.cai} caíram</div>`
  );
  return L.join('');
}
const posSel = attr =>
  TEAMS.map(
    t =>
      `<label class="small T${t}"><span class="tc">${t}</span> <select ${attr} data-t="${t}" style="width:auto;padding:3px 6px">${['', '1º', '2º', '3º', '4º'].map((v, i) => `<option value="${i || ''}">${v || '-'}</option>`).join('')}</select></label>`
  ).join('');
function renderMyPairs() {
  $('#myPairs').innerHTML = PAIRS.map(([a, b]) => {
    const k = pk(a, b),
      p = S.my[k];
    return `<div class="pair"><div class="ph"><button class="pick T${a} ${p.w === a ? 'on' : ''}" data-act="my" data-k="${k}" data-v="${a}">${a}</button><span class="vs">x</span><button class="pick T${b} ${p.w === b ? 'on' : ''}" data-act="my" data-k="${k}" data-v="${b}">${b}</button><span style="flex:1"></span>${['clara', 'apertada'].map(c => `<button class="chip ${p.c === c ? 'on' : ''}" data-act="conf" data-k="${k}" data-v="${c}">${c === 'clara' ? 'Clara' : 'Apertada'}</button>`).join('')}</div><div class="hint">${HINT[k]}</div>${evidence(a, b)}<textarea data-my="${k}" rows="2" placeholder="Por que ${p.w || 'essa equipe'} leva esta comparação">${esc(p.why)}</textarea></div>`;
  }).join('');
  $('#myQuick').innerHTML =
    posSel('data-qpos="my"') + `<button class="sm" data-act="quick" data-who="my">Gerar</button>`;
}
const rankHTML = o =>
  `<div class="rank">${o.map((t, i) => `<div class="T${t}"><span class="pos">${i + 1}º</span> <span class="tc">${t}</span><div class="small muted">${esc(S.teams[t].name)}</div></div>`).join('')}</div>`;
const advHTML = (adv, lbl) =>
  `<div class="rank">${TEAMS.map(t => `<div class="T${t}" style="${adv.includes(t) ? '' : 'opacity:.45'}"><span class="tc">${t}</span> ${adv.includes(t) ? `<b>${lbl}</b>` : '<span class="small">eliminada</span>'}<div class="small muted">${esc(S.teams[t].name)}</div></div>`).join('')}</div>`;
function renderMyRank() {
  const r = rankFrom(S.my);
  $('#myRank').innerHTML = r.miss
    ? `<p class="muted small">Faltam ${r.miss} comparações.</p>`
    : r.ok
      ? rankHTML(r.order)
      : `<p class="err">Suas comparações formam um ciclo. Reveja uma delas antes de ir ao painel.</p>`;
}
function advPicker(list, who) {
  const n = need();
  return `<div class="row">${TEAMS.map(t => `<button class="pick T${t} ${list.includes(t) ? 'on' : ''}" data-act="adv" data-who="${who}" data-v="${t}">${t}</button>`).join('')}<span class="small muted">${list.length}/${n} ${n === 1 ? 'campeã' : 'avançam'}</span></div>`;
}
function renderAdvBox() {
  if (!isOut()) {
    $('#advBox').innerHTML = '';
    return;
  }
  const r = rankFrom(S.my);
  $('#advBox').innerHTML =
    `<div class="panel" style="margin-top:12px"><h3>${S.stage === 'final' ? 'Quem é campeã' : 'Quem avança'} no meu voto</h3><p class="hint">Escolha ${need() === 1 ? 'a equipe vencedora' : 'as 2 equipes que avançam'}.${r.ok && !S.myAdv.length ? ' Dica: pelo seu ranking seriam ' + r.order.slice(0, need()).join(' e ') + '.' : ''}</p>${advPicker(S.myAdv, 'me')}</div>`;
}
function renderWings() {
  const J = judges().filter(j => j.id !== 'me');
  $('#wingsBox').innerHTML = J.length
    ? J.map(j => {
        const i = j.idx,
          P = S.wv[i];
        const r = rankFrom(P);
        return `<div class="panel"><div class="row" style="justify-content:space-between"><h3>${esc(j.name)}</h3><span class="badge ${j.role === 'trainee' ? 'w' : ''}">${ROLE[j.role]}</span></div>
${isOut() ? `<p class="small muted" style="margin:8px 0 4px">${S.stage === 'final' ? 'Campeã' : 'Avançam'} no voto dele</p>${advPicker(S.wadv[i], 'o' + i)}<p class="small muted" style="margin:10px 0 0">Comparativas dele (opcional)</p>` : ''}
<div class="row" style="margin:8px 0">${posSel(`data-wpos="${i}"`)}<button class="sm" data-act="quick" data-who="${i}">Gerar</button></div>
${PAIRS.map(([a, b]) => {
  const k = pk(a, b),
    p = P[k] || {};
  const dis = p.w && S.my[k].w && p.w !== S.my[k].w;
  return `<div style="border-top:1px solid var(--line);padding:6px 0"><div class="row"><button class="pick sm T${a} ${p.w === a ? 'on' : ''}" data-act="wv" data-i="${i}" data-k="${k}" data-v="${a}">${a}</button><span class="vs">x</span><button class="pick sm T${b} ${p.w === b ? 'on' : ''}" data-act="wv" data-i="${i}" data-k="${k}" data-v="${b}">${b}</button>${dis ? '<span class="badge w">diverge de você</span>' : ''}</div><input data-wwhy="${i}" data-k="${k}" value="${esc(p.why)}" placeholder="Raciocínio dele" aria-label="Raciocínio dele" style="margin-top:4px"></div>`;
}).join('')}
<div style="margin-top:8px">${r.miss ? `<span class="small muted">Faltam ${r.miss} votos.</span>` : r.ok ? rankHTML(r.order) : '<span class="err">Votos dele formam um ciclo.</span>'}</div></div>`;
      }).join('')
    : '<p class="muted">Painel só com você. Adicione juízes em Debate, Preparação.</p>';
}
function renderPanelPrelim() {
  const R = panelResult();
  const V = judges();
  let h =
    `<div class="scroll"><table><thead><tr><th>Comparação</th>${V.map(v => `<th>${esc(v.name)}${v.chair ? ' (chair)' : v.vote ? '' : ' (trainee)'}</th>`).join('')}<th class="n">Placar</th><th>Resultado</th></tr></thead><tbody>` +
    R.rows
      .map(
        r =>
          `<tr><td><span class="T${r.a}"><span class="tc">${r.a}</span></span> x <span class="T${r.b}"><span class="tc">${r.b}</span></span></td>${V.map(
            v => {
              const w = v.pairs[r.k]?.w;
              return `<td class="T${w || 'x'}" style="${v.vote ? '' : 'opacity:.55'}">${w ? `<span class="tc">${w}</span>` : '<span class="muted">-</span>'}</td>`;
            }
          ).join(
            ''
          )}<td class="n">${r.va.length}-${r.vb.length}</td><td>${r.win ? `<span class="T${r.win}"><span class="tc">${r.win}</span></span> ${r.unan ? '<span class="badge g">unânime</span>' : r.tb ? '<span class="badge w">empate, chair decide</span>' : `<span class="badge w">split ${Math.max(r.va.length, r.vb.length)}-${Math.min(r.va.length, r.vb.length)}</span>`}` : '<span class="muted">aguardando</span>'}</td></tr>`
      )
      .join('') +
    `</tbody></table></div>`;
  if (!judges().some(j => j.chair))
    h += `<p class="err small">Ninguém está marcado como chair. O desempate usa o seu voto até você definir.</p>`;
  if (R.incomplete)
    h += `<p class="muted small">Faltam votos. ${R.rows
      .filter(r => r.missing.length)
      .map(r => r.k + ': ' + r.missing.map(esc).join(', '))
      .join(' · ')}</p>`;
  else {
    const spl = R.rows.filter(r => !r.unan);
    h += `<p style="margin:12px 0 6px"><b>${spl.length ? 'Decisão com split' : 'Decisão unânime'}</b>${spl.length ? '. Vote cada par contestado, sem transitividade.' : ''}</p>`;
    if (R.cyclic)
      h += `<p class="err">Empate cíclico, resolvido por Ranked Pairs. Nas margens iguais a ordem é da chair (use Subir).</p><div class="scroll"><table><thead><tr><th>#</th><th>Par</th><th class="n">Margem</th><th>Ação</th><th></th></tr></thead><tbody>${R.steps.map((s, i) => `<tr><td class="n">${i + 1}</td><td>${s.r.win} &gt; ${s.r.lose}</td><td class="n">${s.r.margin}</td><td>${s.lock ? 'Travado' : '<span class="err">Pulado, criaria ciclo</span>'}</td><td>${i > 0 && R.steps[i - 1].r.margin === s.r.margin ? `<button class="sm" data-act="tieUp" data-k="${s.r.k}">Subir</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
    h += `<div style="margin-top:10px">${rankHTML(R.order)}</div>`;
  }
  $('#panelRes').innerHTML = h;
  return R;
}
function renderPanelOut() {
  const R = advResult();
  const V = judges();
  const lbl = S.stage === 'final' ? 'campeã' : 'avança';
  let h = `<div class="scroll"><table><thead><tr><th>Equipe</th>${V.map(v => `<th>${esc(v.name)}${v.chair ? ' (chair)' : v.vote ? '' : ' (trainee)'}</th>`).join('')}<th class="n">Votos</th></tr></thead><tbody>${TEAMS.map(t => `<tr class="T${t}"><td><span class="tc">${t}</span> <span class="small muted">${esc(S.teams[t].name)}</span></td>${V.map(v => `<td style="${v.vote ? '' : 'opacity:.55'}">${(v.adv || []).includes(t) ? '✓' : ''}</td>`).join('')}<td class="n">${R.cnt[t]}</td></tr>`).join('')}</tbody></table></div>`;
  if (R.incomplete) h += `<p class="muted small">Faltam votos de: ${R.missing.map(esc).join(', ')}.</p>`;
  else if (!R.adv)
    h += `<p class="err">Empate na linha de corte entre ${R.tied.join(', ')}. A chair escolhe ${R.slots}:</p><div class="row">${R.tied.map(t => `<button class="pick T${t} ${S.advTie.includes(t) ? 'on' : ''}" data-act="advTie" data-v="${t}">${t}</button>`).join('')}</div>`;
  else
    h += `<p style="margin:12px 0 6px"><b>${R.unan ? 'Decisão unânime' : 'Decisão com split'}</b>${R.how === 'chair' ? ' · empate decidido pelo voto da chair' : R.how === 'manual' ? ' · empate decidido pela chair' : ''}</p>${advHTML(R.adv, lbl)}`;
  $('#panelRes').innerHTML = h;
  return R;
}
function band(n) {
  const b = SCALE.find(([lo, hi]) => n >= lo && n <= hi);
  return b ? b[0] + '-' + b[1] + ': ' + b[2] : '';
}
function renderSpeaks() {
  $('#speakSec').hidden = !S.speaksOn;
  if (!S.speaksOn) return;
  const V = judges();
  $('#speaks').innerHTML =
    `<table><thead><tr><th>Orador</th>${V.map(v => `<th class="n">${esc(v.name)}</th>`).join('')}<th class="n">Final</th><th>Faixa</th></tr></thead><tbody>${SP.map(x => `<tr class="T${x.t}"><td><span class="tc">${x.k}</span> <span class="small muted">${esc(S.teams[x.t].sp[x.i])}</span></td>${V.map(v => `<td class="n"><input type="number" min="50" max="100" data-spk="${v.id}" data-k="${x.k}" value="${esc(S.speaks[v.id]?.[x.k])}" aria-label="${x.k} ${esc(v.name)}"></td>`).join('')}<td class="n"><input type="number" min="50" max="100" data-spk="f" data-k="${x.k}" value="${esc(S.speaks.f?.[x.k])}" placeholder="${suggest(x.k)}" aria-label="${x.k} final"></td><td class="small muted" data-band="${x.k}"></td></tr>`).join('')}</tbody></table>`;
}
function checkSpeaks(R) {
  if (!S.speaksOn) return;
  SP.forEach(x => {
    const el = document.querySelector(`[data-band="${x.k}"]`);
    const n = finalScore(x.k);
    if (el) el.textContent = n ? band(n) : '';
    const inp = document.querySelector(`input[data-spk="f"][data-k="${x.k}"]`);
    if (inp) inp.placeholder = suggest(x.k);
  });
  const out = [];
  const chk = (label, order, f) => {
    const T = order.map(f);
    const bad = T.some((v, i) => i && v >= T[i - 1]);
    out.push(
      `<div class="${bad ? 'err' : 'okc'}">${label}: ${order.map((t, i) => t + ' ' + T[i]).join(' &gt; ')} ${bad ? '· incompatível com o ranking' : '· compatível'}</div>`
    );
  };
  if (!isOut() && R && R.order)
    chk('Final do painel', R.order, t => SP.filter(x => x.t === t).reduce((s, x) => s + (+finalScore(x.k) || 0), 0));
  judges().forEach(v => {
    const r = rankFrom(v.pairs);
    if (r.ok && SP.every(x => S.speaks[v.id]?.[x.k]))
      chk(esc(v.name) + ' (próprio ranking)', r.order, t =>
        SP.filter(x => x.t === t).reduce((s, x) => s + +S.speaks[v.id][x.k], 0)
      );
  });
  $('#speakChk').innerHTML = out.join('') || '<span class="muted small">Preencha as notas para checar.</span>';
}
function renderOA(R) {
  $('#oa').textContent = oaText(R);
}
/* roteiro da oral como texto (também vai para o PDF com ballot) */
function oaText(R, noSpeaks) {
  let t = `Moção: ${S.motion}\n${STN[S.stage]}${S.round_no ? ' · rodada ' + S.round_no : ''}\n`;
  if (isOut()) {
    if (!R.adv) return 'Complete os votos.';
    t += `${S.stage === 'final' ? 'Campeã' : 'Avançam'}: ${R.adv.map(tName).join(' e ')}.\n${R.unan ? 'Decisão unânime.' : 'Decisão com split. Votos: ' + TEAMS.map(x => x + ' ' + R.cnt[x]).join(', ') + '.'}\n`;
  } else {
    if (!R.order) return 'Complete os votos de todas as comparações.';
    const o = R.order;
    t += `Resultado: ${o.map((x, i) => `${i + 1}º ${tName(x)}`).join(', ')}.\n`;
    const spl = R.rows.filter(r => !r.unan);
    t += spl.length
      ? `Decisão com split. ${spl.map(r => `${r.win} sobre ${r.lose} por ${Math.max(r.va.length, r.vb.length)}-${Math.min(r.va.length, r.vb.length)}${r.tb ? ' com desempate da chair' : ''} (maioria: ${(r.win === r.a ? r.va : r.vb).map(v => v.name).join(' e ')})`).join('; ')}.\n`
      : 'Decisão unânime.\n';
    if (R.cyclic)
      t += `Empate cíclico resolvido por Ranked Pairs. Comparação ignorada: ${R.steps
        .filter(s => !s.lock)
        .map(s => s.r.win + ' sobre ' + s.r.lose)
        .join(', ')}.\n`;
  }
  const o = isOut() ? rankFrom(S.my).order || [] : R.order;
  if (o.length) {
    t += '\nPor que cada equipe ficou onde ficou:\n';
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [0, 2],
      [1, 3],
      [0, 3]
    ].forEach(([i, j]) => {
      const x = o[i],
        y = o[j];
      const k = PAIRS.find(p => p.includes(x) && p.includes(y));
      const why = S.my[pk(k[0], k[1])]?.why;
      t += `- ${x} sobre ${y}${why ? ': ' + why : '.'}\n`;
    });
  }
  const ax = S.axes.filter(x => x.title);
  if (ax.length) {
    t += '\nClashes e métricas, por ordem de peso:\n';
    ax.forEach(x => {
      t += `- ${AXK[x.kind]} ${x.title} (relevância ${REL[x.rel].toLowerCase()})${x.win ? ': levou ' + tName(x.win) : ''}${x.note ? '. ' + x.note : ''}\n`;
    });
    if (S.weigh.trim()) t += `Sopesamento: ${S.weigh.trim()}\n`;
  }
  if (S.speaksOn && !noSpeaks) {
    const sp = SP.filter(x => finalScore(x.k)).map(x => `${x.k} ${finalScore(x.k)}`);
    if (sp.length) t += `\nSpeaks: ${sp.join(', ')}`;
  }
  return t;
}
function renderDerived() {
  if (route.v !== 'delib') return;
  renderPendBox();
  renderMyRank();
  renderAdvBox();
  const R = isOut() ? renderPanelOut() : renderPanelPrelim();
  checkSpeaks(R.incomplete ? null : R);
  renderOA(R);
}
function renderDelib() {
  $('#delibTitle').textContent =
    'Deliberação · ' +
    (isTr(TOURS.find(x => x.id === D.tournament_id)) && S.stage === 'preliminar' ? 'Treino' : STN[S.stage]);
  $('#delibHint').textContent = isOut()
    ? 'Eliminatória: cada juiz indica ' +
      (need() === 1 ? 'a campeã' : 'as 2 equipes que avançam') +
      '. As comparativas continuam úteis para chegar ao seu voto e para a oral.'
    : 'Ordem do manual: primeiro o ranking, depois os speaker points. Cada comparação é pairwise.';
  renderMyPairs();
  renderWings();
  renderSpeaks();
  renderDerived();
}
