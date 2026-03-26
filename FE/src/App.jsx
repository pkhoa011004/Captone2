import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { LandingPage } from "./pages/Home_Login/LandingPage";
import { LoginPage } from "./pages/Home_Login/Login";
import { DashboardAdmin } from "./pages/Admin/DashboardAdmin";
import { DashboardPage } from "./pages/Learner/DashboardPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
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
