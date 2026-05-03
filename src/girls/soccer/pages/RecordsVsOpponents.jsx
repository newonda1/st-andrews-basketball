import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { normalizeSearchText } from "../../../components/search/searchUtils";
import { soccerGamePath } from "../soccerData";

function formatDateFromGameID(gameId) {
  if (!gameId) return "—";

  const number = Number(gameId);
  if (!Number.isFinite(number)) return "—";

  const year = Math.floor(number / 10000);
  const month = Math.floor(number / 100) % 100;
  const day = number % 100;

  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
    return "—";
  }

  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function formatGameDate(game) {
  const value = String(game?.Date ?? "").trim();
  if (value) {
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  return formatDateFromGameID(game?.GameID);
}

function gameSortKey(game) {
  const value = String(game?.Date ?? "").trim();
  if (value) {
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isNaN(date.getTime())) return date.getTime();
  }

  return safeNum(game?.GameID);
}

function safeNum(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function gameTypeLabel(game) {
  const value = String(game?.GameType ?? "").trim();
  return value || "—";
}

function resultLabel(game) {
  const value = String(game?.Result ?? "").trim();
  if (!value || value.toLowerCase() === "unknown") return "—";
  return value;
}

function locationLabel(game) {
  const value = String(game?.LocationType ?? game?.Location ?? game?.Site ?? "").trim();
  return value || "—";
}

function scoreLabel(game) {
  if (game?.TeamScore == null || game?.OpponentScore == null) return "—";
  return `${game.TeamScore}-${game.OpponentScore}`;
}

function isPlayoffGame(game) {
  const gameType = String(game?.GameType ?? "").trim().toLowerCase();
  if (!gameType) return false;
  return (
    gameType.includes("playoff") ||
    gameType.includes("tournament") ||
    gameType.includes("state") ||
    gameType.includes("semifinal") ||
    gameType.includes("quarterfinal") ||
    gameType.includes("championship")
  );
}

function isOtherGame(game) {
  const gameType = String(game?.GameType ?? "").trim().toLowerCase();
  return gameType === "non-region" || gameType === "nonregion" || gameType === "tournament";
}

function formatSubRecord(wins, losses, ties = 0) {
  const total = safeNum(wins) + safeNum(losses) + safeNum(ties);
  if (!total) return "—";
  return safeNum(ties) > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
}

function formatPct(wins, losses, ties = 0) {
  const total = safeNum(wins) + safeNum(losses) + safeNum(ties);
  if (!total) return "—";
  return (safeNum(wins) / total).toFixed(3);
}

export default function RecordsVsOpponents({ data, status = "" }) {
  const [searchParams] = useSearchParams();
  const [sortField, setSortField] = useState("Total");
  const [sortDirection, setSortDirection] = useState("desc");
  const [expandedOpponent, setExpandedOpponent] = useState(null);

  const teamFilter = searchParams.get("team") || "";
  const normalizedTeamFilter = normalizeSearchText(teamFilter);

  const games = useMemo(() => {
    return (data?.games || []).filter((game) => {
      const opponent = String(game?.Opponent || "").trim();
      return opponent && opponent.toLowerCase() !== "unknown";
    });
  }, [data]);

  const opponentRecords = useMemo(() => {
    const records = {};

    games.forEach((game) => {
      const opponent = String(game?.Opponent || "").trim();
      if (!opponent) return;

      if (!records[opponent]) {
        records[opponent] = {
          wins: 0,
          losses: 0,
          ties: 0,
          homeWins: 0,
          homeLosses: 0,
          homeTies: 0,
          awayWins: 0,
          awayLosses: 0,
          awayTies: 0,
          playoffWins: 0,
          playoffLosses: 0,
          playoffTies: 0,
          otherWins: 0,
          otherLosses: 0,
          otherTies: 0,
        };
      }

      const record = records[opponent];
      const result = String(game?.Result || "").trim().toUpperCase();
      const isWin = result === "W";
      const isLoss = result === "L";
      const isTie = result === "T";
      const location = String(game?.LocationType ?? game?.Location ?? game?.Site ?? "")
        .trim()
        .toLowerCase();

      if (isWin) record.wins += 1;
      else if (isLoss) record.losses += 1;
      else if (isTie) record.ties += 1;

      if (location === "home") {
        if (isWin) record.homeWins += 1;
        else if (isLoss) record.homeLosses += 1;
        else if (isTie) record.homeTies += 1;
      }

      if (location === "away") {
        if (isWin) record.awayWins += 1;
        else if (isLoss) record.awayLosses += 1;
        else if (isTie) record.awayTies += 1;
      }

      if (isPlayoffGame(game)) {
        if (isWin) record.playoffWins += 1;
        else if (isLoss) record.playoffLosses += 1;
        else if (isTie) record.playoffTies += 1;
      }

      if (isOtherGame(game)) {
        if (isWin) record.otherWins += 1;
        else if (isLoss) record.otherLosses += 1;
        else if (isTie) record.otherTies += 1;
      }
    });

    return records;
  }, [games]);

  const sortedOpponents = useMemo(() => {
    return Object.entries(opponentRecords).sort((a, b) => {
      let aValue;
      let bValue;

      if (sortField === "Opponent") {
        aValue = a[0];
        bValue = b[0];
      } else if (sortField === "Wins") {
        aValue = a[1].wins;
        bValue = b[1].wins;
      } else if (sortField === "Losses") {
        aValue = a[1].losses;
        bValue = b[1].losses;
      } else if (sortField === "Pct") {
        aValue = safeNum(formatPct(a[1].wins, a[1].losses, a[1].ties));
        bValue = safeNum(formatPct(b[1].wins, b[1].losses, b[1].ties));
      } else {
        aValue = a[1].wins + a[1].losses + a[1].ties;
        bValue = b[1].wins + b[1].losses + b[1].ties;
      }

      if (typeof aValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [opponentRecords, sortDirection, sortField]);

  const gamesByOpponent = useMemo(() => {
    const map = new Map();

    games.forEach((game) => {
      const opponent = String(game?.Opponent || "").trim();
      if (!map.has(opponent)) map.set(opponent, []);
      map.get(opponent).push(game);
    });

    for (const [opponent, opponentGames] of map.entries()) {
      opponentGames.sort((a, b) => gameSortKey(a) - gameSortKey(b));
      map.set(opponent, opponentGames);
    }

    return map;
  }, [games]);

  const visibleOpponents = useMemo(() => {
    if (!normalizedTeamFilter) return sortedOpponents;

    return sortedOpponents.filter(([opponent]) =>
      normalizeSearchText(opponent).includes(normalizedTeamFilter)
    );
  }, [normalizedTeamFilter, sortedOpponents]);

  useEffect(() => {
    if (!normalizedTeamFilter) return;

    if (visibleOpponents.length === 1) {
      setExpandedOpponent(visibleOpponents[0][0]);
      return;
    }

    if (
      expandedOpponent &&
      !visibleOpponents.some(([opponent]) => opponent === expandedOpponent)
    ) {
      setExpandedOpponent(null);
    }
  }, [expandedOpponent, normalizedTeamFilter, visibleOpponents]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleOpponent = (opponent) => {
    setExpandedOpponent((previous) => (previous === opponent ? null : opponent));
  };

  const goalScorersLabel = (game) => {
    const scorers = (game?.GoalScorers || [])
      .filter((row) => String(row?.Team || "").toLowerCase().includes("andrew"))
      .map((row) => `${row.PlayerName || "Unknown"} - ${row.Goals || 0} goal${Number(row.Goals) === 1 ? "" : "s"}`);

    return scorers.length ? scorers.join("; ") : "—";
  };

  return (
    <div className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow">
      {status ? (
        <div className="mb-4 text-center text-sm text-slate-600">{status}</div>
      ) : null}

      <h1 className="mb-4 text-center text-2xl font-bold">
        {teamFilter.trim()
          ? `Records vs. ${teamFilter.trim()}`
          : "Records vs. Opponents"}
      </h1>

      {teamFilter.trim() ? (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Showing {visibleOpponents.length} matching opponent
          {visibleOpponents.length === 1 ? "" : "s"} for{" "}
          <span className="font-semibold">{teamFilter.trim()}</span>.{" "}
          <Link
            to="/athletics/girls/soccer/records/opponents"
            className="font-semibold text-[var(--stats-navy)]"
          >
            View all opponents
          </Link>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border text-center text-xs sm:text-sm md:text-base">
          <thead>
            <tr className="bg-gray-100">
              <th
                className="cursor-pointer border p-2 text-left"
                onClick={() => handleSort("Opponent")}
              >
                Opponent{" "}
                {sortField === "Opponent" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="cursor-pointer border p-2"
                onClick={() => handleSort("Total")}
              >
                Total Games{" "}
                {sortField === "Total" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="cursor-pointer border p-2"
                onClick={() => handleSort("Wins")}
              >
                Wins {sortField === "Wins" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="cursor-pointer border p-2"
                onClick={() => handleSort("Losses")}
              >
                Losses{" "}
                {sortField === "Losses" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th className="border p-2">Ties</th>
              <th
                className="cursor-pointer border p-2"
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
            {visibleOpponents.map(([opponent, record], index) => {
              const isExpanded = expandedOpponent === opponent;
              const gamesAgainst = gamesByOpponent.get(opponent) || [];
              const totalGames = record.wins + record.losses + record.ties;

              return (
                <React.Fragment key={`${opponent}-${index}`}>
                  <tr
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleOpponent(opponent)}
                  >
                    <td className="border px-2 py-1 text-left font-medium">
                      {opponent}
                    </td>
                    <td className="border px-2 py-1">{totalGames}</td>
                    <td className="border px-2 py-1">{record.wins}</td>
                    <td className="border px-2 py-1">{record.losses}</td>
                    <td className="border px-2 py-1">{record.ties}</td>
                    <td className="border px-2 py-1">
                      {formatPct(record.wins, record.losses, record.ties)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatSubRecord(record.homeWins, record.homeLosses, record.homeTies)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatSubRecord(record.awayWins, record.awayLosses, record.awayTies)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatSubRecord(
                        record.playoffWins,
                        record.playoffLosses,
                        record.playoffTies
                      )}
                    </td>
                    <td className="border px-2 py-1">
                      {formatSubRecord(record.otherWins, record.otherLosses, record.otherTies)}
                    </td>
                  </tr>

                  {isExpanded ? (
                    <tr>
                      <td colSpan={10} className="bg-gray-50 px-3 py-3">
                        <div className="overflow-x-auto">
                          <table className="w-full rounded border bg-white text-center text-xs sm:text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="border px-2 py-1">Date</th>
                                <th className="border px-2 py-1">Location</th>
                                <th className="border px-2 py-1">Game Type</th>
                                <th className="border px-2 py-1">Result</th>
                                <th className="border px-2 py-1">Score</th>
                                <th className="border px-2 py-1">SAS Goal Scorers</th>
                              </tr>
                            </thead>
                            <tbody>
                              {gamesAgainst.map((game, gameIndex) => (
                                <tr
                                  key={`${game.GameID ?? gameIndex}-${gameIndex}`}
                                  className={gameIndex % 2 ? "bg-gray-50" : "bg-white"}
                                >
                                  <td className="whitespace-nowrap border px-2 py-1">
                                    <Link
                                      to={soccerGamePath(game.GameID)}
                                      className="text-blue-700 underline hover:text-blue-900"
                                      onClick={(event) => event.stopPropagation()}
                                    >
                                      {formatGameDate(game)}
                                    </Link>
                                  </td>
                                  <td className="whitespace-nowrap border px-2 py-1">
                                    {locationLabel(game)}
                                  </td>
                                  <td className="whitespace-nowrap border px-2 py-1">
                                    {gameTypeLabel(game)}
                                  </td>
                                  <td className="whitespace-nowrap border px-2 py-1">
                                    {resultLabel(game)}
                                  </td>
                                  <td className="whitespace-nowrap border px-2 py-1">
                                    {scoreLabel(game)}
                                  </td>
                                  <td className="border px-2 py-1 text-left">
                                    {goalScorersLabel(game)}
                                  </td>
                                </tr>
                              ))}

                              {gamesAgainst.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="border px-2 py-3 text-gray-600"
                                  >
                                    No games found.
                                  </td>
                                </tr>
                              ) : null}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}

            {visibleOpponents.length === 0 ? (
              <tr>
                <td colSpan={10} className="border px-3 py-6 text-center text-gray-600">
                  No opponents matched this search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
