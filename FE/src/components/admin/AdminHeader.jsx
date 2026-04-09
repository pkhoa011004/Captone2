import { Bell, CarFront, LogOut, Search, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/admin",
    matchPaths: ["/admin", "/admin-dashboard"],
  },
  { label: "User Management", path: "/admin/users" },
  { label: "Exam Management", path: "/admin/exams" },
  { label: "Classrooms", path: "/admin/classrooms" },
  { label: "Analytics", path: "/admin/analytics" },
];

export function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-4 px-4 py-4 md:flex-nowrap md:px-8">
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <CarFront className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-blue-700">
            DriveMaster
          </span>
        </button>

        <div className="relative order-3 w-full md:order-none md:max-w-[220px] lg:max-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search..."
            className="h-10 w-full rounded-full border border-blue-100 bg-blue-50/60 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
          />
        </div>

        <nav className="order-4 flex w-full min-w-0 items-center gap-1 overflow-x-auto pb-1 md:order-none md:w-auto md:flex-1 md:justify-center md:overflow-visible md:pb-0">
          {navigationItems.map((item) => {
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

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
              aria-label="Admin profile"
            >
              <UserCircle2 className="h-6 w-6" />
            </button>

            {isProfileOpen ? (
              <div className="absolute right-0 top-12 w-44 rounded-xl border border-blue-100 bg-white p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
                <p className="px-2 py-1 text-[11px] font-semibold text-slate-400">
                  Profile - {user?.name?.toLowerCase()}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/admin/profile");
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <UserCircle2 className="h-4 w-4" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
