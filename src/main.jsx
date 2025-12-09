import React from "react";
import ReactDOM from "react-dom/client";
import BoysBasketballApp from "./BoysBasketballApp.jsx";
import Season2024 from "./pages/Season2024.jsx";
import GamePage from "./pages/GamePage.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/season/2024" element={<Season2024 />} />
        <Route path="/game/:gameID" element={<GamePage />} />
        <Route path="/*" element={<BoysBasketballApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
