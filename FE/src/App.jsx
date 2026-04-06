import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { LearnerLayout } from "./components/learner/LearnerLayout";
import { LandingPage } from "./pages/Home_Login/LandingPage";
import { LogInLearner } from "./pages/Home_Login/LoginNew";
import RegisterLearner from "./pages/Home_Login/SignupNew";
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
import CustomExamBuilder from "./pages/Learner/CustomExamBuilder";
import { InstructorLayout } from "./components/instructor/InstructorLayout";
import { InstructorDashboardPage } from "./pages/Instructor/InstructorDashboardPage";
import { InstructorExercisesPage } from "./pages/Instructor/InstructorExercisesPage";
import { InstructorExerciseDetailsPage } from "./pages/Instructor/InstructorExerciseDetailsPage";
import { InstructorClassroomsPage } from "./pages/Instructor/InstructorClassroomsPage";
import { InstructorClassroomDetailsPage } from "./pages/Instructor/InstructorClassroomDetailsPage";
import { InstructorProfilePage } from "./pages/Instructor/InstructorProfilePage";
import QuizLearner from "./pages/Learner/QuizLearner";
import CreateExamLearner from "./pages/Learner/CreateExamLearner";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LogInLearner />} />
        <Route path="/loginnew" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<RegisterLearner />} />
        <Route path="/signupnew" element={<Navigate to="/signup" replace />} />
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
          <Route path="quiz" element={<QuizLearner />} />
        </Route>

        <Route
          path="/dashboardlearner"
          element={<Navigate to="/learner" replace />}
        />
        <Route
          path="/practicelearner"
          element={<Navigate to="/learner/practice-tests" replace />}
        />
        <Route
          path="/ailearner"
          element={<Navigate to="/learner/ai-assistant" replace />}
        />
        <Route
          path="/simulatorlearner"
          element={<Navigate to="/learner/simulator" replace />}
        />
        <Route
          path="/schedulelearner"
          element={<Navigate to="/learner/schedule" replace />}
        />
        <Route
          path="/accountsettings"
          element={<Navigate to="/learner/account-settings" replace />}
        />
        <Route
          path="/create-exam"
          element={<Navigate to="/learner/create-exam" replace />}
        />
        <Route path="/learner/create-exam" element={<CustomExamBuilder />} />
        <Route
          path="/quizlearner"
          element={<Navigate to="/learner/quiz" replace />}
        />

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
          <Route path="create-exam" element={<CreateExamLearner />} />
          <Route
            path="exercises/:examId"
            element={<InstructorExerciseDetailsPage />}
          />
          <Route path="classrooms" element={<InstructorClassroomsPage />} />
          <Route
            path="classrooms/:classId"
            element={<InstructorClassroomDetailsPage />}
          />
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
