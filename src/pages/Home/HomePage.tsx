import { useSeo } from "../../hooks/useSeo";
import HavenHeader from "../../components/Home/HavenHeader";
import Chatbot from "../../components/Home/Chatbot";
import NinjaLanding from "../../components/Home/ninja/NinjaLanding";
import homeDefaults from "../../components/Home/landing/homeDefaults.json";
import type { HomeContent } from "../../types/home/home.types";
import "../../components/Home/home.css";

const CONTENT = homeDefaults as HomeContent;

/* Trang chủ (/): bố cục kiểu RealtyNinja (components/Home/ninja).
   Chữ, ảnh, số liệu lấy từ homeDefaults.json. Bố cục cũ vẫn ở components/Home/landing/HomeLanding.
   Bảng hàng và đồng hồ giữ chỗ là dữ liệu mẫu, chưa nối API dự án. */
export default function HomePage() {
  useSeo({
    title: "Hubtech",
    description: "Nền tảng bất động sản số: dự án, quỹ căn, sự kiện, tin tức và cơ hội nghề nghiệp.",
    canonical: `${window.location.origin}/`,
  });

  return (
    <>
      <HavenHeader home="/" font='"Be Vietnam Pro", system-ui, sans-serif' dark wide />
      <NinjaLanding content={CONTENT} />
      <Chatbot variant="urban" />
    </>
  );
}
