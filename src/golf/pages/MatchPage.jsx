import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { formatGolfDate } from "../golfPageUtils";

function buildPlayerMap(players = []) {
  return new Map(players.map((player) => [Number(player.PlayerID), player]));
}

function getPlayerName(row, playerMap) {
  const player = row.PlayerID ? playerMap.get(Number(row.PlayerID)) : null;
  if (player?.PlayerName) return player.PlayerName;
  if (player?.FirstName || player?.LastName) {
    return [player.FirstName, player.LastName].filter(Boolean).join(" ");
  }
  return row.PlayerName || "Unknown golfer";
}

function TeamScores({ scores = [] }) {
  if (!scores.length) return null;

  const winningScore = Math.min(...scores.map((score) => Number(score.Score)));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {scores.map((score) => {
        const isWinner = Number(score.Score) === winningScore;

        return (
          <div
            key={`${score.School}-${score.Score}`}
            className={`rounded-xl border px-4 py-4 ${
              isWinner
                ? "border-blue-200 bg-blue-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-500">
              {isWinner ? "Winner" : "Team Score"}
            </p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-900">{score.School}</h3>
              <span className="text-3xl font-black text-slate-900">
                {score.Score}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ResultsTable({ rows = [], playerMap }) {
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
              Golfer
            </th>
            <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
              School
            </th>
            <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.School}-${row.PlayerName}-${row.Score}`}
              className={row.IsStAndrews ? "bg-blue-50" : "bg-white"}
            >
              <td className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-900">
                {getPlayerName(row, playerMap)}
              </td>
              <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                {row.School}
              </td>
              <td className="border-b border-slate-200 px-3 py-2 text-center font-bold text-slate-900">
                {row.Score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DivisionSection({ division, playerMap }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm sm:px-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
            {division.Division} Golf
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {division.Division} Match Results
          </h2>
        </div>
        {division.Medalist ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <span className="font-bold">Medalist:</span>{" "}
            {division.Medalist.PlayerName} ({division.Medalist.School}){" "}
            {division.Medalist.Score}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <TeamScores scores={division.TeamScores} />
      </div>

      <div className="mt-5">
        <ResultsTable rows={division.Results} playerMap={playerMap} />
      </div>

      {division.ResultNote ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-600">
          {division.ResultNote}
        </p>
      ) : null}
    </section>
  );
}

export default function MatchPage({ matches = [], players = [], status = "" }) {
  const { matchId } = useParams();

  const match = useMemo(() => {
    return matches.find((entry) => String(entry.MatchID) === String(matchId)) || null;
  }, [matchId, matches]);

  const playerMap = useMemo(() => buildPlayerMap(players), [players]);

  if (!match) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <section className="rounded-[1.4rem] border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Match Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            That golf match is not available yet.
          </p>
          <Link
            to="/athletics/golf/yearly-results"
            className="mt-5 inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Golf Seasons
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-2 sm:px-6">
      {status ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
          {formatGolfDate(match.Date)}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{match.Name}</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {match.Course}
        </p>
      </header>

      <section className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <p className="text-sm leading-7 text-slate-700">{match.Summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[match.SourceCitation, match.Opponent].filter(Boolean).map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {Array.isArray(match.Divisions) && match.Divisions.length ? (
          match.Divisions.map((division) => (
            <DivisionSection
              key={division.Division}
              division={division}
              playerMap={playerMap}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm text-slate-600">
            Match results will appear here when data is added.
          </div>
        )}
      </section>

      <div className="text-center">
        <Link
          to={`/athletics/golf/seasons/${match.Season}`}
          className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline"
        >
          Back to Spring {match.Season}
        </Link>
      </div>
    </div>
  );
}
