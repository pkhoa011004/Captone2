import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import {
  User,
  UserCircle2,
  Shield,
  ShieldCheck,
  CreditCard,
  Bell,
  BookOpen,
  Lock,
  Trash2,
  Camera,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Dữ liệu điều hướng bên trái ---
const SIDEBAR_NAV = [
  {
    id: "account",
    labelKey: "accountSettings.navAccountDetails",
    hintKey: "accountSettings.navAccountHint",
    icon: UserCircle2,
    active: true,
  },
  {
    id: "security",
    labelKey: "accountSettings.navSecurity",
    hintKey: "accountSettings.navSecurityHint",
    icon: ShieldCheck,
    active: false,
  },
  {
    id: "subscription",
    labelKey: "accountSettings.navSubscription",
    hintKey: "accountSettings.navSubscriptionHint",
    icon: CreditCard,
    active: false,
  },
];

const AVATAR_STORAGE_KEY = "learnerAvatar";
const STUDY_PREFERENCES_STORAGE_KEY = "learnerStudyPreferences";
const DEFAULT_STUDY_PREFERENCES = {
  dailyStudyGoal: "1h",
  preferredTime: "morning",
  language: "en",
};

export const AccountSettings = () => {
  const { t, i18n } = useTranslation();

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
      name: raw.name ?? raw.full_name ?? raw.fullName ?? raw.username ?? "",
      email: raw.email ?? raw.email_address ?? "",
      phone: raw.phone ?? raw.phone_number ?? raw.phoneNumber ?? "",
      license_type: raw.license_type ?? raw.licenseType ?? raw.license ?? "",
      created_at:
        raw.created_at ?? raw.createdAt ?? raw.joined_at ?? raw.joinedAt ?? "",
      avatar: raw.avatar ?? raw.profileImage ?? raw.profile_image ?? "",
    };
  };

  const initialLocalProfile = normalizeProfile(
    parseJsonSafe(localStorage.getItem("user")) ||
      parseJsonSafe(localStorage.getItem("userInfo")),
  );

  const cachedAvatar =
    localStorage.getItem(AVATAR_STORAGE_KEY) ||
    initialLocalProfile?.avatar ||
    "";

  const [profile, setProfile] = useState({
    ...(initialLocalProfile || {}),
    avatar: cachedAvatar,
  });
  const [personalForm, setPersonalForm] = useState({
    name: initialLocalProfile?.name || "",
    email: initialLocalProfile?.email || "",
    phone: initialLocalProfile?.phone || "",
  });
  const [personalStatus, setPersonalStatus] = useState({
    type: "",
    message: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [studyPreferences, setStudyPreferences] = useState(() => {
    const saved = parseJsonSafe(
      localStorage.getItem(STUDY_PREFERENCES_STORAGE_KEY),
    );
    return {
      dailyStudyGoal:
        saved?.dailyStudyGoal || DEFAULT_STUDY_PREFERENCES.dailyStudyGoal,
      preferredTime:
        saved?.preferredTime || DEFAULT_STUDY_PREFERENCES.preferredTime,
      language: saved?.language || DEFAULT_STUDY_PREFERENCES.language,
    };
  });
  const [studyPreferencesStatus, setStudyPreferencesStatus] = useState({
    type: "",
    message: "",
  });
  const [avatarError, setAvatarError] = useState("");
  const [avatarStatus, setAvatarStatus] = useState({ type: "", message: "" });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

  const syncLocalUser = useCallback((nextPartialUser) => {
    const existingUser = parseJsonSafe(localStorage.getItem("user")) || {};
    const existingAvatar =
      existingUser?.avatar ||
      existingUser?.profileImage ||
      localStorage.getItem(AVATAR_STORAGE_KEY) ||
      "";
    const incomingAvatar =
      nextPartialUser?.avatar || nextPartialUser?.profileImage || "";
    const resolvedAvatar = incomingAvatar || existingAvatar;

    const nextUser = {
      ...existingUser,
      ...nextPartialUser,
      avatar: resolvedAvatar,
      profileImage: resolvedAvatar,
    };

    localStorage.setItem("user", JSON.stringify(nextUser));
    if (resolvedAvatar) {
      localStorage.setItem(AVATAR_STORAGE_KEY, resolvedAvatar);
    }
    window.dispatchEvent(new Event("user-updated"));
  }, []);

  const handleAvatarFile = useCallback(
    (file) => {
      if (!file) return;

      const maxSizeInMb = 2;
      const maxSizeBytes = maxSizeInMb * 1024 * 1024;

      if (!file.type?.startsWith("image/")) {
        setAvatarError("Please select an image file.");
        return;
      }

      if (file.size > maxSizeBytes) {
        setAvatarError(`Avatar must be smaller than ${maxSizeInMb}MB.`);
        return;
      }

      setAvatarError("");
      setAvatarStatus({ type: "", message: "" });
      setIsUploadingAvatar(true);

      const reader = new FileReader();
      reader.onload = () => {
        const avatarDataUrl = String(reader.result || "");
        if (!avatarDataUrl) {
          setAvatarError("Cannot read selected image.");
          setIsUploadingAvatar(false);
          return;
        }

        setProfile((prev) => ({
          ...(prev || {}),
          avatar: avatarDataUrl,
        }));

        syncLocalUser({
          avatar: avatarDataUrl,
          profileImage: avatarDataUrl,
        });

        setIsUploadingAvatar(false);
      };

      reader.onerror = () => {
        setAvatarError("Cannot read selected image.");
        setIsUploadingAvatar(false);
      };

      reader.readAsDataURL(file);
    },
    [syncLocalUser],
  );

  const onDropAvatar = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles?.length) {
        setAvatarError("Only .jpg, .jpeg, .png, .webp files are supported.");
        return;
      }

      handleAvatarFile(acceptedFiles?.[0]);
    },
    [handleAvatarFile],
  );

  const { getInputProps, open: openAvatarPicker } = useDropzone({
    onDrop: onDropAvatar,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
  });

  useEffect(() => {
    if (initialLocalProfile) {
      setPersonalForm((prev) => ({
        ...prev,
        name: initialLocalProfile.name || "",
        email: initialLocalProfile.email || "",
        phone: initialLocalProfile.phone || "",
      }));
    }

    const fetchProfile = async () => {
      try {
        const userInfo = parseJsonSafe(localStorage.getItem("userInfo"));
        const token = localStorage.getItem("token") || userInfo?.accessToken;
        if (!token) return;

        const response = await fetch(`${apiBaseUrl}/users/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const payload = await response.json();
        const userDataRaw = payload?.data?.user || payload?.data || payload;
        const userData = normalizeProfile(userDataRaw);
        const preservedAvatar =
          userData?.avatar ||
          localStorage.getItem(AVATAR_STORAGE_KEY) ||
          initialLocalProfile?.avatar ||
          "";
        const mergedUserData = {
          ...(userData || {}),
          avatar: preservedAvatar,
          profileImage: preservedAvatar,
        };

        setProfile(mergedUserData);
        setPersonalForm({
          name: userData?.name || "",
          email: userData?.email || "",
          phone: userData?.phone || "",
        });

        // Keep local user cache in sync for other screens using localStorage user.
        syncLocalUser(mergedUserData);
      } catch (err) {
        console.error("Failed to fetch learner profile:", err);
      }
    };

    void fetchProfile();
  }, [apiBaseUrl, initialLocalProfile?.email, syncLocalUser]);

  const joinedLabel = useMemo(() => {
    const rawDate = profile?.created_at;
    if (!rawDate) return "N/A";

    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return "N/A";

    return parsed.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [profile]);

  const handleSavePersonalInfo = async () => {
    const trimmedName = String(personalForm.name || "").trim();
    const trimmedPhone = String(personalForm.phone || "").trim();

    if (trimmedName.length < 2) {
      setPersonalStatus({
        type: "error",
        message: t("accountSettings.fullNameMin"),
      });
      return;
    }

    try {
      setIsSavingProfile(true);
      setPersonalStatus({ type: "", message: "" });

      const userInfo = parseJsonSafe(localStorage.getItem("userInfo"));
      const token = localStorage.getItem("token") || userInfo?.accessToken;
      if (!token) {
        setPersonalStatus({
          type: "error",
          message: t("accountSettings.loginAgain"),
        });
        return;
      }

      const response = await fetch(`${apiBaseUrl}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
        }),
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => null);
        const detailedMessage =
          errPayload?.errors?.[0]?.message ||
          errPayload?.details?.[0]?.message ||
          errPayload?.details?.[0] ||
          "";
        const message =
          detailedMessage ||
          errPayload?.message ||
          errPayload?.error ||
          t("accountSettings.failedUpdate");
        throw new Error(message);
      }

      const payload = await response.json();
      const userDataRaw = payload?.data?.user || payload?.data || payload;
      const userData = normalizeProfile(userDataRaw) || {};

      const mergedUserData = {
        ...profile,
        ...userData,
        name: userData.name || trimmedName,
        phone: userData.phone ?? trimmedPhone,
        email: userData.email || personalForm.email || "",
      };

      setProfile(mergedUserData);
      setPersonalForm((prev) => ({
        ...prev,
        name: mergedUserData.name || "",
        phone: mergedUserData.phone || "",
        email: mergedUserData.email || prev.email || "",
      }));
      syncLocalUser(mergedUserData);
      setPersonalStatus({
        type: "success",
        message: t("accountSettings.profileUpdated"),
      });
    } catch (err) {
      console.error("Failed to update learner profile:", err);
      setPersonalStatus({
        type: "error",
        message: err?.message || t("accountSettings.failedUpdate"),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveStudyPreferences = () => {
    const nextPreferences = {
      dailyStudyGoal: studyPreferences.dailyStudyGoal,
      preferredTime: studyPreferences.preferredTime,
      language: studyPreferences.language,
    };

    localStorage.setItem(
      STUDY_PREFERENCES_STORAGE_KEY,
      JSON.stringify(nextPreferences),
    );
    syncLocalUser({ studyPreferences: nextPreferences });
    i18n.changeLanguage(nextPreferences.language);
    setStudyPreferencesStatus({
      type: "success",
      message: t("studyPreferences.saved"),
    });
  };

  const handleSaveAvatar = () => {
    if (!learnerAvatar) {
      setAvatarStatus({
        type: "error",
        message: t("accountSettings.avatarMissing"),
      });
      return;
    }

    syncLocalUser({
      avatar: learnerAvatar,
      profileImage: learnerAvatar,
    });

    setAvatarStatus({
      type: "success",
      message: t("accountSettings.avatarSaved"),
    });
  };

  const learnerName = personalForm.name || profile?.name || "User";
  const learnerEmail = personalForm.email || profile?.email || "";
  const learnerPhone = personalForm.phone || profile?.phone || "";
  const learnerLicense = profile?.license_type || "N/A";
  const learnerAvatar = profile?.avatar || profile?.profileImage || "";

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans pb-20">
      <main className="flex-1 w-full max-w-360 mx-auto p-8 grid grid-cols-12 gap-8">
        {/* --- CỘT TRÁI: PROFILE & NAV (3/12) --- */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden text-center">
            <CardContent className="pt-8 pb-6 space-y-4">
              <div className="relative inline-block">
                <input {...getInputProps()} />
                <button
                  type="button"
                  onClick={openAvatarPicker}
                  disabled={isUploadingAvatar}
                  className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden cursor-pointer transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
                  title="Click to change avatar"
                >
                  {learnerAvatar ? (
                    <img
                      src={learnerAvatar}
                      alt="Learner avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={64} className="text-slate-300" />
                  )}
                </button>
                <Button
                  type="button"
                  size="icon"
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 absolute bottom-1 right-1 border-2 border-white shadow-md"
                  onClick={openAvatarPicker}
                  disabled={isUploadingAvatar}
                >
                  <Camera size={14} />
                </Button>
              </div>
              {avatarError ? (
                <p className="text-xs text-red-500 font-medium">
                  {avatarError}
                </p>
              ) : null}
              {avatarStatus.message ? (
                <p
                  className={`text-xs font-medium ${
                    avatarStatus.type === "success"
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {avatarStatus.message}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAvatar}
                disabled={isUploadingAvatar}
                className="h-9 rounded-xl bg-[#e1e8fd] border-none text-blue-600 font-bold hover:bg-blue-100"
              >
                {t("accountSettings.saveAvatar")}
              </Button>

              <div>
                <h3 className="text-xl font-bold text-[#141b2b]">
                  {learnerName}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {learnerEmail || t("accountSettings.noEmail")}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50 flex flex-col gap-3">
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    {t("accountSettings.licenseType")}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold">
                    {learnerLicense}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    {t("accountSettings.joined")}
                  </span>
                  <span className="text-xs font-bold text-[#141b2b]">
                    {joinedLabel}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <nav className="space-y-2 rounded-2xl border border-blue-100/60 bg-white/80 p-2 shadow-sm">
            {SIDEBAR_NAV.map((item) => (
              <button
                key={item.id}
                className={`group w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                  item.active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                    : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                      item.active
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                    }`}
                  >
                    <item.icon size={17} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-bold truncate">
                      {t(item.labelKey)}
                    </span>
                    <span
                      className={`block text-[11px] truncate ${
                        item.active ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {t(item.hintKey)}
                    </span>
                  </span>
                </div>

                <ChevronRight
                  size={16}
                  className={item.active ? "text-blue-100" : "text-slate-300"}
                />
              </button>
            ))}
          </nav>
        </aside>

        {/* --- CỘT PHẢI: SETTINGS CONTENT (9/12) --- */}
        <section className="col-span-12 lg:col-span-9 space-y-8">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#141b2b] tracking-tight font-manrope">
              {t("accountSettings.title")}
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              {t("accountSettings.subtitle")}
            </p>
          </div>

          {/* 1. Personal Information */}
          <Card className="border-none shadow-sm bg-[#f1f3ff]">
            <CardHeader className="flex flex-row items-center gap-3 pb-6">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <User size={20} />
              </div>
              <CardTitle className="text-lg font-bold">
                {t("accountSettings.personalInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    {t("accountSettings.fullName")}
                  </Label>
                  <Input
                    value={learnerName}
                    onChange={(e) =>
                      setPersonalForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="h-12 bg-[#dce2f7] border-none focus-visible:ring-blue-600 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    {t("accountSettings.emailAddress")}
                  </Label>
                  <Input
                    value={learnerEmail}
                    readOnly
                    className="h-12 bg-[#dce2f7] border-none focus-visible:ring-blue-600 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    {t("accountSettings.phoneNumber")}
                  </Label>
                  <Input
                    value={learnerPhone}
                    onChange={(e) =>
                      setPersonalForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="h-12 bg-[#dce2f7] border-none focus-visible:ring-blue-600 font-medium"
                  />
                </div>
              </div>
              {personalStatus.message ? (
                <p
                  className={`text-sm font-semibold ${
                    personalStatus.type === "success"
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {personalStatus.message}
                </p>
              ) : null}

              <Button
                type="button"
                onClick={handleSavePersonalInfo}
                disabled={isSavingProfile}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold px-8 shadow-lg shadow-blue-200 disabled:opacity-70"
              >
                {t("accountSettings.saveChanges")}
              </Button>
            </CardContent>
          </Card>

          {/* 2 & 3. Preferences & Notifications Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Study Preferences */}
            <Card className="lg:col-span-7 border-none shadow-sm bg-[#f1f3ff]">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <BookOpen size={20} />
                </div>
                <CardTitle className="text-lg font-bold">
                  {t("studyPreferences.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    {t("studyPreferences.dailyGoal")}
                  </Label>
                  <Select
                    value={studyPreferences.dailyStudyGoal}
                    onValueChange={(value) => {
                      setStudyPreferences((prev) => ({
                        ...prev,
                        dailyStudyGoal: value,
                      }));
                      setStudyPreferencesStatus({ type: "", message: "" });
                    }}
                  >
                    <SelectTrigger className="h-12 bg-[#dce2f7] border-none font-medium">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30m">
                        {t("studyPreferences.goal30m")}
                      </SelectItem>
                      <SelectItem value="1h">
                        {t("studyPreferences.goal1h")}
                      </SelectItem>
                      <SelectItem value="2h">
                        {t("studyPreferences.goal2h")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                      {t("studyPreferences.preferredTime")}
                    </Label>
                    <Select
                      value={studyPreferences.preferredTime}
                      onValueChange={(value) => {
                        setStudyPreferences((prev) => ({
                          ...prev,
                          preferredTime: value,
                        }));
                        setStudyPreferencesStatus({ type: "", message: "" });
                      }}
                    >
                      <SelectTrigger className="h-12 bg-[#dce2f7] border-none font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">
                          {t("studyPreferences.morning")}
                        </SelectItem>
                        <SelectItem value="afternoon">
                          {t("studyPreferences.afternoon")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                      {t("studyPreferences.language")}
                    </Label>
                    <Select
                      value={studyPreferences.language}
                      onValueChange={(value) => {
                        setStudyPreferences((prev) => ({
                          ...prev,
                          language: value,
                        }));
                        setStudyPreferencesStatus({ type: "", message: "" });
                      }}
                    >
                      <SelectTrigger className="h-12 bg-[#dce2f7] border-none font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">
                          {t("studyPreferences.englishUS")}
                        </SelectItem>
                        <SelectItem value="vi">
                          {t("studyPreferences.vietnamese")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {studyPreferencesStatus.message ? (
                  <p
                    className={`text-sm font-semibold ${
                      studyPreferencesStatus.type === "success"
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {studyPreferencesStatus.message}
                  </p>
                ) : null}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveStudyPreferences}
                  className="w-full rounded-xl bg-[#e1e8fd] border-none text-blue-600 font-bold hover:bg-blue-100"
                >
                  {t("studyPreferences.save")}
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="lg:col-span-5 border-none shadow-sm bg-[#e1e8fd]">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-2 bg-white/50 rounded-lg text-blue-700">
                  <Bell size={20} />
                </div>
                <CardTitle className="text-lg font-bold">
                  {t("accountSettings.notifications")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: "email",
                    label: t("accountSettings.emailReports"),
                    desc: t("accountSettings.emailReportsDesc"),
                  },
                  {
                    id: "sms",
                    label: t("accountSettings.smsReminders"),
                    desc: t("accountSettings.smsRemindersDesc"),
                  },
                  {
                    id: "exam",
                    label: t("accountSettings.examReminders"),
                    desc: t("accountSettings.examRemindersDesc"),
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold text-[#141b2b]">
                        {item.label}
                      </Label>
                      <p className="text-[10px] text-slate-400 font-medium tracking-tight uppercase">
                        {item.desc}
                      </p>
                    </div>
                    <Switch defaultChecked={item.id !== "sms"} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 4. Account Security */}
          <Card className="border-none shadow-sm bg-[#f1f3ff]">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Lock size={20} />
              </div>
              <CardTitle className="text-lg font-bold">
                {t("accountSettings.accountSecurity")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    {t("accountSettings.currentPassword")}
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-12 bg-[#dce2f7] border-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    {t("accountSettings.newPassword")}
                  </Label>
                  <Input
                    type="password"
                    placeholder={t("accountSettings.enterNewPassword")}
                    className="h-12 bg-[#dce2f7] border-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    {t("accountSettings.confirmNewPassword")}
                  </Label>
                  <Input
                    type="password"
                    placeholder={t(
                      "accountSettings.confirmPasswordPlaceholder",
                    )}
                    className="h-12 bg-[#dce2f7] border-none font-medium"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-xl bg-[#dce2f7] border-slate-200 text-slate-600 font-bold px-8 hover:bg-slate-200 transition-all"
              >
                {t("accountSettings.updatePassword")}
              </Button>
            </CardContent>
          </Card>

          {/* 5. Danger Zone */}
          <Card className="border border-red-100 shadow-sm bg-[#ffdad61a] overflow-hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600 rounded-full text-white">
                  <Trash2 size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-red-600">
                    {t("accountSettings.dangerZone")}
                  </h4>
                  <p className="text-sm text-slate-500 font-medium">
                    {t("accountSettings.dangerDesc")}
                  </p>
                </div>
              </div>
              <Button className="rounded-xl bg-red-600 hover:bg-red-700 font-bold px-8 h-12 shadow-lg shadow-red-100 transition-all">
                {t("accountSettings.deleteAccount")}
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};
export default AccountSettings;
