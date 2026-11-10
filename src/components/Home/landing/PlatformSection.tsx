import type { HomePlatform } from "../../../types/home/home.types";
import { Icon, SmartLink } from "./homeUi";

// Lời mời bấm ở chân mỗi ô: chữ + mũi tên, cho khách biết bấm vào sẽ đi đâu
function Cta({ children }: { children: string }) {
  return (
    <span className="tile-cta">
      {children} <Icon name="arrow" />
    </span>
  );
}

/* Nền tảng: nhóm chính là công cụ mua nhà (bảng hàng, tour, giữ chỗ, pháp lý),
   bên dưới là hàng "Hơn cả mua nhà" dẫn sang cộng đồng, sự kiện, tuyển dụng, tạo CV. */
export default function PlatformSection({ content }: { content: HomePlatform }) {
  return (
    <section className="sec bento-sec" data-node="" id="nen-tang" aria-labelledby="bento-t">
      <div className="wrap">
        <div className="sec-head">
          <p className="kicker">{content.kicker}</p>
          <h2 className="h2" id="bento-t">{content.titleLead} <em>{content.titleAccent}</em></h2>
          <p className="sec-sub">{content.subtitle}</p>
        </div>

        <div className="bento">
          {/* Bảng hàng mẫu, chưa nối API dự án */}
          <SmartLink className="tile t-sheet" to={content.sheetLink}>
            <div className="tile-top"><h3>{content.sheetTitle}</h3><span className="live"><i></i>LIVE</span></div>
            <p className="tile-p">{content.sheetDesc}</p>
            <div className="sheet" id="sheet" aria-hidden="true"></div>
            <p className="sheet-sum"><span><i className="d d-free"></i>Còn <b id="c-free">0</b></span><span><i className="d d-hold"></i>Giữ <b id="c-hold">0</b></span><span><i className="d d-sold"></i>Bán <b id="c-sold">0</b></span><span className="dim" id="c-tick">vừa cập nhật</span></p>
          </SmartLink>
          <SmartLink className="tile t-tour" to={content.tourLink}>
            <img src={content.image} width="1200" height="600" alt={content.imageAlt} loading="lazy" />
            <span className="deg" aria-hidden="true">360°</span>
            <div className="tile-over">
              <h3>{content.tourTitle}</h3>
              <p>{content.tourDesc}</p>
              <Cta>{content.tourCta}</Cta>
            </div>
          </SmartLink>
          <SmartLink className="tile t-hold" to={content.holdLink}>
            <h3>{content.holdTitle}</h3>
            <p className="clock" id="clock">29:59</p>
            <p className="tile-p">{content.holdDesc}</p>
            <Cta>{content.holdCta}</Cta>
          </SmartLink>
          <SmartLink className="tile" to={content.guideLink}>
            <span className="mod-ic sm"><Icon name="book" /></span>
            <h3>{content.guideTitle}</h3>
            <p className="tile-p">{content.guideDesc}</p>
            <Cta>{content.guideCta}</Cta>
          </SmartLink>
        </div>

        <h3 className="eco-t">{content.moreTitle}</h3>
        <ul className="eco">
          {content.more.map((item) => (
            <li key={item.link}>
              <SmartLink className="eco-card" to={item.link}>
                <span className="mod-ic sm"><Icon name={item.icon} /></span>
                <span className="eco-txt">
                  <b>{item.title}</b>
                  <span>{item.desc}</span>
                </span>
                <span className="eco-cta">{item.cta} <Icon name="arrow" /></span>
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
