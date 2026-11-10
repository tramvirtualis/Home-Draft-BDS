import type { PropertyStatus } from "./property.types";

// Một căn trong quỹ căn công khai của dự án (dựng từ bảng Property + Zones)
export interface ProjectUnit {
  id: number;
  code: string;
  zoneId: number;
  zone: string;
  area: number | null; // m²
  priceBillion: number | null; // tỷ VNĐ
  unitPriceMillion: number | null; // triệu/m²
  direction: string;
  floor: number | null;
  type: string; // các loại hình gộp bằng ", " để hiển thị: "Liền kề, Căn góc"
  types: string[]; // từng loại hình (nhãn) của căn, dùng cho bộ lọc
  status: PropertyStatus;
  image: string | null;
  images: string[];
  constructionArea: number | null; // m²
  loanPrices: { months: number; billion: number | null }[]; // giá vay (tỷ VNĐ) theo thời hạn vay 18 / 24 / 30 / 36 tháng
  prepaymentPriceBillion: number | null; // giá thanh toán sớm = giá × (1 − chiết khấu)
  prepaymentDiscountRate: number | null;
  banks: string[];
  pricingSheet: string | null;
  layoutUrl: string | null;
  salesPolicyEffectiveDate: string | null;
  salesPolicySummaryUrl: string | null;
  salesPolicyDetailUrl: string | null;
  gift: string | null;
  handoverStandard: string | null;
  propertyInventoryType: string | null;
}

export interface ProjectUnitsData {
  project: { id: number; name: string; location: string; overviewImage: string; bookingEnabled: boolean };
  zones: { id: number; name: string }[];
  units: ProjectUnit[];
}
