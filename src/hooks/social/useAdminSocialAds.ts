import { useCallback, useEffect, useState } from "react";
import { adminSocialAdService } from "../../services/social/socialAdService";
import type { SocialAd } from "../../types/social/socialAd.types";

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; ads: SocialAd[] };

// Trang quản lý quảng cáo cộng đồng: tải danh sách các vị trí
export function useAdminSocialAds() {
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    adminSocialAdService
      .list()
      .then((ads) => !cancelled && setLoad({ status: "ready", ads }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [reload]);

  // Một vị trí vừa lưu / gỡ xong: cập nhật tại chỗ, không tải lại cả trang
  const updateSlot = useCallback((slot: number, ad: SocialAd | null) => {
    setLoad((cur) =>
      cur.status !== "ready" ? cur : { status: "ready", ads: [...cur.ads.filter((a) => a.slot !== slot), ...(ad ? [ad] : [])] },
    );
  }, []);

  const retry = () => {
    setLoad({ status: "loading" });
    setReload((n) => n + 1);
  };

  return { load, updateSlot, retry };
}
