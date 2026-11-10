import { useEffect, useRef, useState } from "react";

/* Số liệu đếm từ 0 lên khi cuộn tới ("20.000+" → đếm 0..20000, giữ dấu chấm và hậu tố).
   Dùng chung cho /home-6 và /home-7. */

const reduceMotion = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function CountUp({ value, className }: { value: string; className?: string }) {
  const m = value.match(/^([\d.]+)(.*)$/);
  const target = m ? Number(m[1].replace(/\./g, "")) : 0;
  const suffix = m ? m[2] : "";
  const ref = useRef<HTMLElement>(null);
  const [n, setN] = useState(() => (reduceMotion() ? target : 0));

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion()) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / 1600);
        setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target]);

  if (!m) return <b className={className}>{value}</b>;
  return <b ref={ref} className={className}>{n.toLocaleString("vi-VN")}{suffix && <sup>{suffix}</sup>}</b>;
}
