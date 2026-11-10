import { DAY_IN_LIFE, MANIFESTO, STORY, TESTIMONIALS } from "../../components/Home/homeContent";
import { MONO, P } from "../../components/Home/urbanUi";

/* Các cảnh Tuyên ngôn, Câu chuyện kiến trúc, Cảm nhận của trang chủ.
   Móc data-c="…" để useCinematic điều khiển ở trang chủ; ở trang khác không có hiệu ứng thì hiện dạng tĩnh. */

const CREAM = P.bg;

/* ---------- Cảnh 3: Tuyên ngôn (đổi ánh sáng kem → đen) ---------- */
function QuoteMark({ flip = false, c }: { flip?: boolean; c: string }) {
  return (
    <svg data-c={c} viewBox="0 0 100 76" className={`absolute w-14 md:w-24 ${flip ? "bottom-8 right-6 md:right-10" : "left-6 top-8 md:left-10"}`} fill="currentColor" aria-hidden>
      <g style={flip ? { transform: "rotate(180deg)", transformOrigin: "50% 50%" } : undefined}>
        <path d="M0 34 L20 0 H42 L30 34 H42 V76 H0 Z" />
        <path d="M58 34 L78 0 H100 L88 34 H100 V76 H58 Z" />
      </g>
    </svg>
  );
}

export function ManifestoScene() {
  const words = MANIFESTO.split(" ");
  return (
    <section data-c="mani" data-scene="2" className="relative overflow-hidden" style={{ background: P.black, color: CREAM }}>
      <QuoteMark c="mani-q1" />
      <QuoteMark c="mani-q2" flip />
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 pb-28 pt-32 md:grid-cols-12 md:gap-8 md:px-16 md:py-44">
        <div className="relative mx-auto w-full max-w-sm md:col-span-4 md:max-w-none">
          <span data-c="mani-block" className="absolute -left-16 top-1/3 -bottom-10 right-1/3 md:-bottom-24" style={{ background: P.green }} aria-hidden />
          <div data-c="mani-imgwrap" className="relative aspect-[4/5] overflow-hidden">
            <img data-c="mani-img" src={DAY_IN_LIFE[2].image} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-125 object-cover" />
          </div>
        </div>
        {/* relative z-10: khối vàng (absolute, trôi parallax) không được đè lên chữ */}
        <div className="relative z-10 flex flex-col justify-center md:col-span-7 md:col-start-6">
          <p className="text-2xl font-medium leading-[1.25] tracking-[-0.015em] md:text-4xl">
            {words.map((w, i) => (
              <span key={i} data-c="mani-w" style={{ color: w.startsWith("*") ? P.neon : undefined }}>
                {w.replace(/\*/g, "")}{" "}
              </span>
            ))}
          </p>
          <div data-c="mani-sign" className="mt-10">
            <p className="font-medium">Đội ngũ Hubtech</p>
            <p className="mt-1 text-xs uppercase tracking-widest" style={{ fontFamily: MONO, color: "rgba(255, 255, 255,0.55)" }}>
              Tuyên ngôn thương hiệu
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Cảnh 8: Câu chuyện kiến trúc (nhiều lớp chiều sâu) ---------- */
export function StoryScene() {
  return (
    <section data-c="story" data-scene="7"className="cine-story relative" style={{ background: P.card }}>
      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-28 md:px-10 md:py-40 lg:grid-cols-2">
        <div className="relative">
          <span data-c="st-gold" className="absolute -bottom-6 -left-6 z-10 h-24 w-24" style={{ background: P.green }} aria-hidden />
          <span data-c="st-bar" className="absolute -top-4 left-0 z-10 h-2 w-1/3" style={{ background: P.black }} aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 84% 50%, 100% 100%, 0 100%)" }}>
            <img data-c="st-img" src={STORY.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-125 object-cover" />
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-medium uppercase leading-[1.05] tracking-[-0.02em] md:text-6xl">
            {STORY.lines.map((l, i) => (
              <span key={l} data-c="st-line" className="block" style={{ color: i === 2 ? P.green : P.black }}>
                {l}
              </span>
            ))}
          </h2>
          <p data-c="st-fade" className="mt-6 max-w-lg text-base leading-relaxed" style={{ color: P.muted }}>
            {STORY.desc}
          </p>
          <ul className="mt-8 space-y-3 border-t-2 pt-6" style={{ borderColor: P.green }}>
            {STORY.points.map((pt) => (
              <li key={pt} data-c="st-fade" className="flex items-start gap-3 text-sm">
                <span style={{ color: P.green }}>✦</span> {pt}
              </li>
            ))}
          </ul>
          <dl className="mt-10 grid grid-cols-3 gap-4">
            {STORY.stats.map((s) => (
              <div key={s.label}>
                <dd className="text-4xl font-light tabular-nums tracking-tight" style={{ fontFamily: MONO }}>
                  <span data-c="st-count" data-value={s.value}>
                    {s.value}
                  </span>
                  <span className="text-xl">{s.suffix}</span>
                </dd>
                <dt className="mt-1 text-xs uppercase tracking-wide" style={{ color: P.muted }}>
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ---------- Cảnh 10: Cảm nhận (thẻ chồng theo chiều sâu) ---------- */
export function VoicesScene() {
  return (
      <section data-c="voice" data-scene="10"className="cine-voice relative px-5 py-24 md:px-10" style={{ background: P.blush }}>
        <div className="cine-voice-head">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: MONO, color: P.green }}>
            Cảm nhận
          </p>
          <h2 className="mt-4 text-4xl font-medium uppercase leading-[1.05] tracking-[-0.02em] md:text-6xl">Khách hàng nói gì</h2>
        </div>
        <div className="cine-voice-stage mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure key={t.name} data-c="voice-card" className="cine-voice-card p-8 md:p-12" style={{ background: P.bg, boxShadow: "0 40px 80px -40px rgba(16,16,16,0.35)" }}>
              <span className="text-xs tabular-nums" style={{ fontFamily: MONO, color: P.green }}>
                {String(i + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
              </span>
              <blockquote className="mt-4 text-xl font-light leading-snug tracking-tight md:text-3xl">“{t.quote}”</blockquote>
              <figcaption className="mt-8 flex items-center gap-3 text-sm">
                <span className="h-0.5 w-10" style={{ background: P.green }} />
                <span className="font-medium uppercase">{t.name}</span>
                <span style={{ color: P.muted }}>· {t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
    </section>
  );
}
