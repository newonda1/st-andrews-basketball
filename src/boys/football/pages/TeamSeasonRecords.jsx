import React, { useMemo } from "react";

import { TEAM_SEASON_SECTIONS } from "../footballRecordConfigs";
import { buildLeaderboardMap, trackedGames, usePreparedFootballRecordsData } from "../footballRecordsData";

import FootballRecordsTablePage from "./FootballRecordsTablePage";

export default function TeamSeasonRecords() {
  const { data, error } = usePreparedFootballRecordsData();

  const rowsByRecord = useMemo(() => {
    if (!data) return {};

    return buildLeaderboardMap(data.teamSeasons, TEAM_SEASON_SECTIONS, (row) => ({
      sortKey: String(row?.SeasonID || ""),
      season: row?.SeasonLabel || "—",
      gamesTracked: trackedGames(row),
    }));
  }, [data]);

  if (!data && !error) {
    return <div className="p-4 text-center text-gray-600">Loading football team season records…</div>;
  }

  return (
    <FootballRecordsTablePage
      title="Team Season Records"
      subtitle="Select any record to see the top 20 historical football seasons for that category"
      sectionDefs={TEAM_SEASON_SECTIONS}
      rowsByRecord={rowsByRecord}
      error={error}
      summaryColumns={[
        { header: "Value", emphasize: true, render: (row) => row?.displayValue || "—" },
        { header: "Season", render: (row) => row?.season || "—" },
      ]}
      detailColumns={[
        { header: "Value", emphasize: true, render: (row) => row?.displayValue || "—" },
        { header: "Season", render: (row) => row?.season || "—" },
        {
          header: "Tracked G",
          render: (row) =>
            row?._placeholder ? "—" : Number.isFinite(Number(row?.gamesTracked)) ? String(row.gamesTracked) : "—",
        },
      ]}
      footnote="Win-loss and scoring records use the complete season archive. Team stat totals and rate categories come from seasons with tracked MaxPreps football game logs."
    />
  );
}
