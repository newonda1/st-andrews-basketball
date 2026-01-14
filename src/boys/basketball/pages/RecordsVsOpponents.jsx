import React, { useEffect, useState } from "react";

function RecordsVsOpponents() {
  const [games, setGames] = useState([]);
  const [opponentRecords, setOpponentRecords] = useState({});
  const [sortField, setSortField] = useState("Opponent");
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedOpponent, setExpandedOpponent] = useState(null);

  useEffect(() => {
    fetch("/data/boys/basketball/games.json")
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
        const records = {};

        data.forEach((game) => {
          const name = game.Opponent;
          if (!records[name]) {
            records[name] = { wins: 0, losses: 0 };
          }

          if (game.Result === "W") {
            records[name].wins += 1;
          } else if (game.Result === "L") {
            records[name].losses += 1;
          }
        });

        setOpponentRecords(records);
      })
      .catch((err) => console.error("Failed to load games.json", err));
  }, []);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleOpponent = (opponent) => {
    setExpandedOpponent(expandedOpponent === opponent ? null : opponent);
  };

  const sortedOpponents = Object.entries(opponentRecords).sort((a, b) => {
    let aVal, bVal;

    if (sortField === "Opponent") {
      aVal = a[0];
      bVal = b[0];
    } else if (sortField === "Wins") {
      aVal = a[1].wins;
      bVal = b[1].wins;
    } else if (sortField === "Losses") {
      aVal = a[1].losses;
      bVal = b[1].losses;
    } else {
      // Total
      aVal = a[1].wins + a[1].losses;
      bVal = b[1].wins + b[1].losses;
    }

    if (typeof aVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Records vs. Opponents</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm md:text-base text-center border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 cursor-pointer" onClick={() => handleSort("Opponent")}>
                Opponent {sortField === "Opponent" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort("Wins")}>Wins {sortField === "Wins" && (sortDirection === "asc" ? "▲" : "▼")}</th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort("Losses")}>Losses {sortField === "Losses" && (sortDirection === "asc" ? "▲" : "▼")}</th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort("Total")}>Total Games {sortField === "Total" && (sortDirection === "asc" ? "▲" : "▼")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedOpponents.map(([opponent, record], idx) => {
              const isExpanded = expandedOpponent === opponent;
              const gamesAgainst = games.filter((g) => g.Opponent === opponent);

              return (
                <React.Fragment key={idx}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleOpponent(opponent)}
                  >
                    <td className="border px-2 py-1 font-medium text-left">{opponent}</td>
                    <td className="border px-2 py-1">{record.wins}</td>
                    <td className="border px-2 py-1">{record.losses}</td>
                    <td className="border px-2 py-1">{record.wins + record.losses}</td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan="4" className="bg-gray-50 text-left px-4 py-2">
                        <ul className="space-y-1">
                          {gamesAgainst.map((game, i) => (
                            <li key={i} className="text-sm">
                              {new Date(Number(game.Date)).toLocaleDateString("en-US", { timeZone: "UTC" })} — {game.Result} {game.TeamScore}-{game.OpponentScore} @ {game.LocationType}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecordsVsOpponents;

