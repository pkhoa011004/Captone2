import {
  Bell,
  Camera,
  CheckCircle2,
  CreditCard,
  KeyRound,
  Mail,
  Phone,
  Shield,
  UserCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const SIDE_MENUS = [
  {
    id: "PROFILE_DETAILS",
    labelKey: "instructorProfile.menu.profileDetails",
    icon: UserCircle2,
  },
  {
    id: "LICENSE_INFO",
    labelKey: "instructorProfile.menu.licenseInfo",
    icon: CreditCard,
  },
  {
    id: "SECURITY",
    labelKey: "instructorProfile.menu.security",
    icon: Shield,
  },
  {
    id: "SUBSCRIPTION",
    labelKey: "instructorProfile.menu.subscription",
    icon: CreditCard,
  },
];

const parseJsonSafe = (value) => {
  try {
    return JSON.parse(value || "null");
  } catch {
    return null;
  }
};

const normalizeProfile = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: raw.id ?? raw.user_id ?? null,
    name: raw.name ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? "",
    licenseType: raw.license_type ?? raw.licenseType ?? "A1",
    roleId: raw.role_id ?? raw.roleId ?? null,
    createdAt: raw.created_at ?? raw.createdAt ?? "",
    avatar: raw.avatar ?? raw.profileImage ?? raw.profile_image ?? "",
  };
};

const resolveRoleLabel = (roleId) => {
  const value = Number(roleId);
  if (value === 1) return "ADMIN";
  if (value === 2) return "INSTRUCTOR";
  return "LEARNER";
};

export function InstructorProfilePage() {
  const { t } = useTranslation();
  const [activeMenu, setActiveMenu] = useState("PROFILE_DETAILS");
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState({ type: "", message: "" });
  const [passwordStatus, setPasswordStatus] = useState({
    type: "",
    message: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState({
    type: "",
    message: "",
  });
  const [avatarError, setAvatarError] = useState("");

  const [notificationSettings, setNotificationSettings] = useState([
    { id: "exam-alert", label: "Student Exam Alerts", enabled: true },
    { id: "class-reminder", label: "Class Reminders", enabled: true },
    {
      id: "weekly-report",
      label: "Weekly Performance Reports",
      enabled: false,
    },
  ]);

  const [profile, setProfile] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    licenseType: "A1",
    roleId: null,
    createdAt: "",
    avatar: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    avatar: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

  const syncLocalUser = (nextPartialUser) => {
    const existingUser = parseJsonSafe(localStorage.getItem("user")) || {};
    const mergedUser = {
      ...existingUser,
      ...nextPartialUser,
    };
    localStorage.setItem("user", JSON.stringify(mergedUser));
    window.dispatchEvent(new Event("user-updated"));
  };

  const handleAvatarFile = (file) => {
    if (!file) return;

    const maxSizeInMb = 2;
    const maxSizeBytes = maxSizeInMb * 1024 * 1024;

    if (!file.type?.startsWith("image/")) {
      setAvatarError(t("instructorProfile.messages.avatarImageOnly"));
      return;
    }

    if (file.size > maxSizeBytes) {
      setAvatarError(t("instructorProfile.messages.avatarTooLarge"));
      return;
    }

    setAvatarError("");

    const reader = new FileReader();
    reader.onload = () => {
      const avatarDataUrl = String(reader.result || "");
      if (!avatarDataUrl) {
        setAvatarError(t("instructorProfile.messages.avatarReadFailed"));
        return;
      }

      setProfile((prev) => ({ ...prev, avatar: avatarDataUrl }));
      setProfileForm((prev) => ({ ...prev, avatar: avatarDataUrl }));
      setProfileStatus({ type: "", message: "" });
    };

    reader.onerror = () => {
      setAvatarError(t("instructorProfile.messages.avatarReadFailed"));
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("token") ||
          parseJsonSafe(localStorage.getItem("userInfo"))?.accessToken;

        if (!token) {
          if (mounted) {
            setProfileStatus({
              type: "error",
              message: t("instructorProfile.messages.loginAgain"),
            });
          }
          return;
        }

        const response = await fetch(`${apiBaseUrl}/users/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(t("instructorProfile.messages.loadFailed"));
        }

        const payload = await response.json();
        const normalized = normalizeProfile(
          payload?.data?.user || payload?.data || payload,
        );

        if (!mounted || !normalized) return;

        setProfile((prev) => ({
          ...prev,
          ...normalized,
          avatar:
            normalized.avatar ||
            parseJsonSafe(localStorage.getItem("user"))?.avatar ||
            "",
        }));
        setProfileForm({
          name: normalized.name || "",
          phone: normalized.phone || "",
          avatar:
            normalized.avatar ||
            parseJsonSafe(localStorage.getItem("user"))?.avatar ||
            "",
        });
      } catch (error) {
        console.error("Failed to load instructor profile:", error);
        if (mounted) {
          setProfileStatus({
            type: "error",
            message:
              error?.message || t("instructorProfile.messages.loadFailed"),
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchProfile();

    return () => {
      mounted = false;
    };
  }, [apiBaseUrl, t]);

  const joinedLabel = useMemo(() => {
    if (!profile.createdAt) return t("instructorProfile.common.na");
    const date = new Date(profile.createdAt);
    if (Number.isNaN(date.getTime())) return t("instructorProfile.common.na");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [profile.createdAt, t]);

  const roleLabel = useMemo(
    () => resolveRoleLabel(profile.roleId),
    [profile.roleId],
  );

  const handleSaveProfile = async () => {
    const name = String(profileForm.name || "").trim();
    const phone = String(profileForm.phone || "").trim();

    if (name.length < 2) {
      setProfileStatus({
        type: "error",
        message: t("instructorProfile.messages.fullNameMin"),
      });
      return;
    }

    try {
      setIsSavingProfile(true);
      setProfileStatus({ type: "", message: "" });

      const token =
        localStorage.getItem("token") ||
        parseJsonSafe(localStorage.getItem("userInfo"))?.accessToken;

      if (!token) {
        throw new Error(t("instructorProfile.messages.loginAgain"));
      }

      const response = await fetch(`${apiBaseUrl}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          avatar: profileForm.avatar || profile.avatar || "",
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload?.errors?.[0]?.message ||
          payload?.message ||
          t("instructorProfile.messages.updateFailed");
        throw new Error(message);
      }

      const normalized =
        normalizeProfile(payload?.data?.user || payload?.data || payload) || {};

      const nextProfile = {
        ...profile,
        ...normalized,
        name: normalized.name || name,
        phone: normalized.phone ?? phone,
        avatar: normalized.avatar ?? profileForm.avatar ?? profile.avatar ?? "",
      };

      setProfile(nextProfile);
      setProfileForm({
        name: nextProfile.name || "",
        phone: nextProfile.phone || "",
        avatar: nextProfile.avatar || "",
      });
      syncLocalUser({
        name: nextProfile.name,
        phone: nextProfile.phone,
        avatar: nextProfile.avatar,
        profileImage: nextProfile.avatar,
      });
      setProfileStatus({
        type: "success",
        message: t("instructorProfile.messages.updateSuccess"),
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setProfileStatus({
        type: "error",
        message: error?.message || t("instructorProfile.messages.updateFailed"),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = String(passwordForm.currentPassword || "").trim();
    const newPassword = String(passwordForm.newPassword || "").trim();
    const confirmPassword = String(passwordForm.confirmPassword || "").trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({
        type: "error",
        message: t("instructorProfile.messages.passwordRequired"),
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({
        type: "error",
        message: t("instructorProfile.messages.passwordMin"),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: "error",
        message: t("instructorProfile.messages.passwordNotMatch"),
      });
      return;
    }

    try {
      setIsSavingPassword(true);
      setPasswordStatus({ type: "", message: "" });

      const token =
        localStorage.getItem("token") ||
        parseJsonSafe(localStorage.getItem("userInfo"))?.accessToken;

      if (!token) {
        throw new Error(t("instructorProfile.messages.loginAgain"));
      }

      const response = await fetch(`${apiBaseUrl}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload?.errors?.[0]?.message ||
          payload?.message ||
          t("instructorProfile.messages.passwordChangeFailed");
        throw new Error(message);
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStatus({
        type: "success",
        message: t("instructorProfile.messages.passwordChangeSuccess"),
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      setPasswordStatus({
        type: "error",
        message:
          error?.message ||
          t("instructorProfile.messages.passwordChangeFailed"),
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSaveSettings = () => {
    setSettingsStatus({
      type: "success",
      message: t("instructorProfile.messages.notificationsSaved"),
    });
  };

  const toggleNotification = (id) => {
    setSettingsStatus({ type: "", message: "" });
    setNotificationSettings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 p-4 text-white">
          <p className="text-xs font-semibold tracking-[0.18em]">
            {t("instructorProfile.sidebar.portal")}
          </p>
          <p className="mt-1 text-sm text-blue-100">
            {t("instructorProfile.sidebar.manageProfile")}
          </p>
        </div>

        <nav className="mt-4 space-y-1.5">
          {SIDE_MENUS.map((item) => {
            const Icon = item.icon;
            const active = activeMenu === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveMenu(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(item.labelKey)}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="space-y-5">
        <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    profile.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt={profile.name || t("instructorProfile.common.instructor")}
                  className="h-16 w-16 rounded-2xl border border-blue-100 object-cover"
                />
                <label className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm transition hover:bg-blue-500">
                  <Camera className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      handleAvatarFile(event.target.files?.[0])
                    }
                  />
                </label>
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                  {profile.name || t("instructorProfile.common.instructor")}
                </h1>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-blue-700">
                    {roleLabel}
                  </span>
                  <span className="ml-2">
                    {t("instructorProfile.common.joinDate")} {joinedLabel}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                {loading
                  ? t("instructorProfile.common.loading")
                  : t("instructorProfile.common.profileReady")}
              </span>
            </div>
          </div>
          {avatarError ? (
            <p className="mt-3 text-xs font-semibold text-red-500">
              {avatarError}
            </p>
          ) : null}
        </article>

        {activeMenu === "PROFILE_DETAILS" && (
          <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
            <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
              <p className="mb-4 text-[10px] font-bold tracking-[0.14em] text-slate-400">
                {t("instructorProfile.sections.professionalInfo")}
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                    FULL NAME
                  </span>
                  <input
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-blue-100 bg-blue-50/60 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                  />
                </label>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                    EMAIL ADDRESS
                  </span>
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 text-sm font-semibold text-slate-700">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="truncate">
                      {profile.email || t("instructorProfile.common.na")}
                    </span>
                  </div>
                </div>

                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                    PHONE NUMBER
                  </span>
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <input
                      value={profileForm.phone}
                      onChange={(event) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                      className="h-full w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                    />
                  </div>
                </label>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                    LICENSE TYPE
                  </span>
                  <div className="flex h-11 items-center rounded-xl border border-blue-100 bg-blue-50/60 px-3 text-sm font-semibold text-slate-700">
                    {profile.licenseType ||
                      t("instructorProfile.common.defaultLicense")}
                  </div>
                </div>
              </div>

              {profileStatus.message ? (
                <p
                  className={`mt-4 text-sm font-semibold ${
                    profileStatus.type === "success"
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {profileStatus.message}
                </p>
              ) : null}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile || loading}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingProfile
                    ? t("instructorProfile.actions.saving")
                    : t("instructorProfile.actions.saveProfile")}
                </button>
              </div>
            </article>

            <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
              <p className="mb-4 text-[10px] font-bold tracking-[0.14em] text-slate-400">
                {t("instructorProfile.sections.notificationSettings")}
              </p>

              <div className="space-y-3">
                {notificationSettings.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleNotification(item.id)}
                    className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2.5 text-left"
                  >
                    <span className="text-xs font-semibold text-slate-700">
                      {item.label}
                    </span>
                    <span
                      className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                        item.enabled ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`h-4 w-4 rounded-full bg-white transition ${
                          item.enabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </div>

              {settingsStatus.message ? (
                <p className="mt-4 text-xs font-semibold text-emerald-600">
                  {settingsStatus.message}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleSaveSettings}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                <Bell className="h-4 w-4" />
                {t("instructorProfile.actions.saveNotifications")}
              </button>
            </article>
          </div>
        )}

        {activeMenu === "LICENSE_INFO" && (
          <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <h2 className="text-lg font-black text-slate-900">
              {t("instructorProfile.sections.licenseInfo")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("instructorProfile.descriptions.licenseInfo")}
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                  LICENSE
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {profile.licenseType ||
                    t("instructorProfile.common.defaultLicense")}
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                  ROLE
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {roleLabel}
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                  MEMBER SINCE
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {joinedLabel}
                </p>
              </div>
            </div>
          </article>
        )}

        {activeMenu === "SECURITY" && (
          <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <h2 className="text-lg font-black text-slate-900">
              {t("instructorProfile.sections.accountSecurity")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("instructorProfile.descriptions.accountSecurity")}
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                  CURRENT PASSWORD
                </span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-blue-100 bg-blue-50/60 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                  NEW PASSWORD
                </span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-blue-100 bg-blue-50/60 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                  CONFIRM PASSWORD
                </span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-blue-100 bg-blue-50/60 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                />
              </label>
            </div>

            {passwordStatus.message ? (
              <p
                className={`mt-4 text-sm font-semibold ${
                  passwordStatus.type === "success"
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {passwordStatus.message}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isSavingPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <KeyRound className="h-4 w-4" />
                {isSavingPassword
                  ? t("instructorProfile.actions.updating")
                  : t("instructorProfile.actions.updatePassword")}
              </button>
            </div>
          </article>
        )}

        {activeMenu === "SUBSCRIPTION" && (
          <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <h2 className="text-lg font-black text-slate-900">
              {t("instructorProfile.sections.subscription")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("instructorProfile.descriptions.subscription")}
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-[10px] font-bold tracking-[0.12em] text-emerald-600">
                  CURRENT PLAN
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {t("instructorProfile.common.proInstructor")}
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                  BILLING EMAIL
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 wrap-anywhere">
                  {profile.email || t("instructorProfile.common.na")}
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                  STATUS
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-black text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("instructorProfile.common.active")}
                </p>
              </div>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
