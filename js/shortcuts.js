/* ---------- atalhos ----------
 * Teclado na ficha (fora de campos de texto) e sintaxe rápida no campo "Nova ideia".
 */
const KEYS = [
  [
    'Cronômetro',
    [
      ['Espaço', 'iniciar / pausar'],
      ['R', 'zerar'],
      ['+  −', 'ajustar 10 s'],
      ['] [', 'próximo / anterior discurso']
    ]
  ],
  [
    'Anotar',
    [
      ['N', 'nova ideia no discurso atual'],
      ['Enter', 'editar o título do argumento selecionado'],
      ['E', 'abrir detalhes do selecionado'],
      ['1  2  3', 'forte / ok / fraco no selecionado'],
      ['P  M  C', 'de pé / mitigado / caiu no selecionado'],
      ['Del', 'apagar o selecionado (dá para desfazer)']
    ]
  ],
  [
    'Navegar',
    [
      ['↑ ↓', 'argumento anterior / seguinte'],
      ['F', 'modo foco'],
      ['V', 'trocar lente: fala, ideia, métrica'],
      ['D', 'ir para a deliberação'],
      ['Esc', 'limpar seleção / fechar'],
      ['?', 'esta ajuda']
    ]
  ]
];
const QUICK = [
  ['>LO1 texto', 'responde LO1'],
  ['~LO1 texto', 'flipa LO1'],
  ['+PM1 texto', 'complementa PM1'],
  ['^PM1 texto', 'verticaliza PM1 (força média; ^3PM1 forte, ^1PM1 fraca)'],
  ['texto #2', 'liga ao 2º clash/métrica da barra (só no fim; \\#2 deixa o texto como está)'],
  ['texto !', 'marca como forte (texto ? marca como fraco)']
];
function keysModal() {
  modal(`<h2>Atalhos</h2><div class="keys">${KEYS.map(
    ([h, L]) =>
      `<div><h3>${h}</h3><table><tbody>${L.map(([k, d]) => `<tr><td><kbd>${k}</kbd></td><td>${d}</td></tr>`).join('')}</tbody></table></div>`
  ).join('')}</div>
<h3 style="margin-top:14px">No campo "Nova ideia"</h3><table><tbody>${QUICK.map(([k, d]) => `<tr><td><code>${esc(k)}</code></td><td>${d}</td></tr>`).join('')}</tbody></table>
<p class="small muted">Para ligar argumentos, arraste o código (ex.: LO1) até outro argumento ou até um clash/métrica.</p>
<div class="row" style="margin-top:10px"><span style="flex:1"></span><button class="pri" data-act="close">Fechar</button></div>`);
}
ACTS.keys = () => {
  keysModal();
  return false;
};
/* ">LO1 texto !" -> { title:'texto', link:{code:'LO1', t:'r'}, q:'f' } */
function parseQuick(v) {
  let t = v.trim(),
    link = null,
    q = '',
    ax = 0;
  const m = t.match(/^([>~+^])([123])?\s*((?:PM|LO|DPM|DLO|MG|MO|GW|OW)\d+)\b\s*(.*)$/i);
  if (m) {
    link = { t: { '>': 'r', '~': 'f', '+': 'c', '^': 'v' }[m[1]], code: m[3].toUpperCase(), s: m[2] ? +m[2] : 2 };
    t = m[4];
  }
  /* "#N" only at the end (before an optional ! or ?); "\#N" keeps the text literal */
  t = t.replace(/\s#([1-9])(?=\s*[!?]?$)/, (_, n) => {
    ax = +n;
    return '';
  });
  t = t.replace(/\\#(?=[1-9])/g, '#').trim();
  if (/\s!$/.test(t) || t === '!') {
    q = 'f';
    t = t.slice(0, -1).trim();
  } else if (/\s\?$/.test(t)) {
    q = 'w';
    t = t.slice(0, -1).trim();
  }
  return { title: t, link, q, ax };
}
/* ordem visual dos cartões, para ↑ ↓ */
const cardOrder = () =>
  [...document.querySelectorAll('#flow:not([hidden]) .arg[data-id], #lensIdea:not([hidden]) [data-id]')].map(
    n => n.dataset.id
  );
document.addEventListener('keydown', e => {
  if (route.v !== 'ficha' && route.v !== 'delib') return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const typing = e.target.closest && e.target.closest('input,textarea,select,[contenteditable]');
  if ($('#modal').classList.contains('on')) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeM();
    }
    return;
  }
  if (typing) {
    if (e.key === 'Escape') e.target.blur();
    return;
  }
  if (e.target.closest('button') && (e.key === 'Enter' || e.key === ' ')) return;
  if (route.v === 'delib') {
    if (e.code === 'Space') {
      e.preventDefault();
      $('#dStart').click();
    }
    return;
  }
  const a = SEL && argById(SEL);
  const k = e.key;
  const done = () => e.preventDefault();
  if (e.code === 'Space') {
    done();
    toggleT();
  } else if (k === 'n' || k === 'N') {
    if (LENS !== 'fala') setLens('fala');
    const f = document.querySelector(`form.add[data-sp="${SP[S.cur].k}"] input`);
    if (f) {
      done();
      f.focus();
    }
  } else if (k === 'r' || k === 'R') {
    done();
    resetT();
  } else if (k === '+' || k === '=') {
    done();
    shiftT(10);
  } else if (k === '-' || k === '_') {
    done();
    shiftT(-10);
  } else if (k === ']') {
    done();
    gotoSpeech(S.cur + 1);
  } else if (k === '[') {
    done();
    gotoSpeech(S.cur - 1);
  } else if (k === 'f' || k === 'F') {
    done();
    ACTS.focus();
  } else if (k === 'v' || k === 'V') {
    done();
    const i = LENSES.findIndex(([x]) => x === LENS);
    setLens(LENSES[(i + 1) % LENSES.length][0]);
  } else if (k === 'd' || k === 'D') {
    done();
    location.hash = '#/d/' + D.id + '/delib';
  } else if (k === '?') {
    done();
    keysModal();
  } else if (k === 'Escape') {
    if (SEL || AXF) {
      SEL = null;
      AXF = null;
      renderAxesBar();
      applyFocus();
    }
  } else if (k === 'ArrowDown' || k === 'ArrowUp') {
    const L = cardOrder();
    if (!L.length) return;
    done();
    const i = L.indexOf(SEL);
    const j = i < 0 ? 0 : Math.max(0, Math.min(L.length - 1, i + (k === 'ArrowDown' ? 1 : -1)));
    SEL = L[j];
    applyFocus();
    document.querySelector(`[data-id="${SEL}"]:not([hidden])`)?.scrollIntoView({ block: 'nearest' });
  } else if (a) {
    const set = fn => {
      done();
      fn();
      save();
      renderFlow();
    };
    if (k === '1' || k === '2' || k === '3') set(() => (a.q = a.q === 'fmw'[+k - 1] ? '' : 'fmw'[+k - 1]));
    else if (k === 'p' || k === 'P') set(() => (a.res = a.res === 'pe' ? '' : 'pe'));
    else if (k === 'm' || k === 'M') set(() => (a.res = a.res === 'mi' ? '' : 'mi'));
    else if (k === 'c' || k === 'C') set(() => (a.res = a.res === 'cai' ? '' : 'cai'));
    else if (k === 'e' || k === 'E') set(() => (a.open = !a.open));
    else if (k === 'Enter') {
      if (LENS !== 'fala') setLens('fala');
      const t = document.querySelector(`#flow .arg[data-id="${a.id}"] .t`);
      if (t) {
        done();
        t.focus();
        t.setSelectionRange(t.value.length, t.value.length);
      }
    } else if (k === 'Delete' || k === 'Backspace') {
      const b = document.querySelector(`#flow .arg[data-id="${a.id}"] [data-act=del]`);
      done();
      if (b) b.click();
      else {
        a.open = true;
        renderFlow();
        document.querySelector(`#flow .arg[data-id="${a.id}"] [data-act=del]`)?.click();
      }
    }
  }
});
