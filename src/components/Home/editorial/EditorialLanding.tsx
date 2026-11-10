import { useRef, type CSSProperties, type PointerEvent, type ReactNode, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import type { HomeContent } from "../../../types/home/home.types";
import { HomeFooter, useReveal } from "../ninja/shared";
import { PROJECTS } from "../ninja/ninjaContent";
import { ECO5, FINAL5, HERO5, TOOLS5, WHY5 } from "../journey/home5Content";
import CountUp from "../bright/CountUp";
import heroImg from "../../../assets/images/home/ho-chi-minh-city-skyline.jpg";
import cityImg from "../../../assets/images/home/thu-thiem-04-2020.jpg";
import "../ninja/ninja.css";
import "./editorial.css";

/* Trang chủ nháp 7 (/home-7): cùng thứ tự nội dung với /home-6, bố cục tạp chí nghệ thuật, màu theo /home-5.
   Nền xanh đen có hạt nhiễu, tiêu đề cực lớn trộn chữ nghiêng có chân, bố cục lệch, dải chữ chạy ngang.
   Hero (ảnh vòm + huy hiệu chữ xoay) → dải chạy → 4 giá trị dạng hàng lớn → công cụ dạng lưới bento
   + màn hình xếp lớp 3D → hệ sinh thái ảnh so le nhiều dáng → lời mời chữ chạy cỡ lớn. Chữ dùng chung với /home-5. */

const ECO_IMAGES = [
  cityImg,
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&h=1000&q=80",
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&h=1000&q=80",
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&h=1000&q=80",
];
const SHEET = "fsfhsffhsfsfhffsfhsf".split("");
const pad = (i: number) => String(i + 1).padStart(2, "0");
const hideBroken = (e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.visibility = "hidden"; };

// Huy hiệu tròn có chữ chạy vòng quanh, mũi tên ở giữa
function Badge({ text, to, className = "" }: { text: string; to: string; className?: string }) {
  const ring = `${text} • ${text} • `;
  return (
    <Link to={to} className={`ed-badge ${className}`} aria-label={text}>
      <svg viewBox="0 0 200 200" aria-hidden>
        <defs><path id={`ring-${className || "a"}`} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
        <text><textPath href={`#ring-${className || "a"}`}>{ring.toUpperCase()}</textPath></text>
      </svg>
      <span><ArrowUpRight /></span>
    </Link>
  );
}

// Dải chữ chạy ngang vô tận
function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = items.map((t, i) => <span key={i}>{t}<i aria-hidden>✦</i></span>);
  return (
    <div className={`ed-marquee ${className}`} aria-hidden>
      <div>{row}{row}</div>
    </div>
  );
}

// Tiêu đề mục: số + nhãn, tiêu đề với vế sau nghiêng có chân
function Head({ n, label, lead, accent, children }: { n: string; label: string; lead: string; accent: string; children?: ReactNode }) {
  return (
    <div className="ed-head" data-reveal>
      <p className="ed-label"><i>({n})</i>{label}</p>
      <h2>{lead} <em>{accent}</em></h2>
      {children}
    </div>
  );
}

// Màn hình xếp lớp 3D: 3 lớp giao diện lơ lửng, lia chuột thì tách lớp và nghiêng theo chuột
function Layers() {
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
    e.currentTarget.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
  };
  const leave = (e: PointerEvent<HTMLDivElement>) => { e.currentTarget.style.setProperty("--px", "0"); e.currentTarget.style.setProperty("--py", "0"); };
  const main = PROJECTS[0];
  return (
    <div className="ed-layers" onPointerMove={move} onPointerLeave={leave} aria-hidden>
      <div className="ed-stack">
        <div className="ed-layer ed-l1">
          <p><b>Bảng hàng</b><small>Tòa A · Tầng 12 đến 16</small></p>
          <div className="ed-sheet">{SHEET.map((c, i) => <i key={i} className={`c-${c}`} />)}</div>
        </div>
        <div className="ed-layer ed-l2">
          <img src={main.image} alt="" />
          <span>360°</span>
        </div>
        <div className="ed-layer ed-l3">
          <small>Đang giữ chỗ</small>
          <b>29:59</b>
          <em>Căn A-16.03</em>
        </div>
      </div>
      <p className="ed-layers-cap">Di chuột để tách lớp</p>
    </div>
  );
}

// Hình nhỏ trong ô công cụ
function ToolArt({ i, image }: { i: number; image: string }) {
  if (i === 0) return <div className="ed-art ed-art-sheet">{SHEET.slice(0, 15).map((c, k) => <i key={k} className={`c-${c}`} />)}</div>;
  if (i === 1) return <div className="ed-art ed-art-tour"><img src={image} alt="" /><span /></div>;
  if (i === 2) return <div className="ed-art ed-art-hold"><b>29:59</b><span><i /></span></div>;
  return (
    <div className="ed-art ed-art-docs">
      <span><Search />Thủ tục sang tên</span>
      <i>Pháp lý</i><i>Tài chính</i><i>Thủ tục</i>
    </div>
  );
}

export default function EditorialLanding({ content }: { content: HomeContent }) {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  return (
    <div ref={root} className="home-rn home-ed">
      {/* ---------- 01. Hero ---------- */}
      <section className="ed-hero" aria-labelledby="ed-hero-t">
        <div className="rn-wrap">
          <p className="ed-kicker" data-reveal><span>{HERO5.pill}</span><span>Dự án · Bảng hàng · Tour 360°</span></p>
          <h1 id="ed-hero-t" className="ed-h1" data-reveal>
            <span className="ed-line"><span>{HERO5.titleLead}</span></span>
            <span className="ed-line">
              <span>
                <img className="ed-pill" src={PROJECTS[0].image} alt="" aria-hidden />
                <em>{HERO5.titleAccent}</em>
              </span>
            </span>
          </h1>

          <div className="ed-hero-grid">
            <div className="ed-hero-copy" data-reveal>
              <p>{HERO5.desc}</p>
              <Link to={HERO5.cta.to} className="ed-btn"><span>{HERO5.cta.label}</span><ArrowUpRight /></Link>
            </div>
            <figure className="ed-arch" data-reveal>
              <img src={heroImg} alt="Sông Sài Gòn và các tòa nhà trung tâm TP.HCM" />
              <figcaption>Fig. 01 · Trung tâm TP.HCM nhìn từ sông Sài Gòn</figcaption>
              <Badge text={HERO5.cta.label} to={HERO5.cta.to} className="hero" />
            </figure>
          </div>

          <dl className="ed-stats" data-reveal>
            {HERO5.stats.map((s, i) => (
              <div key={s.label}><dt><i>{pad(i)}</i>{s.label}</dt><dd><CountUp value={s.value} /></dd></div>
            ))}
          </dl>
        </div>
      </section>

      <Marquee items={WHY5.items.map((v) => v.title)} />

      {/* ---------- 02. Vì sao chọn: hàng chữ lớn, lia chuột thì đổ nền ---------- */}
      <section className="ed-sec ed-why">
        <div className="rn-wrap ed-why-in">
          <Head n="01" label={WHY5.label} lead={WHY5.titleLead} accent={WHY5.titleAccent}>
            <p className="ed-desc">{WHY5.desc}</p>
          </Head>
          <ol className="ed-rows">
            {WHY5.items.map((v, i) => (
              <li key={v.title} data-reveal style={{ "--d": `${i * 70}ms` } as CSSProperties}>
                <i>{pad(i)}</i>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
                <span className="ed-row-dot" aria-hidden />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- 03. Nền tảng công nghệ: lưới bento ---------- */}
      <section className="ed-sec ed-tools">
        <div className="rn-wrap">
          <div className="ed-bento">
            <div className="ed-b-head">
              <Head n="02" label={TOOLS5.label} lead={TOOLS5.titleLead} accent={TOOLS5.titleAccent}>
                <p className="ed-desc">{TOOLS5.desc}</p>
              </Head>
            </div>
            <div className="ed-b-vis" data-reveal><Layers /></div>
            {TOOLS5.items.map((t, i) => (
              <article key={t.title} className={`ed-tool ed-t${i + 1}`} data-reveal style={{ "--d": `${i * 80}ms` } as CSSProperties}>
                <ToolArt i={i} image={content.platform.image} />
                <div className="ed-tool-txt">
                  <i>{pad(i)}</i>
                  <h3>{t.title}</h3>
                  <em>{t.sub}</em>
                  <p>{t.desc}</p>
                  <Link to={t.to} className="ed-link">{t.cta}<ArrowUpRight /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 04. Hệ sinh thái: ảnh so le, mỗi ảnh một dáng ---------- */}
      <section className="ed-sec ed-eco">
        <div className="rn-wrap">
          <div className="ed-eco-head">
            <Head n="03" label={ECO5.label} lead={ECO5.titleLead} accent={ECO5.titleAccent} />
            <p className="ed-desc" data-reveal>{ECO5.desc}</p>
          </div>
          <div className="ed-gallery">
            {ECO5.items.map((e, i) => (
              <Link key={e.title} to={e.to} className={`ed-shot ed-s${i + 1}`} data-reveal style={{ "--d": `${i * 90}ms` } as CSSProperties}>
                <span className="ed-shot-img">
                  <img src={ECO_IMAGES[i]} alt="" loading="lazy" onError={hideBroken} />
                  <span className="ed-shot-cta">{e.cta}<ArrowUpRight /></span>
                </span>
                <span className="ed-shot-cap">
                  <i>{pad(i)}</i>
                  <b>{e.title}</b>
                  <small>{e.desc}</small>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 05. Lời mời cuối: chữ chạy cỡ lớn + huy hiệu ---------- */}
      <section className="ed-final">
        <Marquee items={[FINAL5.titleLead, FINAL5.titleAccent]} className="ed-marquee-big" />
        <div className="rn-wrap ed-final-in" data-reveal>
          <p>{FINAL5.desc}</p>
          <Link to={FINAL5.cta.to} className="ed-btn"><span>{FINAL5.cta.label}</span><ArrowUpRight /></Link>
          <Badge text={FINAL5.cta.label} to={FINAL5.cta.to} className="final" />
        </div>
      </section>

      <HomeFooter footer={content.footer} />
    </div>
  );
}
