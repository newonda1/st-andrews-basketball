import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AthleticsProgramShell from "../components/AthleticsProgramShell";
import SeasonPage from "./pages/SeasonPage";
import YearlyResults from "./pages/YearlyResults";

export default function GolfApp() {
  const [seasons, setSeasons] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [status, setStatus] = useState("Loading golf archive...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [seasonsRes, tournamentsRes] = await Promise.all([
          fetch("/data/golf/seasons.json"),
          fetch("/data/golf/tournaments.json"),
        ]);

        if (!seasonsRes.ok) {
          throw new Error(`Could not load golf seasons (${seasonsRes.status}).`);
        }

        if (!tournamentsRes.ok) {
          throw new Error(
            `Could not load golf tournaments (${tournamentsRes.status}).`
          );
        }

        const [seasonsData, tournamentsData] = await Promise.all([
          seasonsRes.json(),
          tournamentsRes.json(),
        ]);

        if (!cancelled) {
          setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
          setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
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
        <Route index element={<Navigate to="yearly-results" replace />} />
        <Route
          path="yearly-results"
          element={
            <YearlyResults
              seasons={seasons}
              tournaments={tournaments}
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
              status={status}
            />
          }
        />
        <Route path="*" element={<Navigate to="yearly-results" replace />} />
      </Routes>
    </AthleticsProgramShell>
  );
}
