import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import AthleticsHome from "./AthleticsHome.jsx";
import AthleticsSearchApp from "./AthleticsSearchApp.jsx";
import BoysBasketballApp from "./boys/basketball/BoysBasketballApp.jsx";
import BoysBaseballApp from "./boys/baseball/BoysBaseballApp.jsx";
import GirlsBasketballApp from "./girls/basketball/GirlsBasketballApp.jsx";
import TrackApp from "./track/TrackApp.jsx";
import SwimmingApp from "./swimming/SwimmingApp.jsx";
import TennisApp from "./tennis/TennisApp.jsx";
import GolfApp from "./golf/GolfApp.jsx";
import AdminApp from "./admin/AdminApp.jsx";
import UnderConstructionSportPage from "./components/UnderConstructionSportPage.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AthleticsHome />} />
        <Route path="/athletics" element={<AthleticsHome />} />
        <Route path="/athletics/search" element={<AthleticsSearchApp />} />

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

        <Route
          path="/athletics/football"
          element={
            <UnderConstructionSportPage
              sportName="Football"
              sportPath="/athletics/football"
            />
          }
        />
        <Route
          path="/athletics/volleyball"
          element={
            <UnderConstructionSportPage
              sportName="Volleyball"
              sportPath="/athletics/volleyball"
            />
          }
        />
        <Route
          path="/athletics/girls/soccer"
          element={
            <UnderConstructionSportPage
              sportName="Girls Soccer"
              sportPath="/athletics/girls/soccer"
            />
          }
        />
        <Route
          path="/athletics/boys/soccer"
          element={
            <UnderConstructionSportPage
              sportName="Boys Soccer"
              sportPath="/athletics/boys/soccer"
            />
          }
        />

        <Route path="/athletics/track/*" element={<TrackApp />} />
        <Route path="/athletics/swimming/*" element={<SwimmingApp />} />
        <Route path="/athletics/tennis/*" element={<TennisApp />} />
        <Route path="/athletics/golf/*" element={<GolfApp />} />

        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
    <Analytics />
  </React.StrictMode>
);
