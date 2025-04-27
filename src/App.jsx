import { Link } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";

function App() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [expandedDecades, setExpandedDecades] = useState({});
  const yearsByDecade = {
    "1970s": ["1978-79", "1979-80"],
    "1980s": ["1980-81", "1981-82", "1982-83", "1983-84", "1984-85", "1985-86", "1986-87", "1987-88", "1988-89", "1989-90"],
    "1990s": ["1990-91", "1991-92", "1992-93", "1993-94", "1994-95", "1995-96", "1996-97", "1997-98", "1998-99"],
    "2000s": ["1999-00", "2000-01", "2001-02", "2002-03", "2003-04", "2004-05", "2005-06", "2006-07", "2007-08", "2008-09"],
    "2010s": ["2009-10", "2010-11", "2011-12", "2012-13", "2013-14", "2014-15", "2015-16", "2016-17", "2017-18", "2018-19"],
    "2020s": ["2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25"],
  };


  useEffect(() => {
    fetch("/data/games.json")
      .then((res) => res.json())
      .then(setGames)
      .catch((err) => console.error("Failed to load games", err));

    fetch("/data/player_game_stats.json")
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
    <button
      className="fixed top-4 right-4 z-50"
      onClick={() => setMenuOpen(true)}
    >
      <img
        src="/images/button.png"
        alt="Menu"
        className="h-12 w-auto hover:scale-110 transition-transform duration-200 ease-in-out"
      />
    </button>
<div ref={sidebarRef} className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl transform ${menuOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out z-40`}>
  <div className="flex justify-center items-center p-4 border-b">
    <h2 className="text-xl font-bold">Menu</h2>
  </div>
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
            seasonOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
                className={`ml-6 overflow-hidden transition-all duration-500 ${
                  expandedDecades[decade] ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {yearsByDecade[decade].map((year) => (
                  <Link
                    key={year}
                    to={`/season/${year}`}
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

    {/* Legacy Players section */}
    <div className="border-t pt-4">
      <a
        href="/legacy-players"
        className="p-3 hover:bg-gray-200 rounded-md text-center"
      >
        Legacy Players
      </a>
    </div>

  </nav>
</div>

      <img src="/logo.png" alt="St. Andrew's Logo" className="h-20 mx-auto mb-4" />
      <h1 className="text-3xl font-bold">
        Celebrating the Legacy of St. Andrew&apos;s Basketball
      </h1>
    </header>
      <section className="mb-12">
  <div className="bg-gray-100 rounded-xl p-8 shadow-md">
<p className="text-lg leading-relaxed mb-4 text-justify">
    The history of St. Andrew’s boys basketball is one of resilience, transformation, and championship legacy. Over nearly five decades, the program has evolved from its early foundational years into a powerhouse within Georgia's independent school athletics.
</p>
<p className="text-lg leading-relaxed mb-4 text-justify">
    The team began its journey in the late 1970s under Coach Dave Clay, who led the program through its early GISA seasons and into SCISA competition. These early years were marked by the grit and consistency required to build a program from the ground up. Coaches like Ron Lassiter, Joel Smoker, and Don Sherwood each helped lay the bricks of a growing basketball identity through the 1980s and early 1990s. The wins were often hard-fought, and the records fluctuated, but each season brought the team closer to a cohesive culture.
</p>
  <div className="md:float-left md:mr-6 mb-6 text-center w-full md:w-80 animate-fade-in">
    <img
    src="/images/first_team_1978.png"
    alt="1978-79 St. Andrew's Basketball Team"
    className="w-full h-auto rounded-lg shadow-md mb-2"
    />
    <p className="text-sm italic">1978-79 St. Andrew's first boys basketball team</p>
  </div>
<p className="text-lg leading-relaxed mb-4 text-justify">
    The 1992–1993 season marked a major milestone when Coach Paul Hill led the Lions to their first state championship in program history, capturing the GISA AA title. That breakthrough season set a new standard for the program and sparked a sense of belief that St. Andrew’s could compete at the highest levels.
</p>
  <div className="md:float-right md:ml-6 mb-6 text-center w-full md:w-52 animate-fade-in">
    <img
    src="/images/chris_haslem_1993.png"
    alt="Chris Haslem during the 1992-93 Championship Season"
    className="w-full h-auto rounded-lg shadow-md mb-2"
    />
    <p className="text-sm italic">Chris Haslem leading the Lions to their first state title in 1993</p>
  </div>
<p className="text-lg leading-relaxed mb-4 text-justify">
    The mid-90s through early 2000s continued that momentum. Under Coach Frank Dickson, the Lions built a reputation for postseason grit, culminating in a 1998 SCISA AA State Championship. That success was followed by another title in 2004 under Coach Michael Bennett, further solidifying the Lions as a consistent contender. During this stretch, the team became known for its strong home-court presence, quick defense, and tournament resilience.
  </p>
<p className="text-lg leading-relaxed mb-4 text-justify">
    A transitional period followed in the late 2000s and early 2010s under Coach Joe Thoni, who brought stability and steady leadership. While state titles remained elusive during this stretch, the Lions remained a competitive presence in SCISA and continued to develop the foundation of a strong, enduring program.
  </p>
         <div className="md:float-left md:mr-6 mb-6 text-center w-full md:w-80 animate-fade-in">
    <img
    src="/images/state_champions_2025.jpg"
    alt="2024-2025 State Championship Team"
    className="w-full h-auto rounded-lg shadow-md mb-2"
    />
    <p className="text-sm italic">The players, coaches, and cheerleaders of the 2024-2025 state championship team</p>
  </div>
<p className="text-lg leading-relaxed mb-4 text-justify">
    The arrival of Coach Mel Abrams Jr. in 2015 ushered in the most dominant era in St. Andrew’s basketball history. With a focus on culture, accountability, and high-level competition, Coach Abrams led the Lions to three state championships (2022, 2023, and 2025), including back-to-back GIAA AAA titles. His teams have averaged over 18 wins per season, regularly advanced deep into the playoffs, and elevated the program into one of the premier forces in Georgia’s independent school ranks.
  </p>
  <p className="text-lg leading-relaxed">
    Across 639 total wins, 16 region championships, and 6 state championships, the story of St. Andrew’s basketball is one of perseverance and pride. It’s a story of student-athletes and coaches who committed themselves to excellence on and off the court, carrying the banner of the Lions through triumphs and trials alike. As new seasons unfold, they add chapters to this proud legacy—one game at a time.
  </p>
    </div>
</section>
  </div>
);
}

export default App;
