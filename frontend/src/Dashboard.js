import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You are not logged in. Please login first.");
      return;
    }

    // Optionally: call a protected backend endpoint
    fetch("https://pcp-backend-hkgzcjdfc0asd4fu.westeurope-01.azurewebsites.net/api/protected", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setMessage(`Welcome ${data.username}! This is your dashboard.`))
      .catch(() => setMessage("Invalid token. Please login again."));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setMessage("Logged out successfully.");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Dashboard</h2>
      <p>{message}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
