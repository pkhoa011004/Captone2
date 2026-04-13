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

const normalizeSummary = (summary = {}) => ({
  totalExams: normalizeNumber(summary.totalExams),
  publishedExams: normalizeNumber(summary.publishedExams),
  draftExams: normalizeNumber(summary.draftExams),
  unavailableExams: normalizeNumber(summary.unavailableExams),
  totalLicenseTypes: normalizeNumber(summary.totalLicenseTypes),
  averageQuestions: normalizeNumber(summary.averageQuestions),
});

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

const normalizeCategoryDistribution = (item = {}) => ({
  category: item.category ?? null,
  label: item.label ?? item.category ?? "",
  count: normalizeNumber(item.count) || 0,
  percentage: normalizeNumber(item.percentage) || 0,
});

const normalizeExamDetail = (payload = {}) => ({
  exam: normalizeExam(payload.exam || {}),
  sourceLabel: payload?.exam?.sourceLabel ?? null,
  statusDescription: payload?.exam?.statusDescription ?? null,
  categoryDistribution: Array.isArray(payload.categoryDistribution)
    ? payload.categoryDistribution.map(normalizeCategoryDistribution)
    : [],
  questionCoveragePercent: normalizeNumber(payload.questionCoveragePercent),
  questionBankRemaining: normalizeNumber(payload.questionBankRemaining),
  estimatedSecondsPerQuestion: normalizeNumber(payload.estimatedSecondsPerQuestion),
});

const normalizePagination = (pagination = {}) => ({
  page: normalizeNumber(pagination.page) || DEFAULT_PAGINATION.page,
  limit: normalizeNumber(pagination.limit) || DEFAULT_PAGINATION.limit,
  totalItems: normalizeNumber(pagination.totalItems) || DEFAULT_PAGINATION.totalItems,
  totalPages: normalizeNumber(pagination.totalPages) || DEFAULT_PAGINATION.totalPages,
  hasNextPage: Boolean(pagination.hasNextPage),
  hasPreviousPage: Boolean(pagination.hasPreviousPage),
});

const normalizeFilterOption = (option = {}) => ({
  value: option.value ?? "",
  label: option.label ?? option.value ?? "",
  count: normalizeNumber(option.count) || 0,
});

const normalizeFilters = (filters = {}) => ({
  licenses: Array.isArray(filters.licenses) ? filters.licenses.map(normalizeFilterOption) : [],
  sources: Array.isArray(filters.sources) ? filters.sources.map(normalizeFilterOption) : [],
  statuses: Array.isArray(filters.statuses) ? filters.statuses.map(normalizeFilterOption) : [],
});

const getExamManagementData = async ({
  search = "",
  licenseType = "",
  source = "",
  status = "",
  page = 1,
  limit = 10,
} = {}) => {
  const params = {};
  const normalizedSearch = String(search || "").trim();
  const normalizedLicenseType = String(licenseType || "").trim().toUpperCase();
  const normalizedSource = String(source || "").trim().toLowerCase();
  const normalizedStatus = String(status || "").trim();

  if (normalizedSearch) {
    params.search = normalizedSearch;
  }
  if (normalizedLicenseType) {
    params.licenseType = normalizedLicenseType;
  }
  if (normalizedSource) {
    params.source = normalizedSource;
  }
  if (normalizedStatus) {
    params.status = normalizedStatus;
  }
  if (Number.isInteger(Number(page)) && Number(page) > 0) {
    params.page = Number(page);
  }
  if (Number.isInteger(Number(limit)) && Number(limit) > 0) {
    params.limit = Number(limit);
  }

  const response = await apiInstance.get("/exams/admin/management", {
    params,
  });

  const payload = response?.data?.data ?? {};
  const exams = Array.isArray(payload.exams) ? payload.exams : [];

  return {
    summary: normalizeSummary(payload.summary),
    pagination: normalizePagination(payload.pagination),
    filters: normalizeFilters(payload.filters),
    exams: exams.map(normalizeExam),
  };
};

const getExamManagementDetail = async (examId) => {
  const normalizedExamId = String(examId || "").trim();
  if (!normalizedExamId) {
    throw new Error("Exam ID is required");
  }

  const response = await apiInstance.get(
    `/exams/admin/management/${encodeURIComponent(normalizedExamId)}`,
  );
  const payload = response?.data?.data ?? {};
  return normalizeExamDetail(payload);
};

export const adminExamsApi = {
  getExamManagementData,
  getExamManagementDetail,
};

export default adminExamsApi;
