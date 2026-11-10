import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bot, Box, Check, ShieldCheck, Timer, Users, Zap, type LucideIcon } from "lucide-react";
import type { HomeContent } from "../../../types/home/home.types";
import { SmartLink } from "../landing/homeUi";
import { ABOUT, HERO, PROJECTS, PROJECT_HEAD, VALUES_HEAD, VALUE_VIZ } from "./ninjaContent";
import { Head, HomeFooter, LightStreak, spotlight, useReveal } from "./shared";
import "./ninja.css";

/* Trang chủ kiểu agency tối (tham khảo mẫu Arthub), màu giữ bộ cũ xanh lá + vàng cát.
   Mạch đọc: Hero → Về Hubtech + số liệu → Dự án → Giá trị → Khách hàng → Footer.
   Mỗi mục: nhãn nhỏ bên trái, tiêu đề in hoa bên phải, ngăn bằng đường kẻ mảnh. */

// Icon cho 4 thẻ giá trị (tên icon lấy từ homeDefaults.json)
const VALUE_ICONS: Record<string, LucideIcon> = { shield: ShieldCheck, cube: Box, users: Users, bolt: Zap };

// Hình minh họa nhỏ cho từng thẻ giá trị (vẽ bằng HTML/CSS, chữ trong ninjaContent.ts)
function ValueViz({ kind }: { kind: string }) {
  if (kind === "shield") {
    return (
      <div className="rn-viz-check">
        <ul>{VALUE_VIZ.checks.map((c) => <li key={c}><i><Check /></i>{c}</li>)}</ul>
        <span className="rn-viz-badge"><ShieldCheck />{VALUE_VIZ.verified}</span>
      </div>
    );
  }
  if (kind === "cube") {
    return (
      <div className="rn-viz-orbit">
        <span className="rn-orbit-ring" /><span className="rn-orbit-ring rn-orbit-ring-2" />
        <span className="rn-orbit-dot" />
        <b>360°</b>
      </div>
    );
  }
  if (kind === "users") {
    return (
      <div className="rn-viz-people">
        <div className="rn-avatars">
          {VALUE_VIZ.people.map((p) => <i key={p}>{p}</i>)}
          <i className="rn-avatar-more">+</i>
        </div>
        <p>{VALUE_VIZ.roles}</p>
      </div>
    );
  }
  return (
    <div className="rn-viz-chat">
      <p className="rn-bubble rn-bubble-me">{VALUE_VIZ.ask}</p>
      <p className="rn-bubble rn-bubble-ai"><Bot /><span className="rn-typing"><i /><i /><i /></span></p>
      <span className="rn-viz-timer"><Timer />{VALUE_VIZ.timer}</span>
    </div>
  );
}

export default function NinjaLanding({ content }: { content: HomeContent }) {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const { hero, stats, values, testimonials, footer } = content;

  // Dự án: lọc theo loại hình, rê vào dòng nào thì ảnh bên trái đổi theo
  const [filter, setFilter] = useState(PROJECT_HEAD.filters[0]);
  const list = filter === PROJECT_HEAD.filters[0] ? PROJECTS : PROJECTS.filter((p) => p.kind === filter);
  const [activeName, setActiveName] = useState(PROJECTS[0].name);
  const active = list.find((p) => p.name === activeName) ?? list[0] ?? PROJECTS[0];

  const [s1, s2] = stats.items;

  return (
    <div ref={root} className="home-rn">
      {/* ---------- Hero ---------- */}
      <section className="rn-hero" aria-labelledby="rn-hero-t">
        <LightStreak />
        <div className="rn-wrap rn-hero-in">
          <div className="rn-hero-copy" data-reveal>
            <p className="rn-pill"><span aria-hidden />{hero.pill}</p>
            <h1 id="rn-hero-t" className="rn-display">
              <span>{hero.titleLine1}</span>
              <span><em>{hero.titleLine2}</em></span>
            </h1>
            <div className="rn-hero-row">
              <div className="rn-hero-lead">
                <p>{HERO.lead}</p>
                <div className="rn-actions">
                  <SmartLink to={hero.primaryLink} className="rn-btn">{hero.primaryLabel} <ArrowUpRight /></SmartLink>
                </div>
                <dl className="rn-hero-stats">
                  {[s1, s2].map((s) => s && <div key={s.label}><dd>{s.value}{s.suffix}</dd><dt>{s.label}</dt></div>)}
                </dl>
              </div>
            </div>
          </div>

          <div className="rn-hero-visual" data-reveal>
            <div className="rn-arch">
              <img src={HERO.image} alt={HERO.imageAlt} />
              <span className="rn-arch-tag"><i aria-hidden />{hero.tag} · {hero.name}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Về Hubtech + số liệu ---------- */}
      <section className="rn-sec" id="gioi-thieu">
        <div className="rn-wrap">
          <Head label={ABOUT.label} lead={ABOUT.titleLead} accent={ABOUT.titleAccent}>
            <p className="rn-sub">{ABOUT.text}</p>
          </Head>
          <div className="rn-about">
            <figure className="rn-about-img" data-reveal>
              <img src={ABOUT.image} alt="" loading="lazy" />
              <figcaption>“{ABOUT.quote}”</figcaption>
            </figure>
            <dl className="rn-stats" data-reveal>
              {stats.items.map((s) => (
                <div key={s.label}><dd>{s.value}<span>{s.suffix}</span></dd><dt>{s.label}</dt></div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------- Dự án ---------- */}
      <section className="rn-sec" id="du-an">
        <div className="rn-wrap">
          <Head label={PROJECT_HEAD.label} lead={PROJECT_HEAD.titleLead} accent={PROJECT_HEAD.titleAccent} />
          <div className="rn-proj">
            <Link to="/projects" className="rn-proj-img" data-reveal>
              <img key={active.image} src={active.image} alt={`Dự án ${active.name}`} loading="lazy" />
              <span className="rn-proj-badge">{active.badge}</span>
            </Link>
            <div className="rn-proj-mid" data-reveal>
              <div className="rn-chips" role="tablist" aria-label="Lọc theo loại hình">
                {PROJECT_HEAD.filters.map((f) => (
                  <button key={f} type="button" role="tab" aria-selected={filter === f} className={filter === f ? "is-on" : ""} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
              <p className="rn-proj-count">{String(list.length).padStart(2, "0")}</p>
              <p className="rn-proj-cap">dự án {filter === PROJECT_HEAD.filters[0] ? "" : filter.toLowerCase() + " "}đang phân phối</p>
            </div>
            <div className="rn-proj-list" data-reveal>
              <p className="rn-mini">{PROJECT_HEAD.listTitle}</p>
              <ul>
                {list.map((p) => (
                  <li key={p.name}>
                    <Link to="/projects" className={p.name === active.name ? "is-on" : ""} onMouseEnter={() => setActiveName(p.name)} onFocus={() => setActiveName(p.name)}>
                      <span><b>{p.name}</b><small>{p.kind} · {p.place}</small></span>
                      <em>{p.price}</em>
                    </Link>
                  </li>
                ))}
              </ul>
              <SmartLink to="/projects" className="rn-uline">Tất cả dự án</SmartLink>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Giá trị ---------- */}
      <section className="rn-sec" id="gia-tri">
        <div className="rn-wrap">
          <Head label={VALUES_HEAD.label} lead={VALUES_HEAD.titleLead} accent={VALUES_HEAD.titleAccent}>
            <p className="rn-sub">{VALUES_HEAD.text}</p>
          </Head>
          <div className="rn-values">
            {values.items.map((v, i) => {
              const I = VALUE_ICONS[v.icon] ?? ShieldCheck;
              const num = String(i + 1).padStart(2, "0");
              return (
                <article className={`rn-value rn-value-${v.icon}`} key={v.title} onPointerMove={spotlight} data-reveal>
                  <span className="rn-value-num" aria-hidden>{num}</span>
                  <div className="rn-value-top">
                    <span className="rn-value-ic"><I /></span>
                    <small>/{num}</small>
                  </div>
                  <div className="rn-viz" aria-hidden><ValueViz kind={v.icon} /></div>
                  <div className="rn-value-txt">
                    <h3>{v.title}</h3>
                    <p>{v.desc}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Khách hàng ---------- */}
      <section className="rn-sec">
        <div className="rn-wrap">
          <Head label={testimonials.kicker} lead={testimonials.titleLead} accent={testimonials.titleAccent} />
          <div className="rn-quotes">
            {testimonials.items.map((t) => (
              <figure key={t.name} data-reveal>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption><i>{t.initials}</i><span><b>{t.name}</b>{t.role}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <HomeFooter footer={footer} />
    </div>
  );
}
