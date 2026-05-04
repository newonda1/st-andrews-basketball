import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  VOLLEYBALL_STAT_SECTIONS,
  aggregateAllPlayerSeasonStatsFromGames,
  aggregateTeamSeasonStatsFromMatches,
  aggregateVolleyballSeasonStatRows,
  buildGameRecord,
  buildPlayerMap,
  formatDate,
  formatRecord,
  formatStat,
  getPlayerName,
  getSeasonGames,
  getSeasonLabel,
  getTeamStatCategory,
} from "../volleyballData";

const pageClass = "pt-2 pb-10 lg:pb-40 space-y-6 px-4 max-w-6xl mx-auto";
const h1Class = "text-2xl font-bold text-center";
const sublineClass = "-mt-1.5 text-center text-sm italic text-gray-600";
const recordTableStyles = {
  outerTable:
    "min-w-full table-fixed sm:table-auto border text-center text-[clamp(0.8rem,1.05vw,1.05rem)]",
  innerTable:
    "min-w-full table-fixed sm:table-auto border text-center text-[clamp(0.76rem,1vw,1rem)]",
  headerCell:
    "border px-[clamp(0.2rem,0.6vw,0.9rem)] py-[clamp(0.3rem,0.5vw,0.65rem)] leading-tight whitespace-normal break-words",
  sectionCell:
    "border px-[clamp(0.55rem,0.9vw,0.95rem)] py-[clamp(0.5rem,0.85vw,0.9rem)] text-left font-bold text-blue-900 text-[clamp(0.95rem,1.1vw,1.1rem)]",
  bodyCell:
    "border px-[clamp(0.2rem,0.75vw,0.95rem)] py-[clamp(0.45rem,0.9vw,0.95rem)] align-middle whitespace-normal break-words leading-tight",
  detailCell:
    "border px-[clamp(0.18rem,0.65vw,0.8rem)] py-[clamp(0.35rem,0.65vw,0.75rem)] align-middle whitespace-normal break-words leading-tight",
  playerWrap:
    "flex min-w-0 flex-col items-center justify-center gap-1 sm:flex-row sm:gap-[clamp(0.35rem,0.75vw,0.7rem)]",
  playerWrapStart:
    "flex min-w-0 flex-col items-start justify-center gap-1 sm:flex-row sm:items-center sm:gap-[clamp(0.35rem,0.75vw,0.7rem)]",
  playerText: "min-w-0 max-w-full whitespace-normal break-words text-center leading-tight",
  playerLink: "min-w-0 max-w-full whitespace-normal break-words text-center leading-tight hover:underline",
};

const STAT_LABELS = {
  Games: "Matches",
  SetsPlayed: "Sets Played",
  Kills: "Kills",
  KillsPerSet: "Kills per Set",
  KillPct: "Kill %",
  AttackAttempts: "Attack Attempts",
  AttackErrors: "Attack Errors",
  HittingPct: "Hitting %",
  Aces: "Aces",
  AcesPerSet: "Aces per Set",
  AcePct: "Ace %",
  ServeAttempts: "Serve Attempts",
  ServeErrors: "Serve Errors",
  ServePct: "Serve %",
  ServingPoints: "Serving Points",
  SoloBlocks: "Solo Blocks",
  BlockAssists: "Block Assists",
  TotalBlocks: "Total Blocks",
  BlocksPerSet: "Blocks per Set",
  BlocksPerMatch: "Blocks per Match",
  BlockErrors: "Block Errors",
  Digs: "Digs",
  DigErrors: "Dig Errors",
  DigsPerSet: "Digs per Set",
  DigsPerMatch: "Digs per Match",
  Assists: "Assists",
  AssistsPerSet: "Assists per Set",
  BallHandlingAttempts: "Ball Handling Attempts",
  BallHandlingErrors: "Ball Handling Errors",
  Receptions: "Receptions",
  ReceptionErrors: "Reception Errors",
  ReceptionsPerSet: "Receptions per Set",
  ReceptionsPerMatch: "Receptions per Match",
};

const DEFAULT_SORT_BY_SECTION = {
  Attacking: "Kills",
  Serving: "Aces",
  Blocking: "TotalBlocks",
  Digging: "Digs",
  "Ball Handling": "Assists",
  "Serve Receiving": "Receptions",
};

const PERCENTAGE_RECORD_REQUIREMENTS = {
  KillPct: { denominatorKey: "AttackAttempts", label: "attack attempts" },
  HittingPct: { denominatorKey: "AttackAttempts", label: "attack attempts" },
  AcePct: { denominatorKey: "ServeAttempts", label: "serve attempts" },
  ServePct: { denominatorKey: "ServeAttempts", label: "serve attempts" },
};

const INDIVIDUAL_PERCENTAGE_MINIMUMS = {
  singleGame: {
    AttackAttempts: 5,
    ServeAttempts: 5,
  },
  season: {
    AttackAttempts: 50,
    ServeAttempts: 50,
  },
  career: {
    AttackAttempts: 100,
    ServeAttempts: 100,
  },
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function statViewKey(title) {
  return normalizeText(title).replace(/\s+/g, "-");
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function numberOrZero(value) {
  return safeNumber(value) ?? 0;
}

function roundTo(value, places) {
  if (!Number.isFinite(value)) return null;
  return Number(value.toFixed(places));
}

function sumStat(rows, key) {
  return rows.reduce((sum, row) => sum + numberOrZero(row[key]), 0);
}

function applyTrackedRateStats(aggregate, sourceRows) {
  const attackRows = sourceRows.filter((row) => numberOrZero(row.AttackAttempts) > 0);
  const attackAttempts = sumStat(attackRows, "AttackAttempts");
  if (attackAttempts > 0) {
    const kills = sumStat(attackRows, "Kills");
    const errors = sumStat(attackRows, "AttackErrors");
    aggregate.KillPct = roundTo((kills / attackAttempts) * 100, 1);
    aggregate.HittingPct = roundTo((kills - errors) / attackAttempts, 3);
  } else {
    aggregate.KillPct = null;
    aggregate.HittingPct = null;
  }

  const serveRows = sourceRows.filter((row) => numberOrZero(row.ServeAttempts) > 0);
  const serveAttempts = sumStat(serveRows, "ServeAttempts");
  if (serveAttempts > 0) {
    const aces = sumStat(serveRows, "Aces");
    const errors = sumStat(serveRows, "ServeErrors");
    aggregate.AcePct = roundTo((aces / serveAttempts) * 100, 1);
    aggregate.ServePct = roundTo(((serveAttempts - errors) / serveAttempts) * 100, 1);
  } else {
    aggregate.AcePct = null;
    aggregate.ServePct = null;
  }

  return aggregate;
}

function hasCompletedResult(game) {
  return ["W", "L", "T"].includes(String(game?.Result || "").toUpperCase());
}

function isPlayoffGame(game) {
  const type = String(game?.GameType || "").toLowerCase();
  const notes = String(game?.Notes || "").toLowerCase();
  return (
    type.includes("playoff") ||
    type.includes("state") ||
    notes.includes("playoff") ||
    notes.includes("state")
  );
}

function seasonById(seasons) {
  return new Map(seasons.map((season) => [String(season.SeasonID), season]));
}

function gameById(games) {
  return new Map(games.map((game) => [`${game.Season}|${game.GameID}`, game]));
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
  return school?.Name || school?.ShortName || game?.Opponent || "Unknown Opponent";
}

function getOpponentGroupKey(game, schoolMap) {
  const school = getOpponentSchool(game, schoolMap);
  if (school?.SchoolID) return String(school.SchoolID);
  return `name:${String(game?.Opponent || "Unknown Opponent").trim()}`;
}

function getSeasonDisplay(seasonMap, seasonId) {
  return getSeasonLabel(seasonMap.get(String(seasonId)) || { SeasonID: seasonId });
}

function resultLabel(game) {
  if (!game) return "-";
  const result = String(game.Result || "").trim();
  const teamScore = game.TeamScore;
  const opponentScore = game.OpponentScore;
  if (!result || teamScore == null || opponentScore == null) return "-";
  return `${result} ${teamScore}-${opponentScore}`;
}

function scoreLabel(game) {
  if (!game || game.TeamScore == null || game.OpponentScore == null) return "-";
  return `${game.TeamScore}-${game.OpponentScore}`;
}

function statLabel(key, fallback) {
  return STAT_LABELS[key] || fallback || key;
}

function getRecordMinimum(columnKey, recordScope) {
  const requirement = PERCENTAGE_RECORD_REQUIREMENTS[columnKey];
  if (!requirement || !recordScope) return null;

  const minimum = INDIVIDUAL_PERCENTAGE_MINIMUMS[recordScope]?.[requirement.denominatorKey];
  if (!minimum) return null;

  return {
    ...requirement,
    minimum,
  };
}

function statRecordSections({ includePerMatch = true, recordScope = null } = {}) {
  return VOLLEYBALL_STAT_SECTIONS.map((section) => ({
    title: section.title,
    records: section.columns
      .filter((column) => column.key !== "SetsPlayed")
      .filter(
        (column) =>
          includePerMatch ||
          !["BlocksPerMatch", "DigsPerMatch", "ReceptionsPerMatch"].includes(column.key)
      )
      .map((column) => {
        const minimum = getRecordMinimum(column.key, recordScope);
        const baseLabel = statLabel(column.key, column.label);

        return {
          ...column,
          id: `${section.title}:${column.key}`,
          label: minimum
            ? `${baseLabel} (min. ${minimum.minimum} ${minimum.label})`
            : baseLabel,
          abbr: column.label,
          sectionTitle: section.title,
          minimum,
        };
      }),
  }));
}

function formatRecordValue(value, column) {
  return formatStat(value, column);
}

function hasRecordValue(value) {
  const number = safeNumber(value);
  return number !== null && number > 0;
}

function isEligibleForRecord(row, record) {
  if (!record.minimum) return true;
  return numberOrZero(row[record.minimum.denominatorKey]) >= record.minimum.minimum;
}

function sortRecordEntries(a, b) {
  if (b.value !== a.value) return b.value - a.value;
  return String(b.sortDate || "").localeCompare(String(a.sortDate || ""));
}

function buildRecordLists(sourceRows, sections, getValue, makeEntry, limit = 20) {
  const rowsByRecord = {};

  sections.forEach((section) => {
    section.records.forEach((record) => {
      rowsByRecord[record.id] = sourceRows
        .map((row) => {
          const value = safeNumber(getValue(row, record));
          if (!hasRecordValue(value)) return null;
          if (!isEligibleForRecord(row, record)) return null;
          return {
            ...makeEntry(row, record),
            record,
            value,
          };
        })
        .filter(Boolean)
        .sort(sortRecordEntries)
        .slice(0, limit);
    });
  });

  return rowsByRecord;
}

function PageStatus({ status }) {
  if (!status) return null;
  return <div className="text-center text-slate-600">{status}</div>;
}

function StatTabs({ sections, selectedKey, onSelect }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {sections.map((section) => {
        const key = statViewKey(section.title);
        const active = key === selectedKey;
        return (
          <button
            key={section.title}
            type="button"
            onClick={() => onSelect(key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              active
                ? "border-blue-900 bg-blue-900 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            {section.title}
          </button>
        );
      })}
    </div>
  );
}

function SortButton({ column, sortConfig, onSort, align = "center" }) {
  const active = sortConfig.key === column.key;
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={`inline-flex items-center gap-1 font-bold hover:text-blue-900 ${
        align === "left" ? "justify-start" : "justify-center"
      }`}
    >
      <span>{column.label}</span>
      {active ? <span aria-hidden="true">{sortConfig.direction === "asc" ? "▲" : "▼"}</span> : null}
    </button>
  );
}

function getSortValue(row, column) {
  if (column.sortValue) return column.sortValue(row);
  if (column.key === "Player") return row.playerName || "";
  if (column.key === "Season") return Number(row.Season ?? row.SeasonID ?? 0);
  const value = row[column.key];
  const number = safeNumber(value);
  return number !== null ? number : String(value || "");
}

function sortRows(rows, columns, sortConfig) {
  const column = columns.find((entry) => entry.key === sortConfig.key) || columns[0];
  const direction = sortConfig.direction === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    const aValue = getSortValue(a, column);
    const bValue = getSortValue(b, column);

    if (typeof aValue === "string" || typeof bValue === "string") {
      const diff = String(aValue || "").localeCompare(String(bValue || ""));
      if (diff !== 0) return diff * direction;
    } else if (aValue !== bValue) {
      return (aValue - bValue) * direction;
    }

    return String(a.playerName || a.seasonLabel || "").localeCompare(
      String(b.playerName || b.seasonLabel || "")
    );
  });
}

function SortableTable({ columns, rows, defaultSort, emptyText }) {
  const [sortConfig, setSortConfig] = useState(defaultSort);
  useEffect(() => {
    setSortConfig(defaultSort);
  }, [defaultSort.key, defaultSort.direction]);
  const sortedRows = useMemo(
    () => sortRows(rows, columns, sortConfig),
    [columns, rows, sortConfig]
  );

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
        direction: column.defaultDirection || (column.text ? "asc" : "desc"),
      };
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className={recordTableStyles.outerTable}>
        <thead className="bg-gray-200 font-bold">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${recordTableStyles.headerCell} cursor-pointer select-none hover:bg-gray-300 whitespace-nowrap ${
                  column.align === "left" ? "text-left" : ""
                }`}
              >
                <SortButton
                  column={column}
                  sortConfig={sortConfig}
                  onSort={updateSort}
                  align={column.align}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="border px-3 py-5 text-center text-gray-600">
                {emptyText}
              </td>
            </tr>
          ) : (
            sortedRows.map((row, index) => (
              <tr
                key={row.rowKey || `${row.PlayerID || row.SeasonID || index}-${index}`}
                className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                {columns.map((column) => (
                  <td
                    key={`${row.rowKey || index}-${column.key}`}
                    className={`${recordTableStyles.bodyCell} ${
                      column.align === "left" ? "text-left" : ""
                    }`}
                  >
                    {column.render ? column.render(row) : formatRecordValue(row[column.key], column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function renderRecordCell(column, row) {
  return column.render ? column.render(row) : row[column.key] ?? "-";
}

function RecordsTable({
  sections,
  rowsByRecord,
  summaryColumnsBeforeValue = [],
  summaryColumnsAfterValue = [],
  detailColumnsBeforeValue = [],
  detailColumnsAfterValue = [],
  emptyText,
}) {
  const [expandedKey, setExpandedKey] = useState(null);
  const summaryColSpan =
    summaryColumnsBeforeValue.length + summaryColumnsAfterValue.length + 2;
  const detailColSpan =
    detailColumnsBeforeValue.length + detailColumnsAfterValue.length + 2;

  return (
    <div className="overflow-x-auto">
      <table className={recordTableStyles.outerTable}>
        <thead className="bg-gray-200 font-bold">
          <tr>
            <th className={recordTableStyles.headerCell}>Record</th>
            {summaryColumnsBeforeValue.map((column) => (
              <th key={column.key} className={recordTableStyles.headerCell}>
                {column.label}
              </th>
            ))}
            <th className={recordTableStyles.headerCell}>Value</th>
            {summaryColumnsAfterValue.map((column) => (
              <th key={column.key} className={recordTableStyles.headerCell}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <React.Fragment key={section.title}>
              <tr className="border-t bg-blue-50">
                <td colSpan={summaryColSpan} className={recordTableStyles.sectionCell}>
                  {section.title}
                </td>
              </tr>
              {section.records.map((record) => {
                const list = rowsByRecord[record.id] || [];
                const top = list[0];
                const isOpen = expandedKey === record.id;

                return (
                  <React.Fragment key={record.id}>
                    <tr
                      className={`border-t cursor-pointer hover:bg-gray-100 ${
                        isOpen ? "bg-gray-50" : "bg-white"
                      }`}
                      onClick={() => setExpandedKey((current) => (current === record.id ? null : record.id))}
                    >
                      <td className={`${recordTableStyles.bodyCell} font-semibold`}>{record.label}</td>
                      {summaryColumnsBeforeValue.map((column) => (
                        <td key={`${record.id}-${column.key}`} className={recordTableStyles.bodyCell}>
                          {top ? renderRecordCell(column, top) : "-"}
                        </td>
                      ))}
                      <td className={`${recordTableStyles.bodyCell} font-semibold`}>
                        {top ? formatRecordValue(top.value, record) : "-"}
                      </td>
                      {summaryColumnsAfterValue.map((column) => (
                        <td key={`${record.id}-${column.key}`} className={recordTableStyles.bodyCell}>
                          {top ? renderRecordCell(column, top) : "-"}
                        </td>
                      ))}
                    </tr>
                    {isOpen ? (
                      <tr className="border-t">
                        <td colSpan={summaryColSpan} className={recordTableStyles.bodyCell}>
                          <div className="overflow-x-auto">
                            <table className={recordTableStyles.innerTable}>
                              <thead className="bg-gray-200 font-bold">
                                <tr>
                                  <th className={recordTableStyles.headerCell}>#</th>
                                  {detailColumnsBeforeValue.map((column) => (
                                    <th key={`${record.id}-detail-${column.key}`} className={recordTableStyles.headerCell}>
                                      {column.label}
                                    </th>
                                  ))}
                                  <th className={recordTableStyles.headerCell}>{record.abbr}</th>
                                  {detailColumnsAfterValue.map((column) => (
                                    <th key={`${record.id}-detail-${column.key}`} className={recordTableStyles.headerCell}>
                                      {column.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {list.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={detailColSpan}
                                      className="border px-3 py-5 text-center text-gray-600"
                                    >
                                      {emptyText}
                                    </td>
                                  </tr>
                                ) : (
                                  list.map((row, index) => (
                                    <tr
                                      key={`${record.id}-${index}`}
                                      className={`border-t ${
                                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                      }`}
                                    >
                                      <td className={`${recordTableStyles.detailCell} font-semibold`}>{index + 1}</td>
                                      {detailColumnsBeforeValue.map((column) => (
                                        <td key={`${record.id}-${index}-${column.key}`} className={recordTableStyles.detailCell}>
                                          {renderRecordCell(column, row)}
                                        </td>
                                      ))}
                                      <td className={`${recordTableStyles.detailCell} font-semibold`}>
                                        {formatRecordValue(row.value, record)}
                                      </td>
                                      {detailColumnsAfterValue.map((column) => (
                                        <td key={`${record.id}-${index}-${column.key}`} className={recordTableStyles.detailCell}>
                                          {renderRecordCell(column, row)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getPlayerDisplay(playerMap, row) {
  const player = playerMap.get(String(row.PlayerID));
  return getPlayerName(player) || row.PlayerName || "Unknown Player";
}

function buildCareerRows(data) {
  const playerMap = buildPlayerMap(data.players);
  const grouped = new Map();
  const seasonRows = aggregateAllPlayerSeasonStatsFromGames(
    data.playerGameStats,
    data.playerSeasonAdjustments
  );

  seasonRows.forEach((row) => {
    const playerId = String(row.PlayerID);
    if (!grouped.has(playerId)) grouped.set(playerId, []);
    grouped.get(playerId).push(row);
  });

  return Array.from(grouped.entries())
    .map(([playerId, rows]) => {
      const player = playerMap.get(playerId);
      const totals = aggregateVolleyballSeasonStatRows(rows, {
        PlayerID: Number(playerId),
        PlayerName: player ? getPlayerName(player) : rows[0]?.PlayerName,
        JerseyNumber: rows.find((row) => row.JerseyNumber != null)?.JerseyNumber,
      });
      applyTrackedRateStats(totals, rows);

      return {
        ...totals,
        rowKey: `career-${playerId}`,
        PlayerID: Number(playerId),
        playerName: player ? getPlayerName(player) : rows[0]?.PlayerName || "Unknown Player",
        GradYear: player?.GradYear,
      };
    })
    .filter((row) => row.Games > 0);
}

function buildPlayerSeasonRows(data) {
  const playerMap = buildPlayerMap(data.players);
  const seasonMap = seasonById(data.seasons);
  const seasonRows = aggregateAllPlayerSeasonStatsFromGames(
    data.playerGameStats,
    data.playerSeasonAdjustments
  );

  return seasonRows
    .map((row) => {
      const seasonId = Number(row.Season);
      const player = playerMap.get(String(row.PlayerID));
      return {
        ...row,
        rowKey: `season-${seasonId}-${row.PlayerID}`,
        seasonLabel: getSeasonDisplay(seasonMap, seasonId),
        playerName: player ? getPlayerName(player) : row.PlayerName || "Unknown Player",
        GradYear: player?.GradYear,
      };
    })
    .sort(
      (a, b) =>
        Number(a.Season) - Number(b.Season) ||
        String(a.playerName || "").localeCompare(String(b.playerName || ""))
    );
}

function buildTeamSeasonRows(data) {
  const seasonMap = seasonById(data.seasons);
  const seasons = [...new Set(data.teamMatchStats.map((row) => Number(row.Season)))].sort(
    (a, b) => a - b
  );

  return seasons
    .map((seasonId) => {
      const matchRows = data.teamMatchStats.filter((row) => Number(row.Season) === seasonId);
      const categories = aggregateTeamSeasonStatsFromMatches(data.teamMatchStats, seasonId);
      if (!categories) return null;
      applyTrackedRateStats(
        getTeamStatCategory(categories, "Attacking"),
        matchRows.map((row) => getTeamStatCategory(row, "Attacking"))
      );
      applyTrackedRateStats(
        getTeamStatCategory(categories, "Serving"),
        matchRows.map((row) => getTeamStatCategory(row, "Serving"))
      );
      const games = getSeasonGames(data.games, seasonId).filter(hasCompletedResult);
      const record = buildGameRecord(games);
      return {
        ...categories,
        rowKey: `team-season-${seasonId}`,
        Season: seasonId,
        SeasonID: seasonId,
        seasonLabel: getSeasonDisplay(seasonMap, seasonId),
        Matches: matchRows.length,
        recordLabel: formatRecord(record.wins, record.losses, record.ties),
      };
    })
    .filter(Boolean);
}

function PlayerLink({ row }) {
  return (
    <Link to={`/athletics/volleyball/players/${row.PlayerID}`} className="text-blue-600 hover:underline">
      {row.playerName || row.PlayerName || "Unknown Player"}
    </Link>
  );
}

function SeasonLink({ row }) {
  return (
    <Link to={`/athletics/volleyball/seasons/${row.Season ?? row.SeasonID}`} className="text-blue-600 hover:underline">
      {row.seasonLabel || row.Season || row.SeasonID}
    </Link>
  );
}

function GameLink({ row }) {
  if (!row.game) return row.opponent || "-";
  return (
    <Link to={`/athletics/volleyball/games/${row.game.GameID}`} className="text-blue-600 hover:underline">
      {row.opponent || row.game.Opponent || "-"}
    </Link>
  );
}

function fullStatColumns(section, leadingColumns) {
  return [
    ...leadingColumns,
    { key: "Games", label: "M", sortValue: (row) => safeNumber(row.Games ?? row.Matches) || 0 },
    ...section.columns.map((column) => ({
      ...column,
      label: column.label,
      sortValue: (row) => safeNumber(row[column.key]) ?? -Infinity,
      render: (row) => formatRecordValue(row[column.key], column),
    })),
  ];
}

function FullStatsLayout({ title, subtitle, status, sections, rows, leadingColumns, emptyText }) {
  const [selectedKey, setSelectedKey] = useState(statViewKey(sections[0]?.title || "Attacking"));
  const section = sections.find((entry) => statViewKey(entry.title) === selectedKey) || sections[0];
  const defaultSortKey = DEFAULT_SORT_BY_SECTION[section?.title] || "Games";
  const columns = useMemo(
    () => fullStatColumns(section, leadingColumns),
    [leadingColumns, section]
  );

  return (
    <div className={pageClass}>
      <PageStatus status={status} />
      <h1 className={h1Class}>{title}</h1>
      <p className={sublineClass}>{subtitle}</p>
      <StatTabs sections={sections} selectedKey={selectedKey} onSelect={setSelectedKey} />
      <SortableTable
        columns={columns}
        rows={rows}
        defaultSort={{ key: defaultSortKey, direction: "desc" }}
        emptyText={emptyText}
      />
    </div>
  );
}

export function FullTeamStats({ data, status = "" }) {
  const rows = useMemo(() => buildTeamSeasonRows(data), [data]);
  const leadingColumns = useMemo(
    () => [
      {
        key: "Season",
        label: "Season",
        text: true,
        defaultDirection: "desc",
        sortValue: (row) => Number(row.Season),
        render: (row) => <SeasonLink row={row} />,
      },
      {
        key: "Record",
        label: "Record",
        sortValue: (row) => Number(row.Season),
        render: (row) => row.recordLabel,
      },
    ],
    []
  );

  return (
    <FullStatsLayout
      title="Full Team Stats"
      subtitle="Team totals are calculated from available MaxPreps match stat tables."
      status={status}
      sections={VOLLEYBALL_STAT_SECTIONS}
      rows={rows}
      leadingColumns={leadingColumns}
      emptyText="No team stat totals are available yet."
    />
  );
}

export function FullCareerStats({ data, status = "" }) {
  const rows = useMemo(() => buildCareerRows(data), [data]);
  const leadingColumns = useMemo(
    () => [
      {
        key: "Player",
        label: "Player",
        text: true,
        align: "left",
        defaultDirection: "asc",
        sortValue: (row) => row.playerName,
        render: (row) => <PlayerLink row={row} />,
      },
      {
        key: "GradYear",
        label: "Class",
        sortValue: (row) => Number(row.GradYear || 0),
        render: (row) => row.GradYear || "-",
      },
    ],
    []
  );

  return (
    <FullStatsLayout
      title="Full Career Stats"
      subtitle="Career totals include available individual match logs and historical season adjustments."
      status={status}
      sections={VOLLEYBALL_STAT_SECTIONS}
      rows={rows}
      leadingColumns={leadingColumns}
      emptyText="No individual career stats are available yet."
    />
  );
}

export function TeamSingleGameRecords({ data, status = "" }) {
  const gameMap = useMemo(() => gameById(data.games), [data.games]);
  const sections = useMemo(() => statRecordSections({ includePerMatch: false }), []);
  const rowsByRecord = useMemo(
    () =>
      buildRecordLists(
        data.teamMatchStats,
        sections,
        (row, record) => getTeamStatCategory(row, record.sectionTitle)[record.key],
        (row) => {
          const game = gameMap.get(`${row.Season}|${row.GameID}`);
          return {
            game,
            sortDate: game?.Date,
            seasonLabel: game?.SourceSeasonLabel || row.Season,
            opponent: game?.Opponent || "Unknown Opponent",
            result: resultLabel(game),
          };
        }
      ),
    [data.teamMatchStats, gameMap, sections]
  );

  const columns = [
    { key: "date", label: "Date", render: (row) => (row.game ? formatDate(row.game.Date) : "-") },
    { key: "opponent", label: "Opponent", align: "left", render: (row) => <GameLink row={row} /> },
    { key: "result", label: "Game Result", render: (row) => row.result },
  ];

  return (
    <div className={pageClass}>
      <PageStatus status={status} />
      <h1 className={h1Class}>Team Single Game Records</h1>
      <p className={sublineClass}>Select any record to see the top 20 team match performances.</p>
      <RecordsTable
        sections={sections}
        rowsByRecord={rowsByRecord}
        summaryColumnsAfterValue={columns}
        detailColumnsAfterValue={columns}
        emptyText="No team match records are available for this category."
      />
    </div>
  );
}

export function TeamSeasonRecords({ data, status = "" }) {
  const rows = useMemo(() => buildTeamSeasonRows(data), [data]);
  const sections = useMemo(() => statRecordSections(), []);
  const rowsByRecord = useMemo(
    () =>
      buildRecordLists(
        rows,
        sections,
        (row, record) => getTeamStatCategory(row, record.sectionTitle)[record.key],
        (row) => ({
          ...row,
          sortDate: String(row.Season),
        })
      ),
    [rows, sections]
  );
  const columns = [
    { key: "season", label: "Season", render: (row) => <SeasonLink row={row} /> },
  ];

  return (
    <div className={pageClass}>
      <PageStatus status={status} />
      <h1 className={h1Class}>Team Season Records</h1>
      <p className={sublineClass}>Team season records are calculated from available match stat totals.</p>
      <RecordsTable
        sections={sections}
        rowsByRecord={rowsByRecord}
        summaryColumnsAfterValue={columns}
        detailColumnsAfterValue={columns}
        emptyText="No team season records are available for this category."
      />
    </div>
  );
}

export function SingleGameRecords({ data, status = "" }) {
  const playerMap = useMemo(() => buildPlayerMap(data.players), [data.players]);
  const games = useMemo(() => gameById(data.games), [data.games]);
  const sections = useMemo(
    () => statRecordSections({ includePerMatch: false, recordScope: "singleGame" }),
    []
  );
  const sourceRows = useMemo(
    () =>
      data.playerGameStats.map((row) => {
        const game = games.get(`${row.Season}|${row.GameID}`);
        return {
          ...row,
          game,
          playerName: getPlayerDisplay(playerMap, row),
          seasonLabel: game?.SourceSeasonLabel || row.Season,
        };
      }),
    [data.playerGameStats, games, playerMap]
  );
  const rowsByRecord = useMemo(
    () =>
      buildRecordLists(
        sourceRows,
        sections,
        (row, record) => row[record.key],
        (row) => ({
          ...row,
          sortDate: row.game?.Date,
          opponent: row.game?.Opponent || "Unknown Opponent",
          result: resultLabel(row.game),
        })
      ),
    [sections, sourceRows]
  );
  const columns = [
    { key: "date", label: "Date", render: (row) => (row.game ? formatDate(row.game.Date) : "-") },
    { key: "opponent", label: "Opponent", align: "left", render: (row) => <GameLink row={row} /> },
    { key: "result", label: "Game Result", render: (row) => row.result },
  ];
  const playerColumn = [
    { key: "player", label: "Player", align: "left", render: (row) => <PlayerLink row={row} /> },
  ];

  return (
    <div className={pageClass}>
      <PageStatus status={status} />
      <h1 className={h1Class}>Single Game Records</h1>
      <p className={sublineClass}>Select any record to see the top 20 individual match performances.</p>
      <RecordsTable
        sections={sections}
        rowsByRecord={rowsByRecord}
        summaryColumnsBeforeValue={playerColumn}
        summaryColumnsAfterValue={columns}
        detailColumnsBeforeValue={playerColumn}
        detailColumnsAfterValue={columns}
        emptyText="No individual single game records are available for this category."
      />
    </div>
  );
}

export function SeasonRecords({ data, status = "" }) {
  const rows = useMemo(() => buildPlayerSeasonRows(data), [data]);
  const sections = useMemo(() => statRecordSections({ recordScope: "season" }), []);
  const rowsByRecord = useMemo(
    () =>
      buildRecordLists(
        rows,
        sections,
        (row, record) => row[record.key],
        (row) => ({
          ...row,
          sortDate: String(row.Season),
        })
      ),
    [rows, sections]
  );
  const columns = [
    { key: "season", label: "Season", render: (row) => <SeasonLink row={row} /> },
  ];
  const playerColumn = [
    { key: "player", label: "Player", align: "left", render: (row) => <PlayerLink row={row} /> },
  ];

  return (
    <div className={pageClass}>
      <PageStatus status={status} />
      <h1 className={h1Class}>Season Records</h1>
      <p className={sublineClass}>
        Individual season records include available match logs and historical season adjustments.
      </p>
      <RecordsTable
        sections={sections}
        rowsByRecord={rowsByRecord}
        summaryColumnsBeforeValue={playerColumn}
        summaryColumnsAfterValue={columns}
        detailColumnsBeforeValue={playerColumn}
        detailColumnsAfterValue={columns}
        emptyText="No individual season records are available for this category."
      />
    </div>
  );
}

export function CareerRecords({ data, status = "" }) {
  const rows = useMemo(() => buildCareerRows(data), [data]);
  const sections = useMemo(() => statRecordSections({ recordScope: "career" }), []);
  const rowsByRecord = useMemo(
    () =>
      buildRecordLists(
        rows,
        sections,
        (row, record) => row[record.key],
        (row) => ({
          ...row,
          sortDate: String(row.GradYear || ""),
        })
      ),
    [rows, sections]
  );
  const playerColumn = [
    { key: "player", label: "Player", align: "left", render: (row) => <PlayerLink row={row} /> },
  ];

  return (
    <div className={pageClass}>
      <PageStatus status={status} />
      <h1 className={h1Class}>Career Records</h1>
      <p className={sublineClass}>
        Career records include available individual match logs and historical season adjustments.
      </p>
      <RecordsTable
        sections={sections}
        rowsByRecord={rowsByRecord}
        summaryColumnsBeforeValue={playerColumn}
        detailColumnsBeforeValue={playerColumn}
        emptyText="No individual career records are available for this category."
      />
    </div>
  );
}

export function RecordsVsOpponents({ data, status = "" }) {
  const [sortConfig, setSortConfig] = useState({ key: "Total", direction: "desc" });
  const [expandedOpponent, setExpandedOpponent] = useState(null);
  const [filter, setFilter] = useState("");
  const schoolMap = useMemo(() => buildSchoolMap(data.schools), [data.schools]);

  const rows = useMemo(() => {
    const grouped = new Map();

    data.games.filter(hasCompletedResult).forEach((game) => {
      const opponent = getOpponentDisplayName(game, schoolMap);
      const rowKey = getOpponentGroupKey(game, schoolMap);
      if (!grouped.has(rowKey)) {
        grouped.set(rowKey, {
          rowKey,
          opponent,
          wins: 0,
          losses: 0,
          ties: 0,
          setsWon: 0,
          setsLost: 0,
          home: { wins: 0, losses: 0, ties: 0 },
          away: { wins: 0, losses: 0, ties: 0 },
          neutral: { wins: 0, losses: 0, ties: 0 },
          playoff: { wins: 0, losses: 0, ties: 0 },
          games: [],
        });
      }

      const row = grouped.get(rowKey);
      const result = String(game.Result || "").toUpperCase();
      const bucket =
        String(game.LocationType || "").toLowerCase() === "home"
          ? row.home
          : String(game.LocationType || "").toLowerCase() === "away"
            ? row.away
            : row.neutral;
      const buckets = [row, bucket];
      if (isPlayoffGame(game)) buckets.push(row.playoff);

      buckets.forEach((entry) => {
        if (result === "W") entry.wins += 1;
        if (result === "L") entry.losses += 1;
        if (result === "T") entry.ties += 1;
      });

      row.setsWon += Number(game.TeamScore || 0);
      row.setsLost += Number(game.OpponentScore || 0);
      row.games.push(game);
    });

    return Array.from(grouped.values()).map((row) => {
      row.total = row.wins + row.losses + row.ties;
      row.winPct = row.total ? (row.wins + row.ties * 0.5) / row.total : 0;
      row.games.sort((a, b) => String(b.Date || "").localeCompare(String(a.Date || "")));
      return row;
    });
  }, [data.games, schoolMap]);

  const filteredRows = useMemo(() => {
    const needle = normalizeText(filter);
    const visible = needle
      ? rows.filter((row) => normalizeText(row.opponent).includes(needle))
      : rows;

    return sortRows(
      visible,
      [
        { key: "Opponent", sortValue: (row) => row.opponent, text: true },
        { key: "Total", sortValue: (row) => row.total },
        { key: "Wins", sortValue: (row) => row.wins },
        { key: "Losses", sortValue: (row) => row.losses },
        { key: "Pct", sortValue: (row) => row.winPct },
      ],
      sortConfig
    );
  }, [filter, rows, sortConfig]);

  const updateSort = (column) => {
    setSortConfig((current) => ({
      key: column.key,
      direction:
        current.key === column.key
          ? current.direction === "asc"
            ? "desc"
            : "asc"
          : column.defaultDirection || (column.text ? "asc" : "desc"),
    }));
  };

  const subRecord = (record) => {
    const total = record.wins + record.losses + record.ties;
    return total ? formatRecord(record.wins, record.losses, record.ties) : "-";
  };

  const columns = [
    { key: "Opponent", label: "Opponent", text: true, align: "left" },
    { key: "Total", label: "Total Games" },
    { key: "Wins", label: "Wins" },
    { key: "Losses", label: "Losses" },
    { key: "Pct", label: "%" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-lg">
      <PageStatus status={status} />
      <h1 className="text-2xl font-bold mb-4 text-center">Records vs. Opponents</h1>

      <div className="mb-4 mx-auto max-w-sm">
        <label className="sr-only" htmlFor="volleyball-opponent-filter">
          Filter opponents
        </label>
        <input
          id="volleyball-opponent-filter"
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter opponents"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm md:text-base text-center border">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`border p-2 cursor-pointer ${
                    column.align === "left" ? "text-left" : ""
                  }`}
                  onClick={() => updateSort(column)}
                >
                  {column.label}
                  {sortConfig.key === column.key
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : ""}
                </th>
              ))}
              <th className="border p-2">Home</th>
              <th className="border p-2">Away</th>
              <th className="border p-2">Playoffs</th>
              <th className="border p-2">Neutral</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="border px-3 py-6 text-center text-gray-600">
                  No opponent history is available.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const isOpen = expandedOpponent === row.rowKey;
                return (
                  <React.Fragment key={row.rowKey}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        setExpandedOpponent((current) =>
                          current === row.rowKey ? null : row.rowKey
                        )
                      }
                    >
                      <td className="border px-2 py-1 font-medium text-left">{row.opponent}</td>
                      <td className="border px-2 py-1">{row.total}</td>
                      <td className="border px-2 py-1">{row.wins}</td>
                      <td className="border px-2 py-1">{row.losses}</td>
                      <td className="border px-2 py-1">{row.winPct.toFixed(3)}</td>
                      <td className="border px-2 py-1">{subRecord(row.home)}</td>
                      <td className="border px-2 py-1">{subRecord(row.away)}</td>
                      <td className="border px-2 py-1">{subRecord(row.playoff)}</td>
                      <td className="border px-2 py-1">{subRecord(row.neutral)}</td>
                    </tr>
                    {isOpen ? (
                      <tr>
                        <td colSpan={9} className="bg-gray-50 px-3 py-3">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm md:text-base text-center border bg-white rounded">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border px-2 py-1">Date</th>
                                  <th className="border px-2 py-1">Season</th>
                                  <th className="border px-2 py-1">Location</th>
                                  <th className="border px-2 py-1">Game Type</th>
                                  <th className="border px-2 py-1">Result</th>
                                  <th className="border px-2 py-1">Score</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.games.map((game, index) => (
                                  <tr
                                    key={`${game.Season}-${game.GameID}`}
                                    className={index % 2 ? "bg-gray-50" : "bg-white"}
                                  >
                                    <td className="border px-2 py-1 whitespace-nowrap">
                                      <Link
                                        to={`/athletics/volleyball/games/${game.GameID}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        {formatDate(game.Date)}
                                      </Link>
                                    </td>
                                    <td className="border px-2 py-1 whitespace-nowrap">
                                      <Link
                                        to={`/athletics/volleyball/seasons/${game.Season}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        {game.SourceSeasonLabel || game.Season}
                                      </Link>
                                    </td>
                                    <td className="border px-2 py-1 whitespace-nowrap">
                                      {game.LocationType || "-"}
                                    </td>
                                    <td className="border px-2 py-1 whitespace-nowrap">
                                      {game.GameType || "-"}
                                    </td>
                                    <td className="border px-2 py-1 whitespace-nowrap">
                                      {game.Result || "-"}
                                    </td>
                                    <td className="border px-2 py-1 whitespace-nowrap">
                                      {scoreLabel(game)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
