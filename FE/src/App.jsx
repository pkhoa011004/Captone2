import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
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
        <Route path="/accountsettings" element={<AccountSettings />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/layout" element={<Layout />}>
          <Route index element={<div>Home</div>} />
          <Route path="about" element={<div>About</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
