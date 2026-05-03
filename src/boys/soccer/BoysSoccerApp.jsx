import React, { useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";

import AthleticsProgramShell from "../../components/AthleticsProgramShell";
import GameDetail from "./pages/GameDetail";
import Home from "./pages/Home";
import PlayerPage from "./pages/PlayerPage";
import RecordsVsOpponents from "./pages/RecordsVsOpponents";
import SeasonPage from "./pages/SeasonPage";
import YearlyResults from "./pages/YearlyResults";
import { loadBoysSoccerData } from "./soccerData";

export default function BoysSoccerApp() {
  const [data, setData] = useState({
    games: [],
    seasons: [],
    rosters: [],
    players: [],
    schools: [],
  });
  const [status, setStatus] = useState("Loading boys soccer archive...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const loadedData = await loadBoysSoccerData();
        if (!cancelled) {
          setData(loadedData);
          setStatus("");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error?.message || "Failed to load boys soccer archive.");
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
          {
            to: "/athletics/boys/soccer/yearly-results",
            label: "Full Year-by-Year Results",
          },
          {
            to: "/athletics/boys/soccer/records/opponents",
            label: "Opponent Game History",
          },
        ],
      },
    ],
    []
  );

  return (
    <AthleticsProgramShell
      title="Boys Soccer"
      menuTitle="Boys Soccer"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/boys/soccer"
    >
      <Routes>
        <Route index element={<Home data={data} status={status} />} />
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
        <Route
          path="records/opponents"
          element={<RecordsVsOpponents data={data} status={status} />}
        />
        <Route path="*" element={<Home data={data} status={status} />} />
      </Routes>
    </AthleticsProgramShell>
  );
}
