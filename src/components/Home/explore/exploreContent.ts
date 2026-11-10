import skyline from "../../../assets/images/home/ho-chi-minh-city-skyline.jpg";

// Chữ cho trang chủ nháp 3 (/home-3). Số liệu, đánh giá, footer lấy từ homeDefaults.json.
// Dải bảng hàng, thẻ dự án và câu hỏi thường gặp là dữ liệu mẫu, chưa nối API.

export const HERO3 = {
  titleLead: "Tìm ngôi nhà",
  titleAccent: "đúng với bạn",
  sub: "Khi bất động sản được số hóa, mỗi lựa chọn an cư trở nên minh bạch hơn, nhanh hơn và đáng tin hơn.",
  bg: skyline,
  kinds: ["Căn hộ", "Biệt thự", "Nhà phố"],
  areas: ["Tất cả khu vực", "Thủ Thiêm", "Trung tâm TP.HCM", "An Phú, Thủ Đức"],
  budgets: ["Mọi mức giá", "Dưới 5 tỷ", "5 đến 10 tỷ", "10 đến 20 tỷ", "Trên 20 tỷ"],
  search: "Tìm dự án",
};

// Dải bảng hàng chạy ngang (mẫu)
export const TICKS = [
  { unit: "Lumen A-16.03", state: "free", label: "Còn trống", price: "6,72 tỷ" },
  { unit: "Aurelia B-02", state: "hold", label: "Đang giữ", price: "32,0 tỷ" },
  { unit: "Metropole T-21.05", state: "free", label: "Mở bán", price: "8,80 tỷ" },
  { unit: "Lumen A-18.01", state: "sold", label: "Đã bán", price: "9,24 tỷ" },
  { unit: "Verde Garden V-07", state: "free", label: "Còn trống", price: "14,5 tỷ" },
  { unit: "Metropole PH-02", state: "hold", label: "Đang giữ", price: "29,0 tỷ" },
  { unit: "Aurelia D-07", state: "free", label: "Còn trống", price: "48,0 tỷ" },
  { unit: "Lumen A-20.06", state: "sold", label: "Đã bán", price: "9,98 tỷ" },
];

export const RAIL = { label: "Dự án", titleLead: "Dự án", titleAccent: "đang mở bán" };

export const BENTO = {
  label: "Nền tảng",
  titleLead: "Mọi công cụ mua nhà",
  titleAccent: "trong một nơi",
};

export const WALL = { label: "Khách hàng", titleLead: "Họ đã tìm được", titleAccent: "ngôi nhà của mình" };

export const FAQ = {
  label: "Hỏi đáp",
  titleLead: "Câu hỏi",
  titleAccent: "thường gặp",
  items: [
    { q: "Dùng Hubtech có mất phí không?", a: "Tạo tài khoản, xem bảng hàng, tham quan 360° và nhận tư vấn đều miễn phí. Bạn chỉ thanh toán theo hợp đồng mua bán với chủ đầu tư." },
    { q: "Giữ chỗ trực tuyến hoạt động thế nào?", a: "Bạn chọn căn trên bảng hàng và bấm giữ chỗ. Căn được giữ riêng trong 30 phút để chuyên viên gọi xác nhận và hướng dẫn bước tiếp theo." },
    { q: "Thông tin pháp lý dự án lấy ở đâu?", a: "Mỗi dự án có mục hồ sơ pháp lý riêng, gồm giấy phép, quy hoạch và tiến độ xây dựng được cập nhật định kỳ." },
    { q: "Bảng hàng có cập nhật theo thời gian thực không?", a: "Có. Trạng thái còn trống, đang giữ và đã bán thay đổi ngay khi có giao dịch, nên bạn luôn thấy đúng tình trạng từng căn." },
    { q: "Tôi có thể được tư vấn trực tiếp không?", a: "Có. Bạn gọi hotline hoặc hỏi trợ lý AI trên trang, chuyên viên sẽ liên hệ lại để tư vấn hoặc đặt lịch tham quan nhà mẫu." },
  ],
};

export const FINAL3 = { titleLead: "Sẵn sàng", titleAccent: "tìm nhà cùng Hubtech?" };
