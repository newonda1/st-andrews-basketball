import React, { useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AthleticsProgramShell from "../components/AthleticsProgramShell";
import Home from "./pages/Home";
import MatchPage from "./pages/MatchPage";
import SeasonPage from "./pages/SeasonPage";
import YearlyResults from "./pages/YearlyResults";

export default function TennisApp() {
  const [seasons, setSeasons] = useState([]);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [opponentAthletes, setOpponentAthletes] = useState([]);
  const [schools, setSchools] = useState([]);
  const [status, setStatus] = useState("Loading tennis data...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [
          seasonsRes,
          matchesRes,
          playersRes,
          opponentAthletesRes,
          schoolsRes,
        ] = await Promise.all([
          fetch("/data/tennis/seasons.json"),
          fetch("/data/tennis/matches.json"),
          fetch("/data/players.json"),
          fetch("/data/tennis/opponentAthletes.json"),
          fetch("/data/schools.json"),
        ]);

        if (!seasonsRes.ok) {
          throw new Error(`Could not load tennis seasons (${seasonsRes.status}).`);
        }

        if (!matchesRes.ok) {
          throw new Error(`Could not load tennis matches (${matchesRes.status}).`);
        }

        if (!playersRes.ok) {
          throw new Error(`Could not load players (${playersRes.status}).`);
        }

        if (!opponentAthletesRes.ok) {
          throw new Error(
            `Could not load tennis opponent athletes (${opponentAthletesRes.status}).`
          );
        }

        if (!schoolsRes.ok) {
          throw new Error(`Could not load schools (${schoolsRes.status}).`);
        }

        const [
          seasonsData,
          matchesData,
          playersData,
          opponentAthletesData,
          schoolsData,
        ] = await Promise.all([
          seasonsRes.json(),
          matchesRes.json(),
          playersRes.json(),
          opponentAthletesRes.json(),
          schoolsRes.json(),
        ]);

        if (!cancelled) {
          setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
          setMatches(Array.isArray(matchesData) ? matchesData : []);
          setPlayers(Array.isArray(playersData) ? playersData : []);
          setOpponentAthletes(
            Array.isArray(opponentAthletesData) ? opponentAthletesData : []
          );
          setSchools(Array.isArray(schoolsData) ? schoolsData : []);
          setStatus("");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error?.message || "Failed to load tennis data.");
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
            to: "/athletics/tennis/yearly-results",
            label: "Season Results",
          },
        ],
      },
    ];
  }, []);

  return (
    <AthleticsProgramShell
      title="Tennis"
      menuTitle="Tennis"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/tennis"
    >
      <Routes>
        <Route index element={<Home />} />
        <Route
          path="yearly-results"
          element={
            <YearlyResults
              seasons={seasons}
              matches={matches}
              players={players}
              status={status}
            />
          }
        />
        <Route
          path="seasons/:seasonId"
          element={
            <SeasonPage
              seasons={seasons}
              matches={matches}
              schools={schools}
              status={status}
            />
          }
        />
        <Route
          path="matches/:matchId"
          element={
            <MatchPage
              seasons={seasons}
              matches={matches}
              players={players}
              opponentAthletes={opponentAthletes}
              schools={schools}
              status={status}
            />
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </AthleticsProgramShell>
  );
}
