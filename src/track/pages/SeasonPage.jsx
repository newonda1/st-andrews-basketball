import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { recordTableStyles } from "./recordTableStyles";
import {
  buildTrackPlayerMap,
  buildTrackRoster,
  buildTrackSeasonList,
  formatTrackDate,
  formatTrackDateRange,
  getTrackSeasonLabel,
  resolveTrackAthleteName,
  sortTrackResults,
} from "../trackPageUtils";

function SummaryCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 shadow-sm">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
    </article>
  );
}

function MeetStatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const classes = {
    complete: "bg-emerald-100 text-emerald-800",
    scheduled: "bg-blue-100 text-blue-800",
    cancelled: "bg-rose-100 text-rose-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] ${
        classes[normalized] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function SeasonStatusBadge({ status }) {
  const classes = {
    verified: "bg-emerald-100 text-emerald-800",
    scheduled: "bg-blue-100 text-blue-800",
    compiling: "bg-amber-100 text-amber-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] ${
        classes[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status || "active"}
    </span>
  );
}

function MeetResultsTable({ rows, playerMap }) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
        No St. Andrew&apos;s results are loaded for this meet yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={recordTableStyles.innerTable}>
        <thead className="bg-gray-100">
          <tr>
            <th className={recordTableStyles.headerCell}>Gender</th>
            <th className={recordTableStyles.headerCell}>Event</th>
            <th className={recordTableStyles.headerCell}>Athlete / Team</th>
            <th className={recordTableStyles.headerCell}>Mark</th>
            <th className={recordTableStyles.headerCell}>Place</th>
            <th className={recordTableStyles.headerCell}>Round</th>
            <th className={recordTableStyles.headerCell}>Heat</th>
            <th className={recordTableStyles.headerCell}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.StatID || row.Event}-${index}`}>
              <td className={recordTableStyles.detailCell}>{row.Gender || "—"}</td>
              <td className={recordTableStyles.detailCell}>{row.Event || "—"}</td>
              <td className={recordTableStyles.detailCell}>
                {resolveTrackAthleteName(row, playerMap)}
              </td>
              <td className={recordTableStyles.detailCell}>{row.Mark || "—"}</td>
              <td className={recordTableStyles.detailCell}>{row.Place || "—"}</td>
              <td className={recordTableStyles.detailCell}>{row.Round || "—"}</td>
              <td className={recordTableStyles.detailCell}>{row.Heat || "—"}</td>
              <td className={recordTableStyles.detailCell}>{row.Status || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

  const playerMap = useMemo(() => buildTrackPlayerMap(players), [players]);
  const seasonList = useMemo(() => buildTrackSeasonList(seasons, meets), [meets, seasons]);

  const season = useMemo(() => {
    return (
      seasonList.find((entry) => Number(entry.SeasonID) === Number(seasonId)) || null
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

  const seasonEntries = useMemo(() => {
    return playerMeetStats.filter((entry) => seasonMeetIds.has(entry.MeetID));
  }, [playerMeetStats, seasonMeetIds]);

  const roster = useMemo(
    () => buildTrackRoster(seasonEntries, playerMap),
    [playerMap, seasonEntries]
  );

  const resultsByMeetId = useMemo(() => {
    const map = new Map();

    seasonMeets.forEach((meet) => {
      const meetRows = seasonEntries.filter((entry) => entry.MeetID === meet.MeetID);
      map.set(meet.MeetID, sortTrackResults(meetRows, playerMap));
    });

    return map;
  }, [playerMap, seasonEntries, seasonMeets]);

  const completedMeets = useMemo(() => {
    return seasonMeets.filter(
      (meet) => String(meet.Status || "").toLowerCase() === "complete"
    );
  }, [seasonMeets]);

  const firstMeetDate = seasonMeets[0]?.Date || null;
  const lastMeetDate = seasonMeets[seasonMeets.length - 1]?.Date || null;
  const loadedResultsCount = seasonEntries.length;
  const completedResultsCount = seasonEntries.filter(
    (entry) => String(entry.Status) === "Complete"
  ).length;
  const seasonLabel = getTrackSeasonLabel(season || seasonId);

  useEffect(() => {
    setExpandedMeetId((current) => {
      if (seasonMeets.some((meet) => meet.MeetID === current)) {
        return current;
      }
      return seasonMeets[0]?.MeetID ?? null;
    });
  }, [seasonMeets]);

  if (!season) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <div className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Season Not Found</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            That track season is not available yet. You can go back to the season list
            and choose one of the loaded years.
          </p>
          <Link
            to="/athletics/track/yearly-results"
            className="mt-5 inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Track Seasons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {status ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div className="relative overflow-hidden bg-[#012169] px-6 py-8 text-white sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_62%)] md:block" />

          <div className="relative flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
              <span>Track &amp; Field Season</span>
              <SeasonStatusBadge status={season.StatusBadge} />
            </div>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{seasonLabel}</h1>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-blue-50 sm:text-base">
                {season.StatusNote || "Track season archive"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
              <span>{season.Classification || "Track & Field"}</span>
              <span>{season.Region || "St. Andrew's"}</span>
              <span>{formatTrackDateRange(firstMeetDate, lastMeetDate)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-4 sm:px-8 sm:py-8">
          <SummaryCard label="Meets Loaded" value={String(seasonMeets.length)} />
          <SummaryCard label="Completed Meets" value={String(completedMeets.length)} />
          <SummaryCard label="Athletes Listed" value={String(roster.length)} />
          <SummaryCard label="Completed Results" value={String(completedResultsCount)} />
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">Season Recap</h2>
            <Link
              to="/athletics/track/yearly-results"
              className="text-sm font-semibold text-blue-700 hover:underline"
            >
              All Seasons
            </Link>
          </div>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem]">
            {(season.RecapParagraphs || []).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <div className="grid gap-5">
          <article className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Program Details</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div>
                <dt className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Head Coach
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {season.HeadCoach || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Assistant Coach
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {season.AssistantCoach || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Classification
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {season.Classification || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Region
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {season.Region || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Season Range
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {formatTrackDateRange(firstMeetDate, lastMeetDate)}
                </dd>
              </div>
              <div>
                <dt className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Total Loaded Entries
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {loadedResultsCount}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Highlights</h2>
            {Array.isArray(season.HighlightNotes) && season.HighlightNotes.length ? (
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                {season.HighlightNotes.map((note) => (
                  <li key={note} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-600">
                No season highlights have been written yet.
              </p>
            )}
          </article>
        </div>
      </section>

      <section className="mt-10 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
          <h2 className="text-xl font-bold text-slate-900">Athletes and Events</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This list is built from the athletes who appear in the track results
            currently loaded for this season.
          </p>

          {roster.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {roster.map((entry) => (
                <article
                  key={entry.athleteName}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <h3 className="text-base font-semibold text-slate-900">
                    {entry.athleteName}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {entry.events.join(" | ")}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
              No athletes are attached to this season yet.
            </div>
          )}
        </article>

        <article className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
          <h2 className="text-xl font-bold text-slate-900">Meet Archive</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Select a meet to open the full St. Andrew&apos;s results table for that date.
          </p>

          {seasonMeets.length ? (
            <div className="mt-5 overflow-x-auto">
              <table className={recordTableStyles.outerTable}>
                <thead className="bg-gray-200">
                  <tr>
                    <th className={recordTableStyles.headerCell}>Date</th>
                    <th className={recordTableStyles.headerCell}>Meet</th>
                    <th className={recordTableStyles.headerCell}>Location</th>
                    <th className={recordTableStyles.headerCell}>Entries</th>
                    <th className={recordTableStyles.headerCell}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonMeets.map((meet) => {
                    const isExpanded = expandedMeetId === meet.MeetID;
                    const meetRows = resultsByMeetId.get(meet.MeetID) || [];

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
                          className={`cursor-pointer border-t hover:bg-gray-100 ${
                            isExpanded ? "bg-gray-50" : "bg-white"
                          }`}
                        >
                          <td className={recordTableStyles.bodyCell}>
                            {formatTrackDate(meet.Date)}
                          </td>
                          <td className={recordTableStyles.bodyCell}>
                            <div className="space-y-1 text-left">
                              <p className="font-semibold text-slate-900">{meet.Name}</p>
                              {meet.SourceUrl ? (
                                <a
                                  href={meet.SourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-semibold text-blue-700 hover:underline"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  Source Results
                                </a>
                              ) : null}
                            </div>
                          </td>
                          <td className={recordTableStyles.bodyCell}>
                            {meet.Location || "TBD"}
                          </td>
                          <td className={recordTableStyles.bodyCell}>
                            {meetRows.length}
                          </td>
                          <td className={recordTableStyles.bodyCell}>
                            <MeetStatusBadge status={meet.Status} />
                          </td>
                        </tr>

                        {isExpanded ? (
                          <tr>
                            <td className="border p-0" colSpan={5}>
                              <div className="space-y-4 px-4 py-4 sm:px-5">
                                {meet.Notes ? (
                                  <p className="text-left text-sm leading-7 text-slate-600">
                                    {meet.Notes}
                                  </p>
                                ) : null}
                                <MeetResultsTable rows={meetRows} playerMap={playerMap} />
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
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
              No meets have been attached to this season yet.
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
