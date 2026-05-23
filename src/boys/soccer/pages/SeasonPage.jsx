import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PlayerHeadshot from "../../../components/PlayerHeadshot";

import {
  formatSoccerDate,
  getPlayerName,
  getSoccerSeasonLabel,
  hydrateRosterPlayers,
  soccerGamePath,
  sortSoccerGames,
} from "../soccerData";
import { athleteProfilePath } from "../../../athletes/archiveEra";

function formatScore(game) {
  if (game.TeamScore == null || game.OpponentScore == null) return "-";
  const penaltySuffix =
    game.PenaltyKicks &&
    game.TeamPenaltyScore != null &&
    game.OpponentPenaltyScore != null
      ? ` (PK ${game.TeamPenaltyScore}-${game.OpponentPenaltyScore})`
      : "";
  if (penaltySuffix) return `${game.TeamScore}-${game.OpponentScore}${penaltySuffix}`;
  return `${game.TeamScore}-${game.OpponentScore}${game.Overtime ? " (OT)" : ""}`;
}

function formatLocation(game) {
  return game.LocationType || game.Location || game.Site || "-";
}

function opponentSubline(game) {
  return game.OpponentSubline || game.Round || "";
}

function resultClassName(result) {
  if (result === "W") return "text-green-700";
  if (result === "L") return "text-red-700";
  return "text-gray-500";
}

const tableFrameClassName =
  "overflow-x-auto rounded-lg border border-gray-200 bg-white shadow";
const tableClassName = "min-w-full bg-white text-sm text-center";
const tableHeadClassName =
  "bg-gray-100 text-xs uppercase tracking-wide text-gray-700";
const tableHeaderCellClassName = "border px-3 py-2 font-bold";
const tableBodyCellClassName = "border px-3 py-2";
const scheduleHeaderCellClassName = "border px-2 py-2 text-center text-xs whitespace-nowrap";
const scheduleOpponentHeaderCellClassName =
  "border px-2 py-2 pl-10 text-left text-xs whitespace-nowrap";
const scheduleBodyCellClassName = "border px-2 py-1.5 text-center align-middle whitespace-nowrap";
const scheduleOpponentCellClassName = "border px-2 py-1.5 align-middle";
const statsHeaderCellClassName = "border px-2 py-2 text-center text-xs whitespace-nowrap";
const statsBodyCellClassName = "border px-2 py-1.5 text-center whitespace-nowrap";
const statsFooterCellClassName = "border px-2 py-2 text-center whitespace-nowrap";

function tableRowClassName(index) {
  return `border-t border-gray-200 ${
    index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
  } hover:bg-gray-100`;
}

function splitParagraphs(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function buildSeasonBriefItems(season) {
  if (!season) return [];
  const includeFinish = Number(season.SeasonID) !== 2005;

  return [
    { label: "Record", value: season.OverallRecord },
    { label: "Coach", value: season.HeadCoach },
    includeFinish ? { label: "Finish", value: season.StateFinish || season.RegionFinish } : null,
  ].filter((item) => item?.value);
}

function SeasonRecapSection({ season }) {
  const paragraphs = splitParagraphs(season?.HistoricalSummary || season?.SeasonRecap);
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
            Photos from the {seasonLabel} boys soccer season will be added here.
          </p>
        </div>
      </section>
    );
  }

  const selectedImage = images[imageIndex] || images[0];
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
            alt={selectedImage.alt || `${seasonLabel} boys soccer season image`}
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
              >
                {"<"}
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow hover:bg-white"
                aria-label="Next image"
              >
                {">"}
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-xs text-white">
                {currentImageNumber} / {images.length}
              </div>
            </>
          ) : null}
        </div>
        {selectedImage.caption ? (
          <div className="border-t border-gray-200 px-4 py-3 text-sm leading-6 text-gray-700">
            {selectedImage.caption}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function formatRosterGrade(grade) {
  if (grade === null || grade === undefined || grade === "") return "—";
  const value = Number(grade);
  if (Number.isFinite(value)) {
    if (value === 7) return "7th";
    if (value === 8) return "8th";
    if (value === 9) return "Fr.";
    if (value === 10) return "So.";
    if (value === 11) return "Jr.";
    if (value === 12) return "Sr.";
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
            <th className={`${tableHeaderCellClassName} whitespace-nowrap`}>No.</th>
            <th className={`${tableHeaderCellClassName} text-left`}>Player</th>
            <th className={`${tableHeaderCellClassName} whitespace-nowrap`}>Grade</th>
            <th className={`${tableHeaderCellClassName} text-left`}>Pos.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className={tableRowClassName(index)}>
              <td className={`${tableBodyCellClassName} whitespace-nowrap`}>
                {row.jersey || "—"}
              </td>
              <td className={`${tableBodyCellClassName} text-left text-gray-900`}>
                {row.path ? (
                  <Link to={row.path} className="text-blue-600 hover:underline">
                    {row.name}
                  </Link>
                ) : (
                  row.name
                )}
              </td>
              <td className={`${tableBodyCellClassName} whitespace-nowrap`}>{row.grade}</td>
              <td className={`${tableBodyCellClassName} text-left`}>
                {row.positions.length ? row.positions.join(", ") : "—"}
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

  if (rows.length <= 1) return <RosterTableBlock rows={rows} />;

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

function buildEmptyPlayerTotal(playerId) {
  return {
    PlayerID: Number(playerId),
    GamesPlayedSet: new Set(),
    Goals: 0,
    Assists: 0,
    Saves: 0,
  };
}

function addPlayerStat(map, row, gameId, field) {
  const playerId = Number(row?.PlayerID);
  if (!Number.isFinite(playerId)) return;

  if (!map.has(playerId)) {
    map.set(playerId, buildEmptyPlayerTotal(playerId));
  }

  const entry = map.get(playerId);
  entry.GamesPlayedSet.add(Number(gameId));
  entry[field] += Number(row?.[field] || 0);
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatStatValue(value) {
  if (value == null || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) return "-";
  return value;
}

function gameIsAfterDate(game, throughDate) {
  const through = String(throughDate || "").trim();
  const date = String(game?.Date || "").trim();
  if (!through || !date) return false;
  return date > through;
}

function calculatePlayerStats(games, playerId, filterFn = () => true) {
  const totals = {
    GamesPlayedSet: new Set(),
    Goals: 0,
    Assists: 0,
    Saves: 0,
  };

  games.filter(filterFn).forEach((game) => {
    let appeared = false;

    (game.GoalScorers || [])
      .filter((row) => Number(row?.PlayerID) === Number(playerId))
      .forEach((row) => {
        totals.Goals += Number(row.Goals || 0);
        appeared = true;
      });
    (game.Assists || [])
      .filter((row) => Number(row?.PlayerID) === Number(playerId))
      .forEach((row) => {
        totals.Assists += Number(row.Assists || 0);
        appeared = true;
      });
    (game.Saves || [])
      .filter((row) => Number(row?.PlayerID) === Number(playerId))
      .forEach((row) => {
        totals.Saves += Number(row.Saves || 0);
        appeared = true;
      });

    if (appeared) totals.GamesPlayedSet.add(Number(game.GameID));
  });

  return totals;
}

export default function SeasonPage({ data, status = "" }) {
  const { seasonId } = useParams();

  const season = useMemo(
    () =>
      (data?.seasons || []).find(
        (entry) => Number(entry.SeasonID) === Number(seasonId)
      ) || null,
    [data, seasonId]
  );

  const games = useMemo(
    () =>
      sortSoccerGames(
        (data?.games || []).filter(
          (game) => Number(game?.SeasonID ?? game?.Season) === Number(seasonId)
        )
      ),
    [data, seasonId]
  );

  const roster = useMemo(
    () =>
      (data?.rosters || []).find(
        (entry) => Number(entry.SeasonID) === Number(seasonId)
      ) || null,
    [data, seasonId]
  );

  const rosterEntries = useMemo(
    () => hydrateRosterPlayers(roster, data?.players || []),
    [data, roster]
  );

  const coachingStaff = useMemo(() => {
    const rosterStaff = Array.isArray(roster?.Staff) ? roster.Staff : [];
    if (rosterStaff.length) return rosterStaff;

    const staff = [];
    const headCoach = roster?.HeadCoach || season?.HeadCoach;
    if (headCoach) staff.push({ Name: headCoach, Position: "Head Coach" });

    const assistantCoaches = Array.isArray(season?.AssistantCoaches)
      ? season.AssistantCoaches
      : [];
    assistantCoaches.forEach((name) => {
      if (name) staff.push({ Name: name, Position: "Assistant Coach" });
    });

    return staff;
  }, [roster, season]);

  const schoolById = useMemo(() => {
    const map = new Map();
    (data?.schools || []).forEach((school) => {
      if (school?.SchoolID) map.set(String(school.SchoolID), school);
    });
    return map;
  }, [data]);

  const rosterById = useMemo(() => {
    const map = new Map();
    rosterEntries.forEach((entry) => map.set(Number(entry.PlayerID), entry));
    return map;
  }, [rosterEntries]);

  const playerById = useMemo(() => {
    const map = new Map();
    (data?.players || []).forEach((player) => map.set(Number(player.PlayerID), player));
    return map;
  }, [data]);

  const calculatedTotals = useMemo(() => {
    const map = new Map();

    games.forEach((game) => {
      (game.GoalScorers || []).forEach((row) =>
        addPlayerStat(map, row, game.GameID, "Goals")
      );
      (game.Assists || []).forEach((row) =>
        addPlayerStat(map, row, game.GameID, "Assists")
      );
      (game.Saves || []).forEach((row) =>
        addPlayerStat(map, row, game.GameID, "Saves")
      );
    });

    return map;
  }, [games]);

  const adjustmentByPlayerId = useMemo(() => {
    const map = new Map();

    (data?.statAdjustments || [])
      .filter((adjustment) => Number(adjustment?.SeasonID) === Number(seasonId))
      .forEach((adjustment) => {
        const playerId = Number(adjustment?.PlayerID);
        if (Number.isFinite(playerId)) map.set(playerId, adjustment);
      });

    return map;
  }, [data, seasonId]);

  const seasonTotals = useMemo(() => {
    const allPlayerIds = [
      ...rosterEntries.map((entry) => Number(entry.PlayerID)),
      ...calculatedTotals.keys(),
      ...adjustmentByPlayerId.keys(),
    ];

    return [...new Set(allPlayerIds)]
      .filter((playerId) => Number.isFinite(playerId))
      .map((playerId) => {
        const calculated = calculatedTotals.get(playerId) || buildEmptyPlayerTotal(playerId);
        const adjustment = adjustmentByPlayerId.get(playerId) || {};
        const official = adjustment.OfficialTotals || {};
        const postAdjustmentStats = adjustment.ThroughDate
          ? calculatePlayerStats(
              games,
              playerId,
              (game) => gameIsAfterDate(game, adjustment.ThroughDate)
            )
          : null;
        const postGamesPlayed = postAdjustmentStats?.GamesPlayedSet.size || 0;
        const adjustedGoals =
          official.Goals != null
            ? official.Goals + safeNumber(postAdjustmentStats?.Goals)
            : calculated.Goals + safeNumber(adjustment.GoalsAdjustment);
        const adjustedAssists =
          official.Assists != null
            ? official.Assists + safeNumber(postAdjustmentStats?.Assists)
            : calculated.Assists + safeNumber(adjustment.AssistsAdjustment);
        const adjustedSaves =
          official.Saves != null
            ? official.Saves + safeNumber(postAdjustmentStats?.Saves)
            : calculated.Saves + safeNumber(adjustment.SavesAdjustment);
        const adjustedGamesPlayed =
          official.GamesPlayed != null
            ? official.GamesPlayed + postGamesPlayed
            : calculated.GamesPlayedSet.size + safeNumber(adjustment.GamesPlayedAdjustment);
        const points =
          official.Points != null
            ? official.Points + safeNumber(postAdjustmentStats?.Goals) * 2 + safeNumber(postAdjustmentStats?.Assists)
            : adjustedGoals * 2 + adjustedAssists;

        return {
          PlayerID: playerId,
          GamesPlayed: adjustedGamesPlayed,
          Goals: adjustedGoals,
          Assists: adjustedAssists,
          Points: points,
          Saves: adjustedSaves,
          HasAdjustment: Boolean(adjustment.PlayerID),
        };
      })
      .sort((a, b) => {
        const rosterA = rosterById.get(Number(a.PlayerID));
        const rosterB = rosterById.get(Number(b.PlayerID));
        const jerseyA = Number(rosterA?.JerseyNumber || 999);
        const jerseyB = Number(rosterB?.JerseyNumber || 999);
        if (jerseyA !== jerseyB) return jerseyA - jerseyB;
        return playerName(a.PlayerID).localeCompare(playerName(b.PlayerID));
      });
  }, [adjustmentByPlayerId, calculatedTotals, games, rosterById, rosterEntries]);

  const teamTotals = useMemo(
    () =>
      seasonTotals.reduce(
        (totals, row) => ({
          GamesPlayed: Math.max(totals.GamesPlayed, Number(row.GamesPlayed || 0)),
          Goals: totals.Goals + Number(row.Goals || 0),
          Assists: totals.Assists + Number(row.Assists || 0),
          Points: totals.Points + Number(row.Points || 0),
          Saves: totals.Saves + Number(row.Saves || 0),
        }),
        { GamesPlayed: games.length, Goals: 0, Assists: 0, Points: 0, Saves: 0 }
      ),
    [games.length, seasonTotals]
  );

  function playerName(playerId) {
    const normalizedPlayerId = Number(playerId);
    return getPlayerName(rosterById.get(normalizedPlayerId) || playerById.get(normalizedPlayerId));
  }

  function rosterJerseyNumber(playerId) {
    return rosterById.get(Number(playerId))?.JerseyNumber || "-";
  }

  function opponentLogoPath(game) {
    const school = schoolById.get(String(game?.OpponentID ?? ""));
    return school?.LogoPath || school?.BracketLogoPath || null;
  }

  const seasonLabel = season ? getSoccerSeasonLabel(season) : `Spring ${seasonId}`;
  const seasonImages = Array.isArray(season?.SeasonImages)
    ? season.SeasonImages
    : Array.isArray(season?.Images)
      ? season.Images
      : [];
  const rosterTableRows = [
    ...rosterEntries.map((entry, index) => ({
      key: entry.PlayerID || `${getPlayerName(entry)}-${index}`,
      jersey: entry.JerseyNumber,
      name: getPlayerName(entry),
      grade: formatRosterGrade(entry.GradeLabel || entry.Grade),
      positions: Array.isArray(entry.Positions) ? entry.Positions : [],
      path: entry.PlayerID ? athleteProfilePath(entry.PlayerID, "boys-soccer") : "",
    })),
    ...coachingStaff
      .filter((member) => member?.Name || member?.name || member?.Position || member?.role)
      .map((member, index) => {
        const name = member.Name || member.name || "—";
        const role = member.Position || member.role || "Staff";
        return {
          key: `staff-${name}-${role}-${index}`,
          jersey: "",
          name,
          grade: role,
          positions: ["Staff"],
          path: "",
        };
      }),
  ];

  if (!season && !status) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <section className="border border-gray-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Season Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            That boys soccer season is not available yet.
          </p>
          <Link
            to="/athletics/boys/soccer/yearly-results"
            className="mt-5 inline-flex bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Boys Soccer Seasons
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-4 pt-2">
      {status ? <div className="text-center text-gray-600">{status}</div> : null}

      <h1 className="mb-2 text-center text-3xl font-bold">{seasonLabel} Season</h1>

      <SeasonRecapSection season={season} />

      <SeasonImagesSection images={seasonImages} seasonLabel={seasonLabel} />

      {rosterTableRows.length ? (
        <section id="season-roster" className="space-y-4">
          <h2 className="text-2xl font-semibold">Roster</h2>
          <RosterTable rows={rosterTableRows} />
        </section>
      ) : null}

      <section id="schedule-results" className="space-y-4">
        <div className="mb-4 mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>
        </div>

        <div className="grid gap-3 sm:hidden">
          {games.length ? (
            games.map((game) => {
              const logoPath = opponentLogoPath(game);
              const subline = opponentSubline(game);

              return (
                <Link
                  key={game.GameID}
                  to={soccerGamePath(game.GameID)}
                  className="block rounded-lg border border-gray-200 bg-white p-4 text-gray-900 no-underline shadow-sm transition hover:border-blue-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-2 text-sm text-gray-600">{formatSoccerDate(game)}</p>
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden">
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
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold leading-snug">
                            {game.Opponent}
                          </h3>
                          {subline ? (
                            <p className="mt-1 text-sm text-gray-500">{subline}</p>
                          ) : null}
                          <p className="mt-2 text-sm text-gray-600">
                            {[formatLocation(game), game.GameType || "Regular Season"]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-lg font-bold ${resultClassName(game.Result)}`}>
                        {game.Result || "-"}
                      </p>
                      <p className="text-sm font-semibold">{formatScore(game)}</p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600 shadow-sm">
              No games are available for this season yet.
            </div>
          )}
        </div>

        <div className={`${tableFrameClassName} hidden sm:block`}>
          <table className="min-w-full bg-white text-sm">
            <thead className={tableHeadClassName}>
              <tr>
                <th className={`${scheduleHeaderCellClassName} text-left`}>Date</th>
                <th className={scheduleOpponentHeaderCellClassName}>Opponent</th>
                <th className={scheduleHeaderCellClassName}>Location</th>
                <th className={scheduleHeaderCellClassName}>Result</th>
                <th className={scheduleHeaderCellClassName}>Score</th>
                <th className={scheduleHeaderCellClassName}>Type</th>
              </tr>
            </thead>
            <tbody>
              {games.length ? (
                games.map((game, index) => {
                  const logoPath = opponentLogoPath(game);
                  const subline = opponentSubline(game);

                  return (
                    <tr key={game.GameID} className={tableRowClassName(index)}>
                      <td className={`${scheduleBodyCellClassName} text-left`}>
                        {formatSoccerDate(game)}
                      </td>
                      <td className={scheduleOpponentCellClassName}>
                        <div className="flex items-center gap-2">
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
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={soccerGamePath(game.GameID)}
                              className="text-blue-700 underline hover:text-blue-900"
                            >
                              {game.Opponent}
                            </Link>
                            {subline ? (
                              <div className="mt-0.5 text-xs text-gray-500">{subline}</div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className={scheduleBodyCellClassName}>{formatLocation(game)}</td>
                      <td
                        className={`${scheduleBodyCellClassName} font-bold ${resultClassName(
                          game.Result
                        )}`}
                      >
                        {game.Result || "-"}
                      </td>
                      <td className={scheduleBodyCellClassName}>{formatScore(game)}</td>
                      <td className={scheduleBodyCellClassName}>
                        {game.GameType || "Regular Season"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="border px-3 py-8 text-center text-gray-600" colSpan={6}>
                    No games are available for this season yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="player-statistics" className="space-y-4">
        <div className="mb-4 mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Player Statistics</h2>
        </div>

        {seasonTotals.length ? (
          <>
            <div className={tableFrameClassName}>
              <table className="min-w-full bg-white text-center text-xs whitespace-nowrap sm:text-sm">
                <thead className={tableHeadClassName}>
                  <tr>
                    <th className="sticky left-0 z-10 border bg-gray-100 px-2 py-2 text-left text-xs whitespace-nowrap">
                      Player
                    </th>
                    <th className={statsHeaderCellClassName}>#</th>
                    <th className={statsHeaderCellClassName}>GP</th>
                    <th className={statsHeaderCellClassName}>G</th>
                    <th className={statsHeaderCellClassName}>A</th>
                    <th className={statsHeaderCellClassName}>Pts</th>
                    <th className={statsHeaderCellClassName}>Saves</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonTotals.map((player, index) => (
                    <tr key={player.PlayerID} className={tableRowClassName(index)}>
                      <td className="sticky left-0 z-10 border bg-inherit px-2 py-1.5 text-left whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <PlayerHeadshot
                            playerId={player.PlayerID}
                            name={playerName(player.PlayerID)}
                            sportKey="boys-soccer"
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                          <Link
                            to={athleteProfilePath(player.PlayerID, "boys-soccer")}
                            className="text-blue-700 underline hover:text-blue-900"
                          >
                            {playerName(player.PlayerID)}
                          </Link>
                        </div>
                      </td>
                      <td className={statsBodyCellClassName}>{rosterJerseyNumber(player.PlayerID)}</td>
                      <td className={statsBodyCellClassName}>
                        {formatStatValue(player.GamesPlayed)}
                        {player.HasAdjustment ? <span className="ml-0.5 text-blue-700">*</span> : null}
                      </td>
                      <td className={statsBodyCellClassName}>{formatStatValue(player.Goals)}</td>
                      <td className={statsBodyCellClassName}>{formatStatValue(player.Assists)}</td>
                      <td className={statsBodyCellClassName}>{formatStatValue(player.Points)}</td>
                      <td className={statsBodyCellClassName}>{formatStatValue(player.Saves)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td className="sticky left-0 z-10 border bg-gray-100 px-2 py-2 text-left whitespace-nowrap">
                      Team totals
                    </td>
                    <td className={statsFooterCellClassName}>-</td>
                    <td className={statsFooterCellClassName}>{teamTotals.GamesPlayed}</td>
                    <td className={statsFooterCellClassName}>{formatStatValue(teamTotals.Goals)}</td>
                    <td className={statsFooterCellClassName}>{formatStatValue(teamTotals.Assists)}</td>
                    <td className={statsFooterCellClassName}>{formatStatValue(teamTotals.Points)}</td>
                    <td className={statsFooterCellClassName}>{formatStatValue(teamTotals.Saves)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="mt-2 text-center text-xs leading-relaxed text-gray-600">
              Soccer totals reflect recovered newspaper briefs and official published leader adjustments marked with *.
            </p>
          </>
        ) : (
          <p className="text-gray-600">No player statistics are available for this season yet.</p>
        )}
      </section>
    </div>
  );
}
