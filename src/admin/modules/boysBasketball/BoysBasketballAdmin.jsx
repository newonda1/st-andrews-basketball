import React, { useEffect, useMemo, useState } from "react";

/**
 * Boys Basketball Admin – Phase 2
 * - View roster by season
 * - Stat entry: Season -> Game -> Player dropdowns
 * - Append stat line to playergamestats.json
 * - Download updated JSON (no backend yet)
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
        `It returned HTML (SPA fallback). Put the file in /public at that path.\n\n` +
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

function toNumOrZero(v) {
  if (v === "" || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stat input state (MVP set — easy to expand later)
  const [statForm, setStatForm] = useState({
    Points: "",
    Rebounds: "",
    Assists: "",
    Turnovers: "",
    Steals: "",
    Blocks: "",
    ThreePM: "",
    ThreePA: "",
    TwoPM: "",
    TwoPA: "",
    FTM: "",
    FTA: "",
  });

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

        if (Array.isArray(r) && r.length > 0) {
          setSelectedSeason(r[0].SeasonID);
        }
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

    return selectedRoster.Players
      .map((entry) => {
        const player = players.find((p) => Number(p.PlayerID) === Number(entry.PlayerID));
        return {
          PlayerID: Number(entry.PlayerID),
          JerseyNumber: entry.JerseyNumber,
          Name: player ? `${player.FirstName} ${player.LastName}` : "Unknown Player",
          GradYear: player?.GradYear ?? "",
        };
      })
      .sort((a, b) => (a.JerseyNumber ?? 999) - (b.JerseyNumber ?? 999));
  }, [selectedRoster, players]);

  const gamesForSeason = useMemo(() => {
    if (!Number.isFinite(seasonYear)) return [];
    return games
      .filter((g) => Number(g.Season) === seasonYear)
      .sort((a, b) => Number(a.GameID) - Number(b.GameID));
  }, [games, seasonYear]);

  const selectedGame = useMemo(() => {
    const idNum = Number(selectedGameId);
    if (!Number.isFinite(idNum)) return null;
    return gamesForSeason.find((g) => Number(g.GameID) === idNum) || null;
  }, [gamesForSeason, selectedGameId]);

  // Keep dropdowns sane when season changes
  useEffect(() => {
    setSelectedGameId("");
    setSelectedPlayerId("");
    setStatForm({
      Points: "",
      Rebounds: "",
      Assists: "",
      Turnovers: "",
      Steals: "",
      Blocks: "",
      ThreePM: "",
      ThreePA: "",
      TwoPM: "",
      TwoPA: "",
      FTM: "",
      FTA: "",
    });
  }, [selectedSeason]);

  function addStatLine() {
    if (!selectedSeason) {
      alert("Select a season.");
      return;
    }
    if (!selectedGame) {
      alert("Select a game.");
      return;
    }
    const pid = Number(selectedPlayerId);
    if (!Number.isFinite(pid)) {
      alert("Select a player.");
      return;
    }

    // Basic duplicate guard (same GameID + PlayerID already exists)
    const gid = Number(selectedGame.GameID);
    const exists = playerGameStats.some(
      (s) => Number(s.GameID) === gid && Number(s.PlayerID) === pid
    );
    if (exists) {
      alert("A stat line for this player/game already exists.");
      return;
    }

    const newEntry = {
      Season: seasonYear, // matches your games.json convention
      GameID: gid,
      PlayerID: pid,

      Points: toNumOrZero(statForm.Points),
      Rebounds: toNumOrZero(statForm.Rebounds),
      Assists: toNumOrZero(statForm.Assists),
      Turnovers: toNumOrZero(statForm.Turnovers),
      Steals: toNumOrZero(statForm.Steals),
      Blocks: toNumOrZero(statForm.Blocks),

      ThreePM: toNumOrZero(statForm.ThreePM),
      ThreePA: toNumOrZero(statForm.ThreePA),
      TwoPM: toNumOrZero(statForm.TwoPM),
      TwoPA: toNumOrZero(statForm.TwoPA),
      FTM: toNumOrZero(statForm.FTM),
      FTA: toNumOrZero(statForm.FTA),
    };

    setPlayerGameStats((prev) => [...prev, newEntry]);

    // Reset just the stats (keep selections to enter next player quickly)
    setStatForm({
      Points: "",
      Rebounds: "",
      Assists: "",
      Turnovers: "",
      Steals: "",
      Blocks: "",
      ThreePM: "",
      ThreePA: "",
      TwoPM: "",
      TwoPA: "",
      FTM: "",
      FTA: "",
    });
  }

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

      {/* Season selector */}
      <section style={{ marginTop: 10 }}>
        <label>
          Season:&nbsp;
          <select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
            {seasonRosters.map((r) => (
              <option key={r.SeasonID} value={r.SeasonID}>
                {r.SeasonID}
              </option>
            ))}
          </select>
        </label>
        <span style={{ marginLeft: 10, color: "#555" }}>
          (games.json Season = {seasonYear ?? "?"})
        </span>
      </section>

      {/* Roster table */}
      <section style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Roster</h3>

        {!selectedRoster && <p>No roster found for this season.</p>}

        {selectedRoster && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Player</th>
                <th style={th}>Grad Year</th>
                <th style={th}>PlayerID</th>
              </tr>
            </thead>
            <tbody>
              {rosterPlayersDetailed.map((p) => (
                <tr key={p.PlayerID}>
                  <td style={td}>{p.JerseyNumber}</td>
                  <td style={td}>{p.Name}</td>
                  <td style={td}>{p.GradYear}</td>
                  <td style={td}>{p.PlayerID}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <hr style={{ margin: "22px 0" }} />

      {/* Stat entry */}
      <section>
        <h3 style={{ marginBottom: 10 }}>Add Game Stats</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          <div>
            <div style={label}>Game</div>
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              style={input}
            >
              <option value="">Select game…</option>
              {gamesForSeason.map((g) => (
                <option key={g.GameID} value={g.GameID}>
                  {g.Date ? `${g.Date} — ` : ""}
                  {g.Opponent || "Opponent?"} (GameID {g.GameID})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={label}>Player</div>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              style={input}
            >
              <option value="">Select player…</option>
              {rosterPlayersDetailed.map((p) => (
                <option key={p.PlayerID} value={p.PlayerID}>
                  #{p.JerseyNumber} {p.Name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "end", gap: 10 }}>
            <button onClick={addStatLine} style={btnPrimary}>
              Add stat line
            </button>
            <button
              onClick={() => downloadJSON("playergamestats.json", playerGameStats)}
              style={btn}
              title="Download the updated file and replace it in /public/data/boys/basketball/"
            >
              Download playergamestats.json
            </button>
          </div>
        </div>

        {/* Stat inputs */}
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 10 }}>
          {Object.keys(statForm).map((k) => (
            <div key={k}>
              <div style={label}>{k}</div>
              <input
                value={statForm[k]}
                onChange={(e) => setStatForm((p) => ({ ...p, [k]: e.target.value }))}
                style={input}
                inputMode="numeric"
                placeholder="0"
              />
            </div>
          ))}
        </div>

        <p style={{ marginTop: 12, color: "#555" }}>
          Current stat lines loaded: <strong>{playerGameStats.length}</strong>
        </p>
      </section>
    </div>
  );
}

const th = {
  borderBottom: "2px solid #ccc",
  textAlign: "left",
  padding: "6px 8px",
};

const td = {
  borderBottom: "1px solid #e5e7eb",
  padding: "6px 8px",
};

const label = {
  fontSize: 12,
  color: "#6b7280",
  fontWeight: 700,
  marginBottom: 4,
};

const input = {
  width: "100%",
  padding: "9px 10px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  outline: "none",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const btnPrimary = {
  ...btn,
  background: "#111827",
  color: "white",
};
