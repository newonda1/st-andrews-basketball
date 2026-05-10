import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ArticleFeatureList from "../../../components/ArticleFeatureList";
import {
  GIRLS_BASKETBALL_ROSTERS_PATH,
  SCHOOLS_PATH,
  countsAsPlayerGame,
  findSeasonRoster,
  getRosterEntriesForSeason,
  getRosterJerseyNumber,
  hydrateGamesWithSchools,
} from "../dataUtils";

const STAT_FIELDS = [
  "MinutesPlayed",
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
  "OffensiveRebounds",
  "DefensiveRebounds",
  "PersonalFouls",
  "Deflections",
  "Charges",
];

const TOTAL_COLUMNS = [
  "Points",
  "Rebounds",
  "Assists",
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
    MinutesPlayed: null,
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
    OffensiveRebounds: null,
    DefensiveRebounds: null,
    PersonalFouls: null,
    Deflections: null,
    Charges: null,
    GamesPlayedSet: new Set(),
    GamesPlayedAdjustment: 0,
  };
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function addStat(total, stat) {
  for (const field of STAT_FIELDS) {
    if (!hasValue(stat?.[field])) continue;
    total[field] = Number(total[field] || 0) + Number(stat[field] || 0);
  }
}

function pct(made, attempts) {
  const madeValue = Number(made || 0);
  const attemptValue = Number(attempts || 0);
  if (!attemptValue) return "-";
  return ((madeValue / attemptValue) * 100).toFixed(1);
}

function statPct(made, attempts) {
  const madeValue = Number(made || 0);
  const attemptValue = Number(attempts || 0);
  if (attemptValue <= 0) return "-";
  return `${((madeValue / attemptValue) * 100).toFixed(1)}%`;
}

function assistToTurnover(assists, turnovers) {
  const assistValue = Number(assists || 0);
  const turnoverValue = Number(turnovers || 0);
  if (turnoverValue <= 0) return "-";
  return (assistValue / turnoverValue).toFixed(2);
}

function formatDate(game) {
  const dateValue = Number(game?.Date);
  if (Number.isFinite(dateValue)) {
    return new Date(dateValue).toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const gameId = Math.trunc(Number(game?.GameID));
  if (!Number.isFinite(gameId)) return "";

  const year = Math.floor(gameId / 10000);
  const month = Math.floor(gameId / 100) % 100;
  const day = gameId % 100;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function splitParagraphs(text) {
  return String(text || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function formatArticleDate(dateValue) {
  if (!dateValue) return "";
  if (/^\d{4}$/.test(String(dateValue))) return String(dateValue);

  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getArticleImage(article) {
  const firstImage = Array.isArray(article?.Images) ? article.Images[0] : null;
  if (typeof firstImage === "string") return { src: firstImage, alt: article?.Title || "" };
  return firstImage || null;
}

function SeasonRecapSection({
  title = "Season Recap",
  recap,
  briefItems = [],
  article = null,
  recapLinks = [],
  basePath,
}) {
  const paragraphs = splitParagraphs(recap);
  if (!paragraphs.length) return null;

  const articleImage = getArticleImage(article);
  const articleDate = formatArticleDate(article?.Date);
  const articleMeta = [articleDate, article?.Source].filter(Boolean).join(" • ");
  const articlePath = article?.ArticleID ? `${basePath}/articles/${article.ArticleID}` : "";
  const resolvedLinks = (Array.isArray(recapLinks) ? recapLinks : [])
    .map((link) => {
      const text = String(link?.Text || link?.text || "").trim();
      const to = link?.ArticleID
        ? `${basePath}/articles/${encodeURIComponent(String(link.ArticleID))}`
        : String(link?.Url || link?.to || "").trim();

      return text && to ? { text, to } : null;
    })
    .filter(Boolean);

  const renderLinkedText = (text) => {
    if (!resolvedLinks.length) return text;

    const matches = resolvedLinks
      .map((link) => ({ ...link, index: text.indexOf(link.text) }))
      .filter((link) => link.index >= 0)
      .sort((a, b) => a.index - b.index);

    if (!matches.length) return text;

    const pieces = [];
    let cursor = 0;

    matches.forEach((match) => {
      if (match.index < cursor) return;
      if (match.index > cursor) pieces.push(text.slice(cursor, match.index));
      pieces.push(
        <Link
          key={`${match.to}-${match.index}`}
          to={match.to}
          className="text-blue-700 underline hover:text-blue-900"
        >
          {match.text}
        </Link>
      );
      cursor = match.index + match.text.length;
    });

    if (cursor < text.length) pieces.push(text.slice(cursor));
    return pieces;
  };

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
                <dd className="text-lg font-semibold text-gray-900">{item.value || "—"}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {articleImage?.src && articlePath ? (
          <aside className="mb-4 border border-gray-200 bg-white shadow-sm md:float-left md:mb-3 md:mr-6 md:w-72">
            <Link to={articlePath} className="block bg-gray-100">
              <img
                src={articleImage.src}
                alt={articleImage.alt || article.Title}
                className="h-64 w-full object-cover object-top"
                loading="lazy"
              />
            </Link>
            <div className="space-y-2 p-3">
              {articleMeta ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {articleMeta}
                </p>
              ) : null}
              <h3 className="text-base font-bold leading-snug text-gray-950">
                <Link to={articlePath} className="text-blue-700 underline hover:text-blue-900">
                  {article.Title}
                </Link>
              </h3>
              {article.Subtitle ? (
                <p className="text-sm leading-6 text-gray-600">{article.Subtitle}</p>
              ) : null}
            </div>
          </aside>
        ) : null}

        <div className="space-y-3">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{renderLinkedText(paragraph)}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeasonImagesSection({ images = [], seasonLabel = "" }) {
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
            Photos from the {seasonLabel || "selected"} girls basketball season will be added here.
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
  const rosterHeaderCellClassName =
    "border px-2 py-2 font-bold leading-tight whitespace-nowrap md:px-3";
  const rosterBodyCellClassName =
    "border px-2 py-1.5 align-middle whitespace-nowrap leading-tight md:px-3";
  const rosterPlayerCellClassName =
    "border px-2 py-1.5 align-middle leading-tight md:px-3";

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full bg-white text-sm text-center">
        <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
          <tr>
            <th className={rosterHeaderCellClassName}>No.</th>
            <th className={`${rosterHeaderCellClassName} text-left`}>Player</th>
            <th className={rosterHeaderCellClassName}>Grade</th>
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
                <td className={rosterBodyCellClassName}>{row.jersey || "—"}</td>
                <td className={`${rosterPlayerCellClassName} text-left`}>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    {row.path ? (
                      <Link to={row.path} className="text-blue-600 hover:underline">
                        {row.name}
                      </Link>
                    ) : (
                      <span>{row.name}</span>
                    )}
                    {row.subline ? (
                      <span className="text-xs leading-snug text-gray-500">{row.subline}</span>
                    ) : null}
                  </div>
                </td>
                <td className={rosterBodyCellClassName}>{formatGrade(row.grade)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={`${rosterBodyCellClassName} text-center text-slate-600`} colSpan={3}>
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

function MaxPrepsSeasonPage({
  seasonId,
  seasonLabel,
  trimShootingColumns = false,
  hideScheduleToggle = false,
  hidePlayerStatsToggle = false,
  seasonRecapTitle = "Season Recap",
  seasonRecap = "",
  seasonBriefs = [],
  seasonRecapLinks = [],
  embedFeaturedArticleInRecap = false,
  hideSeasonArticles = false,
  showSeasonImagesPlaceholder = false,
  seasonImages = [],
  showSeasonRoster = false,
  headCoach = "",
}) {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [seasonRoster, setSeasonRoster] = useState(null);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [schoolsData, setSchoolsData] = useState([]);
  const [seasonAdjustments, setSeasonAdjustments] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showPerGame, setShowPerGame] = useState(false);
  const [showTeamTotals, setShowTeamTotals] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [gamesRes, statsRes, playersRes, rostersRes, schoolsRes, adjustmentsRes, articlesRes] =
        await Promise.all([
          fetch("/data/girls/basketball/games.json"),
          fetch("/data/girls/basketball/playergamestats.json"),
          fetch("/data/players.json"),
          fetch(GIRLS_BASKETBALL_ROSTERS_PATH),
          fetch(SCHOOLS_PATH),
          fetch("/data/girls/basketball/adjustments.json").catch(() => null),
          fetch("/data/girls/basketball/articles.json").catch(() => null),
        ]);

      const [
        gamesData,
        statsData,
        playersData,
        rostersData,
        schoolsData,
        adjustmentsData,
        articlesData,
      ] =
        await Promise.all([
          gamesRes.json(),
          statsRes.json(),
          playersRes.json(),
          rostersRes.json(),
          schoolsRes.json(),
          adjustmentsRes?.ok ? adjustmentsRes.json() : Promise.resolve([]),
          articlesRes?.ok ? articlesRes.json() : Promise.resolve([]),
        ]);

      const seasonGames = hydrateGamesWithSchools(gamesData, schoolsData)
        .filter((game) => Number(game.Season) === Number(seasonId))
        .sort(
          (a, b) =>
            Number(a.Date ?? a.GameID) - Number(b.Date ?? b.GameID) ||
            Number(a.GameID) - Number(b.GameID)
        );
      const seasonGameIds = new Set(seasonGames.map((game) => Number(game.GameID)));

      setGames(seasonGames);
      setPlayerStats(statsData.filter((stat) => seasonGameIds.has(Number(stat.GameID))));
      setPlayers(playersData);
      const selectedRoster = findSeasonRoster(rostersData, seasonLabel);
      setSeasonRoster(selectedRoster);
      setRosterEntries(getRosterEntriesForSeason(rostersData, seasonLabel));
      setSchoolsData(schoolsData);
      setSeasonAdjustments(
        (Array.isArray(adjustmentsData) ? adjustmentsData : []).filter(
          (adjustment) => Number(adjustment.SeasonID) === Number(seasonId)
        )
      );
      setArticles(
        (Array.isArray(articlesData) ? articlesData : []).filter(
          (article) => Number(article.SeasonID) === Number(seasonId)
        )
      );
    }

    fetchData();
  }, [seasonId, seasonLabel]);

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

  const calculatedTotals = useMemo(() => {
    const totals = new Map();

    for (const stat of playerStats) {
      const playerId = Number(stat.PlayerID);
      if (!totals.has(playerId)) totals.set(playerId, emptyTotals(playerId));

      const total = totals.get(playerId);
      addStat(total, stat);
      if (countsAsPlayerGame(stat)) total.GamesPlayedSet.add(Number(stat.GameID));
    }

    for (const adjustment of seasonAdjustments) {
      const playerId = Number(adjustment.PlayerID);
      if (!totals.has(playerId)) totals.set(playerId, emptyTotals(playerId));

      const total = totals.get(playerId);
      addStat(total, adjustment);
      if (hasValue(adjustment.GamesPlayed)) {
        total.GamesPlayedAdjustment += Number(adjustment.GamesPlayed || 0);
      }
    }

    return totals;
  }, [playerStats, seasonAdjustments]);

  const seasonTotals = useMemo(() => {
    const rosterIds = new Set(rosterEntries.map((entry) => Number(entry.PlayerID)));
    const allPlayerIds = [
      ...rosterEntries.map((entry) => Number(entry.PlayerID)),
      ...[...calculatedTotals.keys()].filter((playerId) => !rosterIds.has(playerId)),
    ];

    return allPlayerIds
      .map((playerId) => {
        const rosterEntry = rosterEntries.find(
          (entry) => Number(entry.PlayerID) === Number(playerId)
        );
        const calculated = calculatedTotals.get(playerId);
        const importedTotals = rosterEntry?.SeasonTotals || {};
        const total = emptyTotals(playerId);

        const calculatedGamesPlayed =
          (calculated?.GamesPlayedSet?.size || 0) +
          Number(calculated?.GamesPlayedAdjustment || 0);

        total.GamesPlayed =
          Number.isFinite(Number(rosterEntry?.GamesPlayed)) && rosterEntry?.GamesPlayed !== null
            ? Number(rosterEntry.GamesPlayed)
            : calculatedGamesPlayed;

        for (const field of STAT_FIELDS) {
          if (hasValue(importedTotals[field])) {
            total[field] = Number(importedTotals[field]);
          } else if (calculated && hasValue(calculated[field])) {
            total[field] = calculated[field];
          }
        }

        return total;
      })
      .filter((total) => {
        if (getRosterJerseyNumber(rosterEntries, total.PlayerID)) return true;
        return TOTAL_COLUMNS.some((field) => hasValue(total[field]));
      })
      .sort((a, b) => {
        const jerseyA = Number(getRosterJerseyNumber(rosterEntries, a.PlayerID) || 999);
        const jerseyB = Number(getRosterJerseyNumber(rosterEntries, b.PlayerID) || 999);
        if (jerseyA !== jerseyB) return jerseyA - jerseyB;
        return a.PlayerID - b.PlayerID;
      });
  }, [calculatedTotals, rosterEntries]);

  const teamTotals = useMemo(() => {
    const totals = {
      GamesPlayed: new Set(),
      Points: 0,
      Rebounds: 0,
      Assists: 0,
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
      if (countsAsPlayerGame(stat)) totals.GamesPlayed.add(Number(stat.GameID));
    }

    for (const total of seasonTotals) {
      for (const field of TOTAL_COLUMNS) {
        totals[field] += Number(total[field] || 0);
      }
    }

    return {
      ...totals,
      GamesPlayed:
        seasonTotals.reduce((max, total) => Math.max(max, Number(total.GamesPlayed || 0)), 0) ||
        totals.GamesPlayed.size,
    };
  }, [playerStats, seasonTotals]);

  const teamTotalsByGameId = useMemo(() => {
    const map = new Map();

    for (const game of games) {
      const rows = playerStats.filter((stat) => Number(stat.GameID) === Number(game.GameID));
      const totals = {
        REB: 0,
        AST: 0,
        TO: 0,
        STL: 0,
        BLK: 0,
        ThreePM: 0,
        ThreePA: 0,
        TwoPM: 0,
        TwoPA: 0,
        FTM: 0,
        FTA: 0,
      };

      for (const row of rows) {
        totals.REB += Number(row.Rebounds || 0);
        totals.AST += Number(row.Assists || 0);
        totals.TO += Number(row.Turnovers || 0);
        totals.STL += Number(row.Steals || 0);
        totals.BLK += Number(row.Blocks || 0);
        totals.ThreePM += Number(row.ThreePM || 0);
        totals.ThreePA += Number(row.ThreePA || 0);
        totals.TwoPM += Number(row.TwoPM || 0);
        totals.TwoPA += Number(row.TwoPA || 0);
        totals.FTM += Number(row.FTM || 0);
        totals.FTA += Number(row.FTA || 0);
      }

      map.set(Number(game.GameID), rows.length ? totals : null);
    }

    return map;
  }, [games, playerStats]);

  const playerName = (playerId) => {
    const player = playerById.get(Number(playerId));
    if (!player) return "Unknown Player";
    return (
      player.PlayerName ||
      player.Name ||
      [player.FirstName, player.LastName].filter(Boolean).join(" ") ||
      "Unknown Player"
    );
  };

  const formatLocation = (game) => game.LocationType || game.Location || game.Site || "Unknown";

  const opponentLogoPath = (game) => {
    const school = schoolById.get(String(game?.OpponentID ?? ""));
    return school?.LogoPath || school?.BracketLogoPath || null;
  };

  const valueFor = (player, key) => {
    const value = Number(player[key] || 0);
    if (!showPerGame) return value;
    if (!player.GamesPlayed) return "0.0";
    return (value / player.GamesPlayed).toFixed(1);
  };

  const rosterTableRows = useMemo(() => {
    const rows = rosterEntries
      .map((entry) => ({
        key: `player-${entry.PlayerID}`,
        jersey: entry.JerseyNumber,
        name: playerName(entry.PlayerID),
        grade: entry.Grade,
        subline: entry.Subline || "",
        path: `/athletics/girls/basketball/players/${entry.PlayerID}`,
      }))
      .sort((a, b) => {
        const jerseyA = Number(a.jersey || 999);
        const jerseyB = Number(b.jersey || 999);
        if (jerseyA !== jerseyB) return jerseyA - jerseyB;
        return a.name.localeCompare(b.name);
      });

    const staffRows = Array.isArray(seasonRoster?.Staff)
      ? seasonRoster.Staff.map((member, index) => ({
          key: `staff-${member?.Name || index}-${member?.Position || ""}`,
          jersey: "",
          name: member?.Name || "",
          grade: member?.Position || "Staff",
          path: "",
        })).filter((member) => member.name)
      : [];

    if (staffRows.length) {
      rows.push(...staffRows);
    } else if (headCoach) {
      rows.push({
        key: `staff-${headCoach}`,
        jersey: "",
        name: headCoach,
        grade: "Head Coach",
        path: "",
      });
    }

    return rows;
  }, [headCoach, playerById, rosterEntries, seasonRoster]);

  const featuredArticle = articles[0] || null;
  const shouldEmbedArticle = embedFeaturedArticleInRecap && featuredArticle;
  const shouldShowRecap = Boolean(splitParagraphs(seasonRecap).length);
  const scheduleHeaderCellClassName = "px-2 py-2 text-center text-xs whitespace-nowrap";
  const scheduleBodyCellClassName = "px-2 py-1.5 text-center align-middle whitespace-nowrap";
  const scheduleOpponentCellClassName = "px-2 py-1.5 align-middle";
  const statsHeaderCellClassName = "px-2 py-2 text-center text-xs whitespace-nowrap";
  const statsBodyCellClassName = "px-2 py-1.5 text-center whitespace-nowrap";
  const statsFooterCellClassName = "px-2 py-2 text-center whitespace-nowrap";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-10 pt-2 lg:pb-40">
      <h1 className="text-3xl font-bold text-center mb-2">{seasonLabel} Season</h1>

      {shouldShowRecap ? (
        <SeasonRecapSection
          title={seasonRecapTitle}
          recap={seasonRecap}
          briefItems={seasonBriefs}
          article={shouldEmbedArticle ? featuredArticle : null}
          recapLinks={seasonRecapLinks}
          basePath="/athletics/girls/basketball"
        />
      ) : null}

      {!shouldEmbedArticle && !hideSeasonArticles ? (
        <ArticleFeatureList
          articles={articles}
          basePath="/athletics/girls/basketball"
          heading="Featured Articles"
        />
      ) : null}

      {showSeasonImagesPlaceholder || seasonImages.length ? (
        <SeasonImagesSection images={seasonImages} seasonLabel={seasonLabel} />
      ) : null}

      {showSeasonRoster ? (
        <section id="roster" className="space-y-4">
          <h2 className="text-2xl font-semibold">Roster</h2>
          <RosterTable rows={rosterTableRows} />
        </section>
      ) : null}

      <section>
        <div className="mt-8 mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>

          {!hideScheduleToggle && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className={showTeamTotals ? "text-gray-400" : "text-gray-900 font-semibold"}>
                Game Result
              </span>
              <button
                type="button"
                onClick={() => setShowTeamTotals((value) => !value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  showTeamTotals ? "bg-green-500" : "bg-gray-300"
                }`}
                aria-label="Toggle Game Result / Team Totals"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    showTeamTotals ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={showTeamTotals ? "text-gray-900 font-semibold" : "text-gray-400"}>
                Team Totals
              </span>
            </div>
          )}
        </div>

        {!showTeamTotals && games.length ? (
          <div className="grid gap-3 sm:hidden">
            {games.map((game) => {
              const logoPath = opponentLogoPath(game);

              return (
                <Link
                  key={game.GameID}
                  to={`/athletics/girls/basketball/games/${game.GameID}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 text-gray-900 no-underline shadow-sm transition hover:border-blue-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-2 text-sm text-gray-600">{formatDate(game)}</p>
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
                          {game.Tournament && (
                            <p className="mt-0.5 text-xs leading-tight text-gray-500">
                              {game.Tournament}
                            </p>
                          )}
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
        ) : null}

        {games.length ? (
          <div
            className={`${
              !showTeamTotals ? "hidden sm:block" : ""
            } overflow-x-auto rounded-lg border border-gray-200 bg-white shadow`}
          >
            {!showTeamTotals ? (
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
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
                  {games.map((game, index) => {
                    const logoPath = opponentLogoPath(game);

                    return (
                      <tr
                        key={game.GameID}
                        className={`border-t border-gray-200 ${
                          index % 2 ? "bg-gray-50/70" : "bg-white"
                        } hover:bg-gray-100`}
                      >
                        <td className={`${scheduleBodyCellClassName} text-left`}>
                          {formatDate(game)}
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
                                to={`/athletics/girls/basketball/games/${game.GameID}`}
                                className="text-blue-700 underline hover:text-blue-900"
                              >
                                {game.Opponent}
                              </Link>
                              {game.Tournament && (
                                <div className="mt-0.5 text-xs leading-tight text-gray-500">
                                  {game.Tournament}
                                </div>
                              )}
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
                  })}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full bg-white text-xs sm:text-sm text-center whitespace-nowrap">
                <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
                  <tr>
                    <th className="px-2 py-2">Date</th>
                    <th className="px-2 py-2">Opponent</th>
                    <th className="px-2 py-2">REB</th>
                    <th className="px-2 py-2">AST</th>
                    <th className="px-2 py-2">TO</th>
                    <th className="px-2 py-2">A/T</th>
                    <th className="px-2 py-2">STL</th>
                    <th className="px-2 py-2">BLK</th>
                    {!trimShootingColumns && (
                      <>
                        <th className="px-2 py-2">3PM</th>
                        <th className="px-2 py-2">3PA</th>
                        <th className="px-2 py-2">3P%</th>
                        <th className="px-2 py-2">2PM</th>
                        <th className="px-2 py-2">2PA</th>
                        <th className="px-2 py-2">2P%</th>
                        <th className="px-2 py-2">FTM</th>
                        <th className="px-2 py-2">FTA</th>
                        <th className="px-2 py-2">FT%</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {games.map((game, index) => {
                    const totals = teamTotalsByGameId.get(Number(game.GameID));

                    return (
                      <tr
                        key={game.GameID}
                        className={`border-t border-gray-200 ${
                          index % 2 ? "bg-gray-50/70" : "bg-white"
                        } hover:bg-gray-100`}
                      >
                        <td className="px-2 py-1.5">{formatDate(game)}</td>
                        <td className="px-2 py-1.5">
                          <Link
                            to={`/athletics/girls/basketball/games/${game.GameID}`}
                            className="text-blue-700 underline hover:text-blue-900"
                          >
                            {game.Opponent}
                          </Link>
                        </td>
                        <td className="px-2 py-1.5">{totals ? totals.REB : "-"}</td>
                        <td className="px-2 py-1.5">{totals ? totals.AST : "-"}</td>
                        <td className="px-2 py-1.5">{totals ? totals.TO : "-"}</td>
                        <td className="px-2 py-1.5">
                          {totals ? assistToTurnover(totals.AST, totals.TO) : "-"}
                        </td>
                        <td className="px-2 py-1.5">{totals ? totals.STL : "-"}</td>
                        <td className="px-2 py-1.5">{totals ? totals.BLK : "-"}</td>
                        {!trimShootingColumns && (
                          <>
                            <td className="px-2 py-1.5">{totals ? totals.ThreePM : "-"}</td>
                            <td className="px-2 py-1.5">{totals ? totals.ThreePA : "-"}</td>
                            <td className="px-2 py-1.5">
                              {totals ? statPct(totals.ThreePM, totals.ThreePA) : "-"}
                            </td>
                            <td className="px-2 py-1.5">{totals ? totals.TwoPM : "-"}</td>
                          <td className="px-2 py-1.5">{totals ? totals.TwoPA : "-"}</td>
                          <td className="px-2 py-1.5">
                            {totals ? statPct(totals.TwoPM, totals.TwoPA) : "-"}
                          </td>
                          <td className="px-2 py-1.5">{totals ? totals.FTM : "-"}</td>
                          <td className="px-2 py-1.5">{totals ? totals.FTA : "-"}</td>
                          <td className="px-2 py-1.5">
                            {totals ? statPct(totals.FTM, totals.FTA) : "-"}
                          </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
            <p className="text-base font-semibold text-gray-800">
              No schedule data is available for this season yet.
            </p>
          </div>
        )}
      </section>

      <section>
        <div className="mt-8 mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Individual Stats</h2>

          {!hidePlayerStatsToggle && (
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
                aria-label="Toggle totals / averages"
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
          )}
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
                    <th className={statsHeaderCellClassName}>REB</th>
                    <th className={statsHeaderCellClassName}>AST</th>
                    <th className={statsHeaderCellClassName}>STL</th>
                    <th className={statsHeaderCellClassName}>BLK</th>
                    {!trimShootingColumns && (
                      <>
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
                    )}
                  </tr>
                </thead>
                <tbody>
                  {seasonTotals.map((player, index) => (
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
                          to={`/athletics/girls/basketball/players/${player.PlayerID}`}
                          className="text-blue-600 hover:underline"
                        >
                          {playerName(player.PlayerID)}
                        </Link>
                      </td>
                      <td className={statsBodyCellClassName}>{player.GamesPlayed}</td>
                      <td className={statsBodyCellClassName}>{valueFor(player, "Points")}</td>
                      <td className={statsBodyCellClassName}>{valueFor(player, "Rebounds")}</td>
                      <td className={statsBodyCellClassName}>{valueFor(player, "Assists")}</td>
                      <td className={statsBodyCellClassName}>{valueFor(player, "Steals")}</td>
                      <td className={statsBodyCellClassName}>{valueFor(player, "Blocks")}</td>
                      {!trimShootingColumns && (
                        <>
                          <td className={statsBodyCellClassName}>{valueFor(player, "ThreePM")}</td>
                          <td className={statsBodyCellClassName}>{valueFor(player, "ThreePA")}</td>
                          <td className={statsBodyCellClassName}>
                            {pct(player.ThreePM, player.ThreePA)}
                          </td>
                          <td className={statsBodyCellClassName}>{valueFor(player, "TwoPM")}</td>
                          <td className={statsBodyCellClassName}>{valueFor(player, "TwoPA")}</td>
                          <td className={statsBodyCellClassName}>
                            {pct(player.TwoPM, player.TwoPA)}
                          </td>
                          <td className={statsBodyCellClassName}>{valueFor(player, "FTM")}</td>
                          <td className={statsBodyCellClassName}>{valueFor(player, "FTA")}</td>
                          <td className={statsBodyCellClassName}>{pct(player.FTM, player.FTA)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-300 bg-blue-50 text-blue-950">
                  <tr>
                    <td className={statsFooterCellClassName}></td>
                    <td className={statsFooterCellClassName}>Season Totals</td>
                    <td className={statsFooterCellClassName}>{teamTotals.GamesPlayed}</td>
                    <td className={statsFooterCellClassName}>{valueFor(teamTotals, "Points")}</td>
                    <td className={statsFooterCellClassName}>{valueFor(teamTotals, "Rebounds")}</td>
                    <td className={statsFooterCellClassName}>{valueFor(teamTotals, "Assists")}</td>
                    <td className={statsFooterCellClassName}>{valueFor(teamTotals, "Steals")}</td>
                    <td className={statsFooterCellClassName}>{valueFor(teamTotals, "Blocks")}</td>
                    {!trimShootingColumns && (
                      <>
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
                        <td className={statsFooterCellClassName}>{valueFor(teamTotals, "FTM")}</td>
                        <td className={statsFooterCellClassName}>{valueFor(teamTotals, "FTA")}</td>
                        <td className={statsFooterCellClassName}>
                          {pct(teamTotals.FTM, teamTotals.FTA)}
                        </td>
                      </>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>

            {trimShootingColumns && (
              <p className="mt-2 text-center text-xs leading-relaxed text-gray-600">
                Points are the most complete totals for this season. Other categories may be
                incomplete because rebounds, assists, steals, blocks, and related stats were not
                consistently reported in newspaper recaps.
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-600">
            No individual stat totals are available for this season yet.
          </p>
        )}
      </section>
    </div>
  );
}

export default MaxPrepsSeasonPage;
