import React, { useMemo } from "react";
import { recordTableStyles } from "./recordTableStyles";
import {
  buildTrackPlayerMap,
  formatTrackDate,
  resolveTrackAthleteName,
} from "../trackPageUtils";

const CHAMPIONSHIP_TYPE_ORDER = {
  State: 0,
  Region: 1,
};

const FEATURED_CHAMPION_KEYS = new Set([
  "2014-05-03|200 Meter Dash|26.85|State",
  "2014-05-03|4x100 Meter Relay|53.02|State",
  "2014-05-03|4x400 Meter Relay|4:18.93|State",
]);

function isWinningPlace(place) {
  const value = String(place || "").trim().toLowerCase();
  return value === "1st" || value === "1";
}

function isChampionshipFinal(entry, meet) {
  if (!meet) return false;
  if (meet.MeetType !== "State" && meet.MeetType !== "Region") return false;
  if (meet.Status !== "Complete") return false;
  if (!isWinningPlace(entry?.Place)) return false;

  const round = String(entry?.Round || "").trim().toLowerCase();
  return round === "" || round === "final" || round === "finals";
}

function isFeaturedChampion(row) {
  return FEATURED_CHAMPION_KEYS.has(
    `${row.date || ""}|${row.event || ""}|${row.mark || ""}|${row.championshipType || ""}`
  );
}

function buildChampionshipRows({
  playerMeetStats = [],
  meets = [],
  seasons = [],
  players = [],
}) {
  const playerMap = buildTrackPlayerMap(players);
  const meetMap = new Map((meets || []).map((meet) => [Number(meet.MeetID), meet]));
  const seasonMap = new Map(
    (seasons || []).map((season) => [Number(season.SeasonID), season])
  );

  return (playerMeetStats || [])
    .map((entry) => {
      const meet = meetMap.get(Number(entry.MeetID));
      if (!isChampionshipFinal(entry, meet)) return null;

      const season = seasonMap.get(Number(meet.Season)) || null;
                      const athleteName = resolveTrackAthleteName(entry, playerMap);
                      const championshipYear = String(meet.Date || "").slice(0, 4) || String(meet.Season);
                      const featured = isFeaturedChampion({
                        date: meet.Date || "",
                        event: entry.Event || "",
                        mark: entry.Mark || "",
                        championshipType: meet.MeetType,
                      });

                      return {
                        key: entry.StatID || `${entry.MeetID}-${entry.Event}-${athleteName}`,
        championshipType: meet.MeetType,
        year: championshipYear,
        athleteName,
        gender: entry.Gender || "—",
        event: entry.Event || "—",
        mark: entry.Mark || "—",
        date: meet.Date || "",
        dateLabel: formatTrackDate(meet.Date),
        championshipName: meet.Name || "Unknown Championship",
        classification: season?.Classification || "",
        featured,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const typeDiff =
        (CHAMPIONSHIP_TYPE_ORDER[a.championshipType] ?? 99) -
        (CHAMPIONSHIP_TYPE_ORDER[b.championshipType] ?? 99);
      if (typeDiff !== 0) return typeDiff;

      const dateDiff = String(b.date || "").localeCompare(String(a.date || ""));
      if (dateDiff !== 0) return dateDiff;

      const eventDiff = String(a.event || "").localeCompare(String(b.event || ""));
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

  const stateChampions = useMemo(
    () => championshipRows.filter((row) => row.championshipType === "State"),
    [championshipRows]
  );
  const regionChampions = useMemo(
    () => championshipRows.filter((row) => row.championshipType === "Region"),
    [championshipRows]
  );
  const sections = useMemo(
    () => [
      { title: "State Champions", rows: stateChampions },
      { title: "Region Champions", rows: regionChampions },
    ],
    [regionChampions, stateChampions]
  );

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-6 px-4 max-w-6xl mx-auto">
      {status ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <h1 className="text-2xl font-bold text-center">List of Champions</h1>
      <p className="-mt-1.5 text-center text-sm italic text-gray-600">
        State champions are listed first, followed by region champions, with one
        winning result per line
      </p>
      <p className="-mt-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
        Highlighted rows mark the verified 2014 state-title entries that replaced older legacy coach records
      </p>

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className={recordTableStyles.headerCell}>Year</th>
              <th className={recordTableStyles.headerCell}>Athlete</th>
              <th className={recordTableStyles.headerCell}>Event</th>
              <th className={recordTableStyles.headerCell}>Mark</th>
              <th className={recordTableStyles.headerCell}>Date</th>
              <th className={recordTableStyles.headerCell}>Championship</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="border-t bg-blue-50">
                  <td className={recordTableStyles.sectionCell} colSpan={6}>
                    {section.title}
                  </td>
                </tr>

                {section.rows.length ? (
                  section.rows.map((row) => (
                    <tr
                      key={row.key}
                      className={
                        row.featured
                          ? "border-t bg-amber-50 hover:bg-amber-100"
                          : "border-t bg-white hover:bg-gray-50"
                      }
                    >
                      <td className={`${recordTableStyles.bodyCell} text-center font-semibold`}>
                        {row.year || "—"}
                      </td>
                      <td className={recordTableStyles.bodyCell}>
                        <div className={recordTableStyles.playerWrap}>
                          <span
                            className={`${recordTableStyles.playerText} ${
                              row.featured ? "font-semibold text-amber-900" : ""
                            }`}
                          >
                            {row.athleteName}
                          </span>
                        </div>
                      </td>
                      <td className={`${recordTableStyles.bodyCell} text-center text-blue-900 font-semibold`}>
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
                          {row.featured ? (
                            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-center text-[0.68em] font-bold uppercase tracking-[0.08em] text-amber-900">
                              Verified 2014 title
                            </span>
                          ) : null}
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
                        No championship winners are loaded in this section yet.
                      </span>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
