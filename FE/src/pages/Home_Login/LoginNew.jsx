import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export const LogInLearner = () => {
  const navigate = useNavigate();
  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

  const AVATAR_STORAGE_KEY = "learnerAvatar";

  const getAvatarStorageKeys = (userLike) => {
    const email = String(userLike?.email || "")
      .trim()
      .toLowerCase();
    const id = String(userLike?.id ?? userLike?.user_id ?? "")
      .trim()
      .toLowerCase();

    const keys = [];
    if (email) keys.push(`${AVATAR_STORAGE_KEY}:email:${email}`);
    if (id) {
      keys.push(`${AVATAR_STORAGE_KEY}:id:${id}`);
      // backward compatibility with old format
      keys.push(`${AVATAR_STORAGE_KEY}:${id}`);
    }
    return keys;
  };

  const readAvatarFromStorage = (userLike) => {
    const keys = getAvatarStorageKeys(userLike);
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) return value;
    }
    return "";
  };

  const writeAvatarToStorage = (userLike, avatar) => {
    if (!avatar) return;
    const keys = getAvatarStorageKeys(userLike);
    keys.forEach((key) => localStorage.setItem(key, avatar));
  };

  const parseJsonSafe = (value) => {
    try {
      return JSON.parse(value || "null");
    } catch {
      return null;
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);

  const footerLinks = [
    { label: "Chính sách bảo mật", path: "/privacy-policy" },
    { label: "Trung tâm an toàn", path: "/safety-protocols" },
    { label: "Hỗ trợ", path: "/support" },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !email.includes("@")) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.");
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 403) {
          setError(
            data.message || "Vui lòng xác minh email trước khi đăng nhập.",
          );
        } else if (response.status === 401) {
          setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
        } else {
          setError(data.message || "Đăng nhập thất bại.");
        }
        setLoading(false);
        return;
      }

      if (!data.data?.token || !data.data?.user) {
        setError("Dữ liệu phản hồi từ máy chủ không hợp lệ.");
        setLoading(false);
        return;
      }

      // Lưu thông tin đăng nhập
      const user = data.data.user;
      const existingUser = parseJsonSafe(localStorage.getItem("user")) || {};
      const existingId = existingUser?.id ?? existingUser?.user_id;
      const incomingId = user?.id ?? user?.user_id;
      const existingEmail = String(existingUser?.email || "")
        .trim()
        .toLowerCase();
      const incomingEmail = String(user?.email || "")
        .trim()
        .toLowerCase();
      const isSameUser =
        (existingId &&
          incomingId &&
          String(existingId) === String(incomingId)) ||
        (existingEmail && incomingEmail && existingEmail === incomingEmail);

      const cachedAvatar =
        readAvatarFromStorage(user) ||
        (isSameUser
          ? existingUser?.avatar || existingUser?.profileImage || ""
          : "");
      const mergedUser = {
        ...(isSameUser ? existingUser : {}),
        ...user,
        avatar: cachedAvatar || user?.avatar || user?.profileImage || "",
        profileImage: cachedAvatar || user?.profileImage || user?.avatar || "",
      };

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(mergedUser));
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ accessToken: data.data.token, user: mergedUser }),
      );
      if (mergedUser.avatar) {
        writeAvatarToStorage(mergedUser, mergedUser.avatar);
      }
      window.dispatchEvent(new Event("user-updated"));

      // Điều hướng dựa trên role
      const userRole = mergedUser.role?.toLowerCase() || "user";
      if (userRole === "admin") navigate("/admin");
      else if (userRole === "instructor") navigate("/instructor");
      else navigate("/learner");
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col font-sans">
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 fixed top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between">
          <div
            className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight cursor-pointer"
            onClick={() => navigate("/")}
          >
            DriveMaster
          </div>
          <nav className="flex items-center gap-10">
            <button
              type="button"
              onClick={() => navigate("/safety-protocols")}
              className="text-[15px] md:text-base font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Trung tâm an toàn
            </button>
            <button
              type="button"
              onClick={() => navigate("/support")}
              className="text-[15px] md:text-base font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Hỗ trợ
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center pt-32 pb-16 px-4">
        <Card className="w-full max-w-137.5 border-none shadow-xl shadow-blue-900/5 rounded-[32px] overflow-hidden bg-white relative">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl" />

          <CardContent className="p-12 relative z-10">
            <div className="space-y-3 mb-10 text-center sm:text-left">
              <h1 className="text-5xl font-black text-[#141b2b] tracking-tight">
                Chào mừng trở lại
              </h1>
              <p className="text-slate-600 font-medium text-[17px] leading-7">
                Nhập thông tin để truy cập vào tài khoản của bạn.
              </p>
            </div>

            <Tabs defaultValue="login" className="w-full mb-8">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="rounded-lg font-semibold text-[15px]"
                >
                  Đăng nhập
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  onClick={() => navigate("/signup")}
                  className="rounded-lg font-semibold text-[15px]"
                >
                  Đăng ký
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{error}</p>
                    {/(verify|xac minh|xác minh)/i.test(error) && (
                      <button
                        type="button"
                        onClick={() => navigate("/resend-verification")}
                        className="text-xs font-bold underline mt-1"
                      >
                        Gửi lại email xác minh →
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-500 tracking-[1.5px] uppercase ml-1">
                  Địa chỉ email
                </Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-16 bg-[#f0f2f9] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 font-medium text-base"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-bold text-slate-500 tracking-[1.5px] uppercase ml-1">
                    Mật khẩu
                  </Label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm font-bold text-blue-600 hover:underline uppercase"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-16 bg-[#f0f2f9] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 font-medium text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="remember"
                  checked={rememberDevice}
                  onCheckedChange={setRememberDevice}
                  className="w-5 h-5"
                />
                <label
                  htmlFor="remember"
                  className="text-[15px] font-medium text-slate-600 cursor-pointer"
                >
                  Ghi nhớ thiết bị này trong 30 ngày
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-16 bg-linear-to-r from-blue-700 to-blue-500 hover:opacity-90 rounded-2xl text-[17px] font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="w-full bg-white py-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-2xl font-black text-blue-600 tracking-tight">
            DriveMaster
          </div>
          <nav className="flex gap-8">
            {footerLinks.map((link) => (
              <button
                key={`${link.label}-${link.path}`}
                type="button"
                onClick={() => navigate(link.path)}
                className="text-[15px] font-medium text-slate-500 hover:text-blue-600"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <p className="text-[15px] font-medium text-slate-400">
            © 2026 DriveMaster Education. Đã đăng ký bản quyền.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LogInLearner;
