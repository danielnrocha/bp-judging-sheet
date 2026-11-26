"""Resilience checks for local mode: reloads, multi-tab, drafts, IndexedDB restore, full storage, offline reload.
Needs the app served over http://localhost (service workers need a secure context):
    python -m http.server 8765   (from the repo root)   then   python tests/test_resilience.py
"""
from playwright.sync_api import sync_playwright
URL='http://localhost:8765/index.html'
def ok(c,msg):
    print(('OK   ' if c else 'FAIL ')+msg);assert c,msg
with sync_playwright() as pw:
    b=pw.chromium.launch()
    ctx=b.new_context(viewport={'width':1300,'height':900})
    ctx.route('**/supabase.min.js',lambda r:r.fulfill(body='',content_type='application/javascript'))
    ctx.route('https://fonts.*/**',lambda r:r.abort())
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL);pg.wait_for_timeout(800)
    pg.click('[data-act=newT]');pg.fill('#fName','T1');pg.click('[data-act=saveT]');pg.wait_for_timeout(400)
    pg.click('[data-act=newD][data-stage=preliminar]');pg.wait_for_timeout(600);durl=pg.url
    # 1. every keystroke survives an immediate reload
    pg.fill('#motion','Moção digitada');pg.reload();pg.wait_for_timeout(700)
    ok(pg.input_value('#motion')=='Moção digitada','motion survives immediate reload')
    # 2. half-typed idea (no Enter) survives reload and re-render
    pg.fill('form.add[data-sp="PM"] input','ideia pela metade');pg.reload();pg.wait_for_timeout(700)
    ok(pg.input_value('form.add[data-sp="PM"] input')=='ideia pela metade','half-typed idea survives reload')
    pg.press('form.add[data-sp="PM"] input','Enter');pg.wait_for_timeout(300)
    pg.reload();pg.wait_for_timeout(700)
    ok(pg.input_value('form.add[data-sp="PM"] input')=='','draft cleared after the idea is added')
    # 3. two tabs do not overwrite each other
    p2=ctx.new_page();p2.goto(URL);p2.wait_for_timeout(700)
    pg.goto(URL);pg.wait_for_timeout(500)
    pg.click('[data-act=newT]');pg.fill('#fName','Aba A');pg.click('[data-act=saveT]');pg.wait_for_timeout(400)
    p2.click('[data-act=newT]');p2.fill('#fName','Aba B');p2.click('[data-act=saveT]');p2.wait_for_timeout(400)
    pg.goto(URL);pg.wait_for_timeout(600);h=pg.inner_text('#v-home')
    ok('Aba A' in h and 'Aba B' in h and 'T1' in h,'two open tabs keep each other\'s data')
    p2.close()
    # 4. IndexedDB mirror restores data if localStorage loses it
    pg.wait_for_timeout(800)
    pg.evaluate("for(const k of Object.keys(localStorage))if(k.startsWith('bp.'))localStorage.removeItem(k)")
    pg.evaluate("sessionStorage.clear()");pg.goto(URL);pg.wait_for_timeout(3500)
    ok('Aba B' in pg.inner_text('#v-home'),'data restored from the IndexedDB mirror')
    # 5. full storage is shown loudly, never as "saved"
    pg.goto(durl);pg.wait_for_timeout(700)
    pg.evaluate("()=>{window.__set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(String(k).startsWith('bp.cache'))throw new DOMException('full','QuotaExceededError');return window.__set.call(this,k,v)}}")
    pg.fill('#motion','x');pg.wait_for_timeout(1500)
    ok('NÃO SALVO' in pg.inner_text('#saveSt'),'full storage shows NÃO SALVO')
    pg.evaluate("()=>{Storage.prototype.setItem=window.__set}")
    # 6. reload with no internet after the first visit
    pg.goto(URL);pg.wait_for_timeout(1500);pg.reload();pg.wait_for_timeout(1000)
    ctx.set_offline(True)
    pg.reload();pg.wait_for_timeout(1200)
    ok('Aba A' in pg.inner_text('body'),'app opens offline with its data')
    pg.goto(durl);pg.wait_for_timeout(800);pg.fill('#motion','offline edit');pg.reload();pg.wait_for_timeout(800)
    ok(pg.input_value('#motion')=='offline edit','edits work and persist offline')
    ctx.set_offline(False)
    ok(not errs,'no page errors '+str(errs))
    b.close()
