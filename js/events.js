document.addEventListener('submit', e => {
  const f = e.target.closest('form.add');
  if (!f) return;
  e.preventDefault();
  const i = f.querySelector('input');
  const v = i.value.trim();
  if (!v) return;
  const sp = f.dataset.sp;
  try {
    localStorage.removeItem('bp.draft.' + D.id + '.' + sp);
    BPS.mark('bp.draft.' + D.id + '.' + sp);
  } catch (x) {}
  S.args.push({ id: uid(), sp, title: v, why: '', imp: '', q: '', kind: 'c', to: [], res: '' });
  save();
  renderFlow();
  document.querySelector(`form.add[data-sp="${sp}"] input`)?.focus();
});
document.addEventListener('click', async e => {
  const tr = e.target.closest('[data-open]');
  if (tr && !e.target.closest('button')) {
    location.hash = '#/d/' + tr.dataset.open;
    return;
  }
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (b.tagName === 'SELECT') return;
  if (['saveT', 'newD', 'newT', 'newTr', 'importD2', 'dupD', 'delT2', 'delD2', 'addClash'].includes(act)) {
    const now = Date.now();
    if (window.__lastBtn === b && now - window.__lastAt < 1000) return;
    window.__lastBtn = b;
    window.__lastAt = now;
  }
  const a = argOf(b),
    c = clashOf(b);
  let r = true;
  switch (act) {
    case 'close':
      closeM();
      return;
    case 'newT':
      tourForm();
      return;
    case 'newTr':
      trForm();
      return;
    case 'trf':
      window._trf = b.dataset.v;
      renderTreinos();
      return;
    case 'editT':
      tourForm($('#v-tour')._t);
      return;
    case 'saveT': {
      const tr = b.dataset.kind === 'treino';
      const row = {
        name: $('#fName').value.trim(),
        starts_on: $('#fS').value || null,
        ends_on: tr ? $('#fS').value || null : $('#fE').value || null,
        location: $('#fL').value.trim() || null,
        notes: $('#fN').value.trim() || null,
        kind: tr ? 'treino' : 'torneio'
      };
      if (tr) {
        row.scope = $('#fScope').value;
        row.partner = row.scope === 'interno' ? null : $('#fP').value.trim() || null;
        if (!row.name)
          row.name =
            (window.BP_T ? BP_T('Treino') : 'Treino') +
            (row.partner ? ' · ' + row.partner : '') +
            (row.starts_on ? ' · ' + row.starts_on.split('-').reverse().join('/') : '');
      }
      if (!row.name) {
        toast('Dê um nome ao torneio');
        return;
      }
      const id = b.dataset.id;
      const q = id
        ? sb.from('bp_tournaments').update(row).eq('id', id).select('id').single()
        : sb.from('bp_tournaments').insert(row).select('id').single();
      const { data, error } = await q;
      if (error) {
        toast('Erro: ' + error.message);
        return;
      }
      closeM();
      if (location.hash === '#/t/' + data.id) renderTour(data.id);
      else location.hash = '#/t/' + data.id;
      return;
    }
    case 'delT':
      modal(
        b.dataset.kind === 'treino'
          ? `<h2>Apagar treino?</h2><p>Apaga o treino e todos os debates dele, de forma permanente. Exporte antes em Consultas se quiser guardar.</p><div class="row"><button class="pri" data-act="delT2" data-id="${b.dataset.id}" data-kind="treino">Apagar de vez</button><button data-act="close">Cancelar</button></div>`
          : `<h2>Apagar torneio?</h2><p>Apaga o torneio e todos os debates dele, de forma permanente. Exporte antes em Consultas se quiser guardar.</p><div class="row"><button class="pri" data-act="delT2" data-id="${b.dataset.id}">Apagar de vez</button><button data-act="close">Cancelar</button></div>`
      );
      return;
    case 'delT2': {
      const { error } = await sb.from('bp_tournaments').delete().eq('id', b.dataset.id);
      if (error) {
        toast('Erro: ' + error.message);
        return;
      }
      TOURS = TOURS.filter(x => x.id !== b.dataset.id);
      closeM();
      location.hash = b.dataset.kind === 'treino' ? '#/treinos' : '#/';
      return;
    }
    case 'newD':
      newDebate($('#v-tour').dataset.tid, b.dataset.stage, b.dataset.r);
      return;
    case 'importD':
      modal(
        `<h2>Importar ficha</h2><p class="small muted">Cole o JSON exportado da ficha antiga (ou escolha o arquivo). Vira um debate deste torneio.</p><textarea id="js" rows="8" style="font-size:13px"></textarea><div class="row" style="margin-top:8px"><input type="file" id="jf" accept=".json,application/json" style="width:auto"><button class="pri" data-act="importD2">Importar</button><button data-act="close">Cancelar</button></div>`
      );
      $('#jf').onchange = ev => {
        const f = ev.target.files[0];
        if (f) f.text().then(t => ($('#js').value = t));
      };
      return;
    case 'importD2': {
      try {
        const n = JSON.parse($('#js').value);
        if (!n || !Array.isArray(n.args)) throw 0;
        n.stage = cleanStage(n.stage);
        closeM();
        newDebate($('#v-tour').dataset.tid, n.stage, null, n);
      } catch (err) {
        toast('JSON inválido');
      }
      return;
    }
    case 'dupD': {
      clearTimeout(saveT);
      await push();
      const s = blankS(S.stage);
      s.panel = JSON.parse(JSON.stringify(S.panel));
      s.round_no = S.stage === 'preliminar' && S.round_no ? S.round_no + 1 : null;
      newDebate(D.tournament_id, s.stage, s.round_no, s);
      return;
    }
    case 'delD':
      modal(
        `<h2>Apagar este debate?</h2><p>Não dá para desfazer.</p><div class="row"><button class="pri" data-act="delD2">Apagar</button><button data-act="close">Cancelar</button></div>`
      );
      return;
    case 'delD2': {
      const tid = D.tournament_id,
        id = D.id;
      clearTimeout(saveT);
      saveT = null;
      const { error } = await sb.from('bp_debates').delete().eq('id', id);
      if (error) {
        toast('Erro: ' + error.message);
        return;
      }
      try {
        for (const k of Object.keys(localStorage))
          if (k.startsWith('bp.cache.' + id) || k.startsWith('bp.meta.' + id) || k.startsWith('bp.draft.' + id)) {
            localStorage.removeItem(k);
            BPS.mark(k);
          }
      } catch (x) {}
      D = null;
      S = null;
      closeM();
      location.hash = tid ? '#/t/' + tid : '#/';
      return;
    }
    case 'exp':
      exportAll(b.dataset.v);
      return;
    case 'q':
      a.q = a.q === b.dataset.v ? '' : b.dataset.v;
      break;
    case 'res':
      a.res = a.res === b.dataset.v ? '' : b.dataset.v;
      break;
    case 'toggle':
      a.open = !a.open;
      break;
    case 'unlink':
      a.to = a.to.filter(x => x !== b.dataset.v);
      break;
    case 'del': {
      const i = S.args.indexOf(a);
      const cl = S.clashes.filter(x => x.a === a.id || x.b === a.id);
      const refs = S.args.filter(x => x.to.includes(a.id));
      S.args.splice(i, 1);
      S.clashes = S.clashes.filter(x => !cl.includes(x));
      refs.forEach(x => (x.to = x.to.filter(y => y !== a.id)));
      toast('Argumento apagado', () => {
        S.args.splice(i, 0, a);
        S.clashes.push(...cl);
        refs.forEach(x => x.to.push(a.id));
        save();
        renderFlow();
      });
      break;
    }
    case 'clashFrom':
      $('#cA').value = a.id;
      $('#cB').scrollIntoView({ block: 'center' });
      $('#cB').focus();
      return;
    case 'setcur':
      S.cur = SP.findIndex(x => x.k === b.closest('[data-sp]').dataset.sp);
      $('#curSp').value = S.cur;
      resetT();
      break;
    case 'mob':
      mobTeam = b.dataset.v;
      renderFlow();
      return;
    case 'addClash': {
      const x = $('#cA').value,
        y = $('#cB').value;
      if (!x || !y || x === y) {
        toast('Escolha dois argumentos diferentes');
        return;
      }
      const A = S.args.find(z => z.id === x),
        B = S.args.find(z => z.id === y);
      if (teamOf(A) === teamOf(B)) {
        toast('Os dois argumentos são da mesma equipe');
        return;
      }
      S.clashes.push({ id: uid(), a: x, b: y, cmp: '', win: '', why: '' });
      break;
    }
    case 'ccmp':
      c.cmp = c.cmp === b.dataset.v ? '' : b.dataset.v;
      break;
    case 'cwin':
      c.win = c.win === b.dataset.v ? '' : b.dataset.v;
      break;
    case 'cdel': {
      const i = S.clashes.indexOf(c);
      S.clashes.splice(i, 1);
      toast('Confronto apagado', () => {
        S.clashes.splice(i, 0, c);
        save();
        renderFlow();
      });
      break;
    }
    case 'addJ':
      S.panel.others.push({ name: 'Juiz ' + (S.panel.others.length + 2), role: 'wing' });
      S.wv.push(blankPairs());
      S.wadv.push([]);
      save();
      renderSetup();
      return;
    case 'my': {
      const k = b.dataset.k;
      S.my[k].w = S.my[k].w === b.dataset.v ? '' : b.dataset.v;
      save();
      renderMyPairs();
      renderWings();
      renderDerived();
      return;
    }
    case 'conf': {
      const k = b.dataset.k;
      S.my[k].c = S.my[k].c === b.dataset.v ? '' : b.dataset.v;
      save();
      renderMyPairs();
      renderDerived();
      return;
    }
    case 'wv': {
      const P = S.wv[+b.dataset.i];
      const k = b.dataset.k;
      P[k] = P[k] || { w: '', why: '' };
      P[k].w = P[k].w === b.dataset.v ? '' : b.dataset.v;
      save();
      renderWings();
      renderDerived();
      return;
    }
    case 'adv': {
      const who = b.dataset.who;
      const L = who === 'me' ? S.myAdv : S.wadv[+who.slice(1)];
      const t = b.dataset.v;
      const i = L.indexOf(t);
      if (i >= 0) L.splice(i, 1);
      else {
        if (L.length >= need()) L.shift();
        L.push(t);
      }
      save();
      if (who === 'me') renderAdvBox();
      else renderWings();
      renderDerived();
      return;
    }
    case 'advTie': {
      const t = b.dataset.v;
      const i = S.advTie.indexOf(t);
      if (i >= 0) S.advTie.splice(i, 1);
      else S.advTie.push(t);
      save();
      renderDerived();
      return;
    }
    case 'quick': {
      const who = b.dataset.who;
      const sel = [...document.querySelectorAll(who === 'my' ? '[data-qpos="my"]' : `[data-wpos="${who}"]`)].map(s => [
        s.dataset.t,
        +s.value
      ]);
      const pos = Object.fromEntries(sel);
      const vals = Object.values(pos);
      if (vals.some(v => !v) || new Set(vals).size !== 4) {
        toast('Dê uma posição diferente para cada equipe');
        return;
      }
      const P = who === 'my' ? S.my : S.wv[+who];
      PAIRS.forEach(([x, y]) => {
        const k = pk(x, y);
        P[k] = P[k] || { w: '', why: '' };
        P[k].w = pos[x] < pos[y] ? x : y;
      });
      save();
      renderDelib();
      return;
    }
    case 'tieUp': {
      const order = panelResult().steps.map(s => s.r.k);
      const i = order.indexOf(b.dataset.k);
      [order[i - 1], order[i]] = [order[i], order[i - 1]];
      S.tie = order;
      save();
      renderDerived();
      return;
    }
    case 'copyOA':
      navigator.clipboard?.writeText($('#oa').textContent).then(
        () => toast('Roteiro copiado'),
        () => toast('Selecione o texto e copie')
      );
      return;
    default:
      r = false;
  }
  if (r && S) {
    save();
    renderFlow();
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.act === 'link') {
    const a = argOf(t);
    if (t.value) {
      a.to.push(t.value);
      if (a.kind === 'c') a.kind = 'r';
    }
    save();
    renderFlow();
    return;
  }
  if (t.dataset.act === 'kind') {
    argOf(t).kind = t.value;
    save();
    return;
  }
  if (t.dataset.q) {
    window._cf = window._cf || { t: '', s: '', r: '', q: '' };
    window._cf[t.dataset.q] = t.value;
    runQuery();
    return;
  }
  if (t.id === 'mStage') {
    S.stage = t.value;
    S.speaksOn = t.value === 'preliminar';
    save();
    renderSetup();
    return;
  }
  if (t.id === 'mSpk') {
    S.speaksOn = t.checked;
    save();
    return;
  }
  if (t.dataset.mer) {
    S.panel.me.role = t.value;
    save();
    return;
  }
  if (t.dataset.wr !== undefined) {
    S.panel.others[+t.dataset.wr].role = t.value;
    save();
    return;
  }
  if (t.id === 'curSp') {
    S.cur = +t.value;
    save();
    resetT();
    renderFlow();
    return;
  }
  if (route.v === 'delib') renderDerived();
});
document.addEventListener('input', e => {
  const t = e.target;
  {
    const fa = t.closest && t.closest('form.add');
    if (fa && D) {
      try {
        if (t.value) localStorage.setItem('bp.draft.' + D.id + '.' + fa.dataset.sp, t.value);
        else localStorage.removeItem('bp.draft.' + D.id + '.' + fa.dataset.sp);
        BPS.mark('bp.draft.' + D.id + '.' + fa.dataset.sp);
      } catch (x) {}
      return;
    }
  }
  if (t.dataset.q === 'q') {
    window._cf = window._cf || { t: '', s: '', r: '', q: '' };
    window._cf.q = t.value;
    clearTimeout(window._qt);
    window._qt = setTimeout(runQuery, 250);
    return;
  }
  if (!S) return;
  const a = t.dataset.f && argOf(t);
  if (a) {
    a[t.dataset.f] = t.value;
    if (t.classList.contains('t')) {
      if (t.value.includes('\n')) {
        t.value = t.value.replace(/\n/g, ' ');
        a.title = t.value;
        t.blur();
      }
      fit(t);
    }
  } else if (t.dataset.cf) clashOf(t).why = t.value;
  else if (t.id === 'motion') S.motion = t.value;
  else if (t.id === 'mInfo') S.info = t.value;
  else if (t.id === 'mLabel') S.label = t.value;
  else if (t.id === 'mRound') S.round_no = t.value ? +t.value : null;
  else if (t.dataset.me) S.panel.me.name = t.value;
  else if (t.dataset.w !== undefined) S.panel.others[+t.dataset.w].name = t.value;
  else if (t.dataset.tn) S.teams[t.dataset.tn].name = t.value;
  else if (t.dataset.sn) S.teams[t.dataset.sn].sp[+t.dataset.i] = t.value;
  else if (t.dataset.my) S.my[t.dataset.my].why = t.value;
  else if (t.dataset.wwhy !== undefined) {
    const P = S.wv[+t.dataset.wwhy];
    P[t.dataset.k] = P[t.dataset.k] || { w: '', why: '' };
    P[t.dataset.k].why = t.value;
  } else if (t.dataset.spk) {
    S.speaks[t.dataset.spk] = S.speaks[t.dataset.spk] || {};
    S.speaks[t.dataset.spk][t.dataset.k] = t.value;
    renderDerived();
  } else return;
  save();
});
