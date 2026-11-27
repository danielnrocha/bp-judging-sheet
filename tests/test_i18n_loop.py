"""Regression: in Spanish, adding a linked idea ("responde PM1") used to send the translation observer
into an endless loop ("responde a a a a PM1") and freeze the tab. Checks typed and dragged links,
in Spanish and English, and that the page keeps responding."""
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
P = (ROOT / 'index.html').as_uri()
fails = []


def check(name, cond, extra=''):
    print(('OK   ' if cond else 'FAIL ') + name + (' ' + str(extra) if extra and not cond else ''))
    if not cond:
        fails.append(name)


def drag(pg, src, dst):
    a = pg.locator(src).bounding_box()
    b = pg.locator(dst).bounding_box()
    pg.mouse.move(a['x'] + a['width'] / 2, a['y'] + a['height'] / 2)
    pg.mouse.down()
    pg.mouse.move(a['x'] + 30, a['y'] + 30, steps=4)
    pg.mouse.move(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2, steps=8)
    pg.mouse.up()
    pg.wait_for_timeout(150)


for lang, label in [('es', 'responde a PM1'), ('en', 'responds to PM1')]:
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(viewport={'width': 1400, 'height': 1000})
        ctx.add_init_script(f"try{{localStorage.setItem('bp.lang','{lang}')}}catch(e){{}}")
        pg = ctx.new_page()
        pg.set_default_timeout(8000)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(P)
        pg.wait_for_timeout(500)
        pg.click('[data-act=newT]'); pg.fill('#fName', 'T'); pg.click('[data-act=saveT]'); pg.wait_for_timeout(300)
        pg.click('[data-act=newD][data-stage=preliminar]'); pg.wait_for_timeout(500)
        pg.evaluate("document.querySelector('#setupBox').open=false")

        def add(sp, text):
            pg.fill(f'form.add[data-sp="{sp}"] input', text)
            pg.press(f'form.add[data-sp="{sp}"] input', 'Enter')
            pg.wait_for_timeout(150)

        add('PM', 'aaa')
        try:
            add('LO', '>PM1 bbb')
            alive = pg.evaluate('1+1') == 2
        except Exception:
            alive = False
        check(f'{lang}: page responsive after a typed link', alive)
        if not alive:
            continue  # aba travada: não dá nem para fechar o navegador de forma limpa
        txt = pg.inner_text('#flow')
        check(f'{lang}: link label translated once', label in txt and ' a a ' not in txt, txt[:300])
        add('DLO', 'ccc')
        ids = pg.evaluate('window.__bp.S.args.map(a=>a.id)')
        drag(pg, f'.arg[data-id="{ids[2]}"] .grip', f'.arg[data-id="{ids[0]}"]')
        pg.keyboard.press('1')
        pg.wait_for_timeout(300)
        check(f'{lang}: page responsive after a dragged link', pg.evaluate('window.__bp.S.args[2].links.length') == 1)
        check(f'{lang}: no page errors', not errs, errs)
        b.close()
print('FAILS', len(fails), fails)
