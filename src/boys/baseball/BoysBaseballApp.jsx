import React, { useMemo } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AthleticsProgramShell from "../../components/AthleticsProgramShell";

import YearlyResults from "./pages/YearlyResults";
import Season2026 from "./seasons/Season2026";
import Season2025 from "./seasons/Season2025";
import Season2024 from "./seasons/Season2024";
import GameDetail from "./pages/GameDetail";
import PlayerPage from "./pages/PlayerPage";
import RecordsVsOpponents from "./pages/RecordsVsOpponents";

export default function BoysBaseballApp() {
  const menuSections = useMemo(
    () => [
      {
        title: "Results",
        links: [
          {
            to: "/athletics/boys/baseball",
            label: "Full Year-by-Year Results",
            end: true,
          },
          {
            to: "/athletics/boys/baseball/opponent-history",
            label: "Opponent Game History",
          },
        ],
      },
      {
        title: "Team Stats",
        links: [
          {
            to: "/athletics/boys/baseball/seasons/2026",
            label: "2026 Season",
          },
          {
            to: "/athletics/boys/baseball/seasons/2025",
            label: "2025 Season",
          },
          {
            to: "/athletics/boys/baseball/seasons/2024",
            label: "2024 Season",
          },
        ],
      },
    ],
    []
  );

  return (
    <AthleticsProgramShell
      title="Boys' Baseball"
      subtitle="Historical results, player statistics, and program records"
      menuTitle="Boys' Baseball"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      footerText="St. Andrew's Athletics"
      footerHref="https://preplegacy.com"
      footerLogoSrc="/images/branding/preplegacy-logo.png"
    >
      <Routes>
        <Route index element={<YearlyResults />} />
        <Route path="seasons/2026" element={<Season2026 />} />
        <Route path="seasons/2025" element={<Season2025 />} />
        <Route path="seasons/2024" element={<Season2024 />} />
        <Route path="games/:gameId" element={<GameDetail />} />
        <Route path="players/:playerId" element={<PlayerPage />} />

        <Route path="opponent-history" element={<RecordsVsOpponents />} />

        <Route
          path="*"
          element={<Navigate to="/athletics/boys/baseball" replace />}
        />
      </Routes>
    </AthleticsProgramShell>
  );
}
