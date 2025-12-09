import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AthleticsHome from "./AthleticsHome.jsx";
import BoysBasketballApp from "./BoysBasketballApp.jsx";
import GirlsBasketballApp from "./GirlsBasketballApp.jsx";

// Legacy / prototype pages – keep for now if you still use them
import Season2024 from "./pages/Season2024.jsx";
import GamePage from "./pages/GamePage.jsx";

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

        {/* Optional legacy / prototype routes */}
        <Route path="/season/2024" element={<Season2024 />} />
        <Route path="/game/:gameID" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
