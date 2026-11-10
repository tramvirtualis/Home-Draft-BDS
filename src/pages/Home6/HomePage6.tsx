import { useSeo } from "../../hooks/useSeo";
import HavenHeader from "../../components/Home/HavenHeader";
import Chatbot from "../../components/Home/Chatbot";
import BrightLanding from "../../components/Home/bright/BrightLanding";
import homeDefaults from "../../components/Home/landing/homeDefaults.json";
import type { HomeContent } from "../../types/home/home.types";
import "../../components/Home/home.css";

const CONTENT = homeDefaults as HomeContent;

/* Trang chủ nháp 6 (/home-6): xen kẽ dải xanh đậm và trắng, theo ảnh mẫu thiết kế. */
export default function HomePage6() {
  useSeo({
    title: "Hubtech",
    description: "Nền tảng bất động sản số: bảng hàng trực tuyến, tour 360°, giữ chỗ trực tuyến, cẩm nang pháp lý, cộng đồng và việc làm.",
    canonical: `${window.location.origin}/home-6`,
  });

  return (
    <>
      <HavenHeader home="/" font='"Be Vietnam Pro", system-ui, sans-serif' dark wide />
      <BrightLanding content={CONTENT} />
      <Chatbot variant="urban" />
    </>
  );
}
