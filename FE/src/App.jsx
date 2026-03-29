import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { LearnerLayout } from "./components/learner/LearnerLayout";
import { LandingPage } from "./pages/Home_Login/LandingPage";
import { LoginPage } from "./pages/Home_Login/Login";
import VerifyEmail from "./pages/Home_Login/VerifyEmail";
import ResendVerification from "./pages/Home_Login/ResendVerification";
import { AdminDashboardPage } from "./pages/Admin/AdminDashboardPage";
import { AdminUserManagement } from "./pages/Admin/AdminUserManagement";
import { AdminExamManagement } from "./pages/Admin/AdminExamManagement";
import { AdminClassrooms } from "./pages/Admin/AdminClassrooms";
import { AdminAnalytics } from "./pages/Admin/AdminAnalytics";
import { AdminSettings } from "./pages/Admin/AdminSettings";
import { DashboardLearner } from "./pages/Learner/DashboardLearner";
import PracticeTests from "./pages/Learner/PracticeTests";
import AiLearner from "./pages/Learner/AiLearner";
import SimulatorLearner from "./pages/Learner/SimulatorLearner";
import ScheduleLearner from "./pages/Learner/ScheduleLearner";
import AccountSettings from "./pages/Learner/AccountSettings";
import { InstructorLayout } from "./components/instructor/InstructorLayout";
import { InstructorDashboardPage } from "./pages/Instructor/InstructorDashboardPage";
import { InstructorExercisesPage } from "./pages/Instructor/InstructorExercisesPage";
import { InstructorExerciseDetailsPage } from "./pages/Instructor/InstructorExerciseDetailsPage";
import { InstructorClassroomsPage } from "./pages/Instructor/InstructorClassroomsPage";
import { InstructorClassroomDetailsPage } from "./pages/Instructor/InstructorClassroomDetailsPage";
import { InstructorProfilePage } from "./pages/Instructor/InstructorProfilePage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/dashboard" element={<Navigate to="/learner" replace />} />

        <Route path="/learner" element={<LearnerLayout />}>
          <Route index element={<DashboardLearner />} />
          <Route path="practice-tests" element={<PracticeTests />} />
          <Route path="ai-assistant" element={<AiLearner />} />
          <Route path="simulator" element={<SimulatorLearner />} />
          <Route path="schedule" element={<ScheduleLearner />} />
          <Route path="account-settings" element={<AccountSettings />} />
        </Route>

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
          <Route path="exercises/:examId" element={<InstructorExerciseDetailsPage />} />
          <Route path="classrooms" element={<InstructorClassroomsPage />} />
          <Route path="classrooms/:classId" element={<InstructorClassroomDetailsPage />} />
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
