import { ArrowLeft, Edit, Users, Calendar, FileText, Settings } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export function InstructorClassroomDetailsPage() {
  const navigate = useNavigate();
  const { classId } = useParams();

  // Sample classroom data - would come from API in production
  const classroom = {
    id: classId,
    title: classId?.replace(/-/g, " ").toUpperCase() || "B2 Weekend Batch A",
    license: "B2 MANUAL",
    instructor: "Lead Instructor Alex",
    description: "Comprehensive driver training program for B2 license holders",
    totalStudents: 24,
    maxStudents: 30,
    progress: 80,
    startDate: "2026-03-15",
    endDate: "2026-06-30",
    schedule: "Every Saturday 14:00 - 18:00",
    status: "Active",
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "students", label: "Students" },
    { id: "schedule", label: "Schedule" },
    { id: "materials", label: "Materials" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/instructor/classrooms")}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 text-slate-500 transition hover:bg-blue-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            {classroom.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{classroom.description}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <Edit className="h-4 w-4" />
          Edit Class
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">License Type</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{classroom.license}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Students</p>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {classroom.totalStudents}/{classroom.maxStudents}
          </p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Status</p>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-green-600">{classroom.status}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">Progress</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{classroom.progress}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-blue-100">
            <div
              className="h-1.5 rounded-full bg-blue-600"
              style={{ width: `${classroom.progress}%` }}
            />
          </div>
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
                className="border-b-2 border-transparent px-4 py-4 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500">Instructor</label>
                <p className="mt-1 text-sm text-slate-900">{classroom.instructor}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500">Schedule</label>
                <p className="mt-1 text-sm text-slate-900">{classroom.schedule}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500">Start Date</label>
                <p className="mt-1 text-sm text-slate-900">{classroom.startDate}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500">End Date</label>
                <p className="mt-1 text-sm text-slate-900">{classroom.endDate}</p>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-bold text-slate-900">Class Description</h3>
              <p className="mt-2 text-sm text-slate-600">{classroom.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
