import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ChevronDown,
  CirclePlus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    label: "My Active Classes",
    value: "2",
    icon: BookOpen,
    badge: "+1 new",
  },
  {
    label: "Total Students",
    value: "89",
    icon: Users,
  },
  {
    label: "Avg Completion",
    value: "81%",
    icon: TrendingUp,
    badge: "+ 4 %",
    badgeClass: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Upcoming Sessions",
    value: "4",
    icon: CalendarClock,
  },
];

const classes = [
  {
    license: "B2 MANUAL",
    title: "B2 Weekend Batch A",
    instructor: "Lead Instructor Alex",
    nextSession: "Next: Today, 14:00",
    students: "24/30 Students",
    progress: 80,
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    tagClass: "bg-blue-600 text-white",
  },
  {
    license: "B1 AUTO",
    title: "B1 Evening Intensive",
    instructor: "Lead Instructor Alex",
    nextSession: "Next: Tomorrow, 18:30",
    students: "18/20 Students",
    progress: 46,
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80",
    tagClass: "bg-blue-600 text-white",
  },
  {
    license: "B2 FAST TRACK",
    title: "B2 Fast Track",
    instructor: "Lead Instructor Alex",
    nextSession: "Next: Wed, 09:00",
    students: "12/12 Students",
    progress: 100,
    image:
      "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=900&q=80",
    tagClass: "bg-orange-500 text-white",
  },
];

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="rounded-xl border border-blue-100 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-4 w-4" />
        </span>
        {item.badge ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              item.badgeClass || "bg-blue-100 text-blue-600"
            }`}
          >
            {item.badge}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-slate-500">{item.label}</p>
      <p className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900">{item.value}</p>
    </article>
  );
}

function ClassCard({ item, navigate }) {
  return (
    <article className="rounded-xl border border-blue-100 bg-white p-3 shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
      <div className="relative overflow-hidden rounded-lg">
        <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
        <span
          className={`absolute bottom-2 left-2 rounded px-2 py-1 text-[10px] font-bold tracking-[0.08em] ${item.tagClass}`}
        >
          {item.license}
        </span>
      </div>

      <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{item.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{item.instructor}</p>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{item.nextSession}</span>
        <span className="font-semibold text-slate-700">{item.students}</span>
      </div>

      <div className="mt-2 h-2 rounded-full bg-blue-100">
        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${item.progress}%` }} />
      </div>

      <button
        type="button"
        onClick={() => navigate(`/instructor/classrooms/${item.title.toLowerCase().replace(/\s+/g, '-')}`)}
        className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
      >
        Manage Class
        <ArrowRight className="h-4 w-4" />
      </button>
    </article>
  );
}

export function InstructorClassroomsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">Classrooms</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your assigned learning batches and schedules
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            Create Class
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
      </section>

      <section className="rounded-xl border border-blue-100 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label>
            <p className="mb-1 text-[10px] font-bold tracking-[0.14em] text-slate-500">SEARCH CLASSES</p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by batch name or instructor..."
                className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50/40 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:bg-white"
              />
            </div>
          </label>

          <label>
            <p className="mb-1 text-[10px] font-bold tracking-[0.14em] text-slate-500">LICENSE TYPE</p>
            <button
              type="button"
              className="inline-flex h-10 min-w-[130px] items-center justify-between gap-2 rounded-lg border border-blue-100 bg-blue-50/40 px-3 text-sm text-slate-600"
            >
              All Types
              <ChevronDown className="h-4 w-4" />
            </button>
          </label>

          <label>
            <p className="mb-1 text-[10px] font-bold tracking-[0.14em] text-slate-500">STATUS</p>
            <button
              type="button"
              className="inline-flex h-10 min-w-[130px] items-center justify-between gap-2 rounded-lg border border-blue-100 bg-blue-50/40 px-3 text-sm text-slate-600"
            >
              All Status
              <ChevronDown className="h-4 w-4" />
            </button>
          </label>
        </div>

        <div className="mt-4 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <button
              type="button"
              className="border-b-2 border-blue-600 px-1 pb-2 text-sm font-semibold text-blue-600"
            >
              My Classes
            </button>
            <button type="button" className="px-1 pb-2 text-sm font-semibold text-slate-500">
              Student Roster
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {classes.map((item) => (
            <ClassCard key={item.title} item={item} navigate={navigate} />
          ))}
        </div>
      </section>
    </div>
  );
}
