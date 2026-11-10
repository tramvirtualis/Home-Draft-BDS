import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import skylineNight from "../../../assets/images/home/ho-chi-minh-city-skyline-at-night.jpg";
import type { HomeProjectsHead } from "../../../types/home/home.types";
import { Icon, SmartLink } from "./homeUi";

// Thẻ dự án mẫu, chưa nối API dự án
const PROJECTS = [
  { name: "Lumen", place: "Thủ Thiêm, TP.HCM", type: "Căn hộ hạng sang", price: "6,7 tỷ", free: "21 / 54", sold: 0.61, badge: "Đang mở bán", gold: false, alt: "Tòa tháp kính LUMEN", width: 1400, height: 1000,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&h=1000&q=80" },
  { name: "Aurelia", place: "Đại lộ Vòng Cung", type: "Biệt thự thấp tầng", price: "31 tỷ", free: "12 / 18", sold: 0.33, badge: "Sắp mở bán", gold: true, alt: "Biệt thự có hồ bơi AURELIA", width: 1400, height: 1000,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&h=1000&q=80" },
  { name: "Metropole", place: "Trung tâm TP.HCM", type: "Tòa tháp hỗn hợp", price: "3,1 tỷ", free: "33 / 120", sold: 0.73, badge: "Đang mở bán", gold: false, alt: "Trung tâm TP.HCM về đêm, nơi có METROPOLE", width: 1366, height: 720,
    image: skylineNight },
];

export default function ProjectsSection({ content }: { content: HomeProjectsHead }) {
  return (
    <section className="proj" data-node="" id="du-an" aria-labelledby="proj-t">
      <div className="proj-pin">
        <div className="wrap proj-head">
          <div>
            <p className="kicker">{content.kicker}</p>
            <h2 className="h2" id="proj-t">{content.titleLead} <em>{content.titleAccent}</em></h2>
          </div>
          <SmartLink className="more" to={content.moreLink}>{content.moreLabel} <Icon name="arrow" /></SmartLink>
        </div>
        <div className="proj-track" id="proj-track">
          {PROJECTS.map((p) => (
            <article className="pcard" key={p.name}>
              <Link className="pcard-img" to="/projects">
                <img src={p.image} width={p.width} height={p.height} alt={p.alt} loading="lazy" />
                <span className={p.gold ? "badge badge-y" : "badge"}>{p.badge}</span>
              </Link>
              <div className="pcard-body">
                <p className="pcard-loc"><Icon name="pin" />{p.place}</p>
                <h3>{p.name}</h3>
                <dl className="spec">
                  <div><dt>Loại hình</dt><dd>{p.type}</dd></div>
                  <div><dt>Giá từ</dt><dd>{p.price}</dd></div>
                  <div><dt>Căn trống</dt><dd className="g">{p.free}</dd></div>
                </dl>
                <div className="meter"><span style={{ "--v": p.sold } as CSSProperties}></span></div>
                <Link className="pcard-link" to="/projects">Xem chi tiết <Icon name="arrow" /></Link>
              </div>
            </article>
          ))}
        </div>
        <div className="wrap"><div className="proj-progress" aria-hidden="true"><span id="proj-bar"></span></div></div>
      </div>
    </section>
  );
}
