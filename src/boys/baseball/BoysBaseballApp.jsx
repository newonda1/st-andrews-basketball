import React, { useEffect, useRef, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";

import Season2026 from "./seasons/Season2026";
import Season2025 from "./seasons/Season2025";
import Season2024 from "./seasons/Season2024";
import Season2023 from "./seasons/Season2023";

import YearlyResults from "./pages/YearlyResults";
import GameDetail from "./pages/GameDetail";
import PlayerPage from "./pages/PlayerPage";
import RecordsVsOpponents from "./pages/RecordsVsOpponents";
import SingleGameRecords from "./pages/SingleGameRecords";
import SeasonRecords from "./pages/SeasonRecords";

const seasonPages = [
  { slug: "2026", Component: Season2026 },
  { slug: "2025", Component: Season2025 },
  { slug: "2024", Component: Season2024 },
  { slug: "2023", Component: Season2023 },
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
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [teamStatsOpen, setTeamStatsOpen] = useState(false);
  const [individualStatsOpen, setIndividualStatsOpen] = useState(false);

  const sidebarRef = useRef(null);

  useEffect(() => {
    fetch("/data/boys/baseball/games.json")
      .then((res) => res.json())
      .then(setGames)
      .catch((err) => console.error("Failed to load games", err));

    fetch("/data/boys/baseball/playergamestats.json")
      .then((res) => res.json())
      .then(setPlayerStats)
      .catch((err) => console.error("Failed to load player stats", err));

    fetch("/data/boys/players.json")
      .then((res) => res.json())
      .then(setPlayers)
      .catch((err) => console.error("Failed to load players", err));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      <header className="text-center">
        <div
          ref={sidebarRef}
          className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl flex flex-col transform ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out z-40`}
        >
          <div className="flex justify-center items-center p-4 border-b">
            <h2 className="text-xl font-bold">Menu</h2>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth">
            <nav className="flex flex-col p-4 space-y-2 text-lg font-medium">
              <Link
                to="/athletics/boys/baseball/yearly-results"
                className="p-3 hover:bg-gray-200 rounded-md text-center"
                onClick={() => setMenuOpen(false)}
              >
                Full Year-by-Year Results
              </Link>

              <div className="border-t pt-4">
                <Link
                  to="/athletics/boys/baseball/records/opponents"
                  className="block p-3 hover:bg-gray-200 rounded-md text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Opponent Game History
                </Link>
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={() => setTeamStatsOpen((prev) => !prev)}
                  className="flex items-center justify-between w-full p-3 hover:bg-gray-200 rounded-md"
                >
                  <span>Team Stats</span>
                  <span
                    className={`ml-2 inline-block transform transition-transform duration-300 ${
                      teamStatsOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {teamStatsOpen && (
                  <div className="ml-4 overflow-hidden transition-all duration-500">
                    <Link
                      to="/athletics/boys/baseball/team/full"
                      className="block px-2 py-1 text-sm hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Full Team Stats
                    </Link>
                    <Link
                      to="/athletics/boys/baseball/records/team"
                      className="block px-2 py-1 text-sm hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Team Records (Single Game)
                    </Link>
                    <Link
                      to="/athletics/boys/baseball/team/season-records"
                      className="block px-2 py-1 text-sm hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Team Records (Season)
                    </Link>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={() => setIndividualStatsOpen((prev) => !prev)}
                  className="flex items-center justify-between w-full p-3 hover:bg-gray-200 rounded-md"
                >
                  <span>Individual Stats</span>
                  <span
                    className={`ml-2 inline-block transform transition-transform duration-300 ${
                      individualStatsOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {individualStatsOpen && (
                  <div className="ml-4 overflow-hidden transition-all duration-500">
                    <Link
                      to="/athletics/boys/baseball/records/career"
                      className="block px-2 py-1 text-sm hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Full Career Stats
                    </Link>
                    <Link
                      to="/athletics/boys/baseball/records/single-game"
                      className="block px-2 py-1 text-sm hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Single Game Records
                    </Link>
                    <Link
                      to="/athletics/boys/baseball/records/season"
                      className="block px-2 py-1 text-sm hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Season Records
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 px-4 h-20">
          <div className="flex items-center gap-3">
            <Link
              to="/athletics/boys/baseball"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/images/common/logo.png"
                alt="St. Andrew's Logo"
                className="h-12 w-auto"
              />
              <h1 className="text-xl font-bold text-blue-800 whitespace-nowrap">
                Boys&apos; Baseball
              </h1>
            </Link>
          </div>

          <button onClick={() => setMenuOpen(true)}>
            <img
              src="/images/common/button.png"
              alt="Menu"
              className="h-10 w-auto hover:scale-110 transition-transform duration-200 ease-in-out"
            />
          </button>
        </div>
      </header>

      <Routes>
        <Route index element={<YearlyResults />} />

        <Route
          path="records/career"
          element={
            <PlaceholderPage
              title="Full Career Stats"
              text="This page will eventually show full career statistics for baseball players in the database."
            />
          }
        />
        <Route path="records/season" element={<SeasonRecords />} />
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
    </div>
  );
}
