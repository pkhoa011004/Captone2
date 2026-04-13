import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Check,
  ChevronRight,
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
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);

  const footerLinks = [
    "Privacy Policy",
    "Terms of Service",
    "Safety Center",
    "Contact",
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      const rawBody = await response.text();
      if (rawBody) {
        try {
          data = JSON.parse(rawBody);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        setError(
          data.message || "Login failed. Please check your credentials.",
        );
        setLoading(false);
        return;
      }

      // Login success - save token and user
      const existingUser = (() => {
        try {
          return JSON.parse(localStorage.getItem("user") || "null") || {};
        } catch {
          return {};
        }
      })();
      const cachedAvatar = localStorage.getItem("learnerAvatar") || "";
      const nextUser = {
        ...(data.data.user || {}),
        avatar:
          data.data.user?.avatar ||
          data.data.user?.profileImage ||
          existingUser?.avatar ||
          existingUser?.profileImage ||
          cachedAvatar,
        profileImage:
          data.data.user?.profileImage ||
          data.data.user?.avatar ||
          existingUser?.profileImage ||
          existingUser?.avatar ||
          cachedAvatar,
      };

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(nextUser));
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          accessToken: data.data.token,
          user: nextUser,
        }),
      );

      // Redirect based on user role
      const userRole = data.data.user?.role?.toLowerCase() || "user";
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "instructor") {
        navigate("/instructor");
      } else {
        navigate("/learner");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col font-sans">
      {/* --- HEADER --- */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 fixed top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between">
          <div className="text-3xl font-black text-blue-600 tracking-tight">
            DriveMaster
          </div>
          <nav className="flex items-center gap-10">
            <a
              href="#"
              className="text-base font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Safety Center
            </a>
            <a
              href="#"
              className="text-base font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Help
            </a>
          </nav>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex items-center justify-center pt-32 pb-16 px-4">
        <Card className="w-full max-w-137.5 border-none shadow-xl shadow-blue-900/5 rounded-3xl overflow-hidden bg-white relative">
          {/* Decorative Blur */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl" />

          <CardContent className="p-12 relative z-10">
            {/* Title Section */}
            <div className="space-y-3 mb-12 text-center sm:text-left">
              <h1 className="text-5xl font-black text-[#141b2b] tracking-tight">
                Welcome Back
              </h1>
              <p className="text-slate-500 font-semibold text-base leading-relaxed">
                Enter your credentials to access your driving portal.
              </p>
            </div>

            {/* Tabs Switcher */}
            <Tabs defaultValue="login" className="w-full mb-8">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  Log In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  onClick={() => navigate("/signup")}
                  className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-slate-600"
                >
                  Register
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Form Fields */}
            <form className="space-y-7" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      {error}
                    </p>
                    {error.includes("verify your email") && (
                      <button
                        onClick={() => navigate("/resend-verification")}
                        className="text-xs font-bold text-red-600 hover:underline mt-2"
                      >
                        Resend Verification Email →
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 tracking-[1.5px] uppercase ml-1">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-16 bg-[#dce2f7] border-none rounded-xl focus-visible:ring-blue-500 font-medium placeholder:text-slate-400 text-base"
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-xs font-bold text-slate-500 tracking-[1.5px] uppercase">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs font-bold text-blue-600 hover:underline tracking-tight uppercase"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-16 bg-[#dce2f7] border-none rounded-xl focus-visible:ring-blue-500 font-medium text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember device */}
              <div className="flex items-center space-x-3 py-3">
                <Checkbox
                  id="remember"
                  checked={rememberDevice}
                  onCheckedChange={setRememberDevice}
                  className="w-5 h-5 rounded border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor="remember"
                  className="text-base font-medium text-slate-600 cursor-pointer select-none"
                >
                  Remember this device for 30 days
                </label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                onClick={handleLogin}
                disabled={loading || !email || !password}
                className="w-full h-16 bg-linear-to-r from-blue-700 to-blue-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            {/* Alternate Roles */}
            <div className="mt-10 space-y-3 pt-8 border-t border-slate-100">
              <Button
                variant="outline"
                className="w-full h-14 justify-between px-5 rounded-2xl bg-[#f1f3ff] border-none hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                    <GraduationCap size={18} />
                  </div>
                  <span className="font-bold text-[#141b2b]">
                    Continue as Instructor
                  </span>
                </div>
                <ChevronRight
                  size={18}
                  className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                />
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 justify-between px-5 rounded-2xl bg-[#f1f3ff] border-none hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="font-bold text-[#141b2b]">
                    Continue as Administrator
                  </span>
                </div>
                <ChevronRight
                  size={18}
                  className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                />
              </Button>
            </div>

            {/* Bottom Link */}
            <div className="mt-12 text-center">
              <p className="text-slate-500 font-medium">
                New to DriveMaster?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Create an account
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full bg-slate-50 py-16 border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-2xl font-black text-blue-600 tracking-tight">
            DriveMaster
          </div>

          <nav className="flex flex-wrap justify-center gap-10">
            {footerLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-base font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>

          <p className="text-base font-medium text-slate-600 tracking-tight">
            © 2026 DriveMaster Education. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default LogInLearner;
