import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Briefcase, CalendarDays, Check, Clock, FileText, KeyRound, MessagesSquare, type LucideIcon } from "lucide-react";
import type { HomeContent } from "../../../types/home/home.types";
import { selectIsAuthenticated, useAppSelector } from "../../../store";
import { SmartLink } from "../landing/homeUi";
import { PROJECTS } from "../ninja/ninjaContent";
import { Head, HomeFooter, LightStreak, spotlight, useReveal } from "../ninja/shared";
import { AFTER, CHAPTERS, FINAL, HERO2, UNIT } from "./journeyContent";
import "../ninja/ninja.css";
import "./journey.css";

/* Trang chủ nháp 2 (/home-2): cả trang là một hành trình 5 chương nối bằng trục sáng ở giữa.
   Trục tô dần theo vị trí cuộn, chương xếp so le trái/phải, thanh mục lục bám theo bên trái.
   Nội dung theo một căn mẫu (Lumen Riverside A-16.03) từ chương 1 đến chương 5. */

const ECO_ICONS: Record<string, LucideIcon> = { chat: MessagesSquare, calendar: CalendarDays, briefcase: Briefcase, file: FileText };

/* ---------- Đánh giá khách hàng: điểm hài lòng + danh sách chọn + thẻ nổi bật tự chuyển ---------- */
type Review = { quote: string; name: string; role: string; initials: string };
const REVIEW_MS = 6000;

function Reviews({ items, score }: { items: Review[]; score?: { value: string; suffix: string; label: string } }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;
  const go = (d: number) => setIdx((i) => (i + d + n) % n);

  useEffect(() => {
    if (paused || n < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % n), REVIEW_MS);
    return () => clearTimeout(t);
  }, [idx, paused, n]);

  const cur = items[idx];
  if (!cur) return null;
  // Ảnh nền: dự án có tên nằm trong vai trò của khách (vd "Cư dân Lumen" → Lumen Riverside)
  const project = PROJECTS.find((p) => cur.role.toLowerCase().includes(p.name.split(" ")[0].toLowerCase()));

  return (
    <div className="jr-rv" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <aside className="jr-rv-side" data-reveal>
        {score && (
          <div className="jr-rv-score">
            <b>{score.value}<span>{score.suffix}</span></b>
            <span className="jr-stars" aria-label="5 sao">★★★★★</span>
            <small>{score.label}</small>
          </div>
        )}
      </aside>

      <figure className="jr-rv-main" data-reveal>
        {project && <img key={project.image} src={project.image} alt="" loading="lazy" />}
        <span className="jr-rv-mark" aria-hidden>“</span>
        <blockquote key={idx}>{cur.quote}</blockquote>
        <figcaption>
          <i>{cur.initials}</i>
          <span><b>{cur.name}</b><small>{cur.role}</small></span>
          {project && <em className="jr-rv-tag">{project.name}</em>}
        </figcaption>
        <div className="jr-rv-nav">
          <span>{String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
          <button type="button" aria-label="Đánh giá trước" onClick={() => go(-1)}><ArrowLeft /></button>
          <button type="button" aria-label="Đánh giá sau" onClick={() => go(1)}><ArrowRight /></button>
        </div>
        {/* Vạch thời gian tự chạy ở mép dưới thẻ, hết vạch thì sang đánh giá tiếp theo */}
        <span className="jr-rv-bar" aria-hidden>
          <em key={`${idx}-${paused}`} className={paused ? "is-paused" : ""} style={{ animationDuration: `${REVIEW_MS}ms` }} />
        </span>
      </figure>
    </div>
  );
}

/* ---------- Hình minh họa từng chương ---------- */

// Chương 1: lọc dự án, căn mẫu nằm ở dự án đầu tiên
function ExploreViz() {
  const kinds = ["Tất cả", "Căn hộ", "Biệt thự", "Nhà phố"];
  const [kind, setKind] = useState(kinds[0]);
  const list = (kind === kinds[0] ? PROJECTS : PROJECTS.filter((p) => p.kind === kind)).slice(0, 3);
  return (
    <div className="jr-viz jr-explore">
      <div className="rn-chips">
        {kinds.map((k) => <button key={k} type="button" className={k === kind ? "is-on" : ""} onClick={() => setKind(k)}>{k}</button>)}
      </div>
      <ul>
        {list.map((p) => (
          <li key={p.name} className={p.name === UNIT.project ? "is-pick" : ""}>
            <img src={p.image} alt="" loading="lazy" />
            <span><b>{p.name}</b><small>{p.kind} · {p.place}</small></span>
            <em>{p.price}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Chương 2: ảnh căn mẫu có điểm nóng nhấp nháy
function TourViz({ image, room }: { image: string; room?: string }) {
  return (
    <div className="jr-viz jr-tour">
      <img src={image} alt="" loading="lazy" />
      <span className="jr-hot" style={{ "--x": "28%", "--y": "58%" } as CSSProperties} />
      <span className="jr-hot" style={{ "--x": "64%", "--y": "40%" } as CSSProperties} />
      <span className="jr-hot" style={{ "--x": "82%", "--y": "70%" } as CSSProperties} />
      <span className="jr-tour-deg">360°</span>
      <span className="jr-tour-room">{UNIT.code} · {room}</span>
    </div>
  );
}

// Chương 3: bảng hàng thu nhỏ, ô của căn mẫu được đánh dấu
const SHEET = ["f", "s", "f", "h", "s", "f", "s", "f", "f", "h", "s", "s", "f", "s", "f", "h", "f", "s", "f", "f", "s", "h", "f", "s"];
function SheetViz() {
  const [cells, setCells] = useState(SHEET);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setCells((c) => {
      const n = [...c]; const i = Math.floor(Math.random() * n.length);
      if (i !== 9) n[i] = n[i] === "f" ? "h" : n[i] === "h" ? "s" : "f";
      return n;
    }), 1500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="jr-viz jr-sheet">
      <p className="jr-sheet-h"><b>{UNIT.project}</b><span>Tòa A · Tầng 16</span></p>
      <div className="jr-sheet-grid">
        {cells.map((c, i) => i === 9
          ? <span key={i} className="c-pick" title={UNIT.code}>{UNIT.code}</span>
          : <span key={i} className={`c-${c}`} />)}
      </div>
      <p className="jr-legend"><span><i className="c-f" />Còn trống</span><span><i className="c-h" />Đang giữ</span><span><i className="c-s" />Đã bán</span></p>
    </div>
  );
}

// Chương 4: đồng hồ giữ chỗ chạy thật
function HoldViz({ note }: { note?: string }) {
  const [left, setLeft] = useState(29 * 60 + 59);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s <= 0 ? 30 * 60 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="jr-viz jr-hold">
      <p className="jr-hold-k"><Clock />Căn {UNIT.code} đang được giữ cho bạn</p>
      <p className="jr-clock">{String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</p>
      <div className="jr-bar"><span style={{ width: `${(left / 1800) * 100}%` }} /></div>
      <p className="jr-hold-meta"><span>{UNIT.type}</span><b>{UNIT.price}</b></p>
      <p className="jr-hold-note">{note}</p>
    </div>
  );
}

// Chương 5: các mốc bàn giao + một lời khách hàng
function KeyViz({ steps, quote }: { steps?: string[]; quote?: { quote: string; name: string; role: string; initials: string } }) {
  return (
    <div className="jr-viz jr-key">
      <div className="jr-key-ic"><KeyRound /></div>
      <ol>{steps?.map((s, i) => <li key={s} className={i < 2 ? "is-done" : "is-now"}><i>{i < 2 ? <Check /> : null}</i>{s}</li>)}</ol>
      {quote && (
        <figure>
          <blockquote>“{quote.quote}”</blockquote>
          <figcaption><i>{quote.initials}</i>{quote.name} · {quote.role}</figcaption>
        </figure>
      )}
    </div>
  );
}

/* ---------- Trang ---------- */

export default function JourneyLanding({ content }: { content: HomeContent }) {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  useReveal(root);
  const signedIn = useAppSelector(selectIsAuthenticated);
  const { hero, stats, journey, platform, testimonials, finale, footer } = content;
  const steps = journey.steps;
  const [active, setActive] = useState(0);

  // Trục sáng: tô theo vị trí cuộn; chương đang đọc là chương có nút đã qua giữa màn hình
  useEffect(() => {
    const el = line.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.55;
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      el.style.setProperty("--p", String(p));
      const nodes = [...el.querySelectorAll<HTMLElement>(".jr-node")];
      let a = 0;
      nodes.forEach((n, i) => { if (n.getBoundingClientRect().top < mid) a = i; });
      setActive(a);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const go = (i: number) => document.getElementById(`chuong-${i + 1}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

  const visual = (i: number) => {
    const c = CHAPTERS[i];
    if (i === 0) return <ExploreViz />;
    if (i === 1) return <TourViz image={platform.image} room={c?.room} />;
    if (i === 2) return <SheetViz />;
    if (i === 3) return <HoldViz note={c?.note} />;
    return <KeyViz steps={c?.steps} quote={testimonials.items[0]} />;
  };

  const lumen = PROJECTS[0];

  return (
    <div ref={root} className="home-rn home-jr">
      {/* ---------- Hero: tiêu đề hành trình + chồng thẻ xem trước các chương + bản đồ 5 chương ---------- */}
      <section className="jr-hero" aria-labelledby="jr-hero-t">
        <LightStreak />
        <div className="rn-wrap">
          <div className="jr-hero-in">
            <div className="jr-hero-copy" data-reveal>
              <p className="rn-pill"><span aria-hidden />{hero.pill}</p>
              <h1 id="jr-hero-t">{journey.titleLead}<br /><em>{journey.titleAccent}</em></h1>
              <p className="jr-hero-sub">{HERO2.motto}</p>
              <div className="rn-actions">
                <button type="button" className="rn-btn" onClick={() => go(0)}>{HERO2.start} <ArrowDown /></button>
                <SmartLink to={hero.primaryLink} className="rn-btn rn-btn-ghost">{hero.primaryLabel}</SmartLink>
              </div>
            </div>

            <div className="jr-stack" data-reveal aria-hidden>
              <div className="jr-card jr-card-1">
                <img src={lumen.image} alt="" />
                <span className="jr-card-tag">Tìm dự án</span>
                <p><b>{UNIT.project}</b><small>{lumen.place} · từ {lumen.price}</small></p>
              </div>
              <div className="jr-card jr-card-2">
                <span className="jr-card-tag">Chọn căn</span>
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

          {/* Bản đồ hành trình: 5 chương nối bằng một đường, bấm để nhảy tới */}
          <ol className="jr-map" data-reveal>
            {steps.map((s, i) => (
              <li key={s.title}>
                <button type="button" onClick={() => go(i)}>
                  <i>{String(i + 1).padStart(2, "0")}</i>
                  <b>{s.title}</b>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Hành trình 5 chương ---------- */}
      <section className="jr-journey" aria-label="Hành trình mua nhà">
        <div className="rn-wrap jr-journey-in">
          {/* Mục lục bám theo khi cuộn */}
          <nav className="jr-rail" aria-label="Các bước">
            <p className="rn-label"><span aria-hidden />{journey.kicker}</p>
            <ol>
              {steps.map((s, i) => (
                <li key={s.title} className={i === active ? "is-on" : i < active ? "is-done" : ""}>
                  <button type="button" onClick={() => go(i)}><i>{String(i + 1).padStart(2, "0")}</i>{s.title}</button>
                </li>
              ))}
            </ol>
            <p className="jr-rail-p">{active + 1} / {steps.length}</p>
          </nav>

          <div className="jr-line" ref={line}>
            <span className="jr-spine" aria-hidden><span /></span>
            {steps.map((s, i) => {
              const c = CHAPTERS[i];
              return (
                <article key={s.title} id={`chuong-${i + 1}`} className={`jr-ch ${i % 2 ? "is-rev" : ""} ${i <= active ? "is-lit" : ""}`}>
                  <div className="jr-ch-text" data-reveal>
                    <p className="jr-ch-k"><span>{s.time}</span></p>
                    <h2>{s.title}</h2>
                    <p>{s.desc}</p>
                    <div className="jr-ch-links">
                      {c && <SmartLink to={c.link} className="rn-uline">{c.cta}</SmartLink>}
                    </div>
                  </div>
                  <span className="jr-node" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  <div className="jr-ch-viz" onPointerMove={spotlight} data-reveal>{visual(i)}</div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Sau khi nhận nhà: hệ sinh thái nối tiếp trục ---------- */}
      <section className="rn-sec jr-after">
        <div className="rn-wrap">
          <Head label={AFTER.label} lead={AFTER.titleLead} accent={AFTER.titleAccent}>
            <p className="rn-sub">{AFTER.text}</p>
          </Head>
          <ul className="jr-eco">
            {platform.more.map((m) => {
              const I = ECO_ICONS[m.icon] ?? MessagesSquare;
              return (
                <li key={m.link} data-reveal>
                  <SmartLink to={m.link}>
                    <span className="jr-eco-ic"><I /></span>
                    <b>{m.title}</b>
                    <small>{m.desc}</small>
                    <em>{m.cta} <ArrowUpRight /></em>
                  </SmartLink>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- Khách hàng nói gì ---------- */}
      <section className="rn-sec jr-reviews">
        <div className="rn-wrap">
          <Head label={testimonials.kicker} lead={testimonials.titleLead} accent={testimonials.titleAccent} />
          <Reviews items={testimonials.items} score={stats.items.find((s) => s.suffix === "%")} />
        </div>
      </section>

      {/* ---------- Lời mời cuối: số liệu + nút ---------- */}
      <section className="jr-final">
        <LightStreak className="is-flip" />
        <div className="rn-wrap jr-final-in">
          <div data-reveal>
            <h2>{FINAL.titleLead}<br /><em>{FINAL.titleAccent}</em></h2>
            <p>{signedIn ? finale.memberSubtitle : finale.subtitle}</p>
            <div className="rn-actions">
              <SmartLink to={signedIn ? finale.memberLink : finale.registerLink} className="rn-btn">
                {signedIn ? finale.memberLabel : finale.registerLabel} <ArrowUpRight />
              </SmartLink>
              <Link to="/projects" className="rn-btn rn-btn-ghost">Xem dự án</Link>
            </div>
          </div>
          <dl className="jr-final-stats" data-reveal>
            {stats.items.map((s) => <div key={s.label}><dd>{s.value}<span>{s.suffix}</span></dd><dt>{s.label}</dt></div>)}
          </dl>
        </div>
      </section>

      <HomeFooter footer={footer} />
    </div>
  );
}
