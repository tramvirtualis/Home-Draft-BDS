import thuThiem from "../../../assets/images/home/thu-thiem-04-2020.jpg";

// Chữ cho trang chủ nháp 2 (/home-2). Các bước, số liệu, cảm nhận, footer lấy từ homeDefaults.json.
// Cả trang theo một căn mẫu xuyên suốt 5 chương để nội dung nối với nhau (dữ liệu mẫu, chưa nối API).

export const UNIT = { project: "Lumen Riverside", code: "A-16.03", type: "2 phòng ngủ · 74 m²", price: "6,72 tỷ" };

// Ô bảng hàng mẫu: f còn trống, h đang giữ, s đã bán
export const SHEET = ["f", "s", "f", "h", "s", "f", "s", "f", "f", "h", "s", "s", "f", "s", "f", "h", "f", "s", "f", "f", "s", "h", "f", "s"];

export const HERO2 = {
  motto: "Khi bất động sản được số hóa, mỗi lựa chọn an cư trở nên minh bạch hơn, nhanh hơn và đáng tin hơn.",
  start: "Bắt đầu hành trình",
};

// Chữ riêng cho từng chương (khớp thứ tự journey.steps trong homeDefaults.json)
export const CHAPTERS = [
  { cta: "Xem dự án", link: "/projects" },
  { cta: "Tham quan 360°", link: "/projects", room: "Phòng khách · Hướng Đông Nam" },
  { cta: "Mở bảng hàng", link: "/projects" },
  { cta: "Giữ chỗ ngay", link: "/projects", note: "Chuyên viên gọi xác nhận trong 15 phút" },
  { cta: "Đọc cẩm nang", link: "/knowledge", steps: ["Ký hợp đồng mua bán", "Theo dõi tiến độ qua ảnh", "Nhận bàn giao căn hộ"] },
];

export const AFTER = {
  label: "Sau khi nhận nhà",
  titleLead: "Hành trình",
  titleAccent: "chưa dừng ở đó",
  text: "Một tài khoản Hubtech theo bạn cả sau ngày nhận nhà: cộng đồng cư dân, sự kiện, việc làm trong ngành.",
};

export const FINAL = {
  titleLead: "Ngôi nhà của bạn",
  titleAccent: "bắt đầu từ đây",
  image: thuThiem,
};
