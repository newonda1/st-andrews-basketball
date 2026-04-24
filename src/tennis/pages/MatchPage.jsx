import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatTennisDate } from "../tennisPageUtils";

function BracketPlaceholder({ bracket }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{bracket.Name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {bracket.Gender || "—"} {bracket.EventType || "Bracket"}
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
          {bracket.Status || "Ready"}
        </span>
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        Bracket renderer will mount here.
      </div>
    </section>
  );
}

export default function MatchPage({ matches = [], status = "" }) {
  const { matchId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [tournamentStatus, setTournamentStatus] = useState("");

  const match = useMemo(() => {
    return matches.find((entry) => String(entry.MatchID) === String(matchId)) || null;
  }, [matchId, matches]);

  useEffect(() => {
    let cancelled = false;

    async function loadTournament() {
      if (!match?.TournamentDataPath) {
        setTournament(null);
        setTournamentStatus("");
        return;
      }

      setTournamentStatus("Loading tournament data...");

      try {
        const response = await fetch(match.TournamentDataPath);
        if (!response.ok) {
          throw new Error(`Could not load tournament data (${response.status}).`);
        }
        const data = await response.json();

        if (!cancelled) {
          setTournament(data);
          setTournamentStatus("");
        }
      } catch (error) {
        if (!cancelled) {
          setTournament(null);
          setTournamentStatus(error?.message || "Failed to load tournament data.");
        }
      }
    }

    loadTournament();

    return () => {
      cancelled = true;
    };
  }, [match?.TournamentDataPath]);

  if (!match) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <section className="rounded-[1.4rem] border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Match Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            That tennis match or tournament is not available yet.
          </p>
          <Link
            to="/athletics/tennis/yearly-results"
            className="mt-5 inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Tennis Seasons
          </Link>
        </section>
      </div>
    );
  }

  const brackets = tournament?.Brackets || match.Brackets || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-2 sm:px-6">
      {status || tournamentStatus ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
          {tournamentStatus || status}
        </div>
      ) : null}

      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
          {formatTennisDate(match.Date)}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{match.Name}</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {match.Classification || tournament?.Classification || match.MatchType}
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Tournament Brackets
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Singles and doubles brackets can live together on this page.
            </p>
          </div>
          <span className="text-sm font-semibold text-slate-500">
            {brackets.length} brackets
          </span>
        </div>

        {brackets.length ? (
          <div className="space-y-4">
            {brackets.map((bracket) => (
              <BracketPlaceholder key={bracket.BracketID} bracket={bracket} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Bracket data will appear here when it is added.
          </div>
        )}
      </section>
    </div>
  );
}
