import React, { useEffect, useState } from "react";

function RecordsVsOpponents() {
  const [games, setGames] = useState([]);
  const [opponentRecords, setOpponentRecords] = useState({});

  useEffect(() => {
    fetch("/data/games.json")
      .then(res => res.json())
      .then(data => {
        setGames(data);
        const records = {};

        data.forEach(game => {
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
      .catch(err => console.error("Failed to load games.json", err));
  }, []);

  const sortedOpponents = Object.entries(opponentRecords)
    .sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Records vs. Opponents</h1>
      <table className="w-full text-sm md:text-base text-center border">
        <thead>
          <tr>
            <th className="border p-2">Opponent</th>
            <th className="border p-2">Wins</th>
            <th className="border p-2">Losses</th>
            <th className="border p-2">Total Games</th>
          </tr>
        </thead>
        <tbody>
          {sortedOpponents.map(([opponent, record], idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{opponent}</td>
              <td className="border px-2 py-1">{record.wins}</td>
              <td className="border px-2 py-1">{record.losses}</td>
              <td className="border px-2 py-1">{record.wins + record.losses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecordsVsOpponents;
