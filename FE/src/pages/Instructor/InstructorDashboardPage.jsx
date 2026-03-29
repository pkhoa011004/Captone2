import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  FileBarChart2,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const summaryCards = [
  { label: "MY STUDENTS", value: "62", meta: "+1 this week", metaClass: "text-emerald-600" },
  { label: "ACTIVE CLASSES", value: "2", meta: "Ongoing batches", metaClass: "text-slate-500" },
  { label: "AVG PASS RATE", value: "81%", meta: "+2%", metaClass: "text-emerald-600" },
  { label: "UPCOMING SESSIONS", value: "4", meta: "Today", metaClass: "text-blue-600" },
];

const passRateTrend = [
  { week: "W1", score: 62 },
  { week: "W2", score: 68 },
  { week: "W3", score: 66 },
  { week: "W4", score: 74 },
  { week: "W5", score: 70 },
  { week: "W6", score: 69 },
  { week: "W7", score: 76 },
  { week: "W8", score: 73 },
];

const scheduleItems = [
  {
    time: "08:00 AM - 10:00 AM",
    title: "Classroom: Road Safety Rules",
    room: "Room 302",
    note: "12 Students",
  },
  {
    time: "10:30 AM - 12:30 PM",
    title: "Driving Practice: Urban",
    room: "Vehicle K24",
    note: "5 Students",
  },
  {
    time: "02:00 PM - 04:00 PM",
    title: "Sim Lab: Night Driving",
    room: "Booth 12",
    note: "4 Students",
  },
];

const recentActivities = [
  { name: "Thai Kim Ngoc", context: "Theory Exam - Module 5", score: "88%", time: "2h ago" },
  { name: "Nguyen Minh Thanh", context: "Simulator Practice", score: "94%", time: "1d ago" },
  { name: "Ta Hoang Huy", context: "Road Test - Unit 1", score: "78%", time: "3h ago" },
];

const classProgress = [
  { className: "Batch A (Summer '24)", progress: 82 },
  { className: "Batch B (Fall '24)", progress: 45 },
  { className: "B2 Special Intake", progress: 12 },
];

const warnings = [
  { title: "Hoang Nguyen", detail: "Failed 2 consecutive exams", action: "RE-SCHEDULE INTERVIEW" },
  { title: "Vehicle #18", detail: "Maintenance due tomorrow", action: "" },
];

const quickActions = [
  { label: "Create Exam", icon: FileBarChart2, primary: false },
  { label: "New Scenario", icon: Sparkles, primary: false },
  { label: "Add Student", icon: Users, primary: false },
  { label: "Book a Lesson", icon: CalendarClock, primary: true },
];

function DashboardCard({ item }) {
  return (
    <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
      <p className="text-[10px] font-bold tracking-[0.14em] text-slate-500">{item.label}</p>
      <div className="mt-2 flex items-end gap-2">
        <p className="text-4xl font-extrabold tracking-tight text-slate-900">{item.value}</p>
        <p className={`pb-1 text-xs font-semibold ${item.metaClass}`}>{item.meta}</p>
      </div>
    </article>
  );
}

export function InstructorDashboardPage() {
  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">Mai Phuoc Khoa</h1>
        <p className="mt-1 text-sm text-slate-500">March 9, 2026</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <DashboardCard key={item.label} item={item} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Student Pass Rate Trend</h2>
              <button
                type="button"
                className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                Last 8 Weeks
              </button>
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={passRateTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#eef2ff" vertical={false} />
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "#eff6ff" }}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #bfdbfe",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {passRateTrend.map((entry) => (
                      <Cell key={entry.week} fill={entry.week === "W4" || entry.week === "W8" ? "#1d4ed8" : "#cbd5e1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-blue-100 bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
              <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-800">
                <BookOpen className="h-4 w-4 text-blue-600" />
                Recent Student Activity
              </h3>
              <ul className="space-y-3">
                {recentActivities.map((item) => (
                  <li key={item.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {item.name
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.context}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-blue-600">{item.score}</p>
                      <p className="text-[10px] text-slate-400">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-xl border border-blue-100 bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
              <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-800">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                Class Progress
              </h3>
              <ul className="space-y-4">
                {classProgress.map((item) => (
                  <li key={item.className}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-700">{item.className}</p>
                      <p className="text-xs font-semibold text-slate-500">{item.progress}%</p>
                    </div>
                    <div className="h-2 rounded-full bg-blue-100">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>

        <div className="space-y-4">
          <article className="rounded-xl border border-blue-100 bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
            <h3 className="mb-3 text-lg font-bold tracking-tight text-slate-900">Today's Schedule</h3>
            <ul className="space-y-4">
              {scheduleItems.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.08em] text-blue-600">{item.time}</p>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.room} · {item.note}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
            <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-rose-600">
              <AlertTriangle className="h-4 w-4" />
              Needs Attention
            </h3>
            <ul className="space-y-2">
              {warnings.map((item) => (
                <li key={item.title} className="rounded-lg border border-rose-100 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                  <p className="text-[11px] text-slate-500">{item.detail}</p>
                  {item.action ? (
                    <p className="mt-1 text-[10px] font-bold tracking-[0.08em] text-rose-600">
                      {item.action}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </article>

          <section className="grid grid-cols-2 gap-3">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  className={`rounded-xl border px-3 py-4 text-center transition ${
                    item.primary
                      ? "col-span-2 border-blue-700 bg-blue-700 text-white hover:bg-blue-600"
                      : "border-blue-100 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <Icon className={`mx-auto h-4 w-4 ${item.primary ? "text-white" : "text-blue-600"}`} />
                  <span className="mt-2 block text-[11px] font-bold">{item.label.toUpperCase()}</span>
                </button>
              );
            })}
          </section>
        </div>
      </section>
    </div>
  );
}
