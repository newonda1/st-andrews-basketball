import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import { SOFTBALL_BASE_PATH, getSoftballSeasonGames } from "../softballData";

const seasons = [
  {
    seasonId: 2005,
    schoolYear: "2004-05",
    label: "Spring 2005",
    coach: "-",
  },
  {
    seasonId: 2006,
    schoolYear: "2005-06",
    label: "Spring 2006",
    coach: "-",
  },
];

const tableFrameClassName = "overflow-x-auto rounded-lg border border-gray-200 bg-white shadow";
const tableClassName = "min-w-full bg-white text-sm";
const tableHeadClassName = "bg-gray-100 text-xs uppercase tracking-wide text-gray-700";
const headerCellClassName = "px-2 py-2 text-center text-xs font-normal whitespace-nowrap";
const bodyCellClassName = "px-2 py-1.5 text-center align-middle whitespace-nowrap";

function formatRecord(record) {
  if (!record.wins && !record.losses && !record.ties) return "-";
  return record.ties ? `${record.wins}-${record.losses}-${record.ties}` : `${record.wins}-${record.losses}`;
}

function buildRecord(games) {
  return games.reduce(
    (record, game) => {
      if (game.result === "W") record.wins += 1;
      if (game.result === "L") record.losses += 1;
      if (game.result === "T") record.ties += 1;
      return record;
    },
    { wins: 0, losses: 0, ties: 0 }
  );
}

function isRegionGame(game) {
  const type = String(game?.gameType || game?.GameType || "").toLowerCase();
  return type.includes("region") && !type.includes("non-region");
}

function isLocationType(game, locationType) {
  return String(game?.locationType || game?.LocationType || "").toLowerCase() === locationType;
}

export default function YearlyResults() {
  const rows = useMemo(
    () =>
      seasons.map((season) => {
        const games = getSoftballSeasonGames(season.seasonId);
        const placeholderCount = games.filter((game) => game.isPlaceholder).length;
        const recoveredCount = games.length - placeholderCount;

        return {
          ...season,
          overall: formatRecord(buildRecord(games)),
          region: formatRecord(buildRecord(games.filter(isRegionGame))),
          home: formatRecord(buildRecord(games.filter((game) => isLocationType(game, "home")))),
          away: formatRecord(buildRecord(games.filter((game) => isLocationType(game, "away")))),
          notes: [
            recoveredCount ? `${recoveredCount} recovered box scores` : "",
            placeholderCount ? `${placeholderCount} placeholder results` : "",
          ]
            .filter(Boolean)
            .join("; "),
        };
      }),
    []
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-10 pt-2 lg:pb-40">
      <h1 className="text-3xl font-bold text-center mb-2">Year-by-Year Results</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">Full Year-by-Year Results</h2>

        <div className={tableFrameClassName}>
          <table className={tableClassName}>
            <thead className={tableHeadClassName}>
              <tr>
                <th className={`${headerCellClassName} text-left`}>School Year</th>
                <th className={`${headerCellClassName} text-left`}>Season</th>
                <th className={headerCellClassName}>Coach</th>
                <th className={headerCellClassName}>Overall</th>
                <th className={headerCellClassName}>Region</th>
                <th className={headerCellClassName}>Home</th>
                <th className={headerCellClassName}>Away</th>
                <th className={`${headerCellClassName} text-left`}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.seasonId}
                  className={`border-t border-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                  } hover:bg-gray-100`}
                >
                  <td className={`${bodyCellClassName} text-left`}>{row.schoolYear}</td>
                  <td className={`${bodyCellClassName} text-left`}>
                    <Link
                      to={`${SOFTBALL_BASE_PATH}/seasons/${row.seasonId}`}
                      className="text-blue-700 underline hover:text-blue-900"
                    >
                      {row.label}
                    </Link>
                  </td>
                  <td className={bodyCellClassName}>{row.coach}</td>
                  <td className={bodyCellClassName}>{row.overall}</td>
                  <td className={bodyCellClassName}>{row.region}</td>
                  <td className={bodyCellClassName}>{row.home}</td>
                  <td className={bodyCellClassName}>{row.away}</td>
                  <td className={`${bodyCellClassName} text-left`}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
