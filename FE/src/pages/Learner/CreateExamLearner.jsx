import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopHeaderLearner } from "@/components/TopHeaderLearner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, FilePlus2, ShieldCheck } from "lucide-react";

const EXAM_PRESETS = {
  A1: {
    defaultCount: 25,
    min: 10,
    max: 30,
    description: "Đề mô tô 2 bánh (A1), tập trung lý thuyết và biển báo.",
    passHint: "Gợi ý: tối thiểu 21 câu đúng để đạt.",
  },
  B1: {
    defaultCount: 30,
    min: 15,
    max: 35,
    description:
      "Đề ô tô (B1), có nhiều tình huống sa hình và quy tắc nâng cao.",
    passHint: "Gợi ý: tối thiểu 27 câu đúng để đạt.",
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function CreateExamLearner() {
  const navigate = useNavigate();
  const [licenseType, setLicenseType] = useState("A1");
  const [generationMode, setGenerationMode] = useState("structured");
  const [questionCountInput, setQuestionCountInput] = useState(
    String(EXAM_PRESETS.A1.defaultCount),
  );

  const preset = EXAM_PRESETS[licenseType];
  const normalizedQuestionCount =
    generationMode === "structured"
      ? preset.defaultCount
      : clamp(
          Number(questionCountInput) || preset.defaultCount,
          preset.min,
          preset.max,
        );

  const examName = useMemo(
    () => `Đề ${licenseType} - ${normalizedQuestionCount} câu`,
    [licenseType, normalizedQuestionCount],
  );

  const handleLicenseChange = (nextType) => {
    setLicenseType(nextType);
    const nextPreset = EXAM_PRESETS[nextType];
    setQuestionCountInput(String(nextPreset.defaultCount));
  };

  const handleGenerateExam = () => {
    const examConfig = {
      licenseType,
      questionCount: normalizedQuestionCount,
      examName: `Đề ${licenseType} - ${normalizedQuestionCount} câu`,
      generationMode,
      createdAt: new Date().toISOString(),
    };

    sessionStorage.setItem("quizExamConfig", JSON.stringify(examConfig));
    navigate(
      `/quizlearner?licenseType=${licenseType}&questionCount=${normalizedQuestionCount}&mode=${generationMode}`,
      { state: { examConfig } },
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans pb-12">
      <TopHeaderLearner />

      <main className="flex-1 w-full max-w-7xl mx-auto p-8 mt-16 space-y-8">
        <section className="space-y-2">
          <h1 className="text-4xl font-black text-[#141b2b] tracking-tight font-manrope">
            Tạo đề thi luyện tập
          </h1>
          <p className="text-slate-500 font-medium">
            Chọn phân loại bằng lái và số lượng câu hỏi để tạo đề mới.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-8 border-none shadow-sm rounded-[28px]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#141b2b]">
                1) Chọn loại đề
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(EXAM_PRESETS).map(([type, data]) => {
                  const active = licenseType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleLicenseChange(type)}
                      className={`text-left rounded-2xl border p-5 transition-all ${
                        active
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-300"
                          : "border-slate-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-[#e1e8fd] text-blue-700 border-none font-bold">
                          {type}
                        </Badge>
                        {active && (
                          <CheckCircle2 className="text-blue-600 w-5 h-5" />
                        )}
                      </div>

                      <h3 className="text-lg font-black text-[#141b2b]">
                        Đề {type}
                      </h3>
                      <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                        {data.description}
                      </p>
                      <p className="text-xs text-blue-700 font-bold mt-3">
                        {data.passHint}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#141b2b]">
                  2) Chế độ tạo đề
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => setGenerationMode("structured")}
                    className={`rounded-xl border-none font-bold ${
                      generationMode === "structured"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-[#f1f3ff] text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    Theo cấu trúc chuẩn
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setGenerationMode("random")}
                    className={`rounded-xl border-none font-bold ${
                      generationMode === "random"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-[#f1f3ff] text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    Ngẫu nhiên tự chọn
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#141b2b]">
                  3) Số lượng câu hỏi
                </h3>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <Input
                    type="number"
                    min={preset.min}
                    max={preset.max}
                    value={
                      generationMode === "structured"
                        ? String(preset.defaultCount)
                        : questionCountInput
                    }
                    onChange={(e) => setQuestionCountInput(e.target.value)}
                    onBlur={() =>
                      setQuestionCountInput(String(normalizedQuestionCount))
                    }
                    disabled={generationMode === "structured"}
                    className="h-11 max-w-55"
                  />
                  <p className="text-sm text-slate-500 font-medium">
                    {generationMode === "structured"
                      ? `Theo cấu trúc chuẩn ${licenseType}: ${preset.defaultCount} câu.`
                      : `Giới hạn đề ${licenseType}: từ ${preset.min} đến ${preset.max} câu.`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[preset.defaultCount, preset.min, preset.max].map((count) => (
                  <Button
                    key={count}
                    type="button"
                    variant="outline"
                    onClick={() => setQuestionCountInput(String(count))}
                    disabled={generationMode === "structured"}
                    className="rounded-xl bg-[#f1f3ff] border-none text-blue-700 font-bold hover:bg-blue-100"
                  >
                    {count} câu
                  </Button>
                ))}
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
                <p className="text-xl font-black text-[#141b2b]">{examName}</p>
                <p className="text-sm text-slate-600 font-medium">
                  Bao gồm câu hỏi được lấy ngẫu nhiên từ ngân hàng đề{" "}
                  {licenseType}.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <ShieldCheck size={18} />
                  <h3 className="text-sm font-bold text-[#141b2b]">Lưu ý</h3>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Sau khi tạo đề, hệ thống sẽ mở bài quiz ngay và chấm điểm theo
                  đúng quy tắc từng hạng bằng.
                </p>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerateExam}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
            >
              Tạo đề & Bắt đầu làm bài
            </Button>
          </aside>
        </section>
      </main>
    </div>
  );
}
