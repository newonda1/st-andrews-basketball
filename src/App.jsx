import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

function App() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);

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

  const playerMap = Object.fromEntries(
    players.map((p) => [p.PlayerID, `${p.FirstName} ${p.LastName}`])
  );

  return (
  <div className="p-6 max-w-5xl mx-auto space-y-10">
    <header className="text-center">
      <img src="/logo.png" alt="St. Andrew's Logo" className="h-20 mx-auto mb-4" />
      <h1 className="text-3xl font-bold">
        Celebrating the Legacy of St. Andrew&apos;s Basketball
      </h1>
    </header>
      <section className="mb-12">
 
  <p className="text-lg leading-relaxed mb-4">
    The history of St. Andrew’s boys basketball is one of resilience, transformation, and championship legacy. Over nearly five decades, the program has evolved from its early foundational years into a powerhouse within Georgia's independent school athletics.
  </p>
  <p className="text-lg leading-relaxed mb-4">
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
  <p className="text-lg leading-relaxed mb-4">
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
  <p className="text-lg leading-relaxed mb-4">
    The mid-90s through early 2000s continued that momentum. Under Coach Frank Dickson, the Lions built a reputation for postseason grit, culminating in a 1998 SCISA AA State Championship. That success was followed by another title in 2004 under Coach Michael Bennett, further solidifying the Lions as a consistent contender. During this stretch, the team became known for its strong home-court presence, quick defense, and tournament resilience.
  </p>
  <p className="text-lg leading-relaxed mb-4">
    A transitional period followed in the late 2000s and early 2010s under Coach Joe Thoni, who brought stability and steady leadership. While state titles remained elusive during this stretch, the Lions remained a competitive presence in SCISA and continued to develop the foundation of a strong, enduring program.
  </p>
  <p className="text-lg leading-relaxed mb-4">
    The arrival of Coach Mel Abrams Jr. in 2015 ushered in the most dominant era in St. Andrew’s basketball history. With a focus on culture, accountability, and high-level competition, Coach Abrams led the Lions to three state championships (2022, 2023, and 2025), including back-to-back GIAA AAA titles. His teams have averaged over 18 wins per season, regularly advanced deep into the playoffs, and elevated the program into one of the premier forces in Georgia’s independent school ranks.
  </p>
  <p className="text-lg leading-relaxed">
    Across 639 total wins, 66 tournament victories, and 62 playoff wins, the story of St. Andrew’s basketball is one of perseverance and pride. It’s a story of student-athletes and coaches who committed themselves to excellence on and off the court, carrying the banner of the Lions through triumphs and trials alike. As new seasons unfold, they add chapters to this proud legacy—one game at a time.
  </p>
</section>

    <section className="text-center">
      <h2 className="text-2xl font-semibold mt-10 mb-4">Individual Season Results</h2>
      <Link
        to="/season/2024"
        className="inline-block text-blue-600 hover:text-blue-800 underline text-lg font-medium"
>
  View 2024–2025 Season
</Link>

    </section>

  </div>
);
}

export default App;
