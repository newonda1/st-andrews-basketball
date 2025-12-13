import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AthleticsHome from "./AthleticsHome.jsx";
import BoysBasketballApp from "./boys/basketball/BoysBasketballApp.jsx";
import GirlsBasketballApp from "./girls/basketball/GirlsBasketballApp.jsx";
import AdminApp from "./admin/AdminApp.jsx"; // ✅ NEW

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Athletics landing */}
        <Route path="/" element={<AthleticsHome />} />
        <Route path="/athletics" element={<AthleticsHome />} />

        {/* Boys Basketball */}
        <Route
          path="/athletics/boys/basketball/*"
          element={<BoysBasketballApp />}
        />

        {/* Girls Basketball */}
        <Route
          path="/athletics/girls/basketball/*"
          element={<GirlsBasketballApp />}
        />

        {/* ✅ Admin (global) */}
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
