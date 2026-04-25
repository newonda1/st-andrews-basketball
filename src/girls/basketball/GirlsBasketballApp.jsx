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

import Season2025_26 from "./seasons/Season2025_26";
import Season2024_25 from "./seasons/Season2024_25";
import Season2023_24 from "./seasons/Season2023_24";
import Season2022_23 from "./seasons/Season2022_23";
import SeasonPlaceholder from "./seasons/SeasonPlaceholder";

const seasonPages = [
  { slug: "2025-26", Component: Season2025_26 },
  { slug: "2024-25", Component: Season2024_25 },
  { slug: "2023-24", Component: Season2023_24 },
  { slug: "2022-23", Component: Season2022_23 },
];

const menuSections = [
  {
    title: "Results",
    links: [
      {
        to: "/athletics/girls/basketball/yearly-results",
        label: "Full Year-by-Year Results",
      },
      {
        to: "/athletics/girls/basketball/records/opponents",
        label: "Opponent Game History",
      },
    ],
  },
  {
    title: "Team Stats",
    links: [
      {
        to: "/athletics/girls/basketball/team/full",
        label: "Full Team Stats",
      },
      {
        to: "/athletics/girls/basketball/records/team",
        label: "Team Single Game Records",
      },
      {
        to: "/athletics/girls/basketball/team/season-records",
        label: "Team Season Records",
      },
    ],
  },
  {
    title: "Individual Stats",
    links: [
      {
        to: "/athletics/girls/basketball/records/career",
        label: "Full Career Stats",
      },
      {
        to: "/athletics/girls/basketball/records/single-game",
        label: "Single Game Records",
      },
      {
        to: "/athletics/girls/basketball/records/season",
        label: "Season Records",
      },
      {
        to: "/athletics/girls/basketball/records/career-records",
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
        const res = await fetch("/data/girls/basketball/games.json");
        const gamesData = await res.json();
        const matchedGame = gamesData.find(
          (entry) => Number(entry.GameID) === Number(gameId)
        );

        if (!cancelled) {
          setGame(matchedGame || null);
        }
      } catch (error) {
        console.error("Failed to load girls basketball game for router:", error);
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
    return <div className="p-4">Loading...</div>;
  }

  if (!game) {
    return <div className="p-4">Game not found.</div>;
  }

  const isHistorical = Number(game.Season) <= 2011;

  return isHistorical ? <GameDetailHistorical /> : <GameDetail />;
}

export default function GirlsBasketballApp() {
  return (
    <AthleticsProgramShell
      title="Girls' Basketball"
      menuTitle="Girls' Basketball"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/girls/basketball"
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
