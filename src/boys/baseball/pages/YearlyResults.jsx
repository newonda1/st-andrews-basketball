import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const styles = {
  pageTitle: {
    marginTop: 0,
    marginBottom: "8px",
    fontSize: "2rem",
    color: "#0f172a",
  },
  intro: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#475569",
    lineHeight: 1.6,
  },
  status: {
    padding: "14px 16px",
    borderRadius: "12px",
    background: "#f8fafc",
    color: "#334155",
    marginBottom: "18px",
    border: "1px solid #e2e8f0",
  },
  seasonCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "22px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  seasonHeader: {
    background: "#0f172a",
    color: "white",
    padding: "16px 18px",
  },
  seasonTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  seasonTitle: {
    margin: 0,
    fontSize: "1.35rem",
  },
  recordBadge: {
    fontWeight: 700,
    background: "rgba(255,255,255,0.12)",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  seasonMeta: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    fontSize: "0.95rem",
    opacity: 0.92,
  },
  seasonBody: {
    padding: "18px",
    background: "white",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
    marginBottom: "18px",
  },
  summaryBox: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px 14px",
    background: "#f8fafc",
  },
  summaryLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "0.82rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  summaryValue: {
    margin: "6px 0 0",
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "760px",
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #e2e8f0",
    color: "#0f172a",
    verticalAlign: "top",
  },
  muted: {
    color: "#64748b",
  },
  win: {
    fontWeight: 700,
    color: "#166534",
  },
  loss: {
    fontWeight: 700,
    color: "#b91c1c",
  },
  gameLink: {
    color: "#7c2d12",
    textDecoration: "none",
    fontWeight: 700,
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
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function seasonLabel(seasonId) {
  return String(seasonId ?? "");
}

function buildRecord(games, filterFn = () => true) {
  const filtered = games.filter(filterFn);
  const wins = filtered.filter((game) => game.Result === "W").length;
  const losses = filtered.filter((game) => game.Result === "L").length;
  return `${wins}-${losses}`;
}

function classifyGameType(gameType) {
  const value = String(gameType ?? "").toLowerCase();
  if (value.includes("region")) return "Region";
  if (value.includes("state")) return "State Tournament";
  if (value.includes("playoff")) return "State Tournament";
  if (value.includes("showcase")) return "Showcase";
  return "Non-Region";
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

        if (!safeGames.length) {
          setStatus("No baseball games were found yet.");
        } else {
          setStatus(`Loaded ${safeGames.length} baseball games.`);
        }
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
        games: seasonGames.slice().sort((a, b) => Number(a.GameID) - Number(b.GameID)),
      }))
      .filter((entry) => entry.games.length > 0)
      .sort((a, b) => Number(b.season.SeasonID) - Number(a.season.SeasonID));
  }, [games, seasons]);

  return (
    <div>
      <h1 style={styles.pageTitle}>Yearly Results</h1>
      <p style={styles.intro}>
        This page gives you a season-by-season view of the baseball results that
        have already been entered. It is a good place to verify scores, dates,
        opponents, and win-loss records as the database is being built.
      </p>

      <div style={styles.status}>{status}</div>

      {seasonsWithGames.length === 0 ? (
        <div style={styles.status}>No season results are available yet.</div>
      ) : (
        seasonsWithGames.map(({ season, games: seasonGames }) => {
          const overallRecord = buildRecord(seasonGames);
          const homeRecord = buildRecord(seasonGames, (game) => game.LocationType === "Home");
          const awayRecord = buildRecord(seasonGames, (game) => game.LocationType === "Away");
          const neutralRecord = buildRecord(seasonGames, (game) => game.LocationType === "Neutral");
          const regionRecord = buildRecord(
            seasonGames,
            (game) => String(game.GameType ?? "").toLowerCase().includes("region")
          );

          return (
            <section key={season.SeasonID} style={styles.seasonCard}>
              <div style={styles.seasonHeader}>
                <div style={styles.seasonTitleRow}>
                  <h2 style={styles.seasonTitle}>{seasonLabel(season.SeasonID)} Season</h2>
                  <div style={styles.recordBadge}>Overall: {overallRecord}</div>
                </div>

                <div style={styles.seasonMeta}>
                  <span>Head Coach: {season.HeadCoach || "—"}</span>
                  <span>Region Finish: {season.RegionFinish || "—"}</span>
                  <span>State Finish: {season.StateFinish || "—"}</span>
                </div>
              </div>

              <div style={styles.seasonBody}>
                <div style={styles.summaryGrid}>
                  <div style={styles.summaryBox}>
                    <p style={styles.summaryLabel}>Overall</p>
                    <p style={styles.summaryValue}>{overallRecord}</p>
                  </div>
                  <div style={styles.summaryBox}>
                    <p style={styles.summaryLabel}>Home</p>
                    <p style={styles.summaryValue}>{homeRecord}</p>
                  </div>
                  <div style={styles.summaryBox}>
                    <p style={styles.summaryLabel}>Away</p>
                    <p style={styles.summaryValue}>{awayRecord}</p>
                  </div>
                  <div style={styles.summaryBox}>
                    <p style={styles.summaryLabel}>Neutral</p>
                    <p style={styles.summaryValue}>{neutralRecord}</p>
                  </div>
                  <div style={styles.summaryBox}>
                    <p style={styles.summaryLabel}>Region</p>
                    <p style={styles.summaryValue}>{regionRecord}</p>
                  </div>
                </div>

                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Opponent</th>
                        <th style={styles.th}>Site</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Result</th>
                        <th style={styles.th}>Score</th>
                        <th style={styles.th}>Game ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonGames.map((game) => {
                        const hasScore =
                          game.TeamScore !== null &&
                          game.TeamScore !== undefined &&
                          game.OpponentScore !== null &&
                          game.OpponentScore !== undefined;

                        return (
                          <tr key={game.GameID}>
                            <td style={styles.td}>{formatDateFromGameId(game.GameID)}</td>
                            <td style={styles.td}>{game.Opponent || "—"}</td>
                            <td style={styles.td}>{game.LocationType || "—"}</td>
                            <td style={styles.td}>{classifyGameType(game.GameType)}</td>
                            <td style={styles.td}>
                              <span style={game.Result === "W" ? styles.win : styles.loss}>
                                {game.Result || "—"}
                              </span>
                            </td>
                            <td style={styles.td}>
                              {hasScore ? `${game.TeamScore} - ${game.OpponentScore}` : <span style={styles.muted}>—</span>}
                            </td>
                            <td style={styles.td}>
                              <Link to={`/athletics/boys/baseball/games/${game.GameID}`} style={styles.gameLink}>
                                {game.GameID}
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}