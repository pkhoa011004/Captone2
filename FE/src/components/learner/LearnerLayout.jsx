import { Outlet, useLocation } from "react-router-dom";
import TopHeaderLearner from "../TopHeaderLearner";

export function LearnerLayout() {
  const location = useLocation();
  const isQuizPage = location.pathname === "/learner/quiz";

  return (
    <div
      className={`bg-[#f5f8ff] ${
        isQuizPage ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      <TopHeaderLearner />
      <main
        className={`mx-auto w-full max-w-360 px-4 md:px-8 ${
          isQuizPage
            ? "h-[calc(100vh-5rem)] py-0 overflow-hidden"
            : "py-8 md:py-10"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
