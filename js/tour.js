/* ---------- tutorial ----------
 * Botão "Tutorial" no topo: destaca uma parte da tela por vez, escurece o resto e mostra uma dica.
 * → / Enter avançam, ← volta, Esc pula. Os passos dependem da tela (início, ficha ou deliberação);
 * passos cujo alvo não está na tela são pulados.
 */
const TOUR_HOME = [
  [
    '#mainTabs',
    'Navegação',
    'Torneios e treinos guardam os seus debates. Consultas tem números e exportação; Guia, as regras de BP.'
  ],
  [
    '[data-act=newT], [data-act=newTr]',
    'Comece por aqui',
    'Crie um torneio (ou treino) e depois um debate. Com um debate aberto, clique em Tutorial de novo para ver a ficha.'
  ]
];
const TOUR_FICHA = [
  ['#motion', 'Moção', 'Escreva a moção aqui, ou puxe tudo do Tabbycat na Preparação.'],
  [
    '#setupBox > summary',
    'Preparação',
    'Fase, painel, nomes e o Tabbycat: cole sua URL privada e clique em Puxar para trazer rodada, moção, equipes e painel.'
  ],
  [
    '#clock',
    'Cronômetro',
    'Espaço inicia e pausa. Clique no relógio para mudar a duração (7, 5, 4 min...), o tempo protegido e ajustar ±10 s.'
  ],
  [
    '#poiBtn',
    'POI',
    'Abre um mini modal com cronômetro do POI: escolha quem fez (só o lado oposto), o POI e a resposta. Atalho: P.'
  ],
  [
    '#axesBar',
    'Clashes, métricas e caracterizações',
    'Nomeie os eixos do debate. Escreva e dê Enter; use "m:" para métrica e "k:" para caracterização. Toque num eixo para destacar os argumentos dele.'
  ],
  [
    '#flow .speech.live form.add, #flow form.add',
    'Anotar',
    'Uma linha por ideia, Enter. Atalhos no texto: >LO1 responde, ~LO1 flipa, -LO1 mitiga, =LO1 sopesa, +PM1 complementa, ^PM1 verticaliza, *texto caracterização, #1 liga ao 1º eixo, " !" forte.'
  ],
  [
    '#flow .arg .grip',
    'Arraste para ligar',
    'Arraste o código até algo dito antes. O menu separa: com a bancada oposta (responde, flipa, mitiga, sopesa) e com a própria mesa (complementa a dupla, ou o closing verticaliza, mitiga ou sopesa o opening). Solte num eixo para contribuir ou sopesar.'
  ],
  [
    '#flow .arg',
    'Cartão do argumento',
    'Toque para selecionar: 1 2 3 dão a qualidade, S M C o veredito. A seta abre mecanismo, impacto, ligações e eixos.'
  ],
  [
    '#flow .team .th',
    'Bancada',
    'Clique no nome da bancada para ver tudo dela: argumentos, ataques, POIs, eixos e suas comparativas.'
  ],
  [
    '#lensBar .seg',
    'Três jeitos de ler',
    'Por fala (a ficha), por ideia (cada ideia e tudo o que veio depois) e por métrica (como cada bancada engajou cada eixo, e o sopesamento).'
  ],
  [
    '[data-act=focus]',
    'Foco',
    'Apaga o que não tem a ver com o argumento selecionado ou com o discurso atual, e encolhe a barra de cima. Atalho: F.'
  ],
  [
    '[data-act=pend]',
    'Pendências',
    'O que ainda falta decidir antes de votar: argumentos sem veredito, eixos sem vencedor, discursos sem POI.'
  ],
  [
    '[data-act=keys]',
    'Atalhos',
    'Todos os atalhos de teclado. Atalho: ?. Segurando Alt, cada botão mostra o seu atalho.'
  ],
  [
    '#dTabs [data-v=delib]',
    'Deliberação',
    'Comparativas par a par, votos do painel, speaks e o roteiro da oral, já com os eixos e o sopesamento. Atalho: D.'
  ]
];
const TOUR_DELIB = [
  ['#pendBox', 'Pendências', 'Antes de votar, veja o que ficou em aberto no flow.'],
  [
    '#myPairs',
    'Suas comparativas',
    'Decida cada par. Cada cartão mostra a evidência do flow: confrontos, ligações e eixos entre as duas bancadas.'
  ],
  ['#wingsBox', 'Os outros juízes', 'Registre os votos do painel; divergências aparecem marcadas.'],
  ['#panelRes', 'Resultado', 'Split por comparação, desempate da chair e Ranked Pairs em ciclos.'],
  ['#oa', 'Roteiro da oral', 'Gerado das suas comparativas, dos votos e dos clashes e métricas. Copie e ajuste.']
];
let TOUR = null; // { steps, i }
const visible = el => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && !el.closest('[hidden]');
};
const tourTarget = sel => [...document.querySelectorAll(sel)].find(visible);
function tourStart() {
  const steps = route.v === 'ficha' && S ? TOUR_FICHA : route.v === 'delib' && S ? TOUR_DELIB : TOUR_HOME;
  if (route.v === 'ficha' && S && LENS !== 'fala') setLens('fala');
  TOUR = { steps: steps.filter(s => tourTarget(s[0])), i: 0 };
  try {
    localStorage.setItem('bp.tourSeen', '1');
  } catch (e) {}
  $('#tourBtn')?.classList.remove('pulse');
  if (!TOUR.steps.length) return (TOUR = null);
  const ov = document.createElement('div');
  ov.id = 'tour';
  ov.innerHTML = '<div class="tspot"></div><div class="ttip" role="dialog" aria-live="polite"></div>';
  document.body.appendChild(ov);
  tourShow();
}
function tourEnd() {
  TOUR = null;
  $('#tour')?.remove();
}
function tourPlace() {
  if (!TOUR) return;
  const [sel] = TOUR.steps[TOUR.i];
  const el = tourTarget(sel);
  const spot = $('#tour .tspot'),
    tip = $('#tour .ttip');
  if (!el) return;
  const r = el.getBoundingClientRect();
  const pad = 6;
  Object.assign(spot.style, {
    left: r.left - pad + 'px',
    top: r.top - pad + 'px',
    width: r.width + pad * 2 + 'px',
    height: r.height + pad * 2 + 'px'
  });
  const tr = tip.getBoundingClientRect();
  let top = r.bottom + 12;
  if (top + tr.height > innerHeight - 8) top = Math.max(8, r.top - tr.height - 12);
  let left = Math.min(Math.max(8, r.left), innerWidth - tr.width - 8);
  tip.style.top = top + 'px';
  tip.style.left = Math.max(8, left) + 'px';
}
function tourShow() {
  if (!TOUR) return;
  const { steps, i } = TOUR;
  const [sel, title, text] = steps[i];
  const el = tourTarget(sel);
  if (!el) return tourGo(1);
  el.scrollIntoView({ block: 'center', behavior: 'instant' });
  $('#tour .ttip').innerHTML =
    `<div class="small muted">${i + 1} de ${steps.length}</div><h3>${title}</h3><p>${text}</p><div class="row"><button class="sm" data-tour="end">Pular</button><span style="flex:1"></span>${i ? '<button class="sm" data-tour="-1">Voltar</button>' : ''}<button class="sm pri" data-tour="1">${i === steps.length - 1 ? 'Concluir' : 'Próximo'}</button></div>`;
  requestAnimationFrame(tourPlace);
  $('#tour .ttip [data-tour="1"]').focus();
}
function tourGo(d) {
  if (!TOUR) return;
  const j = TOUR.i + d;
  if (j < 0) return;
  if (j >= TOUR.steps.length) return tourEnd();
  TOUR.i = j;
  tourShow();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tour]');
  if (b) {
    e.preventDefault();
    e.stopPropagation();
    if (b.dataset.tour === 'end') tourEnd();
    else tourGo(+b.dataset.tour);
    return;
  }
  if (TOUR && e.target.closest('#tour')) e.stopPropagation();
});
document.addEventListener(
  'keydown',
  e => {
    if (!TOUR) return;
    if (e.key === 'Escape') tourEnd();
    else if (e.key === 'ArrowRight' || e.key === 'Enter') tourGo(1);
    else if (e.key === 'ArrowLeft') tourGo(-1);
    else return;
    e.preventDefault();
    e.stopImmediatePropagation();
  },
  true
);
addEventListener('resize', tourPlace);
addEventListener('scroll', tourPlace, { passive: true });
addEventListener('hashchange', tourEnd);
$('#tourBtn').onclick = tourStart;
try {
  if (!localStorage.getItem('bp.tourSeen')) $('#tourBtn').classList.add('pulse');
} catch (e) {}
