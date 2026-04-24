import { useEffect, useState } from "react";
import adminExamsApi from "../../services/api/AdminExams";

export function TestAPIPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log("Token in localStorage:", localStorage.getItem("token"));
        
        console.log("1. Fetching summary...");
        const summary = await adminExamsApi.getExamsSummary();
        console.log("✅ Summary:", summary);

        console.log("2. Fetching exams list...");
        const examsList = await adminExamsApi.getExamsListWithStats({ page: 1, limit: 10 });
        console.log("✅ Exams:", examsList);

        setResult({
          summary,
          examsList,
        });
      } catch (err) {
        console.error("❌ Error:", err);
        setError(err.message);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      
      {error && <div className="bg-red-100 p-4 mb-4 text-red-800">{error}</div>}
      
      {result && (
        <div>
          <h2 className="text-xl font-bold mb-2">Summary:</h2>
          <pre className="bg-gray-100 p-4 mb-4 rounded">{JSON.stringify(result.summary, null, 2)}</pre>
          
          <h2 className="text-xl font-bold mb-2">Exams List:</h2>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(result.examsList, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
