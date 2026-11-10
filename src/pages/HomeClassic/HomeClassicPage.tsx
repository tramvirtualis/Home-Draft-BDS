import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Check,
  Eye,
  Handshake,
  Leaf,
  Pause,
  Play,
  Plus,
  Quote,
  Rotate3d,
  ShieldCheck,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useSeo } from "../../hooks/useSeo";
import ClassicHeader from "./ClassicHeader";
import ClassicFooter from "./ClassicFooter";
import Chatbot from "../../components/Home/Chatbot";
// Hoạt hình khung chat + robot trợ lý
import "../../components/Home/home.css";
import { HERO_IMAGE, HERO_VIDEO, PROJECTS, SERVICES } from "../../components/Home/homeData";
import { DAY_IN_LIFE, PARTNERS, TESTIMONIALS } from "../../components/Home/homeContent";
import { CircleButton, CountUp, E, Eyebrow, FONT, G, Reveal, Title, useEcoFonts, wrap } from "./ecoUi";

/* Trang chủ /home-classic kiểu "eco": xanh rêu đậm xen nền sáng, điểm nhấn xanh lá tươi, thẻ bo góc lớn.
   Banner video → vì sao chọn Hubtech → giới thiệu (số liệu, sứ mệnh, tầm nhìn) → đối tác → dịch vụ
   → biến ước mơ thành địa chỉ → giá trị → cảm nhận → hỏi đáp → kêu gọi → cẩm nang → chân trang. */

// ---------- Dữ liệu ----------

const WHY: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ShieldCheck,
    title: "Minh bạch & pháp lý rõ ràng",
    desc: "Hồ sơ pháp lý, giá và tiến độ của từng dự án được công khai, kiểm chứng trước khi mở bán.",
  },
  { icon: Users, title: "Chuyên viên đồng hành", desc: "Mỗi khách hàng có một chuyên viên riêng theo sát từ lúc xem nhà tới khi bàn giao." },
  { icon: Rotate3d, title: "Trải nghiệm trực quan", desc: "Tour 360°, mặt bằng tương tác và bảng hàng thời gian thực ngay trên màn hình." },
];

const SERVICE_ICONS: LucideIcon[] = [Building2, Users, BadgeCheck, Eye, Handshake, CalendarCheck];
const SERVICE_IMAGES = [PROJECTS[0].image, DAY_IN_LIFE[1].image, DAY_IN_LIFE[3].image, DAY_IN_LIFE[2].image, DAY_IN_LIFE[0].image, PROJECTS[2].image];

const CHECKS = [
  "Bảng hàng cập nhật từng phút",
  "Giữ chỗ trực tuyến, hoàn cọc minh bạch",
  "Hỗ trợ vay tới 70% giá trị căn",
  "Chuyên viên gọi lại trong 15 phút",
];

const VALUES: { key: string; title: string; desc: string; image: string }[] = [
  {
    key: "ben-vung",
    title: "Sống bền vững",
    desc: "Ưu tiên dự án có mảng xanh lớn, vật liệu tiết kiệm năng lượng và tiện ích đi bộ, để ngôi nhà tốt cho bạn và cho thành phố.",
    image: PROJECTS[1].image,
  },
  {
    key: "minh-bach",
    title: "Minh bạch",
    desc: "Giá, chính sách và tiến độ hiển thị rõ cho mọi khách hàng, không có phí ẩn hay bảng giá riêng.",
    image: DAY_IN_LIFE[1].image,
  },
  {
    key: "cong-dong",
    title: "Cộng đồng",
    desc: "Cư dân, nhà đầu tư và môi giới kết nối, hỏi đáp và chia sẻ kinh nghiệm trong một cộng đồng chung.",
    image: DAY_IN_LIFE[3].image,
  },
];

const FAQS: [string, string][] = [
  [
    "Giữ chỗ trực tuyến hoạt động thế nào?",
    "Bạn chọn căn trên bảng hàng, bấm giữ chỗ và thanh toán khoản giữ chỗ. Căn được khóa cho bạn trong thời gian quy định, chuyên viên sẽ gọi để hoàn tất thủ tục.",
  ],
  ["Tôi có được hoàn tiền giữ chỗ không?", "Có. Nếu chưa ký hợp đồng và bạn hủy trong thời hạn chính sách cho phép, khoản giữ chỗ được hoàn lại đầy đủ."],
  [
    "Hubtech có hỗ trợ vay ngân hàng không?",
    "Các dự án đều liên kết ngân hàng hỗ trợ vay tới 70% giá trị căn. Chuyên viên sẽ so sánh gói vay và giúp bạn chuẩn bị hồ sơ.",
  ],
  ["Tour 360° có giống thực tế không?", "Tour được chụp tại căn hộ mẫu và tiện ích thật của dự án, bạn có thể xem từng phòng và góc nhìn từ ban công."],
];

const GUIDES = [
  { tag: "Cẩm nang", title: "5 bước kiểm tra pháp lý trước khi xuống tiền", image: DAY_IN_LIFE[1].image, to: "/knowledge" },
  { tag: "Thị trường", title: "Khu vực nào đang dẫn đầu nguồn cung căn hộ mới", image: PROJECTS[2].image, to: "/news" },
  { tag: "Sống xanh", title: "Chọn căn hộ tiết kiệm năng lượng cho gia đình trẻ", image: DAY_IN_LIFE[2].image, to: "/knowledge" },
];

// ---------- Các mục ----------

// Banner: video toàn khung, tiêu đề lớn, thẻ "đối tác tin cậy" ở góc dưới
function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
      setPlaying(false);
    }
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="relative isolate overflow-hidden text-white" style={{ background: E.forest }}>
      <video
        ref={videoRef}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        src={HERO_VIDEO}
        poster={HERO_IMAGE}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#14342b]/90 via-[#14342b]/55 to-[#14342b]/20" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-[#14342b] to-transparent" aria-hidden />

      <div className={`${wrap} flex min-h-[92svh] flex-col pb-10 pt-32 md:pt-36`}>
        <div className="flex flex-1 items-center">
          <Reveal>
            <p className="mb-6 max-w-[16ch] text-xs leading-relaxed" style={{ color: E.green }}>
              Hubtech, nền tảng bất động sản số
            </p>
            <h1 className="text-[13vw] font-medium leading-[1.02] tracking-[-0.02em] md:text-[72px]">
              Kiến tạo
              <br />
              <span style={{ color: E.green }}>không gian sống</span>
              <br />
              bền vững
            </h1>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Tạm dừng video" : "Phát video"}
              className="mt-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/30 backdrop-blur transition hover:border-[#8ef05c]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: E.green, color: E.forest }}>
                {playing ? <Pause size={16} /> : <Play size={16} className="translate-x-px" />}
              </span>
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// Vì sao chọn Hubtech: 3 thẻ trên nền tối; thẻ đang rê chuột (mặc định thẻ cuối) chuyển nền xanh lá
function Why() {
  const last = WHY.length - 1;
  const [active, setActive] = useState(last);
  return (
    <section className="text-white" style={{ background: E.forest }}>
      <div className={`${wrap} grid gap-10 py-20 md:py-24 lg:grid-cols-[200px_1fr]`}>
        <Eyebrow light>Vì sao chọn Hubtech</Eyebrow>
        <div>
          <Reveal>
            <Title light className="max-w-[24ch]">
              Đồng hành để mỗi quyết định mua nhà đều <G>an tâm và rõ ràng</G>
            </Title>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3" onMouseLeave={() => setActive(last)}>
            {WHY.map(({ icon: Icon, title, desc }, i) => {
              const hot = i === active;
              return (
                <Reveal key={title} delay={i * 120}>
                  <div
                    tabIndex={0}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className={`flex h-full cursor-default flex-col rounded-[24px] border p-6 outline-none transition-[background-color,border-color,color,transform,box-shadow] duration-500 focus-visible:ring-2 focus-visible:ring-[#8ef05c] ${
                      hot ? "-translate-y-1.5 shadow-[0_24px_40px_-24px_rgba(142,240,92,0.55)]" : ""
                    }`}
                    style={{ background: hot ? E.green : E.forest2, borderColor: hot ? E.green : E.line, color: hot ? E.ink : E.white }}
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500 ${hot ? "rotate-[-12deg] scale-110" : ""}`}
                      style={{ borderColor: hot ? "rgba(16,36,29,0.25)" : E.line, background: hot ? E.forest : "transparent" }}
                    >
                      <Icon size={20} strokeWidth={1.6} style={{ color: E.green }} />
                    </span>
                    <h3 className="mt-8 text-lg font-medium">{title}</h3>
                    <p
                      className="mt-2 flex-1 text-sm leading-relaxed transition-colors duration-500"
                      style={{ color: hot ? "rgba(16,36,29,0.75)" : "rgba(255,255,255,0.65)" }}
                    >
                      {desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// Giới thiệu: chữ bên trái; ảnh, số liệu, sứ mệnh và tầm nhìn bên phải
function About() {
  const stats = [
    { value: 12, suffix: "+", label: "Dự án đang phân phối" },
    { value: 4800, suffix: "+", label: "Căn hộ đã bàn giao" },
    { value: 15, suffix: "+", label: "Năm kinh nghiệm" },
  ];
  return (
    <section id="gioi-thieu" className="scroll-mt-24" style={{ background: E.light }}>
      <div className={`${wrap} grid gap-12 py-20 md:py-24 lg:grid-cols-[0.85fr_1.15fr]`}>
        <Reveal>
          <Eyebrow>Về chúng tôi</Eyebrow>
          <Title className="mt-3">Dẫn đầu hành trình an cư số</Title>
          <p className="mt-5 text-sm leading-relaxed" style={{ color: E.text }}>
            Hubtech gom dự án, bảng hàng, pháp lý và chuyên viên vào một nền tảng. Bạn so sánh căn, xem nhà qua tour 360° và giữ chỗ trực tuyến trong vài phút.
          </p>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: E.text }}>
            Chúng tôi tin rằng mua nhà nên là một trải nghiệm rõ ràng và dễ chịu, không phải một cuộc đua với giấy tờ.
          </p>
          {/* Nhãn tĩnh (không phải link), cùng kiểu với nút */}
          <p className="mt-8 inline-flex items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-sm font-medium text-white" style={{ background: E.forest }}>
            Đồng hành cùng hơn 4.800 gia đình
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: E.green, color: E.forest }} aria-hidden>
              <Check size={17} strokeWidth={2.5} />
            </span>
          </p>
        </Reveal>

        <div className="space-y-5">
          <Reveal className="grid items-center gap-6 sm:grid-cols-[200px_1fr]">
            <img src={DAY_IN_LIFE[0].image} alt="Cư dân dạo bộ ven sông" loading="lazy" className="aspect-[4/3] w-full rounded-[24px] object-cover" />
            <div>
              <p className="text-2xl font-medium leading-snug" style={{ color: E.ink }}>
                Hơn mười lăm năm kinh nghiệm trong thị trường nhà ở.
              </p>
              <dl className="mt-5 grid grid-cols-3 gap-4 border-t pt-5" style={{ borderColor: "rgba(16,36,29,0.12)" }}>
                {stats.map((s) => (
                  <div key={s.label}>
                    <dd className="text-3xl font-semibold" style={{ color: E.ink }}>
                      <CountUp value={s.value} suffix={s.suffix} />
                    </dd>
                    <dt className="mt-1 text-xs" style={{ color: E.muted }}>
                      {s.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            <Reveal delay={100}>
              <div className="h-full rounded-[24px] p-7 text-white" style={{ background: E.forest }}>
                <p className="text-4xl font-light" style={{ color: E.green }}>
                  01
                </p>
                <h3 className="mt-4 text-lg font-medium">Sứ mệnh</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Giúp mỗi gia đình tìm được ngôi nhà phù hợp bằng thông tin minh bạch, công cụ trực quan và sự đồng hành tận tâm.
                </p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="h-full rounded-[24px] p-7" style={{ background: E.green, color: E.ink }}>
                <p className="text-4xl font-light">02</p>
                <h3 className="mt-4 text-lg font-medium">Tầm nhìn</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(16,36,29,0.75)" }}>
                  Trở thành nền tảng bất động sản số được tin dùng nhất, nơi mọi giao dịch nhà ở diễn ra nhanh, an toàn và bền vững.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// Đối tác: khối tối bo góc chạy ngang danh sách đối tác
function Partners() {
  return (
    <section style={{ background: E.light }}>
      <div className={`${wrap} pb-20`}>
        <div className="overflow-hidden rounded-[28px] border-4 py-7" style={{ background: E.forest, borderColor: E.mint }}>
          <p className="mb-5 text-center text-xs text-white/60">Đối tác đồng hành cùng Hubtech</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6">
            {PARTNERS.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <Leaf size={18} style={{ color: E.green }} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// Dịch vụ: thẻ ảnh có huy hiệu icon, tên và mô tả
function Services() {
  return (
    <section id="dich-vu" className="scroll-mt-24" style={{ background: E.mint }}>
      <div className={`${wrap} py-20 md:py-24`}>
        <div className="grid gap-6 lg:grid-cols-[200px_1fr_320px] lg:items-end">
          <Eyebrow>Dịch vụ</Eyebrow>
          <Reveal>
            <Title>
              Mọi nhu cầu nhà đất trong <G dark>một nền tảng</G>
            </Title>
          </Reveal>
          <p className="text-sm leading-relaxed" style={{ color: E.text }}>
            Từ tìm dự án, chọn căn, vay vốn tới tìm việc trong ngành, Hubtech có công cụ cho từng bước.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = SERVICE_ICONS[i] ?? Building2;
            return (
              <Reveal key={s.no} delay={(i % 3) * 100}>
                <Link to={s.path} className="group block h-full">
                  <div className="relative overflow-hidden rounded-[24px]">
                    <img
                      src={SERVICE_IMAGES[i]}
                      alt=""
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    {/* Huy hiệu icon khoét góc trên trái */}
                    <span className="absolute left-0 top-0 rounded-br-[22px] p-2.5" style={{ background: E.mint }}>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: E.forest, color: E.green }}>
                        <Icon size={19} strokeWidth={1.7} />
                      </span>
                    </span>
                    <span
                      className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full opacity-0 transition duration-300 group-hover:opacity-100"
                      style={{ background: E.green, color: E.forest }}
                    >
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-medium" style={{ color: E.ink }}>
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: E.text }}>
                    {s.desc}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Biến ước mơ thành địa chỉ: ảnh lớn + ô số liệu xanh + danh sách cam kết
function Dream() {
  return (
    <section style={{ background: E.light }}>
      <div className={`${wrap} grid items-center gap-12 py-20 md:py-24 lg:grid-cols-2`}>
        <Reveal className="relative">
          <img src={PROJECTS[0].image} alt="Dự án ven sông" loading="lazy" className="aspect-[5/4] w-full rounded-[28px] object-cover" />
          <div
            className="absolute -bottom-6 right-6 rounded-[22px] p-5 shadow-[0_24px_40px_-24px_rgba(0,0,0,0.5)] md:right-[-24px]"
            style={{ background: E.green, color: E.ink }}
          >
            <p className="text-4xl font-semibold">
              <CountUp value={98} suffix="%" />
            </p>
            <p className="mt-1 text-xs">Khách hàng hài lòng</p>
          </div>
          <div className="absolute -top-6 left-6 flex items-center gap-3 rounded-[22px] bg-white p-4 shadow-[0_24px_40px_-24px_rgba(0,0,0,0.4)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: E.forest, color: E.green }}>
              <Star size={17} fill="currentColor" />
            </span>
            <span className="text-sm font-medium" style={{ color: E.ink }}>
              4,9 / 5 điểm đánh giá
            </span>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Eyebrow>Hành trình an cư</Eyebrow>
          <Title className="mt-3">
            Biến ước mơ thành <G dark>địa chỉ</G> của riêng bạn
          </Title>
          <p className="mt-5 text-sm leading-relaxed" style={{ color: E.text }}>
            Chọn căn trên bảng hàng thời gian thực, giữ chỗ trực tuyến và theo dõi tiến độ tới ngày nhận nhà, tất cả trong một tài khoản.
          </p>
          <ul className="mt-7 space-y-3">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-center gap-3 text-sm font-medium" style={{ color: E.ink }}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: E.forest, color: E.green }}>
                  <Check size={13} strokeWidth={3} />
                </span>
                {c}
              </li>
            ))}
          </ul>
          <CircleButton to="/projects" tone="dark" className="mt-8">
            Xem bảng hàng
          </CircleButton>
        </Reveal>
      </div>
    </section>
  );
}

// Giá trị: nền tối, các tab bên trái, ảnh + mô tả bên phải
function Values() {
  const [active, setActive] = useState(0);
  const v = VALUES[active];
  return (
    <section className="text-white" style={{ background: E.forest }}>
      <div className={`${wrap} grid items-center gap-12 py-20 md:py-24 lg:grid-cols-[0.9fr_1.1fr]`}>
        <Reveal>
          <Eyebrow light>Giá trị cốt lõi</Eyebrow>
          <Title light className="mt-3">
            Tạo <G>khác biệt</G> cho cách người Việt mua nhà
          </Title>
          <div className="mt-8 space-y-2" role="tablist" aria-label="Giá trị cốt lõi">
            {VALUES.map((item, i) => {
              const on = i === active;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                  className="flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left text-lg font-medium transition"
                  style={{
                    borderColor: on ? E.green : E.line,
                    background: on ? "rgba(142,240,92,0.08)" : "transparent",
                    color: on ? E.green : "rgba(255,255,255,0.8)",
                  }}
                >
                  {item.title}
                  <ArrowUpRight size={18} className={`transition ${on ? "rotate-45" : ""}`} />
                </button>
              );
            })}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="relative overflow-hidden rounded-[28px]" role="tabpanel">
            <img key={v.key} src={v.image} alt="" loading="lazy" className="aspect-[4/3] w-full animate-[eco-fade_0.6s_ease-out] object-cover" />
            <div className="absolute inset-x-4 bottom-4 rounded-[20px] p-5 backdrop-blur-md" style={{ background: "rgba(20,52,43,0.85)" }}>
              <p className="text-lg font-medium" style={{ color: E.green }}>
                {v.title}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/80">{v.desc}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Cảm nhận khách hàng: thẻ đang rê chuột (mặc định thẻ giữa) chuyển nền rêu đậm
function Testimonials() {
  const [active, setActive] = useState(1);
  return (
    <section style={{ background: E.mint }}>
      <div className={`${wrap} py-20 md:py-24`}>
        <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
          <Eyebrow>Cảm nhận</Eyebrow>
          <Reveal>
            <Title>
              Trải nghiệm thật, <G dark>câu chuyện thật</G>
            </Title>
          </Reveal>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3" onMouseLeave={() => setActive(1)}>
          {TESTIMONIALS.map((t, i) => {
            const on = i === active;
            return (
              <Reveal key={t.name} delay={i * 120}>
                <figure
                  tabIndex={0}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`flex h-full flex-col rounded-[24px] p-7 outline-none transition-[background-color,color,transform,box-shadow] duration-500 focus-visible:ring-2 focus-visible:ring-[#3f8a2c] ${
                    on ? "-translate-y-1.5 shadow-[0_26px_44px_-26px_rgba(20,52,43,0.7)]" : ""
                  }`}
                  style={{ background: on ? E.forest : E.light, color: on ? E.white : E.ink }}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex gap-0.5" aria-label="5 sao">
                      {Array.from({ length: 5 }, (_, k) => (
                        <Star key={k} size={14} fill={E.green} stroke="none" />
                      ))}
                    </span>
                    <Quote
                      size={26}
                      className={`transition-all duration-500 ${on ? "rotate-[-8deg] scale-110" : ""}`}
                      style={{ color: on ? E.green : "#3f8a2c" }}
                    />
                  </div>
                  <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed">"{t.quote}"</blockquote>
                  <figcaption
                    className="mt-6 flex items-center gap-3 border-t pt-5 transition-colors duration-500"
                    style={{ borderColor: on ? E.line : "rgba(16,36,29,0.1)" }}
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ background: E.green, color: E.forest }}
                    >
                      {t.name.split(" ").pop()?.[0]}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{t.name}</span>
                      <span className="block text-xs opacity-70">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Hỏi đáp: ảnh bên trái, các câu hỏi gập / mở bên phải
function Faq() {
  return (
    <section style={{ background: E.light }}>
      <div className={`${wrap} grid gap-12 py-20 md:py-24 lg:grid-cols-[0.9fr_1.1fr]`}>
        <Reveal className="relative">
          <img src={DAY_IN_LIFE[3].image} alt="" loading="lazy" className="aspect-[4/5] w-full rounded-[28px] object-cover lg:h-full" />
          <div className="absolute bottom-5 left-5 right-5 rounded-[20px] p-5 text-white" style={{ background: E.forest }}>
            <p className="text-lg font-medium">
              Còn thắc mắc? <span style={{ color: E.green }}>Trợ lý AI</span> trả lời 24/7.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Eyebrow>Hỏi đáp</Eyebrow>
          <Title className="mt-3">Câu hỏi thường gặp</Title>
          <div className="mt-8 space-y-3">
            {FAQS.map(([q, a], i) => (
              <details key={q} open={i === 0} className="group rounded-2xl bg-white px-5 open:shadow-[0_14px_30px_-22px_rgba(16,36,29,0.5)]">
                <summary
                  className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden"
                  style={{ color: E.ink }}
                >
                  {q}
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition group-open:rotate-45"
                    style={{ background: E.forest, color: E.green }}
                  >
                    <Plus size={16} />
                  </span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed" style={{ color: E.text }}>
                  {a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Kêu gọi: dải tối có ảnh mờ phía sau
function Cta() {
  return (
    <section style={{ background: E.light }}>
      <div className={`${wrap} pb-20`}>
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[32px] px-7 py-14 text-white md:px-14" style={{ background: E.forest }}>
            <img src={PROJECTS[1].image} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25" />
            <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#14342b] via-[#14342b]/85 to-transparent" aria-hidden />
            <div className="flex flex-wrap items-center justify-between gap-8">
              <div className="max-w-xl">
                <Eyebrow light>Bắt đầu ngay hôm nay</Eyebrow>
                <p className="mt-3 text-3xl font-medium leading-tight md:text-[40px]">
                  Sẵn sàng tìm <span style={{ color: E.green }}>ngôi nhà mới</span>?
                </p>
              </div>
              <CircleButton to="/projects">Xem dự án</CircleButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Cẩm nang: 3 thẻ bài viết
function Guides() {
  return (
    <section style={{ background: E.mint }}>
      <div className={`${wrap} py-20 md:py-24`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <Eyebrow>Cẩm nang</Eyebrow>
            <Title className="mt-3">
              Kiến thức cho <G dark>người mua nhà</G>
            </Title>
          </Reveal>
          <CircleButton to="/knowledge" tone="dark">
            Xem tất cả
          </CircleButton>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {GUIDES.map((g, i) => (
            <Reveal key={g.title} delay={i * 120}>
              <Link to={g.to} className="group block rounded-[24px] p-3 transition hover:-translate-y-1" style={{ background: E.light }}>
                <div className="overflow-hidden rounded-[18px]">
                  <img src={g.image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="px-3 pb-3 pt-5">
                  <span className="rounded-full px-3 py-1 text-[11px] font-medium" style={{ background: E.forest, color: E.green }}>
                    {g.tag}
                  </span>
                  <h3 className="mt-4 text-lg font-medium leading-snug" style={{ color: E.ink }}>
                    {g.title}
                  </h3>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomeClassicPage() {
  useEcoFonts();
  useSeo({
    title: "Hubtech",
    description: "Nền tảng bất động sản số: dự án, quỹ căn, sự kiện, tin tức và cơ hội nghề nghiệp.",
    canonical: `${window.location.origin}/home-classic`,
  });

  return (
    <div className="min-h-svh overflow-x-clip" style={{ background: E.mint, color: E.text, fontFamily: FONT }}>
      <style>{"@keyframes eco-fade{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:none}}"}</style>
      <ClassicHeader home="/" font={FONT} />
      <main>
        <Hero />
        <Why />
        <About />
        <Partners />
        <Services />
        <Dream />
        <Values />
        <Testimonials />
        <Faq />
        <Cta />
        <Guides />
      </main>
      <ClassicFooter />
      <Chatbot variant="green" />
    </div>
  );
}
