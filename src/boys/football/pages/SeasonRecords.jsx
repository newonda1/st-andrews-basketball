import React, { useMemo } from "react";

import { INDIVIDUAL_SEASON_SECTIONS } from "../footballRecordConfigs";
import { buildLeaderboardMap, trackedGames, usePreparedFootballRecordsData } from "../footballRecordsData";

import FootballRecordsTablePage, { renderPlayerColumn } from "./FootballRecordsTablePage";

export default function SeasonRecords() {
  const { data, error } = usePreparedFootballRecordsData();

  const rowsByRecord = useMemo(() => {
    if (!data) return {};

    return buildLeaderboardMap(data.playerSeasons, INDIVIDUAL_SEASON_SECTIONS, (row) => ({
      sortKey: `${String(row?.SeasonID || "")}-${String(row?.PlayerName || "")}`,
      playerName: row?.PlayerName || "—",
      season: row?.SeasonLabel || "—",
      gamesTracked: trackedGames(row),
    }));
  }, [data]);

  if (!data && !error) {
    return <div className="p-4 text-center text-gray-600">Loading football season records…</div>;
  }

  return (
    <FootballRecordsTablePage
      title="Season Records"
      subtitle="Select any record to see the top 20 historical individual football seasons for that category"
      sectionDefs={INDIVIDUAL_SEASON_SECTIONS}
      rowsByRecord={rowsByRecord}
      error={error}
      summaryColumns={[
        { header: "Player", render: renderPlayerColumn },
        { header: "Value", emphasize: true, render: (row) => row?.displayValue || "—" },
        { header: "Season", render: (row) => row?.season || "—" },
      ]}
      detailColumns={[
        { header: "Player", render: renderPlayerColumn },
        { header: "Value", emphasize: true, render: (row) => row?.displayValue || "—" },
        { header: "Season", render: (row) => row?.season || "—" },
        {
          header: "Tracked G",
          render: (row) =>
            row?._placeholder ? "—" : Number.isFinite(Number(row?.gamesTracked)) ? String(row.gamesTracked) : "—",
        },
      ]}
      footnote="Season records are based on tracked MaxPreps football game logs. Rate stats use tracked-game qualifiers so partial-stat seasons do not distort the leaderboards."
    />
  );
}
