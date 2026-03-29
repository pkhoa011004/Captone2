import {
  ChevronLeft,
  ChevronRight,
  Download,
  EllipsisVertical,
  Filter,
  Plus,
  Search,
  UserCircle2,
} from "lucide-react";

const summaryCards = [
  {
    label: "TOTAL USERS",
    value: "1,247",
    meta: "+4.5% from last month",
    metaClass: "text-slate-500",
    valueClass: "text-slate-900",
  },
  {
    label: "NEW THIS MONTH",
    value: "156",
    meta: "+12%",
    metaClass: "text-emerald-600",
    valueClass: "text-slate-900",
    hasIndicators: true,
  },
  {
    label: "ACTIVE NOW",
    value: "892",
    meta: "71.5% of total user base",
    metaClass: "text-slate-500",
    valueClass: "text-slate-900",
  },
  {
    label: "SUSPENDED",
    value: "24",
    meta: "Requires review",
    metaClass: "text-slate-500",
    valueClass: "text-rose-600",
  },
];

const users = [
  {
    name: "Nguyen Minh Thanh",
    email: "minhthanh@example.com",
    license: "B2",
    date: "Oct 12, 2023",
    status: "Active",
    performance: 92,
    tests: 14,
  },
  {
    name: "Thai Kim Ngoc",
    email: "thaikimngoc511@example.com",
    license: "B1",
    date: "Nov 02, 2023",
    status: "Pending",
    performance: 45,
    tests: 2,
  },
  {
    name: "Dinh Minh Cong",
    email: "dinhminhcong123@example.com",
    license: "C",
    date: "Oct 28, 2023",
    status: "Suspended",
    performance: 15,
    tests: 8,
  },
  {
    name: "Ta Hoang Huy",
    email: "hoanghuy@example.com",
    license: "B2",
    date: "Nov 15, 2023",
    status: "Active",
    performance: 78,
    tests: 5,
  },
];

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Suspended: "bg-rose-100 text-rose-700",
};

function PerformanceCell({ value, tests }) {
  const barClass =
    value >= 70
      ? "bg-blue-600"
      : value >= 40
        ? "bg-blue-400"
        : "bg-rose-500";

  return (
    <div className="flex min-w-[150px] items-center gap-3">
      <div className="h-1.5 w-20 rounded-full bg-blue-100">
        <div className={`h-1.5 rounded-full ${barClass}`} style={{ width: `${value}%` }} />
      </div>
      <p className="text-xs font-semibold text-slate-500">
        {value}% ({tests} tests)
      </p>
    </div>
  );
}

export function AdminUserManagement() {
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Oversee student progress, instructor credentials, and platform access.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border border-blue-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]"
          >
            <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">
              {card.label}
            </p>
            <p className={`mt-1 text-3xl font-extrabold ${card.valueClass}`}>{card.value}</p>

            <div className="mt-2 flex items-center gap-2">
              <p className={`text-xs font-semibold ${card.metaClass}`}>{card.meta}</p>
              {card.hasIndicators ? (
                <div className="flex items-center -space-x-2">
                  <span className="h-4 w-4 rounded-full border border-white bg-slate-200" />
                  <span className="h-4 w-4 rounded-full border border-white bg-emerald-500" />
                  <span className="h-4 w-4 rounded-full border border-white bg-blue-500" />
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50/70 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-100"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-100"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold tracking-[0.14em] text-slate-500">
                <th className="w-10 px-2 py-3">
                  <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" />
                </th>
                <th className="px-2 py-3">USER</th>
                <th className="px-2 py-3">LICENSE</th>
                <th className="px-2 py-3">REG. DATE</th>
                <th className="px-2 py-3">STATUS</th>
                <th className="px-2 py-3">PERFORMANCE</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email} className="border-b border-slate-100">
                  <td className="px-2 py-3">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" />
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <UserCircle2 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                        <p className="text-[11px] text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-xs font-semibold text-slate-600">
                    {user.license}
                  </td>
                  <td className="px-2 py-3 text-xs text-slate-500">{user.date}</td>
                  <td className="px-2 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[user.status]}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <PerformanceCell value={user.performance} tests={user.tests} />
                  </td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`Row actions for ${user.name}`}
                    >
                      <EllipsisVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Showing 1 to 4 of 1,247 results</p>

          <div className="flex items-center gap-1.5">
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
                    : "text-slate-500 hover:bg-blue-50 hover:text-slate-800"
                }`}
              >
                {page}
              </button>
            ))}
            <span className="px-1 text-xs text-slate-400">...</span>
            <button
              type="button"
              className="h-7 w-7 rounded-md text-xs font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-slate-800"
            >
              11
            </button>
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
    </div>
  );
}
