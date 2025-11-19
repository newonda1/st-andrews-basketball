import React, { useEffect, useState } from "react";

// Turn "1978" into "1978-79", leave labels like "1992-93" alone
function formatSeasonLabel(rawSeason) {
  const s = String(rawSeason);

  // If it already has a dash (e.g. "1992-93"), assume it's already formatted
  if (s.includes("-")) return s;

  // If it's a 4-digit year, make "YYYY-YY"
  if (s.length === 4 && !Number.isNaN(Number(s))) {
    const startYear = Number(s);
    const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
    return `${startYear}-${endYearShort}`;
  }

  // Fallback
  return s;
}

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
      seasonMap[String(s.SeasonID)] = {
        coach: s.HeadCoach || "Unknown",
        label: `${s.YearStart}–${String(s.YearEnd).slice(-2)}`,
        result: `${s.RegionFinish}${s.StateFinish ? " & " + s.StateFinish : ""}`
      };
    });

    const grouped = {};

    games.forEach((game) => {
      const season = String(game.Season);
      if (!grouped[season]) {
        grouped[season] = {
          season,
          seasonLabel: seasonMap[season]?.label || season,
          coach: seasonMap[season]?.coach || "Unknown",
          seasonResult: seasonMap[season]?.result || "",
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
          regionW: 0,
          regionL: 0,
        };
      }

      const stats = grouped[season];
      const result = (game.Result || "").trim().toUpperCase();
      const isWin = result === "W";
      const isLoss = result === "L";

      const loc = game.LocationType;
      const type = game.GameType;

      if (isWin) stats.overallW++;
      if (isLoss) stats.overallL++;

      if (loc === "Home") {
        isWin ? stats.homeW++ : isLoss ? stats.homeL++ : null;
      } else if (loc === "Away") {
        isWin ? stats.awayW++ : isLoss ? stats.awayL++ : null;
      }

      if (type === "Tournament" || type === "Showcase") {
        isWin ? stats.tourneyW++ : isLoss ? stats.tourneyL++ : null;
      }

      if (type === "Region Tournament" || type === "State Tournament") {
        isWin ? stats.playoffW++ : isLoss ? stats.playoffL++ : null;
      }

      if (type === "Region") {
        isWin ? stats.regionW++ : isLoss ? stats.regionL++ : null;
      }
    });

    const statsArray = Object.values(grouped).sort((a, b) =>
      a.season.localeCompare(b.season)
    );

    setSeasonStats(statsArray);
  };

  const formatRecord = (wins, losses) => `${wins}–${losses}`;

  const calculateTotals = () => {
    return seasonStats.reduce(
      (totals, row) => {
        totals.overallW += row.overallW;
        totals.overallL += row.overallL;
        totals.regionW += row.regionW;
        totals.regionL += row.regionL;
        totals.homeW += row.homeW;
        totals.homeL += row.homeL;
        totals.awayW += row.awayW;
        totals.awayL += row.awayL;
        totals.tourneyW += row.tourneyW;
        totals.tourneyL += row.tourneyL;
        totals.playoffW += row.playoffW;
        totals.playoffL += row.playoffL;
        return totals;
      },
      {
        overallW: 0,
        overallL: 0,
        regionW: 0,
        regionL: 0,
        homeW: 0,
        homeL: 0,
        awayW: 0,
        awayL: 0,
        tourneyW: 0,
        tourneyL: 0,
        playoffW: 0,
        playoffL: 0,
      }
    );
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-10 px-4">
      <h1 className="text-2xl font-bold text-center">Full Year-by-Year Results</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm border">
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className="border px-2 py-1">Season</th>
              <th className="border px-2 py-1">Coach</th>
              <th className="border px-2 py-1">Overall</th>
              <th className="border px-2 py-1">Region</th>
              <th className="border px-2 py-1">Home</th>
              <th className="border px-2 py-1">Away</th>
              <th className="border px-2 py-1">Tourney/<br />Showcase</th>
              <th className="border px-2 py-1">Playoffs</th>
              <th className="border px-2 py-1">Season Result</th>
            </tr>
          </thead>
          <tbody>
            {seasonStats.map((row, i) => (
              <tr key={i} className="text-center">
                <td className="border px-2 py-1">{row.seasonLabel}</td>
                <td className="border px-2 py-1">{row.coach}</td>
                <td className="border px-2 py-1">{formatRecord(row.overallW, row.overallL)}</td>
                <td className="border px-2 py-1">{formatRecord(row.regionW, row.regionL)}</td>
                <td className="border px-2 py-1">{formatRecord(row.homeW, row.homeL)}</td>
                <td className="border px-2 py-1">{formatRecord(row.awayW, row.awayL)}</td>
                <td className="border px-2 py-1">{formatRecord(row.tourneyW, row.tourneyL)}</td>
                <td className="border px-2 py-1">{formatRecord(row.playoffW, row.playoffL)}</td>
                <td className="border px-2 py-1">{row.seasonResult}</td>
              </tr>
            ))}
            <tr className="bg-gray-200 font-bold text-center">
              <td className="border px-2 py-1"></td>
              <td className="border px-2 py-1">Totals</td>
              <td className="border px-2 py-1">{formatRecord(totals.overallW, totals.overallL)}</td>
              <td className="border px-2 py-1">{formatRecord(totals.regionW, totals.regionL)}</td>
              <td className="border px-2 py-1">{formatRecord(totals.homeW, totals.homeL)}</td>
              <td className="border px-2 py-1">{formatRecord(totals.awayW, totals.awayL)}</td>
              <td className="border px-2 py-1">{formatRecord(totals.tourneyW, totals.tourneyL)}</td>
              <td className="border px-2 py-1">{formatRecord(totals.playoffW, totals.playoffL)}</td>
              <td className="border px-2 py-1"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default YearlyResults;
