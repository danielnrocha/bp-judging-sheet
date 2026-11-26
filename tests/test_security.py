"""Adversarial checks. Serve the repo first: python -m http.server 8765 (from the repo root)."""
import json,sys
from playwright.sync_api import sync_playwright
P='http://localhost:8765/index.html'
PAY='"><img src=x onerror="window.__pwned=(window.__pwned||0)+1"></textarea><svg onload="window.__pwned=9"><script>window.__pwned=7</script>${window.__pwned=5}'
def check(pg,where):
    n=pg.evaluate("window.__pwned||0");imgs=pg.evaluate("document.querySelectorAll('img[src=x],svg[onload]').length")
    print(('OK  ' if not n and not imgs else 'FAIL')+f' {where}: executed={n} injected_nodes={imgs}');return not n and not imgs
allok=True
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for lang in ['pt','en']:
        pg=b.new_page(viewport={'width':1300,'height':900})
        pg.route('**/supabase.min.js',lambda r:r.fulfill(body='',content_type='application/javascript'))
        pg.add_init_script(f"localStorage.setItem('bp.lang','{lang}')");pg.add_init_script(path=str(__import__('pathlib').Path(__file__).resolve().parent/'mock.js'))
        pg.on('pageerror',lambda e:print('PAGEERR',lang,str(e)[:300]));pg.on('dialog',lambda d:(print('FAIL dialog opened',d.message),d.dismiss()))
        pg.goto(P);pg.wait_for_timeout(400)
        pg.click('[data-act=newT]');pg.fill('#fName',PAY);pg.fill('#fL',PAY);pg.fill('#fN',PAY);pg.click('[data-act=saveT]');pg.wait_for_timeout(400)
        allok&=check(pg,lang+' tournament view')
        pg.click('[data-act=newD][data-stage=preliminar]');pg.wait_for_timeout(500)
        pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
        # fill every text input / textarea in the debate view
        for sel in ['#v-ficha input[type=text]:visible, #v-ficha input:not([type]):visible','#v-ficha textarea:visible','#dbar input:visible']:
            for h in pg.query_selector_all(sel):
                try: h.fill(PAY)
                except Exception: pass
        for sp in ['PM','LO','MG','OW']:
            pg.fill(f'form.add[data-sp="{sp}"] input',PAY);pg.press(f'form.add[data-sp="{sp}"] input','Enter');pg.wait_for_timeout(80)
        # open every argument's details and fill them
        for h in pg.query_selector_all('[data-act=toggle]'):
            try: h.click();pg.wait_for_timeout(50)
            except Exception: pass
        for h in pg.query_selector_all('#v-ficha textarea:visible, #v-ficha input:visible'):
            try:
                if h.get_attribute('type') not in ('checkbox','number','file'): h.fill(PAY)
            except Exception: pass
        # a clash
        try:
            opts=pg.eval_on_selector_all('#cA option','os=>os.map(o=>o.value)')
            pg.select_option('#cA',opts[0]);pg.select_option('#cB',opts[1]);pg.click('[data-act=addClash]');pg.wait_for_timeout(200)
            for h in pg.query_selector_all('#clashes textarea, #clashes input'):
                h.fill(PAY)
        except Exception as e: print('clash step',e)
        pg.wait_for_timeout(1200);allok&=check(pg,lang+' debate flow')
        pg.reload();pg.wait_for_timeout(700);allok&=check(pg,lang+' debate after reload')
        pg.click('#dTabs a[data-v=delib]');pg.wait_for_timeout(400)
        for h in pg.query_selector_all('#v-delib textarea, #v-delib input[type=text], #v-delib input:not([type])'):
            try: h.fill(PAY)
            except Exception: pass
        for t,v in zip(['OG','OO','CG','CO'],['2','4','1','3']): pg.select_option(f'[data-qpos="my"][data-t="{t}"]',v)
        pg.click('[data-act=quick][data-who=my]');pg.wait_for_timeout(500)
        allok&=check(pg,lang+' deliberation + oral script')
        pg.goto(P+'#/');pg.wait_for_timeout(500);allok&=check(pg,lang+' home list')
        pg.goto(P+'#/consultas');pg.wait_for_timeout(600);pg.fill('#qQ','img');pg.wait_for_timeout(500);allok&=check(pg,lang+' queries + search hits')
        pg.click('#mainTabs a[data-v=treinos]');pg.wait_for_timeout(300);pg.click('[data-act=newTr]');pg.select_option('#fScope','parceria');pg.fill('#fP',PAY);pg.fill('#fName',PAY);pg.click('[data-act=saveT]');pg.wait_for_timeout(500)
        pg.goto(P+'#/treinos');pg.wait_for_timeout(500);allok&=check(pg,lang+' practices')
        pg.goto(P+'#/consultas');pg.wait_for_timeout(500);allok&=check(pg,lang+' queries with practice filter options')
        # storage modal with payload URL
        pg.click('#stBtn');pg.fill('#cfU',PAY);pg.fill('#cfK','k');pg.click('#cfSave');pg.wait_for_timeout(200);allok&=check(pg,lang+' storage modal')
        dump=pg.evaluate("JSON.stringify({tournaments:__db.bp_tournaments,debates:__db.bp_debates})")
        pg.close()
    # malicious import into local mode
    pg=b.new_page();pg.route('**/supabase.min.js',lambda r:r.fulfill(body='',content_type='application/javascript'))
    pg.goto(P);pg.wait_for_timeout(400)
    evil={'tournaments':[{'id':'t1','name':PAY,'location':PAY,'kind':'treino','scope':'<b>x','partner':PAY}],'debates':[{'id':'d1','tournament_id':'t1','stage':'x','motion':PAY,'label':PAY,'round_no':'<b>','my_role':'x','data':{'motion':PAY,'args':[{'id':'a1','sp':'PM','title':PAY,'q':PAY,'kind':PAY,'res':PAY,'to':['<img>']},{'id':'a2','sp':'LO','title':PAY}],'teams':{'OG':{'name':PAY,'sp':[PAY,PAY]}},'panel':{'me':{'name':PAY,'role':'chair'},'others':[{'name':PAY,'role':'wing'}]},'clashes':[{'id':'c1','a':'a1','b':'a2','why':PAY,'win':PAY,'cmp':PAY}]},'result':{}}]};evil['debates'][0]['stage']='<img src=x onerror=window.__pwned=1>';evil['debates'][0]['my_role']='<svg onload=window.__pwned=2>'
    evil['debates'][0]['data']['args'][0]['sp']='<img src=x onerror=window.__pwned=3>'
    evil['debates'][0]['data']['teams']['OG']['sp']=['<img src=x onerror=window.__pwned=4>','x']
    evil['debates'][0]['result']={'order':['<img src=x onerror=window.__pwned=6>','OG','OO','CG'],'speaks':{'<img src=x onerror=window.__pwned=8>':'75'}}
    open(__import__('tempfile').gettempdir()+'/evil.json','w').write(json.dumps(evil))
    pg.goto(P+'#/consultas');pg.wait_for_timeout(500)
    with pg.expect_file_chooser() as fc: pg.click('#impBtn')
    fc.value.set_files(__import__('tempfile').gettempdir()+'/evil.json');pg.wait_for_timeout(1500)
    print('import toast:',pg.inner_text('#tmsg'))
    for h in ['#/','#/consultas','#/treinos']:
        pg.goto(P+h);pg.wait_for_timeout(500);allok&=check(pg,'evil import '+h)
    ids=pg.evaluate("new Promise(r=>{const q=indexedDB.open('bp-data',1);q.onsuccess=()=>{const g=q.result.transaction('kv').objectStore('kv').get('db');g.onsuccess=()=>r((g.result||{bp_debates:[]}).bp_debates.map(d=>d.id))}})")
    for i in ids:
        for v in ['','/delib']:
            try:
                pg.goto(P+'#/d/'+i+v);pg.wait_for_timeout(600);allok&=check(pg,'evil debate '+v)
            except Exception as e: print('ERR',e)
    errs=[]
    b.close()
print('ALL OK' if allok else 'SOME FAILED')
