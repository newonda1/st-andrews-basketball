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
import Season2021_22 from "./seasons/Season2021_22";
import Season2020_21 from "./seasons/Season2020_21";
import MaxPrepsSeasonPage from "./seasons/MaxPrepsSeasonPage";
import SeasonPlaceholder from "./seasons/SeasonPlaceholder";

const seasonPages = [
  { slug: "2025-26", Component: Season2025_26 },
  { slug: "2024-25", Component: Season2024_25 },
  { slug: "2023-24", Component: Season2023_24 },
  { slug: "2022-23", Component: Season2022_23 },
  { slug: "2021-22", Component: Season2021_22 },
  { slug: "2020-21", Component: Season2020_21 },
];

const maxPrepsArchiveSeasonPages = [
  { slug: "2019-20", seasonId: 2019 },
  { slug: "2018-19", seasonId: 2018 },
  { slug: "2017-18", seasonId: 2017 },
  { slug: "2016-17", seasonId: 2016 },
  { slug: "2015-16", seasonId: 2015 },
  { slug: "2014-15", seasonId: 2014 },
  { slug: "2013-14", seasonId: 2013 },
  { slug: "2012-13", seasonId: 2012 },
  { slug: "2011-12", seasonId: 2011 },
  { slug: "2010-11", seasonId: 2010 },
  { slug: "2009-10", seasonId: 2009 },
  { slug: "2008-09", seasonId: 2008 },
  { slug: "2007-08", seasonId: 2007 },
  { slug: "2006-07", seasonId: 2006 },
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
          {maxPrepsArchiveSeasonPages.map(({ slug, seasonId }) => (
            <Route
              key={slug}
              path={`seasons/${slug}`}
              element={<MaxPrepsSeasonPage seasonId={seasonId} seasonLabel={slug} />}
            />
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
