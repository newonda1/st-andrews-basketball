import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  formatSoccerDate,
  getPlayerName,
  getSoccerSeasonLabel,
  hydrateRosterPlayers,
  soccerGamePath,
  sortSoccerGames,
} from "../soccerData";

function formatScore(game) {
  if (game.TeamScore == null || game.OpponentScore == null) return "-";
  return `${game.TeamScore}-${game.OpponentScore}`;
}

function formatLocation(game) {
  return game.LocationType || game.Location || game.Site || "Unknown";
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
  return [
    { label: "Record", value: season.OverallRecord },
    { label: "Coach", value: season.HeadCoach },
    { label: "Finish", value: season.StateFinish || season.RegionFinish },
  ].filter((item) => item.value);
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

  if (!images.length) return null;

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
            alt={selectedImage.alt || `${seasonLabel} girls soccer season image`}
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
            <th className={`${tableHeaderCellClassName} text-left`}>Player</th>
            <th className={`${tableHeaderCellClassName} whitespace-nowrap`}>Grade</th>
            <th className={`${tableHeaderCellClassName} text-left`}>Pos.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className={tableRowClassName(index)}>
              <td className={`${tableBodyCellClassName} text-left font-semibold text-gray-900`}>
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
    Shutouts: 0,
  };

  games.filter(filterFn).forEach((game) => {
    let appeared = false;
    let hadSaves = false;

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
        hadSaves = true;
      });

    if (appeared) totals.GamesPlayedSet.add(Number(game.GameID));
    if (hadSaves && Number(game.OpponentScore) === 0) totals.Shutouts += 1;
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
    const rosterIds = new Set(rosterEntries.map((entry) => Number(entry.PlayerID)));
    const allPlayerIds = [
      ...rosterEntries.map((entry) => Number(entry.PlayerID)),
      ...[...calculatedTotals.keys()].filter((playerId) => !rosterIds.has(playerId)),
    ];

    return allPlayerIds
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
          Shutouts:
            official.Shutouts != null
              ? official.Shutouts + safeNumber(postAdjustmentStats?.Shutouts)
              : adjustment.Shutouts ?? null,
          GAA: official.GAA ?? adjustment.GAA ?? null,
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
  }, [adjustmentByPlayerId, calculatedTotals, rosterById, rosterEntries]);

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
    return getPlayerName(rosterById.get(Number(playerId)));
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
  const rosterTableRows = rosterEntries.map((entry, index) => ({
    key: entry.PlayerID || `${getPlayerName(entry)}-${index}`,
    name: getPlayerName(entry),
    grade: formatRosterGrade(entry.GradeLabel || entry.Grade),
    positions: Array.isArray(entry.Positions) ? entry.Positions : [],
    path: entry.PlayerID ? `/athletics/girls/soccer/players/${entry.PlayerID}` : "",
  }));

  if (!season && !status) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <section className="border border-gray-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Season Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            That girls soccer season is not available yet.
          </p>
          <Link
            to="/athletics/girls/soccer/yearly-results"
            className="mt-5 inline-flex bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Girls Soccer Seasons
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
          {games.map((game) => {
            const logoPath = opponentLogoPath(game);

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
                        {game.Tournament ? (
                          <p className="mt-0.5 text-xs leading-tight text-gray-500">
                            {game.Tournament}
                          </p>
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
          })}
        </div>

        <div className={`${tableFrameClassName} hidden sm:block`}>
          <table className="min-w-full bg-white text-sm">
            <thead className={tableHeadClassName}>
              <tr>
                <th className="border px-3 py-2 text-left">Date</th>
                <th className="border px-3 py-2 text-left">Opponent</th>
                <th className="border px-3 py-2">Location</th>
                <th className="border px-3 py-2">Result</th>
                <th className="border px-3 py-2">Score</th>
                <th className="border px-3 py-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {games.length ? (
                games.map((game, index) => {
                  const logoPath = opponentLogoPath(game);

                  return (
                    <tr key={game.GameID} className={tableRowClassName(index)}>
                      <td className="border px-3 py-2">{formatSoccerDate(game)}</td>
                      <td className="border px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden">
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
                            {game.Tournament ? (
                              <div className="mt-0.5 text-xs leading-tight text-gray-500">
                                {game.Tournament}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="border px-3 py-2 text-center">{formatLocation(game)}</td>
                      <td
                        className={`border px-3 py-2 text-center font-bold ${resultClassName(
                          game.Result
                        )}`}
                      >
                        {game.Result || "-"}
                      </td>
                      <td className="border px-3 py-2 text-center">{formatScore(game)}</td>
                      <td className="border px-3 py-2 text-center">
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
                    <th className="sticky left-0 z-10 border bg-gray-100 px-2 py-1 text-left">
                      Player
                    </th>
                    <th className="border px-2 py-1">#</th>
                    <th className="border px-2 py-1">GP</th>
                    <th className="border px-2 py-1">G</th>
                    <th className="border px-2 py-1">A</th>
                    <th className="border px-2 py-1">Pts</th>
                    <th className="border px-2 py-1">Saves</th>
                    <th className="border px-2 py-1">SO</th>
                    <th className="border px-2 py-1">GAA</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonTotals.map((player, index) => (
                    <tr key={player.PlayerID} className={tableRowClassName(index)}>
                      <td className="sticky left-0 z-10 border bg-inherit px-2 py-1 text-left">
                        <Link
                          to={`/athletics/girls/soccer/players/${player.PlayerID}`}
                          className="text-blue-700 underline hover:text-blue-900"
                        >
                          {playerName(player.PlayerID)}
                        </Link>
                      </td>
                      <td className="border px-2 py-1">{rosterJerseyNumber(player.PlayerID)}</td>
                      <td className="border px-2 py-1">
                        {formatStatValue(player.GamesPlayed)}
                        {player.HasAdjustment ? <span className="ml-0.5 text-blue-700">*</span> : null}
                      </td>
                      <td className="border px-2 py-1">{formatStatValue(player.Goals)}</td>
                      <td className="border px-2 py-1">{formatStatValue(player.Assists)}</td>
                      <td className="border px-2 py-1">{formatStatValue(player.Points)}</td>
                      <td className="border px-2 py-1">{formatStatValue(player.Saves)}</td>
                      <td className="border px-2 py-1">{formatStatValue(player.Shutouts)}</td>
                      <td className="border px-2 py-1">{player.GAA ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td className="sticky left-0 z-10 border bg-gray-100 px-2 py-1 text-left">
                      Team totals
                    </td>
                    <td className="border px-2 py-1">-</td>
                    <td className="border px-2 py-1">{teamTotals.GamesPlayed}</td>
                    <td className="border px-2 py-1">{formatStatValue(teamTotals.Goals)}</td>
                    <td className="border px-2 py-1">{formatStatValue(teamTotals.Assists)}</td>
                    <td className="border px-2 py-1">{formatStatValue(teamTotals.Points)}</td>
                    <td className="border px-2 py-1">{formatStatValue(teamTotals.Saves)}</td>
                    <td className="border px-2 py-1">-</td>
                    <td className="border px-2 py-1">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="mt-2 text-center text-xs leading-relaxed text-gray-600">
              Soccer totals reflect recovered newspaper briefs and official published leader adjustments marked with *.
              The Colleton Prep scoring line accounts for eight of St. Andrew&apos;s nine goals.
            </p>
          </>
        ) : (
          <p className="text-gray-600">No player statistics are available for this season yet.</p>
        )}
      </section>
    </div>
  );
}
