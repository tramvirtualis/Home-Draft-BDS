import { useEffect, useState, type CSSProperties } from "react";
import { Check, Clock, KeyRound } from "lucide-react";
import { PROJECTS } from "../ninja/ninjaContent";
import { SHEET, UNIT } from "./journeyContent";

/* Hình minh họa dùng chung cho /home-2 và /home-5 */

// Chương 1: lọc dự án, căn mẫu nằm ở dự án đầu tiên
export function ExploreViz() {
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
export function TourViz({ image, room }: { image: string; room?: string }) {
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
export function SheetViz() {
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
export function HoldViz({ note }: { note?: string }) {
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
export function KeyViz({ steps, quote }: { steps?: string[]; quote?: { quote: string; name: string; role: string; initials: string } }) {
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

