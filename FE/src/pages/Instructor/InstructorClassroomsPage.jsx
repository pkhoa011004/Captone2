import { useState, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ChevronDown,
  CirclePlus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    label: "My Active Classes",
    value: "2",
    icon: BookOpen,
    badge: "+1 new",
  },
  {
    label: "Total Students",
    value: "89",
    icon: Users,
  },
  {
    label: "Avg Completion",
    value: "81%",
    icon: TrendingUp,
    badge: "+ 4 %",
    badgeClass: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Upcoming Sessions",
    value: "4",
    icon: CalendarClock,
  },
];

const classes = [
  {
    license: "B2 MANUAL",
    title: "B2 Weekend Batch A",
    instructor: "Lead Instructor Alex",
    nextSession: "Next: Today, 14:00",
    students: "24/30 Students",
    progress: 80,
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    tagClass: "bg-blue-600 text-white",
  },
  {
    license: "B1 AUTO",
    title: "B1 Evening Intensive",
    instructor: "Lead Instructor Alex",
    nextSession: "Next: Tomorrow, 18:30",
    students: "18/20 Students",
    progress: 46,
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80",
    tagClass: "bg-blue-600 text-white",
  },
  {
    license: "B2 FAST TRACK",
    title: "B2 Fast Track",
    instructor: "Lead Instructor Alex",
    nextSession: "Next: Wed, 09:00",
    students: "12/12 Students",
    progress: 100,
    image:
      "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=900&q=80",
    tagClass: "bg-orange-500 text-white",
  },
];

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="rounded-xl border border-blue-100 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-4 w-4" />
        </span>
        {item.badge ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              item.badgeClass || "bg-blue-100 text-blue-600"
            }`}
          >
            {item.badge}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-slate-500">{item.label}</p>
      <p className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900">
        {item.value}
      </p>
    </article>
  );
}

function ClassCard({ item, navigate }) {
  return (
    <article className="rounded-xl border border-blue-100 bg-white p-3 shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={item.image}
          alt={item.title}
          className="h-40 w-full object-cover"
        />
        <span
          className={`absolute bottom-2 left-2 rounded px-2 py-1 text-[10px] font-bold tracking-[0.08em] ${item.tagClass}`}
        >
          {item.license}
        </span>
      </div>

      <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
        {item.title}
      </h3>
      <p className="mt-1 text-sm text-slate-500">{item.instructor}</p>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{item.nextSession}</span>
        <span className="font-semibold text-slate-700">{item.students}</span>
      </div>

      <div className="mt-2 h-2 rounded-full bg-blue-100">
        <div
          className="h-2 rounded-full bg-blue-600"
          style={{ width: `${item.progress}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() =>
          navigate(
            `/instructor/classrooms/${item.id || item.title.toLowerCase().replace(/\s+/g, "-")}`,
          )
        }
        className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
      >
        Manage Class
        <ArrowRight className="h-4 w-4" />
      </button>
    </article>
  );
}

export function InstructorClassroomsPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("classes");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbClasses, setDbClasses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [formData, setFormData] = useState({
    name: "",
    certificate_id: "1", // 1 for A1, 2 for B1
    capacity: 30,
    start_date: "",
    end_date: "",
  });

  const fetchClassrooms = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/classrooms`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setDbClasses(data.data);
        if (data.totalStudents !== undefined) {
          setTotalStudentsCount(data.totalStudents);
        }
        if (data.upcomingSessions !== undefined) {
          setUpcomingCount(data.upcomingSessions);
        }
      }

      const rosterResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/classrooms/students/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        },
      );
      const rosterData = await rosterResponse.json();
      if (rosterData.success) {
        setAllStudents(rosterData.data);
      }
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let instructorId = 1;
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.id) instructorId = user.id;
      } catch (err) {}

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/classrooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            ...formData,
            instructor_id: instructorId,
          }),
        },
      );

      if (response.ok) {
        alert("Classroom created successfully!");
        setIsCreateModalOpen(false);
        setFormData({
          name: "",
          certificate_id: "1",
          capacity: 30,
          start_date: "",
          end_date: "",
        });
        fetchClassrooms(); // Refresh UI list
      } else {
        const data = await response.json();
        alert("Failed to create: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // Derived stats
  const dynamicStats = [
    {
      label: "My Active Classes",
      value: dbClasses.length.toString(),
      icon: BookOpen,
      badge: "from DB",
    },
    {
      label: "Total Students",
      value: totalStudentsCount.toString(),
      icon: Users,
    },
    stats[2], // Avg Completion
    {
      label: "Upcoming Sessions",
      value: upcomingCount.toString(),
      icon: CalendarClock,
      badge: "Soon",
    },
  ];

  // Filtering logic
  const filteredClasses = dbClasses.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.instructor_name &&
        item.instructor_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const licenseFilter =
      selectedType === "All Types"
        ? true
        : (Number(item.certificate_id) === 1 ? "A1" : "B1") === selectedType;
    const statusFilter =
      selectedStatus === "All Status"
        ? true
        : item.status === selectedStatus.toLowerCase();

    return matchesSearch && licenseFilter && statusFilter;
  });

  return (
    <div className="space-y-5 relative">
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              Create New Class
            </h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
                  placeholder="E.g. A1 Weekend Batch"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  License Type
                </label>
                <select
                  value={formData.certificate_id}
                  onChange={(e) =>
                    setFormData({ ...formData, certificate_id: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
                >
                  <option value="1">A1 - Motorcycle</option>
                  <option value="2">B1 - Car (Auto)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Capacity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            Classrooms
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your assigned learning batches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            View Reports
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            Create Class
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dynamicStats.map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
      </section>

      <section className="rounded-xl border border-blue-100 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label>
            <p className="mb-1 text-[10px] font-bold tracking-[0.14em] text-slate-500">
              SEARCH CLASSES
            </p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by batch name or instructor..."
                className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50/40 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:bg-white"
              />
            </div>
          </label>

          <label>
            <p className="mb-1 text-[10px] font-bold tracking-[0.14em] text-slate-500">
              LICENSE TYPE
            </p>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="inline-flex h-10 min-w-32.5 w-full items-center justify-between gap-2 rounded-lg border border-blue-100 bg-blue-50/40 px-3 text-sm text-slate-600 outline-none focus:border-blue-300"
            >
              <option value="All Types">All Types</option>
              <option value="A1">A1</option>
              <option value="B1">B1</option>
            </select>
          </label>

          <label>
            <p className="mb-1 text-[10px] font-bold tracking-[0.14em] text-slate-500">
              STATUS
            </p>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="inline-flex h-10 min-w-32.5 w-full items-center justify-between gap-2 rounded-lg border border-blue-100 bg-blue-50/40 px-3 text-sm text-slate-600 outline-none focus:border-blue-300"
            >
              <option value="All Status">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Archived">Archived</option>
            </select>
          </label>
        </div>

        <div className="mt-4 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveView("classes")}
              className={`border-b-2 px-1 pb-2 text-sm font-semibold transition-colors ${activeView === "classes" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-blue-600"}`}
            >
              My Classes
            </button>
            <button
              type="button"
              onClick={() => setActiveView("roster")}
              className={`border-b-2 px-1 pb-2 text-sm font-semibold transition-colors ${activeView === "roster" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-blue-600"}`}
            >
              Student Roster
            </button>
          </div>
        </div>

        {activeView === "classes" && (
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((item) => {
                const count = item.student_count || 0;
                const progress =
                  item.capacity > 0
                    ? Math.min(100, Math.round((count / item.capacity) * 100))
                    : 0;
                return (
                  <ClassCard
                    key={item.id}
                    item={{
                      id: item.id,
                      title: item.name,
                      license: Number(item.certificate_id) === 1 ? "A1" : "B1",
                      instructor: item.instructor_name || "Unknown Instructor",
                      nextSession:
                        "Starts: " + (item.start_date?.split("T")[0] || "TBD"),
                      students: `${count}/${item.capacity} Students`,
                      progress: progress,
                      image:
                        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80",
                      tagClass: "bg-blue-600 text-white",
                    }}
                    navigate={navigate}
                  />
                );
              })
            ) : (
              <p className="text-slate-500 text-sm">
                No classes created yet. Click &quot;Create Class&quot; to begin.
              </p>
            )}
          </div>
        )}

        {activeView === "roster" && (
          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">License Type</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {allStudents.length > 0 ? (
                  allStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        #{student.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          {student.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {student.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {student.phone || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-blue-600">
                        {student.license_type || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="inline-block rounded bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
