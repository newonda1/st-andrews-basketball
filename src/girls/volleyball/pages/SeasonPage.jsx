import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { athleteProfilePath } from "../../../athletes/archiveEra";
import { recordTableStyles } from "../../basketball/pages/recordTableStyles";
import {
  VOLLEYBALL_STAT_SECTIONS,
  aggregatePlayerSeasonStatsFromGames,
  aggregateVolleyballSeasonStatRows,
  buildPlayerMap,
  formatDate,
  formatStat,
  getPlayerName,
  getRosterForSeason,
  getSeasonGames,
  getSeasonLabel,
  hydrateRosterPlayers,
} from "../volleyballData";

const INDIVIDUAL_STATS_VIEW_CONFIG = [
  {
    key: "attack-serve",
    label: "Attack & Serve",
    tableTitles: ["Attacking", "Serving"],
  },
  {
    key: "defense-receive",
    label: "Defense & Receive",
    tableTitles: ["Blocking", "Digging", "Serve Receiving"],
  },
  {
    key: "ball-handling",
    label: "Ball Handling",
    tableTitles: ["Ball Handling"],
  },
];

const DERIVED_TOTAL_COLUMNS = new Set([
  "KillsPerSet",
  "KillPct",
  "HittingPct",
  "AcesPerSet",
  "AcePct",
  "ServePct",
  "BlocksPerSet",
  "BlocksPerMatch",
  "DigsPerSet",
  "DigsPerMatch",
  "AssistsPerSet",
  "ReceptionsPerSet",
  "ReceptionsPerMatch",
]);

function hasMeaningfulValue(value) {
  const text = String(value ?? "").trim();
  return text !== "" && text !== "—" && text !== "-" && text.toLowerCase() !== "n/a";
}

function getStatSection(title) {
  return VOLLEYBALL_STAT_SECTIONS.find((entry) => entry.title === title) || null;
}

function hasPlayerStatInSection(row, section) {
  return section.columns.some((column) => {
    if (column.key === "SetsPlayed") return false;
    const value = row[column.key];
    if (value === null || value === undefined || value === "") return false;
    const number = Number(value);
    if (Number.isFinite(number)) return number !== 0;
    return hasMeaningfulValue(value);
  });
}

function getSortValue(row, column, playerMap) {
  if (column.key === "jersey") return Number(row.JerseyNumber || 999);
  if (column.key === "name") {
    const player = playerMap.get(String(row.PlayerID));
    return player ? getPlayerName(player) : row.PlayerName || "";
  }

  const value = row[column.key];
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function sortRowsForSection(rows, section, sortConfig, playerMap) {
  const directionMultiplier = sortConfig.direction === "asc" ? 1 : -1;
  const sortColumn =
    [{ key: "jersey", label: "No." }, { key: "name", label: "Player" }, ...section.columns].find(
      (column) => column.key === sortConfig.key
    ) || { key: "jersey", label: "No." };

  return rows
    .filter((row) => hasPlayerStatInSection(row, section))
    .slice()
    .sort((a, b) => {
      const valueA = getSortValue(a, sortColumn, playerMap);
      const valueB = getSortValue(b, sortColumn, playerMap);

      if (typeof valueA === "string" || typeof valueB === "string") {
        const textDiff = String(valueA || "").localeCompare(String(valueB || ""));
        if (textDiff !== 0) return textDiff * directionMultiplier;
      } else {
        const missingA = valueA === null || valueA === undefined;
        const missingB = valueB === null || valueB === undefined;

        if (missingA !== missingB) return missingA ? 1 : -1;
        if (!missingA && !missingB && valueA !== valueB) {
          return (Number(valueA) - Number(valueB)) * directionMultiplier;
        }
      }

      const jerseyDiff = Number(a.JerseyNumber || 999) - Number(b.JerseyNumber || 999);
      if (jerseyDiff !== 0) return jerseyDiff;

      return String(a.PlayerName || "").localeCompare(String(b.PlayerName || ""));
    });
}

function hasNumericStatValue(row, key) {
  const value = row?.[key];
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

function hasSourceValueForTotal(row, key) {
  if (key === "TotalBlocks") {
    return (
      hasNumericStatValue(row, "TotalBlocks") ||
      hasNumericStatValue(row, "SoloBlocks") ||
      hasNumericStatValue(row, "BlockAssists")
    );
  }

  return hasNumericStatValue(row, key);
}

function shouldShowTotalValue(rows, totals, column) {
  if (!totals || column.key === "jersey" || column.key === "name") return false;
  const value = totals[column.key];
  if (value === null || value === undefined || value === "") return false;

  if (DERIVED_TOTAL_COLUMNS.has(column.key)) return true;
  return rows.some((row) => hasSourceValueForTotal(row, column.key));
}

function StatsTable({ title, rows, playerMap }) {
  const section = getStatSection(title);
  const [sortConfig, setSortConfig] = useState({ key: "jersey", direction: "asc" });
  if (!section) return null;

  const columns = [
    { key: "jersey", label: "No." },
    { key: "name", label: "Player" },
    ...section.columns,
  ];
  const displayRows = sortRowsForSection(rows, section, sortConfig, playerMap);
  const totals =
    displayRows.length > 0
      ? aggregateVolleyballSeasonStatRows(displayRows, { PlayerName: "Season Totals" })
      : null;
  const hasTotals =
    totals &&
    columns.some((column) => shouldShowTotalValue(displayRows, totals, column));

  const updateSort = (column) => {
    setSortConfig((current) => {
      if (current.key === column.key) {
        return {
          key: column.key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key: column.key,
        direction: column.key === "name" || column.key === "jersey" ? "asc" : "desc",
      };
    });
  };

  const renderCell = (row, column) => {
    if (column.key === "jersey") return row.JerseyNumber || "—";

    if (column.key === "name") {
      const player = playerMap.get(String(row.PlayerID));
      const playerName = player ? getPlayerName(player) : row.PlayerName || "—";

      return (
        <Link
          to={athleteProfilePath(row.PlayerID, "volleyball")}
          className="text-blue-600 hover:underline"
        >
          {playerName}
        </Link>
      );
    }

    return formatStat(row[column.key], column);
  };

  const renderTotalCell = (column) => {
    if (column.key === "jersey") return "";
    if (column.key === "name") return totals?.PlayerName || "Season Totals";
    if (!shouldShowTotalValue(displayRows, totals, column)) return "—";
    return formatStat(totals[column.key], column);
  };

  return (
    <div className="space-y-3">
      <h4 className="mb-3 text-lg font-semibold">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={`${title}-${column.key}`}
                  className={`px-2 py-2 text-center text-xs whitespace-nowrap ${
                    column.key === "name" ? "md:text-left" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => updateSort(column)}
                    className={`inline-flex items-center gap-1 font-semibold hover:text-blue-900 ${
                      column.key === "name" ? "justify-start" : "justify-center"
                    }`}
                    aria-label={`Sort ${title} by ${column.label}`}
                  >
                    <span>{column.label}</span>
                    {sortConfig.key === column.key ? (
                      <span aria-hidden="true">{sortConfig.direction === "asc" ? "^" : "v"}</span>
                    ) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="border-t border-gray-200 px-3 py-4 text-center text-slate-600"
                >
                  No MaxPreps player stats are available for this category.
                </td>
              </tr>
            ) : (
              displayRows.map((row, index) => (
                <tr
                  key={`${title}-${row.PlayerID || row.PlayerName || index}`}
                  className={`border-t border-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                  } hover:bg-gray-100`}
                >
                  {columns.map((column) => (
                    <td
                      key={`${title}-${row.PlayerID || row.PlayerName || index}-${column.key}`}
                      className={`px-2 py-1.5 text-center whitespace-nowrap ${
                        column.key === "name" ? "md:text-left" : ""
                      }`}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {hasTotals ? (
            <tfoot className="border-t-2 border-gray-300 bg-blue-50 font-semibold text-blue-950">
              <tr>
                {columns.map((column) => (
                  <td
                    key={`${title}-totals-${column.key}`}
                    className={`px-2 py-2 text-center whitespace-nowrap ${
                      column.key === "name" ? "md:text-left" : ""
                    }`}
                  >
                    {renderTotalCell(column)}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
}

function splitParagraphs(text) {
  if (Array.isArray(text)) {
    return text.map((paragraph) => String(paragraph || "").trim()).filter(Boolean);
  }

  return String(text || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function formatSeasonRecord(season) {
  if (season?.OverallWins == null || season?.OverallLosses == null) return "";
  const wins = Number(season.OverallWins);
  const losses = Number(season.OverallLosses);
  const ties = Number(season.OverallTies || 0);
  if (!Number.isFinite(wins) || !Number.isFinite(losses)) return "";
  return ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
}

function buildSeasonBriefItems(season) {
  if (!season) return [];

  return [
    { label: "Record", value: formatSeasonRecord(season) },
    { label: "Coach", value: season.HeadCoach || "" },
    { label: "Result", value: season.StateFinish || season.RegionFinish || "" },
  ].filter((item) => item.value);
}

function SeasonRecapSection({ recap, briefItems = [] }) {
  const paragraphs = splitParagraphs(recap);
  if (!paragraphs.length) return null;

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
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeasonImagesSection({ images = [], seasonLabel }) {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [images]);

  if (!images.length) {
    return (
      <section id="season-images" className="space-y-3">
        <h2 className="text-2xl font-semibold">Season Images</h2>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <p className="text-base font-semibold text-gray-800">Season photo gallery coming soon</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Images from the {seasonLabel} volleyball season will appear here.
          </p>
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
    <section id="season-images" className="space-y-3">
      <h2 className="text-2xl font-semibold">Season Images</h2>

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
                <img src={image.src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatGrade(grade) {
  if (grade === null || grade === undefined || grade === "") return "—";
  const value = Number(grade);
  if (!Number.isFinite(value)) return String(grade);
  if (value === 8) return "8th";
  if (value === 9) return "Fr.";
  if (value === 10) return "So.";
  if (value === 11) return "Jr.";
  if (value === 12) return "Sr.";
  return String(grade);
}

function RosterTableBlock({ rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full bg-white text-sm text-center">
        <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
          <tr>
            <th className={`${recordTableStyles.headerCell} whitespace-nowrap`}>No.</th>
            <th className={`${recordTableStyles.headerCell} text-left`}>Player</th>
            <th className={`${recordTableStyles.headerCell} whitespace-nowrap`}>Grade</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr
                key={row.key}
                className={`border-t border-gray-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                } hover:bg-gray-100`}
              >
                <td className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>
                  {row.jersey || "—"}
                </td>
                <td className={`${recordTableStyles.bodyCell} text-left`}>
                  {row.path ? (
                    <Link to={row.path} className="text-blue-600 hover:underline">
                      {row.name}
                    </Link>
                  ) : (
                    <span>{row.name}</span>
                  )}
                </td>
                <td className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>
                  {formatGrade(row.grade)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={`${recordTableStyles.bodyCell} text-center text-slate-600`} colSpan={3}>
                No roster data is available for this season yet.
              </td>
            </tr>
          )}
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

function buildSchoolMap(schools = []) {
  return new Map(
    (Array.isArray(schools) ? schools : [])
      .filter((school) => school?.SchoolID)
      .map((school) => [String(school.SchoolID), school])
  );
}

function getOpponentSchool(game, schoolMap) {
  if (!game?.OpponentID) return null;
  return schoolMap.get(String(game.OpponentID)) || null;
}

function getOpponentDisplayName(game, schoolMap) {
  const school = getOpponentSchool(game, schoolMap);
  return school?.Name || school?.ShortName || game?.Opponent || "Unknown";
}

function getOpponentLogoPath(game, schoolMap) {
  const school = getOpponentSchool(game, schoolMap);
  return school?.LogoPath || school?.BracketLogoPath || null;
}

function enrichPlayerStatsWithRoster(rows, roster, playerMap) {
  const rosterByPlayerId = new Map(
    roster.map((entry) => [String(entry.PlayerID), entry])
  );

  return rows.map((row) => {
    const player = playerMap.get(String(row.PlayerID));
    const rosterEntry = rosterByPlayerId.get(String(row.PlayerID));

    return {
      ...row,
      JerseyNumber: row.JerseyNumber ?? rosterEntry?.JerseyNumber ?? player?.JerseyNumber ?? null,
      PlayerName: player ? getPlayerName(player) : rosterEntry?.PlayerName || row.PlayerName,
    };
  });
}

export default function SeasonPage({ data, status = "" }) {
  const { seasonId } = useParams();
  const resolvedSeasonId = Number(seasonId);
  const [selectedStatsView, setSelectedStatsView] = useState(
    INDIVIDUAL_STATS_VIEW_CONFIG[0].key
  );

  const playerMap = useMemo(() => buildPlayerMap(data.players), [data.players]);
  const schoolMap = useMemo(() => buildSchoolMap(data.schools), [data.schools]);
  const season = useMemo(
    () => data.seasons.find((entry) => Number(entry.SeasonID) === resolvedSeasonId) || null,
    [data.seasons, resolvedSeasonId]
  );
  const seasonLabel = useMemo(() => {
    if (season) return getSeasonLabel(season);
    if (Number.isFinite(resolvedSeasonId)) return `${resolvedSeasonId}`;
    return "Volleyball";
  }, [resolvedSeasonId, season]);
  const seasonGames = useMemo(
    () => getSeasonGames(data.games, resolvedSeasonId),
    [data.games, resolvedSeasonId]
  );
  const rosterEntry = useMemo(
    () => getRosterForSeason(data.rosters, resolvedSeasonId),
    [data.rosters, resolvedSeasonId]
  );
  const roster = useMemo(
    () => hydrateRosterPlayers(rosterEntry, playerMap),
    [playerMap, rosterEntry]
  );
  const coachingStaff = useMemo(() => {
    const rosterStaff = Array.isArray(rosterEntry?.Staff) ? rosterEntry.Staff : [];
    if (rosterStaff.length > 0) return rosterStaff;

    const staff = [];
    if (season?.HeadCoach) staff.push({ Name: season.HeadCoach, Position: "Head Coach" });

    const assistantCoaches = Array.isArray(season?.AssistantCoaches)
      ? season.AssistantCoaches
      : [];
    assistantCoaches.forEach((name) => {
      if (name) staff.push({ Name: name, Position: "Assistant Coach" });
    });

    return staff;
  }, [rosterEntry, season]);
  const rosterTableRows = useMemo(() => {
    const playerRows = roster.map((player) => {
      const canonicalPlayer = playerMap.get(String(player.PlayerID));
      const playerName = canonicalPlayer
        ? getPlayerName(canonicalPlayer)
        : player.PlayerName || getPlayerName(player);

      return {
        key: `player-${player.PlayerID}`,
        jersey: player.JerseyNumber,
        name: playerName,
        grade: player.GradeLabel || player.Grade,
        path: athleteProfilePath(player.PlayerID, "volleyball"),
      };
    });

    const staffRows = coachingStaff
      .filter((member) => member?.Name || member?.Position)
      .map((member, index) => ({
        key: `staff-${member.Name || index}-${member.Position || ""}`,
        jersey: "",
        name: member.Name || "—",
        grade: member.Position || "Staff",
        path: "",
      }));

    return [...playerRows, ...staffRows];
  }, [coachingStaff, playerMap, roster]);
  const playerStats = useMemo(
    () => {
      const rows = aggregatePlayerSeasonStatsFromGames(
        data.playerGameStats,
        resolvedSeasonId,
        data.playerSeasonAdjustments
      );

      return enrichPlayerStatsWithRoster(rows, roster, playerMap);
    },
    [data.playerGameStats, data.playerSeasonAdjustments, playerMap, resolvedSeasonId, roster]
  );

  const individualStatsViews = useMemo(
    () =>
      INDIVIDUAL_STATS_VIEW_CONFIG.map((view) => ({
        ...view,
        tables: view.tableTitles.map(getStatSection).filter(Boolean),
      })).filter((view) => view.tables.length > 0),
    []
  );

  useEffect(() => {
    if (individualStatsViews.length === 0) return;
    if (individualStatsViews.some((view) => view.key === selectedStatsView)) return;
    setSelectedStatsView(individualStatsViews[0].key);
  }, [individualStatsViews, selectedStatsView]);

  const activeStatsView = useMemo(
    () =>
      individualStatsViews.find((view) => view.key === selectedStatsView) ||
      individualStatsViews[0] ||
      null,
    [individualStatsViews, selectedStatsView]
  );

  const missingSeasonStatus =
    !status && !season && seasonGames.length === 0
      ? `No volleyball data is available for the ${seasonLabel} season.`
      : "";
  const seasonRecap = season?.SeasonRecapParagraphs || season?.SeasonRecap || "";
  const seasonBriefItems = useMemo(() => buildSeasonBriefItems(season), [season]);
  const seasonImages = Array.isArray(season?.SeasonImages) ? season.SeasonImages : [];
  const shouldShowSeasonImages =
    seasonImages.length > 0 || Boolean(season?.ShowSeasonImagesPlaceholder);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-10 pt-2 lg:pb-40">
      {status ? <div className="text-center text-slate-600">{status}</div> : null}
      {missingSeasonStatus ? (
        <div className="text-center text-slate-600">{missingSeasonStatus}</div>
      ) : null}

      <section className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{seasonLabel} Season</h1>
      </section>

      {splitParagraphs(seasonRecap).length ? (
        <SeasonRecapSection recap={seasonRecap} briefItems={seasonBriefItems} />
      ) : null}

      {shouldShowSeasonImages ? (
        <SeasonImagesSection images={seasonImages} seasonLabel={seasonLabel} />
      ) : null}

      <section id="roster" className="space-y-4">
        <h2 className="text-2xl font-semibold">Roster</h2>
        <RosterTable rows={rosterTableRows} />
      </section>

      <section id="schedule-results" className="space-y-4">
        <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-xs text-gray-700 uppercase tracking-wide">
              <tr>
                <th className="px-2 py-2 text-left text-xs whitespace-nowrap">Date</th>
                <th className="px-2 py-2 pl-10 text-left text-xs whitespace-nowrap">Opponent</th>
                <th className="px-2 py-2 text-center text-xs whitespace-nowrap">Location</th>
                <th className="px-2 py-2 text-center text-xs whitespace-nowrap">Result</th>
                <th className="px-2 py-2 text-center text-xs whitespace-nowrap">Score</th>
                <th className="px-2 py-2 text-center text-xs whitespace-nowrap">Type</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {seasonGames.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-slate-600">
                    No schedule data is available for this season yet.
                  </td>
                </tr>
              ) : (
                seasonGames.map((game, index) => {
                  const opponentName = getOpponentDisplayName(game, schoolMap);
                  const logoPath = getOpponentLogoPath(game, schoolMap);

                  return (
                    <tr
                      key={game.GameID}
                      className={`border-t border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-2 py-1.5 text-left align-middle whitespace-nowrap">
                        {game.DisplayDate || formatDate(game.Date)}
                      </td>
                      <td className="px-2 py-1.5 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden">
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
                            ) : null}
                          </span>
                          <Link
                            to={`/athletics/volleyball/games/${game.GameID}`}
                            className="text-blue-600 hover:underline"
                          >
                            {opponentName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-center align-middle whitespace-nowrap">
                        {game.LocationType || "—"}
                      </td>
                      <td
                        className={`px-2 py-1.5 text-center align-middle font-semibold whitespace-nowrap ${
                          game.Result === "W"
                            ? "text-emerald-700"
                            : game.Result === "L"
                              ? "text-rose-700"
                              : ""
                        }`}
                      >
                        {game.Result || "—"}
                      </td>
                      <td className="px-2 py-1.5 text-center align-middle whitespace-nowrap">
                        {game.TeamScore != null && game.OpponentScore != null
                          ? `${game.TeamScore}-${game.OpponentScore}`
                          : "—"}
                      </td>
                      <td className="px-2 py-1.5 text-center align-middle whitespace-nowrap">
                        {game.GameType || "Regular Season"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="individual-stats" className="space-y-6">
        <h2 className="text-2xl font-semibold">Individual Stats</h2>

        {individualStatsViews.length === 0 ? (
          <p className="text-slate-600">
            No MaxPreps individual stat tables are available for this season.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-3">
              {individualStatsViews.map((view) => {
                const isActive = selectedStatsView === view.key;
                return (
                  <button
                    key={view.key}
                    type="button"
                    onClick={() => setSelectedStatsView(view.key)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                      isActive
                        ? "border-blue-900 bg-blue-900 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {view.label}
                  </button>
                );
              })}
            </div>

            {activeStatsView ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {activeStatsView.label} Statistics
                </h3>
                <div className="space-y-6">
                  {activeStatsView.tables.map((table) => (
                    <StatsTable
                      key={`${resolvedSeasonId}-${table.title}`}
                      title={table.title}
                      rows={playerStats}
                      playerMap={playerMap}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
