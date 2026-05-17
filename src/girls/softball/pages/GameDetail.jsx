import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import SourceMeta from "../../../archive/SourceMeta";
import { athleteProfilePath } from "../../../athletes/archiveEra";
import { SOFTBALL_BASE_PATH, getSoftballGameById } from "../softballData";

function formatAverage(hits, atBats) {
  if (!atBats) return "-";
  return (hits / atBats).toFixed(3).replace(/^0(?=\.)/, "");
}

function formatBattingLine(row) {
  const extras = [
    row.doubles ? `${row.doubles} 2B` : "",
    row.triples ? `${row.triples} 3B` : "",
    row.homeRuns ? `${row.homeRuns} HR` : "",
  ].filter(Boolean);
  const rbi = row.rbi == null ? "" : `, ${row.rbi} RBI`;

  return `${row.hits}-${row.atBats}${extras.length ? `, ${extras.join(", ")}` : ""}${rbi}`;
}

const sectionTitleClass = "text-2xl font-semibold mt-8 mb-4";
const cardClass = "overflow-x-auto rounded-lg shadow border border-gray-200 bg-white";
const thClass = "px-3 py-2 text-center bg-gray-100 text-gray-700 font-semibold";
const tdClass = "px-3 py-2 text-center border-t border-gray-200";

function GameNotFound() {
  return (
    <div className="max-w-6xl mx-auto py-6 text-center">
      <h1 className="text-3xl font-bold mb-3">Game Not Found</h1>
      <p className="text-gray-600 mb-4">We could not find a softball game with that ID.</p>
      <Link to={SOFTBALL_BASE_PATH} className="text-blue-700 hover:underline">
        Back to Softball
      </Link>
    </div>
  );
}

export default function GameDetail() {
  const { gameId } = useParams();
  const game = getSoftballGameById(gameId);

  const hittingTotals = useMemo(() => {
    if (!game) return null;
    return game.hittingLeaders.reduce(
      (totals, row) => ({
        atBats: totals.atBats + Number(row.atBats || 0),
        hits: totals.hits + Number(row.hits || 0),
        doubles: totals.doubles + Number(row.doubles || 0),
        triples: totals.triples + Number(row.triples || 0),
        homeRuns: totals.homeRuns + Number(row.homeRuns || 0),
        rbi: totals.rbi + Number(row.rbi || 0),
      }),
      { atBats: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0 }
    );
  }, [game]);

  if (!game) {
    return <GameNotFound />;
  }

  const { lineScore } = game;
  const winningPitcher = game.pitchingDecisions.win;
  const losingPitcher = game.pitchingDecisions.loss;
  const scoreTitle =
    game.teamScore == null || game.opponentScore == null
      ? game.score
      : `St. Andrew's (${game.teamScore}) vs. ${game.opponent} (${game.opponentScore})`;

  return (
    <div className="max-w-6xl mx-auto pt-4 pb-10 lg:pb-40 space-y-8">
      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          <Link to={SOFTBALL_BASE_PATH} className="text-blue-700 hover:underline">
            Softball
          </Link>
          <span> / </span>
          <Link
            to={`${SOFTBALL_BASE_PATH}/seasons/${game.season}`}
            className="text-blue-700 hover:underline"
          >
            Spring {game.season}
          </Link>
        </div>

        <h1 className="text-3xl font-bold">{scoreTitle}</h1>
        <SourceMeta record={game} />
      </div>

      <section className="rounded-2xl shadow border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 md:px-8 py-6 md:py-8 border-b border-gray-200 bg-gray-50/30">
          <div className="max-w-4xl mx-auto">
            <div className="mb-5 pb-4 border-b border-gray-200">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500 font-semibold mb-3">
                Game Recap
              </p>
              <h2 className="text-3xl md:text-4xl leading-tight font-semibold text-gray-900 font-serif">
                {game.score}
              </h2>
              <div className="mt-4 text-sm text-gray-500">
                {game.displayDate} • {game.locationType} • {game.gameType}
              </div>
            </div>

            <div className="space-y-5 text-[17px] leading-8 text-gray-800 font-serif">
              {game.notes.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {lineScore ? (
          <div className="px-5 md:px-8 pt-5 pb-0">
            <div className="max-w-4xl mx-auto pt-1">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500 font-semibold">
                Line Score
              </p>
            </div>
          </div>
        ) : null}

        {lineScore ? (
        <div className="px-3 md:px-8 py-4 border-b border-gray-200 overflow-x-auto">
          <table className="min-w-full max-w-4xl mx-auto text-sm md:text-base border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left bg-gray-50 text-gray-500 font-semibold border border-gray-200"> </th>
                {lineScore.innings.map((inning) => (
                  <th
                    key={inning}
                    className="px-4 py-3 text-center bg-gray-50 text-gray-600 font-semibold border border-gray-200 min-w-[52px]"
                  >
                    {inning}
                  </th>
                ))}
                <th className="px-4 py-3 text-center bg-gray-100 text-gray-800 font-bold border border-gray-200 min-w-[52px]">R</th>
                <th className="px-4 py-3 text-center bg-gray-100 text-gray-800 font-bold border border-gray-200 min-w-[52px]">H</th>
                <th className="px-4 py-3 text-center bg-gray-100 text-gray-800 font-bold border border-gray-200 min-w-[52px]">E</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-4 font-bold text-left border border-gray-200 whitespace-nowrap">
                  {game.opponentAbbr}
                </td>
                {lineScore.opponent.map((runs, index) => (
                  <td key={`opp-${index}`} className="px-4 py-4 text-center text-xl md:text-2xl font-medium border border-gray-200">
                    {runs}
                  </td>
                ))}
                <td className="px-4 py-4 text-center text-xl md:text-2xl font-extrabold border border-gray-200 bg-gray-50">{lineScore.opponentTotals.runs}</td>
                <td className="px-4 py-4 text-center text-xl md:text-2xl font-extrabold border border-gray-200 bg-gray-50">{lineScore.opponentTotals.hits}</td>
                <td className="px-4 py-4 text-center text-xl md:text-2xl font-extrabold border border-gray-200 bg-gray-50">{lineScore.opponentTotals.errors}</td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-black text-left border border-gray-200 whitespace-nowrap">SAS</td>
                {lineScore.stAndrews.map((runs, index) => (
                  <td key={`sas-${index}`} className="px-4 py-4 text-center text-xl md:text-2xl font-semibold border border-gray-200">
                    {runs}
                  </td>
                ))}
                <td className="px-4 py-4 text-center text-xl md:text-2xl font-black border border-gray-200 bg-blue-50 text-blue-900">{lineScore.stAndrewsTotals.runs}</td>
                <td className="px-4 py-4 text-center text-xl md:text-2xl font-black border border-gray-200 bg-blue-50 text-blue-900">{lineScore.stAndrewsTotals.hits}</td>
                <td className="px-4 py-4 text-center text-xl md:text-2xl font-black border border-gray-200 bg-blue-50 text-blue-900">{lineScore.stAndrewsTotals.errors}</td>
              </tr>
            </tbody>
          </table>
        </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {winningPitcher ? (
            <div className="p-4 flex items-center gap-4">
              <img
                src="/images/girls/softball/softball_icon.png"
                alt=""
                className="w-16 h-16 rounded-full object-contain border border-gray-300 bg-gray-50 p-2"
              />
              <div>
                <div className="text-sm font-black tracking-wide text-gray-500 uppercase">Win</div>
                <div className="text-xl font-bold text-gray-900">
                  {winningPitcher.playerId ? (
                    <Link
                      to={athleteProfilePath(winningPitcher.playerId, "softball")}
                      className="text-blue-700 hover:underline"
                    >
                      {winningPitcher.player}
                    </Link>
                  ) : (
                    winningPitcher.player
                  )}
                  {winningPitcher.record ? ` (${winningPitcher.record})` : ""}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="text-sm font-black tracking-wide text-gray-500 uppercase">Win</div>
              <div className="mt-1 text-xl font-bold text-gray-900">Unknown</div>
            </div>
          )}

          <div className="p-4">
            <div className="text-sm font-black tracking-wide text-gray-500 uppercase">Loss</div>
            <div className="mt-1 text-xl font-bold text-gray-900">
              {losingPitcher?.player || "Unknown"}
            </div>
            <div className="text-sm text-gray-600 mt-1">{game.opponent}</div>
          </div>
        </div>
      </section>

      {lineScore ? (
      <section>
        <h2 className={sectionTitleClass}>St. Andrew&apos;s Hitting</h2>
        <div className={cardClass}>
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr>
                <th className={`${thClass} text-left`}>Hitters</th>
                <th className={thClass}>AB</th>
                <th className={thClass}>H</th>
                <th className={thClass}>2B</th>
                <th className={thClass}>3B</th>
                <th className={thClass}>HR</th>
                <th className={thClass}>RBI</th>
                <th className={thClass}>AVG</th>
                <th className={`${thClass} text-left`}>Published Line</th>
              </tr>
            </thead>
            <tbody>
              {game.hittingLeaders.map((row) => (
                <tr key={row.player} className="hover:bg-gray-50">
                  <td className={`${tdClass} text-left whitespace-nowrap font-bold`}>
                    <Link
                      to={athleteProfilePath(row.playerId, "softball")}
                      className="text-blue-700 hover:underline"
                    >
                      {row.player}
                    </Link>
                  </td>
                  <td className={tdClass}>{row.atBats}</td>
                  <td className={tdClass}>{row.hits}</td>
                  <td className={tdClass}>{row.doubles}</td>
                  <td className={tdClass}>{row.triples}</td>
                  <td className={tdClass}>{row.homeRuns}</td>
                  <td className={tdClass}>{row.rbi}</td>
                  <td className={tdClass}>{formatAverage(row.hits, row.atBats)}</td>
                  <td className={`${tdClass} text-left`}>{formatBattingLine(row)}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-50">
                <td className={`${tdClass} text-left`}>Published Leaders</td>
                <td className={tdClass}>{hittingTotals.atBats}</td>
                <td className={tdClass}>{hittingTotals.hits}</td>
                <td className={tdClass}>{hittingTotals.doubles}</td>
                <td className={tdClass}>{hittingTotals.triples}</td>
                <td className={tdClass}>{hittingTotals.homeRuns}</td>
                <td className={tdClass}>{hittingTotals.rbi}</td>
                <td className={tdClass}>{formatAverage(hittingTotals.hits, hittingTotals.atBats)}</td>
                <td className={`${tdClass} text-left`}>Team line: {lineScore.stAndrewsTotals.hits} hits</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      ) : null}

      <section>
        <h2 className={sectionTitleClass}>Pitching Decisions</h2>
        <div className={cardClass}>
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr>
                <th className={`${thClass} text-left`}>Decision</th>
                <th className={`${thClass} text-left`}>Pitcher</th>
                <th className={`${thClass} text-left`}>Team</th>
              </tr>
            </thead>
            <tbody>
              {winningPitcher ? (
                <tr className="hover:bg-gray-50">
                  <td className={`${tdClass} text-left font-bold`}>WP</td>
                  <td className={`${tdClass} text-left font-bold`}>
                    <Link
                      to={athleteProfilePath(winningPitcher.playerId, "softball")}
                      className="text-blue-700 hover:underline"
                    >
                      {winningPitcher.player}
                    </Link>
                  </td>
                  <td className={`${tdClass} text-left`}>St. Andrew&apos;s</td>
                </tr>
              ) : null}
              <tr className="hover:bg-gray-50">
                <td className={`${tdClass} text-left font-bold`}>LP</td>
                <td className={`${tdClass} text-left font-bold`}>
                  {losingPitcher?.playerId ? (
                    <Link
                      to={athleteProfilePath(losingPitcher.playerId, "softball")}
                      className="text-blue-700 hover:underline"
                    >
                      {losingPitcher.player}
                    </Link>
                  ) : (
                    losingPitcher?.player || "Unknown"
                  )}
                </td>
                <td className={`${tdClass} text-left`}>{game.opponent}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Link to={`${SOFTBALL_BASE_PATH}/seasons/${game.season}`} className="text-blue-700 hover:underline">
        Back to Spring {game.season}
      </Link>
    </div>
  );
}
