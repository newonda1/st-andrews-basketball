// src/boys/basketball/pages/TeamRecords.jsx
import React, { useEffect, useMemo, useState } from "react";

function formatDate(dateValue) {
  if (!dateValue) return "—";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

  const completeGames = useMemo(
    () => games.filter((g) => g.IsComplete === "Yes"),
    [games]
  );

  /* ----------------------------------
     INDIVIDUAL GAME RECORDS (TOP 10)
  ---------------------------------- */
  const gameLeaders = useMemo(() => {
    return {
      mostPoints: [...completeGames]
        .sort((a, b) => b.TeamScore - a.TeamScore)
        .slice(0, 10),

      leastAllowed: [...completeGames]
        .sort((a, b) => a.OpponentScore - b.OpponentScore)
        .slice(0, 10),

      largestMargin: [...completeGames]
        .sort(
          (a, b) =>
            (b.ResultMargin ?? b.TeamScore - b.OpponentScore) -
            (a.ResultMargin ?? a.TeamScore - a.OpponentScore)
        )
        .slice(0, 10),

      mostCombined: [...completeGames]
        .sort(
          (a, b) =>
            b.TeamScore + b.OpponentScore -
            (a.TeamScore + a.OpponentScore)
        )
        .slice(0, 10),
    };
  }, [completeGames]);

  /* ----------------------------------
     SEASON STATS
  ---------------------------------- */
  const seasonStats = useMemo(() => {
    const map = {};
    completeGames.forEach((g) => {
      if (!map[g.Season]) {
        map[g.Season] = {
          season: g.Season,
          wins: 0,
          games: 0,
          pointsFor: 0,
          pointsAgainst: 0,
        };
      }
      map[g.Season].games++;
      if (g.Result === "W") map[g.Season].wins++;
      map[g.Season].pointsFor += g.TeamScore;
      map[g.Season].pointsAgainst += g.OpponentScore;
    });

    return Object.values(map).map((s) => ({
      ...s,
      winPct: s.wins / s.games,
      avgDiff: (s.pointsFor - s.pointsAgainst) / s.games,
    }));
  }, [completeGames]);

  const seasonLeaders = useMemo(() => {
    return {
      mostWins: [...seasonStats].sort((a, b) => b.wins - a.wins).slice(0, 10),
      bestWinPct: [...seasonStats]
        .sort((a, b) => b.winPct - a.winPct)
        .slice(0, 10),
      mostPoints: [...seasonStats]
        .sort((a, b) => b.pointsFor - a.pointsFor)
        .slice(0, 10),
      leastAllowed: [...seasonStats]
        .sort((a, b) => a.pointsAgainst - b.pointsAgainst)
        .slice(0, 10),
      bestAvgDiff: [...seasonStats]
        .sort((a, b) => b.avgDiff - a.avgDiff)
        .slice(0, 10),
    };
  }, [seasonStats]);

  const toggle = (key) =>
    setOpenRow((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-10">
      {/* INDIVIDUAL GAME RECORDS */}
      <h2 className="text-xl font-bold text-center">
        Individual Game Records
      </h2>

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
                <tr
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => toggle(key)}
                >
                  <td className="p-2">{label}</td>
                  <td className="p-2 text-right">
                    {key === "mostCombined"
                      ? top?.TeamScore + top?.OpponentScore
                      : key === "leastAllowed"
                      ? top?.OpponentScore
                      : key === "largestMargin"
                      ? top?.ResultMargin
                      : top?.TeamScore}
                  </td>
                  <td className="p-2">{top?.Opponent}</td>
                  <td className="p-2">{formatDate(top?.Date)}</td>
                  <td className="p-2 text-center">
                    {top
                      ? `${top.TeamScore}-${top.OpponentScore}`
                      : "—"}
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
                                  ? g.ResultMargin
                                  : g.TeamScore}
                              </td>
                              <td className="p-1">{g.Opponent}</td>
                              <td className="p-1">{formatDate(g.Date)}</td>
                              <td className="p-1 text-center">
                                {g.TeamScore}-{g.OpponentScore}
                              </td>
                            </tr>
                          ))}
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
                <tr
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => toggle(key)}
                >
                  <td className="p-2">{label}</td>
                  <td className="p-2 text-right">
                    {field === "winPct"
                      ? top?.winPct.toFixed(3)
                      : field === "avgDiff"
                      ? top?.avgDiff.toFixed(2)
                      : top?.[field]}
                  </td>
                  <td className="p-2">{formatSeason(top?.season)}</td>
                  <td className="p-2">
                    {coachBySeason[top?.season] ?? "—"}
                  </td>
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
                          {seasonLeaders[key].map((s, i) => (
                            <tr key={s.season}>
                              <td className="p-1 text-center">{i + 1}</td>
                              <td className="p-1 text-center">
                                {field === "winPct"
                                  ? s.winPct.toFixed(3)
                                  : field === "avgDiff"
                                  ? s.avgDiff.toFixed(2)
                                  : s[field]}
                              </td>
                              <td className="p-1">
                                {formatSeason(s.season)}
                              </td>
                              <td className="p-1">
                                {coachBySeason[s.season] ?? "—"}
                              </td>
                            </tr>
                          ))}
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
