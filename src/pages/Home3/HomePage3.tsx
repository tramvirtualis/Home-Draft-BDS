import { useSeo } from "../../hooks/useSeo";
import HavenHeader from "../../components/Home/HavenHeader";
import Chatbot from "../../components/Home/Chatbot";
import ExploreLanding from "../../components/Home/explore/ExploreLanding";
import homeDefaults from "../../components/Home/landing/homeDefaults.json";
import type { HomeContent } from "../../types/home/home.types";
import "../../components/Home/home.css";

const CONTENT = homeDefaults as HomeContent;

/* Trang chủ nháp 3 (/home-3): bố cục kiểu "ứng dụng tìm nhà", để so sánh với / và /home-2. */
export default function HomePage3() {
  useSeo({
    title: "Hubtech",
    description: "Nền tảng bất động sản số: dự án, quỹ căn, sự kiện, tin tức và cơ hội nghề nghiệp.",
    canonical: `${window.location.origin}/home-3`,
  });

  return (
    <>
      <HavenHeader home="/" font='"Be Vietnam Pro", system-ui, sans-serif' dark wide />
      <ExploreLanding content={CONTENT} />
      <Chatbot variant="urban" />
    </>
  );
}
