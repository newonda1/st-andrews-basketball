import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  RegionBracket5GameSVG,
  StateBracket16GameSVG,
} from "../components/GameCardBracketsSVG";
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

const TOTAL_COLUMNS = [
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

function emptyTotals(playerId) {
  return {
    PlayerID: Number(playerId),
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
    GamesPlayedSet: new Set(),
  };
}

function addStat(total, stat) {
  for (const field of STAT_FIELDS) {
    const value = stat?.[field];
    if (value === null || value === undefined || value === "") continue;
    total[field] = Number(total[field] || 0) + Number(value || 0);
  }
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function MaxPrepsSeasonPage({
  seasonId,
  seasonLabel,
  recapContent = null,
  scoringOnly = false,
  statSourceLabel = "MaxPreps",
  trimShootingColumns = false,
  hidePlayerStatsToggle = false,
}) {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [seasonInfo, setSeasonInfo] = useState(null);
  const [bracketsData, setBracketsData] = useState(null);
  const [schoolsData, setSchoolsData] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [showPerGame, setShowPerGame] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [
        gamesRes,
        statsRes,
        playersRes,
        bracketsRes,
        rostersRes,
        schoolsRes,
        seasonsRes,
        adjustmentsRes,
      ] = await Promise.all([
        fetch("/data/boys/basketball/games.json"),
        fetch("/data/boys/basketball/playergamestats.json"),
        fetch("/data/players.json"),
        fetch("/data/boys/basketball/brackets.json"),
        fetch(BOYS_BASKETBALL_ROSTERS_PATH),
        fetch(SCHOOLS_PATH),
        fetch("/data/boys/basketball/seasons.json"),
        fetch("/data/boys/basketball/adjustments.json").catch(() => null),
      ]);

      const [
        gamesData,
        statsData,
        playersData,
        bracketsJson,
        rostersData,
        schoolsJson,
        seasonsData,
        adjustmentsData,
      ] = await Promise.all([
        gamesRes.json(),
        statsRes.json(),
        playersRes.json(),
        bracketsRes.json(),
        rostersRes.json(),
        schoolsRes.json(),
        seasonsRes.json(),
        adjustmentsRes?.ok ? adjustmentsRes.json() : [],
      ]);

      const seasonGames = hydrateGamesWithSchools(gamesData, schoolsJson)
        .filter((game) => Number(game.Season) === Number(seasonId))
        .sort((a, b) => Number(a.GameID) - Number(b.GameID));
      const seasonGameIds = new Set(seasonGames.map((game) => Number(game.GameID)));

      setGames(seasonGames);
      setPlayerStats(statsData.filter((stat) => seasonGameIds.has(Number(stat.GameID))));
      setPlayers(playersData);
      setRosterEntries(getRosterEntriesForSeason(rostersData, seasonLabel));
      setBracketsData(bracketsJson);
      setSchoolsData(schoolsJson);
      setSeasonInfo(
        seasonsData.find((season) => Number(season.SeasonID) === Number(seasonId)) || null
      );
      setAdjustments(
        (Array.isArray(adjustmentsData) ? adjustmentsData : []).filter(
          (row) => Number(row.SeasonID) === Number(seasonId)
        )
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
        if (game.RegionGame === "Yes" || game.GameType === "Region") {
          if (game.Result === "W") summary.regionWins += 1;
          if (game.Result === "L") summary.regionLosses += 1;
        }
        return summary;
      },
      {
        wins: 0,
        losses: 0,
        regionWins: 0,
        regionLosses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      }
    );
  }, [games]);

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

  const playerName = (playerId) => {
    const player = playerById.get(Number(playerId));
    return player ? `${player.FirstName} ${player.LastName}` : "Unknown Player";
  };

  const adjustmentMap = useMemo(() => {
    const map = new Map();

    for (const adjustment of adjustments) {
      const playerId = Number(adjustment.PlayerID);
      if (!Number.isFinite(playerId)) continue;
      if (!map.has(playerId)) map.set(playerId, emptyTotals(playerId));
      addStat(map.get(playerId), adjustment);
    }

    return map;
  }, [adjustments]);

  const calculatedTotals = useMemo(() => {
    const totals = new Map();

    for (const stat of playerStats) {
      const playerId = Number(stat.PlayerID);
      if (!totals.has(playerId)) totals.set(playerId, emptyTotals(playerId));

      const total = totals.get(playerId);
      addStat(total, stat);
      if (countsAsPlayerGame(stat)) total.GamesPlayedSet.add(Number(stat.GameID));
    }

    return totals;
  }, [playerStats]);

  const seasonTotals = useMemo(() => {
    const totals = new Map();

    for (const entry of rosterEntries) {
      const playerId = Number(entry.PlayerID);
      const calculated = calculatedTotals.get(playerId);
      const adjusted = adjustmentMap.get(playerId);
      const importedTotals = entry.SeasonTotals || {};
      const total = emptyTotals(playerId);

      total.GamesPlayed =
        Number.isFinite(Number(entry.GamesPlayed)) && entry.GamesPlayed !== null
          ? Number(entry.GamesPlayed)
          : calculated?.GamesPlayedSet?.size || 0;

      for (const field of STAT_FIELDS) {
        if (hasValue(importedTotals[field])) {
          total[field] = Number(importedTotals[field]);
        } else if (hasValue(calculated?.[field])) {
          total[field] = Number(calculated[field]);
        }

        if (hasValue(adjusted?.[field]) && (hasValue(total[field]) || Number(adjusted[field]) !== 0)) {
          total[field] = Number(total[field] || 0) + Number(adjusted[field] || 0);
        }
      }

      totals.set(playerId, total);
    }

    for (const calculated of calculatedTotals.values()) {
      const playerId = Number(calculated.PlayerID);
      if (totals.has(playerId)) continue;

      const total = emptyTotals(playerId);
      total.GamesPlayed = calculated.GamesPlayedSet?.size || 0;
      for (const field of STAT_FIELDS) {
        if (hasValue(calculated[field])) total[field] = Number(calculated[field]);
      }
      totals.set(playerId, total);
    }

    return Array.from(totals.values())
      .filter((total) => total.GamesPlayed > 0 || STAT_FIELDS.some((field) => hasValue(total[field])))
      .sort((a, b) => {
        const jerseyA = Number(getRosterJerseyNumber(rosterEntries, a.PlayerID) ?? 999);
        const jerseyB = Number(getRosterJerseyNumber(rosterEntries, b.PlayerID) ?? 999);
        if (jerseyA !== jerseyB) return jerseyA - jerseyB;
        return playerName(a.PlayerID).localeCompare(playerName(b.PlayerID));
      });
  }, [adjustmentMap, calculatedTotals, rosterEntries, playerById]);

  const teamTotals = useMemo(() => {
    if (!seasonTotals.length) return null;

    const totals = {
      PlayerID: "team",
      GamesPlayed: 0,
      Points: 0,
      Rebounds: 0,
      Assists: 0,
      Turnovers: 0,
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
      if (countsAsPlayerGame(stat)) totals.GamesPlayed += 1;
    }

    for (const total of seasonTotals) {
      for (const field of TOTAL_COLUMNS) {
        totals[field] += Number(total[field] || 0);
      }
    }

    totals.GamesPlayed =
      seasonTotals.reduce((max, total) => Math.max(max, Number(total.GamesPlayed || 0)), 0) ||
      totals.GamesPlayed;

    return totals;
  }, [playerStats, seasonTotals]);

  const leaders = useMemo(() => {
    const byStat = (key) =>
      seasonTotals
        .filter((player) => hasValue(player[key]))
        .sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0))[0] || null;

    return {
      points: byStat("Points"),
      rebounds: byStat("Rebounds"),
      assists: byStat("Assists"),
      steals: byStat("Steals"),
    };
  }, [seasonTotals]);

  const leaderText = (leader, key) => {
    if (!leader || !hasValue(leader[key])) return null;
    return `${playerName(leader.PlayerID)} (${leader[key]})`;
  };

  const leaderParts = [
    ["points", leaderText(leaders.points, "Points")],
    ["rebounds", leaderText(leaders.rebounds, "Rebounds")],
    ["assists", leaderText(leaders.assists, "Assists")],
    ["steals", leaderText(leaders.steals, "Steals")],
  ].filter(([, text]) => text);

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

  const formatLocation = (game) => {
    return game.LocationType || game.Location || game.Site || "Unknown";
  };

  const opponentLogoPath = (game) => {
    const school = schoolById.get(String(game?.OpponentID ?? ""));
    return school?.LogoPath || school?.BracketLogoPath || null;
  };

  const pct = (made, attempts) => {
    if (!hasValue(made) || !hasValue(attempts) || !Number(attempts)) return "-";
    return ((Number(made || 0) / Number(attempts)) * 100).toFixed(1);
  };

  const valueFor = (player, key) => {
    const value = player[key];
    if (!hasValue(value)) return "-";
    if (!showPerGame) return value;
    if (!player.GamesPlayed) return "-";
    return (Number(value || 0) / player.GamesPlayed).toFixed(1);
  };

  const bracket = bracketsData?.[String(seasonId)];

  return (
    <div className="pt-2 pb-4 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">{seasonLabel} Season</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mt-4 mb-3">Season Recap</h2>

        {recapContent ? (
          <div className="text-gray-800 leading-relaxed">{recapContent}</div>
        ) : (
          <div className="text-gray-800 leading-relaxed">
            <p className="mb-3 leading-relaxed">
              The {seasonLabel} St. Andrew&apos;s boys basketball team finished{" "}
              {seasonSummary.wins}-{seasonSummary.losses}
              {seasonInfo?.HeadCoach ? ` under head coach ${seasonInfo.HeadCoach}` : ""}.
              The Lions scored {seasonSummary.pointsFor} points and allowed{" "}
              {seasonSummary.pointsAgainst} across {games.length} games recorded in
              the archive.
            </p>

            <p className="mb-3 leading-relaxed">
              In regular-season region play, St. Andrew&apos;s went{" "}
              {seasonSummary.regionWins}-{seasonSummary.regionLosses}. The schedule
              below includes the game results currently available for the season,
              followed by any tournament brackets that have been entered for that
              year.
            </p>

            {leaderParts.length > 0 && (
              <p className="mb-3 leading-relaxed">
                {statSourceLabel} stat leaders for the season were{" "}
                {leaderParts.map(([label, text], index) => (
                  <React.Fragment key={label}>
                    {index > 0 && (index === leaderParts.length - 1 ? ", and " : ", ")}
                    {text} in {label}
                  </React.Fragment>
                ))}
                .
              </p>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>
        </div>

        <div className="overflow-x-auto">
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
                    <td className="border px-3 py-2">{formatDate(game.GameID)}</td>
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
                            to={`/athletics/boys/basketball/games/${game.GameID}`}
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
                      className={`border px-3 py-2 text-center font-bold ${
                        game.Result === "W" ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {game.Result}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      {game.TeamScore}-{game.OpponentScore}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      {game.GameType || "Regular Season"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Region Tournament Bracket</h2>
        {bracketsData === null ? (
          <p className="text-gray-600">Loading region bracket...</p>
        ) : bracket?.region ? (
          <RegionBracket5GameSVG bracket={bracket.region} schools={schoolsData} />
        ) : (
          <p className="text-gray-600">Region bracket data is not available for this season.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">State Tournament Bracket</h2>
        {bracketsData === null ? (
          <p className="text-gray-600">Loading state bracket...</p>
        ) : bracket?.state ? (
          <StateBracket16GameSVG bracket={bracket.state} schools={schoolsData} />
        ) : (
          <p className="text-gray-600">State bracket data is not available for this season.</p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">Player Statistics</h2>

          {!scoringOnly && !hidePlayerStatsToggle && (
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
                aria-label="Toggle season totals / per game averages"
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
          )}
        </div>

        <div className="overflow-x-auto">
          <table
            className={`border text-xs sm:text-sm text-center whitespace-nowrap ${
              scoringOnly ? "w-full min-w-[420px]" : "min-w-full"
            }`}
          >
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left sticky left-0 bg-gray-100 z-10">
                  Player
                </th>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">GP</th>
                <th className="border px-2 py-1">PTS</th>
                {scoringOnly ? (
                  <th className="border px-2 py-1">PPG</th>
                ) : (
                  <>
                    <th className="border px-2 py-1">REB</th>
                    <th className="border px-2 py-1">AST</th>
                    <th className="border px-2 py-1">STL</th>
                    <th className="border px-2 py-1">BLK</th>
                    {!trimShootingColumns && (
                      <>
                        <th className="border px-2 py-1">TO</th>
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
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {seasonTotals.map((player, index) => {
                const scoringGames = Number(player.GamesPlayed || 0);
                const points = Number(player.Points || 0);

                return (
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
                    {scoringOnly ? (
                      <td className="border px-2 py-1">
                        {scoringGames ? (points / scoringGames).toFixed(1) : "-"}
                      </td>
                    ) : (
                      <>
                        <td className="border px-2 py-1">{valueFor(player, "Rebounds")}</td>
                        <td className="border px-2 py-1">{valueFor(player, "Assists")}</td>
                        <td className="border px-2 py-1">{valueFor(player, "Steals")}</td>
                        <td className="border px-2 py-1">{valueFor(player, "Blocks")}</td>
                        {!trimShootingColumns && (
                          <>
                            <td className="border px-2 py-1">{valueFor(player, "Turnovers")}</td>
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
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
            {!scoringOnly && teamTotals && (
              <tfoot className="bg-gray-100 font-semibold">
                <tr>
                  <td className="border px-2 py-1 text-left sticky left-0 bg-gray-100 z-10">
                    Team totals
                  </td>
                  <td className="border px-2 py-1">-</td>
                  <td className="border px-2 py-1">{teamTotals.GamesPlayed || "-"}</td>
                  <td className="border px-2 py-1">{valueFor(teamTotals, "Points")}</td>
                  <td className="border px-2 py-1">{valueFor(teamTotals, "Rebounds")}</td>
                  <td className="border px-2 py-1">{valueFor(teamTotals, "Assists")}</td>
                  <td className="border px-2 py-1">{valueFor(teamTotals, "Steals")}</td>
                  <td className="border px-2 py-1">{valueFor(teamTotals, "Blocks")}</td>
                  {!trimShootingColumns && (
                    <>
                      <td className="border px-2 py-1">{valueFor(teamTotals, "Turnovers")}</td>
                      <td className="border px-2 py-1">{valueFor(teamTotals, "ThreePM")}</td>
                      <td className="border px-2 py-1">{valueFor(teamTotals, "ThreePA")}</td>
                      <td className="border px-2 py-1">
                        {pct(teamTotals.ThreePM, teamTotals.ThreePA)}
                      </td>
                      <td className="border px-2 py-1">{valueFor(teamTotals, "TwoPM")}</td>
                      <td className="border px-2 py-1">{valueFor(teamTotals, "TwoPA")}</td>
                      <td className="border px-2 py-1">{pct(teamTotals.TwoPM, teamTotals.TwoPA)}</td>
                      <td className="border px-2 py-1">{valueFor(teamTotals, "FTM")}</td>
                      <td className="border px-2 py-1">{valueFor(teamTotals, "FTA")}</td>
                      <td className="border px-2 py-1">{pct(teamTotals.FTM, teamTotals.FTA)}</td>
                    </>
                  )}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {scoringOnly && (
          <p className="mt-2 text-center text-xs leading-relaxed text-gray-600">
            This season currently includes scoring by game only. GP reflects games
            in which a player recorded points in the surviving scoring archive.
          </p>
        )}
        {trimShootingColumns && !scoringOnly && (
          <p className="mt-2 text-center text-xs leading-relaxed text-gray-600">
            Points are the most complete totals for this season. Other categories may be
            incomplete because rebounds, assists, steals, blocks, and related stats were not
            consistently reported in newspaper recaps.
          </p>
        )}
      </section>
    </div>
  );
}

export default MaxPrepsSeasonPage;
