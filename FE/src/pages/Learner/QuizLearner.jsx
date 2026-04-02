import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { ChevronRight, RotateCcw, Trophy, Sparkles, Loader } from "lucide-react";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { useQuizGrading } from "@/hooks/useQuizGrading";

const DEFAULT_EXAM_CONFIG = {
  topicId: null,
  licenseType: "A1",
  questionCount: 25,
  examName: "Đề A1 - 25 câu",
  generationMode: "structured",
  examsSource: "exam_250",
  selectedCategories: [],
};

const PRACTICE_RESULTS_STORAGE_KEY = "practiceTopicResults";

const savePracticeResult = ({ topicId, examName, totalQuestions, result }) => {
  if (!result || typeof result !== "object") return;

  const scorePercent = Number(result?.score_percent ?? 0);
  if (!Number.isFinite(scorePercent)) return;

  const key = topicId || examName;
  if (!key) return;

  try {
    const raw = localStorage.getItem(PRACTICE_RESULTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const safeStore = parsed && typeof parsed === "object" ? parsed : {};
    const prev = safeStore[key] || {};

    safeStore[key] = {
      topicId: topicId || prev.topicId || null,
      examName: examName || prev.examName || "Quiz",
      bestScore: Math.max(
        Number(prev?.bestScore || 0),
        Math.round(scorePercent),
      ),
      latestScore: Math.round(scorePercent),
      attemptCount: Number(prev?.attemptCount || 0) + 1,
      totalQuestions: Number(totalQuestions || prev?.totalQuestions || 0),
      updatedAt: new Date().toISOString(),
    };

    if (topicId && examName) {
      safeStore[examName] = safeStore[key];
    }

    localStorage.setItem(
      PRACTICE_RESULTS_STORAGE_KEY,
      JSON.stringify(safeStore),
    );
  } catch {
    // Ignore storage errors (private mode/quota) and continue user flow.
  }
};

const normalizeExamConfig = (config = {}) => {
  const rawLicense = String(config?.licenseType || "A1")
    .trim()
    .toUpperCase();
  const licenseType = rawLicense === "B1" ? "B1" : "A1";

  const examsSource = config?.examsSource || "exam_250";
  const selectedCategories = Array.isArray(config?.selectedCategories)
    ? [
        ...new Set(
          config.selectedCategories
            .map((item) => String(item).trim().toUpperCase())
            .filter(Boolean),
        ),
      ]
    : [];

  const defaultCount = examsSource === "exam_600" ? 35 : 25;
  const minCount = examsSource === "exam_600" ? 20 : 10;
  const maxCount = examsSource === "exam_600" ? 50 : 30;

  const parsedCount = Number(config?.questionCount);
  const questionCount = Number.isFinite(parsedCount)
    ? Math.min(maxCount, Math.max(minCount, parsedCount))
    : defaultCount;

  const generationMode =
    String(config?.generationMode || "structured").toLowerCase() === "random"
      ? "random"
      : "structured";

  return {
    topicId:
      typeof config?.topicId === "string" && config.topicId.trim()
        ? config.topicId.trim()
        : null,
    licenseType,
    questionCount:
      generationMode === "structured" ? defaultCount : questionCount,
    examName:
      typeof config?.examName === "string" && config.examName.trim()
        ? config.examName.trim()
        : `Đề ${licenseType} - ${questionCount} câu`,
    generationMode,
    examsSource,
    selectedCategories,
  };
};

const parseExamConfigFromSearch = (search = "") => {
  const params = new URLSearchParams(search);
  const licenseType = params.get("licenseType");
  const questionCount = params.get("questionCount");
  const generationMode = params.get("mode");
  const examsSource = params.get("examsSource");
  const categories = params.get("categories");
  const examName = params.get("examName");

  if (
    !licenseType &&
    !questionCount &&
    !generationMode &&
    !examsSource &&
    !categories &&
    !examName
  ) {
    return null;
  }

  return normalizeExamConfig({
    licenseType,
    questionCount,
    generationMode,
    examsSource,
    examName,
    selectedCategories: categories
      ? categories
          .split(",")
          .map((item) =>
            String(item || "")
              .trim()
              .toUpperCase(),
          )
          .filter(Boolean)
      : [],
  });
};

const QuizShell = ({ children }) => (
  <div className="flex flex-col bg-[#f9f9ff] font-sans pb-12">
    <main className="flex-1 w-full max-w-5xl mx-auto p-8">{children}</main>
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
        prev.topicId === nextConfig.topicId &&
        prev.licenseType === nextConfig.licenseType &&
        prev.questionCount === nextConfig.questionCount &&
        prev.examName === nextConfig.examName &&
        prev.generationMode === nextConfig.generationMode &&
        prev.examsSource === nextConfig.examsSource &&
        JSON.stringify(prev.selectedCategories || []) ===
          JSON.stringify(nextConfig.selectedCategories || [])
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
    examsSource: examConfig.examsSource,
    selectedCategories: examConfig.selectedCategories,
  });

  const {
    gradingResult,
    isGrading,
    error: gradingError,
    submitExam,
    resetGrading,
  } = useQuizGrading({
    licenseType: examConfig.licenseType,
    examsSource: examConfig.examsSource,
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answersByQuestion, setAnswersByQuestion] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [sendingToAI, setSendingToAI] = useState(false);

  const question = questions[currentQuestion] || null;
  const totalQuestions = questions.length;
  const isImageOnRight = currentQuestion % 2 === 0;

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

    const result = await submitExam({ answers, questionIds, questions });
    savePracticeResult({
      topicId: examConfig.topicId,
      examName: examConfig.examName,
      totalQuestions,
      result,
    });
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

  const handleSendToAI = async () => {
    setSendingToAI(true);
    try {
      console.log("\n📤 HANDLE_SEND_TO_AI STARTED");
      console.log("\n📊 STEP 1: Available data check");
      console.log("   - gradingResult exists:", !!gradingResult);
      if (gradingResult) {
        console.log("   - gradingResult keys:", Object.keys(gradingResult));
        console.log("   - gradingResult full object:", gradingResult);
        console.log("     • correct_count:", gradingResult.correct_count);
        console.log("     • score_percent:", gradingResult.score_percent);
        console.log("     • wrong_answers:", gradingResult.wrong_answers);
        console.log("     • Type of wrong_answers:", typeof gradingResult.wrong_answers);
      } else {
        console.log("   ❌ PROBLEM: gradingResult is missing!");
      }
      console.log("   - questions count:", questions?.length);
      if (questions && questions.length > 0) {
        console.log("     First question ID:", questions[0].id);
        console.log("     Question IDs:", questions.map(q => q.id));
      }
      console.log("   - answersByQuestion:", answersByQuestion);
      console.log("     Keys:", Object.keys(answersByQuestion || {}));
      console.log("   - examConfig:", examConfig);
      console.log("   - totalQuestions:", totalQuestions);
      
      // Lấy danh sách câu sai
      console.log("\n📊 STEP 2: Extract wrong answers");
      const wrongAnswers = gradingResult?.wrong_answers || [];
      console.log("   - wrongAnswers array:", wrongAnswers);
      console.log("   - wrongAnswers length:", wrongAnswers.length);
      console.log("   - wrongAnswers type:", typeof wrongAnswers);
      if (Array.isArray(wrongAnswers)) {
        console.log("   ✅ wrongAnswers is an array");
      } else {
        console.log("   ❌ wrongAnswers is NOT an array! Type:", typeof wrongAnswers);
      }
      
      console.log("\n📊 STEP 3: Filter questions");
      const wrongQuestions = questions.filter((q) => {
        const isWrong = wrongAnswers.includes(q.id);
        console.log(`   Q${q.id}: ${isWrong ? '❌ WRONG' : '✅ CORRECT'}`);
        return isWrong;
      });
      
      console.log("\n📊 STEP 4: Filter results");
      console.log("   - Input questions count:", questions.length);
      console.log("   - Input wrongAnswers count:", wrongAnswers.length);
      console.log("   - Output wrongQuestions count:", wrongQuestions.length);
      console.log("   - Filtered wrongQuestions IDs:", wrongQuestions.map(q => q.id));

      // Lưu dữ liệu chi tiết vào sessionStorage
      console.log("\n📊 STEP 5: Build analysisData");
      const analysisData = {
        examName: examConfig.examName,
        score: `${gradingResult?.correct_count}/${totalQuestions}`,
        percentage: gradingResult?.score_percent,
        licenseType: examConfig.licenseType,
        wrongQuestions: wrongQuestions.map((q) => {
          console.log(`   Processing Q${q.id}:`, {
            question_text: q.question_text?.substring(0, 30),
            user_answer: answersByQuestion[q.id],
            correct_answer: q.correct_answer,
          });
          
          return {
            id: q.id,
            question_text: q.question_text,
            correct_answer: q.correct_answer,
            user_answer: answersByQuestion[q.id],
            options: q.options,
            explanation: q.explanation,
            category: q.category,
          };
        }),
        totalWrong: wrongQuestions.length,
        answersByQuestion: answersByQuestion,
      };

      console.log("\n💾 Final analysisData to save:");
      console.log("   - examName:", analysisData.examName);
      console.log("   - score:", analysisData.score);
      console.log("   - percentage:", analysisData.percentage);
      console.log("   - licenseType:", analysisData.licenseType);
      console.log("   - totalWrong:", analysisData.totalWrong);
      console.log("   - wrongQuestions count:", analysisData.wrongQuestions.length);
      console.log("   - Full analysisData:", analysisData);

      console.log("\n📊 STEP 6: Save to sessionStorage");
      sessionStorage.setItem("quizAnalysis", JSON.stringify(analysisData));
      console.log("✅ Saved to sessionStorage");
      
      console.log("\n📊 STEP 7: Verify read back");
      const verify = sessionStorage.getItem("quizAnalysis");
      const verifyData = JSON.parse(verify);
      console.log("✅ Verified from sessionStorage:");
      console.log("   - wrongQuestions count:", verifyData.wrongQuestions.length);
      console.log("   - Data matches:", JSON.stringify(analysisData) === JSON.stringify(verifyData) ? "✅ YES" : "❌ NO");
      
      console.log("\n🚀 STEP 8: Navigate");
      console.log("🚀 Navigating to /learner/ai-assistant");
      navigate("/learner/ai-assistant");
    } catch (error) {
      console.error("❌ Error in handleSendToAI:", error);
      console.error("   - Type:", error.constructor.name);
      console.error("   - Message:", error.message);
      console.error("   - Stack:", error.stack);
    } finally {
      setSendingToAI(false);
    }
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
              Kết quả: {examConfig.examName}
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
                onClick={() => navigate("/learner/practice-tests")}
                className="rounded-xl"
              >
                Chọn đề khác
              </Button>
              <Button
                onClick={handleSendToAI}
                disabled={sendingToAI}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {sendingToAI ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" /> Đang gửi...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" /> Phân tích với AI
                  </>
                )}
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
          <Button
            variant="outline"
            onClick={() => navigate("/learner/practice-tests")}
          >
            Chọn đề khác
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
            <CardTitle className="text-base font-semibold text-slate-500">
              Chọn đáp án đúng nhất cho câu hỏi bên dưới
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div
              className={`grid gap-6 ${question.image ? "lg:grid-cols-2" : "grid-cols-1"}`}
            >
              <div
                className={`space-y-5 ${question.image && !isImageOnRight ? "lg:order-2" : "lg:order-1"}`}
              >
                <h2 className="text-2xl leading-relaxed font-black text-[#141b2b]">
                  {question.questionText}
                </h2>

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
              </div>

              {question.image && (
                <div
                  className={`rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-center min-h-80 ${
                    isImageOnRight ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <img
                    src={question.image}
                    alt={`Hình minh họa câu ${question.id}`}
                    className="w-full h-auto max-h-130 object-contain rounded-xl"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
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
