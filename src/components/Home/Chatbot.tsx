import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { ArrowUp, Building2, ChevronRight, FileText, MapPin, RotateCcw, X } from "lucide-react";
import { MAX_QUESTION_LENGTH, useChatbot } from "../../hooks/chat/useChatbot";
import type { ChatMessage, ChatSource } from "../../types/chat.types";
import SafeImage from "../common/SafeImage";
import Mascot from "./Mascot";

// Tên trợ lý AI hiển thị trên khung chat
const brand = { assistant: "Hubtech" };

const MOBILE = "(max-width: 767px)";

/* Hai kiểu giao diện:
   - default: các trang trong UserLayout (bo tròn, navy + kem)
   - urban: trang chủ Hubtech (phẳng, góc vuông, kem + đen, nhấn vàng đồng, font Inter Tight) */
const SKINS = {
  default: {
    font: '"Space Grotesk", sans-serif',
    panel: "rounded-3xl border border-line bg-[#fbf8f2] text-heading shadow-[0_30px_80px_-25px_rgba(15,22,38,0.5)]",
    header: "border-b border-line bg-[#ffffff]",
    headerLine: "via-primary-400",
    title: "hd-display text-sm font-bold tracking-wider text-heading",
    status: "text-[11px] text-muted",
    dot: "bg-emerald-400",
    iconBtn: "rounded-full text-muted hover:bg-page hover:text-heading",
    avatar: "rounded-full bg-navy",
    user: "rounded-2xl rounded-br-md bg-navy text-[#ffffff] shadow-[0_8px_20px_-10px_rgba(15,22,38,0.6)]",
    bot: "rounded-2xl rounded-tl-md border border-line bg-[#ffffff] text-body shadow-[0_4px_14px_-10px_rgba(15,22,38,0.35)]",
    botErr: "rounded-2xl rounded-tl-md border border-danger/30 bg-danger/5 text-danger",
    accentText: "text-primary-700",
    srcHover: "hover:text-primary-700",
    card: "rounded-xl border border-line bg-[#ffffff] hover:border-primary-300 hover:shadow-[0_8px_20px_-12px_rgba(95,70,34,0.45)]",
    cardImg: "rounded-lg",
    typing: "rounded-2xl rounded-tl-md border border-line bg-[#ffffff]",
    typingDot: "rounded-full bg-primary-400",
    form: "border-t border-line bg-[#ffffff]",
    input: "rounded-2xl border border-line bg-[#fbf8f2] text-heading placeholder:text-muted focus:border-primary-400 focus:bg-[#ffffff] focus:ring-2 focus:ring-primary-100",
    send: "rounded-full bg-primary-600 text-[#ffffff] shadow-[0_8px_18px_-8px_rgba(148,113,58,0.9)] hover:scale-105 hover:bg-primary-700 disabled:scale-100 disabled:shadow-none",
    greet: "rounded-2xl rounded-br-md border border-line bg-[#fbf8f2] text-body shadow-[0_20px_50px_-20px_rgba(15,22,38,0.55)]",
    greetClose: "rounded-full border border-line bg-[#ffffff] text-muted shadow-sm hover:text-heading",
    closeOrb: "rounded-full border border-[#d7bd8a]/50 bg-[#0f1626] text-[#ffffff] shadow-[0_0_30px_-6px_rgba(74, 114, 98,0.7)]",
    tooltip: "rounded-full bg-[#0f1626]/95 text-white shadow-lg",
    strong: "text-heading",
    text: "text-body",
    muted: "text-muted",
    divider: "border-line",
    cardTitle: "text-heading",
    placeholder: "bg-page",
    marker: "marker:text-primary-500",
    list: "",
  },
  // Theo theme trang chủ: nền xanh rêu đậm (#101e1c / #152724 / #1b302c), chữ kem, nhấn vàng đồng (#d7bd8a), font Be Vietnam Pro
  urban: {
    font: '"Be Vietnam Pro", system-ui, sans-serif',
    panel: "rounded-2xl border border-[#d7bd8a]/25 bg-[#101e1c] text-[#f5f0e7] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]",
    header: "border-b border-[#d7bd8a]/15 bg-[#152724]",
    headerLine: "via-[#d7bd8a]/70",
    title: "text-sm font-semibold tracking-[0.14em] text-[#f5f0e7]",
    status: "text-[11px] text-[#adbdb4]",
    dot: "bg-[#d7bd8a]",
    iconBtn: "rounded-full text-[#adbdb4] hover:bg-[#d7bd8a]/10 hover:text-[#d7bd8a]",
    avatar: "rounded-full bg-[#1b302c] ring-1 ring-[#d7bd8a]/35",
    user: "rounded-2xl rounded-br-md bg-linear-to-br from-[#e2cfa8] to-[#c9ae7b] font-medium text-[#101e1c] shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)]",
    bot: "rounded-2xl rounded-tl-md border border-[#d7bd8a]/15 bg-[#1b302c] text-[#d0d7d1]",
    botErr: "rounded-2xl rounded-tl-md border border-red-400/30 bg-red-500/10 text-red-200",
    accentText: "text-[#d7bd8a]",
    srcHover: "hover:text-[#d7bd8a]",
    card: "rounded-xl border border-[#d7bd8a]/15 bg-[#152724] hover:border-[#d7bd8a]/50",
    cardImg: "rounded-lg",
    typing: "rounded-2xl rounded-tl-md border border-[#d7bd8a]/15 bg-[#1b302c]",
    typingDot: "rounded-full bg-[#d7bd8a]",
    form: "border-t border-[#d7bd8a]/15 bg-[#152724]",
    input: "rounded-xl border border-[#d7bd8a]/20 bg-[#101e1c] text-[#f5f0e7] placeholder:text-[#adbdb4]/70 focus:border-[#d7bd8a]/60 focus:ring-2 focus:ring-[#d7bd8a]/15",
    send: "rounded-full bg-linear-to-br from-[#e2cfa8] to-[#c9ae7b] text-[#101e1c] shadow-[0_8px_18px_-8px_rgba(215,189,138,0.6)] hover:scale-105 disabled:scale-100 disabled:shadow-none",
    greet: "rounded-2xl border border-[#d7bd8a]/25 bg-[#101e1c] text-[#d0d7d1]",
    greetClose: "rounded-full bg-[#152724] text-[#d7bd8a] hover:bg-[#1b302c]",
    closeOrb: "rounded-full border border-[#d7bd8a]/40 bg-[#101e1c] text-[#d7bd8a] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]",
    tooltip: "rounded-full border border-[#d7bd8a]/25 bg-[#101e1c] text-[#f5f0e7]",
    strong: "text-[#f5f0e7]",
    text: "text-[#d0d7d1]",
    muted: "text-[#adbdb4]",
    divider: "border-[#d7bd8a]/15",
    cardTitle: "text-[#f5f0e7]",
    placeholder: "bg-[#1b302c]",
    marker: "marker:text-[#d7bd8a]",
    list: "[scrollbar-color:rgba(215,189,138,0.3)_transparent] [scrollbar-width:thin]",
  },
  green: {
    font: '"Inter Tight", "Inter", system-ui, sans-serif',
    panel: "border border-[#0b3d2c] bg-[#ffffff] text-[#0b3d2c] shadow-[10px_10px_0_-2px_rgba(16,16,16,0.12)]",
    header: "bg-[#0b3d2c] text-[#ffffff]",
    headerLine: "",
    title: "text-sm font-semibold uppercase tracking-[0.12em] text-[#ffffff]",
    status: "font-mono text-[10px] uppercase tracking-wider text-[#ffffff]/60",
    dot: "bg-[#00b14f]",
    iconBtn: "text-[#ffffff]/70 hover:bg-[#ffffff]/10 hover:text-[#ffffff]",
    avatar: "rounded-full bg-[#0b3d2c]",
    user: "bg-[#0b3d2c] text-[#ffffff]",
    bot: "border-l-2 border-[#00873c] bg-[#f3f7f5] text-[#0b3d2c]/85",
    botErr: "border-l-2 border-danger bg-danger/5 text-danger",
    accentText: "text-[#00873c]",
    srcHover: "hover:text-[#00873c]",
    card: "border border-[#0b3d2c]/15 bg-[#ffffff] hover:border-[#00873c]",
    cardImg: "",
    typing: "border-l-2 border-[#00873c] bg-[#f3f7f5]",
    typingDot: "rounded-full bg-[#00873c]",
    form: "border-t border-[#0b3d2c] bg-[#ffffff]",
    input: "border-b border-[#0b3d2c]/30 bg-transparent text-[#0b3d2c] placeholder:text-[#0b3d2c]/45 focus:border-[#00873c]",
    send: "bg-[#0b3d2c] text-[#ffffff] hover:bg-[#00873c]",
    greet: "border border-[#0b3d2c] bg-[#ffffff] text-[#0b3d2c]/80 shadow-[6px_6px_0_-1px_rgba(16,16,16,0.12)]",
    greetClose: "rounded-full bg-[#0b3d2c] text-[#ffffff] hover:bg-[#00873c]",
    closeOrb: "rounded-full bg-[#0b3d2c] text-[#ffffff] shadow-[0_10px_30px_-10px_rgba(16,16,16,0.6)]",
    tooltip: "bg-[#0b3d2c] text-[#ffffff]",
    strong: "text-heading",
    text: "text-body",
    muted: "text-muted",
    divider: "border-line",
    cardTitle: "text-heading",
    placeholder: "bg-page",
    marker: "marker:text-[#00873c]",
    list: "",
  },
};
type Skin = (typeof SKINS)[keyof typeof SKINS];
const sourceHref = (s: ChatSource) => (s.type === "DOCUMENT" ? (s.slug ? `/knowledge/${s.slug}` : null) : `/projects/${s.id}`);

// Đang ở trang chi tiết dự án (/projects/:id/...) thì lấy id để bot chỉ trả lời về dự án đó
// Nhiều đoạn của cùng 1 tài liệu / dự án được trích ([1][3]) thì gộp lại thành 1 dòng
type SourceGroup = { key: string; source: ChatSource; indexes: number[]; pages: number[] };

function groupSources(sources: ChatSource[]): SourceGroup[] {
  const groups = new Map<string, SourceGroup>();
  for (const s of sources) {
    const key = `${s.type}-${s.id}`;
    const group = groups.get(key) ?? { key, source: s, indexes: [], pages: [] };
    group.indexes.push(s.index);
    if (s.page && !group.pages.includes(s.page)) group.pages.push(s.page);
    groups.set(key, group);
  }
  return [...groups.values()];
}

// Trong 1 dòng: **đậm** và số nguồn [n]
function inline(text: string, key: string, skin: Skin): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={`${key}-${i}`} className={`font-semibold ${skin.strong}`}>{part.slice(2, -2)}</strong>;
    if (/^\[\d+\]$/.test(part)) return <sup key={`${key}-${i}`} className={`ml-0.5 text-[10px] font-bold ${skin.accentText}`}>{part}</sup>;
    return part;
  });
}

// Markdown tối giản của bot: đoạn văn + gạch đầu dòng
function answer(text: string, skin: Skin): ReactNode[] {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    const items = list;
    out.push(<ul key={`ul-${out.length}`} className={`list-disc space-y-1 pl-5 ${skin.marker}`}>{items.map((t, i) => <li key={i}>{inline(t, `li${out.length}${i}`, skin)}</li>)}</ul>);
    list = [];
  };
  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) return void list.push(bullet[1]);
    flush();
    if (line) out.push(<p key={`p-${i}`}>{inline(line, `p${i}`, skin)}</p>);
  });
  flush();
  return out;
}

// Robot màu sáng đặt trên huy hiệu tròn navy để nổi trên nền kem của khung chat
function BotAvatar({ size, mood, skin }: { size: number; mood?: "happy" | "thinking"; skin: Skin }) {
  return (
    <span className={`flex shrink-0 items-center justify-center self-start ${skin.avatar}`} style={{ width: size + 8, height: size + 8 }}>
      <Mascot size={size} mood={mood} />
    </span>
  );
}

function Bubble({ m, skin }: { m: ChatMessage; skin: Skin }) {
  if (m.role === "user") {
    return (
      <li className="flex justify-end animate-[hd-msg-in_0.35s_ease-out]">
        <p className={`max-w-[85%] whitespace-pre-wrap break-words px-4 py-2.5 text-sm ${skin.user}`}>{m.content}</p>
      </li>
    );
  }
  // Dự án đã có thẻ riêng (ảnh + link) thì không lặp lại trong danh sách nguồn
  const projectIds = new Set(m.projects?.map((p) => p.id));
  const sources = m.sources?.filter((s) => !(s.type === "PROJECT" && projectIds.has(s.id))) ?? [];
  return (
    <li className="flex gap-2.5 animate-[hd-msg-in_0.35s_ease-out]">
      <BotAvatar size={30} skin={skin} />
      <div className="min-w-0 max-w-[85%] space-y-2">
        <div className={`space-y-2 break-words px-4 py-3 text-sm leading-6 ${m.error ? skin.botErr : skin.bot}`}>
          {answer(m.content, skin)}
          {sources.length > 0 && (
            <div className={`border-t pt-2 ${skin.divider}`}>
              <p className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>Nguồn tham khảo</p>
              <ul className="space-y-1">
                {groupSources(sources).map(({ key, source: s, indexes, pages }) => {
                  const href = sourceHref(s);
                  const label = (
                    <>
                      <span className={`shrink-0 font-bold ${skin.accentText}`}>{indexes.map((i) => `[${i}]`).join("")}</span>
                      {s.type === "DOCUMENT" ? <FileText size={12} className="shrink-0" /> : <Building2 size={12} className="shrink-0" />}
                      <span className="truncate">
                        {s.title}
                        {pages.length > 0 ? ` · trang ${[...pages].sort((a, b) => a - b).join(", ")}` : ""}
                      </span>
                    </>
                  );
                  return (
                    <li key={key}>
                      {href ? <Link to={href} className={`flex items-center gap-1.5 text-xs ${skin.text} ${skin.srcHover}`}>{label}</Link> : <span className={`flex items-center gap-1.5 text-xs ${skin.text}`}>{label}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        {m.projects?.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`} className={`group flex items-center gap-3 p-2 transition ${skin.card}`}>
            {p.image ? <SafeImage src={p.image} alt="" loading="lazy" className={`h-14 w-18 shrink-0 object-cover ${skin.cardImg}`} /> : <span className={`flex h-14 w-18 shrink-0 items-center justify-center ${skin.placeholder} ${skin.cardImg}`}><Building2 size={16} className={skin.muted} /></span>}
            <span className="min-w-0 flex-1">
              <span className={`line-clamp-2 text-sm font-semibold ${skin.cardTitle}`}>{p.name}</span>
              {p.location && <span className={`mt-0.5 flex items-center gap-1 text-xs ${skin.muted}`}><MapPin size={11} className="shrink-0" /> <span className="truncate">{p.location}</span></span>}
              <span className={`mt-1 flex items-center gap-0.5 text-xs font-semibold ${skin.accentText}`}>Xem dự án <ChevronRight size={12} /></span>
            </span>
          </Link>
        ))}
      </div>
    </li>
  );
}

// Trợ lý AI ở góc dưới, dùng chung cho mọi trang người dùng (logic chatbot thật useChatbot):
// linh vật robot hoạt hình (chớp mắt, nhìn theo chuột, vẫy tay chào), lời chào bật lên sau vài giây, khung chat kính bung ra
// từ góc, tin nhắn trượt vào, robot đổi mặt "đang suy nghĩ" khi chờ trả lời.
// Ở trang nào cũng hỏi được mọi dự án / tài liệu; ở trang chi tiết việc làm thì nâng cụm chat lên trên thanh "Ứng tuyển" (mobile)
export default function Chatbot({ variant = "default" }: { variant?: keyof typeof SKINS }) {
  const skin: Skin = SKINS[variant];
  const { pathname } = useLocation();
  const aboveApplyBar = !!matchPath("/jobs/:id", pathname) && pathname !== "/jobs/create-cv";
  const { messages, sending, ask, reset } = useChatbot();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [hover, setHover] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE).matches);
  // Điện thoại: đang cuộn xuống đọc thì giấu nút ra mép phải, cuộn lên / dừng lại thì hiện lại (để nút không che nội dung)
  const [tucked, setTucked] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE);
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobile || open) {
      setTucked(false);
      return;
    }
    let lastY = window.scrollY;
    let idle = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY + 6 && y > 120) setTucked(true);
      else if (y < lastY - 6) setTucked(false);
      lastY = y;
      window.clearTimeout(idle);
      idle = window.setTimeout(() => setTucked(false), 900); // dừng cuộn → hiện lại
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
    };
  }, [mobile, open]);

  useEffect(() => {
    if (!open) return;
    // Điện thoại: không tự focus ô soạn tin, để bàn phím chỉ bật khi người dùng chạm vào ô đó
    if (!mobile) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, mobile]);

  // Tin mới / đang trả lời: cuộn xuống cuối
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  const send = (q: string) => {
    if (!q.trim() || sending) return;
    void ask(q);
    setText("");
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(text);
  };

  return (
    <div
      data-above-bar={aboveApplyBar || undefined}
      // mb theo --chatbot-lift: nâng lên trên các thanh nổi ở đáy (vd khay so sánh căn) để không che nút của thanh
      className={`hd-dark-island fixed bottom-3 right-3 z-[60] mb-[var(--chatbot-lift,0px)] flex flex-col items-end gap-3 transition-[transform,margin] duration-500 ease-out md:bottom-7 md:right-7 ${
        tucked ? "translate-x-[calc(100%+0.75rem)]" : ""
      }`}
      style={{ fontFamily: skin.font }}
    >
      {open && (
        <section
          role="dialog"
          aria-label={`Trợ lý AI ${brand.assistant}`}
          // Máy tính: khung nổi góc phải, cao tối đa = màn hình trừ menu trên (~5.5rem), nút mở + khoảng cách (~6rem) và lề dưới.
          // Điện thoại: khung nổi nhỏ ở góc phải ngay trên nút robot, không phủ kín màn hình; cao tối đa = màn hình trừ menu trên và nút mở.
          // Khung chat nền sáng (kem / trắng) theo màu chung của site; dùng thẳng màu của site vì cụm chatbot nằm trong hd-dark-island
          className={`flex flex-col overflow-hidden ${skin.panel} ${
            mobile
              ? "h-[min(520px,calc(100svh-11rem))] w-[min(340px,calc(100vw-1.5rem))] origin-bottom-right animate-[hd-chat-open_0.45s_cubic-bezier(0.2,0.8,0.2,1.2)]"
              : "h-[min(620px,calc(100svh-13rem))] w-[min(400px,calc(100vw-2.5rem))] origin-bottom-right animate-[hd-chat-open_0.45s_cubic-bezier(0.2,0.8,0.2,1.2)]"
          }`}
        >
          <header className={`relative flex items-center gap-3 px-4 py-3.5 ${skin.header}`}>
            {skin.headerLine && <span className={`pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent to-transparent ${skin.headerLine}`} aria-hidden />}
            <BotAvatar size={38} mood={sending ? "thinking" : "happy"} skin={skin} />
            <div className="min-w-0 flex-1">
              <p className={skin.title}>TRỢ LÝ {brand.assistant.toUpperCase()}</p>
              <p className={`flex items-center gap-1.5 ${skin.status}`}>
                <span className="relative flex h-2 w-2"><span className={`absolute inset-0 animate-ping rounded-full ${skin.dot}`} /><span className={`relative h-2 w-2 rounded-full ${skin.dot}`} /></span>
                {sending ? "Đang suy nghĩ..." : "Trực tuyến · trả lời ngay"}
              </p>
            </div>
            <button type="button" onClick={reset} aria-label="Cuộc trò chuyện mới" title="Cuộc trò chuyện mới" className={`flex h-9 w-9 items-center justify-center transition ${skin.iconBtn}`}><RotateCcw size={15} /></button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng trợ lý" className={`flex h-9 w-9 items-center justify-center transition ${skin.iconBtn}`}><X size={18} /></button>
          </header>

          <ul ref={listRef} className={`flex-1 space-y-4 overflow-y-auto px-4 py-5 ${skin.list}`} aria-live="polite">
            {messages.map((m) => <Bubble key={m.id} m={m} skin={skin} />)}
            {sending && (
              <li className="flex items-center gap-2.5">
                <BotAvatar size={30} mood="thinking" skin={skin} />
                <span className={`flex items-center gap-1.5 px-4 py-3 ${skin.typing}`}>
                  {[0, 1, 2].map((i) => <span key={i} className={`h-2 w-2 animate-[hd-dot_1.2s_ease-in-out_infinite] ${skin.typingDot}`} style={{ animationDelay: `${i * 0.15}s` }} />)}
                </span>
              </li>
            )}
          </ul>

          <form onSubmit={submit} className={`flex items-end gap-2 p-3 ${skin.form}`}>
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(text);
                }
              }}
              rows={1}
              placeholder="Hỏi về dự án, căn hộ, chính sách..."
              aria-label="Câu hỏi"
              // Điện thoại: chữ 16px, nhỏ hơn thì Safari trên iPhone tự phóng to trang khi chạm vào ô
              className={`max-h-28 min-h-11 flex-1 resize-none px-4 py-3 text-base outline-none transition md:text-sm ${skin.input}`}
            />
            <button type="submit" disabled={!text.trim() || sending} aria-label="Gửi" className={`flex h-11 w-11 shrink-0 items-center justify-center transition disabled:opacity-40 ${skin.send}`}>
              <ArrowUp size={18} />
            </button>
          </form>
        </section>
      )}

      {/* Nút mở / đóng: robot nhấp nhô (điện thoại nhỏ hơn để đỡ che nội dung) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        aria-label={open ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
        aria-expanded={open}
        className="group relative flex h-14 w-14 items-center justify-center transition hover:scale-110 md:h-20 md:w-20"
      >
        {/* Quầng sáng dưới chân robot */}
        <span className="absolute bottom-1 left-1/2 h-4 w-12 -translate-x-1/2 rounded-full bg-[#648c7a]/45 blur-xl transition group-hover:bg-[#d7bd8a]/65 md:h-6 md:w-16" aria-hidden />
        {open ? (
          <span className={`relative flex h-12 w-12 items-center justify-center md:h-14 md:w-14 ${skin.closeOrb}`}><X size={22} /></span>
        ) : (
          <span className="relative drop-shadow-[0_10px_20px_rgba(74, 114, 98,0.4)]">
            <Mascot size={mobile ? 54 : 76} track wave={hover} mood={hover ? "happy" : "idle"} />
          </span>
        )}
        {!open && (
          <span className={`pointer-events-none absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 text-xs opacity-0 transition group-hover:opacity-100 ${skin.tooltip}`}>
            Hỏi trợ lý AI
          </span>
        )}
      </button>
    </div>
  );
}
