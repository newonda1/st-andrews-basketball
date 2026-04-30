import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { normalizeSearchText } from "../../../components/search/searchUtils";
import { formatGameDate, formatSeasonLabel } from "../footballData";
import { totalPoints, usePreparedFootballRecordsData } from "../footballRecordsData";

import { footballGamePath, footballPlayerPath } from "./footballDetailUtils";

function safeNum(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatPct(wins, losses, ties) {
  const total = safeNum(wins) + safeNum(losses) + safeNum(ties);
  if (!total) return "—";
  return (safeNum(wins) / total).toFixed(3);
}

function formatSubRecord(wins, losses, ties = 0) {
  const total = safeNum(wins) + safeNum(losses) + safeNum(ties);
  if (!total) return "—";
  return ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
}

function locationLabel(game) {
  return String(game?.LocationType || "").trim() || "—";
}

function gameTypeLabel(game) {
  return String(game?.GameType || "").trim() || "—";
}

function resultLabel(game) {
  return String(game?.Result || "").trim() || "—";
}

function scoreLabel(game) {
  const teamScore = game?.TeamScore;
  const opponentScore = game?.OpponentScore;
  if (!Number.isFinite(Number(teamScore)) || !Number.isFinite(Number(opponentScore))) {
    return "—";
  }

  return `${teamScore}-${opponentScore}`;
}

export default function RecordsVsOpponents() {
  const [searchParams] = useSearchParams();
  const { data, error } = usePreparedFootballRecordsData();
  const [sortField, setSortField] = useState("Total");
  const [sortDirection, setSortDirection] = useState("desc");
  const [expandedOpponent, setExpandedOpponent] = useState(null);

  const teamFilter = searchParams.get("team") || "";
  const normalizedTeamFilter = normalizeSearchText(teamFilter);

  const opponentRecords = useMemo(() => {
    if (!data) return {};

    const records = {};

    (data.games || []).forEach((game) => {
      const opponent = String(game?.Opponent || "").trim();
      if (!opponent || opponent.toLowerCase() === "unknown") return;

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
          regionWins: 0,
          regionLosses: 0,
          regionTies: 0,
          playoffWins: 0,
          playoffLosses: 0,
          playoffTies: 0,
        };
      }

      const record = records[opponent];
      const result = String(game?.Result || "").trim().toUpperCase();
      const isWin = result === "W";
      const isLoss = result === "L";
      const isTie = result === "T";
      const location = String(game?.LocationType || "").trim().toLowerCase();
      const gameType = String(game?.GameType || "").trim().toLowerCase();
      const isRegion = gameType === "region";
      const isPlayoff =
        gameType.includes("playoff") ||
        gameType.includes("state") ||
        gameType.includes("championship") ||
        gameType.includes("quarterfinal") ||
        gameType.includes("semifinal");

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

      if (isRegion) {
        if (isWin) record.regionWins += 1;
        else if (isLoss) record.regionLosses += 1;
        else if (isTie) record.regionTies += 1;
      }

      if (isPlayoff) {
        if (isWin) record.playoffWins += 1;
        else if (isLoss) record.playoffLosses += 1;
        else if (isTie) record.playoffTies += 1;
      }
    });

    return records;
  }, [data]);

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

    if (!data) return map;

    (data.games || []).forEach((game) => {
      const opponent = String(game?.Opponent || "").trim();
      if (!opponent || opponent.toLowerCase() === "unknown") return;

      if (!map.has(opponent)) {
        map.set(opponent, []);
      }

      map.get(opponent).push(game);
    });

    for (const [opponent, games] of map.entries()) {
      games.sort((a, b) => safeNum(a?.GameID) - safeNum(b?.GameID));
      map.set(opponent, games);
    }

    return map;
  }, [data]);

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

  const leadingScorerByGameId = useMemo(() => {
    const map = new Map();

    if (!data) return map;

    (data.playerGameRows || []).forEach((row) => {
      const gameId = String(row?.GameID || "");
      if (!gameId) return;

      const points = totalPoints(row);
      if (!Number.isFinite(points) || points <= 0) return;

      const existing = map.get(gameId);
      if (!existing || points > existing.points) {
        map.set(gameId, {
          playerId: row?.PlayerID || "",
          playerName: row?.PlayerName || "Unknown",
          points,
        });
      }
    });

    return map;
  }, [data]);

  const leadingScorerLabel = (game) => {
    const leader = leadingScorerByGameId.get(String(game?.GameID || ""));
    if (!leader) return "—";
    return (
      <>
        {leader.playerId ? (
          <Link to={footballPlayerPath(leader.playerId)} className="text-blue-700 hover:underline">
            {leader.playerName}
          </Link>
        ) : (
          leader.playerName
        )}{" "}
        - {leader.points} points
      </>
    );
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection((previousDirection) =>
        previousDirection === "asc" ? "desc" : "asc"
      );
      return;
    }

    setSortField(field);
    setSortDirection(field === "Opponent" ? "asc" : "desc");
  };

  if (!data && !error) {
    return <div className="p-4 text-center text-gray-600">Loading football opponent history…</div>;
  }

  return (
    <div className="max-w-5xl p-6 mx-auto bg-white rounded-lg shadow">
      <h1 className="mb-4 text-2xl font-bold text-center">
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
            to="/athletics/football/records/opponents"
            className="font-semibold text-[var(--stats-navy)]"
          >
            View all opponents
          </Link>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
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
                Opponent {sortField === "Opponent" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                className="cursor-pointer border p-2"
                onClick={() => handleSort("Total")}
              >
                Total Games {sortField === "Total" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                className="cursor-pointer border p-2"
                onClick={() => handleSort("Wins")}
              >
                Wins {sortField === "Wins" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                className="cursor-pointer border p-2"
                onClick={() => handleSort("Losses")}
              >
                Losses {sortField === "Losses" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                className="cursor-pointer border p-2"
                onClick={() => handleSort("Pct")}
              >
                % {sortField === "Pct" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="border p-2">Home</th>
              <th className="border p-2">Away</th>
              <th className="border p-2">Region</th>
              <th className="border p-2">Playoffs</th>
            </tr>
          </thead>

          <tbody>
            {visibleOpponents.map(([opponent, record], index) => {
              const totalGames = record.wins + record.losses + record.ties;
              const isExpanded = expandedOpponent === opponent;
              const gamesAgainst = gamesByOpponent.get(opponent) || [];

              return (
                <React.Fragment key={`${opponent}-${index}`}>
                  <tr
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      setExpandedOpponent((previousOpponent) =>
                        previousOpponent === opponent ? null : opponent
                      )
                    }
                  >
                    <td className="border px-2 py-1 text-left font-medium">{opponent}</td>
                    <td className="border px-2 py-1">{totalGames}</td>
                    <td className="border px-2 py-1">{record.wins}</td>
                    <td className="border px-2 py-1">{record.losses}</td>
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
                        record.regionWins,
                        record.regionLosses,
                        record.regionTies
                      )}
                    </td>
                    <td className="border px-2 py-1">
                      {formatSubRecord(
                        record.playoffWins,
                        record.playoffLosses,
                        record.playoffTies
                      )}
                    </td>
                  </tr>

                  {isExpanded ? (
                    <tr>
                      <td colSpan={9} className="bg-gray-50 px-3 py-3">
                        <div className="overflow-x-auto">
                          <table className="w-full rounded border bg-white text-center text-xs sm:text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="border px-2 py-1">Date</th>
                                <th className="border px-2 py-1">Season</th>
                                <th className="border px-2 py-1">Location</th>
                                <th className="border px-2 py-1">Game Type</th>
                                <th className="border px-2 py-1">Result</th>
                                <th className="border px-2 py-1">Score</th>
                                <th className="border px-2 py-1">Top SAS Scorer</th>
                              </tr>
                            </thead>

                            <tbody>
                              {gamesAgainst.map((game, gameIndex) => (
                                <tr
                                  key={`${game?.GameID || gameIndex}-${gameIndex}`}
                                  className={gameIndex % 2 ? "bg-gray-50" : "bg-white"}
                                >
                                  <td className="border px-2 py-1 whitespace-nowrap">
                                    <Link
                                      to={footballGamePath(game.GameID)}
                                      className="text-blue-700 hover:underline"
                                    >
                                      {formatGameDate(game)}
                                    </Link>
                                  </td>
                                  <td className="border px-2 py-1 whitespace-nowrap">
                                    <Link
                                      to={`/athletics/football/seasons/${game.SeasonID || game.Season}`}
                                      className="text-blue-700 hover:underline"
                                    >
                                      {formatSeasonLabel(game)}
                                    </Link>
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
                                    <Link
                                      to={footballGamePath(game.GameID)}
                                      className="text-blue-700 hover:underline"
                                    >
                                      {scoreLabel(game)}
                                    </Link>
                                  </td>
                                  <td className="border px-2 py-1 text-left">
                                    {leadingScorerLabel(game)}
                                  </td>
                                </tr>
                              ))}

                              {gamesAgainst.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="border px-2 py-3 text-gray-600">
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
                <td colSpan={9} className="border px-3 py-6 text-center text-gray-600">
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
