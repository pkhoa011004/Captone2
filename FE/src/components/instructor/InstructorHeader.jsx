import { Bell, CarFront, CircleHelp, Search, UserCircle2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/instructor", matchPaths: ["/instructor", "/instructor/profile"] },
  { label: "Exercises & Exams", path: "/instructor/exercises" },
  { label: "Classrooms", path: "/instructor/classrooms" },
];

export function InstructorHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-4 px-4 py-4 md:flex-nowrap md:px-8">
        <button
          type="button"
          onClick={() => navigate("/instructor")}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <CarFront className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-blue-700">
            DriveMaster
          </span>
        </button>

        <div className="relative order-3 w-full md:order-none md:max-w-[220px] lg:max-w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search..."
            className="h-10 w-full rounded-full border border-blue-100 bg-blue-50/60 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
          />
        </div>

        <nav className="order-4 flex w-full min-w-0 items-center gap-1 overflow-x-auto pb-1 md:order-none md:w-auto md:flex-1 md:justify-center md:overflow-visible md:pb-0">
          {navItems.map((item) => {
            const isActive = item.matchPaths
              ? item.matchPaths.includes(location.pathname)
              : location.pathname === item.path;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                aria-current={isActive ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg border-b-2 px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
            aria-label="Help"
          >
            <CircleHelp className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/instructor/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
            aria-label="Instructor profile"
          >
            <UserCircle2 className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
