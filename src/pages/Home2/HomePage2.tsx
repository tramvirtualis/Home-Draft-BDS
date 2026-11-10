import { useSeo } from "../../hooks/useSeo";
import HavenHeader from "../../components/Home/HavenHeader";
import Chatbot from "../../components/Home/Chatbot";
import JourneyLanding from "../../components/Home/journey/JourneyLanding";
import homeDefaults from "../../components/Home/landing/homeDefaults.json";
import type { HomeContent } from "../../types/home/home.types";
import "../../components/Home/home.css";

const CONTENT = homeDefaults as HomeContent;

/* Trang chủ nháp 2 (/home-2): bố cục hành trình 5 chương, để so sánh với trang chủ hiện tại (/). */
export default function HomePage2() {
  useSeo({
    title: "Hubtech",
    description: "Nền tảng bất động sản số: dự án, quỹ căn, sự kiện, tin tức và cơ hội nghề nghiệp.",
    canonical: `${window.location.origin}/home-2`,
  });

  return (
    <>
      <HavenHeader home="/" font='"Be Vietnam Pro", system-ui, sans-serif' dark wide />
      <JourneyLanding content={CONTENT} />
      <Chatbot variant="urban" />
    </>
  );
}
