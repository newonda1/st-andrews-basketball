import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import AthleticsProgramShell from "../../components/AthleticsProgramShell";

import Season2006 from "./seasons/Season2006";

import Home from "./pages/Home";

const Season2026 = lazy(() => import("./seasons/Season2026"));
const Season2025 = lazy(() => import("./seasons/Season2025"));
const Season2024 = lazy(() => import("./seasons/Season2024"));
const Season2023 = lazy(() => import("./seasons/Season2023"));
const Season2022 = lazy(() => import("./seasons/Season2022"));
const Season2021 = lazy(() => import("./seasons/Season2021"));
const Season2020 = lazy(() => import("./seasons/Season2020"));
const Season2019 = lazy(() => import("./seasons/Season2019"));
const Season2018 = lazy(() => import("./seasons/Season2018"));
const Season2008 = lazy(() => import("./seasons/Season2008"));
const Season2002 = lazy(() => import("./seasons/Season2002"));
const Season2001 = lazy(() => import("./seasons/Season2001"));
const Season2000 = lazy(() => import("./seasons/Season2000"));
const YearlyResults = lazy(() => import("./pages/YearlyResults"));
const GameDetail = lazy(() => import("./pages/GameDetail"));
const PlayerPage = lazy(() => import("./pages/PlayerPage"));
const RecordsVsOpponents = lazy(() => import("./pages/RecordsVsOpponents"));
const FullCareerStats = lazy(() => import("./pages/FullCareerStats"));
const FullTeamStats = lazy(() => import("./pages/FullTeamStats"));
const TeamSingleGameRecords = lazy(() => import("./pages/TeamSingleGameRecords"));
const TeamSeasonRecords = lazy(() => import("./pages/TeamSeasonRecords"));
const SingleGameRecords = lazy(() => import("./pages/SingleGameRecords"));
const SeasonRecords = lazy(() => import("./pages/SeasonRecords"));
const CareerRecords = lazy(() => import("./pages/CareerRecords"));

const seasonPages = [
  { slug: "2026", Component: Season2026 },
  { slug: "2025", Component: Season2025 },
  { slug: "2024", Component: Season2024 },
  { slug: "2023", Component: Season2023 },
  { slug: "2022", Component: Season2022 },
  { slug: "2021", Component: Season2021 },
  { slug: "2020", Component: Season2020 },
  { slug: "2019", Component: Season2019 },
  { slug: "2018", Component: Season2018 },
  { slug: "2008", Component: Season2008 },
  { slug: "2006", Component: Season2006 },
  { slug: "2002", Component: Season2002 },
  { slug: "2001", Component: Season2001 },
  { slug: "2000", Component: Season2000 },
];

const menuSections = [
  {
    title: "Results",
    links: [
      {
        to: "/athletics/boys/baseball/yearly-results",
        label: "Full Year-by-Year Results",
      },
      {
        to: "/athletics/boys/baseball/records/opponents",
        label: "Opponent Game History",
      },
    ],
  },
  {
    title: "Team Stats",
    links: [
      {
        to: "/athletics/boys/baseball/team/full",
        label: "Full Team Stats",
      },
      {
        to: "/athletics/boys/baseball/records/team",
        label: "Team Single Game Records",
      },
      {
        to: "/athletics/boys/baseball/team/season-records",
        label: "Team Season Records",
      },
    ],
  },
  {
    title: "Individual Stats",
    links: [
      {
        to: "/athletics/boys/baseball/records/career",
        label: "Full Career Stats",
      },
      {
        to: "/athletics/boys/baseball/records/single-game",
        label: "Single Game Records",
      },
      {
        to: "/athletics/boys/baseball/records/season",
        label: "Season Records",
      },
      {
        to: "/athletics/boys/baseball/records/career-records",
        label: "Career Records",
      },
    ],
  },
];

export default function BoysBaseballApp() {
  return (
    <AthleticsProgramShell
      title="Baseball"
      menuTitle="Baseball"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/boys/baseball"
    >
      <div className="baseball-section">
        <Suspense fallback={<div className="py-10 text-center text-sm text-gray-600">Loading baseball page...</div>}>
          <Routes>
            <Route index element={<Home />} />

            <Route path="team/full" element={<FullTeamStats />} />
            <Route path="team/season-records" element={<TeamSeasonRecords />} />
            <Route path="records/career" element={<FullCareerStats />} />
            <Route path="records/season" element={<SeasonRecords />} />
            <Route path="records/career-records" element={<CareerRecords />} />
            <Route path="records/single-game" element={<SingleGameRecords />} />
            <Route path="records/team" element={<TeamSingleGameRecords />} />
            <Route path="records/opponents" element={<RecordsVsOpponents />} />

            {seasonPages.map(({ slug, Component }) => (
              <Route key={slug} path={`seasons/${slug}`} element={<Component />} />
            ))}

            <Route path="yearly-results" element={<YearlyResults />} />
            <Route path="games/:gameId" element={<GameDetail />} />
            <Route path="players/:playerId" element={<PlayerPage />} />

            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </div>
    </AthleticsProgramShell>
  );
}
