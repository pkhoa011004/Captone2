import { Outlet } from "react-router-dom";
import { InstructorHeader } from "./InstructorHeader";

export function InstructorLayout() {
  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <InstructorHeader />
      <main className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
