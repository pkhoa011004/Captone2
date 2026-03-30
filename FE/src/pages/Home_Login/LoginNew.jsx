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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Login failed. Please check your credentials."
        );
        setLoading(false);
        return;
      }

      // Login success - save token and redirect
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      
      // Redirect to learner dashboard
      navigate("/learner");
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col font-sans">
      {/* --- HEADER --- */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 fixed top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="text-2xl font-black text-blue-600 tracking-tighter">
            DriveMaster
          </div>
          <nav className="flex items-center gap-8">
            <a
              href="#"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Safety Center
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Help
            </a>
          </nav>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex items-center justify-center pt-20 pb-12 px-4">
        <Card className="w-full max-w-[480px] border-none shadow-xl shadow-blue-900/5 rounded-3xl overflow-hidden bg-white relative">
          {/* Decorative Blur */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl" />

          <CardContent className="p-10 relative z-10">
            {/* Title Section */}
            <div className="space-y-2 mb-10 text-center sm:text-left">
              <h1 className="text-4xl font-black text-[#141b2b] tracking-tight">
                Welcome Back
              </h1>
              <p className="text-slate-500 font-medium leading-relaxed">
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
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">{error}</p>
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
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase ml-1">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 bg-[#dce2f7] border-none rounded-xl focus-visible:ring-blue-500 font-medium placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase">
                    Password
                  </Label>
                  <button className="text-[10px] font-bold text-blue-600 hover:underline tracking-tight uppercase">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 bg-[#dce2f7] border-none rounded-xl focus-visible:ring-blue-500 font-medium"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember device */}
              <div className="flex items-center space-x-3 py-1">
                <Checkbox
                  id="remember"
                  checked={rememberDevice}
                  onCheckedChange={setRememberDevice}
                  className="w-5 h-5 rounded border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium text-slate-500 cursor-pointer select-none"
                >
                  Remember this device for 30 days
                </label>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                disabled={loading || !email || !password}
                className="w-full h-14 bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
            </div>

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
      <footer className="w-full bg-slate-50 py-12 border-t border-slate-100">
        <div className="max-w-screen-xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-xl font-bold text-slate-900">DriveMaster</div>

          <nav className="flex flex-wrap justify-center gap-8">
            {footerLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>

          <p className="text-sm font-medium text-slate-400">
            © 2026 DriveMaster Education. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default LogInLearner;
