import {
  AlertCircle,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  LogOut,
  Mail,
  Settings2,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";

const sideMenus = [
  { label: "Account Details", icon: UserCircle2, variant: "selected" },
  { label: "Security & Privacy", icon: ShieldCheck, variant: "default" },
  { label: "Subscription", icon: CreditCard, variant: "default" },
];

const notifications = [
  {
    label: "Email Notifications",
    description: "System alerts via email",
    enabled: true,
  },
  {
    label: "SMS Alerts",
    description: "Critical updates to mobile",
    enabled: false,
  },
  {
    label: "Push Notifications",
    description: "Direct app messaging",
    enabled: true,
  },
];

function Toggle({ enabled }) {
  return (
    <span
      className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition ${
        enabled ? "bg-blue-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-4" : "translate-x-0"}`}
      />
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold tracking-[0.1em] text-slate-400">
        {label}
      </label>
      <div className="rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-slate-700">
        {value}
      </div>
    </div>
  );
}

export function AdminSettings() {
  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <aside className="flex min-h-[760px] flex-col rounded-xl border border-blue-100 bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white">
            <Settings2 className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-800">ADMIN PANEL</p>
            <p className="text-[10px] font-semibold text-slate-400">SYSTEM CORE</p>
          </div>
        </div>

        <nav className="space-y-1">
          {sideMenus.map((item) => {
            const Icon = item.icon;
            const buttonClass =
              item.variant === "primary"
                ? "bg-blue-600 text-white"
                : item.variant === "selected"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700";

            return (
              <button
                key={item.label}
                type="button"
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition ${buttonClass}`}
              >
                {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 pt-4">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <CircleHelp className="h-3.5 w-3.5" />
            HELP CENTER
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <LogOut className="h-3.5 w-3.5" />
            LOGOUT
          </button>
        </div>
      </aside>

      <section className="space-y-4">
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure platform preferences and system-wide behaviors.
          </p>
        </header>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <article className="rounded-xl border border-blue-100 bg-white p-4">
            <h2 className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-800">
              <Settings2 className="h-4 w-4 text-blue-600" />
              General Settings
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="PLATFORM NAME" value="DriveMaster" />
              <Field label="SUPPORT EMAIL" value="support@drivemaster.com" />
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-[10px] font-bold tracking-[0.1em] text-slate-400">
                PLATFORM DESCRIPTION
              </label>
              <div className="rounded-md bg-blue-50 px-3 py-3 text-xs text-slate-700">
                The leading digital solution for driver training schools and instructors.
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-[10px] font-bold tracking-[0.1em] text-slate-400">
                TIMEZONE
              </label>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                Asia/Ho_Chi_Minh (GMT+07:00)
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
              >
                Save Changes
              </button>
            </div>
          </article>

          <article className="rounded-xl border border-blue-100 bg-white p-4">
            <h2 className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-800">
              <ClipboardCheck className="h-4 w-4 text-blue-600" />
              Exam Config
            </h2>

            <div className="space-y-3">
              <Field label="PASS THRESHOLD" value="80%" />
              <Field label="TIME LIMIT (MINS)" value="25" />
              <Field label="QUESTIONS PER TEST" value="35" />
            </div>

            <div className="mt-3 flex items-center justify-between rounded-md bg-blue-50 px-3 py-2">
              <p className="text-xs font-semibold text-slate-600">Randomize Order</p>
              <Toggle enabled />
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-md bg-blue-100 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
            >
              Save Exam Settings
            </button>
          </article>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_2fr]">
          <article className="rounded-xl border border-blue-100 bg-white p-4">
            <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-800">
              <Mail className="h-4 w-4 text-blue-600" />
              Notifications
            </h2>

            <div className="space-y-2">
              {notifications.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-2"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.description}</p>
                  </div>
                  <Toggle enabled={item.enabled} />
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-rose-100 bg-white p-4">
            <h2 className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-rose-600">
              <AlertCircle className="h-4 w-4" />
              Danger Zone
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Maintenance Mode</p>
                  <p className="text-[10px] text-slate-400">Restrict user access</p>
                </div>
                <Toggle enabled={false} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-100 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Clear System Cache</p>
                  <p className="text-[10px] text-slate-400">Optimize performance</p>
                </div>
                <button
                  type="button"
                  className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500"
                >
                  Clear Cache
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-100 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Reset Analytics Data</p>
                  <p className="text-[10px] text-slate-400">Irreversible action, backup required</p>
                </div>
                <button
                  type="button"
                  className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Reset Data
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
