import { Link } from "react-router-dom";
import type { HomeFinale, HomeFooter } from "../../../types/home/home.types";
import { Icon, SmartLink, telHref } from "./homeUi";
import { selectIsAuthenticated, useAppSelector } from "../../../store";

// Lời kêu gọi cuối trang: khách chưa đăng nhập thấy nút Đăng ký, đã đăng nhập thì nút dẫn thẳng tới trang dự án
export function FinaleSection({ content }: { content: HomeFinale }) {
  const signedIn = useAppSelector(selectIsAuthenticated);
  return (
    <section className="sec finale" data-node="" aria-labelledby="fn-t">
      <div className="wrap">
        <div className="fn-card">
          <h2 className="fn-t" id="fn-t">{content.titleLead} <em>{content.titleAccent}</em></h2>
          <p className="fn-sub">{signedIn ? content.memberSubtitle : content.subtitle}</p>
          <div className="fn-act">
            <SmartLink className="btn btn-g" to={signedIn ? content.memberLink : content.registerLink}>
              {signedIn ? content.memberLabel : content.registerLabel} <Icon name="arrow" />
            </SmartLink>
          </div>
          <p className="fn-alt">hoặc gọi <a href={telHref(content.phone)}>{content.phone}</a> · <a href={`mailto:${content.email}`}>{content.email}</a></p>
        </div>
      </div>
    </section>
  );
}

export function FooterSection({ content }: { content: HomeFooter }) {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-top">
          <div className="ftr-brand">
            <Link className="logo" to="/"><span className="logo-mark" aria-hidden="true"></span>hubtech</Link>
            <p>{content.description}</p>
          </div>
          {content.columns.map((col, i) => (
            <nav className="ftr-col" aria-label={col.title} key={i}>
              <h3>{col.title}</h3>
              {col.links.map((item, k) => <SmartLink to={item.link} key={k}>{item.label}</SmartLink>)}
            </nav>
          ))}
          <div className="ftr-col">
            <h3>Liên hệ</h3>
            <a href={telHref(content.phone)}>{content.phone}</a>
            <a href={`mailto:${content.email}`}>{content.email}</a>
            <span>{content.address}</span>
          </div>
        </div>
        <p className="ftr-mark" aria-hidden="true"><span>hubtech</span></p>
        <div className="ftr-legal">
          <p>{content.legal}</p>
          <p><Link to="/chinh-sach-bao-mat">Bảo mật</Link> · <Link to="/dieu-khoan">Điều khoản</Link></p>
        </div>
      </div>
    </footer>
  );
}
