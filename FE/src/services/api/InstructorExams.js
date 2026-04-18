import apiInstance from "./index";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const normalizeNumber = (value) => {
  if (value === null || value === undefined) return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const normalizeExam = (exam = {}) => ({
  id: exam.id ?? null,
  title: exam.title ?? null,
  licenseType: exam.licenseType ?? null,
  source: exam.source ?? null,
  questionCount: normalizeNumber(exam.questionCount),
  durationMinutes: normalizeNumber(exam.durationMinutes),
  passScore: exam.passScore ?? null,
  passThreshold: normalizeNumber(exam.passThreshold),
  status: exam.status ?? null,
  questionBankTotal: normalizeNumber(exam.questionBankTotal),
  createdAt: exam.createdAt ?? null,
  updatedAt: exam.updatedAt ?? null,
});

const normalizeSummary = (summary = {}) => ({
  totalExams: normalizeNumber(summary.totalExams),
  publishedExams: normalizeNumber(summary.publishedExams),
  draftExams: normalizeNumber(summary.draftExams),
  unavailableExams: normalizeNumber(summary.unavailableExams),
  totalLicenseTypes: normalizeNumber(summary.totalLicenseTypes),
  averageQuestions: normalizeNumber(summary.averageQuestions),
});

const normalizePagination = (pagination = {}) => ({
  page: normalizeNumber(pagination.page) || DEFAULT_PAGINATION.page,
  limit: normalizeNumber(pagination.limit) || DEFAULT_PAGINATION.limit,
  totalItems: normalizeNumber(pagination.totalItems) || DEFAULT_PAGINATION.totalItems,
  totalPages: normalizeNumber(pagination.totalPages) || DEFAULT_PAGINATION.totalPages,
  hasNextPage: Boolean(pagination.hasNextPage),
  hasPreviousPage: Boolean(pagination.hasPreviousPage),
});

const getExamManagementData = async ({
  search = "",
  licenseType = "",
  source = "",
  status = "",
  page = 1,
  limit = 100,
} = {}) => {
  const params = {};
  const normalizedSearch = String(search || "").trim();
  const normalizedLicenseType = String(licenseType || "").trim().toUpperCase();
  const normalizedSource = String(source || "").trim().toLowerCase();
  const normalizedStatus = String(status || "").trim();

  if (normalizedSearch) params.search = normalizedSearch;
  if (normalizedLicenseType) params.licenseType = normalizedLicenseType;
  if (normalizedSource) params.source = normalizedSource;
  if (normalizedStatus) params.status = normalizedStatus;
  if (Number.isInteger(Number(page)) && Number(page) > 0) params.page = Number(page);
  if (Number.isInteger(Number(limit)) && Number(limit) > 0) params.limit = Number(limit);

  const response = await apiInstance.get("/exams/instructor/management", {
    params,
  });

  const payload = response?.data?.data ?? {};
  const exams = Array.isArray(payload.exams) ? payload.exams : [];

  return {
    summary: normalizeSummary(payload.summary),
    pagination: normalizePagination(payload.pagination),
    exams: exams.map(normalizeExam),
  };
};

const createExam = async (payload = {}) => {
  const response = await apiInstance.post("/exams/instructor/create", payload);
  const createdExam = response?.data?.data?.exam ?? null;
  return createdExam ? normalizeExam(createdExam) : null;
};

export const instructorExamsApi = {
  getExamManagementData,
  createExam,
};

export default instructorExamsApi;
