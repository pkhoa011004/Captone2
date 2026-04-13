import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
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
    label: "Account Details",
    hint: "Profile information & avatar",
    icon: UserCircle2,
    active: true,
  },
  {
    id: "security",
    label: "Security & Privacy",
    hint: "Password and protection settings",
    icon: ShieldCheck,
    active: false,
  },
  {
    id: "subscription",
    label: "Subscription",
    hint: "Plan and billing overview",
    icon: CreditCard,
    active: false,
  },
];

const AVATAR_STORAGE_KEY = "learnerAvatar";

export const AccountSettings = () => {
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
  const [email, setEmail] = useState("");
  const [avatarError, setAvatarError] = useState("");
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
    if (initialLocalProfile?.email) {
      setEmail(initialLocalProfile.email);
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
        setEmail(userData?.email || "");

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

  const learnerName = profile?.name || "User";
  const learnerEmail = profile?.email || "";
  const learnerPhone = profile?.phone || "";
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

              <div>
                <h3 className="text-xl font-bold text-[#141b2b]">
                  {learnerName}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {learnerEmail || "No email"}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50 flex flex-col gap-3">
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    License Type
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold">
                    {learnerLicense}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    Joined
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
                      {item.label}
                    </span>
                    <span
                      className={`block text-[11px] truncate ${
                        item.active ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {item.hint}
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
              Account Settings
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Manage your personal information and learning journey preferences.
            </p>
          </div>

          {/* 1. Personal Information */}
          <Card className="border-none shadow-sm bg-[#f1f3ff]">
            <CardHeader className="flex flex-row items-center gap-3 pb-6">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <User size={20} />
              </div>
              <CardTitle className="text-lg font-bold">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    Full Name
                  </Label>
                  <Input
                    value={learnerName}
                    readOnly
                    className="h-12 bg-[#dce2f7] border-none focus-visible:ring-blue-600 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    Email Address
                  </Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-[#dce2f7] border-none focus-visible:ring-blue-600 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    Phone Number
                  </Label>
                  <Input
                    value={learnerPhone}
                    readOnly
                    className="h-12 bg-[#dce2f7] border-none focus-visible:ring-blue-600 font-medium"
                  />
                </div>
              </div>
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold px-8 shadow-lg shadow-blue-200">
                Save Changes
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
                  Study Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    Daily Study Goal
                  </Label>
                  <Select defaultValue="1h">
                    <SelectTrigger className="h-12 bg-[#dce2f7] border-none font-medium">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30m">30 Minutes (Beginner)</SelectItem>
                      <SelectItem value="1h">1 Hour (Consistent)</SelectItem>
                      <SelectItem value="2h">2 Hours (Intense)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                      Preferred Time
                    </Label>
                    <Select defaultValue="morning">
                      <SelectTrigger className="h-12 bg-[#dce2f7] border-none font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">
                          Morning (8AM - 11AM)
                        </SelectItem>
                        <SelectItem value="afternoon">
                          Afternoon (1PM - 4PM)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                      Language
                    </Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="h-12 bg-[#dce2f7] border-none font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="vi">Vietnamese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl bg-[#e1e8fd] border-none text-blue-600 font-bold hover:bg-blue-100"
                >
                  Save Preferences
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
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: "email",
                    label: "Email Reports",
                    desc: "Weekly progress summary",
                  },
                  {
                    id: "sms",
                    label: "SMS Reminders",
                    desc: "Alerts for upcoming bookings",
                  },
                  {
                    id: "exam",
                    label: "Exam Reminders",
                    desc: "24h before test time",
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
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    Current Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-12 bg-[#dce2f7] border-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    New Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    className="h-12 bg-[#dce2f7] border-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase ml-1">
                    Confirm New Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    className="h-12 bg-[#dce2f7] border-none font-medium"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-xl bg-[#dce2f7] border-slate-200 text-slate-600 font-bold px-8 hover:bg-slate-200 transition-all"
              >
                Update Password
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
                    Danger Zone
                  </h4>
                  <p className="text-sm text-slate-500 font-medium">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                </div>
              </div>
              <Button className="rounded-xl bg-red-600 hover:bg-red-700 font-bold px-8 h-12 shadow-lg shadow-red-100 transition-all">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};
export default AccountSettings;
