// src/boys/basketball/pages/TeamRecords.jsx
import React from "react";
import { Link } from "react-router-dom";

function TeamRecords() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Team Single-Game Records</h2>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Program-best single-game performances by the St. Andrew&apos;s boys&apos;
          basketball team. These are team totals for one game, not individual player
          records. Data will be refined and expanded as more seasons are added.
        </p>
      </div>

      {/* Offense-focused records */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Scoring &amp; Shooting</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-b text-left">Record</th>
                <th className="px-3 py-2 border-b text-right">Value</th>
                <th className="px-3 py-2 border-b text-left">Opponent</th>
                <th className="px-3 py-2 border-b text-left">Season</th>
                <th className="px-3 py-2 border-b text-center">Game</th>
              </tr>
            </thead>
            <tbody>
              {/* Example placeholder rows – you can replace these with real data later */}
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">Most points scored</td>
                <td className="px-3 py-2 border-b text-right">TBD</td>
                <td className="px-3 py-2 border-b">TBD</td>
                <td className="px-3 py-2 border-b">TBD</td>
                <td className="px-3 py-2 border-b text-center text-blue-600">
                  {/* Later you can link directly to GameDetail:
                      <Link to={`/athletics/boys/basketball/games/${gameId}`}>Box score</Link>
                  */}
                  Coming soon
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">Most 3-pointers made</td>
                <td className="px-3 py-2 border-b text-right">TBD</td>
                <td className="px-3 py-2 border-b">TBD</td>
                <td className="px-3 py-2 border-b">TBD</td>
                <td className="px-3 py-2 border-b text-center text-blue-600">
                  Coming soon
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">Most free throws made</td>
                <td className="px-3 py-2 border-b text-right">TBD</td>
                <td className="px-3 py-2 border-b">TBD</td>
                <td className="px-3 py-2 border-b">TBD</td>
                <td className="px-3 py-2 border-b text-center text-blue-600">
                  Coming soon
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Defense & margin records */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Defense &amp; Margin</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-b text-left">Record</th>
                <th className="px-3 py-2 border-b text-right">Value</th>
                <th className="px-3 py-2 border-b text-left">Opponent</th>
                <th className="px-3 py-2 border-b text-left">Season</th>
                <th className="px-3 py-2 border-b text-center">Game</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">Fewest points allowed</td>
                <td className="px-3 py-2 border-b text-right">TBD</td>
                <td className="px-3 py-2 border-b">TBD</td>
                <td className="px-3 py-2 border-b">TBD</td>
                <td className="px-3 py-2 border-b text-center text-blue-600">
                  Coming soon
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">Largest margin of victory</td>
                <td className="px-3 py-2 border-b text-right">TBD</td>
                <td className="px-3 py-2 border-b">TBD</td>
                <td className="px-3 py-2 border-b">TBD</td>
                <td className="px-3 py-2 border-b text-center text-blue-600">
                  Coming soon
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">Largest comeback win</td>
                <td className="px-3 py-2 border-b text-right">TBD</td>
                <td className="px-3 py-2 border-b">TBD</td>
                <td className="px-3 py-2 border-b">TBD</td>
                <td className="px-3 py-2 border-b text-center text-blue-600">
                  Coming soon
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Note for future automation */}
      <p className="text-xs text-gray-500 text-center max-w-xl mx-auto">
        Future enhancement: these values can be calculated automatically from{" "}
        <code className="bg-gray-100 px-1 py-0.5 rounded">
          games.json
        </code>{" "}
        and linked directly to each game&apos;s box score page.
      </p>
    </div>
  );
}

export default TeamRecords;
