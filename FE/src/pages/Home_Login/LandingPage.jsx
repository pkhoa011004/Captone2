import {
  BarChart2Icon,
  BookOpenIcon,
  BotIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  HeadphonesIcon,
  MonitorIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { learnerDashboardApi } from "../../services/api/learnerDashboard";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", path: "/signup" },
  { label: "About", href: "#about" },
  { label: "Contact", path: "/support" },
];

const stats = [
  { value: "95", suffix: "%", label: "PASS RATE" },
  { value: "10K", suffix: "+", label: "STUDENTS" },
  { value: "600", suffix: "+", label: "QUESTIONS" },
];

const platformFeatures = [
  {
    icon: <BookOpenIcon className="w-6 h-6 text-blue-600" />,
    title: "Theory Learning",
    items: [
      "Interactive digital handbook",
      "Updated for 2026 regulations",
      "Quick-glance summary cards",
    ],
  },
  {
    icon: <BotIcon className="w-6 h-6 text-blue-600" />,
    title: "AI Assistant",
    items: [
      "Personalized study paths",
      "Smart error detection",
      "Instant doubt clarification",
    ],
  },
  {
    icon: <MonitorIcon className="w-6 h-6 text-blue-600" />,
    title: "3D Simulation",
    items: [
      "Lifelike hazard perception",
      "Multi-weather driving scenarios",
      "VR ready experiences",
    ],
  },
];

const steps = [
  {
    number: "1",
    title: "Create Account",
    description:
      "Sign up for free and choose your course to personalize your path.",
  },
  {
    number: "2",
    title: "Learn & Practice",
    description: "Complete quizzes and practice with lifelike 3D simulations.",
  },
  {
    number: "3",
    title: "Pass Your Test",
    description: "Take mock exams and confidently pass your driver's test.",
  },
];

const additionalFeatures = [
  {
    icon: <BarChart2Icon className="w-6 h-6 text-blue-600" />,
    title: "Track Progress",
    description: "View detailed reports on your learning journey.",
  },
  {
    icon: <CalendarIcon className="w-6 h-6 text-blue-600" />,
    title: "Flexible Schedule",
    description: "Learn at your own pace with flexible scheduling options.",
  },
  {
    icon: <CreditCardIcon className="w-6 h-6 text-blue-600" />,
    title: "Easy Payment",
    description: "Multiple secure and convenient payment methods available.",
  },
  {
    icon: <HeadphonesIcon className="w-6 h-6 text-blue-600" />,
    title: "24/7 Support",
    description: "Dedicated support team ready to help you anytime.",
  },
];

const footerProduct = [
  { label: "Theory Learning", path: "/login" },
  { label: "3D Simulation", path: "/login" },
  { label: "AI Assistant", path: "/login" },
];

const footerCompany = [
  { label: "About Us", href: "#about" },
  { label: "Contact", path: "/support" },
  { label: "Careers", path: "/support" },
];

const footerSupport = [
  { label: "Help Center", path: "/support" },
  { label: "Terms", path: "/safety-protocols" },
  { label: "Privacy", path: "/privacy-policy" },
];

export const LandingPage = () => {
  const [activeNav, setActiveNav] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Fetching learner dashboard...");
      const data = await learnerDashboardApi.getLearnerDashboard();
      console.log("✅ Dashboard data:", data);
      setDashboardData(data);
    } catch (error) {
      console.error("❌ Error fetching dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAction = (item) => {
    if (item?.path) {
      navigate(item.path);
      return;
    }

    if (item?.href?.startsWith("#")) {
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-white font-sans">
      {/* Navigation */}
      <header className="w-full flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
            <BookOpenIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-gray-900 text-xl tracking-tight">
            DriveMaster
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => {
                setActiveNav(link.label);
                handleLinkAction(link);
              }}
              className={`text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer ${
                activeNav === link.label ? "text-gray-900 font-semibold" : ""
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button
            className="h-auto bg-blue-600 hover:bg-blue-700 text-white text-[15px] px-5 py-2.5 rounded-md font-semibold"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log in
          </button>
        </div>
      </header>

      {/* Banner Image Section */}
      <section className="w-full py-4 flex justify-center">
        <div className="w-full px-8 max-w-6xl">
          <img
            src="https://cdn2.fptshop.com.vn/unsafe/800x0/Poster_ATGT_7_1572f845a0.jpg"
            alt="Banner"
            className="w-full h-89 object-cover rounded-lg shadow-md"
          />
        </div>
      </section>

      {/* Hero Section */}
      <section className="w-full px-8 py-16 flex flex-col md:flex-row items-center gap-10 max-w-6xl mx-auto">
        <div className="flex-1 flex flex-col gap-5">
          <div>
            <span className="text-xs font-semibold text-blue-600 tracking-widest uppercase flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
              Next-Gen Driver Education
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-[1.05] tracking-tight">
            Learn to Drive{" "}
            <span className="text-blue-600">Smarter &amp; Safer</span>
          </h1>
          <p className="text-gray-600 text-[17px] leading-8 max-w-lg">
            Master the road with AI-powered personalized lessons, immersive 3D
            simulations, and comprehensive theory guides designed for the modern
            learner.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Button
              className="h-auto bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-md text-[15px] font-semibold"
              onClick={() => navigate("/login")}
            >
              Log in →
            </Button>
            <Button
              variant="outline"
              className="h-auto border border-gray-300 text-gray-700 px-7 py-3.5 rounded-md text-[15px] font-semibold hover:bg-gray-50"
            >
              Register
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src="https://image.infographics.vn/media//1200/2022/11/19/664894d0-22b0-467f-9b58-204b9474bf1e.jpeg"
            alt="Car dashboard"
            className="w-full max-w-sm rounded-xl object-cover shadow-lg"
            style={{ maxHeight: "315px", objectFit: "cover" }}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row items-center justify-around gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <div className="flex items-end gap-0.5">
                <span className="text-6xl font-black text-blue-600 tracking-tight">
                  {stat.value}
                </span>
                <span className="text-4xl font-black text-blue-600 mb-1 tracking-tight">
                  {stat.suffix}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-500 tracking-[0.2em] uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Core Platform Section */}
      <section id="features" className="w-full py-16 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-10 mb-12">
            <div className="flex-1">
              <span className="text-sm font-semibold text-blue-600 tracking-[0.2em] uppercase">
                CORE PLATFORM
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 leading-tight tracking-tight">
                Everything you need to master the wheel.
              </h2>
            </div>
            <div className="flex-1 flex items-center">
              <p className="text-gray-600 text-[16px] leading-7">
                Built with advanced educational frameworks to ensure you
                don&#39;t just pass, you excel.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platformFeatures.map((feature) => (
              <Card
                key={feature.title}
                className="border border-gray-100 shadow-sm rounded-xl"
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {feature.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-[15px] leading-7 text-gray-700"
                      >
                        <CheckCircle2Icon className="w-4 h-4 text-blue-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="how-it-works" className="w-full py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 flex flex-col items-center">
          <span className="text-sm font-semibold text-blue-600 tracking-[0.2em] uppercase mb-2">
            THE JOURNEY
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 text-center leading-tight tracking-tight">
            Simple Steps to Success
          </h2>
          <p className="text-gray-600 text-[16px] mt-3 mb-12 text-center">
            Start learning in 3 simple steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-[15px] text-gray-700 leading-7 max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section id="about" className="w-full py-16 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {additionalFeatures.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-[15px] text-gray-700 leading-7">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#1a2236] text-white py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
                  <BookOpenIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-lg tracking-tight">
                  DriveMaster
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-7">
                Smart driver&#39;s education platform powered by AI. Master the
                road with confidence.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-base font-semibold text-white">Product</h4>
              <ul className="flex flex-col gap-2">
                {footerProduct.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => handleLinkAction(item)}
                      className="text-gray-300 text-sm hover:text-white transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-base font-semibold text-white">Company</h4>
              <ul className="flex flex-col gap-2">
                {footerCompany.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => handleLinkAction(item)}
                      className="text-gray-300 text-sm hover:text-white transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-base font-semibold text-white">Support</h4>
              <ul className="flex flex-col gap-2">
                {footerSupport.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => handleLinkAction(item)}
                      className="text-gray-300 text-sm hover:text-white transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Separator className="bg-gray-700 mb-6" />
          <p className="text-center text-gray-400 text-sm">
            © 2026 DriveMaster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
