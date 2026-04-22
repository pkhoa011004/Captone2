import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, AlertCircle, Loader, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
  const [email, setEmail] = useState("");
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

    if (!email) {
      setError("Vui lòng nhập địa chỉ email");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.",
        );
        setLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      setEmail("");
      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col font-sans">
      {/* --- HEADER --- */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 fixed top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between">
          <div
            className="text-3xl font-black text-blue-600 tracking-tight cursor-pointer"
            onClick={() => navigate("/login")}
          >
            DriveMaster
          </div>
          <nav className="flex items-center gap-10">
            <a
              href="#"
              className="text-base font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Trung tâm an toàn
            </a>
            <a
              href="#"
              className="text-base font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Hỗ trợ
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
            {/* Back Button */}
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-blue-600 font-bold text-base mb-8 cursor-pointer hover:text-blue-700 transition-colors"
            >
              <ArrowLeft size={20} />
              Quay lại đăng nhập
            </button>

            {/* Title Section */}
            <div className="space-y-3 mb-12 text-center sm:text-left">
              <h1 className="text-5xl font-black text-[#141b2b] tracking-tight">
                Đặt lại mật khẩu
              </h1>
              <p className="text-slate-500 font-semibold text-base leading-relaxed">
                Nhập địa chỉ email và chúng tôi sẽ gửi hướng dẫn đặt lại mật
                khẩu cho bạn.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-7" onSubmit={handleSubmit}>
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
                      Gửi email thành công!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Vui lòng kiểm tra hộp thư để xem hướng dẫn đặt lại mật khẩu.
                    </p>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 tracking-[1.5px] uppercase ml-1">
                  Địa chỉ email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={success}
                    className="h-16 pl-12 bg-[#dce2f7] border-none rounded-xl focus-visible:ring-blue-500 font-medium text-base placeholder:text-slate-400 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || success || !email}
                className="w-full h-16 bg-linear-to-r from-blue-700 to-blue-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : success ? (
                  "Đã gửi email"
                ) : (
                  "Gửi liên kết đặt lại"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <p className="text-center text-slate-600 font-medium">
                Bạn đã nhớ mật khẩu?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Đăng nhập tại đây
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
            © 2026 DriveMaster Education. Đã đăng ký bản quyền.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPassword;
