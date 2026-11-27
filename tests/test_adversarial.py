"""Adversarial checks. Serve the repo first: python tests/serve.py (from the repo root)."""
import json,time,csv,io
from playwright.sync_api import sync_playwright
U='http://localhost:8765/index.html'
R=[]
def ok(c,msg):R.append((c,msg));print(('OK   ' if c else 'FAIL ')+msg,flush=True)
def fresh(b,vp=(1300,900)):
    ctx=b.new_context(viewport={'width':vp[0],'height':vp[1]},accept_downloads=True)
    ctx.route('**/supabase.min.js',lambda r:r.fulfill(body='',content_type='application/javascript'));ctx.route('https://fonts.*/**',lambda r:r.abort())
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.goto(U);pg.wait_for_timeout(700);return ctx,pg,errs
def mk(pg,name='T',motion='EC proibiria X',args=(('PM','a1'),('LO','b1'))):
    pg.goto(U+'#/');pg.wait_for_timeout(300);pg.click('[data-act=newT]');pg.fill('#fName',name);pg.click('[data-act=saveT]');pg.wait_for_timeout(400)
    pg.click('[data-act=newD][data-stage=preliminar]');pg.wait_for_timeout(500);pg.fill('#motion',motion)
    TEAM={'PM':'OG','DPM':'OG','LO':'OO','DLO':'OO','MG':'CG','GW':'CG','MO':'CO','OW':'CO'}
    for sp,t in args:
        mb=pg.query_selector(f'[data-act=mob][data-v={TEAM[sp]}]')
        if mb and mb.is_visible(): mb.click();pg.wait_for_timeout(100)
        pg.fill(f'form.add[data-sp="{sp}"] input',t);pg.press(f'form.add[data-sp="{sp}"] input','Enter');pg.wait_for_timeout(60)
    pg.wait_for_timeout(1100);return pg.url
with sync_playwright() as pw:
    b=pw.chromium.launch()
    # A. CSV formula injection
    ctx,pg,errs=fresh(b);mk(pg,'=1+1',"=HYPERLINK(\"http://evil\",\"x\")",(('PM','+cmd|calc'),('LO','@SUM(A1)')))
    pg.goto(U+'#/consultas');pg.wait_for_timeout(600)
    for kind in ['deb','arg']:
        with pg.expect_download() as d: pg.click(f'[data-act=exp][data-v={kind}]')
        rows=list(csv.reader(io.StringIO(open(d.value.path(),encoding='utf-8-sig').read())))
        cells=[c for r in rows[1:] for c in r]
        bad=[c for c in cells if c and c[0] in '=+-@']
        ok(not bad,f'CSV {kind}: no cell starts with = + - @ ({bad[:3]})')
    # B. bad routes
    for h in ['#/d/naoexiste','#/d/','#/t/naoexiste','#/xyz','#/t/../../x','#/d/naoexiste/delib','#/consultas/x']:
        pg.goto(U+h);pg.wait_for_timeout(500)
    ok(not errs,f'bad routes: no page errors {errs[:2]}')
    # O. double click creates duplicates?
    pg.goto(U+'#/');pg.wait_for_timeout(300);n0=pg.evaluate("new Promise(r=>{const q=indexedDB.open('bp-data',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>{const g=q.result.transaction('kv').objectStore('kv').get('db');g.onsuccess=()=>r(g.result||{bp_tournaments:[],bp_debates:[]})}}).then(d=>d.bp_tournaments.length)")
    pg.click('[data-act=newT]');pg.fill('#fName','Duplo');pg.dblclick('[data-act=saveT]');pg.wait_for_timeout(600)
    n1=pg.evaluate("new Promise(r=>{const q=indexedDB.open('bp-data',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>{const g=q.result.transaction('kv').objectStore('kv').get('db');g.onsuccess=()=>r(g.result||{bp_tournaments:[],bp_debates:[]})}}).then(d=>d.bp_tournaments.length)")
    ok(n1-n0==1,f'double-click Save creates one tournament (created {n1-n0})')
    pg.goto(U+'#/');pg.wait_for_timeout(300);pg.click('.tcard >> nth=0');pg.wait_for_timeout(400)
    d0=pg.evaluate("new Promise(r=>{const q=indexedDB.open('bp-data',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>{const g=q.result.transaction('kv').objectStore('kv').get('db');g.onsuccess=()=>r(g.result||{bp_tournaments:[],bp_debates:[]})}}).then(d=>d.bp_debates.length)")
    pg.dblclick('[data-act=newD][data-stage=preliminar]');pg.wait_for_timeout(800)
    d1=pg.evaluate("new Promise(r=>{const q=indexedDB.open('bp-data',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>{const g=q.result.transaction('kv').objectStore('kv').get('db');g.onsuccess=()=>r(g.result||{bp_tournaments:[],bp_debates:[]})}}).then(d=>d.bp_debates.length)")
    ok(d1-d0==1,f'double-click New debate creates one debate (created {d1-d0})')
    # D. same debate open in two tabs
    url=mk(pg,'Duas abas','mocao original',(('PM','p1'),))
    p2=ctx.new_page();p2.goto(url);p2.wait_for_timeout(700)
    pg.fill('#motion','editado na aba 1');pg.wait_for_timeout(1300)
    p2.fill('form.add[data-sp="LO"] input','arg da aba 2');p2.press('form.add[data-sp="LO"] input','Enter');p2.wait_for_timeout(1300)
    p3=ctx.new_page();p3.goto(url);p3.wait_for_timeout(800)
    mot=p3.input_value('#motion');args=p3.evaluate("[...document.querySelectorAll('textarea.t')].map(t=>t.value)")
    ok(mot=='editado na aba 1' and 'arg da aba 2' in args,f'same debate in two tabs keeps both edits (motion={mot!r}, args={args})')
    p2.close();p3.close()
    # F. language switch right after typing
    pg.goto(url);pg.wait_for_timeout(600);pg.fill('#motion','antes de trocar idioma');pg.select_option('#langSel','en');pg.wait_for_timeout(1200)
    ok(pg.input_value('#motion')=='antes de trocar idioma','language switch right after typing keeps text')
    pg.select_option('#langSel','pt');pg.wait_for_timeout(1000)
    # N. export -> wipe -> import roundtrip
    pg.goto(U+'#/consultas');pg.wait_for_timeout(600)
    with pg.expect_download() as d: pg.click('[data-act=exp][data-v=json]')
    j1=json.load(open(d.value.path()))
    ctx2,pq,errs2=fresh(b);pq.goto(U+'#/consultas');pq.wait_for_timeout(500)
    with pq.expect_file_chooser() as fc: pq.click('#impBtn')
    fc.value.set_files(d.value.path());pq.wait_for_timeout(2500)
    pq.goto(U+'#/consultas');pq.wait_for_timeout(600)
    with pq.expect_download() as d2: pq.click('[data-act=exp][data-v=json]')
    j2=json.load(open(d2.value.path()))
    norm=lambda j:sorted([(next((t['name'] for t in j['tournaments'] if t['id']==d['tournament_id']),None),d['stage'],d['motion'] or None,json.dumps({k:([{kk:vv for kk,vv in a.items() if kk not in('open','note') or vv} for a in v] if k=='args' else v) for k,v in d['data'].items() if k not in('_t',)},sort_keys=True)) for d in j['debates']])
    A,B=norm(j1),norm(j2)
    for x,y in zip(A,B):
        if x!=y:
            import difflib;print('DIFF',x[:3],y[:3]);print('\n'.join(list(difflib.unified_diff(x[3].split(','),y[3].split(','),lineterm=''))[:20]))
    ok(len(j1['debates'])==len(j2['debates']) and norm(j1)==norm(j2),f'export/import roundtrip identical ({len(j1["debates"])} -> {len(j2["debates"])} debates)')
    ok(not errs2,'import: no page errors')
    ctx2.close()
    ctx.close()
    # G. mobile widths: no horizontal overflow
    for w in [360,768]:
        ctx,pg,errs=fresh(b,(w,800));url=mk(pg)
        ov=[]
        for h in ['#/','#/treinos','#/consultas','#/guia',url.split('#')[1] and '#'+url.split('#')[1],'#'+url.split('#')[1]+'/delib']:
            pg.goto(U+h);pg.wait_for_timeout(500)
            sw=pg.evaluate("document.documentElement.scrollWidth");cw=pg.evaluate("document.documentElement.clientWidth")
            if sw>cw+1: ov.append((h,sw,cw))
        ok(not ov,f'width {w}px: no horizontal overflow {ov}')
        ctx.close()
    # E. volume: 1 debate with 300 arguments + 150 debates
    ctx,pg,errs=fresh(b);url=mk(pg,'Volume','m',())
    t=time.time()
    for i in range(300): pg.fill('form.add[data-sp="%s"] input'%['PM','LO','DPM','DLO','MG','MO','GW','OW'][i%8],'argumento longo número %d '%i+'x'*120);pg.press('form.add[data-sp="%s"] input'%['PM','LO','DPM','DLO','MG','MO','GW','OW'][i%8],'Enter')
    dt=(time.time()-t)/300;ok(dt<0.25,f'adding ideas stays fast with 300 ideas ({dt*1000:.0f} ms each)')
    t=time.time();pg.fill('#motion','m2');pg.wait_for_timeout(50);dt=time.time()-t;ok(dt<0.5,f'typing latency with 300 ideas ({dt*1000:.0f} ms)')
    pg.click('#dTabs a[data-v=delib]');pg.wait_for_timeout(800)
    size=pg.evaluate("JSON.stringify(localStorage).length");print('   localStorage size with 300-idea debate:',size//1024,'KB')
    pg.evaluate("""()=>new Promise(r=>{const q=indexedDB.open('bp-data',1);q.onsuccess=()=>{const tx=q.result.transaction('kv','readwrite');const os=tx.objectStore('kv');const g=os.get('db');g.onsuccess=()=>{const db=g.result;const d=db.bp_debates[0];for(let i=0;i<150;i++)db.bp_debates.push({...JSON.parse(JSON.stringify(d)),id:'bulk'+i});os.put(db,'db')};tx.oncomplete=()=>r(1)}})""")
    size=pg.evaluate("JSON.stringify(localStorage).length");print('   localStorage size with 151 heavy debates (now in IndexedDB):',size//1024,'KB')
    t=time.time();pg.goto(U+'#/consultas');pg.wait_for_selector('#qOut .kpis');dt=time.time()-t;ok(dt<4,f'queries with 151 heavy debates loads in {dt:.1f}s')
    ok(not errs,'volume: no page errors '+str(errs[:2]))
    ctx.close();b.close()
print('\nRESULT',sum(c for c,_ in R),'/',len(R))
