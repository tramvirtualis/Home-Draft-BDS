import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { HomeContent } from "../../../types/home/home.types";
import { selectIsAuthenticated, useAppSelector } from "../../../store";
import { SmartLink } from "../landing/homeUi";
import { PROJECTS } from "../ninja/ninjaContent";
import { HomeFooter, useReveal } from "../ninja/shared";
import WaterBackground from "./WaterBackground";
import { FINAL4, HERO4, PROJ4, STATUS, VAL4, VOICE4 } from "./waterContent";
import "../ninja/ninja.css";
import "./water.css";

/* Trang chủ nháp 4 (/home-4): mặt nước chỉ ở một góc (cảm hứng Persona 3 Reload) + giao diện kiểu HUD game cyberpunk/kinh dị.
   Góc vát, ngoặc khung ngắm, chữ đơn cách kiểu terminal, tiêu đề nhiễu glitch, vạch quét + hạt nhiễu. Màu giữ bộ cũ.
   Hero → thanh chỉ số → dự án → giá trị → bong bóng hội thoại đánh giá → lời mời → footer. */

// Bọt nước nổi lên ở góc có nước (vị trí, cỡ, tốc độ cố định để không đổi giữa các lần render)
const BUBBLES = Array.from({ length: 18 }, (_, i) => ({
  left: 62 + ((i * 53 + 7) % 38),
  size: 6 + ((i * 7) % 18),
  dur: 9 + ((i * 5) % 11),
  delay: -((i * 1.7) % 12),
}));

// Tiêu đề mục kiểu HUD: nhãn đơn cách "[01] // NHÃN" + tiêu đề có vạch quét
function Title({ n, label, title }: { n: string; label: string; title: string }) {
  return (
    <div className="wt-title" data-reveal>
      <span className="wt-tag">[{n}] // {label}</span>
      <h2>{title}</h2>
    </div>
  );
}

// Khung hội thoại: chữ tự gõ từng ký tự, gõ xong chờ rồi sang người tiếp theo
function Dialogue({ items }: { items: { quote: string; name: string; role: string; initials: string }[] }) {
  const [idx, setIdx] = useState(0);
  const [len, setLen] = useState(0);
  const cur = items[idx];
  const full = cur?.quote ?? "";
  const reduce = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduce) { setLen(full.length); return; }
    if (len < full.length) {
      const t = setTimeout(() => setLen((l) => l + 1), 28);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setIdx((i) => (i + 1) % items.length); setLen(0); }, 3200);
    return () => clearTimeout(t);
  }, [len, full, items.length, reduce]);

  if (!cur) return null;
  const done = len >= full.length;
  // Bấm vào khung: đang gõ thì hiện hết câu, gõ xong thì sang người tiếp theo
  const advance = () => {
    if (!done) { setLen(full.length); return; }
    setIdx((i) => (i + 1) % items.length);
    setLen(0);
  };
  return (
    <div className="wt-dialog" data-reveal>
      <div className="wt-dialog-name"><i>{cur.initials}</i><b>{cur.name}</b><small>{cur.role}</small></div>
      <div className="wt-dialog-box" role="button" tabIndex={0} onClick={advance} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); advance(); } }}>
        <p>{full.slice(0, len)}{!done && <span className="wt-caret" />}</p>
        <span className={`wt-next ${done ? "is-on" : ""}`} aria-hidden>▼</span>
      </div>
      <div className="wt-dialog-dots">
        {items.map((r, i) => (
          <button key={r.name} type="button" aria-label={r.name} className={i === idx ? "is-on" : ""} onClick={() => { setIdx(i); setLen(0); }} />
        ))}
      </div>
    </div>
  );
}

export default function WaterLanding({ content }: { content: HomeContent }) {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const signedIn = useAppSelector(selectIsAuthenticated);
  const { hero, stats, values, testimonials, finale, footer } = content;

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

      {/* ---------- Hero ---------- */}
      <section className="wt-hero" aria-labelledby="wt-hero-t">
        <div className="rn-wrap wt-hud" aria-hidden>
          <p><i />{HERO4.hud[0]}</p>
          <p>{HERO4.hud[1]}</p>
          <p>{HERO4.hud[2]}</p>
        </div>
        <div className="rn-wrap wt-hero-in">
          <div className="wt-hero-copy" data-reveal>
            <span className="wt-tag">{HERO4.kicker}</span>
            <h1 id="wt-hero-t">
              <span className="wt-glitch" data-text={hero.titleLine1}>{hero.titleLine1}</span>
              <span className="wt-glitch wt-hl" data-text={hero.titleLine2}>{hero.titleLine2}</span>
            </h1>
            <p>{HERO4.motto}</p>
            <SmartLink to={hero.primaryLink} className="wt-btn"><span>{HERO4.cta}</span><ArrowUpRight /></SmartLink>
          </div>
        </div>
      </section>

      {/* ---------- Thanh chỉ số ---------- */}
      <section className="wt-sec wt-status">
        <div className="rn-wrap">
          <Title n="01" label={STATUS.label} title={STATUS.title} />
          <ul className="wt-bars">
            {stats.items.map((s, i) => (
              <li key={s.label} data-reveal style={{ "--f": STATUS.fills[i] ?? 0.7, "--d": `${i * 120}ms` } as CSSProperties}>
                <span className="wt-bar-label">{s.label}</span>
                <span className="wt-bar-track"><i /></span>
                <b>{s.value}<small>{s.suffix}</small></b>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Dự án: thẻ bo tròn, khung chữ kính mờ ---------- */}
      <section className="wt-sec" id="du-an">
        <div className="rn-wrap">
          <Title n="02" label={PROJ4.label} title={PROJ4.title} />
          <div className="wt-projects">
            {PROJECTS.map((p, i) => (
              <Link to="/projects" className="wt-pcard" key={p.name} data-reveal style={{ "--d": `${i * 90}ms` } as CSSProperties}>
                <span className="wt-pcard-img"><img src={p.image} alt={`Dự án ${p.name}`} loading="lazy" /></span>
                <span className="wt-pcard-badge">{p.badge}</span>
                <span className="wt-pcard-info">
                  <small><MapPin />{p.place}</small>
                  <b>{p.name}</b>
                  <em>{p.kind} · Từ {p.price}</em>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Giá trị: thẻ kính mờ có bọt số ---------- */}
      <section className="wt-sec wt-values-sec" id="gia-tri">
        <div className="rn-wrap">
          <Title n="03" label={VAL4.label} title={VAL4.title} />
          <div className="wt-values">
            {values.items.map((v, i) => (
              <article key={v.title} className="wt-value" data-reveal style={{ "--d": `${i * 90}ms` } as CSSProperties}>
                <span className="wt-value-n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Khách hàng: bong bóng hội thoại ---------- */}
      <section className="wt-sec" id="khach-hang">
        <div className="rn-wrap">
          <Title n="04" label={VOICE4.label} title={VOICE4.title} />
          <Dialogue items={testimonials.items} />
        </div>
      </section>

      {/* ---------- Lời mời cuối ---------- */}
      <section className="wt-final">
        <div className="rn-wrap" data-reveal>
          <h2><span>{FINAL4.title}</span><span className="wt-hl">{FINAL4.accent}</span></h2>
          <p>{signedIn ? finale.memberSubtitle : finale.subtitle}</p>
          <SmartLink to={signedIn ? finale.memberLink : finale.registerLink} className="wt-btn">
            <span>{signedIn ? finale.memberLabel : finale.registerLabel}</span><ArrowUpRight />
          </SmartLink>
        </div>
      </section>

      <HomeFooter footer={footer} />
    </div>
  );
}
