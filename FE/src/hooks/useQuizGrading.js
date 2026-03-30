import { useCallback, useState } from "react";
import { quizLearnerApi } from "@/services/api/Quizlearner";

export const useQuizGrading = ({ licenseType = "A1" } = {}) => {
  const [gradingResult, setGradingResult] = useState(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState(null);

  const submitExam = useCallback(
    async ({ answers = [], questionIds = [] } = {}) => {
      setIsGrading(true);
      setError(null);

      try {
        const result = await quizLearnerApi.gradeExam({
          licenseType,
          answers,
          questionIds,
        });

        setGradingResult(result);
        return result;
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
    [licenseType],
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
