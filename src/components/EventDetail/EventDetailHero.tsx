import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import EventStatusBadge from "../Event/EventStatusBadge";
import { EVENT_FALLBACK_IMAGE, canRegister, eventDateParts, registrationOf } from "../Event/eventDisplay";
import { formatWeekdayDate } from "../../utils/formatDate";
import type { Event } from "../../types/event/event.types";

const SLIDE_INTERVAL = 4500;

const daysUntil = (iso: string): number => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);

// Hero chi tiết sự kiện: nền cố định giống trang Sự kiện nhưng bố cục khác hẳn (không dùng thẻ vé ở giữa)
// để người dùng nhận ra đã sang trang chi tiết: trái là tiêu đề + thông tin, phải là khung ảnh kèm ô ngày
export default function EventDetailHero({ event }: { event: Event }) {
  const images = event.images?.length ? event.images.map((img) => img.imageUrl) : [EVENT_FALLBACK_IMAGE];
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const t = setInterval(() => setCurrent((i) => (i + 1) % images.length), SLIDE_INTERVAL);
    return () => clearInterval(t);
  }, [images.length, paused]);

  const active = current < images.length ? current : 0;
  const start = eventDateParts(event.startTime);
  const end = eventDateParts(event.endTime);
  const days = daysUntil(event.startTime);
  const open = canRegister(event);
  const registration = registrationOf(event);

  const facts = [
    { icon: CalendarDays, label: "Ngày", value: formatWeekdayDate(event.startTime) },
    { icon: Clock, label: "Thời gian", value: `${start.time} – ${end.time}` },
    { icon: MapPin, label: "Địa điểm", value: event.location },
    { icon: Users, label: "Đã đăng ký", value: `${event.attendeeCount}/${event.maxAttendees} người` },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-ink-900 text-white">
      {/* Nền cố định, đậm bên trái để chữ dễ đọc */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <img src={EVENT_FALLBACK_IMAGE} alt="" className="h-full w-full scale-110 object-cover blur-[2px]" />
        <div className="absolute inset-0 bg-linear-to-r from-ink-900/95 via-ink-900/90 to-ink-900/70" />
        <div className="absolute inset-0 bg-linear-to-t from-ink-900/90 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 pb-16 pt-8 md:pb-20 lg:px-8">
        <nav className="flex min-w-0 items-center gap-1.5 text-xs text-white/60" aria-label="Breadcrumb">
          <Link to="/" className="shrink-0 hover:text-white">Trang chủ</Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link to="/events" className="shrink-0 hover:text-white">Sự kiện</Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="truncate font-semibold text-white">{event.title}</span>
        </nav>

        <div className="mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* Trái: tiêu đề + thông tin */}
          <div className="animate-rise-in order-2 lg:order-1">
            <div className="flex flex-wrap items-center gap-3">
              <EventStatusBadge status={event.status} />
              {days > 0 && open && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
                  <Clock size={13} /> Còn {days} ngày
                </span>
              )}
            </div>
            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight md:text-5xl">{event.title}</h1>

            {/* Khung thông tin: nền mờ tách khỏi ảnh nền cho dễ đọc, 2×2 có đường chia */}
            <dl className="mt-8 grid max-w-xl overflow-hidden rounded-2xl bg-white/[0.07] ring-1 ring-white/15 backdrop-blur-md sm:grid-cols-2">
              {facts.map(({ icon: Icon, label, value }, i) => (
                <div
                  key={label}
                  className={`flex items-start gap-3 p-4 ${i > 0 ? "border-t border-white/10" : ""} ${
                    i === 1 ? "sm:border-t-0" : ""
                  } ${i % 2 === 1 ? "sm:border-l" : ""}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/25 text-primary-100">
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/65">{label}</dt>
                    <dd className="mt-1 text-[15px] font-semibold text-white">{value}</dd>
                    {label === "Đã đăng ký" && (
                      <span className={`mt-1.5 inline-block rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold ${registration.className}`}>
                        {registration.text}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {open && (
                <a href="#dang-ky" className="flex items-center gap-2 bg-white px-6 py-3 text-sm font-semibold text-heading shadow-lg transition hover:bg-primary-50">
                  Đăng ký tham dự <ArrowRight size={15} />
                </a>
              )}
              <a href="#dia-diem" className="border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">
                Xem địa điểm
              </a>
            </div>
          </div>

          {/* Phải: khung ảnh sự kiện + ô ngày */}
          <div
            className="relative order-1 lg:order-2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15">
              {images.map((src, i) => (
                <img
                  key={src + i}
                  src={src}
                  alt={`${event.title} - ảnh ${i + 1}`}
                  onError={(e) => {
                    if (e.currentTarget.src !== EVENT_FALLBACK_IMAGE) e.currentTarget.src = EVENT_FALLBACK_IMAGE;
                  }}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
                />
              ))}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 flex gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5 backdrop-blur">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Xem ảnh ${i + 1}`}
                      onClick={() => setCurrent(i)}
                      className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white"}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Ô ngày đè lên góc khung ảnh */}
            <div className="absolute -bottom-6 left-4 flex flex-col items-center bg-white px-5 py-3 text-heading shadow-xl md:-left-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary-600">{start.month}</span>
              <span className="text-4xl font-bold leading-none tabular-nums">{start.day}</span>
              <span className="mt-1 text-xs text-muted">{start.year}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
