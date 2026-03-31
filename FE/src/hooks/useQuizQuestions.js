import { useCallback, useEffect, useState } from "react";
import { quizLearnerApi } from "@/services/api/Quizlearner";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";
const BACKEND_ORIGIN = (API_BASE_URL || "http://localhost:5000").replace(
  /\/api(?:\/v\d+)?\/?$/i,
  "",
);

const resolveQuestionImageUrl = (imagePath) => {
  if (!imagePath) return null;

  const rawPath = String(imagePath).trim();
  if (!rawPath) return null;

  if (/^https?:\/\//i.test(rawPath)) {
    return rawPath;
  }

  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  return `${BACKEND_ORIGIN}${normalizedPath}`;
};

const normalizeExamQuestion = (question) => {
  const normalizedOptions = Array.isArray(question?.options)
    ? question.options
        .map((option, index) => ({
          optionId: Number(option?.optionId ?? option?.option_id ?? index + 1),
          optionText: option?.optionText ?? option?.option_text ?? "",
        }))
        .filter(
          (option) => Number.isFinite(option.optionId) && option.optionText,
        )
    : [];

  return {
    ...question,
    id: Number(question?.id ?? question?.question_id),
    questionText: question?.questionText ?? question?.question_text ?? "",
    isFatal: Boolean(question?.isFatal ?? question?.is_fatal),
    image: resolveQuestionImageUrl(question?.image),
    options: normalizedOptions,
  };
};

const shuffleArray = (items = []) => {
  const copied = [...items];

  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
};

const A1_STRUCTURE = {
  REGULATIONS: 8,
  TRAFFIC_CULTURE: 1,
  DRIVING_TECHNIQUE: 1,
  TRAFFIC_SIGNS: 9,
  SITUATION_HANDLING: 6,
};

const B1_STRUCTURE = {
  REGULATIONS: 9,
  TRAFFIC_CULTURE: 1,
  DRIVING_TECHNIQUE: 1,
  VEHICLE_REPAIR: 1,
  TRAFFIC_SIGNS: 9,
  SITUATION_HANDLING: 9,
};

const inferCategoryA1 = (questionId) => {
  if (questionId >= 1 && questionId <= 80) return "REGULATIONS";
  if (questionId >= 81 && questionId <= 90) return "TRAFFIC_CULTURE";
  if (questionId >= 91 && questionId <= 100) return "DRIVING_TECHNIQUE";
  if (questionId >= 101 && questionId <= 180) return "TRAFFIC_SIGNS";
  if (questionId >= 181 && questionId <= 250) return "SITUATION_HANDLING";
  return "OTHER";
};

const inferCategoryB1 = (questionId) => {
  const baseId = Number(questionId) - 255;

  if (
    (baseId >= 1 && baseId <= 178) ||
    (baseId >= 179 && baseId <= 181) ||
    (baseId >= 201 && baseId <= 205)
  ) {
    return "REGULATIONS";
  }
  if (baseId >= 182 && baseId <= 200) return "TRAFFIC_CULTURE";
  if (baseId >= 206 && baseId <= 261) return "DRIVING_TECHNIQUE";
  if (baseId >= 262 && baseId <= 302) return "VEHICLE_REPAIR";
  if (baseId >= 303 && baseId <= 478) return "TRAFFIC_SIGNS";
  if (baseId >= 486 && baseId <= 600) return "SITUATION_HANDLING";

  return "OTHER";
};

const inferCategory = (question, licenseType) => {
  const id = Number(question?.id);
  if (!Number.isFinite(id)) return "OTHER";

  if (licenseType === "B1") {
    return inferCategoryB1(id);
  }

  return inferCategoryA1(id);
};

const pickQuestionsByCategory = (questions, category, count, usedIds) => {
  if (count <= 0) return [];

  const pool = shuffleArray(
    questions.filter(
      (question) =>
        !usedIds.has(question.id) && question.categoryInferred === category,
    ),
  );

  const picked = pool.slice(0, count);
  picked.forEach((item) => usedIds.add(item.id));
  return picked;
};

const ensureAtLeastOneFatal = (questions, fullPool) => {
  if (!questions.length) return questions;
  if (questions.some((question) => question.isFatal)) return questions;

  const fatalCandidate = shuffleArray(
    fullPool.filter((question) => question.isFatal),
  )[0];

  if (!fatalCandidate) return questions;

  const replaceIndex = questions.findIndex((question) => !question.isFatal);
  if (replaceIndex < 0) return questions;

  const replaced = [...questions];
  replaced[replaceIndex] = fatalCandidate;

  const uniqueById = [];
  const seen = new Set();
  for (const item of replaced) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    uniqueById.push(item);
  }

  return uniqueById;
};

const pickStructuredQuestions = ({
  validQuestions,
  licenseType,
  questionCount,
}) => {
  const expectedCount = licenseType === "B1" ? 30 : 25;
  const structure = licenseType === "B1" ? B1_STRUCTURE : A1_STRUCTURE;

  if (Number(questionCount) !== expectedCount) {
    return shuffleArray(validQuestions).slice(0, questionCount);
  }

  const enriched = validQuestions.map((question) => ({
    ...question,
    categoryInferred: inferCategory(question, licenseType),
  }));

  const usedIds = new Set();
  const selected = [];

  Object.entries(structure).forEach(([category, count]) => {
    const bucket = pickQuestionsByCategory(enriched, category, count, usedIds);
    selected.push(...bucket);
  });

  // Use OTHER bucket as secondary fallback for under-classified datasets.
  const remainingAfterPrimary = expectedCount - selected.length;
  if (remainingAfterPrimary > 0) {
    const otherBucket = shuffleArray(
      enriched.filter(
        (question) =>
          !usedIds.has(question.id) && question.categoryInferred === "OTHER",
      ),
    ).slice(0, remainingAfterPrimary);

    otherBucket.forEach((item) => usedIds.add(item.id));
    selected.push(...otherBucket);
  }

  const remaining = expectedCount - selected.length;
  if (remaining > 0) {
    const fallback = shuffleArray(
      enriched.filter((question) => !usedIds.has(question.id)),
    ).slice(0, remaining);

    fallback.forEach((item) => usedIds.add(item.id));
    selected.push(...fallback);
  }

  const withFatal = ensureAtLeastOneFatal(selected, enriched);
  return shuffleArray(withFatal).slice(0, expectedCount);
};

export const useQuizQuestions = ({
  licenseType = "A1",
  questionCount = 25,
  generationMode = "structured",
  examsSource = "exam_250",
  selectedCategories = [],
} = {}) => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let data;

      // Use new API for exam_250 and exam_600
      if (examsSource === "exam_250") {
        const params = new URLSearchParams({ licenseType });
        if (Array.isArray(selectedCategories) && selectedCategories.length) {
          params.set("categories", selectedCategories.join(","));
        }
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/v1/exams/250?${params.toString()}`,
        );
        if (!response.ok) throw new Error("Failed to fetch exam_250");
        const result = await response.json();
        data = result.data || result;
      } else if (examsSource === "exam_600") {
        const params = new URLSearchParams({ licenseType });
        if (Array.isArray(selectedCategories) && selectedCategories.length) {
          params.set("categories", selectedCategories.join(","));
        }
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/v1/exams/600?${params.toString()}`,
        );
        if (!response.ok) throw new Error("Failed to fetch exam_600");
        const result = await response.json();
        data = result.data || result;
      } else {
        // Fallback to legacy API
        data = await quizLearnerApi.getQuestions({
          licenseType,
          includeAnswer: false,
        });
      }

      // Handle API response format
      const questions_array = data?.questions || data || [];
      const normalizedQuestions = questions_array.map(normalizeExamQuestion);
      const validQuestions = normalizedQuestions.filter(
        (item) =>
          item.questionText &&
          Array.isArray(item.options) &&
          item.options.length >= 2,
      );

      // If examsSource is provided, questions are already structured from backend
      if (
        examsSource &&
        (examsSource === "exam_250" || examsSource === "exam_600")
      ) {
        setQuestions(validQuestions);
      } else {
        // Legacy structured picking for backward compatibility
        const selectedQuestions =
          generationMode === "structured"
            ? pickStructuredQuestions({
                validQuestions,
                licenseType,
                questionCount,
              })
            : typeof questionCount === "number" && questionCount > 0
              ? shuffleArray(validQuestions).slice(0, questionCount)
              : validQuestions;

        setQuestions(selectedQuestions);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách câu hỏi.";
      setError(message);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    licenseType,
    questionCount,
    generationMode,
    examsSource,
    JSON.stringify(selectedCategories),
  ]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    isLoading,
    error,
    refetch: fetchQuestions,
  };
};

export default useQuizQuestions;
