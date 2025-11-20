import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Turn "1978" into "1978–79", leave labels that already have a dash/en dash alone.
function formatSeasonLabel(rawSeason) {
  const s = String(rawSeason);

  if (s.includes("–") || s.includes("-")) return s;

  if (s.length === 4 && !Number.isNaN(Number(s))) {
    const startYear = Number(s);
    const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
    return `${startYear}–${endYearShort}`;
  }

  return s;
}

// Turn a season key like "1979" or "1992-93" into a URL slug like "1979-80" or "1992-93"
function seasonKeyToSlug(seasonKey) {
  const s = String(seasonKey);

  // If it's already in "YYYY-YY" or "YYYY–YY" form, normalize to use a plain hyphen
  if (/^\d{4}[-–]\d{2}$/.test(s)) {
    return s.replace("–", "-");
  }

  // If it's a plain year like "1979" or "2024", turn it into "1979-80" or "2024-25"
  if (/^\d{4}$/.test(s)) {
    const start = Number(s);
    const endShort = String((start + 1) % 100).padStart(2, "0");
    return `${start}-${endShort}`;
  }

  // Fallback: just return it as-is
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
    const seasonMeta = {};

    seasons.forEach((s) => {
      const coach = s.HeadCoach || s.Coach || "Unknown";

      let label = "";
      if (s.DisplaySeason) {
        label = s.DisplaySeason;
      } else if (s.SeasonLabel) {
        label = s.SeasonLabel;
      } else if (s.YearStart && s.YearEnd) {
        label = `${s.YearStart}–${String(s.YearEnd).slice(-2)}`;
      } else if (s.SeasonID != null) {
        label = String(s.SeasonID);
      }

      const parts = [];
      if (s.RegionFinish) parts.push(s.RegionFinish);
      if (s.StateFinish) parts.push(s.StateFinish);
      const result = parts.join(" & ");

      const meta = { coach, label, result };

      const keyYear = s.YearStart != null ? String(s.YearStart) : null;
      const keyId = s.SeasonID != null ? String(s.SeasonID) : null;

      if (keyYear) seasonMeta[keyYear] = meta;
      if (keyId) seasonMeta[keyId] = meta;
    });

    // 2. Group games by season and count records
    const grouped = {};

    games.forEach((g) => {
      const seasonKey = String(g.Season);

      if (!grouped[seasonKey]) {
        grouped[seasonKey] = {
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
          playoffL: 0
        };
      }

      const stats = grouped[seasonKey];

      const result = g.Result;

      // Skip games that don't have a real result yet (e.g. "Unknown")
      if (result !== "W" && result !== "L") {
        return;
      }

      const isWin = result === "W";

      const gameType = g.GameType || "";
      const location = g.LocationType || "";

      // Region = regular season region games only
      const isRegion = gameType === "Region";

      // Playoffs = region tournament + state tournament
      const isPlayoff =
        gameType === "Region Tournament" || gameType === "State Tournament";

      // Tourney/Showcase = in-season tournaments & showcases (non-playoff)
      const isTourney =
        gameType === "Tournament" || gameType === "Showcase";

      // Home / Away (neutral games don't count for either)
      const isHome = location === "Home";
      const isAway = location === "Away";

      // Overall
      if (isWin) stats.overallW++;
      else stats.overallL++;

      // Region
      if (isRegion) {
        if (isWin) stats.regionW++;
        else stats.regionL++;
      }

      // Home / Away
      if (isHome) {
        if (isWin) stats.homeW++;
        else stats.homeL++;
      } else if (isAway) {
        if (isWin) stats.awayW++;
        else stats.awayL++;
      }

      // Tourney / Showcase
      if (isTourney) {
        if (isWin) stats.tourneyW++;
        else stats.tourneyL++;
      }

      // Playoffs
      if (isPlayoff) {
        if (isWin) stats.playoffW++;
        else stats.playoffL++;
      }
    });

    // 3. Attach metadata and sort seasons oldest → newest
    const statsArray = Object.entries(grouped).map(([seasonKey, stats]) => {
      const meta = seasonMeta[seasonKey] || {};
      const displaySeason = formatSeasonLabel(meta.label || seasonKey);
      const routeSlug = seasonKeyToSlug(seasonKey);

      return {
        seasonKey,
        routeSlug,
        displaySeason,
        coach: meta.coach || "Unknown",
        result: meta.result || "",
        ...stats,
      };
    });

    statsArray.sort(
      (a, b) =>
        Number(String(a.seasonKey).slice(0, 4)) -
        Number(String(b.seasonKey).slice(0, 4))
    );

    setSeasonStats(statsArray);
  };

  const formatRecord = (w, l) => `${w}–${l}`;

  const calculateTotals = () => {
    return seasonStats.reduce(
      (acc, s) => {
        acc.overallW += s.overallW;
        acc.overallL += s.overallL;
        acc.regionW += s.regionW;
        acc.regionL += s.regionL;
        acc.homeW += s.homeW;
        acc.homeL += s.homeL;
        acc.awayW += s.awayW;
        acc.awayL += s.awayL;
        acc.tourneyW += s.tourneyW;
        acc.tourneyL += s.tourneyL;
        acc.playoffW += s.playoffW;
        acc.playoffL += s.playoffL;
        return acc;
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
        playoffL: 0
      }
    );
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-10 px-4">
      <h1 className="text-2xl font-bold text-center">
        Full Year-by-Year Results
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm border text-center">
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className="border px-2 py-1">Season</th>
              <th className="border px-2 py-1">Coach</th>
              <th className="border px-2 py-1">Overall</th>
              <th className="border px-2 py-1">Region</th>
              <th className="border px-2 py-1">Home</th>
              <th className="border px-2 py-1">Away</th>
              <th className="border px-2 py-1">Tourney/ Showcase</th>
              <th className="border px-2 py-1">Playoffs</th>
              <th className="border px-2 py-1">Season Result</th>
            </tr>
          </thead>
          <tbody>
            {seasonStats.map((season) => (
              <tr key={season.seasonKey}>
                <td className="border px-2 py-1">
                   <Link
                      to={`/seasons/${season.routeSlug}`}
                      className="text-blue-600 hover:underline"
                    >
                    {season.displaySeason}
                  </Link>
                </td>
                <td className="border px-2 py-1">{season.coach}</td>
                <td className="border px-2 py-1">
                  {formatRecord(season.overallW, season.overallL)}
                </td>
                <td className="border px-2 py-1">
                  {formatRecord(season.regionW, season.regionL)}
                </td>
                <td className="border px-2 py-1">
                  {formatRecord(season.homeW, season.homeL)}
                </td>
                <td className="border px-2 py-1">
                  {formatRecord(season.awayW, season.awayL)}
                </td>
                <td className="border px-2 py-1">
                  {formatRecord(season.tourneyW, season.tourneyL)}
                </td>
                <td className="border px-2 py-1">
                  {formatRecord(season.playoffW, season.playoffL)}
                </td>
                <td className="border px-2 py-1">{season.result}</td>
              </tr>
            ))}

            <tr className="font-bold bg-gray-100">
              <td className="border px-2 py-1">Totals</td>
              <td className="border px-2 py-1"></td>
              <td className="border px-2 py-1">
                {formatRecord(totals.overallW, totals.overallL)}
              </td>
              <td className="border px-2 py-1">
                {formatRecord(totals.regionW, totals.regionL)}
              </td>
              <td className="border px-2 py-1">
                {formatRecord(totals.homeW, totals.homeL)}
              </td>
              <td className="border px-2 py-1">
                {formatRecord(totals.awayW, totals.awayL)}
              </td>
              <td className="border px-2 py-1">
                {formatRecord(totals.tourneyW, totals.tourneyL)}
              </td>
              <td className="border px-2 py-1">
                {formatRecord(totals.playoffW, totals.playoffL)}
              </td>
              <td className="border px-2 py-1"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default YearlyResults;
