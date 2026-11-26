import pathlib
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
P=(ROOT/'index.html').as_uri()
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':900},accept_downloads=True)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/supabase.min.js',lambda r:r.fulfill(body='',content_type='application/javascript'))
    pg.add_init_script(path=str(ROOT/'tests'/'mock.js'))
    pg.goto(P);pg.wait_for_timeout(500)
    pg.click('[data-act=newT]');pg.fill('#fName','Torneio X');pg.click('[data-act=saveT]');pg.wait_for_timeout(400)
    pg.click('#mainTabs a[data-v=treinos]');pg.wait_for_timeout(400)
    assert 'Nenhum treino ainda' in pg.inner_text('#v-treinos')
    pg.click('[data-act=newTr]');pg.select_option('#fScope','parceria');pg.fill('#fP','SD Parceira');pg.click('[data-act=saveT]');pg.wait_for_timeout(500)
    head=pg.inner_text('#v-tour');print('TOUR:',head[:160].replace('\n',' | '))
    assert 'Parceria com outra SD' in head and 'SD Parceira' in head and 'Debate 1' in head
    pg.click('[data-act=newD][data-stage=preliminar]');pg.wait_for_timeout(500)
    assert pg.inner_text('#backT')=='← Treino'
    pg.fill('#motion','EC proibiria X');pg.wait_for_timeout(1200)
    pg.click('#dTabs a[data-v=delib]');pg.wait_for_timeout(300);print('DELIB:',pg.inner_text('#delibTitle'))
    pg.click('#mainTabs a[data-v=treinos]');pg.wait_for_timeout(300)
    pg.click('#mainTabs a[data-v=treinos]');pg.click('[data-act=newTr]');pg.select_option('#fScope','interno');pg.click('[data-act=saveT]');pg.wait_for_timeout(500)
    pg.goto(P+'#/treinos');pg.wait_for_timeout(500);t=pg.inner_text('#v-treinos');print('LIST:',t.replace('\n',' | ')[:300])
    pg.click('[data-act=trf][data-v=interno]');pg.wait_for_timeout(300);assert 'SD Parceira' not in pg.inner_text('#v-treinos .cards')
    pg.goto(P+'#/');pg.wait_for_timeout(400);h=pg.inner_text('#v-home');assert 'Torneio X' in h and 'Treino' not in h,h
    pg.goto(P+'#/consultas');pg.wait_for_timeout(500);pg.select_option('#qK','treino');pg.wait_for_timeout(300)
    print('Q treino:',pg.inner_text('#qOut .kpis').replace('\n',' '))
    pg.select_option('#qK','torneio');pg.wait_for_timeout(300);print('Q torneio:',pg.inner_text('#qOut .kpis').replace('\n',' '))
    with pg.expect_download() as d: pg.click('[data-act=exp][data-v=deb]')
    print(open(d.value.path()).read()[:260])
    print('ERRS',errs);assert not errs
    b.close()
