import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { LandingPage } from "./pages/Home_Login/LandingPage";
import { LoginPage } from "./pages/Home_Login/Login";
import { DashboardAdmin } from "./pages/Admin/DashboardAdmin";
import { DashboardLearner } from "./pages/Learner/DashboardLearner";
import PracticeTests from "./pages/Learner/PracticeTests";
import AiLearner from "./pages/Learner/AiLearner";
import SimulatorLearner from "./pages/Learner/SimulatorLearner";
import ScheduleLearner from "./pages/Learner/ScheduleLearner";
import AccountSettings from "./pages/Learner/AccountSettings";
import LoginNew from "./pages/Home_Login/LoginNew";
import SignupNew from "./pages/Home_Login/SignupNew";
import { AdminDashboardPage } from "./pages/Admin/AdminDashboardPage";
import { AdminUserManagement } from "./pages/Admin/AdminUserManagement";
import { AdminExamManagement } from "./pages/Admin/AdminExamManagement";
import { AdminClassrooms } from "./pages/Admin/AdminClassrooms";
import { AdminAnalytics } from "./pages/Admin/AdminAnalytics";
import { AdminSettings } from "./pages/Admin/AdminSettings";
import { InstructorLayout } from "./components/instructor/InstructorLayout";
import { InstructorDashboardPage } from "./pages/Instructor/InstructorDashboardPage";
import { InstructorExercisesPage } from "./pages/Instructor/InstructorExercisesPage";
import { InstructorClassroomsPage } from "./pages/Instructor/InstructorClassroomsPage";
import { InstructorProfilePage } from "./pages/Instructor/InstructorProfilePage";
import QuizLearner from "./pages/Learner/QuizLearner";
import CreateExamLearner from "./pages/Learner/CreateExamLearner";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/loginnew" element={<LoginNew />} />
        <Route path="/signupnew" element={<SignupNew />} />
        <Route path="/dashboardlearner" element={<DashboardLearner />} />
        <Route path="/practicelearner" element={<PracticeTests />} />
        <Route path="/ailearner" element={<AiLearner />} />
        <Route path="/simulatorlearner" element={<SimulatorLearner />} />
        <Route path="/schedulelearner" element={<ScheduleLearner />} />
        <Route path="/create-exam" element={<CreateExamLearner />} />
        <Route path="/quizlearner" element={<QuizLearner />} />

        <Route path="/accountsettings" element={<AccountSettings />} />
        <Route path="/admin" element={<DashboardAdmin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="exams" element={<AdminExamManagement />} />
          <Route path="classrooms" element={<AdminClassrooms />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route
          path="/admin-dashboard"
          element={<Navigate to="/admin" replace />}
        />

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
