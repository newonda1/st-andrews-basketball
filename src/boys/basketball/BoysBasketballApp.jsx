import React, { useEffect, useRef, useState } from "react";
import { Link, Routes, Route, useParams } from "react-router-dom";

import Home from "./pages/Home";
import FullCareerStats from "./pages/FullCareerStats";
import SeasonRecords from "./pages/SeasonRecords";
import SingleGameRecords from "./pages/SingleGameRecords";

import Season1978_79 from "./seasons/Season1978_79";
import Season1992_93 from "./seasons/Season1992_93";
import Season2023_24 from "./seasons/Season2022_23";
import Season2023_24 from "./seasons/Season2023_24";
import Season2024_25 from "./seasons/Season2024_25";
import Season2025_26 from "./seasons/Season2025_26";
import SeasonPlaceholder from "./seasons/SeasonPlaceholder";
import TeamRecords from "./pages/TeamRecords";

import RecordsVsOpponents from "./pages/RecordsVsOpponents";
import YearlyResults from "./pages/YearlyResults";
import GameDetail from "./pages/GameDetail";
import GameDetailHistorical from "./pages/GameDetailHistorical";
import PlayerPage from "./pages/PlayerPage";

const seasonPages = [
  { slug: "1978-79", Component: Season1978_79 },
  { slug: "1992-93", Component: Season1992_93 },
  { slug: "2023-24", Component: Season2022_23 },
  { slug: "2023-24", Component: Season2023_24 },
  { slug: "2024-25", Component: Season2024_25 },
  { slug: "2025-26", Component: Season2025_26 },
];

// ✅ Decides which game detail page to render based on the game's Season
function GameDetailRouter() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadGame() {
      setLoading(true);
      try {
        const res = await fetch("/data/boys/basketball/games.json");
        const gamesData = await res.json();
        const g = gamesData.find((x) => Number(x.GameID) === Number(gameId));

        if (!cancelled) setGame(g || null);
      } catch (err) {
        console.error("Failed to load game for router:", err);
        if (!cancelled) setGame(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGame();
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!game) return <div className="p-4">Game not found.</div>;

  // ✅ Choose your cutoff. I used <= 1999 as "historical".
  const isHistorical = Number(game.Season) <= 2011;

  return isHistorical ? <GameDetailHistorical /> : <GameDetail />;
}

function BoysBasketballApp() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [teamStatsOpen, setTeamStatsOpen] = useState(false);
  const [individualStatsOpen, setIndividualStatsOpen] = useState(false);

  const sidebarRef = useRef(null);

  // Load core data (kept here in case other pages/components depend on it later)
  useEffect(() => {
    fetch("/data/boys/basketball/games.json")
      .then((res) => res.json())
      .then(setGames)
      .catch((err) => console.error("Failed to load games", err));

    fetch("/data/boys/basketball/playergamestats.json")
      .then((res) => res.json())
      .then(setPlayerStats)
      .catch((err) => console.error("Failed to load player stats", err));

    fetch("/data/boys/basketball/players.json")
      .then((res) => res.json())
      .then(setPlayers)
      .catch((err) => console.error("Failed to load players", err));
  }, []);

  // Close sidebar when clicking outside
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
        {/* Sidebar */}
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
              {/* Full Year-by-Year Results */}
              <Link
                to="/athletics/boys/basketball/yearly-results"
                className="p-3 hover:bg-gray-200 rounded-md text-center"
                onClick={() => setMenuOpen(false)}
              >
                Full Year-by-Year Results
              </Link>

              {/* Opponent Game History (was Records vs. Opponents) */}
              <div className="border-t pt-4">
                <Link
                  to="/athletics/boys/basketball/records/opponents"
                  className="block p-3 hover:bg-gray-200 rounded-md text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Opponent Game History
                </Link>
              </div>

              {/* Team Stats */}
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
                      to="/athletics/boys/basketball/team/full"
                      className="block px-2 py-1 text-sm hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Full Team Stats
                    </Link>
                    <Link
                      to="/athletics/boys/basketball/records/team"
                      className="block px-2 py-1 text-sm hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Team Records (Single Game)
                    </Link>
                    <Link
                      to="/athletics/boys/basketball/team/season-records"
                      className="block px-2 py-1 text-sm hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Team Records (Season)
                    </Link>
                  </div>
                )}
              </div>

              {/* Individual Stats */}
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
                      to="/athletics/boys/basketball/records/career"
                      className="block px-2 py-1 text-sm hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Full Career Stats
                    </Link>
                    <Link
                      to="/athletics/boys/basketball/records/single-game"
                      className="block px-2 py-1 text-sm hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Single Game Records
                    </Link>
                    <Link
                      to="/athletics/boys/basketball/records/season"
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

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 px-4 h-20">
          <div className="flex items-center gap-3">
            <Link
              to="/athletics/boys/basketball"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/images/common/logo.png"
                alt="St. Andrew's Logo"
                className="h-12 w-auto"
              />
              <h1 className="text-xl font-bold text-blue-800 whitespace-nowrap">
                Boys&apos; Basketball
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
        {/* Index route: /athletics/boys/basketball */}
        <Route index element={<Home />} />

        {/* Records */}
        <Route path="records/career" element={<FullCareerStats />} />
        <Route path="records/season" element={<SeasonRecords />} />
        <Route path="records/single-game" element={<SingleGameRecords />} />
        <Route path="records/team" element={<TeamRecords />} />
        <Route path="records/opponents" element={<RecordsVsOpponents />} />

        {/* Seasons */}
        {seasonPages.map(({ slug, Component }) => (
          <Route key={slug} path={`seasons/${slug}`} element={<Component />} />
        ))}
        <Route path="seasons/:seasonId" element={<SeasonPlaceholder />} />

        {/* Other pages */}
        <Route path="yearly-results" element={<YearlyResults />} />
        <Route path="games/:gameId" element={<GameDetailRouter />} />
        <Route path="players/:playerId" element={<PlayerPage />} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default BoysBasketballApp;
