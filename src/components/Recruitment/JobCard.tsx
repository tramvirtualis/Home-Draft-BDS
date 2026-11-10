import { Link } from "react-router-dom";
import {
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";
import JobBadge from "./JobBadge";
import RecruiterAvatar from "./RecruiterAvatar";
import CompanyLogo from "../Employer/CompanyLogo";
import ApplyButton from "../JobDetail/ApplyButton";
import { useAppliedJobs } from "../../hooks/job/useAppliedJobs";
import {
  EMPLOYMENT_TYPE_LABEL,
  EXPERIENCE_LEVEL_LABEL,
  type Job,
} from "../../types/job/job.types";
import { daysLeft, formatSalary, formatUpdated } from "../../utils/jobUtils";

const labelClass = "text-[11px] uppercase tracking-wide text-muted";

export default function JobCard({
  job,
  saved,
  onToggleSave,
}: {
  job: Job;
  saved: boolean;
  onToggleSave: (id: number) => void;
}) {
  const left = daysLeft(job.deadline);
  // Sắp hết hạn (≤ 7 ngày): tô đỏ cam cho nổi
  const urgent = left !== null && left > 0 && left <= 7;
  const { isApplied } = useAppliedJobs();

  return (
    // @container: bố cục theo bề rộng của chính thẻ (thẻ có thể nằm trong cột hẹp ở tablet), không theo bề rộng màn hình
    <article className="@container relative rounded-3xl border border-line bg-white p-4 @md:p-5 shadow-sm transition hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100">
      <div className="flex items-start gap-3 @md:gap-4">
        {/* Tin nhà tuyển dụng: logo công ty; tin nội bộ: ảnh người đăng */}
        {job.company ? (
          <CompanyLogo
            name={job.company.name}
            logoUrl={job.company.logoUrl}
            className="h-11 w-11 @md:h-14 @md:w-14"
          />
        ) : (
          job.recruiter && (
            <RecruiterAvatar recruiter={job.recruiter} size="h-11 w-11 @md:h-14 @md:w-14" />
          )
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {job.jobType && <JobBadge>{job.jobType.name}</JobBadge>}
            {job.employmentType && (
              <JobBadge>{EMPLOYMENT_TYPE_LABEL[job.employmentType]}</JobBadge>
            )}
          </div>
          <h3 className="mt-2 text-lg font-medium leading-snug text-heading @md:text-xl">
            <Link
              to={`/jobs/${job.id}`}
              className="hover:text-primary-600 after:rounded-3xl after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary-500"
            >
              {job.title}
            </Link>
          </h3>
          {(job.company || job.recruiter || job.department) && (
            <p className="mt-0.5 truncate text-sm font-semibold text-primary-600">
              {/* Tin nhà tuyển dụng hiện tên công ty, tin nội bộ hiện người đăng */}
              {[job.company?.name ?? job.recruiter?.fullName, job.department]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onToggleSave(job.id)}
          aria-pressed={saved}
          aria-label={saved ? "Bỏ lưu tin" : "Lưu tin"}
          className={`relative z-10 flex h-10 w-10 shrink-0 items-center @md:h-11 @md:w-11 justify-center rounded-full transition ${
            saved
              ? "bg-primary-600 text-white"
              : "bg-primary-50 text-primary-600 hover:bg-primary-100"
          }`}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 rounded-2xl bg-primary-50 px-4 py-3">
        <div>
          <p className={labelClass}>Thu nhập dự kiến</p>
          <p className="mt-0.5 text-lg font-medium text-primary-600 @md:text-xl">
            {formatSalary(
              job.salaryMin,
              job.salaryMax,
              job.currency,
              job.salaryNegotiable
            )}
          </p>
        </div>
        {!!job.quantity && (
          <div className="@md:text-right">
            <p className={labelClass}>Số lượng</p>
            <p className="mt-0.5 text-sm font-medium text-heading">
              {job.quantity} người
            </p>
          </div>
        )}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-body">
        {job.location && (
          <li className="flex items-center gap-1.5">
            <MapPin size={14} className="text-muted" aria-hidden />
            {job.location}
          </li>
        )}
        {job.experienceLevel && (
          <li className="flex items-center gap-1.5">
            <Briefcase size={14} className="text-muted" aria-hidden />
            {EXPERIENCE_LEVEL_LABEL[job.experienceLevel]}
          </li>
        )}
        {job.department && (
          <li className="flex items-center gap-1.5">
            <Building2 size={14} className="text-muted" aria-hidden />
            {job.department}
          </li>
        )}
        {job.experience && (
          <li className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-muted" aria-hidden />
            Kinh nghiệm {job.experience}
          </li>
        )}
      </ul>

      {/* Thẻ hẹp: hạn nộp ở trên, nút ứng tuyển tràn ngang bên dưới; thẻ rộng: cùng một hàng */}
      <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 @md:flex-row @md:items-center @md:justify-between">
        <p className="flex items-center gap-2 text-xs">
          <Clock size={15} className={urgent ? "text-pop-500" : "text-warning"} aria-hidden />
          <span className={`font-semibold ${urgent ? "text-pop-600" : "text-heading"}`}>
            {left === null
              ? "Không giới hạn"
              : left > 0
              ? `Còn ${left} ngày`
              : "Đã hết hạn"}
          </span>
          <span className="hidden text-muted @md:inline">
            · {formatUpdated(job.updatedAt)}
          </span>
        </p>
        <ApplyButton
          applied={isApplied(job.id)}
          to={`/jobs/${job.id}?apply=1`}
          className="h-11 w-full px-6 @md:w-auto @md:min-w-44"
        />
      </div>
    </article>
  );
}
