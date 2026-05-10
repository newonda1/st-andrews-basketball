import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
      className={`px-2 py-2 ${alignmentClass} text-xs cursor-pointer select-none whitespace-nowrap ${className}`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {arrow}
    </th>
  );
}

function StatTable({ children }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
      <table className="min-w-full bg-white text-sm">{children}</table>
    </div>
  );
}

function HeaderCell({ children, className = "" }) {
  const alignmentClass = className.includes("text-left") ? "" : "text-center";
  return <th className={`px-3 py-1.5 ${alignmentClass} ${className}`}>{children}</th>;
}

function BodyCell({ children, className = "" }) {
  const alignmentClass = className.includes("text-left") ? "" : "text-center";
  return <td className={`px-3 py-1.5 ${alignmentClass} ${className}`}>{children}</td>;
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
  return school?.ShortName || school?.Name || fallback;
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
    <div className="pt-2 pb-10 lg:pb-40 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">{title}</h1>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Season Recap</h2>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center shadow-sm">
          <p className="text-base font-semibold text-gray-800">Season recap not ready yet</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            A written recap for the Spring {seasonId} softball season will be added here.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Season Images</h2>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center shadow-sm">
          <p className="text-base font-semibold text-gray-800">Season photo gallery coming soon</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Photos from the Spring {seasonId} softball season will be added here.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Roster</h2>
        <StatTable>
          <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
            <tr>
              <HeaderCell className="text-left">Player</HeaderCell>
              <HeaderCell>Grade</HeaderCell>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {rosterRows.map((player, index) => (
              <tr key={player.playerId} className={rowClass(index)}>
                <BodyCell className="whitespace-nowrap text-left font-medium">
                  <Link
                    to={`${SOFTBALL_BASE_PATH}/players/${player.playerId}`}
                    className="text-blue-700 hover:underline"
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
        <h2 className="text-2xl font-semibold mt-8 mb-4">Schedule &amp; Results</h2>
        <StatTable>
          <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
            <tr>
              <HeaderCell className="text-left">Date</HeaderCell>
              <HeaderCell className="text-left">Opponent</HeaderCell>
              <HeaderCell>Site</HeaderCell>
              <HeaderCell>Type</HeaderCell>
              <HeaderCell>Result</HeaderCell>
              <HeaderCell>Score</HeaderCell>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {games.map((game, index) => {
              const school = resolveSchoolForGame(game, schoolLookup);
              const opponentName = getSchoolDisplayName(school, game.opponent);
              const logoPath = getSchoolLogoPath(school);
              const site = game.locationType || "-";
              const type = game.gameType || "-";
              const score =
                game.teamScore == null || game.opponentScore == null
                  ? "-"
                  : `${game.teamScore} - ${game.opponentScore}`;

              return (
                <tr key={game.id} className={rowClass(index)}>
                  <BodyCell className="whitespace-nowrap text-left">{game.displayDate}</BodyCell>
                  <BodyCell className="whitespace-nowrap text-left">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-10 shrink-0 items-center justify-center">
                        {logoPath ? (
                          <img
                            src={logoPath}
                            alt=""
                            className="max-h-8 max-w-10 object-contain"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : game.isPlaceholder ? null : (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-[0.65rem] font-bold text-slate-600">
                            {getSchoolInitials(opponentName)}
                          </span>
                        )}
                      </div>
                      {game.isPlaceholder ? (
                        <span className="text-slate-600">Unknown</span>
                      ) : (
                        <Link
                          to={`${SOFTBALL_BASE_PATH}/games/${game.id}`}
                          className="text-blue-700 hover:underline"
                        >
                          {opponentName}
                        </Link>
                      )}
                    </div>
                  </BodyCell>
                  <BodyCell>{site}</BodyCell>
                  <BodyCell>{type}</BodyCell>
                  <BodyCell className="font-semibold">{game.result}</BodyCell>
                  <BodyCell className="whitespace-nowrap">{score}</BodyCell>
                </tr>
              );
            })}
          </tbody>
        </StatTable>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Hitting Statistics</h2>
        <StatTable>
          <thead className="bg-gray-100 text-gray-700">
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
          <tbody className="text-sm text-gray-800">
            {hittingRows.map((row, index) => (
              <tr key={row.playerId} className={rowClass(index)}>
                <BodyCell className="whitespace-nowrap text-left font-medium">
                  <Link
                    to={`${SOFTBALL_BASE_PATH}/players/${row.playerId}`}
                    className="text-blue-700 hover:underline"
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
        <h2 className="text-2xl font-semibold mt-8 mb-4">Pitching Statistics</h2>
        <StatTable>
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <SortableHeader label="Player" sortKey="player" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} className="text-left" />
              <SortableHeader label="APP" sortKey="appearances" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
              <SortableHeader label="W" sortKey="wins" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
              <SortableHeader label="L" sortKey="losses" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
              <SortableHeader label="SV" sortKey="saves" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {pitchingRows.map((row, index) => (
              <tr key={row.playerId} className={rowClass(index)}>
                <BodyCell className="whitespace-nowrap text-left font-medium">
                  <Link
                    to={`${SOFTBALL_BASE_PATH}/players/${row.playerId}`}
                    className="text-blue-700 hover:underline"
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
