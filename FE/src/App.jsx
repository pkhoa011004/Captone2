import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { LandingPage } from "./pages/Home_Login/LandingPage";
import { LoginPage } from "./pages/Home_Login/Login";
import { AdminDashboardPage } from "./pages/Admin/AdminDashboardPage";
import { AdminUserManagement } from "./pages/Admin/AdminUserManagement";
import { AdminExamManagement } from "./pages/Admin/AdminExamManagement";
import { AdminClassrooms } from "./pages/Admin/AdminClassrooms";
import { AdminAnalytics } from "./pages/Admin/AdminAnalytics";
import { AdminSettings } from "./pages/Admin/AdminSettings";
import { DashboardPage } from "./pages/Learner/DashboardPage";
import { InstructorLayout } from "./components/instructor/InstructorLayout";
import { InstructorDashboardPage } from "./pages/Instructor/InstructorDashboardPage";
import { InstructorExercisesPage } from "./pages/Instructor/InstructorExercisesPage";
import { InstructorClassroomsPage } from "./pages/Instructor/InstructorClassroomsPage";
import { InstructorProfilePage } from "./pages/Instructor/InstructorProfilePage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="exams" element={<AdminExamManagement />} />
          <Route path="classrooms" element={<AdminClassrooms />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

        <Route path="/instructor" element={<InstructorLayout />}>
          <Route index element={<InstructorDashboardPage />} />
          <Route path="exercises" element={<InstructorExercisesPage />} />
          <Route path="classrooms" element={<InstructorClassroomsPage />} />
          <Route path="profile" element={<InstructorProfilePage />} />
        </Route>

        <Route path="/layout" element={<Layout />}>
          <Route index element={<div>Home</div>} />
          <Route path="about" element={<div>About</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
