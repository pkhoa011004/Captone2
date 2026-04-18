import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Play, RefreshCcw } from "lucide-react";

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
import { TopHeaderLearner } from "@/components/TopHeaderLearner";
import { getStoredLicenseType } from "@/lib/license";

const CATEGORY_META = [
  {
    key: "REGULATIONS",
    label: "Khái niệm & quy tắc",
    description: "Luật, quy tắc và ưu tiên khi tham gia giao thông.",
  },
  {
    key: "TRAFFIC_CULTURE",
    label: "Văn hóa giao thông",
    description: "Cách ứng xử an toàn, đúng mực trên đường.",
  },
  {
    key: "DRIVING_TECHNIQUE",
    label: "Kỹ thuật lái xe",
    description: "Kỹ năng điều khiển xe, thao tác và xử lý tình huống.",
  },
  {
    key: "VEHICLE_REPAIR",
    label: "Cấu tạo & sửa chữa",
    description: "Kiến thức cơ bản về xe và bảo dưỡng.",
  },
  {
    key: "TRAFFIC_SIGNS",
    label: "Biển báo đường bộ",
    description: "Nhận diện biển báo, ký hiệu và chỉ dẫn.",
  },
  {
    key: "SITUATION_HANDLING",
    label: "Sa hình & tình huống",
    description: "Bài tập tình huống và cách xử lý thực tế.",
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
  A1: "",
  B1: "",
};

const CUSTOM_PRACTICE_TOPICS_STORAGE_KEY = "learnerCustomPracticeTopics";

const ALL_CATEGORY_KEYS = CATEGORY_META.map((item) => item.key);

export default function CustomExamBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const learnerLicenseType = getStoredLicenseType();
  const [licenseType, setLicenseType] = useState(learnerLicenseType);
  const [selectedCategories, setSelectedCategories] =
    useState(ALL_CATEGORY_KEYS);
  const [examName, setExamName] = useState(DEFAULT_TITLE.A1);
  const [weakTopicName, setWeakTopicName] = useState("");

  // Check if we're coming from weak topic practice
  useEffect(() => {
    if (location.state?.weakTopic && location.state?.topicName) {
      setWeakTopicName(location.state.topicName);
      if (location.state?.selectedCategories) {
        setSelectedCategories(location.state.selectedCategories);
      }
    }
  }, [location.state]);

  const preset = LICENSE_OPTIONS[licenseType];
  const questionCount = preset.defaultCount;

  useEffect(() => {
    // Don't reset if coming from weak topic practice
    if (!weakTopicName) {
      setSelectedCategories(ALL_CATEGORY_KEYS);
    }
    
    setExamName((prev) => {
      // Use weak topic name if available
      if (weakTopicName) {
        return `Luyện: ${weakTopicName}`;
      }
      
      if (
        prev &&
        prev.trim() &&
        prev !== DEFAULT_TITLE.A1 &&
        prev !== DEFAULT_TITLE.B1 &&
        !prev.startsWith("Luyện:")
      ) {
        return prev;
      }
      return DEFAULT_TITLE[licenseType];
    });
  }, [licenseType, weakTopicName]);

  const isExamNameValid = examName.trim().length > 0;

  const handleToggleCategory = (categoryKey) => {
    setSelectedCategories((prev) => {
      const exists = prev.includes(categoryKey);
      if (exists && prev.length === 1) return prev;
      if (exists) return prev.filter((item) => item !== categoryKey);
      return [...prev, categoryKey];
    });
  };

  const handleStartExam = () => {
    if (!isExamNameValid) return;

    const customTopicId = `custom-${Date.now()}`;
    const finalExamName = examName.trim();
    const customTopic = {
      id: customTopicId,
      title: finalExamName,
      examName: finalExamName,
      titleOverride: finalExamName,
      licenseType,
      examsSource: preset.source,
      questionCount,
      questions: questionCount,
      selectedCategories,
      fatalOnly: false,
      difficulty:
        questionCount >= 30 ? "HARD" : questionCount >= 20 ? "MEDIUM" : "EASY",
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
      fatalOnly: false,
      selectedCategories,
    };

    sessionStorage.setItem("quizExamConfig", JSON.stringify(examConfig));
    navigate("/learner/quiz", { state: { examConfig } });
  };

  const handleReset = () => {
    setLicenseType(learnerLicenseType);
    setSelectedCategories(ALL_CATEGORY_KEYS);
    setExamName(DEFAULT_TITLE[learnerLicenseType]);
  };

  const selectedCount = selectedCategories.length;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f9f9ff]">
      <TopHeaderLearner />
      <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 md:py-10 space-y-6">
        <section className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#141b2b]">
            Tự tạo đề luyện thi
          </h1>
          <p className="text-slate-500 text-base">
            Điền thông tin bên dưới để tạo đề luyện tập theo nhu cầu của bạn.
          </p>
        </section>

        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#141b2b]">
              Thông tin đề luyện tập
            </CardTitle>
            <CardDescription>
              Mẫu form tiêu chuẩn: chọn bằng lái, đặt tên đề và chọn nhóm nội
              dung.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-7">
            <section className="space-y-3">
              <label className="text-sm font-semibold text-[#141b2b]">
                Loại bằng lái
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(LICENSE_OPTIONS)
                  .filter(([key]) => key === learnerLicenseType)
                  .map(([key, option]) => {
                  const active = licenseType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLicenseType(key)}
                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                        active
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[#141b2b]">
                          {option.title}
                        </p>
                        {active && (
                          <CheckCircle2 size={16} className="text-blue-600" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {option.description}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Số câu cố định: <b>{option.defaultCount}</b>
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-2">
              <label className="text-sm font-semibold text-[#141b2b]">
                Tên bài làm
              </label>
              <Input
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="Ví dụ: Ôn tập biển báo tuần 1"
                className="h-11"
              />
              {!isExamNameValid && (
                <p className="text-xs text-red-600">
                  Vui lòng nhập tên đề trước khi tạo bài làm.
                </p>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#141b2b]">
                  Phần nội dung
                </label>
                <Badge variant="outline">
                  {selectedCount}/{CATEGORY_META.length}
                </Badge>
              </div>

              <div className="space-y-2 rounded-xl border border-slate-200 p-3">
                {CATEGORY_META.map((item) => {
                  const active = selectedCategories.includes(item.key);
                  return (
                    <label
                      key={item.key}
                      className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 cursor-pointer"
                    >
                      <Checkbox
                        checked={active}
                        onCheckedChange={() => handleToggleCategory(item.key)}
                      />
                      <span>
                        <span className="block text-sm font-medium text-[#141b2b]">
                          {item.label}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {item.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/learner/practice-tests")}
              >
                <ArrowLeft size={16} className="mr-2" />
                Về Practice Tests
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                <RefreshCcw size={16} className="mr-2" />
                Đặt lại
              </Button>
              <Button
                type="button"
                onClick={handleStartExam}
                disabled={selectedCount === 0 || !isExamNameValid}
                className="ml-auto"
              >
                <Play size={16} className="mr-2" />
                Tạo bài & bắt đầu làm
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
