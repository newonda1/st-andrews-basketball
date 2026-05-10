import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  buildGolfPdfPagesLabel,
  formatGolfDate,
  formatGolfPlace,
  getGolfSeasonLabel,
  sortGolfMatches,
  sortGolfTournaments,
} from "../golfPageUtils";

const tableFrameClassName =
  "overflow-x-auto rounded-lg border border-gray-200 bg-white shadow";
const tableClassName = "min-w-full bg-white text-sm text-center";
const tableHeadClassName =
  "bg-gray-100 text-xs uppercase tracking-wide text-gray-700";
const headerCellClassName =
  "border px-3 py-2 font-bold leading-tight whitespace-normal break-words";
const bodyCellClassName =
  "border px-3 py-2 align-middle whitespace-normal break-words leading-tight";
const scheduleHeaderCellClassName = "border px-2 py-2 text-center text-xs whitespace-nowrap";
const scheduleBodyCellClassName = "border px-2 py-1.5 text-center align-middle whitespace-nowrap";
const scheduleOpponentCellClassName = "border px-2 py-1.5 align-middle";

function tableRowClassName(index) {
  return `border-t border-gray-200 ${
    index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
  } hover:bg-gray-100`;
}

const SCISA_LOGO_PATH = "/images/branding/scisa-athletics-footer-logo.png";

function formatBadgeText(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildSeasonBriefItems(season) {
  if (!season) return [];

  return [
    { label: "Classification", value: season.Classification },
    { label: "Archive", value: formatBadgeText(season.ArchiveScope) },
    { label: "Status", value: formatBadgeText(season.StatusBadge) },
  ].filter((item) => item.value);
}

function SummaryCard({ season }) {
  const recapParagraphs = Array.isArray(season.HistoricalSummary)
    ? season.HistoricalSummary
    : [];
  const briefItems = buildSeasonBriefItems(season);

  return (
    <section id="season-recap" className="mx-auto max-w-4xl space-y-3">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Season Recap</h2>
        {season.ArchivePdfUrl ? (
          <a
            href={season.ArchivePdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white no-underline"
          >
            Open Official PDF
          </a>
        ) : null}
      </div>

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
          {recapParagraphs.length ? (
            recapParagraphs.map((paragraph, index) => (
              <p key={`${season.SeasonID}-summary-${index}`}>
                {paragraph}
              </p>
            ))
          ) : (
            <p>
              {season.StatusNote || "State archive summary."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function normalizeSeasonImages(images = []) {
  if (!Array.isArray(images)) return [];

  return images
    .map((image, index) => {
      if (typeof image === "string") {
        return {
          src: image,
          alt: `Golf season image ${index + 1}`,
          caption: "",
        };
      }

      return {
        src: image?.src || "",
        alt: image?.alt || `Golf season image ${index + 1}`,
        caption: image?.caption || "",
      };
    })
    .filter((image) => image.src);
}

function SeasonImagesSection({ images = [], seasonLabel }) {
  const normalizedImages = normalizeSeasonImages(images);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [images]);

  if (!normalizedImages.length) {
    return (
      <section id="season-images" className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Season Images</h2>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <p className="text-base font-semibold text-gray-800">
            Season photo gallery coming soon
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Images from the {seasonLabel} golf season will appear here.
          </p>
        </div>
      </section>
    );
  }

  const selectedImage = normalizedImages[imageIndex] || normalizedImages[0];
  const selectedCaption = String(selectedImage?.caption || "").trim();
  const currentImageNumber = Math.min(imageIndex + 1, normalizedImages.length);
  const goPrev = () =>
    setImageIndex((index) => (index - 1 + normalizedImages.length) % normalizedImages.length);
  const goNext = () =>
    setImageIndex((index) => (index + 1) % normalizedImages.length);

  return (
    <section id="season-images" className="space-y-3">
      <h2 className="text-2xl font-semibold text-slate-900">Season Images</h2>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="relative bg-gray-50">
          <img
            src={selectedImage.src}
            alt={selectedImage.alt || ""}
            className="w-full max-h-[620px] object-contain"
            loading="lazy"
          />

          {normalizedImages.length > 1 ? (
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
                {currentImageNumber} / {normalizedImages.length}
              </div>
            </>
          ) : null}
        </div>

        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-900">{selectedCaption}</p>
            <p className="text-xs text-gray-500">
              Image {currentImageNumber} of {normalizedImages.length}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7">
            {normalizedImages.map((image, index) => (
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

function FinishersTable({ title, finishers = [], compact = false }) {
  if (!finishers.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
                Place
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
                Golfer
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
                School
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {finishers.map((finisher) => (
              <tr
                key={`${title}-${finisher.place}-${finisher.player}-${finisher.score}`}
                className={finisher.isStAndrews ? "bg-blue-50" : "bg-white"}
              >
                <td className="border-b border-slate-200 px-3 py-2 text-center font-semibold text-slate-900">
                  {formatGolfPlace(finisher.place)}
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-slate-900">
                  <div className="font-semibold">{finisher.player}</div>
                  {!compact && finisher.award ? (
                    <div className="mt-1 text-xs text-slate-500">{finisher.award}</div>
                  ) : null}
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                  {finisher.school}
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-center font-semibold text-slate-900">
                  {finisher.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TournamentCard({ tournament }) {
  const metaItems = [
    { label: "Date", value: tournament.Date ? formatGolfDate(tournament.Date) : null },
    { label: "Division", value: tournament.Division || "State Tournament" },
    { label: "Course", value: tournament.Course || null },
    { label: "Location", value: tournament.Location || null },
    {
      label: "Field",
      value: tournament.EntryCount
        ? `${tournament.EntryCount} published scores`
        : null,
    },
  ].filter((item) => item.value);

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{tournament.Name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {metaItems.map((item) => (
              <span
                key={`${tournament.TournamentID}-${item.label}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"
              >
                {item.label}: {item.value}
              </span>
            ))}
          </div>
        </div>
        <a
          href={tournament.SourcePdfUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline"
        >
          {buildGolfPdfPagesLabel(tournament.SourcePdfPages)}
        </a>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-700">{tournament.Summary}</p>

      {tournament.ArchiveNote ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
          {tournament.ArchiveNote}
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        <FinishersTable title="Top Finishers" finishers={tournament.TopFinishers} />
        <FinishersTable
          title="Additional St. Andrew's Finishers"
          finishers={tournament.StAndrewsFinishers}
          compact
        />
      </div>
    </section>
  );
}

function getDivisionResultLabel(division) {
  const scores = Array.isArray(division.TeamScores) ? division.TeamScores : [];
  const stAndrews = scores.find((score) => score.IsStAndrews);

  if (!stAndrews || scores.length < 2) return "Result not listed";

  if (scores.length === 2) {
    const opponent = scores.find((score) => !score.IsStAndrews);
    const won = Number(stAndrews.Score) < Number(opponent.Score);
    return `${won ? "W" : "L"} ${stAndrews.Score}-${opponent.Score}`;
  }

  const sortedScores = scores
    .slice()
    .sort((a, b) => Number(a.Score) - Number(b.Score));
  const place =
    sortedScores.findIndex((score) => score.School === stAndrews.School) + 1;

  return `${formatGolfPlace(place)} of ${scores.length} / ${stAndrews.Score}`;
}

function getPlayerName(player) {
  if (!player) return "";
  if (player.PlayerName) return player.PlayerName;
  return [player.FirstName, player.LastName].filter(Boolean).join(" ");
}

function buildSchoolMap(schools) {
  return new Map(
    (Array.isArray(schools) ? schools : []).map((school) => [
      String(school.SchoolID),
      school,
    ])
  );
}

function getSchoolDisplayName(school, fallback = "") {
  return school?.ShortName || school?.Name || fallback;
}

function getSchoolLogoPath(school) {
  return school?.LogoPath || school?.BracketLogoPath || null;
}

function schoolKey(score) {
  return String(score?.SchoolID || score?.School || "");
}

function getPrimaryDivision(match) {
  const divisions = Array.isArray(match.Divisions) ? match.Divisions : [];
  return divisions[0] || null;
}

function getOpponents(match, schoolById) {
  if (String(match?.MatchType || "").toLowerCase() === "state tournament") {
    return [
      {
        key: `${match.MatchID}-state-tournament`,
        label: match.Opponent || `${match.Season} SCISA State Tournament`,
        logoPath: SCISA_LOGO_PATH,
      },
    ];
  }

  const opponents = [];
  const seen = new Set();

  (Array.isArray(match.Divisions) ? match.Divisions : []).forEach((division) => {
    (Array.isArray(division.TeamScores) ? division.TeamScores : [])
      .filter((score) => !score.IsStAndrews)
      .forEach((score) => {
        const key = schoolKey(score);
        if (seen.has(key)) return;
        seen.add(key);
        opponents.push({
          key,
          score,
          school: schoolById.get(String(score.SchoolID)),
          label: getSchoolDisplayName(
            schoolById.get(String(score.SchoolID)),
            score.School
          ),
        });
      });
  });

  return opponents;
}

function getScheduleResultPieces(match) {
  const divisions = Array.isArray(match.Divisions) ? match.Divisions : [];

  return divisions
    .map((division) => {
      const scores = Array.isArray(division.TeamScores) ? division.TeamScores : [];
      const stAndrews = scores.find((score) => score.IsStAndrews);

      if (!stAndrews || scores.length < 2) {
        return null;
      }

      if (scores.length === 2) {
        const opponent = scores.find((score) => !score.IsStAndrews);
        const won = Number(stAndrews.Score) < Number(opponent.Score);
        return {
          division: division.Division,
          result: won ? "W" : "L",
          score: `${stAndrews.Score}-${opponent.Score}`,
        };
      }

      const sortedScores = scores
        .slice()
        .sort((a, b) => Number(a.Score) - Number(b.Score));
      const place =
        sortedScores.findIndex((score) => schoolKey(score) === schoolKey(stAndrews)) + 1;

      return {
        division: division.Division,
        result: `${formatGolfPlace(stAndrews.Place || place)} of ${
          division.TeamFieldSize || scores.length
        }`,
        score: String(stAndrews.Score),
      };
    })
    .filter(Boolean);
}

function SchoolLogo({ school, fallbackName, logoPath: overrideLogoPath }) {
  const logoPath = overrideLogoPath || getSchoolLogoPath(school);
  const initials = getSchoolDisplayName(school, fallbackName)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden">
      {logoPath ? (
        <img
          src={logoPath}
          alt=""
          className="h-full w-full object-contain"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-[0.6rem] font-bold text-slate-500">
          {initials}
        </span>
      )}
    </div>
  );
}

function MatchCard({ match }) {
  const divisions = Array.isArray(match.Divisions) ? match.Divisions : [];

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            <Link
              to={`/athletics/golf/matches/${match.MatchID}`}
              className="text-blue-700 hover:text-blue-900"
            >
              {match.Name}
            </Link>
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: "Date", value: formatGolfDate(match.Date) },
              { label: "Course", value: match.Course },
              { label: "Location", value: match.Location },
              { label: "Source", value: match.SourceCitation },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <span
                  key={`${match.MatchID}-${item.label}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"
                >
                  {item.label}: {item.value}
                </span>
              ))}
          </div>
        </div>
        <Link
          to={`/athletics/golf/matches/${match.MatchID}`}
          className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline"
        >
          Open Match
        </Link>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-700">{match.Summary}</p>

      {divisions.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {divisions.map((division) => (
            <div
              key={`${match.MatchID}-${division.Division}`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-4"
            >
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                {division.Division}
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {getDivisionResultLabel(division)}
              </p>
              {division.Medalist ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Medalist: {division.Medalist.PlayerName} (
                  {division.Medalist.School}) {division.Medalist.Score}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function firstMeaningfulValue(...values) {
  return values.find(
    (value) => value !== null && value !== undefined && String(value).trim() !== ""
  );
}

function formatRosterGrade(grade) {
  if (grade === null || grade === undefined || grade === "") return "—";

  const numeric = Number(grade);
  if (Number.isFinite(numeric)) {
    if (numeric === 7) return "7th";
    if (numeric === 8) return "8th";
    if (numeric === 9) return "Fr.";
    if (numeric === 10) return "So.";
    if (numeric === 11) return "Jr.";
    if (numeric === 12) return "Sr.";
    return String(grade);
  }

  const normalized = String(grade).trim().toLowerCase();
  if (["freshman", "fr", "fr."].includes(normalized)) return "Fr.";
  if (["sophomore", "so", "so."].includes(normalized)) return "So.";
  if (["junior", "jr", "jr."].includes(normalized)) return "Jr.";
  if (["senior", "sr", "sr."].includes(normalized)) return "Sr.";

  return String(grade);
}

function RosterTableBlock({ rows }) {
  return (
    <div className={tableFrameClassName}>
      <table className={tableClassName}>
        <thead className={tableHeadClassName}>
          <tr>
            <th className={`${headerCellClassName} text-left`}>Name</th>
            <th className={`${headerCellClassName} whitespace-nowrap`}>Grade</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className={tableRowClassName(index)}>
              <td className={`${bodyCellClassName} text-left font-semibold text-gray-900`}>
                {row.path ? (
                  <Link
                    to={row.path}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    {row.name}
                  </Link>
                ) : (
                  row.name
                )}
              </td>
              <td className={`${bodyCellClassName} whitespace-nowrap`}>
                {row.grade}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

function SeasonRoster({ roster, playersById = new Map() }) {
  const players = Array.isArray(roster?.Players) ? roster.Players : [];

  if (!players.length) return null;

  const rows = players.map((rosterPlayer, index) => {
    const masterPlayer = playersById.get(String(rosterPlayer.PlayerID));
    const displayName =
      getPlayerName(masterPlayer) || rosterPlayer.PlayerName || "Unknown";
    const grade = firstMeaningfulValue(
      rosterPlayer.GradeLabel,
      rosterPlayer.Grade,
      masterPlayer?.GradeLabel,
      masterPlayer?.Grade
    );

    return {
      key: rosterPlayer.PlayerID || `${displayName}-${index}`,
      name: displayName,
      path: rosterPlayer.PlayerID
        ? `/athletics/players/${rosterPlayer.PlayerID}`
        : "",
      grade: formatRosterGrade(grade),
    };
  });

  return (
    <section id="season-roster" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Roster</h2>
      </div>

      <RosterTable rows={rows} />

    </section>
  );
}

function SeasonSchedule({ matches, schoolById }) {
  if (!matches.length) return null;

  return (
    <section id="schedule-results" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Schedule &amp; Results</h2>
      </div>

      <div className={tableFrameClassName}>
        <table className="min-w-full bg-white text-sm">
          <thead className={tableHeadClassName}>
            <tr>
              <th className={`${scheduleHeaderCellClassName} text-left`}>Date</th>
              <th className={`${scheduleHeaderCellClassName} text-left`}>Opponent</th>
              <th className={scheduleHeaderCellClassName}>Location</th>
              <th className={scheduleHeaderCellClassName}>Result</th>
              <th className={scheduleHeaderCellClassName}>Score</th>
              <th className={scheduleHeaderCellClassName}>Type</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => {
              const opponents = getOpponents(match, schoolById);
              const resultPieces = getScheduleResultPieces(match);
              const type = match.MatchType || "Regular Season";

              return (
                <tr key={match.MatchID} className={tableRowClassName(index)}>
                  <td className={`${scheduleBodyCellClassName} text-left`}>
                    {formatGolfDate(match.Date)}
                  </td>
                  <td className={scheduleOpponentCellClassName}>
                    <div className="space-y-1.5">
                      {opponents.map(({ key, label, logoPath, score, school }) => (
                        <div key={key || schoolKey(score)} className="flex items-center gap-2">
                          <SchoolLogo
                            school={school}
                            fallbackName={label || score?.School}
                            logoPath={logoPath}
                          />
                          <Link
                            to={`/athletics/golf/matches/${match.MatchID}`}
                            className="min-w-0 text-blue-700 underline hover:text-blue-900"
                          >
                            {label || getSchoolDisplayName(school, score?.School)}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={scheduleBodyCellClassName}>
                    {match.Course || match.Location || "Unknown"}
                  </td>
                  <td className={`${scheduleBodyCellClassName} font-bold text-slate-900`}>
                    <div className="space-y-1">
                      {resultPieces.map((piece) => (
                        <div
                          key={`${match.MatchID}-${piece.division}-result`}
                          className={
                            piece.result === "W"
                              ? "text-green-700"
                              : piece.result === "L"
                                ? "text-red-700"
                                : "text-slate-900"
                          }
                        >
                          {resultPieces.length > 1 ? `${piece.division} ` : ""}
                          {piece.result}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={scheduleBodyCellClassName}>
                    <div className="space-y-1">
                      {resultPieces.map((piece) => (
                        <div key={`${match.MatchID}-${piece.division}-score`}>
                          {resultPieces.length > 1 ? `${piece.division} ` : ""}
                          {piece.score}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={scheduleBodyCellClassName}>{type}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function matchesSeasonRoute(entry, seasonId) {
  const routeValue = String(seasonId || "").trim().toLowerCase();
  if (!routeValue) return false;

  const routeCandidates = [
    entry?.SeasonID,
    entry?.SeasonSlug,
    ...(Array.isArray(entry?.SeasonAliases) ? entry.SeasonAliases : []),
  ]
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value).trim().toLowerCase());

  return routeCandidates.includes(routeValue);
}

export default function SeasonPage({
  seasons = [],
  tournaments = [],
  matches = [],
  seasonRosters = [],
  players = [],
  schools = [],
  status = "",
}) {
  const { seasonId } = useParams();

  const schoolById = useMemo(() => buildSchoolMap(schools), [schools]);

  const playersById = useMemo(() => {
    return new Map(
      (Array.isArray(players) ? players : []).map((player) => [
        String(player.PlayerID),
        player,
      ])
    );
  }, [players]);

  const season = useMemo(() => {
    return (
      seasons.find((entry) => matchesSeasonRoute(entry, seasonId)) || null
    );
  }, [seasonId, seasons]);

  const activeSeasonId = season?.SeasonID || seasonId;

  const seasonTournaments = useMemo(() => {
    return sortGolfTournaments(
      tournaments.filter((entry) => Number(entry.Season) === Number(activeSeasonId))
    );
  }, [activeSeasonId, tournaments]);

  const seasonMatches = useMemo(() => {
    return sortGolfMatches(
      matches.filter((entry) => Number(entry.Season) === Number(activeSeasonId))
    );
  }, [activeSeasonId, matches]);

  const seasonRoster = useMemo(() => {
    return (
      seasonRosters.find(
        (entry) => Number(entry.SeasonID) === Number(activeSeasonId)
      ) || null
    );
  }, [activeSeasonId, seasonRosters]);

  const seasonImages = useMemo(
    () => normalizeSeasonImages(season?.SeasonImages),
    [season]
  );
  const shouldShowSeasonImages =
    seasonImages.length > 0 || Boolean(season?.ShowSeasonImagesPlaceholder);

  if (!season) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <section className="rounded-[1.4rem] border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Season Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            That golf season is not available yet.
          </p>
          <Link
            to="/athletics/golf/yearly-results"
            className="mt-5 inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Golf Seasons
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-2 sm:px-6">
      {status ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          {getGolfSeasonLabel(season)} Season
        </h1>
      </header>

      <SummaryCard season={season} />

      {shouldShowSeasonImages ? (
        <SeasonImagesSection
          images={seasonImages}
          seasonLabel={getGolfSeasonLabel(season)}
        />
      ) : null}

      {seasonRoster ? (
        <SeasonRoster roster={seasonRoster} playersById={playersById} />
      ) : null}

      <SeasonSchedule matches={seasonMatches} schoolById={schoolById} />

      {seasonTournaments.length || !seasonMatches.length ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            State Tournaments
          </h2>

          {seasonTournaments.length ? (
            seasonTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.TournamentID}
                tournament={tournament}
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm text-slate-600">
              This season currently has an archive summary but no cleaned tournament
              table loaded yet.
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
