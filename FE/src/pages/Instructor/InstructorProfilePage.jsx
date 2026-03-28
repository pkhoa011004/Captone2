import {
  Calendar,
  Check,
  CreditCard,
  Lock,
  Shield,
  UserCircle2,
} from "lucide-react";

const sideMenus = [
  { label: "PROFILE DETAILS", icon: UserCircle2, active: true },
  { label: "LICENSE INFO", icon: CreditCard },
  { label: "TEACHING SCHEDULE", icon: Calendar },
  { label: "SUBSCRIPTION", icon: CreditCard },
  { label: "SECURITY", icon: Shield },
];

const availabilityDays = [
  { day: "MON", enabled: true },
  { day: "TUE", enabled: true },
  { day: "WED", enabled: true },
  { day: "THU", enabled: true },
  { day: "FRI", enabled: true },
  { day: "SAT", enabled: false },
  { day: "SUN", enabled: false },
];

const notificationSettings = [
  { label: "Student Exam Alerts", enabled: true },
  { label: "Class Schedule Reminders", enabled: true },
  { label: "Weekly Performance Reports", enabled: false },
];

const emailPreferences = [
  { label: "Daily Student Progress Digest", enabled: true },
  { label: "Monthly Performance Report", enabled: true },
  { label: "New Student Enrollment", enabled: true },
  { label: "System Maintenance", enabled: false },
];

function Toggle({ enabled }) {
  return (
    <span
      className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition ${
        enabled ? "bg-blue-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white transition ${
          enabled ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold tracking-[0.12em] text-slate-400">{label}</p>
      <div className="rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-slate-700">
        {value}
      </div>
    </div>
  );
}

function Checkbox({ enabled }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
        enabled ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"
      }`}
    >
      {enabled ? <Check className="h-3 w-3" /> : null}
    </span>
  );
}

export function InstructorProfilePage() {
  return (
    <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
      <aside className="rounded-xl border border-blue-100 bg-white p-4">
        <div className="mb-4">
          <p className="text-sm font-bold text-blue-700">Instructor Portal</p>
          <p className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">
            MANAGE YOUR PROFESSIONAL PATH
          </p>
        </div>

        <nav className="space-y-1">
          {sideMenus.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition ${
                  item.active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="space-y-4">
        <article className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Mai Phuoc Khoa"
              className="h-16 w-16 rounded-full border border-blue-100 bg-blue-50 object-cover"
            />
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Mai Phuoc Khoa</h1>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">SENIOR INSTRUCTOR</span>
                <span className="ml-2">Join Date: Feb 8, 2026</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            Edit Profile
          </button>
        </article>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <article className="rounded-xl border border-blue-100 bg-white p-4">
            <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-slate-400">
              PROFESSIONAL INFORMATION
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="FULL NAME" value="Thai Kim Ngoc" />
              <Field label="INSTRUCTOR ID" value="DTU - INS - 123456" />
              <Field label="PHONE NUMBER" value="+84 908 123 456" />
              <Field label="SPECIALIZATION" value="All Licenses (A1, B2, C, D, E)" />
            </div>
          </article>

          <article className="rounded-xl border border-blue-100 bg-white p-4">
            <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-slate-400">ACCOUNT SECURITY</p>
            <div className="space-y-3">
              <Field label="NEW PASSWORD" value="**********" />
              <Field label="CONFIRM PASSWORD" value="**********" />
            </div>
            <button
              type="button"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-100 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-200"
            >
              <Lock className="h-3.5 w-3.5" />
              Update Password
            </button>
          </article>
        </div>

        <article className="rounded-xl border border-blue-100 bg-white p-4">
          <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-slate-400">TEACHING AVAILABILITY</p>
          <div className="grid gap-2 md:grid-cols-7">
            {availabilityDays.map((item) => (
              <div key={item.day} className="rounded-md bg-blue-50 p-2 text-center">
                <p className="text-[10px] font-bold text-slate-500">{item.day}</p>
                <div className="mt-2 flex justify-center">
                  <Toggle enabled={item.enabled} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[2fr_1fr]">
            <div>
              <p className="mb-2 text-[10px] font-bold tracking-[0.12em] text-slate-400">
                PREFERRED TIME SLOTS
              </p>
              <div className="space-y-2">
                {[
                  { label: "Morning (07:00 - 11:30)", enabled: true },
                  { label: "Afternoon (13:30 - 17:00)", enabled: true },
                  { label: "Evening (18:00 - 21:00)", enabled: false },
                ].map((slot) => (
                  <div
                    key={slot.label}
                    className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-2"
                  >
                    <p className="text-xs text-slate-700">{slot.label}</p>
                    <Checkbox enabled={slot.enabled} />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md bg-blue-50 p-4 text-center">
              <p className="text-[10px] font-bold tracking-[0.12em] text-blue-700">PREFERRED CLASS SIZE</p>
              <p className="mt-3 text-5xl font-extrabold tracking-tight text-slate-900">1 - 4</p>
              <p className="mt-1 text-[11px] text-slate-500">Students per session</p>
              <div className="mx-auto mt-4 h-1 w-full rounded-full bg-blue-100">
                <div className="h-1 w-1/2 rounded-full bg-blue-600" />
              </div>
            </div>
          </div>
        </article>

        <div className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-xl border border-blue-100 bg-white p-4">
            <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-slate-400">
              NOTIFICATION SETTINGS
            </p>
            <div className="space-y-2">
              {notificationSettings.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-2"
                >
                  <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                  <Toggle enabled={item.enabled} />
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-blue-100 bg-white p-4">
            <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-slate-400">EMAIL PREFERENCES</p>
            <div className="space-y-2">
              {emailPreferences.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-2"
                >
                  <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                  <Checkbox enabled={item.enabled} />
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
          >
            Discard Changes
          </button>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            Save All Settings
          </button>
        </div>
      </section>
    </div>
  );
}
