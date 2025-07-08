import React, { useEffect, useState } from "react";

function YearlyResults() {
  const [seasonStats, setSeasonStats] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("/data/games.json").then((res) => res.json()),
      fetch("/data/seasons.json").then((res) => res.json())
    ])
      .then(([gamesData, seasonsData]) => {
        processSeasonStats(gamesData, seasonsData);
      })
      .catch((err) => console.error("Failed to load data:", err));
  }, []);

  const processSeasonStats = (games, seasons) => {
    const seasonMap = {};
    seasons.forEach((s) => {
      seasonMap[String(s.SeasonID)] = s.HeadCoach || "Unknown";
    });

    const grouped = {};

    games.forEach((game) => {
      const season = String(game.Season);
      if (!grouped[season]) {
        grouped[season] = {
          season,
          coach: seasonMap[season] || "Unknown",
          overallW: 0,
          overallL: 0,
          homeW: 0,
          homeL: 0,
          awayW: 0,
          awayL: 0,
          tourneyW: 0,
          tourneyL: 0,
          playoffW: 0,
          playoffL: 0,
        };
      }

      const stats = grouped[season];
      const result = (game.Result || "").trim().toUpperCase();
      const isWin = result === "W";
      const isLoss = result === "L";

      const loc = game.LocationType;
      const type = game.GameType;

      if (isWin) stats.overallW += 1;
      if (isLoss) stats.overallL += 1;

      if (loc === "Home") {
        isWin ? stats.homeW++ : isLoss ? stats.homeL++ : null;
      } else if (loc === "Away") {
        isWin ? stats.awayW++ : isLoss ? stats.awayL++ : null;
      }

      if (type === "Region Tournament" || type === "State Tournament") {
        isWin ? stats.tourneyW++ : isLoss ? stats.tourneyL++ : null;
      }
    });

    const statsArray = Object.values(grouped).sort((a, b) =>
      a.season.localeCompare(b.season)
    );

    setSeasonStats(statsArray);
  };

  return (
    <div className="space-y-10 px-4">
      <h1 className="text-2xl font-bold text-center">Full Year-by-Year Results</h1>

      <div>
        <h2 className="text-xl font-semibold mb-2">Season Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-2 py-1">Season</th>
                <th className="border px-2 py-1">Coach</th>
                <th className="border px-2 py-1">W</th>
                <th className="border px-2 py-1">L</th>
                <th className="border px-2 py-1">Home W</th>
                <th className="border px-2 py-1">Home L</th>
                <th className="border px-2 py-1">Away W</th>
                <th className="border px-2 py-1">Away L</th>
                <th className="border px-2 py-1">Tourney W</th>
                <th className="border px-2 py-1">Tourney L</th>
                <th className="border px-2 py-1">Playoff W</th>
                <th className="border px-2 py-1">Playoff L</th>
              </tr>
            </thead>
            <tbody>
              {seasonStats.map((row, i) => (
                <tr key={i} className="text-center">
                  <td className="border px-2 py-1">{row.season}</td>
                  <td className="border px-2 py-1">{row.coach}</td>
                  <td className="border px-2 py-1">{row.overallW}</td>
                  <td className="border px-2 py-1">{row.overallL}</td>
                  <td className="border px-2 py-1">{row.homeW}</td>
                  <td className="border px-2 py-1">{row.homeL}</td>
                  <td className="border px-2 py-1">{row.awayW}</td>
                  <td className="border px-2 py-1">{row.awayL}</td>
                  <td className="border px-2 py-1">{row.tourneyW}</td>
                  <td className="border px-2 py-1">{row.tourneyL}</td>
                  <td className="border px-2 py-1">{row.playoffW}</td>
                  <td className="border px-2 py-1">{row.playoffL}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default YearlyResults;
