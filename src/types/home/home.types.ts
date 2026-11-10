// Khớp nội dung từng phần trong components/Home/landing/homeDefaults.json

export type HomeIconName = "shield" | "cube" | "users" | "bolt" | "file" | "book" | "chat" | "calendar" | "briefcase";

type SectionHead = { kicker: string; titleLead: string; titleAccent: string };

export type HomeHero = {
  pill: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  primaryLabel: string;
  primaryLink: string;
  secondaryLabel: string;
  secondaryLink: string;
  image: string; // trống → ảnh mặc định của trang
  imageAlt: string;
  tag: string;
  name: string;
  place: string;
  tourLabel: string;
};

export type HomeStats = { items: { value: string; suffix: string; label: string }[] };

export type HomeValues = SectionHead & { items: { icon: HomeIconName; title: string; desc: string }[] };

export type HomeLocation = SectionHead & {
  subtitle: string;
  image: string; // trống → ảnh mặc định của trang
  imageAlt: string;
  facts: { value: string; label: string }[];
};

export type HomeManifesto = { text: string };

export type HomeProjectsHead = SectionHead & { moreLabel: string; moreLink: string };

export type HomePlatform = SectionHead & {
  subtitle: string;
  sheetTitle: string;
  sheetDesc: string;
  sheetCta: string;
  sheetLink: string;
  tourTitle: string;
  tourDesc: string;
  tourCta: string;
  tourLink: string;
  image: string;
  imageAlt: string;
  holdTitle: string;
  holdDesc: string;
  holdCta: string;
  holdLink: string;
  guideTitle: string;
  guideDesc: string;
  guideCta: string;
  guideLink: string;
  moreTitle: string; // hàng liên kết sang các trang khác của Hubtech
  more: { icon: HomeIconName; title: string; desc: string; cta: string; link: string }[];
};

export type HomeJourney = SectionHead & {
  subtitle: string;
  buttonLabel: string;
  buttonLink: string;
  steps: { title: string; desc: string; time: string }[];
};

export type HomeTestimonials = SectionHead & {
  items: { quote: string; name: string; role: string; initials: string }[];
};

export type HomeFinale = {
  titleLead: string;
  titleAccent: string;
  subtitle: string; // khách chưa đăng nhập
  registerLabel: string;
  registerLink: string;
  memberSubtitle: string; // đã đăng nhập
  memberLabel: string;
  memberLink: string;
  phone: string;
  email: string;
};

export type HomeFooter = {
  description: string;
  buttonLabel: string;
  buttonLink: string;
  phone: string;
  email: string;
  address: string;
  legal: string;
  columns: { title: string; links: { label: string; link: string }[] }[];
};

export type HomeContent = {
  hero: HomeHero;
  stats: HomeStats;
  values: HomeValues;
  location: HomeLocation;
  manifesto: HomeManifesto;
  projects: HomeProjectsHead;
  platform: HomePlatform;
  journey: HomeJourney;
  testimonials: HomeTestimonials;
  finale: HomeFinale;
  footer: HomeFooter;
};
