import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  FileQuestion,
  Gauge,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { adminExamsApi } from "../../services/api/AdminExams";

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

const formatPercent = (value) => {
  if (value === null || value === undefined) return "--";
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "--";
  return `${numericValue.toFixed(1)}%`;
};

const formatSourceLabel = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "exam_250") return "Question Bank 250";
  if (normalized === "exam_600") return "Question Bank 600";
  if (normalized === "manual") return "Manual";
  return value || "--";
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const validationErrors = error?.response?.data?.errors;
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors[0];
  }

  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const formatDateTime = (value) => {
  if (!value) return "--";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "--";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
};

export function AdminExamDetails() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchExamDetail = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await adminExamsApi.getExamManagementDetail(examId);

        if (!isActive) return;
        setDetail(data);
      } catch (apiError) {
        if (!isActive) return;
        setDetail(null);
        setError(getApiErrorMessage(apiError, "Failed to load exam details."));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchExamDetail();

    return () => {
      isActive = false;
    };
  }, [examId]);

  const exam = detail?.exam || {};
  const sourceLabel = detail?.sourceLabel || formatSourceLabel(exam.source);
  const statusKey = exam.status || "Unavailable";
  const statusClass = statusStyles[statusKey] || statusStyles.Unavailable;

  const statCards = useMemo(
    () => [
      {
        label: "QUESTIONS",
        value: formatInteger(exam.questionCount),
        icon: FileQuestion,
        iconClass: "bg-blue-100 text-blue-600",
      },
      {
        label: "DURATION",
        value: exam.durationMinutes ? `${exam.durationMinutes} min` : "--",
        icon: Clock3,
        iconClass: "bg-cyan-100 text-cyan-600",
      },
      {
        label: "PASS SCORE",
        value: exam.passScore || "--",
        icon: ShieldCheck,
        iconClass: "bg-emerald-100 text-emerald-600",
      },
      {
        label: "SEC / QUESTION",
        value: detail?.estimatedSecondsPerQuestion ? `${detail.estimatedSecondsPerQuestion}s` : "--",
        icon: Gauge,
        iconClass: "bg-amber-100 text-amber-600",
      },
    ],
    [detail?.estimatedSecondsPerQuestion, exam.durationMinutes, exam.passScore, exam.questionCount],
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/exams")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-white text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
            aria-label="Back to exam list"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {exam.title || "Exam Detail"}
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Exam ID: {exam.id || "--"}</p>
          </div>
        </div>

        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass}`}>
          {statusKey}
        </span>
      </section>

      {error ? (
        <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-xl border border-blue-100 bg-white p-10 text-center text-sm font-semibold text-slate-500">
          Loading exam details...
        </section>
      ) : detail ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <article
                key={card.label}
                className="rounded-xl border border-blue-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
              >
                <span
                  className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
                >
                  <card.icon className="h-5 w-5" />
                </span>
                <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">{card.value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <h2 className="text-lg font-extrabold text-slate-900">Overview</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold tracking-[0.1em] text-slate-500">LICENSE</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{exam.licenseType || "--"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.1em] text-slate-500">SOURCE</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{sourceLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.1em] text-slate-500">QUESTION BANK TOTAL</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{formatInteger(exam.questionBankTotal)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.1em] text-slate-500">BANK COVERAGE</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatPercent(detail.questionCoveragePercent)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.1em] text-slate-500">CREATED AT</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{formatDateTime(exam.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.1em] text-slate-500">UPDATED AT</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{formatDateTime(exam.updatedAt)}</p>
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                <Layers3 className="h-5 w-5 text-blue-600" />
                Category Breakdown
              </h2>

              <div className="mt-4 space-y-3">
                {(detail.categoryDistribution || []).length > 0 ? (
                  detail.categoryDistribution.map((item) => (
                    <div key={item.category}>
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                        <p className="text-xs font-bold text-slate-500">
                          {formatInteger(item.count)} ({formatPercent(item.percentage)})
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-blue-100">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${Math.min(Math.max(item.percentage, 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-medium text-slate-500">No category distribution available.</p>
                )}
              </div>
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
}
