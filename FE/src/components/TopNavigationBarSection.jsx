import { Search, Bell, CircleUser, HelpCircle, Car, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", active: true },
  { label: "User Management", active: false },
  { label: "Exam Management", active: false },
  { label: "Classrooms", active: false },
  { label: "Analytics", active: false },
];

export const TopNavigationBarSection = () => {
  return (
    <div className="sticky top-0 z-50 flex w-full h-20 items-center px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="flex items-center gap-8 w-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Car size={22} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black text-blue-700 tracking-tighter">
            DriveMaster
          </span>
        </div>


        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                item.active
                  ? "text-blue-600 border-b-2 border-blue-600 rounded-none"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-slate-500"
          >
            <Bell size={20} />
          </Button>
          <div className="flex items-center gap-3 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">Admin</p>
              <p className="text-[10px] text-blue-600 font-bold uppercase">
                Super
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
              <CircleUser size={22} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
