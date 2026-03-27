import React from "react";
import {
  Users,
  GraduationCap,
  Trophy,
  DollarSign,
  TrendingUp,
  TrendingDown,
  UserPlus,
  PlusSquare,
  Bell,
  Download,
  AlertCircle,
  Database,
  Info,
  ShieldCheck,
  HardDrive,
} from "lucide-react";

import { TopNavigationBarSection } from "@/components/TopNavigationBarSection";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// --- Dữ liệu tĩnh (Nên để ngoài component để tránh re-render không cần thiết) ---
const STATS_DATA = [
  {
    label: "TOTAL USERS",
    value: "1,247",
    trend: "+12%",
    up: true,
    icon: Users,
    color: "bg-blue-100 text-blue-600",
  },
  {
    label: "ACTIVE LEARNERS",
    value: "892",
    trend: "+5.4%",
    up: true,
    icon: GraduationCap,
    color: "bg-orange-100 text-orange-600",
  },
  {
    label: "PASS RATE",
    value: "87.3%",
    trend: "-1.2%",
    up: false,
    icon: Trophy,
    color: "bg-slate-200 text-slate-600",
  },
  {
    label: "REVENUE",
    value: "$45,200",
    trend: "+21%",
    up: true,
    icon: DollarSign,
    color: "bg-green-100 text-green-600",
  },
];

const PASS_RATE_DATA = [
  { label: "CLASS B1", percent: 92 },
  { label: "CLASS B2", percent: 78 },
  { label: "CLASS C", percent: 64 },
];

const RECENT_USERS = [
  {
    name: "Adrian Peters",
    email: "adrian.p@example.com",
    license: "B1",
    date: "Oct 24, 2023",
    status: "ACTIVE",
  },
  {
    name: "Sarah Jenkins",
    email: "s.jenkins@webmail.com",
    license: "B2",
    date: "Oct 23, 2023",
    status: "PENDING",
  },
  {
    name: "Marcus Thorne",
    email: "m.thorne@academy.edu",
    license: "C",
    date: "Oct 23, 2023",
    status: "ACTIVE",
  },
  {
    name: "Elena Rodriguez",
    email: "elena.rod@provider.net",
    license: "B1",
    date: "Oct 22, 2023",
    status: "OFFLINE",
  },
];

const SYSTEM_STATUS = [
  {
    name: "API Status",
    status: "OPERATIONAL",
    color: "text-green-600",
    dot: "bg-green-500",
  },
  {
    name: "3D Simulator",
    status: "ONLINE",
    color: "text-green-600",
    dot: "bg-green-500",
  },
  {
    name: "AI Service",
    status: "RUNNING",
    color: "text-blue-600",
    dot: "bg-blue-500",
  },
];

// --- Sub-components để code sạch hơn ---

const StatCard = ({ item }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`${item.color} p-2.5 rounded-lg`}>
        <item.icon className="w-5 h-5" />
      </div>
      <div
        className={`flex items-center gap-1 text-xs font-bold ${item.up ? "text-green-600" : "text-red-600"}`}
      >
        {item.up ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        {item.trend}
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
      {item.label}
    </p>
    <h3 className="text-2xl font-extrabold text-[#141b2b] mt-1">
      {item.value}
    </h3>
  </div>
);

const PlatformAlert = ({
  title,
  desc,
  icon: Icon,
  colorClass,
  actionText,
  iconBg,
}) => (
  <div
    className={`flex items-center gap-4 p-5 rounded-xl border ${colorClass}`}
  >
    <div className={`p-3 rounded-full text-white ${iconBg}`}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-[#141b2b] text-sm">{title}</h4>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
    <Button
      variant="ghost"
      className="text-xs font-bold uppercase tracking-tight"
    >
      {actionText}
    </Button>
  </div>
);

// --- MAIN COMPONENT ---

export const DashboardAdmin = () => {
  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col font-sans">
      <TopNavigationBarSection />

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-8 flex flex-col gap-8">
        {/* 1. Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#141b2b] tracking-tight">
              Welcome back, Admin
            </h1>
            <p className="text-slate-500 font-medium tracking-tight italic">
              Tuesday, October 24, 2023 • Status: Optimal
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 transition-all"
            >
              View Audit Logs
            </Button>
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
              Generate Report
            </Button>
          </div>
        </div>

        {/* 2. Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS_DATA.map((card, i) => (
            <StatCard key={i} item={card} />
          ))}
        </div>

        {/* 3. Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Mockup */}
          <div className="lg:col-span-2 bg-[#f1f3ff] p-8 rounded-xl border border-blue-50">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-bold text-[#141b2b]">
                Monthly Registrations
              </h3>
              <div className="bg-white p-1 rounded-lg flex gap-1 border border-slate-200 shadow-sm">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[10px] font-bold bg-slate-100"
                >
                  Monthly
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[10px] font-bold text-slate-500"
                >
                  Yearly
                </Button>
              </div>
            </div>
            <div className="h-44 flex items-end justify-between gap-3 border-b border-blue-200 pb-2">
              {[30, 50, 40, 85, 55, 75, 25, 60].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-full bg-blue-600/20 rounded-t-sm border-t-2 border-blue-600 transition-all hover:bg-blue-600/40"
                />
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map(
                (m) => (
                  <span key={m}>{m}</span>
                ),
              )}
            </div>
          </div>

          {/* Pass Rate Progress */}
          <div className="bg-[#f1f3ff] p-8 rounded-xl space-y-6 border border-blue-50 flex flex-col">
            <h3 className="text-xl font-bold text-[#141b2b]">
              Pass Rate by License
            </h3>
            <div className="space-y-5 flex-1">
              {PASS_RATE_DATA.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                    <span>{item.label}</span>
                    <span>{item.percent}%</span>
                  </div>
                  <Progress value={item.percent} className="h-2 bg-blue-100" />
                </div>
              ))}
            </div>
            <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                <Info size={14} className="text-blue-600 mt-0.5 shrink-0" />
                <span>
                  Class B1 remains our strongest category this quarter with 8%
                  growth.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* 4. Bottom Section: Users, Actions & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Users Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/30">
              <h3 className="text-lg font-bold">Recent Users</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 font-bold text-xs uppercase tracking-wider"
              >
                View All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f1f3ff] text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                  <tr>
                    <th className="px-6 py-4">Name & Email</th>
                    <th className="px-6 py-4">License</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {RECENT_USERS.map((user, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 text-[10px] font-bold border-none"
                        >
                          {user.license}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-green-500" : user.status === "PENDING" ? "bg-amber-500" : "bg-slate-300"}`}
                          />
                          <span className="text-[10px] font-bold text-slate-600 uppercase">
                            {user.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-[#f1f3ff] p-6 rounded-xl border border-blue-50">
              <h4 className="text-[10px] font-bold text-slate-500 tracking-widest mb-4 uppercase">
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Add Instructor", icon: <UserPlus size={18} /> },
                  { label: "Create Class", icon: <PlusSquare size={18} /> },
                  { label: "System Alert", icon: <Bell size={18} /> },
                  { label: "Export Data", icon: <Download size={18} /> },
                ].map((a) => (
                  <button
                    key={a.label}
                    className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col items-center gap-2 hover:shadow-md transition-all active:scale-95 group"
                  >
                    <div className="text-blue-600 group-hover:scale-110 transition-transform">
                      {a.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">
                      {a.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-500 tracking-widest mb-4 uppercase">
                System Status
              </h4>
              <div className="space-y-4">
                {SYSTEM_STATUS.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`}
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        {s.name}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${s.color} text-[9px] font-bold border-none bg-slate-50 px-2`}
                    >
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Platform Alerts */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={22} className="text-red-500" />
            <h3 className="text-xl font-bold text-[#141b2b]">
              Platform Alerts
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlatformAlert
              title="Pending registrations"
              desc="24 applications require manual ID verification."
              icon={ShieldCheck}
              colorClass="bg-red-50/50 border-red-100"
              iconBg="bg-red-600"
              actionText="Review"
            />
            <PlatformAlert
              title="Server storage at 70%"
              desc="Recommended: Archive video logs from Q2."
              icon={HardDrive}
              colorClass="bg-orange-50/50 border-orange-100"
              iconBg="bg-orange-600"
              actionText="Manage"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/50 py-10 px-8 mt-10 bg-white/50 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto text-center flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">
          <p className="font-bold text-[10px] tracking-[2.5px] uppercase italic">
            © 2026 DRIVEMASTER ADMIN INTERFACE • V2.4.0-BUILD.82
          </p>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
