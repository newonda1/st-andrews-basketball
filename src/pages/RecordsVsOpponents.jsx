import React, { useEffect, useState } from "react";

function RecordsVsOpponents() {
  const [games, setGames] = useState([]);
  const [opponentRecords, setOpponentRecords] = useState({});
  const [sortField, setSortField] = useState("Opponent");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetch("/data/games.json")
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
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("Opponent")}
              >
                Opponent{" "}
                {sortField === "Opponent" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("Wins")}
              >
                Wins {sortField === "Wins" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("Losses")}
              >
                Losses{" "}
                {sortField === "Losses" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("Total")}
              >
                Total Games{" "}
                {sortField === "Total" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOpponents.map(([opponent, record], idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{opponent}</td>
                <td className="border px-2 py-1">{record.wins}</td>
                <td className="border px-2 py-1">{record.losses}</td>
                <td className="border px-2 py-1">{record.wins + record.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecordsVsOpponents;
