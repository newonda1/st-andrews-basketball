import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AthleticsProgramShell from "../components/AthleticsProgramShell";
import SchoolRecords from "./pages/SchoolRecords";
import SeasonPage from "./pages/SeasonPage";
import YearlyResults from "./pages/YearlyResults";

export default function TrackApp() {
  const [seasons, setSeasons] = useState([]);
  const [meets, setMeets] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playerMeetStats, setPlayerMeetStats] = useState([]);
  const [legacySchoolRecords, setLegacySchoolRecords] = useState([]);
  const [status, setStatus] = useState("Loading track & field data...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [
          seasonsRes,
          meetsRes,
          playersRes,
          playerMeetStatsRes,
          legacySchoolRecordsRes,
        ] =
          await Promise.all([
            fetch("/data/track/seasons.json"),
            fetch("/data/track/meets.json"),
            fetch("/data/players.json"),
            fetch("/data/track/playermeetstats.json"),
            fetch("/data/track/legacySchoolRecords.json"),
          ]);

        if (!seasonsRes.ok) {
          throw new Error(`Could not load track seasons (${seasonsRes.status}).`);
        }

        if (!meetsRes.ok) {
          throw new Error(`Could not load track meets (${meetsRes.status}).`);
        }

        if (!playersRes.ok) {
          throw new Error(`Could not load players (${playersRes.status}).`);
        }

        if (!playerMeetStatsRes.ok) {
          throw new Error(
            `Could not load track player meet stats (${playerMeetStatsRes.status}).`
          );
        }

        if (!legacySchoolRecordsRes.ok) {
          throw new Error(
            `Could not load track legacy school records (${legacySchoolRecordsRes.status}).`
          );
        }

        const [
          seasonsData,
          meetsData,
          playersData,
          playerMeetStatsData,
          legacySchoolRecordsData,
        ] =
          await Promise.all([
            seasonsRes.json(),
            meetsRes.json(),
            playersRes.json(),
            playerMeetStatsRes.json(),
            legacySchoolRecordsRes.json(),
          ]);

        if (!cancelled) {
          setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
          setMeets(Array.isArray(meetsData) ? meetsData : []);
          setPlayers(Array.isArray(playersData) ? playersData : []);
          setPlayerMeetStats(
            Array.isArray(playerMeetStatsData) ? playerMeetStatsData : []
          );
          setLegacySchoolRecords(
            Array.isArray(legacySchoolRecordsData) ? legacySchoolRecordsData : []
          );
          setStatus("");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error?.message || "Failed to load track data.");
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
        title: "Track & Field",
        links: [
          {
            to: "/athletics/track/records/school",
            label: "School Records",
          },
          {
            to: "/athletics/track/yearly-results",
            label: "Season Results",
          },
        ],
      },
    ];
  }, []);

  return (
    <AthleticsProgramShell
      title="Track & Field Statistics"
      menuTitle="Track & Field"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/track/records/school"
    >
      <Routes>
        <Route index element={<Navigate to="records/school" replace />} />
        <Route
          path="records/school"
          element={
            <SchoolRecords
              playerMeetStats={playerMeetStats}
              legacySchoolRecords={legacySchoolRecords}
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
