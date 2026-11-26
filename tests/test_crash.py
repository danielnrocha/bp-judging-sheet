"""Simulates a power cut: SIGKILLs the browser at several delays after typing and checks what survived.
Needs: python -m http.server 8765 (repo root) and pip install psutil.
"""
import os,time,shutil,psutil,sys
from playwright.sync_api import sync_playwright
URL='http://localhost:8765/index.html'
def newctx(pw,ud):
    c=pw.chromium.launch_persistent_context(ud,viewport={'width':1300,'height':900})
    c.route('**/supabase.min.js',lambda r:r.fulfill(body='',content_type='application/javascript'));c.route('https://fonts.*/**',lambda r:r.abort());return c
def kill(ud):
    for p in psutil.process_iter(['cmdline']):
        try:
            if p.info['cmdline'] and any('--user-data-dir='+ud in c for c in p.info['cmdline']): p.kill()
        except Exception: pass
    time.sleep(1)
    for f in ['SingletonLock','SingletonCookie','SingletonSocket']:
        try: os.remove(os.path.join(ud,f))
        except Exception: pass
mode=sys.argv[1] if len(sys.argv)>1 else 'kill';delay=int(sys.argv[2]) if len(sys.argv)>2 else 300
ud='/tmp/bpud2';shutil.rmtree(ud,ignore_errors=True)
with sync_playwright() as pw:
    ctx=newctx(pw,ud);pg=ctx.pages[0]
    pg.goto(URL);pg.wait_for_timeout(800)
    pg.click('[data-act=newT]');pg.fill('#fName','T'+mode);pg.click('[data-act=saveT]');pg.wait_for_timeout(400)
    pg.click('[data-act=newD][data-stage=preliminar]');pg.wait_for_timeout(600);url=pg.url
    pg.fill('#motion','MOCAO');pg.fill('form.add[data-sp="PM"] input','rasc')
    pg.wait_for_timeout(delay)
    ls=pg.evaluate("Object.keys(localStorage).join(',')")
    if mode=='kill': kill(ud)
    else: ctx.close()
    try: ctx.close()
    except Exception: pass
    ctx=newctx(pw,ud);pg=ctx.pages[0];pg.goto(url);pg.wait_for_timeout(2000)
    idb=pg.evaluate("(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('bp.cache'));return 'lsMotion='+(k?JSON.parse(localStorage.getItem(k)).motion:'-')})()")
    print('idb:',idb,'|',mode,delay,'| before:',ls[:80],'| after:',pg.evaluate("Object.keys(localStorage).join(',')")[:80],'| motion:',repr(pg.input_value('#motion') if pg.query_selector('#motion') else None))
    ctx.close()
