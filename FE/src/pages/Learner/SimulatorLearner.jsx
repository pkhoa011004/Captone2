import React from "react";
import { useTranslation } from "react-i18next";
import {
  Play,
  Video,
  Monitor,
  Clock,
  Trophy,
  LayoutGrid,
  ChevronRight,
  Signal,
  MousePointer2,
  History,
  Lock,
  CheckCircle2,
  Sparkles,
  Zap,
  Gamepad2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Dữ liệu giả lập ---
const SIM_STATS = [
  {
    labelKey: "simulatorPage.totalSessions",
    value: "42",
    icon: Monitor,
    color: "text-blue-600",
  },
  {
    labelKey: "simulatorPage.hoursPracticed",
    value: "18.5",
    icon: Clock,
    color: "text-blue-600",
  },
  {
    labelKey: "simulatorPage.bestScore",
    value: "98%",
    icon: Trophy,
    color: "text-blue-600",
  },
  {
    labelKey: "simulatorPage.scenarios",
    value: "12/15",
    icon: LayoutGrid,
    color: "text-blue-600",
  },
];

const SCENARIOS = [
  {
    titleKey: "simulatorPage.cityDriving",
    difficultyKey: "simulatorPage.easy",
    progress: 75,
    status: "Resume",
    bg: "bg-[url(/city-driving.png)]",
    diffColor: "bg-green-100 text-green-700",
  },
  {
    titleKey: "simulatorPage.highwayMerge",
    difficultyKey: "simulatorPage.medium",
    progress: 25,
    status: "Resume",
    bg: "bg-[url(/highway.png)]",
    diffColor: "bg-yellow-100 text-yellow-700",
  },
  {
    titleKey: "simulatorPage.parallelParking",
    difficultyKey: "simulatorPage.hard",
    progress: 0,
    status: "Start Test",
    bg: "bg-[url(/parking.png)]",
    diffColor: "bg-red-100 text-red-700",
  },
  {
    titleKey: "simulatorPage.nightDriving",
    difficultyKey: "simulatorPage.medium",
    progress: 50,
    status: "Resume",
    bg: "bg-[url(/night.png)]",
    diffColor: "bg-yellow-100 text-yellow-700",
  },
  {
    titleKey: "simulatorPage.rainyConditions",
    difficultyKey: "simulatorPage.hard",
    progress: 0,
    status: "Start Test",
    bg: "bg-[url(/rain.png)]",
    diffColor: "bg-red-100 text-red-700",
  },
  {
    titleKey: "simulatorPage.roundabouts",
    difficultyKey: "simulatorPage.medium",
    progress: 90,
    status: "Resume",
    bg: "bg-[url(/roundabout.png)]",
    diffColor: "bg-yellow-100 text-yellow-700",
  },
];

const PERFORMANCE_BARS = [
  { day: "MON", h: "h-16", op: "opacity-30" },
  { day: "TUE", h: "h-24", op: "opacity-50" },
  { day: "WED", h: "h-20", op: "opacity-40" },
  { day: "THU", h: "h-28", op: "opacity-70" },
  { day: "FRI", h: "h-32", op: "opacity-85" },
  { day: "SAT", h: "h-36", op: "opacity-100" },
];

export const SimulatorLearner = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans pb-20">
      {/* Floating AI Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-500/40 group"
              >
                <Gamepad2 className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="bg-[#141b2b] text-white border-none mb-2"
            >
              <p className="font-bold">{t("simulatorPage.aiInstructor")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-8 grid grid-cols-12 gap-8 mt-16">
        {/* LEFT COLUMN (9/12) */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          {/* 1. Hero Simulation Card */}
          <section className="relative h-[400px] rounded-3xl overflow-hidden bg-[#141b2b] group">
            <div className="absolute inset-0 bg-[url(/simulation-cockpit.png)] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141b2b] via-[#141b2b]/60 to-transparent" />

            <div className="relative h-full flex flex-col justify-center px-12 max-w-2xl space-y-6">
              <h1 className="text-5xl font-black text-white leading-tight font-manrope tracking-tight">
                {t("simulatorPage.heroLead")}{" "}
                <span className="text-blue-300">
                  {t("simulatorPage.heroAccent")}
                </span>
              </h1>
              <p className="text-blue-50/80 text-lg leading-relaxed">
                {t("simulatorPage.heroSubtitle")}
              </p>
              <div className="flex gap-4 pt-2">
                <Button className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-3 shadow-xl shadow-blue-900/20 transition-all active:scale-95">
                  {t("simulatorPage.launchSimulator")}{" "}
                  <Zap size={18} fill="currentColor" />
                </Button>
                <Button
                  variant="outline"
                  className="h-14 px-8 rounded-xl bg-white/10 border-white/20 backdrop-blur-md text-white font-bold hover:bg-white/20 transition-all"
                >
                  {t("simulatorPage.tutorialVideo")}
                </Button>
              </div>
            </div>
          </section>

          {/* 2. Quick Stats Grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SIM_STATS.map((stat, i) => (
              <Card
                key={i}
                className="border-none shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <stat.icon className="w-6 h-6 text-blue-500 mb-6" />
                  <p className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase mb-1">
                    {t(stat.labelKey)}
                  </p>
                  <h3 className="text-3xl font-black text-[#141b2b]">
                    {stat.value}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* 3. Training Scenarios Header */}
          <section className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#141b2b] font-manrope">
                  {t("simulatorPage.trainingScenarios")}
                </h2>
                <p className="text-slate-500 font-medium">
                  {t("simulatorPage.trainingSubtitle")}
                </p>
              </div>
              <Button
                variant="link"
                className="text-blue-600 font-bold gap-1 group"
              >
                {t("simulatorPage.viewLibrary")}
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </div>

            {/* Scenarios Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SCENARIOS.map((item, i) => (
                <Card
                  key={i}
                  className="border-none shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div
                    className={`h-32 ${item.bg} bg-cover bg-center relative`}
                  >
                    <Badge
                      className={`absolute top-3 left-3 border-none font-bold text-[10px] ${item.diffColor}`}
                    >
                      {t(item.difficultyKey)}
                    </Badge>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Signal size={16} className="text-blue-600" />
                      <h4 className="font-bold text-[#141b2b] truncate">
                        {t(item.titleKey)}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <Progress
                        value={item.progress}
                        className="h-1.5 bg-slate-100"
                        indicatorClassName="bg-blue-600"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-400 uppercase italic">
                          {item.progress > 0
                            ? `${item.progress}% ${t("simulatorPage.complete")}`
                            : t("simulatorPage.notStarted")}
                        </span>
                        <Button
                          size="sm"
                          className={`h-8 px-4 rounded-lg font-bold text-xs ${item.status === "Resume" ? "bg-blue-100 text-blue-600 hover:bg-blue-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                        >
                          {item.status === "Resume"
                            ? t("simulatorPage.resume")
                            : t("simulatorPage.startTest")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN - SIDEBAR (3/12) */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          {/* Performance Trends */}
          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History size={16} className="text-blue-600" />{" "}
                {t("simulatorPage.performanceTrends")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-36 gap-2 mb-3">
                {PERFORMANCE_BARS.map((bar, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className={`${bar.h} w-full bg-blue-600 rounded-t-sm ${bar.op}`}
                    />
                    <span className="text-[10px] font-bold text-slate-400">
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Controls Guide */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MousePointer2 size={16} className="text-blue-600" />{" "}
                {t("simulatorPage.controlsGuide")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { act: t("simulatorPage.accelerate"), key: "W" },
                { act: t("simulatorPage.brake"), key: "S" },
                { act: t("simulatorPage.steering"), key: "A / D" },
                { act: t("simulatorPage.indicators"), key: "Q / E" },
              ].map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-100"
                >
                  <span className="text-xs font-semibold text-[#141b2b]">
                    {c.act}
                  </span>
                  <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold text-blue-600">
                    {c.key}
                  </kbd>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap size={16} className="text-blue-600" />{" "}
                {t("simulatorPage.recentSessions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: t("simulatorPage.downtownLoop"),
                  time: t("simulatorPage.twoHoursAgo15m"),
                  score: "92%",
                },
                {
                  name: t("simulatorPage.parkingPro"),
                  time: t("simulatorPage.yesterday10m"),
                  score: "85%",
                },
                {
                  name: t("simulatorPage.nightCity"),
                  time: t("simulatorPage.twoDaysAgo22m"),
                  score: "78%",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[#141b2b] group-hover:text-blue-600 transition-colors">
                      {s.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {s.time}
                    </p>
                  </div>
                  <span className="text-sm font-black text-blue-600">
                    {s.score}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-none shadow-sm bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-sm font-bold">
                {t("simulatorPage.achievements")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {[
                  {
                    icon: Trophy,
                    color: "bg-yellow-100 text-yellow-600",
                    tip: t("simulatorPage.perfectScore"),
                  },
                  {
                    icon: CheckCircle2,
                    color: "bg-green-100 text-green-600",
                    tip: t("simulatorPage.safeDriver"),
                  },
                  {
                    icon: Zap,
                    color: "bg-blue-100 text-blue-600",
                    tip: t("simulatorPage.fastLearner"),
                  },
                  {
                    icon: Lock,
                    color: "bg-slate-200 text-slate-400",
                    tip: t("simulatorPage.locked"),
                  },
                ].map((item, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${item.color}`}
                        >
                          <item.icon size={18} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#141b2b] text-white">
                        <p className="text-[10px] font-bold">{item.tip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
};

export default SimulatorLearner;
