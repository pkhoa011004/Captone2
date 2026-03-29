import { ArrowLeft, Edit, Eye, Users, Clock, BarChart3, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export function InstructorExerciseDetailsPage() {
  const navigate = useNavigate();
  const { examId } = useParams();

  // Sample exam data - would come from API in production
  const exam = {
    id: examId || "#EX-801",
    title: "De thi ly thuyet B2 - De so 1",
    license: "B2",
    description: "Comprehensive theory test for B2 license applicants covering all traffic rules and regulations",
    totalQuestions: 35,
    duration: "22 min",
    passScore: 28,
    totalAttempts: 142,
    averageScore: "88.5%",
    status: "Active",
    createdDate: "2026-02-15",
    lastModified: "2026-03-23",
    topics: ["Traffic Rules", "Vehicle Safety", "Defensive Driving", "Environmental Awareness"],
    statistics: {
      averageTime: "18 min",
      difficulty: "Medium",
      completionRate: 94,
      passRate: 88.5,
    },
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "questions", label: "Questions" },
    { id: "results", label: "Results & Analytics" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/instructor/exercises")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 text-slate-500 transition hover:bg-blue-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {exam.title}
              </h1>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                {exam.license}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{exam.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            <Edit className="h-4 w-4" />
            Edit Exam
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">Questions</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{exam.totalQuestions}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Duration</p>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{exam.duration}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Attempts</p>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{exam.totalAttempts}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Avg Score</p>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-green-600">{exam.averageScore}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg border border-blue-100 bg-white">
        <div className="border-b border-slate-100">
          <div className="flex items-center overflow-x-auto px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`border-b-2 px-4 py-4 text-sm font-semibold transition ${
                  tab.id === "overview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="mb-2 text-sm font-bold text-slate-900">Description</h3>
              <p className="text-sm text-slate-600">{exam.description}</p>
            </div>

            {/* Topics */}
            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-900">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {exam.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-900">Performance Statistics</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Average Time</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{exam.statistics.averageTime}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Difficulty Level</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{exam.statistics.difficulty}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Completion Rate</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{exam.statistics.completionRate}%</p>
                  <div className="mt-2 h-1.5 rounded-full bg-blue-100">
                    <div
                      className="h-1.5 rounded-full bg-blue-600"
                      style={{ width: `${exam.statistics.completionRate}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Pass Rate</p>
                  <p className="mt-2 text-lg font-bold text-green-600">{exam.statistics.passRate}%</p>
                  <div className="mt-2 h-1.5 rounded-full bg-green-100">
                    <div
                      className="h-1.5 rounded-full bg-green-600"
                      style={{ width: `${exam.statistics.passRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="border-t border-slate-100 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Created</p>
                  <p className="mt-1 text-sm text-slate-900">{exam.createdDate}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Last Modified</p>
                  <p className="mt-1 text-sm text-slate-900">{exam.lastModified}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Passing Score</p>
                  <p className="mt-1 text-sm text-slate-900">{exam.passScore}/{exam.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Status</p>
                  <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {exam.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
