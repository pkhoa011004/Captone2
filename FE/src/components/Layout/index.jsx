import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
const Layout = () => {
  return (
    <>
      <Toaster />
      <Outlet />
    </>
  );
};

export default Layout;
