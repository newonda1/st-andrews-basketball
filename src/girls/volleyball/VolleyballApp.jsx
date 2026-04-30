import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AthleticsProgramShell from "../../components/AthleticsProgramShell";
import GameDetail from "./pages/GameDetail";
import PlayerPage from "./pages/PlayerPage";
import {
  CareerRecords,
  FullCareerStats,
  FullTeamStats,
  RecordsVsOpponents,
  SeasonRecords,
  SingleGameRecords,
  TeamSeasonRecords,
  TeamSingleGameRecords,
} from "./pages/RecordsPages";
import SeasonPage from "./pages/SeasonPage";
import YearlyResults from "./pages/YearlyResults";
import { loadVolleyballData } from "./volleyballData";

const menuSections = [
  {
    title: "Results",
    links: [
      {
        to: "/athletics/volleyball/yearly-results",
        label: "Full Year-by-Year Results",
      },
      {
        to: "/athletics/volleyball/records/opponents",
        label: "Opponent Game History",
      },
    ],
  },
  {
    title: "Team Stats",
    links: [
      {
        to: "/athletics/volleyball/team/full",
        label: "Full Team Stats",
      },
      {
        to: "/athletics/volleyball/records/team",
        label: "Team Single Game Records",
      },
      {
        to: "/athletics/volleyball/team/season-records",
        label: "Team Season Records",
      },
    ],
  },
  {
    title: "Individual Stats",
    links: [
      {
        to: "/athletics/volleyball/records/career",
        label: "Full Career Stats",
      },
      {
        to: "/athletics/volleyball/records/single-game",
        label: "Single Game Records",
      },
      {
        to: "/athletics/volleyball/records/season",
        label: "Season Records",
      },
      {
        to: "/athletics/volleyball/records/career-records",
        label: "Career Records",
      },
    ],
  },
];

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
          path="team/full"
          element={<FullTeamStats data={data} status={status} />}
        />
        <Route
          path="team/season-records"
          element={<TeamSeasonRecords data={data} status={status} />}
        />
        <Route
          path="records/career"
          element={<FullCareerStats data={data} status={status} />}
        />
        <Route
          path="records/season"
          element={<SeasonRecords data={data} status={status} />}
        />
        <Route
          path="records/career-records"
          element={<CareerRecords data={data} status={status} />}
        />
        <Route
          path="records/single-game"
          element={<SingleGameRecords data={data} status={status} />}
        />
        <Route
          path="records/team"
          element={<TeamSingleGameRecords data={data} status={status} />}
        />
        <Route
          path="records/opponents"
          element={<RecordsVsOpponents data={data} status={status} />}
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
