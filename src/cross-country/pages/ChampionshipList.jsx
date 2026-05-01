import React, { useMemo } from "react";
import { recordTableStyles } from "./recordTableStyles";
import {
  buildCrossCountryPlayerMap,
  cleanCrossCountryRaceLabel,
  formatCrossCountryDate,
  getCrossCountryDivision,
  parseCrossCountryPlace,
  resolveCrossCountryAthleteName,
} from "../crossCountryPageUtils";

function isChampionshipFinal(entry, meet) {
  if (!meet) return false;
  if (meet.MeetType !== "State" && meet.MeetType !== "Region") return false;
  if (meet.Status !== "Complete") return false;
  return parseCrossCountryPlace(entry?.Place) === 1;
}

function buildChampionshipRows({
  playerMeetStats = [],
  meets = [],
  seasons = [],
  players = [],
}) {
  const playerMap = buildCrossCountryPlayerMap(players);
  const meetMap = new Map((meets || []).map((meet) => [Number(meet.MeetID), meet]));
  const seasonMap = new Map(
    (seasons || []).map((season) => [Number(season.SeasonID), season])
  );

  return (playerMeetStats || [])
    .map((entry) => {
      const meet = meetMap.get(Number(entry.MeetID));
      if (!isChampionshipFinal(entry, meet)) return null;

      const season = seasonMap.get(Number(meet.Season)) || null;
      const athleteName = resolveCrossCountryAthleteName(entry, playerMap);
      const championshipYear =
        String(meet.Date || "").slice(0, 4) || String(meet.Season);

      return {
        key: entry.StatID || `${entry.MeetID}-${entry.Event}-${athleteName}`,
        division: getCrossCountryDivision(entry, meet),
        championshipType: meet.MeetType,
        year: championshipYear,
        athleteName,
        gender: entry.Gender || "—",
        event: entry.Event || "—",
        race: cleanCrossCountryRaceLabel(entry.Race),
        mark: entry.Mark || "—",
        date: meet.Date || "",
        dateLabel: formatCrossCountryDate(meet.Date),
        championshipName: meet.Name || "Unknown Championship",
        classification: season?.Classification || "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const dateDiff = String(a.date || "").localeCompare(String(b.date || ""));
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

  const highSchoolStateChampions = useMemo(
    () =>
      championshipRows.filter(
        (row) =>
          row.division === "high-school" && row.championshipType === "State"
      ),
    [championshipRows]
  );
  const highSchoolRegionChampions = useMemo(
    () =>
      championshipRows.filter(
        (row) =>
          row.division === "high-school" && row.championshipType === "Region"
      ),
    [championshipRows]
  );
  const middleSchoolStateChampions = useMemo(
    () =>
      championshipRows.filter(
        (row) =>
          row.division === "middle-school" && row.championshipType === "State"
      ),
    [championshipRows]
  );
  const middleSchoolRegionChampions = useMemo(
    () =>
      championshipRows.filter(
        (row) =>
          row.division === "middle-school" && row.championshipType === "Region"
      ),
    [championshipRows]
  );
  const sections = useMemo(
    () => [
      { title: "High School State Champions", rows: highSchoolStateChampions },
      { title: "High School Region Champions", rows: highSchoolRegionChampions },
      { title: "Middle School State Champions", rows: middleSchoolStateChampions },
      { title: "Middle School Region Champions", rows: middleSchoolRegionChampions },
    ],
    [
      highSchoolRegionChampions,
      highSchoolStateChampions,
      middleSchoolRegionChampions,
      middleSchoolStateChampions,
    ]
  );

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-6 px-4 max-w-6xl mx-auto">
      {status ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <h1 className="text-2xl font-bold text-center">List of Champions</h1>

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className={recordTableStyles.headerCell}>Year</th>
              <th className={recordTableStyles.headerCell}>Athlete</th>
              <th className={recordTableStyles.headerCell}>Race</th>
              <th className={recordTableStyles.headerCell}>Time</th>
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
                    <tr key={row.key} className="border-t bg-white hover:bg-gray-50">
                      <td className={`${recordTableStyles.bodyCell} text-center font-semibold`}>
                        {row.year || "—"}
                      </td>
                      <td className={recordTableStyles.bodyCell}>
                        <div className={recordTableStyles.playerWrap}>
                          <span className={recordTableStyles.playerText}>{row.athleteName}</span>
                        </div>
                      </td>
                      <td className={`${recordTableStyles.bodyCell} text-center text-blue-900 font-semibold`}>
                        {row.race || row.event}
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
