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
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  Loader,
  Menu,
  X,
} from "lucide-react";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { useQuizGrading } from "@/hooks/useQuizGrading";

const DEFAULT_EXAM_CONFIG = {
  topicId: null,
  licenseType: "A1",
  questionCount: 25,
  examName: "Đề A1 - 25 câu",
  generationMode: "structured",
  examsSource: "exam_250",
  fatalOnly: false,
  selectedCategories: [],
};

const PRACTICE_RESULTS_STORAGE_KEY = "practiceTopicResults";
const QUIZ_DRAFT_STORAGE_PREFIX = "quizDraft";

const getQuizDraftStorageKey = (config = {}) => {
  const topicKey = config?.topicId || "topic";
  const licenseKey = config?.licenseType || "A1";
  const sourceKey = config?.examsSource || "exam_250";
  const countKey = config?.questionCount || 25;
  const nameKey = config?.examName || "quiz";

  return [
    QUIZ_DRAFT_STORAGE_PREFIX,
    topicKey,
    licenseKey,
    sourceKey,
    countKey,
    nameKey,
  ].join(":");
};

const readQuizDraft = (storageKey) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const writeQuizDraft = (storageKey, draft) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(draft));
  } catch {
    // Ignore storage errors.
  }
};

const clearQuizDraft = (storageKey) => {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage errors.
  }
};

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
    fatalOnly: Boolean(config?.fatalOnly),
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
  <div className="flex flex-col h-full w-full bg-[#f9f9ff] font-sans overflow-hidden">
    <main className="flex-1 p-4 overflow-hidden">
      <div className="w-full max-w-6xl h-full mx-auto flex flex-col">
        {children}
      </div>
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
    fatalOnly: examConfig.fatalOnly,
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
  const [isQuestionSidebarOpen, setIsQuestionSidebarOpen] = useState(false);
  const [isFailedByFatal, setIsFailedByFatal] = useState(false);
  const [fatalFailQuestionNumber, setFatalFailQuestionNumber] = useState(null);

  const quizDraftStorageKey = useMemo(
    () => getQuizDraftStorageKey(examConfig),
    [examConfig],
  );

  const question = questions[currentQuestion] || null;
  const totalQuestions = questions.length;

  useEffect(() => {
    if (!questions.length) return;

    const draft = readQuizDraft(quizDraftStorageKey);
    if (
      draft?.answersByQuestion &&
      typeof draft.answersByQuestion === "object"
    ) {
      const nextQuestionIndex = Math.min(
        Number(draft.currentQuestion || 0),
        Math.max(questions.length - 1, 0),
      );
      const currentQuestionId = questions[nextQuestionIndex]?.id;
      const restoredSelected =
        currentQuestionId !== undefined && currentQuestionId !== null
          ? (draft.answersByQuestion[currentQuestionId] ?? null)
          : null;

      setCurrentQuestion(nextQuestionIndex);
      setAnswersByQuestion(draft.answersByQuestion);
      setSelectedOption(
        Number.isFinite(Number(restoredSelected))
          ? Number(restoredSelected)
          : null,
      );
      setIsSubmitted(
        Boolean(restoredSelected !== null && restoredSelected !== undefined),
      );
      setIsFinished(Boolean(draft.isFinished));
      setIsFailedByFatal(false);
      setFatalFailQuestionNumber(null);
    } else {
      setCurrentQuestion(0);
      setSelectedOption(null);
      setIsSubmitted(false);
      setAnswersByQuestion({});
      setIsFinished(false);
      setIsFailedByFatal(false);
      setFatalFailQuestionNumber(null);
    }

    resetGrading();
  }, [questions, quizDraftStorageKey, resetGrading]);

  useEffect(() => {
    const savedAnswer =
      question && answersByQuestion[question.id] !== undefined
        ? answersByQuestion[question.id]
        : null;

    setSelectedOption(
      savedAnswer !== null && savedAnswer !== undefined
        ? Number(savedAnswer)
        : null,
    );
    setIsSubmitted(false);
  }, [currentQuestion, question, answersByQuestion]);

  useEffect(() => {
    if (!questions.length || isFinished) return;

    writeQuizDraft(quizDraftStorageKey, {
      currentQuestion,
      selectedOption,
      isSubmitted,
      answersByQuestion,
      isFinished,
      examConfig,
      updatedAt: new Date().toISOString(),
    });
  }, [
    quizDraftStorageKey,
    questions.length,
    currentQuestion,
    selectedOption,
    isSubmitted,
    answersByQuestion,
    isFinished,
    examConfig,
  ]);

  const answeredCount = useMemo(
    () => Object.keys(answersByQuestion).length,
    [answersByQuestion],
  );

  const progress = isFinished
    ? 100
    : totalQuestions > 0
      ? ((currentQuestion + 1) / totalQuestions) * 100
      : 0;

  const getFatalViolationQuestionNumber = (questionItem, answerValue) => {
    if (!questionItem?.isFatal || isFinished || isFailedByFatal) {
      return null;
    }

    const correctAnswer = Number(questionItem.correctAnswer);
    const normalizedAnswer = Number(answerValue);

    if (!Number.isFinite(correctAnswer) || !Number.isFinite(normalizedAnswer)) {
      return null;
    }

    return normalizedAnswer !== correctAnswer ? currentQuestion + 1 : null;
  };

  const markFatalFail = (questionNumber, nextAnswers) => {
    setFatalFailQuestionNumber(questionNumber);
    setIsFailedByFatal(true);
    writeQuizDraft(quizDraftStorageKey, {
      currentQuestion,
      selectedOption,
      isSubmitted: true,
      answersByQuestion: nextAnswers,
      isFinished: false,
      isFailedByFatal: true,
      examConfig,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveProgress = () => {
    if (isFailedByFatal) return;
    if (!question) return;

    const fatalViolationQuestionNumber = getFatalViolationQuestionNumber(
      question,
      selectedOption,
    );
    if (fatalViolationQuestionNumber) {
      const nextAnswers = {
        ...answersByQuestion,
        ...(selectedOption !== null ? { [question.id]: selectedOption } : {}),
      };
      setAnswersByQuestion(nextAnswers);
      markFatalFail(fatalViolationQuestionNumber, nextAnswers);
      return;
    }

    const nextAnswers = {
      ...answersByQuestion,
      ...(selectedOption !== null ? { [question.id]: selectedOption } : {}),
    };

    setAnswersByQuestion((prev) => ({
      ...prev,
      ...(selectedOption !== null ? { [question.id]: selectedOption } : {}),
    }));
    writeQuizDraft(quizDraftStorageKey, {
      currentQuestion,
      selectedOption,
      isSubmitted: false,
      answersByQuestion: nextAnswers,
      isFinished,
      examConfig,
      updatedAt: new Date().toISOString(),
    });
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
    clearQuizDraft(quizDraftStorageKey);
    setIsFinished(true);
  };

  const handleNext = async () => {
    if (isFailedByFatal) return;

    const fatalViolationQuestionNumber = getFatalViolationQuestionNumber(
      question,
      selectedOption,
    );
    if (fatalViolationQuestionNumber) {
      const nextAnswers = {
        ...answersByQuestion,
        ...(selectedOption !== null ? { [question.id]: selectedOption } : {}),
      };
      setAnswersByQuestion(nextAnswers);
      markFatalFail(fatalViolationQuestionNumber, nextAnswers);
      return;
    }

    if (question && selectedOption !== null) {
      const nextAnswers = {
        ...answersByQuestion,
        [question.id]: selectedOption,
      };
      setAnswersByQuestion(nextAnswers);
      writeQuizDraft(quizDraftStorageKey, {
        currentQuestion,
        selectedOption,
        isSubmitted: false,
        answersByQuestion: nextAnswers,
        isFinished,
        examConfig,
        updatedAt: new Date().toISOString(),
      });
    }

    if (currentQuestion === totalQuestions - 1) {
      await handleFinish();
      return;
    }

    setSelectedOption(null);
    setCurrentQuestion((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isFailedByFatal) return;
    if (currentQuestion === 0) return;

    const fatalViolationQuestionNumber = getFatalViolationQuestionNumber(
      question,
      selectedOption,
    );
    if (fatalViolationQuestionNumber) {
      const nextAnswers = {
        ...answersByQuestion,
        ...(selectedOption !== null ? { [question.id]: selectedOption } : {}),
      };
      setAnswersByQuestion(nextAnswers);
      markFatalFail(fatalViolationQuestionNumber, nextAnswers);
      return;
    }

    if (question && selectedOption !== null) {
      const nextAnswers = {
        ...answersByQuestion,
        [question.id]: selectedOption,
      };
      setAnswersByQuestion(nextAnswers);
      writeQuizDraft(quizDraftStorageKey, {
        currentQuestion,
        selectedOption,
        isSubmitted: false,
        answersByQuestion: nextAnswers,
        isFinished,
        examConfig,
        updatedAt: new Date().toISOString(),
      });
    }

    setCurrentQuestion((prev) => Math.max(prev - 1, 0));
  };

  const handleGoToQuestion = (targetIndex) => {
    if (!Number.isFinite(targetIndex)) return;
    if (targetIndex < 0 || targetIndex >= totalQuestions) return;
    if (targetIndex === currentQuestion) return;

    const fatalViolationQuestionNumber = getFatalViolationQuestionNumber(
      question,
      selectedOption,
    );
    if (fatalViolationQuestionNumber) {
      const nextAnswers = {
        ...answersByQuestion,
        ...(selectedOption !== null ? { [question.id]: selectedOption } : {}),
      };
      setAnswersByQuestion(nextAnswers);
      markFatalFail(fatalViolationQuestionNumber, nextAnswers);
      return;
    }

    if (question && selectedOption !== null) {
      const nextAnswers = {
        ...answersByQuestion,
        [question.id]: selectedOption,
      };
      setAnswersByQuestion(nextAnswers);
      writeQuizDraft(quizDraftStorageKey, {
        currentQuestion: targetIndex,
        selectedOption,
        isSubmitted: false,
        answersByQuestion: nextAnswers,
        isFinished,
        examConfig,
        updatedAt: new Date().toISOString(),
      });
    }

    setCurrentQuestion(targetIndex);
  };

  const handleRestart = () => {
    clearQuizDraft(quizDraftStorageKey);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setAnswersByQuestion({});
    setIsFinished(false);
    setIsFailedByFatal(false);
    setFatalFailQuestionNumber(null);
    resetGrading();
  };

  const handleSelectOption = (value) => {
    const parsedOption = parseInt(value, 10);
    if (!Number.isFinite(parsedOption)) return;

    setSelectedOption(parsedOption);

    if (!question || !question.isFatal || isFinished || isFailedByFatal) {
      return;
    }

    const correctAnswer = Number(question.correctAnswer);
    if (!Number.isFinite(correctAnswer)) {
      return;
    }

    if (parsedOption !== correctAnswer) {
      const nextAnswers = {
        ...answersByQuestion,
        [question.id]: parsedOption,
      };

      setAnswersByQuestion(nextAnswers);
      markFatalFail(currentQuestion + 1, nextAnswers);
    }
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
        console.log(
          "     • Type of wrong_answers:",
          typeof gradingResult.wrong_answers,
        );
      } else {
        console.log("   ❌ PROBLEM: gradingResult is missing!");
      }
      console.log("   - questions count:", questions?.length);
      if (questions && questions.length > 0) {
        console.log("     First question ID:", questions[0].id);
        console.log(
          "     Question IDs:",
          questions.map((q) => q.id),
        );
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
        console.log(
          "   ❌ wrongAnswers is NOT an array! Type:",
          typeof wrongAnswers,
        );
      }

      console.log("\n📊 STEP 3: Filter questions");
      const wrongQuestions = questions.filter((q) => {
        const isWrong = wrongAnswers.includes(q.id);
        console.log(`   Q${q.id}: ${isWrong ? "❌ WRONG" : "✅ CORRECT"}`);
        return isWrong;
      });

      console.log("\n📊 STEP 4: Filter results");
      console.log("   - Input questions count:", questions.length);
      console.log("   - Input wrongAnswers count:", wrongAnswers.length);
      console.log("   - Output wrongQuestions count:", wrongQuestions.length);
      console.log(
        "   - Filtered wrongQuestions IDs:",
        wrongQuestions.map((q) => q.id),
      );

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
      console.log(
        "   - wrongQuestions count:",
        analysisData.wrongQuestions.length,
      );
      console.log("   - Full analysisData:", analysisData);

      console.log("\n📊 STEP 6: Save to sessionStorage");
      sessionStorage.setItem("quizAnalysis", JSON.stringify(analysisData));
      console.log("✅ Saved to sessionStorage");

      console.log("\n📊 STEP 7: Verify read back");
      const verify = sessionStorage.getItem("quizAnalysis");
      const verifyData = JSON.parse(verify);
      console.log("✅ Verified from sessionStorage:");
      console.log(
        "   - wrongQuestions count:",
        verifyData.wrongQuestions.length,
      );
      console.log(
        "   - Data matches:",
        JSON.stringify(analysisData) === JSON.stringify(verifyData)
          ? "✅ YES"
          : "❌ NO",
      );

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
    const fatalWrongCount = Number(gradingResult?.fatal_wrong_count ?? 0);
    const passedByScore = Number(correctCount) >= Number(passThreshold);
    const passedByFatalRule = fatalWrongCount === 0;
    const computedPassed = passedByScore && passedByFatalRule;
    const backendPassed =
      typeof gradingResult?.passed === "boolean" ? gradingResult.passed : null;
    const isPassedExam =
      backendPassed === null ? computedPassed : backendPassed && computedPassed;
    const displayCorrectCount = isPassedExam ? correctCount : 0;
    const displayScorePercent = isPassedExam ? scorePercent : 0;
    const missingScore = Math.max(
      Number(passThreshold) - Number(correctCount),
      0,
    );
    const resultSubtitle = isPassedExam
      ? "Kết quả đã đạt yêu cầu"
      : "Chưa đạt, vui lòng làm lại bài thi";

    return (
      <QuizShell>
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="px-8 py-10 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Trophy size={30} />
            </div>
            <h1 className="text-3xl font-black text-[#141b2b] tracking-tight">
              {isPassedExam ? "Đã đạt" : "Chưa đạt"}: {examConfig.examName}
            </h1>

            <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-600">
                {resultSubtitle}
              </p>
              {!isPassedExam && (
                <p className="mt-2 text-sm text-red-600 font-semibold leading-relaxed">
                  Chưa đạt điểm tối thiểu: cần {passThreshold} câu đúng, hiện có{" "}
                  {correctCount}/{totalQuestions}. Thiếu {missingScore} câu.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <Card className="border-none bg-[#f1f3ff]">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                    Điểm
                  </p>
                  <p className="text-2xl font-black text-[#141b2b]">
                    {displayCorrectCount}/{totalQuestions}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none bg-[#f1f3ff]">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                    Tỷ lệ đúng
                  </p>
                  <p className="text-2xl font-black text-blue-600">
                    {displayScorePercent}%
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none bg-[#f1f3ff]">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
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

            {!isPassedExam && !passedByFatalRule && (
              <p className="text-sm text-red-600 font-semibold">
                Bạn đã sai câu điểm liệt ({fatalWrongCount} câu).
              </p>
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
                    <Loader size={16} className="mr-2 animate-spin" /> Đang
                    gửi...
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

  if (isFailedByFatal) {
    return (
      <QuizShell>
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-10 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-600 text-3xl font-black">
              !
            </div>
            <h1 className="text-3xl font-black text-[#141b2b]">
              Bạn đã rớt bài thi
            </h1>
            <p className="text-slate-600 font-semibold">
              Bạn chọn sai câu điểm liệt
              {Number.isFinite(Number(fatalFailQuestionNumber))
                ? ` (Câu ${fatalFailQuestionNumber})`
                : ""}
              .
            </p>

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
            </div>
          </CardContent>
        </Card>
      </QuizShell>
    );
  }

  return (
    <QuizShell>
      <button
        type="button"
        onClick={() => setIsQuestionSidebarOpen((prev) => !prev)}
        className="fixed right-3 top-1/2 -translate-y-1/2 z-40 rounded-l-xl rounded-r-md bg-white border border-slate-300 shadow px-2 py-3 text-slate-700 hover:bg-slate-50"
        aria-label="Mở danh sách câu hỏi"
      >
        <Menu size={18} />
      </button>

      <aside
        className={`fixed top-20 right-0 h-[calc(100vh-5rem)] w-72 bg-white border-l border-slate-200 shadow-xl z-50 transition-transform duration-300 ${
          isQuestionSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Danh sách câu</h3>
            <button
              type="button"
              onClick={() => setIsQuestionSidebarOpen(false)}
              className="p-1 rounded-md hover:bg-slate-100"
              aria-label="Đóng danh sách câu hỏi"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((item, index) => {
                const isCurrent = index === currentQuestion;
                const isAnswered = answersByQuestion[item.id] !== undefined;
                const isFatalQuestion = Boolean(item.isFatal);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleGoToQuestion(index)}
                    title={
                      isFatalQuestion ? "Câu điểm liệt" : `Câu ${index + 1}`
                    }
                    className={`relative h-9 rounded-lg text-sm font-semibold border transition-all ${
                      isCurrent
                        ? "bg-blue-600 text-white border-blue-600"
                        : isAnswered
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-white text-slate-700 border-slate-300 hover:border-blue-300"
                    }`}
                  >
                    {index + 1}
                    {isFatalQuestion && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Header: Fixed at top */}
      <div className="shrink-0 space-y-2 border-b-2 border-slate-200 pb-3 mb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black text-[#141b2b]">
              Quiz luyện thi
            </h1>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#e1e8fd] text-blue-700 border-none font-bold text-xs">
                {examConfig.licenseType}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {examConfig.examName}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/learner/practice-tests")}
            className="text-sm h-8"
          >
            Chọn đề khác
          </Button>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500 font-semibold">
            <span>
              Câu {currentQuestion + 1}/{totalQuestions}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-slate-100"
            indicatorClassName="bg-blue-600"
          />
        </div>
      </div>

      {/* Main Content: Scrollable container with Quiz Card */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-2 flex justify-center">
          <Card className="border border-slate-200 rounded-2xl flex flex-col w-full bg-white gap-0 py-0">
            <CardHeader className="space-y-2 shrink-0 px-4 pt-4 pb-1">
              {question.isFatal && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                    Câu điểm liệt
                  </Badge>
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden px-4 pb-4 pt-0">
              <div className="grid lg:grid-cols-2 gap-6 h-full items-start">
                {/* Left: Question Text + Image */}
                <div className="space-y-2 flex flex-col self-start">
                  <p className="text-base font-semibold text-slate-600">
                    Câu {currentQuestion + 1}
                  </p>
                  <h2 className="text-2xl leading-snug font-black text-[#141b2b] mt-0">
                    {question.questionText}
                  </h2>

                  {question.image && (
                    <div className="w-full max-w-130 mx-auto h-90 rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 flex items-center justify-center overflow-hidden mt-1">
                      <img
                        src={question.image}
                        alt={`Hình minh họa câu ${question.id}`}
                        className="w-full h-full object-contain rounded-xl"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                {/* Right: Answer Options */}
                <div className="space-y-3 flex flex-col justify-center h-full pt-0">
                  <RadioGroup
                    value={selectedOption?.toString()}
                    onValueChange={handleSelectOption}
                    className="grid gap-3 w-full"
                  >
                    {question.options.map((option) => (
                      <Label
                        key={option.optionId}
                        className={`border-2 p-4 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                          selectedOption === option.optionId
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-300 bg-white hover:border-blue-400"
                        }`}
                      >
                        <RadioGroupItem
                          value={option.optionId.toString()}
                          disabled={false}
                          className="sr-only"
                        />
                        <span className="shrink-0 w-9 h-9 rounded-full border-2 border-slate-400 bg-white flex items-center justify-center text-base font-bold text-slate-700">
                          {String.fromCharCode(64 + option.optionId)}
                        </span>
                        <span className="grow text-sm font-medium text-slate-700 pt-0.5">
                          {option.optionText}
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t-2 border-slate-200 bg-slate-50 px-4 py-3 shrink-0">
              <p className="text-sm text-slate-600 font-semibold">
                Đã trả lời: {answeredCount}/{totalQuestions}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="px-5 py-2 text-sm font-semibold"
                >
                  <ChevronLeft size={16} className="mr-2" />
                  Quay lại
                </Button>

                <Button
                  onClick={handleSaveProgress}
                  variant="outline"
                  className="px-6 py-2 text-sm font-semibold"
                >
                  Save
                </Button>

                <Button
                  onClick={() => void handleNext()}
                  disabled={isGrading}
                  className="px-6 py-2 text-sm font-semibold"
                >
                  {currentQuestion === totalQuestions - 1
                    ? isGrading
                      ? "Đang chấm điểm..."
                      : "Xem kết quả"
                    : "Câu tiếp theo"}
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </QuizShell>
  );
}
