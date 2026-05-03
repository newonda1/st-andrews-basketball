import React, { useEffect, useMemo, useState } from "react";
import { recordTableStyles } from "./recordTableStyles";
import { SCHOOLS_PATH } from "../dataUtils";
import {
  assistTurnoverRatio,
  buildTeamGameTotals,
  combinedPoints,
  fetchJson,
  fieldGoalAttempts,
  fieldGoalPct,
  fieldGoalsMade,
  freeThrowPct,
  safeNum,
  scoringMargin,
  threePointPct,
  twoPointPct,
} from "./teamStatsUtils";

function formatValue(value, decimals = 0) {
  if (!Number.isFinite(value)) return "—";
  if (decimals === 0) return String(Math.round(value));
  return value.toFixed(decimals);
}

function formatPercent(value, decimals = 1) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(decimals)}%`;
}

function compareRows(a, b, sortDirection) {
  if (a.value !== b.value) {
    return sortDirection === "asc" ? a.value - b.value : b.value - a.value;
  }

  return String(b.gameId).localeCompare(String(a.gameId));
}

export default function TeamSingleGameRecords() {
  const [rowsByRecord, setRowsByRecord] = useState({});
  const [error, setError] = useState("");
  const [expandedKey, setExpandedKey] = useState(null);

  const sectionDefs = useMemo(
    () => [
      {
        title: "Team Success",
        records: [
          {
            key: "Points",
            label: "Points Scored",
            abbr: "PTS",
            valueFn: (game) => safeNum(game?.Points),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "OpponentPoints",
            label: "Fewest Points Allowed",
            abbr: "OPP",
            sortDirection: "asc",
            valueFn: (game) => safeNum(game?.OpponentPoints),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "MarginVictory",
            label: "Largest Margin of Victory",
            abbr: "MOV",
            valueFn: (game) => {
              const margin = scoringMargin(game);
              return margin > 0 ? margin : null;
            },
            displayFn: (value) => formatValue(value),
          },
          {
            key: "MarginDefeat",
            label: "Largest Margin of Defeat",
            abbr: "MOD",
            valueFn: (game) => {
              const margin = safeNum(game?.OpponentPoints) - safeNum(game?.Points);
              return margin > 0 ? margin : null;
            },
            displayFn: (value) => formatValue(value),
          },
          {
            key: "CombinedPoints",
            label: "Most Combined Points",
            abbr: "TOT",
            valueFn: (game) => combinedPoints(game),
            displayFn: (value) => formatValue(value),
          },
        ],
      },
      {
        title: "Scoring & Shooting",
        records: [
          {
            key: "FGM",
            label: "Field Goals Made",
            abbr: "FGM",
            valueFn: (game) => (game?._has.TwoPM || game?._has.ThreePM ? fieldGoalsMade(game) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "FGA",
            label: "Field Goal Attempts",
            abbr: "FGA",
            valueFn: (game) => (game?._has.TwoPA || game?._has.ThreePA ? fieldGoalAttempts(game) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "FGPct",
            label: "Field Goal Percentage",
            abbr: "FG%",
            qualifierText: "Minimum of 20 field-goal attempts",
            valueFn: (game) => {
              const attempts = fieldGoalAttempts(game);
              if (!(game?._has.TwoPA || game?._has.ThreePA) || attempts < 20) return null;
              return fieldGoalPct(game);
            },
            displayFn: (value) => formatPercent(value),
          },
          {
            key: "TwoPM",
            label: "2-Pt Field Goals Made",
            abbr: "2PM",
            valueFn: (game) => (game?._has.TwoPM ? safeNum(game.TwoPM) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "TwoPA",
            label: "2-Pt Field Goal Attempts",
            abbr: "2PA",
            valueFn: (game) => (game?._has.TwoPA ? safeNum(game.TwoPA) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "TwoPPct",
            label: "2-Pt Field Goal Percentage",
            abbr: "2PT%",
            qualifierText: "Minimum of 12 two-point attempts",
            valueFn: (game) => {
              if (!game?._has.TwoPA || safeNum(game.TwoPA) < 12) return null;
              return twoPointPct(game);
            },
            displayFn: (value) => formatPercent(value),
          },
          {
            key: "ThreePM",
            label: "3-Pt Field Goals Made",
            abbr: "3PM",
            valueFn: (game) => (game?._has.ThreePM ? safeNum(game.ThreePM) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "ThreePA",
            label: "3-Pt Field Goal Attempts",
            abbr: "3PA",
            valueFn: (game) => (game?._has.ThreePA ? safeNum(game.ThreePA) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "ThreePPct",
            label: "3-Pt Field Goal Percentage",
            abbr: "3PT%",
            qualifierText: "Minimum of 8 three-point attempts",
            valueFn: (game) => {
              if (!game?._has.ThreePA || safeNum(game.ThreePA) < 8) return null;
              return threePointPct(game);
            },
            displayFn: (value) => formatPercent(value),
          },
          {
            key: "FTM",
            label: "Free Throws Made",
            abbr: "FTM",
            valueFn: (game) => (game?._has.FTM ? safeNum(game.FTM) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "FTA",
            label: "Free Throw Attempts",
            abbr: "FTA",
            valueFn: (game) => (game?._has.FTA ? safeNum(game.FTA) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "FTPct",
            label: "Free Throw Percentage",
            abbr: "FT%",
            qualifierText: "Minimum of 10 free-throw attempts",
            valueFn: (game) => {
              if (!game?._has.FTA || safeNum(game.FTA) < 10) return null;
              return freeThrowPct(game);
            },
            displayFn: (value) => formatPercent(value),
          },
        ],
      },
      {
        title: "Playmaking",
        records: [
          {
            key: "Assists",
            label: "Assists",
            abbr: "AST",
            valueFn: (game) => (game?._has.Assists ? safeNum(game.Assists) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "Turnovers",
            label: "Turnovers",
            abbr: "TO",
            valueFn: (game) => (game?._has.Turnovers ? safeNum(game.Turnovers) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "ASTTO",
            label: "Assist-to-Turnover Ratio",
            abbr: "A/TO",
            qualifierText: "Minimum of 10 assists and at least 1 turnover",
            valueFn: (game) => {
              if (!game?._has.Assists || !game?._has.Turnovers) return null;
              if (safeNum(game.Assists) < 10 || safeNum(game.Turnovers) < 1) return null;
              return assistTurnoverRatio(game);
            },
            displayFn: (value) => formatValue(value, 2),
          },
        ],
      },
      {
        title: "Rebounding & Defense",
        records: [
          {
            key: "Rebounds",
            label: "Rebounds",
            abbr: "REB",
            valueFn: (game) => (game?._has.Rebounds ? safeNum(game.Rebounds) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "Steals",
            label: "Steals",
            abbr: "STL",
            valueFn: (game) => (game?._has.Steals ? safeNum(game.Steals) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "Blocks",
            label: "Blocks",
            abbr: "BLK",
            valueFn: (game) => (game?._has.Blocks ? safeNum(game.Blocks) : null),
            displayFn: (value) => formatValue(value),
          },
        ],
      },
    ],
    []
  );

  const recordDefs = useMemo(() => sectionDefs.flatMap((section) => section.records), [sectionDefs]);

  useEffect(() => {
    const run = async () => {
      try {
        setError("");

        const [gamesDataRaw, playerStatsDataRaw, schoolsDataRaw] = await Promise.all([
          fetchJson("games.json", "/data/boys/basketball/games.json"),
          fetchJson("playergamestats.json", "/data/boys/basketball/playergamestats.json"),
          fetchJson("schools.json", SCHOOLS_PATH),
        ]);

        const teamGames = buildTeamGameTotals(gamesDataRaw, playerStatsDataRaw, schoolsDataRaw);
        const next = {};

        for (const def of recordDefs) {
          const sortDirection = def.sortDirection || "desc";

          const list = teamGames
            .map((gameRow) => {
              const rawValue = def.valueFn(gameRow);
              return {
                value: Number(rawValue),
                displayValue: Number.isFinite(Number(rawValue)) ? def.displayFn(Number(rawValue)) : "—",
                date: gameRow.date,
                opponent: gameRow.opponent,
                gameResult: gameRow.gameResult,
                gameId: gameRow.GameID,
              };
            })
            .filter((row) => Number.isFinite(row.value) && row.value > 0)
            .sort((a, b) => compareRows(a, b, sortDirection))
            .slice(0, 20);

          while (list.length < 20) {
            list.push({
              value: NaN,
              displayValue: "—",
              date: "—",
              opponent: "—",
              gameResult: "—",
              gameId: null,
              _placeholder: true,
            });
          }

          next[def.key] = list;
        }

        setRowsByRecord(next);
      } catch (e) {
        setError(String(e?.message || e));
        console.error(e);
      }
    };

    run();
  }, [recordDefs]);

  const toggleExpanded = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-6 px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center">Team Single Game Records</h1>
      <p className="-mt-3 text-center text-sm italic text-gray-600">
        Select any record to see the top 20 historical team results for that record
      </p>

      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className={recordTableStyles.headerCell}>Record</th>
              <th className={recordTableStyles.headerCell}>Value</th>
              <th className={recordTableStyles.headerCell}>Date</th>
              <th className={recordTableStyles.headerCell}>Opponent</th>
              <th className={recordTableStyles.headerCell}>Game Result</th>
            </tr>
          </thead>

          <tbody>
            {sectionDefs.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="border-t bg-blue-50">
                  <td className={recordTableStyles.sectionCell} colSpan={5}>
                    {section.title}
                  </td>
                </tr>

                {section.records.map((def) => {
                  const top = (rowsByRecord[def.key] || [])[0];
                  const isOpen = expandedKey === def.key;

                  return (
                    <React.Fragment key={def.key}>
                      <tr
                        onClick={() => toggleExpanded(def.key)}
                        className={`border-t cursor-pointer hover:bg-gray-100 ${isOpen ? "bg-gray-50" : "bg-white"}`}
                      >
                        <td className={`${recordTableStyles.bodyCell} font-semibold`}>
                          <div className="leading-tight">
                            <div>{def.label}</div>
                            {def.qualifierText ? (
                              <div className="mt-1 text-sm italic font-normal text-gray-600">
                                {def.qualifierText}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className={`${recordTableStyles.bodyCell} font-semibold`}>
                          {top?.displayValue ?? "—"}
                        </td>
                        <td className={recordTableStyles.bodyCell}>{top?.date ?? "—"}</td>
                        <td className={recordTableStyles.bodyCell}>{top?.opponent ?? "—"}</td>
                        <td className={recordTableStyles.bodyCell}>{top?.gameResult ?? "—"}</td>
                      </tr>

                      {isOpen && (
                        <tr className="border-t">
                          <td className={recordTableStyles.bodyCell} colSpan={5}>
                            <div className="overflow-x-auto">
                              <table className={recordTableStyles.innerTable}>
                                <thead className="bg-gray-200 font-bold">
                                  <tr>
                                    <th className={recordTableStyles.headerCell}>#</th>
                                    <th className={recordTableStyles.headerCell}>{def.abbr}</th>
                                    <th className={recordTableStyles.headerCell}>Date</th>
                                    <th className={recordTableStyles.headerCell}>Opponent</th>
                                    <th className={recordTableStyles.headerCell}>Game Result</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(rowsByRecord[def.key] || []).map((row, idx) => (
                                    <tr
                                      key={`${def.key}-${idx}`}
                                      className={`border-t ${
                                        row._placeholder
                                          ? "bg-white text-gray-400"
                                          : idx % 2 === 0
                                          ? "bg-white"
                                          : "bg-gray-50"
                                      }`}
                                    >
                                      <td className={`${recordTableStyles.detailCell} font-semibold`}>{idx + 1}</td>
                                      <td className={`${recordTableStyles.detailCell} font-semibold`}>
                                        {row.displayValue}
                                      </td>
                                      <td className={recordTableStyles.detailCell}>{row.date}</td>
                                      <td className={recordTableStyles.detailCell}>{row.opponent}</td>
                                      <td className={recordTableStyles.detailCell}>{row.gameResult}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-sm italic text-gray-500">
        Records use complete game scores for all historical results and add shooting or box-score categories only where team game stat detail exists.
      </p>
    </div>
  );
}
