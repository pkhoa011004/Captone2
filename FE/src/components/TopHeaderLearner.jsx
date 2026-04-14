import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  CarFront,
  LogOut,
  UserCircle2,
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { labelKey: "learnerHeader.dashboard", path: "/learner", active: true },
  {
    labelKey: "learnerHeader.practiceTests",
    path: "/learner/practice-tests",
    active: false,
  },
  {
    labelKey: "learnerHeader.aiAssistant",
    path: "/learner/ai-assistant",
    active: false,
  },
  {
    labelKey: "learnerHeader.simulation",
    path: "/learner/simulator",
    active: false,
  },
  {
    labelKey: "learnerHeader.schedule",
    path: "/learner/schedule",
    active: false,
  },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const TopHeaderLearner = () => {
  const { t } = useTranslation();
  const cachedAvatarKey = "learnerAvatar";
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // 1. Hàm đồng bộ user từ LocalStorage
  const syncUserFromLocalStorage = useCallback(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "null");
      setUser(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      setUser(null);
    }
  }, []);

  // 2. Fetch profile từ API khi component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
          localStorage.setItem("user", JSON.stringify(data.data));
        } else {
          syncUserFromLocalStorage();
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        syncUserFromLocalStorage();
      }
    };

    fetchUserProfile();
  }, [syncUserFromLocalStorage]);

  // 3. Lắng nghe thay đổi storage
  useEffect(() => {
    syncUserFromLocalStorage();
    window.addEventListener("user-updated", syncUserFromLocalStorage);
    window.addEventListener("storage", syncUserFromLocalStorage);

    return () => {
      window.removeEventListener("user-updated", syncUserFromLocalStorage);
      window.removeEventListener("storage", syncUserFromLocalStorage);
    };
  }, [syncUserFromLocalStorage]);

  // 4. Click outside để đóng menu
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const avatarSrc = user?.avatar || user?.profileImage || localStorage.getItem(cachedAvatarKey) || "/user-profile.png";

  return (
    <div className="w-full h-24 bg-white/85 backdrop-blur-md border-b border-slate-100 flex items-center px-10 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-8">
        
        {/* LEFT: Logo */}
        <div className="flex items-center gap-10 shrink-0">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/learner")}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
              <CarFront className="h-6 w-6" />
            </span>
            <div className="leading-tight">
              <span className="block text-[1.4rem] font-black text-blue-700 tracking-tight">DriveMaster</span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Learner Portal</span>
            </div>
          </div>
        </div>

        {/* CENTER: Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-5 py-3 rounded-xl text-[15px] font-bold transition-all ${
                isActive(item.path)
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </nav>

        {/* RIGHT: Profile & Actions */}
        <div className="flex items-center gap-5 shrink-0">
          {/* Notification Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-11 w-11 rounded-full text-slate-500 hover:bg-slate-100"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </Button>

          <div className="h-10 w-px bg-slate-100" />

          <div ref={profileMenuRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-4 pl-2 cursor-pointer group hover:opacity-90 transition-opacity"
            >
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[15px] font-black text-[#141b2b] group-hover:text-blue-600 transition-colors">
                  {user?.name || "User"}
                </span>
                <span className="text-[12px] font-semibold text-slate-400">
                  {t("learnerHeader.learner")}
                </span>
              </div>
              <Avatar className="w-11 h-11 border-2 border-white shadow-md">
                <AvatarImage src={avatarSrc} alt="Profile" />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                  {user?.name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-14 w-72 rounded-3xl border border-blue-100 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.16)] z-50">
                <div className="mb-3 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 px-4 py-3 border border-blue-100/70">
                  <p className="text-[11px] font-black tracking-[0.18em] text-blue-500 uppercase">
                    {t("learnerHeader.profileMenu")}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800 truncate">
                    {user?.email || "No email"}
                  </p>
                </div>

                <button
                  onClick={() => { navigate("/learner/profile"); setIsProfileOpen(false); }}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <UserCircle2 className="h-5 w-5" />
                    </span>
                    {t("learnerHeader.profile")}
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                </button>

                <button
                  onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                  className="mt-2 flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <LogOut className="h-5 w-5" />
                    </span>
                    {t("learnerHeader.logout")}
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-300" />
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