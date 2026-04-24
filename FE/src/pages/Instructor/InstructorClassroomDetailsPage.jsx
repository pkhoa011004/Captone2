import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Users, Calendar, FileText, Settings, Mail, Phone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export function InstructorClassroomDetailsPage() {
  const navigate = useNavigate();
  const { classId } = useParams();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [classroom, setClassroom] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 30,
    status: "draft",
    start_date: "",
    end_date: ""
  });

  const fetchClassroomDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/classrooms/${classId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
      });
      const data = await response.json();
      if (data.success) {
        setClassroom(data.data);
        setFormData({
          name: data.data.name,
          capacity: data.data.capacity,
          status: data.data.status,
          start_date: data.data.start_date?.split('T')[0] || "",
          end_date: data.data.end_date?.split('T')[0] || ""
        });
      } else {
        alert("Classroom not found!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroomDetails();
  }, [classId]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/classrooms/${classId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert("Classroom updated successfully!");
        setIsEditModalOpen(false);
        fetchClassroomDetails();
      } else {
        const err = await response.json();
        alert("Failed to update: " + err.message);
      }
    } catch (err) {
      alert("Error updating classroom");
    }
  };

  const handleDeleteClass = async () => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/classrooms/${classId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
      });
      if (response.ok) {
        alert("Classroom deleted successfully!");
        navigate("/instructor/classrooms");
      } else {
        const err = await response.json();
        alert("Failed to delete: " + err.message);
      }
    } catch (err) {
      alert("Error deleting classroom");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!classroom) return <div className="p-8 text-center text-red-500">Classroom not found.</div>;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "students", label: "Students" },
    { id: "schedule", label: "Schedule" },
    { id: "materials", label: "Materials" },
    { id: "settings", label: "Settings" },
  ];

  const studentCount = classroom.students?.length || 0;
  const progressPercent = classroom.capacity > 0 ? Math.min(100, Math.round((studentCount / classroom.capacity) * 100)) : 0;

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
            {classroom.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {classroom.license_type === 'A1' ? 'Motorcycle (A1)' : 'Car Auto (B1)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDeleteClass}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            <Edit className="h-4 w-4" />
            Edit Class
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">License Type</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{classroom.license_type}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Students</p>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {classroom.students?.length || 0}/{classroom.capacity}
          </p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Status</p>
          </div>
          <p className="mt-2 text-2xl font-extrabold capitalize text-green-600">{classroom.status}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">Progress</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{progressPercent}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-blue-100">
            <div
              className="h-1.5 rounded-full bg-blue-600"
              style={{ width: `${progressPercent}%` }}
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
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-4 py-4 text-sm font-semibold transition ${
                  activeTab === tab.id
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
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500">Instructor</label>
                  <p className="mt-1 text-sm text-slate-900">{classroom.instructor_name}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500">Schedule</label>
                  <p className="mt-1 text-sm text-slate-900">Custom Schedule</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500">Start Date</label>
                  <p className="mt-1 text-sm text-slate-900">{classroom.start_date?.split('T')[0]}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500">End Date</label>
                  <p className="mt-1 text-sm text-slate-900">{classroom.end_date?.split('T')[0]}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Student Roster ({classroom.license_type})</h3>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                  {classroom.students?.length || 0} Enrolled
                </span>
              </div>
              
              {classroom.students && classroom.students.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Email Address</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {classroom.students.map((student) => (
                        <tr key={student.id} className="transition-colors hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-3 text-slate-500">#{student.id}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              {student.name}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">{student.email}</td>
                          <td className="whitespace-nowrap px-4 py-3">{student.phone || "N/A"}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <span className="inline-block rounded bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                              ACTIVE
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p>No students found for this license type.</p>
                </div>
              )}
            </div>
          )}

          {activeTab !== "overview" && activeTab !== "students" && (
            <div className="py-10 text-center text-slate-500">
              This panel is under construction.
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Edit Class</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Class Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
