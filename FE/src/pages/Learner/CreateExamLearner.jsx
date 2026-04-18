import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, FilePlus2, ShieldCheck } from "lucide-react";
import { instructorExamsApi } from "@/services/api/InstructorExams";

const EXAM_SOURCES = {
  exam_250: {
    label: "Ngân sách 250 câu",
    description: "Đề cố định 25 câu",
  },
  exam_600: {
    label: "Ngân sách 600 câu",
    description: "Đề cố định 35 câu",
  },
};

const CATEGORY_LABELS = {
  REGULATIONS: "Khái niệm & quy tắc",
  TRAFFIC_CULTURE: "Văn hóa giao thông",
  DRIVING_TECHNIQUE: "Kỹ thuật lái xe",
  VEHICLE_REPAIR: "Cấu tạo & sửa chữa",
  TRAFFIC_SIGNS: "Biển báo đường bộ",
  SITUATION_HANDLING: "Sa hình & tình huống",
};

const EXAM_PRESETS = {
  A1: {
    exam_250: {
      defaultCount: 25,
      description: "Đề mô tô 2 bánh (A1), tập trung lý thuyết và biển báo.",
      passHint: "Gợi ý: tối thiểu 21 câu đúng để đạt.",
      structure: {
        REGULATIONS: 8,
        TRAFFIC_CULTURE: 1,
        DRIVING_TECHNIQUE: 1,
        TRAFFIC_SIGNS: 9,
        SITUATION_HANDLING: 6,
      },
    },
  },
  B1: {
    exam_600: {
      defaultCount: 35,
      description:
        "Đề ô tô (B1), có nhiều tình huống sa hình và quy tắc nâng cao.",
      passHint: "Gợi ý: tối thiểu 27 câu đúng để đạt.",
      structure: {
        REGULATIONS: 10,
        TRAFFIC_CULTURE: 2,
        DRIVING_TECHNIQUE: 2,
        VEHICLE_REPAIR: 2,
        TRAFFIC_SIGNS: 12,
        SITUATION_HANDLING: 7,
      },
    },
  },
};

const SOURCE_TO_LICENSE = {
  exam_250: "A1",
  exam_600: "B1",
};

const getDefaultCategories = (licenseType, examsSource) => {
  const structure = EXAM_PRESETS[licenseType]?.[examsSource]?.structure || {};
  return Object.keys(structure);
};

export default function CreateExamLearner() {
  const navigate = useNavigate();
  const [examsSource, setExamsSource] = useState("exam_250");
  const licenseType = SOURCE_TO_LICENSE[examsSource] || "A1";
  const [customExamName, setCustomExamName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(
    getDefaultCategories("A1", "exam_250"),
  );

  const presetConfig = EXAM_PRESETS[licenseType]?.[examsSource];

  if (!presetConfig) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans pb-12">
        <main className="flex-1 w-full max-w-7xl mx-auto p-8">
          <p className="text-red-600 font-bold">
            Kết hợp loại bằng lái và nguồn đề không hợp lệ
          </p>
        </main>
      </div>
    );
  }

  const fixedQuestionCount = presetConfig.defaultCount;
  const suggestedExamName = useMemo(
    () =>
      `Đề ${licenseType} - ${fixedQuestionCount} câu (${EXAM_SOURCES[examsSource].label})`,
    [licenseType, fixedQuestionCount, examsSource],
  );
  const finalExamName = customExamName.trim() || suggestedExamName;

  const handleExamSourceChange = (nextSource) => {
    const mappedLicenseType = SOURCE_TO_LICENSE[nextSource] || "A1";
    setExamsSource(nextSource);
    setSelectedCategories(getDefaultCategories(mappedLicenseType, nextSource));
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(category);
      if (isSelected && prev.length === 1) {
        return prev;
      }

      if (isSelected) {
        return prev.filter((item) => item !== category);
      }

      return [...prev, category];
    });
  };

  const handleGenerateExam = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const createdExam = await instructorExamsApi.createExam({
        title: finalExamName,
        examName: finalExamName,
        licenseType,
        source: examsSource,
        questionCount: fixedQuestionCount,
        durationMinutes: fixedQuestionCount === 35 ? 22 : 19,
        passThreshold: fixedQuestionCount === 35 ? 27 : 21,
        status: "published",
      });

      navigate("/instructor/exercises", {
        state: {
          createdExam: createdExam || {
            title: finalExamName,
            examName: finalExamName,
            licenseType,
            source: examsSource,
            questionCount: fixedQuestionCount,
            durationMinutes: fixedQuestionCount === 35 ? 22 : 19,
            passThreshold: fixedQuestionCount === 35 ? 27 : 21,
            status: "Published",
            createdAt: new Date().toISOString(),
          },
          justCreated: true,
        },
        replace: true,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Không thể lưu đề vào DB.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const structureEntries = Object.entries(presetConfig.structure || {});

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans pb-12">
      <main className="flex-1 w-full max-w-7xl mx-auto p-8 space-y-8">
        <section className="space-y-2">
          <h1 className="text-4xl font-black text-[#141b2b] tracking-tight font-manrope">
            Tạo đề thi luyện tập
          </h1>
          <p className="text-slate-500 font-medium">
            Chọn loại đề và phần cấu trúc muốn đưa vào đề thi.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-8 border-none shadow-sm rounded-[28px]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#141b2b]">
                1) Chọn nguồn đề
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#141b2b]">Nguồn đề</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SOURCE_TO_LICENSE).map((source) => {
                    const active = examsSource === source;
                    return (
                      <Button
                        key={source}
                        type="button"
                        onClick={() => handleExamSourceChange(source)}
                        className={`rounded-xl border-none font-bold ${
                          active
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-[#f1f3ff] text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        {EXAM_SOURCES[source].label}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">
                  Hệ thống tự suy ra hạng đề: <b>{licenseType}</b>
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#141b2b]">
                  2) Nhập tên đề thi
                </h3>
                <Input
                  value={customExamName}
                  onChange={(event) => setCustomExamName(event.target.value)}
                  placeholder={suggestedExamName}
                  className="h-11"
                />
                <p className="text-xs text-slate-500">
                  Nếu bỏ trống, hệ thống sẽ dùng tên gợi ý tự động.
                </p>
              </div>

              {submitError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {submitError}
                </p>
              )}

              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#141b2b]">
                  3) Chọn phần cấu trúc cho đề thi
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Tổng số câu được cố định theo nguồn đề:{" "}
                  <b>{fixedQuestionCount} câu</b>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {structureEntries.map(([category, defaultCount]) => {
                    const active = selectedCategories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          active
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-300"
                            : "border-slate-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-[#141b2b]">
                            {CATEGORY_LABELS[category] || category}
                          </p>
                          {active && (
                            <CheckCircle2 className="text-blue-600 w-5 h-5" />
                          )}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Cấu trúc chuẩn: {defaultCount} câu
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <aside className="lg:col-span-4 space-y-4">
            <Card className="border-none shadow-sm bg-[#f1f3ff]">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <FilePlus2 size={18} />
                  <h3 className="text-sm font-bold">Đề sắp tạo</h3>
                </div>
                <p className="text-xl font-black text-[#141b2b]">{finalExamName}</p>
                <p className="text-sm text-slate-600 font-medium">
                  {presetConfig.description}
                </p>
                <p className="text-xs text-blue-700 font-bold">
                  {presetConfig.passHint}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <ShieldCheck size={18} />
                  <h3 className="text-sm font-bold text-[#141b2b]">
                    Cấu trúc đã chọn
                  </h3>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {selectedCategories
                    .map((category) => CATEGORY_LABELS[category] || category)
                    .join(" • ")}
                </p>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerateExam}
              disabled={selectedCategories.length === 0 || isSubmitting}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
            >
              {isSubmitting ? "Đang lưu..." : "Tạo đề & Quay về danh sách"}
            </Button>
          </aside>
        </section>
      </main>
    </div>
  );
}
