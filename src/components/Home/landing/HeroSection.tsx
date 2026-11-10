import type { HomeHero, HomeStats } from "../../../types/home/home.types";
import { Icon, SmartLink } from "./homeUi";

export default function HeroSection({ content, stats }: { content: HomeHero; stats?: HomeStats }) {
  return (
    <section className="hero" aria-labelledby="hero-t" data-node="">
      <canvas className="dust" id="dust" aria-hidden="true"></canvas>
      <div className="wrap hero-in">
        <p className="pill"><span className="pulse"></span>{content.pill}</p>
        <h1 className="hero-t" id="hero-t"><span className="sweep">{content.titleLine1}</span><br /><em>{content.titleLine2}</em></h1>
        <p className="hero-sub">{content.subtitle}</p>
        <div className="hero-act">
          <SmartLink className="btn btn-g" to={content.primaryLink}>{content.primaryLabel} <Icon name="arrow" /></SmartLink>
        </div>
      </div>

      {stats && (
        <div className="wrap">
          <dl className="stats">
            {stats.items.map((item, i) => (
              <div key={i}><dt>{item.label}</dt><dd><b data-roll={item.value}>{item.value}</b>{item.suffix}</dd></div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
