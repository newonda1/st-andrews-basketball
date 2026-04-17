
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
  const tableClassName =
    "w-full table-auto border text-center text-[clamp(0.64rem,0.95vw,1rem)] md:mx-auto md:w-max";
  const headerCellClassName = `${recordTableStyles.headerCell} whitespace-nowrap`;
  const numericCellClassName = `${recordTableStyles.bodyCell} whitespace-nowrap`;
  const textCellClassName = `${recordTableStyles.bodyCell} md:text-left`;
  const compactTextCellClassName =
    `${recordTableStyles.bodyCell} whitespace-nowrap md:text-left`;
  const notesCellClassName =
    `${recordTableStyles.bodyCell} md:min-w-[30rem] md:text-left`;
  const notesWrapClassName =
    "grid gap-x-[clamp(1rem,2vw,1.75rem)] gap-y-[clamp(0.15rem,0.5vw,0.35rem)] md:text-left lg:grid-cols-2";
  const resultCellClassName =
    `${recordTableStyles.bodyCell} md:min-w-[22rem] md:text-left`;
  const totalRowClassName = "bg-gray-100 font-bold";

  return (
    <div className={pageClassName}>
      {/* Coaching totals */}
      <div className={sectionClassName}>
        <h1 className={sectionTitleClassName}>Coaching Records</h1>

        <div className="overflow-x-auto">
          <table className={tableClassName}>
            <thead className="bg-gray-200 font-bold">
              <tr>
                <th className={`${headerCellClassName} md:text-left`}>Coach</th>
                <th className={headerCellClassName}>Years</th>
                <th className={headerCellClassName}>Overall Record</th>
                <th className={headerCellClassName}>Win %</th>
                <th className={`${headerCellClassName} md:text-left`}>Notes (Season Results)</th>
              </tr>
            </thead>
            <tbody>
              {coachTotals.map((coach) => (
                <tr key={coach.coach}>
                  <td className={compactTextCellClassName}>{coach.coach}</td>
                  <td className={numericCellClassName}>{coach.years}</td>
                  <td className={numericCellClassName}>
                    {formatRecord(coach.overallW, coach.overallL)}
                  </td>
                  <td className={numericCellClassName}>
                    {formatWinPct(coach.overallW, coach.overallL)}
                  </td>
                  <td className={notesCellClassName}>
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
        <table className={tableClassName}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className={headerCellClassName}>Season</th>
              <th className={`${headerCellClassName} md:text-left`}>Coach</th>
              <th className={headerCellClassName}>Overall</th>
              <th className={headerCellClassName}>Region</th>
              <th className={headerCellClassName}>Home</th>
              <th className={headerCellClassName}>Away</th>
              <th className={headerCellClassName}>Other</th>
              <th className={headerCellClassName}>Playoffs</th>
              <th className={`${headerCellClassName} md:text-left`}>Season Result</th>
            </tr>
          </thead>
          <tbody>
            {seasonStats.map((season) => (
              <tr key={season.seasonKey}>
                <td className={numericCellClassName}>
                  <Link
                    to={`/athletics/boys/basketball/seasons/${season.routeSlug}`}
                    className="whitespace-nowrap text-blue-600 hover:underline"
                  >
                    {season.displaySeason}
                  </Link>
                </td>
                <td className={compactTextCellClassName}>{season.coach}</td>
                <td className={numericCellClassName}>
                  {formatRecord(season.overallW, season.overallL)}
                </td>
                <td className={numericCellClassName}>
                  {formatRecord(season.regionW, season.regionL)}
                </td>
                <td className={numericCellClassName}>
                  {formatRecord(season.homeW, season.homeL)}
                </td>
                <td className={numericCellClassName}>
                  {formatRecord(season.awayW, season.awayL)}
                </td>
                <td className={numericCellClassName}>
                  {formatRecord(season.tourneyW, season.tourneyL)}
                </td>
                <td className={numericCellClassName}>
                  {formatRecord(season.playoffW, season.playoffL)}
                </td>
                <td className={resultCellClassName}>{season.result}</td>
              </tr>
            ))}

            <tr className={totalRowClassName}>
              <td className={textCellClassName}>Totals</td>
              <td className={textCellClassName}></td>
              <td className={numericCellClassName}>
                {formatRecord(totals.overallW, totals.overallL)}
              </td>
              <td className={numericCellClassName}>
                {formatRecord(totals.regionW, totals.regionL)}
              </td>
              <td className={numericCellClassName}>
                {formatRecord(totals.homeW, totals.homeL)}
              </td>
              <td className={numericCellClassName}>
                {formatRecord(totals.awayW, totals.awayL)}
              </td>
              <td className={numericCellClassName}>
                {formatRecord(totals.tourneyW, totals.tourneyL)}
              </td>
              <td className={numericCellClassName}>
                {formatRecord(totals.playoffW, totals.playoffL)}
              </td>
              <td className={textCellClassName}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default YearlyResults;
