import { useSeo } from "../../hooks/useSeo";
import HavenHeader from "../../components/Home/HavenHeader";
import Chatbot from "../../components/Home/Chatbot";
import EditorialLanding from "../../components/Home/editorial/EditorialLanding";
import homeDefaults from "../../components/Home/landing/homeDefaults.json";
import type { HomeContent } from "../../types/home/home.types";
import "../../components/Home/home.css";

const CONTENT = homeDefaults as HomeContent;

/* Trang chủ nháp 7 (/home-7): cùng thứ tự nội dung với /home-6, phong cách tạp chí nghệ thuật, màu theo /home-5. */
export default function HomePage7() {
  useSeo({
    title: "Hubtech",
    description: "Nền tảng bất động sản số: bảng hàng trực tuyến, tour 360°, giữ chỗ trực tuyến, cẩm nang pháp lý, cộng đồng và việc làm.",
    canonical: `${window.location.origin}/home-7`,
  });

  return (
    <>
      <HavenHeader home="/" font='"Be Vietnam Pro", system-ui, sans-serif' dark wide />
      <EditorialLanding content={CONTENT} />
      <Chatbot variant="urban" />
    </>
  );
}
