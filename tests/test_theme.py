"""Theme: follows the system, defaults to dark with no preference, sun/moon button overrides and syncs back."""
import pathlib
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
P=(ROOT/'index.html').as_uri()
def ok(c,msg):
    print(('OK   ' if c else 'FAIL ')+msg);assert c,msg
th=lambda pg:pg.evaluate("document.documentElement.dataset.theme")
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for scheme,expect in [('light','light'),('dark','dark')]:
        ctx=b.new_context(color_scheme=scheme);ctx.route('**/supabase.min.js',lambda r:r.fulfill(body='',content_type='application/javascript'))
        pg=ctx.new_page();pg.goto(P);pg.wait_for_timeout(400)
        ok(th(pg)==expect,f'system {scheme} -> {expect}')
        if scheme=='light':
            pg.click('#themeBtn');pg.wait_for_timeout(100);ok(th(pg)=='dark','button switches to dark')
            pg.reload();pg.wait_for_timeout(300);ok(th(pg)=='dark','choice kept after reload')
            pg.click('#themeBtn');pg.wait_for_timeout(100);ok(th(pg)=='light' and pg.evaluate("localStorage.getItem('bp.theme')") is None,'back to system: override cleared')
            pg.emulate_media(color_scheme='dark');pg.wait_for_timeout(200);ok(th(pg)=='dark','follows system change live')
            ok(pg.get_attribute('#themeBtn','aria-label')=='Mudar para tema claro','button label')
        ctx.close()
    b.close()
