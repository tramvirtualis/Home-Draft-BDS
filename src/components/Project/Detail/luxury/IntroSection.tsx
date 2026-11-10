import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Container from "../Container";
import Reveal from "../../../common/Reveal";
import LuxuryHeading from "./LuxuryHeading";
import type { ProjectProfile } from "../../../../types/project/projectOverview.types";

type Props = {
  name: string;
  basePath: string;
  profile: ProjectProfile;
  price: string;
  stats: { label: string; value: number }[];
};

// Giới thiệu dự án: tiêu đề, bên dưới là thẻ hồ sơ nhanh trải ngang (giá, loại hình, số liệu, nút xem quỹ căn)
export default function IntroSection({ name, basePath, profile, price, stats }: Props) {
  const visibleStats = stats.filter((s) => s.value > 0);

  return (
    <section className="py-20 md:py-28" aria-labelledby="gioi-thieu-title">
      <Container>
        <LuxuryHeading id="gioi-thieu" eyebrow="Giới thiệu dự án" title={`Tổng quan ${name}`} />
        <h2 id="gioi-thieu-title" className="sr-only">Giới thiệu dự án {name}</h2>

        <Reveal variant="up">
          <div
            aria-label="Hồ sơ nhanh dự án"
            className="relative mt-10 grid gap-7 overflow-hidden rounded-[2rem] border border-primary-200 bg-primary-100 p-7 text-heading md:p-9 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto] lg:items-center lg:gap-10"
          >
            <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary-300/40 blur-3xl" aria-hidden />

            <div className="relative">
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-primary-600">Giá tham khảo</p>
              <p className="heading-display mt-2 whitespace-nowrap text-4xl text-primary-700">{price}</p>
            </div>

            {profile.types.length > 0 ? (
              <div className="relative lg:border-l lg:border-primary-200 lg:pl-10">
                <p className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-body">Loại hình sản phẩm</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {profile.types.map((t) => (
                    <li key={t} className="rounded-full border border-primary-200 bg-white px-3.5 py-1.5 text-sm text-heading">{t}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <span className="hidden lg:block" aria-hidden />
            )}

            {visibleStats.length > 0 ? (
              <dl className="relative flex gap-10 border-t border-primary-200 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                {visibleStats.map((s) => (
                  <div key={s.label}>
                    <dd className="heading-display text-4xl tabular-nums text-primary-700">{s.value.toLocaleString("vi-VN")}</dd>
                    <dt className="mt-1 text-xs text-body">{s.label}</dt>
                  </div>
                ))}
              </dl>
            ) : (
              <span className="hidden lg:block" aria-hidden />
            )}

            <Link
              to={`${basePath}/inventory`}
              className="btn-gloss group relative flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-heading text-xs font-bold uppercase tracking-widest text-white transition hover:-translate-y-0.5 active:scale-95"
            >
              Xem quỹ căn đang mở bán <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
