import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  buildGameRecord,
  formatRecord,
  getSeasonGames,
  getSeasonLabel,
} from "../volleyballData";

const styles = {
  page: {
    width: "100%",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: "clamp(1.25rem, 5vw, 1.5rem)",
    fontWeight: 700,
    margin: "18px 0 14px",
    color: "#000",
  },
  status: {
    textAlign: "center",
    fontSize: "1rem",
    color: "#475569",
    margin: "8px 0 20px",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
    marginBottom: "42px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "transparent",
  },
  th: {
    background: "#d1d5db",
    color: "#111",
    fontWeight: 700,
    fontSize: "clamp(0.78rem, 2.2vw, 0.95rem)",
    textAlign: "center",
    padding: "clamp(6px, 1.6vw, 10px) clamp(8px, 2vw, 12px)",
    border: "1px solid #d1d5db",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "clamp(6px, 1.6vw, 9px) clamp(8px, 2vw, 12px)",
    border: "1px solid #d1d5db",
    textAlign: "center",
    fontSize: "clamp(0.8rem, 2.3vw, 0.95rem)",
    color: "#111",
    verticalAlign: "middle",
    background: "transparent",
  },
  leftTd: {
    textAlign: "left",
  },
  notesCell: {
    textAlign: "center",
    lineHeight: 1.45,
    whiteSpace: "pre-line",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 500,
  },
  muted: {
    color: "#64748b",
  },
};

function isCompletedMatch(match) {
  return match?.Result === "W" || match?.Result === "L" || match?.Result === "T";
}

function buildRecord(matches, filterFn = () => true) {
  return buildGameRecord(matches.filter(filterFn));
}

function hasSeasonRecord(season) {
  return (
    Number.isFinite(Number(season?.OverallWins)) &&
    Number.isFinite(Number(season?.OverallLosses))
  );
}

function buildOverallRecord(season, completedMatches) {
  if (completedMatches.length > 0) return buildRecord(completedMatches);

  if (hasSeasonRecord(season)) {
    return {
      wins: Number(season.OverallWins),
      losses: Number(season.OverallLosses),
      ties: Number(season.OverallTies || 0),
      setsWon: 0,
      setsLost: 0,
    };
  }

  return buildRecord([]);
}

function formatFilteredRecord(matches, filterFn) {
  const record = buildRecord(matches, filterFn);
  return formatRecord(record.wins, record.losses, record.ties);
}

function getRegionRecord(season, completedMatches) {
  const regionMatches = completedMatches.filter((match) =>
    String(match.GameType || "").toLowerCase().includes("region")
  );

  if (regionMatches.length > 0) {
    const record = buildRecord(regionMatches);
    return formatRecord(record.wins, record.losses, record.ties);
  }

  const wins = Number(season.RegionWins);
  const losses = Number(season.RegionLosses);
  if (Number.isFinite(wins) && Number.isFinite(losses)) {
    return `${wins}-${losses}`;
  }

  return "-";
}

function getRegionAchievement(value) {
  const finish = String(value || "").trim();
  if (!finish) return "";

  if (/\bchamp/i.test(finish)) return finish;

  return "";
}

function getStateAchievement(value) {
  const finish = String(value || "").trim();
  if (!finish) return "";

  const notableStateFinish =
    /\bchamp/i.test(finish) ||
    /\bfinal\s*four\b/i.test(finish) ||
    /\bsemifinal/i.test(finish) ||
    /\brunner[-\s]?up\b/i.test(finish);

  return notableStateFinish ? finish : "";
}

function getSeasonResult(season) {
  return [
    getRegionAchievement(season.RegionFinish),
    getStateAchievement(season.StateFinish),
  ]
    .filter(Boolean)
    .join(" & ");
}

function sortSeasonEntries(entries) {
  return entries.sort((a, b) => Number(a.season.SeasonID) - Number(b.season.SeasonID));
}

function buildSeasonsWithGames(seasons, games) {
  const seasonMap = new Map();

  seasons.forEach((season) => {
    seasonMap.set(String(season.SeasonID), {
      season,
      games: [],
    });
  });

  games.forEach((game) => {
    const seasonId = game.SeasonID ?? game.Season;
    const key = String(seasonId);
    if (!seasonMap.has(key)) {
      seasonMap.set(key, {
        season: {
          SeasonID: seasonId,
          HeadCoach: null,
          RegionFinish: null,
          StateFinish: null,
        },
        games: [],
      });
    }
    seasonMap.get(key).games.push(game);
  });

  return sortSeasonEntries(
    Array.from(seasonMap.values())
      .map(({ season, games: seasonGames }) => ({
        season,
        games: getSeasonGames(seasonGames, season.SeasonID),
      }))
      .filter(
        (entry) =>
          entry.games.length > 0 ||
          hasSeasonRecord(entry.season) ||
          Boolean(entry.season.RegionFinish) ||
          Boolean(entry.season.StateFinish)
      )
  );
}

function computeCoachSummaries(seasonsWithGames) {
  const coachMap = new Map();

  seasonsWithGames.forEach(({ season, games }) => {
    const coach = season.HeadCoach || "Unknown";
    if (!coachMap.has(coach)) {
      coachMap.set(coach, {
        coach,
        seasons: [],
        wins: 0,
        losses: 0,
        ties: 0,
        notes: [],
      });
    }

    const entry = coachMap.get(coach);
    entry.seasons.push(Number(season.SeasonID));

    const completedMatches = games.filter(isCompletedMatch);
    const record = buildOverallRecord(season, completedMatches);
    entry.wins += record.wins;
    entry.losses += record.losses;
    entry.ties += record.ties;

    const result = getSeasonResult(season);
    if (result) {
      entry.notes.push(`${getSeasonLabel(season)}: ${result}`);
    }
  });

  return Array.from(coachMap.values())
    .map((entry) => {
      const totalGames = entry.wins + entry.losses + entry.ties;
      const minSeason = Math.min(...entry.seasons);
      return {
        coach: entry.coach,
        years: entry.seasons.length,
        overall: formatRecord(entry.wins, entry.losses, entry.ties),
        winPct: totalGames ? `${((entry.wins / totalGames) * 100).toFixed(1)}%` : "-",
        notes: entry.notes.join("\n"),
        sortKey: Number.isFinite(minSeason) ? minSeason : 9999,
      };
    })
    .sort((a, b) => b.sortKey - a.sortKey);
}

export default function YearlyResults({ data, status = "" }) {
  const seasonsWithGames = useMemo(
    () => buildSeasonsWithGames(data.seasons, data.games),
    [data.games, data.seasons]
  );

  const coachSummaries = useMemo(
    () => computeCoachSummaries(seasonsWithGames),
    [seasonsWithGames]
  );

  const yearlyRows = useMemo(
    () =>
      seasonsWithGames.map(({ season, games }) => {
        const completedMatches = games.filter(isCompletedMatch);
        const hasCompletedMatches = completedMatches.length > 0;
        const overall = buildOverallRecord(season, completedMatches);
        const home = hasCompletedMatches
          ? formatFilteredRecord(
              completedMatches,
              (match) => String(match.LocationType || "") === "Home"
            )
          : "-";
        const away = hasCompletedMatches
          ? formatFilteredRecord(
              completedMatches,
              (match) => String(match.LocationType || "") === "Away"
            )
          : "-";
        const playoffRecord = hasCompletedMatches
          ? buildRecord(completedMatches, (match) => {
              const gameType = String(match.GameType || "").toLowerCase();
              return gameType.includes("state") || gameType.includes("playoff");
            })
          : null;

        return {
          seasonId: season.SeasonID,
          seasonLabel: getSeasonLabel(season),
          coach: season.HeadCoach || "-",
          overall: formatRecord(overall.wins, overall.losses, overall.ties),
          region: getRegionRecord(season, completedMatches),
          home,
          away,
          playoffs: playoffRecord
            ? formatRecord(playoffRecord.wins, playoffRecord.losses, playoffRecord.ties)
            : "-",
          seasonResult: getSeasonResult(season),
        };
      }),
    [seasonsWithGames]
  );

  return (
    <div style={styles.page}>
      {status ? <div style={styles.status}>{status}</div> : null}

      <h2 style={styles.sectionTitle}>Coaching Records</h2>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Coach</th>
              <th style={styles.th}>Years</th>
              <th style={styles.th}>Overall Record</th>
              <th style={styles.th}>Win %</th>
              <th style={styles.th}>Notes (Season Results)</th>
            </tr>
          </thead>
          <tbody>
            {coachSummaries.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={5}>
                  <span style={styles.muted}>No coaching data available yet.</span>
                </td>
              </tr>
            ) : (
              coachSummaries.map((coach) => (
                <tr key={coach.coach}>
                  <td style={styles.td}>{coach.coach}</td>
                  <td style={styles.td}>{coach.years}</td>
                  <td style={styles.td}>{coach.overall}</td>
                  <td style={styles.td}>{coach.winPct}</td>
                  <td style={{ ...styles.td, ...styles.notesCell }}>{coach.notes || ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 style={styles.sectionTitle}>Full Year-by-Year Results</h2>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Season</th>
              <th style={styles.th}>Coach</th>
              <th style={styles.th}>Overall</th>
              <th style={styles.th}>Region</th>
              <th style={styles.th}>Home</th>
              <th style={styles.th}>Away</th>
              <th style={styles.th}>Playoffs</th>
              <th style={styles.th}>Season Result</th>
            </tr>
          </thead>
          <tbody>
            {yearlyRows.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={8}>
                  <span style={styles.muted}>No yearly volleyball results are available yet.</span>
                </td>
              </tr>
            ) : (
              yearlyRows.map((row) => (
                <tr key={row.seasonId}>
                  <td style={styles.td}>
                    <Link to={`/athletics/volleyball/seasons/${row.seasonId}`} style={styles.link}>
                      {row.seasonLabel}
                    </Link>
                  </td>
                  <td style={styles.td}>{row.coach}</td>
                  <td style={styles.td}>{row.overall}</td>
                  <td style={styles.td}>{row.region}</td>
                  <td style={styles.td}>{row.home}</td>
                  <td style={styles.td}>{row.away}</td>
                  <td style={styles.td}>{row.playoffs}</td>
                  <td style={{ ...styles.td, ...styles.leftTd }}>{row.seasonResult}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
