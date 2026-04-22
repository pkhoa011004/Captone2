import { useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileCheck2,
  FileText,
  Layers3,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminExamsApi } from "../../services/api/AdminExams";

const PAGE_SIZE = 10;

const EMPTY_SUMMARY = {
  totalExams: null,
  publishedExams: null,
  draftExams: null,
  unavailableExams: null,
  totalLicenseTypes: null,
  averageQuestions: null,
};

const EMPTY_PAGINATION = {
  page: 1,
  limit: PAGE_SIZE,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const EMPTY_FILTERS = {
  licenses: [],
  sources: [],
  statuses: [],
};

const FALLBACK_LICENSE_OPTIONS = [
  { value: "A1", label: "A1", count: 0 },
  { value: "B1", label: "B1", count: 0 },
];

const FALLBACK_SOURCE_OPTIONS = [
  { value: "exam_250", label: "exam_250", count: 0 },
  { value: "exam_600", label: "exam_600", count: 0 },
];

const FALLBACK_STATUS_OPTIONS = [
  { value: "Published", label: "Published", count: 0 },
  { value: "Draft", label: "Draft", count: 0 },
  { value: "Unavailable", label: "Unavailable", count: 0 },
];

const statusStyles = {
  Published: "bg-emerald-100 text-emerald-700",
  Draft: "bg-amber-100 text-amber-700",
  Unavailable: "bg-slate-200 text-slate-600",
};

const integerFormatter = new Intl.NumberFormat("en-US");

const formatInteger = (value) => {
  if (value === null || value === undefined) return "--";
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "--";
  return integerFormatter.format(numericValue);
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const validationErrors = error?.response?.data?.errors;
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors[0];
  }

  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const formatFilterOptionLabel = (label, count) => {
  if (count === null || count === undefined) return String(label || "");
  return `${String(label || "")} (${formatInteger(count)})`;
};

const formatSourceLabel = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "exam_250") return "Question Bank 250";
  if (normalized === "exam_600") return "Question Bank 600";
  if (normalized === "manual") return "Manual";
  return value || "--";
};

const buildVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
};

export function AdminExamManagement() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [exams, setExams] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await adminExamsApi.getExamManagementData({
          search: searchText,
          licenseType: licenseFilter,
          source: sourceFilter,
          status: statusFilter,
          page: currentPage,
          limit: PAGE_SIZE,
        });

        if (!isActive) return;

        setSummary(data.summary || EMPTY_SUMMARY);
        setPagination(data.pagination || EMPTY_PAGINATION);
        setFilters(data.filters || EMPTY_FILTERS);
        setExams(Array.isArray(data.exams) ? data.exams : []);

        if (data?.pagination?.page && data.pagination.page !== currentPage) {
          setCurrentPage(data.pagination.page);
        }
      } catch (apiError) {
        if (!isActive) return;

        setSummary(EMPTY_SUMMARY);
        setPagination(EMPTY_PAGINATION);
        setFilters(EMPTY_FILTERS);
        setExams([]);
        setError(getApiErrorMessage(apiError, "Failed to load exam management data."));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [searchText, licenseFilter, sourceFilter, statusFilter, currentPage]);

  useEffect(() => {
    const validLicenseValues = new Set((filters.licenses || []).map((option) => String(option.value || "").toUpperCase()));
    if (licenseFilter && validLicenseValues.size > 0 && !validLicenseValues.has(String(licenseFilter).toUpperCase())) {
      setLicenseFilter("");
      setCurrentPage(1);
    }
  }, [filters.licenses, licenseFilter]);

  useEffect(() => {
    const validSourceValues = new Set((filters.sources || []).map((option) => String(option.value || "").toLowerCase()));
    if (sourceFilter && validSourceValues.size > 0 && !validSourceValues.has(String(sourceFilter).toLowerCase())) {
      setSourceFilter("");
      setCurrentPage(1);
    }
  }, [filters.sources, sourceFilter]);

  useEffect(() => {
    const validStatusValues = new Set((filters.statuses || []).map((option) => String(option.value || "")));
    if (statusFilter && validStatusValues.size > 0 && !validStatusValues.has(String(statusFilter))) {
      setStatusFilter("");
      setCurrentPage(1);
    }
  }, [filters.statuses, statusFilter]);

  const summaryCards = useMemo(() => {
    return [
      {
        label: "TOTAL EXAMS",
        value: formatInteger(summary.totalExams),
        icon: FileText,
        iconClass: "bg-blue-100 text-blue-600",
      },
      {
        label: "PUBLISHED",
        value: formatInteger(summary.publishedExams),
        icon: FileCheck2,
        iconClass: "bg-emerald-100 text-emerald-600",
      },
      {
        label: "DRAFT",
        value: formatInteger(summary.draftExams),
        icon: BookOpenCheck,
        iconClass: "bg-amber-100 text-amber-600",
      },
      {
        label: "LICENSE TYPES",
        value: formatInteger(summary.totalLicenseTypes),
        icon: Layers3,
        iconClass: "bg-cyan-100 text-cyan-600",
      },
    ];
  }, [
    summary.totalExams,
    summary.publishedExams,
    summary.draftExams,
    summary.totalLicenseTypes,
  ]);

  const totalItems = pagination.totalItems ?? 0;
  const startRow = totalItems === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endRow = totalItems === 0 ? 0 : Math.min(pagination.page * pagination.limit, totalItems);
  const visiblePages = buildVisiblePages(pagination.page, pagination.totalPages || 1);
  const hasActiveFilters = Boolean(searchText || licenseFilter || sourceFilter || statusFilter);
  const licenseFilterOptions = (filters.licenses || []).length > 0
    ? filters.licenses
    : FALLBACK_LICENSE_OPTIONS;
  const sourceFilterOptions = (filters.sources || []).length > 0
    ? filters.sources
    : FALLBACK_SOURCE_OPTIONS;
  const statusFilterOptions = (filters.statuses || []).length > 0
    ? filters.statuses
    : FALLBACK_STATUS_OPTIONS;

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    setCurrentPage(1);
  };

  const handleLicenseFilterChange = (event) => {
    setLicenseFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleSourceFilterChange = (event) => {
    setSourceFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchText("");
    setLicenseFilter("");
    setSourceFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const handleViewExamDetails = (examId) => {
    const normalizedExamId = String(examId || "").trim();
    if (!normalizedExamId) return;
    navigate(`/admin/exams/${encodeURIComponent(normalizedExamId)}`);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Exam Management</h1>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="min-h-[140px] rounded-xl border border-blue-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]"
          >
            <div className="mb-7">
              <span
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${card.iconClass}`}
              >
                <card.icon className="h-6 w-6" />
              </span>
            </div>

            <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Search exams by code, title, source..."
              className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50/70 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={licenseFilter}
              onChange={handleLicenseFilterChange}
              className="h-10 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-slate-600 outline-none transition hover:bg-blue-100"
            >
              <option value="">All Licenses</option>
              {licenseFilterOptions.map((option) => (
                <option key={option.value || "license-option"} value={option.value}>
                  {formatFilterOptionLabel(option.label || option.value, option.count)}
                </option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={handleSourceFilterChange}
              className="h-10 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-slate-600 outline-none transition hover:bg-blue-100"
            >
              <option value="">All Sources</option>
              {sourceFilterOptions.map((option) => (
                <option key={option.value || "source-option"} value={option.value}>
                  {formatFilterOptionLabel(formatSourceLabel(option.label || option.value), option.count)}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="h-10 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-slate-600 outline-none transition hover:bg-blue-100"
            >
              <option value="">All Statuses</option>
              {statusFilterOptions.map((option) => (
                <option key={option.value || "status-option"} value={option.value}>
                  {formatFilterOptionLabel(option.label || option.value, option.count)}
                </option>
              ))}
            </select>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold tracking-[0.14em] text-slate-500">
                <th className="px-2 py-3">EXAM ID</th>
                <th className="px-2 py-3">EXAM TITLE</th>
                <th className="px-2 py-3">LICENSE</th>
                <th className="px-2 py-3">SOURCE</th>
                <th className="px-2 py-3">QUESTIONS</th>
                <th className="px-2 py-3">DURATION</th>
                <th className="px-2 py-3">PASS SCORE</th>
                <th className="px-2 py-3">STATUS</th>
                <th className="px-2 py-3">DETAIL</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-2 py-10 text-center text-sm font-medium text-slate-500">
                    Loading exams...
                  </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-2 py-10 text-center text-sm font-medium text-slate-500">
                    No exams found.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => {
                  const statusKey = exam.status || "Unavailable";
                  const statusClass = statusStyles[statusKey] || statusStyles.Unavailable;

                  return (
                    <tr key={exam.id || `${exam.licenseType}-${exam.source}`} className="border-b border-slate-100">
                      <td className="px-2 py-3 text-xs font-bold text-blue-600">
                        {exam.id ? (
                          <button
                            type="button"
                            onClick={() => handleViewExamDetails(exam.id)}
                            className="rounded px-1 py-0.5 transition hover:bg-blue-50 hover:text-blue-700"
                          >
                            {exam.id}
                          </button>
                        ) : (
                          "--"
                        )}
                      </td>
                      <td className="px-2 py-3 text-sm font-semibold text-slate-800">{exam.title || "--"}</td>
                      <td className="px-2 py-3 text-xs font-semibold text-slate-600">{exam.licenseType || "--"}</td>
                      <td className="px-2 py-3 text-xs font-semibold text-slate-600">
                        {formatSourceLabel(exam.source)}
                      </td>
                      <td className="px-2 py-3 text-xs font-semibold text-slate-600">
                        {formatInteger(exam.questionCount)}
                      </td>
                      <td className="px-2 py-3 text-xs font-semibold text-slate-600">
                        {exam.durationMinutes ? `${exam.durationMinutes} min` : "--"}
                      </td>
                      <td className="px-2 py-3 text-xs font-bold text-blue-600">{exam.passScore || "--"}</td>
                      <td className="px-2 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
                        >
                          {statusKey}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => handleViewExamDetails(exam.id)}
                          disabled={!exam.id}
                          className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Showing {startRow} to {endRow} of {formatInteger(totalItems)} results
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={!pagination.hasPreviousPage || isLoading}
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {visiblePages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setCurrentPage(pageNumber)}
                disabled={isLoading}
                className={`h-7 w-7 rounded-md text-xs font-semibold transition ${
                  pageNumber === pagination.page
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-blue-50 hover:text-slate-800"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
