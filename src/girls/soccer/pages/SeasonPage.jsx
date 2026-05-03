import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import {
  formatSoccerDate,
  getPlayerName,
  getSoccerSeasonLabel,
  hydrateRosterPlayers,
  soccerGamePath,
  sortSoccerGames,
} from "../soccerData";

function formatScore(game) {
  if (game.TeamScore == null || game.OpponentScore == null) return "-";
  return `${game.TeamScore}-${game.OpponentScore}`;
}

function formatLocation(game) {
  return game.LocationType || game.Location || game.Site || "Unknown";
}

function resultClassName(result) {
  if (result === "W") return "text-green-700";
  if (result === "L") return "text-red-700";
  return "text-gray-500";
}

function buildEmptyPlayerTotal(playerId) {
  return {
    PlayerID: Number(playerId),
    GamesPlayedSet: new Set(),
    Goals: 0,
    Assists: 0,
    Saves: 0,
  };
}

function addPlayerStat(map, row, gameId, field) {
  const playerId = Number(row?.PlayerID);
  if (!Number.isFinite(playerId)) return;

  if (!map.has(playerId)) {
    map.set(playerId, buildEmptyPlayerTotal(playerId));
  }

  const entry = map.get(playerId);
  entry.GamesPlayedSet.add(Number(gameId));
  entry[field] += Number(row?.[field] || 0);
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatStatValue(value) {
  if (value == null || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) return "-";
  return value;
}

function gameIsAfterDate(game, throughDate) {
  const through = String(throughDate || "").trim();
  const date = String(game?.Date || "").trim();
  if (!through || !date) return false;
  return date > through;
}

function calculatePlayerStats(games, playerId, filterFn = () => true) {
  const totals = {
    GamesPlayedSet: new Set(),
    Goals: 0,
    Assists: 0,
    Saves: 0,
    Shutouts: 0,
  };

  games.filter(filterFn).forEach((game) => {
    let appeared = false;
    let hadSaves = false;

    (game.GoalScorers || [])
      .filter((row) => Number(row?.PlayerID) === Number(playerId))
      .forEach((row) => {
        totals.Goals += Number(row.Goals || 0);
        appeared = true;
      });
    (game.Assists || [])
      .filter((row) => Number(row?.PlayerID) === Number(playerId))
      .forEach((row) => {
        totals.Assists += Number(row.Assists || 0);
        appeared = true;
      });
    (game.Saves || [])
      .filter((row) => Number(row?.PlayerID) === Number(playerId))
      .forEach((row) => {
        totals.Saves += Number(row.Saves || 0);
        appeared = true;
        hadSaves = true;
      });

    if (appeared) totals.GamesPlayedSet.add(Number(game.GameID));
    if (hadSaves && Number(game.OpponentScore) === 0) totals.Shutouts += 1;
  });

  return totals;
}

export default function SeasonPage({ data, status = "" }) {
  const { seasonId } = useParams();

  const season = useMemo(
    () =>
      (data?.seasons || []).find(
        (entry) => Number(entry.SeasonID) === Number(seasonId)
      ) || null,
    [data, seasonId]
  );

  const games = useMemo(
    () =>
      sortSoccerGames(
        (data?.games || []).filter(
          (game) => Number(game?.SeasonID ?? game?.Season) === Number(seasonId)
        )
      ),
    [data, seasonId]
  );

  const roster = useMemo(
    () =>
      (data?.rosters || []).find(
        (entry) => Number(entry.SeasonID) === Number(seasonId)
      ) || null,
    [data, seasonId]
  );

  const rosterEntries = useMemo(
    () => hydrateRosterPlayers(roster, data?.players || []),
    [data, roster]
  );

  const schoolById = useMemo(() => {
    const map = new Map();
    (data?.schools || []).forEach((school) => {
      if (school?.SchoolID) map.set(String(school.SchoolID), school);
    });
    return map;
  }, [data]);

  const rosterById = useMemo(() => {
    const map = new Map();
    rosterEntries.forEach((entry) => map.set(Number(entry.PlayerID), entry));
    return map;
  }, [rosterEntries]);

  const calculatedTotals = useMemo(() => {
    const map = new Map();

    games.forEach((game) => {
      (game.GoalScorers || []).forEach((row) =>
        addPlayerStat(map, row, game.GameID, "Goals")
      );
      (game.Assists || []).forEach((row) =>
        addPlayerStat(map, row, game.GameID, "Assists")
      );
      (game.Saves || []).forEach((row) =>
        addPlayerStat(map, row, game.GameID, "Saves")
      );
    });

    return map;
  }, [games]);

  const adjustmentByPlayerId = useMemo(() => {
    const map = new Map();

    (data?.statAdjustments || [])
      .filter((adjustment) => Number(adjustment?.SeasonID) === Number(seasonId))
      .forEach((adjustment) => {
        const playerId = Number(adjustment?.PlayerID);
        if (Number.isFinite(playerId)) map.set(playerId, adjustment);
      });

    return map;
  }, [data, seasonId]);

  const seasonTotals = useMemo(() => {
    const rosterIds = new Set(rosterEntries.map((entry) => Number(entry.PlayerID)));
    const allPlayerIds = [
      ...rosterEntries.map((entry) => Number(entry.PlayerID)),
      ...[...calculatedTotals.keys()].filter((playerId) => !rosterIds.has(playerId)),
    ];

    return allPlayerIds
      .filter((playerId) => Number.isFinite(playerId))
      .map((playerId) => {
        const calculated = calculatedTotals.get(playerId) || buildEmptyPlayerTotal(playerId);
        const adjustment = adjustmentByPlayerId.get(playerId) || {};
        const official = adjustment.OfficialTotals || {};
        const postAdjustmentStats = adjustment.ThroughDate
          ? calculatePlayerStats(
              games,
              playerId,
              (game) => gameIsAfterDate(game, adjustment.ThroughDate)
            )
          : null;
        const postGamesPlayed = postAdjustmentStats?.GamesPlayedSet.size || 0;
        const adjustedGoals =
          official.Goals != null
            ? official.Goals + safeNumber(postAdjustmentStats?.Goals)
            : calculated.Goals + safeNumber(adjustment.GoalsAdjustment);
        const adjustedAssists =
          official.Assists != null
            ? official.Assists + safeNumber(postAdjustmentStats?.Assists)
            : calculated.Assists + safeNumber(adjustment.AssistsAdjustment);
        const adjustedSaves =
          official.Saves != null
            ? official.Saves + safeNumber(postAdjustmentStats?.Saves)
            : calculated.Saves + safeNumber(adjustment.SavesAdjustment);
        const adjustedGamesPlayed =
          official.GamesPlayed != null
            ? official.GamesPlayed + postGamesPlayed
            : calculated.GamesPlayedSet.size + safeNumber(adjustment.GamesPlayedAdjustment);
        const points =
          official.Points != null
            ? official.Points + safeNumber(postAdjustmentStats?.Goals) * 2 + safeNumber(postAdjustmentStats?.Assists)
            : adjustedGoals * 2 + adjustedAssists;

        return {
          PlayerID: playerId,
          GamesPlayed: adjustedGamesPlayed,
          Goals: adjustedGoals,
          Assists: adjustedAssists,
          Points: points,
          Saves: adjustedSaves,
          Shutouts:
            official.Shutouts != null
              ? official.Shutouts + safeNumber(postAdjustmentStats?.Shutouts)
              : adjustment.Shutouts ?? null,
          GAA: official.GAA ?? adjustment.GAA ?? null,
          HasAdjustment: Boolean(adjustment.PlayerID),
        };
      })
      .sort((a, b) => {
        const rosterA = rosterById.get(Number(a.PlayerID));
        const rosterB = rosterById.get(Number(b.PlayerID));
        const jerseyA = Number(rosterA?.JerseyNumber || 999);
        const jerseyB = Number(rosterB?.JerseyNumber || 999);
        if (jerseyA !== jerseyB) return jerseyA - jerseyB;
        return playerName(a.PlayerID).localeCompare(playerName(b.PlayerID));
      });
  }, [adjustmentByPlayerId, calculatedTotals, rosterById, rosterEntries]);

  const teamTotals = useMemo(
    () =>
      seasonTotals.reduce(
        (totals, row) => ({
          GamesPlayed: Math.max(totals.GamesPlayed, Number(row.GamesPlayed || 0)),
          Goals: totals.Goals + Number(row.Goals || 0),
          Assists: totals.Assists + Number(row.Assists || 0),
          Points: totals.Points + Number(row.Points || 0),
          Saves: totals.Saves + Number(row.Saves || 0),
        }),
        { GamesPlayed: games.length, Goals: 0, Assists: 0, Points: 0, Saves: 0 }
      ),
    [games.length, seasonTotals]
  );

  function playerName(playerId) {
    return getPlayerName(rosterById.get(Number(playerId)));
  }

  function rosterJerseyNumber(playerId) {
    return rosterById.get(Number(playerId))?.JerseyNumber || "-";
  }

  function opponentLogoPath(game) {
    const school = schoolById.get(String(game?.OpponentID ?? ""));
    return school?.LogoPath || school?.BracketLogoPath || null;
  }

  const seasonLabel = season ? getSoccerSeasonLabel(season) : `Spring ${seasonId}`;

  if (!season && !status) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <section className="border border-gray-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Season Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            That girls soccer season is not available yet.
          </p>
          <Link
            to="/athletics/girls/soccer/yearly-results"
            className="mt-5 inline-flex bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Girls Soccer Seasons
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-4 pt-2">
      {status ? <div className="text-center text-gray-600">{status}</div> : null}

      <h1 className="mb-2 text-center text-3xl font-bold">{seasonLabel} Season</h1>

      <section>
        <div className="mb-4 mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>
        </div>

        <div className="grid gap-3 sm:hidden">
          {games.map((game) => {
            const logoPath = opponentLogoPath(game);

            return (
              <Link
                key={game.GameID}
                to={soccerGamePath(game.GameID)}
                className="block border border-gray-200 bg-white p-4 text-gray-900 no-underline shadow-sm transition hover:border-blue-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="mb-2 text-sm text-gray-600">{formatSoccerDate(game)}</p>
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
                        <h3 className="text-lg font-semibold leading-snug">
                          {game.Opponent}
                        </h3>
                        {game.Tournament ? (
                          <p className="mt-0.5 text-xs leading-tight text-gray-500">
                            {game.Tournament}
                          </p>
                        ) : null}
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

        <div className="hidden overflow-x-auto sm:block">
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
              {games.length ? (
                games.map((game, index) => {
                  const logoPath = opponentLogoPath(game);

                  return (
                    <tr key={game.GameID} className={index % 2 ? "bg-gray-50" : "bg-white"}>
                      <td className="border px-3 py-2">{formatSoccerDate(game)}</td>
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
                              to={soccerGamePath(game.GameID)}
                              className="text-blue-700 underline hover:text-blue-900"
                            >
                              {game.Opponent}
                            </Link>
                            {game.Tournament ? (
                              <div className="mt-0.5 text-xs leading-tight text-gray-500">
                                {game.Tournament}
                              </div>
                            ) : null}
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
                })
              ) : (
                <tr>
                  <td className="border px-3 py-8 text-center text-gray-600" colSpan={6}>
                    No games are available for this season yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-4 mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Player Statistics</h2>
        </div>

        {seasonTotals.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-center text-xs whitespace-nowrap sm:text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="sticky left-0 z-10 border bg-gray-100 px-2 py-1 text-left">
                      Player
                    </th>
                    <th className="border px-2 py-1">#</th>
                    <th className="border px-2 py-1">GP</th>
                    <th className="border px-2 py-1">G</th>
                    <th className="border px-2 py-1">A</th>
                    <th className="border px-2 py-1">Pts</th>
                    <th className="border px-2 py-1">Saves</th>
                    <th className="border px-2 py-1">SO</th>
                    <th className="border px-2 py-1">GAA</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonTotals.map((player, index) => (
                    <tr key={player.PlayerID} className={index % 2 ? "bg-gray-50" : "bg-white"}>
                      <td className="sticky left-0 z-10 border bg-inherit px-2 py-1 text-left">
                        <Link
                          to={`/athletics/girls/soccer/players/${player.PlayerID}`}
                          className="text-blue-700 underline hover:text-blue-900"
                        >
                          {playerName(player.PlayerID)}
                        </Link>
                      </td>
                      <td className="border px-2 py-1">{rosterJerseyNumber(player.PlayerID)}</td>
                      <td className="border px-2 py-1">
                        {formatStatValue(player.GamesPlayed)}
                        {player.HasAdjustment ? <span className="ml-0.5 text-blue-700">*</span> : null}
                      </td>
                      <td className="border px-2 py-1">{formatStatValue(player.Goals)}</td>
                      <td className="border px-2 py-1">{formatStatValue(player.Assists)}</td>
                      <td className="border px-2 py-1">{formatStatValue(player.Points)}</td>
                      <td className="border px-2 py-1">{formatStatValue(player.Saves)}</td>
                      <td className="border px-2 py-1">{formatStatValue(player.Shutouts)}</td>
                      <td className="border px-2 py-1">{player.GAA ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td className="sticky left-0 z-10 border bg-gray-100 px-2 py-1 text-left">
                      Team totals
                    </td>
                    <td className="border px-2 py-1">-</td>
                    <td className="border px-2 py-1">{teamTotals.GamesPlayed}</td>
                    <td className="border px-2 py-1">{formatStatValue(teamTotals.Goals)}</td>
                    <td className="border px-2 py-1">{formatStatValue(teamTotals.Assists)}</td>
                    <td className="border px-2 py-1">{formatStatValue(teamTotals.Points)}</td>
                    <td className="border px-2 py-1">{formatStatValue(teamTotals.Saves)}</td>
                    <td className="border px-2 py-1">-</td>
                    <td className="border px-2 py-1">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="mt-2 text-center text-xs leading-relaxed text-gray-600">
              Soccer totals reflect recovered newspaper briefs and official published leader adjustments marked with *.
              The Colleton Prep scoring line accounts for eight of St. Andrew&apos;s nine goals.
            </p>
          </>
        ) : (
          <p className="text-gray-600">No player statistics are available for this season yet.</p>
        )}
      </section>
    </div>
  );
}
