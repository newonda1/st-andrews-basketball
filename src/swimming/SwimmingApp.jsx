import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AthleticsProgramShell from "../components/AthleticsProgramShell";
import SchoolRecords from "./pages/SchoolRecords";
import SeasonPage from "./pages/SeasonPage";
import YearlyResults from "./pages/YearlyResults";

export default function SwimmingApp() {
  const [seasons, setSeasons] = useState([]);
  const [meets, setMeets] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playerMeetStats, setPlayerMeetStats] = useState([]);
  const [status, setStatus] = useState("Loading swimming data...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [seasonsRes, meetsRes, playersRes, playerMeetStatsRes] =
          await Promise.all([
            fetch("/data/swimming/seasons.json"),
            fetch("/data/swimming/meets.json"),
            fetch("/data/players.json"),
            fetch("/data/swimming/playermeetstats.json"),
          ]);

        if (!seasonsRes.ok) {
          throw new Error(`Could not load swim seasons (${seasonsRes.status}).`);
        }

        if (!meetsRes.ok) {
          throw new Error(`Could not load swim meets (${meetsRes.status}).`);
        }

        if (!playersRes.ok) {
          throw new Error(`Could not load players (${playersRes.status}).`);
        }

        if (!playerMeetStatsRes.ok) {
          throw new Error(
            `Could not load swim player meet stats (${playerMeetStatsRes.status}).`
          );
        }

        const [seasonsData, meetsData, playersData, playerMeetStatsData] =
          await Promise.all([
            seasonsRes.json(),
            meetsRes.json(),
            playersRes.json(),
            playerMeetStatsRes.json(),
          ]);

        if (!cancelled) {
          setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
          setMeets(Array.isArray(meetsData) ? meetsData : []);
          setPlayers(Array.isArray(playersData) ? playersData : []);
          setPlayerMeetStats(
            Array.isArray(playerMeetStatsData) ? playerMeetStatsData : []
          );
          setStatus("");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error?.message || "Failed to load swim data.");
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const menuSections = useMemo(() => {
    return [
      {
        title: "School Records",
        links: [
          {
            to: "/athletics/swimming/records/school",
            label: "School Records",
          },
        ],
      },
      {
        title: "Season Results",
        links: [
          {
            to: "/athletics/swimming/yearly-results",
            label: "Season Results",
          },
        ],
      },
    ];
  }, []);

  return (
    <AthleticsProgramShell
      title="Swimming Statistics"
      menuTitle="Swimming"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/swimming/records/school"
    >
      <Routes>
        <Route index element={<Navigate to="records/school" replace />} />
        <Route
          path="records/school"
          element={
            <SchoolRecords
              playerMeetStats={playerMeetStats}
              meets={meets}
              status={status}
            />
          }
        />
        <Route
          path="yearly-results"
          element={<YearlyResults seasons={seasons} meets={meets} status={status} />}
        />
        <Route
          path="seasons/:seasonId"
          element={
            <SeasonPage
              seasons={seasons}
              meets={meets}
              playerMeetStats={playerMeetStats}
              players={players}
              status={status}
            />
          }
        />
        <Route path="*" element={<Navigate to="records/school" replace />} />
      </Routes>
    </AthleticsProgramShell>
  );
}
