import React from "react";
import { Route, Routes } from "react-router-dom";

import AthleticsProgramShell from "../../components/AthleticsProgramShell";

import Season2026 from "./seasons/Season2026";
import Season2025 from "./seasons/Season2025";
import Season2024 from "./seasons/Season2024";
import Season2023 from "./seasons/Season2023";
import Season2022 from "./seasons/Season2022";
import Season2021 from "./seasons/Season2021";
import Season2020 from "./seasons/Season2020";
import Season2019 from "./seasons/Season2019";
import Season2018 from "./seasons/Season2018";

import YearlyResults from "./pages/YearlyResults";
import GameDetail from "./pages/GameDetail";
import PlayerPage from "./pages/PlayerPage";
import RecordsVsOpponents from "./pages/RecordsVsOpponents";
import FullCareerStats from "./pages/FullCareerStats";
import FullTeamStats from "./pages/FullTeamStats";
import SingleGameRecords from "./pages/SingleGameRecords";
import SeasonRecords from "./pages/SeasonRecords";
import CareerRecords from "./pages/CareerRecords";

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
        label: "Team Records (Single Game)",
      },
      {
        to: "/athletics/boys/baseball/team/season-records",
        label: "Team Records (Season)",
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

function PlaceholderPage({ title, text }) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      <p>{text}</p>
    </div>
  );
}

export default function BoysBaseballApp() {
  return (
    <AthleticsProgramShell
      title="Boys' Baseball"
      menuTitle="Boys' Baseball"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
    >
      <Routes>
        <Route index element={<YearlyResults />} />

        <Route path="team/full" element={<FullTeamStats />} />
        <Route path="records/career" element={<FullCareerStats />} />
        <Route path="records/season" element={<SeasonRecords />} />
        <Route path="records/career-records" element={<CareerRecords />} />
        <Route path="records/single-game" element={<SingleGameRecords />} />
        <Route
          path="records/team"
          element={
            <PlaceholderPage
              title="Team Records"
              text="This page will eventually show baseball team records."
            />
          }
        />
        <Route path="records/opponents" element={<RecordsVsOpponents />} />

        {seasonPages.map(({ slug, Component }) => (
          <Route key={slug} path={`seasons/${slug}`} element={<Component />} />
        ))}

        <Route path="yearly-results" element={<YearlyResults />} />
        <Route path="games/:gameId" element={<GameDetail />} />
        <Route path="players/:playerId" element={<PlayerPage />} />

        <Route path="*" element={<YearlyResults />} />
      </Routes>
    </AthleticsProgramShell>
  );
}
