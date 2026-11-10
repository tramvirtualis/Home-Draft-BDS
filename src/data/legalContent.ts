import { CONTACT } from "./contactInfo";
// Nội dung 2 trang pháp lý: Chính sách bảo mật (/chinh-sach-bao-mat) và Điều khoản dịch vụ (/dieu-khoan)
// Sửa nội dung ở đây, giao diện nằm ở components/Legal/LegalDocument.tsx

export interface LegalSection {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDoc {
  title: string;
  summary: string;
  updatedAt: string;
  sections: LegalSection[];
}

export const LEGAL_SITE = {
  name: "Đất Việt Group",
  domain: "datvietgroup.io.vn",
  email: CONTACT.email,
};

export const PRIVACY_POLICY: LegalDoc = {
  title: "Chính sách bảo mật",
  summary: `Chính sách này giải thích ${LEGAL_SITE.name} thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn như thế nào khi bạn sử dụng website ${LEGAL_SITE.domain}.`,
  updatedAt: "03/11/2026",
  sections: [
    {
      id: "thong-tin-thu-thap",
      title: "1. Thông tin chúng tôi thu thập",
      paragraphs: ["Chúng tôi chỉ thu thập những thông tin cần thiết để cung cấp dịch vụ, bao gồm:"],
      bullets: [
        "Thông tin tài khoản: họ tên, email, số điện thoại, mật khẩu (được mã hoá một chiều, chúng tôi không đọc được).",
        "Thông tin từ Google khi bạn chọn đăng nhập bằng Google: họ tên, địa chỉ email và ảnh đại diện.",
        "Thông tin bạn chủ động cung cấp: hồ sơ CV, đơn ứng tuyển, lịch đặt xem dự án, bài đăng, bình luận, tin nhắn với trợ lý AI.",
        "Thông tin doanh nghiệp (với tài khoản nhà tuyển dụng): tên công ty, mã số thuế, địa chỉ, thông tin liên hệ.",
        "Thông tin kỹ thuật: địa chỉ IP, loại trình duyệt, thiết bị, thời gian truy cập và các trang đã xem.",
      ],
    },
    {
      id: "du-lieu-google",
      title: "2. Dữ liệu từ tài khoản Google",
      paragraphs: [
        "Khi bạn đăng nhập bằng Google, chúng tôi chỉ yêu cầu quyền truy cập thông tin hồ sơ cơ bản (openid, email, profile). Chúng tôi không truy cập Gmail, Google Drive, danh bạ hay bất kỳ dữ liệu nào khác trong tài khoản Google của bạn.",
        "Dữ liệu nhận từ Google chỉ được dùng để tạo và xác thực tài khoản của bạn trên website, hiển thị tên và ảnh đại diện. Chúng tôi không bán, không chia sẻ dữ liệu này cho bên thứ ba vì mục đích quảng cáo, và tuân thủ Chính sách dữ liệu người dùng của Google API Services, bao gồm các yêu cầu về Sử dụng giới hạn (Limited Use).",
        "Bạn có thể thu hồi quyền truy cập bất kỳ lúc nào tại trang quản lý tài khoản Google (myaccount.google.com/permissions).",
      ],
    },
    {
      id: "muc-dich-su-dung",
      title: "3. Mục đích sử dụng thông tin",
      bullets: [
        "Tạo, xác thực và quản lý tài khoản của bạn.",
        "Cung cấp các tính năng: xem dự án, đặt lịch, lưu yêu thích, ứng tuyển việc làm, tạo CV, mạng xã hội nội bộ, trợ lý AI.",
        "Gửi thông báo liên quan đến tài khoản, lịch hẹn, đơn ứng tuyển và hoạt động của bạn.",
        "Kiểm duyệt nội dung, phát hiện và ngăn chặn gian lận, spam, vi phạm.",
        "Phân tích thống kê ẩn danh để cải thiện chất lượng website.",
      ],
    },
    {
      id: "chia-se",
      title: "4. Chia sẻ thông tin",
      paragraphs: ["Chúng tôi không bán thông tin cá nhân của bạn. Thông tin chỉ được chia sẻ trong các trường hợp:"],
      bullets: [
        "Với nhà tuyển dụng khi bạn chủ động ứng tuyển vào tin tuyển dụng của họ (CV và thông tin liên hệ trong đơn).",
        "Với nhà cung cấp dịch vụ hạ tầng (máy chủ, lưu trữ tệp, gửi email, thông báo đẩy) chỉ trong phạm vi cần thiết để vận hành dịch vụ.",
        "Khi có yêu cầu hợp pháp từ cơ quan nhà nước có thẩm quyền theo quy định pháp luật Việt Nam.",
      ],
    },
    {
      id: "cookie",
      title: "5. Cookie và lưu trữ trên trình duyệt",
      paragraphs: [
        "Website sử dụng cookie và bộ nhớ trình duyệt (localStorage) để duy trì phiên đăng nhập, ghi nhớ tuỳ chọn và đo lường lượt truy cập. Bạn có thể xoá hoặc chặn cookie trong cài đặt trình duyệt, tuy nhiên một số tính năng như đăng nhập có thể không hoạt động.",
      ],
    },
    {
      id: "luu-tru-bao-mat",
      title: "6. Lưu trữ và bảo mật",
      paragraphs: [
        "Dữ liệu được truyền qua kết nối mã hoá HTTPS và lưu trữ trên máy chủ có kiểm soát truy cập. Mật khẩu được băm, tệp đính kèm được truy cập qua đường dẫn có thời hạn.",
        "Chúng tôi lưu thông tin trong thời gian tài khoản còn hoạt động hoặc theo thời hạn pháp luật yêu cầu. Khi bạn xoá tài khoản, dữ liệu cá nhân sẽ được xoá hoặc ẩn danh hoá, trừ những dữ liệu bắt buộc phải lưu giữ theo luật.",
      ],
    },
    {
      id: "quyen-cua-ban",
      title: "7. Quyền của bạn",
      paragraphs: ["Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, bạn có quyền:"],
      bullets: [
        "Xem, chỉnh sửa thông tin cá nhân trong trang Tài khoản.",
        "Yêu cầu cung cấp bản sao, hạn chế xử lý hoặc xoá dữ liệu cá nhân.",
        "Rút lại sự đồng ý, hủy liên kết đăng nhập Google.",
        "Khiếu nại nếu cho rằng dữ liệu của bạn bị xử lý sai quy định.",
      ],
    },
    {
      id: "tre-em",
      title: "8. Người dùng dưới 16 tuổi",
      paragraphs: [
        "Dịch vụ không hướng đến trẻ em dưới 16 tuổi. Nếu phát hiện thông tin của trẻ em được cung cấp khi chưa có sự đồng ý của cha mẹ hoặc người giám hộ, chúng tôi sẽ xoá thông tin đó.",
      ],
    },
    {
      id: "thay-doi",
      title: "9. Thay đổi chính sách",
      paragraphs: [
        "Chính sách có thể được cập nhật theo thời gian. Ngày cập nhật gần nhất được ghi ở đầu trang. Với thay đổi quan trọng, chúng tôi sẽ thông báo trên website hoặc qua email.",
      ],
    },
    {
      id: "lien-he",
      title: "10. Liên hệ",
      paragraphs: [
        `Mọi câu hỏi hoặc yêu cầu liên quan đến dữ liệu cá nhân, vui lòng gửi về email ${LEGAL_SITE.email}. Chúng tôi sẽ phản hồi trong vòng 7 ngày làm việc.`,
      ],
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDoc = {
  title: "Điều khoản dịch vụ",
  summary: `Bằng việc truy cập hoặc sử dụng website ${LEGAL_SITE.domain}, bạn đồng ý tuân thủ các điều khoản dưới đây. Vui lòng đọc kỹ trước khi sử dụng.`,
  updatedAt: "03/11/2026",
  sections: [
    {
      id: "gioi-thieu",
      title: "1. Giới thiệu dịch vụ",
      paragraphs: [
        `${LEGAL_SITE.name} là nền tảng bất động sản số cung cấp thông tin dự án, quỹ căn, đặt lịch tham quan, tin tức, thư viện kiến thức, sự kiện, tuyển dụng, công cụ tạo CV, mạng xã hội cộng đồng và trợ lý AI.`,
      ],
    },
    {
      id: "tai-khoan",
      title: "2. Tài khoản người dùng",
      bullets: [
        "Bạn có thể đăng ký bằng email hoặc đăng nhập bằng tài khoản Google.",
        "Bạn phải cung cấp thông tin chính xác và chịu trách nhiệm bảo mật mật khẩu cũng như mọi hoạt động diễn ra dưới tài khoản của mình.",
        "Mỗi người chỉ nên sử dụng một tài khoản. Không được mua bán, cho mượn hoặc chiếm đoạt tài khoản của người khác.",
        "Thông báo ngay cho chúng tôi nếu phát hiện tài khoản bị truy cập trái phép.",
      ],
    },
    {
      id: "noi-dung-nguoi-dung",
      title: "3. Nội dung do người dùng đăng tải",
      paragraphs: [
        "Bạn giữ quyền sở hữu với bài đăng, bình luận, hình ảnh, CV và nội dung khác mà bạn đăng tải, đồng thời cho phép chúng tôi lưu trữ và hiển thị nội dung đó trong phạm vi vận hành dịch vụ.",
        "Bạn cam kết không đăng tải nội dung:",
      ],
      bullets: [
        "Vi phạm pháp luật Việt Nam, thuần phong mỹ tục, xúc phạm danh dự người khác.",
        "Sai sự thật, lừa đảo, quảng cáo bất động sản không có thật hoặc không đủ pháp lý.",
        "Xâm phạm quyền sở hữu trí tuệ, thông tin cá nhân của người khác.",
        "Spam, mã độc, đường dẫn độc hại.",
      ],
    },
    {
      id: "kiem-duyet",
      title: "4. Kiểm duyệt và xử lý vi phạm",
      paragraphs: [
        "Chúng tôi có quyền (kể cả bằng công cụ tự động/AI) xem xét, ẩn hoặc xoá nội dung vi phạm, đồng thời tạm khoá hoặc khoá vĩnh viễn tài khoản vi phạm mà không cần báo trước. Người dùng có thể báo cáo nội dung vi phạm bằng chức năng báo cáo trên bài đăng.",
      ],
    },
    {
      id: "tuyen-dung",
      title: "5. Nhà tuyển dụng và ứng viên",
      bullets: [
        "Nhà tuyển dụng phải cung cấp thông tin doanh nghiệp chính xác và được duyệt trước khi đăng tin.",
        "Tin tuyển dụng phải trung thực, không phân biệt đối xử, không thu phí ứng viên.",
        "Nhà tuyển dụng chỉ được dùng thông tin ứng viên cho mục đích tuyển dụng, không chia sẻ cho bên thứ ba.",
        `${LEGAL_SITE.name} là nền tảng trung gian, không phải là bên trong quan hệ lao động giữa nhà tuyển dụng và ứng viên.`,
      ],
    },
    {
      id: "thong-tin-bds",
      title: "6. Thông tin bất động sản",
      paragraphs: [
        "Thông tin dự án, giá bán, chính sách, tiến độ, bảng hàng được cung cấp nhằm mục đích tham khảo và có thể thay đổi bởi chủ đầu tư. Bạn nên kiểm tra lại với chủ đầu tư hoặc đơn vị phân phối chính thức trước khi ra quyết định giao dịch.",
        "Nội dung do trợ lý AI trả lời chỉ mang tính tham khảo, không phải tư vấn pháp lý, tài chính hay đầu tư.",
      ],
    },
    {
      id: "so-huu-tri-tue",
      title: "7. Quyền sở hữu trí tuệ",
      paragraphs: [
        `Giao diện, logo, mã nguồn, nội dung biên soạn và tài liệu trên website thuộc quyền sở hữu của ${LEGAL_SITE.name} hoặc đối tác. Không được sao chép, phân phối, khai thác thương mại khi chưa có sự đồng ý bằng văn bản.`,
      ],
    },
    {
      id: "hanh-vi-cam",
      title: "8. Hành vi bị cấm",
      bullets: [
        "Truy cập trái phép, dò quét lỗ hổng, tấn công hoặc làm gián đoạn hệ thống.",
        "Thu thập dữ liệu tự động (crawl, scrape) khi chưa được phép.",
        "Giả mạo người khác, tổ chức khác.",
        "Sử dụng dịch vụ cho mục đích trái pháp luật.",
      ],
    },
    {
      id: "gioi-han-trach-nhiem",
      title: "9. Giới hạn trách nhiệm",
      paragraphs: [
        "Dịch vụ được cung cấp theo hiện trạng. Chúng tôi nỗ lực duy trì hoạt động ổn định nhưng không cam kết dịch vụ luôn liên tục, không lỗi. Chúng tôi không chịu trách nhiệm về thiệt hại phát sinh từ nội dung do người dùng khác đăng tải hoặc từ giao dịch giữa người dùng với bên thứ ba.",
      ],
    },
    {
      id: "bao-mat",
      title: "10. Quyền riêng tư",
      paragraphs: [
        "Việc thu thập và xử lý thông tin cá nhân được thực hiện theo Chính sách bảo mật của chúng tôi.",
      ],
    },
    {
      id: "thay-doi-cham-dut",
      title: "11. Thay đổi và chấm dứt",
      paragraphs: [
        "Chúng tôi có thể cập nhật điều khoản này; phiên bản mới có hiệu lực kể từ khi đăng trên website. Bạn có thể ngừng sử dụng và yêu cầu xoá tài khoản bất kỳ lúc nào.",
      ],
    },
    {
      id: "luat-ap-dung",
      title: "12. Luật áp dụng và liên hệ",
      paragraphs: [
        "Điều khoản được điều chỉnh bởi pháp luật nước Cộng hoà Xã hội Chủ nghĩa Việt Nam. Tranh chấp được ưu tiên giải quyết bằng thương lượng; nếu không thành sẽ đưa ra cơ quan có thẩm quyền.",
        `Mọi thắc mắc vui lòng liên hệ: ${LEGAL_SITE.email}.`,
      ],
    },
  ],
};
