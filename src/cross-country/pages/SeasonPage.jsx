import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { recordTableStyles } from "../../girls/basketball/pages/recordTableStyles";
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
import { athleteProfilePath } from "../../athletes/archiveEra";

const tableFrameClassName =
  "overflow-x-auto rounded-lg border border-gray-200 bg-white shadow";
const tableClassName = "min-w-full bg-white text-sm text-center";
const tableHeadClassName =
  "bg-gray-100 text-xs uppercase tracking-wide text-gray-700";

function tableRowClassName(index) {
  return `border-t border-gray-200 ${
    index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
  } hover:bg-gray-100`;
}

function formatRosterGrade(grade) {
  if (grade === null || grade === undefined || grade === "") return "—";

  const value = Number(grade);
  if (Number.isFinite(value)) {
    if (value === 8) return "8th";
    if (value === 9) return "Fr.";
    if (value === 10) return "So.";
    if (value === 11) return "Jr.";
    if (value === 12) return "Sr.";
    return String(grade);
  }

  const normalized = String(grade).trim().toLowerCase();
  if (normalized === "freshman") return "Fr.";
  if (normalized === "sophomore") return "So.";
  if (normalized === "junior") return "Jr.";
  if (normalized === "senior") return "Sr.";

  return String(grade);
}

function buildExplicitRosterRows(season, playerMap = new Map()) {
  return (Array.isArray(season?.Roster) ? season.Roster : [])
    .map((entry, index) => {
      const playerId = entry?.PlayerID || null;
      const athleteName = resolveCrossCountryAthleteName(
        { PlayerID: entry?.PlayerID, AthleteName: entry?.Name || entry?.AthleteName },
        playerMap
      );

      return {
        key: `roster-${index}-${playerId || entry?.Name || entry?.AthleteName || "row"}`,
        athleteName,
        path: playerId ? athleteProfilePath(playerId, "cross-country") : "",
        grade: formatRosterGrade(entry?.Grade),
      };
    })
    .filter((entry) => entry.athleteName);
}

function formatBadgeText(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildSeasonBriefItems(season) {
  if (!season) return [];

  return [
    { label: "Class", value: season.Classification },
    { label: "State Meet", value: season.StateMeetStart ? formatCrossCountryDate(season.StateMeetStart) : "" },
    { label: "Status", value: formatBadgeText(season.StatusBadge) },
  ].filter((item) => item.value);
}

function RosterTableBlock({ rows }) {
  return (
    <div className={tableFrameClassName}>
      <table className={tableClassName}>
        <thead className={tableHeadClassName}>
          <tr>
            <th className={`${recordTableStyles.headerCell} text-left`}>
              Athlete
            </th>
            <th className={`${recordTableStyles.headerCell} whitespace-nowrap`}>
              Grade
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className={tableRowClassName(index)}>
              <td
                className={`${recordTableStyles.bodyCell} text-left text-gray-900`}
              >
                {row.path ? (
                  <Link
                    to={row.path}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    {row.athleteName}
                  </Link>
                ) : (
                  row.athleteName
                )}
              </td>
              <td className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>
                {row.grade}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AthleteNameLink({ row, playerMap }) {
  const athleteName = resolveCrossCountryAthleteName(row, playerMap);
  const playerId = row?.PlayerID || row?.playerId;

  if (!playerId) return athleteName;

  return (
    <Link
      to={athleteProfilePath(playerId, "cross-country")}
      className="font-semibold text-blue-700 hover:text-blue-900"
    >
      {athleteName}
    </Link>
  );
}

function RosterTable({ rows }) {
  const splitIndex = Math.ceil(rows.length / 2);
  const firstColumnRows = rows.slice(0, splitIndex);
  const secondColumnRows = rows.slice(splitIndex);

  if (rows.length <= 1) {
    return <RosterTableBlock rows={rows} />;
  }

  return (
    <>
      <div className="lg:hidden">
        <RosterTableBlock rows={rows} />
      </div>
      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        <RosterTableBlock rows={firstColumnRows} />
        <RosterTableBlock rows={secondColumnRows} />
      </div>
    </>
  );
}

function SeasonRecapSection({ season }) {
  const paragraphs = Array.isArray(season?.RecapParagraphs)
    ? season.RecapParagraphs
    : Array.isArray(season?.HistoricalSummary)
      ? season.HistoricalSummary
      : [];
  const briefItems = buildSeasonBriefItems(season);

  if (!paragraphs.length && !season?.StatusNote) return null;

  return (
    <section id="season-recap" className="mx-auto max-w-4xl space-y-3">
      <h2 className="text-2xl font-semibold">Season Recap</h2>
      <div className="flow-root text-base leading-7 text-slate-700">
        {briefItems.length ? (
          <dl className="mb-4 grid grid-cols-3 gap-3 text-center md:float-right md:mb-3 md:ml-6 md:w-64 md:grid-cols-1">
            {briefItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-gray-200 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {item.label}
                </dt>
                <dd className="text-lg font-semibold text-gray-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="space-y-3">
          {paragraphs.length ? (
            paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          ) : (
            <p>{season.StatusNote}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function SeasonImagesSection({ images = [] }) {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [images]);

  if (!images.length) {
    return (
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
    );
  }

  const selectedImage = images[imageIndex] || images[0];
  const selectedCaption = String(selectedImage?.caption || "").trim();
  const currentImageNumber = Math.min(imageIndex + 1, images.length);
  const goPrev = () => setImageIndex((index) => (index - 1 + images.length) % images.length);
  const goNext = () => setImageIndex((index) => (index + 1) % images.length);

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold mt-2 mb-2">Season Images</h2>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="relative bg-gray-50">
          <img
            src={selectedImage.src}
            alt={selectedImage.alt || ""}
            className="w-full max-h-[620px] object-contain"
            loading="lazy"
          />

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow hover:bg-white"
                aria-label="Previous image"
                title="Previous"
              >
                {"<"}
              </button>

              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow hover:bg-white"
                aria-label="Next image"
                title="Next"
              >
                {">"}
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-xs text-white">
                {currentImageNumber} / {images.length}
              </div>
            </>
          ) : null}
        </div>

        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-900">{selectedCaption}</p>
            <p className="text-xs text-gray-500">
              Image {currentImageNumber} of {images.length}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7">
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setImageIndex(index)}
                className={`aspect-square overflow-hidden rounded-md border bg-gray-50 ${
                  index === imageIndex
                    ? "border-gray-900 ring-2 ring-gray-900"
                    : "border-gray-200 hover:border-gray-500"
                }`}
                aria-label={`Go to image ${index + 1}`}
                title={image.caption || image.alt || `Image ${index + 1}`}
              >
                <img
                  src={image.src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MeetRecapBlock({ meet }) {
  const paragraphs = Array.isArray(meet?.RecapParagraphs)
    ? meet.RecapParagraphs.filter(Boolean)
    : [];
  const hasContent = meet?.Notes || paragraphs.length || meet?.SourceUrl;

  if (!hasContent) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600">
      {meet?.Notes ? (
        <p className="m-0 font-semibold text-slate-900">{meet.Notes}</p>
      ) : null}
      {paragraphs.length ? (
        <div className={`${meet?.Notes ? "mt-2" : ""} space-y-2`}>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="m-0">
              {paragraph}
            </p>
          ))}
        </div>
      ) : !meet?.Notes ? (
        <p className="m-0">Meet details loaded from MileSplit.</p>
      ) : null}
      {meet?.SourceUrl ? (
        <div className="mt-2">
          <MeetSourceLink meet={meet} />
        </div>
      ) : null}
    </div>
  );
}

function RelayResultsTable({ results = [] }) {
  const relayResults = Array.isArray(results) ? results.filter(Boolean) : [];

  if (!relayResults.length) return null;

  return (
    <div className={tableFrameClassName}>
      <table className={`${tableClassName} min-w-[760px]`}>
        <thead className={tableHeadClassName}>
          <tr>
            <th className={recordTableStyles.headerCell}>Gender</th>
            <th className={recordTableStyles.headerCell}>Race</th>
            <th className={recordTableStyles.headerCell}>Team</th>
            <th className={recordTableStyles.headerCell}>Place</th>
            <th className={recordTableStyles.headerCell}>Time</th>
            <th className={`${recordTableStyles.headerCell} text-left`}>
              Runners
            </th>
          </tr>
        </thead>
        <tbody>
          {relayResults.map((result, index) => (
            <tr
              key={`${result?.Gender || "relay"}-${result?.Team || index}`}
              className={tableRowClassName(index)}
            >
              <td className={recordTableStyles.detailCell}>
                {result.Gender || "—"}
              </td>
              <td className={recordTableStyles.detailCell}>
                {result.Race || "—"}
              </td>
              <td className={recordTableStyles.detailCell}>
                {result.Team || "—"}
              </td>
              <td className={recordTableStyles.detailCell}>
                {result.Place || "—"}
              </td>
              <td className={recordTableStyles.detailCell}>
                {result.Time || "—"}
              </td>
              <td className={`${recordTableStyles.detailCell} text-left`}>
                {Array.isArray(result.Runners)
                  ? result.Runners.join(" | ")
                  : result.Runners || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TeamResultsTable({ results = [] }) {
  const teamResults = Array.isArray(results) ? results.filter(Boolean) : [];

  if (!teamResults.length) return null;

  return (
    <div className={tableFrameClassName}>
      <table className={`${tableClassName} min-w-[620px]`}>
        <thead className={tableHeadClassName}>
          <tr>
            <th className={recordTableStyles.headerCell}>Gender</th>
            <th className={recordTableStyles.headerCell}>Place</th>
            <th className={recordTableStyles.headerCell}>Team</th>
            <th className={recordTableStyles.headerCell}>Points</th>
            <th className={`${recordTableStyles.headerCell} text-left`}>Note</th>
          </tr>
        </thead>
        <tbody>
          {teamResults.map((result, index) => (
            <tr
              key={`${result?.Gender || "team"}-${result?.Team || index}`}
              className={tableRowClassName(index)}
            >
              <td className={recordTableStyles.detailCell}>
                {result.Gender || "—"}
              </td>
              <td className={recordTableStyles.detailCell}>
                {result.Place || "—"}
              </td>
              <td className={recordTableStyles.detailCell}>
                {result.Team || "—"}
              </td>
              <td className={recordTableStyles.detailCell}>
                {result.Points || "—"}
              </td>
              <td className={`${recordTableStyles.detailCell} text-left`}>
                {result.Note || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
    <div className={tableFrameClassName}>
      <table className={`${tableClassName} min-w-[760px]`}>
        <thead className={tableHeadClassName}>
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
                <tr
                  key={`${row.StatID || row.Event}-${index}`}
                  className={tableRowClassName(index)}
                >
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
                    <AthleteNameLink row={row} playerMap={playerMap} />
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

  const explicitRosterRows = useMemo(
    () => buildExplicitRosterRows(season, playerMap),
    [playerMap, season]
  );

  const seasonImages = useMemo(
    () => (Array.isArray(season?.Images) ? season.Images : []),
    [season]
  );

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

      <SeasonRecapSection season={season} />

      <SeasonImagesSection images={seasonImages} />

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold mt-2 mb-2">Roster</h2>
        {explicitRosterRows.length ? (
          <RosterTable rows={explicitRosterRows} />
        ) : rosterSections.length ? (
          <div className="space-y-5">
            {rosterSections.map((section) => (
              <div key={`${section.key}-roster`} className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {section.label}
                </h3>
                <div className={tableFrameClassName}>
                  <table className={`${tableClassName} min-w-[640px]`}>
                    <thead className={tableHeadClassName}>
                      <tr>
                        <th className={`${recordTableStyles.headerCell} text-left`}>
                          Athlete
                        </th>
                        <th className={`${recordTableStyles.headerCell} text-left`}>
                          Distances
                        </th>
                        <th className={`${recordTableStyles.headerCell} text-left`}>
                          Race Labels
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.roster.map((entry, idx) => (
                        <tr
                          key={`${section.key}-${entry.athleteName}`}
                          className={tableRowClassName(idx)}
                        >
                          <td
                            className={`${recordTableStyles.bodyCell} text-left align-top text-gray-900`}
                          >
                            <AthleteNameLink row={entry} playerMap={playerMap} />
                          </td>
                          <td
                            className={`${recordTableStyles.bodyCell} text-left align-top text-gray-700`}
                          >
                            {entry.events.join(" | ")}
                          </td>
                          <td
                            className={`${recordTableStyles.bodyCell} text-left align-top text-gray-700`}
                          >
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
                <div className={tableFrameClassName}>
                  <table className={`${tableClassName} min-w-[760px]`}>
                    <thead className={tableHeadClassName}>
                      <tr>
                        <th className={recordTableStyles.headerCell}>Date</th>
                        <th className={recordTableStyles.headerCell}>Meet</th>
                        <th className={recordTableStyles.headerCell}>Location</th>
                        <th className={recordTableStyles.headerCell}>Level</th>
                        <th className={recordTableStyles.headerCell}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.meets.map((meet, idx) => {
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
                              className={`${tableRowClassName(idx)} cursor-pointer`}
                            >
                              <td
                                className={`${recordTableStyles.bodyCell} whitespace-nowrap`}
                              >
                                {formatCrossCountryDate(meet.Date)}
                              </td>
                              <td
                                className={`${recordTableStyles.bodyCell} font-semibold text-blue-700`}
                              >
                                {meet.Name}
                              </td>
                              <td className={recordTableStyles.bodyCell}>
                                {meet.Location || "TBD"}
                              </td>
                              <td className={recordTableStyles.bodyCell}>
                                {meet.Level || "—"}
                              </td>
                              <td className={recordTableStyles.bodyCell}>
                                {meet.Status || "—"}
                              </td>
                            </tr>

                            {isExpanded ? (
                              <tr>
                                <td className="border p-0" colSpan={5}>
                                  <div className="space-y-4 px-4 py-4 sm:px-5">
                                    <MeetRecapBlock meet={meet} />
                                    <TeamResultsTable results={meet.TeamResults} />
                                    <RelayResultsTable results={meet.RelayResults} />
                                    {meetRows.length ||
                                    !Array.isArray(meet.RelayResults) ||
                                    !meet.RelayResults.length ? (
                                      <MeetResultsTable
                                        rows={meetRows}
                                        playerMap={playerMap}
                                        meet={meet}
                                      />
                                    ) : null}
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
