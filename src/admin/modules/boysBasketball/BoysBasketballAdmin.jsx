import React, { useEffect, useMemo, useState } from "react";

/**
 * Boys Basketball Admin – Box Score Entry UI (full-game at once)
 * Fixes:
 * 1) Export ONLY current game's stat rows
 * 2) Skip blank rows reliably
 * 3) Add DNP checkbox to explicitly exclude players
 */

function absUrl(path) {
  return new URL(path, window.location.origin).toString();
}

async function fetchJson(label, path) {
  const url = absUrl(path);
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  if (!res.ok) throw new Error(`${label} failed (HTTP ${res.status}) at ${path}`);

  const trimmed = text.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    throw new Error(
      `${label} did not return JSON at ${path}.\n` +
        `It returned HTML (SPA fallback). Ensure the file exists in /public at that path.\n\n` +
        `First 80 chars:\n${trimmed.slice(0, 80)}...`
    );
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(
      `${label} returned invalid JSON at ${path}.\n` +
        `JSON parse error: ${String(e?.message || e)}`
    );
  }
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function seasonIdToYear(seasonId) {
  // "2025-26" -> 2025
  const first = String(seasonId).split("-")[0];
  const yr = Number(first);
  return Number.isFinite(yr) ? yr : null;
}

function numOrZero(v) {
  if (v === "" || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sortByJerseyThenName(a, b) {
  const ja = Number.isFinite(Number(a.JerseyNumber)) ? Number(a.JerseyNumber) : 999;
  const jb = Number.isFinite(Number(b.JerseyNumber)) ? Number(b.JerseyNumber) : 999;
  if (ja !== jb) return ja - jb;
  return String(a.Name).localeCompare(String(b.Name));
}

const STAT_KEYS = [
  "Points",
  "Rebounds",
  "Assists",
  "Turnovers",
  "Steals",
  "Blocks",
  "TwoPM",
  "TwoPA",
  "ThreePM",
  "ThreePA",
  "FTM",
  "FTA",
];

const STAT_LABELS = {
  Points: "PTS",
  Rebounds: "REB",
  Assists: "AST",
  Turnovers: "TO",
  Steals: "STL",
  Blocks: "BLK",
  TwoPM: "2PM",
  TwoPA: "2PA",
  ThreePM: "3PM",
  ThreePA: "3PA",
  FTM: "FTM",
  FTA: "FTA",
};

function emptyRow() {
  const o = { DNP: false };
  for (const k of STAT_KEYS) o[k] = "";
  return o;
}

function rowHasAnyEnteredValue(row) {
  if (!row) return false;
  if (row.DNP) return false;
  return STAT_KEYS.some((k) => String(row[k] ?? "").trim() !== "");
}

export default function BoysBasketballAdmin() {
  const PATHS = {
    players: "/data/boys/basketball/players.json",
    seasonRosters: "/data/boys/basketball/seasonrosters.json",
    games: "/data/boys/basketball/games.json",
    playerGameStats: "/data/boys/basketball/playergamestats.json",
  };

  const [players, setPlayers] = useState([]);
  const [seasonRosters, setSeasonRosters] = useState([]);
  const [games, setGames] = useState([]);
  const [playerGameStats, setPlayerGameStats] = useState([]);

  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedGameId, setSelectedGameId] = useState("");

  // boxScore[playerId] = { DNP, Points, Rebounds, ... }
  const [boxScore, setBoxScore] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // If checked, saving replaces existing rows for this game/player.
  const [overwriteExisting, setOverwriteExisting] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const [p, r, g, s] = await Promise.all([
          fetchJson("players.json", PATHS.players),
          fetchJson("seasonrosters.json", PATHS.seasonRosters),
          fetchJson("games.json", PATHS.games),
          fetchJson("playergamestats.json", PATHS.playerGameStats),
        ]);

        setPlayers(Array.isArray(p) ? p : []);
        setSeasonRosters(Array.isArray(r) ? r : []);
        setGames(Array.isArray(g) ? g : []);
        setPlayerGameStats(Array.isArray(s) ? s : []);

        if (Array.isArray(r) && r.length > 0) setSelectedSeason(r[0].SeasonID);
      } catch (e) {
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seasonYear = useMemo(() => seasonIdToYear(selectedSeason), [selectedSeason]);

  const selectedRoster = useMemo(() => {
    return seasonRosters.find((x) => x.SeasonID === selectedSeason) || null;
  }, [seasonRosters, selectedSeason]);

  const rosterPlayersDetailed = useMemo(() => {
    if (!selectedRoster?.Players) return [];

    const arr = selectedRoster.Players.map((entry) => {
      const player = players.find((p) => Number(p.PlayerID) === Number(entry.PlayerID));
      return {
        PlayerID: Number(entry.PlayerID),
        JerseyNumber: entry.JerseyNumber,
        Name: player ? `${player.FirstName} ${player.LastName}` : "Unknown Player",
        GradYear: player?.GradYear ?? "",
      };
    });

    return arr.sort(sortByJerseyThenName);
  }, [selectedRoster, players]);

  const gamesForSeason = useMemo(() => {
    if (!Number.isFinite(seasonYear)) return [];
    return games
      .filter((g) => Number(g.Season) === seasonYear)
      .sort((a, b) => Number(a.GameID) - Number(b.GameID));
  }, [games, seasonYear]);

  const selectedGame = useMemo(() => {
    const gid = Number(selectedGameId);
    if (!Number.isFinite(gid)) return null;
    return gamesForSeason.find((g) => Number(g.GameID) === gid) || null;
  }, [gamesForSeason, selectedGameId]);

  // Existing stats for this GameID
  const existingStatsMap = useMemo(() => {
    const gid = Number(selectedGame?.GameID);
    if (!Number.isFinite(gid)) return new Map();

    const map = new Map();
    for (const s of playerGameStats) {
      if (Number(s.GameID) !== gid) continue;
      map.set(Number(s.PlayerID), s);
    }
    return map;
  }, [playerGameStats, selectedGame]);

  // When season changes, reset game + box score
  useEffect(() => {
    setSelectedGameId("");
    setBoxScore({});
  }, [selectedSeason]);

  // When game changes, generate rows for roster and prefill any existing stats
  useEffect(() => {
    if (!selectedGame || rosterPlayersDetailed.length === 0) {
      setBoxScore({});
      return;
    }

    const next = {};
    for (const p of rosterPlayersDetailed) {
      const existing = existingStatsMap.get(Number(p.PlayerID));
      if (existing) {
        const row = emptyRow();
        // Prefill values as strings so inputs show them
        for (const k of STAT_KEYS) row[k] = existing?.[k] ?? "";
        row.DNP = false;
        next[p.PlayerID] = row;
      } else {
        next[p.PlayerID] = emptyRow();
      }
    }

    setBoxScore(next);
  }, [selectedGameId, rosterPlayersDetailed, existingStatsMap, selectedGame]);

  function setCell(playerId, statKey, value) {
    setBoxScore((prev) => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || emptyRow()),
        [statKey]: value,
      },
    }));
  }

  function toggleDnp(playerId, checked) {
    setBoxScore((prev) => {
      const cur = prev[playerId] || emptyRow();
      // When DNP is checked, clear the numeric inputs
      if (checked) {
        const cleared = emptyRow();
        cleared.DNP = true;
        return { ...prev, [playerId]: cleared };
      }
      return { ...prev, [playerId]: { ...cur, DNP: false } };
    });
  }

  function clearBoxScore() {
    if (!selectedGame) return;
    const next = {};
    for (const p of rosterPlayersDetailed) next[p.PlayerID] = emptyRow();
    setBoxScore(next);
  }

  function saveBoxScore() {
    if (!selectedSeason) return alert("Select a season.");
    if (!selectedGame) return alert("Select a game.");

    const gid = Number(selectedGame.GameID);
    if (!Number.isFinite(gid)) return alert("Invalid GameID.");

    // Build updates only for:
    // - rows with any values entered, AND not DNP
    const updates = [];
    const dnpPlayers = [];

    for (const p of rosterPlayersDetailed) {
      const pid = Number(p.PlayerID);
      const row = boxScore[pid] || emptyRow();

      if (row.DNP) {
        dnpPlayers.push(pid);
        continue;
      }

      if (!rowHasAnyEnteredValue(row)) continue;

      updates.push({
        Season: seasonYear,
        GameID: gid,
        PlayerID: pid,

        Points: numOrZero(row.Points),
        Rebounds: numOrZero(row.Rebounds),
        Assists: numOrZero(row.Assists),
        Turnovers: numOrZero(row.Turnovers),
        Steals: numOrZero(row.Steals),
        Blocks: numOrZero(row.Blocks),

        TwoPM: numOrZero(row.TwoPM),
        TwoPA: numOrZero(row.TwoPA),
        ThreePM: numOrZero(row.ThreePM),
        ThreePA: numOrZero(row.ThreePA),

        FTM: numOrZero(row.FTM),
        FTA: numOrZero(row.FTA),
      });
    }

    if (updates.length === 0) {
      alert("No stat rows entered yet (or everyone is blank/DNP).");
      return;
    }

    setPlayerGameStats((prev) => {
      let next = [...prev];

      // If overwriteExisting: remove any existing rows for this game for roster players,
      // then add updates. This prevents “phantom” zero rows.
      if (overwriteExisting) {
        const rosterIds = new Set(rosterPlayersDetailed.map((p) => Number(p.PlayerID)));
        next = next.filter((s) => !(Number(s.GameID) === gid && rosterIds.has(Number(s.PlayerID))));
      }

      // Also remove any existing rows for players explicitly marked DNP (optional safety)
      if (dnpPlayers.length > 0) {
        const dnpSet = new Set(dnpPlayers);
        next = next.filter((s) => !(Number(s.GameID) === gid && dnpSet.has(Number(s.PlayerID))));
      }

      return [...next, ...updates];
    });

    alert(
      "Box score saved in memory.\n" +
        "Use 'Download THIS game' to copy just this game's rows,\n" +
        "or download full playergamestats.json to persist."
    );
  }

  // Export helpers
  const currentGameRows = useMemo(() => {
    const gid = Number(selectedGame?.GameID);
    if (!Number.isFinite(gid)) return [];
    return playerGameStats.filter((s) => Number(s.GameID) === gid);
  }, [playerGameStats, selectedGame]);

  const enteredPointsTotal = useMemo(() => {
    let sum = 0;
    for (const pid of Object.keys(boxScore)) {
      const row = boxScore[pid];
      if (!row || row.DNP) continue;
      sum += numOrZero(row.Points);
    }
    return sum;
  }, [boxScore]);

  if (loading) return <p>Loading boys basketball admin data…</p>;

  if (error) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>Boys Basketball Admin</h2>
        <p style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Boys Basketball Admin</h2>

      {/* Season + Game selectors */}
      <section style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <div>
          <div style={label}>Season</div>
          <select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)} style={input}>
            {seasonRosters.map((r) => (
              <option key={r.SeasonID} value={r.SeasonID}>
                {r.SeasonID}
              </option>
            ))}
          </select>
          <div style={{ marginTop: 6, color: "#555", fontSize: 13 }}>
            games.json Season = <strong>{seasonYear ?? "?"}</strong>
          </div>
        </div>

        <div>
          <div style={label}>Game</div>
          <select value={selectedGameId} onChange={(e) => setSelectedGameId(e.target.value)} style={input}>
            <option value="">Select game…</option>
            {gamesForSeason.map((g) => (
              <option key={g.GameID} value={g.GameID}>
                {g.Date ? `${g.Date} — ` : ""}
                {g.Opponent || "Opponent?"} (GameID {g.GameID})
              </option>
            ))}
          </select>
          {selectedGame && (
            <div style={{ marginTop: 6, color: "#555", fontSize: 13 }}>
              Selected: <strong>{selectedGame.Opponent || "Opponent?"}</strong> • GameID{" "}
              <strong>{selectedGame.GameID}</strong>
            </div>
          )}
        </div>
      </section>

      <hr style={{ margin: "18px 0" }} />

      {/* Box Score Entry */}
      <section>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <h3 style={{ margin: 0 }}>Game Box Score Entry</h3>

          <button style={btnPrimary} onClick={saveBoxScore} disabled={!selectedGame}>
            Save Box Score
          </button>

          <button
            style={btn}
            onClick={() => downloadJSON(`game_${selectedGameId || "unknown"}_playergamestats.json`, currentGameRows)}
            disabled={!selectedGame}
            title="Downloads ONLY the stat rows for the selected GameID"
          >
            Download THIS game
          </button>

          <button
            style={btn}
            onClick={() => downloadJSON("playergamestats.json", playerGameStats)}
            title="Downloads the full file (use when you're ready to replace it in /public/data/boys/basketball/)"
          >
            Download full playergamestats.json
          </button>

          <button style={btn} onClick={clearBoxScore} disabled={!selectedGame}>
            Clear Inputs
          </button>

          <label style={{ marginLeft: 6, display: "flex", alignItems: "center", gap: 6, color: "#111827" }}>
            <input
              type="checkbox"
              checked={overwriteExisting}
              onChange={(e) => setOverwriteExisting(e.target.checked)}
            />
            Overwrite existing rows for this game
          </label>

          <div style={{ marginLeft: "auto", color: "#555", fontSize: 13 }}>
            Existing rows for this game: <strong>{currentGameRows.length}</strong> • Entered PTS total:{" "}
            <strong>{enteredPointsTotal}</strong>
          </div>
        </div>

        {!selectedGame && <p style={{ marginTop: 10, color: "#555" }}>Select a game to generate the box score table.</p>}

        {selectedGame && (
          <div style={{ marginTop: 10, overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
              <thead>
                <tr>
                  <th style={thSticky}>#</th>
                  <th style={thSticky}>Player</th>
                  <th style={thStickyCenter}>DNP</th>
                  {STAT_KEYS.map((k) => (
                    <th key={k} style={thStickyCenter}>
                      {STAT_LABELS[k] || k}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rosterPlayersDetailed.map((p) => {
                  const row = boxScore[p.PlayerID] || emptyRow();
                  const hasExisting = existingStatsMap.has(Number(p.PlayerID));

                  return (
                    <tr key={p.PlayerID} style={hasExisting ? rowExisting : undefined}>
                      <td style={tdCenter}>{p.JerseyNumber}</td>
                      <td style={tdName}>
                        {p.Name}
                        {hasExisting && <span style={pill}>existing</span>}
                      </td>

                      <td style={tdCenter}>
                        <input
                          type="checkbox"
                          checked={!!row.DNP}
                          onChange={(e) => toggleDnp(p.PlayerID, e.target.checked)}
                        />
                      </td>

                      {STAT_KEYS.map((k) => (
                        <td key={k} style={tdCenter}>
                          <input
                            value={row.DNP ? "" : row[k]}
                            onChange={(e) => setCell(p.PlayerID, k, e.target.value)}
                            inputMode="numeric"
                            disabled={row.DNP}
                            style={cellInput}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ marginTop: 10, color: "#555", lineHeight: 1.4 }}>
          Tips:
          <br />• Mark DNP to guarantee no row is saved for that player.
          <br />• “Download THIS game” gives you just the rows you need to paste into your JSON (or compare).
        </p>
      </section>
    </div>
  );
}

/* --- styles --- */

const label = {
  fontSize: 12,
  color: "#6b7280",
  fontWeight: 800,
  marginBottom: 4,
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  outline: "none",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const btnPrimary = {
  ...btn,
  background: "#111827",
  color: "white",
};

const thSticky = {
  position: "sticky",
  top: 0,
  background: "#f9fafb",
  borderBottom: "2px solid #e5e7eb",
  textAlign: "left",
  padding: "8px 10px",
  fontSize: 12,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  color: "#374151",
  zIndex: 1,
};

const thStickyCenter = {
  ...thSticky,
  textAlign: "center",
  minWidth: 60,
};

const tdCenter = {
  borderBottom: "1px solid #eef2f7",
  padding: "8px 10px",
  textAlign: "center",
  whiteSpace: "nowrap",
  fontSize: 14,
};

const tdName = {
  borderBottom: "1px solid #eef2f7",
  padding: "8px 10px",
  whiteSpace: "nowrap",
  fontWeight: 700,
  fontSize: 14,
};

const cellInput = {
  width: 54,
  padding: "6px 6px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  outline: "none",
  textAlign: "center",
  fontWeight: 700,
};

const rowExisting = {
  background: "#fafafa",
};

const pill = {
  display: "inline-block",
  marginLeft: 8,
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
  border: "1px solid #e5e7eb",
  color: "#374151",
  background: "white",
};
