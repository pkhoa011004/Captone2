import {
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  EllipsisVertical,
  FileEdit,
  Search,
  Waves,
} from "lucide-react";

const summaryCards = [
  {
    label: "Total Exams",
    value: "24",
    icon: FileEdit,
    meta: "+12 this month",
  },
  {
    label: "Active Exams",
    value: "18",
    icon: BadgeCheck,
  },
  {
    label: "Draft Exams",
    value: "6",
    icon: Waves,
  },
  {
    label: "Avg Pass Rate",
    value: "84.2%",
    icon: Waves,
    highlighted: true,
  },
];

const examRows = [
  {
    id: "EX-001",
    title: "De thi ly thuyet B2 - Bo so 60",
    modified: "Last modified: Oct 12, 2023",
    license: "B2",
    questions: 35,
    time: "22 min",
    passScore: "32/35",
    status: "Active",
    attempts: "1,247",
    passRate: 87,
  },
  {
    id: "EX-002",
    title: "De thi ly thuyet B2 - Bo so 56",
    modified: "Last modified: Oct 15, 2023",
    license: "B2",
    questions: 35,
    time: "22 min",
    passScore: "32/35",
    status: "Active",
    attempts: "982",
    passRate: 82,
  },
  {
    id: "EX-003",
    title: "De thi ly thuyet B2 - Bo so 6",
    modified: "Last modified: Oct 10, 2023",
    license: "B2",
    questions: 35,
    time: "22 min",
    passScore: "32/35",
    status: "Active",
    attempts: "756",
    passRate: 79,
  },
  {
    id: "EX-004",
    title: "De thi sat hach hang C - De so 1",
    modified: "Last modified: Nov 01, 2023",
    license: "C",
    questions: 40,
    time: "24 min",
    passScore: "36/40",
    status: "Active",
    attempts: "842",
    passRate: 76,
  },
  {
    id: "EX-005",
    title: "Hang B1 ly thuyet - De on tap 05",
    modified: "Last modified: 4 hours ago",
    license: "B1",
    questions: 30,
    time: "20 min",
    passScore: "27/30",
    status: "Draft",
    attempts: "0",
    passRate: null,
  },
  {
    id: "EX-006",
    title: "De thi hang A1 - Bo de so 4",
    modified: "Last modified: Nov 16, 2023",
    license: "A1",
    questions: 25,
    time: "19 min",
    passScore: "21/25",
    status: "Active",
    attempts: "2,410",
    passRate: 92,
  },
  {
    id: "EX-007",
    title: "De thi ly thuyet B2 - De so 4",
    modified: "Last modified: Oct 21, 2023",
    license: "B2",
    questions: 35,
    time: "22 min",
    passScore: "32/35",
    status: "Active",
    attempts: "512",
    passRate: 85,
  },
  {
    id: "EX-008",
    title: "Bo de mo phong B2 - De so 7",
    modified: "Last modified: Oct 23, 2023",
    license: "B2",
    questions: 35,
    time: "22 min",
    passScore: "32/35",
    status: "Active",
    attempts: "421",
    passRate: 88,
  },
  {
    id: "EX-009",
    title: "De thi ly thuyet B2 - Bo so 65",
    modified: "Last modified: Oct 25, 2023",
    license: "B2",
    questions: 35,
    time: "22 min",
    passScore: "32/35",
    status: "Active",
    attempts: "389",
    passRate: 91,
  },
  {
    id: "EX-010",
    title: "De thi ly thuyet B2 - Bo so 65",
    modified: "Last modified: Oct 28, 2023",
    license: "B2",
    questions: 35,
    time: "22 min",
    passScore: "32/35",
    status: "Active",
    attempts: "256",
    passRate: 84,
  },
];

const statusStyles = {
  Active: "text-emerald-600",
  Draft: "text-amber-600",
};

function StatusCell({ status }) {
  const dotColor = status === "Active" ? "bg-emerald-500" : "bg-amber-500";

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${statusStyles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}

function PassRateCell({ passRate }) {
  if (passRate == null) {
    return <span className="text-xs font-semibold text-slate-400">N/A</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-600">{passRate}%</span>
      <span className="h-1.5 w-14 rounded-full bg-blue-100">
        <span className="block h-1.5 rounded-full bg-blue-600" style={{ width: `${passRate}%` }} />
      </span>
    </div>
  );
}

export function AdminExamManagement() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-blue-500">ADMIN &gt; CURRICULUM</p>
          <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900">Exam Management</h1>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-500">Last database sync</p>
          <p className="text-xs font-bold text-blue-600">2 minutes ago</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const cardClass = card.highlighted
            ? "border-blue-600 bg-blue-700 text-white"
            : "border-blue-100 bg-white text-slate-900";

          return (
            <article
              key={card.label}
              className={`rounded-xl border p-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)] ${cardClass}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                    card.highlighted ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {card.meta ? (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-600">
                    {card.meta}
                  </span>
                ) : null}
              </div>
              <p className={`text-xs font-semibold ${card.highlighted ? "text-blue-100" : "text-slate-500"}`}>
                {card.label}
              </p>
              <p className={`mt-1 text-4xl font-extrabold tracking-tight ${card.highlighted ? "text-white" : "text-slate-900"}`}>
                {card.value}
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] md:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by exam title or license..."
              className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50/70 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
            />
          </label>

          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-semibold text-slate-600 transition hover:bg-blue-100"
          >
            All Licenses
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-semibold text-slate-600 transition hover:bg-blue-100"
          >
            All Status
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-semibold text-slate-600 transition hover:bg-blue-100"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold tracking-[0.14em] text-slate-500">
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">EXAM TITLE</th>
                <th className="px-3 py-3">LICENSE</th>
                <th className="px-3 py-3">QUESTIONS</th>
                <th className="px-3 py-3">TIME</th>
                <th className="px-3 py-3">PASS SCORE</th>
                <th className="px-3 py-3">STATUS</th>
                <th className="px-3 py-3">ATTEMPTS</th>
                <th className="px-3 py-3">PASS RATE</th>
                <th className="px-3 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {examRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="px-3 py-4 text-xs font-bold text-blue-600">{row.id}</td>
                  <td className="px-3 py-4">
                    <p className="text-sm font-semibold text-slate-800">{row.title}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{row.modified}</p>
                  </td>
                  <td className="px-3 py-4">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {row.license}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-xs font-semibold text-slate-600">{row.questions}</td>
                  <td className="px-3 py-4 text-xs font-semibold text-slate-600">{row.time}</td>
                  <td className="px-3 py-4 text-xs font-bold text-blue-600">{row.passScore}</td>
                  <td className="px-3 py-4">
                    <StatusCell status={row.status} />
                  </td>
                  <td className="px-3 py-4 text-xs font-semibold text-slate-600">{row.attempts}</td>
                  <td className="px-3 py-4">
                    <PassRateCell passRate={row.passRate} />
                  </td>
                  <td className="px-3 py-4 text-right">
                    <button
                      type="button"
                      className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`Actions for ${row.id}`}
                    >
                      <EllipsisVertical className="ml-auto h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing 1 to 10 of 24 exams</p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-slate-700"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type="button"
                className={`h-7 w-7 rounded-md text-xs font-semibold transition ${
                  page === 1
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-blue-50 hover:text-slate-900"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-slate-700"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <p className="text-center text-[10px] font-semibold tracking-[0.14em] text-slate-400">
        POWERED BY DRIVEMASTER EDITORIAL ENGINE V2.4
      </p>
    </div>
  );
}
