import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ArticleFeatureList from "../../../components/ArticleFeatureList";
import PlayerHeadshot from "../../../components/PlayerHeadshot";
import { StateBracket8GameSVG } from "../../basketball/components/GameCardBracketsSVG";
import { recordTableStyles } from "../../basketball/pages/recordTableStyles";
import {
  formatGameDate,
  formatRecord,
  formatSeasonLabel,
  getSeasonStatTable,
  getSeasonStatsForSeason,
  loadFootballSeasonPageData,
  sortGamesChronologically,
} from "../footballData";
import { loadPreparedFootballRecordsData } from "../footballRecordsData";
import { footballGamePath, footballPlayerPath } from "../pages/footballDetailUtils";

const INDIVIDUAL_STATS_VIEW_CONFIG = [
  {
    key: "offense",
    label: "Offense",
    tableTitles: [
      "Passing",
      "Rushing",
      "Receiving",
      "Offensive Fumbles and Pancake Blocks",
      "All Purpose Yards",
      "Total Yards",
    ],
  },
  {
    key: "defense",
    label: "Defense",
    tableTitles: ["Tackles", "Sacks", "Defensive Statistics"],
  },
  {
    key: "special-teams",
    label: "Special Teams",
    tableTitles: ["Kickoffs", "Punts", "Kickoff and Punt Returns"],
  },
  {
    key: "scoring",
    label: "Scoring",
    tableTitles: ["Points", "PATs and Field Goals", "Touchdowns", "Conversions"],
  },
];

function hasMeaningfulValue(value) {
  const text = String(value ?? "").trim();
  return text !== "" && text !== "—" && text !== "-" && text.toLowerCase() !== "n/a";
}

function firstMeaningfulValue(...values) {
  const match = values.find((value) => hasMeaningfulValue(value));
  return match ?? "";
}

function tableTotal(table, key) {
  return table?.Totals?.[key] ?? "";
}

function StatsTable({ title, columns, rows, totals = null }) {
  const renderCell = (row, column) => {
    if (column.key === "jersey") return row.JerseyNumber || "—";

    if (column.key === "name") {
      if (row.PlayerID) {
        return (
          <div className="flex items-center gap-2 text-left">
            <PlayerHeadshot
              playerId={row.PlayerID}
              sportKey="football"
              gender="Boys"
              name={row.PlayerName || ""}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
            <Link
              to={footballPlayerPath(row.PlayerID)}
              className="text-blue-600 hover:underline"
            >
              {row.PlayerName || "—"}
            </Link>
          </div>
        );
      }

      return row.PlayerName || "—";
    }

    const value = row.Values?.[column.key];
    return value || "—";
  };

  const hasTotals =
    totals &&
    columns.some(
      (column) =>
        column.key !== "jersey" &&
        column.key !== "name" &&
        hasMeaningfulValue(totals[column.key])
    );

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
                  className="px-2 py-2 text-center text-xs whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${title}-${row.PlayerID || row.PlayerName || index}`}
                className={`border-t border-gray-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                } hover:bg-gray-100`}
              >
                {columns.map((column) => (
                  <td
                    key={`${title}-${row.PlayerID || row.PlayerName || index}-${column.key}`}
                    className="px-2 py-1.5 text-center whitespace-nowrap"
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {hasTotals ? (
            <tfoot className="border-t-2 border-gray-300 bg-blue-50 font-semibold text-blue-950">
              <tr>
                {columns.map((column) => (
                  <td
                    key={`${title}-totals-${column.key}`}
                    className="px-2 py-2 text-center whitespace-nowrap"
                  >
                    {column.key === "jersey"
                      ? ""
                      : column.key === "name"
                        ? totals.name || "Season Totals"
                        : totals[column.key] || "—"}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
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

const DERIVED_META_KEYS = new Set([
  "CareerID",
  "CareerKey",
  "CanonicalUrl",
  "DisplaySeason",
  "GamesTracked",
  "PlayerID",
  "PlayerName",
  "SeasonID",
  "SeasonLabel",
  "SourceCitation",
  "SourceDate",
  "SourceNote",
  "SourcePlayerName",
  "SourcePublication",
  "SourceSeasonLabel",
  "SeasonAdjustment",
]);

const DERIVED_STAT_ALIASES = {
  FgAttempted: "FGAtt",
  FgAtt: "FGAtt",
  IntYards: "INTYards",
  Ints: "INTs",
  PatKickingAtt: "PATKickingAtt",
  PatKickingMade: "PATKickingMade",
  PatKickingPercentage: "PATKickingPercentage",
  PatReceivingNum: "PATReceivingNum",
  PatRushingNum: "PATRushingNum",
};

function getDerivedNumber(row, key) {
  const actualKey = DERIVED_STAT_ALIASES[key] || key;
  const value = row?.[actualKey];
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function hasDerivedStat(row, keys) {
  return keys.some((key) => getDerivedNumber(row, key) !== null);
}

function sumDerivedStats(rows) {
  const total = {};

  rows.forEach((row) => {
    Object.entries(row || {}).forEach(([key, value]) => {
      if (DERIVED_META_KEYS.has(key)) return;
      const number = Number(value);
      if (!Number.isFinite(number)) return;
      total[key] = (total[key] || 0) + number;
    });
  });

  const maxGamesTracked = Math.max(
    0,
    ...rows.map((row) => Number(row?.GamesTracked || row?.TrackedGames || 0)).filter(Number.isFinite)
  );
  if (maxGamesTracked) total.GamesTracked = maxGamesTracked;

  return total;
}

function derivedSum(row, keys) {
  let total = 0;
  let found = false;

  keys.forEach((key) => {
    const value = getDerivedNumber(row, key);
    if (value === null) return;
    total += value;
    found = true;
  });

  return found ? total : null;
}

function derivedRatio(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }
  return numerator / denominator;
}

function hasFiniteDerivedValue(value) {
  if (value == null) return false;
  if (typeof value === "string" && !value.trim()) return false;
  return Number.isFinite(Number(value));
}

function derivedWhole(value) {
  return hasFiniteDerivedValue(value) ? Math.round(Number(value)).toLocaleString("en-US") : "";
}

function derivedDecimal(value, decimals = 1) {
  return hasFiniteDerivedValue(value) ? Number(value).toFixed(decimals) : "";
}

function derivedPercent(value) {
  return hasFiniteDerivedValue(value) ? Number(value).toFixed(3).replace(/^0/, "") : "";
}

function derivedStatValue(row, key, formatter = derivedWhole) {
  const value = getDerivedNumber(row, key);
  return value === null ? "" : formatter(value);
}

function derivedGamesTracked(row) {
  return getDerivedNumber(row, "GamesTracked") || getDerivedNumber(row, "TrackedGames") || null;
}

function derivedCompletionPct(row) {
  const completions = getDerivedNumber(row, "PassingComp");
  const attempts = getDerivedNumber(row, "PassingAtt");
  return derivedRatio(completions, attempts);
}

function derivedYardsPerCompletion(row) {
  return derivedRatio(getDerivedNumber(row, "PassingYards"), getDerivedNumber(row, "PassingComp"));
}

function derivedYardsPerCarry(row) {
  const computedValue = derivedRatio(
    getDerivedNumber(row, "RushingYards"),
    getDerivedNumber(row, "RushingNum")
  );
  if (computedValue !== null) return computedValue;
  return getDerivedNumber(row, "YardsPerCarry");
}

function derivedYardsPerCatch(row) {
  return derivedRatio(getDerivedNumber(row, "ReceivingYards"), getDerivedNumber(row, "ReceivingNum"));
}

function derivedPuntAverage(row) {
  const computedValue = derivedRatio(
    getDerivedNumber(row, "PuntYards"),
    getDerivedNumber(row, "PuntNum")
  );
  if (computedValue !== null) return computedValue;
  return getDerivedNumber(row, "PuntAverage");
}

function derivedFgPct(row) {
  const computedValue = derivedRatio(getDerivedNumber(row, "FGMade"), getDerivedNumber(row, "FGAtt"));
  if (computedValue !== null) return computedValue;
  return getDerivedNumber(row, "FGPercentage");
}

function derivedPatPct(row) {
  const computedValue = derivedRatio(
    getDerivedNumber(row, "PatKickingMade"),
    getDerivedNumber(row, "PatKickingAtt")
  );
  if (computedValue !== null) return computedValue;
  return getDerivedNumber(row, "PatKickingPercentage");
}

function derivedPerGame(value, row) {
  return derivedRatio(value, derivedGamesTracked(row));
}

function derivedTotalReturnYards(row) {
  const directValue = getDerivedNumber(row, "TotalReturnYards");
  if (directValue !== null) return directValue;
  return derivedSum(row, ["KickoffReturnYards", "PuntReturnYards"]);
}

function derivedReturnTouchdowns(row) {
  return derivedSum(row, ["KickoffReturnedTDNum", "PuntReturnedTDNum"]);
}

function derivedDefensiveTouchdowns(row) {
  return derivedSum(row, ["IntReturnedTDNum", "FumbleReturnedTDNum"]);
}

function derivedTotalKickingPoints(row) {
  const directValue = getDerivedNumber(row, "TotalKickingPoints");
  if (directValue !== null) return directValue;

  const pat = getDerivedNumber(row, "PatKickingMade");
  const fieldGoals = getDerivedNumber(row, "FGMade");
  if (pat === null && fieldGoals === null) return null;
  return (pat || 0) + (fieldGoals || 0) * 3;
}

function derivedTotalTouchdowns(row) {
  const directValue = getDerivedNumber(row, "TotalTDNum");
  if (directValue !== null) return directValue;
  return derivedSum(row, [
    "RushingTDNum",
    "ReceivingTDNum",
    "KickoffReturnedTDNum",
    "PuntReturnedTDNum",
    "IntReturnedTDNum",
    "FumbleReturnedTDNum",
  ]);
}

function derivedTotalPoints(row) {
  const directValue = getDerivedNumber(row, "TotalPoints");
  if (directValue !== null) return directValue;

  const touchdowns = derivedTotalTouchdowns(row);
  const kickingPoints = derivedTotalKickingPoints(row);
  const conversionPoints = getDerivedNumber(row, "TotalConversionPoints");
  const safeties = getDerivedNumber(row, "Safeties");

  if (
    touchdowns === null &&
    kickingPoints === null &&
    conversionPoints === null &&
    safeties === null
  ) {
    return null;
  }

  return (
    (touchdowns || 0) * 6 +
    (kickingPoints || 0) +
    (conversionPoints || 0) +
    (safeties || 0) * 2
  );
}

function derivedTotalYards(row) {
  const directValue = getDerivedNumber(row, "TotalYards");
  if (directValue !== null) return directValue;
  return derivedSum(row, ["PassingYards", "RushingYards", "ReceivingYards"]);
}

function derivedAllPurposeYards(row) {
  const directValue = getDerivedNumber(row, "AllPurposeYards");
  if (directValue !== null) return directValue;
  return derivedSum(row, [
    "RushingYards",
    "ReceivingYards",
    "KickoffReturnYards",
    "PuntReturnYards",
  ]);
}

function derivedDisplay(row, valueFn, formatter = derivedWhole) {
  const value = valueFn(row);
  return value === null || value === undefined ? "" : formatter(value);
}

function getDerivedPlayerMeta(row, rosterByPlayerId) {
  const roster = rosterByPlayerId.get(String(row?.PlayerID || "")) || {};
  return {
    PlayerID: row?.PlayerID || "",
    PlayerName: row?.PlayerName || roster.PlayerName || "—",
    JerseyNumber: roster.JerseyNumber || "",
    Grade: roster.Grade || "",
  };
}

function buildDerivedTable({
  title,
  tableId,
  columns,
  rows,
  rosterByPlayerId,
  hasData,
  sortValue,
}) {
  const dataRows = rows
    .filter(hasData)
    .sort((a, b) => {
      const valueA = Number(sortValue(a) || 0);
      const valueB = Number(sortValue(b) || 0);
      if (valueA !== valueB) return valueB - valueA;
      return String(a?.PlayerName || "").localeCompare(String(b?.PlayerName || ""));
    });

  if (!dataRows.length) return null;

  const totalRow = sumDerivedStats(dataRows);

  return {
    TableID: `derived_${tableId}`,
    Title: title,
    Columns: columns.map(({ key, label }) => ({ key, label })),
    Totals: columns.reduce(
      (totals, column) => ({
        ...totals,
        [column.key]:
          column.key === "jersey"
            ? ""
            : column.key === "name"
              ? "Season Totals"
              : column.value(totalRow),
      }),
      {}
    ),
    Rows: dataRows.map((row) => ({
      ...getDerivedPlayerMeta(row, rosterByPlayerId),
      Values: columns.reduce(
        (values, column) => ({
          ...values,
          [column.key]:
            column.key === "jersey" || column.key === "name" ? "" : column.value(row),
        }),
        {}
      ),
    })),
  };
}

const derivedColumn = (key, label, value) => ({ key, label, value });

const DERIVED_FOOTBALL_TABLES = [
  {
    title: "Passing",
    tableId: "passing",
    hasData: (row) => hasDerivedStat(row, ["PassingComp", "PassingAtt", "PassingYards", "PassingTD", "PassingInt"]),
    sortValue: (row) => getDerivedNumber(row, "PassingYards"),
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("passingcomp", "Comp", (row) => derivedStatValue(row, "PassingComp")),
      derivedColumn("passingatt", "Att", (row) => derivedStatValue(row, "PassingAtt")),
      derivedColumn("passingyards", "Yds", (row) => derivedStatValue(row, "PassingYards")),
      derivedColumn("completionpercentage", "Comp %", (row) => derivedDisplay(row, derivedCompletionPct, derivedPercent)),
      derivedColumn("ydspercompletion", "Avg", (row) => derivedDisplay(row, derivedYardsPerCompletion, (value) => derivedDecimal(value, 2))),
      derivedColumn("passingyardspergame", "Y/G", (row) =>
        derivedDisplay(row, (entry) => derivedPerGame(getDerivedNumber(entry, "PassingYards"), entry), (value) => derivedDecimal(value, 1))
      ),
      derivedColumn("passingtd", "TD", (row) => derivedStatValue(row, "PassingTD")),
      derivedColumn("passingint", "Int", (row) => derivedStatValue(row, "PassingInt")),
    ],
  },
  {
    title: "Rushing",
    tableId: "rushing",
    hasData: (row) => hasDerivedStat(row, ["RushingNum", "RushingYards", "RushingTDNum"]),
    sortValue: (row) => getDerivedNumber(row, "RushingYards"),
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("rushingnum", "Car", (row) => derivedStatValue(row, "RushingNum")),
      derivedColumn("rushingyards", "Yds", (row) => derivedStatValue(row, "RushingYards")),
      derivedColumn("yardspercarry", "Avg", (row) => derivedDisplay(row, derivedYardsPerCarry, (value) => derivedDecimal(value, 2))),
      derivedColumn("rushingyardspergame", "Y/G", (row) =>
        derivedDisplay(row, (entry) => derivedPerGame(getDerivedNumber(entry, "RushingYards"), entry), (value) => derivedDecimal(value, 1))
      ),
      derivedColumn("rushingtdnum", "TD", (row) => derivedStatValue(row, "RushingTDNum")),
    ],
  },
  {
    title: "Receiving",
    tableId: "receiving",
    hasData: (row) => hasDerivedStat(row, ["ReceivingNum", "ReceivingYards", "ReceivingTDNum"]),
    sortValue: (row) => getDerivedNumber(row, "ReceivingYards"),
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("receivingnum", "Rec", (row) => derivedStatValue(row, "ReceivingNum")),
      derivedColumn("receivingyards", "Yds", (row) => derivedStatValue(row, "ReceivingYards")),
      derivedColumn("yardspercatch", "Avg", (row) => derivedDisplay(row, derivedYardsPerCatch, (value) => derivedDecimal(value, 2))),
      derivedColumn("receivingyardspergame", "Y/G", (row) =>
        derivedDisplay(row, (entry) => derivedPerGame(getDerivedNumber(entry, "ReceivingYards"), entry), (value) => derivedDecimal(value, 1))
      ),
      derivedColumn("receivingtdnum", "TD", (row) => derivedStatValue(row, "ReceivingTDNum")),
    ],
  },
  {
    title: "All Purpose Yards",
    tableId: "all_purpose",
    hasData: (row) =>
      hasDerivedStat(row, ["AllPurposeYards", "RushingYards", "ReceivingYards", "KickoffReturnYards", "PuntReturnYards"]),
    sortValue: derivedAllPurposeYards,
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("rushingyards", "Rush", (row) => derivedStatValue(row, "RushingYards")),
      derivedColumn("receivingyards", "Rec", (row) => derivedStatValue(row, "ReceivingYards")),
      derivedColumn("kickoffreturnyards", "KR", (row) => derivedStatValue(row, "KickoffReturnYards")),
      derivedColumn("puntreturnyards", "PR", (row) => derivedStatValue(row, "PuntReturnYards")),
      derivedColumn("allpurposeyards", "Total", (row) => derivedDisplay(row, derivedAllPurposeYards)),
    ],
  },
  {
    title: "Total Yards",
    tableId: "total_yards",
    hasData: (row) => hasDerivedStat(row, ["PassingYards", "RushingYards", "ReceivingYards", "TotalYards"]),
    sortValue: derivedTotalYards,
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("passingyards", "Pass", (row) => derivedStatValue(row, "PassingYards")),
      derivedColumn("rushingyards", "Rush", (row) => derivedStatValue(row, "RushingYards")),
      derivedColumn("receivingyards", "Rec", (row) => derivedStatValue(row, "ReceivingYards")),
      derivedColumn("totalyards", "Total", (row) => derivedDisplay(row, derivedTotalYards)),
    ],
  },
  {
    title: "Tackles",
    tableId: "tackles",
    hasData: (row) => hasDerivedStat(row, ["Tackles", "Assists", "TotalTackles", "TacklesForLoss"]),
    sortValue: (row) => getDerivedNumber(row, "TotalTackles"),
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("tackles", "Solo", (row) => derivedStatValue(row, "Tackles")),
      derivedColumn("assists", "Ast", (row) => derivedStatValue(row, "Assists")),
      derivedColumn("totaltackles", "Total", (row) => derivedStatValue(row, "TotalTackles", (value) => derivedDecimal(value, 1))),
      derivedColumn("tacklesforloss", "TFL", (row) => derivedStatValue(row, "TacklesForLoss", (value) => derivedDecimal(value, 1))),
    ],
  },
  {
    title: "Sacks",
    tableId: "sacks",
    hasData: (row) => hasDerivedStat(row, ["Sacks", "QBHurries"]),
    sortValue: (row) => getDerivedNumber(row, "Sacks"),
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("sacks", "Sacks", (row) => derivedStatValue(row, "Sacks", (value) => derivedDecimal(value, 1))),
      derivedColumn("qbhurries", "QBH", (row) => derivedStatValue(row, "QBHurries")),
    ],
  },
  {
    title: "Defensive Statistics",
    tableId: "defense",
    hasData: (row) => hasDerivedStat(row, ["INTs", "INTYards", "PassesDefensed", "CausedFumbles", "FumbleRecoveries"]),
    sortValue: (row) => getDerivedNumber(row, "INTs"),
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("ints", "Int", (row) => derivedStatValue(row, "Ints")),
      derivedColumn("intyards", "Int Yds", (row) => derivedStatValue(row, "IntYards")),
      derivedColumn("intreturnedtdnum", "Int TD", (row) => derivedStatValue(row, "IntReturnedTDNum")),
      derivedColumn("passesdefensed", "PD", (row) => derivedStatValue(row, "PassesDefensed")),
      derivedColumn("causedfumbles", "CF", (row) => derivedStatValue(row, "CausedFumbles")),
      derivedColumn("fumblerecoveries", "FR", (row) => derivedStatValue(row, "FumbleRecoveries")),
      derivedColumn("defensivetd", "Def TD", (row) => derivedDisplay(row, derivedDefensiveTouchdowns)),
    ],
  },
  {
    title: "Punts",
    tableId: "punts",
    hasData: (row) => hasDerivedStat(row, ["PuntNum", "PuntYards", "PuntAverage"]),
    sortValue: (row) => getDerivedNumber(row, "PuntYards") || getDerivedNumber(row, "PuntNum"),
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("puntnum", "Punts", (row) => derivedStatValue(row, "PuntNum")),
      derivedColumn("puntyards", "Yds", (row) => derivedStatValue(row, "PuntYards")),
      derivedColumn("puntaverage", "Avg", (row) => derivedDisplay(row, derivedPuntAverage, (value) => derivedDecimal(value, 1))),
      derivedColumn("puntlong", "Long", (row) => derivedStatValue(row, "PuntLong")),
    ],
  },
  {
    title: "Kickoff and Punt Returns",
    tableId: "returns",
    hasData: (row) =>
      hasDerivedStat(row, ["KickoffReturnYards", "PuntReturnYards", "KickoffReturnedTDNum", "PuntReturnedTDNum"]),
    sortValue: derivedTotalReturnYards,
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("kickoffreturnnum", "KR", (row) => derivedStatValue(row, "KickoffReturnNum")),
      derivedColumn("kickoffreturnyards", "KR Yds", (row) => derivedStatValue(row, "KickoffReturnYards")),
      derivedColumn("kickoffreturnedtdnum", "KR TD", (row) => derivedStatValue(row, "KickoffReturnedTDNum")),
      derivedColumn("puntreturnnum", "PR", (row) => derivedStatValue(row, "PuntReturnNum")),
      derivedColumn("puntreturnyards", "PR Yds", (row) => derivedStatValue(row, "PuntReturnYards")),
      derivedColumn("puntreturnedtdnum", "PR TD", (row) => derivedStatValue(row, "PuntReturnedTDNum")),
      derivedColumn("totalreturnyards", "Total", (row) => derivedDisplay(row, derivedTotalReturnYards)),
      derivedColumn("returntd", "Ret TD", (row) => derivedDisplay(row, derivedReturnTouchdowns)),
    ],
  },
  {
    title: "PATs and Field Goals",
    tableId: "kicking",
    hasData: (row) => hasDerivedStat(row, ["PATKickingMade", "PATKickingAtt", "FGMade", "FGAtt"]),
    sortValue: derivedTotalKickingPoints,
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("patkickingmade", "PAT", (row) => derivedStatValue(row, "PatKickingMade")),
      derivedColumn("patkickingatt", "PAT Att", (row) => derivedStatValue(row, "PatKickingAtt")),
      derivedColumn("patkickingpercentage", "PAT %", (row) => derivedDisplay(row, derivedPatPct, derivedPercent)),
      derivedColumn("fgmade", "FG", (row) => derivedStatValue(row, "FGMade")),
      derivedColumn("fgatt", "FG Att", (row) => derivedStatValue(row, "FGAtt")),
      derivedColumn("fgpercentage", "FG %", (row) => derivedDisplay(row, derivedFgPct, derivedPercent)),
      derivedColumn("fglong", "Long", (row) => derivedStatValue(row, "FGLong")),
      derivedColumn("totalkickingpoints", "K Pts", (row) => derivedDisplay(row, derivedTotalKickingPoints)),
    ],
  },
  {
    title: "Touchdowns",
    tableId: "touchdowns",
    hasData: (row) =>
      hasDerivedStat(row, ["TotalTDNum", "RushingTDNum", "ReceivingTDNum", "PuntReturnedTDNum", "IntReturnedTDNum"]),
    sortValue: derivedTotalTouchdowns,
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("rushingtdnum", "Rush", (row) => derivedStatValue(row, "RushingTDNum")),
      derivedColumn("receivingtdnum", "Rec", (row) => derivedStatValue(row, "ReceivingTDNum")),
      derivedColumn("kickoffreturnedtdnum", "KR", (row) => derivedStatValue(row, "KickoffReturnedTDNum")),
      derivedColumn("puntreturnedtdnum", "PR", (row) => derivedStatValue(row, "PuntReturnedTDNum")),
      derivedColumn("intreturnedtdnum", "Int", (row) => derivedStatValue(row, "IntReturnedTDNum")),
      derivedColumn("fumblereturnedtdnum", "Fum", (row) => derivedStatValue(row, "FumbleReturnedTDNum")),
      derivedColumn("totaltdnum", "Total", (row) => derivedDisplay(row, derivedTotalTouchdowns)),
    ],
  },
  {
    title: "Conversions",
    tableId: "conversions",
    hasData: (row) => hasDerivedStat(row, ["PATConversions", "PATRushingNum", "PatReceivingNum", "TotalConversionPoints"]),
    sortValue: (row) => getDerivedNumber(row, "TotalConversionPoints") || getDerivedNumber(row, "PATConversions"),
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("patconversions", "Conv", (row) => derivedStatValue(row, "PATConversions")),
      derivedColumn("patrushingnum", "Rush", (row) => derivedStatValue(row, "PATRushingNum")),
      derivedColumn("patreceivingnum", "Rec", (row) => derivedStatValue(row, "PatReceivingNum")),
      derivedColumn("totalconversionpoints", "Pts", (row) => derivedStatValue(row, "TotalConversionPoints")),
    ],
  },
  {
    title: "Points",
    tableId: "points",
    hasData: (row) => hasDerivedStat(row, ["TotalPoints", "TotalKickingPoints", "TotalConversionPoints", "TotalTDNum"]),
    sortValue: derivedTotalPoints,
    columns: [
      derivedColumn("jersey", "#", () => ""),
      derivedColumn("name", "Athlete Name", () => ""),
      derivedColumn("gamesplayed", "GP", (row) => derivedStatValue(row, "GamesTracked")),
      derivedColumn("totaltdnum", "TD", (row) => derivedDisplay(row, derivedTotalTouchdowns)),
      derivedColumn("totaltdpoints", "TD Pts", (row) => derivedStatValue(row, "TotalTDPoints")),
      derivedColumn("totalkickingpoints", "Kick Pts", (row) => derivedDisplay(row, derivedTotalKickingPoints)),
      derivedColumn("totalconversionpoints", "Conv Pts", (row) => derivedStatValue(row, "TotalConversionPoints")),
      derivedColumn("totalpoints", "Pts", (row) => derivedDisplay(row, derivedTotalPoints)),
      derivedColumn("pointspergame", "PPG", (row) =>
        derivedDisplay(row, (entry) => derivedPerGame(derivedTotalPoints(entry), entry), (value) => derivedDecimal(value, 1))
      ),
    ],
  },
];

function toFiniteNumber(value) {
  if (value == null || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatSeasonRecordFromFields(season, prefix) {
  const wins = toFiniteNumber(season?.[`${prefix}Wins`]);
  const losses = toFiniteNumber(season?.[`${prefix}Losses`]);
  const ties = toFiniteNumber(season?.[`${prefix}Ties`]) ?? 0;

  if (wins === null || losses === null) return "—";
  return formatRecord(wins, losses, ties);
}

function formatSeasonSummaryValue(value) {
  const text = String(value ?? "").trim();
  return text ? text : "—";
}

function formatStandingsPct(value, wins, losses, ties = 0) {
  const text = String(value ?? "").trim();
  if (text) return text;

  const winValue = toFiniteNumber(wins);
  const lossValue = toFiniteNumber(losses);
  const tieValue = toFiniteNumber(ties) ?? 0;

  if (winValue === null || lossValue === null) return "—";

  const totalGames = winValue + lossValue + tieValue;
  if (!totalGames) return "—";

  return (winValue / totalGames).toFixed(3);
}

function getStandingsRegions(standings) {
  const regions = Array.isArray(standings?.Regions) ? standings.Regions : [];
  if (regions.length) {
    return regions
      .map((region, index) => ({
        title: region.Title || `Region ${index + 1}`,
        rows: Array.isArray(region.Rows) ? region.Rows : [],
      }))
      .filter((region) => region.rows.length > 0);
  }

  const rows = Array.isArray(standings?.Rows) ? standings.Rows : [];
  if (!rows.length) return [];

  return [
    {
      title: standings?.Title || "Region Standings",
      rows,
    },
  ];
}

function getSchoolLogoPath(school, row) {
  return school?.BracketLogoPath || school?.LogoPath || row?.LogoPath || "";
}

function getOpponentSchool(game, schoolsById) {
  const opponentId = String(game?.OpponentID ?? "").trim();
  return opponentId ? schoolsById.get(opponentId) || null : null;
}

function getScheduleOpponentName(game, schoolsById) {
  const school = getOpponentSchool(game, schoolsById);
  return school?.Name || game?.Opponent || "—";
}

function getScheduleOpponentLogoPath(game, schoolsById) {
  const school = getOpponentSchool(game, schoolsById);
  return school?.LogoPath || school?.BracketLogoPath || game?.OpponentLogoPath || "";
}

function isStAndrewsTeamName(teamName) {
  return /^st\s*andrew['’]?s?(?:\s*school)?$/i.test(
    String(teamName ?? "").replace(/\./g, "").trim()
  );
}

function formatFootballGameType(game) {
  const gameType = String(game?.GameType ?? "").trim().toLowerCase();
  if (gameType === "region") return "Region";
  if (
    gameType === "playoff" ||
    gameType === "playoffs" ||
    gameType === "postseason" ||
    gameType === "state championship"
  ) {
    return "Playoffs";
  }
  if (gameType === "regular season" || gameType === "non-region" || gameType === "nonregion") {
    return "Non-Region";
  }
  return game?.GameType || "—";
}

function getSeasonRecapParagraphs(season) {
  const recap = String(season?.SeasonRecap || "").trim();
  if (!recap) return [];
  return recap.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function getSeasonRecapMedia(season) {
  const media = Array.isArray(season?.SeasonImages)
    ? season.SeasonImages
    : season?.SeasonRecapMedia;
  if (!Array.isArray(media)) return [];

  return media.filter((item) => String(item?.src || "").trim());
}

function getSeasonRecapLinks(season) {
  const links = season?.SeasonRecapLinks;
  if (!Array.isArray(links)) return [];

  return links
    .map((link) => {
      const text = String(link?.Text || "").trim();
      const to = link?.ArticleID
        ? `/athletics/football/articles/${encodeURIComponent(String(link.ArticleID))}`
        : String(link?.Url || "").trim();

      return text && to ? { text, to } : null;
    })
    .filter(Boolean);
}

function renderLinkedRecapText(text, links) {
  if (!links.length) return text;

  const matches = links
    .map((link) => ({ ...link, index: text.indexOf(link.text) }))
    .filter((link) => link.index >= 0)
    .sort((a, b) => a.index - b.index);

  if (!matches.length) return text;

  const pieces = [];
  let cursor = 0;

  matches.forEach((match) => {
    if (match.index < cursor) return;
    if (match.index > cursor) pieces.push(text.slice(cursor, match.index));
    pieces.push(
      <Link key={`${match.to}-${match.index}`} to={match.to} className="text-blue-700 underline hover:text-blue-900">
        {match.text}
      </Link>
    );
    cursor = match.index + match.text.length;
  });

  if (cursor < text.length) pieces.push(text.slice(cursor));
  return pieces;
}

function SeasonRecapSection({ season }) {
  const paragraphs = getSeasonRecapParagraphs(season);
  if (!paragraphs.length) return null;

  const title = String(season?.SeasonRecapTitle || "").trim() || "Season Recap";
  const sourceCitation = String(season?.SeasonRecapSourceCitation || "").trim();
  const recapLinks = getSeasonRecapLinks(season);
  const record =
    season?.OverallRecord ||
    formatRecord(season?.OverallWins, season?.OverallLosses, season?.OverallTies);
  const coach = season?.HeadCoach || "—";

  return (
    <section id="season-recap" className="mx-auto max-w-4xl space-y-3">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="flow-root text-base leading-7 text-slate-700">
        <dl className="mb-4 grid grid-cols-2 gap-3 text-center md:float-right md:mb-3 md:ml-6 md:w-64 md:grid-cols-1">
          <div className="rounded-lg border border-gray-200 px-3 py-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Record</dt>
            <dd className="text-xl font-bold text-gray-900">{record}</dd>
          </div>
          <div className="rounded-lg border border-gray-200 px-3 py-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Coach</dt>
            <dd className="text-lg font-semibold text-gray-900">{coach}</dd>
          </div>
        </dl>

        <div className="space-y-3">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>
              {renderLinkedRecapText(paragraph, recapLinks)}
            </p>
          ))}
        </div>
      </div>
      {sourceCitation ? (
        <p className="text-sm leading-6 text-slate-500">Source: {sourceCitation}</p>
      ) : null}
    </section>
  );
}

function SeasonImagesSection({ season }) {
  const images = getSeasonRecapMedia(season);
  const showPlaceholder = Boolean(season?.ShowSeasonImagesPlaceholder);
  const seasonLabel = season?.SourceSeasonLabel || season?.DisplaySeason || "this";
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [season?.SeasonID]);

  if (!images.length && !showPlaceholder) return null;

  if (!images.length) {
    return (
      <section id="season-images" className="space-y-3">
        <h2 className="text-2xl font-semibold">Season Images</h2>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <p className="text-base font-semibold text-gray-800">Season photo gallery coming soon</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Photos from the {seasonLabel} football season will be added here.
          </p>
        </div>
      </section>
    );
  }

  const selectedImage = images[imageIndex] || images[0];
  const selectedCaption = String(selectedImage?.caption || "").trim();
  const currentImageNumber = Math.min(imageIndex + 1, images.length);
  const goPrev = () => setImageIndex((index) => (index - 1 + images.length) % images.length);
  const goNext = () => setImageIndex((index) => (index + 1) % images.length);

  return (
    <section id="season-images" className="space-y-3">
      <h2 className="text-2xl font-semibold">Season Images</h2>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="relative bg-gray-50">
          <img
            src={selectedImage.src}
            alt={selectedImage.alt || ""}
            className="w-full max-h-[620px] object-contain"
            loading="lazy"
          />

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow hover:bg-white"
                aria-label="Previous image"
                title="Previous"
              >
                {"<"}
              </button>

              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow hover:bg-white"
                aria-label="Next image"
                title="Next"
              >
                {">"}
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-xs text-white">
                {currentImageNumber} / {images.length}
              </div>
            </>
          ) : null}
        </div>

        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-900">{selectedCaption}</p>
            <p className="text-xs text-gray-500">
              Image {currentImageNumber} of {images.length}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7">
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setImageIndex(index)}
                className={`aspect-square overflow-hidden rounded-md border bg-gray-50 ${
                  index === imageIndex
                    ? "border-gray-900 ring-2 ring-gray-900"
                    : "border-gray-200 hover:border-gray-500"
                }`}
                aria-label={`Go to image ${index + 1}`}
                title={image.caption || image.alt || `Image ${index + 1}`}
              >
                <img src={image.src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FootballRosterTable({ rosterRows, emptyStateClassName }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full table-fixed bg-white text-center text-sm">
        <colgroup>
          <col className="w-9" />
          <col />
          <col className="w-11" />
          <col className="w-16" />
        </colgroup>
        <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
          <tr>
            <th className={`${recordTableStyles.headerCell} whitespace-nowrap`}>No.</th>
            <th className={`${recordTableStyles.headerCell} text-left`}>Player</th>
            <th className={`${recordTableStyles.headerCell} whitespace-nowrap`}>Grade</th>
            <th className={`${recordTableStyles.headerCell} text-left`}>Pos.</th>
          </tr>
        </thead>
        <tbody>
          {rosterRows.length === 0 ? (
            <tr>
              <td className={emptyStateClassName} colSpan={4}>
                No roster data is available for this season yet.
              </td>
            </tr>
          ) : (
            rosterRows.map((player, index) => (
              <tr
                key={player.PlayerID || player.RowID || player.PlayerName}
                className={`border-t border-gray-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                } hover:bg-gray-100`}
              >
                <td className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>
                  {player.JerseyNumber || "—"}
                </td>
                <td className={`${recordTableStyles.bodyCell} text-left`}>
                  <div className="flex flex-col items-start gap-0.5">
                    {player.PlayerID ? (
                      <Link
                        to={footballPlayerPath(player.PlayerID)}
                        className="text-blue-600 hover:underline"
                      >
                        {player.PlayerName || "—"}
                      </Link>
                    ) : (
                      <span>{player.PlayerName || "—"}</span>
                    )}
                    {player.Subline ? (
                      <span className="text-xs font-medium text-slate-500 md:whitespace-nowrap">
                        {player.Subline}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>
                  {player.Grade || "—"}
                </td>
                <td className={`${recordTableStyles.bodyCell} text-left`}>
                  {(player.Positions || []).join(", ") || "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function RegionStandingsTable({ standings, schoolsById }) {
  const regions = getStandingsRegions(standings);
  if (!regions.length) return null;

  return (
    <div className="grid gap-6">
      {regions.map((region) => (
        <div key={region.title} className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">{region.title}</h3>
          <div className="overflow-x-auto">
            <div className="mx-auto w-max overflow-hidden rounded-lg border border-gray-200 shadow">
              <table className="w-[880px] bg-white text-sm">
                <thead className="bg-gray-100 text-xs text-gray-700 uppercase tracking-wide">
                  <tr>
                    <th rowSpan={2} className="w-72 px-3 py-2 text-center">
                      Team
                    </th>
                    <th colSpan={4} className="border-l border-gray-200 px-3 py-2 text-center">
                      Overall
                    </th>
                    <th colSpan={4} className="border-l border-gray-200 px-3 py-2 text-center">
                      Region
                    </th>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <th className="border-l border-gray-200 px-3 py-2 text-center">Record</th>
                    <th className="px-3 py-2 text-center">Win %</th>
                    <th className="px-3 py-2 text-center">PF</th>
                    <th className="px-3 py-2 text-center">PA</th>
                    <th className="border-l border-gray-200 px-3 py-2 text-center">Record</th>
                    <th className="px-3 py-2 text-center">Win %</th>
                    <th className="px-3 py-2 text-center">PF</th>
                    <th className="px-3 py-2 text-center">PA</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800">
                  {region.rows.map((row, index) => {
                    const school = row.SchoolID ? schoolsById.get(String(row.SchoolID)) : null;
                    const logoPath = getSchoolLogoPath(school, row);
                    const teamName = row.Team || school?.Name || "—";
                    const isStAndrews = isStAndrewsTeamName(teamName);

                    return (
                      <tr
                        key={`${region.title}-${teamName}-${index}`}
                        className={`border-t border-gray-200 ${
                          isStAndrews
                            ? "bg-blue-50"
                            : index % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50/70"
                        } hover:bg-gray-100`}
                      >
                        <td
                          className={`w-72 px-3 py-2 text-center align-middle ${
                            isStAndrews ? "font-semibold text-blue-900" : "font-medium"
                          }`}
                        >
                          <div className="mx-auto flex items-center justify-center gap-2 whitespace-nowrap leading-tight">
                            {logoPath ? (
                              <img
                                src={logoPath}
                                alt=""
                                loading="lazy"
                                className="h-6 w-6 shrink-0 object-contain"
                              />
                            ) : (
                              <span className="h-6 w-6 shrink-0" aria-hidden="true" />
                            )}
                            <span className="text-center">{teamName}</span>
                          </div>
                        </td>
                        <td className="border-l border-gray-200 px-3 py-2 text-center whitespace-nowrap">
                          {formatSeasonRecordFromFields(row, "Overall")}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {formatStandingsPct(
                            row.OverallPct,
                            row.OverallWins,
                            row.OverallLosses,
                            row.OverallTies
                          )}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {formatSeasonSummaryValue(row.OverallPointsFor)}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {formatSeasonSummaryValue(row.OverallPointsAgainst)}
                        </td>
                        <td className="border-l border-gray-200 px-3 py-2 text-center whitespace-nowrap">
                          {formatSeasonRecordFromFields(row, "Region")}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {formatStandingsPct(
                            row.RegionPct,
                            row.RegionWins,
                            row.RegionLosses,
                            row.RegionTies
                          )}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {formatSeasonSummaryValue(row.RegionPointsFor)}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {formatSeasonSummaryValue(row.RegionPointsAgainst)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FootballSeasonPage({ seasonId: seasonIdProp = null }) {
  const params = useParams();
  const resolvedSeasonId = Number(seasonIdProp ?? params.seasonId);

  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [seasonStatsCollection, setSeasonStatsCollection] = useState([]);
  const [articles, setArticles] = useState([]);
  const [preparedRecordsData, setPreparedRecordsData] = useState(null);
  const [schools, setSchools] = useState([]);
  const [selectedStatsView, setSelectedStatsView] = useState(
    INDIVIDUAL_STATS_VIEW_CONFIG[0].key
  );
  const [status, setStatus] = useState("Loading football season...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [data, preparedData] = await Promise.all([
          loadFootballSeasonPageData(),
          loadPreparedFootballRecordsData(),
        ]);
        if (cancelled) return;

        setGames(data.games);
        setPlayers(data.players);
        setRosters(data.rosters);
        setSeasons(data.seasons);
        setSeasonStatsCollection(data.seasonStats);
        setArticles(data.articles);
        setPreparedRecordsData(preparedData);
        setSchools(data.schools);
        setStatus("");
      } catch (error) {
        if (cancelled) return;
        setStatus(error?.message || "Failed to load the football season.");
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const season = useMemo(
    () => seasons.find((entry) => Number(entry.SeasonID) === resolvedSeasonId) || null,
    [resolvedSeasonId, seasons]
  );

  const seasonLabel = useMemo(() => {
    if (season) return formatSeasonLabel(season);
    if (Number.isFinite(resolvedSeasonId)) return `${resolvedSeasonId}`;
    return "Football";
  }, [resolvedSeasonId, season]);

  const regionStandings = useMemo(() => {
    if (!getStandingsRegions(season?.RegionStandings).length) return null;
    return season.RegionStandings;
  }, [season]);

  const playoffBracket = season?.StatePlayoffBracket || null;

  const schoolsById = useMemo(() => {
    const map = new Map();
    schools.forEach((school) => {
      if (school?.SchoolID) {
        map.set(String(school.SchoolID), school);
      }
    });
    return map;
  }, [schools]);

  const rosterSeason = useMemo(
    () => rosters.find((entry) => Number(entry.SeasonID) === resolvedSeasonId) || null,
    [resolvedSeasonId, rosters]
  );

  const seasonGames = useMemo(
    () =>
      sortGamesChronologically(
        games.filter((game) => Number(game.SeasonID ?? game.Season) === resolvedSeasonId)
      ),
    [games, resolvedSeasonId]
  );

  const seasonStats = useMemo(
    () => getSeasonStatsForSeason(seasonStatsCollection, resolvedSeasonId),
    [resolvedSeasonId, seasonStatsCollection]
  );

  const seasonArticles = useMemo(
    () => articles.filter((article) => Number(article?.SeasonID) === resolvedSeasonId),
    [articles, resolvedSeasonId]
  );

  const playerMap = useMemo(() => {
    const map = new Map();
    players.forEach((player) => {
      map.set(String(player.PlayerID), player);
    });
    return map;
  }, [players]);

  const rosterRows = useMemo(() => {
    const entries = Array.isArray(rosterSeason?.Players) ? rosterSeason.Players : [];

    return entries
      .map((entry) => {
        const masterPlayer = playerMap.get(String(entry.PlayerID));
        const masterName = masterPlayer
          ? [
              masterPlayer.PlayerName,
              [masterPlayer.FirstName, masterPlayer.LastName].filter(Boolean).join(" "),
            ]
              .map((value) => String(value || "").trim())
              .find(Boolean)
          : "";
        const rosterName = String(entry.PlayerName || "").trim();
        const namesAlign =
          !masterName ||
          !rosterName ||
          masterName.toLowerCase().replace(/[^a-z0-9]/g, "") ===
            rosterName.toLowerCase().replace(/[^a-z0-9]/g, "");

        return {
          ...masterPlayer,
          ...entry,
          PlayerName: namesAlign ? rosterName || masterName : rosterName || masterName,
        };
      })
      .sort((a, b) => {
        const jerseyA = Number(a.JerseyNumber || 999);
        const jerseyB = Number(b.JerseyNumber || 999);
        if (jerseyA !== jerseyB) return jerseyA - jerseyB;
        return String(a.PlayerName || "").localeCompare(String(b.PlayerName || ""));
      });
  }, [playerMap, rosterSeason]);

  const staffRows = useMemo(() => {
    const entries = Array.isArray(rosterSeason?.Staff) ? rosterSeason.Staff : [];

    return entries
      .map((entry, index) => {
        const name = String(entry?.Name || "").trim();
        const position = String(entry?.Position || "").trim();
        if (!name && !position) return null;

        return {
          RowID: `staff-${index}-${name || position}`,
          RowType: "staff",
          JerseyNumber: null,
          Grade: null,
          Positions: position ? [position] : [],
          PlayerName: name || "—",
          Distinctions: [],
        };
      })
      .filter(Boolean);
  }, [rosterSeason]);

  const rosterTableRows = useMemo(
    () => [...rosterRows, ...staffRows],
    [rosterRows, staffRows]
  );

  const desktopRosterColumns = useMemo(() => {
    const midpoint = Math.ceil(rosterTableRows.length / 2);
    return [rosterTableRows.slice(0, midpoint), rosterTableRows.slice(midpoint)];
  }, [rosterTableRows]);

  const rosterByPlayerId = useMemo(() => {
    const map = new Map();
    rosterRows.forEach((row) => {
      if (row?.PlayerID) map.set(String(row.PlayerID), row);
    });
    return map;
  }, [rosterRows]);

  const preparedPlayerSeasonRows = useMemo(
    () =>
      (preparedRecordsData?.playerSeasons || []).filter(
        (row) => Number(row?.SeasonID) === resolvedSeasonId
      ),
    [preparedRecordsData, resolvedSeasonId]
  );

  const preparedTeamTotals = useMemo(
    () => (preparedPlayerSeasonRows.length ? sumDerivedStats(preparedPlayerSeasonRows) : null),
    [preparedPlayerSeasonRows]
  );

  const derivedSeasonStatTables = useMemo(() => {
    if (!preparedPlayerSeasonRows.length) return [];

    return DERIVED_FOOTBALL_TABLES.map((config) =>
      buildDerivedTable({
        ...config,
        rows: preparedPlayerSeasonRows,
        rosterByPlayerId,
      })
    ).filter(Boolean);
  }, [preparedPlayerSeasonRows, rosterByPlayerId]);

  const derivedSeasonStatTablesByTitle = useMemo(() => {
    const map = new Map();
    derivedSeasonStatTables.forEach((table) => {
      map.set(String(table?.Title || "").trim().toLowerCase(), table);
    });
    return map;
  }, [derivedSeasonStatTables]);

  const getDisplaySeasonStatTable = (title) =>
    getSeasonStatTable(seasonStats, title) ||
    derivedSeasonStatTablesByTitle.get(String(title).trim().toLowerCase()) ||
    null;

  const passingTable = useMemo(
    () => getDisplaySeasonStatTable("Passing"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const rushingTable = useMemo(
    () => getDisplaySeasonStatTable("Rushing"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const receivingTable = useMemo(
    () => getDisplaySeasonStatTable("Receiving"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const totalYardsTable = useMemo(
    () => getDisplaySeasonStatTable("Total Yards"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const allPurposeTable = useMemo(
    () => getDisplaySeasonStatTable("All Purpose Yards"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const tacklesTable = useMemo(
    () => getDisplaySeasonStatTable("Tackles"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const sacksTable = useMemo(
    () => getDisplaySeasonStatTable("Sacks"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const defenseTable = useMemo(
    () => getDisplaySeasonStatTable("Defensive Statistics"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const returnsTable = useMemo(
    () => getDisplaySeasonStatTable("Kickoff and Punt Returns"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const puntsTable = useMemo(
    () => getDisplaySeasonStatTable("Punts"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const kickoffsTable = useMemo(
    () => getDisplaySeasonStatTable("Kickoffs"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const touchdownsTable = useMemo(
    () => getDisplaySeasonStatTable("Touchdowns"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const conversionsTable = useMemo(
    () => getDisplaySeasonStatTable("Conversions"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const kickingTable = useMemo(
    () => getDisplaySeasonStatTable("PATs and Field Goals"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );
  const pointsTable = useMemo(
    () => getDisplaySeasonStatTable("Points"),
    [derivedSeasonStatTablesByTitle, seasonStats]
  );

  const offenseRows = useMemo(() => {
    const passingComp = firstMeaningfulValue(
      tableTotal(passingTable, "passingcomp"),
      derivedStatValue(preparedTeamTotals, "PassingComp")
    );
    const passingAtt = firstMeaningfulValue(
      tableTotal(passingTable, "passingatt"),
      derivedStatValue(preparedTeamTotals, "PassingAtt")
    );
    const passingTd = firstMeaningfulValue(
      tableTotal(passingTable, "passingtd"),
      derivedStatValue(preparedTeamTotals, "PassingTD")
    );
    const passingInt = firstMeaningfulValue(
      tableTotal(passingTable, "passingint"),
      derivedStatValue(preparedTeamTotals, "PassingInt")
    );
    const passingYards = firstMeaningfulValue(
      tableTotal(passingTable, "passingyards"),
      derivedStatValue(preparedTeamTotals, "PassingYards")
    );
    const rushingYards = firstMeaningfulValue(
      tableTotal(rushingTable, "rushingyards"),
      derivedStatValue(preparedTeamTotals, "RushingYards")
    );
    const tableTotalOffense =
      toFiniteNumber(passingYards) !== null && toFiniteNumber(rushingYards) !== null
        ? toFiniteNumber(passingYards) + toFiniteNumber(rushingYards)
        : null;
    const totalOffense = derivedSum(preparedTeamTotals, ["PassingYards", "RushingYards"]);

    return [
      {
        label: "Points scored",
        value: firstMeaningfulValue(formatSeasonSummaryValue(season?.PointsFor)),
      },
      {
        label: "Pass completions / attempts",
        value:
          hasMeaningfulValue(passingComp) && hasMeaningfulValue(passingAtt)
            ? `${passingComp} / ${passingAtt}`
            : "—",
      },
      {
        label: "Passing yards",
        value: firstMeaningfulValue(passingYards, "—"),
      },
      {
        label: "Passing TD / INT",
        value:
          hasMeaningfulValue(passingTd) && hasMeaningfulValue(passingInt)
            ? `${passingTd} / ${passingInt}`
            : "—",
      },
      {
        label: "Rushing attempts",
        value: firstMeaningfulValue(
          tableTotal(rushingTable, "rushingnum"),
          derivedStatValue(preparedTeamTotals, "RushingNum"),
          "—"
        ),
      },
      {
        label: "Rushing yards",
        value: firstMeaningfulValue(rushingYards, "—"),
      },
      {
        label: "Rushing TD",
        value: firstMeaningfulValue(
          tableTotal(rushingTable, "rushingtdnum"),
          derivedStatValue(preparedTeamTotals, "RushingTDNum"),
          "—"
        ),
      },
      {
        label: "Receiving yards",
        value: firstMeaningfulValue(
          tableTotal(receivingTable, "receivingyards"),
          derivedStatValue(preparedTeamTotals, "ReceivingYards"),
          "—"
        ),
      },
      {
        label: "Total offense",
        value: firstMeaningfulValue(
          derivedWhole(tableTotalOffense),
          derivedWhole(totalOffense),
          tableTotal(totalYardsTable, "totalyards"),
          "—"
        ),
      },
      {
        label: "All-purpose yards",
        value: firstMeaningfulValue(
          tableTotal(allPurposeTable, "allpurposeyards"),
          derivedDisplay(preparedTeamTotals, derivedAllPurposeYards),
          "—"
        ),
      },
    ];
  }, [allPurposeTable, passingTable, preparedTeamTotals, receivingTable, rushingTable, season, totalYardsTable]);

  const defenseRows = useMemo(
    () => [
      {
        label: "Points allowed",
        value: firstMeaningfulValue(formatSeasonSummaryValue(season?.PointsAgainst)),
      },
      {
        label: "Total tackles",
        value: firstMeaningfulValue(
          tableTotal(tacklesTable, "totaltackles"),
          derivedStatValue(preparedTeamTotals, "TotalTackles", (value) => derivedDecimal(value, 1))
        ),
      },
      {
        label: "Tackles for loss",
        value: firstMeaningfulValue(
          tableTotal(tacklesTable, "tacklesforloss"),
          derivedStatValue(preparedTeamTotals, "TacklesForLoss", (value) => derivedDecimal(value, 1))
        ),
      },
      {
        label: "Sacks",
        value: firstMeaningfulValue(
          tableTotal(sacksTable, "sacks"),
          derivedStatValue(preparedTeamTotals, "Sacks", (value) => derivedDecimal(value, 1))
        ),
      },
      {
        label: "QB hurries",
        value: firstMeaningfulValue(
          tableTotal(sacksTable, "qbhurries"),
          derivedStatValue(preparedTeamTotals, "QBHurries")
        ),
      },
      {
        label: "Interceptions",
        value: firstMeaningfulValue(
          tableTotal(defenseTable, "ints"),
          derivedStatValue(preparedTeamTotals, "Ints")
        ),
      },
      {
        label: "INT return yards",
        value: firstMeaningfulValue(
          tableTotal(defenseTable, "intyards"),
          derivedStatValue(preparedTeamTotals, "IntYards")
        ),
      },
      {
        label: "Passes defensed",
        value: firstMeaningfulValue(
          tableTotal(defenseTable, "passesdefensed"),
          derivedStatValue(preparedTeamTotals, "PassesDefensed")
        ),
      },
      {
        label: "Fumble recoveries",
        value: firstMeaningfulValue(
          tableTotal(defenseTable, "fumblerecoveries"),
          derivedStatValue(preparedTeamTotals, "FumbleRecoveries")
        ),
      },
      {
        label: "Caused fumbles",
        value: firstMeaningfulValue(
          tableTotal(defenseTable, "causedfumbles"),
          derivedStatValue(preparedTeamTotals, "CausedFumbles")
        ),
      },
    ],
    [defenseTable, preparedTeamTotals, sacksTable, season, tacklesTable]
  );

  const specialTeamsRows = useMemo(
    () => [
      {
        label: "Kickoffs",
        value: firstMeaningfulValue(
          tableTotal(kickoffsTable, "kickoffnum"),
          derivedStatValue(preparedTeamTotals, "KickoffNum")
        ),
      },
      {
        label: "Punts",
        value: firstMeaningfulValue(
          tableTotal(puntsTable, "puntnum"),
          derivedStatValue(preparedTeamTotals, "PuntNum")
        ),
      },
      {
        label: "Punt average",
        value: firstMeaningfulValue(
          tableTotal(puntsTable, "puntaverage"),
          derivedDisplay(preparedTeamTotals, derivedPuntAverage, (value) => derivedDecimal(value, 1))
        ),
      },
      {
        label: "Kickoff returns",
        value: firstMeaningfulValue(
          tableTotal(returnsTable, "kickoffreturnnum"),
          derivedStatValue(preparedTeamTotals, "KickoffReturnNum")
        ),
      },
      {
        label: "Kickoff return yards",
        value: firstMeaningfulValue(
          tableTotal(returnsTable, "kickoffreturnyards"),
          derivedStatValue(preparedTeamTotals, "KickoffReturnYards")
        ),
      },
      {
        label: "Punt returns",
        value: firstMeaningfulValue(
          tableTotal(returnsTable, "puntreturnnum"),
          derivedStatValue(preparedTeamTotals, "PuntReturnNum")
        ),
      },
      {
        label: "Punt return yards",
        value: firstMeaningfulValue(
          tableTotal(returnsTable, "puntreturnyards"),
          derivedStatValue(preparedTeamTotals, "PuntReturnYards")
        ),
      },
      {
        label: "PAT made",
        value: firstMeaningfulValue(
          tableTotal(kickingTable, "patkickingmade"),
          derivedStatValue(preparedTeamTotals, "PatKickingMade")
        ),
      },
      {
        label: "Field goals made",
        value: firstMeaningfulValue(
          tableTotal(kickingTable, "fgmade"),
          derivedStatValue(preparedTeamTotals, "FGMade")
        ),
      },
      {
        label: "Total touchdowns",
        value: firstMeaningfulValue(
          tableTotal(touchdownsTable, "totaltdnum"),
          derivedDisplay(preparedTeamTotals, derivedTotalTouchdowns)
        ),
      },
      {
        label: "Tracked individual points",
        value: firstMeaningfulValue(
          tableTotal(pointsTable, "totalpoints"),
          derivedDisplay(preparedTeamTotals, derivedTotalPoints)
        ),
      },
      {
        label: "Conversions",
        value: firstMeaningfulValue(
          tableTotal(conversionsTable, "patconversions"),
          derivedStatValue(preparedTeamTotals, "PATConversions")
        ),
      },
    ],
    [
      conversionsTable,
      kickingTable,
      kickoffsTable,
      pointsTable,
      preparedTeamTotals,
      puntsTable,
      returnsTable,
      touchdownsTable,
    ]
  );

  const combinedTeamStatsSections = useMemo(
    () => [
      { title: "Offense", rows: offenseRows },
      { title: "Defense", rows: defenseRows },
      { title: "Special Teams & Scoring", rows: specialTeamsRows },
    ],
    [defenseRows, offenseRows, specialTeamsRows]
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
        tables: view.tableTitles
          .map((title) => getDisplaySeasonStatTable(title))
          .filter(Boolean),
      })).filter((view) => view.tables.length > 0),
    [derivedSeasonStatTablesByTitle, seasonStats]
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

  const emptyStateClassName = `${recordTableStyles.bodyCell} text-center text-slate-600`;
  const missingSeasonStatus =
    !status && !season && seasonGames.length === 0
      ? `No football data is available for the ${seasonLabel} season.`
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

      <SeasonRecapSection season={season} />
      <SeasonImagesSection season={season} />
      {season?.HideSeasonArticles ? null : (
        <ArticleFeatureList
          articles={seasonArticles}
          basePath="/athletics/football"
          heading="Season Articles"
        />
      )}

      {regionStandings ? (
        <section id="region-standings" className="space-y-4">
          <h2 className="text-2xl font-semibold">Region Standings</h2>
          <RegionStandingsTable standings={regionStandings} schoolsById={schoolsById} />
        </section>
      ) : null}

      <section id="roster" className="space-y-4">
        <h2 className="text-2xl font-semibold">Season Roster</h2>

        {rosterTableRows.length === 0 ? (
          <FootballRosterTable
            rosterRows={rosterTableRows}
            emptyStateClassName={emptyStateClassName}
          />
        ) : (
          <>
            <div className="lg:hidden">
              <FootballRosterTable
                rosterRows={rosterTableRows}
                emptyStateClassName={emptyStateClassName}
              />
            </div>
            <div className="hidden gap-5 lg:grid lg:grid-cols-2">
              {desktopRosterColumns.map((columnRows, index) =>
                columnRows.length ? (
                  <div key={index}>
                    <FootballRosterTable
                      rosterRows={columnRows}
                      emptyStateClassName={emptyStateClassName}
                    />
                  </div>
                ) : null
              )}
            </div>
          </>
        )}
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
                <th className="px-3 py-2 text-center">Type</th>
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
                  const opponentName = getScheduleOpponentName(game, schoolsById);
                  const opponentLogoPath = getScheduleOpponentLogoPath(game, schoolsById);

                  return (
                    <tr
                      key={game.GameID}
                      className={`border-t border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Link
                          to={footballGamePath(game.GameID)}
                          className="text-blue-600 hover:underline"
                        >
                          {formatGameDate(game)}
                        </Link>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Link
                          to={footballGamePath(game.GameID)}
                          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          {opponentLogoPath ? (
                            <img
                              src={opponentLogoPath}
                              alt=""
                              loading="lazy"
                              className="h-7 w-7 shrink-0 object-contain"
                            />
                          ) : null}
                          <span>{opponentName}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {game.LocationType || ""}
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {formatFootballGameType(game)}
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
                        {game.Result || ""}
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {game.Result ? (
                          <Link
                            to={footballGamePath(game.GameID)}
                            className="text-blue-600 hover:underline"
                          >
                            {game.TeamScore} - {game.OpponentScore}
                          </Link>
                        ) : (
                          ""
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {playoffBracket ? (
        <section id="state-playoff-bracket" className="space-y-4">
          <h2 className="text-2xl font-semibold">State Playoff Bracket</h2>
          <StateBracket8GameSVG bracket={playoffBracket} schools={schools} />
        </section>
      ) : null}

      <section id="team-stats" className="space-y-6">
        <h2 className="text-2xl font-semibold">Team Stats</h2>

        {hasTeamStats ? (
          <CombinedTeamStatsTable sections={combinedTeamStatsSections} />
        ) : (
          <p className="text-slate-600">No team stats are available for this season.</p>
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
                      key={`${resolvedSeasonId}-${table.TableID}`}
                      title={table.Title}
                      columns={table.Columns || []}
                      rows={table.Rows || []}
                      totals={table.Totals || null}
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
