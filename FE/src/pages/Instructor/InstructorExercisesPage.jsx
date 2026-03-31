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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const summaryCards = [
  {
    label: "Total Exams",
    value: "24",
    icon: ClipboardList,
    trend: "+2 this month",
    trendClass: "text-emerald-600",
  },
  {
    label: "Active Exams",
    value: "18",
    icon: ShieldCheck,
  },
  {
    label: "Draft Exams",
    value: "6",
    icon: FileText,
  },
  {
    label: "AVG PASS RATE",
    value: "84.2 %",
    icon: TrendingUp,
  },
];

const examRows = [
  {
    id: "#EX-801",
    title: "De thi ly thuyet B2 - De so 1",
    lastEdit: "Last edited: 2 days ago",
    license: "B2",
    licenseClass: "bg-blue-100 text-blue-700",
    questions: 35,
    time: "22 min",
    status: "Active",
    passRate: "88.5%",
    attempts: "142 attempts",
  },
  {
    id: "#EX-802",
    title: "De thi sat hach hang C - De so 1",
    lastEdit: "Last edited: 5 days ago",
    license: "C",
    licenseClass: "bg-amber-100 text-amber-700",
    questions: 40,
    time: "25 min",
    status: "Active",
    passRate: "76.2%",
    attempts: "87 attempts",
  },
  {
    id: "#EX-803",
    title: "De thi ly thuyet A1 - Co ban",
    lastEdit: "Last edited: Yesterday",
    license: "A1",
    licenseClass: "bg-slate-200 text-slate-600",
    questions: 25,
    time: "19 min",
    status: "Draft",
    passRate: "N/A",
    attempts: "0 attempts",
  },
  {
    id: "#EX-804",
    title: "De thi ly thuyet B1 - Tu dong",
    lastEdit: "Last edited: 1 week ago",
    license: "B1",
    licenseClass: "bg-purple-100 text-purple-700",
    questions: 30,
    time: "20 min",
    status: "Active",
    passRate: "92.1%",
    attempts: "210 attempts",
  },
];

const statusStyles = {
  Active: "text-emerald-600",
  Draft: "text-amber-600",
};

export function InstructorExercisesPage() {
  const navigate = useNavigate();

  const handleEditExam = (examId) => {
    navigate(`/instructor/exercises/${examId}`);
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
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search exams by title or ID..."
              className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50/40 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
            />
          </label>

          <button
            type="button"
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-blue-100 bg-blue-50/40 px-3 text-xs font-semibold text-slate-600"
          >
            All Licenses
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-blue-100 bg-blue-50/40 px-3 text-xs font-semibold text-slate-600"
          >
            All Status
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

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
              {examRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="px-3 py-4 text-xs font-semibold text-slate-400">
                    {row.id}
                  </td>
                  <td className="px-3 py-4">
                    <p className="text-sm font-semibold text-slate-800">
                      {row.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {row.lastEdit}
                    </p>
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.licenseClass}`}
                    >
                      {row.license}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-xs font-semibold text-slate-700">
                    {row.questions}
                  </td>
                  <td className="px-3 py-4 text-xs font-semibold text-slate-700">
                    {row.time}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${statusStyles[row.status]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${row.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`}
                      />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <p className="text-xs font-bold text-slate-700">
                      {row.passRate}
                    </p>
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
                        onClick={() =>
                          navigate(`/instructor/exercises/${row.id}/duplicate`)
                        }
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-400">Showing 1 to 4 of 24 exams</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-slate-700"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type="button"
                className={`h-7 w-7 rounded-md text-xs font-semibold ${
                  page === 1
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-blue-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-slate-700"
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
      </section>
    </div>
  );
}
