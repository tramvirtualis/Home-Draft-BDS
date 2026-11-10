import { Link } from "react-router-dom";
import { Clock, Mail, MapPin, Phone, Users } from "lucide-react";
import HubtechLogo from "../../components/Home/HubtechLogo";
import { CircleButton, E, wrap } from "./ecoUi";
import { CONTACT } from "../../data/contactInfo";

/* Chân trang kiểu eco: dải "nhận tin mới" bo góc trên nền rêu, rồi 4 cột (giới thiệu, khám phá, hỗ trợ, liên hệ)
   và hàng bản quyền. */

const PHONE = CONTACT.phone;
const EMAIL = CONTACT.email;

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Khám phá",
    links: [
      ["Dự án", "/projects"],
      ["Sự kiện", "/events"],
      ["Tin tức", "/news"],
      ["Cộng đồng", "/social"],
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      ["Kiến thức", "/knowledge"],
      ["Tuyển dụng", "/jobs"],
      ["Chính sách bảo mật", "/chinh-sach-bao-mat"],
      ["Điều khoản dịch vụ", "/dieu-khoan"],
    ],
  },
];

export default function ClassicFooter() {
  return (
    <footer id="lien-he" className="scroll-mt-24 text-white" style={{ background: E.forest }}>
      <div className={`${wrap} pt-16`}>
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] border px-7 py-8 md:px-10" style={{ background: E.forest2, borderColor: E.line }}>
          <p className="max-w-lg text-2xl font-medium leading-snug md:text-3xl">
            Cập nhật <span style={{ color: E.green }}>dự án mới</span> và tin thị trường mỗi tuần
          </p>
          <CircleButton to="/news">Xem tin mới</CircleButton>
        </div>
      </div>

      <div className={`${wrap} grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]`}>
        <div>
          <Link to="/" aria-label="Hubtech, về trang chủ" className="inline-block text-white">
            <HubtechLogo accent={E.green} />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
            Nền tảng bất động sản số: dự án chọn lọc, bảng hàng thời gian thực và chuyên viên đồng hành.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-base font-medium">{col.title}</p>
            <ul className="mt-5 space-y-2.5 text-sm text-white/70">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="transition hover:text-[#8ef05c]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-base font-medium">Liên hệ</p>
          <ul className="mt-5 space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: E.green }} /> {CONTACT.address}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="shrink-0" style={{ color: E.green }} />
              <a href={CONTACT.phoneHref} className="transition hover:text-[#8ef05c]">
                {PHONE}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="shrink-0" style={{ color: E.green }} />
              <a href={`mailto:${EMAIL}`} className="transition hover:text-[#8ef05c]">
                {EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock size={15} className="shrink-0" style={{ color: E.green }} /> Thứ Hai đến Thứ Bảy, 8h00 đến 17h30
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: E.line }}>
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-white/55`}>
          <span>© 2026 Hubtech. Bảo lưu mọi quyền.</span>
          <Link to="/social" className="inline-flex items-center gap-1.5 transition hover:text-[#8ef05c]">
            <Users size={13} /> Tham gia cộng đồng Hubtech
          </Link>
        </div>
      </div>
    </footer>
  );
}
