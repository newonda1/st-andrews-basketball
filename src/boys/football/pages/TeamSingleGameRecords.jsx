import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import { formatGameDate } from "../footballData";
import {
  TEAM_SINGLE_GAME_SECTIONS,
} from "../footballRecordConfigs";
import { buildLeaderboardMap, usePreparedFootballRecordsData } from "../footballRecordsData";

import FootballRecordsTablePage from "./FootballRecordsTablePage";
import { footballGamePath } from "./footballDetailUtils";

function renderGameLink(row, valueKey) {
  const label = row?.[valueKey] || "—";
  if (row?._placeholder || !row?.gameId) return label;

  return (
    <Link to={footballGamePath(row.gameId)} className="text-blue-700 hover:underline">
      {label}
    </Link>
  );
}

export default function TeamSingleGameRecords() {
  const { data, error } = usePreparedFootballRecordsData();

  const rowsByRecord = useMemo(() => {
    if (!data) return {};

    return buildLeaderboardMap(data.teamGames, TEAM_SINGLE_GAME_SECTIONS, (row) => ({
      sortKey: String(row?.GameID || ""),
      gameId: row?.GameID || "",
      date: formatGameDate(row),
      opponent: row?.Opponent || "—",
      gameResult: row?.GameResultText || "—",
    }));
  }, [data]);

  if (!data && !error) {
    return <div className="p-4 text-center text-gray-600">Loading football team single-game records…</div>;
  }

  return (
    <FootballRecordsTablePage
      title="Team Single Game Records"
      subtitle="Select any record to see the top 20 historical team results for that category"
      sectionDefs={TEAM_SINGLE_GAME_SECTIONS}
      rowsByRecord={rowsByRecord}
      error={error}
      summaryColumns={[
        { header: "Value", emphasize: true, render: (row) => row?.displayValue || "—" },
        { header: "Date", render: (row) => renderGameLink(row, "date") },
        { header: "Opponent", render: (row) => renderGameLink(row, "opponent") },
        { header: "Game Result", render: (row) => renderGameLink(row, "gameResult") },
      ]}
      detailColumns={[
        { header: "Value", emphasize: true, render: (row) => row?.displayValue || "—" },
        { header: "Date", render: (row) => renderGameLink(row, "date") },
        { header: "Opponent", render: (row) => renderGameLink(row, "opponent") },
        { header: "Game Result", render: (row) => renderGameLink(row, "gameResult") },
      ]}
      footnote="Score-based records use the full football archive. Team stat categories appear wherever MaxPreps includes tracked game-level football stats."
    />
  );
}
