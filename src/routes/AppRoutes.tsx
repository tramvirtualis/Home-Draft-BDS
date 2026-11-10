import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import AuthLayout from "../layouts/AuthLayout";
import AccountLayout from "../layouts/AccountLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AdminLayout from "../layouts/AdminLayout";
import EmployerLayout from "../layouts/EmployerLayout";
import ToastProvider from "../components/common/Toast";
import NotificationRealtime from "../components/Notification/NotificationRealtime";
import GlobalLoadingOverlay from "../components/common/GlobalLoadingOverlay";
import PageFallback from "../components/common/PageFallback";

// Mỗi trang tách 1 file JS riêng, chỉ tải khi mở trang đó. Chờ tải: layout hiện PageFallback ở vùng nội dung
const ProjectsPage = lazy(() => import("../pages/Project/List/ProjectsPage"));
const ProjectDetailPage = lazy(
  () => import("../pages/Project/Detail/ProjectDetailPage")
);
const ProjectLocationPage = lazy(
  () => import("../pages/Project/Detail/ProjectLocationPage")
);
const ProjectZonesPage = lazy(
  () => import("../pages/Project/Detail/ProjectZonesPage")
);
const ProjectFloorPlanPage = lazy(
  () => import("../pages/Project/Detail/ProjectFloorPlanPage")
);
const ProjectInventoryPage = lazy(
  () => import("../pages/Project/Detail/ProjectInventoryPage")
);
const ProjectComparePage = lazy(
  () => import("../pages/Project/Detail/ProjectComparePage")
);
const ProjectPolicyPage = lazy(
  () => import("../pages/Project/Detail/ProjectPolicyPage")
);
const ProjectProgressPage = lazy(
  () => import("../pages/Project/Detail/ProjectProgressPage")
);
const ProjectDocumentsPage = lazy(
  () => import("../pages/Project/Detail/ProjectDocumentsPage")
);
const ProjectNewsPage = lazy(
  () => import("../pages/Project/Detail/ProjectNewsPage")
);
const ProjectTourPage = lazy(
  () => import("../pages/Project/Detail/ProjectTourPage")
);
const ProjectSalesSheetsPage = lazy(
  () => import("../pages/Project/Detail/ProjectSalesSheetsPage")
);
const ProjectBuildingsPage = lazy(
  () => import("../pages/Project/Detail/ProjectBuildingsPage")
);
const EventsPage = lazy(() => import("../pages/Event/EventsPage"));
const KnowledgePage = lazy(() => import("../pages/Knowledge/KnowledgePage"));
const KnowledgeDetailPage = lazy(
  () => import("../pages/Knowledge/KnowledgeDetailPage")
);
const KnowledgeCategoriesPage = lazy(
  () => import("../pages/Knowledge/KnowledgeCategoriesPage")
);
const KnowledgeCategoryPage = lazy(
  () => import("../pages/Knowledge/KnowledgeCategoryPage")
);
const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/Auth/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("../pages/Auth/ForgotPasswordPage")
);
const MyBookingsPage = lazy(() => import("../pages/Account/MyBookingsPage"));
const FavoritesPage = lazy(() => import("../pages/Account/FavoritesPage"));
const ProfilePage = lazy(() => import("../pages/Account/ProfilePage"));
const ApplicationHistoryPage = lazy(
  () => import("../pages/Account/ApplicationHistoryPage")
);
const NotificationsPage = lazy(
  () => import("../pages/Account/NotificationsPage")
);
const SavedJobsPage = lazy(() => import("../pages/Account/SavedJobsPage"));
const MyCvsPage = lazy(() => import("../pages/Account/MyCvsPage"));
const RecruitmentPage = lazy(
  () => import("../pages/Recruitment/RecruitmentPage")
);
const CvBuilderPage = lazy(() => import("../pages/CvBuilder/CvBuilderPage"));
const JobDetailPage = lazy(() => import("../pages/JobDetail/JobDetailPage"));
const EventDetailPage = lazy(() => import("../pages/Event/EventDetailPage"));
const NewsPage = lazy(() => import("../pages/News/NewsPage"));
const NewsDetailPage = lazy(() => import("../pages/News/NewsDetailPage"));
const SocialPage = lazy(() => import("../pages/Social/SocialPage"));
const AdminProjectsPage = lazy(
  () => import("../pages/Admin/Project/AdminProjectsPage")
);
const AdminDashboardPage = lazy(
  () => import("../pages/Admin/AdminDashboardPage")
);
const AdminUsersPage = lazy(() => import("../pages/Admin/User/AdminUsersPage"));
const AdminUserFormPage = lazy(
  () => import("../pages/Admin/User/AdminUserFormPage")
);
const AdminRolesPage = lazy(() => import("../pages/Admin/User/AdminRolesPage"));
const AdminProjectDetailPage = lazy(
  () => import("../pages/Admin/Project/AdminProjectDetailPage")
);
const AdminProjectFormPage = lazy(
  () => import("../pages/Admin/Project/AdminProjectFormPage")
);
const ProjectImagesPage = lazy(
  () => import("../pages/Admin/Project/ProjectImagesPage")
);
const AmenitiesManagementPage = lazy(
  () => import("../pages/Admin/Project/AmenitiesManagementPage")
);
const BookingsManagementPage = lazy(
  () => import("../pages/Admin/Project/BookingsManagementPage")
);
const FloorPlanManagementPage = lazy(
  () => import("../pages/Admin/Project/FloorPlanManagementPage")
);
const BuildingsManagementPage = lazy(
  () => import("../pages/Admin/Project/BuildingsManagementPage")
);
const SalesSheetsManagementPage = lazy(
  () => import("../pages/Admin/Project/SalesSheetsManagementPage")
);
const VideosManagementPage = lazy(
  () => import("../pages/Admin/Project/VideosManagementPage")
);
const ToursManagementPage = lazy(
  () => import("../pages/Admin/Project/ToursManagementPage")
);
const LocationManagementPage = lazy(
  () => import("../pages/Admin/Project/LocationManagementPage")
);
const StaffManagementPage = lazy(
  () => import("../pages/Admin/Project/StaffManagementPage")
);
const QuestionsManagementPage = lazy(
  () => import("../pages/Admin/Project/QuestionsManagementPage")
);
const ProjectPoliciesPage = lazy(
  () => import("../pages/Admin/Project/ProjectPoliciesPage")
);
const ProgressManagementPage = lazy(
  () => import("../pages/Admin/Project/ProgressManagementPage")
);
const ProjectDocumentsManagementPage = lazy(
  () => import("../pages/Admin/Project/ProjectDocumentsManagementPage")
);
const PropertyProjectsPage = lazy(
  () => import("../pages/Admin/Project/PropertyProjectsPage")
);
const PropertyManagementPage = lazy(
  () => import("../pages/Admin/Project/PropertyManagementPage")
);
const AdminNewsPage = lazy(() => import("../pages/Admin/AdminNewsPage"));
const AdminNewsFormPage = lazy(
  () => import("../pages/Admin/AdminNewsFormPage")
);
const AdminDocumentsPage = lazy(
  () => import("../pages/Admin/Document/AdminDocumentsPage")
);
const AdminDocumentFormPage = lazy(
  () => import("../pages/Admin/Document/AdminDocumentFormPage")
);
const AdminDocumentCategoriesPage = lazy(
  () => import("../pages/Admin/Document/AdminDocumentCategoriesPage")
);
const AdminEventsPage = lazy(() => import("../pages/Admin/AdminEventsPage"));
const AdminEventFormPage = lazy(
  () => import("../pages/Admin/AdminEventFormPage")
);
const AdminJobsPage = lazy(() => import("../pages/Admin/AdminJobsPage"));
const AdminJobFormPage = lazy(() => import("../pages/Admin/AdminJobFormPage"));
const AdminJobTypesPage = lazy(
  () => import("../pages/Admin/AdminJobTypesPage")
);
const AdminApplicationsPage = lazy(
  () => import("../pages/Admin/AdminApplicationsPage")
);
const AdminPostsPage = lazy(
  () => import("../pages/Admin/Social/AdminPostsPage")
);
const AdminPostFormPage = lazy(
  () => import("../pages/Admin/Social/AdminPostFormPage")
);
const AdminSocialAdsPage = lazy(
  () => import("../pages/Admin/Social/AdminSocialAdsPage")
);
const AdminPostBackgroundsPage = lazy(
  () => import("../pages/Admin/Social/AdminPostBackgroundsPage")
);
const AdminPostReportReasonsPage = lazy(
  () => import("../pages/Admin/Social/AdminPostReportReasonsPage")
);
const AdminPostReportsPage = lazy(
  () => import("../pages/Admin/Social/AdminPostReportsPage")
);
const AdminNotificationsPage = lazy(
  () => import("../pages/Admin/AdminNotificationsPage")
);
const AdminNotificationTypesPage = lazy(
  () => import("../pages/Admin/AdminNotificationTypesPage")
);
const AdminPlaceholderPage = lazy(
  () => import("../pages/Admin/AdminPlaceholderPage")
);
const AdminChatbotPage = lazy(() => import("../pages/Admin/AdminChatbotPage"));
const AdminCvTemplatesPage = lazy(
  () => import("../pages/Admin/AdminCvTemplatesPage")
);
const AdminCvTemplateFormPage = lazy(
  () => import("../pages/Admin/AdminCvTemplateFormPage")
);
const AdminCompaniesPage = lazy(
  () => import("../pages/Admin/AdminCompaniesPage")
);
const AdminCompanyDetailPage = lazy(
  () => import("../pages/Admin/AdminCompanyDetailPage")
);
const AdminAuditLogsPage = lazy(
  () => import("../pages/Admin/AdminAuditLogsPage")
);
const EmployerPage = lazy(() => import("../pages/Account/EmployerPage"));
const EmployerJobsPage = lazy(
  () => import("../pages/Employer/EmployerJobsPage")
);
const EmployerJobFormPage = lazy(
  () => import("../pages/Employer/EmployerJobFormPage")
);
const EmployerApplicationsPage = lazy(
  () => import("../pages/Employer/EmployerApplicationsPage")
);
const HomePage = lazy(() => import("../pages/Home/HomePage"));
const HomePage2 = lazy(() => import("../pages/Home2/HomePage2"));
const HomePage3 = lazy(() => import("../pages/Home3/HomePage3"));
const HomePage4 = lazy(() => import("../pages/Home4/HomePage4"));
const HomePage5 = lazy(() => import("../pages/Home5/HomePage5"));
const HomePage6 = lazy(() => import("../pages/Home6/HomePage6"));
const HomeClassicPage = lazy(
  () => import("../pages/HomeClassic/HomeClassicPage")
);
const PrivacyPolicyPage = lazy(
  () => import("../pages/Legal/PrivacyPolicyPage")
);
const TermsOfServicePage = lazy(
  () => import("../pages/Legal/TermsOfServicePage")
);

const AppRoutes = () => {
  return (
    // Trang không có layout (trang chủ) cũng cần chỗ chờ tải
    <Suspense fallback={<PageFallback fullScreen />}>
      <Routes>
        {/* Trang chủ (src/pages/Home): có footer riêng, header dùng HavenHeader bản tối.
            Tự bọc Toast + thông báo realtime + vòng loading vì không nằm trong UserLayout. */}
        <Route
          path="/"
          element={
            <ToastProvider>
              <NotificationRealtime />
              <GlobalLoadingOverlay />
              <HomePage />
            </ToastProvider>
          }
        />
        {/* Trang chủ nháp 2 để so sánh: bố cục hành trình 5 chương */}
        <Route
          path="/home-2"
          element={
            <ToastProvider>
              <NotificationRealtime />
              <GlobalLoadingOverlay />
              <HomePage2 />
            </ToastProvider>
          }
        />
        {/* Trang chủ nháp 3 để so sánh: bố cục kiểu ứng dụng tìm nhà */}
        <Route
          path="/home-3"
          element={
            <ToastProvider>
              <NotificationRealtime />
              <GlobalLoadingOverlay />
              <HomePage3 />
            </ToastProvider>
          }
        />
        {/* Trang chủ nháp 4 để so sánh: phong cách nước */}
        <Route
          path="/home-4"
          element={
            <ToastProvider>
              <NotificationRealtime />
              <GlobalLoadingOverlay />
              <HomePage4 />
            </ToastProvider>
          }
        />
        {/* Trang chủ nháp 5 để so sánh: bố cục giống /home-2, nội dung theo bản trang chủ Hubtech */}
        <Route
          path="/home-5"
          element={
            <ToastProvider>
              <NotificationRealtime />
              <GlobalLoadingOverlay />
              <HomePage5 />
            </ToastProvider>
          }
        />
        {/* Trang chủ nháp 6 để so sánh: dải xanh đậm xen dải trắng, theo ảnh mẫu thiết kế */}
        <Route
          path="/home-6"
          element={
            <ToastProvider>
              <NotificationRealtime />
              <GlobalLoadingOverlay />
              <HomePage6 />
            </ToastProvider>
          }
        />
        {/* Trang chủ cổ điển để so sánh (bố cục bản 3 cũ, màu vàng + navy) */}
        <Route
          path="/home-classic"
          element={
            <ToastProvider>
              <NotificationRealtime />
              <GlobalLoadingOverlay />
              <HomeClassicPage />
            </ToastProvider>
          }
        />

        {/* Chung một khung: đổi trang chỉ lật thẻ, nền + khu 3D giữ nguyên */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route element={<UserLayout />}>
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route
            path="/projects/:id/location"
            element={<ProjectLocationPage />}
          />
          <Route path="/projects/:id/zones" element={<ProjectZonesPage />} />
          <Route
            path="/projects/:id/buildings"
            element={<ProjectBuildingsPage />}
          />
          <Route
            path="/projects/:id/floor-plans"
            element={<ProjectFloorPlanPage />}
          />
          <Route
            path="/projects/:id/sales-sheets"
            element={<ProjectSalesSheetsPage />}
          />
          <Route
            path="/projects/:id/sales-sheet"
            element={<ProjectSalesSheetsPage />}
          />
          <Route
            path="/projects/:id/inventory"
            element={<ProjectInventoryPage />}
          />
          <Route
            path="/projects/:id/compare"
            element={<ProjectComparePage />}
          />
          <Route path="/projects/:id/tour-360" element={<ProjectTourPage />} />
          <Route path="/projects/:id/policy" element={<ProjectPolicyPage />} />
          <Route
            path="/projects/:id/progress"
            element={<ProjectProgressPage />}
          />
          <Route
            path="/projects/:id/documents"
            element={<ProjectDocumentsPage />}
          />
          <Route path="/projects/:id/news" element={<ProjectNewsPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route
            path="/knowledge/danh-muc"
            element={<KnowledgeCategoriesPage />}
          />
          <Route
            path="/knowledge/danh-muc/:slug"
            element={<KnowledgeCategoryPage />}
          />
          <Route path="/knowledge/:slug" element={<KnowledgeDetailPage />} />
          <Route path="/jobs" element={<RecruitmentPage />} />
          <Route path="/jobs/create-cv" element={<CvBuilderPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          {/* Khách xem được bảng tin; đăng bài / thích / bình luận mới cần đăng nhập */}
          <Route path="/social" element={<SocialPage />} />
          {/* Trang pháp lý công khai (Google OAuth bắt buộc có khi lên Production) */}
          <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicyPage />} />
          <Route path="/dieu-khoan" element={<TermsOfServicePage />} />
          {/* Các trang cần đăng nhập: chưa đăng nhập → về /login */}
          <Route element={<ProtectedRoute />}>
            {/* Trang tài khoản: nằm trong UserLayout để có Header/Footer, AccountLayout thêm sidebar */}
            <Route element={<AccountLayout />}>
              <Route path="/account" element={<ProfilePage />} />
              <Route path="/account/bookings" element={<MyBookingsPage />} />
              <Route path="/account/favorites" element={<FavoritesPage />} />
              <Route
                path="/applications"
                element={<ApplicationHistoryPage />}
              />
              <Route path="/account/saved-jobs" element={<SavedJobsPage />} />
              <Route path="/account/cvs" element={<MyCvsPage />} />
              <Route path="/account/employer" element={<EmployerPage />} />
              <Route
                path="/account/notifications"
                element={<NotificationsPage />}
              />
            </Route>
            {/* Khu nhà tuyển dụng: EmployerLayout tự chặn nếu công ty chưa được duyệt */}
            <Route path="/employer" element={<EmployerLayout />}>
              <Route index element={<Navigate to="jobs" replace />} />
              <Route path="jobs" element={<EmployerJobsPage />} />
              <Route path="jobs/new" element={<EmployerJobFormPage />} />
              <Route path="jobs/:id/edit" element={<EmployerJobFormPage />} />
              <Route
                path="applications"
                element={<EmployerApplicationsPage />}
              />
            </Route>
          </Route>
        </Route>

        {/* Khu quản trị: SUPER_ADMIN hoặc role có quyền; từng trang cần quyền gì xem config/adminAccess */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="users/:id/edit" element={<AdminUserFormPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="posts" element={<AdminPostsPage />} />
            <Route path="posts/new" element={<AdminPostFormPage />} />
            <Route path="posts/:id/edit" element={<AdminPostFormPage />} />
            <Route path="social-ads" element={<AdminSocialAdsPage />} />
            <Route
              path="post-backgrounds"
              element={<AdminPostBackgroundsPage />}
            />
            <Route
              path="post-report-reasons"
              element={<AdminPostReportReasonsPage />}
            />
            <Route path="post-reports" element={<AdminPostReportsPage />} />
            <Route path="news" element={<AdminNewsPage />} />
            <Route path="news/new" element={<AdminNewsFormPage />} />
            <Route path="news/:id/edit" element={<AdminNewsFormPage />} />
            <Route path="documents" element={<AdminDocumentsPage />} />
            <Route path="documents/new" element={<AdminDocumentFormPage />} />
            <Route
              path="documents/:id/edit"
              element={<AdminDocumentFormPage />}
            />
            <Route
              path="document-categories"
              element={<AdminDocumentCategoriesPage />}
            />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="events/new" element={<AdminEventFormPage />} />
            <Route path="events/:id/edit" element={<AdminEventFormPage />} />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="jobs/new" element={<AdminJobFormPage />} />
            <Route path="jobs/:id/edit" element={<AdminJobFormPage />} />
            <Route path="job-types" element={<AdminJobTypesPage />} />
            <Route path="applications" element={<AdminApplicationsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route
              path="notification-types"
              element={<AdminNotificationTypesPage />}
            />
            <Route path="cv-templates" element={<AdminCvTemplatesPage />} />
            <Route path="chatbot" element={<AdminChatbotPage />} />
            <Route
              path="cv-templates/new"
              element={<AdminCvTemplateFormPage />}
            />
            <Route
              path="cv-templates/:id/edit"
              element={<AdminCvTemplateFormPage />}
            />
            <Route path="companies" element={<AdminCompaniesPage />} />
            <Route path="companies/:id" element={<AdminCompanyDetailPage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="projects/new" element={<AdminProjectFormPage />} />
            <Route path="projects/:id" element={<AdminProjectDetailPage />} />
            <Route
              path="projects/:id/edit"
              element={<AdminProjectFormPage />}
            />
            <Route path="project-images" element={<ProjectImagesPage />} />

            <Route
              path="project-floor-plan"
              element={<FloorPlanManagementPage />}
            />
            <Route
              path="project-buildings"
              element={<BuildingsManagementPage />}
            />
            <Route
              path="project-sales-sheets"
              element={<SalesSheetsManagementPage />}
            />
            <Route path="bookings" element={<BookingsManagementPage />} />
            <Route
              path="project-amenities"
              element={<AmenitiesManagementPage />}
            />
            <Route path="project-videos" element={<VideosManagementPage />} />
            <Route path="project-tours" element={<ToursManagementPage />} />
            <Route
              path="project-location"
              element={<LocationManagementPage />}
            />
            <Route path="project-staff" element={<StaffManagementPage />} />
            <Route
              path="project-questions"
              element={<QuestionsManagementPage />}
            />
            <Route path="project-policies" element={<ProjectPoliciesPage />} />

            <Route
              path="project-progress"
              element={<ProgressManagementPage />}
            />
            <Route
              path="project-documents"
              element={<ProjectDocumentsManagementPage />}
            />
            <Route path="properties" element={<PropertyProjectsPage />} />
            <Route path="properties/:id" element={<PropertyManagementPage />} />
            <Route path="*" element={<AdminPlaceholderPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
