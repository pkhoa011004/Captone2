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
  totalUsers: normalizeNumber(summary.totalUsers),
  newThisMonth: normalizeNumber(summary.newThisMonth),
  newLastMonth: normalizeNumber(summary.newLastMonth),
  activeNow: normalizeNumber(summary.activeNow),
  activeRatioPercent: normalizeNumber(summary.activeRatioPercent),
  suspended: normalizeNumber(summary.suspended),
  newThisMonthGrowthPercent: normalizeNumber(summary.newThisMonthGrowthPercent),
});

const normalizeUser = (user = {}) => ({
  id: normalizeNumber(user.id),
  name: user.name ?? null,
  email: user.email ?? null,
  phone: user.phone ?? null,
  role: user.role ?? null,
  roleId: normalizeNumber(user.roleId),
  licenseType: user.licenseType ?? null,
  registeredAt: user.registeredAt ?? null,
  lastLogin: user.lastLogin ?? null,
  status: user.status ?? null,
});

const normalizeUserDetail = (user = {}) => ({
  id: normalizeNumber(user.id),
  name: user.name ?? null,
  email: user.email ?? null,
  phone: user.phone ?? null,
  role: user.role ?? null,
  roleId: normalizeNumber(user.roleId),
  licenseType: user.licenseType ?? null,
  status: user.status ?? null,
  isActive:
    typeof user.isActive === "boolean"
      ? user.isActive
      : user.isActive === null || user.isActive === undefined
        ? null
        : Boolean(user.isActive),
  emailVerified:
    typeof user.emailVerified === "boolean"
      ? user.emailVerified
      : user.emailVerified === null || user.emailVerified === undefined
        ? null
        : Boolean(user.emailVerified),
  registeredAt: user.registeredAt ?? null,
  updatedAt: user.updatedAt ?? null,
  lastLogin: user.lastLogin ?? null,
});

const normalizePagination = (pagination = {}) => ({
  page: normalizeNumber(pagination.page) || DEFAULT_PAGINATION.page,
  limit: normalizeNumber(pagination.limit) || DEFAULT_PAGINATION.limit,
  totalItems: normalizeNumber(pagination.totalItems) || DEFAULT_PAGINATION.totalItems,
  totalPages: normalizeNumber(pagination.totalPages) || DEFAULT_PAGINATION.totalPages,
  hasNextPage: Boolean(pagination.hasNextPage),
  hasPreviousPage: Boolean(pagination.hasPreviousPage),
});

const getUserManagementData = async ({
  search = "",
  status = "",
  role = "",
  licenseType = "",
  page = 1,
  limit = 10,
} = {}) => {
  const params = {};
  const normalizedSearch = String(search || "").trim();
  const normalizedStatus = String(status || "").trim();
  const normalizedRole = String(role || "").trim();
  const normalizedLicenseType = String(licenseType || "").trim().toUpperCase();

  if (normalizedSearch) {
    params.search = normalizedSearch;
  }
  if (normalizedStatus) {
    params.status = normalizedStatus;
  }
  if (normalizedRole) {
    params.role = normalizedRole;
  }
  if (normalizedLicenseType) {
    params.licenseType = normalizedLicenseType;
  }
  if (Number.isInteger(Number(page)) && Number(page) > 0) {
    params.page = Number(page);
  }
  if (Number.isInteger(Number(limit)) && Number(limit) > 0) {
    params.limit = Number(limit);
  }

  const response = await apiInstance.get("/users/admin/user-management", {
    params,
  });

  const payload = response?.data?.data ?? {};
  const users = Array.isArray(payload.users) ? payload.users : [];

  return {
    summary: normalizeSummary(payload.summary),
    pagination: normalizePagination(payload.pagination),
    users: users.map(normalizeUser),
  };
};

const getUserDetail = async (userId) => {
  const normalizedUserId = Number(userId);
  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw new Error("Invalid user id.");
  }

  const response = await apiInstance.get(`/users/admin/${normalizedUserId}/detail`);
  return normalizeUserDetail(response?.data?.data ?? {});
};

const updateUserStatus = async ({ userId, status }) => {
  const normalizedUserId = Number(userId);
  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw new Error("Invalid user id.");
  }

  const normalizedStatus = String(status || "").trim();
  if (!normalizedStatus) {
    throw new Error("Status is required.");
  }

  const response = await apiInstance.patch(`/users/admin/${normalizedUserId}/status`, {
    status: normalizedStatus,
  });

  return response?.data?.data ?? null;
};

const deleteUser = async (userId) => {
  const normalizedUserId = Number(userId);
  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw new Error("Invalid user id.");
  }

  const response = await apiInstance.delete(`/users/${normalizedUserId}`);
  return response?.data?.data ?? null;
};

const createUser = async ({
  name,
  email,
  password,
  phone = "",
  licenseType = "A1",
  role = "learner",
} = {}) => {
  const payload = {
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    password: String(password || ""),
    phone: String(phone || "").trim(),
    licenseType: String(licenseType || "A1").trim(),
    role: String(role || "learner").trim().toLowerCase(),
  };

  const response = await apiInstance.post("/users/admin", payload);
  return response?.data?.data ?? null;
};

export const adminUsersApi = {
  getUserManagementData,
  getUserDetail,
  updateUserStatus,
  deleteUser,
  createUser,
};

export default adminUsersApi;
