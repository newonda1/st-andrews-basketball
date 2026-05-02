import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ArticleFeatureList from "../../../components/ArticleFeatureList";
import {
  GIRLS_BASKETBALL_ROSTERS_PATH,
  SCHOOLS_PATH,
  countsAsPlayerGame,
  getRosterEntriesForSeason,
  getRosterJerseyNumber,
  hydrateGamesWithSchools,
} from "../dataUtils";

const STAT_FIELDS = [
  "MinutesPlayed",
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
  "OffensiveRebounds",
  "DefensiveRebounds",
  "PersonalFouls",
  "Deflections",
  "Charges",
];

const TOTAL_COLUMNS = [
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
];

function emptyTotals(playerId) {
  return {
    PlayerID: Number(playerId),
    MinutesPlayed: null,
    Points: null,
    Rebounds: null,
    Assists: null,
    Turnovers: null,
    Steals: null,
    Blocks: null,
    ThreePM: null,
    ThreePA: null,
    TwoPM: null,
    TwoPA: null,
    FTM: null,
    FTA: null,
    OffensiveRebounds: null,
    DefensiveRebounds: null,
    PersonalFouls: null,
    Deflections: null,
    Charges: null,
    GamesPlayedSet: new Set(),
    GamesPlayedAdjustment: 0,
  };
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function addStat(total, stat) {
  for (const field of STAT_FIELDS) {
    if (!hasValue(stat?.[field])) continue;
    total[field] = Number(total[field] || 0) + Number(stat[field] || 0);
  }
}

function pct(made, attempts) {
  const madeValue = Number(made || 0);
  const attemptValue = Number(attempts || 0);
  if (!attemptValue) return "-";
  return ((madeValue / attemptValue) * 100).toFixed(1);
}

function statPct(made, attempts) {
  const madeValue = Number(made || 0);
  const attemptValue = Number(attempts || 0);
  if (attemptValue <= 0) return "-";
  return `${((madeValue / attemptValue) * 100).toFixed(1)}%`;
}

function assistToTurnover(assists, turnovers) {
  const assistValue = Number(assists || 0);
  const turnoverValue = Number(turnovers || 0);
  if (turnoverValue <= 0) return "-";
  return (assistValue / turnoverValue).toFixed(2);
}

function formatDate(game) {
  const dateValue = Number(game?.Date);
  if (Number.isFinite(dateValue)) {
    return new Date(dateValue).toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const gameId = Math.trunc(Number(game?.GameID));
  if (!Number.isFinite(gameId)) return "";

  const year = Math.floor(gameId / 10000);
  const month = Math.floor(gameId / 100) % 100;
  const day = gameId % 100;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatScore(game) {
  if (game.TeamScore == null || game.OpponentScore == null) return "-";
  return `${game.TeamScore}-${game.OpponentScore}`;
}

function resultClassName(result) {
  if (result === "W") return "text-green-700";
  if (result === "L") return "text-red-700";
  return "text-gray-500";
}

function MaxPrepsSeasonPage({
  seasonId,
  seasonLabel,
  trimShootingColumns = false,
  hideScheduleToggle = false,
  hidePlayerStatsToggle = false,
}) {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [schoolsData, setSchoolsData] = useState([]);
  const [seasonAdjustments, setSeasonAdjustments] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showPerGame, setShowPerGame] = useState(false);
  const [showTeamTotals, setShowTeamTotals] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [gamesRes, statsRes, playersRes, rostersRes, schoolsRes, adjustmentsRes, articlesRes] =
        await Promise.all([
          fetch("/data/girls/basketball/games.json"),
          fetch("/data/girls/basketball/playergamestats.json"),
          fetch("/data/girls/basketball/players.json"),
          fetch(GIRLS_BASKETBALL_ROSTERS_PATH),
          fetch(SCHOOLS_PATH),
          fetch("/data/girls/basketball/adjustments.json").catch(() => null),
          fetch("/data/girls/basketball/articles.json").catch(() => null),
        ]);

      const [
        gamesData,
        statsData,
        playersData,
        rostersData,
        schoolsData,
        adjustmentsData,
        articlesData,
      ] =
        await Promise.all([
          gamesRes.json(),
          statsRes.json(),
          playersRes.json(),
          rostersRes.json(),
          schoolsRes.json(),
          adjustmentsRes?.ok ? adjustmentsRes.json() : Promise.resolve([]),
          articlesRes?.ok ? articlesRes.json() : Promise.resolve([]),
        ]);

      const seasonGames = hydrateGamesWithSchools(gamesData, schoolsData)
        .filter((game) => Number(game.Season) === Number(seasonId))
        .sort(
          (a, b) =>
            Number(a.Date ?? a.GameID) - Number(b.Date ?? b.GameID) ||
            Number(a.GameID) - Number(b.GameID)
        );
      const seasonGameIds = new Set(seasonGames.map((game) => Number(game.GameID)));

      setGames(seasonGames);
      setPlayerStats(statsData.filter((stat) => seasonGameIds.has(Number(stat.GameID))));
      setPlayers(playersData);
      setRosterEntries(getRosterEntriesForSeason(rostersData, seasonLabel));
      setSchoolsData(schoolsData);
      setSeasonAdjustments(
        (Array.isArray(adjustmentsData) ? adjustmentsData : []).filter(
          (adjustment) => Number(adjustment.SeasonID) === Number(seasonId)
        )
      );
      setArticles(
        (Array.isArray(articlesData) ? articlesData : []).filter(
          (article) => Number(article.SeasonID) === Number(seasonId)
        )
      );
    }

    fetchData();
  }, [seasonId, seasonLabel]);

  const playerById = useMemo(() => {
    const map = new Map();
    for (const player of players) map.set(Number(player.PlayerID), player);
    return map;
  }, [players]);

  const schoolById = useMemo(() => {
    const map = new Map();
    for (const school of schoolsData) map.set(String(school.SchoolID), school);
    return map;
  }, [schoolsData]);

  const calculatedTotals = useMemo(() => {
    const totals = new Map();

    for (const stat of playerStats) {
      const playerId = Number(stat.PlayerID);
      if (!totals.has(playerId)) totals.set(playerId, emptyTotals(playerId));

      const total = totals.get(playerId);
      addStat(total, stat);
      if (countsAsPlayerGame(stat)) total.GamesPlayedSet.add(Number(stat.GameID));
    }

    for (const adjustment of seasonAdjustments) {
      const playerId = Number(adjustment.PlayerID);
      if (!totals.has(playerId)) totals.set(playerId, emptyTotals(playerId));

      const total = totals.get(playerId);
      addStat(total, adjustment);
      if (hasValue(adjustment.GamesPlayed)) {
        total.GamesPlayedAdjustment += Number(adjustment.GamesPlayed || 0);
      }
    }

    return totals;
  }, [playerStats, seasonAdjustments]);

  const seasonTotals = useMemo(() => {
    const rosterIds = new Set(rosterEntries.map((entry) => Number(entry.PlayerID)));
    const allPlayerIds = [
      ...rosterEntries.map((entry) => Number(entry.PlayerID)),
      ...[...calculatedTotals.keys()].filter((playerId) => !rosterIds.has(playerId)),
    ];

    return allPlayerIds
      .map((playerId) => {
        const rosterEntry = rosterEntries.find(
          (entry) => Number(entry.PlayerID) === Number(playerId)
        );
        const calculated = calculatedTotals.get(playerId);
        const importedTotals = rosterEntry?.SeasonTotals || {};
        const total = emptyTotals(playerId);

        const calculatedGamesPlayed =
          (calculated?.GamesPlayedSet?.size || 0) +
          Number(calculated?.GamesPlayedAdjustment || 0);

        total.GamesPlayed =
          Number.isFinite(Number(rosterEntry?.GamesPlayed)) && rosterEntry?.GamesPlayed !== null
            ? Number(rosterEntry.GamesPlayed)
            : calculatedGamesPlayed;

        for (const field of STAT_FIELDS) {
          if (hasValue(importedTotals[field])) {
            total[field] = Number(importedTotals[field]);
          } else if (calculated && hasValue(calculated[field])) {
            total[field] = calculated[field];
          }
        }

        return total;
      })
      .filter((total) => {
        if (getRosterJerseyNumber(rosterEntries, total.PlayerID)) return true;
        return TOTAL_COLUMNS.some((field) => hasValue(total[field]));
      })
      .sort((a, b) => {
        const jerseyA = Number(getRosterJerseyNumber(rosterEntries, a.PlayerID) || 999);
        const jerseyB = Number(getRosterJerseyNumber(rosterEntries, b.PlayerID) || 999);
        if (jerseyA !== jerseyB) return jerseyA - jerseyB;
        return a.PlayerID - b.PlayerID;
      });
  }, [calculatedTotals, rosterEntries]);

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
    }

    for (const total of seasonTotals) {
      for (const field of TOTAL_COLUMNS) {
        totals[field] += Number(total[field] || 0);
      }
    }

    return {
      ...totals,
      GamesPlayed:
        seasonTotals.reduce((max, total) => Math.max(max, Number(total.GamesPlayed || 0)), 0) ||
        totals.GamesPlayed.size,
    };
  }, [playerStats, seasonTotals]);

  const teamTotalsByGameId = useMemo(() => {
    const map = new Map();

    for (const game of games) {
      const rows = playerStats.filter((stat) => Number(stat.GameID) === Number(game.GameID));
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
        totals.REB += Number(row.Rebounds || 0);
        totals.AST += Number(row.Assists || 0);
        totals.TO += Number(row.Turnovers || 0);
        totals.STL += Number(row.Steals || 0);
        totals.BLK += Number(row.Blocks || 0);
        totals.ThreePM += Number(row.ThreePM || 0);
        totals.ThreePA += Number(row.ThreePA || 0);
        totals.TwoPM += Number(row.TwoPM || 0);
        totals.TwoPA += Number(row.TwoPA || 0);
        totals.FTM += Number(row.FTM || 0);
        totals.FTA += Number(row.FTA || 0);
      }

      map.set(Number(game.GameID), rows.length ? totals : null);
    }

    return map;
  }, [games, playerStats]);

  const playerName = (playerId) => {
    const player = playerById.get(Number(playerId));
    if (!player) return "Unknown Player";
    return (
      player.PlayerName ||
      player.Name ||
      [player.FirstName, player.LastName].filter(Boolean).join(" ") ||
      "Unknown Player"
    );
  };

  const formatLocation = (game) => game.LocationType || game.Location || game.Site || "Unknown";

  const opponentLogoPath = (game) => {
    const school = schoolById.get(String(game?.OpponentID ?? ""));
    return school?.LogoPath || school?.BracketLogoPath || null;
  };

  const valueFor = (player, key) => {
    const value = Number(player[key] || 0);
    if (!showPerGame) return value;
    if (!player.GamesPlayed) return "0.0";
    return (value / player.GamesPlayed).toFixed(1);
  };

  return (
    <div className="pt-2 pb-4 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">{seasonLabel} Season</h1>

      <ArticleFeatureList
        articles={articles}
        basePath="/athletics/girls/basketball"
        heading="Featured Articles"
      />

      <section>
        <div className="mt-8 mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>

          {!hideScheduleToggle && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className={showTeamTotals ? "text-gray-400" : "text-gray-900 font-semibold"}>
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
              <span className={showTeamTotals ? "text-gray-900 font-semibold" : "text-gray-400"}>
                Team Totals
              </span>
            </div>
          )}
        </div>

        {!showTeamTotals && (
          <div className="grid gap-3 sm:hidden">
            {games.map((game) => {
              const logoPath = opponentLogoPath(game);

              return (
                <Link
                  key={game.GameID}
                  to={`/athletics/girls/basketball/games/${game.GameID}`}
                  className="block border border-gray-200 bg-white p-4 text-gray-900 no-underline shadow-sm transition hover:border-blue-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-2 text-sm text-gray-600">{formatDate(game)}</p>
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden">
                          {logoPath ? (
                            <img
                              src={logoPath}
                              alt=""
                              className="h-full w-full object-contain"
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold leading-snug">{game.Opponent}</h3>
                          {game.Tournament && (
                            <p className="mt-0.5 text-xs leading-tight text-gray-500">
                              {game.Tournament}
                            </p>
                          )}
                          <p className="mt-2 text-sm text-gray-600">
                            {[formatLocation(game), game.GameType || "Regular Season"]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-lg font-bold ${resultClassName(game.Result)}`}>
                        {game.Result || "-"}
                      </p>
                      <p className="text-sm font-semibold">{formatScore(game)}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className={`${!showTeamTotals ? "hidden sm:block" : ""} overflow-x-auto`}>
          {!showTeamTotals ? (
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Date</th>
                  <th className="border px-3 py-2 text-left">Opponent</th>
                  <th className="border px-3 py-2">Location</th>
                  <th className="border px-3 py-2">Result</th>
                  <th className="border px-3 py-2">Score</th>
                  <th className="border px-3 py-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, index) => {
                  const logoPath = opponentLogoPath(game);

                  return (
                    <tr key={game.GameID} className={index % 2 ? "bg-gray-50" : "bg-white"}>
                      <td className="border px-3 py-2">{formatDate(game)}</td>
                      <td className="border px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden">
                            {logoPath ? (
                              <img
                                src={logoPath}
                                alt=""
                                className="h-full w-full object-contain"
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/athletics/girls/basketball/games/${game.GameID}`}
                              className="text-blue-700 underline hover:text-blue-900"
                            >
                              {game.Opponent}
                            </Link>
                            {game.Tournament && (
                              <div className="mt-0.5 text-xs leading-tight text-gray-500">
                                {game.Tournament}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="border px-3 py-2 text-center">{formatLocation(game)}</td>
                      <td
                        className={`border px-3 py-2 text-center font-bold ${resultClassName(
                          game.Result
                        )}`}
                      >
                        {game.Result || "-"}
                      </td>
                      <td className="border px-3 py-2 text-center">{formatScore(game)}</td>
                      <td className="border px-3 py-2 text-center">
                        {game.GameType || "Regular Season"}
                      </td>
                    </tr>
                  );
                })}
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
                  {!trimShootingColumns && (
                    <>
                      <th className="border px-2 py-1">3PM</th>
                      <th className="border px-2 py-1">3PA</th>
                      <th className="border px-2 py-1">3P%</th>
                      <th className="border px-2 py-1">2PM</th>
                      <th className="border px-2 py-1">2PA</th>
                      <th className="border px-2 py-1">2P%</th>
                      <th className="border px-2 py-1">FTM</th>
                      <th className="border px-2 py-1">FTA</th>
                      <th className="border px-2 py-1">FT%</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {games.map((game, index) => {
                  const totals = teamTotalsByGameId.get(Number(game.GameID));

                  return (
                    <tr key={game.GameID} className={index % 2 ? "bg-gray-50" : "bg-white"}>
                      <td className="border px-2 py-1">{formatDate(game)}</td>
                      <td className="border px-2 py-1">
                        <Link
                          to={`/athletics/girls/basketball/games/${game.GameID}`}
                          className="text-blue-700 underline hover:text-blue-900"
                        >
                          {game.Opponent}
                        </Link>
                      </td>
                      <td className="border px-2 py-1">{totals ? totals.REB : "-"}</td>
                      <td className="border px-2 py-1">{totals ? totals.AST : "-"}</td>
                      <td className="border px-2 py-1">{totals ? totals.TO : "-"}</td>
                      <td className="border px-2 py-1">
                        {totals ? assistToTurnover(totals.AST, totals.TO) : "-"}
                      </td>
                      <td className="border px-2 py-1">{totals ? totals.STL : "-"}</td>
                      <td className="border px-2 py-1">{totals ? totals.BLK : "-"}</td>
                      {!trimShootingColumns && (
                        <>
                          <td className="border px-2 py-1">{totals ? totals.ThreePM : "-"}</td>
                          <td className="border px-2 py-1">{totals ? totals.ThreePA : "-"}</td>
                          <td className="border px-2 py-1">
                            {totals ? statPct(totals.ThreePM, totals.ThreePA) : "-"}
                          </td>
                          <td className="border px-2 py-1">{totals ? totals.TwoPM : "-"}</td>
                          <td className="border px-2 py-1">{totals ? totals.TwoPA : "-"}</td>
                          <td className="border px-2 py-1">
                            {totals ? statPct(totals.TwoPM, totals.TwoPA) : "-"}
                          </td>
                          <td className="border px-2 py-1">{totals ? totals.FTM : "-"}</td>
                          <td className="border px-2 py-1">{totals ? totals.FTA : "-"}</td>
                          <td className="border px-2 py-1">
                            {totals ? statPct(totals.FTM, totals.FTA) : "-"}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <div className="mt-8 mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Player Statistics</h2>

          {!hidePlayerStatsToggle && (
            <div className="flex items-center space-x-2 text-xs sm:text-sm">
              <span className={showPerGame ? "text-gray-400" : "text-gray-900 font-semibold"}>
                Season totals
              </span>
              <button
                type="button"
                onClick={() => setShowPerGame((value) => !value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  showPerGame ? "bg-green-500" : "bg-gray-300"
                }`}
                aria-label="Toggle totals / averages"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    showPerGame ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={showPerGame ? "text-gray-900 font-semibold" : "text-gray-400"}>
                Per game averages
              </span>
            </div>
          )}
        </div>

        {seasonTotals.length ? (
          <>
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
                    {!trimShootingColumns && (
                      <>
                        <th className="border px-2 py-1">3PM</th>
                        <th className="border px-2 py-1">3PA</th>
                        <th className="border px-2 py-1">3P%</th>
                        <th className="border px-2 py-1">2PM</th>
                        <th className="border px-2 py-1">2PA</th>
                        <th className="border px-2 py-1">2P%</th>
                        <th className="border px-2 py-1">FTM</th>
                        <th className="border px-2 py-1">FTA</th>
                        <th className="border px-2 py-1">FT%</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {seasonTotals.map((player, index) => (
                    <tr key={player.PlayerID} className={index % 2 ? "bg-gray-50" : "bg-white"}>
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
                      {!trimShootingColumns && (
                        <>
                          <td className="border px-2 py-1">{valueFor(player, "ThreePM")}</td>
                          <td className="border px-2 py-1">{valueFor(player, "ThreePA")}</td>
                          <td className="border px-2 py-1">
                            {pct(player.ThreePM, player.ThreePA)}
                          </td>
                          <td className="border px-2 py-1">{valueFor(player, "TwoPM")}</td>
                          <td className="border px-2 py-1">{valueFor(player, "TwoPA")}</td>
                          <td className="border px-2 py-1">{pct(player.TwoPM, player.TwoPA)}</td>
                          <td className="border px-2 py-1">{valueFor(player, "FTM")}</td>
                          <td className="border px-2 py-1">{valueFor(player, "FTA")}</td>
                          <td className="border px-2 py-1">{pct(player.FTM, player.FTA)}</td>
                        </>
                      )}
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
                    {!trimShootingColumns && (
                      <>
                        <td className="border px-2 py-1">{valueFor(teamTotals, "ThreePM")}</td>
                        <td className="border px-2 py-1">{valueFor(teamTotals, "ThreePA")}</td>
                        <td className="border px-2 py-1">
                          {pct(teamTotals.ThreePM, teamTotals.ThreePA)}
                        </td>
                        <td className="border px-2 py-1">{valueFor(teamTotals, "TwoPM")}</td>
                        <td className="border px-2 py-1">{valueFor(teamTotals, "TwoPA")}</td>
                        <td className="border px-2 py-1">
                          {pct(teamTotals.TwoPM, teamTotals.TwoPA)}
                        </td>
                        <td className="border px-2 py-1">{valueFor(teamTotals, "FTM")}</td>
                        <td className="border px-2 py-1">{valueFor(teamTotals, "FTA")}</td>
                        <td className="border px-2 py-1">{pct(teamTotals.FTM, teamTotals.FTA)}</td>
                      </>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>

            {trimShootingColumns && (
              <p className="mt-2 text-center text-xs leading-relaxed text-gray-600">
                Points are the most complete totals for this season. Other categories may be
                incomplete because rebounds, assists, steals, blocks, and related stats were not
                consistently reported in newspaper recaps.
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-600">
            MaxPreps did not list player statistics for this season.
          </p>
        )}
      </section>
    </div>
  );
}

export default MaxPrepsSeasonPage;
