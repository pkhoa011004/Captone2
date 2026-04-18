import apiInstance from "./index";

const getLearnerDashboard = async () => {
  const response = await apiInstance.get("/learners/dashboard");
  return response?.data?.data ?? null;
};

const updateLearnerDashboard = async (payload = {}) => {
  const response = await apiInstance.patch("/learners/dashboard", payload);
  return response?.data?.data ?? null;
};

export const learnerDashboardApi = {
  getLearnerDashboard,
  updateLearnerDashboard,
};

export default learnerDashboardApi;
