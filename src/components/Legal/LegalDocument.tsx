import { useEffect } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../common/Breadcrumb";
import { AUTH_COPY } from "../../data/authContent";
import type { LegalDoc } from "../../data/legalContent";

// Khung chung cho trang pháp lý: tiêu đề + mục lục bên trái (dính khi cuộn) + nội dung từng mục
export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="bg-page pb-24 pt-10">
      <div className="container mx-auto px-4 lg:px-8">
        <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: doc.title }]} />

        <header className="mt-6 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-heading md:text-4xl">{doc.title}</h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Cập nhật lần cuối: {doc.updatedAt}
          </p>
          <p className="mt-4 text-body">{doc.summary}</p>
        </header>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[240px_1fr]">
          <nav className="rounded-2xl bg-white p-5 ring-1 ring-line lg:sticky lg:top-24" aria-label="Mục lục">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Mục lục</p>
            <ol className="space-y-2 text-sm">
              {doc.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-body hover:text-primary-600">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <div className="mt-5 space-y-1 border-t border-line pt-4 text-sm">
              <Link to={AUTH_COPY.privacyHref} className="block text-primary-600 hover:underline">
                Chính sách bảo mật
              </Link>
              <Link to={AUTH_COPY.termsHref} className="block text-primary-600 hover:underline">
                Điều khoản dịch vụ
              </Link>
            </div>
          </nav>

          <article className="space-y-10 rounded-3xl bg-white p-6 ring-1 ring-line md:p-10">
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="text-xl font-bold text-heading">{s.title}</h2>
                {s.paragraphs?.map((p) => (
                  <p key={p} className="mt-3 leading-relaxed text-body">
                    {p}
                  </p>
                ))}
                {s.bullets && (
                  <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-body">
                    {s.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
        </div>
      </div>
    </section>
  );
}
