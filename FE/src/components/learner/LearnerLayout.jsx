import { Outlet } from "react-router-dom";
import TopHeaderLearner from "../TopHeaderLearner";

export function LearnerLayout() {
  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <TopHeaderLearner />
      <main className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
