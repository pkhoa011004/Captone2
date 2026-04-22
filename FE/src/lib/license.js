const parseJsonSafe = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const normalizeLicenseType = (value, fallback = "A1") => {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();

  if (normalized === "A1" || normalized === "B1") {
    return normalized;
  }

  return fallback ?? null;
};

const normalizeRole = (value, fallback = "") => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized || fallback;
};

const extractUserLike = (source) => {
  if (!source || typeof source !== "object") return null;

  if (source.user && typeof source.user === "object") {
    return source.user;
  }

  if (source.profile && typeof source.profile === "object") {
    return source.profile;
  }

  if (source.data && typeof source.data === "object") {
    return extractUserLike(source.data) || source.data;
  }

  return source;
};

const readStoredUser = () => {
  if (typeof localStorage === "undefined") return null;

  const keys = ["user", "userInfo", "currentUser", "authUser"];
  for (const key of keys) {
    const parsed = parseJsonSafe(localStorage.getItem(key));
    const extracted = extractUserLike(parsed);
    if (extracted && typeof extracted === "object") {
      return extracted;
    }
  }

  return null;
};

export const getStoredLicenseType = (fallback = "A1") => {
  const userLike = readStoredUser();
  const rawLicense = userLike?.licenseType ?? userLike?.license_type ?? null;
  return normalizeLicenseType(rawLicense, fallback);
};

export const getStoredUserRole = (fallback = "") => {
  const userLike = readStoredUser();
  return normalizeRole(userLike?.role, fallback);
};

export const getExamSourceForLicenseType = (licenseType) =>
  normalizeLicenseType(licenseType) === "B1" ? "exam_600" : "exam_250";
