import React, { useEffect, useMemo, useState } from "react";

function RecordsVsOpponents() {
  const [games, setGames] = useState([]);
  const [playerGameStats, setPlayerGameStats] = useState([]);
  const [players, setPlayers] = useState([]);

  const [opponentRecords, setOpponentRecords] = useState({});
  const [sortField, setSortField] = useState("Total");
  const [sortDirection, setSortDirection] = useState("desc");
  const [expandedOpponent, setExpandedOpponent] = useState(null);

  // --- Helpers ---
  const formatDateUTC = (ms) => {
    if (ms == null) return "";
    const d = new Date(Number(ms));
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  const getPlayerName = (playerId) => {
    const p = players.find((x) => String(x.PlayerID) === String(playerId));
    return p ? `${p.FirstName} ${p.LastName}` : "Unknown Player";
  };

  const gameTypeLabel = (g) => {
    const t =
      g.GameType ?? g.Type ?? g.GameCategory ?? g.Category ?? g.SeasonType ?? "";
    const s = String(t).trim();
    if (!s) return "—";
    return s;
  };

  const resultLabel = (g) => {
    const r = (g?.Result ?? "").toString().trim();
    if (!r || r.toLowerCase() === "unknown") return "—";
    return r;
  };

  const locationLabel = (g) => {
    const loc = g.LocationType ?? g.Location ?? g.Site ?? "";
    const s = String(loc).trim();
    return s || "—";
  };

  const scoreLabel = (g) => {
    const team = g?.TeamScore;
    const opp = g?.OpponentScore;

    if (team == null || opp == null) return "—";
    return `${team}-${opp}`;
  };

  const isOtherGame = (g) => {
    const t = (g.GameType ?? "").toString().trim().toLowerCase();
    return t === "tournament" || t === "showcase";
  };

  const isPlayoffGame = (g) => {
    const t =
      g.GameType ?? g.Type ?? g.GameCategory ?? g.Category ?? g.SeasonType ?? "";
    const s = String(t).trim().toLowerCase();
    if (!s) return false;
    // Adjust keywords as needed based on your data
    return (
      s.includes("playoff") ||
      s.includes("tournament") ||
      s.includes("state") ||
      s.includes("semifinal") ||
      s.includes("quarterfinal") ||
      s.includes("championship")
    );
  };

  const formatSubRecord = (wins, losses) => {
    const total = wins + losses;
    if (total === 0) return "—";
    return `${wins}-${losses}`;
  };

  // --- Fetch data (games + stats + players) ---
  useEffect(() => {
    Promise.all([
      fetch("/data/boys/basketball/games.json").then((r) => r.json()),
      fetch("/data/boys/basketball/playergamestats.json").then((r) => r.json()),
      fetch("/data/boys/basketball/players.json").then((r) => r.json()),
    ])
      .then(([gamesData, statsData, playersData]) => {
        // Remove "Unknown" opponent games from this page entirely
        const filteredGames = (gamesData || []).filter((g) => {
          const opp = (g?.Opponent ?? "").toString().trim();
          return opp && opp.toLowerCase() !== "unknown";
        });

        setGames(filteredGames);
        setPlayerGameStats(statsData || []);
        setPlayers(playersData || []);

        // Build opponent records with breakdowns
        const records = {};
        filteredGames.forEach((game) => {
          const name = game.Opponent;
          if (!records[name]) {
            records[name] = {
              wins: 0,
              losses: 0,
              homeWins: 0,
              homeLosses: 0,
              awayWins: 0,
              awayLosses: 0,
              playoffWins: 0,
              playoffLosses: 0,
              otherWins: 0,
              otherLosses: 0,
            };
          }

          const res = (game.Result ?? "").toString().trim().toUpperCase();
          const isWin = res === "W";
          const isLoss = res === "L";

          if (isWin) records[name].wins += 1;
          else if (isLoss) records[name].losses += 1;

          const locRaw = (
            game.LocationType ??
            game.Location ??
            game.Site ??
            ""
          )
            .toString()
            .trim()
            .toLowerCase();

          // Home / Away records
          if (locRaw === "home") {
            if (isWin) records[name].homeWins += 1;
            else if (isLoss) records[name].homeLosses += 1;
          }

          if (locRaw === "away") {
            if (isWin) records[name].awayWins += 1;
            else if (isLoss) records[name].awayLosses += 1;
          }

          // Other = Tournament or Showcase ONLY
          if (isOtherGame(game)) {
            if (isWin) records[name].otherWins += 1;
            else if (isLoss) records[name].otherLosses += 1;
          }

          if (isPlayoffGame(game)) {
            if (isWin) records[name].playoffWins += 1;
            else if (isLoss) records[name].playoffLosses += 1;
          }
        });

        setOpponentRecords(records);
      })
      .catch((err) =>
        console.error("Failed to load data for RecordsVsOpponents", err)
      );
  }, []);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleOpponent = (opponent) => {
    setExpandedOpponent((prev) => (prev === opponent ? null : opponent));
  };

  const sortedOpponents = useMemo(() => {
    return Object.entries(opponentRecords).sort((a, b) => {
      let aVal, bVal;

      if (sortField === "Opponent") {
        aVal = a[0];
        bVal = b[0];
      } else if (sortField === "Wins") {
        aVal = a[1].wins;
        bVal = b[1].wins;
      } else if (sortField === "Losses") {
        aVal = a[1].losses;
        bVal = b[1].losses;
      } else if (sortField === "Pct") {
        const aTotal = a[1].wins + a[1].losses;
        const bTotal = b[1].wins + b[1].losses;
        aVal = aTotal > 0 ? a[1].wins / aTotal : 0;
        bVal = bTotal > 0 ? b[1].wins / bTotal : 0;
      } else {
        // Total games
        aVal = a[1].wins + a[1].losses;
        bVal = b[1].wins + b[1].losses;
      }

      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [opponentRecords, sortField, sortDirection]);

  const gamesByOpponent = useMemo(() => {
    const map = new Map();
    for (const g of games) {
      const opp = g.Opponent;
      if (!map.has(opp)) map.set(opp, []);
      map.get(opp).push(g);
    }
    // sort games per opponent by date ascending
    for (const [opp, arr] of map.entries()) {
      arr.sort((a, b) => safeNum(a.Date) - safeNum(b.Date));
      map.set(opp, arr);
    }
    return map;
  }, [games]);

  const leadingScorerByGameId = useMemo(() => {
    const map = new Map();

    for (const row of playerGameStats) {
      const gid = row?.GameID;
      if (gid == null) continue;

      const pts = safeNum(row?.Points);
      const existing = map.get(String(gid));

      if (!existing || pts > existing.Points) {
        map.set(String(gid), { PlayerID: row.PlayerID, Points: pts });
      }
    }

    return map;
  }, [playerGameStats]);

  const leadingScorerLabel = (game) => {
    const r = (game?.Result ?? "").toString().trim().toLowerCase();
    if (!r || r === "unknown") return "—";

    const lead = leadingScorerByGameId.get(String(game.GameID));
    if (!lead || lead.PlayerID == null) return "—";

    const name = getPlayerName(lead.PlayerID);
    const pts = safeNum(lead.Points);
    return `${name} - ${pts} points`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Records vs. Opponents</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm md:text-base text-center border">
          <thead>
            <tr className="bg-gray-100">
              <th
                className="border p-2 cursor-pointer text-left"
                onClick={() => handleSort("Opponent")}
              >
                Opponent{" "}
                {sortField === "Opponent" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("Total")}
              >
                Total Games{" "}
                {sortField === "Total" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("Wins")}
              >
                Wins {sortField === "Wins" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("Losses")}
              >
                Losses{" "}
                {sortField === "Losses" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("Pct")}
              >
                % {sortField === "Pct" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th className="border p-2">Home</th>
              <th className="border p-2">Away</th>
              <th className="border p-2">Playoffs</th>
              <th className="border p-2">Other</th>
            </tr>
          </thead>

          <tbody>
            {sortedOpponents.map(([opponent, record], idx) => {
              const isExpanded = expandedOpponent === opponent;
              const gamesAgainst = gamesByOpponent.get(opponent) || [];

              const totalGames = record.wins + record.losses;
              const pct =
                totalGames > 0 ? (record.wins / totalGames).toFixed(3) : "—";

              return (
                <React.Fragment key={`${opponent}-${idx}`}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleOpponent(opponent)}
                  >
                    <td className="border px-2 py-1 font-medium text-left">
                      {opponent}
                    </td>
                    <td className="border px-2 py-1">{totalGames}</td>
                    <td className="border px-2 py-1">{record.wins}</td>
                    <td className="border px-2 py-1">{record.losses}</td>
                    <td className="border px-2 py-1">{pct}</td>
                    <td className="border px-2 py-1">
                      {formatSubRecord(record.homeWins, record.homeLosses)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatSubRecord(record.awayWins, record.awayLosses)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatSubRecord(record.playoffWins, record.playoffLosses)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatSubRecord(record.otherWins, record.otherLosses)}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={9} className="bg-gray-50 px-3 py-3">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs sm:text-sm text-center border bg-white rounded">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="border px-2 py-1">Date</th>
                                <th className="border px-2 py-1">Location</th>
                                <th className="border px-2 py-1">Game Type</th>
                                <th className="border px-2 py-1">Result</th>
                                <th className="border px-2 py-1">Score</th>
                                <th className="border px-2 py-1">
                                  SAS Leading Scorer
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {gamesAgainst.map((game, i) => (
                                <tr
                                  key={`${game.GameID ?? i}-${i}`}
                                  className={i % 2 ? "bg-gray-50" : "bg-white"}
                                >
                                  <td className="border px-2 py-1 whitespace-nowrap">
                                    {formatDateUTC(game.Date)}
                                  </td>
                                  <td className="border px-2 py-1 whitespace-nowrap">
                                    {locationLabel(game)}
                                  </td>
                                  <td className="border px-2 py-1 whitespace-nowrap">
                                    {gameTypeLabel(game)}
                                  </td>
                                  <td className="border px-2 py-1 whitespace-nowrap">
                                    {resultLabel(game)}
                                  </td>
                                  <td className="border px-2 py-1 whitespace-nowrap">
                                    {scoreLabel(game)}
                                  </td>
                                  <td className="border px-2 py-1 text-left">
                                    {leadingScorerLabel(game)}
                                  </td>
                                </tr>
                              ))}

                              {gamesAgainst.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="border px-2 py-3 text-gray-600"
                                  >
                                    No games found.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecordsVsOpponents;
