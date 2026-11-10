// Chữ cho trang chủ nháp 4 (/home-4), theo bản nội dung trang chủ Hubtech. Footer vẫn lấy từ homeDefaults.json.

export const HERO4 = {
  kicker: "HUBTECH | Nền tảng bất động sản số",
  titleLine1: "Bất động sản thông minh.",
  titleLine2: "Lựa chọn trong tầm tay.",
  desc: "Từ tìm kiếm dự án, cập nhật bảng hàng đến trải nghiệm không gian sống và kết nối tư vấn – mọi bước trong hành trình sở hữu bất động sản trở nên đơn giản, trực quan và thuận tiện hơn.",
  cta: { label: "Khám phá dự án", to: "/projects" },
  stats: [
    { value: "20+", label: "Dự án đang phân phối" },
    { value: "20.000+", label: "Căn hộ đã bàn giao" },
    { value: "98%", label: "Khách hàng hài lòng" },
    { value: "16+", label: "Năm kinh nghiệm" },
  ],
};

export const WHY4 = {
  label: "Vì sao chọn Hubtech?",
  title: "Bốn giá trị tạo nên sự khác biệt",
  desc: "Công nghệ không chỉ giúp tìm kiếm bất động sản dễ dàng hơn, mà còn mang đến trải nghiệm minh bạch, chủ động và đáng tin cậy trong từng quyết định.",
  items: [
    { title: "Minh bạch", desc: "Thông tin dự án, bảng hàng, chính sách và pháp lý được trình bày rõ ràng, dễ tra cứu, giúp khách hàng an tâm tìm hiểu và lựa chọn." },
    { title: "Trực quan", desc: "Khám phá dự án qua hình ảnh, mặt bằng và trải nghiệm 360°, hình dung không gian sống ngay trên màn hình." },
    { title: "Kết nối", desc: "Kết nối khách hàng với đội ngũ tư vấn và cộng đồng bất động sản, chia sẻ thông tin và kinh nghiệm hữu ích." },
    { title: "Thông minh", desc: "Ứng dụng công nghệ số để tối ưu quá trình tìm kiếm, lựa chọn và tiếp cận sản phẩm bất động sản." },
  ],
};

// Bảng hàng, tour 360°, giữ chỗ nằm trong từng dự án nên tạm dẫn về danh sách dự án
export const TOOLS4 = {
  label: "Nền tảng công nghệ",
  title: "Mọi công cụ mua nhà, trên một màn hình",
  desc: "Không còn mất thời gian tìm kiếm thông tin từ nhiều nguồn. HUBTECH giúp bạn chủ động khám phá, so sánh và lựa chọn bất động sản phù hợp với nhu cầu.",
  items: [
    { title: "Bảng hàng trực tuyến", sub: "Chủ động lựa chọn – Cập nhật thuận tiện", desc: "Cập nhật tình trạng sản phẩm, diện tích và thông tin căn hộ trên giao diện trực quan. Dễ dàng tìm kiếm và lựa chọn căn phù hợp mà không phải chờ đợi thông tin qua nhiều kênh.", cta: "Xem bảng hàng", to: "/projects" },
    { title: "Tour 360°", sub: "Khám phá không gian sống ngay tại nhà", desc: "Trải nghiệm căn hộ trực tuyến, tìm hiểu bố trí không gian, hướng nhìn và thiết kế ngay trên thiết bị của bạn. Tiết kiệm thời gian nhưng vẫn có góc nhìn trực quan trước khi tham quan thực tế.", cta: "Tham quan ngay", to: "/projects" },
    { title: "Giữ chỗ trực tuyến", sub: "Nhanh chóng – Chủ động – Thuận tiện", desc: "Lựa chọn căn hộ yêu thích và gửi yêu cầu giữ chỗ trực tuyến. Chủ động theo dõi thông tin và kết nối chuyên viên để được hướng dẫn các bước tiếp theo.", cta: "Giữ chỗ ngay", to: "/projects" },
    { title: "Kiến thức & pháp lý", sub: "Hiểu rõ trước khi quyết định", desc: "Tổng hợp kiến thức mua nhà, thông tin pháp lý, chính sách tài chính và hướng dẫn thủ tục, giúp khách hàng chuẩn bị tốt hơn cho hành trình sở hữu bất động sản.", cta: "Khám phá cẩm nang", to: "/knowledge" },
  ],
};

export const ECO4 = {
  label: "Hệ sinh thái Hubtech",
  title: "Không chỉ mua nhà. Còn hơn thế nữa.",
  desc: "HUBTECH hướng tới xây dựng một hệ sinh thái kết nối thông tin, cơ hội và con người trong lĩnh vực bất động sản.",
  items: [
    { title: "Cộng đồng bất động sản", desc: "Nơi kết nối, trao đổi kinh nghiệm và chia sẻ góc nhìn thực tế từ người mua, nhà đầu tư và chuyên gia.", cta: "Tham gia cộng đồng", to: "/social" },
    { title: "Sự kiện & mở bán", desc: "Cập nhật lịch mở bán, tham quan nhà mẫu, hội thảo và các sự kiện bất động sản đáng quan tâm.", cta: "Xem sự kiện", to: "/events" },
    { title: "Cơ hội nghề nghiệp", desc: "Khám phá cơ hội phát triển sự nghiệp trong ngành bất động sản và kết nối với các đơn vị tuyển dụng.", cta: "Khám phá việc làm", to: "/jobs" },
    { title: "Tạo CV trực tuyến", desc: "Xây dựng hồ sơ ứng tuyển chuyên nghiệp, dễ dàng trình bày năng lực và sẵn sàng nắm bắt cơ hội nghề nghiệp.", cta: "Tạo CV ngay", to: "/jobs/create-cv" },
  ],
};

export const FINAL4 = {
  title: "Ngôi nhà phù hợp bắt đầu từ",
  accent: "một lựa chọn thông minh.",
  desc: "Khám phá những dự án tiềm năng, tìm hiểu sản phẩm phù hợp và bắt đầu hành trình an cư cùng HUBTECH ngay hôm nay.",
  cta: { label: "Khám phá dự án ngay", to: "/projects" },
};
