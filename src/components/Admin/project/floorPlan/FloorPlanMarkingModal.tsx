import { useMemo, useState } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import PropertyFormModal from "../properties/PropertyFormModal";
import BuildingFormModal from "../buildings/BuildingFormModal";
import { FUND_TYPES, UNCLASSIFIED, fundColor } from "../../../Project/Detail/floorPlan/planPins";
import { STATUS } from "../../../Project/Detail/inventory/inventoryStatus";
import type { FundType } from "../../../../types/project/project.types";
import type { BuildingInput } from "../../../../types/project/building.types";
import type { PropertyCatalog, PropertyImageChanges, PropertyInput, PropertyStatus } from "../../../../types/project/property.types";

// Căn (thấp tầng) hoặc tòa nhà (cao tầng) chưa ghim trên mặt bằng
export type MarkingUnit = { id: number; code: string; sub: string; status?: PropertyStatus };

interface Props {
  units: MarkingUnit[]; // chỉ các căn / tòa chưa ghim
  highRise: boolean; // cao tầng: ghim tòa nhà thay vì căn
  projectId: number;
  zones: { id: number; name: string }[];
  catalog: PropertyCatalog | null; // null = đang tải (chỉ cần cho thấp tầng)
  creating: boolean;
  onClose: () => void;
  onSelect: (unitId: number, fundType: FundType | null) => void;
  onCreate: (input: PropertyInput, images: PropertyImageChanges, fundType: FundType | null) => void;
  onCreateBuilding: (input: BuildingInput, fundType: FundType | null) => void;
}

const input =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-footer outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

/**
 * Bấm lên mặt bằng khi chưa chọn căn / tòa: chọn cái có sẵn (chưa ghim), hoặc tạo mới với đủ thông tin
 * (dùng lại form của trang Quản lý căn / Tòa nhà, chèn tab + loại quỹ lên đầu) rồi ghim ngay vào điểm vừa bấm.
 * Cùng cách làm với hộp thoại đánh dấu ô của bảng hàng (SalesSheetMarkingModal).
 */
export default function FloorPlanMarkingModal({ units, highRise, projectId, zones, catalog, creating, onClose, onSelect, onCreate, onCreateBuilding }: Props) {
  const noun = highRise ? "tòa nhà" : "căn";
  const [mode, setMode] = useState<"SELECT_EXISTING" | "CREATE_NEW">(units.length > 0 ? "SELECT_EXISTING" : "CREATE_NEW");
  const [fundType, setFundType] = useState<FundType | null>(null);
  const [keyword, setKeyword] = useState("");
  const [unitId, setUnitId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return units.filter((u) => !k || u.code.toLowerCase().includes(k) || u.sub.toLowerCase().includes(k));
  }, [units, keyword]);

  const submit = () => {
    if (unitId !== null) onSelect(unitId, fundType);
  };

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const tab = (on: boolean) => `flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold transition ${on ? "bg-white text-footer shadow-xs" : "text-muted hover:text-footer"}`;

  const tabsBar = (
    <div className="flex rounded-xl border border-line bg-gray-100 p-1">
      <button type="button" onClick={() => setMode("SELECT_EXISTING")} className={tab(mode === "SELECT_EXISTING")}>
        1. Chọn {noun} có sẵn ({units.length})
      </button>
      <button type="button" onClick={() => setMode("CREATE_NEW")} className={`${tab(mode === "CREATE_NEW")} ${mode === "CREATE_NEW" ? "text-primary-700!" : ""}`}>
        <Plus size={13} /> 2. Tạo {noun} mới
      </button>
    </div>
  );

  const fundPicker = (
    <div>
      <label className="text-xs font-semibold text-body">Loại quỹ</label>
      <div className={`mt-1.5 grid grid-cols-2 gap-1.5 ${mode === "CREATE_NEW" && !highRise ? "sm:grid-cols-4" : ""}`}>
        {[{ key: null, label: UNCLASSIFIED.label, color: UNCLASSIFIED.color }, ...FUND_TYPES].map((f) => (
          <button
            key={f.key ?? "none"}
            type="button"
            onClick={() => setFundType(f.key)}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-xs font-bold transition ${
              fundType === f.key ? "border-primary-500 bg-primary-50 text-footer ring-2 ring-primary-500/20" : "border-line bg-gray-50 text-body hover:bg-white"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />
            <span className="truncate">{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const head = (
    <div className="space-y-4 border-b border-line pb-5">
      {tabsBar}
      {fundPicker}
    </div>
  );

  // Tạo mới: hiện thẳng form đầy đủ (giống trang Quản lý căn / Tòa nhà), tab + loại quỹ nằm trên đầu form
  if (mode === "CREATE_NEW" && highRise) {
    return (
      <BuildingFormModal
        building={null}
        zones={zones}
        defaultZoneId={zones.length === 1 ? zones[0].id : null}
        submitting={creating}
        title="Ghim tòa nhà vào vị trí vừa chọn"
        submitLabel="Tạo & ghim tòa"
        extra={head}
        onSubmit={(input) => onCreateBuilding(input, fundType)}
        onClose={() => !creating && onClose()}
      />
    );
  }
  if (mode === "CREATE_NEW") {
    if (!catalog) {
      return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-xs" onClick={onClose}>
          <Loader2 size={28} className="animate-spin text-white" aria-label="Đang tải" />
        </div>
      );
    }
    return (
      <PropertyFormModal
        property={null}
        catalog={catalog}
        defaultProjectId={projectId}
        defaultZoneId={zones.length === 1 ? zones[0].id : null}
        lockProject
        submitting={creating}
        title="Ghim căn vào vị trí vừa chọn"
        submitLabel="Tạo & ghim căn"
        extra={head}
        onSubmit={(input, images) => onCreate(input, images, fundType)}
        onClose={() => !creating && onClose()}
      />
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto z-[1000] flex items-center justify-center bg-black/40 p-4 max-sm:p-0 backdrop-blur-xs" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fp-mark-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-in m-auto max-sm:h-full max-sm:max-h-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0 flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col rounded-2xl border border-line bg-white p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h4 id="fp-mark-title" className="flex items-center gap-2 text-sm font-bold text-footer">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: fundColor(fundType) }} />
            Ghim {noun} vào vị trí vừa chọn
          </h4>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-muted hover:text-footer">
            <X size={16} />
          </button>
        </div>

        <div className="mt-3.5">{tabsBar}</div>

        <div className="mt-3.5 min-h-0 flex-1 space-y-3.5 overflow-y-auto pr-0.5">
          {fundPicker}

          {units.length === 0 ? (
              <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-3 text-center">
                <p className="text-xs font-semibold text-amber-800">Tất cả {noun} của dự án đã được ghim.</p>
                <button
                  type="button"
                  onClick={() => setMode("CREATE_NEW")}
                  className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-700"
                >
                  <Plus size={13} /> Tạo {noun} mới
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="fp-mark-search" className="text-xs font-semibold text-body">
                    Chọn {noun} chưa ghim
                  </label>
                  <button type="button" onClick={() => setMode("CREATE_NEW")} className="inline-flex items-center gap-0.5 text-[11px] font-bold text-primary-600 hover:underline">
                    <Plus size={11} /> Tạo {noun} mới
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input id="fp-mark-search" autoFocus value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={onEnter} placeholder={highRise ? "Tìm tên tòa, phân khu..." : "Tìm mã căn, phân khu..."} className={`${input} pl-9`} />
                </div>
                <ul className="mt-2 max-h-56 divide-y divide-line overflow-y-auto rounded-xl border border-line">
                  {filtered.length === 0 && <li className="px-3 py-6 text-center text-xs text-body">Không có {noun} phù hợp.</li>}
                  {filtered.map((u) => {
                    const on = unitId === u.id;
                    const st = u.status ? STATUS[u.status] : undefined;
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => setUnitId(u.id)}
                          onDoubleClick={() => onSelect(u.id, fundType)}
                          aria-pressed={on}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left transition ${on ? "bg-primary-50" : "hover:bg-primary-50/50"}`}
                        >
                          <span className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${on ? "border-primary-600 bg-primary-600" : "border-line"}`} aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-footer">{u.code}</span>
                            <span className="block truncate text-[11px] text-body">{u.sub}</span>
                          </span>
                          {st && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.badge}`}>{st.label}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-body hover:bg-gray-50">
            Hủy
          </button>
          <button
            type="button"
            disabled={unitId === null}
            onClick={submit}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary-200 hover:bg-primary-700 disabled:opacity-50"
          >
            Ghim {noun} này
          </button>
        </div>
      </div>
    </div>
  );
}
