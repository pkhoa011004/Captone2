import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
        const response = await fetch(
          `${apiBaseUrl}/users/verify-email?token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Redirect to login regardless of result
        navigate("/login");
      } catch (error) {
        // Redirect to login on error
        navigate("/login");
      }
    };

    verifyToken();
  }, [navigate]);

  // Return empty/minimal UI while redirecting
  return null;
}
