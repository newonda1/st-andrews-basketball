import React, { useEffect, useMemo, useState } from "react";

/**
 * Boys Basketball Admin – Box Score + Game Builder
 *
 * Features:
 * - Box score entry for one game at a time, matching playergamestats.json:
 *   StatID, PlayerID, GameID, Points, Rebounds, Assists, Turnovers,
 *   Steals, Blocks, TwoPM/TwoPA, ThreePM/ThreePA, FTM/FTA, StatComplete.
 * - DNP checkbox and “blank row” skipping so only real stats export.
 * - Download / copy JSON for ONLY this game’s playergamestats rows.
 *
 * Game Builder:
 * - Creates a single games.json object using:
 *   GameID (from date, YYYYMMDD), Opponent, LocationType, GameType,
 *   Result, TeamScore, OpponentScore, Season, IsComplete.
 * - Does NOT use or export Date or ResultMargin fields.
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
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatDateMMDDYYYY(gameId) {
  if (!gameId) return "";

  const n = Number(gameId);
  if (!Number.isFinite(n)) return "";

  const year = Math.floor(n / 10000);
  const month = Math.floor(n / 100) % 100;
  const day = n % 100;

  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return "";

  const d = new Date(Date.UTC(year, month - 1, day));
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

async function copyToClipboard(text) {
  // Works on HTTPS + localhost. If clipboard is blocked, we fall back to a prompt.
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function seasonIdToYear(seasonId) {
  // "2025-26" -> 2025
  const first = String(seasonId).split("-")[0];
  const yr = Number(first);
  return Number.isFinite(yr) ? yr : null;
}

/** Export helper: blanks -> null */
function numOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** UI-only helper: blanks -> 0 (for totals/quick math on screen) */
function numForTotal(v) {
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

// These must match your playergamestats.json field names
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

function makeStatId(gameId, playerId) {
  // Preserve your existing "compound" scheme (concatenate GameID + PlayerID)
  // Example: GameID 20251212 + PlayerID 202506 -> 20251212202506
  const s = `${Number(gameId)}${Number(playerId)}`;
  return Number(s);
}

/* -------------------------
   Season/Game Builders
-------------------------- */

function dateStrToEpochUtcMs(dateStr) {
  // expects "YYYY-MM-DD"
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split("-").map((x) => Number(x));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  const ms = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  return Number.isFinite(ms) ? ms : null;
}

function dateStrToGameId(dateStr) {
  // "YYYY-MM-DD" => YYYYMMDD number
  if (!dateStr) return null;
  const s = String(dateStr).replaceAll("-", "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function computeResult(teamScore, oppScore, isComplete) {
  if (isComplete !== "Yes") return null;
  if (!Number.isFinite(teamScore) || !Number.isFinite(oppScore)) return null;
  if (teamScore > oppScore) return "W";
  if (teamScore < oppScore) return "L";
  return "T";
}

function computeMargin(teamScore, oppScore, isComplete) {
  if (isComplete !== "Yes") return null;
  if (!Number.isFinite(teamScore) || !Number.isFinite(oppScore)) return null;
  return teamScore - oppScore;
}

function intOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export default function BoysBasketballAdmin() {
  const PATHS = {
    players: "/data/boys/basketball/players.json",
    seasonRosters: "/data/boys/basketball/seasonrosters.json",
    games: "/data/boys/basketball/games.json",
    playerGameStats: "/data/boys/basketball/playergamestats.json",
    // seasons: "/data/boys/basketball/seasons.json",
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

  const [overwriteExisting, setOverwriteExisting] = useState(true);

  const [clipboardStatus, setClipboardStatus] = useState("");

  /* -------------------------
     Game Builder state
  -------------------------- */
  const [gameDateStr, setGameDateStr] = useState("");

  // Opponent dropdown + "create new" option
  const [opponentSelectValue, setOpponentSelectValue] = useState(""); // either existing opponent name or "__NEW__"
  const [gameOpponentNew, setGameOpponentNew] = useState("");

  const [gameLocationType, setGameLocationType] = useState("Home");
  const [gameGameType, setGameGameType] = useState("Non-Region");
  const [gameTeamScore, setGameTeamScore] = useState("");
  const [gameOppScore, setGameOppScore] = useState("");
  const [gameSeason, setGameSeason] = useState(""); // numeric like 1978
  const [gameIsComplete, setGameIsComplete] = useState("Yes");

  const [gameCopyStatus, setGameCopyStatus] = useState("");

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

  // Existing stats for this GameID (so we can show "existing" pill + prefill)
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

  function buildGameRowsFromBoxScore() {
    const gid = Number(selectedGame?.GameID);
    if (!Number.isFinite(gid)) return [];

    const rows = [];

    for (const p of rosterPlayersDetailed) {
      const pid = Number(p.PlayerID);
      const row = boxScore[pid] || emptyRow();

      if (row.DNP) continue;
      if (!rowHasAnyEnteredValue(row)) continue;

      rows.push({
        StatID: makeStatId(gid, pid),
        PlayerID: pid,
        GameID: gid,

        Points: numOrNull(row.Points),
        Rebounds: numOrNull(row.Rebounds),
        Assists: numOrNull(row.Assists),
        Turnovers: numOrNull(row.Turnovers),
        Steals: numOrNull(row.Steals),
        Blocks: numOrNull(row.Blocks),

        ThreePM: numOrNull(row.ThreePM),
        ThreePA: numOrNull(row.ThreePA),
        TwoPM: numOrNull(row.TwoPM),
        TwoPA: numOrNull(row.TwoPA),
        FTM: numOrNull(row.FTM),
        FTA: numOrNull(row.FTA),

        StatComplete: "Yes",
      });
    }

    return rows;
  }

  function saveBoxScore() {
    if (!selectedSeason) return alert("Select a season.");
    if (!selectedGame) return alert("Select a game.");

    const gid = Number(selectedGame.GameID);
    if (!Number.isFinite(gid)) return alert("Invalid GameID.");

    const updates = buildGameRowsFromBoxScore();
    const dnpPlayers = rosterPlayersDetailed
      .map((p) => Number(p.PlayerID))
      .filter((pid) => (boxScore[pid] || emptyRow()).DNP);

    if (updates.length === 0) {
      alert("No stat rows entered yet (or everyone is blank/DNP).");
      return;
    }

    setPlayerGameStats((prev) => {
      let next = [...prev];

      if (overwriteExisting) {
        const rosterIds = new Set(rosterPlayersDetailed.map((p) => Number(p.PlayerID)));
        next = next.filter((s) => !(Number(s.GameID) === gid && rosterIds.has(Number(s.PlayerID))));
      }

      if (dnpPlayers.length > 0) {
        const dnpSet = new Set(dnpPlayers);
        next = next.filter((s) => !(Number(s.GameID) === gid && dnpSet.has(Number(s.PlayerID))));
      }

      return [...next, ...updates];
    });

    alert("Box score saved in memory. Use Download/Copy to export this game's rows.");
  }

  const enteredPointsTotal = useMemo(() => {
    let sum = 0;
    for (const pid of Object.keys(boxScore)) {
      const row = boxScore[pid];
      if (!row || row.DNP) continue;
      sum += numForTotal(row.Points);
    }
    return sum;
  }, [boxScore]);

  /* -------------------------
     Builders computed JSON
  -------------------------- */

  // Build list of existing opponents from games.json
  const opponentOptions = useMemo(() => {
    const set = new Set();
    for (const g of games || []) {
      const name = String(g?.Opponent ?? "").trim();
      if (name) set.add(name);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [games]);

  const gameOpponentResolved = useMemo(() => {
    if (opponentSelectValue === "__NEW__") return String(gameOpponentNew || "").trim();
    return String(opponentSelectValue || "").trim();
  }, [opponentSelectValue, gameOpponentNew]);

  // Game object (games.json schema) — GameID is ALWAYS derived from date string (YYYYMMDD)
const gameObj = useMemo(() => {
  const GameID = dateStrToGameId(gameDateStr);

  const Opponent = String(gameOpponentResolved || "").trim() || null;
  const LocationType = String(gameLocationType || "").trim() || null;
  const GameType = String(gameGameType || "").trim() || null;

  const TeamScore = intOrNull(gameTeamScore);
  const OpponentScore = intOrNull(gameOppScore);

  const Season = intOrNull(gameSeason);
  const IsComplete = gameIsComplete === "Yes" ? "Yes" : "No";

  // Require at least GameID, Opponent, Season
  if (!GameID || !Opponent || !Season) return null;

  const Result = computeResult(TeamScore, OpponentScore, IsComplete);

  return {
    GameID,
    Opponent,
    LocationType,
    GameType,
    Result,
    TeamScore: IsComplete === "Yes" ? TeamScore : null,
    OpponentScore: IsComplete === "Yes" ? OpponentScore : null,
    Season,
    IsComplete,
  };
}, [
  gameDateStr,
  gameOpponentResolved,
  gameLocationType,
  gameGameType,
  gameTeamScore,
  gameOppScore,
  gameSeason,
  gameIsComplete,
]);

  const gameJsonText = useMemo(() => {
    if (!gameObj) return "";
    return JSON.stringify(gameObj, null, 2);
  }, [gameObj]);

  const gameJsonTextWithComma = useMemo(() => {
    if (!gameJsonText) return "";
    return gameJsonText.replace(/\n}$/, "\n},");
  }, [gameJsonText]);

  if (loading) return <p>Loading boys basketball admin data…</p>;

  if (error) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>Boys Basketball Admin</h2>
        <p style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</p>
      </div>
    );
  }

  const exportRows = buildGameRowsFromBoxScore();
  const exportText = JSON.stringify(exportRows, null, 2);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Boys Basketball Admin</h2>

      {/* -------------------------
          Season + Game Builder
      -------------------------- */}
      <section style={{ marginTop: 10 }}>
        <h3 style={{ margin: "0 0 8px" }}>Season + Game Builder (copy/paste into JSON files)</h3>

        {/* Game Builder */}
        <div style={{ marginTop: 12, border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <div style={{ fontWeight: 900 }}>Game Builder</div>

            <button
              style={btn}
              onClick={async () => {
                if (!gameJsonText) return alert("Fill Date, Opponent, and Season at minimum.");
                setGameCopyStatus("");
                const ok = await copyToClipboard(gameJsonTextWithComma || gameJsonText);
                if (ok) {
                  setGameCopyStatus("Copied!");
                  setTimeout(() => setGameCopyStatus(""), 1500);
                } else {
                  window.prompt("Clipboard blocked. Copy the JSON from here:", gameJsonTextWithComma || gameJsonText);
                }
              }}
              disabled={!gameJsonText}
              title="Copies a single game object (with a trailing comma) to paste into games.json array."
            >
              Copy Game JSON
            </button>

            <button
              style={btn}
              onClick={() => {
                if (!gameJsonText) return alert("Fill Date, Opponent, and Season at minimum.");
                downloadText(`game_${gameObj?.GameID || "unknown"}.json.txt`, gameJsonTextWithComma || gameJsonText);
              }}
              disabled={!gameJsonText}
              title="Downloads a text file containing one game object."
            >
              Download Game JSON
            </button>

            {gameCopyStatus && <span style={{ color: "#16a34a", fontWeight: 900 }}>{gameCopyStatus}</span>}
          </div>

          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(4, minmax(200px, 1fr))", gap: 10 }}>
            <div>
              <div style={label}>Date</div>
              <input
                type="date"
                style={input}
                value={gameDateStr}
                onChange={(e) => {
                  const nextDate = e.target.value;
                  setGameDateStr(nextDate);
                  // auto-fill Season with currently selected season year when empty
                  if (!gameSeason && Number.isFinite(seasonYear)) setGameSeason(String(seasonYear));
                }}
              />
              <div style={{ marginTop: 6, color: "#555", fontSize: 12 }}>
                GameID: <strong>{dateStrToGameId(gameDateStr) ?? "—"}</strong> • Date(ms):{" "}
                <strong>{dateStrToEpochUtcMs(gameDateStr) ?? "—"}</strong>
              </div>
            </div>

            <div>
              <div style={label}>Opponent</div>
              <select
                style={input}
                value={opponentSelectValue}
                onChange={(e) => {
                  const v = e.target.value;
                  setOpponentSelectValue(v);
                  if (v !== "__NEW__") setGameOpponentNew("");
                }}
              >
                <option value="">Select opponent…</option>
                <option value="__NEW__">+ Create new opponent…</option>
                {opponentOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              {opponentSelectValue === "__NEW__" && (
                <div style={{ marginTop: 8 }}>
                  <div style={label}>New Opponent Name</div>
                  <input
                    style={input}
                    value={gameOpponentNew}
                    onChange={(e) => setGameOpponentNew(e.target.value)}
                    placeholder="Type new school name…"
                  />
                </div>
              )}

              <div style={{ marginTop: 6, color: "#555", fontSize: 12 }}>
                Final Opponent: <strong>{gameOpponentResolved || "—"}</strong>
              </div>
            </div>

            <div>
              <div style={label}>Season (numeric)</div>
              <input style={input} value={gameSeason} onChange={(e) => setGameSeason(e.target.value)} placeholder="1978" />
            </div>

            <div>
              <div style={label}>LocationType</div>
              <select style={input} value={gameLocationType} onChange={(e) => setGameLocationType(e.target.value)}>
                {["Home", "Away", "Neutral"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={label}>GameType</div>
              <select style={input} value={gameGameType} onChange={(e) => setGameGameType(e.target.value)}>
                {["Non-Region", "Region", "Tournament", "Region Tournament", "State Tournament"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={label}>IsComplete</div>
              <select style={input} value={gameIsComplete} onChange={(e) => setGameIsComplete(e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <div style={{ marginTop: 6, color: "#555", fontSize: 12 }}>
                If "No", scores export as null and Result is null.
              </div>
            </div>

            <div>
              <div style={label}>Scores</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input
                  style={input}
                  value={gameTeamScore}
                  onChange={(e) => setGameTeamScore(e.target.value)}
                  placeholder="TeamScore"
                  inputMode="numeric"
                />
                <input
                  style={input}
                  value={gameOppScore}
                  onChange={(e) => setGameOppScore(e.target.value)}
                  placeholder="OpponentScore"
                  inputMode="numeric"
                />
              </div>
              <div style={{ marginTop: 6, color: "#555", fontSize: 12 }}>
                Result:{" "}
                <strong>{computeResult(intOrNull(gameTeamScore), intOrNull(gameOppScore), gameIsComplete) ?? "—"}</strong> • Margin:{" "}
                <strong>{computeMargin(intOrNull(gameTeamScore), intOrNull(gameOppScore), gameIsComplete) ?? "—"}</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={label}>Game JSON output (object + trailing comma)</div>
            <pre style={preBox}>{gameJsonTextWithComma || "// Fill Date, Opponent, and Season to generate JSON"}</pre>
          </div>
        </div>

        <p style={{ marginTop: 10, color: "#555", lineHeight: 1.4 }}>
          Paste tip:
          <br />• Use the “with trailing comma” output to paste inside an array in <code>seasons.json</code> or <code>games.json</code>.
          <br />• If you paste as the last item, remove the final comma.
        </p>
      </section>

      <hr style={{ margin: "18px 0" }} />

      {/* Season + Game selectors (box score tools) */}
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
                {formatDateMMDDYYYY(g.GameID)} — {g.Opponent || "Opponent?"} (GameID {g.GameID})
              </option>
            ))}
          </select>
          {selectedGame && (
            <div style={{ marginTop: 6, color: "#555", fontSize: 13 }}>
              Selected: <strong>{selectedGame.Opponent || "Opponent?"}</strong> • GameID <strong>{selectedGame.GameID}</strong>
            </div>
          )}
        </div>
      </section>

      <hr style={{ margin: "18px 0" }} />

      {/* Roster list */}
      <section>
        <h3 style={{ margin: "0 0 8px" }}>Roster</h3>

        {!selectedRoster && <p>No roster found for this season.</p>}

        {selectedRoster && (
          <div style={{ maxHeight: 220, overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thSticky}>#</th>
                  <th style={thSticky}>Player</th>
                  <th style={thSticky}>Grad</th>
                  <th style={thSticky}>PlayerID</th>
                </tr>
              </thead>
              <tbody>
                {rosterPlayersDetailed.map((p) => (
                  <tr key={p.PlayerID}>
                    <td style={tdCenter}>{p.JerseyNumber}</td>
                    <td style={td}>{p.Name}</td>
                    <td style={tdCenter}>{p.GradYear}</td>
                    <td style={tdCenter}>{p.PlayerID}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <hr style={{ margin: "18px 0" }} />

      {/* Box Score Entry */}
      <section>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <h3 style={{ margin: 0 }}>Game Box Score Entry</h3>

          <button style={btnPrimary} onClick={saveBoxScore} disabled={!selectedGame || rosterPlayersDetailed.length === 0}>
            Save Box Score
          </button>

          <button
            style={btn}
            onClick={() => {
              const rows = buildGameRowsFromBoxScore();
              downloadJSON(`game_${selectedGameId || "unknown"}_playergamestats.json`, rows);
            }}
            disabled={!selectedGame}
            title="Downloads ONLY this game's rows (in playergamestats.json format)."
          >
            Download JSON code
          </button>

          <button
            style={btn}
            onClick={async () => {
              if (!selectedGame) return;
              setClipboardStatus("");
              const ok = await copyToClipboard(exportText);
              if (ok) {
                setClipboardStatus("Copied!");
                setTimeout(() => setClipboardStatus(""), 1500);
              } else {
                window.prompt("Clipboard blocked. Copy the JSON from here:", exportText);
              }
            }}
            disabled={!selectedGame}
            title="Copies ONLY this game's rows to clipboard."
          >
            Copy JSON to clipboard
          </button>

          <button style={btn} onClick={clearBoxScore} disabled={!selectedGame}>
            Clear Inputs
          </button>

          <label style={{ marginLeft: 6, display: "flex", alignItems: "center", gap: 6, color: "#111827" }}>
            <input type="checkbox" checked={overwriteExisting} onChange={(e) => setOverwriteExisting(e.target.checked)} />
            Overwrite existing rows for this game
          </label>

          <div style={{ marginLeft: "auto", color: "#555", fontSize: 13 }}>
            Entered PTS total: <strong>{enteredPointsTotal}</strong>
          </div>
        </div>

        {clipboardStatus && <div style={{ marginTop: 8, color: "#16a34a", fontWeight: 800 }}>{clipboardStatus}</div>}

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
                        <input type="checkbox" checked={!!row.DNP} onChange={(e) => toggleDnp(p.PlayerID, e.target.checked)} />
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
          <br />• Mark DNP to guarantee no row is exported for that player.
          <br />• Export matches playergamestats.json format (StatID + StatComplete).
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

const td = {
  borderBottom: "1px solid #eef2f7",
  padding: "8px 10px",
  fontSize: 14,
};

const tdCenter = {
  ...td,
  textAlign: "center",
  whiteSpace: "nowrap",
};

const tdName = {
  ...td,
  whiteSpace: "nowrap",
  fontWeight: 700,
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

const preBox = {
  whiteSpace: "pre-wrap",
  background: "#f7f7f7",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  margin: 0,
};
