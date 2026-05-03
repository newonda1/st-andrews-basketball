import React, { useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AthleticsProgramShell from "../components/AthleticsProgramShell";
import Home from "./pages/Home";
import MatchPage from "./pages/MatchPage";
import SeasonPage from "./pages/SeasonPage";
import YearlyResults from "./pages/YearlyResults";

export default function GolfApp() {
  const [seasons, setSeasons] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [seasonRosters, setSeasonRosters] = useState([]);
  const [players, setPlayers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [status, setStatus] = useState("Loading golf archive...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [
          seasonsRes,
          tournamentsRes,
          matchesRes,
          seasonRostersRes,
          playersRes,
          schoolsRes,
        ] = await Promise.all([
          fetch("/data/golf/seasons.json"),
          fetch("/data/golf/tournaments.json"),
          fetch("/data/golf/matches.json"),
          fetch("/data/golf/seasonrosters.json"),
          fetch("/data/players.json"),
          fetch("/data/schools.json"),
        ]);

        if (!seasonsRes.ok) {
          throw new Error(`Could not load golf seasons (${seasonsRes.status}).`);
        }

        if (!tournamentsRes.ok) {
          throw new Error(
            `Could not load golf tournaments (${tournamentsRes.status}).`
          );
        }

        if (!matchesRes.ok) {
          throw new Error(`Could not load golf matches (${matchesRes.status}).`);
        }

        if (!seasonRostersRes.ok) {
          throw new Error(
            `Could not load golf season rosters (${seasonRostersRes.status}).`
          );
        }

        if (!playersRes.ok) {
          throw new Error(`Could not load players (${playersRes.status}).`);
        }

        if (!schoolsRes.ok) {
          throw new Error(`Could not load schools (${schoolsRes.status}).`);
        }

        const [
          seasonsData,
          tournamentsData,
          matchesData,
          seasonRostersData,
          playersData,
          schoolsData,
        ] = await Promise.all([
          seasonsRes.json(),
          tournamentsRes.json(),
          matchesRes.json(),
          seasonRostersRes.json(),
          playersRes.json(),
          schoolsRes.json(),
        ]);

        if (!cancelled) {
          setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
          setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
          setMatches(Array.isArray(matchesData) ? matchesData : []);
          setSeasonRosters(
            Array.isArray(seasonRostersData) ? seasonRostersData : []
          );
          setPlayers(Array.isArray(playersData) ? playersData : []);
          setSchools(Array.isArray(schoolsData) ? schoolsData : []);
          setStatus("");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error?.message || "Failed to load golf archive.");
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
        title: "Results",
        links: [
          {
            to: "/athletics/golf/yearly-results",
            label: "Season Results",
          },
        ],
      },
    ];
  }, []);

  return (
    <AthleticsProgramShell
      title="Golf"
      menuTitle="Golf"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/golf"
    >
      <Routes>
        <Route index element={<Home />} />
        <Route
          path="yearly-results"
          element={
            <YearlyResults
              seasons={seasons}
              tournaments={tournaments}
              matches={matches}
              seasonRosters={seasonRosters}
              status={status}
            />
          }
        />
        <Route
          path="seasons/:seasonId"
          element={
            <SeasonPage
              seasons={seasons}
              tournaments={tournaments}
              matches={matches}
              seasonRosters={seasonRosters}
              players={players}
              schools={schools}
              status={status}
            />
          }
        />
        <Route
          path="matches/:matchId"
          element={
            <MatchPage matches={matches} players={players} status={status} />
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </AthleticsProgramShell>
  );
}
