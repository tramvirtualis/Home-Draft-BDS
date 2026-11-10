// Bám theo bảng Properties (zone_id → Zones.id, Zones.project_id → Projects.id) và Property_Images
// Không đưa vector_embedding lên giao diện quản trị.

export type PropertyStatus = "available" | "holding" | "sold" | "closed";

// Các mức giá vay theo thời hạn vay (khớp cột VAY 18T / 24T / 30T / 36T trong bảng hàng)
export const LOAN_TERMS = [
  { key: "loanPrice18m", months: 18 },
  { key: "loanPrice24m", months: 24 },
  { key: "loanPrice30m", months: 30 },
  { key: "loanPrice36m", months: 36 },
] as const;
export type LoanPriceKey = (typeof LOAN_TERMS)[number]["key"];

// Ảnh đã lưu của căn (id để xóa)
export interface PropertyImageItem {
  id: number;
  imageUrl: string;
}

// Thay đổi ảnh khi lưu căn: ảnh mới chọn từ máy + id các ảnh đã lưu cần xóa
export interface PropertyImageChanges {
  add: File[];
  removeIds: number[];
}

export interface Property {
  id: number;
  zoneId: number;
  buildingId: number | null; // tòa nhà: chỉ căn của dự án cao tầng
  propertyCode: string;
  area: number; // m²
  price: number; // VNĐ, giữ nguyên giá trị gốc
  direction: string;
  floor: number | null; // tầng, trục và số phòng ngủ: chỉ căn của dự án cao tầng
  axis: string | null; // trục căn trong tòa, vd "08"
  bedrooms: number | null;
  status: PropertyStatus;
  type: string; // các loại hình gộp bằng ", " (để hiển thị)
  types: string[]; // các loại hình (nhãn) của căn, ít nhất một
  constructionArea: number | null; // m²
  prepaymentDiscountRate: number | null; // %
  // Giá vay (VNĐ) theo thời hạn vay, xem LOAN_TERMS
  loanPrice18m: number | null;
  loanPrice24m: number | null;
  loanPrice30m: number | null;
  loanPrice36m: number | null;
  pricingSheet: string;
  layoutUrl: string;
  salesPolicyEffectiveDate: string; // yyyy-MM-dd hoặc ""
  salesPolicySummaryUrl: string;
  salesPolicyDetailUrl: string;
  gift: string;
  handoverStandard: string;
  propertyInventoryType: string;
  images: string[]; // image_url trong Property_Images
  imageItems?: PropertyImageItem[];
}

export type PropertyInput = Omit<Property, "id" | "images">;

export interface PropertyProjectRef {
  id: number;
  name: string;
  highRise: boolean; // dự án cao tầng: căn có tầng + số phòng ngủ
}

export interface PropertyZoneRef {
  id: number;
  projectId: number;
  name: string;
}

export interface PropertyBuildingRef {
  id: number;
  zoneId: number;
  name: string;
  floors: number;
}

// Danh mục dự án/phân khu/tòa nhà dùng cho bộ lọc và form
export interface PropertyCatalog {
  projects: PropertyProjectRef[];
  zones: PropertyZoneRef[];
  buildings: PropertyBuildingRef[];
}

export interface PropertyFilter {
  projectId: number | null;
  zoneId: number | null;
  buildingId: number | null; // tòa nhà (dự án cao tầng)
  keyword: string;
  status: "" | PropertyStatus;
  areaMin: string;
  areaMax: string;
  priceMin: string; // đơn vị: tỷ
  priceMax: string;
}
