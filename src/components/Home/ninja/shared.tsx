import { useEffect, useId, type PointerEvent, type ReactNode, type RefObject } from "react";
import { Link } from "react-router-dom";
import type { HomeFooter as HomeFooterContent } from "../../../types/home/home.types";
import { telHref } from "../landing/homeUi";

// Phần dùng chung cho cả hai bản trang chủ (/ và /home-2): vệt sáng, tiêu đề mục, hiện dần, footer.

// Vệt sáng chạy ngang (vàng sang xanh)
export function LightStreak({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={`rn-streak ${className}`} viewBox="0 0 1440 640" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#F2B90F" stopOpacity="0" />
          <stop offset=".35" stopColor="#F2B90F" />
          <stop offset=".7" stopColor="#0DD954" />
          <stop offset="1" stopColor="#0DD954" stopOpacity="0" />
        </linearGradient>
        <filter id={`l${id}`} filterUnits="userSpaceOnUse" x="-300" y="-400" width="2040" height="1440"><feGaussianBlur stdDeviation="40" /></filter>
        <filter id={`s${id}`} filterUnits="userSpaceOnUse" x="-300" y="-400" width="2040" height="1440"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <path d="M-80 420 C 300 120, 640 520, 980 260 S 1400 40, 1540 120" stroke={`url(#g${id})`} strokeWidth="150" fill="none" filter={`url(#l${id})`} opacity=".5" />
      <path d="M-80 420 C 300 120, 640 520, 980 260 S 1400 40, 1540 120" stroke={`url(#g${id})`} strokeWidth="10" fill="none" filter={`url(#s${id})`} />
      <path d="M-80 470 C 320 200, 660 560, 1000 320 S 1400 110, 1540 190" stroke={`url(#g${id})`} strokeWidth="3" fill="none" opacity=".6" />
    </svg>
  );
}

// Tiêu đề mục: nhãn nhỏ bên trái, tiêu đề in hoa bên phải
export function Head({ label, lead, accent, children }: { label: string; lead: string; accent: string; children?: ReactNode }) {
  return (
    <div className="rn-head" data-reveal>
      <p className="rn-label"><span aria-hidden />{label}</p>
      <div>
        <h2>{lead} <em>{accent}</em></h2>
        {children}
      </div>
    </div>
  );
}

// Đèn rọi theo chuột: lưu vị trí con trỏ trong thẻ vào biến CSS --mx / --my
export function spotlight(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

// Hiện dần khi cuộn tới + nền html tối để cuộn quá đà không lộ màu trắng.
// Đánh dấu bằng data-reveal="in" (không dùng class) để React đổi className lúc render lại không làm khối ẩn đi.
export function useReveal(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("home-rn-page");
    const items = root.current ? [...root.current.querySelectorAll<HTMLElement>("[data-reveal]")] : [];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach((n) => n.setAttribute("data-reveal", "in"));
      return () => html.classList.remove("home-rn-page");
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.setAttribute("data-reveal", "in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -6% 0px" });
    items.forEach((n) => io.observe(n));
    return () => { io.disconnect(); html.classList.remove("home-rn-page"); };
  }, [root]);
}

// Footer kiểu cũ: logo + mô tả bên trái, liên hệ chữ thường xếp ngang bên phải,
// rồi chữ hubtech lớn quét sáng và dòng bản quyền
export function HomeFooter({ footer }: { footer: HomeFooterContent }) {
  return (
    <footer className="rn-ftr">
      <div className="rn-wrap">
        <div className="rn-ftr-top">
          <div className="rn-ftr-brand">
            <Link className="rn-ftr-logo" to="/"><span className="rn-ftr-mark-ic" aria-hidden />hubtech</Link>
            <p>{footer.description}</p>
          </div>
          <ul className="rn-ftr-contact">
            <li><a href={telHref(footer.phone)}>{footer.phone}</a></li>
            <li><a href={`mailto:${footer.email}`}>{footer.email}</a></li>
            <li>{footer.address}</li>
          </ul>
        </div>
        <p className="rn-ftr-mark" aria-hidden="true"><span>hubtech</span></p>
        <div className="rn-ftr-legal">
          <p>{footer.legal}</p>
          <p><Link to="/chinh-sach-bao-mat">Bảo mật</Link> · <Link to="/dieu-khoan">Điều khoản</Link></p>
        </div>
      </div>
    </footer>
  );
}
