import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Map as MapIcon, MapPin } from "lucide-react";
import SafeImage from "../../../common/SafeImage";
import { statusTone } from "./zoneStatus";
import type { Zone, ZoneProject } from "../../../../types/project/zone.types";

type Props = {
  base: string;
  project: ZoneProject;
  zone: Zone;
  index: number;
  total: number;
  onStep: (dir: 1 | -1) => void;
  // Mặt bằng phân khu: undefined = dự án chưa có mặt bằng (ẩn nút), null = đang tải, số = số ghim của phân khu
  planPinCount?: number | null;
  onShowPlan?: () => void;
};

// Khối chi tiết phân khu đang chọn (không có route chi tiết riêng nên hiển thị ngay trên trang)
export default function ZoneStage({ base, project, zone, index, total, onStep, planPinCount, onShowPlan }: Props) {
  const tone = statusTone(zone.status);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  // Thu gọn lại khi đổi phân khu
  useEffect(() => {
    setExpanded(false);
  }, [zone.id]);

  // Chỉ hiện nút "Xem thêm" khi mô tả thật sự dài hơn 5 dòng
  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el || expanded) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [zone.id, zone.description, expanded]);

  return (
    <div key={zone.id} className="animate-page-in grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center">
      <div className="relative overflow-hidden">
        <SafeImage
          src={zone.imageUrl ?? undefined}
          alt={zone.name}
          className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
        />
        <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 font-mono text-xs font-semibold text-primary-700 backdrop-blur">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">Phân khu đang xem</p>
        <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-heading md:text-5xl">{zone.name}</h2>

        {zone.status && (
          <span className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${tone.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} /> {zone.status}
          </span>
        )}

        {zone.description && (
          <div className="mt-5">
            <p ref={descRef} className={`whitespace-pre-line leading-relaxed text-body ${expanded ? "" : "line-clamp-5"}`}>
              {zone.description}
            </p>
            {(overflows || expanded) && (
              <button
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                {expanded ? "Thu gọn" : "Xem thêm"}
                <ChevronDown size={16} className={`transition ${expanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        )}

        <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
          <div className="flex justify-between gap-4 py-3">
            <dt className="shrink-0 whitespace-nowrap text-body">Thuộc dự án</dt>
            <dd className="text-right font-semibold text-heading">{project.name}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="shrink-0 whitespace-nowrap text-body">Vị trí</dt>
            <dd className="flex min-w-0 items-start justify-end gap-1 text-right font-semibold text-heading">
              <MapPin size={13} className="mt-1 shrink-0" /> <span>{project.location}</span>
            </dd>
          </div>
          {zone.propertyCount !== null && (
            <div className="flex justify-between gap-4 py-3">
              <dt className="shrink-0 whitespace-nowrap text-body">Số bất động sản</dt>
              <dd className="font-semibold text-heading">{zone.propertyCount.toLocaleString("vi-VN")}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to={`${base}/inventory`}
            className="group inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 active:scale-95"
          >
            Xem quỹ căn <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
          {planPinCount !== undefined && (
            <button
              type="button"
              onClick={onShowPlan}
              disabled={!planPinCount}
              title={planPinCount === 0 ? "Phân khu chưa có căn hoặc tòa nào được ghim trên mặt bằng" : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-primary-300 px-5 py-3.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              <MapIcon size={16} /> {planPinCount === null ? "Đang tải mặt bằng..." : "Xem mặt bằng phân khu"}
            </button>
          )}
          <Link
            to={base}
            className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-3.5 text-sm font-medium text-heading transition hover:border-primary-300 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <ArrowLeft size={16} className="transition group-hover:-translate-x-1" /> Về dự án
          </Link>

          {total > 1 && (
            <div className="ml-auto flex gap-2">
              {([-1, 1] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => onStep(d)}
                  aria-label={d < 0 ? "Phân khu trước" : "Phân khu sau"}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line transition hover:bg-primary-600 hover:text-white focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95"
                >
                  {d < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
