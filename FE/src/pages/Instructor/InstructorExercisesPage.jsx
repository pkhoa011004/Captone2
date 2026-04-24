import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  ClipboardList,
  Copy,
  FilePenLine,
  FileText,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Loader,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import adminExamsApi from "../../services/api/AdminExams";

const statusStyles = {
  Active: "text-emerald-600",
  Unavailable: "text-slate-500",
};

const getLicenseClass = (licenseType) => {
  const normalized = String(licenseType || "").trim().toUpperCase();
  if (normalized === "B1") return "bg-purple-100 text-purple-700";
  if (normalized === "A1") return "bg-slate-200 text-slate-600";
  return "bg-blue-100 text-blue-700";
};

const mapExamToRow = (exam = {}) => {
  const license = String(exam.licenseType || "A1").trim().toUpperCase();
  const status = String(exam.status || "").trim().toLowerCase();
  const normalizedStatus =
    status === "unavailable" || status === "archived" || status === "inactive"
        ? "Unavailable"
        : "Active";

  return {
    id: (() => {
      const rawId = String(exam.id || "--").trim();
      if (!rawId || rawId === "--") return "--";
      return rawId.startsWith("#") ? rawId : `#${rawId}`;
    })(),
    title:
      String(exam.title || exam.examName || "").trim() ||
      `De thi ly thuyet ${license} - Moi tao`,
    lastEdit: exam.updatedAt
      ? `Last edited: ${new Date(exam.updatedAt).toLocaleDateString()}`
      : exam.createdAt
        ? `Last edited: ${new Date(exam.createdAt).toLocaleDateString()}`
        : "Last edited: just now",
    license,
    licenseClass: getLicenseClass(license),
    questions: Number(exam.questionCount || (license === "B1" ? 35 : 25)),
    time: `${Number(exam.durationMinutes || (license === "B1" ? 22 : 19))} min`,
    status: normalizedStatus,
    passRate: String(exam.passScore || "N/A"),
    attempts: "0 attempts",
  };
};

export function InstructorExercisesPage() {
  const navigate = useNavigate();
  const [summaryCards, setSummaryCards] = useState([]);
  const [examRows, setExamRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tokenReady, setTokenReady] = useState(false);

  // Setup test token IMMEDIATELY on mount if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // For testing: create a test token with admin role
      const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NjUyMzUwMywiZXhwIjoxNzc2NjA5OTAzfQ.AzS4RUXwqqBsT7qR8uR6tF1WcwNj3yffho1fUdfjLSY";
      localStorage.setItem("token", testToken);
      console.log("[Setup] Test token set");
    }
    // Mark token as ready
    setTokenReady(true);
  }, []);

  // Fetch summary data
  useEffect(() => {
    if (!tokenReady) return; // Wait for token to be set
    
    const fetchSummary = async () => {
      try {
        console.log("[InstructorExercisesPage] Fetching summary...");
        const token = localStorage.getItem("token");
        console.log("[InstructorExercisesPage] Token before fetch:", token ? "EXISTS" : "NOT FOUND");
        
        const data = await adminExamsApi.getInstructorExamManagementData({ page: 1, limit: 1 });

        const cards = [
          {
            label: "Total Exams",
            value: String(data.summary?.totalExams || 0),
            icon: ClipboardList,
            trend: null,
            trendClass: "",
          },
          {
            label: "Active Exams",
            value: String(data.summary?.publishedExams || 0),
            icon: ShieldCheck,
            trend: null,
            trendClass: "",
          },
          {
            label: "Draft Exams",
            value: String(data.summary?.draftExams || 0),
            icon: FileText,
            trend: null,
            trendClass: "",
          },
          {
            label: "AVG PASS RATE",
            value: `${data.summary?.averagePassRate || 0}%`,
            icon: TrendingUp,
            trend: null,
            trendClass: "",
          },
        ];

        setSummaryCards(cards);
      } catch (err) {
        console.error("Error fetching summary:", err);
        setError("Failed to load summary data");
      }
    };

    fetchSummary();
  }, [tokenReady]);

  // Fetch exams list
  useEffect(() => {
    if (!tokenReady) return; // Wait for token to be set
    
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminExamsApi.getInstructorExamManagementData({
          page: currentPage,
          limit: 10,
        });

        // Map API response to UI format
        const rows = (data.exams || []).map((exam) => {
          const licenseColorMap = {
            A1: "bg-slate-200 text-slate-600",
            B1: "bg-purple-100 text-purple-700",
            B2: "bg-blue-100 text-blue-700",
            C: "bg-amber-100 text-amber-700",
          };

          const normalizedStatus = String(exam.status || "").trim().toLowerCase();
          const status =
            normalizedStatus === "unavailable" ||
            normalizedStatus === "archived" ||
            normalizedStatus === "inactive"
              ? "Unavailable"
              : "Active";

          return {
            id: exam.id,
            title: exam.title || "Untitled Exam",
            lastEdit: exam.updatedAt ? `Last edited: ${new Date(exam.updatedAt).toLocaleDateString()}` : "Last edited: Unknown",
            license: exam.licenseType || "A1",
            licenseClass: licenseColorMap[exam.licenseType] || "bg-slate-200 text-slate-600",
            questions: exam.questionCount || 0,
            time: `${exam.durationMinutes || 19} min`,
            status: status,
            passRate: exam.passScore || "N/A",
            attempts: "0 attempts",
          };
        });

        setExamRows(rows);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError("Failed to load exams");
        setExamRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [currentPage, tokenReady]);

  const handleEditExam = (examId) => {
    navigate(`/instructor/exercises/${examId}`);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 3;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Exercises &amp; Exams
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage practice tests and exercises
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            View Reports
          </button>
          <button
            type="button"
            onClick={() => navigate("/instructor/create-exam")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            Create Exam
          </button>
        </div>
      </section>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="rounded-xl border border-blue-100 bg-white p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Icon className="h-4 w-4" />
                </span>
                {card.trend ? (
                  <span className={`text-[10px] font-bold ${card.trendClass}`}>
                    {card.trend}
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] font-semibold text-slate-500">
                {card.label}
              </p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900">
                {card.value}
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-xl border border-blue-100 bg-white p-3 md:p-4">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search exams by title or ID..."
              className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50/40 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
              disabled={loading}
            />
          </label>

          <button
            type="button"
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-blue-100 bg-blue-50/40 px-3 text-xs font-semibold text-slate-600"
            disabled={loading}
          >
            All Licenses
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-blue-100 bg-blue-50/40 px-3 text-xs font-semibold text-slate-600"
            disabled={loading}
          >
            All Status
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-slate-600">Loading exams...</span>
          </div>
        )}

        {!loading && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold tracking-[0.14em] text-slate-400">
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">EXAM TITLE</th>
                    <th className="px-3 py-3">LICENSE</th>
                    <th className="px-3 py-3">QUESTIONS</th>
                    <th className="px-3 py-3">TIME</th>
                    <th className="px-3 py-3">STATUS</th>
                    <th className="px-3 py-3">PASS RATE</th>
                    <th className="px-3 py-3">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {examRows.length > 0 ? (
                    examRows.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="px-3 py-4 text-xs font-semibold text-slate-400">{row.id}</td>
                        <td className="px-3 py-4">
                          <p className="text-sm font-semibold text-slate-800">{row.title}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">{row.lastEdit}</p>
                        </td>
                        <td className="px-3 py-4">
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.licenseClass}`}>
                            {row.license}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-xs font-semibold text-slate-700">{row.questions}</td>
                        <td className="px-3 py-4 text-xs font-semibold text-slate-700">{row.time}</td>
                        <td className="px-3 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${statusStyles[row.status] || statusStyles.Active}`}>
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                row.status === "Unavailable" ? "bg-slate-400" : "bg-emerald-500"
                              }`}
                            />
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <p className="text-xs font-bold text-slate-700">{row.passRate}</p>
                          <p className="text-[10px] text-slate-400">{row.attempts}</p>
                        </td>
                        <td className="px-3 py-4">
                          <div className="inline-flex items-center gap-2 text-slate-400">
                            <button
                              type="button"
                              onClick={() => handleEditExam(row.id)}
                              className="rounded p-1 hover:bg-blue-50 hover:text-blue-600"
                              aria-label={`Edit ${row.id}`}
                            >
                              <FilePenLine className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/instructor/exercises/${row.id}/duplicate`)}
                              className="rounded p-1 hover:bg-blue-50 hover:text-blue-600"
                              aria-label={`Duplicate ${row.id}`}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              className="rounded p-1 hover:bg-rose-50 hover:text-rose-600"
                              aria-label={`Delete ${row.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-3 py-8 text-center text-sm text-slate-500">
                        No exams found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-400">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-slate-700 disabled:opacity-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageClick(page)}
                    disabled={loading}
                    className={`h-7 w-7 rounded-md text-xs font-semibold ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-blue-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                  className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-slate-700 disabled:opacity-50"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              className="ml-auto mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)] hover:bg-blue-500"
              aria-label="Quick create exam"
            >
              <CirclePlus className="h-4 w-4" />
            </button>
          </>
        )}
      </section>
    </div>
  );
}
