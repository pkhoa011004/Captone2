import {
  Activity,
  AlarmClock,
  BadgeCheck,
  Clock3,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const summaryMetrics = [
  {
    label: "Avg. Session Duration",
    value: "45m",
    icon: Clock3,
    trend: "+12%",
    trendUp: true,
  },
  {
    label: "Total Trips Per Day",
    value: "128",
    icon: Activity,
    trend: "+8.4%",
    trendUp: true,
  },
  {
    label: "Average Score",
    value: "82%",
    icon: Star,
    trend: "-2.1%",
    trendUp: false,
  },
  {
    label: "Completion Rate",
    value: "73%",
    icon: BadgeCheck,
    trend: "+5.2%",
    trendUp: true,
  },
];

const dailyUsersData = [
  { day: "MON", current: 520, previous: 480 },
  { day: "TUE", current: 620, previous: 560 },
  { day: "WED", current: 760, previous: 640 },
  { day: "THU", current: 860, previous: 710 },
  { day: "FRI", current: 940, previous: 780 },
  { day: "SAT", current: 1030, previous: 860 },
  { day: "SUN", current: 1150, previous: 920 },
];

const scoreDistributionData = [
  { label: "90 - 100%", value: 45, color: "#1d4ed8" },
  { label: "80 - 89%", value: 30, color: "#3b82f6" },
  { label: "70 - 79%", value: 15, color: "#93c5fd" },
  { label: "Below 70%", value: 10, color: "#cbd5e1" },
];

const revenueByLicense = [
  { label: "B1 - Manual", value: 42000, progress: 82 },
  { label: "B2 - Automatic", value: 29500, progress: 58 },
  { label: "C - Heavy Vehicle", value: 12300, progress: 24 },
];

const studyHoursByTopic = [
  { label: "Traffic Signs", value: 1240, progress: 100 },
  { label: "Right of Way", value: 920, progress: 74 },
  { label: "Parking Safety", value: 730, progress: 59 },
  { label: "Night Driving", value: 540, progress: 44 },
  { label: "First Aid", value: 320, progress: 26 },
];

const retentionFunnel = [
  { value: "100%", title: "Registration", subtitle: "Total New Users", active: false },
  { value: "85%", title: "First Test", subtitle: "Completed Lesson 1", active: false },
  { value: "62%", title: "5+ Tests", subtitle: "Engaged Learners", active: false },
  { value: "48%", title: "Passed Exam", subtitle: "Qualified Drivers", active: true },
];

function formatCurrency(value) {
  return `$${value.toLocaleString("en-US")}`;
}

export function AdminAnalytics() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time performance metrics and student progress insights
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-blue-100 bg-white p-1">
          <button
            type="button"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Last 7 Days
          </button>
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-blue-50"
          >
            Last 30 Days
          </button>
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-blue-50"
          >
            Custom Range
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-blue-100 bg-white">
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 lg:grid-cols-4 lg:divide-y-0">
          {summaryMetrics.map((item) => {
            const Icon = item.icon;
            const TrendIcon = item.trendUp ? TrendingUp : TrendingDown;

            return (
              <article key={item.label} className="p-4">
                <div className="mb-4 flex items-start justify-between">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                      item.trendUp ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {item.trend}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500">{item.label}</p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900">{item.value}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <article className="rounded-xl border border-blue-100 bg-white p-4 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Daily Active Users</h2>
            <div className="inline-flex items-center gap-3 text-[10px] font-semibold">
              <span className="inline-flex items-center gap-1 text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Current
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Previous
              </span>
            </div>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyUsersData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                <CartesianGrid stroke="#eef2ff" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: "#93c5fd", strokeDasharray: "4 4" }}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #bfdbfe",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4, fill: "#1d4ed8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-blue-100 bg-white p-4">
          <h2 className="text-lg font-bold text-slate-900">Test Score Distribution</h2>

          <div className="relative mt-2 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreDistributionData}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={70}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {scoreDistributionData.map((entry) => (
                    <Cell key={entry.label} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-extrabold tracking-tight text-slate-800">2.4k</p>
              <p className="text-[10px] font-semibold tracking-[0.12em] text-slate-400">TOTAL TESTS</p>
            </div>
          </div>

          <ul className="space-y-2">
            {scoreDistributionData.map((item) => (
              <li key={item.label} className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="font-semibold text-slate-700">{item.value}%</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-blue-100 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Revenue by License Type</h2>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-slate-600"
            >
              <AlarmClock className="h-3 w-3 text-blue-600" />
              Monthly View
            </button>
          </div>

          <div className="space-y-4">
            {revenueByLicense.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-600">{item.label}</p>
                  <p className="text-xs font-semibold text-slate-800">{formatCurrency(item.value)}</p>
                </div>
                <div className="h-2 rounded-full bg-blue-100">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-blue-100 bg-white p-4">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Study Hours by Topic</h2>
          <div className="space-y-3">
            {studyHoursByTopic.map((item) => (
              <div key={item.label} className="grid grid-cols-[120px_1fr_56px] items-center gap-3">
                <p className="text-xs font-semibold text-slate-600">{item.label}</p>
                <div className="h-2 rounded-full bg-blue-100">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${item.progress}%` }} />
                </div>
                <p className="text-right text-xs font-semibold text-slate-700">{item.value}h</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-blue-100 bg-white p-4">
        <h2 className="mb-4 text-lg font-bold text-slate-900">User Retention Funnel</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {retentionFunnel.map((item, index) => (
            <div key={item.title} className="relative">
              <article
                className={`rounded-xl border p-4 text-center ${
                  item.active
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-blue-200 bg-blue-50 text-slate-900"
                }`}
              >
                <p className="text-3xl font-extrabold tracking-tight">{item.value}</p>
              </article>
              <p className="mt-2 text-center text-xs font-bold text-slate-700">{item.title}</p>
              <p className="text-center text-[10px] text-slate-400">{item.subtitle}</p>
              {index < retentionFunnel.length - 1 ? (
                <span className="absolute -right-2 top-6 hidden text-slate-300 md:block">&gt;</span>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
