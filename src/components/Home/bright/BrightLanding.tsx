import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type PointerEvent, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BookOpen, Box, Briefcase, CalendarCheck, CalendarDays, Check, FileText, LayoutGrid, MessageCircle, Rotate3d, Search, ShieldCheck, Users, Zap, type LucideIcon } from "lucide-react";
import type { HomeContent } from "../../../types/home/home.types";
import { HomeFooter, useReveal } from "../ninja/shared";
import { PROJECTS } from "../ninja/ninjaContent";
import { ECO5, FINAL5, HERO5, TOOLS5, WHY5 } from "../journey/home5Content";
import heroImg from "../../../assets/images/home/ho-chi-minh-city-skyline.jpg";
import cityImg from "../../../assets/images/home/thu-thiem-04-2020.jpg";
import "../ninja/ninja.css";
import CountUp from "./CountUp";
import "./bright.css";

/* Trang chủ nháp 6 (/home-6): xen kẽ dải xanh đậm và dải sáng, nhấn vàng.
   Hero ảnh thành phố + số liệu đếm lên → 4 giá trị (nền sáng) → công cụ + laptop/điện thoại dựng 3D (nền xanh)
   → hệ sinh thái thẻ có ảnh (nền sáng) → lời mời cuối. Thẻ nghiêng nhẹ theo chuột. Chữ dùng chung với /home-5. */

const WHY_ICONS: LucideIcon[] = [ShieldCheck, Box, Users, Zap];
const TOOL_ICONS: LucideIcon[] = [LayoutGrid, Rotate3d, CalendarCheck, BookOpen];
const ECO_ICONS: LucideIcon[] = [Users, CalendarDays, Briefcase, FileText];
const ECO_IMAGES = [
  cityImg,
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&h=500&q=80",
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&h=500&q=80",
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&h=500&q=80",
];

const reduceMotion = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// Ảnh ngoài lỗi thì ẩn đi, thẻ vẫn còn nền màu
const hideBroken = (e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.visibility = "hidden"; };

// Thẻ nghiêng nhẹ theo chuột + vệt sáng chạy theo con trỏ
function tilt(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse" || reduceMotion()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--mx", `${x * 100}%`);
  el.style.setProperty("--my", `${y * 100}%`);
  el.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
}
function untilt(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--ry", "0deg");
  e.currentTarget.style.setProperty("--rx", "0deg");
}

/* Hình minh họa nhỏ trong thẻ giá trị: mỗi thẻ một kiểu, đúng với nội dung thẻ */
const SHEET_CELLS = "fsfhsffhsfsfhffs".split("");
function WhyVisual({ i }: { i: number }) {
  if (i === 0) return (
    <ul className="bt-v bt-v-check">
      {["Pháp lý dự án", "Bảng giá công khai", "Chính sách bán hàng"].map((t) => <li key={t}><Check />{t}</li>)}
    </ul>
  );
  if (i === 1) return (
    <div className="bt-v bt-v-360"><span className="bt-v-ring" /><b>360°</b><small>Kéo để xoay</small></div>
  );
  if (i === 2) return (
    <div className="bt-v bt-v-people">
      <span className="bt-v-avs"><i>TA</i><i>MH</i><i>LK</i><i><MessageCircle /></i></span>
      <small>Chuyên viên đang trực tuyến</small>
    </div>
  );
  return (
    <div className="bt-v bt-v-search">
      <span className="bt-v-q"><Search />Căn hộ Thủ Thiêm</span>
      <span className="bt-v-tags"><i>2 PN</i><i>Dưới 7 tỷ</i><i>Hướng Đông</i></span>
    </div>
  );
}

/* Ô xem trước ở đầu thẻ công cụ */
function ToolPreview({ i, image }: { i: number; image: string }) {
  if (i === 0) return (
    <div className="bt-pv bt-pv-sheet">{SHEET_CELLS.map((c, k) => <i key={k} className={`c-${c}`} />)}</div>
  );
  if (i === 1) return (
    <div className="bt-pv bt-pv-tour"><img src={image} alt="" /><span>360°</span><i style={{ left: "30%", top: "55%" }} /><i style={{ left: "68%", top: "38%" }} /></div>
  );
  if (i === 2) return (
    <div className="bt-pv bt-pv-hold"><small>Đang giữ chỗ</small><b>29<em>:</em>59</b><span><i /></span></div>
  );
  return (
    <div className="bt-pv bt-pv-docs">
      {["Pháp lý", "Tài chính", "Thủ tục"].map((t) => <span key={t}><i>{t}</i><em /></span>)}
    </div>
  );
}

/* ---------- Chỉnh màu xanh + màu vàng của trang ---------- */
type Tone = { h: number; s: number; l: number };
type Channel = "green" | "gold";
type Palette = Record<Channel, Tone>;

// Cấu hình từng nhóm màu: giá trị mặc định, mẫu có sẵn, giới hạn thanh kéo, cách vẽ ô mẫu
const CHANNELS: Record<Channel, { label: string; hueLabel: string; def: Tone; hue: [number, number]; light: [number, number]; swatch: (t: Tone) => string; presets: { name: string; tone: Tone }[] }> = {
  green: {
    label: "Xanh", hueLabel: "Sắc xanh", def: { h: 158, s: 1, l: 0 }, hue: [120, 190], light: [-6, 10],
    swatch: (t) => `hsl(${t.h} ${77 * t.s}% ${14 + t.l}%)`,
    presets: [
      { name: "Xanh rêu (mặc định)", tone: { h: 158, s: 1, l: 0 } },
      { name: "Lục bảo", tone: { h: 165, s: 1.05, l: 1 } },
      { name: "Xanh ngọc", tone: { h: 176, s: 0.9, l: 0 } },
      { name: "Xanh lá tươi", tone: { h: 145, s: 1.15, l: 3 } },
      { name: "Xanh trầm", tone: { h: 155, s: 0.7, l: -3 } },
    ],
  },
  gold: {
    label: "Vàng", hueLabel: "Sắc vàng", def: { h: 44, s: 1, l: 0 }, hue: [28, 58], light: [-14, 12],
    swatch: (t) => `hsl(${t.h} ${Math.min(100, 91 * t.s)}% ${57 + t.l}%)`,
    presets: [
      { name: "Vàng (mặc định)", tone: { h: 44, s: 1, l: 0 } },
      { name: "Vàng cam", tone: { h: 36, s: 1, l: -2 } },
      { name: "Vàng chanh", tone: { h: 52, s: 0.95, l: 2 } },
      { name: "Vàng đồng", tone: { h: 38, s: 0.6, l: -8 } },
      { name: "Vàng kem", tone: { h: 46, s: 0.75, l: 8 } },
    ],
  },
};
const PALETTE_DEFAULT: Palette = { green: CHANNELS.green.def, gold: CHANNELS.gold.def };
const PALETTE_KEY = "home6-colors";
const sameTone = (a: Tone, b: Tone) => a.h === b.h && a.s === b.s && a.l === b.l;
const isTone = (t: unknown): t is Tone => !!t && typeof t === "object" && ["h", "s", "l"].every((k) => typeof (t as Record<string, unknown>)[k] === "number");

function loadPalette(): Palette {
  try {
    const p = JSON.parse(localStorage.getItem(PALETTE_KEY) ?? "null");
    return { green: isTone(p?.green) ? p.green : PALETTE_DEFAULT.green, gold: isTone(p?.gold) ? p.gold : PALETTE_DEFAULT.gold };
  } catch { /* không đọc được thì dùng mặc định */ }
  return PALETTE_DEFAULT;
}

function ColorTuner({ palette, onChange }: { palette: Palette; onChange: (p: Palette) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Channel>("green");
  const cfg = CHANNELS[tab];
  const tone = palette[tab];
  const put = (t: Tone) => onChange({ ...palette, [tab]: t });
  const set = (k: keyof Tone) => (e: ChangeEvent<HTMLInputElement>) => put({ ...tone, [k]: Number(e.target.value) });
  return (
    <div className="bt-tune">
      {open && (
        <div className="bt-tune-panel" role="dialog" aria-label="Chỉnh màu trang">
          <h4>Chỉnh màu trang</h4>
          <div className="bt-tune-tabs" role="tablist">
            {(Object.keys(CHANNELS) as Channel[]).map((c) => (
              <button key={c} type="button" role="tab" aria-selected={c === tab} className={c === tab ? "is-on" : ""} onClick={() => setTab(c)}>
                <i style={{ background: CHANNELS[c].swatch(palette[c]) }} />{CHANNELS[c].label}
              </button>
            ))}
          </div>
          <div className="bt-tune-presets">
            {cfg.presets.map((p) => (
              <button key={p.name} type="button" title={p.name} aria-label={p.name} className={sameTone(p.tone, tone) ? "is-on" : ""}
                style={{ background: cfg.swatch(p.tone) }} onClick={() => put(p.tone)} />
            ))}
          </div>
          <label><span>{cfg.hueLabel} <b>{tone.h}°</b></span>
            <input type="range" min={cfg.hue[0]} max={cfg.hue[1]} step={1} value={tone.h} onChange={set("h")} />
          </label>
          <label><span>Độ tươi <b>{Math.round(tone.s * 100)}%</b></span>
            <input type="range" min={0.4} max={1.4} step={0.05} value={tone.s} onChange={set("s")} />
          </label>
          <label><span>Độ sáng <b>{tone.l > 0 ? "+" : ""}{tone.l}</b></span>
            <input type="range" min={cfg.light[0]} max={cfg.light[1]} step={1} value={tone.l} onChange={set("l")} />
          </label>
          <div className="bt-tune-foot">
            <small>h {tone.h} · s {tone.s} · l {tone.l}</small>
            <button type="button" onClick={() => put(cfg.def)}>Đặt lại {cfg.label.toLowerCase()}</button>
          </div>
        </div>
      )}
      <button type="button" className="bt-tune-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <i aria-hidden />Màu sắc
      </button>
    </div>
  );
}

// Tiêu đề mục: nhãn đánh số + tiêu đề 2 màu + mô tả
function Head({ n, label, lead, accent, desc, br }: { n: string; label: string; lead: string; accent: string; desc?: string; br?: boolean }) {
  return (
    <div className="bt-head" data-reveal>
      <p className="bt-label"><i>{n}</i>{label}</p>
      <h2>{lead}{br ? <br /> : " "}<span>{accent}</span></h2>
      {desc && <p className="bt-desc">{desc}</p>}
    </div>
  );
}

/* Laptop + điện thoại dựng 3D bằng CSS: nắp laptop mở ra khi cuộn tới, cả cụm xoay theo chuột,
   điện thoại nổi phía trước. Màn hình có con trỏ tự bấm "Xem bảng hàng". */
function Devices() {
  const [main, ...rest] = PROJECTS;
  const stage = useRef<HTMLDivElement>(null);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || reduceMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty("--ry", `${-22 + x * 22}deg`);
    e.currentTarget.style.setProperty("--rx", `${-12 - y * 12}deg`);
  };
  const leave = () => {
    stage.current?.style.removeProperty("--ry");
    stage.current?.style.removeProperty("--rx");
  };

  return (
    <div ref={stage} className="bt-stage" data-reveal onPointerMove={move} onPointerLeave={leave} aria-hidden>
      <div className="bt-rig">
        <div className="bt-laptop">
          {/* Nắp: mặt trước là màn hình, mặt sau là vỏ nhôm */}
          <div className="bt-lid">
            <div className="bt-lid-front">
              <div className="bt-screen">
                <div className="bt-ui-bar"><i /><i /><i /><span>hubtech.vn/du-an</span></div>
                <div className="bt-ui">
                  <div className="bt-ui-side">
                    <b>Dự án mới nhất</b>
                    <span /><span /><span />
                    <em>Xem bảng hàng</em>
                  </div>
                  <img src={main.image} alt="" />
                </div>
                <div className="bt-ui-row">
                  {rest.map((p) => <img key={p.name} src={p.image} alt="" />)}
                </div>
                <span className="bt-cursor" />
                <span className="bt-glare" />
              </div>
            </div>
            <div className="bt-lid-back"><i /></div>
          </div>
          {/* Thân máy nằm phẳng: bàn phím + bàn di chuột */}
          <div className="bt-deck">
            <div className="bt-keys">{Array.from({ length: 48 }, (_, i) => <i key={i} />)}</div>
            <div className="bt-pad" />
          </div>
        </div>

        <div className="bt-phone">
          <div className="bt-phone-scr">
            <b>Lumen Riverside</b>
            <img src={main.image} alt="" />
            <span /><span />
            <em>Giữ chỗ</em>
          </div>
        </div>
      </div>
      <div className="bt-floor" />
    </div>
  );
}

export default function BrightLanding({ content }: { content: HomeContent }) {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const [palette, setPalette] = useState(loadPalette);
  const changePalette = (p: Palette) => {
    setPalette(p);
    try { localStorage.setItem(PALETTE_KEY, JSON.stringify(p)); } catch { /* bỏ qua nếu trình duyệt chặn lưu */ }
  };
  const { green: g, gold: y } = palette;

  return (
    <div ref={root} className="home-rn home-bt" style={{ "--h": g.h, "--s": g.s, "--l": g.l, "--gh": y.h, "--gs": y.s, "--gl": y.l } as CSSProperties}>
      <ColorTuner palette={palette} onChange={changePalette} />
      {/* ---------- 01. Hero ---------- */}
      <section className="bt-hero" aria-labelledby="bt-hero-t">
        <img className="bt-hero-img" src={heroImg} alt="Sông Sài Gòn và các tòa nhà trung tâm TP.HCM" />
        <div className="rn-wrap">
          <div className="bt-hero-copy" data-reveal>
            <p className="bt-kicker">{HERO5.pill}</p>
            <h1 id="bt-hero-t">{HERO5.titleLead}<br /><span>{HERO5.titleAccent}</span></h1>
            <p className="bt-hero-desc">{HERO5.desc}</p>
            <Link to={HERO5.cta.to} className="bt-btn">{HERO5.cta.label} <ArrowRight /></Link>
          </div>

          <ul className="bt-stats" data-reveal>
            {HERO5.stats.map((s) => (
              <li key={s.label}><CountUp value={s.value} /><small>{s.label}</small></li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- 02. Vì sao chọn Hubtech (nền sáng) ---------- */}
      <section className="bt-sec bt-light bt-why">
        <div className="rn-wrap">
          <Head n="01" label={WHY5.label} lead={WHY5.titleLead} accent={WHY5.titleAccent} desc={WHY5.desc} />
          <div className="bt-grid4">
            {WHY5.items.map((v, i) => {
              const I = WHY_ICONS[i];
              return (
                <article key={v.title} className="bt-card bt-tilt" data-reveal onPointerMove={tilt} onPointerLeave={untilt} style={{ "--d": `${i * 80}ms` } as CSSProperties}>
                  <span className="bt-card-top"><span className="bt-ic"><I /></span><i>{String(i + 1).padStart(2, "0")}</i></span>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                  <WhyVisual i={i} />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- 03. Nền tảng công nghệ (nền xanh) ---------- */}
      <section className="bt-sec bt-dark bt-tools">
        <div className="rn-wrap">
          <div className="bt-tools-top">
            <Head n="02" label={TOOLS5.label} lead={TOOLS5.titleLead} accent={TOOLS5.titleAccent} desc={TOOLS5.desc} br />
            <Devices />
          </div>
          <div className="bt-grid4">
            {TOOLS5.items.map((t, i) => {
              const I = TOOL_ICONS[i];
              return (
                <article key={t.title} className="bt-tool bt-tilt" data-reveal onPointerMove={tilt} onPointerLeave={untilt} style={{ "--d": `${i * 80}ms` } as CSSProperties}>
                  <ToolPreview i={i} image={content.platform.image} />
                  <span className="bt-tool-top"><span className="bt-ic bt-ic-line"><I /></span><i>{String(i + 1).padStart(2, "0")}</i></span>
                  <h3>{t.title}</h3>
                  <p className="bt-tool-sub">{t.sub}</p>
                  <p>{t.desc}</p>
                  <Link to={t.to} className="bt-more">{t.cta} <ArrowUpRight /></Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- 04. Hệ sinh thái (nền sáng) ---------- */}
      <section className="bt-sec bt-light bt-eco">
        <div className="rn-wrap">
          <Head n="03" label={ECO5.label} lead={ECO5.titleLead} accent={ECO5.titleAccent} desc={ECO5.desc} />
          <div className="bt-grid4">
            {ECO5.items.map((e, i) => {
              const I = ECO_ICONS[i];
              return (
                <Link key={e.title} to={e.to} className="bt-eco-card bt-tilt" data-reveal onPointerMove={tilt} onPointerLeave={untilt} style={{ "--d": `${i * 80}ms` } as CSSProperties}>
                  <span className="bt-eco-h"><I /><b>{e.title}</b></span>
                  <p>{e.desc}</p>
                  <span className="bt-eco-img">
                    <img src={ECO_IMAGES[i]} alt="" loading="lazy" onError={hideBroken} />
                    <span className="bt-chip">{e.cta} <ArrowUpRight /></span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- 05. Lời mời cuối ---------- */}
      <section className="bt-final">
        <div className="rn-wrap bt-final-in" data-reveal>
          <h2>{FINAL5.titleLead}<br /><span>{FINAL5.titleAccent}</span></h2>
          <div className="bt-final-r">
            <p>{FINAL5.desc}</p>
            <Link to={FINAL5.cta.to} className="bt-btn">{FINAL5.cta.label} <ArrowRight /></Link>
          </div>
        </div>
      </section>

      <HomeFooter footer={content.footer} />
    </div>
  );
}
