import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  VOLLEYBALL_STAT_SECTIONS,
  aggregatePlayerSeasonStatsFromGames,
  aggregateTeamSeasonStatsFromMatches,
  buildGameRecord,
  buildPlayerMap,
  formatDate,
  formatRecord,
  formatStat,
  getPlayerName,
  getRosterForSeason,
  getSeasonGames,
  getSeasonLabel,
  getTeamStatCategory,
  hydrateRosterPlayers,
} from "../volleyballData";

const INDIVIDUAL_STATS_VIEW_CONFIG = [
  {
    key: "attack-serve",
    label: "Attack & Serve",
    tableTitles: ["Attacking", "Serving"],
  },
  {
    key: "defense-receive",
    label: "Defense & Receive",
    tableTitles: ["Blocking", "Digging", "Serve Receiving"],
  },
  {
    key: "ball-handling",
    label: "Ball Handling",
    tableTitles: ["Ball Handling"],
  },
];

function hasMeaningfulValue(value) {
  const text = String(value ?? "").trim();
  return text !== "" && text !== "—" && text !== "-" && text.toLowerCase() !== "n/a";
}

function getStatSection(title) {
  return VOLLEYBALL_STAT_SECTIONS.find((entry) => entry.title === title) || null;
}

function getStatColumn(title, key) {
  const section = getStatSection(title);
  return section?.columns.find((column) => column.key === key) || { key, label: key };
}

function getFormattedTeamStat(teamStats, title, key) {
  const stats = getTeamStatCategory(teamStats, title);
  return formatStat(stats[key], getStatColumn(title, key));
}

function hasPlayerStatInSection(row, section) {
  return section.columns.some((column) => {
    if (column.key === "SetsPlayed") return false;
    const value = row[column.key];
    if (value === null || value === undefined || value === "") return false;
    const number = Number(value);
    if (Number.isFinite(number)) return number !== 0;
    return hasMeaningfulValue(value);
  });
}

function getSortValue(row, column, playerMap) {
  if (column.key === "jersey") return Number(row.JerseyNumber || 999);
  if (column.key === "name") {
    const player = playerMap.get(String(row.PlayerID));
    return getPlayerName(player) || row.PlayerName || "";
  }

  const value = row[column.key];
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function sortRowsForSection(rows, section, sortConfig, playerMap) {
  const directionMultiplier = sortConfig.direction === "asc" ? 1 : -1;
  const sortColumn =
    [{ key: "jersey", label: "No." }, { key: "name", label: "Player" }, ...section.columns].find(
      (column) => column.key === sortConfig.key
    ) || { key: "jersey", label: "No." };

  return rows
    .filter((row) => hasPlayerStatInSection(row, section))
    .slice()
    .sort((a, b) => {
      const valueA = getSortValue(a, sortColumn, playerMap);
      const valueB = getSortValue(b, sortColumn, playerMap);

      if (typeof valueA === "string" || typeof valueB === "string") {
        const textDiff = String(valueA || "").localeCompare(String(valueB || ""));
        if (textDiff !== 0) return textDiff * directionMultiplier;
      } else {
        const missingA = valueA === null || valueA === undefined;
        const missingB = valueB === null || valueB === undefined;

        if (missingA !== missingB) return missingA ? 1 : -1;
        if (!missingA && !missingB && valueA !== valueB) {
          return (Number(valueA) - Number(valueB)) * directionMultiplier;
        }
      }

      const jerseyDiff = Number(a.JerseyNumber || 999) - Number(b.JerseyNumber || 999);
      if (jerseyDiff !== 0) return jerseyDiff;

      return String(a.PlayerName || "").localeCompare(String(b.PlayerName || ""));
    });
}

function StatsTable({ title, rows, playerMap }) {
  const section = getStatSection(title);
  const [sortConfig, setSortConfig] = useState({ key: "jersey", direction: "asc" });
  if (!section) return null;

  const columns = [
    { key: "jersey", label: "No." },
    { key: "name", label: "Player" },
    ...section.columns,
  ];
  const displayRows = sortRowsForSection(rows, section, sortConfig, playerMap);

  const updateSort = (column) => {
    setSortConfig((current) => {
      if (current.key === column.key) {
        return {
          key: column.key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key: column.key,
        direction: column.key === "name" || column.key === "jersey" ? "asc" : "desc",
      };
    });
  };

  const renderCell = (row, column) => {
    if (column.key === "jersey") return row.JerseyNumber || "—";

    if (column.key === "name") {
      const player = playerMap.get(String(row.PlayerID));
      return (
        <Link
          to={`/athletics/volleyball/players/${row.PlayerID}`}
          className="text-blue-600 hover:underline"
        >
          {getPlayerName(player) || row.PlayerName || "—"}
        </Link>
      );
    }

    return formatStat(row[column.key], column);
  };

  return (
    <div className="space-y-3">
      <h4 className="mb-3 text-lg font-semibold">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={`${title}-${column.key}`}
                  className={`px-2 py-2 text-center text-xs whitespace-nowrap ${
                    column.key === "name" ? "md:text-left" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => updateSort(column)}
                    className={`inline-flex items-center gap-1 font-semibold hover:text-blue-900 ${
                      column.key === "name" ? "justify-start" : "justify-center"
                    }`}
                    aria-label={`Sort ${title} by ${column.label}`}
                  >
                    <span>{column.label}</span>
                    {sortConfig.key === column.key ? (
                      <span aria-hidden="true">{sortConfig.direction === "asc" ? "^" : "v"}</span>
                    ) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="border-t border-gray-200 px-3 py-4 text-center text-slate-600"
                >
                  No MaxPreps player stats are available for this category.
                </td>
              </tr>
            ) : (
              displayRows.map((row, index) => (
                <tr
                  key={`${title}-${row.PlayerID || row.PlayerName || index}`}
                  className={`border-t border-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                  } hover:bg-gray-100`}
                >
                  {columns.map((column) => (
                    <td
                      key={`${title}-${row.PlayerID || row.PlayerName || index}-${column.key}`}
                      className={`px-2 py-1.5 text-center whitespace-nowrap ${
                        column.key === "name" ? "md:text-left" : ""
                      }`}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamStatsSectionTable({ title, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th colSpan={2} className="px-3 py-2 text-center text-xs uppercase tracking-wide">
              {title}
            </th>
          </tr>
          <tr className="border-t border-gray-200">
            <th className="px-3 py-2 text-left text-xs uppercase tracking-wide">Metric</th>
            <th className="px-3 py-2 text-center text-xs uppercase tracking-wide">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${title}-${row.label}`}
              className={`border-t border-gray-200 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
              } hover:bg-gray-100`}
            >
              <td className="px-3 py-2 text-left">{row.label}</td>
              <td className="px-3 py-2 text-center whitespace-nowrap">
                {row.value === "" || row.value == null ? "—" : row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CombinedTeamStatsTable({ sections }) {
  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow lg:hidden">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wide">Metric</th>
              <th className="px-3 py-2 text-center text-xs uppercase tracking-wide">Value</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="border-t border-gray-200 bg-gray-100">
                  <th colSpan={2} className="px-3 py-2 text-center text-xs uppercase tracking-wide">
                    {section.title}
                  </th>
                </tr>
                {section.rows.map((row, index) => (
                  <tr
                    key={`${section.title}-${row.label}`}
                    className={`border-t border-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                    } hover:bg-gray-100`}
                  >
                    <td className="px-3 py-2 text-left">{row.label}</td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {row.value === "" || row.value == null ? "—" : row.value}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hidden items-start gap-6 lg:grid lg:grid-cols-3">
        {sections.map((section) => (
          <TeamStatsSectionTable key={section.title} title={section.title} rows={section.rows} />
        ))}
      </div>
    </>
  );
}

function buildSchoolMap(schools = []) {
  return new Map(
    (Array.isArray(schools) ? schools : [])
      .filter((school) => school?.SchoolID)
      .map((school) => [String(school.SchoolID), school])
  );
}

function getOpponentSchool(game, schoolMap) {
  if (!game?.OpponentID) return null;
  return schoolMap.get(String(game.OpponentID)) || null;
}

function getOpponentDisplayName(game, schoolMap) {
  const school = getOpponentSchool(game, schoolMap);
  return school?.Name || school?.ShortName || game?.Opponent || "Unknown";
}

function getOpponentLogoPath(game, schoolMap) {
  const school = getOpponentSchool(game, schoolMap);
  return school?.LogoPath || school?.BracketLogoPath || null;
}

function hasNumericValue(value) {
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

function buildSeasonRecord(season, seasonGames) {
  if (hasNumericValue(season?.OverallWins) && hasNumericValue(season?.OverallLosses)) {
    const wins = Number(season.OverallWins);
    const losses = Number(season.OverallLosses);
    const ties = Number(season.OverallTies || 0);
    return {
      wins,
      losses,
      ties: Number.isFinite(ties) ? ties : 0,
      setsWon: null,
      setsLost: null,
    };
  }

  const completedMatches = seasonGames.filter(
    (game) => game.Result === "W" || game.Result === "L" || game.Result === "T"
  );

  if (completedMatches.length > 0) return buildGameRecord(completedMatches);

  return null;
}

export default function SeasonPage({ data, status = "" }) {
  const { seasonId } = useParams();
  const resolvedSeasonId = Number(seasonId);
  const [selectedStatsView, setSelectedStatsView] = useState(
    INDIVIDUAL_STATS_VIEW_CONFIG[0].key
  );

  const playerMap = useMemo(() => buildPlayerMap(data.players), [data.players]);
  const schoolMap = useMemo(() => buildSchoolMap(data.schools), [data.schools]);
  const season = useMemo(
    () => data.seasons.find((entry) => Number(entry.SeasonID) === resolvedSeasonId) || null,
    [data.seasons, resolvedSeasonId]
  );
  const seasonLabel = useMemo(() => {
    if (season) return getSeasonLabel(season);
    if (Number.isFinite(resolvedSeasonId)) return `${resolvedSeasonId}`;
    return "Volleyball";
  }, [resolvedSeasonId, season]);
  const seasonGames = useMemo(
    () => getSeasonGames(data.games, resolvedSeasonId),
    [data.games, resolvedSeasonId]
  );
  const record = useMemo(() => buildSeasonRecord(season, seasonGames), [season, seasonGames]);
  const roster = useMemo(
    () =>
      hydrateRosterPlayers(
        getRosterForSeason(data.rosters, resolvedSeasonId),
        playerMap
      ),
    [data.rosters, playerMap, resolvedSeasonId]
  );
  const playerStats = useMemo(
    () =>
      aggregatePlayerSeasonStatsFromGames(
        data.playerGameStats,
        resolvedSeasonId,
        data.playerSeasonAdjustments
      ),
    [data.playerGameStats, data.playerSeasonAdjustments, resolvedSeasonId]
  );
  const teamStats = useMemo(
    () => aggregateTeamSeasonStatsFromMatches(data.teamMatchStats, resolvedSeasonId),
    [data.teamMatchStats, resolvedSeasonId]
  );

  const attackServeRows = useMemo(
    () => [
      { label: "Kills", value: getFormattedTeamStat(teamStats, "Attacking", "Kills") },
      {
        label: "Kills per set",
        value: getFormattedTeamStat(teamStats, "Attacking", "KillsPerSet"),
      },
      {
        label: "Attack attempts",
        value: getFormattedTeamStat(teamStats, "Attacking", "AttackAttempts"),
      },
      {
        label: "Attack errors",
        value: getFormattedTeamStat(teamStats, "Attacking", "AttackErrors"),
      },
      {
        label: "Hitting pct.",
        value: getFormattedTeamStat(teamStats, "Attacking", "HittingPct"),
      },
      { label: "Aces", value: getFormattedTeamStat(teamStats, "Serving", "Aces") },
      {
        label: "Aces per set",
        value: getFormattedTeamStat(teamStats, "Serving", "AcesPerSet"),
      },
      {
        label: "Serve pct.",
        value: getFormattedTeamStat(teamStats, "Serving", "ServePct"),
      },
      {
        label: "Serving points",
        value: getFormattedTeamStat(teamStats, "Serving", "ServingPoints"),
      },
    ],
    [teamStats]
  );
  const defenseReceiveRows = useMemo(
    () => [
      { label: "Digs", value: getFormattedTeamStat(teamStats, "Digging", "Digs") },
      {
        label: "Digs per set",
        value: getFormattedTeamStat(teamStats, "Digging", "DigsPerSet"),
      },
      {
        label: "Receptions",
        value: getFormattedTeamStat(teamStats, "Serve Receiving", "Receptions"),
      },
      {
        label: "Reception errors",
        value: getFormattedTeamStat(teamStats, "Serve Receiving", "ReceptionErrors"),
      },
      {
        label: "Receptions per set",
        value: getFormattedTeamStat(teamStats, "Serve Receiving", "ReceptionsPerSet"),
      },
      {
        label: "Solo blocks",
        value: getFormattedTeamStat(teamStats, "Blocking", "SoloBlocks"),
      },
      {
        label: "Block assists",
        value: getFormattedTeamStat(teamStats, "Blocking", "BlockAssists"),
      },
      {
        label: "Total blocks",
        value: getFormattedTeamStat(teamStats, "Blocking", "TotalBlocks"),
      },
      {
        label: "Blocks per set",
        value: getFormattedTeamStat(teamStats, "Blocking", "BlocksPerSet"),
      },
    ],
    [teamStats]
  );
  const ballHandlingRows = useMemo(
    () => [
      {
        label: "Sets played",
        value: getFormattedTeamStat(teamStats, "Ball Handling", "SetsPlayed"),
      },
      {
        label: "Assists",
        value: getFormattedTeamStat(teamStats, "Ball Handling", "Assists"),
      },
      {
        label: "Assists per set",
        value: getFormattedTeamStat(teamStats, "Ball Handling", "AssistsPerSet"),
      },
      {
        label: "Ball handling attempts",
        value: getFormattedTeamStat(teamStats, "Ball Handling", "BallHandlingAttempts"),
      },
      {
        label: "Ball handling errors",
        value: getFormattedTeamStat(teamStats, "Ball Handling", "BallHandlingErrors"),
      },
      {
        label: "Overall record",
        value: record ? formatRecord(record.wins, record.losses, record.ties) : "—",
      },
      {
        label: "Sets won / lost",
        value:
          record == null || record.setsWon == null || record.setsLost == null
            ? "—"
            : `${record.setsWon} / ${record.setsLost}`,
      },
      {
        label: "Region finish",
        value: season?.RegionFinish || "—",
      },
      {
        label: "State finish",
        value: season?.StateFinish || "—",
      },
      {
        label: "Georgia rank",
        value: season?.StateRank ? `#${season.StateRank}` : "—",
      },
    ],
    [record, season, teamStats]
  );

  const combinedTeamStatsSections = useMemo(
    () => [
      { title: "Attack & Serve", rows: attackServeRows },
      { title: "Defense & Receive", rows: defenseReceiveRows },
      { title: "Ball Handling & Season", rows: ballHandlingRows },
    ],
    [attackServeRows, ballHandlingRows, defenseReceiveRows]
  );

  const hasTeamStats = useMemo(
    () =>
      combinedTeamStatsSections.some((section) =>
        section.rows.some((row) => hasMeaningfulValue(row.value))
      ),
    [combinedTeamStatsSections]
  );

  const individualStatsViews = useMemo(
    () =>
      INDIVIDUAL_STATS_VIEW_CONFIG.map((view) => ({
        ...view,
        tables: view.tableTitles.map(getStatSection).filter(Boolean),
      })).filter((view) => view.tables.length > 0),
    []
  );

  useEffect(() => {
    if (individualStatsViews.length === 0) return;
    if (individualStatsViews.some((view) => view.key === selectedStatsView)) return;
    setSelectedStatsView(individualStatsViews[0].key);
  }, [individualStatsViews, selectedStatsView]);

  const activeStatsView = useMemo(
    () =>
      individualStatsViews.find((view) => view.key === selectedStatsView) ||
      individualStatsViews[0] ||
      null,
    [individualStatsViews, selectedStatsView]
  );

  const missingSeasonStatus =
    !status && !season && seasonGames.length === 0
      ? `No volleyball data is available for the ${seasonLabel} season.`
      : "";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-10 pt-2 lg:pb-40">
      {status ? <div className="text-center text-slate-600">{status}</div> : null}
      {missingSeasonStatus ? (
        <div className="text-center text-slate-600">{missingSeasonStatus}</div>
      ) : null}

      <section className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{seasonLabel} Season</h1>
      </section>

      <section id="roster" className="space-y-4">
        <h2 className="text-2xl font-semibold">Roster</h2>

        <div className="max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] table-auto text-center text-sm">
              <thead className="bg-gray-100 text-xs text-gray-700 uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-center whitespace-nowrap">No.</th>
                  <th className="px-3 py-2 text-left">Player</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">Grade</th>
                  <th className="px-3 py-2 text-left">Pos.</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {roster.length === 0 ? (
                  <tr>
                    <td
                      className="border-t border-gray-200 px-3 py-4 text-center text-slate-600"
                      colSpan={4}
                    >
                      No MaxPreps roster data is available for this season yet.
                    </td>
                  </tr>
                ) : (
                  roster.map((player, index) => (
                    <tr
                      key={player.PlayerID}
                      className={`border-t border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {player.JerseyNumber || "—"}
                      </td>
                      <td className="px-3 py-2 text-left">
                        <Link
                          to={`/athletics/volleyball/players/${player.PlayerID}`}
                          className="text-blue-600 hover:underline"
                        >
                          {getPlayerName(player) || player.PlayerName || "—"}
                        </Link>
                        {(player.Distinctions || []).length > 0 ? (
                          <>
                            {" "}
                            <span className="text-slate-600">
                              ({player.Distinctions.join("; ")})
                            </span>
                          </>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {player.GradeLabel || player.Grade || "—"}
                      </td>
                      <td className="px-3 py-2 text-left">
                        {(player.Positions || []).join(", ") || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="schedule-results" className="space-y-4">
        <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-xs text-gray-700 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Opponent</th>
                <th className="px-3 py-2 text-center">Site</th>
                <th className="px-3 py-2 text-center">Game Type</th>
                <th className="px-3 py-2 text-center">Result</th>
                <th className="px-3 py-2 text-center">Score</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {seasonGames.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-slate-600">
                    No schedule data is available for this season yet.
                  </td>
                </tr>
              ) : (
                seasonGames.map((game, index) => {
                  const opponentName = getOpponentDisplayName(game, schoolMap);
                  const logoPath = getOpponentLogoPath(game, schoolMap);

                  return (
                    <tr
                      key={game.GameID}
                      className={`border-t border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        {game.DisplayDate || formatDate(game.Date)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden">
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
                          </span>
                          <Link
                            to={`/athletics/volleyball/games/${game.GameID}`}
                            className="text-blue-600 hover:underline"
                          >
                            {opponentName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {game.LocationType || ""}
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {game.GameType || "Regular Season"}
                      </td>
                      <td
                        className={`px-3 py-2 text-center font-semibold whitespace-nowrap ${
                          game.Result === "W"
                            ? "text-emerald-700"
                            : game.Result === "L"
                              ? "text-rose-700"
                              : ""
                        }`}
                      >
                        {game.Result || "—"}
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {game.TeamScore != null && game.OpponentScore != null
                          ? `${game.TeamScore} - ${game.OpponentScore}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="team-stats" className="space-y-6">
        <h2 className="text-2xl font-semibold">Team Stats</h2>

        {hasTeamStats ? (
          <CombinedTeamStatsTable sections={combinedTeamStatsSections} />
        ) : (
          <p className="text-slate-600">No MaxPreps team stats are available for this season.</p>
        )}
      </section>

      <section id="individual-stats" className="space-y-6">
        <h2 className="text-2xl font-semibold">Individual Stats</h2>

        {individualStatsViews.length === 0 ? (
          <p className="text-slate-600">
            No MaxPreps individual stat tables are available for this season.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-3">
              {individualStatsViews.map((view) => {
                const isActive = selectedStatsView === view.key;
                return (
                  <button
                    key={view.key}
                    type="button"
                    onClick={() => setSelectedStatsView(view.key)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                      isActive
                        ? "border-blue-900 bg-blue-900 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {view.label}
                  </button>
                );
              })}
            </div>

            {activeStatsView ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {activeStatsView.label} Statistics
                </h3>
                <div className="space-y-6">
                  {activeStatsView.tables.map((table) => (
                    <StatsTable
                      key={`${resolvedSeasonId}-${table.title}`}
                      title={table.title}
                      rows={playerStats}
                      playerMap={playerMap}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
