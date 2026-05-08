import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  RegionBracket5GameSVG,
  StateBracket16GameSVG,
} from "../components/GameCardBracketsSVG";
import { recordTableStyles } from "../pages/recordTableStyles";
import {
  BOYS_BASKETBALL_ROSTERS_PATH,
  SCHOOLS_PATH,
  countsAsPlayerGame,
  getRosterEntriesForSeason,
  getRosterJerseyNumber,
  hydrateGamesWithSchools,
} from "../dataUtils";

const STAT_FIELDS = [
  "Minutes",
  "Points",
  "Rebounds",
  "Assists",
  "Turnovers",
  "Steals",
  "Blocks",
  "ThreePM",
  "ThreePA",
  "TwoPM",
  "TwoPA",
  "FTM",
  "FTA",
];

const TOTAL_COLUMNS = [
  "Points",
  "Rebounds",
  "Assists",
  "Turnovers",
  "Steals",
  "Blocks",
  "ThreePM",
  "ThreePA",
  "TwoPM",
  "TwoPA",
  "FTM",
  "FTA",
];

function emptyTotals(playerId) {
  return {
    PlayerID: Number(playerId),
    Points: null,
    Rebounds: null,
    Assists: null,
    Turnovers: null,
    Steals: null,
    Blocks: null,
    ThreePM: null,
    ThreePA: null,
    TwoPM: null,
    TwoPA: null,
    FTM: null,
    FTA: null,
    GamesPlayedSet: new Set(),
  };
}

function addStat(total, stat) {
  for (const field of STAT_FIELDS) {
    const value = stat?.[field];
    if (value === null || value === undefined || value === "") continue;
    total[field] = Number(total[field] || 0) + Number(value || 0);
  }
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function splitParagraphs(text) {
  return String(text || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function formatGrade(grade) {
  if (grade === null || grade === undefined || grade === "") return "-";
  const value = Number(grade);
  if (!Number.isFinite(value)) return String(grade);
  if (value === 8) return "8th";
  if (value === 9) return "Fr.";
  if (value === 10) return "So.";
  if (value === 11) return "Jr.";
  if (value === 12) return "Sr.";
  return String(grade);
}

function formatScore(game) {
  if (game.TeamScore == null || game.OpponentScore == null) return "-";
  return `${game.TeamScore}-${game.OpponentScore}`;
}

function resultClassName(result) {
  if (result === "W") return "text-green-700";
  if (result === "L") return "text-red-700";
  return "text-gray-500";
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
                  {row.jersey || "-"}
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

function SeasonRecapSection({
  title = "Season Recap",
  recap,
  briefItems = [],
  article = null,
}) {
  const [isArticleOpen, setIsArticleOpen] = useState(false);
  const paragraphs = splitParagraphs(recap);
  const articleInsertIndex = article?.src
    ? Math.max(0, paragraphs.length > 1 ? paragraphs.length - 2 : 0)
    : -1;
  if (!paragraphs.length) return null;

  return (
    <section id="season-recap" className="mx-auto max-w-4xl space-y-3">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="flow-root text-base leading-7 text-slate-700">
        {briefItems.length ? (
          <dl className="mb-4 grid grid-cols-3 gap-3 text-center md:float-right md:mb-3 md:ml-6 md:w-64 md:grid-cols-1">
            {briefItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-gray-200 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {item.label}
                </dt>
                <dd className="text-lg font-semibold text-gray-900">{item.value || "-"}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="space-y-3">
          {paragraphs.map((paragraph, index) => (
            <React.Fragment key={paragraph}>
              {index === articleInsertIndex ? (
                <aside className="mb-3 mt-1 border border-gray-200 bg-white shadow-sm md:float-left md:mr-6 md:w-56">
                  <button
                    type="button"
                    onClick={() => setIsArticleOpen(true)}
                    className="block w-full bg-gray-100 text-left"
                    aria-label={`Open full view of ${article.title || "featured article"}`}
                  >
                    <img
                      src={article.src}
                      alt={article.thumbnailAlt || article.alt || ""}
                      className="aspect-square w-full object-cover"
                      style={{ objectPosition: article.thumbnailPosition || "30% 50%" }}
                      loading="lazy"
                    />
                  </button>
                  <div className="space-y-1.5 p-3">
                    {article.meta ? (
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {article.meta}
                      </p>
                    ) : null}
                    {article.title ? (
                      <button
                        type="button"
                        onClick={() => setIsArticleOpen(true)}
                        className="text-left text-sm font-bold leading-snug text-blue-700 underline hover:text-blue-900"
                      >
                        {article.title}
                      </button>
                    ) : null}
                  </div>
                </aside>
              ) : null}
              <p>{paragraph}</p>
            </React.Fragment>
          ))}
        </div>
      </div>

      {isArticleOpen && article?.src ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={article.title || "Article image"}
          onClick={() => setIsArticleOpen(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-base font-semibold text-gray-900">
                {article.title || "Article"}
              </h3>
              <button
                type="button"
                onClick={() => setIsArticleOpen(false)}
                className="rounded border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            <div className="max-h-[82vh] overflow-auto bg-gray-950 p-3">
              <img
                src={article.src}
                alt={article.fullAlt || article.alt || ""}
                className="mx-auto max-h-[78vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SeasonImagesSection({ images = [], seasonLabel = "" }) {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [images]);

  if (images.length) {
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

  return (
    <section id="season-images" className="space-y-3">
      <h2 className="text-2xl font-semibold">Season Images</h2>
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
        <p className="text-base font-semibold text-gray-800">Season photo gallery coming soon</p>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Photos from the {seasonLabel || "this"} boys basketball season will be added here.
        </p>
      </div>
    </section>
  );
}

function MaxPrepsSeasonPage({
  seasonId,
  seasonLabel,
  recapContent = null,
  scoringOnly = false,
  statSourceLabel = "MaxPreps",
  trimShootingColumns = false,
  seasonRecapTitle = "Season Recap",
  seasonRecap = "",
  seasonBriefs = [],
  recapArticle = null,
  showSeasonRoster = false,
  showSeasonImagesPlaceholder = false,
  seasonImages = [],
  rosterTitle = "Season Roster",
  rosterStaff = [],
  hideBrackets = false,
  hidePlayerStatsToggle = false,
}) {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [seasonInfo, setSeasonInfo] = useState(null);
  const [bracketsData, setBracketsData] = useState(null);
  const [schoolsData, setSchoolsData] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [showPerGame, setShowPerGame] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [
        gamesRes,
        statsRes,
        playersRes,
        bracketsRes,
        rostersRes,
        schoolsRes,
        seasonsRes,
        adjustmentsRes,
      ] = await Promise.all([
        fetch("/data/boys/basketball/games.json"),
        fetch("/data/boys/basketball/playergamestats.json"),
        fetch("/data/players.json"),
        fetch("/data/boys/basketball/brackets.json"),
        fetch(BOYS_BASKETBALL_ROSTERS_PATH),
        fetch(SCHOOLS_PATH),
        fetch("/data/boys/basketball/seasons.json"),
        fetch("/data/boys/basketball/adjustments.json").catch(() => null),
      ]);

      const [
        gamesData,
        statsData,
        playersData,
        bracketsJson,
        rostersData,
        schoolsJson,
        seasonsData,
        adjustmentsData,
      ] = await Promise.all([
        gamesRes.json(),
        statsRes.json(),
        playersRes.json(),
        bracketsRes.json(),
        rostersRes.json(),
        schoolsRes.json(),
        seasonsRes.json(),
        adjustmentsRes?.ok ? adjustmentsRes.json() : [],
      ]);

      const seasonGames = hydrateGamesWithSchools(gamesData, schoolsJson)
        .filter((game) => Number(game.Season) === Number(seasonId))
        .sort((a, b) => Number(a.GameID) - Number(b.GameID));
      const seasonGameIds = new Set(seasonGames.map((game) => Number(game.GameID)));

      setGames(seasonGames);
      setPlayerStats(statsData.filter((stat) => seasonGameIds.has(Number(stat.GameID))));
      setPlayers(playersData);
      setRosterEntries(getRosterEntriesForSeason(rostersData, seasonLabel));
      setBracketsData(bracketsJson);
      setSchoolsData(schoolsJson);
      setSeasonInfo(
        seasonsData.find((season) => Number(season.SeasonID) === Number(seasonId)) || null
      );
      setAdjustments(
        (Array.isArray(adjustmentsData) ? adjustmentsData : []).filter(
          (row) => Number(row.SeasonID) === Number(seasonId)
        )
      );
    }

    fetchData();
  }, [seasonId, seasonLabel]);

  const seasonSummary = useMemo(() => {
    return games.reduce(
      (summary, game) => {
        if (game.Result === "W") summary.wins += 1;
        if (game.Result === "L") summary.losses += 1;
        summary.pointsFor += Number(game.TeamScore || 0);
        summary.pointsAgainst += Number(game.OpponentScore || 0);
        if (game.RegionGame === "Yes" || game.GameType === "Region") {
          if (game.Result === "W") summary.regionWins += 1;
          if (game.Result === "L") summary.regionLosses += 1;
        }
        return summary;
      },
      {
        wins: 0,
        losses: 0,
        regionWins: 0,
        regionLosses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      }
    );
  }, [games]);

  const playerById = useMemo(() => {
    const map = new Map();
    for (const player of players) map.set(Number(player.PlayerID), player);
    return map;
  }, [players]);

  const schoolById = useMemo(() => {
    const map = new Map();
    for (const school of schoolsData) map.set(String(school.SchoolID), school);
    return map;
  }, [schoolsData]);

  const playerName = (playerId) => {
    const player = playerById.get(Number(playerId));
    return player ? `${player.FirstName} ${player.LastName}` : "Unknown Player";
  };

  const adjustmentMap = useMemo(() => {
    const map = new Map();

    for (const adjustment of adjustments) {
      const playerId = Number(adjustment.PlayerID);
      if (!Number.isFinite(playerId)) continue;
      if (!map.has(playerId)) map.set(playerId, emptyTotals(playerId));
      addStat(map.get(playerId), adjustment);
    }

    return map;
  }, [adjustments]);

  const calculatedTotals = useMemo(() => {
    const totals = new Map();

    for (const stat of playerStats) {
      const playerId = Number(stat.PlayerID);
      if (!totals.has(playerId)) totals.set(playerId, emptyTotals(playerId));

      const total = totals.get(playerId);
      addStat(total, stat);
      if (countsAsPlayerGame(stat)) total.GamesPlayedSet.add(Number(stat.GameID));
    }

    return totals;
  }, [playerStats]);

  const seasonTotals = useMemo(() => {
    const totals = new Map();

    for (const entry of rosterEntries) {
      const playerId = Number(entry.PlayerID);
      const calculated = calculatedTotals.get(playerId);
      const adjusted = adjustmentMap.get(playerId);
      const importedTotals = entry.SeasonTotals || {};
      const total = emptyTotals(playerId);

      total.GamesPlayed =
        Number.isFinite(Number(entry.GamesPlayed)) && entry.GamesPlayed !== null
          ? Number(entry.GamesPlayed)
          : calculated?.GamesPlayedSet?.size || 0;

      for (const field of STAT_FIELDS) {
        if (hasValue(importedTotals[field])) {
          total[field] = Number(importedTotals[field]);
        } else if (hasValue(calculated?.[field])) {
          total[field] = Number(calculated[field]);
        }

        if (hasValue(adjusted?.[field]) && (hasValue(total[field]) || Number(adjusted[field]) !== 0)) {
          total[field] = Number(total[field] || 0) + Number(adjusted[field] || 0);
        }
      }

      totals.set(playerId, total);
    }

    for (const calculated of calculatedTotals.values()) {
      const playerId = Number(calculated.PlayerID);
      if (totals.has(playerId)) continue;

      const total = emptyTotals(playerId);
      total.GamesPlayed = calculated.GamesPlayedSet?.size || 0;
      for (const field of STAT_FIELDS) {
        if (hasValue(calculated[field])) total[field] = Number(calculated[field]);
      }
      totals.set(playerId, total);
    }

    return Array.from(totals.values())
      .filter((total) => total.GamesPlayed > 0 || STAT_FIELDS.some((field) => hasValue(total[field])))
      .sort((a, b) => {
        const jerseyA = Number(getRosterJerseyNumber(rosterEntries, a.PlayerID) || 999);
        const jerseyB = Number(getRosterJerseyNumber(rosterEntries, b.PlayerID) || 999);
        if (jerseyA !== jerseyB) return jerseyA - jerseyB;
        return playerName(a.PlayerID).localeCompare(playerName(b.PlayerID));
      });
  }, [adjustmentMap, calculatedTotals, rosterEntries, playerById]);

  const teamTotals = useMemo(() => {
    if (!seasonTotals.length) return null;

    const totals = {
      PlayerID: "team",
      GamesPlayed: 0,
      Points: 0,
      Rebounds: 0,
      Assists: 0,
      Turnovers: 0,
      Steals: 0,
      Blocks: 0,
      ThreePM: 0,
      ThreePA: 0,
      TwoPM: 0,
      TwoPA: 0,
      FTM: 0,
      FTA: 0,
    };

    for (const stat of playerStats) {
      if (countsAsPlayerGame(stat)) totals.GamesPlayed += 1;
    }

    for (const total of seasonTotals) {
      for (const field of TOTAL_COLUMNS) {
        totals[field] += Number(total[field] || 0);
      }
    }

    totals.GamesPlayed =
      seasonTotals.reduce((max, total) => Math.max(max, Number(total.GamesPlayed || 0)), 0) ||
      totals.GamesPlayed;

    return totals;
  }, [playerStats, seasonTotals]);

  const leaders = useMemo(() => {
    const byStat = (key) =>
      seasonTotals
        .filter((player) => hasValue(player[key]))
        .sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0))[0] || null;

    return {
      points: byStat("Points"),
      rebounds: byStat("Rebounds"),
      assists: byStat("Assists"),
      steals: byStat("Steals"),
    };
  }, [seasonTotals]);

  const leaderText = (leader, key) => {
    if (!leader || !hasValue(leader[key])) return null;
    return `${playerName(leader.PlayerID)} (${leader[key]})`;
  };

  const leaderParts = [
    ["points", leaderText(leaders.points, "Points")],
    ["rebounds", leaderText(leaders.rebounds, "Rebounds")],
    ["assists", leaderText(leaders.assists, "Assists")],
    ["steals", leaderText(leaders.steals, "Steals")],
  ].filter(([, text]) => text);

  const formatDate = (gameId) => {
    const value = Number(gameId);
    const year = Math.floor(value / 10000);
    const month = Math.floor(value / 100) % 100;
    const day = value % 100;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLocation = (game) => {
    return game.LocationType || game.Location || game.Site || "Unknown";
  };

  const opponentLogoPath = (game) => {
    const school = schoolById.get(String(game?.OpponentID ?? ""));
    return school?.LogoPath || school?.BracketLogoPath || null;
  };

  const pct = (made, attempts) => {
    if (!hasValue(made) || !hasValue(attempts) || !Number(attempts)) return "-";
    return ((Number(made || 0) / Number(attempts)) * 100).toFixed(1);
  };

  const valueFor = (player, key) => {
    const value = player[key];
    if (!hasValue(value)) return "-";
    if (!showPerGame) return value;
    if (!player.GamesPlayed) return "-";
    return (Number(value || 0) / player.GamesPlayed).toFixed(1);
  };

  const rosterTableRows = useMemo(() => {
    const playerRows = rosterEntries
      .map((entry) => ({
        key: `player-${entry.PlayerID}`,
        jersey: entry.JerseyNumber,
        name: playerName(entry.PlayerID),
        grade: entry.Grade,
        path: playerById.has(Number(entry.PlayerID))
          ? `/athletics/boys/basketball/players/${entry.PlayerID}`
          : "",
      }))
      .sort((a, b) => {
        const jerseyA = Number(a.jersey || 999);
        const jerseyB = Number(b.jersey || 999);
        if (jerseyA !== jerseyB) return jerseyA - jerseyB;
        return a.name.localeCompare(b.name);
      });

    const staffRows = rosterStaff.map((staff, index) => ({
      key: `staff-${index}-${staff.name}`,
      jersey: "",
      name: staff.name,
      grade: staff.role,
      path: "",
    }));

    return [...playerRows, ...staffRows];
  }, [playerById, rosterEntries, rosterStaff]);

  const bracket = bracketsData?.[String(seasonId)];
  const shouldShowStringRecap = Boolean(splitParagraphs(seasonRecap).length);
  const statsHeaderCellClassName = "px-2 py-2 text-center text-xs whitespace-nowrap";
  const statsBodyCellClassName = "px-2 py-1.5 text-center whitespace-nowrap";
  const statsFooterCellClassName = "px-2 py-2 text-center whitespace-nowrap";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-10 pt-2 lg:pb-40">
      <h1 className="text-3xl font-bold text-center mb-2">{seasonLabel} Season</h1>

      {shouldShowStringRecap ? (
        <SeasonRecapSection
          title={seasonRecapTitle}
          recap={seasonRecap}
          briefItems={seasonBriefs}
          article={recapArticle}
        />
      ) : (
        <section className="mx-auto max-w-4xl space-y-3">
          <h2 className="text-2xl font-semibold">Season Recap</h2>
          {recapContent ? (
            <div className="text-base leading-7 text-slate-700">{recapContent}</div>
          ) : (
            <div className="space-y-3 text-base leading-7 text-slate-700">
              <p>
                The {seasonLabel} St. Andrew&apos;s boys basketball team finished{" "}
                {seasonSummary.wins}-{seasonSummary.losses}
                {seasonInfo?.HeadCoach ? ` under head coach ${seasonInfo.HeadCoach}` : ""}.
                The Lions scored {seasonSummary.pointsFor} points and allowed{" "}
                {seasonSummary.pointsAgainst} across {games.length} games recorded in the
                archive.
              </p>
              <p>
                In regular-season region play, St. Andrew&apos;s went{" "}
                {seasonSummary.regionWins}-{seasonSummary.regionLosses}. The schedule below
                includes the game results currently available for the season
                {hideBrackets
                  ? "."
                  : ", followed by any tournament brackets that have been entered for that year."}
              </p>
              {leaderParts.length > 0 ? (
                <p>
                  {statSourceLabel} stat leaders for the season were{" "}
                  {leaderParts.map(([label, text], index) => (
                    <React.Fragment key={label}>
                      {index > 0 && (index === leaderParts.length - 1 ? ", and " : ", ")}
                      {text} in {label}
                    </React.Fragment>
                  ))}
                  .
                </p>
              ) : null}
            </div>
          )}
        </section>
      )}

      {showSeasonImagesPlaceholder || seasonImages.length ? (
        <SeasonImagesSection images={seasonImages} seasonLabel={seasonLabel} />
      ) : null}

      {showSeasonRoster ? (
        <section id="season-roster" className="space-y-4">
          <h2 className="text-2xl font-semibold">{rosterTitle}</h2>
          <RosterTable rows={rosterTableRows} />
        </section>
      ) : null}

      <section>
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>
        </div>

        <div className="grid gap-3 sm:hidden">
          {games.map((game) => {
            const logoPath = opponentLogoPath(game);

            return (
              <Link
                key={game.GameID}
                to={`/athletics/boys/basketball/games/${game.GameID}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 text-gray-900 no-underline shadow-sm transition hover:border-blue-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="mb-2 text-sm text-gray-600">{formatDate(game.GameID)}</p>
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
                        <h3 className="text-lg font-semibold leading-snug">{game.Opponent}</h3>
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

        <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow sm:block">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Opponent</th>
                <th className="px-3 py-2 text-center">Location</th>
                <th className="px-3 py-2 text-center">Result</th>
                <th className="px-3 py-2 text-center">Score</th>
                <th className="px-3 py-2 text-center">Type</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => {
                const logoPath = opponentLogoPath(game);

                return (
                  <tr
                    key={game.GameID}
                    className={`border-t border-gray-200 ${
                      index % 2 ? "bg-gray-50/70" : "bg-white"
                    } hover:bg-gray-100`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">{formatDate(game.GameID)}</td>
                    <td className="px-3 py-2">
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
                            to={`/athletics/boys/basketball/games/${game.GameID}`}
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
                    <td className="px-3 py-2 text-center">{formatLocation(game)}</td>
                    <td className={`px-3 py-2 text-center font-bold ${resultClassName(game.Result)}`}>
                      {game.Result || "-"}
                    </td>
                    <td className="px-3 py-2 text-center">{formatScore(game)}</td>
                    <td className="px-3 py-2 text-center">{game.GameType || "Regular Season"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {!hideBrackets ? (
        <>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Region Tournament Bracket</h2>
            {bracketsData === null ? (
              <p className="text-gray-600">Loading region bracket...</p>
            ) : bracket?.region ? (
              <RegionBracket5GameSVG bracket={bracket.region} schools={schoolsData} />
            ) : (
              <p className="text-gray-600">
                Region bracket data is not available for this season.
              </p>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">State Tournament Bracket</h2>
            {bracketsData === null ? (
              <p className="text-gray-600">Loading state bracket...</p>
            ) : bracket?.state ? (
              <StateBracket16GameSVG bracket={bracket.state} schools={schoolsData} />
            ) : (
              <p className="text-gray-600">
                State bracket data is not available for this season.
              </p>
            )}
          </section>
        </>
      ) : null}

      <section>
        <div className="mt-8 mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Individual Stats</h2>

          {!scoringOnly && !hidePlayerStatsToggle ? (
            <div className="flex items-center space-x-2 text-xs sm:text-sm">
              <span className={showPerGame ? "text-gray-400" : "text-gray-900 font-semibold"}>
                Season totals
              </span>
              <button
                type="button"
                onClick={() => setShowPerGame((value) => !value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  showPerGame ? "bg-green-500" : "bg-gray-300"
                }`}
                aria-label="Toggle season totals / per game averages"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    showPerGame ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={showPerGame ? "text-gray-900 font-semibold" : "text-gray-400"}>
                Per game averages
              </span>
            </div>
          ) : null}
        </div>

        {seasonTotals.length ? (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className={statsHeaderCellClassName}>#</th>
                    <th className={statsHeaderCellClassName}>Player</th>
                    <th className={statsHeaderCellClassName}>GP</th>
                    <th className={statsHeaderCellClassName}>PTS</th>
                    {scoringOnly ? (
                      <th className={statsHeaderCellClassName}>PPG</th>
                    ) : (
                      <>
                        <th className={statsHeaderCellClassName}>REB</th>
                        <th className={statsHeaderCellClassName}>AST</th>
                        <th className={statsHeaderCellClassName}>STL</th>
                        <th className={statsHeaderCellClassName}>BLK</th>
                        {!trimShootingColumns ? (
                          <>
                            <th className={statsHeaderCellClassName}>TO</th>
                            <th className={statsHeaderCellClassName}>3PM</th>
                            <th className={statsHeaderCellClassName}>3PA</th>
                            <th className={statsHeaderCellClassName}>3P%</th>
                            <th className={statsHeaderCellClassName}>2PM</th>
                            <th className={statsHeaderCellClassName}>2PA</th>
                            <th className={statsHeaderCellClassName}>2P%</th>
                            <th className={statsHeaderCellClassName}>FTM</th>
                            <th className={statsHeaderCellClassName}>FTA</th>
                            <th className={statsHeaderCellClassName}>FT%</th>
                          </>
                        ) : null}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {seasonTotals.map((player, index) => {
                    const scoringGames = Number(player.GamesPlayed || 0);
                    const points = Number(player.Points || 0);

                    return (
                      <tr
                        key={player.PlayerID}
                        className={`border-t border-gray-200 ${
                          index % 2 ? "bg-gray-50/70" : "bg-white"
                        } hover:bg-gray-100`}
                      >
                        <td className={statsBodyCellClassName}>
                          {getRosterJerseyNumber(rosterEntries, player.PlayerID) || "-"}
                        </td>
                        <td className={statsBodyCellClassName}>
                          <Link
                            to={`/athletics/boys/basketball/players/${player.PlayerID}`}
                            className="text-blue-600 hover:underline"
                          >
                            {playerName(player.PlayerID)}
                          </Link>
                        </td>
                        <td className={statsBodyCellClassName}>{player.GamesPlayed || "-"}</td>
                        <td className={statsBodyCellClassName}>{valueFor(player, "Points")}</td>
                        {scoringOnly ? (
                          <td className={statsBodyCellClassName}>
                            {scoringGames ? (points / scoringGames).toFixed(1) : "-"}
                          </td>
                        ) : (
                          <>
                            <td className={statsBodyCellClassName}>
                              {valueFor(player, "Rebounds")}
                            </td>
                            <td className={statsBodyCellClassName}>
                              {valueFor(player, "Assists")}
                            </td>
                            <td className={statsBodyCellClassName}>
                              {valueFor(player, "Steals")}
                            </td>
                            <td className={statsBodyCellClassName}>
                              {valueFor(player, "Blocks")}
                            </td>
                            {!trimShootingColumns ? (
                              <>
                                <td className={statsBodyCellClassName}>
                                  {valueFor(player, "Turnovers")}
                                </td>
                                <td className={statsBodyCellClassName}>
                                  {valueFor(player, "ThreePM")}
                                </td>
                                <td className={statsBodyCellClassName}>
                                  {valueFor(player, "ThreePA")}
                                </td>
                                <td className={statsBodyCellClassName}>
                                  {pct(player.ThreePM, player.ThreePA)}
                                </td>
                                <td className={statsBodyCellClassName}>
                                  {valueFor(player, "TwoPM")}
                                </td>
                                <td className={statsBodyCellClassName}>
                                  {valueFor(player, "TwoPA")}
                                </td>
                                <td className={statsBodyCellClassName}>
                                  {pct(player.TwoPM, player.TwoPA)}
                                </td>
                                <td className={statsBodyCellClassName}>
                                  {valueFor(player, "FTM")}
                                </td>
                                <td className={statsBodyCellClassName}>
                                  {valueFor(player, "FTA")}
                                </td>
                                <td className={statsBodyCellClassName}>
                                  {pct(player.FTM, player.FTA)}
                                </td>
                              </>
                            ) : null}
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                {!scoringOnly && teamTotals ? (
                  <tfoot className="border-t-2 border-gray-300 bg-blue-50 text-blue-950">
                    <tr>
                      <td className={statsFooterCellClassName}></td>
                      <td className={statsFooterCellClassName}>Season Totals</td>
                      <td className={statsFooterCellClassName}>{teamTotals.GamesPlayed || "-"}</td>
                      <td className={statsFooterCellClassName}>
                        {valueFor(teamTotals, "Points")}
                      </td>
                      <td className={statsFooterCellClassName}>
                        {valueFor(teamTotals, "Rebounds")}
                      </td>
                      <td className={statsFooterCellClassName}>
                        {valueFor(teamTotals, "Assists")}
                      </td>
                      <td className={statsFooterCellClassName}>
                        {valueFor(teamTotals, "Steals")}
                      </td>
                      <td className={statsFooterCellClassName}>
                        {valueFor(teamTotals, "Blocks")}
                      </td>
                      {!trimShootingColumns ? (
                        <>
                          <td className={statsFooterCellClassName}>
                            {valueFor(teamTotals, "Turnovers")}
                          </td>
                          <td className={statsFooterCellClassName}>
                            {valueFor(teamTotals, "ThreePM")}
                          </td>
                          <td className={statsFooterCellClassName}>
                            {valueFor(teamTotals, "ThreePA")}
                          </td>
                          <td className={statsFooterCellClassName}>
                            {pct(teamTotals.ThreePM, teamTotals.ThreePA)}
                          </td>
                          <td className={statsFooterCellClassName}>
                            {valueFor(teamTotals, "TwoPM")}
                          </td>
                          <td className={statsFooterCellClassName}>
                            {valueFor(teamTotals, "TwoPA")}
                          </td>
                          <td className={statsFooterCellClassName}>
                            {pct(teamTotals.TwoPM, teamTotals.TwoPA)}
                          </td>
                          <td className={statsFooterCellClassName}>
                            {valueFor(teamTotals, "FTM")}
                          </td>
                          <td className={statsFooterCellClassName}>
                            {valueFor(teamTotals, "FTA")}
                          </td>
                          <td className={statsFooterCellClassName}>
                            {pct(teamTotals.FTM, teamTotals.FTA)}
                          </td>
                        </>
                      ) : null}
                    </tr>
                  </tfoot>
                ) : null}
              </table>
            </div>

            {scoringOnly ? (
              <p className="mt-2 text-center text-xs leading-relaxed text-gray-600">
                This season currently includes scoring by game only. GP reflects games in
                which a player recorded points in the surviving scoring archive.
              </p>
            ) : null}
            {trimShootingColumns && !scoringOnly ? (
              <p className="mt-2 text-center text-xs leading-relaxed text-gray-600">
                Points are the most complete totals for this season. Other categories may be
                incomplete because rebounds, assists, steals, blocks, and related stats were
                not consistently reported in newspaper recaps.
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-gray-600">Player statistics are not available for this season.</p>
        )}
      </section>
    </div>
  );
}

export default MaxPrepsSeasonPage;
