import React from "react";
import { Link, Routes, Route } from "react-router-dom";

import Home from "./Home";
import FullCareerStats from "./records/FullCareerStats";
import SeasonRecords from "./records/SeasonRecords";
import SingleGameRecords from "./records/SingleGameRecords";
import Season1992_93 from "./seasons/Season1992_93";
import Season2023_24 from "./seasons/Season2023_24";
import Season2024_25 from "./seasons/Season2024_25";
import Season2025_26 from "./seasons/Season2025_26";
import SeasonPlaceholder from "./seasons/SeasonPlaceholder";
import RecordsVsOpponents from "./pages/RecordsVsOpponents";
import YearlyResults from "./pages/YearlyResults";
import GameDetail from "./seasons/GameDetail";

// Central list of seasons that have dedicated pages
const seasonPages = [
  { slug: "1992-93", Component: Season1992_93 },
  { slug: "2023-24", Component: Season2023_24 },
  { slug: "2024-25", Component: Season2024_25 },
  { slug: "2025-26", Component: Season2025_26 },
];

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4 flex-shrink-0">
        <h1 className="text-xl font-bold mb-4">
          St. Andrew&apos;s Basketball
        </h1>

        <nav className="space-y-4">
          {/* Main */}
          <div>
            <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-1">
              Main
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/"
                  className="block px-2 py-1 rounded hover:bg-gray-800"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/yearly-results"
                  className="block px-2 py-1 rounded hover:bg-gray-800"
                >
                  Yearly Results
                </Link>
              </li>
            </ul>
          </div>

          {/* Records */}
          <div>
            <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-1">
              Records
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/records/career"
                  className="block px-2 py-1 rounded hover:bg-gray-800"
                >
                  Career Records
                </Link>
              </li>
              <li>
                <Link
                  to="/records/season"
                  className="block px-2 py-1 rounded hover:bg-gray-800"
                >
                  Season Records
                </Link>
              </li>
              <li>
                <Link
                  to="/records/single-game"
                  className="block px-2 py-1 rounded hover:bg-gray-800"
                >
                  Single Game Records
                </Link>
              </li>
              <li>
                <Link
                  to="/records/opponents"
                  className="block px-2 py-1 rounded hover:bg-gray-800"
                >
                  Records vs Opponents
                </Link>
              </li>
            </ul>
          </div>

          {/* Seasons */}
          <div>
            <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-1">
              Seasons
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/seasons/1992-93"
                  className="block px-2 py-1 rounded hover:bg-gray-800"
                >
                  1992–93 Season
                </Link>
              </li>
              <li>
                <Link
                  to="/seasons/2023-24"
                  className="block px-2 py-1 rounded hover:bg-gray-800"
                >
                  2023–24 Season
                </Link>
              </li>
              <li>
                <Link
                  to="/seasons/2024-25"
                  className="block px-2 py-1 rounded hover:bg-gray-800"
                >
                  2024–25 Season
                </Link>
              </li>
              <li>
                <Link
                  to="/seasons/2025-26"
                  className="block px-2 py-1 rounded hover:bg-gray-800"
                >
                  2025–26 Season
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-4">
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Records */}
          <Route path="/records/career" element={<FullCareerStats />} />
          <Route path="/records/season" element={<SeasonRecords />} />
          <Route path="/records/single-game" element={<SingleGameRecords />} />
          <Route path="/records/opponents" element={<RecordsVsOpponents />} />

          {/* Yearly Results table */}
          <Route path="/yearly-results" element={<YearlyResults />} />

          {/* Game detail */}
          <Route path="/games/:gameId" element={<GameDetail />} />

          {/* Explicit season pages from the seasonPages array */}
          {seasonPages.map(({ slug, Component }) => (
            <Route
              key={slug}
              path={`/seasons/${slug}`}
              element={<Component />}
            />
          ))}

          {/* Fallback / placeholder for any other season slug */}
          <Route path="/seasons/:seasonId" element={<SeasonPlaceholder />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
