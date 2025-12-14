import React, { useEffect, useMemo, useState } from "react";

/**
 * Boys Basketball Admin – Box Score Entry UI
 * - Enter full game box score at once
 * - Explicit DNP handling
 * - Export ONLY current game's JSON
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
    throw new Error(`${label} returned HTML instead of JSON at ${path}`);
  }

  return JSON.parse(text);
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

function seasonIdToYear(seasonId) {
  return Number(String(seasonId).split("-")[0]);
}

function numOrZero(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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
  STAT_KEYS.forEach((k) => (o[k] = ""));
  return o;
}

export default function BoysBasketballAdmin() {
  const PATHS = {
    players: "/data/boys/basketball/players.json",
    seasonRosters: "/data/boys/basketball/seasonrosters.json",
    games: "/data/boys/basketball/games.json",
    stats: "/data/boys/basketball/playergamestats.json",
  };

  const [players, setPlayers] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [games, setGames] = useState([]);
  const [existingStats, setExistingStats] = useState([]);

  const [seasonId, setSeasonId] = useState("");
  const [gameId, setGameId] = useState("");
  const [boxScore, setBoxScore] = useState({});

  useEffect(() => {
    Promise.all([
      fetchJson("players", PATHS.players),
      fetchJson("rosters", PATHS.seasonRosters),
      fetchJson("games", PATHS.games),
      fetchJson("stats", PATHS.stats),
    ]).then(([p, r, g, s]) => {
      setPlayers(p);
      setRosters(r);
      setGames(g);
      setExistingStats(s);
      if (r.length) setSeasonId(r[0].SeasonID);
    });
  }, []);

  const seasonYear = useMemo(() => seasonIdToYear(seasonId), [seasonId]);

  const roster = useMemo(
    () => rosters.find((r) => r.SeasonID === seasonId),
    [rosters, seasonId]
  );

  const rosterPlayers = useMemo(() => {
    if (!roster) return [];
    return roster.Players.map((rp) => {
      const p = players.find((x) => x.PlayerID === rp.PlayerID);
      return {
        PlayerID: rp.PlayerID,
        Jersey: rp.JerseyNumber,
        Name: p ? `${p.FirstName} ${p.LastName}` : "Unknown",
      };
    });
  }, [roster, players]);

  const gamesForSeason = useMemo(
    () => games.filter((g) => g.Season === seasonYear),
    [games, seasonYear]
  );

  const selectedGame = useMemo(
    () => gamesForSeason.find((g) => g.GameID === Number(gameId)),
    [gamesForSeason, gameId]
  );

  useEffect(() => {
    if (!selectedGame || !rosterPlayers.length) return;
    const next = {};
    rosterPlayers.forEach((p) => (next[p.PlayerID] = emptyRow()));
    setBoxScore(next);
  }, [selectedGame, rosterPlayers]);

  function setCell(pid, key, value) {
    setBoxScore((prev) => ({
      ...prev,
      [pid]: { ...prev[pid], [key]: value },
    }));
  }

  function toggleDnp(pid, checked) {
    setBoxScore((prev) => ({
      ...prev,
      [pid]: checked ? { ...emptyRow(), DNP: true } : emptyRow(),
    }));
  }

  function buildExport() {
    if (!selectedGame) return [];
    const rows = [];

    rosterPlayers.forEach((p) => {
      const row = boxScore[p.PlayerID];
      if (!row || row.DNP) return;

      const hasData = STAT_KEYS.some((k) => row[k] !== "");
      if (!hasData) return;

      rows.push({
        Season: seasonYear,
        GameID: selectedGame.GameID,
        PlayerID: p.PlayerID,
        ...Object.fromEntries(
          STAT_KEYS.map((k) => [k, numOrZero(row[k])])
        ),
      });
    });

    return rows;
  }

  return (
    <div>
      <h2>Boys Basketball Admin</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <select value={seasonId} onChange={(e) => setSeasonId(e.target.value)}>
          {rosters.map((r) => (
            <option key={r.SeasonID} value={r.SeasonID}>
              {r.SeasonID}
            </option>
          ))}
        </select>

        <select value={gameId} onChange={(e) => setGameId(e.target.value)}>
          <option value="">Select game…</option>
          {gamesForSeason.map((g) => (
            <option key={g.GameID} value={g.GameID}>
              {g.Date} — {g.Opponent}
            </option>
          ))}
        </select>
      </div>

      {selectedGame && (
        <>
          <div style={{ margin: "12px 0" }}>
            <button
              onClick={() =>
                downloadJSON(
                  `game_${selectedGame.GameID}_stats.json`,
                  buildExport()
                )
              }
            >
              Download JSON code
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>DNP</th>
                {STAT_KEYS.map((k) => (
                  <th key={k}>{STAT_LABELS[k]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rosterPlayers.map((p) => (
                <tr key={p.PlayerID}>
                  <td>{p.Jersey}</td>
                  <td>{p.Name}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={boxScore[p.PlayerID]?.DNP || false}
                      onChange={(e) =>
                        toggleDnp(p.PlayerID, e.target.checked)
                      }
                    />
                  </td>
                  {STAT_KEYS.map((k) => (
                    <td key={k}>
                      <input
                        value={boxScore[p.PlayerID]?.[k] || ""}
                        disabled={boxScore[p.PlayerID]?.DNP}
                        onChange={(e) =>
                          setCell(p.PlayerID, k, e.target.value)
                        }
                        style={{ width: 50 }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
