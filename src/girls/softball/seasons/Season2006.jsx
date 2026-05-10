import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { athleteProfilePath } from "../../../athletes/archiveEra";
import {
  SOFTBALL_BASE_PATH,
  getSoftballPlayerIdsForSeason,
  getSoftballSeasonGames,
  getSoftballSeasonHittingRows,
  getSoftballSeasonPitchingRows,
} from "../softballData";

const DEFAULT_SEASON_ID = 2006;

function formatAverage(hits, atBats) {
  if (!atBats) return "-";
  return (hits / atBats).toFixed(3).replace(/^0(?=\.)/, "");
}

function SortableHeader({ label, sortKey, sortConfig, onSort, className = "" }) {
  const arrow =
    sortConfig.key !== sortKey ? "" : sortConfig.direction === "asc" ? " ↑" : " ↓";
  const alignmentClass = className.includes("text-left") ? "" : "text-center";

  return (
    <th
      className={`px-2 py-2 ${alignmentClass} text-xs font-normal cursor-pointer select-none whitespace-nowrap ${className}`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {arrow}
    </th>
  );
}

function StatTable({ children, className = "" }) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 bg-white shadow ${className}`}>
      <table className="min-w-full bg-white text-sm">{children}</table>
    </div>
  );
}

function HeaderCell({ children, className = "" }) {
  const alignmentClass = className.includes("text-left") ? "" : "text-center";
  return (
    <th className={`px-2 py-2 text-xs font-normal whitespace-nowrap ${alignmentClass} ${className}`}>
      {children}
    </th>
  );
}

function BodyCell({ children, className = "" }) {
  const alignmentClass = className.includes("text-left") ? "" : "text-center";
  return <td className={`px-2 py-1.5 align-middle whitespace-nowrap ${alignmentClass} ${className}`}>{children}</td>;
}

function rowClass(index) {
  return `border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`;
}

function getPlayerDisplayName(player) {
  return (
    player?.PlayerName ||
    [player?.FirstName, player?.LastName].filter(Boolean).join(" ") ||
    "Unknown Player"
  );
}

function normalizeSchoolName(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildSchoolLookup(schools) {
  const byId = new Map();
  const byName = new Map();

  schools.forEach((school) => {
    if (school?.SchoolID) byId.set(String(school.SchoolID), school);

    [school?.Name, school?.ShortName].forEach((name) => {
      const key = normalizeSchoolName(name);
      if (key && !byName.has(key)) byName.set(key, school);
    });
  });

  return { byId, byName };
}

function resolveSchoolForGame(game, schoolLookup) {
  const id = String(game?.OpponentID || "").trim();
  if (id && schoolLookup.byId.has(id)) return schoolLookup.byId.get(id);

  const nameKey = normalizeSchoolName(game?.opponent || game?.Opponent);
  if (nameKey && schoolLookup.byName.has(nameKey)) return schoolLookup.byName.get(nameKey);

  return null;
}

function getSchoolDisplayName(school, fallback = "") {
  return school?.Name || fallback;
}

function getSchoolLogoPath(school) {
  return school?.LogoPath || school?.BracketLogoPath || null;
}

function getSchoolInitials(name) {
  const words = String(name || "")
    .replace(/[^A-Za-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "?";
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function formatSoftballScore(game) {
  if (game.teamScore == null || game.opponentScore == null) return "-";
  return `${game.teamScore}-${game.opponentScore}`;
}

function resultClassName(result) {
  if (result === "W") return "text-green-700";
  if (result === "L") return "text-red-700";
  return "text-gray-500";
}

function gradeFromGradYear(gradYear, seasonId) {
  const grad = Number(gradYear);
  const season = Number(seasonId);
  if (!Number.isFinite(grad) || !Number.isFinite(season)) return null;
  const grade = 12 + season - grad;
  return grade >= 7 && grade <= 12 ? grade : null;
}

function formatGrade(grade) {
  if (grade === 7) return "7th";
  if (grade === 8) return "8th";
  if (grade === 9) return "Fr.";
  if (grade === 10) return "So.";
  if (grade === 11) return "Jr.";
  if (grade === 12) return "Sr.";
  return "-";
}

function sortRows(rows, sortConfig) {
  return rows.slice().sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === "string" || typeof bValue === "string") {
      const comparison = String(aValue || "").localeCompare(String(bValue || ""));
      return sortConfig.direction === "asc" ? comparison : -comparison;
    }

    const aNumber = Number.isFinite(aValue) ? aValue : -Infinity;
    const bNumber = Number.isFinite(bValue) ? bValue : -Infinity;
    if (aNumber < bNumber) return sortConfig.direction === "asc" ? -1 : 1;
    if (aNumber > bNumber) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
}

export function SoftballSeasonPage({
  seasonId = DEFAULT_SEASON_ID,
  title = "Spring 2006 Season",
}) {
  const [masterPlayers, setMasterPlayers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [hittingSort, setHittingSort] = useState({ key: "hits", direction: "desc" });
  const [pitchingSort, setPitchingSort] = useState({ key: "wins", direction: "desc" });

  const games = useMemo(() => getSoftballSeasonGames(seasonId), [seasonId]);
  const hittingRows = useMemo(
    () => sortRows(getSoftballSeasonHittingRows(seasonId), hittingSort),
    [seasonId, hittingSort]
  );
  const pitchingRows = useMemo(
    () => sortRows(getSoftballSeasonPitchingRows(seasonId), pitchingSort),
    [seasonId, pitchingSort]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPlayers() {
      const res = await fetch("/data/players.json");
      const data = await res.json();
      if (!cancelled) setMasterPlayers(Array.isArray(data) ? data : []);
    }

    loadPlayers();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSchools() {
      const res = await fetch("/data/schools.json");
      const data = await res.json();
      if (!cancelled) setSchools(Array.isArray(data) ? data : []);
    }

    loadSchools();
    return () => {
      cancelled = true;
    };
  }, []);

  const playerMap = useMemo(() => {
    const map = new Map();
    masterPlayers.forEach((player) => {
      map.set(String(player.PlayerID), player);
    });
    return map;
  }, [masterPlayers]);

  const rosterRows = useMemo(() => {
    return getSoftballPlayerIdsForSeason(seasonId)
      .map((playerId) => {
        const player = playerMap.get(String(playerId));
        const grade = gradeFromGradYear(player?.GradYear, seasonId);
        return {
          playerId: String(playerId),
          name: getPlayerDisplayName(player),
          grade,
        };
      })
      .sort((a, b) => {
        if ((b.grade || 0) !== (a.grade || 0)) return (b.grade || 0) - (a.grade || 0);
        return a.name.localeCompare(b.name);
      });
  }, [playerMap, seasonId]);

  const schoolLookup = useMemo(() => buildSchoolLookup(schools), [schools]);

  const handleSortFactory = (setter) => (key) => {
    setter((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: key === "player" ? "asc" : "desc" };
    });
  };

  const getStatPlayerName = (row) => {
    const player = playerMap.get(String(row.playerId));
    return player ? getPlayerDisplayName(player) : row.player;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-10 pt-2 lg:pb-40">
      <h1 className="text-3xl font-bold text-center mb-2">{title}</h1>

      <section>
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Season Recap</h2>
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center shadow-sm">
          <p className="text-base font-semibold text-gray-800">Season recap not ready yet</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            A written recap for the Spring {seasonId} softball season will be added here.
          </p>
        </div>
      </section>

      <section>
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Season Images</h2>
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center shadow-sm">
          <p className="text-base font-semibold text-gray-800">Season photo gallery coming soon</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Photos from the Spring {seasonId} softball season will be added here.
          </p>
        </div>
      </section>

      <section>
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Roster</h2>
        </div>
        <StatTable>
          <thead className="bg-gray-100 text-xs font-normal uppercase tracking-wide text-gray-700">
            <tr>
              <HeaderCell className="text-left">Player</HeaderCell>
              <HeaderCell>Grade</HeaderCell>
            </tr>
          </thead>
          <tbody>
            {rosterRows.map((player, index) => (
              <tr key={player.playerId} className={rowClass(index)}>
                <BodyCell className="text-left">
                  <Link
                    to={athleteProfilePath(player.playerId, "softball")}
                    className="text-blue-600 hover:underline"
                  >
                    {player.name}
                  </Link>
                </BodyCell>
                <BodyCell>{formatGrade(player.grade)}</BodyCell>
              </tr>
            ))}
          </tbody>
        </StatTable>
      </section>

      <section>
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>
        </div>

        <div className="grid gap-3 sm:hidden">
          {games.map((game) => {
            const school = resolveSchoolForGame(game, schoolLookup);
            const opponentName = getSchoolDisplayName(school, game.Opponent || game.opponent || "Unknown");
            const logoPath = getSchoolLogoPath(school);

            return (
              <Link
                key={game.id}
                to={`${SOFTBALL_BASE_PATH}/games/${game.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 text-gray-900 no-underline shadow-sm transition hover:border-blue-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="mb-2 text-sm text-gray-600">{game.displayDate}</p>
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
                        ) : game.isPlaceholder ? null : (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-[0.65rem] text-slate-600">
                            {getSchoolInitials(opponentName)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg leading-snug">{game.isPlaceholder ? "Unknown" : opponentName}</h3>
                        <p className="mt-2 text-sm text-gray-600">
                          {[game.locationType || "-", game.gameType || "-"].join(" • ")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-lg ${resultClassName(game.result)}`}>{game.result || "-"}</p>
                    <p className="text-sm">{formatSoftballScore(game)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <StatTable className="hidden sm:block">
          <thead className="bg-gray-100 text-xs font-normal uppercase tracking-wide text-gray-700">
            <tr>
              <HeaderCell className="text-left">Date</HeaderCell>
              <HeaderCell className="pl-10 text-left">Opponent</HeaderCell>
              <HeaderCell>Location</HeaderCell>
              <HeaderCell>Result</HeaderCell>
              <HeaderCell>Score</HeaderCell>
              <HeaderCell>Type</HeaderCell>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => {
              const school = resolveSchoolForGame(game, schoolLookup);
              const opponentName = getSchoolDisplayName(school, game.Opponent || game.opponent || "Unknown");
              const logoPath = getSchoolLogoPath(school);
              const site = game.locationType || "-";
              const type = game.gameType || "-";
              const score = formatSoftballScore(game);

              return (
                <tr key={game.id} className={rowClass(index)}>
                  <BodyCell className="text-left">{game.displayDate}</BodyCell>
                  <BodyCell className="text-left">
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
                        ) : game.isPlaceholder ? null : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-[0.65rem] text-slate-600">
                            {getSchoolInitials(opponentName)}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`${SOFTBALL_BASE_PATH}/games/${game.id}`}
                        className="text-blue-700 underline hover:text-blue-900"
                      >
                        {game.isPlaceholder ? "Unknown" : opponentName}
                      </Link>
                    </div>
                  </BodyCell>
                  <BodyCell>{site}</BodyCell>
                  <BodyCell className={resultClassName(game.result)}>{game.result || "-"}</BodyCell>
                  <BodyCell>{score}</BodyCell>
                  <BodyCell>{type}</BodyCell>
                </tr>
              );
            })}
          </tbody>
        </StatTable>
      </section>

      <section>
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Hitting Statistics</h2>
        </div>
        <StatTable>
          <thead className="bg-gray-100 font-normal text-gray-700">
            <tr>
              <SortableHeader label="Player" sortKey="player" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} className="text-left" />
              <SortableHeader label="GP" sortKey="gamesPlayed" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
              <SortableHeader label="AB" sortKey="atBats" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
              <SortableHeader label="H" sortKey="hits" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
              <SortableHeader label="2B" sortKey="doubles" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
              <SortableHeader label="3B" sortKey="triples" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
              <SortableHeader label="HR" sortKey="homeRuns" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
              <SortableHeader label="RBI" sortKey="rbi" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
              <SortableHeader label="AVG" sortKey="average" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
            </tr>
          </thead>
          <tbody>
            {hittingRows.map((row, index) => (
              <tr key={row.playerId} className={rowClass(index)}>
                <BodyCell className="text-left">
                  <Link
                    to={athleteProfilePath(row.playerId, "softball")}
                    className="text-blue-600 hover:underline"
                  >
                    {getStatPlayerName(row)}
                  </Link>
                </BodyCell>
                <BodyCell>{row.gamesPlayed}</BodyCell>
                <BodyCell>{row.atBats}</BodyCell>
                <BodyCell>{row.hits}</BodyCell>
                <BodyCell>{row.doubles}</BodyCell>
                <BodyCell>{row.triples}</BodyCell>
                <BodyCell>{row.homeRuns}</BodyCell>
                <BodyCell>{row.rbi}</BodyCell>
                <BodyCell>{formatAverage(row.hits, row.atBats)}</BodyCell>
              </tr>
            ))}
          </tbody>
        </StatTable>
      </section>

      <section>
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Pitching Statistics</h2>
        </div>
        <StatTable>
          <thead className="bg-gray-100 font-normal text-gray-700">
            <tr>
              <SortableHeader label="Player" sortKey="player" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} className="text-left" />
              <SortableHeader label="APP" sortKey="appearances" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
              <SortableHeader label="W" sortKey="wins" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
              <SortableHeader label="L" sortKey="losses" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
              <SortableHeader label="SV" sortKey="saves" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
            </tr>
          </thead>
          <tbody>
            {pitchingRows.map((row, index) => (
              <tr key={row.playerId} className={rowClass(index)}>
                <BodyCell className="text-left">
                  <Link
                    to={athleteProfilePath(row.playerId, "softball")}
                    className="text-blue-600 hover:underline"
                  >
                    {getStatPlayerName(row)}
                  </Link>
                </BodyCell>
                <BodyCell>{row.appearances}</BodyCell>
                <BodyCell>{row.wins}</BodyCell>
                <BodyCell>{row.losses}</BodyCell>
                <BodyCell>{row.saves}</BodyCell>
              </tr>
            ))}
          </tbody>
        </StatTable>
      </section>

    </div>
  );
}

export default function Season2006() {
  return <SoftballSeasonPage seasonId={DEFAULT_SEASON_ID} title="Spring 2006 Season" />;
}
