import { useRef } from "react";
import { useHomeMotion } from "../../../hooks/home/useHomeMotion";
import type { HomeContent } from "../../../types/home/home.types";
import { FinaleSection, FooterSection } from "./ClosingSections";
import HeroSection from "./HeroSection";
import { IconSprite } from "./homeUi";
import PlatformSection from "./PlatformSection";
import { JourneySection, TestimonialsSection, ValuesSection } from "./StorySections";

// Ghép các phần của trang chủ
export default function HomeLanding({ content }: { content: HomeContent }) {
  const root = useRef<HTMLDivElement>(null);
  useHomeMotion(root);

  return (
    <div ref={root} className="home-lux">
      <IconSprite />
      <HeroSection content={content.hero} stats={content.stats} />
      {/* Ticker bảng hàng mẫu, chưa nối API dự án */}
      <div className="ticker" aria-label="Biến động bảng hàng (dữ liệu mẫu)">
        <div className="ticker-track" id="ticker"></div>
      </div>
      {/* Giới thiệu website: vì sao chọn Hubtech → công cụ → các bước mua → khách nói gì → để lại liên hệ */}
      <ValuesSection content={content.values} />
      <PlatformSection content={content.platform} />
      <JourneySection content={content.journey} />
      <TestimonialsSection content={content.testimonials} />
      <FinaleSection content={content.finale} />
      <FooterSection content={content.footer} />
    </div>
  );
}
