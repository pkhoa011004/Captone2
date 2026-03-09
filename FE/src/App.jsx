import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<div>Home</div>} />
          <Route path="about" element={<div>About</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
