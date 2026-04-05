import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  BookOpen,
  CarFront,
  CheckCircle2,
  ChevronRight,
  FilePlus2,
  Layers3,
  Play,
  RefreshCcw,
  Route,
  ShieldCheck,
  Sparkles,
  TrafficCone,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const CATEGORY_META = [
  {
    key: "REGULATIONS",
    label: "Khái niệm & quy tắc",
    description: "Luật, quy tắc và ưu tiên khi tham gia giao thông.",
    icon: <ShieldCheck size={18} />,
  },
  {
    key: "TRAFFIC_CULTURE",
    label: "Văn hóa giao thông",
    description: "Cách ứng xử an toàn, đúng mực trên đường.",
    icon: <BadgeCheck size={18} />,
  },
  {
    key: "DRIVING_TECHNIQUE",
    label: "Kỹ thuật lái xe",
    description: "Kỹ năng điều khiển xe, thao tác và xử lý tình huống.",
    icon: <CarFront size={18} />,
  },
  {
    key: "VEHICLE_REPAIR",
    label: "Cấu tạo & sửa chữa",
    description: "Kiến thức cơ bản về xe và bảo dưỡng.",
    icon: <Wrench size={18} />,
  },
  {
    key: "TRAFFIC_SIGNS",
    label: "Biển báo đường bộ",
    description: "Nhận diện biển báo, ký hiệu và chỉ dẫn.",
    icon: <TrafficCone size={18} />,
  },
  {
    key: "SITUATION_HANDLING",
    label: "Sa hình & tình huống",
    description: "Bài tập tình huống và cách xử lý thực tế.",
    icon: <Route size={18} />,
  },
];

const LICENSE_OPTIONS = {
  A1: {
    label: "A1",
    title: "Đề mô tô 2 bánh",
    description: "Phù hợp luyện thi lý thuyết A1 với bộ 250 câu.",
    source: "exam_250",
    defaultCount: 25,
    maxCount: 25,
    passHint: "Ngưỡng đạt: 21 câu đúng.",
    accent: "bg-blue-50 text-blue-700 border-blue-200",
  },
  B1: {
    label: "B1",
    title: "Đề ô tô",
    description: "Phù hợp luyện thi B1 với bộ 600 câu.",
    source: "exam_600",
    defaultCount: 35,
    maxCount: 35,
    passHint: "Ngưỡng đạt: 27 câu đúng.",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

const DEFAULT_TITLE = {
  A1: "Đề tự tạo A1",
  B1: "Đề tự tạo B1",
};

const CUSTOM_PRACTICE_TOPICS_STORAGE_KEY = "learnerCustomPracticeTopics";

const ALL_CATEGORY_KEYS = CATEGORY_META.map((item) => item.key);

export default function CustomExamBuilder() {
  const navigate = useNavigate();
  const [licenseType, setLicenseType] = useState("A1");
  const [selectedCategories, setSelectedCategories] = useState(ALL_CATEGORY_KEYS);
  const [examName, setExamName] = useState(DEFAULT_TITLE.A1);
  const [fatalOnly, setFatalOnly] = useState(false);

  const preset = LICENSE_OPTIONS[licenseType];
  const questionCount = preset.defaultCount;

  useEffect(() => {
    setSelectedCategories(ALL_CATEGORY_KEYS);
    setExamName((prev) => {
      if (prev && prev.trim() && prev !== DEFAULT_TITLE.A1 && prev !== DEFAULT_TITLE.B1) {
        return prev;
      }
      return DEFAULT_TITLE[licenseType];
    });
  }, [licenseType]);

  const selectedCategoryDetails = useMemo(
    () =>
      CATEGORY_META.filter((item) => selectedCategories.includes(item.key)),
    [selectedCategories],
  );

  const examPreviewName = useMemo(() => {
    const title = examName.trim();
    return title || DEFAULT_TITLE[licenseType];
  }, [examName, licenseType]);

  const handleToggleCategory = (categoryKey) => {
    setSelectedCategories((prev) => {
      const exists = prev.includes(categoryKey);
      if (exists && prev.length === 1) return prev;
      if (exists) return prev.filter((item) => item !== categoryKey);
      return [...prev, categoryKey];
    });
  };

  const handleStartExam = () => {
    const customTopicId = `custom-${Date.now()}`;
    const finalExamName = examPreviewName;
    const customTopic = {
      id: customTopicId,
      titleOverride: finalExamName,
      licenseType,
      examsSource: preset.source,
      questionCount,
      questions: questionCount,
      selectedCategories,
      fatalOnly,
      difficulty: fatalOnly
        ? "HARD"
        : questionCount >= 30
          ? "HARD"
          : questionCount >= 20
            ? "MEDIUM"
            : "EASY",
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(CUSTOM_PRACTICE_TOPICS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const currentList = Array.isArray(parsed) ? parsed : [];
      const nextList = [customTopic, ...currentList].slice(0, 20);
      localStorage.setItem(
        CUSTOM_PRACTICE_TOPICS_STORAGE_KEY,
        JSON.stringify(nextList),
      );
    } catch {
      // Ignore storage errors and continue the flow.
    }

    const examConfig = {
      topicId: customTopicId,
      licenseType,
      questionCount,
      examName: finalExamName,
      generationMode: "random",
      examsSource: preset.source,
      fatalOnly,
      selectedCategories,
    };

    sessionStorage.setItem("quizExamConfig", JSON.stringify(examConfig));
    navigate("/learner/quiz", { state: { examConfig } });
  };

  const handleReset = () => {
    setLicenseType("A1");
    setSelectedCategories(ALL_CATEGORY_KEYS);
    setExamName(DEFAULT_TITLE.A1);
    setFatalOnly(false);
  };

  const selectedCount = selectedCategories.length;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f9f9ff]">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10 space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">
              <Sparkles size={14} />
              Tạo bài làm riêng cho learner
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#141b2b]">
              Tự tạo đề luyện thi
            </h1>
            <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
              Chọn bằng lái và nhóm nội dung để tạo ra một bài làm riêng
              theo đúng nhu cầu ôn luyện của bạn.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-xl bg-white shadow-sm"
              onClick={() => navigate("/learner/practice-tests")}
            >
              Về Practice Tests
            </Button>
            <Button
              variant="outline"
              className="rounded-xl bg-white shadow-sm"
              onClick={handleReset}
            >
              <RefreshCcw size={16} className="mr-2" />
              Đặt lại
            </Button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <Card className="rounded-[28px] border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-black text-[#141b2b]">
                Cấu hình bài làm
              </CardTitle>
              <CardDescription className="text-slate-500">
                Chọn nhanh từng phần, hệ thống sẽ tự sinh đề và đưa bạn vào làm
                bài ngay.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#141b2b]">
                  <Layers3 size={16} className="text-blue-600" />
                  1) Chọn bằng lái
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(LICENSE_OPTIONS).map(([key, option]) => {
                    const active = licenseType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setLicenseType(key)}
                        className={`rounded-2xl border p-5 text-left transition-all ${
                          active
                            ? `${option.accent} ring-1 ring-offset-2 ring-blue-200`
                            : "border-slate-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <Badge className="bg-[#e1e8fd] text-blue-700 border-none font-bold">
                            {option.label}
                          </Badge>
                          {active && (
                            <CheckCircle2 className="text-blue-600" size={18} />
                          )}
                        </div>
                        <h3 className="mt-3 text-xl font-black text-[#141b2b]">
                          {option.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">
                          {option.description}
                        </p>
                        <p className="mt-3 text-xs font-bold text-blue-700">
                          {option.passHint}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#141b2b]">
                  <FilePlus2 size={16} className="text-blue-600" />
                  2) Đặt tên bài làm
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Tên bài làm
                  </label>
                  <Input
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="Ví dụ: Bài luyện sa hình"
                    className="h-11 rounded-xl bg-white"
                  />
                  <p className="text-xs text-slate-500 font-medium">
                    Số câu được cố định theo loại bằng: <b>{questionCount} câu</b>.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#141b2b]">
                    <BookOpen size={16} className="text-blue-600" />
                    3) Chọn phần nội dung
                  </div>
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    {selectedCount}/{CATEGORY_META.length} phần
                  </Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {CATEGORY_META.map((item) => {
                    const active = selectedCategories.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleToggleCategory(item.key)}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          active
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                            : "border-slate-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white p-2 shadow-sm text-blue-600">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#141b2b] leading-tight">
                                {item.label}
                              </h4>
                              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <Checkbox checked={active} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#141b2b]">
                  <ShieldCheck size={16} className="text-blue-600" />
                  4) Tùy chọn đặc biệt
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-[#141b2b]">
                      Chỉ câu điểm liệt
                    </p>
                    <p className="text-sm text-slate-500">
                      Phù hợp khi bạn muốn luyện riêng nhóm câu dễ rớt.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFatalOnly((prev) => !prev)}
                    className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 transition-all ${
                      fatalOnly
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <span className="text-sm font-bold">
                      {fatalOnly ? "Bật" : "Tắt"}
                    </span>
                    <Checkbox checked={fatalOnly} />
                  </button>
                </div>
              </section>
            </CardContent>
          </Card>

          <div className="space-y-4 lg:sticky lg:top-24 self-start">
            <Card className="rounded-[28px] border-none shadow-sm bg-[#f1f3ff]">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-2 text-blue-700">
                  <Sparkles size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em]">
                    Xem trước bài làm
                  </h3>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Tên bài
                  </p>
                  <p className="text-2xl font-black text-[#141b2b] leading-tight">
                    {examPreviewName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Bằng lái
                    </p>
                    <p className="mt-1 text-lg font-black text-[#141b2b]">
                      {licenseType}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Phần nội dung
                    </p>
                    <Badge variant="outline" className="rounded-full">
                      {selectedCount} phần
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategoryDetails.map((item) => (
                      <Badge
                        key={item.key}
                        className="rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {item.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-blue-50 p-2 text-blue-600">
                      <Play size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-[#141b2b]">
                        Sẵn sàng làm bài
                      </p>
                      <p className="text-sm text-slate-500 leading-relaxed mt-1">
                        Đề sẽ được tạo theo cấu hình bên trái và lưu vào phiên làm
                        bài hiện tại.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-none shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <Layers3 size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em]">
                    Gợi ý nhanh
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-slate-600 font-medium leading-relaxed">
                  <p>• Chọn ít nhất 1 phần nội dung.</p>
                  <p>• Bật câu điểm liệt nếu muốn luyện phần rớt.</p>
                  <p>• Số câu cố định theo loại đề bạn chọn.</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              <Button
                onClick={handleStartExam}
                disabled={selectedCount === 0}
                className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100"
              >
                <Play size={16} className="mr-2" />
                Tạo bài & bắt đầu làm
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
