const TEAMS = ['OG', 'OO', 'CG', 'CO'];
const SP = [
  { k: 'PM', t: 'OG', i: 0 },
  { k: 'LO', t: 'OO', i: 0 },
  { k: 'DPM', t: 'OG', i: 1 },
  { k: 'DLO', t: 'OO', i: 1 },
  { k: 'MG', t: 'CG', i: 0 },
  { k: 'MO', t: 'CO', i: 0 },
  { k: 'GW', t: 'CG', i: 1 },
  { k: 'OW', t: 'CO', i: 1 }
];
const SPN = {
  PM: 'Primeiro-Ministro',
  LO: 'Líder da Oposição',
  DPM: 'Vice-PM',
  DLO: 'Vice-Líder',
  MG: 'Member do Governo',
  MO: 'Member da Oposição',
  GW: 'Whip do Governo',
  OW: 'Whip da Oposição'
};
const PAIRS = [
  ['OG', 'OO'],
  ['OG', 'CG'],
  ['OG', 'CO'],
  ['OO', 'CG'],
  ['OO', 'CO'],
  ['CG', 'CO']
];
const STAGES = [
  ['preliminar', 'Preliminares'],
  ['octavas', 'Oitavas de final'],
  ['quartas', 'Quartas de final'],
  ['semi', 'Semifinal'],
  ['final', 'Final'],
  ['outra', 'Outra eliminatória']
];
const STN = Object.fromEntries(STAGES);
const SCOPES = [
  ['interno', 'Interno da SD'],
  ['parceria', 'Parceria com outra SD'],
  ['externo', 'Externo']
];
const SCN = Object.fromEntries(SCOPES);
const isTr = t => !!t && t.kind === 'treino';
const HINT = {
  'OG-OO': 'Duelo direto do opening. Só conta o que um fez contra o outro.',
  'OG-CG': 'Mesma bancada. Credite ao CG só o que é exclusivamente novo. Houve faca?',
  'OG-CO': 'O CO pode responder ao OG; o OG não teve como responder ao CO.',
  'OO-CG': 'O CG respondeu ao OO? Material novo do CG contra o caso do OO é o centro.',
  'OO-CO': 'Mesma bancada. Só o novo do CO conta, e precisa ser consistente com o OO.',
  'CG-CO': 'Duelo do closing: extensão contra extensão e quem venceu os choques finais.'
};
const KIND = { c: 'Construtivo', r: 'Resposta', x: 'Extensão', p: 'Pesagem', i: 'POI' };
const QUAL = { f: 'Forte', m: 'Ok', w: 'Fraco' };
const RES = { pe: 'De pé', mi: 'Mitigado', cai: 'Caiu' };
const CMP = { s: 'Comparado pelos debatedores', p: 'Comparado em parte', n: 'Não comparado, eu comparo' };
const ROLE = { chair: 'Chair', wing: 'Wing', trainee: 'Trainee (não vota)', off: 'Fora do painel' };
const SCALE = [
  [95, 100, 'Possivelmente um dos melhores discursos já feitos; argumentos impecáveis.'],
  [92, 94, 'Entre os melhores do torneio; sem falhas relevantes.'],
  [89, 91, 'Argumentos brilhantes nas questões centrais.'],
  [86, 88, 'Engaja o núcleo, muito convincente, sem lacunas lógicas.'],
  [83, 85, 'Ataca as questões centrais com explicações fortes.'],
  [79, 82, 'Relevante, bem feito e explicado; vulnerável a boas respostas.'],
  [76, 78, 'Quase todo relevante; às vezes raso ou periférico.'],
  [73, 75, 'Deixa questão central de fora; lógico porém simplista.'],
  [70, 72, 'Lacunas lógicas regulares; às vezes difícil de seguir.'],
  [67, 69, 'Quase tudo com lacunas sérias; difícil de creditar.'],
  [64, 66, 'Algo relevante; muitas vezes confuso.'],
  [61, 63, 'Algumas afirmações relevantes; explicações falhas.'],
  [58, 60, 'Afirmações sem formato de argumento.'],
  [55, 57, 'Comentários, não argumentos.'],
  [50, 54, 'Conteúdo irrelevante e confuso.']
];
const uid = () => Math.random().toString(36).slice(2, 9);
const pk = (a, b) => a + '-' + b;
const blankPairs = () => Object.fromEntries(PAIRS.map(([a, b]) => [pk(a, b), { w: '', c: '', why: '' }]));
const $ = q => document.querySelector(q);
const esc = v =>
  String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function blankS(stage) {
  return {
    v: 2,
    motion: '',
    info: '',
    stage: stage || 'preliminar',
    round_no: null,
    label: '',
    room: '',
    panel: {
      me: { name: window.BP_T ? BP_T('Você') : 'Você', role: 'chair' },
      others: [
        { name: 'Wing 1', role: 'wing' },
        { name: 'Wing 2', role: 'off' }
      ]
    },
    teams: Object.fromEntries(TEAMS.map(t => [t, { name: '', sp: ['', ''] }])),
    args: [],
    clashes: [],
    my: blankPairs(),
    wv: [blankPairs(), blankPairs()],
    myAdv: [],
    wadv: [[], []],
    advTie: [],
    tie: [],
    speaks: { f: {} },
    speaksOn: (stage || 'preliminar') === 'preliminar',
    cur: 0
  };
}
const cleanResult = r => {
  if (!r || typeof r !== 'object') return null;
  const T = x => TEAMS.includes(x);
  const o = { ...r };
  if (o.order) o.order = Array.isArray(o.order) && o.order.every(T) && o.order.length === 4 ? o.order : null;
  if (o.advance) o.advance = Array.isArray(o.advance) ? o.advance.filter(T) : null;
  if (o.winner && !T(o.winner)) o.winner = null;
  if (o.speaks) {
    const sp = {};
    for (const [k, v] of Object.entries(o.speaks || {}))
      if (SP.some(x => x.k === k) && v !== '' && isFinite(+v)) sp[k] = +v;
    o.speaks = sp;
  }
  o.split = !!o.split;
  o.me_minority = !!o.me_minority;
  return o;
};
const cleanStage = x => (STN[x] ? x : 'preliminar'),
  cleanRole = x => (['chair', 'wing', 'trainee'].includes(x) ? x : null);
function migrate(s) {
  if (!s || typeof s !== 'object') return blankS();
  s.stage = cleanStage(s.stage);
  if (!Array.isArray(s.args)) s.args = [];
  s.args = s.args
    .filter(a => a && typeof a === 'object' && SP.some(x => x.k === a.sp))
    .map(a => ({
      id: String(a.id || uid()),
      sp: a.sp,
      title: String(a.title ?? ''),
      why: String(a.why ?? ''),
      imp: String(a.imp ?? ''),
      note: String(a.note ?? ''),
      q: QUAL[a.q] ? a.q : '',
      kind: KIND[a.kind] ? a.kind : 'c',
      res: RES[a.res] ? a.res : '',
      to: Array.isArray(a.to) ? a.to.map(String) : [],
      open: !!a.open
    }));
  if (!Array.isArray(s.clashes)) s.clashes = [];
  s.clashes = s.clashes.filter(
    c => c && typeof c === 'object' && s.args.some(a => a.id === c.a) && s.args.some(a => a.id === c.b)
  );
  if (s.teams && typeof s.teams === 'object')
    for (const t of TEAMS) {
      const x = s.teams[t];
      if (!x || typeof x !== 'object') s.teams[t] = { name: '', sp: ['', ''] };
      else {
        x.name = String(x.name ?? '');
        x.sp = [String((x.sp || [])[0] ?? ''), String((x.sp || [])[1] ?? '')];
      }
    }
  if (s.panel && s.panel.me && typeof s.panel.me === 'object') {
    s.panel.me.name = String(s.panel.me.name ?? '');
  }
  if (s.panel && Array.isArray(s.panel.others))
    s.panel.others = s.panel.others
      .filter(o => o && typeof o === 'object')
      .map(o => ({
        name: String(o.name ?? ''),
        role: ['wing', 'trainee', 'off', 'chair'].includes(o.role) ? o.role : 'off'
      }));
  if (s.panel && s.panel.chair !== undefined) {
    s.panel = {
      me: { name: s.panel.chair || 'Você', role: 'chair' },
      others: (s.panel.wings || []).map(w => ({
        name: w.name,
        role: w.role === 'votante' ? 'wing' : w.role === 'trainee' ? 'trainee' : 'off'
      }))
    };
    const sp = s.speaks || {};
    s.speaks = { f: sp.f || {}, me: sp.c || {}, o0: sp.w0 || {}, o1: sp.w1 || {} };
  }
  const b = blankS(s.stage);
  for (const k in b) if (s[k] === undefined) s[k] = b[k];
  s.wv = s.wv || [];
  s.wadv = s.wadv || [];
  s.panel.others.forEach((o, i) => {
    s.wv[i] = s.wv[i] || blankPairs();
    s.wadv[i] = s.wadv[i] || [];
  });
  delete s.ex;
  return s;
}
