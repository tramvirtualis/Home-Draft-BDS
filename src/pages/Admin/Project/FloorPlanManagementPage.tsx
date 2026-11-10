import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ImagePlus, MapPin, Save, Search, Trash2, X } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import useUnsavedChangesGuard from "../../../hooks/useUnsavedChangesGuard";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import PdfPagePicker from "../../../components/Admin/project/floorPlan/PdfPagePicker";
import FloorPlanEditor, { type EditorPin } from "../../../components/Admin/project/floorPlan/FloorPlanEditor";
import FloorPlanMarkingModal from "../../../components/Admin/project/floorPlan/FloorPlanMarkingModal";
import { usePlanSize } from "../../../components/Project/Detail/floorPlan/planCoords";
import { STATUS } from "../../../components/Project/Detail/inventory/inventoryStatus";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminProjectService } from "../../../services/project/adminProjectService";
import { floorPlanService } from "../../../services/project/floorPlanService";
import { uploadMultipart } from "../../../services/upload/multipartUploadService";
import { openPdf } from "../../../utils/pdfToImage";
import { buildAndUploadTiles } from "../../../utils/pdfTiles";
import { projectUnitsService } from "../../../services/project/projectUnitsService";
import { propertyService } from "../../../services/project/propertyService";
import { buildingService } from "../../../services/project/buildingService";
import { zoneApiService } from "../../../services/project/projectService";
import type { BuildingInput } from "../../../types/project/building.types";
import { useSelectedProject } from "../../../hooks/project/useSelectedProject";
import { isHighRise } from "../../../components/Admin/project/general/buildingType";
import type { AdminProject } from "../../../types/project/adminProject.types";
import { FUND_TYPES, PIN_SCALE, fundColor } from "../../../components/Project/Detail/floorPlan/planPins";
import type { FloorPlanDto, FundType } from "../../../types/project/project.types";
import type { ProjectUnit } from "../../../types/project/projectUnits.types";
import type { PropertyCatalog, PropertyImageChanges, PropertyInput, PropertyStatus } from "../../../types/project/property.types";

type Boot = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };
type Pos = { x: number; y: number; fundType: FundType | null };
// Đối tượng được ghim: căn (dự án thấp tầng) hoặc tòa nhà (dự án cao tầng)

type Target = { id: number; code: string; sub: string; status?: PropertyStatus };
const buildingSub = (zoneName: string, floors: number) => `Phân khu ${zoneName} · ${floors} tầng`;
const MAX_IMAGE = 200 * 1024 * 1024; // hỗ trợ ảnh lớn đến 200MB qua multipart upload
const MAX_PDF = 200 * 1024 * 1024; // tối đa 200 MB

// Quản lý mặt bằng quỹ căn: tải một ảnh, bấm lên ảnh để gán vị trí từng căn (thấp tầng) hoặc từng tòa nhà (cao tầng)
export default function FloorPlanManagementPage() {
  const toast = useToast();
  const picker = useRef<HTMLInputElement>(null);
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const { projectId } = useSelectedProject(boot.status === "ready" ? boot.projects : []);
  const projectIdRef = useRef(projectId);
  projectIdRef.current = projectId;
  const project = boot.status === "ready" ? boot.projects.find((p) => p.id === projectId) : undefined;
  const highRise = isHighRise(project?.buildingType);
  const noun = highRise ? "tòa nhà" : "căn";

  const [plan, setPlan] = useState<FloorPlanDto | null | undefined>(undefined); // undefined = đang tải
  const [targets, setTargets] = useState<Target[]>([]);
  const [pins, setPins] = useState<Record<number, Pos>>({});
  const [dirty, setDirty] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [pinScale, setPinScale] = useState(PIN_SCALE.default);
  const [keyword, setKeyword] = useState("");
  const [busy, setBusy] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [tiling, setTiling] = useState<{ done: number; total: number } | null>(null); // tiến độ cắt và tải ô ảnh
  // Đang tải PDF mặt bằng: bấm "Hủy tải lên" thì dừng và bỏ bản nháp
  const pdfJob = useRef<AbortController | null>(null);
  // Tiến độ tải ảnh mặt bằng chia nhỏ theo megabyte
  const [uploadingImage, setUploadingImage] = useState<{
    percent: number;
    currentMB: number;
    totalMB: number;
    part: number;
    totalParts: number;
  } | null>(null);
  const imageJob = useRef<AbortController | null>(null);
  // Đang tải dở mà rời trang thì hỏi trước (mặt bằng chưa đổi cho tới khi tải xong)
  const leaveGuard = useUnsavedChangesGuard(tiling !== null || uploadingImage !== null);
  const [deleting, setDeleting] = useState(false);
  // Bấm lên ảnh khi chưa chọn căn / tòa → hộp thoại chọn cái có sẵn hoặc tạo mới để ghim vào điểm vừa bấm
  const [marking, setMarking] = useState<{ x: number; y: number } | null>(null);
  const [creating, setCreating] = useState(false);
  const [zones, setZones] = useState<{ id: number; name: string }[]>([]);
  // Danh mục cho form tạo căn mới trong hộp ghim (tải khi cần)
  const [catalog, setCatalog] = useState<PropertyCatalog | null>(null);

  const size = usePlanSize(plan ?? null);

  // Rời trang (unmount) giữa chừng: dừng việc tải / cắt đang chạy ngầm
  useEffect(
    () => () => {
      pdfJob.current?.abort();
      imageJob.current?.abort();
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    adminProjectService
      .list()
      .then((projects) => !cancelled && setBoot({ status: "ready", projects }))
      .catch(() => !cancelled && setBoot({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  const applyPlan = useCallback((p: FloorPlanDto | null) => {
    setPlan(p);
    setPinScale(p?.pinScale ?? PIN_SCALE.default);
    setPins(
      Object.fromEntries(
        (p?.pins ?? []).flatMap((pin) => {
          const id = highRise ? pin.buildingId : pin.propertyId;
          return id === null ? [] : [[id, { x: pin.x, y: pin.y, fundType: pin.fundType }]];
        }),
      ),
    );
    setDirty(false);
    setActiveId(null);
  }, [highRise]);

  useEffect(() => {
    if (projectId === null || !project) return;
    let cancelled = false;
    setPlan(undefined);
    // Cao tầng ghim tòa nhà, thấp tầng ghim căn
    const loadTargets = highRise
      ? Promise.all([buildingService.list(projectId), zoneApiService.getByProject(projectId)]).then(([list, zoneList]) => ({
          list: list.map((b): Target => ({ id: b.id, code: b.name, sub: buildingSub(b.zoneName, b.floors) })),
          zones: zoneList.map((z) => ({ id: z.id, name: z.name })),
        }))
      : projectUnitsService.getProjectUnits(projectId).then((data) => ({
          list: data.units.map((u: ProjectUnit): Target => ({ id: u.id, code: u.code, sub: u.zone, status: u.status })),
          zones: data.zones,
        }));
    Promise.all([floorPlanService.get(projectId), loadTargets])
      .then(([p, loaded]) => {
        if (cancelled) return;
        setTargets(loaded.list);
        setZones(loaded.zones);
        applyPlan(p);
      })
      .catch((e) => {
        if (cancelled) return;
        toast.show(getErrorMessage(e), "error");
        setTargets([]);
        setZones([]);
        applyPlan(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, project, highRise, applyPlan]);

  const pick = (file?: File) => {
    if (!file || projectId === null) return;
    // PDF: mở hộp thoại chọn trang, trang được chọn sẽ chuyển thành ảnh rồi tải lên như ảnh thường
    if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
      if (file.size > MAX_PDF) {
        toast.show("File PDF tối đa 200 MB", "error");
        return;
      }
      setPdfFile(file);
      return;
    }
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE) {
      toast.show("Chỉ nhận ảnh hoặc file PDF (tối đa 200 MB)", "error");
      return;
    }
    void upload(file);
  };

  // Tải ảnh mặt bằng: chia nhỏ file thành từng phần megabyte (multipart upload) lên Object Storage
  const upload = async (image: File) => {
    if (projectId === null) return;
    const forProject = projectId;
    const job = new AbortController();
    imageJob.current = job;
    setBusy(true);
    setUploadingImage({
      percent: 0,
      currentMB: 0,
      totalMB: image.size / (1024 * 1024),
      part: 1,
      totalParts: Math.max(1, Math.ceil(image.size / (5 * 1024 * 1024))),
    });

    try {
      // 1. Chia nhỏ ảnh và tải từng chunk (5MB) trực tiếp lên Object Storage
      const fileUrl = await uploadMultipart(image, {
        folder: "floor-plans",
        chunkSize: 5 * 1024 * 1024,
        signal: job.signal,
        onProgress: (p) => {
          setUploadingImage({
            percent: Math.round(p.ratio * 100),
            currentMB: p.currentMB,
            totalMB: p.totalMB,
            part: p.part,
            totalParts: p.totalParts,
          });
        },
      });

      if (job.signal.aborted) throw new DOMException("Đã hủy", "AbortError");

      // 2. Chốt lưu mặt bằng với URL đã tải lên
      const saved = await floorPlanService.saveImageByUrl(forProject, fileUrl);
      if (projectIdRef.current === forProject) {
        setPlan(saved);
      }
      toast.show(plan ? "Đã thay ảnh mặt bằng" : "Đã tải ảnh mặt bằng");
    } catch (e) {
      if (job.signal.aborted) {
        toast.show("Đã hủy tải ảnh mặt bằng, mặt bằng cũ được giữ nguyên");
      } else {
        toast.show(`Tải ảnh mặt bằng thất bại: ${getErrorMessage(e)}`, "error");
      }
    } finally {
      imageJob.current = null;
      setUploadingImage(null);
      setBusy(false);
    }
  };

  /*
   PDF mặt bằng: làm như một giao dịch để không bao giờ lưu bản dở dang.
   1. Tải PDF vào bản nháp  2. Cắt trang thành các ô ảnh, tải hết vào bản nháp  3. Chốt: máy chủ đổi mặt bằng trong một lần.
   Lỗi, bấm hủy hoặc đóng trang giữa chừng: bản nháp bị bỏ (máy chủ tự dọn nếu không kịp báo), mặt bằng cũ giữ nguyên.
  */
  const uploadPdf = async (file: File, page: number) => {
    if (projectId === null) return;
    const forProject = projectId;
    const job = new AbortController();
    pdfJob.current = job;
    setBusy(true);
    let draftId: number | null = null;
    try {
      // 1. Chia nhỏ file PDF theo megabyte (5MB/phần) và tải trực tiếp lên Object Storage
      setUploadingImage({
        percent: 0,
        currentMB: 0,
        totalMB: file.size / (1024 * 1024),
        part: 1,
        totalParts: Math.max(1, Math.ceil(file.size / (5 * 1024 * 1024))),
      });

      const pdfUrl = await uploadMultipart(file, {
        folder: "floor-plans",
        chunkSize: 5 * 1024 * 1024,
        signal: job.signal,
        onProgress: (p) => {
          setUploadingImage({
            percent: Math.round(p.ratio * 100),
            currentMB: p.currentMB,
            totalMB: p.totalMB,
            part: p.part,
            totalParts: p.totalParts,
          });
        },
      });
      setUploadingImage(null);

      if (job.signal.aborted) throw new DOMException("Đã hủy", "AbortError");

      // 2. Tạo bản nháp bằng pdfUrl đã upload
      draftId = (await floorPlanService.createDraft(forProject, null, page, pdfUrl)).draftId;
      const id = draftId;

      // 3. Cắt ô ảnh và upload các ô ảnh
      setTiling({ done: 0, total: 0 });
      const doc = await openPdf(file);
      let info;
      try {
        info = await buildAndUploadTiles({
          pdf: doc,
          page,
          signal: job.signal,
          upload: (version, batch) => floorPlanService.uploadDraftTiles(id, version, batch),
          onProgress: (done, total) => setTiling({ done, total }),
        });
      } finally {
        void doc.loadingTask.destroy(); // đóng PDF và worker của pdf.js, trả lại bộ nhớ
      }
      if (job.signal.aborted) throw new DOMException("Đã hủy", "AbortError");

      // 4. Chốt bản nháp
      const saved = await floorPlanService.commitDraft(id, info);
      draftId = null; // đã chốt, không còn bản nháp để hủy
      // Trong lúc chờ đã chuyển sang dự án khác thì không hiện mặt bằng này lên
      if (projectIdRef.current === forProject) setPlan(saved);
      toast.show("Đã lưu mặt bằng mới");
    } catch (e) {
      if (draftId !== null) void floorPlanService.cancelDraft(draftId).catch(() => undefined);
      toast.show(
        job.signal.aborted
          ? "Đã hủy tải lên, mặt bằng cũ được giữ nguyên"
          : `Tải mặt bằng chưa xong nên chưa lưu, mặt bằng cũ được giữ nguyên: ${getErrorMessage(e)}`,
        "error",
      );
    } finally {
      pdfJob.current = null;
      setUploadingImage(null);
      setTiling(null);
      setBusy(false);
    }
  };

  const save = async () => {
    if (!plan) return;
    setBusy(true);
    try {
      const saved = await floorPlanService.savePins(
        plan.id,
        Object.entries(pins).map(([id, p]) => ({
          ...(highRise ? { buildingId: Number(id) } : { propertyId: Number(id) }),
          x: p.x,
          y: p.y,
          fundType: highRise ? null : p.fundType,
        })),
        pinScale,
      );
      applyPlan(saved);
      toast.show(`Đã lưu vị trí các ${noun}`);
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const removePlan = async () => {
    if (!plan) return;
    try {
      await floorPlanService.remove(plan.id);
      applyPlan(null);
      toast.show("Đã xóa mặt bằng");
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
    setDeleting(false);
  };

  const place = (x: number, y: number) => {
    if (activeId === null) {
      setMarking({ x, y });
      return;
    }
    setPins((cur) => ({ ...cur, [activeId]: { x, y, fundType: cur[activeId]?.fundType ?? null } }));
    setDirty(true);
  };

  const move = (id: number, x: number, y: number) => {
    setPins((cur) => ({ ...cur, [id]: { ...cur[id], x, y } }));
    setDirty(true);
  };

  const changeFund = (id: number, fundType: FundType | null) => {
    setPins((cur) => (cur[id] ? { ...cur, [id]: { ...cur[id], fundType } } : cur));
    setDirty(true);
  };

  const unpin = (id: number) => {
    setPins((cur) => {
      const next = { ...cur };
      delete next[id];
      return next;
    });
    setDirty(true);
  };

  // Hộp thoại ghim: ghim căn / tòa có sẵn, hoặc tạo mới (form đầy đủ ngay trong hộp) rồi ghim vào điểm đã bấm.
  // Căn mới được lưu ngay; vị trí ghim vẫn cần bấm "Lưu vị trí"
  const pinAt = (id: number, fundType: FundType | null) => {
    if (!marking) return;
    setPins((cur) => ({ ...cur, [id]: { x: marking.x, y: marking.y, fundType } }));
    setActiveId(id);
    setDirty(true);
    setMarking(null);
  };

  const selectUnit = (id: number, fundType: FundType | null) => {
    pinAt(id, fundType);
    toast.show(`Đã ghim căn ${targets.find((t) => t.id === id)?.code ?? ""}, nhớ bấm "Lưu vị trí"`);
  };

  // Danh mục dự án / phân khu cho form tạo căn: tải một lần khi mở hộp ghim
  useEffect(() => {
    if (!marking || catalog || highRise) return;
    let cancelled = false;
    propertyService
      .catalog()
      .then((c) => !cancelled && setCatalog(c))
      .catch((e) => !cancelled && toast.show(getErrorMessage(e), "error"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marking, catalog, highRise]);

  const createUnit = async (input: PropertyInput, images: PropertyImageChanges, fundType: FundType | null) => {
    const zoneName = zones.find((z) => z.id === input.zoneId)?.name ?? "";
    const same = targets.find((t) => t.code.toLowerCase() === input.propertyCode.trim().toLowerCase() && t.sub === zoneName);
    if (same) {
      toast.show(
        pins[same.id] ? `Căn ${same.code} đã có trong phân khu này và đã được ghim` : `Căn ${same.code} đã có trong phân khu này, hãy chọn ở tab "Chọn căn có sẵn"`,
        "error",
      );
      return;
    }
    setCreating(true);
    try {
      const created = await propertyService.create(input, images);
      setTargets((cur) => [...cur, { id: created.id, code: created.propertyCode, sub: zoneName, status: created.status }]);
      pinAt(created.id, fundType);
      toast.show(`Đã tạo căn ${created.propertyCode} và ghim lên mặt bằng, nhớ bấm "Lưu vị trí"`);
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setCreating(false);
    }
  };

  const createBuilding = async (input: BuildingInput, fundType: FundType | null) => {
    const zoneName = zones.find((z) => z.id === input.zoneId)?.name ?? "";
    const sub = buildingSub(zoneName, input.floors);
    const same = targets.find((t) => t.code.toLowerCase() === input.name.trim().toLowerCase() && t.sub.startsWith(`Phân khu ${zoneName} ·`));
    if (same) {
      toast.show(
        pins[same.id] ? `Tòa ${same.code} đã có trong phân khu này và đã được ghim` : `Tòa ${same.code} đã có trong phân khu này, hãy chọn ở tab "Chọn tòa nhà có sẵn"`,
        "error",
      );
      return;
    }
    setCreating(true);
    try {
      const created = await buildingService.create({ ...input, name: input.name.trim() });
      setTargets((cur) => [...cur, { id: created.id, code: created.name, sub }]);
      pinAt(created.id, fundType);
      toast.show(`Đã tạo tòa ${created.name} và ghim lên mặt bằng, nhớ bấm "Lưu vị trí"`);
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setCreating(false);
    }
  };

  const editorPins: EditorPin[] = useMemo(
    () =>
      Object.entries(pins).flatMap(([id, p]) => {
        const t = targets.find((x) => x.id === Number(id));
        return t ? [{ id: t.id, code: t.code, fundType: p.fundType, x: p.x, y: p.y }] : [];
      }),
    [pins, targets],
  );

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return targets.filter((t) => !k || t.code.toLowerCase().includes(k) || t.sub.toLowerCase().includes(k));
  }, [targets, keyword]);

  const header = (
    <AdminPageHeader
      soft
      breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: highRise ? "Quản lý mặt bằng" : "Quản lý mặt bằng quỹ căn" }]}
      title={highRise ? "Mặt bằng" : "Mặt bằng quỹ căn"}
      desc={
        highRise
          ? "Tải ảnh hoặc PDF mặt bằng, chọn một tòa nhà rồi bấm lên ảnh để gán vị trí, hoặc bấm thẳng lên ảnh để chọn tòa có sẵn / tạo tòa mới. Khách hàng bấm vào tòa để mở bảng hàng của tòa đó."
          : "Tải ảnh hoặc PDF mặt bằng, chọn một căn rồi bấm lên ảnh để gán vị trí, hoặc bấm thẳng lên ảnh để chọn căn có sẵn / tạo căn mới. Khách hàng bấm vào vị trí đó để mở form giữ chỗ đúng căn."
      }
      action={
        plan ? (
          <div className="flex flex-wrap items-center gap-3">
            {dirty && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-warning">Có thay đổi chưa lưu</span>}
            <button
              onClick={() => picker.current?.click()}
              disabled={busy}
              className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50 disabled:opacity-60"
            >
              <ImagePlus size={15} /> Thay ảnh / PDF
            </button>
            <button
              onClick={() => setDeleting(true)}
              disabled={busy}
              className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-60"
            >
              <Trash2 size={15} /> Xóa mặt bằng
            </button>
            <button
              onClick={() => void save()}
              disabled={busy || !dirty}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-50"
            >
              <Save size={15} /> {busy ? "Đang lưu..." : "Lưu vị trí"}
            </button>
          </div>
        ) : plan === null ? (
          <button
            onClick={() => picker.current?.click()}
            disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
          >
            <ImagePlus size={15} /> {busy ? "Đang tải lên..." : "Tải mặt bằng lên"}
          </button>
        ) : undefined
      }
    />
  );

  if (boot.status === "loading") {
    return (
      <div className="animate-page-in">
        {header}
        <div className="animate-pulse px-4 pb-10 md:px-8" aria-busy="true"><div className="h-96 rounded-2xl bg-primary-50" /></div>
      </div>
    );
  }

  if (boot.status === "error" || projectId === null) {
    return (
      <div className="animate-page-in">
        {header}
        <div role="alert" className="mx-4 rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-16 text-center md:mx-8">
          <p className="font-semibold text-heading">{boot.status === "error" ? "Không tải được danh sách dự án" : "Chưa có dự án nào"}</p>
        </div>
      </div>
    );
  }

  const imageReady = plan && size && size !== "error";

  return (
    <div className="animate-page-in">
      {header}
      <ProjectManageBar projectId={projectId} />

      <input ref={picker} type="file" accept="image/*,application/pdf" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />

      <div className="px-4 pb-12 md:px-8">
        {uploadingImage && (
          <div role="status" className="mb-4 rounded-2xl border border-primary-200 bg-primary-50/60 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-footer">
                Đang tải file mặt bằng: {uploadingImage.currentMB.toFixed(1)} / {uploadingImage.totalMB.toFixed(1)} MB ({uploadingImage.percent}%)
              </p>
              <span className="text-xs text-muted">
                Phần {uploadingImage.part}/{uploadingImage.totalParts} (chia nhỏ 5 MB/phần)
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-100">
              <div
                className="h-full bg-primary-600 transition-all duration-200"
                style={{ width: `${Math.max(5, uploadingImage.percent)}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-body">
                File dung lượng lớn đang được chia nhỏ.
              </p>
              <button
                type="button"
                onClick={() => {
                  imageJob.current?.abort();
                  pdfJob.current?.abort();
                }}
                className="rounded-lg border border-danger/30 bg-white px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10"
              >
                Hủy tải lên
              </button>
            </div>
          </div>
        )}
        {tiling && (
          <div role="status" className="mb-4 rounded-2xl border border-primary-200 bg-primary-50/60 px-5 py-4">
            <p className="text-sm font-semibold text-footer">
              Đang xử lý mặt bằng{tiling.total ? ` (${tiling.done}/${tiling.total})` : "..."}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-100">
              <div className="h-full bg-primary-600 transition-all" style={{ width: `${tiling.total ? (tiling.done / tiling.total) * 100 : 5}%` }} />
            </div>
            <p className="mt-2 text-xs text-body">
              File mặt bằng có kích thước lớn nên có thể mất nhiều phút. Mặt bằng chỉ được thay khi tải xong toàn bộ; đóng trang hoặc hủy giữa chừng thì mặt bằng cũ vẫn giữ nguyên.
            </p>
            <button
              type="button"
              onClick={() => pdfJob.current?.abort()}
              className="mt-3 rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-footer transition hover:bg-primary-50"
            >
              Hủy tải lên
            </button>
          </div>
        )}
        {plan === undefined ? (
          <div className="h-96 animate-pulse rounded-2xl bg-primary-50" aria-busy="true" />
        ) : plan === null ? (
          <button
            type="button"
            onClick={() => picker.current?.click()}
            disabled={busy}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary-200 bg-white px-6 py-20 text-center transition hover:border-primary-400 hover:bg-primary-50/40 disabled:opacity-60"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600"><ImagePlus size={28} /></span>
            <span className="text-xl font-semibold text-footer">{busy ? "Đang tải ảnh lên..." : highRise ? "Dự án chưa có mặt bằng" : "Dự án chưa có mặt bằng quỹ căn"}</span>
            <span className="text-sm text-body">Chọn ảnh mặt bằng (JPG, PNG, WebP, tối đa 200 MB) hoặc file PDF (tối đa 200 MB)</span>
            <span className="mt-2 flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200">
              <ImagePlus size={16} /> Chọn ảnh hoặc PDF
            </span>
          </button>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
            <div>
              {imageReady ? (
                <FloorPlanEditor
                  imageUrl={plan.imageUrl}
                  width={size.width}
                  height={size.height}
                  pins={editorPins}
                  activeId={activeId}
                  onPlace={place}
                  onMove={move}
                  onSelect={setActiveId}
                  pinScale={pinScale}
                  canPlace
                  pdfUrl={plan.pdfUrl}
                  pdfPage={plan.pdfPage}
              pdfMode={size.mode}
              pdfDensity={size.density}
                  pdfTiles={plan.tileBaseUrl && plan.tileLevels != null ? { baseUrl: plan.tileBaseUrl, levels: plan.tileLevels } : undefined}
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-white text-sm text-body">
                  {size === "error" ? (plan?.imageUrl ? "Không tải được ảnh mặt bằng." : "Không đọc được file PDF mặt bằng.") : "Đang tải ảnh mặt bằng..."}
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white px-4 py-3">
                <label htmlFor="pin-scale" className="text-sm font-semibold text-footer">Kích thước ghim</label>
                <input
                  id="pin-scale"
                  type="range"
                  min={PIN_SCALE.min}
                  max={PIN_SCALE.max}
                  step={PIN_SCALE.step}
                  value={pinScale}
                  onChange={(e) => {
                    setPinScale(Number(e.target.value));
                    setDirty(true);
                  }}
                  className="h-2 min-w-40 flex-1 accent-primary-600"
                />
                <span className="w-12 text-right text-sm font-semibold text-primary-700">{Math.round(pinScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => {
                    setPinScale(PIN_SCALE.default);
                    setDirty(true);
                  }}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-footer transition hover:bg-primary-50"
                >
                  Mặc định
                </button>
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-body">
                <MapPin size={14} className="text-primary-600" />
                {activeId === null
                  ? highRise
                    ? "Chọn một tòa nhà ở danh sách bên phải rồi bấm lên ảnh, hoặc bấm thẳng lên ảnh để chọn tòa có sẵn / tạo tòa mới. Kéo điểm để chỉnh lại."
                    : "Chọn một căn ở danh sách bên phải rồi bấm lên ảnh, hoặc bấm thẳng lên ảnh để chọn căn có sẵn / tạo căn mới. Kéo điểm để chỉnh lại."
                  : `Đang gán vị trí cho ${noun} ${targets.find((t) => t.id === activeId)?.code ?? ""}: bấm lên ảnh để đặt hoặc di chuyển.`}
              </p>
            </div>

            <aside className="flex max-h-[680px] flex-col rounded-2xl border border-line bg-white shadow-sm">
              <div className="border-b border-line p-4">
                <h2 className="font-semibold text-footer">
                  Danh sách {noun} <span className="text-xs font-normal text-muted">({Object.keys(pins).length}/{targets.length} đã gán)</span>
                </h2>
                <div className="relative mt-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={highRise ? "Tìm tòa nhà, phân khu..." : "Tìm mã căn, phân khu..."}
                    aria-label={`Tìm ${noun}`}
                    className="h-10 w-full rounded-xl border border-line pl-9 pr-3 text-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
                  />
                </div>
              </div>
              <ul className="flex-1 divide-y divide-line overflow-y-auto">
                {filtered.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm text-body">{targets.length === 0 ? `Dự án chưa có ${noun} nào.` : `Không có ${noun} phù hợp.`}</li>
                )}
                {filtered.map((u) => {
                  const pinned = !!pins[u.id];
                  const active = activeId === u.id;
                  const st = u.status ? STATUS[u.status] : undefined;
                  return (
                    <li key={u.id}>
                      <div className={`flex items-center gap-3 px-4 py-3 transition ${active ? "bg-primary-50" : "hover:bg-primary-50/50"}`}>
                        <button type="button" onClick={() => setActiveId(active ? null : u.id)} aria-pressed={active} className="min-w-0 flex-1 text-left">
                          <span className="flex items-center gap-2 text-sm font-semibold text-footer">
                            {u.code}
                            {pinned && <Check size={14} className="text-success" aria-label="Đã gán vị trí" />}
                          </span>
                          <span className="mt-0.5 flex items-center gap-2 text-[11px] text-body">
                            <span className="truncate">{u.sub}</span>
                            {st && <span className={`rounded-full px-2 py-0.5 font-semibold ${st.badge}`}>{st.label}</span>}
                          </span>
                        </button>
                        {/* Loại quỹ chỉ áp dụng cho ghim căn */}
                        {pinned && !highRise && (
                          <select
                            value={pins[u.id].fundType ?? ""}
                            onChange={(e) => changeFund(u.id, (e.target.value || null) as FundType | null)}
                            aria-label={`Loại quỹ căn ${u.code}`}
                            className="h-8 shrink-0 rounded-lg border border-line bg-white px-2 text-[11px] font-semibold outline-none focus:border-primary-300"
                            style={{ color: fundColor(pins[u.id].fundType) }}
                          >
                            <option value="">Chưa phân loại</option>
                            {FUND_TYPES.map((f) => (
                              <option key={f.key} value={f.key}>{f.label}</option>
                            ))}
                          </select>
                        )}
                        {pinned && (
                          <button type="button" onClick={() => unpin(u.id)} aria-label={`Gỡ vị trí ${noun} ${u.code}`} title="Gỡ vị trí" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-body transition hover:bg-danger/5 hover:text-danger">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </div>
        )}
      </div>

      {pdfFile && (
        <PdfPagePicker
          file={pdfFile}
          onClose={() => setPdfFile(null)}
          onConfirm={({ pdf, page }) => {
            setPdfFile(null);
            void uploadPdf(pdf, page);
          }}
        />
      )}

      {marking && projectId !== null && (
        <FloorPlanMarkingModal
          units={targets.filter((t) => !pins[t.id])}
          highRise={highRise}
          projectId={projectId}
          zones={zones}
          catalog={catalog}
          creating={creating}
          onClose={() => setMarking(null)}
          onSelect={selectUnit}
          onCreate={(input, images, fundType) => void createUnit(input, images, fundType)}
          onCreateBuilding={(input, fundType) => void createBuilding(input, fundType)}
        />
      )}

      {leaveGuard.target && (
        <ConfirmDialog
          title="Mặt bằng đang tải lên"
          message="Mặt bằng chưa tải xong. Rời trang bây giờ thì bản đang tải bị bỏ và mặt bằng cũ được giữ nguyên."
          confirmLabel="Rời trang"
          onConfirm={() => {
            pdfJob.current?.abort();
            imageJob.current?.abort();
            leaveGuard.leave();
          }}
          onClose={leaveGuard.stay}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Xóa mặt bằng quỹ căn?"
          message="Ảnh mặt bằng và toàn bộ vị trí đã gán sẽ bị xóa. Hành động này không thể hoàn tác."
          onConfirm={() => void removePlan()}
          onClose={() => setDeleting(false)}
        />
      )}
    </div>
  );
}
