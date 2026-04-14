import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { learnerDashboardApi } from "@/services/api/learnerDashboard";
import learnerScheduleApi from "@/services/api/learnerSchedule";

const QUICK_LINKS = [
  {
    icon: <MessageSquare className="text-blue-600" size={20} />,
    titleKey: "dashboardPage.askAiAssistant",
    subtitleKey: "dashboardPage.askAiAssistantSub",
    path: "/learner/ai-assistant",
  },
  {
    icon: <Map className="text-blue-600" size={20} />,
    titleKey: "dashboardPage.reviewRoutes",
    subtitleKey: "dashboardPage.reviewRoutesSub",
  },
  {
    icon: <FileText className="text-blue-600" size={20} />,
    titleKey: "dashboardPage.documentCenter",
    subtitleKey: "dashboardPage.documentCenterSub",
  },
];

const FOOTER_LINKS = ["SAFETY PROTOCOLS", "PRIVACY POLICY", "SUPPORT"];
const DEFAULT_SIMULATION_IMAGE =
  "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/Cover_744a8e3903.jpg";

const DASHBOARD_FALLBACK = {
  knowledgeTheory: {
    completedQuestions: 0,
    totalQuestions: 600,
    completionPercent: 0,
  },
  latestTest: {
    name: "No test yet",
    correctAnswers: 0,
    totalQuestions: 0,
    accuracyPercent: 0,
  },
  aiLearningBridge: {
    focusTopic: "Traffic rules",
    message: "Start a practice test to receive AI insights.",
  },
  simulationTraining: {
    title: "Simulation Training",
    nextSessionAt: null,
    imageUrl: DEFAULT_SIMULATION_IMAGE,
  },
};

const formatSessionTime = (isoDateString) => {
  if (!isoDateString) {
    return "No scheduled session yet";
  }

  const date = new Date(isoDateString);
  if (Number.isNaN(date.getTime())) {
    return "No scheduled session yet";
  }

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTarget = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDiff = Math.round(
    (startTarget.getTime() - startToday.getTime()) / (24 * 60 * 60 * 1000),
  );

  const timeText = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (dayDiff === 0) return `Today at ${timeText}`;
  if (dayDiff === 1) return `Tomorrow at ${timeText}`;

  const dateText = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${dateText} at ${timeText}`;
};

const formatDateLabel = (value) => {
  if (!value) return "TBD";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "TBD";
  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTimeLabel = (value) => {
  if (!value) return "TBD";
  const raw = String(value).trim();
  if (!raw) return "TBD";
  if (/\b(AM|PM)\b/i.test(raw)) return raw;
  const normalized = raw.length === 5 ? `${raw}:00` : raw;
  const parsed = new Date(`1970-01-01T${normalized}`);
  if (Number.isNaN(parsed.getTime())) return raw.slice(0, 5);
  return parsed.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const parseSessionDateTime = (session) => {
  const rawDate =
    session?.date || session?.sessionDate || session?.session_date;
  if (!rawDate) return null;

  const rawTime = session?.startTime || session?.start_time || "00:00:00";
  const normalizedTime =
    String(rawTime).trim().length === 5
      ? `${String(rawTime).trim()}:00`
      : String(rawTime).trim();
  const parsed = new Date(`${String(rawDate).slice(0, 10)}T${normalizedTime}`);

  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const getUpcomingScheduleSession = (sessions = []) => {
  if (!Array.isArray(sessions) || sessions.length === 0) return null;

  const withDate = sessions
    .map((session) => ({
      session,
      parsedDate: parseSessionDateTime(session),
    }))
    .filter((item) => item.parsedDate);

  if (withDate.length === 0) return null;

  const sorted = [...withDate].sort(
    (a, b) => a.parsedDate.getTime() - b.parsedDate.getTime(),
  );

  const now = Date.now();
  const upcoming = sorted.find((item) => item.parsedDate.getTime() >= now);
  return (upcoming || sorted[0]).session;
};

export const DashboardLearner = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(DASHBOARD_FALLBACK);
  const [nextScheduleSession, setNextScheduleSession] = useState(null);
  const [showDashboardDetail, setShowDashboardDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [dashboardResponse, scheduleResponse] = await Promise.all([
          learnerDashboardApi.getLearnerDashboard(),
          learnerScheduleApi.getLearnerSchedule().catch(() => null),
        ]);

        const nextSession = getUpcomingScheduleSession(
          scheduleResponse?.sessions || [],
        );

        if (mounted) {
          setDashboardData(dashboardResponse || DASHBOARD_FALLBACK);
          setNextScheduleSession(nextSession);
        console.log("🔄 Fetching learner dashboard...");
        const data = await learnerDashboardApi.getLearnerDashboard();
        console.log("✅ Dashboard data:", data);
        if (mounted && data) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error("❌ Error fetching dashboard:", error);
        if (mounted) {
          setDashboardData(DASHBOARD_FALLBACK);
          setNextScheduleSession(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const knowledgeTheory =
    dashboardData?.knowledgeTheory || DASHBOARD_FALLBACK.knowledgeTheory;
  const latestTest = dashboardData?.latestTest || DASHBOARD_FALLBACK.latestTest;
  const aiLearningBridge =
    dashboardData?.aiLearningBridge || DASHBOARD_FALLBACK.aiLearningBridge;
  const simulationTraining =
    dashboardData?.simulationTraining || DASHBOARD_FALLBACK.simulationTraining;

  const scheduledCardTitle =
    nextScheduleSession?.title ||
    simulationTraining?.title ||
    "Simulation Training";

  const scheduledSessionDate =
    nextScheduleSession?.date ||
    nextScheduleSession?.sessionDate ||
    simulationTraining?.nextSessionAt ||
    null;

  const scheduledSessionStartTime =
    nextScheduleSession?.startTime || nextScheduleSession?.start_time || null;

  const scheduledSessionEndTime =
    nextScheduleSession?.endTime || nextScheduleSession?.end_time || null;

  const scheduledSessionInstructor =
    nextScheduleSession?.instructor ||
    (nextScheduleSession?.instructorId
      ? `Instructor #${nextScheduleSession.instructorId}`
      : "Instructor TBD");

  const scheduledSessionLocation = nextScheduleSession?.location || "TBD";

  const scheduleCardDateTime =
    scheduledSessionDate && scheduledSessionStartTime
      ? `${String(scheduledSessionDate).slice(0, 10)}T${
          String(scheduledSessionStartTime).trim().length === 5
            ? `${String(scheduledSessionStartTime).trim()}:00`
            : String(scheduledSessionStartTime).trim()
        }`
      : scheduledSessionDate;

  const simulationImageUrl =
    simulationTraining?.imageUrl || DEFAULT_SIMULATION_IMAGE;

  const sessionTimeText = useMemo(
    () => formatSessionTime(scheduleCardDateTime),
    [scheduleCardDateTime],
  );

  const aiBridgeMessage = useMemo(() => {
    const message = String(aiLearningBridge?.message || "").trim();
    if (!message) return t("dashboardPage.aiFallback");

    if (
      i18n.language === "vi" &&
      /you\s+should\s+review\s+traffic\s+signs/i.test(message)
    ) {
      return t("dashboardPage.aiMessageReviewSigns");
    }

    return message;
  }, [aiLearningBridge?.message, i18n.language, t]);

  const safeCompletion = Math.max(
    0,
    Math.min(100, Number(knowledgeTheory?.completionPercent || 0)),
  );

  const handleDashboardDetailToggle = () => {
    if (!nextScheduleSession?.id) return;
    setShowDashboardDetail((prev) => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans">
      <main className="flex-1 w-full max-w-7xl mx-auto p-10 space-y-14">
        {/* 1. Hero Section */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-black tracking-tight leading-tight font-manrope">
              <span className="text-[#141b2b]">
                {t("dashboardPage.heroLead")}{" "}
              </span>
              <span className="text-[#004ac6]">
                {t("dashboardPage.heroAccent")}
              </span>
            </h1>
          </div>
          <div className="flex gap-4">
            <Button
              className="h-12 px-8 rounded-xl bg-[#004ac6] hover:bg-blue-700 shadow-lg shadow-blue-200 gap-2"
              onClick={() => navigate("/learner/practice-tests")}
            >
              <Play size={18} fill="currentColor" />
              <span className="font-bold">{t("dashboardPage.startTest")}</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8 rounded-xl bg-[#e1e8fd] border-none text-[#004ac6] font-bold hover:bg-blue-200 transition-all"
              onClick={() => navigate("/learner/simulator")}
            >
              {t("dashboardPage.quickSimulation")}
            </Button>
          </div>
        </section>

        {/* 2. Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Knowledge Theory Card */}
          <Card className="lg:col-span-8 rounded-[32px] border-none shadow-sm overflow-hidden bg-white">
            <CardContent className="p-12 flex flex-col justify-between h-full min-h-95 gap-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold text-[#141b2b] font-manrope">
                    {t("dashboardPage.knowledgeTheory")}
                  </h2>
                  <p className="text-base text-slate-500 font-medium">
                    {t("dashboardPage.progressReadiness")}
                  </p>
                </div>
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none rounded-full px-5 py-2 text-sm font-bold shadow-sm">
                  {safeCompletion}% {t("dashboardPage.complete")}
                </Badge>
              </div>

              <div className="flex items-end gap-3">
                <span className="text-[6rem] leading-none font-black tracking-tighter text-[#141b2b]">
                  {knowledgeTheory?.completedQuestions ?? 0}
                </span>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-300 leading-none">
                    / {knowledgeTheory?.totalQuestions ?? 600}
                  </span>
                  <span className="text-sm font-bold text-slate-400 tracking-[2px] uppercase">
                    {t("dashboardPage.questions")}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Progress
                  value={safeCompletion}
                  className="h-5 bg-slate-100"
                  indicatorClassName="bg-[#004ac6]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Latest Test Summary */}
          <Card className="lg:col-span-4 rounded-[32px] border-none shadow-sm bg-[#f1f3ff]">
            <CardContent className="p-12 flex flex-col justify-between h-full min-h-95 gap-8">
              <div className="flex items-start justify-between gap-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600">
                  <Zap size={24} fill="currentColor" />
                </div>
                <span className="pt-2 text-sm font-bold text-slate-400 tracking-[3px]">
                  {t("dashboardPage.latestTest")}
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-[15px] font-bold text-slate-500 uppercase tracking-tight">
                  {latestTest?.name || t("dashboardPage.noTestYet")}
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-6xl leading-none font-black text-[#141b2b]">
                    {latestTest?.correctAnswers ?? 0}
                  </span>
                  <span className="pb-1 text-2xl font-bold text-slate-400">
                    / {latestTest?.totalQuestions ?? 0}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  {t("dashboardPage.latestTestDesc")}
                </p>
              </div>

              <div className="flex items-center gap-3 p-5 bg-green-50 rounded-2xl border border-green-100 shadow-sm mt-auto">
                <CheckCircle2 size={22} className="text-green-600" />
                <span className="text-base font-bold text-green-700">
                  {latestTest?.accuracyPercent ?? 0}%{" "}
                  {t("dashboardPage.accuracyScore")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* AI Learning Bridge Card */}
          <Card className="lg:col-span-5 rounded-[32px] border-none shadow-sm bg-[#293040] text-white relative overflow-hidden group">
            <CardContent className="p-12 flex flex-col gap-8 relative z-10 min-h-85">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg text-blue-300">
                  <Cpu size={22} />
                </div>
                <h3 className="text-xl font-bold font-manrope">
                  {t("dashboardPage.aiLearningBridge")}
                </h3>
              </div>

              <p className="text-2xl font-medium leading-relaxed max-w-88">
                "{aiBridgeMessage}"
              </p>

              <Button
                variant="link"
                className="p-0 h-auto text-blue-300 font-bold justify-start gap-2 group-hover:gap-4 transition-all"
              >
                {t("dashboardPage.exploreFocusModule")}{" "}
                <ChevronRight size={16} />
              </Button>
            </CardContent>
            {/* AI Glow Effect */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full" />
          </Card>

          {/* Simulation Training Card */}
          <Card className="lg:col-span-7 rounded-[32px] border-none shadow-sm bg-[#e1e8fd] overflow-hidden">
            <CardContent className="p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full min-h-85">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 tracking-[1.5px] uppercase">
                    {t("dashboardPage.scheduledSession")}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-[2.1rem] font-black text-[#141b2b] leading-tight">
                    {scheduledCardTitle}
                  </h3>
                  <p className="text-lg font-medium text-slate-500 leading-snug">
                    {sessionTimeText}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    className="rounded-xl bg-[#141b2b] hover:bg-slate-800 text-white font-bold h-11 px-6 transition-transform active:scale-95"
                    onClick={() => navigate("/learner/schedule")}
                  >
                    {t("dashboardPage.addToCalendar")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDashboardDetailToggle}
                    disabled={!nextScheduleSession?.id}
                    title="View details"
                    aria-label="View schedule details"
                  >
                    <Info size={16} />
                  </Button>
                </div>
              </div>

              <div className="relative group">
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 rotate-2 group-hover:rotate-0 transition-transform duration-500">
                  <img
                    src={simulationImageUrl}
                    alt="Simulation View"
                    className="w-full h-40 object-cover scale-110 group-hover:scale-100 transition-transform duration-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Quick Links Row */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-[0.2em] text-blue-500 uppercase">
                {t("dashboardPage.quickAccess")}
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-[#141b2b]">
                {t("dashboardPage.quickAccessTitle")}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUICK_LINKS.map((link, idx) => (
              <Card
                key={idx}
                className="rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group min-h-37"
                onClick={() => link.path && navigate(link.path)}
              >
                <CardContent className="p-8 flex items-center justify-between gap-6 h-full">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 flex items-center justify-center bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors shrink-0">
                      {link.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-black tracking-tight text-[#141b2b]">
                        {t(link.titleKey)}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500 font-medium leading-relaxed">
                        {t(link.subtitleKey)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className="text-slate-300 group-hover:text-blue-600 transition-colors shrink-0"
                    size={20}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {isLoading && (
          <div className="text-sm font-medium text-slate-400">
            {t("dashboardPage.loading")}
          </div>
        )}
      </main>

      {showDashboardDetail && nextScheduleSession ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close session details"
            className="absolute inset-0 bg-[#141b2b]/25"
            onClick={() => setShowDashboardDetail(false)}
          />

          <div className="absolute left-1/2 top-1/2 w-[min(92vw,820px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-[0.14em] text-blue-600 uppercase">
                  {t("dashboardPage.sessionDetails")}
                  Session Details
                </p>
                <h4 className="text-2xl font-black text-[#141b2b] leading-tight">
                  {scheduledCardTitle}
                </h4>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-500"
                onClick={() => setShowDashboardDetail(false)}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="p-6">
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <th className="w-42 bg-slate-50 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {t("dashboardPage.date")}
                        Date
                      </th>
                      <td className="px-4 py-3 font-semibold text-[#141b2b]">
                        {formatDateLabel(scheduledSessionDate)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <th className="bg-slate-50 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {t("dashboardPage.time")}
                        Time
                      </th>
                      <td className="px-4 py-3 font-semibold text-[#141b2b]">
                        {formatTimeLabel(scheduledSessionStartTime)} -{" "}
                        {formatTimeLabel(scheduledSessionEndTime)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <th className="bg-slate-50 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {t("dashboardPage.instructor")}
                        Instructor
                      </th>
                      <td className="px-4 py-3 font-semibold text-[#141b2b]">
                        {scheduledSessionInstructor}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-slate-50 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {t("dashboardPage.location")}
                        Location
                      </th>
                      <td className="px-4 py-3 font-semibold text-[#141b2b]">
                        {scheduledSessionLocation}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-10 py-14 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-100 mt-20">
        <p className="text-base font-medium text-slate-500">
          {t("dashboardPage.footerCopyright")}
        </p>
        <nav className="flex flex-wrap justify-center gap-8">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm font-bold text-slate-500 tracking-[0.18em] hover:text-blue-600 transition-colors uppercase"
            >
              {link === "SAFETY PROTOCOLS"
                ? t("dashboardPage.footerSafetyProtocols")
                : link === "PRIVACY POLICY"
                  ? t("dashboardPage.footerPrivacyPolicy")
                  : t("dashboardPage.footerSupport")}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
};
