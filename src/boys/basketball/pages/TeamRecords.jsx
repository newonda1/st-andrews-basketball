// src/boys/basketball/pages/TeamRecords.jsx
import React, { useEffect, useMemo, useState } from "react";

const formatDateFromGameID = (gameId) => {
  if (!gameId) return "—";

  const n = Number(gameId);
  if (!Number.isFinite(n)) return "—";

  const year = Math.floor(n / 10000);
  const month = Math.floor(n / 100) % 100;
  const day = n % 100;

  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
    return "—";
  }

  const d = new Date(Date.UTC(year, month - 1, day));

  return d.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function formatSeason(season) {
  if (!season) return "—";
  return `${season}-${String(season + 1).slice(-2)}`;
}

function TeamRecords() {
  const [games, setGames] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [openRow, setOpenRow] = useState(null);

  useEffect(() => {
    fetch("/data/boys/basketball/games.json")
      .then((r) => r.json())
      .then(setGames);

    fetch("/data/boys/basketball/seasons.json")
      .then((r) => r.json())
      .then(setSeasons);
  }, []);

  const coachBySeason = useMemo(() => {
    const map = {};
    seasons.forEach((s) => {
      map[s.SeasonID] = s.HeadCoach;
    });
    return map;
  }, [seasons]);

  // ------------------------------------------------------------
  // Split games into:
  // 1) outcomeKnownGames: include W/L even if score is unknown
  // 2) scoreKnownGames: include only games with reliable scores
  // ------------------------------------------------------------
  const outcomeKnownGames = useMemo(() => {
    return (games || []).filter((g) => {
      const r = (g?.Result ?? "").toString().trim().toUpperCase();
      return r === "W" || r === "L";
    });
  }, [games]);

  const scoreKnownGames = useMemo(() => {
    return (games || []).filter((g) => {
      const hasScores = g?.TeamScore != null && g?.OpponentScore != null;
      return g?.IsComplete === "Yes" && hasScores;
    });
  }, [games]);

  /* ----------------------------------
     INDIVIDUAL GAME RECORDS (TOP 10)
     (scores required)
  ---------------------------------- */
  const gameLeaders = useMemo(() => {
    return {
      mostPoints: [...scoreKnownGames]
        .sort((a, b) => b.TeamScore - a.TeamScore)
        .slice(0, 10),

      leastAllowed: [...scoreKnownGames]
        .sort((a, b) => a.OpponentScore - b.OpponentScore)
        .slice(0, 10),

      largestMargin: [...scoreKnownGames]
        .sort(
          (a, b) =>
            (b.TeamScore - b.OpponentScore) -
           (a.TeamScore - a.OpponentScore)
        )
        .slice(0, 10),

      mostCombined: [...scoreKnownGames]
        .sort(
          (a, b) =>
            b.TeamScore + b.OpponentScore - (a.TeamScore + a.OpponentScore)
        )
        .slice(0, 10),
    };
  }, [scoreKnownGames]);

  /* ----------------------------------
     SEASON STATS
     - wins/losses from outcomeKnownGames
     - points/differential from scoreKnownGames
  ---------------------------------- */
  const seasonStats = useMemo(() => {
    const wlMap = {};
    outcomeKnownGames.forEach((g) => {
      const season = g.Season;
      if (season == null) return;

      if (!wlMap[season]) {
        wlMap[season] = { season, wins: 0, losses: 0, games: 0 };
      }

      wlMap[season].games += 1;
      if (g.Result === "W") wlMap[season].wins += 1;
      if (g.Result === "L") wlMap[season].losses += 1;
    });

    const scoreMap = {};
    scoreKnownGames.forEach((g) => {
      const season = g.Season;
      if (season == null) return;

      if (!scoreMap[season]) {
        scoreMap[season] = { season, scoredGames: 0, pointsFor: 0, pointsAgainst: 0 };
      }

      scoreMap[season].scoredGames += 1;
      scoreMap[season].pointsFor += g.TeamScore;
      scoreMap[season].pointsAgainst += g.OpponentScore;
    });

    const allSeasons = new Set([
      ...Object.keys(wlMap),
      ...Object.keys(scoreMap),
    ]);

    return Array.from(allSeasons).map((sKey) => {
      const season = Number(sKey);
      const wl = wlMap[sKey] ?? { season, wins: 0, losses: 0, games: 0 };
      const sc = scoreMap[sKey] ?? {
        season,
        scoredGames: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      };

      const winPct = wl.games > 0 ? wl.wins / wl.games : null;
      const avgDiff =
        sc.scoredGames > 0
          ? (sc.pointsFor - sc.pointsAgainst) / sc.scoredGames
          : null;

      return {
        season,
        wins: wl.wins,
        losses: wl.losses,
        games: wl.games,
        winPct,
        scoredGames: sc.scoredGames,
        pointsFor: sc.pointsFor,
        pointsAgainst: sc.pointsAgainst,
        avgDiff,
      };
    });
  }, [outcomeKnownGames, scoreKnownGames]);

  const seasonLeaders = useMemo(() => {
    const wlOnly = seasonStats.filter((s) => (s.games ?? 0) > 0);
    const scoreOnly = seasonStats.filter((s) => (s.scoredGames ?? 0) > 0);

    return {
      // outcome-based
      mostWins: [...wlOnly].sort((a, b) => b.wins - a.wins).slice(0, 10),
      bestWinPct: [...wlOnly]
        .filter((s) => s.winPct != null)
        .sort((a, b) => b.winPct - a.winPct)
        .slice(0, 10),

      // score-based
      mostPoints: [...scoreOnly]
        .sort((a, b) => b.pointsFor - a.pointsFor)
        .slice(0, 10),
      leastAllowed: [...scoreOnly]
        .sort((a, b) => a.pointsAgainst - b.pointsAgainst)
        .slice(0, 10),
      bestAvgDiff: [...scoreOnly]
        .filter((s) => s.avgDiff != null)
        .sort((a, b) => b.avgDiff - a.avgDiff)
        .slice(0, 10),
    };
  }, [seasonStats]);

  const toggle = (key) => setOpenRow((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-10">
      {/* INDIVIDUAL GAME RECORDS */}
      <h2 className="text-xl font-bold text-center">Individual Game Records</h2>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Record</th>
            <th className="p-2 text-right">Value</th>
            <th className="p-2 text-left">Opponent</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-center">Game Score</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Most points scored", "mostPoints"],
            ["Least points allowed", "leastAllowed"],
            ["Largest margin of victory", "largestMargin"],
            ["Most combined points", "mostCombined"],
          ].map(([label, key]) => {
            const top = gameLeaders[key]?.[0];
            return (
              <React.Fragment key={key}>
                <tr className="cursor-pointer hover:bg-gray-50" onClick={() => toggle(key)}>
                  <td className="p-2">{label}</td>
                  <td className="p-2 text-right">
                    {top
                      ? key === "mostCombined"
                        ? top.TeamScore + top.OpponentScore
                        : key === "leastAllowed"
                        ? top.OpponentScore
                        : key === "largestMargin"
                        ? top.TeamScore - top.OpponentScore
                        : top.TeamScore
                      : "—"}
                  </td>
                  <td className="p-2">{top?.Opponent ?? "—"}</td>
                  <td className="p-2">{formatDateFromGameID(top?.GameID)}</td>
                  <td className="p-2 text-center">
                    {top ? `${top.TeamScore}-${top.OpponentScore}` : "—"}
                  </td>
                </tr>

                {openRow === key && (
                  <tr>
                    <td colSpan={5} className="p-2 bg-gray-50">
                      <table className="w-full text-xs border">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="p-1">#</th>
                            <th className="p-1">Score</th>
                            <th className="p-1">Opponent</th>
                            <th className="p-1">Date</th>
                            <th className="p-1">Final</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gameLeaders[key].map((g, i) => (
                            <tr key={g.GameID}>
                              <td className="p-1 text-center">{i + 1}</td>
                              <td className="p-1 text-center">
                                {key === "mostCombined"
                                  ? g.TeamScore + g.OpponentScore
                                  : key === "leastAllowed"
                                  ? g.OpponentScore
                                  : key === "largestMargin"
                                  ? g.TeamScore - g.OpponentScore
                                  : g.TeamScore}
                              </td>
                              <td className="p-1">{g.Opponent}</td>
                              <td className="p-1">{formatDateFromGameID(g.GameID)}</td>
                              <td className="p-1 text-center">
                                {g.TeamScore}-{g.OpponentScore}
                              </td>
                            </tr>
                          ))}
                          {gameLeaders[key].length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-2 text-center text-gray-600">
                                No scored games available for this record.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* SEASON RECORDS */}
      <h2 className="text-xl font-bold text-center">Season Records</h2>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Record</th>
            <th className="p-2 text-right">Value</th>
            <th className="p-2 text-left">Season</th>
            <th className="p-2 text-left">Coach</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Most wins", "mostWins", "wins"],
            ["Highest winning %", "bestWinPct", "winPct"],
            ["Most points scored", "mostPoints", "pointsFor"],
            ["Least points allowed", "leastAllowed", "pointsAgainst"],
            ["Highest average point differential", "bestAvgDiff", "avgDiff"],
          ].map(([label, key, field]) => {
            const top = seasonLeaders[key]?.[0];
            return (
              <React.Fragment key={key}>
                <tr className="cursor-pointer hover:bg-gray-50" onClick={() => toggle(key)}>
                  <td className="p-2">{label}</td>
                  <td className="p-2 text-right">
                    {!top
                      ? "—"
                      : field === "winPct"
                      ? top.winPct != null
                        ? top.winPct.toFixed(3)
                        : "—"
                      : field === "avgDiff"
                      ? top.avgDiff != null
                        ? top.avgDiff.toFixed(2)
                        : "—"
                      : top[field]}
                  </td>
                  <td className="p-2">{formatSeason(top?.season)}</td>
                  <td className="p-2">{coachBySeason[top?.season] ?? "—"}</td>
                </tr>

                {openRow === key && (
                  <tr>
                    <td colSpan={4} className="p-2 bg-gray-50">
                      <table className="w-full text-xs border">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="p-1">#</th>
                            <th className="p-1">Value</th>
                            <th className="p-1">Season</th>
                            <th className="p-1">Coach</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(seasonLeaders[key] || []).map((s, i) => (
                            <tr key={s.season}>
                              <td className="p-1 text-center">{i + 1}</td>
                              <td className="p-1 text-center">
                                {field === "winPct"
                                  ? s.winPct != null
                                    ? s.winPct.toFixed(3)
                                    : "—"
                                  : field === "avgDiff"
                                  ? s.avgDiff != null
                                    ? s.avgDiff.toFixed(2)
                                    : "—"
                                  : s[field]}
                              </td>
                              <td className="p-1">{formatSeason(s.season)}</td>
                              <td className="p-1">{coachBySeason[s.season] ?? "—"}</td>
                            </tr>
                          ))}

                          {(seasonLeaders[key] || []).length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-2 text-center text-gray-600">
                                No seasons available for this record.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TeamRecords;
