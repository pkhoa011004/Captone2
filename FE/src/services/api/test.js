import apiInstance from "./index.js";

async function testAPIs() {
  console.log("Testing API endpoints...");

  try {
    console.log("\n1. Testing GET /exams/summary");
    const summaryResponse = await apiInstance.get("/exams/summary");
    console.log("✅ Summary response:", summaryResponse.data);
  } catch (error) {
    console.error("❌ Summary error:", error.message, error.response?.data);
  }

  try {
    console.log("\n2. Testing GET /exams?page=1&limit=10");
    const examsResponse = await apiInstance.get("/exams", {
      params: { page: 1, limit: 10 },
    });
    console.log("✅ Exams response:", examsResponse.data);
  } catch (error) {
    console.error("❌ Exams error:", error.message, error.response?.data);
  }
}

export default testAPIs;
