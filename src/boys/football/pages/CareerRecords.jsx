import React, { useMemo } from "react";

import { INDIVIDUAL_CAREER_SECTIONS } from "../footballRecordConfigs";
import { buildLeaderboardMap, trackedGames, usePreparedFootballRecordsData } from "../footballRecordsData";

import FootballRecordsTablePage, { renderPlayerColumn } from "./FootballRecordsTablePage";

export default function CareerRecords() {
  const { data, error } = usePreparedFootballRecordsData();

  const rowsByRecord = useMemo(() => {
    if (!data) return {};

    return buildLeaderboardMap(data.playerCareers, INDIVIDUAL_CAREER_SECTIONS, (row) => ({
      sortKey: String(row?.PlayerName || ""),
      playerId: row?.PlayerID || "",
      playerName: row?.PlayerName || "—",
      gamesTracked: trackedGames(row),
      seasonsTracked: row?.SeasonsTracked || 0,
    }));
  }, [data]);

  if (!data && !error) {
    return <div className="p-4 text-center text-gray-600">Loading football career records…</div>;
  }

  return (
    <FootballRecordsTablePage
      title="Career Records"
      subtitle="Select any record to see the top 20 historical football careers for that category"
      sectionDefs={INDIVIDUAL_CAREER_SECTIONS}
      rowsByRecord={rowsByRecord}
      error={error}
      summaryColumns={[
        { header: "Player", render: renderPlayerColumn },
        { header: "Value", emphasize: true, render: (row) => row?.displayValue || "—" },
      ]}
      detailColumns={[
        { header: "Player", render: renderPlayerColumn },
        { header: "Value", emphasize: true, render: (row) => row?.displayValue || "—" },
        {
          header: "Tracked G",
          render: (row) =>
            row?._placeholder ? "—" : Number.isFinite(Number(row?.gamesTracked)) ? String(row.gamesTracked) : "—",
        },
        {
          header: "Tracked S",
          render: (row) =>
            row?._placeholder
              ? "—"
              : Number.isFinite(Number(row?.seasonsTracked))
                ? String(row.seasonsTracked)
                : "—",
        },
      ]}
      footnote="Career records combine available game logs and newspaper season-total adjustments for each player career. Adjustment rows override matching season totals when preserved newspaper totals are available."
    />
  );
}
