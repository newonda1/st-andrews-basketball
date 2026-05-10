import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import AthleticsProgramShell from "../../components/AthleticsProgramShell";
import AthleteProfileRedirect from "../../components/AthleteProfileRedirect";

import Home from "./pages/Home";
import YearlyResults from "./pages/YearlyResults";
import Season2006 from "./seasons/Season2006";

const GameDetail = lazy(() => import("./pages/GameDetail"));

const seasonPages = [
  { slug: "2006", Component: Season2006 },
];

const menuSections = [
  {
    title: "Results",
    links: [
      {
        to: "/athletics/softball/yearly-results",
        label: "Full Year-by-Year Results",
      },
      {
        to: "/athletics/softball/records/opponents",
        label: "Opponent Game History",
      },
    ],
  },
  {
    title: "Team Stats",
    links: [
      {
        to: "/athletics/softball/team/full",
        label: "Full Team Stats",
      },
      {
        to: "/athletics/softball/records/team",
        label: "Team Single Game Records",
      },
      {
        to: "/athletics/softball/team/season-records",
        label: "Team Season Records",
      },
    ],
  },
  {
    title: "Individual Stats",
    links: [
      {
        to: "/athletics/softball/records/career",
        label: "Full Career Stats",
      },
      {
        to: "/athletics/softball/records/single-game",
        label: "Single Game Records",
      },
      {
        to: "/athletics/softball/records/season",
        label: "Season Records",
      },
      {
        to: "/athletics/softball/records/career-records",
        label: "Career Records",
      },
    ],
  },
];

function ArchivePlaceholder({ title }) {
  return (
    <div className="max-w-6xl mx-auto py-10 lg:pb-40">
      <h1 className="text-3xl font-bold text-center">{title}</h1>
      <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
        <p className="text-base font-semibold text-gray-800">Softball archive page coming soon</p>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          This page is in place to match the baseball section structure and will be filled as softball source data is added.
        </p>
      </div>
    </div>
  );
}

export default function SoftballApp() {
  return (
    <AthleticsProgramShell
      title="Softball"
      menuTitle="Softball"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/softball"
    >
      <div className="softball-section">
        <Suspense fallback={<div className="py-10 text-center text-sm text-gray-600">Loading softball page...</div>}>
          <Routes>
            <Route index element={<Home />} />

            <Route path="yearly-results" element={<YearlyResults />} />
            <Route path="team/full" element={<ArchivePlaceholder title="Full Team Stats" />} />
            <Route path="team/season-records" element={<ArchivePlaceholder title="Team Season Records" />} />
            <Route path="records/career" element={<ArchivePlaceholder title="Full Career Stats" />} />
            <Route path="records/season" element={<ArchivePlaceholder title="Season Records" />} />
            <Route path="records/career-records" element={<ArchivePlaceholder title="Career Records" />} />
            <Route path="records/single-game" element={<ArchivePlaceholder title="Single Game Records" />} />
            <Route path="records/team" element={<ArchivePlaceholder title="Team Single Game Records" />} />
            <Route path="records/opponents" element={<ArchivePlaceholder title="Opponent Game History" />} />

            {seasonPages.map(({ slug, Component }) => (
              <Route key={slug} path={`seasons/${slug}`} element={<Component />} />
            ))}

            <Route path="games/:gameId" element={<GameDetail />} />
            <Route path="players/:playerId" element={<AthleteProfileRedirect />} />

            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </div>
    </AthleticsProgramShell>
  );
}
