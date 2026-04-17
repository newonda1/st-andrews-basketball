import React, { useEffect, useMemo, useState } from "react";
import { recordTableStyles } from "./recordTableStyles";
import {
  assistsPerGame,
  assistTurnoverRatio,
  blocksPerGame,
  buildTeamGameTotals,
  buildTeamSeasonTotals,
  effectiveFieldGoalPct,
  fetchJson,
  fieldGoalAttempts,
  fieldGoalPct,
  fieldGoalsMade,
  formatSeasonLabel,
  freeThrowPct,
  opponentPointsPerGame,
  pointsPerGame,
  reboundsPerGame,
  safeNum,
  scoringMarginPerGame,
  stealsPerGame,
  threePointPct,
  turnoversPerGame,
  twoPointPct,
  winPct,
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

  return String(b.seasonKey).localeCompare(String(a.seasonKey));
}

export default function TeamSeasonRecords() {
  const [rowsByRecord, setRowsByRecord] = useState({});
  const [error, setError] = useState("");
  const [expandedKey, setExpandedKey] = useState(null);

  const sectionDefs = useMemo(
    () => [
      {
        title: "Team Success",
        records: [
          {
            key: "GamesPlayed",
            label: "Games Played",
            abbr: "GP",
            valueFn: (season) => safeNum(season?.GamesPlayed),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "Wins",
            label: "Wins",
            abbr: "W",
            valueFn: (season) => safeNum(season?.Wins),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "WinPct",
            label: "Winning Percentage",
            abbr: "WIN%",
            qualifierText: "Minimum of 10 games played",
            valueFn: (season) => (safeNum(season?.GamesPlayed) >= 10 ? winPct(season) : null),
            displayFn: (value) => formatPercent(value),
          },
          {
            key: "Points",
            label: "Points Scored",
            abbr: "PTS",
            valueFn: (season) => safeNum(season?.Points),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "PPG",
            label: "Points per Game",
            abbr: "PPG",
            qualifierText: "Minimum of 10 games played",
            valueFn: (season) => (safeNum(season?.GamesPlayed) >= 10 ? pointsPerGame(season) : null),
            displayFn: (value) => formatValue(value, 1),
          },
          {
            key: "OppPPG",
            label: "Fewest Opponent Points per Game",
            abbr: "OPP/G",
            sortDirection: "asc",
            qualifierText: "Minimum of 10 games played",
            valueFn: (season) =>
              safeNum(season?.GamesPlayed) >= 10 ? opponentPointsPerGame(season) : null,
            displayFn: (value) => formatValue(value, 1),
          },
          {
            key: "Margin",
            label: "Best Average Scoring Margin",
            abbr: "MARGIN",
            qualifierText: "Minimum of 10 games played",
            valueFn: (season) =>
              safeNum(season?.GamesPlayed) >= 10 ? scoringMarginPerGame(season) : null,
            displayFn: (value) => formatValue(value, 1),
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
            valueFn: (season) => (season?._has.TwoPM || season?._has.ThreePM ? fieldGoalsMade(season) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "FGA",
            label: "Field Goal Attempts",
            abbr: "FGA",
            valueFn: (season) => (season?._has.TwoPA || season?._has.ThreePA ? fieldGoalAttempts(season) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "FGPct",
            label: "Field Goal Percentage",
            abbr: "FG%",
            qualifierText: "Minimum of 150 field-goal attempts",
            valueFn: (season) => {
              const attempts = fieldGoalAttempts(season);
              if (!(season?._has.TwoPA || season?._has.ThreePA) || attempts < 150) return null;
              return fieldGoalPct(season);
            },
            displayFn: (value) => formatPercent(value),
          },
          {
            key: "TwoPM",
            label: "2-Pt Field Goals Made",
            abbr: "2PM",
            valueFn: (season) => (season?._has.TwoPM ? safeNum(season.TwoPM) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "TwoPA",
            label: "2-Pt Field Goal Attempts",
            abbr: "2PA",
            valueFn: (season) => (season?._has.TwoPA ? safeNum(season.TwoPA) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "TwoPPct",
            label: "2-Pt Field Goal Percentage",
            abbr: "2PT%",
            qualifierText: "Minimum of 100 two-point attempts",
            valueFn: (season) => {
              if (!season?._has.TwoPA || safeNum(season.TwoPA) < 100) return null;
              return twoPointPct(season);
            },
            displayFn: (value) => formatPercent(value),
          },
          {
            key: "ThreePM",
            label: "3-Pt Field Goals Made",
            abbr: "3PM",
            valueFn: (season) => (season?._has.ThreePM ? safeNum(season.ThreePM) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "ThreePA",
            label: "3-Pt Field Goal Attempts",
            abbr: "3PA",
            valueFn: (season) => (season?._has.ThreePA ? safeNum(season.ThreePA) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "ThreePPct",
            label: "3-Pt Field Goal Percentage",
            abbr: "3PT%",
            qualifierText: "Minimum of 50 three-point attempts",
            valueFn: (season) => {
              if (!season?._has.ThreePA || safeNum(season.ThreePA) < 50) return null;
              return threePointPct(season);
            },
            displayFn: (value) => formatPercent(value),
          },
          {
            key: "FTM",
            label: "Free Throws Made",
            abbr: "FTM",
            valueFn: (season) => (season?._has.FTM ? safeNum(season.FTM) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "FTA",
            label: "Free Throw Attempts",
            abbr: "FTA",
            valueFn: (season) => (season?._has.FTA ? safeNum(season.FTA) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "FTPct",
            label: "Free Throw Percentage",
            abbr: "FT%",
            qualifierText: "Minimum of 50 free-throw attempts",
            valueFn: (season) => {
              if (!season?._has.FTA || safeNum(season.FTA) < 50) return null;
              return freeThrowPct(season);
            },
            displayFn: (value) => formatPercent(value),
          },
          {
            key: "EFGPct",
            label: "Effective Field Goal Percentage",
            abbr: "EFG%",
            qualifierText: "Minimum of 150 field-goal attempts",
            valueFn: (season) => {
              const attempts = fieldGoalAttempts(season);
              if (!(season?._has.TwoPA || season?._has.ThreePA) || attempts < 150) return null;
              return effectiveFieldGoalPct(season);
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
            valueFn: (season) => (season?._has.Assists ? safeNum(season.Assists) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "APG",
            label: "Assists per Game",
            abbr: "APG",
            qualifierText: "Minimum of 10 tracked games with assists",
            valueFn: (season) =>
              safeNum(season?.Coverage?.Assists) >= 10 ? assistsPerGame(season) : null,
            displayFn: (value) => formatValue(value, 1),
          },
          {
            key: "Turnovers",
            label: "Turnovers",
            abbr: "TO",
            valueFn: (season) => (season?._has.Turnovers ? safeNum(season.Turnovers) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "TOPG",
            label: "Turnovers per Game",
            abbr: "TOPG",
            qualifierText: "Minimum of 10 tracked games with turnovers",
            valueFn: (season) =>
              safeNum(season?.Coverage?.Turnovers) >= 10 ? turnoversPerGame(season) : null,
            displayFn: (value) => formatValue(value, 1),
          },
          {
            key: "ASTTO",
            label: "Assist-to-Turnover Ratio",
            abbr: "A/TO",
            qualifierText: "Minimum of 50 assists and at least 1 turnover",
            valueFn: (season) => {
              if (!season?._has.Assists || !season?._has.Turnovers) return null;
              if (safeNum(season.Assists) < 50 || safeNum(season.Turnovers) < 1) return null;
              return assistTurnoverRatio(season);
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
            valueFn: (season) => (season?._has.Rebounds ? safeNum(season.Rebounds) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "RPG",
            label: "Rebounds per Game",
            abbr: "RPG",
            qualifierText: "Minimum of 10 tracked games with rebounds",
            valueFn: (season) =>
              safeNum(season?.Coverage?.Rebounds) >= 10 ? reboundsPerGame(season) : null,
            displayFn: (value) => formatValue(value, 1),
          },
          {
            key: "Steals",
            label: "Steals",
            abbr: "STL",
            valueFn: (season) => (season?._has.Steals ? safeNum(season.Steals) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "SPG",
            label: "Steals per Game",
            abbr: "SPG",
            qualifierText: "Minimum of 10 tracked games with steals",
            valueFn: (season) =>
              safeNum(season?.Coverage?.Steals) >= 10 ? stealsPerGame(season) : null,
            displayFn: (value) => formatValue(value, 1),
          },
          {
            key: "Blocks",
            label: "Blocks",
            abbr: "BLK",
            valueFn: (season) => (season?._has.Blocks ? safeNum(season.Blocks) : null),
            displayFn: (value) => formatValue(value),
          },
          {
            key: "BPG",
            label: "Blocks per Game",
            abbr: "BPG",
            qualifierText: "Minimum of 10 tracked games with blocks",
            valueFn: (season) =>
              safeNum(season?.Coverage?.Blocks) >= 10 ? blocksPerGame(season) : null,
            displayFn: (value) => formatValue(value, 1),
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

        const [gamesDataRaw, playerStatsDataRaw, seasonsDataRaw] = await Promise.all([
          fetchJson("games.json", "/data/boys/basketball/games.json"),
          fetchJson("playergamestats.json", "/data/boys/basketball/playergamestats.json"),
          fetchJson("seasons.json", "/data/boys/basketball/seasons.json"),
        ]);

        const teamGames = buildTeamGameTotals(gamesDataRaw, playerStatsDataRaw);
        const seasonTotals = buildTeamSeasonTotals(teamGames, seasonsDataRaw);
        const next = {};

        for (const def of recordDefs) {
          const sortDirection = def.sortDirection || "desc";

          const list = seasonTotals
            .map((seasonRow) => {
              const rawValue = def.valueFn(seasonRow);
              return {
                value: Number(rawValue),
                displayValue: Number.isFinite(Number(rawValue)) ? def.displayFn(Number(rawValue)) : "—",
                season: seasonRow.SeasonLabel || formatSeasonLabel(seasonRow.SeasonKey),
                seasonKey: seasonRow.SeasonKey,
              };
            })
            .filter((row) => Number.isFinite(row.value) && row.value > 0)
            .sort((a, b) => compareRows(a, b, sortDirection))
            .slice(0, 20);

          while (list.length < 20) {
            list.push({
              value: NaN,
              displayValue: "—",
              season: "—",
              seasonKey: null,
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
      <h1 className="text-2xl font-bold text-center">Team Season Records</h1>
      <p className="-mt-1.5 text-center text-sm italic text-gray-600">
        Select any record to see the top 20 historical team seasons for that record
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
              <th className={recordTableStyles.headerCell}>Season</th>
            </tr>
          </thead>

          <tbody>
            {sectionDefs.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="border-t bg-blue-50">
                  <td className={recordTableStyles.sectionCell} colSpan={3}>
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
                              <div className="mt-1 text-[clamp(0.62rem,0.85vw,0.8rem)] italic font-normal text-gray-600">
                                {def.qualifierText}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className={`${recordTableStyles.bodyCell} font-semibold`}>
                          {top?.displayValue ?? "—"}
                        </td>
                        <td className={recordTableStyles.bodyCell}>{top?.season ?? "—"}</td>
                      </tr>

                      {isOpen && (
                        <tr className="border-t">
                          <td className={recordTableStyles.bodyCell} colSpan={3}>
                            <div className="overflow-x-auto">
                              <table className={recordTableStyles.innerTable}>
                                <thead className="bg-gray-200 font-bold">
                                  <tr>
                                    <th className={recordTableStyles.headerCell}>#</th>
                                    <th className={recordTableStyles.headerCell}>{def.abbr}</th>
                                    <th className={recordTableStyles.headerCell}>Season</th>
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
                                      <td className={recordTableStyles.detailCell}>{row.season}</td>
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

      <p className="text-center text-xs italic text-gray-500">
        Season records combine full historical game results with every box-score category available for that season, so some rate stats only appear for more recent seasons or select historical teams.
      </p>
    </div>
  );
}
