import React from "react";
import {
  Play,
  Zap,
  CheckCircle2,
  Cpu,
  Calendar,
  ChevronRight,
  MessageSquare,
  Map,
  FileText,
  Clock,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const QUICK_LINKS = [
  {
    icon: <MessageSquare className="text-blue-600" size={20} />,
    title: "Ask AI Assistant",
    subtitle: "Clarify traffic rules instantly",
  },
  {
    icon: <Map className="text-blue-600" size={20} />,
    title: "Review Routes",
    subtitle: "Visualize common test paths",
  },
  {
    icon: <FileText className="text-blue-600" size={20} />,
    title: "Document Center",
    subtitle: "Manage permits and IDs",
  },
];

const FOOTER_LINKS = ["SAFETY PROTOCOLS", "PRIVACY POLICY", "SUPPORT"];

export const DashboardLearner = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans">
      <main className="flex-1 w-full max-w-screen-xl mx-auto p-10 space-y-12">
        {/* 1. Hero Section */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="text-5xl font-black tracking-tight leading-tight font-manrope">
              <span className="text-[#141b2b]">Master the Road with </span>
              <span className="text-[#004ac6]">AI-Powered training.</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <Button className="h-12 px-8 rounded-xl bg-[#004ac6] hover:bg-blue-700 shadow-lg shadow-blue-200 gap-2">
              <Play size={18} fill="currentColor" />
              <span className="font-bold">Start Test</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8 rounded-xl bg-[#e1e8fd] border-none text-[#004ac6] font-bold hover:bg-blue-200 transition-all"
            >
              Quick Simulation
            </Button>
          </div>
        </section>

        {/* 2. Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Knowledge Theory Card */}
          <Card className="lg:col-span-8 rounded-[32px] border-none shadow-sm overflow-hidden bg-white">
            <CardContent className="p-10 flex flex-col justify-between h-full min-h-[333px]">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-[#141b2b] font-manrope">
                    Knowledge Theory
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Progress towards exam readiness
                  </p>
                </div>
                <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none rounded-full px-4 py-1.5 font-bold">
                  67% Complete
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-8xl font-black tracking-tighter text-[#141b2b]">
                  400
                </span>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-300">
                    / 600
                  </span>
                  <span className="text-xs font-bold text-slate-400 tracking-[2px] uppercase">
                    Questions
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Progress
                  value={67}
                  className="h-4 bg-slate-100"
                  indicatorClassName="bg-[#004ac6]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Latest Test Summary */}
          <Card className="lg:col-span-4 rounded-[32px] border-none shadow-sm bg-[#f1f3ff]">
            <CardContent className="p-10 flex flex-col justify-between h-full min-h-[333px]">
              <div className="flex justify-between items-center">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                  <Zap size={20} fill="currentColor" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-[2px]">
                  LATEST TEST
                </span>
              </div>

              <div className="space-y-1 pt-12">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">
                  Practice Exam #12
                </p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-[#141b2b]">28</span>
                  <span className="text-xl font-bold text-slate-400">/ 30</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100 mt-auto">
                <CheckCircle2 size={20} className="text-green-600" />
                <span className="text-sm font-bold text-green-700">
                  93% Accuracy Score
                </span>
              </div>
            </CardContent>
          </Card>

          {/* AI Learning Bridge Card */}
          <Card className="lg:col-span-5 rounded-[32px] border-none shadow-sm bg-[#293040] text-white relative overflow-hidden group">
            <CardContent className="p-10 flex flex-col gap-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg text-blue-300">
                  <Cpu size={22} />
                </div>
                <h3 className="text-lg font-bold font-manrope">
                  AI Learning Bridge
                </h3>
              </div>

              <p className="text-xl font-medium leading-relaxed">
                "Your performance in{" "}
                <span className="text-blue-300 underline decoration-blue-300/30 font-bold">
                  Right-of-Way
                </span>{" "}
                scenarios is slightly lagging. Let's focus there next."
              </p>

              <Button
                variant="link"
                className="p-0 h-auto text-blue-300 font-bold justify-start gap-2 group-hover:gap-4 transition-all"
              >
                Explore Focus Module <ChevronRight size={16} />
              </Button>
            </CardContent>
            {/* AI Glow Effect */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full" />
          </Card>

          {/* Simulation Training Card */}
          <Card className="lg:col-span-7 rounded-[32px] border-none shadow-sm bg-[#e1e8fd] overflow-hidden">
            <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 tracking-[1.5px] uppercase">
                    Scheduled Session
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-[#141b2b]">
                    Simulation Training
                  </h3>
                  <p className="text-base font-medium text-slate-500 leading-snug">
                    Tomorrow at 3:00 PM • Advanced Highway Entry
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button className="rounded-xl bg-[#141b2b] hover:bg-slate-800 text-white font-bold h-11 px-6 transition-transform active:scale-95">
                    Add to Calendar
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-xl bg-white/50 text-[#141b2b] font-bold h-11 px-6 hover:bg-white transition-all"
                  >
                    Details
                  </Button>
                </div>
              </div>

              <div className="relative group">
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 rotate-2 group-hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzuBhk3q3lHZyFQgpUu_MwnkvMVRy3NwtvDg&s"
                    alt="Simulation View"
                    className="w-full h-40 object-cover scale-110 group-hover:scale-100 transition-transform duration-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Quick Links Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUICK_LINKS.map((link, idx) => (
            <Card
              key={idx}
              className="rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                    {link.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#141b2b]">
                      {link.title}
                    </h4>
                    <p className="text-xs text-slate-500">{link.subtitle}</p>
                  </div>
                </div>
                <ChevronRight
                  className="text-slate-300 group-hover:text-blue-600 transition-colors"
                  size={16}
                />
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-screen-xl mx-auto px-10 py-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-100 mt-20">
        <p className="text-sm font-medium text-slate-400">
          © 2026 DriveMaster Technologies. All rights reserved.
        </p>
        <nav className="flex gap-8">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-[10px] font-bold text-slate-400 tracking-[1.5px] hover:text-blue-600 transition-colors uppercase"
            >
              {link}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
};
