import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import { INDIVIDUAL_SEASON_SECTIONS } from "../footballRecordConfigs";
import { buildLeaderboardMap, trackedGames, usePreparedFootballRecordsData } from "../footballRecordsData";

import FootballRecordsTablePage, { renderPlayerColumn } from "./FootballRecordsTablePage";

function renderSeasonLink(row) {
  const label = row?.season || "—";
  if (row?._placeholder || !row?.seasonId) return label;

  return (
    <Link to={`/athletics/football/seasons/${row.seasonId}`} className="text-blue-700 hover:underline">
      {label}
    </Link>
  );
}

export default function SeasonRecords() {
  const { data, error } = usePreparedFootballRecordsData();

  const rowsByRecord = useMemo(() => {
    if (!data) return {};

    return buildLeaderboardMap(data.playerSeasons, INDIVIDUAL_SEASON_SECTIONS, (row) => ({
      sortKey: `${String(row?.SeasonID || "")}-${String(row?.PlayerName || "")}`,
      playerId: row?.PlayerID || "",
      playerName: row?.PlayerName || "—",
      seasonId: row?.SeasonID || "",
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
        { header: "Season", render: renderSeasonLink },
      ]}
      detailColumns={[
        { header: "Player", render: renderPlayerColumn },
        { header: "Value", emphasize: true, render: (row) => row?.displayValue || "—" },
        { header: "Season", render: renderSeasonLink },
        {
          header: "Tracked G",
          render: (row) =>
            row?._placeholder ? "—" : Number.isFinite(Number(row?.gamesTracked)) ? String(row.gamesTracked) : "—",
        },
      ]}
      footnote="Season records use available MaxPreps football game logs and newspaper season-total adjustments. Adjustment rows override matching season totals when preserved newspaper totals are available."
    />
  );
}
