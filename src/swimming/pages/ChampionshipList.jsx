import React, { useMemo } from "react";
import { recordTableStyles } from "../../track/pages/recordTableStyles";
import {
  buildSwimPlayerMap,
  formatSwimDate,
  getSwimBannerYear,
  resolveSwimAthleteName,
  sortSwimEventNames,
} from "../swimmingPageUtils";

function isWinningPlace(place) {
  const value = String(place || "").trim().toLowerCase();
  return value === "1st" || value === "1";
}

function isStateChampionshipFinal(entry, meet) {
  if (!meet) return false;
  if (meet.MeetType !== "State") return false;
  if (meet.Status !== "Complete") return false;
  if (meet.Level !== "Varsity") return false;
  if (!isWinningPlace(entry?.Place)) return false;

  const round = String(entry?.Round || "").trim().toLowerCase();
  return round === "" || round === "final" || round === "finals";
}

function buildChampionshipRows({
  playerMeetStats = [],
  meets = [],
  seasons = [],
  players = [],
}) {
  const playerMap = buildSwimPlayerMap(players);
  const meetMap = new Map((meets || []).map((meet) => [Number(meet.MeetID), meet]));
  const seasonMap = new Map(
    (seasons || []).map((season) => [Number(season.SeasonID), season])
  );

  return (playerMeetStats || [])
    .map((entry) => {
      const meet = meetMap.get(Number(entry.MeetID));
      if (!isStateChampionshipFinal(entry, meet)) return null;

      const season = seasonMap.get(Number(meet.Season)) || null;
      const athleteName = resolveSwimAthleteName(entry, playerMap);

      return {
        key: entry.StatID || `${entry.MeetID}-${entry.Event}-${athleteName}`,
        bannerYear: getSwimBannerYear(season || meet.Season),
        athleteName,
        gender: entry.Gender || "-",
        event: entry.Event || "-",
        mark: entry.Mark || "-",
        date: meet.Date || "",
        dateLabel: formatSwimDate(meet.Date),
        championshipName: meet.Name || "Unknown Championship",
        classification: season?.Classification || "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const yearDiff = String(a.bannerYear || "").localeCompare(
        String(b.bannerYear || "")
      );
      if (yearDiff !== 0) return yearDiff;

      const eventDiff = sortSwimEventNames(a.event, b.event);
      if (eventDiff !== 0) return eventDiff;

      return String(a.athleteName || "").localeCompare(String(b.athleteName || ""));
    });
}

export default function ChampionshipList({
  seasons = [],
  meets = [],
  playerMeetStats = [],
  players = [],
  status = "",
}) {
  const championshipRows = useMemo(
    () =>
      buildChampionshipRows({
        playerMeetStats,
        meets,
        seasons,
        players,
      }),
    [meets, playerMeetStats, players, seasons]
  );

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-6 px-4 max-w-6xl mx-auto">
      {status ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <h1 className="text-2xl font-bold text-center">State Champions</h1>
      <p className="-mt-1.5 text-center text-sm italic text-gray-600">
        Banner years use the school-year ending year, so fall SCISA titles follow
        their season instead of the meet date.
      </p>

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className={recordTableStyles.headerCell}>Banner Year</th>
              <th className={recordTableStyles.headerCell}>Athlete</th>
              <th className={recordTableStyles.headerCell}>Event</th>
              <th className={recordTableStyles.headerCell}>Mark</th>
              <th className={recordTableStyles.headerCell}>Meet Date</th>
              <th className={recordTableStyles.headerCell}>Championship</th>
            </tr>
          </thead>
          <tbody>
            {championshipRows.length ? (
              championshipRows.map((row) => (
                <tr key={row.key} className="border-t bg-white hover:bg-gray-50">
                  <td className={`${recordTableStyles.bodyCell} text-center font-semibold`}>
                    {row.bannerYear || "-"}
                  </td>
                  <td className={recordTableStyles.bodyCell}>
                    <div className={recordTableStyles.playerWrap}>
                      <span className={recordTableStyles.playerText}>
                        {row.athleteName}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`${recordTableStyles.bodyCell} text-center font-semibold text-blue-900`}
                  >
                    {row.event}
                  </td>
                  <td className={`${recordTableStyles.bodyCell} text-center font-semibold`}>
                    {row.mark}
                  </td>
                  <td className={`${recordTableStyles.bodyCell} text-center`}>
                    {row.dateLabel}
                  </td>
                  <td className={recordTableStyles.bodyCell}>
                    <div className="flex min-w-0 flex-col items-center justify-center gap-1 leading-tight">
                      <span className="text-center font-semibold">
                        {row.championshipName}
                      </span>
                      {row.classification ? (
                        <span className="text-center text-[0.72em] uppercase tracking-[0.08em] text-gray-500">
                          {row.classification}
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t bg-white">
                <td className={recordTableStyles.bodyCell} colSpan={6}>
                  <span className="text-gray-500">
                    No state championship winners are loaded yet.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
