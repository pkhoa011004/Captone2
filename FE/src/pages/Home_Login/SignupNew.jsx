import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const RegisterLearner = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    licenseType: "A1",
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const footerLinks = [
    "Privacy Policy",
    "Terms of Service",
    "Safety Center",
    "Contact",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service");
      return;
    }

    setLoading(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(
        `${apiBaseUrl}/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            licenseType: formData.licenseType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Registration success
      setSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        licenseType: "A1",
        agreeToTerms: false,
      });

      // Redirect to verify email page after 2 seconds
      setTimeout(() => {
        navigate(`/verify-email?email=${formData.email}`);
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col font-sans">
      {/* --- HEADER --- */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 fixed top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="text-2xl font-black text-blue-600 tracking-tighter cursor-pointer">
            DriveMaster
          </div>
          <nav className="flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Safety Center
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Help
            </a>
          </nav>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4">
        <Card className="w-full max-w-[500px] border-none shadow-2xl shadow-blue-900/5 rounded-[32px] overflow-hidden bg-white relative">
          {/* Decorative Background Element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl" />

          <CardContent className="p-10 relative z-10">
            {/* Header Text */}
            <div className="space-y-2 mb-8 text-center sm:text-left">
              <h1 className="text-4xl font-black text-[#141b2b] tracking-tight">
                Create Account
              </h1>
              <p className="text-slate-500 font-medium">
                Join DriveMaster and start your journey today.
              </p>
            </div>

            {/* Auth Switcher */}
            <Tabs defaultValue="register" className="w-full mb-8">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  onClick={() => navigate("/login")}
                  className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  Log In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-sm"
                >
                  Register
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">Registration successful!</p>
                    <p className="text-xs text-green-600 mt-1">Redirecting to verify email...</p>
                  </div>
                </div>
              )}
              {/* Full Name */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase ml-1">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="John Doe"
                    className="h-12 pl-11 bg-[#f1f3ff] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 font-medium"
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase ml-1">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="h-12 pl-11 bg-[#f1f3ff] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 font-medium"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase ml-1">
                    Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-12 bg-[#f1f3ff] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase ml-1">
                    Confirm
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-12 bg-[#f1f3ff] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* License Type Select */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase ml-1">
                  License Type
                </Label>
                <Select defaultValue="A1" onValueChange={(value) => setFormData({ ...formData, licenseType: value })}>
                  <SelectTrigger className="h-12 bg-[#f1f3ff] border-none rounded-xl font-medium focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select license type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="A1">A1 - Lightest motorcycle</SelectItem>
                    <SelectItem value="B1">B1 - Manual Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center space-x-3 pt-2">
                <Checkbox
                  id="terms"
                  className="w-5 h-5 rounded border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeToTerms: checked })
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-xs font-medium text-slate-500 leading-snug"
                >
                  I agree to the{" "}
                  <span className="text-blue-600 font-bold hover:underline cursor-pointer">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-blue-600 font-bold hover:underline cursor-pointer">
                    Privacy Policy
                  </span>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || success}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-lg font-bold shadow-xl shadow-blue-200 transition-all active:scale-[0.98] mt-4"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Divider & Social/Role Switches */}
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
          </CardContent>
        </Card>
      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full bg-slate-50 py-12 border-t border-slate-100 mt-auto">
        <div className="max-w-screen-xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="text-xl font-bold text-slate-900 tracking-tight">
            DriveMaster
          </div>

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

          <p className="text-sm font-medium text-slate-400 font-mono">
            © 2026 DriveMaster Education.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default RegisterLearner;
