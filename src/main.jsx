import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import AthleticsHome from "./AthleticsHome.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

const AthleticsSearchApp = lazy(() => import("./AthleticsSearchApp.jsx"));
const BoysBasketballApp = lazy(() => import("./boys/basketball/BoysBasketballApp.jsx"));
const BoysBaseballApp = lazy(() => import("./boys/baseball/BoysBaseballApp.jsx"));
const FootballApp = lazy(() => import("./boys/football/FootballApp.jsx"));
const BoysSoccerApp = lazy(() => import("./boys/soccer/BoysSoccerApp.jsx"));
const GirlsBasketballApp = lazy(() => import("./girls/basketball/GirlsBasketballApp.jsx"));
const GirlsSoccerApp = lazy(() => import("./girls/soccer/GirlsSoccerApp.jsx"));
const SoftballApp = lazy(() => import("./girls/softball/SoftballApp.jsx"));
const VolleyballApp = lazy(() => import("./girls/volleyball/VolleyballApp.jsx"));
const TrackApp = lazy(() => import("./track/TrackApp.jsx"));
const CrossCountryApp = lazy(() => import("./cross-country/CrossCountryApp.jsx"));
const SwimmingApp = lazy(() => import("./swimming/SwimmingApp.jsx"));
const TennisApp = lazy(() => import("./tennis/TennisApp.jsx"));
const GolfApp = lazy(() => import("./golf/GolfApp.jsx"));
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<div className="py-10 text-center text-sm text-gray-600">Loading athletics...</div>}>
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

          <Route path="/athletics/football/*" element={<FootballApp />} />
          <Route path="/athletics/softball/*" element={<SoftballApp />} />
          <Route path="/athletics/volleyball/*" element={<VolleyballApp />} />
          <Route path="/athletics/girls/soccer/*" element={<GirlsSoccerApp />} />
          <Route path="/athletics/boys/soccer/*" element={<BoysSoccerApp />} />
          <Route path="/athletics/cross-country/*" element={<CrossCountryApp />} />

          <Route path="/athletics/track/*" element={<TrackApp />} />
          <Route path="/athletics/swimming/*" element={<SwimmingApp />} />
          <Route path="/athletics/tennis/*" element={<TennisApp />} />
          <Route path="/athletics/golf/*" element={<GolfApp />} />

          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    <Analytics />
  </React.StrictMode>
);
