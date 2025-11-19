import React, { useEffect, useState } from "react";

// Turn "1978" into "1978–79", leave labels with a dash alone
function formatSeasonLabel(rawSeason) {
  const s = String(rawSeason);

  // If it already has a dash/en dash, assume it's already formatted, e.g. "1992–93"
  if (s.includes("–") || s.includes("-")) return s;

  // If it's a 4-digit year, make "YYYY–YY"
  if (s.length === 4 && !Number.isNaN(Number(s))) {
    const startYear = Number(s);
    const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
    return `${startYear}–${endYearShort}`;
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
    // ---- 1. Build season metadata from seasons.json ----
    const seasonMeta = {};

    seasons.forEach((s) => {
      const meta = {
        coach: s.HeadCoach || s.Coach || "Unknown",
        label: undefined,
        // Accept a SeasonResult field if you ever add it,
        // otherwise build from RegionFinish / StateFinish
        result:
          s.SeasonResult ||
          `${s.RegionFinish || ""}${
            s.StateFinish ? (s.RegionFinish ? " & " : "") + s.StateFinish : ""
          }`
      };

      // Decide how to label the season
      if (s.DisplaySeason) {
        meta.label = s.DisplaySeason;
      } else if (s.SeasonLabel) {
        meta.label = s.SeasonLabel;
      } else if (s.YearStart && s.YearEnd) {
        meta.label = `${s.YearStart}–${String(s.YearEnd).slice(-2)}`;
      } else if (s.SeasonID) {
        meta.label = String(s.SeasonID);
      }

      // Make it easy to match even if keys differ:
      // SeasonID (might be "2024-25"), YearStart (e.g. 2024), or Season
      const keySeasonId = s.SeasonID != null ? String(s.SeasonID) : null;
      const keyYearStart = s.YearStart != null ? String(s.YearStart) : null;
      const keySeason = s.Season != null ? String(s.Season) : null;

      if (keySeasonId) seasonMeta[keySeasonId] = meta;
      if (keyYearStart) seasonMeta[keyYearStart] = meta;
      if (keySeason) seasonMeta[keySeason] = meta;
    });

    // ---- 2. Group games by season and count records ----
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

      const isWin = g.Result === "W";
      const isRegion = g.IsRegion === true;
      const isPlayoff = g.IsPlayoff === true;
      const isTourney = g.IsTourney === true || g.IsShowcase === true;
      const isHome = g.Site === "H";
      const isAway = g.Site === "A";

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

    // ---- 3. Attach metadata and sort ----
    const statsArray = Object.entries(grouped).map(([seasonKey, stats]) => {
      const meta = seasonMeta[seasonKey] || {};
      const displaySeason = formatSeasonLabel(meta.label || seasonKey);

      return {
        seasonKey,
        displaySeason,
        coach: meta.coach || "Unknown",
        seasonResult: meta.result || "",
        ...stats
      };
    });

    // Sort by starting year, newest to oldest
    statsArray.sort(
      (a, b) =>
        Number(String(b.seasonKey).slice(0, 4)) -
        Number(String(a.seasonKey).slice(0, 4))
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
        <table className="min-w-full table-auto text-sm border">
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
                <td className="border px-2 py-1">{season.displaySeason}</td>
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
                <td className="border px-2 py-1">{season.seasonResult}</td>
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
