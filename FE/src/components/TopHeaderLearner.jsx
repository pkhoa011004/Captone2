import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, Car, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Dashboard", path: "/learner", active: true },
  { label: "Practice Tests", path: "/learner/practice-tests", active: false },
  { label: "Create topic", path: "/learner/create-exam", active: false },
  { label: "AI Assistant", path: "/learner/ai-assistant", active: false },
  { label: "Simulation", path: "/learner/simulator", active: false },
  { label: "Schedule", path: "/learner/schedule", active: false },
];

export const TopHeaderLearner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

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

  const isActive = (path) => {
    return location.pathname === path;
  };
  return (
    <div className="w-full h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center px-8 sticky top-0 z-50 shadow-sm">
      <div className="max-w-360 w-full mx-auto flex items-center justify-between">
        {/* LEFT: Logo & Search */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => navigate("/learner")}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 transition-transform group-hover:scale-105">
              <Car className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black text-blue-700 tracking-tighter">
              DriveMaster
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex relative w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Quick search..."
              className="pl-10 h-10 bg-slate-100 border-none rounded-full text-sm placeholder:text-slate-400 focus-visible:ring-blue-400 focus-visible:bg-white transition-all"
            />
          </div>
        </div>

        {/* CENTER: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isActive(item.path)
                  ? "text-blue-600 relative after:content-[''] after:absolute after:-bottom-5.5 after:left-0 after:w-full after:h-0.5 after:bg-blue-600"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* RIGHT: Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notification Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-500 hover:bg-slate-100"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </Button>

          <div className="h-8 w-px bg-slate-100 mx-2" />

          {/* User Profile Dropdown */}
          <div ref={profileMenuRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-2 cursor-pointer group hover:opacity-80 transition-opacity"
            >
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-[#141b2b] group-hover:text-blue-600 transition-colors">
                  {user?.name || "User"}
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-tight">
                  ID: {user?.id || "12345"}
                </span>
              </div>
              <Avatar className="w-10 h-10 border-2 border-white shadow-sm group-hover:border-blue-100 transition-all">
                <AvatarImage src="/user-profile.png" alt="Profile" />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
                  {user?.name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-12 w-44 rounded-xl border border-blue-100 bg-white p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.12)] z-50">
                <p className="px-2 py-1 text-[11px] font-semibold text-slate-400">
                  Profile - learner
                </p>
                <button
                  onClick={() => {
                    navigate("/learner/profile");
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <LogOut className="h-4 w-4 rotate-180" />
                  Profile
                </button>
                <button
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default TopHeaderLearner;
