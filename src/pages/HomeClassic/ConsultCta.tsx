import { Link } from "react-router-dom";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { DotMark, GOLD_BTN, P, Pill } from "./urbanUi";
import { CONTACT } from "../../data/contactInfo";

/* ============================================================
   Khung tư vấn cuối trang: khối xanh đậm bo góc, logo chấm phát sáng, viên thuốc liên hệ
   ============================================================ */
export function ConsultCta() {
  return (
    <section id="tu-van" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-24 md:px-10 md:py-32">
      <div className="hc-dark relative overflow-hidden rounded-[28px] border border-[#6ee7a0]/20 px-6 py-14 md:rounded-[36px] md:px-14 md:py-20">
        <div className="pointer-events-none absolute -right-10 top-1/2 hidden w-[380px] -translate-y-1/2 md:block" aria-hidden>
          <div className="absolute inset-[14%] rounded-full bg-[#00b14f]/30 blur-3xl" />
          <DotMark className="hc-float relative w-full" />
        </div>
        <div className="relative max-w-2xl">
          <Pill tone="glass">Tư vấn miễn phí</Pill>
          <p className="mt-6 text-[10vw] font-semibold leading-[1.05] tracking-[-0.035em] md:text-6xl">
            Nhà của bạn,
            <br />
            <span style={{ color: P.glow }}>số hoá trọn vẹn.</span>
          </p>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#ffffff]/70">
            Để lại lời nhắn hoặc gọi cho chúng tôi. Chuyên viên dự án sẽ liên hệ trong 15 phút.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={CONTACT.phoneHref} className={`inline-flex items-center gap-2 px-6 py-3 text-sm ${GOLD_BTN}`}>
              <Phone size={16} /> {CONTACT.phone}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 rounded-full border border-[#6ee7a0]/40 px-6 py-3 text-sm font-semibold text-[#ffffff] transition hover:bg-[#6ee7a0]/10">
              <Mail size={16} /> {CONTACT.email}
            </a>
            <Link to="/projects" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-[#6ee7a0] hover:underline">
              Xem dự án <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
