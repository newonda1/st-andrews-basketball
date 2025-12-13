import React, { useEffect, useMemo, useState } from "react";

function absUrl(path) {
  return new URL(path, window.location.origin).toString();
}

async function fetchJson(label, path) {
  const url = absUrl(path);
  const res = await fetch(url, { cache: "no-store" });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`${label} failed (HTTP ${res.status}) at ${path}`);
  }

  // If we accidentally got HTML back (SPA fallback), fail with a helpful message
  const trimmed = text.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    throw new Error(
      `${label} did not return JSON at ${path}.\n` +
        `It returned HTML instead (SPA fallback).\n` +
        `This usually means the file is not in /public at that path.\n\n` +
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

export default function BoysBasketballAdmin() {
  const [players, setPlayers] = useState([]);
  const [seasonRosters, setSeasonRosters] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pathsUsed, setPathsUsed] = useState({
    players: "",
    seasonRosters: "",
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        // ✅ These match your real public folder:
        // /public/data/boys/basketball/*.json  ->  /data/boys/basketball/*.json
        const playersPath = "/data/boys/basketball/players.json";
        const rostersPath = "/data/boys/basketball/seasonrosters.json";

        const playersData = await fetchJson("players.json", playersPath);
        const rostersData = await fetchJson("seasonrosters.json", rostersPath);

        setPlayers(Array.isArray(playersData) ? playersData : []);
        setSeasonRosters(Array.isArray(rostersData) ? rostersData : []);

        setPathsUsed({
          players: playersPath,
          seasonRosters: rostersPath,
        });

        if (Array.isArray(rostersData) && rostersData.length > 0) {
          setSelectedSeason(rostersData[0].SeasonID);
        }
      } catch (e) {
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const selectedRoster = useMemo(() => {
    return seasonRosters.find((r) => r.SeasonID === selectedSeason);
  }, [seasonRosters, selectedSeason]);

  const rosterWithNames = useMemo(() => {
    if (!selectedRoster?.Players) return [];

    return selectedRoster.Players.map((entry) => {
      const player = players.find(
        (p) => Number(p.PlayerID) === Number(entry.PlayerID)
      );

      return {
        PlayerID: entry.PlayerID,
        JerseyNumber: entry.JerseyNumber,
        Name: player ? `${player.FirstName} ${player.LastName}` : "Unknown Player",
        GradYear: player?.GradYear ?? "",
      };
    });
  }, [selectedRoster, players]);

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

      <p style={{ color: "#555", marginTop: 6 }}>
        Loaded from:
        <br />
        <strong>players:</strong> {pathsUsed.players}
        <br />
        <strong>seasonrosters:</strong> {pathsUsed.seasonRosters}
      </p>

      <section style={{ marginTop: 16 }}>
        <label>
          Season:&nbsp;
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            {seasonRosters.map((r) => (
              <option key={r.SeasonID} value={r.SeasonID}>
                {r.SeasonID}
              </option>
            ))}
          </select>
        </label>
      </section>

      {!selectedRoster && (
        <p style={{ marginTop: 12 }}>No roster found for this season.</p>
      )}

      {selectedRoster && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={th}>Player</th>
              <th style={th}>Grad Year</th>
              <th style={th}>PlayerID</th>
            </tr>
          </thead>
          <tbody>
            {rosterWithNames.map((p) => (
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

      <p style={{ marginTop: 14, color: "#555" }}>
        ✅ If you see the roster, your admin wiring + JSON paths are correct.
      </p>
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
