import React from "react";
import { Link } from "react-router-dom";

import { getSoftballSeasonSummary, softballGames } from "../softballData";

const seasonSummary = getSoftballSeasonSummary();

function formatAverage(hits, atBats) {
  if (!atBats) return "-";
  return (hits / atBats).toFixed(3).replace(/^0(?=\.)/, "");
}

function StatTable({ children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
      <table className="min-w-full bg-white text-sm">{children}</table>
    </div>
  );
}

function HeaderCell({ children, className = "" }) {
  return (
    <th className={`px-3 py-1.5 text-center ${className}`}>{children}</th>
  );
}

function BodyCell({ children, className = "" }) {
  return (
    <td className={`px-3 py-1.5 text-center ${className}`}>{children}</td>
  );
}

const rowClass = (index) =>
  `border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`;

const stAndrewsHits = softballGames.reduce(
  (total, game) => total + game.lineScore.stAndrewsTotals.hits,
  0,
);
const stAndrewsErrors = softballGames.reduce(
  (total, game) => total + game.lineScore.stAndrewsTotals.errors,
  0,
);

export default function Season2006() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10 pt-2 lg:pb-40">
      <h1 className="mb-2 text-center text-3xl font-bold">Spring 2006 Season</h1>

      <section>
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Season Summary</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm leading-6 text-gray-700 shadow">
          St. Andrew&apos;s is {seasonSummary.wins}-{seasonSummary.losses} through
          the first archived game of the Spring 2006 softball season, outscoring
          opponents {seasonSummary.runsFor}-{seasonSummary.runsAgainst}.
        </div>
      </section>

      <section>
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Schedule &amp; Results</h2>
        <StatTable>
          <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
            <tr>
              <HeaderCell className="text-left">Date</HeaderCell>
              <HeaderCell className="text-left">Opponent</HeaderCell>
              <HeaderCell>Result</HeaderCell>
              <HeaderCell>Score</HeaderCell>
              <HeaderCell>Record</HeaderCell>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {softballGames.map((game, index) => (
              <tr key={game.id} className={rowClass(index)}>
                <BodyCell className="whitespace-nowrap text-left">
                  {game.displayDate}
                </BodyCell>
                <BodyCell className="whitespace-nowrap text-left">
                  <Link
                    to={`/athletics/softball/games/${game.id}`}
                    className="text-blue-700 hover:underline"
                  >
                    {game.opponent}
                  </Link>
                </BodyCell>
                <BodyCell className="font-semibold">{game.result}</BodyCell>
                <BodyCell className="whitespace-nowrap">
                  {game.teamScore} - {game.opponentScore}
                </BodyCell>
                <BodyCell>{game.stAndrewsRecord}</BodyCell>
              </tr>
            ))}
          </tbody>
        </StatTable>
      </section>

      <section>
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Line Score</h2>
        <StatTable>
          <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
            <tr>
              <HeaderCell className="text-left">Game</HeaderCell>
              <HeaderCell>1</HeaderCell>
              <HeaderCell>2</HeaderCell>
              <HeaderCell>3</HeaderCell>
              <HeaderCell>4</HeaderCell>
              <HeaderCell>5</HeaderCell>
              <HeaderCell>R</HeaderCell>
              <HeaderCell>H</HeaderCell>
              <HeaderCell>E</HeaderCell>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {softballGames.flatMap((game) => [
              <tr
                key={`${game.id}-opp-line`}
                className="border-t border-gray-200 bg-white hover:bg-gray-100"
              >
                <BodyCell className="whitespace-nowrap text-left font-semibold">
                  {game.opponentAbbr}
                </BodyCell>
                {game.lineScore.opponent.map((runs, index) => (
                  <BodyCell key={`${game.id}-opp-${index}`}>{runs}</BodyCell>
                ))}
                <BodyCell className="font-semibold">
                  {game.lineScore.opponentTotals.runs}
                </BodyCell>
                <BodyCell className="font-semibold">
                  {game.lineScore.opponentTotals.hits}
                </BodyCell>
                <BodyCell className="font-semibold">
                  {game.lineScore.opponentTotals.errors}
                </BodyCell>
              </tr>,
              <tr
                key={`${game.id}-sas-line`}
                className="border-t border-gray-200 bg-gray-50/70 hover:bg-gray-100"
              >
                <BodyCell className="whitespace-nowrap text-left font-bold text-blue-700">
                  SAS
                </BodyCell>
                {game.lineScore.stAndrews.map((runs, index) => (
                  <BodyCell
                    key={`${game.id}-sas-${index}`}
                    className="font-semibold"
                  >
                    {runs}
                  </BodyCell>
                ))}
                <BodyCell className="font-bold text-blue-700">
                  {game.lineScore.stAndrewsTotals.runs}
                </BodyCell>
                <BodyCell className="font-bold text-blue-700">
                  {game.lineScore.stAndrewsTotals.hits}
                </BodyCell>
                <BodyCell className="font-bold text-blue-700">
                  {game.lineScore.stAndrewsTotals.errors}
                </BodyCell>
              </tr>,
            ])}
          </tbody>
        </StatTable>
      </section>

      <section>
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Hitting Statistics</h2>
        <StatTable>
          <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
            <tr>
              <HeaderCell className="text-left">Player</HeaderCell>
              <HeaderCell>GP</HeaderCell>
              <HeaderCell>AB</HeaderCell>
              <HeaderCell>H</HeaderCell>
              <HeaderCell>2B</HeaderCell>
              <HeaderCell>3B</HeaderCell>
              <HeaderCell>HR</HeaderCell>
              <HeaderCell>RBI</HeaderCell>
              <HeaderCell>AVG</HeaderCell>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {softballGames[0].hittingLeaders.map((player, index) => (
              <tr key={player.player} className={rowClass(index)}>
                <BodyCell className="whitespace-nowrap text-left font-medium">
                  {player.player}
                </BodyCell>
                <BodyCell>1</BodyCell>
                <BodyCell>{player.atBats}</BodyCell>
                <BodyCell>{player.hits}</BodyCell>
                <BodyCell>{player.doubles}</BodyCell>
                <BodyCell>{player.triples}</BodyCell>
                <BodyCell>{player.homeRuns}</BodyCell>
                <BodyCell>{player.rbi}</BodyCell>
                <BodyCell>{formatAverage(player.hits, player.atBats)}</BodyCell>
              </tr>
            ))}
          </tbody>
        </StatTable>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Published hitting leaders only. St. Andrew&apos;s team line lists{" "}
          {stAndrewsHits} total hits.
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Pitching Statistics</h2>
        <StatTable>
          <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
            <tr>
              <HeaderCell className="text-left">Player</HeaderCell>
              <HeaderCell>APP</HeaderCell>
              <HeaderCell>W</HeaderCell>
              <HeaderCell>L</HeaderCell>
              <HeaderCell>SV</HeaderCell>
              <HeaderCell>Record</HeaderCell>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            <tr className={rowClass(0)}>
              <BodyCell className="whitespace-nowrap text-left font-medium">
                {softballGames[0].pitchingDecisions.win.player}
              </BodyCell>
              <BodyCell>1</BodyCell>
              <BodyCell>1</BodyCell>
              <BodyCell>0</BodyCell>
              <BodyCell>0</BodyCell>
              <BodyCell>{softballGames[0].pitchingDecisions.win.record}</BodyCell>
            </tr>
          </tbody>
        </StatTable>
      </section>

      <section>
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Team Totals</h2>
        <StatTable>
          <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
            <tr>
              <HeaderCell>G</HeaderCell>
              <HeaderCell>W</HeaderCell>
              <HeaderCell>L</HeaderCell>
              <HeaderCell>RF</HeaderCell>
              <HeaderCell>RA</HeaderCell>
              <HeaderCell>H</HeaderCell>
              <HeaderCell>E</HeaderCell>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            <tr className={rowClass(0)}>
              <BodyCell>{seasonSummary.games}</BodyCell>
              <BodyCell>{seasonSummary.wins}</BodyCell>
              <BodyCell>{seasonSummary.losses}</BodyCell>
              <BodyCell>{seasonSummary.runsFor}</BodyCell>
              <BodyCell>{seasonSummary.runsAgainst}</BodyCell>
              <BodyCell>{stAndrewsHits}</BodyCell>
              <BodyCell>{stAndrewsErrors}</BodyCell>
            </tr>
          </tbody>
        </StatTable>
      </section>
    </div>
  );
}
