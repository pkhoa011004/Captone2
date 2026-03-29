import { Outlet } from "react-router-dom";
import { AdminFooter } from "./AdminFooter";
import { AdminHeader } from "./AdminHeader";

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f8ff]">
      <AdminHeader />
      <main className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-8 md:py-10">
        <Outlet />
      </main>
      <AdminFooter />
    </div>
  );
}
