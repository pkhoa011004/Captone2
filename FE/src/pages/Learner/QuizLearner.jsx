import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TopHeaderLearner } from "@/components/TopHeaderLearner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, RotateCcw, Trophy } from "lucide-react";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { useQuizGrading } from "@/hooks/useQuizGrading";

const DEFAULT_EXAM_CONFIG = {
  licenseType: "A1",
  questionCount: 25,
  examName: "Đề A1 - 25 câu",
  generationMode: "structured",
};

const normalizeExamConfig = (config = {}) => {
  const rawLicense = String(config?.licenseType || "A1")
    .trim()
    .toUpperCase();
  const licenseType = rawLicense === "B1" ? "B1" : "A1";

  const defaultCount = licenseType === "B1" ? 30 : 25;
  const minCount = licenseType === "B1" ? 15 : 10;
  const maxCount = licenseType === "B1" ? 35 : 30;

  const parsedCount = Number(config?.questionCount);
  const questionCount = Number.isFinite(parsedCount)
    ? Math.min(maxCount, Math.max(minCount, parsedCount))
    : defaultCount;

  const generationMode =
    String(config?.generationMode || "structured").toLowerCase() === "random"
      ? "random"
      : "structured";

  return {
    licenseType,
    questionCount:
      generationMode === "structured" ? defaultCount : questionCount,
    examName:
      typeof config?.examName === "string" && config.examName.trim()
        ? config.examName.trim()
        : `Đề ${licenseType} - ${questionCount} câu`,
    generationMode,
  };
};

const parseExamConfigFromSearch = (search = "") => {
  const params = new URLSearchParams(search);
  const licenseType = params.get("licenseType");
  const questionCount = params.get("questionCount");
  const generationMode = params.get("mode");

  if (!licenseType && !questionCount && !generationMode) {
    return null;
  }

  return normalizeExamConfig({
    licenseType,
    questionCount,
    generationMode,
  });
};

const QuizShell = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans pb-12">
    <TopHeaderLearner />
    <main className="flex-1 w-full max-w-5xl mx-auto p-8 mt-16">
      {children}
    </main>
  </div>
);

export default function QuizLearner() {
  const location = useLocation();
  const navigate = useNavigate();

  const [examConfig, setExamConfig] = useState(() => {
    try {
      const cached = JSON.parse(
        sessionStorage.getItem("quizExamConfig") || "null",
      );
      return normalizeExamConfig(cached || DEFAULT_EXAM_CONFIG);
    } catch {
      return DEFAULT_EXAM_CONFIG;
    }
  });

  useEffect(() => {
    const configFromQuery = parseExamConfigFromSearch(location.search);
    const configFromState = location.state?.examConfig
      ? normalizeExamConfig(location.state.examConfig)
      : null;

    const nextConfig =
      configFromQuery ||
      configFromState ||
      normalizeExamConfig(DEFAULT_EXAM_CONFIG);

    setExamConfig((prev) => {
      if (
        prev.licenseType === nextConfig.licenseType &&
        prev.questionCount === nextConfig.questionCount &&
        prev.examName === nextConfig.examName &&
        prev.generationMode === nextConfig.generationMode
      ) {
        return prev;
      }

      return nextConfig;
    });

    sessionStorage.setItem("quizExamConfig", JSON.stringify(nextConfig));
  }, [location.search, location.state]);

  const {
    questions,
    isLoading: isLoadingQuestions,
    error: loadError,
    refetch,
  } = useQuizQuestions({
    licenseType: examConfig.licenseType,
    questionCount: examConfig.questionCount,
    generationMode: examConfig.generationMode,
  });

  const {
    gradingResult,
    isGrading,
    error: gradingError,
    submitExam,
    resetGrading,
  } = useQuizGrading({ licenseType: examConfig.licenseType });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answersByQuestion, setAnswersByQuestion] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const question = questions[currentQuestion] || null;
  const totalQuestions = questions.length;

  useEffect(() => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setAnswersByQuestion({});
    setIsFinished(false);
    resetGrading();
  }, [questions, resetGrading]);

  const answeredCount = useMemo(
    () => Object.keys(answersByQuestion).length,
    [answersByQuestion],
  );

  const progress = isFinished
    ? 100
    : totalQuestions > 0
      ? ((currentQuestion + 1) / totalQuestions) * 100
      : 0;

  const handleSubmit = () => {
    if (!question || selectedOption === null) return;
    setAnswersByQuestion((prev) => ({
      ...prev,
      [question.id]: selectedOption,
    }));
    setIsSubmitted(true);
  };

  const handleFinish = async () => {
    const answers = questions.map((item) => ({
      question_id: item.id,
      selected_answer: Number(answersByQuestion[item.id]),
    }));
    const questionIds = questions.map((item) => item.id);

    await submitExam({ answers, questionIds });
    setIsFinished(true);
  };

  const handleNext = async () => {
    if (currentQuestion === totalQuestions - 1) {
      await handleFinish();
      return;
    }

    setSelectedOption(null);
    setIsSubmitted(false);
    setCurrentQuestion((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setAnswersByQuestion({});
    setIsFinished(false);
    resetGrading();
  };

  if (isLoadingQuestions) {
    return (
      <QuizShell>
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-10 text-center text-slate-600 font-semibold">
            Đang tải câu hỏi...
          </CardContent>
        </Card>
      </QuizShell>
    );
  }

  if (loadError) {
    return (
      <QuizShell>
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-10 text-center space-y-4">
            <p className="text-lg font-bold text-[#141b2b]">
              Không tải được bài quiz
            </p>
            <p className="text-slate-500">{loadError}</p>
            <Button onClick={refetch}>Thử lại</Button>
          </CardContent>
        </Card>
      </QuizShell>
    );
  }

  if (!question) {
    return (
      <QuizShell>
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-10 text-center text-slate-600 font-semibold">
            Chưa có dữ liệu câu hỏi.
          </CardContent>
        </Card>
      </QuizShell>
    );
  }

  if (isFinished) {
    const correctCount = gradingResult?.correct_count ?? 0;
    const passThreshold =
      gradingResult?.pass_threshold ?? Math.ceil(totalQuestions * 0.84);
    const scorePercent = gradingResult?.score_percent ?? 0;

    return (
      <QuizShell>
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-10 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Trophy size={30} />
            </div>
            <h1 className="text-3xl font-black text-[#141b2b]">
              Kết quả bài quiz
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="border-none bg-[#f1f3ff]">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 font-semibold">Điểm</p>
                  <p className="text-2xl font-black text-[#141b2b]">
                    {correctCount}/{totalQuestions}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none bg-[#f1f3ff]">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 font-semibold">
                    Tỷ lệ đúng
                  </p>
                  <p className="text-2xl font-black text-blue-600">
                    {scorePercent}%
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none bg-[#f1f3ff]">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 font-semibold">
                    Ngưỡng đạt
                  </p>
                  <p className="text-2xl font-black text-[#141b2b]">
                    {passThreshold}
                  </p>
                </CardContent>
              </Card>
            </div>

            {gradingError && (
              <p className="text-sm text-red-600">{gradingError}</p>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button onClick={handleRestart} className="rounded-xl">
                <RotateCcw size={16} className="mr-2" /> Làm lại
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/create-exam")}
              >
                Tạo đề khác
              </Button>
            </div>
          </CardContent>
        </Card>
      </QuizShell>
    );
  }

  return (
    <QuizShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#141b2b]">
              Quiz luyện thi
            </h1>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#e1e8fd] text-blue-700 border-none font-bold">
                {examConfig.licenseType}
              </Badge>
              <Badge variant="outline">{examConfig.examName}</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/create-exam")}>
            Tạo đề khác
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-500 font-semibold">
            <span>
              Câu {currentQuestion + 1}/{totalQuestions}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2.5 bg-slate-100"
            indicatorClassName="bg-blue-600"
          />
        </div>

        <Card className="border-none shadow-sm rounded-3xl">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Câu #{question.id}</Badge>
              {question.isFatal && (
                <Badge className="bg-red-50 text-red-700 border border-red-100">
                  FATAL
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl leading-relaxed text-[#141b2b]">
              {question.questionText}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {question.image && (
              <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                <img
                  src={question.image}
                  alt="Question"
                  className="w-full h-72 object-cover"
                />
              </div>
            )}

            <RadioGroup
              value={selectedOption?.toString()}
              onValueChange={(val) =>
                !isSubmitted && setSelectedOption(parseInt(val, 10))
              }
              className="grid gap-3"
            >
              {question.options.map((option) => (
                <Label
                  key={option.optionId}
                  className={`border p-4 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                    selectedOption === option.optionId
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300"
                  } ${isSubmitted ? "opacity-80" : ""}`}
                >
                  <RadioGroupItem
                    value={option.optionId.toString()}
                    disabled={isSubmitted}
                    className="sr-only"
                  />
                  <span className="shrink-0 w-8 h-8 rounded-full border border-slate-300 bg-white flex items-center justify-center text-sm font-extrabold text-slate-600">
                    {String.fromCharCode(64 + option.optionId)}
                  </span>
                  <span className="grow text-sm md:text-base font-medium text-slate-700">
                    {option.optionText}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t border-slate-100 bg-slate-50/50 p-6">
            <p className="text-sm text-slate-500 font-semibold">
              Đã trả lời: {answeredCount}
            </p>

            {!isSubmitted ? (
              <Button onClick={handleSubmit} disabled={selectedOption === null}>
                Nộp đáp án
              </Button>
            ) : (
              <Button onClick={() => void handleNext()} disabled={isGrading}>
                {currentQuestion === totalQuestions - 1
                  ? isGrading
                    ? "Đang chấm điểm..."
                    : "Xem kết quả"
                  : "Câu tiếp theo"}
                <ChevronRight size={16} className="ml-2" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </QuizShell>
  );
}
