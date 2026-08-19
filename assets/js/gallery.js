(function () {
const container = document.getElementById('gallery-grid');
if (!container) return;

const config = {
    targetRowHeight: 165,
    minRowHeight: 130,
    maxRowHeight: 210,
    gap: 8,
    justifyLastRow: false
};

const imgs = Array.from(container.querySelectorAll('img'));
if (imgs.length === 0) return;

function onceLoaded(img) {
    return img.complete ? Promise.resolve() : new Promise(res => {
    img.addEventListener('load', res, { once: true });
    img.addEventListener('error', res, { once: true });
    });
}

function layout() {
    container.innerHTML = '';
    container.classList.add('jg');

    const cw = container.clientWidth;
    const minItemsPerRow = cw >= 760 ? 4 : (cw >= 520 ? 3 : 2);
    const rows = [];
    let row = [];
    let arSum = 0;

    const items = imgs.map(img => {
    const w = img.naturalWidth || 1;
    const h = img.naturalHeight || 1;
    return { el: img.cloneNode(true), ar: w / h };
    });

    items.forEach(item => {
    row.push(item);
    arSum += item.ar;
    const gaps = (row.length - 1) * config.gap;
    const idealH = Math.max(config.minRowHeight,
                        Math.min(config.maxRowHeight, (cw - gaps) / arSum));
    const filled = Math.abs((arSum * idealH + gaps) - cw) < config.targetRowHeight * 0.35;
    const tooWide = (arSum * config.minRowHeight + gaps) > cw;

    if ((filled || tooWide) && row.length >= minItemsPerRow) {
        rows.push({ items: row.slice(), height: idealH });
        row = [];
        arSum = 0;
    }
    });

    if (row.length) {
    const gaps = (row.length - 1) * config.gap;
    const sumAr = row.reduce((s, it) => s + it.ar, 0);
    let h = config.targetRowHeight;
    if (config.justifyLastRow && row.length >= minItemsPerRow) {
        h = Math.max(config.minRowHeight,
            Math.min(config.maxRowHeight, (cw - gaps) / sumAr));
    }
    rows.push({ items: row.slice(), height: h });
    }

    rows.forEach(({ items, height }, rowIdx) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'jg-row';

    const isLast = rowIdx === rows.length - 1;
    const justify = config.justifyLastRow || !isLast;

    const gaps = (items.length - 1) * config.gap;
    const sumAr = items.reduce((s, it) => s + it.ar, 0);
    let scale = height;
    if (justify) scale = (container.clientWidth - gaps) / sumAr;

    const widths = items.map(it => Math.round(it.ar * scale));
    let delta = (container.clientWidth - gaps) - widths.reduce((s, w) => s + w, 0);
    const order = [...widths.keys()].sort((a, b) => widths[b] - widths[a]);
    let k = 0;
    while (delta !== 0 && order.length) {
        const idx = order[k % order.length];
        widths[idx] += delta > 0 ? 1 : -1;
        delta += delta > 0 ? -1 : 1;
        k++;
    }

    items.forEach((it, i) => {
        const wrap = document.createElement('div');
        wrap.className = 'jg-item';
        wrap.style.width = widths[i] + 'px';
        wrap.style.height = Math.round(scale) + 'px';
        wrap.appendChild(it.el);
        rowDiv.appendChild(wrap);
    });

    container.appendChild(rowDiv);
    });
}

Promise.all(imgs.map(onceLoaded)).then(() => {
  layout();

  let tid;
  window.addEventListener('resize', () => {
    clearTimeout(tid);
    tid = setTimeout(layout, 120);
  });

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => {
      clearTimeout(tid);
      tid = setTimeout(layout, 60);
    });
    ro.observe(container);
    const scrollWrap = container.closest('.jg-scroll');
    if (scrollWrap) ro.observe(scrollWrap);
  }
});
})();
