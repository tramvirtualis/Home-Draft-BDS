import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { HomeContent } from "../../../types/home/home.types";
import { SmartLink } from "../landing/homeUi";
import { HomeFooter, useReveal } from "../ninja/shared";
import WaterBackground from "./WaterBackground";
import { ECO4, FINAL4, HERO4, TOOLS4, WHY4 } from "./waterContent";
import "../ninja/ninja.css";
import "./water.css";

/* Trang chủ nháp 4 (/home-4): mặt nước chỉ ở một góc (cảm hứng Persona 3 Reload) + giao diện kiểu HUD game cyberpunk/kinh dị.
   Góc vát, chữ đơn cách kiểu terminal, tiêu đề nhiễu glitch, hạt nhiễu. Màu giữ bộ cũ.
   Hero + dải thống kê → vì sao chọn → nền tảng công nghệ → hệ sinh thái → lời mời → footer. */

// Bọt nước nổi lên ở góc có nước (vị trí, cỡ, tốc độ cố định để không đổi giữa các lần render)
const BUBBLES = Array.from({ length: 18 }, (_, i) => ({
  left: 62 + ((i * 53 + 7) % 38),
  size: 6 + ((i * 7) % 18),
  dur: 9 + ((i * 5) % 11),
  delay: -((i * 1.7) % 12),
}));

const pad = (i: number) => String(i + 1).padStart(2, "0");

// Tiêu đề mục kiểu HUD: nhãn đơn cách "[01] // NHÃN" + tiêu đề có vạch quét + đoạn mô tả
function Title({ n, label, title, desc }: { n: string; label: string; title: string; desc: string }) {
  return (
    <div className="wt-title" data-reveal>
      <span className="wt-tag">[{n}] // {label}</span>
      <h2>{title}</h2>
      <p>{desc}</p>
    </div>
  );
}

export default function WaterLanding({ content }: { content: HomeContent }) {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  // Nền html tông nước cho trang này (đè nền xanh rêu mặc định)
  useEffect(() => {
    document.documentElement.classList.add("home-wt-page");
    return () => document.documentElement.classList.remove("home-wt-page");
  }, []);

  return (
    <div ref={root} className="home-rn home-wt">
      {/* Lớp nền mặt nước + bọt nước (cố định theo màn hình) */}
      <div className="wt-ocean" aria-hidden>
        <WaterBackground />
        {BUBBLES.map((b, i) => (
          <i key={i} className="wt-bubble" style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` } as CSSProperties} />
        ))}
      </div>

      {/* ---------- 01. Hero + dải thống kê ---------- */}
      <section className="wt-hero" aria-labelledby="wt-hero-t">
        <div className="rn-wrap wt-hero-in">
          <div className="wt-hero-copy" data-reveal>
            <span className="wt-tag">{HERO4.kicker}</span>
            <h1 id="wt-hero-t">
              <span className="wt-glitch" data-text={HERO4.titleLine1}>{HERO4.titleLine1}</span>
              <span className="wt-glitch wt-hl" data-text={HERO4.titleLine2}>{HERO4.titleLine2}</span>
            </h1>
            <p>{HERO4.desc}</p>
            <SmartLink to={HERO4.cta.to} className="wt-btn"><span>{HERO4.cta.label}</span><ArrowUpRight /></SmartLink>
          </div>

          <ul className="wt-stats" data-reveal>
            {HERO4.stats.map((s) => (
              <li key={s.label}><b>{s.value}</b><span>{s.label}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- 02. Vì sao chọn Hubtech ---------- */}
      <section className="wt-sec" id="gia-tri">
        <div className="rn-wrap">
          <Title n="01" label={WHY4.label} title={WHY4.title} desc={WHY4.desc} />
          <div className="wt-values">
            {WHY4.items.map((v, i) => (
              <article key={v.title} className="wt-value" data-reveal style={{ "--d": `${i * 90}ms` } as CSSProperties}>
                <span className="wt-value-n">{pad(i)}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 03. Nền tảng công nghệ: 4 công cụ, mỗi ô có nút riêng ---------- */}
      <section className="wt-sec" id="cong-cu">
        <div className="rn-wrap">
          <Title n="02" label={TOOLS4.label} title={TOOLS4.title} desc={TOOLS4.desc} />
          <div className="wt-tools">
            {TOOLS4.items.map((t, i) => (
              <article key={t.title} className="wt-tool" data-reveal style={{ "--d": `${i * 90}ms` } as CSSProperties}>
                <span className="wt-tool-n">{pad(i)}</span>
                <div className="wt-tool-body">
                  <h3>{t.title}</h3>
                  <em>{t.sub}</em>
                  <p>{t.desc}</p>
                  <SmartLink to={t.to} className="wt-link"><span>{t.cta}</span><ArrowUpRight /></SmartLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 04. Hệ sinh thái ---------- */}
      <section className="wt-sec" id="he-sinh-thai">
        <div className="rn-wrap">
          <Title n="03" label={ECO4.label} title={ECO4.title} desc={ECO4.desc} />
          <div className="wt-eco">
            {ECO4.items.map((e, i) => (
              <Link key={e.title} to={e.to} className="wt-eco-item" data-reveal style={{ "--d": `${i * 90}ms` } as CSSProperties}>
                <span className="wt-eco-n">{pad(i)}</span>
                <h3>{e.title}</h3>
                <p>{e.desc}</p>
                <span className="wt-link"><span>{e.cta}</span><ArrowUpRight /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 05. Lời mời cuối ---------- */}
      <section className="wt-final">
        <div className="rn-wrap" data-reveal>
          <h2><span>{FINAL4.title}</span><span className="wt-hl">{FINAL4.accent}</span></h2>
          <p>{FINAL4.desc}</p>
          <SmartLink to={FINAL4.cta.to} className="wt-btn"><span>{FINAL4.cta.label}</span><ArrowUpRight /></SmartLink>
        </div>
      </section>

      <HomeFooter footer={content.footer} />
    </div>
  );
}
