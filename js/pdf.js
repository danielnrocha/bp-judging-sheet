/* ---------- PDF ----------
 * Botão "PDF" na barra do debate: monta uma versão para leitura da ficha e abre a impressão do navegador,
 * onde dá para "Salvar como PDF" (no celular, compartilhar ou salvar). Duas versões:
 *  - sem ballot ('notes'): moção, equipes, eixos, as ideias por discurso com as ligações, POIs e confrontos;
 *  - resultado sem speaks ('result'): isso mais o resultado, as comparativas, os votos do painel e a oral, sem speaker points;
 *  - com ballot ('full'): tudo, inclusive os speaker points.
 * Nada sai do aparelho: é o próprio navegador que gera o arquivo. */
const pdfT = s => (window.BP_T ? BP_T(s) : s);
const pdfTeam = t =>
  `<span class="pt T${t}"><span class="tc">${t}</span>${S.teams[t].name ? ' ' + esc(S.teams[t].name) : ''}</span>`;
const PDFKIND = { notes: 'Ficha sem ballot', result: 'Ficha com resultado, sem speaks', full: 'Ficha com ballot' };
function pdfHead(mode) {
  const tour = (typeof TOURS !== 'undefined' && TOURS.find(x => x.id === D?.tournament_id)) || null;
  const meta = [
    tour?.name,
    STN[S.stage] + (S.round_no ? ' · ' + pdfT('Rodada') + ' ' + S.round_no : ''),
    S.label,
    new Date().toLocaleDateString(document.documentElement.lang || undefined)
  ].filter(Boolean);
  return `<header class="ph">
<p class="pmeta">${meta.map(esc).join(' · ')}</p>
<h1>${esc(S.motion) || '<span class="muted">' + pdfT('sem moção') + '</span>'}</h1>
${S.info.trim() ? `<p class="pinfo">${esc(S.info)}</p>` : ''}
<p class="pkind">${pdfT(PDFKIND[mode])}</p>
</header>
<table class="pteams"><tbody>${TEAMS.map(
    t =>
      `<tr><td>${pdfTeam(t)}</td><td>${SP.filter(x => x.t === t)
        .map(x => `<b>${x.k}</b> ${esc(S.teams[t].sp[x.i]) || '<span class="muted">-</span>'}`)
        .join(' · ')}</td></tr>`
  ).join('')}</tbody></table>`;
}
function pdfAxes() {
  const ax = S.axes.filter(x => x.title.trim());
  if (!ax.length && !S.weigh.trim()) return '';
  return `<h2>${pdfT('Clashes e métricas')}</h2><ul class="pax">${ax
    .map(
      x =>
        `<li><b>${AXI[x.kind]} ${pdfT(AXK[x.kind])}:</b> ${esc(x.title)} <span class="muted">(${pdfT('relevância ' + REL[x.rel].toLowerCase())})</span>${x.win ? ' · ' + pdfT('levou') + ' ' + pdfTeam(x.win) : ''}${x.note.trim() ? `<div class="pnote">${esc(x.note)}</div>` : ''}${pdfAxArgs(x)}</li>`
    )
    .join('')}</ul>${S.weigh.trim() ? `<p><b>${pdfT('Sopesamento')}:</b> ${esc(S.weigh)}</p>` : ''}`;
}
const pdfAxArgs = x => {
  const L = S.args.filter(a => a.ax[x.id]);
  return L.length
    ? `<div class="small">${L.map(a => `${code(a)} ${axTag(a, x.id)}`).join(', ')}</div>`
    : '';
};
function pdfArg(a) {
  const tags = [
    a.kind !== 'c' ? pdfT(KIND[a.kind]) : '',
    a.q ? pdfT(QUAL[a.q]) : '',
    status(a) === 'flip' ? pdfT('Flipado') : a.res ? pdfT(RES[a.res]) : ''
  ].filter(Boolean);
  const out = a.links
    .map(l => {
      const y = argById(l.id);
      return y ? pdfT(linkLabel(l) + ' ' + code(y)) : '';
    })
    .filter(Boolean);
  const inc = incoming(a).map(x => `${pdfT(LINKIN[x.l.t])} ${code(x.a)}`);
  const det = [
    a.why.trim() ? `<div><b>${pdfT('Mecanismo')}:</b> ${esc(a.why)}</div>` : '',
    a.imp.trim() ? `<div><b>${pdfT('Impacto')}:</b> ${esc(a.imp)}</div>` : '',
    a.note.trim() ? `<div><b>${pdfT('Nota')}:</b> ${esc(a.note)}</div>` : ''
  ].join('');
  return `<li><span class="pcode">${code(a)}</span> ${esc(a.title) || '<span class="muted">-</span>'}${tags.length ? ` <span class="ptags">${tags.map(esc).join(' · ')}</span>` : ''}${out.length || inc.length ? `<div class="small">${[...out, ...inc].map(esc).join(' · ')}</div>` : ''}${det ? `<div class="pdet">${det}</div>` : ''}</li>`;
}
function pdfPois(k) {
  const L = S.pois.filter(p => p.sp === k);
  if (!L.length) return S.poiNone.includes(k) ? `<p class="small muted">${pdfT('Ninguém ofereceu POI')}</p>` : '';
  return `<div class="ppois"><b>POIs</b><ul>${L.map(
    p =>
      `<li><b>${p.by}</b>${p.at ? ' ' + fmt(p.at) : ''}: ${p.no ? pdfT('recusado') : `${esc(p.q) || '-'}${p.a.trim() ? ` <span class="muted">→</span> ${esc(p.a)}` : ''}${p.ev ? ` <span class="muted">(${pdfT(POIEV[p.ev])})</span>` : ''}`}</li>`
  ).join('')}</ul></div>`;
}
function pdfFlow() {
  return `<h2>${pdfT('Discursos')}</h2>${SP.map(x => {
    const L = S.args.filter(a => a.sp === x.k);
    const who = S.teams[x.t].sp[x.i];
    return `<section class="psp T${x.t}"><h3><span class="tc">${x.k}</span> ${esc(who) || pdfT(SPN[x.k])}</h3>${L.length ? `<ul class="pargs">${L.map(pdfArg).join('')}</ul>` : `<p class="small muted">${pdfT('Sem anotações')}</p>`}${pdfPois(x.k)}</section>`;
  }).join('')}`;
}
function pdfClashes() {
  const L = S.clashes
    .map(c => [c, argById(c.a), argById(c.b)])
    .filter(([, A, B]) => A && B);
  if (!L.length) return '';
  return `<h2>${pdfT('Confrontos diretos')}</h2><ul>${L.map(([c, A, B]) => {
    const w = c.win === 'a' ? code(A) : c.win === 'b' ? code(B) : c.win === 'e' ? pdfT('empate') : '';
    return `<li><b>${code(A)}</b> ${esc(A.title)} <span class="muted">x</span> <b>${code(B)}</b> ${esc(B.title)}${w ? ` · ${pdfT('levou')} <b>${w}</b>` : ''}${c.cmp ? ` <span class="muted">(${pdfT(CMP[c.cmp]).toLowerCase()})</span>` : ''}${c.why.trim() ? `<div class="pnote">${esc(c.why)}</div>` : ''}</li>`;
  }).join('')}</ul>`;
}
function pdfBallot(speaks) {
  const R = isOut() ? advResult() : panelResult();
  let h = `<div class="pbreak"></div><h2>${pdfT('Ballot')}</h2>`;
  if (isOut()) {
    h += R.adv
      ? `<p><b>${pdfT(S.stage === 'final' ? 'Campeã' : 'Avançam')}:</b> ${R.adv.map(pdfTeam).join(' ')} · ${pdfT(R.unan ? 'Decisão unânime' : 'Decisão com split')}</p>`
      : `<p class="muted">${pdfT('Resultado incompleto')}</p>`;
  } else if (R.order) {
    h += `<ol class="prank">${R.order.map(t => `<li>${pdfTeam(t)}</li>`).join('')}</ol><p>${pdfT(R.rows.some(r => !r.unan) ? 'Decisão com split' : 'Decisão unânime')}</p>`;
  } else h += `<p class="muted">${pdfT('Resultado incompleto')}</p>`;
  // votos do painel
  const V = judges();
  if (V.length > 1 || isOut()) {
    h += `<h3>${pdfT('Votos do painel')}</h3>`;
    h += isOut()
      ? `<table><thead><tr><th></th>${V.map(v => `<th>${esc(v.name)}${v.chair ? ' (chair)' : v.vote ? '' : ' (trainee)'}</th>`).join('')}</tr></thead><tbody>${TEAMS.map(t => `<tr><td>${pdfTeam(t)}</td>${V.map(v => `<td>${(v.adv || []).includes(t) ? '✓' : ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`
      : `<table><thead><tr><th></th>${V.map(v => `<th>${esc(v.name)}${v.chair ? ' (chair)' : v.vote ? '' : ' (trainee)'}</th>`).join('')}<th>${pdfT('Resultado')}</th></tr></thead><tbody>${R.rows.map(r => `<tr><td>${r.a} x ${r.b}</td>${V.map(v => `<td>${v.pairs[r.k]?.w || '-'}</td>`).join('')}<td>${r.win ? `<b>${r.win}</b> ${r.va.length}-${r.vb.length}` : '-'}</td></tr>`).join('')}</tbody></table>`;
  }
  // minhas comparativas
  const my = PAIRS.map(([a, b]) => [a, b, S.my[pk(a, b)]]).filter(([, , p]) => p.w || p.why.trim());
  if (my.length)
    h += `<h3>${pdfT('Minhas comparativas')}</h3><ul>${my
      .map(
        ([a, b, p]) =>
          `<li><b>${a} x ${b}</b>${p.w ? ': ' + pdfT('levou') + ' <b>' + p.w + '</b>' : ''}${p.c ? ` <span class="muted">(${pdfT(p.c)})</span>` : ''}${p.why.trim() ? `<div class="pnote">${esc(p.why)}</div>` : ''}</li>`
      )
      .join('')}</ul>`;
  // speaks
  if (speaks && S.speaksOn) {
    const sp = SP.filter(x => finalScore(x.k) !== '');
    if (sp.length)
      h += `<h3>Speaker points</h3><table class="pspk"><tbody>${sp.map(x => `<tr><td><b>${x.k}</b> ${esc(S.teams[x.t].sp[x.i])}</td><td class="n"><b>${finalScore(x.k)}</b></td></tr>`).join('')}</tbody></table>`;
  }
  h += `<h3>${pdfT('Roteiro da oral')}</h3><pre class="poa">${esc(pdfT(oaText(R, !speaks)))}</pre>`;
  return h;
}
const PDFSUF = { notes: ' (sem ballot)', result: ' (sem speaks)', full: '' };
function pdfFile(mode) {
  const parts = [STN[S.stage], S.round_no ? 'R' + S.round_no : '', S.label, S.motion.slice(0, 60)].filter(Boolean);
  return ('Ficha BP - ' + parts.join(' - ') + PDFSUF[mode]).replace(/[\\/:*?"<>|]+/g, ' ');
}
function printSheet(mode) {
  if (!S || !PDFKIND[mode]) return;
  const el = $('#v-print');
  el.innerHTML = pdfHead(mode) + pdfAxes() + pdfFlow() + pdfClashes() + (mode === 'notes' ? '' : pdfBallot(mode === 'full'));
  const title = document.title;
  document.title = pdfFile(mode); // vira o nome sugerido do arquivo
  const done = () => {
    document.title = title;
    el.innerHTML = '';
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  closeM();
  setTimeout(() => window.print(), 50);
}
ACTS.pdf = () => {
  modal(`<div class="row" style="justify-content:space-between"><h2 style="margin:0">Exportar PDF</h2><button class="x" data-act="close" aria-label="Fechar">✕</button></div>
<p class="small muted">Abre a impressão do navegador: escolha "Salvar como PDF" (no celular, compartilhar ou salvar). O arquivo é gerado no seu aparelho.</p>
<div class="pdfopts">
<button class="pdfopt" data-act="pdfGo" data-v="notes"><b>Sem ballot</b><span class="small muted">Moção, equipes, eixos, as ideias de cada discurso, POIs e confrontos. Bom para mandar aos debatedores.</span></button>
<button class="pdfopt" data-act="pdfGo" data-v="result"><b>Com resultado, sem speaks</b><span class="small muted">Isso mais o resultado, as comparativas, os votos do painel e o roteiro da oral, sem os speaker points.</span></button>
<button class="pdfopt" data-act="pdfGo" data-v="full"><b>Com ballot</b><span class="small muted">Tudo, inclusive os speaker points.</span></button>
</div>`);
  return false;
};
ACTS.pdfGo = b => {
  printSheet(b.dataset.v);
  return false;
};
