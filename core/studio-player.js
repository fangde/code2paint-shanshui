(function () {
  'use strict';

  const B = window.Code2PaintBrushes;

  function mount(config) {
    const W = config.width || 1000;
    const H = config.height || 1200;
    const mode = config.mode || 'ink';
    const theme = config.theme || (mode === 'oil' ? 'gallery-dark' : 'xuan');
    const layersMeta = config.layers || [];
    const filmMode = new URLSearchParams(location.search).get('filmMode') === '1';

    document.title = config.title || 'Code2Paint 作品赏析';
    document.body.className = 'c2p-studio';
    document.body.dataset.theme = theme;

    const prevHref = config.prevUrl || '';
    const nextHref = config.nextUrl || '';

    const ana = config.analysis;
    const analysisHtml = ana ? `
      <section class="c2p-analysis-panel" id="analysisPanel" aria-label="原作风格与技法深度解析">
        <div class="c2p-analysis-header">
          <h2>大师原作风格与临摹技法深度解析</h2>
          <span class="c2p-analysis-origin">${ana.original || ''}</span>
        </div>
        <div class="c2p-analysis-grid">
          <div class="c2p-analysis-card"><h3>题材与流派定位</h3><p>${ana.movement || ''}</p></div>
          <div class="c2p-analysis-card"><h3>古典/现代调色盘解剖</h3><p>${ana.palette || ''}</p></div>
          <div class="c2p-analysis-card"><h3>原作核心笔法与物理肌理</h3><p>${ana.technique || ''}</p></div>
          <div class="c2p-analysis-card"><h3>超精细代码临摹架构</h3><p>${ana.algorithm || ''}</p></div>
        </div>
      </section>` : '';

    document.body.innerHTML = `
      <header class="c2p-header">
        <div class="c2p-title-wrap">
          <h1 class="c2p-title">${config.title || ''}</h1>
          <span class="c2p-subtitle">${config.subtitle || ''}</span>
        </div>
        <div class="c2p-header-right">
          ${config.category ? `<span class="c2p-cat-pill">${config.category}</span>` : ''}
          ${prevHref ? `<a class="nav-link" href="${prevHref}">← 上一幅</a>` : ''}
          ${nextHref ? `<a class="nav-link" href="${nextHref}">下一幅 →</a>` : ''}
          <a class="home-link" href="./index.html">← 回画廊首页</a>
        </div>
      </header>
      <div class="c2p-stage-frame">
        <canvas id="painting" width="${W}" height="${H}"></canvas>
      </div>
      <div class="c2p-controls-panel">
        <div class="c2p-slider-row">
          <input id="progressSlider" type="range" min="0" max="1" value="0" aria-label="作画步骤进度">
          <span class="c2p-pct-text" id="progressPercent">0.0%</span>
        </div>
        <div class="c2p-layer-chips" id="layerChips"></div>
        <div class="c2p-toolbar">
          <div class="c2p-status-group">
            <span id="layerStatus">准备铺纸研墨…</span>
            <span id="strokeStatus">0 / 0 笔</span>
          </div>
          <div class="c2p-btn-group">
            <button id="playPauseBtn" class="c2p-btn primary">暂停</button>
            <button id="stepBackBtn" class="c2p-btn">退一步</button>
            <button id="stepForwardBtn" class="c2p-btn">进一步</button>
            <button id="redrawBtn" class="c2p-btn">重新绘制</button>
            <button id="speedBtn" class="c2p-btn">加速 ×1</button>
            <button id="saveBtn" class="c2p-btn">保存 PNG</button>
          </div>
        </div>
      </div>
      ${analysisHtml}
    `;

    const canvas = document.getElementById('painting');
    const ctx = canvas.getContext('2d', { alpha: false });
    const slider = document.getElementById('progressSlider');
    const pctEl = document.getElementById('progressPercent');
    const layerChipsEl = document.getElementById('layerChips');
    const layerStatusEl = document.getElementById('layerStatus');
    const strokeStatusEl = document.getElementById('strokeStatus');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stepBackBtn = document.getElementById('stepBackBtn');
    const stepForwardBtn = document.getElementById('stepForwardBtn');
    const redrawBtn = document.getElementById('redrawBtn');
    const speedBtn = document.getElementById('speedBtn');
    const saveBtn = document.getElementById('saveBtn');

    const SPEEDS = [1, 2, 4, 8];
    let speedIdx = 0;
    let seedCounter = config.seed || 0x20261124;
    let rand = B.mulberry32(seedCounter);
    let backdropCanvas = null;
    let actions = [];
    let layerEndIdx = {};
    let current = 0;
    let isPaused = false;
    let rafId = null;
    let acc = 0;
    const checkpoints = new Map();
    let checkpointStep = 24;

    function getStepDelta() {
      if (config.stepDelta) return config.stepDelta;
      const n = actions.length;
      if (n > 8000) return Math.round(n / 120);
      if (n > 1500) return Math.round(n / 80);
      if (n > 400) return 5;
      return 1;
    }

    function renderChips() {
      layerChipsEl.innerHTML = '';
      for (const l of layersMeta) {
        const btn = document.createElement('button');
        btn.className = 'layer-chip';
        btn.dataset.layer = String(l.id);
        btn.textContent = l.name;
        btn.addEventListener('click', () => {
          pause();
          seekTo(layerEndIdx[l.id] || 0);
        });
        layerChipsEl.appendChild(btn);
      }
    }

    function updateUI(done = false) {
      const total = actions.length;
      const shown = B.clamp(current, 0, total);
      slider.max = String(total);
      slider.value = String(shown);
      strokeStatusEl.textContent = `${shown} / ${total} 笔`;
      const pct = total > 0 ? (shown / total) * 100 : 0;
      pctEl.textContent = `${pct.toFixed(1)}%`;

      if (shown === 0) {
        layerStatusEl.textContent = mode === 'oil'
          ? '亚麻画布就绪（准备起稿）'
          : (mode === 'gongbi' ? '熟宣仿古绢就绪（等待双勾白描）' : '宣纸铺陈就绪（等待落笔）');
      } else if (done || (total > 0 && shown >= total)) {
        layerStatusEl.textContent = `绘制完成 · 共 ${total} 笔`;
      } else {
        const s = actions[B.clamp(shown - 1, 0, total - 1)];
        const lm = layersMeta.find(m => m.id === s.layer);
        const prefix = lm ? lm.name : `第 ${s.layer} 步`;
        layerStatusEl.textContent = s.label ? `${prefix} ｜ ${s.label}` : prefix;
      }

      playPauseBtn.textContent = shown >= total && total > 0 ? '重播' : (isPaused ? '继续' : '暂停');

      const activeLayer = shown >= total && total > 0
        ? (layersMeta.length ? layersMeta[layersMeta.length - 1].id : 1)
        : (shown === 0 ? 1 : actions[Math.min(shown, total) - 1].layer);

      layerChipsEl.querySelectorAll('.layer-chip').forEach(chip => {
        const l = Number(chip.dataset.layer);
        const end = layerEndIdx[l] || 0;
        const prev = layerEndIdx[l - 1] || 0;
        const isDone = total > 0 && shown >= end && end > prev;
        const isCurrent = !done && shown > 0 && shown < total && l === activeLayer;
        chip.classList.toggle('done', isDone && !isCurrent);
        chip.classList.toggle('current', isCurrent);
      });
    }

    function saveCheckpoint(idx) {
      if (checkpoints.has(idx)) return;
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      c.getContext('2d').drawImage(canvas, 0, 0);
      checkpoints.set(idx, c);
    }

    function seekTo(target) {
      const total = actions.length;
      const clamped = B.clamp(Math.round(target), 0, total);
      if (clamped >= current && clamped - current <= checkpointStep) {
        for (let i = current; i < clamped; i++) {
          actions[i].draw(ctx);
          if ((i + 1) % checkpointStep === 0) saveCheckpoint(i + 1);
        }
        current = clamped;
      } else {
        let best = 0;
        for (const k of checkpoints.keys()) {
          if (k <= clamped && k > best) best = k;
        }
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(best === 0 ? backdropCanvas : checkpoints.get(best), 0, 0);
        for (let i = best; i < clamped; i++) {
          actions[i].draw(ctx);
          if ((i + 1) % checkpointStep === 0) saveCheckpoint(i + 1);
        }
        current = clamped;
      }
      updateUI(current >= total && total > 0);
    }

    function pause() {
      isPaused = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      updateUI(current >= actions.length && actions.length > 0);
    }

    function resume() {
      if (current >= actions.length) seekTo(0);
      isPaused = false;
      updateUI(false);
      if (rafId === null) rafId = requestAnimationFrame(tick);
    }

    function tick() {
      if (isPaused) { rafId = null; return; }
      const total = actions.length;
      if (current >= total) {
        saveCheckpoint(total);
        rafId = null;
        isPaused = true;
        updateUI(true);
        return;
      }
      const speed = SPEEDS[speedIdx];
      const baseRate = config.baseSpeed || (mode === 'oil' && total >= 1500 ? Math.max(12, total / 240) : Math.max(0.5, total / 180));
      acc += baseRate * speed;

      while (acc >= 1 && current < total) {
        actions[current].draw(ctx);
        current++;
        if (current % checkpointStep === 0) saveCheckpoint(current);
        acc -= 1;
      }

      if (current >= total) {
        saveCheckpoint(total);
        rafId = null;
        isPaused = true;
        updateUI(true);
        return;
      }
      updateUI(false);
      rafId = requestAnimationFrame(tick);
    }

    function initPainting(resetSeed = false) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (resetSeed) seedCounter = (seedCounter + 1) >>> 0;
      rand = B.mulberry32(seedCounter);
      checkpoints.clear();
      current = 0;
      acc = 0;
      isPaused = false;

      if (typeof config.legacySetup === 'function') {
        const res = config.legacySetup({ seed: seedCounter, width: W, height: H, filmMode });
        backdropCanvas = res.backdropCanvas;
        actions = res.actions || [];
      } else {
        backdropCanvas = B.buildBackdrop(W, H, {
          mode,
          backdropColor: config.backdropColor
        }, rand);
        const api = B.createBrushAPI(W, H, seedCounter, {
          mode,
          maxOilStrokes: config.maxOilStrokes || 100000
        });
        config.buildStrokes(api);
        actions = api.strokes;
      }

      checkpointStep = actions.length > 20000
        ? Math.max(400, Math.round(actions.length / 16))
        : Math.max(20, Math.round(actions.length / 22));
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(backdropCanvas, 0, 0);

      layerEndIdx = {};
      actions.forEach((s, i) => {
        layerEndIdx[s.layer] = i + 1;
      });
      let running = 0;
      for (const l of layersMeta) {
        if (layerEndIdx[l.id] != null) running = layerEndIdx[l.id];
        else layerEndIdx[l.id] = running;
      }

      renderChips();
      updateUI(false);

      window.__filmTotal = actions.length;
      window.__filmSeekStroke = (idx, opts = {}) => {
        seekTo(idx);
        if (typeof opts.paused === 'boolean') {
          isPaused = opts.paused;
          updateUI(current >= actions.length && actions.length > 0);
        }
      };
      window.__filmSeek = (frac, opts) => window.__filmSeekStroke(frac * actions.length, opts);
      window.__filmReady = true;

      if (!filmMode) {
        rafId = requestAnimationFrame(tick);
      }
    }

    slider.addEventListener('pointerdown', () => {
      isPaused = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });

    function handleSliderSeek() {
      const target = Number(slider.value);
      isPaused = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      seekTo(target);
    }

    slider.addEventListener('input', handleSliderSeek);
    slider.addEventListener('change', handleSliderSeek);

    playPauseBtn.addEventListener('click', () => {
      if (isPaused) resume();
      else pause();
    });

    stepBackBtn.addEventListener('click', () => {
      pause();
      seekTo(current - getStepDelta());
    });

    stepForwardBtn.addEventListener('click', () => {
      pause();
      seekTo(current + getStepDelta());
    });

    redrawBtn.addEventListener('click', () => {
      initPainting(Boolean(config.reseedOnRedraw));
    });

    speedBtn.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % SPEEDS.length;
      speedBtn.textContent = `加速 ×${SPEEDS[speedIdx]}`;
      speedBtn.classList.toggle('active', speedIdx > 0);
    });

    saveBtn.addEventListener('click', () => {
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${config.fileName || config.title || 'painting'}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1200);
      }, 'image/png');
    });

    window.addEventListener('keydown', (e) => {
      const delta = e.shiftKey ? getStepDelta() * 5 : getStepDelta();
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        pause();
        seekTo(current - delta);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        pause();
        seekTo(current + delta);
      } else if (e.code === 'Space' && document.activeElement?.tagName !== 'BUTTON') {
        e.preventDefault();
        if (isPaused) resume();
        else pause();
      }
    });

    initPainting(false);
    return { seekTo, pause, resume, get total() { return actions.length; } };
  }

  window.Code2PaintStudio = { mount };
})();
