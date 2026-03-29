import { Ellipsis, Plus, Search, SlidersHorizontal, User } from "lucide-react";

const summaryCards = [
  { label: "ACTIVE CLASSROOMS", value: "8", meta: "+2 new" },
  { label: "TOTAL STUDENTS", value: "234", meta: "" },
  { label: "AVG COMPLETION", value: "78 %", meta: "" },
  { label: "UPCOMING SESSIONS", value: "12", meta: "" },
];

const sessions = [
  {
    status: "ACTIVE",
    title: "B2 Weekend Batch A",
    instructor: "Sarah Jenkins",
    schedule: "Sat - Sun / 09:00",
    capacity: "24/30 Students",
    progress: 80,
    participants: ["SJ", "AN", "TM"],
    extra: 21,
    action: "VIEW DETAILS",
  },
  {
    status: "UPCOMING",
    title: "B1 Evening Intensive",
    instructor: "Marcus Vane",
    schedule: "Mon - Fri / 18:30",
    capacity: "12/20 Students",
    progress: 0,
    participants: ["MV", "LT"],
    extra: 10,
    action: "VIEW DETAILS",
  },
  {
    status: "ACTIVE",
    title: "C Commercial Truck",
    instructor: "Robert King",
    schedule: "Tue - Thu / 10:00",
    capacity: "08/15 Students",
    progress: 43,
    participants: ["RK", "DK", "NP"],
    extra: 6,
    action: "VIEW DETAILS",
  },
  {
    status: "ACTIVE",
    title: "B2 Morning Batch C",
    instructor: "Elena Rodriguez",
    schedule: "Mon - Fri / 07:30",
    capacity: "28/30 Students",
    progress: 15,
    participants: ["ER", "VH"],
    extra: 26,
    action: "VIEW DETAILS",
  },
  {
    status: "COMPLETED",
    title: "A1 Moped Basic",
    instructor: "Sarah Jenkins",
    schedule: "Closed",
    capacity: "16/16 Passed",
    progress: 100,
    participants: [],
    extra: 0,
    action: "ARCHIVE",
  },
];

const statusStyles = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  UPCOMING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-slate-200 text-slate-600",
};

function Participants({ list, extra }) {
  if (list.length === 0) {
    return <span className="text-xs text-slate-300">No participants</span>;
  }

  return (
    <div className="flex items-center">
      {list.map((item, index) => (
        <span
          key={item}
          className={`-ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-blue-100 text-[10px] font-bold text-blue-700 ${
            index === 0 ? "ml-0" : ""
          }`}
        >
          {item}
        </span>
      ))}
      <span className="ml-2 text-[11px] font-semibold text-blue-500">+{extra}</span>
    </div>
  );
}

function SessionCard({ item }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-bold tracking-[0.08em] ${
            statusStyles[item.status]
          }`}
        >
          {item.status}
        </span>
        <button
          type="button"
          className="rounded p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
          aria-label={`Actions for ${item.title}`}
        >
          <Ellipsis className="h-4 w-4" />
        </button>
      </div>

      <h3 className="mt-4 text-base font-bold tracking-tight text-slate-800">{item.title}</h3>
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
        <User className="h-3.5 w-3.5" />
        {item.instructor}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">SCHEDULE</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-700">{item.schedule}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">CAPACITY</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-700">{item.capacity}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">COURSE PROGRESS</p>
          <p className="text-[11px] font-bold text-blue-600">{item.progress}%</p>
        </div>
        <div className="h-1.5 rounded-full bg-blue-100">
          <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${item.progress}%` }} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Participants list={item.participants} extra={item.extra} />
        <button type="button" className="text-[11px] font-bold text-blue-600 transition hover:text-blue-500">
          {item.action}
        </button>
      </div>
    </article>
  );
}

export function AdminClassrooms() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Classrooms</h1>
          <p className="mt-1 text-sm text-slate-500">Manage classrooms, schedules, and instructors</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-white transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          CREATE CLASSROOM
        </button>
      </section>

      <section className="overflow-hidden rounded-xl border border-blue-100 bg-white">
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 lg:grid-cols-4 lg:divide-y-0">
          {summaryCards.map((card) => (
            <article key={card.label} className="p-5">
              <p className="text-[10px] font-bold tracking-[0.15em] text-slate-500">{card.label}</p>
              <div className="mt-2 flex items-end gap-2">
                <p className="text-4xl font-extrabold tracking-tight text-slate-900">{card.value}</p>
                {card.meta ? <p className="pb-1 text-xs font-semibold text-emerald-600">{card.meta}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Active &amp; Upcoming Sessions</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
              aria-label="Filter sessions"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
              aria-label="Search sessions"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((item) => (
            <SessionCard key={item.title} item={item} />
          ))}

          <article className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50/30 p-4">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 transition hover:bg-blue-50"
              aria-label="Create new classroom"
            >
              <Plus className="h-4 w-4" />
            </button>
            <h3 className="mt-4 text-sm font-bold text-slate-700">New Classroom</h3>
            <p className="mt-1 text-center text-xs text-slate-500">Assign instructor and schedule</p>
          </article>
        </div>
      </section>
    </div>
  );
}
