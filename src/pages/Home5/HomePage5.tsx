import { useSeo } from "../../hooks/useSeo";
import HavenHeader from "../../components/Home/HavenHeader";
import Chatbot from "../../components/Home/Chatbot";
import Home5Landing from "../../components/Home/journey/Home5Landing";
import homeDefaults from "../../components/Home/landing/homeDefaults.json";
import type { HomeContent } from "../../types/home/home.types";
import "../../components/Home/home.css";

const CONTENT = homeDefaults as HomeContent;

/* Trang chủ nháp 5 (/home-5): bố cục giống /home-2, nội dung theo bản trang chủ Hubtech. */
export default function HomePage5() {
  useSeo({
    title: "Hubtech",
    description: "Nền tảng bất động sản số: bảng hàng trực tuyến, tour 360°, giữ chỗ trực tuyến, cẩm nang pháp lý, cộng đồng và việc làm.",
    canonical: `${window.location.origin}/home-5`,
  });

  return (
    <>
      <HavenHeader home="/" font='"Be Vietnam Pro", system-ui, sans-serif' dark wide />
      <Home5Landing content={CONTENT} />
      <Chatbot variant="urban" />
    </>
  );
}
