(function () {
  'use strict';

  function ensureTag(tag, attrs) {
    const id = attrs.id;
    if (id && document.getElementById(id)) return;
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }

  ensureTag('link', { id: '__c2p_theme', rel: 'stylesheet', href: './core/theme.css' });

  const loadScript = (src, id) => new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) return resolve();
    const s = document.createElement('script');
    if (id) s.id = id;
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const coreReady = loadScript('./core/brushes.js', '__c2p_brushes')
    .then(() => loadScript('./core/oil-master.js', '__c2p_oil_master'))
    .then(() => loadScript('./core/studio-player.js', '__c2p_studio'));

  window.Code2PaintTutorial = {
    mount(config) {
      if (window.Code2PaintStudio && window.Code2PaintBrushes && window.Code2PaintOilMaster) {
        return window.Code2PaintStudio.mount(config);
      }
      coreReady.then(() => window.Code2PaintStudio.mount(config));
    }
  };
})();
