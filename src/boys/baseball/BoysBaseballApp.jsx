import React, { useMemo } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AthleticsProgramShell from "../../components/AthleticsProgramShell";

import YearlyResults from "./pages/YearlyResults";
import Season2026 from "./seasons/Season2026";
import GameDetail from "./pages/GameDetail";
import PlayerPage from "./pages/PlayerPage";

function PlaceholderPage({ title, text }) {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

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
        <Route path="games/:gameId" element={<GameDetail />} />
        <Route path="players/:playerId" element={<PlayerPage />} />

        <Route
          path="opponent-history"
          element={
            <PlaceholderPage
              title="Opponent Game History"
              text="This page will eventually show the full game history against each baseball opponent in the database."
            />
          }
        />

        <Route
          path="*"
          element={<Navigate to="/athletics/boys/baseball" replace />}
        />
      </Routes>
    </AthleticsProgramShell>
  );
}