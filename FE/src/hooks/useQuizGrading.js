import { useCallback, useState } from "react";
import { quizLearnerApi } from "@/services/api/Quizlearner";

const normalizeGradingResult = (result, userAnswers = {}, questions = []) => {
  if (!result || typeof result !== "object") return result;

  const totalQuestions = Number(
    result?.total_questions ?? result?.totalQuestions ?? 0,
  );
  const correctCount = Number(
    result?.correct_count ?? result?.correctCount ?? 0,
  );
  const passThreshold = Number(
    result?.pass_threshold ?? result?.passThreshold ?? 0,
  );
  const scorePercent = Number(
    result?.score_percent ?? result?.scorePercent ?? result?.score ?? 0,
  );

  // Calculate wrong_answers if not present
  let wrongAnswers = result?.wrong_answers || result?.wrongAnswers || [];
  if (wrongAnswers.length === 0 && questions.length > 0) {
    console.log("🔧 Calculating wrong_answers from questions...");
    wrongAnswers = questions
      .filter((q) => {
        const userAnswer = userAnswers[q.id];
        const isCorrect = userAnswer === q.correct_answer;
        if (!isCorrect) {
          console.log(`  Q${q.id}: User=${userAnswer}, Correct=${q.correct_answer} → WRONG`);
        }
        return !isCorrect;
      })
      .map((q) => q.id);
    console.log("✅ Calculated wrong_answers:", wrongAnswers);
  }

  return {
    ...result,
    total_questions: totalQuestions,
    correct_count: correctCount,
    pass_threshold: passThreshold,
    score_percent: Number.isFinite(scorePercent) ? scorePercent : 0,
    wrong_answers: wrongAnswers,
  };
};

export const useQuizGrading = ({
  licenseType = "A1",
  examsSource = "exam_250",
} = {}) => {
  const [gradingResult, setGradingResult] = useState(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState(null);

  const submitExam = useCallback(
    async ({ answers = [], questionIds = [], questions = [] } = {}) => {
      setIsGrading(true);
      setError(null);

      try {
        let result;

        // Convert answers to userAnswers object format
        const userAnswers = {};
        answers.forEach((ans) => {
          userAnswers[ans.question_id] = ans.selected_answer;
        });

        console.log("🔧 Building userAnswers object:");
        console.log("   - Input answers:", answers);
        console.log("   - Built userAnswers:", userAnswers);
        console.log("   - Questions count:", questions.length);

        // Use new API for exam_250 and exam_600
        if (examsSource === "exam_250" || examsSource === "exam_600") {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/v1/exams/grade`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                questions,
                userAnswers,
                examsSource,
              }),
            },
          );

          if (!response.ok) {
            throw new Error("Failed to grade exam");
          }

          const responseData = await response.json();
          result = responseData.data || responseData;
        } else {
          // Fallback to legacy API
          result = await quizLearnerApi.gradeExam({
            licenseType,
            answers,
            questionIds,
          });
        }

        console.log("📦 Grading result from backend:", result);
        const normalizedResult = normalizeGradingResult(result, userAnswers, questions);
        console.log("✅ Normalized result with wrong_answers:", normalizedResult);
        setGradingResult(normalizedResult);
        return normalizedResult;
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể chấm điểm bài thi.";
        setError(message);
        setGradingResult(null);
        return null;
      } finally {
        setIsGrading(false);
      }
    },
    [licenseType, examsSource],
  );

  const resetGrading = useCallback(() => {
    setGradingResult(null);
    setError(null);
  }, []);

  return {
    gradingResult,
    isGrading,
    error,
    submitExam,
    resetGrading,
  };
};

export default useQuizGrading;
