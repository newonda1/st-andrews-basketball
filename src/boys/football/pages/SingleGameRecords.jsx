import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import { formatGameDate } from "../footballData";
import { INDIVIDUAL_SINGLE_GAME_SECTIONS } from "../footballRecordConfigs";
import { buildLeaderboardMap, usePreparedFootballRecordsData } from "../footballRecordsData";

import FootballRecordsTablePage, { renderPlayerColumn } from "./FootballRecordsTablePage";
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

export default function SingleGameRecords() {
  const { data, error } = usePreparedFootballRecordsData();

  const rowsByRecord = useMemo(() => {
    if (!data) return {};

    return buildLeaderboardMap(data.playerGameRows, INDIVIDUAL_SINGLE_GAME_SECTIONS, (row) => ({
      sortKey: `${String(row?.GameID || "")}-${String(row?.PlayerName || "")}`,
      playerId: row?.PlayerID || "",
      playerName: row?.PlayerName || "—",
      gameId: row?.GameID || "",
      date: formatGameDate(row),
      opponent: row?.Opponent || "—",
      gameResult: row?.GameResultText || "—",
    }));
  }, [data]);

  if (!data && !error) {
    return <div className="p-4 text-center text-gray-600">Loading football single-game records…</div>;
  }

  return (
    <FootballRecordsTablePage
      title="Single Game Records"
      subtitle="Select any record to see the top 20 historical individual football results for that category"
      sectionDefs={INDIVIDUAL_SINGLE_GAME_SECTIONS}
      rowsByRecord={rowsByRecord}
      error={error}
      summaryColumns={[
        { header: "Player", render: renderPlayerColumn },
        { header: "Value", emphasize: true, render: (row) => row?.displayValue || "—" },
        { header: "Date", render: (row) => renderGameLink(row, "date") },
        { header: "Opponent", render: (row) => renderGameLink(row, "opponent") },
        { header: "Game Result", render: (row) => renderGameLink(row, "gameResult") },
      ]}
      detailColumns={[
        { header: "Player", render: renderPlayerColumn },
        { header: "Value", emphasize: true, render: (row) => row?.displayValue || "—" },
        { header: "Date", render: (row) => renderGameLink(row, "date") },
        { header: "Opponent", render: (row) => renderGameLink(row, "opponent") },
        { header: "Game Result", render: (row) => renderGameLink(row, "gameResult") },
      ]}
      footnote="Single-game records use flattened MaxPreps football game logs, so categories reflect only the seasons with tracked individual football stats."
    />
  );
}
