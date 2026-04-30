import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { recordTableStyles } from "../../basketball/pages/recordTableStyles";
import {
  formatGameDate,
  formatSeasonLabel,
  getSeasonStatTable,
  getSeasonStatsForSeason,
  loadFootballSeasonPageData,
  sortGamesChronologically,
} from "../footballData";
import { footballGamePath, footballPlayerPath } from "../pages/footballDetailUtils";

const INDIVIDUAL_STATS_VIEW_CONFIG = [
  {
    key: "offense",
    label: "Offense",
    tableTitles: [
      "Passing",
      "Rushing",
      "Receiving",
      "Offensive Fumbles and Pancake Blocks",
      "All Purpose Yards",
      "Total Yards",
    ],
  },
  {
    key: "defense",
    label: "Defense",
    tableTitles: ["Tackles", "Sacks", "Defensive Statistics"],
  },
  {
    key: "special-teams",
    label: "Special Teams",
    tableTitles: ["Kickoffs", "Punts", "Kickoff and Punt Returns"],
  },
  {
    key: "scoring",
    label: "Scoring",
    tableTitles: ["Points", "PATs and Field Goals", "Touchdowns", "Conversions"],
  },
];

function hasMeaningfulValue(value) {
  const text = String(value ?? "").trim();
  return text !== "" && text !== "—" && text !== "-" && text.toLowerCase() !== "n/a";
}

function StatsTable({ title, columns, rows }) {
  const renderCell = (row, column) => {
    if (column.key === "jersey") return row.JerseyNumber || "—";

    if (column.key === "name") {
      if (row.PlayerID) {
        return (
          <Link
            to={footballPlayerPath(row.PlayerID)}
            className="text-blue-600 hover:underline"
          >
            {row.PlayerName || "—"}
          </Link>
        );
      }

      return row.PlayerName || "—";
    }

    const value = row.Values?.[column.key];
    return value || "—";
  };

  return (
    <div className="space-y-3">
      <h4 className="mb-3 text-lg font-semibold">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={`${title}-${column.key}`}
                  className="px-2 py-2 text-center text-xs whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${title}-${row.PlayerID || row.PlayerName || index}`}
                className={`border-t border-gray-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                } hover:bg-gray-100`}
              >
                {columns.map((column) => (
                  <td
                    key={`${title}-${row.PlayerID || row.PlayerName || index}-${column.key}`}
                    className="px-2 py-1.5 text-center whitespace-nowrap"
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamStatsSectionTable({ title, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th colSpan={2} className="px-3 py-2 text-center text-xs uppercase tracking-wide">
              {title}
            </th>
          </tr>
          <tr className="border-t border-gray-200">
            <th className="px-3 py-2 text-left text-xs uppercase tracking-wide">Metric</th>
            <th className="px-3 py-2 text-center text-xs uppercase tracking-wide">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${title}-${row.label}`}
              className={`border-t border-gray-200 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
              } hover:bg-gray-100`}
            >
              <td className="px-3 py-2 text-left">{row.label}</td>
              <td className="px-3 py-2 text-center whitespace-nowrap">
                {row.value === "" || row.value == null ? "—" : row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CombinedTeamStatsTable({ sections }) {
  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow lg:hidden">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wide">Metric</th>
              <th className="px-3 py-2 text-center text-xs uppercase tracking-wide">Value</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="border-t border-gray-200 bg-gray-100">
                  <th colSpan={2} className="px-3 py-2 text-center text-xs uppercase tracking-wide">
                    {section.title}
                  </th>
                </tr>
                {section.rows.map((row, index) => (
                  <tr
                    key={`${section.title}-${row.label}`}
                    className={`border-t border-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                    } hover:bg-gray-100`}
                  >
                    <td className="px-3 py-2 text-left">{row.label}</td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {row.value === "" || row.value == null ? "—" : row.value}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hidden items-start gap-6 lg:grid lg:grid-cols-3">
        {sections.map((section) => (
          <TeamStatsSectionTable key={section.title} title={section.title} rows={section.rows} />
        ))}
      </div>
    </>
  );
}

function formatWeight(value) {
  return Number.isFinite(Number(value)) ? `${Number(value)} lbs` : "—";
}

export default function FootballSeasonPage({ seasonId: seasonIdProp = null }) {
  const params = useParams();
  const resolvedSeasonId = Number(seasonIdProp ?? params.seasonId);

  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [seasonStatsCollection, setSeasonStatsCollection] = useState([]);
  const [selectedStatsView, setSelectedStatsView] = useState(
    INDIVIDUAL_STATS_VIEW_CONFIG[0].key
  );
  const [status, setStatus] = useState("Loading football season...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const data = await loadFootballSeasonPageData();
        if (cancelled) return;

        setGames(data.games);
        setPlayers(data.players);
        setRosters(data.rosters);
        setSeasons(data.seasons);
        setSeasonStatsCollection(data.seasonStats);
        setStatus("");
      } catch (error) {
        if (cancelled) return;
        setStatus(error?.message || "Failed to load the football season.");
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const season = useMemo(
    () => seasons.find((entry) => Number(entry.SeasonID) === resolvedSeasonId) || null,
    [resolvedSeasonId, seasons]
  );

  const seasonLabel = useMemo(() => {
    if (season) return formatSeasonLabel(season);
    if (Number.isFinite(resolvedSeasonId)) return `${resolvedSeasonId}`;
    return "Football";
  }, [resolvedSeasonId, season]);

  const rosterSeason = useMemo(
    () => rosters.find((entry) => Number(entry.SeasonID) === resolvedSeasonId) || null,
    [resolvedSeasonId, rosters]
  );

  const seasonGames = useMemo(
    () =>
      sortGamesChronologically(
        games.filter((game) => Number(game.SeasonID ?? game.Season) === resolvedSeasonId)
      ),
    [games, resolvedSeasonId]
  );

  const seasonStats = useMemo(
    () => getSeasonStatsForSeason(seasonStatsCollection, resolvedSeasonId),
    [resolvedSeasonId, seasonStatsCollection]
  );

  const playerMap = useMemo(() => {
    const map = new Map();
    players.forEach((player) => {
      map.set(String(player.PlayerID), player);
    });
    return map;
  }, [players]);

  const rosterRows = useMemo(() => {
    const entries = Array.isArray(rosterSeason?.Players) ? rosterSeason.Players : [];

    return entries
      .map((entry) => ({
        ...playerMap.get(String(entry.PlayerID)),
        ...entry,
      }))
      .sort((a, b) => {
        const jerseyA = Number(a.JerseyNumber || 999);
        const jerseyB = Number(b.JerseyNumber || 999);
        if (jerseyA !== jerseyB) return jerseyA - jerseyB;
        return String(a.PlayerName || "").localeCompare(String(b.PlayerName || ""));
      });
  }, [playerMap, rosterSeason]);

  const passingTable = useMemo(() => getSeasonStatTable(seasonStats, "Passing"), [seasonStats]);
  const rushingTable = useMemo(() => getSeasonStatTable(seasonStats, "Rushing"), [seasonStats]);
  const receivingTable = useMemo(
    () => getSeasonStatTable(seasonStats, "Receiving"),
    [seasonStats]
  );
  const totalYardsTable = useMemo(
    () => getSeasonStatTable(seasonStats, "Total Yards"),
    [seasonStats]
  );
  const allPurposeTable = useMemo(
    () => getSeasonStatTable(seasonStats, "All Purpose Yards"),
    [seasonStats]
  );
  const tacklesTable = useMemo(() => getSeasonStatTable(seasonStats, "Tackles"), [seasonStats]);
  const sacksTable = useMemo(() => getSeasonStatTable(seasonStats, "Sacks"), [seasonStats]);
  const defenseTable = useMemo(
    () => getSeasonStatTable(seasonStats, "Defensive Statistics"),
    [seasonStats]
  );
  const returnsTable = useMemo(
    () => getSeasonStatTable(seasonStats, "Kickoff and Punt Returns"),
    [seasonStats]
  );
  const puntsTable = useMemo(() => getSeasonStatTable(seasonStats, "Punts"), [seasonStats]);
  const kickoffsTable = useMemo(
    () => getSeasonStatTable(seasonStats, "Kickoffs"),
    [seasonStats]
  );
  const touchdownsTable = useMemo(
    () => getSeasonStatTable(seasonStats, "Touchdowns"),
    [seasonStats]
  );
  const conversionsTable = useMemo(
    () => getSeasonStatTable(seasonStats, "Conversions"),
    [seasonStats]
  );

  const offenseRows = useMemo(
    () => [
      {
        label: "Pass completions / attempts",
        value:
          hasMeaningfulValue(passingTable?.Totals?.passingcomp) &&
          hasMeaningfulValue(passingTable?.Totals?.passingatt)
            ? `${passingTable.Totals.passingcomp} / ${passingTable.Totals.passingatt}`
            : "—",
      },
      { label: "Passing yards", value: passingTable?.Totals?.passingyards || "—" },
      {
        label: "Passing TD / INT",
        value:
          hasMeaningfulValue(passingTable?.Totals?.passingtd) &&
          hasMeaningfulValue(passingTable?.Totals?.passingint)
            ? `${passingTable.Totals.passingtd} / ${passingTable.Totals.passingint}`
            : "—",
      },
      { label: "Rushing attempts", value: rushingTable?.Totals?.rushingnum || "—" },
      { label: "Rushing yards", value: rushingTable?.Totals?.rushingyards || "—" },
      { label: "Rushing TD", value: rushingTable?.Totals?.rushingtdnum || "—" },
      { label: "Receiving yards", value: receivingTable?.Totals?.receivingyards || "—" },
      {
        label: "Total offense",
        value:
          hasMeaningfulValue(totalYardsTable?.Totals?.totalyards) &&
          hasMeaningfulValue(totalYardsTable?.Totals?.totalyardspergame)
            ? `${totalYardsTable.Totals.totalyards} (${totalYardsTable.Totals.totalyardspergame}/G)`
            : totalYardsTable?.Totals?.totalyards || "—",
      },
      {
        label: "All-purpose yards",
        value:
          hasMeaningfulValue(allPurposeTable?.Totals?.allpurposeyards) &&
          hasMeaningfulValue(allPurposeTable?.Totals?.allpurposeyardspergame)
            ? `${allPurposeTable.Totals.allpurposeyards} (${allPurposeTable.Totals.allpurposeyardspergame}/G)`
            : allPurposeTable?.Totals?.allpurposeyards || "—",
      },
    ],
    [allPurposeTable, passingTable, receivingTable, rushingTable, totalYardsTable]
  );

  const defenseRows = useMemo(
    () => [
      { label: "Total tackles", value: tacklesTable?.Totals?.totaltackles || "—" },
      { label: "Tackles for loss", value: tacklesTable?.Totals?.tacklesforloss || "—" },
      { label: "Sacks", value: sacksTable?.Totals?.sacks || "—" },
      { label: "QB hurries", value: sacksTable?.Totals?.qbhurries || "—" },
      { label: "Interceptions", value: defenseTable?.Totals?.ints || "—" },
      { label: "INT return yards", value: defenseTable?.Totals?.intyards || "—" },
      { label: "Passes defensed", value: defenseTable?.Totals?.passesdefensed || "—" },
      { label: "Fumble recoveries", value: defenseTable?.Totals?.fumblerecoveries || "—" },
      { label: "Caused fumbles", value: defenseTable?.Totals?.causedfumbles || "—" },
    ],
    [defenseTable, sacksTable, tacklesTable]
  );

  const specialTeamsRows = useMemo(
    () => [
      { label: "Kickoffs", value: kickoffsTable?.Totals?.kickoffnum || "—" },
      { label: "Punts", value: puntsTable?.Totals?.puntnum || "—" },
      { label: "Punt average", value: puntsTable?.Totals?.puntaverage || "—" },
      { label: "Kickoff returns", value: returnsTable?.Totals?.kickoffreturnnum || "—" },
      { label: "Kickoff return yards", value: returnsTable?.Totals?.kickoffreturnyards || "—" },
      { label: "Punt returns", value: returnsTable?.Totals?.puntreturnnum || "—" },
      { label: "Punt return yards", value: returnsTable?.Totals?.puntreturnyards || "—" },
      { label: "Total touchdowns", value: touchdownsTable?.Totals?.totaltdnum || "—" },
      { label: "Conversions", value: conversionsTable?.Totals?.patconversions || "—" },
    ],
    [conversionsTable, kickoffsTable, puntsTable, returnsTable, touchdownsTable]
  );

  const combinedTeamStatsSections = useMemo(
    () => [
      { title: "Offense", rows: offenseRows },
      { title: "Defense", rows: defenseRows },
      { title: "Special Teams & Scoring", rows: specialTeamsRows },
    ],
    [defenseRows, offenseRows, specialTeamsRows]
  );

  const hasTeamStats = useMemo(
    () =>
      combinedTeamStatsSections.some((section) =>
        section.rows.some((row) => hasMeaningfulValue(row.value))
      ),
    [combinedTeamStatsSections]
  );

  const individualStatsViews = useMemo(
    () =>
      INDIVIDUAL_STATS_VIEW_CONFIG.map((view) => ({
        ...view,
        tables: view.tableTitles
          .map((title) => getSeasonStatTable(seasonStats, title))
          .filter(Boolean),
      })).filter((view) => view.tables.length > 0),
    [seasonStats]
  );

  useEffect(() => {
    if (individualStatsViews.length === 0) return;
    if (individualStatsViews.some((view) => view.key === selectedStatsView)) return;
    setSelectedStatsView(individualStatsViews[0].key);
  }, [individualStatsViews, selectedStatsView]);

  const activeStatsView = useMemo(
    () =>
      individualStatsViews.find((view) => view.key === selectedStatsView) ||
      individualStatsViews[0] ||
      null,
    [individualStatsViews, selectedStatsView]
  );

  const emptyStateClassName = `${recordTableStyles.bodyCell} text-center text-slate-600`;
  const missingSeasonStatus =
    !status && !season && seasonGames.length === 0
      ? `No football data is available for the ${seasonLabel} season.`
      : "";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-10 pt-2 lg:pb-40">
      {status ? <div className="text-center text-slate-600">{status}</div> : null}
      {missingSeasonStatus ? (
        <div className="text-center text-slate-600">{missingSeasonStatus}</div>
      ) : null}

      <section className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{seasonLabel} Season</h1>
      </section>

      <section id="schedule-results" className="space-y-4">
        <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-xs text-gray-700 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Opponent</th>
                <th className="px-3 py-2 text-center">Site</th>
                <th className="px-3 py-2 text-center">Result</th>
                <th className="px-3 py-2 text-center">Score</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {seasonGames.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-slate-600">
                    No MaxPreps schedule data is available for this season yet.
                  </td>
                </tr>
              ) : (
                seasonGames.map((game, index) => (
                  <tr
                    key={game.GameID}
                    className={`border-t border-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                    } hover:bg-gray-100`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Link
                        to={footballGamePath(game.GameID)}
                        className="text-blue-600 hover:underline"
                      >
                        {formatGameDate(game)}
                      </Link>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Link
                        to={footballGamePath(game.GameID)}
                        className="text-blue-600 hover:underline"
                      >
                        {game.Opponent || "—"}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {game.LocationType || ""}
                    </td>
                    <td
                      className={`px-3 py-2 text-center font-semibold whitespace-nowrap ${
                        game.Result === "W"
                          ? "text-emerald-700"
                          : game.Result === "L"
                            ? "text-rose-700"
                            : ""
                      }`}
                    >
                      {game.Result || ""}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {game.Result ? (
                        <Link
                          to={footballGamePath(game.GameID)}
                          className="text-blue-600 hover:underline"
                        >
                          {game.TeamScore} - {game.OpponentScore}
                        </Link>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="roster" className="space-y-4">
        <h2 className="text-2xl font-semibold">Roster</h2>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border text-center text-[clamp(0.66rem,0.95vw,0.98rem)]">
            <thead className="bg-gray-200 font-bold">
              <tr>
                <th className={`${recordTableStyles.headerCell} whitespace-nowrap`}>No.</th>
                <th className={`${recordTableStyles.headerCell} md:text-left`}>Player</th>
                <th className={`${recordTableStyles.headerCell} whitespace-nowrap`}>Grade</th>
                <th className={`${recordTableStyles.headerCell} md:text-left`}>Pos.</th>
                <th className={`${recordTableStyles.headerCell} whitespace-nowrap`}>Height</th>
                <th className={`${recordTableStyles.headerCell} whitespace-nowrap`}>Weight</th>
                <th className={`${recordTableStyles.headerCell} whitespace-nowrap`}>Captain</th>
              </tr>
            </thead>
            <tbody>
              {rosterRows.length === 0 ? (
                <tr>
                  <td className={emptyStateClassName} colSpan={7}>
                    No MaxPreps roster data is available for this season yet.
                  </td>
                </tr>
              ) : (
                rosterRows.map((player) => (
                  <tr key={player.PlayerID}>
                    <td className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>
                      {player.JerseyNumber || "—"}
                    </td>
                    <td className={`${recordTableStyles.bodyCell} md:text-left`}>
                      {player.PlayerID ? (
                        <Link
                          to={footballPlayerPath(player.PlayerID)}
                          className="text-blue-600 hover:underline"
                        >
                          {player.PlayerName || "—"}
                        </Link>
                      ) : (
                        player.PlayerName || "—"
                      )}
                    </td>
                    <td className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>
                      {player.Grade || "—"}
                    </td>
                    <td className={`${recordTableStyles.bodyCell} md:text-left`}>
                      {(player.Positions || []).join(", ") || "—"}
                    </td>
                    <td className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>
                      {player.Height || "—"}
                    </td>
                    <td className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>
                      {formatWeight(player.Weight)}
                    </td>
                    <td className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>
                      {player.Captain ? "Yes" : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="team-stats" className="space-y-6">
        <h2 className="text-2xl font-semibold">Team Stats</h2>

        {hasTeamStats ? (
          <CombinedTeamStatsTable sections={combinedTeamStatsSections} />
        ) : (
          <p className="text-slate-600">No MaxPreps team stats are available for this season.</p>
        )}
      </section>

      <section id="individual-stats" className="space-y-6">
        <h2 className="text-2xl font-semibold">Individual Stats</h2>

        {individualStatsViews.length === 0 ? (
          <p className="text-slate-600">
            No MaxPreps individual stat tables are available for this season.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-3">
              {individualStatsViews.map((view) => {
                const isActive = selectedStatsView === view.key;
                return (
                  <button
                    key={view.key}
                    type="button"
                    onClick={() => setSelectedStatsView(view.key)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                      isActive
                        ? "border-blue-900 bg-blue-900 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {view.label}
                  </button>
                );
              })}
            </div>

            {activeStatsView ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {activeStatsView.label} Statistics
                </h3>
                <div className="space-y-6">
                  {activeStatsView.tables.map((table) => (
                    <StatsTable
                      key={`${resolvedSeasonId}-${table.TableID}`}
                      title={table.Title}
                      columns={table.Columns || []}
                      rows={table.Rows || []}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
