"""Adversarial checks for the deliberation logic."""
from playwright.sync_api import sync_playwright
P=(__import__('pathlib').Path(__file__).resolve().parent.parent/'index.html').as_uri()
R=[]
def ok(c,msg,extra=''):R.append(c);print(('OK   ' if c else 'FAIL ')+msg+('' if c else '  >> '+extra[:400]),flush=True)
def setup(pg,stage,me_role='chair',roles=('wing','wing')):
    pg.goto(P+'#/');pg.wait_for_timeout(200)
    if not pg.query_selector('.tcard'):
        pg.click('[data-act=newT]');pg.fill('#fName','T');pg.click('[data-act=saveT]');pg.wait_for_timeout(300)
    else: pg.click('.tcard >> nth=0');pg.wait_for_timeout(300)
    pg.click(f'[data-act=newD][data-stage={stage}]');pg.wait_for_timeout(500)
    pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
    pg.select_option('select[data-mer="1"]',me_role)
    for i,r in enumerate(roles):
        if not pg.query_selector(f'select[data-wr="{i}"]'): pg.click('[data-act=addJ]');pg.wait_for_timeout(100)
        pg.select_option(f'select[data-wr="{i}"]',r)
    pg.wait_for_timeout(200);pg.click('#dTabs a[data-v=delib]');pg.wait_for_timeout(400)
def rank(pg,who,order):  # order like ['CG','OG','CO','OO']
    attr='data-qpos="my"' if who=='my' else f'data-wpos="{who}"'
    for pos,t in enumerate(order,1): pg.select_option(f'[{attr}][data-t="{t}"]',str(pos))
    pg.click(f'[data-act=quick][data-who="{who}"]');pg.wait_for_timeout(250)
res=lambda pg:pg.inner_text('#panelRes')
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':900})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/supabase.min.js',lambda r:r.fulfill(body='',content_type='application/javascript'));pg.add_init_script(path=str(__import__('pathlib').Path(__file__).resolve().parent/'mock.js'))
    pg.goto(P);pg.wait_for_timeout(400)
    # S1 majority with split
    setup(pg,'preliminar');rank(pg,'my',['CG','OG','CO','OO']);rank(pg,'0',['OG','CG','CO','OO']);rank(pg,'1',['CG','OG','OO','CO'])
    t=res(pg);ok('Decisão com split' in t and pg.evaluate("__db.bp_debates.at(-1).result")['order']==['CG','OG','CO','OO'] if pg.wait_for_timeout(1200) is None else 0,'S1 3 judges majority -> CG>OG>CO>OO, split',t)
    # S2 Condorcet cycle, chair breaks by Ranked Pairs
    setup(pg,'preliminar');rank(pg,'my',['OG','OO','CG','CO']);rank(pg,'0',['OO','CG','OG','CO']);rank(pg,'1',['CG','OG','OO','CO']);pg.wait_for_timeout(1200)
    t=res(pg);o=pg.evaluate("__db.bp_debates.at(-1).result")
    print('S2 RESULT',o,'\n',t[-700:]);ok('Ranked Pairs' in t and o['order']==['OG','OO','CG','CO'],'S2 cycle OG>OO>CG>OG resolved by Ranked Pairs with chair order -> OG,OO,CG,CO',t+' '+str(o))
    # Manual Example B (5 judges)
    setup(pg,'preliminar',roles=('wing','wing','wing','wing'))
    rank(pg,'my',['OO','CG','OG','CO']);rank(pg,'0',['OG','OO','CG','CO']);rank(pg,'1',['CG','OG','OO','CO']);rank(pg,'2',['CG','OG','OO','CO']);rank(pg,'3',['OG','OO','CG','CO']);pg.wait_for_timeout(1200)
    o=pg.evaluate("__db.bp_debates.at(-1).result");ok(o['order']==['OG','OO','CG','CO'],'Manual Example B (5 judges) -> OG,OO,CG,CO as in the manual',str(o)+res(pg)[-300:])
    # S3 two judges disagree on everything: chair tiebreak
    setup(pg,'preliminar',roles=('wing','off'));rank(pg,'my',['OG','OO','CG','CO']);rank(pg,'0',['CO','CG','OO','OG']);pg.wait_for_timeout(1200)
    o=pg.evaluate("__db.bp_debates.at(-1).result");ok(o['order']==['OG','OO','CG','CO'],'S3 1x1 judges: chair breaks every tie',str(o))
    # S4 I am wing, judge 2 is chair
    setup(pg,'preliminar',me_role='wing',roles=('chair','off'));rank(pg,'my',['OG','OO','CG','CO']);rank(pg,'0',['CO','CG','OO','OG']);pg.wait_for_timeout(1200)
    o=pg.evaluate("__db.bp_debates.at(-1).result");ok(o['order']==['CO','CG','OO','OG'] and o.get('me_minority'),'S4 me as wing: other chair breaks ties, I am in minority',str(o))
    # S5 trainee does not vote
    setup(pg,'preliminar',roles=('trainee','off'));rank(pg,'my',['OG','OO','CG','CO']);rank(pg,'0',['CO','CG','OO','OG']);pg.wait_for_timeout(1200)
    o=pg.evaluate("__db.bp_debates.at(-1).result");ok(o['order']==['OG','OO','CG','CO'] and not o.get('split'),'S5 trainee ignored: unanimous',str(o))
    # S6 semi: advance by votes
    setup(pg,'semi')
    for t_ in ['OG','CG']: pg.click(f'#advBox [data-act=adv][data-v={t_}]')
    for t_ in ['OG','OO']: pg.click(f'#wingsBox [data-act=adv][data-who=o0][data-v={t_}]')
    for t_ in ['OG','CG']: pg.click(f'#wingsBox [data-act=adv][data-who=o1][data-v={t_}]')
    pg.wait_for_timeout(1200);o=pg.evaluate("__db.bp_debates.at(-1).result");ok(sorted(o.get('advance') or [])==['CG','OG'],'S6 semi 3 judges: OG(3) CG(2) advance',str(o))
    # S7 semi tie at cutoff
    setup(pg,'semi',roles=('wing','off'))
    for t_ in ['OG','CG']: pg.click(f'#advBox [data-act=adv][data-v={t_}]')
    for t_ in ['OO','CO']: pg.click(f'#wingsBox [data-act=adv][data-who=o0][data-v={t_}]')
    pg.wait_for_timeout(500);t=res(pg);ok('Empate' in t or 'chair' in t.lower(),'S7 semi 2x2 tie: chair decides',t)
    # S8 final: one winner with 3 judges split
    setup(pg,'final')
    pg.click('#advBox [data-act=adv][data-v=OO]');pg.click('#wingsBox [data-act=adv][data-who=o0][data-v=OO]');pg.click('#wingsBox [data-act=adv][data-who=o1][data-v=CO]')
    pg.wait_for_timeout(1200);o=pg.evaluate("__db.bp_debates.at(-1).result");ok(o.get('winner')=='OO' and o.get('split'),'S8 final 2-1: OO wins, split',str(o))
    # S9 speaker points validation
    setup(pg,'preliminar',roles=('off','off'));rank(pg,'my',['OG','OO','CG','CO'])
    vals={'PM':'101','DPM':'abc','LO':'80','DLO':'80','MG':'90','GW':'90','MO':'45','OW':'70'}
    for k,v in vals.items():
        h=pg.query_selector(f'[data-spk][data-k="{k}"]')
        if h: h.evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}))}',v)
    pg.wait_for_timeout(600);t=pg.inner_text('#v-delib');ok(('incompatível' in t or 'fora' in t.lower() or 'inválid' in t.lower()) ,'S9 bad speaker points are flagged',t[-500:])
    ok(not errs,'no page errors '+str(errs[:2]))
    b.close()
print('RESULT',sum(R),'/',len(R))
