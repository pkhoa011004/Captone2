import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
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
  Loader,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import learnerScheduleApi from "@/services/api/learnerSchedule";

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const POLL_INTERVAL_MS = 10000;

const DEFAULT_OVERVIEW = {
  theoryPercent: 0,
  practicePercent: 0,
  mockTestsPercent: 0,
  examName: "No exam scheduled",
  daysLeft: 0,
  milestoneTitle: "MILESTONE",
  milestoneDescription: "No milestone has been set yet.",
  examLocation: "",
  examDate: null,
};

const DEFAULT_STUDY_PLAN = [
  { label: "Theory", percent: 0 },
  { label: "Practice", percent: 0 },
  { label: "Mock Tests", percent: 0 },
];

const translateStudyPlanLabel = (label, t) => {
  const normalized = String(label || "")
    .trim()
    .toLowerCase();
  if (normalized === "theory") return t("schedulePage.studyTheory");
  if (normalized === "practice") return t("schedulePage.studyPractice");
  if (normalized === "mock tests") return t("schedulePage.studyMockTests");
  return label;
};

const EMPTY_FORM = {
  title: "",
  sessionType: "ON-ROAD",
  sessionDate: "",
  startTime: "",
  endTime: "",
  instructorId: "",
  location: "",
  locationType: "physical",
  notes: "",
};

const formatDateLabel = (value) => {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatMonthLabel = (value) => {
  if (!value) return "Schedule";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Schedule";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
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

const getSessionBadgeStyles = (sessionType) => {
  switch (String(sessionType || "").toUpperCase()) {
    case "ON-ROAD":
      return "bg-blue-100 text-blue-700";
    case "VIRTUAL":
      return "bg-slate-100 text-slate-600";
    case "CRITICAL":
      return "bg-red-100 text-red-700";
    default:
      return "bg-indigo-100 text-indigo-700";
  }
};

const getSessionIcon = (session) => {
  const type = String(session?.sessionType || "").toUpperCase();
  const locationType = String(session?.locationType || "").toLowerCase();

  if (locationType === "virtual" || type === "VIRTUAL")
    return <BookOpen size={20} />;
  if (type.includes("ROAD") || type.includes("PRACTICE"))
    return <Car size={20} />;
  if (type.includes("EXAM") || type.includes("CRITICAL"))
    return <FileText size={20} />;
  return <Calendar size={20} />;
};

const buildCalendarDays = (monthDate, sessions = []) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  const currentMonthLastDate = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const sessionDayMap = new Map();
  sessions.forEach((session) => {
    const dateValue =
      session?.date || session?.sessionDate || session?.session_date;
    if (!dateValue) return;
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return;
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month) return;
    const day = parsed.getDate();
    sessionDayMap.set(day, {
      hasEvent: true,
      hasIcon: String(session?.locationType || "").toLowerCase() === "virtual",
    });
  });

  const cells = [];

  for (let i = startOffset - 1; i >= 0; i -= 1) {
    cells.push({ day: prevMonthLastDate - i, prev: true });
  }

  for (let day = 1; day <= currentMonthLastDate; day += 1) {
    const eventData = sessionDayMap.get(day) || {};
    const isActive =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;

    cells.push({
      day,
      active: isActive,
      hasEvent: Boolean(eventData.hasEvent),
      hasIcon: Boolean(eventData.hasIcon),
    });
  }

  return cells;
};

export const ScheduleLearner = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [scheduleData, setScheduleData] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    visible: false,
    type: "success",
    message: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [overviewDirty, setOverviewDirty] = useState(false);
  const [overviewForm, setOverviewForm] = useState({
    examDate: "",
  });
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);

  const pushToast = (type, message) => {
    setToast({ visible: true, type, message });
  };

  useEffect(() => {
    if (!toast.visible) return undefined;

    const timeoutId = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [toast.visible]);

  const loadSchedule = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const data = await learnerScheduleApi.getLearnerSchedule();
      setScheduleData(data || null);
      setError("");
    } catch (err) {
      console.error("Failed to load learner schedule:", err);
      setError("Unable to load schedule data.");
      if (!scheduleData) setScheduleData(null);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadSchedule();

    const pollId = window.setInterval(() => {
      void loadSchedule({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(pollId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overview = scheduleData?.overview || DEFAULT_OVERVIEW;
  const studyPlan =
    Array.isArray(scheduleData?.studyPlan) && scheduleData.studyPlan.length > 0
      ? scheduleData.studyPlan
      : DEFAULT_STUDY_PLAN;
  const sessions =
    Array.isArray(scheduleData?.sessions) && scheduleData.sessions.length > 0
      ? scheduleData.sessions
      : [];

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth, sessions),
    [currentMonth, sessions],
  );

  const monthLabel = useMemo(
    () => formatMonthLabel(currentMonth),
    [currentMonth],
  );

  const insightStats = useMemo(() => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(
      (item) => String(item?.status || "").toLowerCase() === "completed",
    ).length;
    const upcomingSessions = sessions.filter(
      (item) =>
        String(item?.status || "upcoming").toLowerCase() !== "completed",
    ).length;
    const averageProgress = Math.round(
      (studyPlan.reduce((sum, item) => sum + Number(item?.percent || 0), 0) ||
        0) / Math.max(studyPlan.length, 1),
    );

    return {
      totalSessions,
      completedSessions,
      upcomingSessions,
      averageProgress,
    };
  }, [sessions, studyPlan]);

  const hasInsightsData =
    insightStats.totalSessions > 0 ||
    studyPlan.some((item) => Number(item?.percent || 0) > 0);

  const localizedMilestoneTitle = useMemo(() => {
    const raw = String(overview.milestoneTitle || "").trim();
    if (!raw) return t("schedulePage.finalMilestone");
    if (i18n.language === "vi" && /^final\s+milestone$/i.test(raw)) {
      return t("schedulePage.finalMilestone");
    }
    return raw;
  }, [overview.milestoneTitle, i18n.language, t]);

  const localizedExamName = useMemo(() => {
    const raw = String(overview.examName || "").trim();
    if (!raw) return t("schedulePage.licenseExam");

    if (
      i18n.language === "vi" &&
      /(a1|b1).*(license\s*exam)|license\s*exam.*(a1|b1)/i.test(raw)
    ) {
      const level = (raw.match(/\b(A1|B1)\b/i)?.[1] || "A1").toUpperCase();
      return t("schedulePage.licenseExamWithLevel", { level });
    }

    if (i18n.language === "vi" && /^license\s*exam$/i.test(raw)) {
      return t("schedulePage.licenseExam");
    }

    return raw;
  }, [overview.examName, i18n.language, t]);

  const localizedMilestoneDescription = useMemo(() => {
    const raw = String(overview.milestoneDescription || "").trim();
    if (!raw) return t("schedulePage.keepMomentum");

    if (i18n.language === "vi" && /^keep\s+your\s+momentum/i.test(raw)) {
      return t("schedulePage.keepMomentum");
    }

    return raw;
  }, [overview.milestoneDescription, i18n.language, t]);

  useEffect(() => {
    if (overviewDirty) return;
    setOverviewForm({
      examDate: formatDateInputValue(overview.examDate),
    });
  }, [overview.examDate, overviewDirty]);

  const resetForm = () => {
    setEditingSessionId(null);
    setFormData(EMPTY_FORM);
  };

  const handleBookSession = () => {
    setShowForm(true);
    resetForm();
    const target = document.getElementById("schedule-form");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleViewInsights = () => {
    if (!hasInsightsData) {
      pushToast(
        "error",
        "No insights available yet. Add sessions or progress first.",
      );
      return;
    }

    setShowInsights(true);
    const target = document.getElementById("schedule-insights");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSaveOverview = async (event) => {
    event.preventDefault();

    if (!overviewForm.examDate) {
      pushToast("error", "Please choose an exam date first.");
      return;
    }

    const payload = {
      theoryPercent: Number(overview.theoryPercent || 0),
      practicePercent: Number(overview.practicePercent || 0),
      mockTestsPercent: Number(overview.mockTestsPercent || 0),
      examName: overview.examName || "License Exam",
      daysLeft: Number(overview.daysLeft || 0),
      milestoneTitle: overview.milestoneTitle || "FINAL MILESTONE",
      milestoneDescription:
        overview.milestoneDescription || "Keep up your current practice pace.",
      examLocation: overview.examLocation || null,
      examDate: overviewForm.examDate,
    };

    try {
      setSaving(true);
      setError("");
      await learnerScheduleApi.updateScheduleOverview(payload);
      setOverviewDirty(false);
      await loadSchedule({ silent: true });
      pushToast("success", "Exam date updated. Countdown is now active.");
    } catch (err) {
      console.error("Update overview failed:", err);
      const serverMessage = err?.response?.data?.message;
      const errorMessage = serverMessage || "Failed to update exam date.";
      setError(errorMessage);
      pushToast("error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSession = (session) => {
    setEditingSessionId(session.id);
    setShowForm(true);
    setFormData({
      title: session.title || "",
      sessionType: session.sessionType || "ON-ROAD",
      sessionDate: String(session.date || session.sessionDate || "").slice(
        0,
        10,
      ),
      startTime: String(session.startTime || "").slice(0, 5),
      endTime: String(session.endTime || "").slice(0, 5),
      instructorId: session.instructorId ? String(session.instructorId) : "",
      location: session.location || "",
      locationType: session.locationType || "physical",
      notes: session.notes || "",
    });

    const target = document.getElementById("schedule-form");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const showSessionDetail = (session, { scrollToCard = false } = {}) => {
    if (!session) return;
    setSelectedSessionDetail(session);

    if (scrollToCard && session.id) {
      window.setTimeout(() => {
        const target = document.getElementById(`session-card-${session.id}`);
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  const handleToggleSessionDetail = (session) => {
    if (!session?.id) return;

    if (String(selectedSessionDetail?.id) === String(session.id)) {
      setSelectedSessionDetail(null);
      return;
    }

    showSessionDetail(session);
  };

  const handleDeleteSession = async (sessionId) => {
    const confirmed = window.confirm("Delete this session?");
    if (!confirmed) return;

    try {
      setSaving(true);
      await learnerScheduleApi.deleteScheduleSession(sessionId);
      await loadSchedule({ silent: true });
      pushToast("success", "Session deleted successfully.");
    } catch (err) {
      console.error("Delete session failed:", err);
      const serverMessage = err?.response?.data?.message;
      const errorMessage = serverMessage || "Failed to delete session.";
      setError(errorMessage);
      pushToast("error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Session title is required.");
      return;
    }

    if (!formData.sessionDate || !formData.startTime || !formData.endTime) {
      setError("Session date, start time and end time are required.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      sessionType: formData.sessionType,
      sessionDate: formData.sessionDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      instructorId: formData.instructorId
        ? Number(formData.instructorId)
        : null,
      location: formData.location || null,
      locationType: formData.locationType,
      notes: formData.notes || null,
      status: "upcoming",
    };

    try {
      setSaving(true);
      setError("");

      if (editingSessionId) {
        await learnerScheduleApi.updateScheduleSession(
          editingSessionId,
          payload,
        );
        pushToast("success", "Session updated successfully.");
      } else {
        const createdSession =
          await learnerScheduleApi.createScheduleSession(payload);
        if (createdSession?.id) {
          await learnerScheduleApi.createScheduleBooking({
            sessionId: createdSession.id,
            instructorId: payload.instructorId || null,
            bookingStatus: "pending",
            bookingReason:
              payload.notes || "Learner booked session from schedule page",
          });
        }
        pushToast("success", "Session created successfully.");
      }

      setShowForm(false);
      resetForm();
      await loadSchedule({ silent: true });
    } catch (err) {
      console.error("Save session failed:", err);
      const serverMessage = err?.response?.data?.message;
      const errorMessage =
        serverMessage || "Failed to save session. Please try again.";
      setError(errorMessage);
      pushToast("error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!sessions.length) return;

    const params = new URLSearchParams(location.search);
    const querySessionId = params.get("sessionId");
    if (!querySessionId) return;

    const matchedSession = sessions.find(
      (session) => String(session.id) === String(querySessionId),
    );

    if (matchedSession) {
      showSessionDetail(matchedSession, { scrollToCard: true });
    }
  }, [location.search, sessions]);

  useEffect(() => {
    if (!selectedSessionDetail?.id) return;
    const updatedSession = sessions.find(
      (session) => String(session.id) === String(selectedSessionDetail.id),
    );
    if (updatedSession) {
      setSelectedSessionDetail(updatedSession);
    }
  }, [sessions, selectedSessionDetail?.id]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans pb-20">
      {toast.visible ? (
        <div className="fixed right-6 top-28 z-100">
          <div
            className={`min-w-75 max-w-105 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        </div>
      ) : null}

      <main className="flex-1 w-full max-w-360 mx-auto p-8 grid grid-cols-12 gap-10">
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <Card className="border-none shadow-[0_12px_32px_rgba(20,27,43,0.04)] rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <CardTitle className="text-lg font-bold font-manrope text-[#141b2b]">
                {monthLabel}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-slate-400"
                  type="button"
                  onClick={() =>
                    setCurrentMonth(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                    )
                  }
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-slate-400"
                  type="button"
                  onClick={() =>
                    setCurrentMonth(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                    )
                  }
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
                {calendarDays.map((cell, i) => (
                  <div
                    key={`${cell.day}-${i}`}
                    className="relative py-2 flex items-center justify-center"
                  >
                    <button
                      type="button"
                      className={`h-9 w-9 text-sm font-semibold rounded-xl transition-all ${
                        cell.active
                          ? "bg-[#004ac6] text-white shadow-lg shadow-blue-200"
                          : "text-[#141b2b] hover:bg-slate-50"
                      } ${cell.prev ? "text-slate-300" : ""}`}
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

          <Card className="border-none shadow-[0_12px_32px_rgba(20,27,43,0.04)] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold font-manrope text-[#141b2b]">
                {t("schedulePage.weeklyStudyPlan")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {studyPlan.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">
                      {translateStudyPlanLabel(item.label, t)}
                    </span>
                    <span className="text-xs font-bold text-blue-600">
                      {item.percent}%
                    </span>
                  </div>
                  <Progress
                    value={Number(item.percent || 0)}
                    className="h-2 bg-slate-100"
                    indicatorClassName="bg-[#004ac6]"
                  />
                </div>
              ))}
              <Button
                type="button"
                className="w-full h-12 rounded-xl bg-[#004ac6] hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100"
                onClick={handleViewInsights}
              >
                {t("schedulePage.viewDetailedInsights")}
                View Detailed Insights
              </Button>

              {showInsights ? (
                <div
                  id="schedule-insights"
                  className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-[#141b2b] tracking-wide uppercase">
                      {t("schedulePage.detailedInsights")}
                      Detailed Insights
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-slate-500"
                      onClick={() => setShowInsights(false)}
                    >
                      <X size={14} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 border border-blue-100">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {t("schedulePage.avgProgress")}
                        Avg. Progress
                      </p>
                      <p className="text-xl font-black text-[#004ac6]">
                        {insightStats.averageProgress}%
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-blue-100">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {t("schedulePage.totalSessions")}
                        Total Sessions
                      </p>
                      <p className="text-xl font-black text-[#004ac6]">
                        {insightStats.totalSessions}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-blue-100">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {t("schedulePage.upcoming")}
                        Upcoming
                      </p>
                      <p className="text-xl font-black text-amber-600">
                        {insightStats.upcomingSessions}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-blue-100">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {t("schedulePage.completed")}
                        Completed
                      </p>
                      <p className="text-xl font-black text-emerald-600">
                        {insightStats.completedSessions}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>

        <section className="col-span-12 lg:col-span-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-[#141b2b] font-manrope tracking-tight">
                {t("schedulePage.title")}
              </h1>
              <p className="text-lg text-slate-500 font-medium mt-1">
                {t("schedulePage.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => loadSchedule({ silent: true })}
                variant="outline"
                className="h-12 px-4 rounded-xl border-blue-200 text-[#004ac6]"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
              </Button>
              <Button
                type="button"
                onClick={handleBookSession}
                className="h-12 px-6 rounded-xl bg-[#e1e8fd] text-[#004ac6] hover:bg-blue-100 font-bold gap-2"
              >
                <Plus size={18} strokeWidth={3} />
                {t("schedulePage.bookSession")}
                Book Session
              </Button>
            </div>
          </div>

          <Card className="border border-blue-100 rounded-2xl shadow-sm bg-white">
            <CardContent className="p-4 md:p-5">
              <form
                onSubmit={handleSaveOverview}
                className="flex flex-col md:flex-row md:items-end gap-3"
              >
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                    {t("schedulePage.examDateForDaysLeft")}
                    Exam Date (for Days Left)
                  </p>
                  <input
                    type="date"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                    value={overviewForm.examDate}
                    onChange={(e) => {
                      setOverviewDirty(true);
                      setOverviewForm((prev) => ({
                        ...prev,
                        examDate: e.target.value,
                      }));
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 px-5 rounded-xl bg-[#004ac6] hover:bg-blue-700 text-white font-bold"
                >
                  {t("schedulePage.saveExamDate")}
                  Save Exam Date
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {(loading || saving) && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-600 shadow-sm">
              <Loader className="h-5 w-5 animate-spin text-blue-600" />
              <p className="text-sm font-medium">
                {saving
                  ? t("schedulePage.savingSchedule")
                  : t("schedulePage.loadingSchedule")}
                  ? "Saving schedule changes..."
                  : "Loading schedule data..."}
              </p>
            </div>
          )}

          {showForm && (
            <Card
              id="schedule-form"
              className="border border-blue-100 shadow-sm rounded-2xl bg-white"
            >
              <CardHeader>
                <CardTitle className="text-xl font-black text-[#141b2b]">
                  {editingSessionId ? "Edit Session" : "Create Session"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleFormSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <input
                    className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                    placeholder="Session title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                  <select
                    className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                    value={formData.sessionType}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        sessionType: e.target.value,
                      }))
                    }
                  >
                    <option value="ON-ROAD">ON-ROAD</option>
                    <option value="VIRTUAL">VIRTUAL</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>

                  <input
                    type="date"
                    className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                    value={formData.sessionDate}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        sessionDate: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="number"
                    className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                    placeholder="Instructor ID (optional)"
                    value={formData.instructorId}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        instructorId: e.target.value,
                      }))
                    }
                  />

                  <input
                    type="time"
                    className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, startTime: e.target.value }))
                    }
                  />
                  <input
                    type="time"
                    className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, endTime: e.target.value }))
                    }
                  />

                  <input
                    className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, location: e.target.value }))
                    }
                  />
                  <select
                    className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                    value={formData.locationType}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        locationType: e.target.value,
                      }))
                    }
                  >
                    <option value="physical">Physical</option>
                    <option value="virtual">Virtual</option>
                  </select>

                  <textarea
                    className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                    placeholder="Notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, notes: e.target.value }))
                    }
                  />

                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {editingSessionId ? "Update Session" : "Create Session"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="relative p-8 bg-[#004ac6] rounded-[32px] overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <BarChart3 size={200} className="text-white" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4 text-center md:text-left">
                <Badge className="bg-white/20 text-white border-none font-bold tracking-widest px-3">
                  {localizedMilestoneTitle}
                </Badge>
                <h2 className="text-3xl font-black text-white font-manrope">
                  {localizedExamName}
                </h2>
                <p className="text-blue-100 text-base leading-relaxed max-w-sm">
                  {localizedMilestoneDescription}
                  {overview.milestoneTitle || "FINAL MILESTONE"}
                </Badge>
                <h2 className="text-3xl font-black text-white font-manrope">
                  {overview.examName || "License Exam"}
                </h2>
                <p className="text-blue-100 text-base leading-relaxed max-w-sm">
                  {overview.milestoneDescription ||
                    "Keep up your current practice pace."}
                  <br />
                  {overview.examLocation
                    ? `Location: ${overview.examLocation}`
                    : null}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center h-32 w-32 md:h-36 md:w-36 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                <span className="text-5xl font-black text-white">
                  {Number.isFinite(Number(overview.daysLeft))
                    ? overview.daysLeft
                    : 0}
                </span>
                <span className="text-[10px] font-bold text-blue-100 tracking-[2px] mt-1 uppercase">
                  {t("schedulePage.daysLeft")}
                </span>
              </div>
            </div>
          </div>

          <div id="upcoming-sessions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#141b2b] font-manrope">
                {t("schedulePage.upcomingSessions")}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400"
                type="button"
              >
                <Filter size={18} />
              </Button>
            </div>

            <div className="space-y-4">
              {sessions.length === 0 && !loading ? (
                <Card className="border-dashed border-blue-200 bg-white rounded-2xl">
                  <CardContent className="p-6 text-center text-slate-500 font-medium">
                    {t("schedulePage.noSessionsPrefix")}{" "}
                    <b>{t("schedulePage.bookSession")}</b>{" "}
                    {t("schedulePage.noSessionsSuffix")}
                  </CardContent>
                </Card>
              ) : null}

              {sessions.map((session, idx) => {
                const sessionType =
                  session.sessionType || session.type || "SESSION";
                const badgeStyles =
                  session.badgeStyles || getSessionBadgeStyles(sessionType);
                const sessionIcon = session.icon || getSessionIcon(session);
                const dateLabel = formatDateLabel(
                  session.date || session.sessionDate || session.session_date,
                );
                const timeLabel = `${formatTimeLabel(session.startTime || session.start_time)} - ${formatTimeLabel(session.endTime || session.end_time)}`;
                const instructorLabel =
                  session.instructor ||
                  (session.instructorId
                    ? `Instructor #${session.instructorId}`
                    : t("schedulePage.instructorTbd"));
                const locationLabel = session.location || "TBD";
                const locationType =
                  session.locationType || session.location_type || "physical";

                    You have no sessions yet. Click <b>Book Session</b> to
                    create your first one.
                  </CardContent>
                </Card>
              ) : null}

              {sessions.map((session, idx) => {
                const sessionType =
                  session.sessionType || session.type || "SESSION";
                const badgeStyles =
                  session.badgeStyles || getSessionBadgeStyles(sessionType);
                const sessionIcon = session.icon || getSessionIcon(session);
                const dateLabel = formatDateLabel(
                  session.date || session.sessionDate || session.session_date,
                );
                const timeLabel = `${formatTimeLabel(session.startTime || session.start_time)} - ${formatTimeLabel(session.endTime || session.end_time)}`;
                const instructorLabel =
                  session.instructor ||
                  (session.instructorId
                    ? `Instructor #${session.instructorId}`
                    : "Instructor TBD");
                const locationLabel = session.location || "TBD";
                const locationType =
                  session.locationType || session.location_type || "physical";

                return (
                  <Card
                    key={session.id ?? idx}
                    id={session.id ? `session-card-${session.id}` : undefined}
                    className={`border-none shadow-sm bg-[#f1f3ff] rounded-2xl hover:shadow-md transition-all group ${
                      selectedSessionDetail &&
                      String(selectedSessionDetail.id) === String(session.id)
                        ? "ring-2 ring-blue-300"
                        : ""
                    }`}
                  >
                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                      <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                        {sessionIcon}
                      </div>

                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-bold text-[#141b2b]">
                            {session.title || "Session"}
                          </h4>
                          <Badge
                            className={`border-none text-[9px] font-black px-2 ${badgeStyles}`}
                          >
                            {sessionType}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-6 text-slate-500">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Calendar size={14} className="text-blue-500" />
                            {dateLabel}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Clock size={14} className="text-blue-500" />
                            {timeLabel}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto text-right">
                        <p className="text-sm font-bold text-[#141b2b]">
                          {t("schedulePage.instructor")}: {instructorLabel}
                          Instructor: {instructorLabel}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          {locationType === "virtual" ? (
                            <Video size={12} />
                          ) : (
                            <MapPin size={12} />
                          )}
                          {locationLabel}
                        </div>
                        {session.id && (
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 hover:bg-white"
                              onClick={() => handleToggleSessionDetail(session)}
                              title="View details"
                              aria-label="View session details"
                            >
                              <Info size={14} />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onClick={() => handleEditSession(session)}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {selectedSessionDetail ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close session details"
            className="absolute inset-0 bg-[#141b2b]/25"
            onClick={() => setSelectedSessionDetail(null)}
          />

          <div className="absolute left-1/2 top-1/2 w-[min(92vw,820px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-[0.14em] text-blue-600 uppercase">
                  {t("schedulePage.sessionDetails")}
                </p>
                <h4 className="text-2xl font-black text-[#141b2b] leading-tight">
                  {selectedSessionDetail.title || t("schedulePage.session")}
                  Session Details
                </p>
                <h4 className="text-2xl font-black text-[#141b2b] leading-tight">
                  {selectedSessionDetail.title || "Session"}
                </h4>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-500"
                onClick={() => setSelectedSessionDetail(null)}
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
                        {t("schedulePage.date")}
                        Date
                      </th>
                      <td className="px-4 py-3 font-semibold text-[#141b2b]">
                        {formatDateLabel(
                          selectedSessionDetail.date ||
                            selectedSessionDetail.sessionDate ||
                            selectedSessionDetail.session_date,
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <th className="bg-slate-50 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {t("schedulePage.time")}
                        Time
                      </th>
                      <td className="px-4 py-3 font-semibold text-[#141b2b]">
                        {formatTimeLabel(
                          selectedSessionDetail.startTime ||
                            selectedSessionDetail.start_time,
                        )}
                        {" - "}
                        {formatTimeLabel(
                          selectedSessionDetail.endTime ||
                            selectedSessionDetail.end_time,
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <th className="bg-slate-50 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {t("schedulePage.instructor")}
                        Instructor
                      </th>
                      <td className="px-4 py-3 font-semibold text-[#141b2b]">
                        {selectedSessionDetail.instructor ||
                          (selectedSessionDetail.instructorId
                            ? `Instructor #${selectedSessionDetail.instructorId}`
                            : t("schedulePage.instructorTbd"))}
                            : "Instructor TBD")}
                      </td>
                    </tr>
                    <tr
                      className={
                        selectedSessionDetail.notes
                          ? "border-b border-slate-100"
                          : ""
                      }
                    >
                      <th className="bg-slate-50 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {t("schedulePage.location")}
                        Location
                      </th>
                      <td className="px-4 py-3 font-semibold text-[#141b2b]">
                        {selectedSessionDetail.location || "TBD"}
                      </td>
                    </tr>
                    {selectedSessionDetail.notes ? (
                      <tr>
                        <th className="bg-slate-50 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 align-top">
                          {t("schedulePage.notes")}
                          Notes
                        </th>
                        <td className="px-4 py-3 font-medium text-slate-700 whitespace-pre-wrap">
                          {selectedSessionDetail.notes}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ScheduleLearner;
