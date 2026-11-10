import { useEffect, useState } from "react";
import { projectService } from "../../services/project/projectService";
import type { PostProject } from "../../types/social/social.types";

// Tên + ảnh dự án cho đầu bảng tin khi lọc bài theo dự án (?project=<id>); null khi đang tải / không tìm thấy
export function useFeedProject(projectId: number | null) {
  const [project, setProject] = useState<PostProject | null>(null);

  useEffect(() => {
    setProject(null);
    if (projectId === null) return;
    let cancelled = false;
    projectService
      .getProject(projectId)
      .then(
        (p) =>
          !cancelled &&
          setProject({ id: p.id, name: p.name, location: p.location ?? null, imageUrl: p.overviewImage ?? null }),
      )
      .catch(() => {
        // Dự án đã ẩn / không tồn tại: banner chỉ hiện "Dự án", danh sách bài vẫn tải bình thường
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return project;
}
