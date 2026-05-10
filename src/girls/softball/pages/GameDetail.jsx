import React from "react";
import { Link, useParams } from "react-router-dom";

import { getSoftballGameById } from "../softballData";

const tableShellClass = "overflow-x-auto border border-[var(--stats-line)] bg-white";
const thClass = "border border-[var(--stats-line)] bg-[var(--stats-panel-muted)] px-3 py-3 text-center text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--stats-gray)]";
const tdClass = "border border-[var(--stats-line)] px-3 py-3 text-center text-[0.95rem] text-[#242424]";

function formatBattingLine(row) {
  const extras = [
    row.doubles ? `${row.doubles} 2B` : "",
    row.triples ? `${row.triples} 3B` : "",
    row.homeRuns ? `${row.homeRuns} HR` : "",
  ].filter(Boolean);

  return `${row.hits}-${row.atBats}${extras.length ? `, ${extras.join(", ")}` : ""}, ${row.rbi} RBI`;
}

function GameNotFound() {
  return (
    <div className="stats-module">
      <h1 className="stats-module-title">Game Not Found</h1>
      <p>The requested softball game is not in the archive yet.</p>
      <Link className="stats-button mt-5" to="/athletics/softball/seasons/2006">
        Back to Spring 2006
      </Link>
    </div>
  );
}

export default function GameDetail() {
  const { gameId } = useParams();
  const game = getSoftballGameById(gameId);

  if (!game) {
    return <GameNotFound />;
  }

  const { lineScore } = game;

  return (
    <div className="space-y-10 pb-8">
      <section className="stats-module">
        <p className="mb-4 text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[var(--stats-gray)]">
          Softball • {game.displayDate}
        </p>
        <h1 className="mb-4 text-[2.15rem] font-bold leading-[1.15] text-[var(--stats-navy)] sm:text-[2.75rem]">
          {game.score}
        </h1>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="border border-[var(--stats-line)] bg-[var(--stats-panel-muted)] px-4 py-4">
            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--stats-gray)]">
              St. Andrew's Record
            </p>
            <p className="m-0 mt-2 text-[1.05rem] font-bold text-[var(--stats-navy)]">
              {game.stAndrewsRecord}
            </p>
          </div>
          <div className="border border-[var(--stats-line)] bg-[var(--stats-panel-muted)] px-4 py-4">
            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--stats-gray)]">
              Opponent Record
            </p>
            <p className="m-0 mt-2 text-[1.05rem] font-bold text-[var(--stats-navy)]">
              {game.opponentRecord}
            </p>
          </div>
          <div className="border border-[var(--stats-line)] bg-[var(--stats-panel-muted)] px-4 py-4">
            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--stats-gray)]">
              Winning Pitcher
            </p>
            <p className="m-0 mt-2 text-[1.05rem] font-bold text-[var(--stats-navy)]">
              {game.pitchingDecisions.win.player} ({game.pitchingDecisions.win.record})
            </p>
          </div>
        </div>
      </section>

      <section className="stats-module">
        <h2 className="stats-module-title">Line Score</h2>
        <div className={tableShellClass}>
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className={`${thClass} text-left`}>Team</th>
                {lineScore.innings.map((inning) => (
                  <th key={inning} className={thClass}>{inning}</th>
                ))}
                <th className={thClass}>R</th>
                <th className={thClass}>H</th>
                <th className={thClass}>E</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={`${tdClass} text-left font-bold`}>{game.opponentAbbr}</td>
                {lineScore.opponent.map((runs, index) => (
                  <td key={`opp-${index}`} className={tdClass}>{runs}</td>
                ))}
                <td className={`${tdClass} font-black`}>{lineScore.opponentTotals.runs}</td>
                <td className={`${tdClass} font-black`}>{lineScore.opponentTotals.hits}</td>
                <td className={`${tdClass} font-black`}>{lineScore.opponentTotals.errors}</td>
              </tr>
              <tr>
                <td className={`${tdClass} text-left font-black text-[var(--stats-navy)]`}>SAS</td>
                {lineScore.stAndrews.map((runs, index) => (
                  <td key={`sas-${index}`} className={`${tdClass} font-semibold`}>{runs}</td>
                ))}
                <td className={`${tdClass} bg-blue-50 font-black text-[var(--stats-navy)]`}>{lineScore.stAndrewsTotals.runs}</td>
                <td className={`${tdClass} bg-blue-50 font-black text-[var(--stats-navy)]`}>{lineScore.stAndrewsTotals.hits}</td>
                <td className={`${tdClass} bg-blue-50 font-black text-[var(--stats-navy)]`}>{lineScore.stAndrewsTotals.errors}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="m-0 mt-4 text-[0.82rem] leading-[1.55] text-[var(--stats-gray)]">
          Published line: {lineScore.raw.opponent}; {lineScore.raw.stAndrews}
        </p>
      </section>

      <section className="stats-module">
        <h2 className="stats-module-title">St. Andrew's Hitting Leaders</h2>
        <div className={tableShellClass}>
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className={`${thClass} text-left`}>Player</th>
                <th className={thClass}>AB</th>
                <th className={thClass}>H</th>
                <th className={thClass}>2B</th>
                <th className={thClass}>3B</th>
                <th className={thClass}>HR</th>
                <th className={thClass}>RBI</th>
                <th className={`${thClass} text-left`}>Published Line</th>
              </tr>
            </thead>
            <tbody>
              {game.hittingLeaders.map((row) => (
                <tr key={row.player}>
                  <td className={`${tdClass} text-left font-bold text-[var(--stats-navy)]`}>{row.player}</td>
                  <td className={tdClass}>{row.atBats}</td>
                  <td className={tdClass}>{row.hits}</td>
                  <td className={tdClass}>{row.doubles || ""}</td>
                  <td className={tdClass}>{row.triples || ""}</td>
                  <td className={tdClass}>{row.homeRuns || ""}</td>
                  <td className={tdClass}>{row.rbi}</td>
                  <td className={`${tdClass} text-left`}>{formatBattingLine(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="m-0 mt-4 text-[0.82rem] leading-[1.55] text-[var(--stats-gray)]">
          These are the published hitting leaders. The team line score lists 7 total St. Andrew's hits.
        </p>
      </section>

      <section className="stats-module">
        <h2 className="stats-module-title">Pitching Decisions</h2>
        <div className={tableShellClass}>
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className={`${thClass} text-left`}>Decision</th>
                <th className={`${thClass} text-left`}>Pitcher</th>
                <th className={`${thClass} text-left`}>Team</th>
                <th className={`${thClass} text-left`}>Record</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={`${tdClass} text-left font-bold`}>WP</td>
                <td className={`${tdClass} text-left font-bold text-[var(--stats-navy)]`}>
                  {game.pitchingDecisions.win.player}
                </td>
                <td className={`${tdClass} text-left`}>St. Andrew's</td>
                <td className={`${tdClass} text-left`}>{game.pitchingDecisions.win.record}</td>
              </tr>
              <tr>
                <td className={`${tdClass} text-left font-bold`}>LP</td>
                <td className={`${tdClass} text-left font-bold text-[var(--stats-navy)]`}>
                  {game.pitchingDecisions.loss.player}
                </td>
                <td className={`${tdClass} text-left`}>{game.opponent}</td>
                <td className={`${tdClass} text-left`}>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Link className="stats-button" to="/athletics/softball/seasons/2006">
        Back to Spring 2006
      </Link>
    </div>
  );
}
