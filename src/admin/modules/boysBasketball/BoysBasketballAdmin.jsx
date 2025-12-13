import React, { useEffect, useMemo, useState } from "react";

/**
 * Boys Basketball Admin – Phase 1
 * - Load players.json
 * - Load seasonrosters.json
 * - Display roster by season
 * - Confirm admin wiring works end-to-end
 */

const DATA_PATHS = {
  players: "/athletics/boys/basketball/data/players.json",
  seasonRosters: "/athletics/boys/basketball/data/seasonrosters.json",
};

export default function BoysBasketballAdmin() {
  const [players, setPlayers] = useState([]);
  const [seasonRosters, setSeasonRosters] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [playersRes, rostersRes] = await Promise.all([
          fetch(DATA_PATHS.players),
          fetch(DATA_PATHS.seasonRosters),
        ]);

        if (!playersRes.ok || !rostersRes.ok) {
          throw new Error("Failed to load boys basketball data files.");
        }

        const playersData = await playersRes.json();
        const rostersData = await rostersRes.json();

        setPlayers(Array.isArray(playersData) ? playersData : []);
        setSeasonRosters(Array.isArray(rostersData) ? rostersData : []);

        if (rostersData.length > 0) {
          setSelectedSeason(rostersData[0].SeasonID);
        }
      } catch (err) {
        setError(err.message || "Unknown error loading data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const selectedRoster = useMemo(() => {
    return seasonRosters.find((r) => r.SeasonID === selectedSeason);
  }, [seasonRosters, selectedSeason]);

  const rosterWithNames = useMemo(() => {
    if (!selectedRoster) return [];

    return selectedRoster.Players.map((entry) => {
      const player = players.find(
        (p) => Number(p.PlayerID) === Number(entry.PlayerID)
      );

      return {
        PlayerID: entry.PlayerID,
        JerseyNumber: entry.JerseyNumber,
        Name: player
          ? `${player.FirstName} ${player.LastName}`
          : "Unknown Player",
        GradYear: player?.GradYear ?? "",
      };
    });
  }, [selectedRoster, players]);

  if (loading) {
    return <p>Loading boys basketball admin data…</p>;
  }

  if (error) {
    return <p style={{ color: "crimson" }}>{error}</p>;
  }

  return (
    <div>
      <h1>Boys Basketball Admin</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Season Roster</h2>

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

      {!selectedRoster && <p>No roster found for this season.</p>}

      {selectedRoster && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 12,
          }}
        >
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

      <p style={{ marginTop: 16, color: "#555" }}>
        ✅ Data loaded successfully.  
        Next step: add roster editing and stat-entry forms.
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
