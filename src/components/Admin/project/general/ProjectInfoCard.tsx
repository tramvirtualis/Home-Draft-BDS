import type { AdminProject } from "../../../../types/project/adminProject.types";
import { formatPrice } from "../properties/propertyFormat";

function Info({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`rounded-xl bg-primary-50/50 px-4 py-3 ${wide ? "md:col-span-3" : ""}`}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-footer">{children || "—"}</dd>
    </div>
  );
}

// Số thuần (vd "59") thì thêm đơn vị; chuỗi đã có đơn vị thì giữ nguyên
function formatInvestment(value: string) {
  const v = value?.trim();
  if (!v) return "";
  const n = Number(v);
  return Number.isFinite(n) ? formatPrice(n * 1e9) : v; // lưu theo tỷ VNĐ, đọc giống bên khách
}

// Các trường của bảng Projects (và Project_types)
export default function ProjectInfoCard({ project: p }: { project: AdminProject }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-footer">Thông tin dự án</h2>
      <dl className="mt-4 grid gap-3 md:grid-cols-3">
        <Info label="Tên dự án">{p.name}</Info>
        <Info label="Chủ đầu tư">{p.investor}</Info>
        <Info label="Địa điểm">{p.location}</Info>
        <Info label="Loại hình xây dựng">{p.buildingType}</Info>
        <Info label="Đơn vị tư vấn">{p.consultancy}</Info>
        <Info label="Mô hình phát triển">{p.developmentModel}</Info>
        <Info label="Quy mô">{p.size}</Info>
        <Info label="Tổng vốn đầu tư">{formatInvestment(p.totalInvestment)}</Info>
        <Info label="Hình thức sở hữu">{p.ownershipType}</Info>
        <Info label="Loại hình sản phẩm" wide>{p.types.join(" · ")}</Info>
        <Info label="Ngày tạo">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</Info>
      </dl>
    </section>
  );
}
