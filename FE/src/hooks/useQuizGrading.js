import { useCallback, useState } from "react";
import { quizLearnerApi } from "@/services/api/Quizlearner";

const normalizeGradingResult = (result) => {
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

  return {
    ...result,
    total_questions: totalQuestions,
    correct_count: correctCount,
    pass_threshold: passThreshold,
    score_percent: Number.isFinite(scorePercent) ? scorePercent : 0,
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

        // Use new API for exam_250 and exam_600
        if (examsSource === "exam_250" || examsSource === "exam_600") {
          // Convert answers to userAnswers object format expected by backend
          const userAnswers = {};
          answers.forEach((ans) => {
            userAnswers[ans.question_id] = ans.selected_answer;
          });

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

        const normalizedResult = normalizeGradingResult(result);
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
