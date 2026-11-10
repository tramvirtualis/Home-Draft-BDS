import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, BookOpen, Briefcase, CalendarDays, Cpu, Eye, FileText, MessagesSquare, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import type { HomeContent } from "../../../types/home/home.types";
import { SmartLink } from "../landing/homeUi";
import { PROJECTS } from "../ninja/ninjaContent";
import { Head, HomeFooter, LightStreak, spotlight, useReveal } from "../ninja/shared";
import { SHEET, UNIT } from "./journeyContent";
import { HoldViz, SheetViz, TourViz } from "./journeyViz";
import { ECO5, FINAL5, HERO5, TOOLS5, WHY5 } from "./home5Content";
import "../ninja/ninja.css";
import "./journey.css";
import "./home5.css";

/* Trang chủ nháp 5 (/home-5): bố cục giống /home-2 (hero chồng thẻ, trục sáng chạy giữa, mục lục bám theo),
   nội dung theo bản trang chủ Hubtech: hero + thống kê → 4 giá trị → 4 công cụ trên trục sáng → hệ sinh thái → lời mời. */

const ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck, eye: Eye, users: Users, cpu: Cpu,
  chat: MessagesSquare, calendar: CalendarDays, briefcase: Briefcase, file: FileText,
};

const pad = (i: number) => String(i + 1).padStart(2, "0");

// Công cụ 04: danh sách bài cẩm nang
function GuideViz() {
  return (
    <div className="jr-viz j5-guide">
      <p className="j5-guide-h"><BookOpen /><b>Cẩm nang mua nhà</b></p>
      <ul>
        {TOOLS5.guides.map((g) => (
          <li key={g.title}><em>{g.tag}</em><span>{g.title}</span><ArrowUpRight /></li>
        ))}
      </ul>
    </div>
  );
}

export default function Home5Landing({ content }: { content: HomeContent }) {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  useReveal(root);
  const tools = TOOLS5.items;
  const [active, setActive] = useState(0);

  // Trục sáng: tô theo vị trí cuộn; mục đang đọc là mục có nút đã qua giữa màn hình
  useEffect(() => {
    const el = line.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.55;
      el.style.setProperty("--p", String(Math.min(1, Math.max(0, (mid - r.top) / r.height))));
      let a = 0;
      el.querySelectorAll<HTMLElement>(".jr-node").forEach((n, i) => { if (n.getBoundingClientRect().top < mid) a = i; });
      setActive(a);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const go = (i: number) => document.getElementById(`cong-cu-${i + 1}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

  const visual = (i: number) => {
    if (i === 0) return <SheetViz />;
    if (i === 1) return <TourViz image={content.platform.image} room={tools[1].room} />;
    if (i === 2) return <HoldViz note={tools[2].note} />;
    return <GuideViz />;
  };

  const lumen = PROJECTS[0];

  return (
    <div ref={root} className="home-rn home-jr home-j5">
      {/* ---------- 01. Hero + dải thống kê ---------- */}
      <section className="jr-hero" aria-labelledby="j5-hero-t">
        <LightStreak />
        <div className="rn-wrap">
          <div className="jr-hero-in">
            <div className="jr-hero-copy" data-reveal>
              <p className="rn-pill"><span aria-hidden />{HERO5.pill}</p>
              <h1 id="j5-hero-t">{HERO5.titleLead}<br /><em>{HERO5.titleAccent}</em></h1>
              <p className="jr-hero-sub">{HERO5.desc}</p>
              <div className="rn-actions">
                <SmartLink to={HERO5.cta.to} className="rn-btn">{HERO5.cta.label} <ArrowUpRight /></SmartLink>
                <button type="button" className="rn-btn rn-btn-ghost" onClick={() => go(0)}>Xem công cụ <ArrowDown /></button>
              </div>
            </div>

            <div className="jr-stack" data-reveal aria-hidden>
              <div className="jr-card jr-card-1">
                <img src={lumen.image} alt="" />
                <span className="jr-card-tag">Tìm dự án</span>
                <p><b>{UNIT.project}</b><small>{lumen.place} · từ {lumen.price}</small></p>
              </div>
              <div className="jr-card jr-card-2">
                <span className="jr-card-tag">Bảng hàng</span>
                <div className="jr-mini-grid">{SHEET.slice(0, 15).map((c, i) => <i key={i} className={i === 7 ? "c-pick" : `c-${c}`} />)}</div>
                <p><b>{UNIT.code}</b><small>{UNIT.type}</small></p>
              </div>
              <div className="jr-card jr-card-3">
                <span className="jr-card-tag">Giữ chỗ</span>
                <p className="jr-card-clock">29:59</p>
                <p><small>Đang giữ chỗ cho bạn</small></p>
              </div>
            </div>
          </div>

          <dl className="j5-stats" data-reveal>
            {HERO5.stats.map((s) => <div key={s.label}><dd>{s.value}</dd><dt>{s.label}</dt></div>)}
          </dl>
        </div>
      </section>

      {/* ---------- 02. Vì sao chọn Hubtech ---------- */}
      <section className="rn-sec">
        <div className="rn-wrap">
          <Head label={WHY5.label} lead={WHY5.titleLead} accent={WHY5.titleAccent}>
            <p className="rn-sub">{WHY5.desc}</p>
          </Head>
          <ul className="j5-why">
            {WHY5.items.map((v, i) => {
              const I = ICONS[v.icon] ?? ShieldCheck;
              return (
                <li key={v.title} data-reveal>
                  <span className="j5-why-n">{pad(i)}</span>
                  <span className="j5-why-ic"><I /></span>
                  <b>{v.title}</b>
                  <p>{v.desc}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- 03. Nền tảng công nghệ: 4 công cụ trên trục sáng ---------- */}
      <section className="jr-journey j5-tools" aria-label={TOOLS5.label}>
        <div className="rn-wrap">
          <Head label={TOOLS5.label} lead={TOOLS5.titleLead} accent={TOOLS5.titleAccent}>
            <p className="rn-sub">{TOOLS5.desc}</p>
          </Head>
        </div>
        <div className="rn-wrap jr-journey-in">
          {/* Mục lục bám theo khi cuộn */}
          <nav className="jr-rail" aria-label="Các công cụ">
            <p className="rn-label"><span aria-hidden />Công cụ</p>
            <ol>
              {tools.map((t, i) => (
                <li key={t.title} className={i === active ? "is-on" : i < active ? "is-done" : ""}>
                  <button type="button" onClick={() => go(i)}><i>{pad(i)}</i>{t.title}</button>
                </li>
              ))}
            </ol>
            <p className="jr-rail-p">{active + 1} / {tools.length}</p>
          </nav>

          <div className="jr-line" ref={line}>
            <span className="jr-spine" aria-hidden><span /></span>
            {tools.map((t, i) => (
              <article key={t.title} id={`cong-cu-${i + 1}`} className={`jr-ch ${i % 2 ? "is-rev" : ""} ${i <= active ? "is-lit" : ""}`}>
                <div className="jr-ch-text" data-reveal>
                  <p className="jr-ch-k"><span>{t.sub}</span></p>
                  <h2>{t.title}</h2>
                  <p>{t.desc}</p>
                  <div className="jr-ch-links">
                    <SmartLink to={t.to} className="rn-uline">{t.cta}</SmartLink>
                  </div>
                </div>
                <span className="jr-node" aria-hidden>{pad(i)}</span>
                <div className="jr-ch-viz" onPointerMove={spotlight} data-reveal>{visual(i)}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 04. Hệ sinh thái ---------- */}
      <section className="rn-sec jr-after">
        <div className="rn-wrap">
          <Head label={ECO5.label} lead={ECO5.titleLead} accent={ECO5.titleAccent}>
            <p className="rn-sub">{ECO5.desc}</p>
          </Head>
          <ul className="jr-eco">
            {ECO5.items.map((m) => {
              const I = ICONS[m.icon] ?? MessagesSquare;
              return (
                <li key={m.to} data-reveal>
                  <Link to={m.to}>
                    <span className="jr-eco-ic"><I /></span>
                    <b>{m.title}</b>
                    <small>{m.desc}</small>
                    <em>{m.cta} <ArrowUpRight /></em>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- 05. Lời mời cuối ---------- */}
      <section className="jr-final">
        <LightStreak className="is-flip" />
        <div className="rn-wrap j5-final-in" data-reveal>
          <h2>{FINAL5.titleLead}<br /><em>{FINAL5.titleAccent}</em></h2>
          <p>{FINAL5.desc}</p>
          <div className="rn-actions">
            <SmartLink to={FINAL5.cta.to} className="rn-btn">{FINAL5.cta.label} <ArrowUpRight /></SmartLink>
          </div>
        </div>
      </section>

      <HomeFooter footer={content.footer} />
    </div>
  );
}
