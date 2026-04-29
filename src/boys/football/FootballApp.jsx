import React from "react";
import { Route, Routes } from "react-router-dom";

import AthleticsProgramShell from "../../components/AthleticsProgramShell";

import YearlyResults from "./pages/YearlyResults";
import Season2025 from "./seasons/Season2025";

const menuSections = [
  {
    title: "Results",
    links: [
      {
        to: "/athletics/football/yearly-results",
        label: "Full Year-by-Year Results",
      },
      {
        to: "/athletics/football/seasons/2025",
        label: "2025 Season",
      },
    ],
  },
  {
    title: "Team Stats",
    links: [
      {
        to: "/athletics/football/seasons/2025#team-stats",
        label: "2025 Team Stats",
      },
    ],
  },
  {
    title: "Individual Stats",
    links: [
      {
        to: "/athletics/football/seasons/2025#individual-stats",
        label: "2025 Individual Stats",
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
          <Route index element={<YearlyResults />} />
          <Route path="yearly-results" element={<YearlyResults />} />
          <Route path="seasons/2025" element={<Season2025 />} />
          <Route path="*" element={<YearlyResults />} />
        </Routes>
      </div>
    </AthleticsProgramShell>
  );
}
