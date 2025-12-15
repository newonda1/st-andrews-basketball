import React, { useEffect, useMemo, useState } from "react";

/**
 * Girls Basketball Admin – Box Score Entry UI (full-game at once)
 *
 * Uses your public JSON files:
 *   /public/data/girls/basketball/players.json
 *   /public/data/girls/basketball/seasonrosters.json
 *   /public/data/girls/basketball/games.json
 *   /public/data/girls/basketball/playergamestats.json
 *
 * Fetch paths from React must be:
 *   /data/girls/basketball/<file>.json
 *
 * Output:
 *  - Copy JSON rows for this game (playergamestats)
 *  - Download JSON rows for this game (playergamestats)
 *
 * Note:
 *  - This does NOT write to disk automatically; it generates JSON you paste into the repo.
 */

const STAT_FIELDS = [
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

function seasonIdToYear(seasonId) {
  // "2025-26" => 2025
  const n = parseInt(String(seasonId || "").slice(0, 4), 10);
  return Number.isFinite(n) ? n : null;
}

async function fetchJson(label, url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${label} (${res.status}): ${url}`);
  }
  return res.json();
}

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function GirlsBasketballAdmin() {
  const PATHS = {
    players: "/data/girls/basketball/players.json",
    seasonRosters: "/data/girls/basketball/seasonrosters.json",
    games: "/data/girls/basketball/games.json",
    playerGameStats: "/data/girls/basketball/playergamestats.json",
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

  const rosterPlayerIds = useMemo(() => {
    const entry = (seasonRosters || []).find((x) => x.SeasonID === selectedSeason);
    const ids = (entry?.Players || []).map((p) => p.PlayerID);
    return new Set(ids);
  }, [seasonRosters, selectedSeason]);

  const rosterPlayers = useMemo(() => {
    const entry = (seasonRosters || []).find((x) => x.SeasonID === selectedSeason);
    const roster = entry?.Players || [];
    const playerMap = new Map((players || []).map((p) => [p.PlayerID, p]));

    const merged = roster
      .map((rp) => {
        const base = playerMap.get(rp.PlayerID);
        if (!base) return null;
        return {
          PlayerID: rp.PlayerID,
          JerseyNumber: rp.JerseyNumber ?? base.JerseyNumber,
          FirstName: base.FirstName,
          LastName: base.LastName,
          GradYear: base.GradYear,
        };
      })
      .filter(Boolean);

    merged.sort((a, b) => safeNum(a.JerseyNumber) - safeNum(b.JerseyNumber));
    return merged;
  }, [seasonRosters, selectedSeason, players]);

  const seasonGames = useMemo(() => {
    const list = (games || []).filter((g) => g.SeasonID === selectedSeason);
    // newest first in dropdown feels nice; change if you want
    list.sort((a, b) => String(b.Date || "").localeCompare(String(a.Date || "")));
    return list;
  }, [games, selectedSeason]);

  const selectedGame = useMemo(() => {
    return (games || []).find((g) => g.GameID === selectedGameId) || null;
  }, [games, selectedGameId]);

  // Initialize boxScore for roster players whenever season changes
  useEffect(() => {
    const next = {};
    rosterPlayers.forEach((p) => {
      next[p.PlayerID] = {
        DNP: false,
        Points: 0,
        Rebounds: 0,
        Assists: 0,
        Turnovers: 0,
        Steals: 0,
        Blocks: 0,
        TwoPM: 0,
        TwoPA: 0,
        ThreePM: 0,
        ThreePA: 0,
        FTM: 0,
        FTA: 0,
      };
    });
    setBoxScore(next);
  }, [selectedSeason, rosterPlayers]);

  function setStat(playerId, field, value) {
    setBoxScore((prev) => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || {}),
        [field]: field === "DNP" ? Boolean(value) : safeNum(value),
      },
    }));
  }

  // Pull existing stats for selected game (if any) into the table
  useEffect(() => {
    if (!selectedGameId) return;

    const rows = (playerGameStats || []).filter((r) => r.GameID === selectedGameId);
    if (rows.length === 0) return;

    setBoxScore((prev) => {
      const next = { ...prev };
      for (const r of rows) {
        if (!rosterPlayerIds.has(r.PlayerID)) continue;
        next[r.PlayerID] = {
          ...(next[r.PlayerID] || {}),
          DNP: false,
          ...STAT_FIELDS.reduce((acc, f) => {
            acc[f] = safeNum(r[f]);
            return acc;
          }, {}),
        };
      }
      return next;
    });
  }, [selectedGameId, playerGameStats, rosterPlayerIds]);

  const exportRowsForGame = useMemo(() => {
    if (!selectedSeason || !selectedGameId) return [];

    // create rows from current boxScore table
    const rows = rosterPlayers.map((p) => {
      const s = boxScore[p.PlayerID] || {};
      const dnp = Boolean(s.DNP);

      const row = {
        StatID: `${selectedGameId}${p.PlayerID}`,
        PlayerID: p.PlayerID,
        GameID: selectedGameId,
        Points: dnp ? 0 : safeNum(s.Points),
        Rebounds: dnp ? 0 : safeNum(s.Rebounds),
        Assists: dnp ? 0 : safeNum(s.Assists),
        Turnovers: dnp ? 0 : safeNum(s.Turnovers),
        Steals: dnp ? 0 : safeNum(s.Steals),
        Blocks: dnp ? 0 : safeNum(s.Blocks),
        TwoPM: dnp ? 0 : safeNum(s.TwoPM),
        TwoPA: dnp ? 0 : safeNum(s.TwoPA),
        ThreePM: dnp ? 0 : safeNum(s.ThreePM),
        ThreePA: dnp ? 0 : safeNum(s.ThreePA),
        FTM: dnp ? 0 : safeNum(s.FTM),
        FTA: dnp ? 0 : safeNum(s.FTA),
        StatComplete: "Yes",
      };

      return row;
    });

    return rows;
  }, [selectedSeason, selectedGameId, rosterPlayers, boxScore]);

  const exportJsonText = useMemo(() => {
    // If overwriteExisting is ON, we output the FULL updated array for playergamestats.json (with this game replaced).
    // If OFF, we output ONLY the rows for this game.
    if (!selectedGameId) return "";

    if (!overwriteExisting) {
      return JSON.stringify(exportRowsForGame, null, 2);
    }

    const withoutThisGame = (playerGameStats || []).filter((r) => r.GameID !== selectedGameId);
    const nextAll = [...withoutThisGame, ...exportRowsForGame];

    // sort by GameID then PlayerID for stability
    nextAll.sort((a, b) => {
      const g = String(a.GameID).localeCompare(String(b.GameID));
      if (g !== 0) return g;
      return safeNum(a.PlayerID) - safeNum(b.PlayerID);
    });

    return JSON.stringify(nextAll, null, 2);
  }, [overwriteExisting, exportRowsForGame, playerGameStats, selectedGameId]);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(exportJsonText);
      setClipboardStatus("Copied!");
      setTimeout(() => setClipboardStatus(""), 1200);
    } catch {
      setClipboardStatus("Copy failed");
      setTimeout(() => setClipboardStatus(""), 1500);
    }
  }

  const header = useMemo(() => {
    if (!selectedGame) return "Girls Basketball Admin";
    const opp = selectedGame.Opponent || "Opponent";
    const date = selectedGame.Date || "";
    return `Girls Basketball Admin — ${date} vs ${opp}`;
  }, [selectedGame]);

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Girls Basketball Admin</h2>
        <p>Loading data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Girls Basketball Admin</h2>
        <p style={{ color: "crimson" }}>{error}</p>
        <p>
          Check that these files exist in <code>/public</code> and paths are correct:
        </p>
        <ul>
          <li><code>{PATHS.players}</code></li>
          <li><code>{PATHS.seasonRosters}</code></li>
          <li><code>{PATHS.games}</code></li>
          <li><code>{PATHS.playerGameStats}</code></li>
        </ul>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>{header}</h2>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <label>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Season</div>
          <select
            value={selectedSeason}
            onChange={(e) => {
              setSelectedSeason(e.target.value);
              setSelectedGameId("");
            }}
            style={{ padding: 8, minWidth: 160 }}
          >
            {(seasonRosters || []).map((s) => (
              <option key={s.SeasonID} value={s.SeasonID}>
                {s.SeasonID}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Game</div>
          <select
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            style={{ padding: 8, minWidth: 320 }}
          >
            <option value="">Select a game…</option>
            {seasonGames.map((g) => (
              <option key={g.GameID} value={g.GameID}>
                {g.Date} — {g.Opponent} ({g.HomeAway || ""})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
          <input
            type="checkbox"
            checked={overwriteExisting}
            onChange={(e) => setOverwriteExisting(e.target.checked)}
          />
          Overwrite this game in <code>playergamestats.json</code>
        </label>
      </div>

      {!selectedGameId ? (
        <p style={{ marginTop: 16, opacity: 0.75 }}>
          Select a game to enter stats.
        </p>
      ) : (
        <>
          <div style={{ overflowX: "auto", marginTop: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 980 }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={th}>#</th>
                  <th style={{ ...th, textAlign: "left" }}>Player</th>
                  <th style={th}>DNP</th>
                  {STAT_FIELDS.map((f) => (
                    <th key={f} style={th}>{STAT_LABELS[f] || f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rosterPlayers.map((p) => {
                  const s = boxScore[p.PlayerID] || {};
                  const dnp = Boolean(s.DNP);

                  return (
                    <tr key={p.PlayerID} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={tdCenter}>{p.JerseyNumber ?? ""}</td>
                      <td style={{ ...td, textAlign: "left" }}>
                        {p.FirstName} {p.LastName}{" "}
                        <span style={{ opacity: 0.6, fontSize: 12 }}>
                          ({p.GradYear})
                        </span>
                      </td>
                      <td style={tdCenter}>
                        <input
                          type="checkbox"
                          checked={dnp}
                          onChange={(e) => setStat(p.PlayerID, "DNP", e.target.checked)}
                        />
                      </td>

                      {STAT_FIELDS.map((f) => (
                        <td key={f} style={tdCenter}>
                          <input
                            type="number"
                            value={safeNum(s[f])}
                            onChange={(e) => setStat(p.PlayerID, f, e.target.value)}
                            disabled={dnp}
                            style={num}
                            min={0}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={copyToClipboard} style={btn}>
              Copy JSON
            </button>
            <button
              onClick={() => {
                const filename = overwriteExisting
                  ? `playergamestats_${selectedSeason}.json`
                  : `playergamestats_${selectedGameId}.json`;
                downloadText(filename, exportJsonText);
              }}
              style={btn}
            >
              Download JSON
            </button>
            {clipboardStatus && <span style={{ opacity: 0.8 }}>{clipboardStatus}</span>}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
              Generated JSON (paste into{" "}
              <code>/public/data/girls/basketball/playergamestats.json</code>)
            </div>
            <textarea
              value={exportJsonText}
              readOnly
              style={{
                width: "100%",
                minHeight: 220,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 12,
                padding: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            />
          </div>

          {seasonYear && (
            <p style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
              Season year detected: {seasonYear}
            </p>
          )}
        </>
      )}
    </div>
  );
}

const th = {
  padding: "10px 8px",
  fontSize: 12,
  fontWeight: 700,
  textAlign: "center",
  whiteSpace: "nowrap",
};

const td = {
  padding: "8px",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const tdCenter = { ...td, textAlign: "center" };

const num = {
  width: 56,
  padding: "6px 6px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  textAlign: "center",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  cursor: "pointer",
  fontWeight: 700,
};
