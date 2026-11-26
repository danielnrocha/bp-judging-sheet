/* ---------- resiliência: espelho em IndexedDB (gravação durável), restauração, armazenamento persistente ---------- */
const BPS = (() => {
  const NAME = 'bp-mirror',
    ST = 'kv';
  let t = null,
    dbp = null;
  const dirty = new Set();
  const open = () =>
    dbp ||
    (dbp = new Promise((res, rej) => {
      try {
        const r = indexedDB.open(NAME, 2);
        r.onupgradeneeded = () => {
          const d = r.result;
          if (d.objectStoreNames.contains(ST)) d.deleteObjectStore(ST);
          d.createObjectStore(ST);
        };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      } catch (e) {
        rej(e);
      }
    }));
  async function flush() {
    if (!dirty.size) return;
    const at = +(localStorage.getItem('bp.savedAt') || 0);
    if (!at) return;
    const keys = [...dirty];
    dirty.clear();
    try {
      const db = await open();
      await new Promise((res, rej) => {
        const tx = db.transaction(ST, 'readwrite', { durability: 'strict' });
        const os = tx.objectStore(ST);
        for (const k of keys) os.put(localStorage.getItem(k), k);
        os.put(at, '__at');
        tx.oncomplete = res;
        tx.onerror = () => rej(tx.error);
        tx.onabort = () => rej(tx.error);
      });
    } catch (e) {
      keys.forEach(k => dirty.add(k));
    }
  }
  function mark(...keys) {
    keys.forEach(k => dirty.add(k));
    try {
      localStorage.setItem('bp.savedAt', String(Date.now()));
    } catch (e) {}
    clearTimeout(t);
    t = setTimeout(flush, 100);
  }
  async function restore() {
    try {
      const db = await open();
      const all = await new Promise((res, rej) => {
        const o = {};
        const r = db.transaction(ST).objectStore(ST).openCursor();
        r.onsuccess = () => {
          const c = r.result;
          if (c) {
            o[c.key] = c.value;
            c.continue();
          } else res(o);
        };
        r.onerror = () => rej(r.error);
      });
      const snapAt = +(all.__at || 0);
      if (!snapAt) return false;
      const at = +(localStorage.getItem('bp.savedAt') || 0);
      if (snapAt > at) {
        for (const [k, v] of Object.entries(all)) {
          if (k === '__at') continue;
          if (v == null) localStorage.removeItem(k);
          else localStorage.setItem(k, v);
        }
        localStorage.setItem('bp.savedAt', String(snapAt));
        return true;
      }
    } catch (e) {}
    return false;
  }
  const now = () => {
    clearTimeout(t);
    flush();
  };
  addEventListener('pagehide', now);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') now();
  });
  return { mark, flush, restore, now };
})();
const BP_READY = window.__sbMock
  ? Promise.resolve(true)
  : BPS.restore()
      .then(r => {
        if (r && !sessionStorage.getItem('bp.restored')) {
          sessionStorage.setItem('bp.restored', '1');
          location.reload();
          return false;
        }
        sessionStorage.removeItem('bp.restored');
        return true;
      })
      .catch(() => true);
let PERSIST = null;
try {
  navigator.storage &&
    navigator.storage.persisted &&
    navigator.storage.persisted().then(v => {
      PERSIST = v;
      if (!v && navigator.storage.persist) navigator.storage.persist().then(x => (PERSIST = x));
    });
} catch (e) {}
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
/* ---------- armazenamento: modo local (padrão) ou Supabase do próprio usuário ---------- */
const CFG = (() => {
  let c = window.BP_CONFIG || null;
  try {
    const x = JSON.parse(localStorage.getItem('bp.config'));
    if (x && x.supabaseUrl && x.supabaseKey) c = x;
  } catch (e) {}
  return c && c.supabaseUrl && c.supabaseKey ? c : null;
})();
function localClient() {
  const LEG = 'bp.local.db';
  let dbp = null;
  const empty = () => ({ bp_tournaments: [], bp_debates: [] });
  const open = () =>
    dbp ||
    (dbp = new Promise((res, rej) => {
      const r = indexedDB.open('bp-data', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }).then(
      d =>
        new Promise(res => {
          let legacy = null;
          try {
            legacy = JSON.parse(localStorage.getItem(LEG));
          } catch (e) {}
          if (!legacy || !Array.isArray(legacy.bp_tournaments)) {
            try {
              localStorage.removeItem(LEG);
            } catch (e) {}
            return res(d);
          }
          const tx = d.transaction('kv', 'readwrite', { durability: 'strict' });
          const os = tx.objectStore('kv');
          const g = os.get('db');
          g.onsuccess = () => {
            if (!g.result) os.put(legacy, 'db');
          };
          tx.oncomplete = () => {
            try {
              localStorage.removeItem(LEG);
            } catch (e) {}
            res(d);
          };
          tx.onerror = tx.onabort = () => res(d);
        })
    ));
  const rmw = (fn, write) =>
    open().then(
      d =>
        new Promise((res, rej) => {
          const tx = write ? d.transaction('kv', 'readwrite', { durability: 'strict' }) : d.transaction('kv');
          const os = tx.objectStore('kv');
          let out;
          const g = os.get('db');
          g.onsuccess = () => {
            const db = g.result || empty();
            out = fn(db);
            if (write) os.put(db, 'db');
          };
          tx.oncomplete = () => res(out);
          tx.onerror = () => rej(tx.error);
          tx.onabort = () => rej(tx.error);
        })
    );
  const uid = () =>
    window.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  const cp = x => JSON.parse(JSON.stringify(x)),
    now = () => new Date().toISOString();
  function Q(t) {
    this.t = t;
    this.op = 'select';
    this.f = [];
    this.p = null;
    this.one = false;
    this.ord = [];
  }
  Q.prototype.select = function () {
    return this;
  };
  Q.prototype.eq = function (k, v) {
    this.f.push([k, v]);
    return this;
  };
  Q.prototype.single = function () {
    this.one = true;
    return this;
  };
  Q.prototype.order = function (k, o) {
    this.ord.push([k, !(o && o.ascending === false)]);
    return this;
  };
  Q.prototype.insert = function (p) {
    this.op = 'insert';
    this.p = p;
    return this;
  };
  Q.prototype.update = function (p) {
    this.op = 'update';
    this.p = p;
    return this;
  };
  Q.prototype.delete = function () {
    this.op = 'delete';
    return this;
  };
  Q.prototype.then = function (ok, ko) {
    const q = this,
      m = r => q.f.every(([k, v]) => r[k] === v);
    const run = db => {
      const T = db[q.t];
      let data;
      if (q.op === 'insert') {
        data = [].concat(q.p).map(x => ({ id: uid(), owner: 'local', created_at: now(), updated_at: now(), ...cp(x) }));
        T.push(...data);
      } else if (q.op === 'update') {
        data = T.filter(m);
        data.forEach(r => Object.assign(r, cp(q.p), { updated_at: now() }));
      } else if (q.op === 'delete') {
        data = T.filter(m);
        db[q.t] = T.filter(r => !m(r));
        if (q.t === 'bp_tournaments')
          db.bp_debates = db.bp_debates.filter(d => !data.some(x => x.id === d.tournament_id));
      } else {
        data = T.filter(m);
        for (const [k, asc] of q.ord.slice().reverse())
          data.sort((a, b) => {
            const x = a[k],
              y = b[k];
            if (x == null && y == null) return 0;
            if (x == null) return 1;
            if (y == null) return -1;
            return (x < y ? -1 : x > y ? 1 : 0) * (asc ? 1 : -1);
          });
      }
      return cp(data);
    };
    return rmw(run, q.op !== 'select')
      .then(
        data =>
          q.one
            ? { data: data[0] || null, error: data[0] ? null : { message: 'Não encontrado' } }
            : { data, error: null },
        e => ({
          data: null,
          error: {
            message:
              e && e.name === 'QuotaExceededError'
                ? 'O armazenamento deste navegador está cheio. Exporte seus dados.'
                : 'Erro ao gravar no navegador: ' + ((e && e.message) || e)
          }
        })
      )
      .then(ok, ko);
  };
  const user = { id: 'local', email: 'Modo local' };
  return {
    from: t => new Q(t),
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithOAuth: () => {},
      signInWithOtp: () => Promise.resolve({ error: { message: 'Modo local não usa login.' } })
    }
  };
}
const MODE = window.__sbMock ? 'test' : CFG ? 'supabase' : 'local';
const sb =
  window.__sbMock || (CFG && window.supabase ? supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey) : localClient());
