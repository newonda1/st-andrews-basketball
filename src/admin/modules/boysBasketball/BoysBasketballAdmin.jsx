import React, { useEffect, useMemo, useState } from "react";

/**
 * Boys Basketball Admin – Phase 1 (robust loader)
 * Tries multiple possible public paths for JSON so we don't guess wrong.
 */

function absUrl(path) {
  // Ensures Safari always gets a valid absolute URL
  return new URL(path, window.location.origin).toString();
}

async function fetchJsonFirst(label, candidates) {
  const attempts = [];

  for (const path of candidates) {
    const url = absUrl(path);

    try {
      const res = await fetch(url, { cache: "no-store" });
      attempts.push(`${res.ok ? "✅" : "❌"} ${path} (HTTP ${res.status})`);

      if (!res.ok) continue;

      const data = await res.json();
      return { data, usedPath: path, attempts };
    } catch (e) {
      attempts.push(`💥 ${path} (${String(e?.message || e)})`);
    }
  }

  throw new Error(
    `${label} failed to load from any known path.\n` +
      attempts.join("\n")
  );
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

        // These are the 3 most likely locations in YOUR project:
        // 1) /athletics/... (if you copied data under that route)
        // 2) /boys/basketball/... (if you used a sport folder)
        // 3) /data/... (your older / most common setup)
        const playersResult = await fetchJsonFirst("players.json", [
          "/athletics/boys/basketball/data/players.json",
          "/boys/basketball/data/players.json",
          "/data/players.json",
        ]);

        const rostersResult = await fetchJsonFirst("seasonrosters.json", [
          "/athletics/boys/basketball/data/seasonrosters.json",
          "/boys/basketball/data/seasonrosters.json",
          "/data/seasonrosters.json",
        ]);

        const playersData = Array.isArray(playersResult.data)
          ? playersResult.data
          : [];
        const rostersData = Array.isArray(rostersResult.data)
          ? rostersResult.data
          : [];

        setPlayers(playersData);
        setSeasonRosters(rostersData);

        setPathsUsed({
          players: playersResult.usedPath,
          seasonRosters: rostersResult.usedPath,
        });

        if (rostersData.length > 0) {
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

        <p style={{ color: "#555" }}>
          Quick check: open your regular season page and see what URL it uses
          to load players/games. Whatever that is, we’ll match it here.
        </p>
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

      {!selectedRoster && <p style={{ marginTop: 12 }}>No roster found for this season.</p>}

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
