"""Ficha v2: ligações tipadas (arrastar e sintaxe rápida), clashes e métricas, lentes, foco,
modal da bancada, cronômetro configurável, atalhos e Tabbycat (API simulada)."""
import json, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
P = (ROOT / 'index.html').as_uri()
TAB = 'https://demo.calicotab.com/mytour'
API = 'https://demo.calicotab.com/api/v1/tournaments/mytour'
U = lambda p: API + p
fails = []


def check(name, cond, extra=''):
    print(('OK   ' if cond else 'FAIL ') + name + (' ' + str(extra) if extra and not cond else ''))
    if not cond:
        fails.append(name)


FIX = {
    '/me': {'name': 'Ana Juíza', 'url': U('/adjudicators/7')},
    '/rounds': [
        {'seq': 1, 'name': 'Round 1', 'abbreviation': 'R1', 'stage': 'P', 'draw_status': 'R', 'completed': True, 'motions': []},
        {'seq': 2, 'name': 'Round 2', 'abbreviation': 'R2', 'stage': 'P', 'draw_status': 'R', 'completed': False,
         'motions': [{'seq': 1, 'text': 'Esta Casa proibiria apostas esportivas', 'info_slide': '<p>Info <b>slide</b></p>', 'info_slide_plain': ''}]},
    ],
    '/rounds/2/pairings': [
        {'venue': U('/venues/3'), 'teams': [{'team': U('/teams/%d' % i), 'side': s} for i, s in zip([1, 2, 3, 4], ['og', 'oo', 'cg', 'co'])],
         'adjudicators': {'chair': U('/adjudicators/9'), 'panellists': [U('/adjudicators/7')], 'trainees': [U('/adjudicators/8')]}},
        {'venue': U('/venues/4'), 'teams': [{'team': U('/teams/%d' % i), 'side': s} for i, s in zip([5, 6, 7, 8], [0, 1, 2, 3])],
         'adjudicators': {'chair': U('/adjudicators/10'), 'panellists': [], 'trainees': []}},
    ],
    '/teams': [{'url': U('/teams/%d' % i), 'short_name': 'Time %d' % i, 'speakers': [{'name': 'Orador %da' % i}, {'name': 'Orador %db' % i}]} for i in range(1, 9)],
    '/adjudicators': [{'url': U('/adjudicators/%d' % i), 'name': n} for i, n in [(7, 'Ana Juíza'), (8, 'Beto Trainee'), (9, 'Carla Chair'), (10, 'Davi')]],
    '/venues': [{'url': U('/venues/3'), 'display_name': 'Sala 101'}, {'url': U('/venues/4'), 'display_name': 'Sala 102'}],
}
seen_auth = []


def tab_route(route):
    req = route.request
    path = req.url.split('/mytour', 1)[1].split('?')[0]
    if req.method == 'OPTIONS':
        return route.fulfill(status=200, headers={'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,accept'})
    if path == '/me':
        seen_auth.append(req.headers.get('authorization'))
    body = FIX.get(path)
    if body is None:
        return route.fulfill(status=404, body='{}', headers={'Access-Control-Allow-Origin': '*'})
    route.fulfill(status=200, body=json.dumps(body), content_type='application/json', headers={'Access-Control-Allow-Origin': '*'})


def drag(pg, src, dst):
    a = pg.locator(src).bounding_box()
    b = pg.locator(dst).bounding_box()
    pg.mouse.move(a['x'] + a['width'] / 2, a['y'] + a['height'] / 2)
    pg.mouse.down()
    pg.mouse.move(a['x'] + 30, a['y'] + 30, steps=4)
    pg.mouse.move(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2, steps=8)
    pg.mouse.up()
    pg.wait_for_timeout(150)


S = lambda pg, js: pg.evaluate('(()=>{const S=window.__bp.S;return ' + js + '})()')

with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={'width': 1400, 'height': 1000})
    ctx.route('https://demo.calicotab.com/**', tab_route)
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    dlg = {'accept': True, 'seen': []}

    def on_dialog(d):
        dlg['seen'].append(d.message)
        d.accept() if dlg['accept'] else d.dismiss()
    pg.on('dialog', on_dialog)
    pg.goto(P)
    pg.wait_for_timeout(500)
    pg.click('[data-act=newT]'); pg.fill('#fName', 'Torneio V2'); pg.click('[data-act=saveT]'); pg.wait_for_timeout(300)
    pg.click('[data-act=newD][data-stage=preliminar]'); pg.wait_for_timeout(600)

    # --- Tabbycat pela URL privada
    pg.fill('#tabUrl', TAB + '/privateurls/abc123xyz/')
    pg.click('[data-act=tabPull]')
    pg.wait_for_timeout(800)
    msg = pg.inner_text('#tabMsg')
    check('tabby: pulled message', 'Tabbycat' in msg and 'Round 2' in msg, msg)
    check('tabby: Key header sent', seen_auth and seen_auth[-1] == 'Key abc123xyz', seen_auth)
    check('tabby: motion', S(pg, 'S.motion') == 'Esta Casa proibiria apostas esportivas')
    check('tabby: info slide from html', S(pg, 'S.info') == 'Info slide')
    check('tabby: round', S(pg, 'S.round_no') == 2 and S(pg, 'S.stage') == 'preliminar')
    check('tabby: teams', S(pg, 'S.teams.OG.name') == 'Time 1' and S(pg, 'S.teams.CO.sp[1]') == 'Orador 4b')
    check('tabby: me as wing', S(pg, 'S.panel.me') == {'name': 'Ana Juíza', 'role': 'wing'}, S(pg, 'S.panel.me'))
    check('tabby: others', S(pg, 'S.panel.others') == [{'name': 'Carla Chair', 'role': 'chair'}, {'name': 'Beto Trainee', 'role': 'trainee'}], S(pg, 'S.panel.others'))
    check('tabby: room', S(pg, 'S.label') == 'Sala 101')
    check('tabby: datalist', pg.locator('#dlSpk option').count() == 16)
    check('tabby: url kept local, not in debate data', 'privateurls' not in json.dumps(S(pg, 'S')))
    # escolher outra sala manualmente
    pg.select_option('#tabRoom', '1'); pg.wait_for_timeout(200)
    check('tabby: manual room pick (int sides)', S(pg, 'S.teams.OG.name') == 'Time 5' and S(pg, 'S.label') == 'Sala 102')
    check('tabby: asks before replacing a filled sheet', any('substituir' in m for m in dlg['seen']), dlg['seen'])
    pg.select_option('#tabRoom', '0'); pg.wait_for_timeout(200)
    # recusar a confirmação não muda nada
    dlg['accept'] = False
    pg.select_option('#tabRoom', '1'); pg.wait_for_timeout(200)
    check('tabby: declining keeps the sheet', S(pg, 'S.label') == 'Sala 101' and S(pg, 'S.teams.OG.name') == 'Time 1')
    dlg['accept'] = True
    # votos seguem o juiz pelo nome, não pela posição
    pg.evaluate("""(()=>{const S=window.__bp.S;
      S.panel.others=[{name:'Beto Trainee',role:'trainee'},{name:'Carla Chair',role:'chair'}];
      S.wv=[blankPairs(),blankPairs()];S.wv[1]['OG-OO'].w='OO';S.wadv=[[],['OG']];})()""")
    pg.select_option('#tabRoom', '0'); pg.wait_for_timeout(200)
    check('tabby: votes follow judge by name', S(pg, "S.wv[0]['OG-OO'].w") == 'OO' and S(pg, "S.wv[1]['OG-OO'].w") == '' and S(pg, 'S.wadv[0]') == ['OG'],
          S(pg, "[S.panel.others, S.wv.map(p=>p['OG-OO'].w), S.wadv]"))
    # juiz com voto que saiu do painel: avisa antes de descartar
    dlg['seen'].clear()
    pg.evaluate("""(()=>{const S=window.__bp.S;
      S.panel.others=[{name:'Wing 1',role:'wing'}];S.wv=[blankPairs()];S.wv[0]['OG-OO'].w='OG';S.wadv=[[]];})()""")
    pg.select_option('#tabRoom', '0'); pg.wait_for_timeout(200)
    check('tabby: warns about dropped votes', any('Wing 1' in m for m in dlg['seen']), dlg['seen'])
    check('tabby: Wing 1 vote not given to Carla', S(pg, "S.wv.every(p=>!p['OG-OO'].w)"))
    # info slide hostil não executa nada
    pg.evaluate('h=>stripHtml(h)', '<img src=x onerror="window.__pwned=1">oi')
    pg.wait_for_timeout(300)
    check('tabby: stripHtml is inert', pg.evaluate('window.__pwned') is None and pg.evaluate("stripHtml('<b>a</b> b')") == 'a b')
    pg.evaluate("document.querySelector('#setupBox').open=false")

    # --- anotar com sintaxe rápida
    def add(sp, text):
        pg.fill(f'form.add[data-sp="{sp}"] input', text)
        pg.press(f'form.add[data-sp="{sp}"] input', 'Enter')
        pg.wait_for_timeout(80)
    add('PM', 'Apostas viciam !')
    add('PM', 'Estado perde receita')
    add('LO', '>PM1 Vício já existe sem apostas legais')
    add('LO', '~PM2 Receita vira gasto com saúde ?')
    add('DPM', '+PM1 Publicidade mira jovens')
    add('MG', '^3PM1 Mecanismo neurológico do vício')
    A = S(pg, 'S.args.map(a=>({t:a.title,q:a.q,l:a.links,k:a.kind,to:a.to}))')
    check('quick: strong mark', A[0]['q'] == 'f' and A[0]['t'] == 'Apostas viciam')
    check('quick: responds', A[2]['l'] == [{'id': S(pg, 'S.args[0].id'), 't': 'r'}] and A[2]['k'] == 'r', A[2])
    check('quick: flips + weak', A[3]['l'][0]['t'] == 'f' and A[3]['q'] == 'w' and A[3]['t'] == 'Receita vira gasto com saúde')
    check('quick: complements', A[4]['l'][0]['t'] == 'c')
    check('quick: verticalizes strong', A[5]['l'][0] == {'id': S(pg, 'S.args[0].id'), 't': 'v', 's': 3} and A[5]['k'] == 'x')
    check('to kept in sync (r+f only)', A[2]['to'] and A[3]['to'] and not A[4]['to'] and not A[5]['to'])
    check('flipped badge', 'flipado' in pg.inner_text('.arg[data-id="%s"]' % S(pg, 'S.args[1].id')))

    # --- arrastar para ligar
    ids = S(pg, 'S.args.map(a=>a.id)')
    add('DLO', 'Regulação resolve')
    dlo = S(pg, 'S.args[6].id')
    drag(pg, f'.arg[data-id="{dlo}"] .grip', f'.arg[data-id="{ids[4]}"]')
    check('drag: popover', pg.locator('.pop').count() == 1)
    pop = pg.inner_text('.pop')
    check('drag: opposite-side options', 'Responde' in pop and 'Flipa' in pop and 'Confronto' in pop, pop)
    pg.keyboard.press('2'); pg.wait_for_timeout(150)
    check('drag: flip via key', S(pg, f'S.args[6].links') == [{'id': ids[4], 't': 'f'}])
    # mesmo lado: CG -> OG oferece verticaliza
    drag(pg, f'.arg[data-id="{ids[5]}"] .grip', f'.arg[data-id="{ids[1]}"]')
    pop = pg.inner_text('.pop')
    check('drag: same-side options', 'Verticaliza' in pop and 'Complementa' in pop and 'Responde' not in pop, pop)
    pg.click('.pop [data-act=lk][data-s="1"]'); pg.wait_for_timeout(150)
    check('drag: verticalize weak', {'id': ids[1], 't': 'v', 's': 1} in S(pg, 'S.args[5].links'))
    drag(pg, f'.arg[data-id="{ids[2]}"] .grip', f'.arg[data-id="{ids[0]}"]')
    pg.click('.pop [data-t=clash]'); pg.wait_for_timeout(150)
    check('drag: creates clash', S(pg, 'S.clashes.length') == 1)

    # --- clashes e métricas
    pg.fill('form.axadd input', 'Vício x liberdade'); pg.press('form.axadd input', 'Enter'); pg.wait_for_timeout(100)
    pg.fill('form.axadd input', 'm: quem é mais vulnerável'); pg.press('form.axadd input', 'Enter'); pg.wait_for_timeout(100)
    check('axes: created with kind', S(pg, 'S.axes.map(x=>x.kind)') == ['c', 'm'])
    ax0 = S(pg, 'S.axes[0].id')
    drag(pg, f'.arg[data-id="{ids[0]}"] .grip', f'.axchip[data-ax="{ax0}"]')
    check('axes: drag arg to axis', S(pg, f'S.args[0].ax["{ax0}"]') == 2)
    add('MO', 'Liberdade individual #1')
    check('axes: quick #1', S(pg, f'S.args[7].ax["{ax0}"]') == 2)
    pq = lambda v: pg.evaluate('v=>parseQuick(v)', v)
    check('quick: #N mid-text stays text', pq('A regra #1 do mercado')['title'] == 'A regra #1 do mercado' and pq('A regra #1 do mercado')['ax'] == 0)
    check('quick: #N before ! still works', pq('Ideia #2 !') == {'title': 'Ideia', 'link': None, 'q': 'f', 'ax': 2}, pq('Ideia #2 !'))
    check('quick: \\#N is literal', pq('Ideia \\#2')['title'] == 'Ideia #2' and pq('Ideia \\#2')['ax'] == 0, pq('Ideia \\#2'))
    pg.click(f'.axchip[data-ax="{ax0}"] .axmain'); pg.wait_for_timeout(100)
    check('axes: highlight dims others', pg.locator('#flow.focusing').count() == 1 and pg.locator('#flow .arg.hit').count() == 2)
    pg.click(f'.axchip[data-ax="{ax0}"] .axmain')
    pg.click(f'.axchip[data-ax="{ax0}"] .axedit'); pg.wait_for_timeout(100)
    pg.click('#mbox [data-act=axrel][data-v="3"]'); pg.click('#mbox [data-act=axwin][data-v="OG"]')
    pg.fill('#axNote', 'OG mostrou o mecanismo')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
    check('axes: modal edits', S(pg, 'S.axes[0]')['rel'] == 3 and S(pg, 'S.axes[0]')['win'] == 'OG' and S(pg, 'S.axes[0]')['note'] == 'OG mostrou o mecanismo')
    check('axes: chip shows winner', 'OG' in pg.inner_text(f'.axchip[data-ax="{ax0}"]'))

    # --- lentes
    pg.click('[data-act=lens][data-v=ideia]'); pg.wait_for_timeout(150)
    txt = pg.inner_text('#lensIdea')
    check('lens idea: thread with flip/verticaliza', 'flipa' in txt and 'verticaliza (forte)' in txt and 'Contribuíram' in txt, txt[:300])
    check('lens idea: flow hidden', pg.is_hidden('#flow'))
    pg.click('[data-act=lens][data-v=metrica]'); pg.wait_for_timeout(150)
    txt = pg.inner_text('#lensAxis')
    check('lens metric: table', 'Vício x liberdade' in txt and 'soma 2' in txt and 'não engajou' in txt, txt[:300])
    pg.fill('#weigh', 'Vulnerabilidade pesa mais'); pg.wait_for_timeout(50)
    pg.click(f'[data-act=axmove][data-v="{S(pg, "S.axes[1].id")}"][data-d="-1"]'); pg.wait_for_timeout(100)
    check('lens metric: reorder + weigh', S(pg, 'S.axes[0].kind') == 'm' and S(pg, 'S.weigh') == 'Vulnerabilidade pesa mais')
    pg.keyboard.press('v'); pg.wait_for_timeout(100)
    check('shortcut V cycles lens', pg.is_visible('#flow'))

    # --- foco e seleção
    pg.click(f'.arg[data-id="{ids[0]}"] .chips', position={'x': 2, 'y': 2}); pg.wait_for_timeout(80)
    pg.keyboard.press('f'); pg.wait_for_timeout(100)
    hits = pg.locator('#flow .arg.hit').count()
    check('focus: selected + related lit, rest dimmed', pg.locator('#flow.focusing').count() == 1 and hits == 4, hits)
    pg.keyboard.press('3'); pg.wait_for_timeout(80)
    check('shortcut 3 = fraco on selected', S(pg, 'S.args[0].q') == 'w')
    pg.keyboard.press('c'); pg.wait_for_timeout(80)
    check('shortcut C = caiu', S(pg, 'S.args[0].res') == 'cai')
    pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(50)
    check('arrow moves selection', pg.locator('#flow .arg.sel').get_attribute('data-id') != ids[0])
    pg.keyboard.press('Escape'); pg.keyboard.press('f'); pg.wait_for_timeout(80)
    check('focus off', pg.locator('#flow.focusing').count() == 0)

    # --- cronômetro
    pg.click('#clock'); pg.wait_for_timeout(100)
    pg.click('#mbox [data-act=tcfg][data-k=len][data-v="300"]')
    pg.click('#mbox [data-act=tshift][data-v="30"]'); pg.wait_for_timeout(300)
    check('timer: shift +30', pg.inner_text('#clock') == '0:30', pg.inner_text('#clock'))
    pg.keyboard.press('Escape')
    cfg = pg.evaluate("JSON.parse(localStorage.getItem('bp.timer'))")
    check('timer: 5 min saved', cfg['len'] == 300, cfg)
    pg.keyboard.press('Equal'); pg.wait_for_timeout(300)
    check('timer: + key adds 10s', pg.inner_text('#clock') == '0:40', pg.inner_text('#clock'))
    pg.evaluate("(()=>{acc=305;tick()})()")
    check('timer: zone uses new length', pg.inner_text('#zone') == 'Tolerância', pg.inner_text('#zone'))
    pg.keyboard.press('r')

    # --- modal da bancada
    pg.click('.team.TOG .th'); pg.wait_for_timeout(150)
    t = pg.inner_text('#mbox')
    check('team modal: content', 'Opening Government' in t and 'Por discurso' in t and 'Vício x liberdade' in t and 'Orador 1a' in pg.input_value('#mbox [data-sn=OG][data-i="0"]'), t[:200])
    pg.fill('#mbox [data-tn=OG]', 'Time Novo'); pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    check('team modal: edits name', 'Time Novo' in pg.inner_text('.team.TOG .th'))

    # --- atalhos (ajuda) e deliberação
    pg.keyboard.press('Shift+Slash'); pg.wait_for_timeout(100)
    check('help modal', 'Atalhos' in pg.inner_text('#mbox') and 'verticaliza' in pg.inner_text('#mbox'))
    pg.keyboard.press('Escape')
    pg.keyboard.press('d'); pg.wait_for_timeout(500)
    ev = pg.inner_text('#myPairs')
    check('delib: typed links + axes in evidence', 'flipa' in ev and 'relevância' in ev, ev[:400])
    oa = pg.inner_text('#oa')

    # --- persistência e reload
    pg.wait_for_timeout(1200)
    pg.reload(); pg.wait_for_timeout(800)
    check('reload keeps links/axes', S(pg, 'S.axes.length') == 2 and S(pg, 'S.args[5].links.length') == 2 and S(pg, 'S.weigh') == 'Vulnerabilidade pesa mais')

    # --- inglês
    pg.evaluate("localStorage.setItem('bp.lang','en')"); pg.reload(); pg.wait_for_timeout(800)
    pg.goto(pg.url.replace('/delib', '')); pg.wait_for_timeout(600)
    en = pg.inner_text('#lensBar') + pg.inner_text('#axesBar')
    check('i18n: new UI in English', 'By speech' in en and 'clashes and metrics' in en.lower() and 'Focus' in en, en)
    flow = pg.inner_text('#flow')
    check('i18n: link labels in English', 'Deepened by' in flow and 'Flipped by' in flow, flow[:400])
    pg.evaluate("localStorage.setItem('bp.lang','pt')")
    check('no page errors', not errs, errs)
    b.close()
print('FAILS', len(fails), fails)

# atalho funciona logo depois de anotar e tocar no código de um cartão
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(); pg.goto(P); pg.wait_for_timeout(500)
    pg.click('[data-act=newT]'); pg.fill('#fName', 'T'); pg.click('[data-act=saveT]'); pg.wait_for_timeout(300)
    pg.click('[data-act=newD][data-stage=preliminar]'); pg.wait_for_timeout(500)
    pg.fill('form.add[data-sp="PM"] input', 'Ideia'); pg.press('form.add[data-sp="PM"] input', 'Enter'); pg.wait_for_timeout(100)
    pg.click('.arg .grip'); pg.keyboard.press('1'); pg.wait_for_timeout(100)
    ok = pg.evaluate('window.__bp.S.args[0].q') == 'f' and pg.input_value('form.add[data-sp="PM"] input') == ''
    print(('OK   ' if ok else 'FAIL ') + 'shortcut right after typing + tapping a card code')
    b.close()
