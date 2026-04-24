import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
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
    "Chính sách bảo mật",
    "Điều khoản dịch vụ",
    "Trung tâm an toàn",
    "Liên hệ",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Bạn cần đồng ý với Điều khoản dịch vụ");
      return;
    }

    setLoading(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${apiBaseUrl}/users/register`, {
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
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Đăng ký thất bại. Vui lòng thử lại.");
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
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col font-sans">
      {/* --- HEADER --- */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 fixed top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between">
          <div className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight cursor-pointer">
            DriveMaster
          </div>
          <nav className="flex items-center gap-10 text-[15px] md:text-base font-semibold text-slate-700">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Trung tâm an toàn
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Hỗ trợ
            </a>
          </nav>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex items-center justify-center pt-32 pb-16 px-4">
        <Card className="w-full max-w-137.5 border-none shadow-2xl shadow-blue-900/5 rounded-[32px] overflow-hidden bg-white relative">
          {/* Decorative Background Element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl" />

          <CardContent className="p-12 relative z-10">
            {/* Header Text */}
            <div className="space-y-3 mb-12 text-center sm:text-left">
              <h1 className="text-5xl font-black text-[#141b2b] tracking-tight">
                Tạo tài khoản
              </h1>
              <p className="text-slate-600 font-medium text-[17px] leading-7">
                Tham gia DriveMaster và bắt đầu hành trình ngay hôm nay.
              </p>
            </div>

            {/* Auth Switcher */}
            <Tabs defaultValue="register" className="w-full mb-8">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  onClick={() => navigate("/login")}
                  className="rounded-lg font-semibold text-[15px] data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  Đăng nhập
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-lg font-semibold text-[15px] data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-sm"
                >
                  Đăng ký
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      Đăng ký thành công!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Đang chuyển đến trang xác minh email...
                    </p>
                  </div>
                </div>
              )}
              {/* Full Name */}
              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-slate-500 tracking-[1.5px] uppercase ml-1">
                  Họ và tên
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="John Doe"
                    className="h-16 pl-12 bg-[#f1f3ff] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 font-medium text-base"
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-slate-500 tracking-[1.5px] uppercase ml-1">
                  Địa chỉ email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="h-16 pl-12 bg-[#f1f3ff] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 font-medium text-base"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-bold text-slate-500 tracking-[1.5px] uppercase ml-1">
                    Mật khẩu
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-16 bg-[#f1f3ff] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 text-base"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-sm font-bold text-slate-500 tracking-[1.5px] uppercase ml-1">
                    Xác nhận
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-16 bg-[#f1f3ff] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 text-base"
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
              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-slate-500 tracking-[1.5px] uppercase ml-1">
                  Loại bằng lái
                </Label>
                <Select
                  defaultValue="A1"
                  onValueChange={(value) =>
                    setFormData({ ...formData, licenseType: value })
                  }
                >
                  <SelectTrigger className="h-16 bg-[#f1f3ff] border-none rounded-xl font-medium focus:ring-2 focus:ring-blue-500 text-base">
                    <SelectValue placeholder="Select license type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="A1">A1 - Xe máy</SelectItem>
                    <SelectItem value="B1">B1 - Ô tô số sàn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-3 pt-3">
                <Checkbox
                  id="terms"
                  className="w-5 h-5 rounded border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-1"
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeToTerms: checked })
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium text-slate-600 leading-snug"
                >
                  Tôi đồng ý với{" "}
                  <span className="text-blue-600 font-bold hover:underline cursor-pointer">
                    Điều khoản dịch vụ
                  </span>{" "}
                  va{" "}
                  <span className="text-blue-600 font-bold hover:underline cursor-pointer">
                    Chính sách bảo mật
                  </span>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || success}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-[17px] font-bold shadow-xl shadow-blue-200 transition-all active:scale-[0.98] mt-6"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  "Tạo tài khoản"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full bg-slate-50 py-16 border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] mt-auto">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
          <div className="text-2xl font-black text-blue-600 tracking-tight">
            DriveMaster
          </div>

          <nav className="flex flex-wrap justify-center gap-10">
            {footerLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-[15px] font-medium text-slate-700 hover:text-blue-600 transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>

          <p className="text-[15px] font-medium text-slate-600 tracking-tight">
            © 2026 DriveMaster Education. Đã đăng ký bản quyền.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default RegisterLearner;
