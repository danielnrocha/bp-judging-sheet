/* Tema: segue o sistema; sem preferência, abre escuro; o botão sol/lua sobrepõe. Roda no <head> antes da pintura. */
/* tema: segue o sistema; sem preferência clara do sistema, abre escuro; o botão sol/lua sobrepõe */
(() => {
  const mq = matchMedia('(prefers-color-scheme: light)');
  const sys = () => (mq.matches ? 'light' : 'dark');
  const get = () => {
    try {
      const v = localStorage.getItem('bp.theme');
      return v === 'light' || v === 'dark' ? v : null;
    } catch (e) {
      return null;
    }
  };
  const apply = () => {
    const t = get() || sys();
    document.documentElement.style.colorScheme = t;
    document.documentElement.dataset.theme = t;
    const m = document.querySelector('meta[name=theme-color]');
    if (m) m.content = t === 'dark' ? '#0f1012' : '#ffffff';
    document.querySelectorAll('.themeBtn').forEach(b => {
      b.innerHTML = t === 'dark' ? b.dataset.sun : b.dataset.moon;
      b.setAttribute('aria-label', b.dataset[t === 'dark' ? 'toLight' : 'toDark']);
      b.title = b.getAttribute('aria-label');
    });
  };
  window.BP_THEME = {
    apply,
    toggle() {
      const next = (get() || sys()) === 'dark' ? 'light' : 'dark';
      try {
        if (next === sys()) localStorage.removeItem('bp.theme');
        else localStorage.setItem('bp.theme', next);
      } catch (e) {}
      apply();
    }
  };
  mq.addEventListener('change', apply);
  apply();
})();
