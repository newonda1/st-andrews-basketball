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
  freeThrowPct,
  opponentPointsPerGame,
  pointsPerGame,
  reboundsPerGame,
  safeNum,
  scoringMargin,
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

function numericSortValue(value) {
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
}

function renderAvailable(value, available, decimals = 0) {
  if (!available) return "—";
  return formatValue(value, decimals);
}

function renderPercentAvailable(value, available, decimals = 1) {
  if (!available) return "—";
  return formatPercent(value, decimals);
}

const VIEW_CONFIG = {
  overview: {
    label: "Overview",
    defaultSort: "Season",
    columns: [
      { key: "Season", label: "Season", sortValue: (row) => safeNum(row.SeasonKey), render: (row) => row.SeasonLabel },
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      { key: "Wins", label: "W", sortValue: (row) => row.Wins, render: (row) => formatValue(row.Wins) },
      { key: "Losses", label: "L", sortValue: (row) => row.Losses, render: (row) => formatValue(row.Losses) },
      { key: "WinPct", label: "WIN%", sortValue: (row) => winPct(row), render: (row) => formatPercent(winPct(row), 1) },
      { key: "Points", label: "PTS", sortValue: (row) => row.Points, render: (row) => formatValue(row.Points) },
      { key: "OpponentPoints", label: "OPP", sortValue: (row) => row.OpponentPoints, render: (row) => formatValue(row.OpponentPoints) },
      { key: "Diff", label: "DIFF", sortValue: (row) => scoringMargin(row), render: (row) => formatValue(scoringMargin(row)) },
      { key: "PPG", label: "PPG", sortValue: (row) => pointsPerGame(row), render: (row) => formatValue(pointsPerGame(row), 1) },
      {
        key: "OppPPG",
        label: "OPP/G",
        sortValue: (row) => opponentPointsPerGame(row),
        render: (row) => formatValue(opponentPointsPerGame(row), 1),
      },
      {
        key: "MarginPerGame",
        label: "MARGIN",
        sortValue: (row) => scoringMarginPerGame(row),
        render: (row) => formatValue(scoringMarginPerGame(row), 1),
      },
    ],
  },
  scoring: {
    label: "Scoring",
    defaultSort: "Season",
    columns: [
      { key: "Season", label: "Season", sortValue: (row) => safeNum(row.SeasonKey), render: (row) => row.SeasonLabel },
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      { key: "Points", label: "PTS", sortValue: (row) => row.Points, render: (row) => formatValue(row.Points) },
      { key: "PPG", label: "PPG", sortValue: (row) => pointsPerGame(row), render: (row) => formatValue(pointsPerGame(row), 1) },
      {
        key: "FGM",
        label: "FGM",
        sortValue: (row) => numericSortValue(row._has.TwoPM || row._has.ThreePM ? fieldGoalsMade(row) : NaN),
        render: (row) => renderAvailable(fieldGoalsMade(row), row._has.TwoPM || row._has.ThreePM),
      },
      {
        key: "FGA",
        label: "FGA",
        sortValue: (row) => numericSortValue(row._has.TwoPA || row._has.ThreePA ? fieldGoalAttempts(row) : NaN),
        render: (row) => renderAvailable(fieldGoalAttempts(row), row._has.TwoPA || row._has.ThreePA),
      },
      {
        key: "3PM",
        label: "3PM",
        sortValue: (row) => numericSortValue(row._has.ThreePM ? row.ThreePM : NaN),
        render: (row) => renderAvailable(row.ThreePM, row._has.ThreePM),
      },
      {
        key: "FTM",
        label: "FTM",
        sortValue: (row) => numericSortValue(row._has.FTM ? row.FTM : NaN),
        render: (row) => renderAvailable(row.FTM, row._has.FTM),
      },
    ],
  },
  shooting: {
    label: "Shooting",
    defaultSort: "Season",
    columns: [
      { key: "Season", label: "Season", sortValue: (row) => safeNum(row.SeasonKey), render: (row) => row.SeasonLabel },
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      {
        key: "FGM",
        label: "FGM",
        sortValue: (row) => numericSortValue(row._has.TwoPM || row._has.ThreePM ? fieldGoalsMade(row) : NaN),
        render: (row) => renderAvailable(fieldGoalsMade(row), row._has.TwoPM || row._has.ThreePM),
      },
      {
        key: "FGA",
        label: "FGA",
        sortValue: (row) => numericSortValue(row._has.TwoPA || row._has.ThreePA ? fieldGoalAttempts(row) : NaN),
        render: (row) => renderAvailable(fieldGoalAttempts(row), row._has.TwoPA || row._has.ThreePA),
      },
      {
        key: "FGPct",
        label: "FG%",
        sortValue: (row) => numericSortValue(row._has.TwoPA || row._has.ThreePA ? fieldGoalPct(row) : NaN),
        render: (row) => renderPercentAvailable(fieldGoalPct(row), row._has.TwoPA || row._has.ThreePA),
      },
      {
        key: "TwoPM",
        label: "2PM",
        sortValue: (row) => numericSortValue(row._has.TwoPM ? row.TwoPM : NaN),
        render: (row) => renderAvailable(row.TwoPM, row._has.TwoPM),
      },
      {
        key: "TwoPA",
        label: "2PA",
        sortValue: (row) => numericSortValue(row._has.TwoPA ? row.TwoPA : NaN),
        render: (row) => renderAvailable(row.TwoPA, row._has.TwoPA),
      },
      {
        key: "TwoPPct",
        label: "2P%",
        sortValue: (row) => numericSortValue(row._has.TwoPA ? twoPointPct(row) : NaN),
        render: (row) => renderPercentAvailable(twoPointPct(row), row._has.TwoPA),
      },
      {
        key: "ThreePM",
        label: "3PM",
        sortValue: (row) => numericSortValue(row._has.ThreePM ? row.ThreePM : NaN),
        render: (row) => renderAvailable(row.ThreePM, row._has.ThreePM),
      },
      {
        key: "ThreePA",
        label: "3PA",
        sortValue: (row) => numericSortValue(row._has.ThreePA ? row.ThreePA : NaN),
        render: (row) => renderAvailable(row.ThreePA, row._has.ThreePA),
      },
      {
        key: "ThreePPct",
        label: "3P%",
        sortValue: (row) => numericSortValue(row._has.ThreePA ? threePointPct(row) : NaN),
        render: (row) => renderPercentAvailable(threePointPct(row), row._has.ThreePA),
      },
      {
        key: "FTM",
        label: "FTM",
        sortValue: (row) => numericSortValue(row._has.FTM ? row.FTM : NaN),
        render: (row) => renderAvailable(row.FTM, row._has.FTM),
      },
      {
        key: "FTA",
        label: "FTA",
        sortValue: (row) => numericSortValue(row._has.FTA ? row.FTA : NaN),
        render: (row) => renderAvailable(row.FTA, row._has.FTA),
      },
      {
        key: "FTPct",
        label: "FT%",
        sortValue: (row) => numericSortValue(row._has.FTA ? freeThrowPct(row) : NaN),
        render: (row) => renderPercentAvailable(freeThrowPct(row), row._has.FTA),
      },
      {
        key: "EFGPct",
        label: "EFG%",
        sortValue: (row) => numericSortValue(row._has.TwoPA || row._has.ThreePA ? effectiveFieldGoalPct(row) : NaN),
        render: (row) => renderPercentAvailable(effectiveFieldGoalPct(row), row._has.TwoPA || row._has.ThreePA),
      },
    ],
  },
  playmaking: {
    label: "Playmaking",
    defaultSort: "Season",
    columns: [
      { key: "Season", label: "Season", sortValue: (row) => safeNum(row.SeasonKey), render: (row) => row.SeasonLabel },
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      {
        key: "Assists",
        label: "AST",
        sortValue: (row) => numericSortValue(row._has.Assists ? row.Assists : NaN),
        render: (row) => renderAvailable(row.Assists, row._has.Assists),
      },
      {
        key: "APG",
        label: "APG",
        sortValue: (row) => numericSortValue(row._has.Assists ? assistsPerGame(row) : NaN),
        render: (row) => renderAvailable(assistsPerGame(row), row._has.Assists, 1),
      },
      {
        key: "Turnovers",
        label: "TO",
        sortValue: (row) => numericSortValue(row._has.Turnovers ? row.Turnovers : NaN),
        render: (row) => renderAvailable(row.Turnovers, row._has.Turnovers),
      },
      {
        key: "TOPG",
        label: "TOPG",
        sortValue: (row) => numericSortValue(row._has.Turnovers ? turnoversPerGame(row) : NaN),
        render: (row) => renderAvailable(turnoversPerGame(row), row._has.Turnovers, 1),
      },
      {
        key: "ASTTO",
        label: "A/TO",
        sortValue: (row) => numericSortValue(row._has.Assists && row._has.Turnovers ? assistTurnoverRatio(row) : NaN),
        render: (row) =>
          renderAvailable(
            assistTurnoverRatio(row),
            row._has.Assists && row._has.Turnovers && row.Turnovers > 0,
            2
          ),
      },
    ],
  },
  defense: {
    label: "Rebounding & Defense",
    defaultSort: "Season",
    columns: [
      { key: "Season", label: "Season", sortValue: (row) => safeNum(row.SeasonKey), render: (row) => row.SeasonLabel },
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      {
        key: "Rebounds",
        label: "REB",
        sortValue: (row) => numericSortValue(row._has.Rebounds ? row.Rebounds : NaN),
        render: (row) => renderAvailable(row.Rebounds, row._has.Rebounds),
      },
      {
        key: "RPG",
        label: "RPG",
        sortValue: (row) => numericSortValue(row._has.Rebounds ? reboundsPerGame(row) : NaN),
        render: (row) => renderAvailable(reboundsPerGame(row), row._has.Rebounds, 1),
      },
      {
        key: "Steals",
        label: "STL",
        sortValue: (row) => numericSortValue(row._has.Steals ? row.Steals : NaN),
        render: (row) => renderAvailable(row.Steals, row._has.Steals),
      },
      {
        key: "SPG",
        label: "SPG",
        sortValue: (row) => numericSortValue(row._has.Steals ? stealsPerGame(row) : NaN),
        render: (row) => renderAvailable(stealsPerGame(row), row._has.Steals, 1),
      },
      {
        key: "Blocks",
        label: "BLK",
        sortValue: (row) => numericSortValue(row._has.Blocks ? row.Blocks : NaN),
        render: (row) => renderAvailable(row.Blocks, row._has.Blocks),
      },
      {
        key: "BPG",
        label: "BPG",
        sortValue: (row) => numericSortValue(row._has.Blocks ? blocksPerGame(row) : NaN),
        render: (row) => renderAvailable(blocksPerGame(row), row._has.Blocks, 1),
      },
      { key: "OpponentPoints", label: "OPP", sortValue: (row) => row.OpponentPoints, render: (row) => formatValue(row.OpponentPoints) },
      {
        key: "OppPPG",
        label: "OPP/G",
        sortValue: (row) => opponentPointsPerGame(row),
        render: (row) => formatValue(opponentPointsPerGame(row), 1),
      },
      {
        key: "Margin",
        label: "MARGIN",
        sortValue: (row) => scoringMarginPerGame(row),
        render: (row) => formatValue(scoringMarginPerGame(row), 1),
      },
    ],
  },
};

export default function FullTeamStats() {
  const [seasonRows, setSeasonRows] = useState([]);
  const [selectedView, setSelectedView] = useState("overview");
  const [sortField, setSortField] = useState(VIEW_CONFIG.overview.defaultSort);
  const [sortDirection, setSortDirection] = useState("desc");
  const [error, setError] = useState("");

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
        setSeasonRows(seasonTotals);
      } catch (e) {
        setError(String(e?.message || e));
        console.error(e);
      }
    };

    run();
  }, []);

  useEffect(() => {
    setSortField(VIEW_CONFIG[selectedView].defaultSort);
    setSortDirection("desc");
  }, [selectedView]);

  const activeView = VIEW_CONFIG[selectedView];

  const sortedRows = useMemo(() => {
    const activeColumn = activeView.columns.find((column) => column.key === sortField);
    if (!activeColumn) return seasonRows;

    return [...seasonRows].sort((a, b) => {
      const av = activeColumn.sortValue(a);
      const bv = activeColumn.sortValue(b);
      const aNum = numericSortValue(av);
      const bNum = numericSortValue(bv);

      if (aNum !== bNum) {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }

      return safeNum(b.SeasonKey) - safeNum(a.SeasonKey);
    });
  }, [activeView, seasonRows, sortDirection, sortField]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("desc");
  };

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-6 px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center">Full Team Stats</h1>
      <p className="-mt-1.5 text-center text-sm italic text-gray-600">
        View season-by-season totals for St. Andrew&apos;s boys basketball using complete game results plus every available team box-score stat
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {Object.entries(VIEW_CONFIG).map(([key, view]) => {
          const isActive = selectedView === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedView(key)}
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

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 whitespace-pre-wrap text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              {activeView.columns.map((column) => (
                <th
                  key={column.key}
                  className={`${recordTableStyles.headerCell} cursor-pointer select-none hover:bg-gray-300 whitespace-nowrap`}
                  onClick={() => handleSort(column.key)}
                >
                  {column.label}
                  {sortField === column.key ? (sortDirection === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((row, index) => (
              <tr
                key={row.SeasonKey}
                className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                {activeView.columns.map((column) => (
                  <td key={column.key} className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mx-auto max-w-4xl text-center text-xs italic text-gray-500">
        Game results provide full historical scoring records, while rebounds, assists, steals, blocks, turnovers, and shooting splits appear only in seasons where those box-score fields are available.
      </p>
    </div>
  );
}
