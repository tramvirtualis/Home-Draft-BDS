import socialProjectService from "../../services/social/socialProjectService";
import { useDebouncedSearch } from "./useDebouncedSearch";

const searchProjects = (keyword: string) => socialProjectService.search(keyword);

// Tìm dự án theo tên để gắn vào bài đăng
export function useComposerProjectSearch(keyword: string) {
  return useDebouncedSearch(keyword, searchProjects);
}
