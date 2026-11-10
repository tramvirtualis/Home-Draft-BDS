import thuThiemView from "../../../assets/images/home/vista-de-ciudad-ho-chi-minh-desde.jpg";
import type { HomeJourney, HomeLocation, HomeManifesto, HomeTestimonials, HomeValues } from "../../../types/home/home.types";
import { Icon, SmartLink } from "./homeUi";

export function ValuesSection({ content }: { content: HomeValues }) {
  return (
    <section className="sec" id="gioi-thieu" data-node="" aria-labelledby="why-t">
      <div className="wrap">
        <div className="sec-head">
          <p className="kicker">{content.kicker}</p>
          <h2 className="h2" id="why-t">{content.titleLead} <em>{content.titleAccent}</em></h2>
        </div>
        <div className="mods">
          {content.items.map((item, i) => (
            <article className="mod" key={i}>
              <span className="mod-ic"><Icon name={item.icon} /></span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LocationSection({ content }: { content: HomeLocation }) {
  return (
    <section className="opening" data-node="" aria-labelledby="op-t">
      <div className="opening-stage">
        <img src={content.image || thuThiemView} width="1920" height="1095" alt={content.imageAlt} loading="lazy" />
        <div className="opening-cap">
          <p className="kicker kicker-l">{content.kicker}</p>
          <h2 className="h2" id="op-t">{content.titleLead} <em>{content.titleAccent}</em></h2>
          <p>{content.subtitle}</p>
          <div className="op-facts">
            {content.facts.map((fact, i) => (
              <div key={i}><b>{fact.value}</b><span>{fact.label}</span></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ManifestoSection({ content }: { content: HomeManifesto }) {
  return (
    <section className="sec manifesto" data-node="" aria-label="Tuyên ngôn">
      <div className="wrap">
        <p className="mf" data-fill="">{content.text}</p>
      </div>
    </section>
  );
}

export function JourneySection({ content }: { content: HomeJourney }) {
  return (
    <section className="sec journey" data-node="" id="hanh-trinh" aria-labelledby="jr-t">
      <div className="wrap jr-in">
        <div className="sec-head">
          <p className="kicker">{content.kicker}</p>
          <h2 className="h2" id="jr-t">{content.titleLead} <em>{content.titleAccent}</em></h2>
          <p className="jr-lead">{content.subtitle}</p>
          <SmartLink className="btn btn-g" to={content.buttonLink}>{content.buttonLabel} <Icon name="arrow" /></SmartLink>
        </div>
        <ol className="pipe" id="pipe">
          {content.steps.map((step, i) => (
            <li key={i}>
              <span className="st" aria-hidden="true"></span>
              <div><h3>{step.title}</h3><p>{step.desc}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function TestimonialsSection({ content }: { content: HomeTestimonials }) {
  return (
    <section className="sec voices" data-node="" aria-labelledby="vc-t">
      <div className="wrap">
        <div className="sec-head">
          <p className="kicker">{content.kicker}</p>
          <h2 className="h2" id="vc-t">{content.titleLead} <em>{content.titleAccent}</em></h2>
        </div>
        <div className="vgrid">
          {content.items.map((item, i) => (
            <figure className={i % 3 === 1 ? "vcard vcard-hi" : "vcard"} key={i}>
              <span className="stars" aria-label="5 sao">★★★★★</span>
              <blockquote>{item.quote}</blockquote>
              <figcaption><i className="av">{item.initials}</i><span><b>{item.name}</b>{item.role}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
