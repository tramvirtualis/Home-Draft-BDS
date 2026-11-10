import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

/* Giao diện "eco" cho /home-classic: xanh rêu đậm xen nền sáng, điểm nhấn xanh lá tươi, thẻ bo góc lớn,
   nút có vòng tròn mũi tên chéo. */

export const E = {
  forest: "#14342b", // nền tối chính
  forest2: "#1a4035", // thẻ trên nền tối
  forest3: "#22503f",
  green: "#8ef05c", // xanh lá tươi: chữ nhấn, thẻ nổi bật, nút
  greenHover: "#a6ff78",
  light: "#e3f1d8", // nền xanh nhạt (dải sáng xen kẽ)
  mint: "#f1f8ea", // nền xanh rất nhạt (dải sáng còn lại, thay cho nền trắng)
  white: "#ffffff",
  ink: "#10241d",
  text: "#4b5a53",
  muted: "#7d8a84",
  line: "rgba(255,255,255,0.12)",
};

// Be Vietnam Pro: thiết kế cho tiếng Việt nên dấu đặt đúng chỗ (Outfit không có bộ chữ tiếng Việt, dấu bị lệch)
export const FONT = '"Be Vietnam Pro", "Inter", system-ui, sans-serif';

export function useEcoFonts() {
  useEffect(() => {
    const id = "font-eco-vn";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

export const wrap = "mx-auto w-full max-w-[1200px] px-5 md:px-10";

// Dòng nhỏ phía trên tiêu đề
export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className="text-xs font-medium" style={{ color: light ? E.green : "#3f8a2c" }}>
      {children}
    </p>
  );
}

// Tiêu đề lớn; phần bọc trong <G> hiện màu xanh lá
export function Title({ children, light = false, className = "" }: { children: ReactNode; light?: boolean; className?: string }) {
  return (
    <h2 className={`text-3xl font-medium leading-[1.15] tracking-[-0.01em] md:text-[42px] ${className}`} style={{ color: light ? E.white : E.ink }}>
      {children}
    </h2>
  );
}

export function G({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <span style={{ color: dark ? "#3f8a2c" : E.green }}>{children}</span>;
}

// Nút: chữ + vòng tròn mũi tên chéo. "green" nền xanh lá, "dark" nền rêu, "ghost" viền trắng
export function CircleButton({
  to,
  href,
  tone = "green",
  children,
  className = "",
}: {
  to?: string;
  href?: string;
  tone?: "green" | "dark" | "ghost";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    green: { box: "bg-[#8ef05c] text-[#10241d] hover:bg-[#a6ff78]", dot: "bg-[#14342b] text-[#8ef05c]" },
    dark: { box: "bg-[#14342b] text-white hover:bg-[#1a4035]", dot: "bg-[#8ef05c] text-[#14342b]" },
    ghost: { box: "border border-white/40 text-white hover:bg-white/10", dot: "bg-[#8ef05c] text-[#14342b]" },
  }[tone];
  const cls = `group/cb inline-flex items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-sm font-medium transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8ef05c] ${tones.box} ${className}`;
  const content = (
    <>
      {children}
      <span className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 group-hover/cb:rotate-45 ${tones.dot}`}>
        <ArrowUpRight size={17} />
      </span>
    </>
  );
  return href ? (
    <a href={href} className={cls}>
      {content}
    </a>
  ) : (
    <Link to={to ?? "/"} className={cls}>
      {content}
    </Link>
  );
}

// Hiện dần khi cuộn tới (tắt khi giảm chuyển động)
export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12);
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Số đếm từ 0 lên khi cuộn tới
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.5);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1400);
      setN(Math.round(value * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return (
    <span ref={ref}>
      {n.toLocaleString("vi-VN")}
      {suffix}
    </span>
  );
}
