import skyline from "../../../assets/images/home/ho-chi-minh-city-skyline.jpg";
import skylineNight from "../../../assets/images/home/ho-chi-minh-city-skyline-at-night.jpg";

// Chữ bổ sung cho trang chủ (số liệu, giá trị, cảm nhận, liên hệ lấy từ homeDefaults.json).
// Thẻ dự án là dữ liệu mẫu, chưa nối API.

export const HERO = {
  lead: "Một màn hình cho cả hành trình mua nhà, từ lần xem đầu tiên đến lúc nhận chìa khóa.",
  image: skylineNight,
  imageAlt: "Trung tâm TP.HCM về đêm nhìn từ bờ sông",
};

export const ABOUT = {
  label: "Về Hubtech",
  titleLead: "Cùng bạn viết nên",
  titleAccent: "câu chuyện mua nhà",
  text: "Hubtech gom bảng hàng, hồ sơ pháp lý, tiến độ và đội ngũ chuyên viên về một nơi. Bạn chỉ cần cho biết khu vực và ngân sách, phần còn lại chúng tôi đồng hành.",
  quote: "Mua nhà không nên là chuyện chờ bảng giá.",
  image: skyline,
};

export const PROJECT_HEAD = {
  label: "Dự án",
  titleLead: "Từ bản vẽ",
  titleAccent: "đến ngôi nhà",
  listTitle: "Dự án nổi bật",
  filters: ["Tất cả", "Căn hộ", "Biệt thự", "Nhà phố"],
};

export const PROJECTS = [
  { name: "Lumen Riverside", kind: "Căn hộ", place: "Thủ Thiêm", price: "6,7 tỷ", badge: "Đang mở bán",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&h=1000&q=80" },
  { name: "Aurelia", kind: "Biệt thự", place: "Đại lộ Vòng Cung", price: "31 tỷ", badge: "Sắp mở bán",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&h=1000&q=80" },
  { name: "Metropole", kind: "Căn hộ", place: "Trung tâm TP.HCM", price: "3,1 tỷ", badge: "Đang mở bán", image: skylineNight },
  { name: "Verde Garden", kind: "Nhà phố", place: "An Phú, Thủ Đức", price: "14,5 tỷ", badge: "Đang mở bán",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&h=1000&q=80" },
];

export const VALUES_HEAD = {
  label: "Giá trị",
  titleLead: "Minh bạch là",
  titleAccent: "nền tảng niềm tin",
  text: "Bốn giá trị Hubtech giữ trong mọi dự án, từ lúc bạn xem căn đầu tiên đến ngày nhận chìa khóa.",
};

// Chữ trong hình minh họa của 4 thẻ giá trị
export const VALUE_VIZ = {
  checks: ["Pháp lý dự án", "Giá niêm yết", "Tiến độ xây dựng"],
  verified: "Đã kiểm chứng",
  people: ["MA", "QB", "TH"],
  roles: "Người mua · Cư dân · Môi giới",
  ask: "Căn A-16.03 còn trống không?",
  timer: "Giữ chỗ 29:59",
};
