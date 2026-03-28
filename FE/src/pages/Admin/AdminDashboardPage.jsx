import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  DollarSign,
  Download,
  HardDrive,
  School,
  Server,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const kpiCards = [
  {
    title: "TOTAL USERS",
    value: "1,247",
    trend: 12,
    icon: Users,
    iconStyle: "bg-blue-100 text-blue-700",
  },
  {
    title: "ACTIVE LEARNERS",
    value: "892",
    trend: 5.4,
    icon: UserCheck,
    iconStyle: "bg-amber-100 text-amber-700",
  },
  {
    title: "PASS RATE",
    value: "87.3%",
    trend: -1.2,
    icon: BadgeCheck,
    iconStyle: "bg-slate-200 text-slate-700",
  },
  {
    title: "REVENUE",
    value: "$45,200",
    trend: 21,
    icon: DollarSign,
    iconStyle: "bg-emerald-100 text-emerald-700",
  },
];

const monthlyRegistrationData = [
  { month: "JAN", registrations: 124 },
  { month: "FEB", registrations: 132 },
  { month: "MAR", registrations: 114 },
  { month: "APR", registrations: 168 },
  { month: "MAY", registrations: 236 },
  { month: "JUN", registrations: 228 },
  { month: "JUL", registrations: 154 },
  { month: "AUG", registrations: 252 },
];

const passRateByLicense = [
  { name: "CLASS B1", rate: 92 },
  { name: "CLASS B2", rate: 78 },
  { name: "CLASS C", rate: 64 },
];

const recentUsers = [
  {
    name: "Thai Kim Ngoc",
    email: "thaikimngoc511@example.com",
    license: "B1",
    date: "Mar 9, 2026",
    status: "ACTIVE",
  },
  {
    name: "Dinh Minh Cong",
    email: "congdinh@webmail.com",
    license: "B2",
    date: "Mar 10, 2026",
    status: "PENDING",
  },
  {
    name: "Ta Hoang Huy",
    email: "thhuy@academy.edu",
    license: "C",
    date: "Feb 28, 2026",
    status: "ACTIVE",
  },
  {
    name: "Nguyen Minh Thanh",
    email: "thanh123@provider.net",
    license: "B1",
    date: "Apr 2, 2026",
    status: "OFFLINE",
  },
];

const quickActions = [
  { label: "Add Instructor", icon: UserPlus },
  { label: "Create Class", icon: School },
  { label: "System Alert", icon: BellRing },
  { label: "Export Data", icon: Download },
];

const systemStatus = [
  {
    name: "API Status",
    state: "OPERATIONAL",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "3D Simulator",
    state: "ONLINE",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "AI Service",
    state: "RUNNING",
    dot: "bg-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
];

const alerts = [
  {
    title: "Pending user registrations",
    description: "24 applications require manual ID verification.",
    action: "Review",
    icon: ShieldCheck,
    cardStyle: "bg-rose-50 border-rose-200",
    iconStyle: "bg-rose-700 text-white",
    actionStyle: "text-rose-700",
  },
  {
    title: "Server storage at 70% capacity",
    description: "Recommended: Archive video logs from Q2.",
    action: "Manage",
    icon: HardDrive,
    cardStyle: "bg-amber-50 border-amber-200",
    iconStyle: "bg-amber-700 text-white",
    actionStyle: "text-amber-700",
  },
];

const statusStyles = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  OFFLINE: "bg-slate-200 text-slate-600",
};

const panelClasses =
  "rounded-2xl border border-blue-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]";

export function AdminDashboardPage() {
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-blue-50 p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Welcome back, Admin
          </h1>
          <p className="mt-2 text-sm text-slate-500 md:text-base">
            {dateLabel} | System Status: Optimal
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl border border-blue-200 bg-blue-100 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-200"
          >
            View Audit Logs
          </button>
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Generate Report
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.trend >= 0;
          const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

          return (
            <article key={card.title} className={`${panelClasses} p-5`}>
              <div className="flex items-start justify-between">
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${card.iconStyle}`}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold ${
                    isPositive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  <TrendIcon className="h-4 w-4" />
                  {isPositive ? "+" : ""}
                  {card.trend}%
                </span>
              </div>

              <p className="mt-6 text-xs font-bold tracking-[0.12em] text-slate-500">
                {card.title}
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                {card.value}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className={`${panelClasses} p-6 lg:col-span-2`}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Monthly Registrations</h2>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700"
              >
                Monthly
              </button>
              <button type="button" className="rounded-md px-3 py-1 text-slate-500">
                Yearly
              </button>
            </div>
          </div>

          <div className="h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyRegistrationData}
                margin={{ top: 12, right: 8, left: -24, bottom: 6 }}
              >
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <YAxis hide domain={[90, 280]} />
                <Tooltip
                  cursor={{ stroke: "#93c5fd", strokeDasharray: "4 4" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #bfdbfe",
                    boxShadow: "0 10px 25px rgba(37,99,235,0.15)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: "#1d4ed8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={`${panelClasses} p-6`}>
          <h2 className="text-xl font-bold text-slate-900">Pass Rate by License</h2>

          <div className="mt-6 space-y-5">
            {passRateByLicense.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between text-xs font-bold tracking-[0.08em] text-slate-500">
                  <span>{item.name}</span>
                  <span>{item.rate}%</span>
                </div>
                <div className="h-3 rounded-full bg-blue-100">
                  <div
                    className="h-3 rounded-full bg-blue-600"
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-slate-600">
            <p>
              <span className="font-bold text-blue-700">Insight:</span> Class B1
              remains our strongest category this quarter with an 8% increase in
              first-time passes.
            </p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className={`${panelClasses} overflow-hidden lg:col-span-2`}>
          <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">Recent Users</h2>
            <button
              type="button"
              className="text-sm font-semibold text-blue-700 transition hover:text-blue-600"
            >
              View All
            </button>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-blue-50 text-[11px] font-bold tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">NAME</th>
                  <th className="px-6 py-4">EMAIL</th>
                  <th className="px-6 py-4">LICENSE</th>
                  <th className="px-6 py-4">DATE</th>
                  <th className="px-6 py-4">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.email} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-semibold text-slate-900">{user.name}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                        {user.license}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[user.status]}`}
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="space-y-6">
          <article className={`${panelClasses} p-6`}>
            <h3 className="text-sm font-bold tracking-[0.14em] text-slate-500">
              QUICK ACTIONS
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.label}
                    type="button"
                    className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-4 text-center transition hover:border-blue-300 hover:bg-white"
                  >
                    <Icon className="mx-auto h-5 w-5 text-blue-700" />
                    <span className="mt-2 block text-[11px] font-bold text-slate-700">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </article>

          <article className={`${panelClasses} p-6`}>
            <h3 className="text-sm font-bold tracking-[0.14em] text-slate-500">
              SYSTEM STATUS
            </h3>
            <ul className="mt-5 space-y-4">
              {systemStatus.map((item) => (
                <li key={item.name} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                    {item.name}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-bold tracking-[0.08em] ${item.badge}`}
                  >
                    {item.state}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className={`${panelClasses} p-6`}>
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <Server className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900">Platform Alerts</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {alerts.map((alertItem) => {
            const AlertIcon = alertItem.icon;

            return (
              <article
                key={alertItem.title}
                className={`flex flex-col gap-4 rounded-2xl border p-5 md:flex-row md:items-center md:justify-between ${alertItem.cardStyle}`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${alertItem.iconStyle}`}
                  >
                    <AlertIcon className="h-5 w-5" />
                  </span>

                  <div>
                    <h3 className="font-bold text-slate-900">{alertItem.title}</h3>
                    <p className="text-sm text-slate-600">{alertItem.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`self-start text-sm font-bold transition hover:opacity-70 md:self-auto ${alertItem.actionStyle}`}
                >
                  {alertItem.action}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
