import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Filter,
  Plus,
  Search,
  UserCheck,
  UserCircle2,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";
import { adminUsersApi } from "../../services/api/AdminUsers";

const PAGE_SIZE = 10;

const EMPTY_SUMMARY = {
  totalUsers: null,
  newThisMonth: null,
  newLastMonth: null,
  activeNow: null,
  activeRatioPercent: null,
  suspended: null,
  newThisMonthGrowthPercent: null,
};

const EMPTY_PAGINATION = {
  page: 1,
  limit: PAGE_SIZE,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const STATUS_FILTER_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "Active" },
  { label: "Offline", value: "Offline" },
  { label: "Suspended", value: "Suspended" },
];

const ROLE_FILTER_OPTIONS = [
  { label: "All Roles", value: "" },
  { label: "Learner", value: "learner" },
  { label: "Instructor", value: "instructor" },
];

const LICENSE_FILTER_OPTIONS = [
  { label: "All Licenses", value: "" },
  { label: "A1", value: "A1" },
  { label: "B1", value: "B1" },
];

const ADD_USER_ROLE_OPTIONS = [
  { label: "Learner", value: "learner" },
  { label: "Instructor", value: "instructor" },
];

const INITIAL_ADD_USER_FORM = {
  name: "",
  email: "",
  password: "",
  phone: "",
  licenseType: "A1",
  role: "learner",
};

const EMPTY_CONFIRM_DIALOG = {
  isOpen: false,
  actionType: "",
  user: null,
  nextStatus: "",
};

const EMPTY_USER_DETAIL = {
  id: null,
  name: null,
  email: null,
  phone: null,
  role: null,
  roleId: null,
  licenseType: null,
  status: null,
  isActive: null,
  emailVerified: null,
  registeredAt: null,
  updatedAt: null,
  lastLogin: null,
};

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-700",
  Offline: "bg-amber-100 text-amber-700",
  Suspended: "bg-rose-100 text-rose-700",
  Unknown: "bg-slate-200 text-slate-600",
};

const integerFormatter = new Intl.NumberFormat("en-US");

const formatInteger = (value) => {
  if (value === null || value === undefined) return "--";
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "--";
  return integerFormatter.format(numericValue);
};

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const validationErrors = error?.response?.data?.errors;
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors[0];
  }

  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const buildVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
};

export function AdminUserManagement() {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [actionState, setActionState] = useState({ userId: null, actionType: "" });
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [addUserForm, setAddUserForm] = useState(INITIAL_ADD_USER_FORM);
  const [addUserError, setAddUserError] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isAddUserPasswordVisible, setIsAddUserPasswordVisible] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(EMPTY_CONFIRM_DIALOG);
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isUserDetailLoading, setIsUserDetailLoading] = useState(false);
  const [userDetail, setUserDetail] = useState(EMPTY_USER_DETAIL);
  const [userDetailError, setUserDetailError] = useState("");

  const currentUserId = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return null;

      const parsedUser = JSON.parse(rawUser);
      const numericId = Number(parsedUser?.id);
      return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
    } catch (_error) {
      return null;
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await adminUsersApi.getUserManagementData({
          search: searchText,
          status: statusFilter,
          role: roleFilter,
          licenseType: licenseFilter,
          page: currentPage,
          limit: PAGE_SIZE,
        });

        if (!isActive) return;

        const normalizedUsers = Array.isArray(data.users)
          ? data.users.filter((user) => String(user?.role || "").toLowerCase() !== "admin")
          : [];

        setSummary(data.summary || EMPTY_SUMMARY);
        setPagination(data.pagination || EMPTY_PAGINATION);
        setUsers(normalizedUsers);

        if (data?.pagination?.page && data.pagination.page !== currentPage) {
          setCurrentPage(data.pagination.page);
        }
      } catch (apiError) {
        if (!isActive) return;

        setSummary(EMPTY_SUMMARY);
        setPagination(EMPTY_PAGINATION);
        setUsers([]);
        setError(getApiErrorMessage(apiError, "Failed to load user management data."));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [searchText, statusFilter, roleFilter, licenseFilter, currentPage, refreshSeed]);

  const summaryCards = useMemo(() => {
    return [
      {
        label: "TOTAL USERS",
        value: formatInteger(summary.totalUsers),
        icon: Users,
        iconClass: "bg-blue-100 text-blue-600",
        valueClass: "text-slate-900",
      },
      {
        label: "NEW THIS MONTH",
        value: formatInteger(summary.newThisMonth),
        icon: UserPlus,
        iconClass: "bg-emerald-100 text-emerald-600",
        valueClass: "text-slate-900",
      },
      {
        label: "ACTIVE NOW",
        value: formatInteger(summary.activeNow),
        icon: UserCheck,
        iconClass: "bg-cyan-100 text-cyan-600",
        valueClass: "text-slate-900",
      },
      {
        label: "SUSPENDED",
        value: formatInteger(summary.suspended),
        icon: UserX,
        iconClass: "bg-rose-100 text-rose-600",
        valueClass: "text-rose-600",
      },
    ];
  }, [
    summary.totalUsers,
    summary.newThisMonth,
    summary.activeNow,
    summary.suspended,
  ]);

  const totalItems = pagination.totalItems ?? 0;
  const startRow = totalItems === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endRow = totalItems === 0 ? 0 : Math.min(pagination.page * pagination.limit, totalItems);
  const visiblePages = buildVisiblePages(pagination.page, pagination.totalPages || 1);

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleLicenseFilterChange = (event) => {
    setLicenseFilter(event.target.value);
    setCurrentPage(1);
  };

  const openAddUserModal = () => {
    setAddUserForm(INITIAL_ADD_USER_FORM);
    setAddUserError("");
    setIsAddUserPasswordVisible(false);
    setIsAddUserModalOpen(true);
  };

  const closeAddUserModal = () => {
    if (isCreatingUser) return;
    setIsAddUserModalOpen(false);
    setAddUserError("");
    setIsAddUserPasswordVisible(false);
  };

  const handleAddUserInputChange = (event) => {
    const field = event.target.dataset.field || event.target.name;
    const value = event.target.value;

    setAddUserForm((previous) => ({
      ...previous,
      ...(field === "role"
        ? {
            role: String(value || "").toLowerCase(),
            licenseType:
              String(value || "").toLowerCase() === "instructor"
                ? "A1"
                : previous.licenseType || "A1",
          }
        : { [field]: value }),
    }));
  };

  const closeConfirmDialog = () => {
    if (isConfirmSubmitting) return;
    setConfirmDialog(EMPTY_CONFIRM_DIALOG);
  };

  const closeUserDetailModal = () => {
    if (isUserDetailLoading) return;
    setIsUserDetailOpen(false);
    setUserDetail(EMPTY_USER_DETAIL);
    setUserDetailError("");
  };

  const handleOpenUserDetail = async (user) => {
    const userId = Number(user?.id);
    if (!Number.isInteger(userId) || userId <= 0) return;

    setIsUserDetailOpen(true);
    setIsUserDetailLoading(true);
    setUserDetail(EMPTY_USER_DETAIL);
    setUserDetailError("");

    try {
      const detail = await adminUsersApi.getUserDetail(userId);
      setUserDetail(detail || EMPTY_USER_DETAIL);
    } catch (apiError) {
      setUserDetailError(getApiErrorMessage(apiError, "Failed to load user detail."));
    } finally {
      setIsUserDetailLoading(false);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setAddUserError("");
    setSuccessMessage("");

    const trimmedName = String(addUserForm.name || "").trim();
    const trimmedEmail = String(addUserForm.email || "").trim();
    const password = String(addUserForm.password || "");

    if (!trimmedName || !trimmedEmail || !password) {
      setAddUserError("Name, email, and password are required.");
      return;
    }

    if (password.length < 6) {
      setAddUserError("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsCreatingUser(true);
      await adminUsersApi.createUser({
        ...addUserForm,
        name: trimmedName,
        email: trimmedEmail,
      });

      setError("");
      setIsAddUserModalOpen(false);
      setAddUserForm(INITIAL_ADD_USER_FORM);
      setIsAddUserPasswordVisible(false);
      setCurrentPage(1);
      setRefreshSeed((value) => value + 1);
      setSuccessMessage("User has been added successfully.");
    } catch (apiError) {
      setAddUserError(getApiErrorMessage(apiError, "Failed to create user."));
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleToggleUserStatus = (user) => {
    if (!user?.id) return;

    const currentStatus = user.status || "Active";
    const nextStatus = currentStatus === "Suspended" ? "Active" : "Suspended";
    const isSelf = currentUserId !== null && Number(user.id) === currentUserId;

    if (isSelf && nextStatus === "Suspended") {
      setError("You cannot suspend your own account.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setConfirmDialog({
      isOpen: true,
      actionType: "status",
      user,
      nextStatus,
    });
  };

  const handleDeleteUser = (user) => {
    if (!user?.id) return;

    const isSelf = currentUserId !== null && Number(user.id) === currentUserId;
    if (isSelf) {
      setError("You cannot delete your own account.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setConfirmDialog({
      isOpen: true,
      actionType: "delete",
      user,
      nextStatus: "",
    });
  };

  const handleConfirmAction = async () => {
    const targetUser = confirmDialog.user;
    if (!targetUser?.id) {
      setConfirmDialog(EMPTY_CONFIRM_DIALOG);
      return;
    }

    const actionType = confirmDialog.actionType;
    try {
      setIsConfirmSubmitting(true);
      setActionState({ userId: targetUser.id, actionType });
      setError("");
      setSuccessMessage("");

      if (actionType === "status") {
        await adminUsersApi.updateUserStatus({
          userId: targetUser.id,
          status: confirmDialog.nextStatus,
        });
        setRefreshSeed((value) => value + 1);
        setSuccessMessage(`User status updated to ${confirmDialog.nextStatus}.`);
      }

      if (actionType === "delete") {
        await adminUsersApi.deleteUser(targetUser.id);
        const nextPage = users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        setCurrentPage(nextPage);
        setRefreshSeed((value) => value + 1);
        setSuccessMessage("User deleted successfully.");
      }

      setConfirmDialog(EMPTY_CONFIRM_DIALOG);
    } catch (apiError) {
      const fallbackMessage =
        actionType === "status"
          ? "Failed to update user status."
          : "Failed to delete user.";
      setError(getApiErrorMessage(apiError, fallbackMessage));
    } finally {
      setIsConfirmSubmitting(false);
      setActionState({ userId: null, actionType: "" });
    }
  };

  const isInstructorRole = String(addUserForm.role || "").toLowerCase() === "instructor";
  const confirmTargetLabel =
    confirmDialog.user?.name ||
    confirmDialog.user?.email ||
    (confirmDialog.user?.id ? `user #${confirmDialog.user.id}` : "this user");
  const userDetailTitleValue =
    userDetail.name ||
    userDetail.email ||
    (userDetail.id ? `#${userDetail.id}` : null);
  const userDetailTitle = userDetailTitleValue
    ? `User: ${userDetailTitleValue}`
    : "User Detail";

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            User Management
          </h1>
        </div>

        <button
          type="button"
          onClick={openAddUserModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-xl border border-blue-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] min-h-[140px]">
            <div className="mb-7">
              <span
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${card.iconClass}`}
              >
                <card.icon className="h-6 w-6" />
              </span>
            </div>

            <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">
              {card.label}
            </p>
            <p className={`mt-2 text-3xl font-extrabold ${card.valueClass}`}>{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Search users by name or email..."
              className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50/70 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="h-10 rounded-lg border border-blue-100 bg-blue-50 pl-8 pr-8 text-sm font-semibold text-slate-600 outline-none transition hover:bg-blue-100"
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value || "all-status"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="h-10 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-slate-600 outline-none transition hover:bg-blue-100"
            >
              {ROLE_FILTER_OPTIONS.map((option) => (
                <option key={option.value || "all-role"} value={option.value}>
                  {option.label}
                </option>
                ))}
              </select>

            <select
              value={licenseFilter}
              onChange={handleLicenseFilterChange}
              className="h-10 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-slate-600 outline-none transition hover:bg-blue-100"
            >
              {LICENSE_FILTER_OPTIONS.map((option) => (
                <option key={option.value || "all-license"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold tracking-[0.14em] text-slate-500">
                <th className="px-2 py-3">USERNAME</th>
                <th className="px-2 py-3">ROLE</th>
                <th className="px-2 py-3">LICENSE</th>
                <th className="px-2 py-3">REG. DATE</th>
                <th className="px-2 py-3">STATUS</th>
                <th className="px-2 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center text-sm text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : null}

              {!isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center text-sm text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? users.map((user) => {
                    const statusKey = user.status || "Unknown";
                    const statusClass = statusStyles[statusKey] || statusStyles.Unknown;
                    const userId = Number(user.id);
                    const isValidUserId = Number.isInteger(userId) && userId > 0;
                    const isSelf = currentUserId !== null && userId === currentUserId;
                    const nextStatus = statusKey === "Suspended" ? "Active" : "Suspended";
                    const isActionLoading = actionState.userId === user.id;

                    return (
                      <tr
                        key={isValidUserId ? userId : user.email || `${user.name}-${user.role}`}
                        className="border-b border-slate-100"
                      >
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                              <UserCircle2 className="h-4 w-4" />
                            </span>
                            <div>
                              <button
                                type="button"
                                onClick={() => handleOpenUserDetail(user)}
                                className="text-sm font-semibold text-slate-800 transition hover:text-blue-600"
                                disabled={!isValidUserId}
                              >
                                {user.name || "--"}
                              </button>
                              <p className="text-[11px] text-slate-500">{user.email || "--"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-xs font-semibold text-slate-600">
                          {user.role || "--"}
                          {isSelf ? <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">You</span> : null}
                        </td>
                        <td className="px-2 py-3 text-xs font-semibold text-slate-600">
                          {user.licenseType || "--"}
                        </td>
                        <td className="px-2 py-3 text-xs text-slate-500">{formatDate(user.registeredAt)}</td>
                        <td className="px-2 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
                          >
                            {statusKey}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(user)}
                              disabled={!isValidUserId || isActionLoading || (isSelf && nextStatus === "Suspended")}
                              className="rounded-md border border-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                              title={isSelf && nextStatus === "Suspended" ? "You cannot suspend your own account" : undefined}
                            >
                              {isActionLoading && actionState.actionType === "status"
                                ? "Updating..."
                                : nextStatus}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              disabled={!isValidUserId || isActionLoading || isSelf}
                              className="rounded-md border border-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                              title={isSelf ? "You cannot delete your own account" : undefined}
                            >
                              {isActionLoading && actionState.actionType === "delete"
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Showing {startRow} to {endRow} of {formatInteger(totalItems)} results
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={!pagination.hasPreviousPage || isLoading}
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {visiblePages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setCurrentPage(pageNumber)}
                disabled={isLoading}
                className={`h-7 w-7 rounded-md text-xs font-semibold transition ${
                  pageNumber === pagination.page
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-blue-50 hover:text-slate-800"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {isUserDetailOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.22)] md:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <UserCircle2 className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">{userDetailTitle}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={closeUserDetailModal}
                disabled={isUserDetailLoading}
                className="rounded-md px-2 py-1 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </div>

            {isUserDetailLoading ? (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-8 text-center text-sm text-slate-600">
                Loading user detail...
              </div>
            ) : userDetailError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {userDetailError}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">ID</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{userDetail.id ?? "--"}</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Email</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{userDetail.email || "--"}</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Phone</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{userDetail.phone || "--"}</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Role</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{userDetail.role || "--"}</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">License</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{userDetail.licenseType || "--"}</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Status</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{userDetail.status || "--"}</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Registered At</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{formatDateTime(userDetail.registeredAt)}</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Updated At</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{formatDateTime(userDetail.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {isAddUserModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_15px_40px_rgba(15,23,42,0.2)] md:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add New User</h2>
              </div>
              <button
                type="button"
                onClick={closeAddUserModal}
                className="rounded-md px-2 py-1 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateUser} autoComplete="off">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Full Name
                  </span>
                  <input
                    type="text"
                    name="add-user-name"
                    data-field="name"
                    value={addUserForm.name}
                    onChange={handleAddUserInputChange}
                    placeholder="enter full username"
                    className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50/70 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
                    autoComplete="off"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Email
                  </span>
                  <input
                    type="email"
                    name="add-user-email"
                    data-field="email"
                    value={addUserForm.email}
                    onChange={handleAddUserInputChange}
                    placeholder="Enter email"
                    className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50/70 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
                    autoComplete="new-email"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Password
                  </span>
                  <div className="relative">
                    <input
                      type={isAddUserPasswordVisible ? "text" : "password"}
                      name="add-user-password"
                      data-field="password"
                      value={addUserForm.password}
                      onChange={handleAddUserInputChange}
                      placeholder="Min 6 characters"
                      minLength={6}
                      className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50/70 px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setIsAddUserPasswordVisible((value) => !value)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label={isAddUserPasswordVisible ? "Hide password" : "Show password"}
                    >
                      {isAddUserPasswordVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Phone
                  </span>
                  <input
                    type="text"
                    name="phone"
                    data-field="phone"
                    value={addUserForm.phone}
                    onChange={handleAddUserInputChange}
                    placeholder="enter phone"
                    className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50/70 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
                    autoComplete="off"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    License
                  </span>
                  {isInstructorRole ? (
                    <input
                      type="text"
                      value="Not required for instructor"
                      disabled
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-500 outline-none"
                    />
                  ) : (
                    <select
                      name="licenseType"
                      data-field="licenseType"
                      value={addUserForm.licenseType}
                      onChange={handleAddUserInputChange}
                      className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-blue-100"
                    >
                      <option value="A1">A1</option>
                      <option value="B1">B1</option>
                    </select>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Role
                  </span>
                  <select
                    name="role"
                    data-field="role"
                    value={addUserForm.role}
                    onChange={handleAddUserInputChange}
                    className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-blue-100"
                  >
                    {ADD_USER_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {addUserError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {addUserError}
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeAddUserModal}
                  disabled={isCreatingUser}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreatingUser ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {confirmDialog.isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.22)] md:p-6">
            <h3 className="text-lg font-bold text-slate-900">
              {confirmDialog.actionType === "delete" ? "Delete User" : "Confirm Status Change"}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {confirmDialog.actionType === "delete"
                ? `Delete ${confirmTargetLabel}? This action cannot be undone.`
                : `Change status of ${confirmTargetLabel} to ${confirmDialog.nextStatus}?`}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirmDialog}
                disabled={isConfirmSubmitting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isConfirmSubmitting}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  confirmDialog.actionType === "delete"
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {isConfirmSubmitting
                  ? "Processing..."
                  : confirmDialog.actionType === "delete"
                    ? "Delete User"
                    : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
