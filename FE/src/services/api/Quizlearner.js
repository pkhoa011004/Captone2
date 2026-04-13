import apiInstance from "./index";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api(?:\/v\d+)?\/?$/i, "");

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

const normalizeQuestion = (question) => ({
  id: Number(question?.id ?? question?.question_id),
  questionText: question?.question_text ?? "",
  image: resolveQuestionImageUrl(question?.image),
  isFatal: Boolean(question?.is_fatal),
  explanation: question?.explanation ?? null,
  correctAnswer: Number(
    question?.correct_answer ??
    question?.correctAnswer ??
    question?.correct_option ??
    0
  ),
  options: Array.isArray(question?.options)
    ? question.options
        .map((option) => ({
          optionId: Number(option?.option_id),
          optionText: option?.option_text ?? "",
        }))
        .filter((option) => Number.isFinite(option.optionId))
    : [],
});

const getQuestions = async ({
  licenseType = "A1",
  includeAnswer = false,
} = {}) => {
  const response = await apiInstance.get("/questions", {
    params: {
      licenseType,
      includeAnswer,
    },
  });

  const data = Array.isArray(response?.data?.data) ? response.data.data : [];
  return data.map(normalizeQuestion);
};

const gradeExam = async ({
  licenseType = "A1",
  answers = [],
  questionIds = [],
  passThreshold,
} = {}) => {
  const payload = {
    licenseType,
    answers,
    question_ids: questionIds,
  };

  if (typeof passThreshold === "number") {
    payload.pass_threshold = passThreshold;
  }

  const response = await apiInstance.post("/questions/grade", payload);
  return response?.data?.data ?? null;
};

export const quizLearnerApi = {
  getQuestions,
  gradeExam,
};

export default quizLearnerApi;
