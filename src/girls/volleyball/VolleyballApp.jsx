import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AthleticsProgramShell from "../../components/AthleticsProgramShell";
import GameDetail from "./pages/GameDetail";
import PlayerPage from "./pages/PlayerPage";
import SeasonPage from "./pages/SeasonPage";
import YearlyResults from "./pages/YearlyResults";
import { loadVolleyballData } from "./volleyballData";

export default function VolleyballApp() {
  const [data, setData] = useState({
    seasons: [],
    games: [],
    rosters: [],
    players: [],
    playerSeasonStats: [],
    teamSeasonStats: [],
    playerGameStats: [],
    teamMatchStats: [],
  });
  const [status, setStatus] = useState("Loading volleyball archive...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const loadedData = await loadVolleyballData();
        if (!cancelled) {
          setData(loadedData);
          setStatus("");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error?.message || "Failed to load volleyball archive.");
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const menuSections = useMemo(
    () => [
      {
        title: "Results",
        links: [
          { to: "/athletics/volleyball/yearly-results", label: "Season Results" },
          { to: "/athletics/volleyball/seasons/2025", label: "2025 Season" },
        ],
      },
      {
        title: "Season",
        links: [
          { to: "/athletics/volleyball/seasons/2025#schedule", label: "Schedule" },
          { to: "/athletics/volleyball/seasons/2025#roster", label: "Roster" },
          { to: "/athletics/volleyball/seasons/2025#stats", label: "Stats" },
        ],
      },
    ],
    []
  );

  return (
    <AthleticsProgramShell
      title="Volleyball"
      menuTitle="Volleyball"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/volleyball"
    >
      <Routes>
        <Route index element={<Navigate to="seasons/2025" replace />} />
        <Route
          path="yearly-results"
          element={<YearlyResults data={data} status={status} />}
        />
        <Route
          path="seasons/:seasonId"
          element={<SeasonPage data={data} status={status} />}
        />
        <Route
          path="games/:gameId"
          element={<GameDetail data={data} status={status} />}
        />
        <Route
          path="players/:playerId"
          element={<PlayerPage data={data} status={status} />}
        />
        <Route path="*" element={<Navigate to="seasons/2025" replace />} />
      </Routes>
    </AthleticsProgramShell>
  );
}
