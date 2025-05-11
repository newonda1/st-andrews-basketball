import { Link, Routes, Route } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import Home from './Home';
import FullCareerStats from './records/FullCareerStats';
import SeasonRecords from './records/SeasonRecords';
import SingleGameRecords from './records/SingleGameRecords';
import ChrisHaslam from './legacy/ChrisHaslam';
import Season2024_25 from './seasons/Season2024_25';
import SeasonPlaceholder from './seasons/SeasonPlaceholder';
import RecordsVsOpponents from './pages/RecordsVsOpponents';

function App() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [expandedDecades, setExpandedDecades] = useState({});
  const yearsByDecade = {
    "1970s": ["1978-79", "1979-80"],
    "1980s": ["1980-81", "1981-82", "1982-83", "1983-84", "1984-85", "1985-86", "1986-87", "1987-88", "1988-89", "1989-90"],
    "1990s": ["1990-91", "1991-92", "1992-93", "1993-94", "1994-95", "1995-96", "1996-97", "1997-98", "1998-99", "1999-00"],
    "2000s": ["2000-01", "2001-02", "2002-03", "2003-04", "2004-05", "2005-06", "2006-07", "2007-08", "2008-09", "2009-10"],
    "2010s": ["2010-11", "2011-12", "2012-13", "2013-14", "2014-15", "2015-16", "2016-17", "2017-18", "2018-19", "2019-20"],
    "2020s": ["2020-21", "2021-22", "2022-23", "2023-24", "2024-25"],
  };
  const [legacyOpen, setLegacyOpen] = useState(false);

  useEffect(() => {
    fetch("/data/games.json")
      .then((res) => res.json())
      .then(setGames)
      .catch((err) => console.error("Failed to load games", err));

    fetch("/data/playergamestats.json")
      .then((res) => res.json())
      .then(setPlayerStats)
      .catch((err) => console.error("Failed to load player stats", err));

    fetch("/data/players.json")
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
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const playerMap = Object.fromEntries(
    players.map((p) => [p.PlayerID, `${p.FirstName} ${p.LastName}`])
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      <header className="text-center">
      <div ref={sidebarRef} className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl flex flex-col transform ${menuOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out z-40`}>
        <div className="flex justify-center items-center p-4 border-b">
          <h2 className="text-xl font-bold">Menu</h2>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth">
          <nav className="flex flex-col p-4 space-y-2 text-lg font-medium">
            {/* Full Year-by-Year Results */}
            <a
              href="/yearly-results"
              className="p-3 hover:bg-gray-200 rounded-md text-center"
              >
              Full Year-by-Year Results
            </a>

            {/* Individual Season Results with Expandable Decades */}
            <div className="border-t pt-4">
              <button
                onClick={() => setSeasonOpen(!seasonOpen)}
                className="flex items-center justify-between w-full p-3 hover:bg-gray-200 rounded-md"
                >
                <span>Individual Season Results</span>
                <span
                   className={`ml-2 inline-block transform transition-transform duration-300 ${
                   seasonOpen ? "rotate-180" : "rotate-0"
                   }`}
                   >
                   ▼
                </span>
              </button>

            {/* Decades Expand */}
            {seasonOpen && (
              <div
                className={`ml-4 overflow-hidden transition-all duration-500 ${
                seasonOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                }`}
                >
                {["1970s", "1980s", "1990s", "2000s", "2010s", "2020s"].map((decade) => (
                  <div key={decade}>
                    <button
                      onClick={() =>
                      setExpandedDecades((prev) => ({
                      ...prev,
                      [decade]: !prev[decade],
                       }))
                      }
                      className="flex items-center justify-between w-full p-2 hover:bg-gray-100"
                      >
                <span>{decade}</span>
                <span
                  className={`ml-2 inline-block transform transition-transform duration-300 ${
                    expandedDecades[decade] ? "rotate-180" : "rotate-0"
                  }`}
                >
                  ▶
                </span>
              </button>

              {/* Expand Years smoothly */}
              <div
                className={`ml-6 overflow-hidden overflow-y-auto transition-all duration-500 ${
                  expandedDecades[decade] ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                } custom-scrollbar`}
              >

                {yearsByDecade[decade].map((year) => (
                  <Link
                    key={year}
                    to={`/seasons/${year}`}
                    className="block px-2 py-1 text-sm hover:bg-gray-200"
                  >
                    {year}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="border-t pt-4">
      <Link
        to="/records/opponents"
        className="block p-3 hover:bg-gray-200 rounded-md text-center"
      >
        Records vs. Opponents
      </Link>
    </div>

    {/* Legacy Players section */}
    <div className="border-t pt-4">
      <button
        onClick={() => setLegacyOpen(!legacyOpen)}
        className="flex items-center justify-between w-full p-3 hover:bg-gray-200 rounded-md"
      >
        <span>Legacy Players</span>
        <span
          className={`ml-2 inline-block transform transition-transform duration-300 ${
            legacyOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          ▼
        </span>
      </button>
      {legacyOpen && (
        <div className="ml-4">
          <Link
            to="/legacy/ChrisHaslam"
            className="block px-2 py-1 text-sm hover:bg-gray-200"
          >
            Chris Haslam
          </Link>
        </div>
      )}
    </div>

    {/* All-Time Records Section */}
<div className="border-t pt-4">
  <button
    onClick={() => setRecordsOpen(!recordsOpen)}
    className="flex items-center justify-between w-full p-3 hover:bg-gray-200 rounded-md"
  >
    <span>Individual Player Stats</span>
    <span
      className={`ml-2 inline-block transform transition-transform duration-300 ${
        recordsOpen ? "rotate-180" : "rotate-0"
      }`}
    >
      ▼
    </span>
  </button>

  {recordsOpen && (
    <div className="ml-4 overflow-hidden transition-all duration-500">
      <Link
        to="/records/career"
        className="block px-2 py-1 text-sm hover:bg-gray-200"
      >
        Full Career Stats
      </Link>
      <Link
        to="/records/season"
        className="block px-2 py-1 text-sm hover:bg-gray-200"
      >
        Season Records
      </Link>
      <Link
        to="/records/single-game"
        className="block px-2 py-1 text-sm hover:bg-gray-200"
      >
        Single Game Records
      </Link>
    </div>
  )}
</div>

  </nav>
</div>
  </div>
    <div className="flex items-center justify-between mb-4 px-4 h-20">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="St. Andrew's Logo" className="h-12 w-auto" />
          <h1 className="text-xl font-bold text-blue-800 whitespace-nowrap">Boys' Basketball</h1>
        </Link>
      </div>
      <button onClick={() => setMenuOpen(true)}>
        <img
          src="/images/button.png"
          alt="Menu"
          className="h-10 w-auto hover:scale-110 transition-transform duration-200 ease-in-out"
        />
      </button>
    </div>

    </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/records/career" element={<FullCareerStats />} />
        <Route path="/records/season" element={<SeasonRecords />} />
        <Route path="/records/single-game" element={<SingleGameRecords />} />
        <Route path="/legacy/ChrisHaslam" element={<ChrisHaslam />} />
        <Route path="/seasons/2024-25" element={<Season2024_25 />} />
        <Route path="/seasons/:seasonId" element={<SeasonPlaceholder />} />
        <Route path="/records/opponents" element={<RecordsVsOpponents />} />
      </Routes>
  </div>
);
}

export default App;
