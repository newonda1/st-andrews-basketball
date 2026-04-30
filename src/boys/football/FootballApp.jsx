import React from "react";
import { Route, Routes } from "react-router-dom";

import AthleticsProgramShell from "../../components/AthleticsProgramShell";

import FullCareerStats from "./pages/FullCareerStats";
import CareerRecords from "./pages/CareerRecords";
import GameDetail from "./pages/GameDetail";
import RecordsVsOpponents from "./pages/RecordsVsOpponents";
import SeasonRecords from "./pages/SeasonRecords";
import SingleGameRecords from "./pages/SingleGameRecords";
import TeamSeasonRecords from "./pages/TeamSeasonRecords";
import TeamSingleGameRecords from "./pages/TeamSingleGameRecords";
import YearlyResults from "./pages/YearlyResults";
import Home from "./pages/Home";
import PlayerPage from "./pages/PlayerPage";
import FootballSeasonPage from "./seasons/FootballSeasonPage";

const menuSections = [
  {
    title: "Results",
    links: [
      {
        to: "/athletics/football/yearly-results",
        label: "Full Year-by-Year Results",
      },
      {
        to: "/athletics/football/records/opponents",
        label: "Opponent Game History",
      },
    ],
  },
  {
    title: "Team Records",
    links: [
      {
        to: "/athletics/football/records/team",
        label: "Team Single Game Records",
      },
      {
        to: "/athletics/football/team/season-records",
        label: "Team Season Records",
      },
    ],
  },
  {
    title: "Individual Records",
    links: [
      {
        to: "/athletics/football/records/career",
        label: "Full Career Stats",
      },
      {
        to: "/athletics/football/records/single-game",
        label: "Single Game Records",
      },
      {
        to: "/athletics/football/records/season",
        label: "Season Records",
      },
      {
        to: "/athletics/football/records/career-records",
        label: "Career Records",
      },
    ],
  },
];

export default function FootballApp() {
  return (
    <AthleticsProgramShell
      title="Football"
      menuTitle="Football"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/football"
    >
      <div className="pb-12 lg:pb-24">
        <Routes>
          <Route index element={<Home />} />
          <Route path="team/season-records" element={<TeamSeasonRecords />} />
          <Route path="records/team" element={<TeamSingleGameRecords />} />
          <Route path="records/career" element={<FullCareerStats />} />
          <Route path="records/opponents" element={<RecordsVsOpponents />} />
          <Route path="records/single-game" element={<SingleGameRecords />} />
          <Route path="records/season" element={<SeasonRecords />} />
          <Route path="records/career-records" element={<CareerRecords />} />
          <Route path="yearly-results" element={<YearlyResults />} />
          <Route path="seasons/:seasonId" element={<FootballSeasonPage />} />
          <Route path="games/:gameId" element={<GameDetail />} />
          <Route path="players/:playerId" element={<PlayerPage />} />
          <Route path="athletes/:playerId" element={<PlayerPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </AthleticsProgramShell>
  );
}
