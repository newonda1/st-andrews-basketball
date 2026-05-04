import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  GIRLS_BASKETBALL_ROSTERS_PATH,
  SCHOOLS_PATH,
  countsAsPlayerGame,
  getRosterEntriesForSeason,
  getRosterJerseyNumber,
  hydrateGamesWithSchools,
} from "../dataUtils";

const SEASON_ID = 2021;

function Season2021_22() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [showPerGame, setShowPerGame] = useState(false);
  const [showTeamTotals, setShowTeamTotals] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [gamesRes, statsRes, playersRes, rostersRes, schoolsRes] =
        await Promise.all([
          fetch("/data/girls/basketball/games.json"),
          fetch("/data/girls/basketball/playergamestats.json"),
          fetch("/data/players.json"),
          fetch(GIRLS_BASKETBALL_ROSTERS_PATH),
          fetch(SCHOOLS_PATH),
        ]);

      const [gamesData, statsData, playersData, rostersData, schoolsData] =
        await Promise.all([
          gamesRes.json(),
          statsRes.json(),
          playersRes.json(),
          rostersRes.json(),
          schoolsRes.json(),
        ]);

      const seasonGames = hydrateGamesWithSchools(gamesData, schoolsData)
        .filter((game) => Number(game.Season) === SEASON_ID)
        .sort((a, b) => Number(a.GameID) - Number(b.GameID));
      const seasonGameIds = new Set(
        seasonGames.map((game) => Number(game.GameID))
      );

      setGames(seasonGames);
      setPlayerStats(
        statsData.filter((stat) => seasonGameIds.has(Number(stat.GameID)))
      );
      setPlayers(playersData);
      setRosterEntries(getRosterEntriesForSeason(rostersData, "2021-22"));
    }

    fetchData();
  }, []);

  const playerById = useMemo(() => {
    const map = new Map();
    for (const player of players) map.set(Number(player.PlayerID), player);
    return map;
  }, [players]);

  const seasonTotals = useMemo(() => {
    const totals = new Map();

    for (const stat of playerStats) {
      const playerId = Number(stat.PlayerID);
      if (!totals.has(playerId)) {
        totals.set(playerId, {
          PlayerID: playerId,
          Points: 0,
          Rebounds: 0,
          Assists: 0,
          Steals: 0,
          Blocks: 0,
          ThreePM: 0,
          ThreePA: 0,
          TwoPM: 0,
          TwoPA: 0,
          FTM: 0,
          FTA: 0,
          GamesPlayedSet: new Set(),
        });
      }

      const total = totals.get(playerId);
      total.Points += Number(stat.Points || 0);
      total.Rebounds += Number(stat.Rebounds || 0);
      total.Assists += Number(stat.Assists || 0);
      total.Steals += Number(stat.Steals || 0);
      total.Blocks += Number(stat.Blocks || 0);
      total.ThreePM += Number(stat.ThreePM || 0);
      total.ThreePA += Number(stat.ThreePA || 0);
      total.TwoPM += Number(stat.TwoPM || 0);
      total.TwoPA += Number(stat.TwoPA || 0);
      total.FTM += Number(stat.FTM || 0);
      total.FTA += Number(stat.FTA || 0);
      if (countsAsPlayerGame(stat)) total.GamesPlayedSet.add(Number(stat.GameID));
    }

    return Array.from(totals.values())
      .map((total) => ({
        ...total,
        GamesPlayed: total.GamesPlayedSet.size,
      }))
      .sort((a, b) => {
        const jerseyA = Number(getRosterJerseyNumber(rosterEntries, a.PlayerID) || 999);
        const jerseyB = Number(getRosterJerseyNumber(rosterEntries, b.PlayerID) || 999);
        if (jerseyA !== jerseyB) return jerseyA - jerseyB;
        return a.PlayerID - b.PlayerID;
      });
  }, [playerStats, rosterEntries]);

  const teamTotals = useMemo(() => {
    const totals = {
      GamesPlayed: new Set(),
      Points: 0,
      Rebounds: 0,
      Assists: 0,
      Steals: 0,
      Blocks: 0,
      ThreePM: 0,
      ThreePA: 0,
      TwoPM: 0,
      TwoPA: 0,
      FTM: 0,
      FTA: 0,
    };

    for (const stat of playerStats) {
      if (countsAsPlayerGame(stat)) totals.GamesPlayed.add(Number(stat.GameID));
      for (const key of [
        "Points",
        "Rebounds",
        "Assists",
        "Steals",
        "Blocks",
        "ThreePM",
        "ThreePA",
        "TwoPM",
        "TwoPA",
        "FTM",
        "FTA",
      ]) {
        totals[key] += Number(stat[key] || 0);
      }
    }

    return {
      ...totals,
      GamesPlayed: totals.GamesPlayed.size,
    };
  }, [playerStats]);

  const safeNum = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

  const teamTotalsByGameId = useMemo(() => {
    const map = new Map();

    for (const game of games) {
      const rows = playerStats.filter(
        (stat) => Number(stat.GameID) === Number(game.GameID)
      );

      const totals = {
        REB: 0,
        AST: 0,
        TO: 0,
        STL: 0,
        BLK: 0,
        ThreePM: 0,
        ThreePA: 0,
        TwoPM: 0,
        TwoPA: 0,
        FTM: 0,
        FTA: 0,
      };

      for (const row of rows) {
        totals.REB += safeNum(row.Rebounds);
        totals.AST += safeNum(row.Assists);
        totals.TO += safeNum(row.Turnovers);
        totals.STL += safeNum(row.Steals);
        totals.BLK += safeNum(row.Blocks);
        totals.ThreePM += safeNum(row.ThreePM);
        totals.ThreePA += safeNum(row.ThreePA);
        totals.TwoPM += safeNum(row.TwoPM);
        totals.TwoPA += safeNum(row.TwoPA);
        totals.FTM += safeNum(row.FTM);
        totals.FTA += safeNum(row.FTA);
      }

      map.set(Number(game.GameID), totals);
    }

    return map;
  }, [games, playerStats]);

  const playerName = (playerId) => {
    const player = playerById.get(Number(playerId));
    return player ? `${player.FirstName} ${player.LastName}` : "Unknown Player";
  };

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
    if (!attempts) return "-";
    return ((Number(made || 0) / Number(attempts)) * 100).toFixed(1);
  };

  const statPct = (made, attempts) => {
    const madeValue = safeNum(made);
    const attemptValue = safeNum(attempts);
    if (attemptValue <= 0) return "—";
    return `${((madeValue / attemptValue) * 100).toFixed(1)}%`;
  };

  const assistToTurnover = (assists, turnovers) => {
    const assistValue = safeNum(assists);
    const turnoverValue = safeNum(turnovers);
    if (turnoverValue <= 0) return "—";
    return (assistValue / turnoverValue).toFixed(2);
  };

  const valueFor = (player, key) => {
    const value = Number(player[key] || 0);
    if (!showPerGame) return value;
    if (!player.GamesPlayed) return "0.0";
    return (value / player.GamesPlayed).toFixed(1);
  };

  const formatScore = (game) => {
    if (game.TeamScore == null || game.OpponentScore == null) return "Score unavailable";
    return `${game.TeamScore}-${game.OpponentScore}`;
  };

  const formatResult = (game) => game.Result || "-";

  return (
    <div className="pt-2 pb-4 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">2021-22 Season</h1>

      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span
              className={`${
                showTeamTotals ? "text-gray-400" : "text-gray-900 font-semibold"
              }`}
            >
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
            <span
              className={`${
                showTeamTotals ? "text-gray-900 font-semibold" : "text-gray-400"
              }`}
            >
              Team Totals
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {!showTeamTotals ? (
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Date</th>
                  <th className="border px-3 py-2 text-left">Opponent</th>
                  <th className="border px-3 py-2">Result</th>
                  <th className="border px-3 py-2">Score</th>
                  <th className="border px-3 py-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, index) => (
                  <tr
                    key={game.GameID}
                    className={index % 2 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border px-3 py-2">{formatDate(game.GameID)}</td>
                    <td className="border px-3 py-2">
                      <Link
                        to={`/athletics/girls/basketball/games/${game.GameID}`}
                        className="text-blue-700 underline hover:text-blue-900"
                      >
                        {game.Opponent}
                      </Link>
                    </td>
                    <td
                      className={`border px-3 py-2 text-center font-bold ${
                        game.Result === "W"
                          ? "text-green-700"
                          : game.Result === "L"
                            ? "text-red-700"
                            : "text-gray-500"
                      }`}
                    >
                      {formatResult(game)}
                    </td>
                    <td className="border px-3 py-2 text-center">{formatScore(game)}</td>
                    <td className="border px-3 py-2 text-center">
                      {game.GameType || "Regular Season"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full border text-xs sm:text-sm text-center whitespace-nowrap">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Opponent</th>
                  <th className="border px-2 py-1">REB</th>
                  <th className="border px-2 py-1">AST</th>
                  <th className="border px-2 py-1">TO</th>
                  <th className="border px-2 py-1">A/T</th>
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
                {games.map((game, index) => {
                  const totals = teamTotalsByGameId.get(Number(game.GameID));

                  return (
                    <tr
                      key={game.GameID}
                      className={index % 2 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="border px-2 py-1">{formatDate(game.GameID)}</td>
                      <td className="border px-2 py-1">
                        <Link
                          to={`/athletics/girls/basketball/games/${game.GameID}`}
                          className="text-blue-700 underline hover:text-blue-900"
                        >
                          {game.Opponent}
                        </Link>
                      </td>
                      <td className="border px-2 py-1">{totals ? totals.REB : "—"}</td>
                      <td className="border px-2 py-1">{totals ? totals.AST : "—"}</td>
                      <td className="border px-2 py-1">{totals ? totals.TO : "—"}</td>
                      <td className="border px-2 py-1">
                        {totals ? assistToTurnover(totals.AST, totals.TO) : "—"}
                      </td>
                      <td className="border px-2 py-1">{totals ? totals.STL : "—"}</td>
                      <td className="border px-2 py-1">{totals ? totals.BLK : "—"}</td>
                      <td className="border px-2 py-1">{totals ? totals.ThreePM : "—"}</td>
                      <td className="border px-2 py-1">{totals ? totals.ThreePA : "—"}</td>
                      <td className="border px-2 py-1">
                        {totals ? statPct(totals.ThreePM, totals.ThreePA) : "—"}
                      </td>
                      <td className="border px-2 py-1">{totals ? totals.TwoPM : "—"}</td>
                      <td className="border px-2 py-1">{totals ? totals.TwoPA : "—"}</td>
                      <td className="border px-2 py-1">
                        {totals ? statPct(totals.TwoPM, totals.TwoPA) : "—"}
                      </td>
                      <td className="border px-2 py-1">{totals ? totals.FTM : "—"}</td>
                      <td className="border px-2 py-1">{totals ? totals.FTA : "—"}</td>
                      <td className="border px-2 py-1">
                        {totals ? statPct(totals.FTM, totals.FTA) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">Player Statistics</h2>

          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <span
              className={`${
                showPerGame ? "text-gray-400" : "text-gray-900 font-semibold"
              }`}
            >
              Season totals
            </span>
            <button
              type="button"
              onClick={() => setShowPerGame((value) => !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                showPerGame ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  showPerGame ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`${
                showPerGame ? "text-gray-900 font-semibold" : "text-gray-400"
              }`}
            >
              Per game averages
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-xs sm:text-sm text-center whitespace-nowrap">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left sticky left-0 bg-gray-100 z-10">
                  Player
                </th>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">GP</th>
                <th className="border px-2 py-1">PTS</th>
                <th className="border px-2 py-1">REB</th>
                <th className="border px-2 py-1">AST</th>
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
                <tr
                  key={player.PlayerID}
                  className={index % 2 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="border px-2 py-1 text-left sticky left-0 bg-inherit z-10">
                    <Link
                      to={`/athletics/girls/basketball/players/${player.PlayerID}`}
                      className="text-blue-700 underline hover:text-blue-900"
                    >
                      {playerName(player.PlayerID)}
                    </Link>
                  </td>
                  <td className="border px-2 py-1">
                    {getRosterJerseyNumber(rosterEntries, player.PlayerID) || "-"}
                  </td>
                  <td className="border px-2 py-1">{player.GamesPlayed}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Points")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Rebounds")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Assists")}</td>
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
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td className="border px-2 py-1 text-left sticky left-0 bg-gray-100 z-10">
                  Team totals
                </td>
                <td className="border px-2 py-1">-</td>
                <td className="border px-2 py-1">{teamTotals.GamesPlayed}</td>
                <td className="border px-2 py-1">{valueFor(teamTotals, "Points")}</td>
                <td className="border px-2 py-1">{valueFor(teamTotals, "Rebounds")}</td>
                <td className="border px-2 py-1">{valueFor(teamTotals, "Assists")}</td>
                <td className="border px-2 py-1">{valueFor(teamTotals, "Steals")}</td>
                <td className="border px-2 py-1">{valueFor(teamTotals, "Blocks")}</td>
                <td className="border px-2 py-1">{valueFor(teamTotals, "ThreePM")}</td>
                <td className="border px-2 py-1">{valueFor(teamTotals, "ThreePA")}</td>
                <td className="border px-2 py-1">{pct(teamTotals.ThreePM, teamTotals.ThreePA)}</td>
                <td className="border px-2 py-1">{valueFor(teamTotals, "TwoPM")}</td>
                <td className="border px-2 py-1">{valueFor(teamTotals, "TwoPA")}</td>
                <td className="border px-2 py-1">{pct(teamTotals.TwoPM, teamTotals.TwoPA)}</td>
                <td className="border px-2 py-1">{valueFor(teamTotals, "FTM")}</td>
                <td className="border px-2 py-1">{valueFor(teamTotals, "FTA")}</td>
                <td className="border px-2 py-1">{pct(teamTotals.FTM, teamTotals.FTA)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Season2021_22;
