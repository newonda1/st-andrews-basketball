import React from "react";
import { Route, Routes } from "react-router-dom";

import AthleticsProgramShell from "../../components/AthleticsProgramShell";

import Home from "./pages/Home";
import GameDetail from "./pages/GameDetail";
import Season2006 from "./seasons/Season2006";

const menuSections = [
  {
    title: "Games",
    links: [
      {
        to: "/athletics/softball/games/20060324",
        label: "St. Andrew's 16, Abundant Life 3",
      },
    ],
  },
  {
    title: "Seasons",
    links: [
      {
        to: "/athletics/softball/seasons/2006",
        label: "Spring 2006 Season",
      },
    ],
  },
];

export default function SoftballApp() {
  return (
    <AthleticsProgramShell
      title="Softball"
      menuTitle="Softball"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/softball"
    >
      <Routes>
        <Route index element={<Home />} />
        <Route path="seasons/2006" element={<Season2006 />} />
        <Route path="games/:gameId" element={<GameDetail />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AthleticsProgramShell>
  );
}
