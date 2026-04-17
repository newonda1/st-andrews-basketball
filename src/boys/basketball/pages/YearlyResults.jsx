
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { recordTableStyles } from "./recordTableStyles";

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
      fetch("/data/boys/basketball/games.json").then((res) => res.json()),
      fetch("/data/boys/basketball/seasons.json").then((res) => res.json()),
      fetch("/data/boys/basketball/seasonsadjustments.json")
        .then((res) => (res.ok ? res.json() : []))
        .catch(() => []),
    ])
      .then(([gamesData, seasonsData, adjustmentsData]) => {
        processSeasonStats(gamesData, seasonsData, adjustmentsData);
      })
      .catch((err) => console.error("Failed to load data:", err));
  }, []);

  const processSeasonStats = (games, seasons, adjustments) => {
    // Optional adjustments (known season totals for seasons with incomplete game logs)
    const adjMap = {};
    (adjustments || []).forEach((a) => {
      if (a && a.SeasonID != null) {
        adjMap[String(a.SeasonID)] = a;
      }
    });
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
          playoffL: 0,
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

    // Ensure seasons that exist only in adjustments still appear in the tables
    Object.keys(adjMap).forEach((seasonKey) => {
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
          playoffL: 0,
        };
      }
    });

    // Apply adjustments (numbers override computed values; null forces an unknown "–" display)
    const overrideKeys = [
      "overallW",
      "overallL",
      "regionW",
      "regionL",
      "homeW",
      "homeL",
      "awayW",
      "awayL",
      "tourneyW",
      "tourneyL",
      "playoffW",
      "playoffL",
    ];

    Object.entries(grouped).forEach(([seasonKey, stats]) => {
      const adj = adjMap[seasonKey];
      if (!adj) return;

      overrideKeys.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(adj, k)) {
          // Allow number OR null (null means "unknown")
          stats[k] = adj[k];
        }
      });
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

  const formatRecord = (w, l) => {
    if (w === null || l === null) return "–";
    if (w === undefined || l === undefined) return "–";
    return `${w}–${l}`;
  };

  const formatWinPct = (w, l) => {
    if (w === null || l === null) return "–";
    if (w === undefined || l === undefined) return "–";
    const total = w + l;
    if (!total) return "–";
    const pct = (w / total) * 100;
    return `${pct.toFixed(1)}%`;
  };

  const calculateCoachTotals = () => {
    const coachMap = {};

    seasonStats.forEach((season) => {
      const coachName = season.coach || "Unknown";

      if (!coachMap[coachName]) {
        coachMap[coachName] = {
          coach: coachName,
          years: 0,
          overallW: 0,
          overallL: 0,
          notes: [],
        };
      }

      const coach = coachMap[coachName];
      coach.years += 1;
      coach.overallW += season.overallW;
      coach.overallL += season.overallL;

      // Collect season results for the notes column
      if (season.result && season.result.trim() !== "") {
        coach.notes.push(`${season.displaySeason}: ${season.result}`);
      }
    });

    // Sort by most wins, then win%, then name
    return Object.values(coachMap).sort((a, b) => {
      if (b.overallW !== a.overallW) return b.overallW - a.overallW;
      const aPct =
        a.overallW + a.overallL
          ? a.overallW / (a.overallW + a.overallL)
          : 0;
      const bPct =
        b.overallW + b.overallL
          ? b.overallW / (b.overallW + b.overallL)
          : 0;
      if (bPct !== aPct) return bPct - aPct;
      return a.coach.localeCompare(b.coach);
    });
  };

  const calculateTotals = () => {
    const add = (acc, key, value) => {
      if (typeof value === "number") acc[key] += value;
    };

    return seasonStats.reduce(
      (acc, s) => {
        add(acc, "overallW", s.overallW);
        add(acc, "overallL", s.overallL);
        add(acc, "regionW", s.regionW);
        add(acc, "regionL", s.regionL);
        add(acc, "homeW", s.homeW);
        add(acc, "homeL", s.homeL);
        add(acc, "awayW", s.awayW);
        add(acc, "awayL", s.awayL);
        add(acc, "tourneyW", s.tourneyW);
        add(acc, "tourneyL", s.tourneyL);
        add(acc, "playoffW", s.playoffW);
        add(acc, "playoffL", s.playoffL);
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
        playoffL: 0,
      }
    );
  };

  const coachTotals = calculateCoachTotals();
  const totals = calculateTotals();

  const pageClassName =
    "mx-auto max-w-6xl space-y-[clamp(1.75rem,4vw,2.5rem)] px-4 pb-10 pt-2 lg:pb-40";
  const sectionClassName = "space-y-[clamp(0.5rem,1.3vw,0.875rem)]";
  const sectionTitleClassName =
    "text-center font-bold text-[clamp(1.25rem,5vw,1.5rem)]";
  const notesWrapClassName =
    "flex flex-col items-center justify-center gap-[clamp(0.15rem,0.5vw,0.35rem)]";
  const totalRowClassName = "bg-gray-100 font-bold";

  return (
    <div className={pageClassName}>
      {/* Coaching totals */}
      <div className={sectionClassName}>
        <h1 className={sectionTitleClassName}>Coaching Records</h1>

        <div className="overflow-x-auto">
          <table className={recordTableStyles.outerTable}>
            <thead className="bg-gray-200 font-bold">
              <tr>
                <th className={recordTableStyles.headerCell}>Coach</th>
                <th className={recordTableStyles.headerCell}>Years</th>
                <th className={recordTableStyles.headerCell}>Overall Record</th>
                <th className={recordTableStyles.headerCell}>Win %</th>
                <th className={recordTableStyles.headerCell}>Notes (Season Results)</th>
              </tr>
            </thead>
            <tbody>
              {coachTotals.map((coach) => (
                <tr key={coach.coach}>
                  <td className={recordTableStyles.bodyCell}>{coach.coach}</td>
                  <td className={recordTableStyles.bodyCell}>{coach.years}</td>
                  <td className={recordTableStyles.bodyCell}>
                    {formatRecord(coach.overallW, coach.overallL)}
                  </td>
                  <td className={recordTableStyles.bodyCell}>
                    {formatWinPct(coach.overallW, coach.overallL)}
                  </td>
                  <td className={recordTableStyles.bodyCell}>
                    <div className={notesWrapClassName}>
                      {coach.notes.map((note, idx) => (
                        <div key={idx}>{note}</div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h1 className={sectionTitleClassName}>
        Full Year-by-Year Results
      </h1>

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className={recordTableStyles.headerCell}>Season</th>
              <th className={recordTableStyles.headerCell}>Coach</th>
              <th className={recordTableStyles.headerCell}>Overall</th>
              <th className={recordTableStyles.headerCell}>Region</th>
              <th className={recordTableStyles.headerCell}>Home</th>
              <th className={recordTableStyles.headerCell}>Away</th>
              <th className={recordTableStyles.headerCell}>Other</th>
              <th className={recordTableStyles.headerCell}>Playoffs</th>
              <th className={recordTableStyles.headerCell}>Season Result</th>
            </tr>
          </thead>
          <tbody>
            {seasonStats.map((season) => (
              <tr key={season.seasonKey}>
                <td className={recordTableStyles.bodyCell}>
                  <Link
                    to={`/athletics/boys/basketball/seasons/${season.routeSlug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {season.displaySeason}
                  </Link>
                </td>
                <td className={recordTableStyles.bodyCell}>{season.coach}</td>
                <td className={recordTableStyles.bodyCell}>
                  {formatRecord(season.overallW, season.overallL)}
                </td>
                <td className={recordTableStyles.bodyCell}>
                  {formatRecord(season.regionW, season.regionL)}
                </td>
                <td className={recordTableStyles.bodyCell}>
                  {formatRecord(season.homeW, season.homeL)}
                </td>
                <td className={recordTableStyles.bodyCell}>
                  {formatRecord(season.awayW, season.awayL)}
                </td>
                <td className={recordTableStyles.bodyCell}>
                  {formatRecord(season.tourneyW, season.tourneyL)}
                </td>
                <td className={recordTableStyles.bodyCell}>
                  {formatRecord(season.playoffW, season.playoffL)}
                </td>
                <td className={recordTableStyles.bodyCell}>{season.result}</td>
              </tr>
            ))}

            <tr className={totalRowClassName}>
              <td className={recordTableStyles.bodyCell}>Totals</td>
              <td className={recordTableStyles.bodyCell}></td>
              <td className={recordTableStyles.bodyCell}>
                {formatRecord(totals.overallW, totals.overallL)}
              </td>
              <td className={recordTableStyles.bodyCell}>
                {formatRecord(totals.regionW, totals.regionL)}
              </td>
              <td className={recordTableStyles.bodyCell}>
                {formatRecord(totals.homeW, totals.homeL)}
              </td>
              <td className={recordTableStyles.bodyCell}>
                {formatRecord(totals.awayW, totals.awayL)}
              </td>
              <td className={recordTableStyles.bodyCell}>
                {formatRecord(totals.tourneyW, totals.tourneyL)}
              </td>
              <td className={recordTableStyles.bodyCell}>
                {formatRecord(totals.playoffW, totals.playoffL)}
              </td>
              <td className={recordTableStyles.bodyCell}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default YearlyResults;
