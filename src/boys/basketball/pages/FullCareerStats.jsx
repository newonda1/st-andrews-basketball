import React, { useEffect, useMemo, useState } from "react";

function FullCareerStats() {
  const [careerStats, setCareerStats] = useState([]);
  const [sortField, setSortField] = useState("Points"); // Default sort
  const [sortDirection, setSortDirection] = useState("desc"); // desc = highest first
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setError("");

        const statsPath = "/data/boys/basketball/playergamestats.json";
        const playersPath = "/data/boys/basketball/players.json";
        const adjustmentsPath = "/data/boys/basketball/adjustments.json";

        // adjustments.json might not exist yet; handle gracefully
        const [statsRes, playersRes, adjustmentsRes] = await Promise.all([
          fetch(statsPath),
          fetch(playersPath),
          fetch(adjustmentsPath).catch(() => null),
        ]);

        if (!statsRes.ok) throw new Error(`Failed to load ${statsPath} (HTTP ${statsRes.status})`);
        if (!playersRes.ok) throw new Error(`Failed to load ${playersPath} (HTTP ${playersRes.status})`);

        const statsData = await statsRes.json();
        const playersData = await playersRes.json();

        let adjustmentsData = [];
        if (adjustmentsRes && adjustmentsRes.ok) {
          adjustmentsData = await adjustmentsRes.json();
        }

        const combinedStats = [
          ...(Array.isArray(statsData) ? statsData : []),
          ...(Array.isArray(adjustmentsData) ? adjustmentsData : []),
        ];

        const playerTotals = {};

        for (const stat of combinedStats) {
          const playerId = Number(stat.PlayerID);
          if (!Number.isFinite(playerId)) continue;

          if (!playerTotals[playerId]) {
            playerTotals[playerId] = {
              PlayerID: playerId,
              Points: 0,
              Rebounds: 0,
              Assists: 0,
              Steals: 0,
              Blocks: 0,
              GamesPlayed: 0,
              ThreePM: 0,
              ThreePA: 0,
              TwoPM: 0,
              TwoPA: 0,
              FTM: 0,
              FTA: 0,
            };
          }

          // accumulate (coerce to number, default 0)
          playerTotals[playerId].Points += Number(stat.Points) || 0;
          playerTotals[playerId].Rebounds += Number(stat.Rebounds) || 0;
          playerTotals[playerId].Assists += Number(stat.Assists) || 0;
          playerTotals[playerId].Steals += Number(stat.Steals) || 0;
          playerTotals[playerId].Blocks += Number(stat.Blocks) || 0;

          playerTotals[playerId].ThreePM += Number(stat.ThreePM) || 0;
          playerTotals[playerId].ThreePA += Number(stat.ThreePA) || 0;
          playerTotals[playerId].TwoPM += Number(stat.TwoPM) || 0;
          playerTotals[playerId].TwoPA += Number(stat.TwoPA) || 0;
          playerTotals[playerId].FTM += Number(stat.FTM) || 0;
          playerTotals[playerId].FTA += Number(stat.FTA) || 0;

          // Count as a game row if it has a GameID (stats file does) OR if adjustments is a game-level row
          // This keeps your old behavior: every row contributes +1 game played.
          playerTotals[playerId].GamesPlayed += 1;
        }

        const fullCareerStats = Object.values(playerTotals).map((player) => {
          const playerInfo = (playersData || []).find(
            (p) => Number(p.PlayerID) === Number(player.PlayerID)
          );

          const threeP = player.ThreePA > 0 ? (player.ThreePM / player.ThreePA) * 100 : 0;
          const twoP = player.TwoPA > 0 ? (player.TwoPM / player.TwoPA) * 100 : 0;
          const ftP = player.FTA > 0 ? (player.FTM / player.FTA) * 100 : 0;

          return {
            ...player,
            Name: playerInfo ? `${playerInfo.FirstName} ${playerInfo.LastName}` : "Unknown Player",
            GradYear: playerInfo ? playerInfo.GradYear : "Unknown",
            ThreePPercentage: threeP,
            TwoPPercentage: twoP,
            FTPercentage: ftP,
          };
        });

        setCareerStats(fullCareerStats);
      } catch (e) {
        setError(String(e?.message || e));
      }
    }

    fetchData();
  }, []);

  // Sorting
  const sortedStats = useMemo(() => {
    return [...careerStats].sort((a, b) => {
      const av = a?.[sortField] ?? 0;
      const bv = b?.[sortField] ?? 0;

      if (sortDirection === "asc") return (Number(av) || 0) - (Number(bv) || 0);
      return (Number(bv) || 0) - (Number(av) || 0);
    });
  }, [careerStats, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Full Career Stats</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm md:text-base table-auto whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50">
              {/* Sticky column: give it a real background and a z-index so it stays clean */}
              <th className="sticky left-0 z-20 bg-gray-50 px-2 py-1 text-left border-r">
                Player
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("GradYear")}>
                Grad Year{sortField === "GradYear" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("Points")}>
                Points{sortField === "Points" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("Rebounds")}>
                Rebounds{sortField === "Rebounds" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("Assists")}>
                Assists{sortField === "Assists" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("Steals")}>
                Steals{sortField === "Steals" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("Blocks")}>
                Blocks{sortField === "Blocks" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("GamesPlayed")}>
                Games Played{sortField === "GamesPlayed" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("ThreePM")}>
                3PM{sortField === "ThreePM" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("ThreePA")}>
                3PA{sortField === "ThreePA" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("ThreePPercentage")}>
                3P%{sortField === "ThreePPercentage" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("TwoPM")}>
                2PM{sortField === "TwoPM" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("TwoPA")}>
                2PA{sortField === "TwoPA" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("TwoPPercentage")}>
                2P%{sortField === "TwoPPercentage" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("FTM")}>
                FTM{sortField === "FTM" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("FTA")}>
                FTA{sortField === "FTA" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("FTPercentage")}>
                FT%{sortField === "FTPercentage" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedStats.map((player, index) => (
              <tr key={index} className="border-t odd:bg-white even:bg-gray-100">
                <td className="sticky left-0 z-10 px-2 py-1 bg-inherit border-r font-medium">
                  {player.Name}
                </td>

                <td className="px-2 py-1 text-center">{player.GradYear}</td>
                <td className="px-2 py-1 text-center">{player.Points}</td>
                <td className="px-2 py-1 text-center">{player.Rebounds}</td>
                <td className="px-2 py-1 text-center">{player.Assists}</td>
                <td className="px-2 py-1 text-center">{player.Steals}</td>
                <td className="px-2 py-1 text-center">{player.Blocks}</td>
                <td className="px-2 py-1 text-center">{player.GamesPlayed}</td>
                <td className="px-2 py-1 text-center">{player.ThreePM}</td>
                <td className="px-2 py-1 text-center">{player.ThreePA}</td>
                <td className="px-2 py-1 text-center">
                  {player.ThreePA > 0 ? player.ThreePPercentage.toFixed(1) + "%" : "—"}
                </td>
                <td className="px-2 py-1 text-center">{player.TwoPM}</td>
                <td className="px-2 py-1 text-center">{player.TwoPA}</td>
                <td className="px-2 py-1 text-center">
                  {player.TwoPA > 0 ? player.TwoPPercentage.toFixed(1) + "%" : "—"}
                </td>
                <td className="px-2 py-1 text-center">{player.FTM}</td>
                <td className="px-2 py-1 text-center">{player.FTA}</td>
                <td className="px-2 py-1 text-center">
                  {player.FTA > 0 ? player.FTPercentage.toFixed(1) + "%" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FullCareerStats;
