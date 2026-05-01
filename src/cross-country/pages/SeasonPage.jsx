import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { recordTableStyles } from "./recordTableStyles";
import {
  CROSS_COUNTRY_DIVISIONS,
  buildCrossCountryPlayerMap,
  buildCrossCountryRoster,
  buildCrossCountrySeasonList,
  cleanCrossCountryRaceLabel,
  formatCrossCountryDate,
  getCrossCountryDivision,
  getCrossCountrySeasonLabel,
  resolveCrossCountryAthleteName,
  sortCrossCountryResults,
} from "../crossCountryPageUtils";

function MeetResultsTable({ rows, playerMap, meet }) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
        <p className="m-0 font-semibold text-gray-900">
          No St. Andrew&apos;s result rows are visible for this meet.
        </p>
        {meet?.Notes ? <p className="mx-auto mt-2 max-w-2xl">{meet.Notes}</p> : null}
      </div>
    );
  }

  const resultSections = CROSS_COUNTRY_DIVISIONS.map((division) => ({
    ...division,
    rows: rows.filter(
      (row) => getCrossCountryDivision(row, meet) === division.key
    ),
  })).filter((section) => section.rows.length > 0);

  return (
    <div className="overflow-x-auto">
      <table className={recordTableStyles.innerTable}>
        <thead className="bg-gray-100">
          <tr>
            <th className={recordTableStyles.headerCell}>Gender</th>
            <th className={recordTableStyles.headerCell}>Distance</th>
            <th className={recordTableStyles.headerCell}>Race</th>
            <th className={recordTableStyles.headerCell}>Athlete</th>
            <th className={recordTableStyles.headerCell}>Time</th>
            <th className={recordTableStyles.headerCell}>Place</th>
            <th className={recordTableStyles.headerCell}>Status</th>
          </tr>
        </thead>
        <tbody>
          {resultSections.map((section) => (
            <React.Fragment key={`${meet?.MeetID || "meet"}-${section.key}`}>
              <tr className="border-t bg-blue-50">
                <td className={recordTableStyles.sectionCell} colSpan={7}>
                  {section.label} Results
                </td>
              </tr>
              {section.rows.map((row, index) => (
                <tr key={`${row.StatID || row.Event}-${index}`}>
                  <td className={recordTableStyles.detailCell}>
                    {row.Gender || "—"}
                  </td>
                  <td className={recordTableStyles.detailCell}>
                    {row.Event || "—"}
                  </td>
                  <td className={recordTableStyles.detailCell}>
                    {cleanCrossCountryRaceLabel(row.Race)}
                  </td>
                  <td className={recordTableStyles.detailCell}>
                    {resolveCrossCountryAthleteName(row, playerMap)}
                  </td>
                  <td className={recordTableStyles.detailCell}>{row.Mark || "—"}</td>
                  <td className={recordTableStyles.detailCell}>
                    {row.Place || "—"}
                  </td>
                  <td className={recordTableStyles.detailCell}>
                    {row.Status || "—"}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MeetSourceLink({ meet }) {
  if (!meet?.SourceUrl) return null;

  return (
    <a
      href={meet.SourceUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex text-sm font-semibold text-blue-700 no-underline hover:underline"
    >
      View MileSplit source
    </a>
  );
}

export default function SeasonPage({
  seasons = [],
  meets = [],
  playerMeetStats = [],
  players = [],
  status = "",
}) {
  const { seasonId } = useParams();
  const [expandedMeetId, setExpandedMeetId] = useState(null);

  const playerMap = useMemo(() => buildCrossCountryPlayerMap(players), [players]);
  const seasonList = useMemo(
    () => buildCrossCountrySeasonList(seasons, meets),
    [meets, seasons]
  );

  const season = useMemo(() => {
    return (
      seasonList.find((entry) => Number(entry.SeasonID) === Number(seasonId)) ||
      null
    );
  }, [seasonId, seasonList]);

  const seasonMeets = useMemo(() => {
    return meets
      .filter((meet) => Number(meet.Season) === Number(seasonId))
      .slice()
      .sort((a, b) => String(a.Date || "").localeCompare(String(b.Date || "")));
  }, [meets, seasonId]);

  const seasonMeetIds = useMemo(
    () => new Set(seasonMeets.map((meet) => meet.MeetID)),
    [seasonMeets]
  );

  const meetMap = useMemo(
    () => new Map(seasonMeets.map((meet) => [Number(meet.MeetID), meet])),
    [seasonMeets]
  );

  const seasonEntries = useMemo(() => {
    return playerMeetStats.filter((entry) => seasonMeetIds.has(entry.MeetID));
  }, [playerMeetStats, seasonMeetIds]);

  const rosterSections = useMemo(() => {
    return CROSS_COUNTRY_DIVISIONS.map((division) => {
      const entries = seasonEntries.filter((entry) => {
        const meet = meetMap.get(Number(entry.MeetID));
        return getCrossCountryDivision(entry, meet) === division.key;
      });

      return {
        ...division,
        roster: buildCrossCountryRoster(entries, playerMap),
      };
    }).filter((section) => section.roster.length > 0);
  }, [meetMap, playerMap, seasonEntries]);

  const meetSections = useMemo(() => {
    return CROSS_COUNTRY_DIVISIONS.map((division) => ({
      ...division,
      meets: seasonMeets.filter(
        (meet) => getCrossCountryDivision(null, meet) === division.key
      ),
    })).filter((section) => section.meets.length > 0);
  }, [seasonMeets]);

  const resultsByMeetId = useMemo(() => {
    const map = new Map();

    seasonMeets.forEach((meet) => {
      const meetRows = seasonEntries.filter((entry) => entry.MeetID === meet.MeetID);
      map.set(meet.MeetID, sortCrossCountryResults(meetRows, playerMap));
    });

    return map;
  }, [playerMap, seasonEntries, seasonMeets]);

  const seasonLabel = getCrossCountrySeasonLabel(season || seasonId);

  useEffect(() => {
    setExpandedMeetId((current) => {
      if (seasonMeets.some((meet) => meet.MeetID === current)) {
        return current;
      }
      return null;
    });
  }, [seasonMeets]);

  if (!season) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <div className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Season Not Found</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            That cross country season is not available yet. You can go back to the
            season list and choose one of the loaded years.
          </p>
          <Link
            to="/athletics/cross-country/yearly-results"
            className="mt-5 inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Cross Country Seasons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      {status ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <h1 className="text-3xl font-bold text-center mb-0">
        {seasonLabel} Season
      </h1>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold mt-2 mb-2">Season Images</h2>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
          <div className="mx-auto max-w-2xl">
            <p className="text-base font-semibold text-gray-900">
              Season images coming soon
            </p>
            <p className="mt-2 text-sm text-gray-600">
              This section is reserved for season photos and other archive images.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold mt-2 mb-2">Athletes &amp; Races</h2>
        {rosterSections.length ? (
          <div className="space-y-5">
            {rosterSections.map((section) => (
              <div key={`${section.key}-roster`} className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {section.label}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border text-xs sm:text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-3 py-2 text-left">Athlete</th>
                        <th className="border px-3 py-2 text-left">Distances</th>
                        <th className="border px-3 py-2 text-left">Race Labels</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.roster.map((entry, idx) => (
                        <tr
                          key={`${section.key}-${entry.athleteName}`}
                          className={idx % 2 ? "bg-gray-50" : "bg-white"}
                        >
                          <td className="border px-3 py-2 align-top font-semibold text-gray-900">
                            {entry.athleteName}
                          </td>
                          <td className="border px-3 py-2 align-top text-gray-700">
                            {entry.events.join(" | ")}
                          </td>
                          <td className="border px-3 py-2 align-top text-gray-700">
                            {entry.races.slice(0, 5).join(" | ")}
                            {entry.races.length > 5 ? " | ..." : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
            Athlete cards will appear here once a season roster is added.
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold mt-2 mb-2">Schedule &amp; Results</h2>
        <p className="text-sm text-gray-600">
          Click any meet to open the St. Andrew&apos;s results from that event.
        </p>

        {meetSections.length ? (
          <div className="space-y-6">
            {meetSections.map((section) => (
              <div key={`${section.key}-meets`} className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {section.label}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border text-xs sm:text-sm text-center">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1">Date</th>
                        <th className="border px-2 py-1">Meet</th>
                        <th className="border px-2 py-1">Location</th>
                        <th className="border px-2 py-1">Level</th>
                        <th className="border px-2 py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.meets.map((meet, idx) => {
                        const isExpanded = expandedMeetId === meet.MeetID;
                        const meetRows = resultsByMeetId.get(meet.MeetID) || [];
                        const rowBg = idx % 2 ? "bg-gray-50" : "bg-white";

                        return (
                          <React.Fragment key={meet.MeetID}>
                            <tr
                              role="button"
                              tabIndex={0}
                              onClick={() =>
                                setExpandedMeetId((current) =>
                                  current === meet.MeetID ? null : meet.MeetID
                                )
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  setExpandedMeetId((current) =>
                                    current === meet.MeetID ? null : meet.MeetID
                                  );
                                }
                              }}
                              className={`${rowBg} cursor-pointer hover:bg-gray-100`}
                            >
                              <td className="border px-2 py-2 whitespace-nowrap">
                                {formatCrossCountryDate(meet.Date)}
                              </td>
                              <td className="border px-2 py-2 font-semibold text-blue-700">
                                {meet.Name}
                              </td>
                              <td className="border px-2 py-2">
                                {meet.Location || "TBD"}
                              </td>
                              <td className="border px-2 py-2">
                                {meet.Level || "—"}
                              </td>
                              <td className="border px-2 py-2">
                                {meet.Status || "—"}
                              </td>
                            </tr>

                            {isExpanded ? (
                              <tr>
                                <td className="border p-0" colSpan={5}>
                                  <div className="space-y-4 px-4 py-4 sm:px-5">
                                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600">
                                      <p className="m-0">
                                        {meet.Notes ||
                                          "Meet details loaded from MileSplit."}
                                      </p>
                                      <div className="mt-2">
                                        <MeetSourceLink meet={meet} />
                                      </div>
                                    </div>
                                    <MeetResultsTable
                                      rows={meetRows}
                                      playerMap={playerMap}
                                      meet={meet}
                                    />
                                  </div>
                                </td>
                              </tr>
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
            No meets are attached to this season yet.
          </div>
        )}
      </section>
    </div>
  );
}
