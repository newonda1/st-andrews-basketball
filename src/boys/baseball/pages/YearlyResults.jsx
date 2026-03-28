import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
  noData: {
    textAlign: "center",
    color: "#64748b",
    padding: "18px 0 6px",
  },
};

function formatDateFromGameId(gameId) {
  const value = String(gameId ?? "").slice(0, 8);
  if (value.length !== 8) return "—";

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
    timeZone: "UTC",
  });
}

function seasonDisplay(seasonId) {
  const year = Number(seasonId);
  if (!Number.isFinite(year)) return String(seasonId ?? "—");
  return String(year);
}

function buildRecord(games, filterFn = () => true) {
  const filtered = games.filter(filterFn);
  const wins = filtered.filter((game) => game.Result === "W").length;
  const losses = filtered.filter((game) => game.Result === "L").length;
  return { wins, losses, text: `${wins}–${losses}` };
}

function isCompletedGame(game) {
  return game?.Result === "W" || game?.Result === "L";
}

function sortGamesChronologically(games) {
  return games.slice().sort((a, b) => Number(a.GameID) - Number(b.GameID));
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
        notes: [],
      });
    }

    const entry = coachMap.get(coach);
    entry.seasons.push(Number(season.SeasonID));

    const overall = buildRecord(games);
    entry.wins += overall.wins;
    entry.losses += overall.losses;

    const notes = [];
    if (season.RegionFinish) notes.push(season.RegionFinish);
    if (season.StateFinish) notes.push(season.StateFinish);
    if (notes.length) {
      entry.notes.push(`${seasonDisplay(season.SeasonID)}: ${notes.join(" & ")}`);
    }
  });

  return Array.from(coachMap.values())
    .map((entry) => {
      const totalGames = entry.wins + entry.losses;
      const winPct = totalGames ? `${((entry.wins / totalGames) * 100).toFixed(1)}%` : "—";
      const minSeason = Math.min(...entry.seasons);
      return {
        coach: entry.coach,
        years: entry.seasons.length,
        overall: `${entry.wins}–${entry.losses}`,
        winPct,
        notes: entry.notes.join("\n"),
        sortKey: Number.isFinite(minSeason) ? minSeason : 9999,
      };
    })
    .sort((a, b) => b.sortKey - a.sortKey);
}

export default function YearlyResults() {
  const [games, setGames] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [status, setStatus] = useState("Loading baseball results...");

  useEffect(() => {
    async function loadData() {
      try {
        const [gamesRes, seasonsRes] = await Promise.all([
          fetch("/data/boys/baseball/games.json"),
          fetch("/data/boys/baseball/seasons.json"),
        ]);

        if (!gamesRes.ok) {
          throw new Error(`Could not load games.json (${gamesRes.status}).`);
        }
        if (!seasonsRes.ok) {
          throw new Error(`Could not load seasons.json (${seasonsRes.status}).`);
        }

        const [gamesData, seasonsData] = await Promise.all([
          gamesRes.json(),
          seasonsRes.json(),
        ]);

        const safeGames = Array.isArray(gamesData) ? gamesData : [];
        const safeSeasons = Array.isArray(seasonsData) ? seasonsData : [];

        setGames(safeGames);
        setSeasons(safeSeasons);
        setStatus("");
      } catch (error) {
        setStatus(error?.message || "Failed to load baseball data.");
      }
    }

    loadData();
  }, []);

  const seasonsWithGames = useMemo(() => {
    const seasonMap = new Map();

    seasons.forEach((season) => {
      seasonMap.set(String(season.SeasonID), {
        season,
        games: [],
      });
    });

    games.forEach((game) => {
      const key = String(game.Season);
      if (!seasonMap.has(key)) {
        seasonMap.set(key, {
          season: {
            SeasonID: game.Season,
            HeadCoach: null,
            RegionFinish: null,
            StateFinish: null,
          },
          games: [],
        });
      }
      seasonMap.get(key).games.push(game);
    });

    return Array.from(seasonMap.values())
      .map(({ season, games: seasonGames }) => ({
        season,
        games: sortGamesChronologically(seasonGames),
      }))
      .filter((entry) => entry.games.length > 0)
      .sort((a, b) => Number(a.season.SeasonID) - Number(b.season.SeasonID));
  }, [games, seasons]);

  const coachSummaries = useMemo(
    () => computeCoachSummaries(seasonsWithGames),
    [seasonsWithGames]
  );

  const yearlyRows = useMemo(() => {
    return seasonsWithGames.map(({ season, games: seasonGames }) => {
      const completedGames = seasonGames.filter(isCompletedGame);

      const overall = buildRecord(completedGames).text;
      const region = buildRecord(
        completedGames,
        (game) => String(game.GameType ?? "").toLowerCase() === "region"
      ).text;
      const home = buildRecord(
        completedGames,
        (game) => String(game.LocationType ?? "") === "Home"
      ).text;
      const away = buildRecord(
        completedGames,
        (game) => String(game.LocationType ?? "") === "Away"
      ).text;
      const playoffs = buildRecord(
        completedGames,
        (game) => {
          const gameType = String(game.GameType ?? "").toLowerCase();
          return gameType.includes("state") || gameType.includes("playoff");
        }
      ).text;

      const seasonResults = [season.RegionFinish, season.StateFinish].filter(Boolean).join(" & ");

      return {
        seasonId: season.SeasonID,
        seasonLabel: seasonDisplay(season.SeasonID),
        coach: season.HeadCoach || "—",
        overall,
        region,
        home,
        away,
        playoffs,
        seasonResult: seasonResults || "",
      };
    });
  }, [seasonsWithGames]);

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
                  <span style={styles.muted}>No yearly baseball results are available yet.</span>
                </td>
              </tr>
            ) : (
              yearlyRows.map((row) => (
                <tr key={row.seasonId}>
                  <td style={styles.td}>
                    <Link to={`/athletics/boys/baseball/seasons/${row.seasonId}`} style={styles.link}>
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
