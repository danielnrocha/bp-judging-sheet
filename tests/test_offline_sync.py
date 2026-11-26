"""Supabase mode (mocked): edits made while offline stay on the device and sync when the connection returns."""
import pathlib
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
P=(ROOT/'index.html').as_uri()
def ok(c,msg):
    print(('OK   ' if c else 'FAIL ')+msg);assert c,msg
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/supabase.min.js',lambda r:r.fulfill(body='',content_type='application/javascript'))
    pg.add_init_script(path=str(ROOT/'tests'/'mock.js'))
    pg.goto(P);pg.wait_for_timeout(500)
    pg.click('[data-act=newT]');pg.fill('#fName','T');pg.click('[data-act=saveT]');pg.wait_for_timeout(400)
    pg.click('[data-act=newD][data-stage=preliminar]');pg.wait_for_timeout(500)
    pg.evaluate("window.__offline=true");pg.fill('#motion','feita sem internet');pg.wait_for_timeout(1500)
    ok('Sem conexão' in pg.inner_text('#saveSt'),'offline status shown: '+pg.inner_text('#saveSt'))
    ok(pg.evaluate("__db.bp_debates[0].motion")!='feita sem internet','server not updated while offline')
    # reopen the debate while still offline: falls back to the copy on this device
    pg.evaluate("window.__offline=false;window.dispatchEvent(new Event('online'))");pg.wait_for_timeout(800)
    ok(pg.evaluate("__db.bp_debates[0].motion")=='feita sem internet','synced after connection returns')
    ok('Salvo' in pg.inner_text('#saveSt'),'status back to Salvo')
    # open debate while the server is unreachable -> uses local copy
    did=pg.evaluate("__db.bp_debates[0].id");pg.goto(P+'#/');pg.wait_for_timeout(400)
    pg.evaluate("window.__offline=true");pg.goto(P+'#/d/'+did);pg.wait_for_timeout(800)
    ok(pg.input_value('#motion')=='feita sem internet','debate opens from device copy when offline')
    ok(not errs,'no page errors '+str(errs))
    b.close()
