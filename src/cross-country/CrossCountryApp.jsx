import React, { useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AthleticsProgramShell from "../components/AthleticsProgramShell";
import ChampionshipList from "./pages/ChampionshipList";
import Home from "./pages/Home";
import SchoolRecords from "./pages/SchoolRecords";
import SeasonPage from "./pages/SeasonPage";
import YearlyResults from "./pages/YearlyResults";

export default function CrossCountryApp() {
  const [seasons, setSeasons] = useState([]);
  const [meets, setMeets] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playerMeetStats, setPlayerMeetStats] = useState([]);
  const [status, setStatus] = useState("Loading cross country data...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [seasonsRes, meetsRes, playersRes, playerMeetStatsRes] =
          await Promise.all([
            fetch("/data/cross-country/seasons.json"),
            fetch("/data/cross-country/meets.json"),
            fetch("/data/players.json"),
            fetch("/data/cross-country/playermeetstats.json"),
          ]);

        if (!seasonsRes.ok) {
          throw new Error(
            `Could not load cross country seasons (${seasonsRes.status}).`
          );
        }

        if (!meetsRes.ok) {
          throw new Error(`Could not load cross country meets (${meetsRes.status}).`);
        }

        if (!playersRes.ok) {
          throw new Error(`Could not load players (${playersRes.status}).`);
        }

        if (!playerMeetStatsRes.ok) {
          throw new Error(
            `Could not load cross country player meet stats (${playerMeetStatsRes.status}).`
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
          setStatus(error?.message || "Failed to load cross country data.");
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
        title: "List of Champions",
        links: [
          {
            to: "/athletics/cross-country/champions",
            label: "List of Champions",
          },
        ],
      },
      {
        title: "School Records",
        links: [
          {
            to: "/athletics/cross-country/records/school",
            label: "School Records",
          },
        ],
      },
      {
        title: "Season Results",
        links: [
          {
            to: "/athletics/cross-country/yearly-results",
            label: "Season Results",
          },
        ],
      },
    ];
  }, []);

  return (
    <AthleticsProgramShell
      title="Cross Country"
      menuTitle="Cross Country"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/cross-country"
    >
      <Routes>
        <Route index element={<Home />} />
        <Route
          path="champions"
          element={
            <ChampionshipList
              seasons={seasons}
              meets={meets}
              playerMeetStats={playerMeetStats}
              players={players}
              status={status}
            />
          }
        />
        <Route
          path="records/school"
          element={
            <SchoolRecords
              playerMeetStats={playerMeetStats}
              players={players}
              meets={meets}
              status={status}
            />
          }
        />
        <Route
          path="yearly-results"
          element={
            <YearlyResults
              seasons={seasons}
              meets={meets}
              playerMeetStats={playerMeetStats}
              status={status}
            />
          }
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
        <Route path="*" element={<Home />} />
      </Routes>
    </AthleticsProgramShell>
  );
}
