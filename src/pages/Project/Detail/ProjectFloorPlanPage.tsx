import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import BookingLockModal from "../../../components/Project/Detail/BookingLockModal";
import UnitDetailModal from "../../../components/Project/Detail/inventory/UnitDetailModal";
import { canBook, toBookingUnit } from "../../../components/Project/Detail/inventory/toBookingUnit";
import ProjectSubHero from "../../../components/Project/Detail/ProjectSubHero";
import FloorPlanBoard from "../../../components/Project/Detail/floorPlan/FloorPlanBoard";
import SelectedUnitCard from "../../../components/Project/Detail/floorPlan/SelectedUnitCard";
import SelectedBuildingCard from "../../../components/Project/Detail/floorPlan/SelectedBuildingCard";
import { buildingService } from "../../../services/project/buildingService";
import type { BuildingDto } from "../../../types/project/building.types";
import FeaturedUnits from "../../../components/Project/Detail/floorPlan/FeaturedUnits";
import { usePlanSize } from "../../../components/Project/Detail/floorPlan/planCoords";
import { useProjectUnits } from "../../../hooks/project/useProjectUnits";
import { floorPlanService } from "../../../services/project/floorPlanService";
import { projectService } from "../../../services/project/projectService";
import { isHighRise } from "../../../components/Admin/project/general/buildingType";
import { parseProjectId } from "../../../utils/slug";
import type { FloorPlanDto } from "../../../types/project/project.types";
import type { PinUnit } from "../../../components/Project/Detail/floorPlan/FloorPlanBoard";
import { buildingPinUnits, unitPinUnits } from "../../../components/Project/Detail/floorPlan/planPinUnits";

// highRise: cao tầng ghim tòa nhà, bấm tòa xem thông tin tòa ở cột bên phải (từ đó mở bảng hàng của tòa)
type PlanState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; plan: FloorPlanDto | null; highRise: boolean; buildings: BuildingDto[] };

export default function ProjectFloorPlanPage() {
  const { id } = useParams();
  const projectId = parseProjectId(id);
  const base = `/projects/${id}`;
  const [reloadKey, setReloadKey] = useState(0); // tải lại quỹ căn sau khi giữ chỗ
  const state = useProjectUnits(projectId, reloadKey);
  const [planState, setPlanState] = useState<PlanState>({ status: "loading" });
  // ?unit= : mở sẵn căn được bấm từ mặt bằng phân khu (trang Phân khu)
  const [searchParams] = useSearchParams();
  const requestedUnit = Number(searchParams.get("unit")) || null;
  const [selectedId, setSelectedId] = useState<number | null>(requestedUnit);
  const [booking, setBooking] = useState(false);
  const [detail, setDetail] = useState(requestedUnit !== null); // popup chi tiết căn đang chọn
  const [buildingId, setBuildingId] = useState<number | null>(null); // tòa đang chọn (cao tầng)
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId === undefined) return;
    let cancelled = false;
    // Không đọc được loại hình dự án thì hiển thị như thấp tầng
    Promise.all([floorPlanService.get(projectId), projectService.getProject(projectId).catch(() => null)])
      .then(async ([plan, project]) => {
        const highRise = isHighRise(project?.buildingType);
        // Cao tầng: thông tin tòa (ảnh, phân khu, số tầng) cho thẻ "Tòa đang chọn"; lỗi thì thẻ chỉ hiện tên tòa
        const buildings = highRise ? await buildingService.list(projectId).catch(() => []) : [];
        if (!cancelled) setPlanState({ status: "ready", plan, highRise, buildings });
      })
      .catch(() => !cancelled && setPlanState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const units = useMemo(() => (state.status === "ready" ? state.data.units : []), [state]);
  const plan = planState.status === "ready" ? planState.plan : null;
  const highRise = planState.status === "ready" && planState.highRise;
  const size = usePlanSize(plan);

  const buildingPins = useMemo((): PinUnit[] => (plan && highRise ? buildingPinUnits(plan) : []), [plan, highRise]);
  const pins = useMemo((): PinUnit[] => (plan && !highRise ? unitPinUnits(plan, units) : []), [plan, units, highRise]);

  const featured = useMemo(
    () => [...units].sort((a, b) => Number(b.status === "available") - Number(a.status === "available")).slice(0, 3),
    [units],
  );

  if (state.status === "loading" || planState.status === "loading") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="animate-pulse px-4 py-10 md:px-8" aria-busy="true">
          <div className="h-40 rounded-3xl bg-primary-100" />
          <div className="mt-6 h-[480px] rounded-3xl bg-primary-50" />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="px-4 py-24 text-center" role="alert">
          <p className="text-xl font-semibold text-heading">{state.message}</p>
          <Link to="/projects" className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700">Về danh sách dự án</Link>
        </div>
      </div>
    );
  }

  const selected = units.find((u) => u.id === selectedId) ?? null;
  const available = units.filter((u) => u.status === "available").length;

  // Bấm một căn trên mặt bằng: chọn căn đó và mở chi tiết căn; từ đó khách bấm Booking Lock để giữ chỗ
  const pick = (unitId: number) => {
    setSelectedId(unitId);
    setDetail(true);
  };

  // Mở bảng hàng của đúng tòa (tòa chưa có bảng hàng thì vùng bảng hàng để trống)
  const openSheet = (id: number) => navigate(`${base}/sales-sheets?building=${id}`);
  // Tòa đang chọn: lấy từ danh sách tòa, không có thì dựng tạm từ ghim (chỉ có tên)
  const selectedBuilding: BuildingDto | null = (() => {
    if (buildingId === null || planState.status !== "ready") return null;
    const found = planState.buildings.find((b) => b.id === buildingId);
    if (found) return found;
    const pin = buildingPins.find((p) => p.id === buildingId);
    return pin ? { id: pin.id, projectId: projectId ?? 0, zoneId: 0, zoneName: "", name: pin.code, floors: 0, imageUrl: null } : null;
  })();

  return (
    <div className="overflow-x-clip bg-page">
      <ProjectTabs highRise={planState.status === "ready" ? highRise : undefined} />
      {detail && selected && (
        <UnitDetailModal
          projectId={projectId ?? null}
          key={selected.id}
          unit={selected}
          onClose={() => setDetail(false)}
          bookingEnabled={state.data.project.bookingEnabled}
          onBook={() => {
            if (!canBook(selected) || !state.data.project.bookingEnabled) return;
            setDetail(false);
            setBooking(true);
          }}
        />
      )}
      {booking && selected && (
        <BookingLockModal projectId={projectId ?? null} key={selected.id} propertyId={selected.id} unit={toBookingUnit(selected)} onClose={() => setBooking(false)} onBooked={() => setReloadKey((k) => k + 1)} onConflict={() => setReloadKey((k) => k + 1)} />
      )}

      <ProjectSubHero
        base={base}
        projectName={state.data.project.name}
        title={highRise ? "Mặt bằng" : "Mặt bằng quỹ căn"}
        desc={
          highRise
            ? `Xem vị trí từng tòa nhà của ${state.data.project.name}. Bấm vào một tòa để xem thông tin và mở bảng hàng của tòa đó.`
            : `Chọn đúng phân khu, đúng tầng và đúng tầm nhìn. Dữ liệu sản phẩm được lấy từ giỏ hàng của ${state.data.project.name}.`
        }
        statLabel={highRise ? "Tòa nhà trên mặt bằng" : "Quỹ căn khả dụng"}
        statValue={highRise ? `${buildingPins.length} tòa` : `${available} căn`}
      />

      <section className="bg-page py-12">
        <div className="container mx-auto grid gap-5 px-4 lg:grid-cols-[1fr_380px] lg:px-8">
          {plan && size && size !== "error" ? (
            <FloorPlanBoard
              imageUrl={plan.imageUrl}
              width={size.width}
              height={size.height}
              units={highRise ? buildingPins : pins}
              selected={highRise ? buildingId : selectedId}
              onSelect={highRise ? setBuildingId : pick}
              hint={highRise ? "Bấm vào tòa nhà để xem thông tin và bảng hàng" : undefined}
              pinScale={plan.pinScale}
              pdfUrl={plan.pdfUrl}
              pdfPage={plan.pdfPage}
              pdfMode={size.mode}
              pdfDensity={size.density}
              pdfTiles={plan.tileBaseUrl && plan.tileLevels != null ? { baseUrl: plan.tileBaseUrl, levels: plan.tileLevels } : undefined}
            />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-[1.75rem] border border-dashed border-primary-200 bg-white/70 px-6 text-center text-sm text-body">
              {!plan || planState.status === "error"
                ? highRise ? "Dự án chưa cập nhật mặt bằng." : "Dự án chưa cập nhật mặt bằng quỹ căn."
                : size === "error"
                  ? "Không tải được mặt bằng. Vui lòng thử lại sau."
                  : "Đang tải mặt bằng..."}
            </div>
          )}
          {highRise ? (
            <SelectedBuildingCard
              building={selectedBuilding}
              onOpenSheet={openSheet}
              emptyText={buildingPins.length ? "Bấm vào một tòa trên mặt bằng để xem thông tin." : "Dự án chưa có tòa nào trên mặt bằng."}
            />
          ) : (
            <SelectedUnitCard
              unit={selected}
              setBooking={setBooking}
              bookingEnabled={state.data.project.bookingEnabled}
              onDetail={() => setDetail(true)}
              emptyText={pins.length ? "Bấm vào một căn trên mặt bằng để xem thông tin." : "Dự án chưa có căn nào để hiển thị."}
            />
          )}
        </div>
      </section>

      {!highRise && <FeaturedUnits featured={featured} base={base} onOpen={(u) => pick(u.id)} />}
    </div>
  );
}
