import pathlib
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
P=(ROOT/'index.html').as_uri()
EXPECT={'pt':('Torneios','Novo torneio'),'en':('Tournaments','New tournament'),'es':('Torneos','Nuevo torneo')}
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for lang,(tab,btn) in EXPECT.items():
        ctx=b.new_context();ctx.route('**/supabase.min.js',lambda r:r.fulfill(body='',content_type='application/javascript'))
        pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.add_init_script(f"localStorage.setItem('bp.lang','{lang}')")
        pg.goto(P);pg.wait_for_timeout(600)
        txt=pg.inner_text('body')
        assert tab in txt and btn in txt,(lang,txt[:300])
        pg.goto(P+'#/guia');pg.wait_for_timeout(400)
        print(lang,'ok |',pg.inner_text('#v-guia')[:70].replace('\n',' '),'| errors',errs)
        ctx.close()
    b.close()
