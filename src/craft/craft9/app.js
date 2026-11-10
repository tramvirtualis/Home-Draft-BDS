// Mẫu 6 — "Cinematic": như mẫu 5 (header, số cuộn, ticker, bảng hàng, đồng hồ, dự án trượt ngang, hành trình)
// cộng đèn sân khấu có bụi sáng ở hero và dải sáng chạy dọc trang. Mọi số liệu căn/giá là dữ liệu mẫu.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Header + menu điện thoại ---------- */
  const hdr = $('#hdr'), menu = $('#hdr-menu'), nav = $('#hdr-nav');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }));

  /* ---------- Tiêu đề mục hiện dần ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    $$('.sec-head').forEach((el) => io.observe(el));
  } else $$('.sec-head').forEach((el) => el.classList.add('is-in'));

  /* ---------- Số liệu cuộn chữ số ---------- */
  $$('[data-roll]').forEach((el) => {
    const value = el.textContent.trim();
    const said = Object.assign(document.createElement('span'), { className: 'sr-only', textContent: value });
    const shown = Object.assign(document.createElement('span'), { className: 'roll__digits' });
    shown.setAttribute('aria-hidden', 'true');
    let i = 0;
    for (const ch of value) {
      if (!/\d/.test(ch)) { shown.append(ch); continue; }
      const col = Object.assign(document.createElement('span'), { className: 'roll__col' });
      const strip = Object.assign(document.createElement('span'), { className: 'roll__strip' });
      strip.style.setProperty('--d', ch); strip.style.setProperty('--i', i++);
      for (let n = 0; n < 10; n++) strip.append(Object.assign(document.createElement('span'), { textContent: n }));
      col.append(strip); shown.append(col);
    }
    el.classList.add('roll'); el.replaceChildren(said, shown);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
  });

  /* ---------- Ticker bảng hàng ---------- */
  const TICKS = [
    ['Lumen A-16.03', 'up', '▲ Còn trống', '6,72 tỷ'], ['Aurelia B-02', 'hold', '◐ Đang giữ', '32,0 tỷ'], ['Metropole T-21.05', 'up', '▲ Mở bán', '8,80 tỷ'],
    ['Lumen A-18.01', 'sold', '▼ Đã bán', '9,24 tỷ'], ['Metropole PH-02', 'hold', '◐ Đang giữ', '29,0 tỷ'], ['Aurelia D-07', 'up', '▲ Còn trống', '48,0 tỷ'],
    ['Lumen A-20.06', 'up', '▲ Còn trống', '9,98 tỷ'], ['Metropole T-15.02', 'sold', '▼ Đã bán', '12,5 tỷ'],
  ];
  const one = TICKS.map(([c, k, s, p]) => `<span><b>${c}</b> <span class="${k}">${s}</span> <span class="dim">${p}</span></span>`).join('');
  $('#ticker').innerHTML = one + one;

  /* ---------- Bảng hàng mini ở hero ---------- */
  const mini = $$('#mini li');
  if (!reduce) setInterval(() => {
    if (document.hidden) return;
    const li = mini[(Math.random() * mini.length) | 0];
    li.dataset.s = { free: 'hold', hold: Math.random() < 0.6 ? 'free' : 'sold', sold: 'free' }[li.dataset.s];
    li.classList.add('flip'); setTimeout(() => li.classList.remove('flip'), 700);
  }, 2600);

  /* ---------- Bảng hàng trực tiếp (bento) ---------- */
  const sheet = $('#sheet'), cells = [];
  for (let i = 0; i < 40; i++) {
    const r = ((i * 37) % 100) / 100;
    const s = document.createElement('span');
    s.dataset.s = r < 0.55 ? 'free' : r < 0.78 ? 'hold' : 'sold';
    sheet.append(s); cells.push(s);
  }
  let lastSync = Date.now();
  const tally = () => {
    const c = { free: 0, hold: 0, sold: 0 };
    cells.forEach((s) => c[s.dataset.s]++);
    $('#c-free').textContent = c.free; $('#c-hold').textContent = c.hold; $('#c-sold').textContent = c.sold;
    lastSync = Date.now();
  };
  tally();
  setInterval(() => {
    const s = Math.round((Date.now() - lastSync) / 1000);
    $('#c-tick').textContent = s < 2 ? 'vừa cập nhật' : `${s} giây trước`;
  }, 1000);
  if (!reduce) setInterval(() => {
    if (document.hidden) return;
    const s = cells[(Math.random() * cells.length) | 0];
    s.dataset.s = { free: 'hold', hold: Math.random() < 0.5 ? 'sold' : 'free', sold: 'sold' }[s.dataset.s];
    s.classList.add('flip'); setTimeout(() => s.classList.remove('flip'), 600);
    tally();
  }, 1400);

  /* ---------- Đồng hồ giữ chỗ (hero + bento) ---------- */
  const clocks = [$('#clock'), $('#hero-clock')].filter(Boolean);
  let left = 72 * 3600 - 1;
  const pad = (n) => String(n).padStart(2, '0');
  const show = () => { const t = `${pad((left / 3600) | 0)}:${pad(((left % 3600) / 60) | 0)}:${pad(left % 60)}`; clocks.forEach((c) => (c.textContent = t)); };
  show();
  if (!reduce) setInterval(() => { left = Math.max(0, left - 1); show(); }, 1000);

  /* ---------- Tuyên ngôn sáng dần theo từ ---------- */
  if (CSS.supports('animation-timeline: view()') && !reduce) {
    $$('[data-fill]').forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach((w, i) => { const sp = document.createElement('span'); sp.textContent = w; el.append(sp, i < words.length - 1 ? ' ' : ''); });
      el.classList.add('is-filling');
    });
  }

  /* ---------- Vệt sáng theo con trỏ ---------- */
  $$('.tile').forEach((t) => t.addEventListener('pointermove', (e) => {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', `${e.clientX - r.left}px`);
    t.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  /* ---------- Ảnh hero nghiêng nhẹ theo con trỏ ---------- */
  const vis = $('.hero-vis');
  if (vis && !reduce && matchMedia('(pointer: fine)').matches) {
    const main = $('.hv-main', vis);
    main.style.transition = 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)';
    vis.addEventListener('pointermove', (e) => {
      const r = vis.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      main.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    vis.addEventListener('pointerleave', () => { main.style.transform = ''; });
  }

  /* ---------- Cuộn: header, dự án trượt ngang, hành trình ---------- */
  const proj = $('.proj'), track = $('#proj-track'), bar = $('#proj-bar');
  const pipe = $('#pipe'), steps = $$('#pipe li');
  const wide = matchMedia('(min-width: 961px)');
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const onScroll = () => {
    const vh = innerHeight;
    hdr.classList.toggle('is-solid', scrollY > 30);
    if (wide.matches && !reduce) {
      const r = proj.getBoundingClientRect();
      const p = clamp(-r.top / (proj.offsetHeight - vh));
      track.style.transform = `translate3d(${-p * Math.max(0, track.scrollWidth - innerWidth + 48)}px,0,0)`;
      bar.style.transform = `scaleX(${p})`;
    }
    const pr = pipe.getBoundingClientRect();
    const pp = reduce ? 1 : clamp((vh * 0.7 - pr.top) / pr.height);
    pipe.style.setProperty('--p', pp.toFixed(3));
    const done = Math.floor(pp * steps.length + 0.2);
    steps.forEach((li, i) => { li.classList.toggle('on', i < done); li.classList.toggle('run', i === done && pp > 0); });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();

/* ================= Đèn sân khấu + dải sáng ================= */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Bụi sáng lơ lửng trong chùm đèn ---------- */
  const cv = document.getElementById('dust');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, run = true, parts = [];
    const fit = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(140, w / 9));
      parts = Array.from({ length: n }, () => ({
        x: w / 2 + (Math.random() - 0.5) * w * 0.55, y: Math.random() * h * 0.9,
        r: Math.random() * 1.6 + 0.3, vx: (Math.random() - 0.5) * 0.12, vy: -(Math.random() * 0.18 + 0.03),
        a: Math.random() * Math.PI * 2,
      }));
    };
    const draw = () => {
      if (run) {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
          p.x += p.vx + Math.sin(p.a) * 0.08; p.y += p.vy; p.a += 0.01;
          if (p.y < -10) { p.y = h * 0.9; p.x = w / 2 + (Math.random() - 0.5) * w * 0.55; }
          // sáng hơn khi nằm trong lòng chùm đèn (giữa và phía trên)
          const dx = Math.abs(p.x - w / 2) / (w * 0.08 + p.y * 0.35);
          const light = Math.max(0, 1 - dx) * (1 - p.y / h);
          const alpha = 0.08 + light * 0.75 * (0.6 + 0.4 * Math.sin(p.a * 3));
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(207, 255, 224, ${alpha.toFixed(3)})`;
          ctx.shadowColor = 'rgba(13, 217, 84, 0.9)'; ctx.shadowBlur = 6 * light;
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };
    fit(); addEventListener('resize', fit); requestAnimationFrame(draw);
    new IntersectionObserver(([e]) => { run = e.isIntersecting; }).observe(cv);
  }

  /* ---------- Dải sáng dọc trang: chạy theo con cuộn, bật đèn từng mục ---------- */
  const beam = document.getElementById('beam');
  const fill = document.getElementById('beam-fill');
  const head = document.getElementById('beam-head');
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.hero-stage');
  const footer = document.querySelector('.ftr');
  const secs = [...document.querySelectorAll('[data-node]:not(.hero)')];
  const nodes = secs.map(() => {
    const n = document.createElement('i');
    n.className = 'node'; n.setAttribute('aria-hidden', 'true');
    document.body.append(n);
    return n;
  });
  let top = 0, len = 0, marks = [];
  const absTop = (el) => el.getBoundingClientRect().top + scrollY;
  const layout = () => {
    top = absTop(stage) + stage.offsetHeight * 0.55;
    len = Math.max(0, absTop(footer) + 60 - top);
    beam.style.top = `${top}px`; beam.style.height = `${len}px`;
    marks = secs.map((s, i) => {
      const head = s.querySelector('.sec-head, .proj-head, .opening-cap, .mf, .fn-card') || s;
      const y = Math.max(absTop(s) + 40, absTop(head) + 12);
      nodes[i].style.top = `${y - 7}px`;
      return y;
    });
    update();
  };
  const update = () => {
    const reach = reduce ? len : Math.min(len, Math.max(0, scrollY + innerHeight * 0.62 - top));
    fill.style.height = `${reach}px`;
    head.style.top = `${reach}px`;
    head.style.opacity = reach > 4 && reach < len - 2 ? '1' : '0';
    const y = top + reach;
    marks.forEach((m, i) => {
      const on = y >= m;
      nodes[i].classList.toggle('is-lit', on);
      secs[i].classList.toggle('is-lit', on);
    });
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', layout);
  addEventListener('load', layout);
  new ResizeObserver(layout).observe(document.body);
  layout();
})();
