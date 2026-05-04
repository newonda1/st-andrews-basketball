import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  VOLLEYBALL_STAT_SECTIONS,
  buildPlayerMap,
  formatDate,
  formatStat,
  getPlayerName,
  getTeamStatCategory,
} from "../volleyballData";

function SetScoreTable({ game, opponentName }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
              Team
            </th>
            {(game.SetScores || []).map((set) => (
              <th
                key={set.Set}
                className="border-b border-slate-300 px-3 py-2 text-center font-bold"
              >
                S{set.Set}
              </th>
            ))}
            <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
              Sets
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-slate-200 px-3 py-2 font-semibold">
              St. Andrew's
            </td>
            {(game.SetScores || []).map((set) => (
              <td key={`team-${set.Set}`} className="border-b border-slate-200 px-3 py-2 text-center">
                {set.Team}
              </td>
            ))}
            <td className="border-b border-slate-200 px-3 py-2 text-center font-bold">
              {game.TeamScore}
            </td>
          </tr>
          <tr className="bg-slate-50">
            <td className="border-b border-slate-200 px-3 py-2 font-semibold">
              {opponentName}
            </td>
            {(game.SetScores || []).map((set) => (
              <td
                key={`opponent-${set.Set}`}
                className="border-b border-slate-200 px-3 py-2 text-center"
              >
                {set.Opponent}
              </td>
            ))}
            <td className="border-b border-slate-200 px-3 py-2 text-center font-bold">
              {game.OpponentScore}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function buildSchoolMap(schools = []) {
  return new Map(
    (Array.isArray(schools) ? schools : [])
      .filter((school) => school?.SchoolID)
      .map((school) => [String(school.SchoolID), school])
  );
}

function getOpponentDisplayName(game, schoolMap) {
  const school = game?.OpponentID ? schoolMap.get(String(game.OpponentID)) : null;
  return school?.Name || school?.ShortName || game?.Opponent || "Unknown";
}

function GameStatTable({ title, rows, playerMap }) {
  const section = VOLLEYBALL_STAT_SECTIONS.find((entry) => entry.title === title);
  if (!section) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
              Player
            </th>
            {section.columns.map((column) => (
              <th
                key={`${title}-${column.key}`}
                className="border-b border-slate-300 px-3 py-2 text-center font-bold"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const player = playerMap.get(String(row.PlayerID));
            return (
              <tr key={`${title}-${row.PlayerID}`} className="odd:bg-white even:bg-slate-50">
                <td className="border-b border-slate-200 px-3 py-2">
                  <Link
                    to={`/athletics/volleyball/players/${row.PlayerID}`}
                    className="font-semibold text-blue-700 hover:text-blue-900"
                  >
                    {getPlayerName(player)}
                  </Link>
                </td>
                {section.columns.map((column) => (
                  <td
                    key={`${title}-${row.PlayerID}-${column.key}`}
                    className="border-b border-slate-200 px-3 py-2 text-center"
                  >
                    {formatStat(row[column.key], column)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TeamTotals({ matchStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {VOLLEYBALL_STAT_SECTIONS.map((section) => {
        const stats = getTeamStatCategory(matchStats, section.title);
        return (
          <div
            key={section.title}
            className="rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="text-base font-bold text-slate-900">{section.title}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <tbody>
                  {section.columns.map((column) => (
                    <tr key={`${section.title}-${column.key}`} className="odd:bg-white even:bg-slate-50">
                      <td className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-600">
                        {column.label}
                      </td>
                      <td className="border-b border-slate-200 px-3 py-2 text-right font-semibold text-slate-900">
                        {formatStat(stats[column.key], column)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function buildSourceCitation(game) {
  const explicitCitation = String(game?.SourceCitation || "").trim();
  if (explicitCitation) return explicitCitation;

  const parts = [game?.SourcePublication, game?.SourceDate].filter(Boolean);
  return parts.join(", ");
}

function GameRecap({ game }) {
  const recapText = String(game?.Recap || "").trim();
  if (!recapText) return null;

  const recapTitle = String(game?.RecapTitle || "").trim() || "Game Recap";
  const sourceCitation = buildSourceCitation(game);
  const sourceTitle = String(game?.SourceTitle || "").trim();
  const showSourceTitle = sourceTitle && sourceTitle !== recapTitle;

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold text-slate-900">{recapTitle}</h2>
      <p className="whitespace-pre-line text-slate-700 leading-relaxed">{recapText}</p>
      {sourceCitation ? (
        <p className="text-sm text-slate-500">
          Source: {sourceCitation}
          {showSourceTitle ? `, "${sourceTitle}"` : ""}
        </p>
      ) : null}
    </section>
  );
}

export default function GameDetail({ data, status = "" }) {
  const { gameId } = useParams();
  const playerMap = useMemo(() => buildPlayerMap(data.players), [data.players]);
  const schoolMap = useMemo(() => buildSchoolMap(data.schools), [data.schools]);
  const game = useMemo(
    () => data.games.find((entry) => String(entry.GameID) === String(gameId)) || null,
    [data.games, gameId]
  );
  const rows = useMemo(
    () =>
      data.playerGameStats
        .filter((entry) => String(entry.GameID) === String(gameId))
        .slice()
        .sort((a, b) => Number(a.JerseyNumber || 999) - Number(b.JerseyNumber || 999)),
    [data.playerGameStats, gameId]
  );
  const matchStats = useMemo(
    () =>
      data.teamMatchStats.find((entry) => String(entry.GameID) === String(gameId)) ||
      null,
    [data.teamMatchStats, gameId]
  );

  if (status) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center text-sm text-slate-600">
        {status}
      </div>
    );
  }

  if (!game) {
    return <div className="p-4 text-center text-slate-600">Match not found.</div>;
  }

  const resultText = game.Result === "W" ? "Win" : game.Result === "L" ? "Loss" : "Tie";
  const opponentName = getOpponentDisplayName(game, schoolMap);
  const detailItems = [
    game.DisplayDate || formatDate(game.Date),
    game.LocationType,
    game.GameType,
    game.Notes,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pb-24 pt-2 sm:px-6">
      <Link
        to={`/athletics/volleyball/seasons/${game.SeasonID || game.Season}`}
        className="text-sm font-semibold text-blue-700 hover:text-blue-900"
      >
        Back to {game.SourceSeasonLabel || game.Season} Season
      </Link>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          St. Andrew's vs. {opponentName}
        </h1>
        <p className="text-lg font-semibold text-slate-700">
          {resultText}, {game.TeamScore}-{game.OpponentScore}
        </p>
        <p className="text-sm text-slate-500">
          {detailItems.join(" • ")}
        </p>
      </header>

      <GameRecap game={game} />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Set Scores</h2>
        <SetScoreTable game={game} opponentName={opponentName} />
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">Team Match Stats</h2>
        <TeamTotals matchStats={matchStats} />
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">Player Match Stats</h2>
        {VOLLEYBALL_STAT_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-xl font-semibold text-slate-900">{section.title}</h3>
            <GameStatTable title={section.title} rows={rows} playerMap={playerMap} />
          </div>
        ))}
      </section>
    </div>
  );
}
