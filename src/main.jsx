import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import AthleticsHome from "./AthleticsHome.jsx";
import BoysBasketballApp from "./boys/basketball/BoysBasketballApp.jsx";
import BoysBaseballApp from "./boys/baseball/BoysBaseballApp.jsx";
import GirlsBasketballApp from "./girls/basketball/GirlsBasketballApp.jsx";
import TrackApp from "./track/TrackApp.jsx";
import AdminApp from "./admin/AdminApp.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AthleticsHome />} />
        <Route path="/athletics" element={<AthleticsHome />} />

        <Route
          path="/athletics/boys/basketball/*"
          element={<BoysBasketballApp />}
        />

        <Route
          path="/athletics/boys/baseball/*"
          element={<BoysBaseballApp />}
        />

        <Route
          path="/athletics/girls/basketball/*"
          element={<GirlsBasketballApp />}
        />

        <Route path="/athletics/track/*" element={<TrackApp />} />

        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
    <Analytics />
  </React.StrictMode>
);
