import React, { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";

import AthleticsProgramShell from "../../components/AthleticsProgramShell";

import Home from "./pages/Home";
import FullCareerStats from "./pages/FullCareerStats";
import FullTeamStats from "./pages/FullTeamStats";
import SeasonRecords from "./pages/SeasonRecords";
import SingleGameRecords from "./pages/SingleGameRecords";
import CareerRecords from "./pages/CareerRecords";
import TeamSingleGameRecords from "./pages/TeamSingleGameRecords";
import TeamSeasonRecords from "./pages/TeamSeasonRecords";
import RecordsVsOpponents from "./pages/RecordsVsOpponents";
import YearlyResults from "./pages/YearlyResults";
import GameDetail from "./pages/GameDetail";
import GameDetailHistorical from "./pages/GameDetailHistorical";
import PlayerPage from "./pages/PlayerPage";

import Season1978_79 from "./seasons/Season1978_79";
import Season1979_80 from "./seasons/Season1979_80";
import Season1980_81 from "./seasons/Season1980_81";
import Season1981_82 from "./seasons/Season1981_82";
import Season1982_83 from "./seasons/Season1982_83";
import Season1983_84 from "./seasons/Season1983_84";
import Season1984_85 from "./seasons/Season1984_85";
import Season1985_86 from "./seasons/Season1985_86";
import Season1986_87 from "./seasons/Season1986_87";
import Season1987_88 from "./seasons/Season1987_88";
import Season1988_89 from "./seasons/Season1988_89";
import Season1992_93 from "./seasons/Season1992_93";
import Season2022_23 from "./seasons/Season2022_23";
import Season2023_24 from "./seasons/Season2023_24";
import Season2024_25 from "./seasons/Season2024_25";
import Season2025_26 from "./seasons/Season2025_26";
import SeasonPlaceholder from "./seasons/SeasonPlaceholder";

const seasonPages = [
  { slug: "1978-79", Component: Season1978_79 },
  { slug: "1979-80", Component: Season1979_80 },
  { slug: "1980-81", Component: Season1980_81 },
  { slug: "1981-82", Component: Season1981_82 },
  { slug: "1982-83", Component: Season1982_83 },
  { slug: "1983-84", Component: Season1983_84 },
  { slug: "1984-85", Component: Season1984_85 },
  { slug: "1985-86", Component: Season1985_86 },
  { slug: "1986-87", Component: Season1986_87 },
  { slug: "1987-88", Component: Season1987_88 },
  { slug: "1988-89", Component: Season1988_89 },
  { slug: "1992-93", Component: Season1992_93 },
  { slug: "2022-23", Component: Season2022_23 },
  { slug: "2023-24", Component: Season2023_24 },
  { slug: "2024-25", Component: Season2024_25 },
  { slug: "2025-26", Component: Season2025_26 },
];

const menuSections = [
  {
    title: "Results",
    links: [
      {
        to: "/athletics/boys/basketball/yearly-results",
        label: "Full Year-by-Year Results",
      },
      {
        to: "/athletics/boys/basketball/records/opponents",
        label: "Opponent Game History",
      },
    ],
  },
  {
    title: "Team Stats",
    links: [
      {
        to: "/athletics/boys/basketball/team/full",
        label: "Full Team Stats",
      },
      {
        to: "/athletics/boys/basketball/records/team",
        label: "Team Single Game Records",
      },
      {
        to: "/athletics/boys/basketball/team/season-records",
        label: "Team Season Records",
      },
    ],
  },
  {
    title: "Individual Stats",
    links: [
      {
        to: "/athletics/boys/basketball/records/career",
        label: "Full Career Stats",
      },
      {
        to: "/athletics/boys/basketball/records/single-game",
        label: "Single Game Records",
      },
      {
        to: "/athletics/boys/basketball/records/season",
        label: "Season Records",
      },
      {
        to: "/athletics/boys/basketball/records/career-records",
        label: "Career Records",
      },
    ],
  },
];

function GameDetailRouter() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadGame() {
      setLoading(true);
      try {
        const res = await fetch("/data/boys/basketball/games.json");
        const gamesData = await res.json();
        const matchedGame = gamesData.find(
          (entry) => Number(entry.GameID) === Number(gameId)
        );

        if (!cancelled) {
          setGame(matchedGame || null);
        }
      } catch (error) {
        console.error("Failed to load game for router:", error);
        if (!cancelled) {
          setGame(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGame();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  if (loading) {
    return <div className="p-4">Loading…</div>;
  }

  if (!game) {
    return <div className="p-4">Game not found.</div>;
  }

  const isHistorical = Number(game.Season) <= 2011;

  return isHistorical ? <GameDetailHistorical /> : <GameDetail />;
}

export default function BoysBasketballApp() {
  return (
    <AthleticsProgramShell
      title="Boys' Basketball"
      menuTitle="Boys' Basketball"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/boys/basketball"
    >
      <div className="pb-12 lg:pb-24">
        <Routes>
          <Route index element={<Home />} />

          <Route path="team/full" element={<FullTeamStats />} />
          <Route path="team/season-records" element={<TeamSeasonRecords />} />
          <Route path="records/career" element={<FullCareerStats />} />
          <Route path="records/season" element={<SeasonRecords />} />
          <Route path="records/single-game" element={<SingleGameRecords />} />
          <Route path="records/career-records" element={<CareerRecords />} />
          <Route path="records/team" element={<TeamSingleGameRecords />} />
          <Route path="records/opponents" element={<RecordsVsOpponents />} />

          {seasonPages.map(({ slug, Component }) => (
            <Route key={slug} path={`seasons/${slug}`} element={<Component />} />
          ))}
          <Route path="seasons/:seasonId" element={<SeasonPlaceholder />} />

          <Route path="yearly-results" element={<YearlyResults />} />
          <Route path="games/:gameId" element={<GameDetailRouter />} />
          <Route path="players/:playerId" element={<PlayerPage />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </AthleticsProgramShell>
  );
}
