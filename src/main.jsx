import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Season2024_2025 from "./pages/Season2024_2025.jsx";
import GamePage from "./pages/GamePage.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/season/2024-2025" element={<Season2024_2025 />} />
        <Route path="/game/:gameID" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
