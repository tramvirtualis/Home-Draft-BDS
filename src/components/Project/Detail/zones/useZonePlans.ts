import { useEffect, useState } from "react";
import { floorPlanService } from "../../../../services/project/floorPlanService";
import { projectService } from "../../../../services/project/projectService";
import { buildingService } from "../../../../services/project/buildingService";
import { projectUnitsService } from "../../../../services/project/projectUnitsService";
import { isHighRise } from "../../../Admin/project/general/buildingType";
import { buildingPinUnits, unitPinUnits } from "../floorPlan/planPinUnits";
import type { PinUnit } from "../floorPlan/FloorPlanBoard";
import type { FloorPlanDto } from "../../../../types/project/project.types";
import type { ProjectUnit } from "../../../../types/project/projectUnits.types";

// none: dự án chưa có mặt bằng (hoặc tải lỗi) thì không hiện nút xem mặt bằng phân khu
export type ZonePlans =
  | { status: "loading" }
  | { status: "none" }
  | {
      status: "ready";
      plan: FloorPlanDto;
      highRise: boolean;
      pinsByZone: Map<number, PinUnit[]>;
      units: ProjectUnit[]; // căn của dự án (thấp tầng) để mở chi tiết / giữ chỗ ngay trong mặt bằng phân khu
      bookingEnabled: boolean;
    };

// Mặt bằng của dự án kèm các ghim đã gom theo phân khu:
// thấp tầng lấy phân khu của căn được ghim, cao tầng lấy phân khu của tòa được ghim.
// Đổi reloadKey để tải lại (vd sau khi giữ chỗ), giữ nguyên dữ liệu cũ trong lúc tải.
export function useZonePlans(projectId: number | undefined, reloadKey = 0): ZonePlans {
  const [state, setState] = useState<ZonePlans>({ status: "loading" });

  useEffect(() => {
    if (projectId === undefined) return;
    let cancelled = false;
    (async (): Promise<ZonePlans> => {
      const [plan, project] = await Promise.all([floorPlanService.get(projectId), projectService.getProject(projectId).catch(() => null)]);
      if (!plan || plan.pins.length === 0) return { status: "none" };
      const highRise = isHighRise(project?.buildingType);
      const pinsByZone = new Map<number, PinUnit[]>();
      const add = (zoneId: number | undefined, pin: PinUnit) => {
        if (zoneId === undefined) return;
        pinsByZone.set(zoneId, [...(pinsByZone.get(zoneId) ?? []), pin]);
      };
      if (highRise) {
        const zoneOf = new Map((await buildingService.list(projectId)).map((b) => [b.id, b.zoneId]));
        buildingPinUnits(plan).forEach((p) => add(zoneOf.get(p.id), p));
        return { status: "ready", plan, highRise, pinsByZone, units: [], bookingEnabled: false };
      }
      const { units, project: info } = await projectUnitsService.getProjectUnits(projectId);
      const zoneOf = new Map(units.map((u) => [u.id, u.zoneId]));
      unitPinUnits(plan, units).forEach((p) => add(zoneOf.get(p.id), p));
      return { status: "ready", plan, highRise, pinsByZone, units, bookingEnabled: info.bookingEnabled };
    })()
      .then((s) => !cancelled && setState(s))
      // Tải lại lỗi (đã có dữ liệu) thì giữ dữ liệu cũ
      .catch(() => !cancelled && setState((prev) => (prev.status === "ready" ? prev : { status: "none" })));
    return () => {
      cancelled = true;
    };
  }, [projectId, reloadKey]);

  return state;
}
