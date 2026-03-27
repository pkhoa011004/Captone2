import React from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Video,
  Car,
  BookOpen,
  FileText,
  AlertCircle,
  BarChart3,
  Filter,
} from "lucide-react";

import { TopNavigationBarSection } from "../../components/TopNavigationBarSection";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Dữ liệu giả lập ---
const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const CALENDAR_DAYS = [
  { day: 24, prev: true },
  { day: 25, prev: true },
  { day: 1 },
  { day: 2 },
  { day: 3 },
  { day: 4 },
  { day: 5 },
  { day: 6 },
  { day: 7 },
  { day: 8, active: true },
  { day: 9 },
  { day: 10, hasEvent: true },
  { day: 11 },
  { day: 12 },
  { day: 13 },
  { day: 14 },
  { day: 15, hasIcon: true },
  { day: 16 },
  { day: 17 },
  { day: 18 },
  { day: 19 },
  { day: 20 },
  { day: 21 },
];

const STUDY_PLAN = [
  { label: "Theory", percent: 85 },
  { label: "Practice", percent: 42 },
  { label: "Mock Tests", percent: 60 },
];

const SESSIONS = [
  {
    title: "Practice Drive",
    type: "ON-ROAD",
    badgeStyles: "bg-blue-100 text-blue-700",
    icon: <Car size={20} />,
    date: "March 12, 2026",
    time: "09:30 AM - 11:00 AM",
    instructor: "Marco Rossi",
    location: "Main Street Hub",
    locationType: "physical",
  },
  {
    title: "Theory Class",
    type: "VIRTUAL",
    badgeStyles: "bg-slate-100 text-slate-600",
    icon: <BookOpen size={20} />,
    date: "March 14, 2026",
    time: "02:00 PM - 04:00 PM",
    instructor: "Sarah Chen",
    location: "Zoom Meeting",
    locationType: "virtual",
  },
  {
    title: "Mock Exam",
    type: "CRITICAL",
    badgeStyles: "bg-red-100 text-red-700",
    icon: <FileText size={20} />,
    date: "March 15, 2026",
    time: "10:00 AM - 12:00 PM",
    instructor: "David Miller",
    location: "Central Test Center",
    locationType: "physical",
  },
];

export const ScheduleLearner = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans pb-20">
      <TopNavigationBarSection />

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-8 grid grid-cols-12 gap-10 mt-20">
        {/* LEFT SIDEBAR (4/12) */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          {/* 1. Mini Calendar */}
          <Card className="border-none shadow-[0_12px_32px_rgba(20,27,43,0.04)] rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <CardTitle className="text-lg font-bold font-manrope text-[#141b2b]">
                March 2026
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-slate-400"
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-slate-400"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEK_DAYS.map((day) => (
                  <span
                    key={day}
                    className="text-[10px] font-bold text-slate-400 py-2 tracking-widest uppercase"
                  >
                    {day}
                  </span>
                ))}
                {CALENDAR_DAYS.map((cell, i) => (
                  <div
                    key={i}
                    className="relative py-2 flex items-center justify-center"
                  >
                    <button
                      className={`
                      h-9 w-9 text-sm font-semibold rounded-xl transition-all
                      ${cell.active ? "bg-[#004ac6] text-white shadow-lg shadow-blue-200" : "text-[#141b2b] hover:bg-slate-50"}
                      ${cell.prev ? "text-slate-300" : ""}
                    `}
                    >
                      {cell.hasIcon ? (
                        <Calendar size={14} className="mx-auto text-blue-600" />
                      ) : (
                        cell.day
                      )}
                    </button>
                    {cell.hasEvent && !cell.active && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#004ac6] rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 2. Weekly Study Plan */}
          <Card className="border-none shadow-[0_12px_32px_rgba(20,27,43,0.04)] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold font-manrope text-[#141b2b]">
                Weekly Study Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {STUDY_PLAN.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">
                      {item.label}
                    </span>
                    <span className="text-xs font-bold text-blue-600">
                      {item.percent}%
                    </span>
                  </div>
                  <Progress
                    value={item.percent}
                    className="h-2 bg-slate-100"
                    indicatorClassName="bg-[#004ac6]"
                  />
                </div>
              ))}
              <Button className="w-full h-12 rounded-xl bg-[#004ac6] hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 mt-2">
                View Detailed Insights
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* RIGHT MAIN CONTENT (8/12) */}
        <section className="col-span-12 lg:col-span-8 space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-[#141b2b] font-manrope tracking-tight">
                Schedule
              </h1>
              <p className="text-lg text-slate-500 font-medium mt-1">
                Manage your classes and exam preparation
              </p>
            </div>
            <Button className="h-12 px-6 rounded-xl bg-[#e1e8fd] text-[#004ac6] hover:bg-blue-100 font-bold gap-2">
              <Plus size={18} strokeWidth={3} />
              Book Session
            </Button>
          </div>

          {/* 3. Milestone Banner */}
          <div className="relative p-8 bg-[#004ac6] rounded-[32px] overflow-hidden group">
            {/* Decorative BG */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <BarChart3 size={200} className="text-white" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4 text-center md:text-left">
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none font-bold tracking-widest px-3">
                  FINAL MILESTONE
                </Badge>
                <h2 className="text-3xl font-black text-white font-manrope">
                  B2 License Exam
                </h2>
                <p className="text-blue-100 text-base leading-relaxed max-w-sm">
                  Scheduled at the Metropolitan Driving Authority.
                  <br />
                  Keep up your current practice pace.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center h-32 w-32 md:h-36 md:w-36 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                <span className="text-5xl font-black text-white">66</span>
                <span className="text-[10px] font-bold text-blue-100 tracking-[2px] mt-1 uppercase">
                  Days Left
                </span>
              </div>
            </div>
          </div>

          {/* 4. Upcoming Sessions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#141b2b] font-manrope">
                Upcoming Sessions
              </h3>
              <Button variant="ghost" size="icon" className="text-slate-400">
                <Filter size={18} />
              </Button>
            </div>

            <div className="space-y-4">
              {SESSIONS.map((session, idx) => (
                <Card
                  key={idx}
                  className="border-none shadow-sm bg-[#f1f3ff] rounded-2xl hover:shadow-md transition-all group cursor-pointer"
                >
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    {/* Session Icon */}
                    <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                      {session.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-[#141b2b]">
                          {session.title}
                        </h4>
                        <Badge
                          className={`border-none text-[9px] font-black px-2 ${session.badgeStyles}`}
                        >
                          {session.type}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-6 text-slate-500">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar size={14} className="text-blue-500" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Clock size={14} className="text-blue-500" />
                          {session.time}
                        </div>
                      </div>
                    </div>

                    {/* Instructor & Location */}
                    <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto text-right">
                      <p className="text-sm font-bold text-[#141b2b]">
                        Instructor: {session.instructor}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        {session.locationType === "virtual" ? (
                          <Video size={12} />
                        ) : (
                          <MapPin size={12} />
                        )}
                        {session.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full py-6 rounded-xl border-dashed border-blue-200 text-[#004ac6] hover:bg-blue-50 font-bold text-sm"
            >
              View Past Sessions
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};
export default ScheduleLearner;
