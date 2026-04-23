import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { recordTableStyles } from "../../track/pages/recordTableStyles";
import {
  buildSwimPlayerMap,
  buildSwimRoster,
  buildSwimSeasonList,
  formatSwimDate,
  getSwimSeasonLabel,
  resolveSwimAthleteName,
  sortSwimResults,
} from "../swimmingPageUtils";

const LEVEL_ORDER = {
  Varsity: 0,
  "Middle School": 1,
};

function MeetResultsTable({ rows, playerMap }) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
        Results for this meet will appear here when they are added.
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
            <th className={recordTableStyles.headerCell}>Swimmer / Relay</th>
            <th className={recordTableStyles.headerCell}>Time</th>
            <th className={recordTableStyles.headerCell}>Place</th>
            <th className={recordTableStyles.headerCell}>Points</th>
            <th className={recordTableStyles.headerCell}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.StatID || row.Event}-${index}`}>
              <td className={recordTableStyles.detailCell}>{row.Gender || "—"}</td>
              <td className={recordTableStyles.detailCell}>{row.Event || "—"}</td>
              <td className={recordTableStyles.detailCell}>
                {resolveSwimAthleteName(row, playerMap)}
              </td>
              <td className={recordTableStyles.detailCell}>{row.Mark || "—"}</td>
              <td className={recordTableStyles.detailCell}>{row.Place || "—"}</td>
              <td className={recordTableStyles.detailCell}>
                {row.Points ?? "—"}
              </td>
              <td className={recordTableStyles.detailCell}>{row.Status || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MeetRecapCard({ meet }) {
  const title = String(meet?.RecapTitle || "").trim();
  const paragraphs = Array.isArray(meet?.RecapParagraphs)
    ? meet.RecapParagraphs.map((paragraph) => String(paragraph || "").trim()).filter(Boolean)
    : [];

  if (!title && !paragraphs.length) {
    return null;
  }

  return (
    <section className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-left shadow-sm">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Meet Recap
      </p>
      {title ? (
        <h3 className="mt-2 text-lg font-semibold text-slate-900">{title}</h3>
      ) : null}
      <div className="mt-3 space-y-3">
        {paragraphs.map((paragraph, index) => (
          <p key={`${meet?.MeetID || "meet"}-recap-${index}`} className="text-sm leading-7 text-slate-700">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
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

  const playerMap = useMemo(() => buildSwimPlayerMap(players), [players]);
  const seasonList = useMemo(() => buildSwimSeasonList(seasons, meets), [meets, seasons]);

  const season = useMemo(() => {
    return (
      seasonList.find((entry) => Number(entry.SeasonID) === Number(seasonId)) || null
    );
  }, [seasonId, seasonList]);

  const seasonMeets = useMemo(() => {
    return meets
      .filter((meet) => Number(meet.Season) === Number(seasonId))
      .slice()
      .sort((a, b) => {
        const dateDiff = String(a.Date || "").localeCompare(String(b.Date || ""));
        if (dateDiff !== 0) return dateDiff;

        const levelDiff =
          (LEVEL_ORDER[a.Level] ?? 99) - (LEVEL_ORDER[b.Level] ?? 99);
        if (levelDiff !== 0) return levelDiff;

        return String(a.Name || "").localeCompare(String(b.Name || ""));
      });
  }, [meets, seasonId]);

  const seasonMeetIds = useMemo(
    () => new Set(seasonMeets.map((meet) => meet.MeetID)),
    [seasonMeets]
  );

  const seasonEntries = useMemo(() => {
    return playerMeetStats.filter((entry) => seasonMeetIds.has(entry.MeetID));
  }, [playerMeetStats, seasonMeetIds]);

  const roster = useMemo(
    () => buildSwimRoster(seasonEntries, playerMap),
    [playerMap, seasonEntries]
  );

  const resultsByMeetId = useMemo(() => {
    const map = new Map();

    seasonMeets.forEach((meet) => {
      const meetRows = seasonEntries.filter((entry) => entry.MeetID === meet.MeetID);
      map.set(meet.MeetID, sortSwimResults(meetRows, playerMap));
    });

    return map;
  }, [playerMap, seasonEntries, seasonMeets]);

  const seasonLabel = getSwimSeasonLabel(season || seasonId);

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
            That swim season is not available yet. You can go back to the season
            list and choose one of the loaded years.
          </p>
          <Link
            to="/athletics/swimming/yearly-results"
            className="mt-5 inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Swim Seasons
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

      <h1 className="text-3xl font-bold text-center mb-0">{seasonLabel} Season</h1>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold mt-2 mb-2">Season Images</h2>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
          <div className="mx-auto max-w-2xl">
            <p className="text-base font-semibold text-gray-900">Season images coming soon</p>
            <p className="mt-2 text-sm text-gray-600">
              This section is reserved for season photos and other archive images.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold mt-2 mb-2">Swimmers &amp; Events</h2>
        {roster.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border text-xs sm:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Swimmer</th>
                  <th className="border px-3 py-2 text-left">Events</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((entry, idx) => (
                  <tr
                    key={entry.athleteName}
                    className={idx % 2 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border px-3 py-2 align-top font-semibold text-gray-900">
                      {entry.athleteName}
                    </td>
                    <td className="border px-3 py-2 align-top text-gray-700">
                      {entry.events.join(" | ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
            Swimmer cards will appear here once a season roster is added.
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold mt-2 mb-2">Schedule &amp; Results</h2>
        <p className="text-sm text-gray-600">
          Click any meet to open the St. Andrew&apos;s results from that event.
        </p>

        {seasonMeets.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border text-xs sm:text-sm text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Meet</th>
                  <th className="border px-2 py-1">Location</th>
                </tr>
              </thead>
              <tbody>
                {seasonMeets.map((meet, idx) => {
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
                          {formatSwimDate(meet.Date)}
                        </td>
                        <td className="border px-2 py-2 font-semibold text-blue-700">
                          {meet.Name}
                        </td>
                        <td className="border px-2 py-2">{meet.Location || "TBD"}</td>
                      </tr>

                      {isExpanded ? (
                        <tr>
                          <td className="border p-0" colSpan={3}>
                            <div className="space-y-4 px-4 py-4 sm:px-5">
                              <MeetRecapCard meet={meet} />
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
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
            No meets are attached to this season yet.
          </div>
        )}
      </section>
    </div>
  );
}
