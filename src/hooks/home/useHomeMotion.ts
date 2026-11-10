import { useEffect, type RefObject } from "react";

/* Chuyển động của trang chủ: tiêu đề mục hiện dần, số cuộn, ticker, bảng hàng tự đổi trạng thái, đồng hồ giữ chỗ,
   tuyên ngôn sáng dần, dự án trượt ngang, hành trình, bụi sáng ở hero và các nút đèn bật theo vị trí cuộn. */

const TICKS = [
  ["Lumen A-16.03", "up", "▲ Còn trống", "6,72 tỷ"], ["Aurelia B-02", "hold", "◐ Đang giữ", "32,0 tỷ"], ["Metropole T-21.05", "up", "▲ Mở bán", "8,80 tỷ"],
  ["Lumen A-18.01", "sold", "▼ Đã bán", "9,24 tỷ"], ["Metropole PH-02", "hold", "◐ Đang giữ", "29,0 tỷ"], ["Aurelia D-07", "up", "▲ Còn trống", "48,0 tỷ"],
  ["Lumen A-20.06", "up", "▲ Còn trống", "9,98 tỷ"], ["Metropole T-15.02", "sold", "▼ Đã bán", "12,5 tỷ"],
];

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function useHomeMotion(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const $ = <T extends HTMLElement>(s: string) => root.querySelector<T>(s);
    const $$ = <T extends HTMLElement>(s: string) => [...root.querySelectorAll<T>(s)];
    const stops: (() => void)[] = [];
    const every = (fn: () => void, ms: number) => { const t = setInterval(fn, ms); stops.push(() => clearInterval(t)); };
    const on = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      window.addEventListener(type, fn, opts);
      stops.push(() => window.removeEventListener(type, fn));
    };

    document.documentElement.classList.add("home-lux-page");
    stops.push(() => document.documentElement.classList.remove("home-lux-page"));

    /* ---------- Tiêu đề mục hiện dần ---------- */
    const heads = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); heads.unobserve(e.target); }
    }), { rootMargin: "0px 0px -12% 0px" });
    $$(".sec-head").forEach((el) => heads.observe(el));
    stops.push(() => heads.disconnect());

    /* ---------- Số liệu cuộn chữ số ---------- */
    $$("[data-roll]").forEach((el) => {
      const value = el.dataset.roll ?? "";
      const said = Object.assign(document.createElement("span"), { className: "sr-only", textContent: value });
      const shown = Object.assign(document.createElement("span"), { className: "roll__digits" });
      shown.setAttribute("aria-hidden", "true");
      let i = 0;
      for (const ch of value) {
        if (!/\d/.test(ch)) { shown.append(ch); continue; }
        const col = Object.assign(document.createElement("span"), { className: "roll__col" });
        const strip = Object.assign(document.createElement("span"), { className: "roll__strip" });
        strip.style.setProperty("--d", ch); strip.style.setProperty("--i", String(i++));
        for (let n = 0; n < 10; n++) strip.append(Object.assign(document.createElement("span"), { textContent: String(n) }));
        col.append(strip); shown.append(col);
      }
      el.classList.add("roll"); el.classList.remove("is-in"); el.replaceChildren(said, shown);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in")));
    });

    /* ---------- Ticker bảng hàng ---------- */
    const one = TICKS.map(([c, k, s, p]) => `<span><b>${c}</b> <span class="${k}">${s}</span> <span class="dim">${p}</span></span>`).join("");
    const ticker = $("#ticker");
    if (ticker) ticker.innerHTML = one + one;

    /* ---------- Bảng hàng mini ở hero ---------- */
    const mini = $$("#mini li");
    if (!reduce && mini.length) every(() => {
      if (document.hidden) return;
      const li = mini[(Math.random() * mini.length) | 0];
      const next: Record<string, string> = { free: "hold", hold: Math.random() < 0.6 ? "free" : "sold", sold: "free" };
      li.dataset.s = next[li.dataset.s ?? "free"];
      li.classList.add("flip"); setTimeout(() => li.classList.remove("flip"), 700);
    }, 2600);

    /* ---------- Bảng hàng trực tiếp (bento) ---------- */
    const sheet = $("#sheet");
    const cells: HTMLSpanElement[] = [];
    sheet?.replaceChildren();
    for (let i = 0; i < 40; i++) {
      const r = ((i * 37) % 100) / 100;
      const s = document.createElement("span");
      s.dataset.s = r < 0.55 ? "free" : r < 0.78 ? "hold" : "sold";
      sheet?.append(s); cells.push(s);
    }
    let lastSync = Date.now();
    const tally = () => {
      const c: Record<string, number> = { free: 0, hold: 0, sold: 0 };
      cells.forEach((s) => c[s.dataset.s ?? "free"]++);
      (["free", "hold", "sold"] as const).forEach((k) => { const el = $(`#c-${k}`); if (el) el.textContent = String(c[k]); });
      lastSync = Date.now();
    };
    tally();
    every(() => {
      const s = Math.round((Date.now() - lastSync) / 1000);
      const el = $("#c-tick");
      if (el) el.textContent = s < 2 ? "vừa cập nhật" : `${s} giây trước`;
    }, 1000);
    if (!reduce) every(() => {
      if (document.hidden) return;
      const s = cells[(Math.random() * cells.length) | 0];
      const next: Record<string, string> = { free: "hold", hold: Math.random() < 0.5 ? "sold" : "free", sold: "sold" };
      s.dataset.s = next[s.dataset.s ?? "free"];
      s.classList.add("flip"); setTimeout(() => s.classList.remove("flip"), 600);
      tally();
    }, 1400);

    /* ---------- Đồng hồ giữ chỗ (hero + bento) ---------- */
    const clocks = [$("#clock"), $("#hero-clock")];
    // Khớp thời hạn giữ chỗ thật ở backend (BookingServiceImpl.HOLD_MINUTES = 30)
    let left = 30 * 60 - 1;
    const pad = (n: number) => String(n).padStart(2, "0");
    const show = () => {
      const t = `${pad((left / 60) | 0)}:${pad(left % 60)}`;
      clocks.forEach((c) => { if (c) c.textContent = t; });
    };
    show();
    if (!reduce) every(() => { left = Math.max(0, left - 1); show(); }, 1000);

    /* ---------- Tuyên ngôn sáng dần theo từ ---------- */
    if (CSS.supports("animation-timeline: view()") && !reduce) {
      $$("[data-fill]").forEach((el) => {
        if (el.classList.contains("is-filling")) return;
        const words = (el.textContent ?? "").trim().split(/\s+/);
        el.textContent = "";
        words.forEach((w, i) => {
          el.append(Object.assign(document.createElement("span"), { textContent: w }), i < words.length - 1 ? " " : "");
        });
        el.classList.add("is-filling");
      });
    }

    /* ---------- Vệt sáng theo con trỏ ---------- */
    const glow = (e: PointerEvent) => {
      const t = e.currentTarget as HTMLElement;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", `${e.clientX - r.left}px`);
      t.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    $$(".tile").forEach((t) => {
      t.addEventListener("pointermove", glow);
      stops.push(() => t.removeEventListener("pointermove", glow));
    });

    /* ---------- Ảnh hero nghiêng nhẹ theo con trỏ ---------- */
    const vis = $(".hero-vis"), main = $(".hv-main");
    if (vis && main && !reduce && matchMedia("(pointer: fine)").matches) {
      main.style.transition = "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)";
      const tilt = (e: PointerEvent) => {
        const r = vis.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        main.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      };
      const reset = () => { main.style.transform = ""; };
      vis.addEventListener("pointermove", tilt);
      vis.addEventListener("pointerleave", reset);
      stops.push(() => { vis.removeEventListener("pointermove", tilt); vis.removeEventListener("pointerleave", reset); });
    }

    /* ---------- Cuộn: dự án trượt ngang, hành trình ---------- */
    const proj = $(".proj"), track = $("#proj-track"), bar = $("#proj-bar"), pipe = $("#pipe");
    const steps = $$("#pipe li");
    const wide = matchMedia("(min-width: 961px)");
    const onScroll = () => {
      const vh = innerHeight;
      if (proj && track && bar && wide.matches && !reduce) {
        const p = clamp(-proj.getBoundingClientRect().top / (proj.offsetHeight - vh));
        track.style.transform = `translate3d(${-p * Math.max(0, track.scrollWidth - innerWidth + 48)}px,0,0)`;
        bar.style.transform = `scaleX(${p})`;
      }
      if (pipe) {
        const pr = pipe.getBoundingClientRect();
        const pp = reduce ? 1 : clamp((vh * 0.7 - pr.top) / pr.height);
        pipe.style.setProperty("--p", pp.toFixed(3));
        const done = Math.floor(pp * steps.length + 0.2);
        steps.forEach((li, i) => { li.classList.toggle("on", i < done); li.classList.toggle("run", i === done && pp > 0); });
      }
    };
    on("scroll", onScroll, { passive: true });
    on("resize", onScroll);
    onScroll();

    /* ---------- Bụi sáng lơ lửng ở hero ---------- */
    const cv = $<HTMLCanvasElement>("#dust");
    const ctx = cv?.getContext("2d");
    if (cv && ctx && !reduce) {
      let w = 0, h = 0, run = true, raf = 0;
      let parts: { x: number; y: number; r: number; vx: number; vy: number; a: number }[] = [];
      const fit = () => {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        w = cv.clientWidth; h = cv.clientHeight;
        cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        parts = Array.from({ length: Math.round(Math.min(140, w / 9)) }, () => ({
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
            // sáng hơn khi ở giữa và phía trên
            const dx = Math.abs(p.x - w / 2) / (w * 0.08 + p.y * 0.35);
            const light = Math.max(0, 1 - dx) * (1 - p.y / h);
            const alpha = 0.08 + light * 0.75 * (0.6 + 0.4 * Math.sin(p.a * 3));
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(207, 255, 224, ${alpha.toFixed(3)})`;
            ctx.shadowColor = "rgba(13, 217, 84, 0.9)"; ctx.shadowBlur = 6 * light;
            ctx.fill();
          }
        }
        raf = requestAnimationFrame(draw);
      };
      fit(); on("resize", fit); raf = requestAnimationFrame(draw);
      const seen = new IntersectionObserver(([e]) => { run = e.isIntersecting; });
      seen.observe(cv);
      stops.push(() => { cancelAnimationFrame(raf); seen.disconnect(); });
    }

    /* ---------- Nút đèn đầu mỗi mục: bật khi cuộn tới ---------- */
    const stage = $(".hero-stage") ?? $(".stats") ?? $(".hero-act"), footer = $(".ftr");
    const secs = $$("[data-node]:not(.hero)");
    const nodes = secs.map(() => {
      const n = document.createElement("i");
      n.className = "node"; n.setAttribute("aria-hidden", "true");
      root.append(n);
      return n;
    });
    stops.push(() => nodes.forEach((n) => n.remove()));
    let top = 0, len = 0, marks: number[] = [];
    const absTop = (el: Element) => el.getBoundingClientRect().top - root.getBoundingClientRect().top;
    const light = () => {
      const reach = reduce ? len : Math.min(len, Math.max(0, scrollY + innerHeight * 0.62 - top));
      const y = top + reach;
      marks.forEach((m, i) => {
        const lit = y >= m;
        nodes[i].classList.toggle("is-lit", lit);
        secs[i].classList.toggle("is-lit", lit);
      });
    };
    const layout = () => {
      if (!stage || !footer) return;
      top = absTop(stage) + stage.offsetHeight * 0.55;
      len = Math.max(0, absTop(footer) + 60 - top);
      marks = secs.map((s, i) => {
        const head = s.querySelector(".sec-head, .proj-head, .opening-cap, .mf, .fn-card") ?? s;
        const y = Math.max(absTop(s) + 40, absTop(head) + 12);
        nodes[i].style.top = `${y - 7}px`;
        return y;
      });
      light();
    };
    on("scroll", light, { passive: true });
    on("resize", layout);
    on("load", layout);
    const sized = new ResizeObserver(layout);
    sized.observe(root);
    stops.push(() => sized.disconnect());
    layout();

    return () => stops.forEach((stop) => stop());
  }, [rootRef]);
}
