import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BOYS_BASKETBALL_ROSTERS_PATH,
  SCHOOLS_PATH,
  countsAsPlayerGame,
  getRosterEntriesForSeason,
  getRosterJerseyNumber,
  hydrateGamesWithSchools,
} from "../dataUtils";

const STAT_FIELDS = [
  "Minutes",
  "Points",
  "Rebounds",
  "Assists",
  "Turnovers",
  "Steals",
  "Blocks",
  "ThreePM",
  "ThreePA",
  "TwoPM",
  "TwoPA",
  "FTM",
  "FTA",
];

function addStat(total, stat) {
  for (const field of STAT_FIELDS) {
    const value = stat?.[field];
    if (value === null || value === undefined || value === "") continue;
    if (total[field] === null || total[field] === undefined) total[field] = 0;
    total[field] += Number(value || 0);
  }
}

function hasAnyStat(total) {
  return STAT_FIELDS.some((field) => total?.[field] !== null && total?.[field] !== undefined);
}

function MaxPrepsSeasonPage({ seasonId, seasonLabel }) {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [seasonInfo, setSeasonInfo] = useState(null);
  const [showPerGame, setShowPerGame] = useState(false);
  const [showTeamTotals, setShowTeamTotals] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [gamesRes, statsRes, playersRes, rostersRes, schoolsRes, seasonsRes] =
        await Promise.all([
          fetch("/data/boys/basketball/games.json"),
          fetch("/data/boys/basketball/playergamestats.json"),
          fetch("/data/players.json"),
          fetch(BOYS_BASKETBALL_ROSTERS_PATH),
          fetch(SCHOOLS_PATH),
          fetch("/data/boys/basketball/seasons.json"),
        ]);

      const [gamesData, statsData, playersData, rostersData, schoolsData, seasonsData] =
        await Promise.all([
          gamesRes.json(),
          statsRes.json(),
          playersRes.json(),
          rostersRes.json(),
          schoolsRes.json(),
          seasonsRes.json(),
        ]);

      const seasonGames = hydrateGamesWithSchools(gamesData, schoolsData)
        .filter((game) => Number(game.Season) === Number(seasonId))
        .sort((a, b) => Number(a.GameID) - Number(b.GameID));
      const seasonGameIds = new Set(seasonGames.map((game) => Number(game.GameID)));

      setGames(seasonGames);
      setPlayerStats(statsData.filter((stat) => seasonGameIds.has(Number(stat.GameID))));
      setPlayers(playersData);
      setRosterEntries(getRosterEntriesForSeason(rostersData, seasonLabel));
      setSeasonInfo(
        seasonsData.find((season) => Number(season.SeasonID) === Number(seasonId)) || null
      );
    }

    fetchData();
  }, [seasonId, seasonLabel]);

  const seasonSummary = useMemo(() => {
    return games.reduce(
      (summary, game) => {
        if (game.Result === "W") summary.wins += 1;
        if (game.Result === "L") summary.losses += 1;
        summary.pointsFor += Number(game.TeamScore || 0);
        summary.pointsAgainst += Number(game.OpponentScore || 0);
        if (game.GameType === "Region") {
          if (game.Result === "W") summary.regionWins += 1;
          if (game.Result === "L") summary.regionLosses += 1;
        }
        return summary;
      },
      { wins: 0, losses: 0, regionWins: 0, regionLosses: 0, pointsFor: 0, pointsAgainst: 0 }
    );
  }, [games]);

  const playerById = useMemo(() => {
    const map = new Map();
    for (const player of players) map.set(Number(player.PlayerID), player);
    return map;
  }, [players]);

  const rosterByPlayerId = useMemo(() => {
    const map = new Map();
    for (const entry of rosterEntries) map.set(Number(entry.PlayerID), entry);
    return map;
  }, [rosterEntries]);

  const gameTotals = useMemo(() => {
    const totals = new Map();

    for (const stat of playerStats) {
      const gameId = Number(stat.GameID);
      if (!totals.has(gameId)) totals.set(gameId, {});
      addStat(totals.get(gameId), stat);
    }

    return totals;
  }, [playerStats]);

  const calculatedPlayerTotals = useMemo(() => {
    const totals = new Map();

    for (const stat of playerStats) {
      const playerId = Number(stat.PlayerID);
      if (!totals.has(playerId)) {
        totals.set(playerId, {
          PlayerID: playerId,
          GamesPlayedSet: new Set(),
        });
      }

      const total = totals.get(playerId);
      addStat(total, stat);
      if (countsAsPlayerGame(stat)) total.GamesPlayedSet.add(Number(stat.GameID));
    }

    return totals;
  }, [playerStats]);

  const playerName = (playerId) => {
    const player = playerById.get(Number(playerId));
    return player ? `${player.FirstName} ${player.LastName}` : "Unknown Player";
  };

  const seasonTotals = useMemo(() => {
    const totals = new Map();

    for (const entry of rosterEntries) {
      const playerId = Number(entry.PlayerID);
      const statTotal = calculatedPlayerTotals.get(playerId);
      const importedTotals = entry.SeasonTotals || {};
      const total = {
        PlayerID: playerId,
        GamesPlayed:
          Number.isFinite(Number(entry.GamesPlayed)) && entry.GamesPlayed !== null
            ? Number(entry.GamesPlayed)
            : statTotal?.GamesPlayedSet?.size || 0,
      };

      for (const field of STAT_FIELDS) {
        if (importedTotals[field] !== null && importedTotals[field] !== undefined) {
          total[field] = Number(importedTotals[field]);
        } else if (statTotal?.[field] !== null && statTotal?.[field] !== undefined) {
          total[field] = Number(statTotal[field]);
        } else {
          total[field] = null;
        }
      }

      totals.set(playerId, total);
    }

    for (const statTotal of calculatedPlayerTotals.values()) {
      if (totals.has(Number(statTotal.PlayerID))) continue;

      const total = {
        PlayerID: Number(statTotal.PlayerID),
        GamesPlayed: statTotal.GamesPlayedSet?.size || 0,
      };

      for (const field of STAT_FIELDS) {
        total[field] =
          statTotal[field] !== null && statTotal[field] !== undefined ? Number(statTotal[field]) : null;
      }

      totals.set(Number(statTotal.PlayerID), total);
    }

    return Array.from(totals.values())
      .filter((total) => hasAnyStat(total) || total.GamesPlayed > 0)
      .sort((a, b) => {
        const jerseyA = Number(getRosterJerseyNumber(rosterEntries, a.PlayerID) ?? 999);
        const jerseyB = Number(getRosterJerseyNumber(rosterEntries, b.PlayerID) ?? 999);
        if (jerseyA !== jerseyB) return jerseyA - jerseyB;
        return playerName(a.PlayerID).localeCompare(playerName(b.PlayerID));
      });
  }, [calculatedPlayerTotals, rosterEntries, playerById]);

  const formatDate = (gameId) => {
    const value = Number(gameId);
    const year = Math.floor(value / 10000);
    const month = Math.floor(value / 100) % 100;
    const day = value % 100;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const pct = (made, attempts) => {
    if (made === null || made === undefined || attempts === null || attempts === undefined || !attempts) {
      return "-";
    }
    return ((Number(made || 0) / Number(attempts)) * 100).toFixed(1);
  };

  const valueFor = (player, key) => {
    const value = player[key];
    if (value === null || value === undefined) return "-";
    if (!showPerGame) return value;
    if (!player.GamesPlayed) return "-";
    return (Number(value || 0) / player.GamesPlayed).toFixed(1);
  };

  const totalCell = (totals, key) => {
    const value = totals?.[key];
    return value === null || value === undefined ? "-" : value;
  };

  const freeThrowCell = (totals) => {
    if (totals?.FTM === null || totals?.FTM === undefined) return "-";
    if (totals?.FTA === null || totals?.FTA === undefined) return `${totals.FTM}-`;
    return `${totals.FTM}-${totals.FTA}`;
  };

  return (
    <div className="pt-2 pb-4 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">{seasonLabel} Season</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mt-4 mb-3">Season Recap</h2>
        <div className="rounded-lg border bg-white p-4 text-gray-800 leading-relaxed shadow-sm">
          <p>
            St. Andrew&apos;s finished {seasonSummary.wins}-{seasonSummary.losses}
            {seasonInfo?.HeadCoach ? ` under head coach ${seasonInfo.HeadCoach}` : ""}.
            The Lions scored {seasonSummary.pointsFor} points and allowed{" "}
            {seasonSummary.pointsAgainst} across {games.length} recorded games.
            {seasonSummary.regionWins || seasonSummary.regionLosses
              ? ` In regular-season region play, St. Andrew's went ${seasonSummary.regionWins}-${seasonSummary.regionLosses}.`
              : ""}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">Overall</div>
            <div className="text-2xl font-bold text-gray-900">
              {seasonSummary.wins}-{seasonSummary.losses}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">Region</div>
            <div className="text-2xl font-bold text-gray-900">
              {seasonSummary.regionWins}-{seasonSummary.regionLosses}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">Points</div>
            <div className="text-2xl font-bold text-gray-900">
              {seasonSummary.pointsFor}-{seasonSummary.pointsAgainst}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">Coach</div>
            <div className="text-2xl font-bold text-gray-900">
              {seasonInfo?.HeadCoach || "-"}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>

          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <span className={`${showTeamTotals ? "text-gray-400" : "text-gray-900 font-semibold"}`}>
              Game Result
            </span>
            <button
              type="button"
              onClick={() => setShowTeamTotals((value) => !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                showTeamTotals ? "bg-green-500" : "bg-gray-300"
              }`}
              aria-label="Toggle Game Result / Team Totals"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  showTeamTotals ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`${showTeamTotals ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
              Team Totals
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Date</th>
                <th className="border px-3 py-2 text-left">Opponent</th>
                <th className="border px-3 py-2">Location</th>
                <th className="border px-3 py-2">Type</th>
                {!showTeamTotals ? (
                  <>
                    <th className="border px-3 py-2">Result</th>
                    <th className="border px-3 py-2">Score</th>
                  </>
                ) : (
                  <>
                    <th className="border px-3 py-2">PTS</th>
                    <th className="border px-3 py-2">REB</th>
                    <th className="border px-3 py-2">AST</th>
                    <th className="border px-3 py-2">TO</th>
                    <th className="border px-3 py-2">STL</th>
                    <th className="border px-3 py-2">BLK</th>
                    <th className="border px-3 py-2">3PM</th>
                    <th className="border px-3 py-2">FT</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => {
                const totals = gameTotals.get(Number(game.GameID)) || {};
                return (
                  <tr key={game.GameID} className={index % 2 ? "bg-gray-50" : "bg-white"}>
                    <td className="border px-3 py-2">{formatDate(game.GameID)}</td>
                    <td className="border px-3 py-2">
                      <Link
                        to={`/athletics/boys/basketball/games/${game.GameID}`}
                        className="text-blue-700 underline hover:text-blue-900"
                      >
                        {game.Opponent}
                      </Link>
                    </td>
                    <td className="border px-3 py-2 text-center">{game.LocationType}</td>
                    <td className="border px-3 py-2 text-center">{game.GameType}</td>
                    {!showTeamTotals ? (
                      <>
                        <td
                          className={`border px-3 py-2 text-center font-bold ${
                            game.Result === "W" ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {game.Result}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {game.TeamScore}-{game.OpponentScore}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border px-3 py-2 text-center">{game.TeamScore}</td>
                        <td className="border px-3 py-2 text-center">{totalCell(totals, "Rebounds")}</td>
                        <td className="border px-3 py-2 text-center">{totalCell(totals, "Assists")}</td>
                        <td className="border px-3 py-2 text-center">{totalCell(totals, "Turnovers")}</td>
                        <td className="border px-3 py-2 text-center">{totalCell(totals, "Steals")}</td>
                        <td className="border px-3 py-2 text-center">{totalCell(totals, "Blocks")}</td>
                        <td className="border px-3 py-2 text-center">{totalCell(totals, "ThreePM")}</td>
                        <td className="border px-3 py-2 text-center">{freeThrowCell(totals)}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">Player Statistics</h2>

          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <span className={`${showPerGame ? "text-gray-400" : "text-gray-900 font-semibold"}`}>
              Season totals
            </span>
            <button
              type="button"
              onClick={() => setShowPerGame((value) => !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                showPerGame ? "bg-green-500" : "bg-gray-300"
              }`}
              aria-label="Toggle season totals / per game averages"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  showPerGame ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`${showPerGame ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
              Per game averages
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-xs sm:text-sm text-center whitespace-nowrap">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left sticky left-0 bg-gray-100 z-10">Player</th>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">GP</th>
                <th className="border px-2 py-1">PTS</th>
                <th className="border px-2 py-1">REB</th>
                <th className="border px-2 py-1">AST</th>
                <th className="border px-2 py-1">TO</th>
                <th className="border px-2 py-1">STL</th>
                <th className="border px-2 py-1">BLK</th>
                <th className="border px-2 py-1">3PM</th>
                <th className="border px-2 py-1">3PA</th>
                <th className="border px-2 py-1">3P%</th>
                <th className="border px-2 py-1">2PM</th>
                <th className="border px-2 py-1">2PA</th>
                <th className="border px-2 py-1">2P%</th>
                <th className="border px-2 py-1">FTM</th>
                <th className="border px-2 py-1">FTA</th>
                <th className="border px-2 py-1">FT%</th>
              </tr>
            </thead>
            <tbody>
              {seasonTotals.map((player, index) => (
                <tr key={player.PlayerID} className={index % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="border px-2 py-1 text-left sticky left-0 bg-inherit z-10">
                    <Link
                      to={`/athletics/boys/basketball/players/${player.PlayerID}`}
                      className="text-blue-700 underline hover:text-blue-900"
                    >
                      {playerName(player.PlayerID)}
                    </Link>
                  </td>
                  <td className="border px-2 py-1">
                    {getRosterJerseyNumber(rosterEntries, player.PlayerID) ?? "-"}
                  </td>
                  <td className="border px-2 py-1">{player.GamesPlayed || "-"}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Points")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Rebounds")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Assists")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Turnovers")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Steals")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Blocks")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "ThreePM")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "ThreePA")}</td>
                  <td className="border px-2 py-1">{pct(player.ThreePM, player.ThreePA)}</td>
                  <td className="border px-2 py-1">{valueFor(player, "TwoPM")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "TwoPA")}</td>
                  <td className="border px-2 py-1">{pct(player.TwoPM, player.TwoPA)}</td>
                  <td className="border px-2 py-1">{valueFor(player, "FTM")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "FTA")}</td>
                  <td className="border px-2 py-1">{pct(player.FTM, player.FTA)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default MaxPrepsSeasonPage;
