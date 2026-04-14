import apiInstance from "./index";

const getLearnerSchedule = async () => {
  const response = await apiInstance.get("/learners/schedule");
  return response?.data?.data ?? null;
};

const updateScheduleOverview = async (payload = {}) => {
  const response = await apiInstance.patch(
    "/learners/schedule/overview",
    payload,
  );
  return response?.data?.data ?? null;
};

const createScheduleBooking = async (payload = {}) => {
  const response = await apiInstance.post(
    "/learners/schedule/bookings",
    payload,
  );
  return response?.data?.data ?? null;
};

const createScheduleSession = async (payload = {}) => {
  const response = await apiInstance.post(
    "/learners/schedule/sessions",
    payload,
  );
  return response?.data?.data ?? null;
};

const updateScheduleSession = async (sessionId, payload = {}) => {
  const response = await apiInstance.patch(
    `/learners/schedule/sessions/${sessionId}`,
    payload,
  );
  return response?.data?.data ?? null;
};

const deleteScheduleSession = async (sessionId) => {
  const response = await apiInstance.delete(
    `/learners/schedule/sessions/${sessionId}`,
  );
  return response?.data ?? null;
};

const getScheduleBookings = async () => {
  const response = await apiInstance.get("/learners/schedule/bookings");
  return response?.data?.data ?? [];
};

const updateScheduleBooking = async (bookingId, payload = {}) => {
  const response = await apiInstance.patch(
    `/learners/schedule/bookings/${bookingId}`,
    payload,
  );
  return response?.data?.data ?? null;
};

const deleteScheduleBooking = async (bookingId) => {
  const response = await apiInstance.delete(
    `/learners/schedule/bookings/${bookingId}`,
  );
  return response?.data ?? null;
};

export const learnerScheduleApi = {
  getLearnerSchedule,
  updateScheduleOverview,
  createScheduleBooking,
  createScheduleSession,
  updateScheduleSession,
  deleteScheduleSession,
  getScheduleBookings,
  updateScheduleBooking,
  deleteScheduleBooking,
};

export default learnerScheduleApi;
