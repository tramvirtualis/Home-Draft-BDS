import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Bot, Clock, MapPin, Plus, Search } from "lucide-react";
import type { HomeContent } from "../../../types/home/home.types";
import { selectIsAuthenticated, useAppSelector } from "../../../store";
import { SmartLink, telHref } from "../landing/homeUi";
import { PROJECTS } from "../ninja/ninjaContent";
import { Head, HomeFooter, LightStreak, spotlight, useReveal } from "../ninja/shared";
import { BENTO, FAQ, FINAL3, HERO3, RAIL, TICKS, WALL } from "./exploreContent";
import "../ninja/ninja.css";
import "./explore.css";

/* Trang chủ nháp 3 (/home-3): bố cục kiểu "ứng dụng tìm nhà".
   Hero căn giữa có thanh tìm kiếm → dải bảng hàng chạy ngang → băng chuyền dự án → lưới bento công cụ
   → dải số liệu lớn → tường đánh giá chạy hai chiều → hỏi đáp → lời mời cuối → footer. Màu giữ bộ cũ. */

/* ---------- Ô bento: bảng hàng thu nhỏ tự đổi trạng thái ---------- */
const CELLS = ["f", "s", "f", "h", "s", "f", "f", "s", "h", "f", "s", "f", "f", "h", "f", "s", "f", "s", "h", "f", "f", "s", "f", "h", "s", "f", "f", "s", "f", "h"];
function LiveSheet() {
  const [cells, setCells] = useState(CELLS);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setCells((c) => {
      const n = [...c]; const i = Math.floor(Math.random() * n.length);
      n[i] = n[i] === "f" ? "h" : n[i] === "h" ? "s" : "f";
      return n;
    }), 1200);
    return () => clearInterval(t);
  }, []);
  const count = (k: string) => cells.filter((c) => c === k).length;
  return (
    <div className="ex-sheet">
      <div className="ex-sheet-grid">{cells.map((c, i) => <span key={i} className={`ex-c-${c}`} />)}</div>
      <p className="ex-sheet-sum">
        <span><i className="ex-c-f" />Còn {count("f")}</span>
        <span><i className="ex-c-h" />Giữ {count("h")}</span>
        <span><i className="ex-c-s" />Bán {count("s")}</span>
      </p>
    </div>
  );
}

function Countdown() {
  const [left, setLeft] = useState(29 * 60 + 59);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s <= 0 ? 30 * 60 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return <b className="ex-clock">{String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</b>;
}

export default function ExploreLanding({ content }: { content: HomeContent }) {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  useReveal(root);
  const navigate = useNavigate();
  const signedIn = useAppSelector(selectIsAuthenticated);
  const { hero, stats, platform, values, testimonials, finale, footer } = content;
  const [kind, setKind] = useState(HERO3.kinds[0]);
  const [openFaq, setOpenFaq] = useState(0);

  // Tìm kiếm: chuyển sang trang dự án kèm điều kiện đã chọn
  const search = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const q = new URLSearchParams({ kind, area: String(f.get("area") ?? ""), budget: String(f.get("budget") ?? "") });
    navigate(`/projects?${q.toString()}`);
  };

  // Băng chuyền dự án: mỗi lần bấm trượt một thẻ
  const slide = (d: number) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".ex-pcard");
    el.scrollBy({ left: d * ((card?.offsetWidth ?? 320) + 16), behavior: "smooth" });
  };

  // Tường đánh giá: nhân bản danh sách để hai hàng chạy liền mạch
  const wall = [...testimonials.items, ...testimonials.items, ...testimonials.items];

  return (
    <div ref={root} className="home-rn home-ex">
      {/* ---------- Hero căn giữa + thanh tìm kiếm ---------- */}
      <section className="ex-hero" aria-labelledby="ex-hero-t" style={{ backgroundImage: `linear-gradient(180deg, rgba(6,17,13,.55) 0%, rgba(6,17,13,.92) 70%, #06110D 100%), url(${HERO3.bg})` }}>
        <LightStreak />
        <div className="rn-wrap ex-hero-in">
          <p className="rn-pill" data-reveal><span aria-hidden />{hero.pill}</p>
          <h1 id="ex-hero-t" data-reveal>{HERO3.titleLead} <em>{HERO3.titleAccent}</em></h1>
          <p className="ex-hero-sub" data-reveal>{HERO3.sub}</p>

          <form className="ex-search" onSubmit={search} data-reveal>
            <div className="ex-search-tabs" role="tablist" aria-label="Loại hình">
              {HERO3.kinds.map((k) => (
                <button key={k} type="button" role="tab" aria-selected={k === kind} className={k === kind ? "is-on" : ""} onClick={() => setKind(k)}>{k}</button>
              ))}
            </div>
            <div className="ex-search-row">
              <label><MapPin /><span>Khu vực</span>
                <select name="area" defaultValue={HERO3.areas[0]}>{HERO3.areas.map((a) => <option key={a}>{a}</option>)}</select>
              </label>
              <label><span className="ex-vnd" aria-hidden>₫</span><span>Ngân sách</span>
                <select name="budget" defaultValue={HERO3.budgets[0]}>{HERO3.budgets.map((b) => <option key={b}>{b}</option>)}</select>
              </label>
              <button type="submit" className="rn-btn"><Search />{HERO3.search}</button>
            </div>
          </form>

          <ul className="ex-hero-pills" data-reveal>
            {stats.items.map((s) => <li key={s.label}><b>{s.value}{s.suffix}</b>{s.label}</li>)}
          </ul>
        </div>
      </section>

      {/* ---------- Dải bảng hàng chạy ngang ---------- */}
      <div className="ex-ticker" aria-label="Biến động bảng hàng (dữ liệu mẫu)">
        <div className="ex-ticker-track">
          {[...TICKS, ...TICKS].map((t, i) => (
            <span key={i} className={`ex-tick is-${t.state}`}><i />{t.unit}<em>{t.label}</em><b>{t.price}</b></span>
          ))}
        </div>
      </div>

      {/* ---------- Băng chuyền dự án ---------- */}
      <section className="rn-sec" id="du-an">
        <div className="rn-wrap">
          <div className="ex-rail-head">
            <Head label={RAIL.label} lead={RAIL.titleLead} accent={RAIL.titleAccent} />
            <div className="ex-rail-nav">
              <button type="button" aria-label="Dự án trước" onClick={() => slide(-1)}><ArrowLeft /></button>
              <button type="button" aria-label="Dự án sau" onClick={() => slide(1)}><ArrowRight /></button>
            </div>
          </div>
        </div>
        <div className="ex-rail" ref={rail}>
          {PROJECTS.map((p) => (
            <Link to="/projects" className="ex-pcard" key={p.name}>
              <img src={p.image} alt={`Dự án ${p.name}`} loading="lazy" />
              <span className="ex-pcard-badge">{p.badge}</span>
              <span className="ex-pcard-go"><ArrowUpRight /></span>
              <div className="ex-pcard-info">
                <p className="ex-pcard-loc"><MapPin />{p.place}</p>
                <h3>{p.name}</h3>
                <p className="ex-pcard-row"><span>{p.kind}</span><b>Từ {p.price}</b></p>
              </div>
            </Link>
          ))}
          <Link to="/projects" className="ex-pcard ex-pcard-all">
            <Plus />
            <b>Xem tất cả dự án</b>
          </Link>
        </div>
      </section>

      {/* ---------- Bento công cụ ---------- */}
      <section className="rn-sec">
        <div className="rn-wrap">
          <Head label={BENTO.label} lead={BENTO.titleLead} accent={BENTO.titleAccent} />
          {/* 4 thẻ cùng cấu trúc: khung minh họa cao bằng nhau ở trên, tiêu đề + mô tả ở dưới */}
          <div className="ex-bento">
            <Link to={platform.sheetLink} className="ex-tile" onPointerMove={spotlight} data-reveal>
              <div className="ex-vis"><LiveSheet /></div>
              <div className="ex-tile-txt"><h3>{platform.sheetTitle}</h3><p>{platform.sheetDesc}</p></div>
            </Link>
            <Link to={platform.tourLink} className="ex-tile" onPointerMove={spotlight} data-reveal>
              <div className="ex-vis ex-vis-img">
                <img src={platform.image} alt={platform.imageAlt} loading="lazy" />
                <span className="ex-deg">360°</span>
              </div>
              <div className="ex-tile-txt"><h3>{platform.tourTitle}</h3><p>{platform.tourDesc}</p></div>
            </Link>
            <Link to={platform.holdLink} className="ex-tile" onPointerMove={spotlight} data-reveal>
              <div className="ex-vis ex-vis-hold">
                <p className="ex-tile-k"><Clock />Căn A-16.03</p>
                <Countdown />
                <span className="ex-hold-bar"><i /></span>
              </div>
              <div className="ex-tile-txt"><h3>{platform.holdTitle}</h3><p>{platform.holdDesc}</p></div>
            </Link>
            <article className="ex-tile" onPointerMove={spotlight} data-reveal>
              <div className="ex-vis ex-chat">
                <p className="ex-bubble ex-me">Dự án nào dưới 7 tỷ ở Thủ Thiêm?</p>
                <p className="ex-bubble ex-ai"><Bot />Lumen Riverside, căn 2 phòng ngủ từ 6,7 tỷ.</p>
              </div>
              <div className="ex-tile-txt"><h3>Trợ lý AI 24/7</h3><p>{values.items[3]?.desc}</p></div>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- Dải số liệu lớn ---------- */}
      <section className="ex-stats" aria-label="Số liệu">
        <div className="rn-wrap">
          <dl>
            {stats.items.map((s) => <div key={s.label} data-reveal><dd>{s.value}<span>{s.suffix}</span></dd><dt>{s.label}</dt></div>)}
          </dl>
        </div>
      </section>

      {/* ---------- Tường đánh giá chạy hai chiều ---------- */}
      <section className="rn-sec ex-wall-sec">
        <div className="rn-wrap">
          <Head label={WALL.label} lead={WALL.titleLead} accent={WALL.titleAccent} />
        </div>
        <div className="ex-wall">
          {[0, 1].map((row) => (
            <div key={row} className={`ex-wall-row ${row ? "is-rev" : ""}`}>
              <div className="ex-wall-track">
                {[...wall, ...wall].map((t, i) => (
                  <figure key={i}>
                    <span className="ex-stars" aria-label="5 sao">★★★★★</span>
                    <blockquote>“{t.quote}”</blockquote>
                    <figcaption><i>{t.initials}</i><span><b>{t.name}</b>{t.role}</span></figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Hỏi đáp: câu hỏi dạng thẻ mở mượt ---------- */}
      <section className="rn-sec">
        <div className="rn-wrap">
          <Head label={FAQ.label} lead={FAQ.titleLead} accent={FAQ.titleAccent} />
          <div className="ex-faq-wrap">
            <div className="ex-faq">
              {FAQ.items.map((f, i) => {
                const on = i === openFaq;
                return (
                  <div key={f.q} className={`ex-faq-item ${on ? "is-open" : ""}`} data-reveal>
                    <button type="button" aria-expanded={on} aria-controls={`faq-${i}`} onClick={() => setOpenFaq(on ? -1 : i)}>
                      <span className="ex-faq-n">{String(i + 1).padStart(2, "0")}</span>
                      <span className="ex-faq-q">{f.q}</span>
                      <span className="ex-faq-ic" aria-hidden><Plus /></span>
                    </button>
                    <div className="ex-faq-panel" id={`faq-${i}`} role="region">
                      <div><p>{f.a}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Lời mời cuối ---------- */}
      <section className="ex-final">
        <LightStreak className="is-flip" />
        <div className="rn-wrap" data-reveal>
          <h2>{FINAL3.titleLead} <em>{FINAL3.titleAccent}</em></h2>
          <p>{signedIn ? finale.memberSubtitle : finale.subtitle}</p>
          <div className="rn-actions">
            <SmartLink to={signedIn ? finale.memberLink : finale.registerLink} className="rn-btn">
              {signedIn ? finale.memberLabel : finale.registerLabel} <ArrowUpRight />
            </SmartLink>
            <a href={telHref(footer.phone)} className="rn-btn rn-btn-ghost">Gọi {footer.phone}</a>
          </div>
        </div>
      </section>

      <HomeFooter footer={footer} />
    </div>
  );
}
