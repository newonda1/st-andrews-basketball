import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { countsAsPlayerGame } from "../dataUtils";
import { recordTableStyles } from "./recordTableStyles";

function absUrl(path) {
  return new URL(path, window.location.origin).toString();
}

async function fetchJson(label, path) {
  const url = absUrl(path);
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  if (!res.ok) throw new Error(`${label} failed (HTTP ${res.status}) at ${path}`);

  const trimmed = text.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    throw new Error(`${label} did not return JSON at ${path} (returned HTML).`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`${label} returned invalid JSON at ${path}: ${String(e?.message || e)}`);
  }
}

async function fetchJsonOptional(label, path) {
  try {
    const url = absUrl(path);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const text = await res.text();
    const trimmed = text.trim();
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) return [];

    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function safeNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function fmtNumber(n, decimals = 1) {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(decimals);
}

function fmtPercent(n, decimals = 1) {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(decimals)}%`;
}

function formatSeasonLabel(seasonObjOrId) {
  if (seasonObjOrId && typeof seasonObjOrId === "object") {
    const ys = Number(seasonObjOrId.YearStart);
    const ye = Number(seasonObjOrId.YearEnd);
    if (Number.isFinite(ys) && Number.isFinite(ye)) {
      return `${ys}-${String(ye).slice(-2)}`;
    }

    const sid = Number(seasonObjOrId.SeasonID);
    if (Number.isFinite(sid)) return formatSeasonLabel(sid);
  }

  const id = Number(seasonObjOrId);
  if (Number.isFinite(id)) {
    return `${id}-${String(id + 1).slice(-2)}`;
  }

  return "—";
}

const FALLBACK_HEADSHOT = "/images/common/logo.png";

export default function SeasonRecords() {
  const [rowsByRecord, setRowsByRecord] = useState({});
  const [error, setError] = useState("");
  const [expandedKey, setExpandedKey] = useState(null);

  const sectionDefs = useMemo(
    () => [
      {
        title: "Scoring & Shooting",
        records: [
          { key: "GP", label: "Games Played", abbr: "GP", valueFn: (t) => t.GamesPlayed, displayFn: (v) => String(v) },
          { key: "PTS", label: "Points", abbr: "PTS", valueFn: (t) => t.Points, displayFn: (v) => String(v) },
          {
            key: "PPG",
            label: "Points per Game",
            abbr: "PPG",
            qualifierText: "Minimum of 10 games played",
            qualifyFn: (t) => t.GamesPlayed >= 10,
            valueFn: (t) => (t.GamesPlayed > 0 ? t.Points / t.GamesPlayed : 0),
            displayFn: (v) => fmtNumber(v, 1),
          },
          { key: "FGM", label: "Field Goals Made", abbr: "FGM", valueFn: (t) => t.FGM, displayFn: (v) => String(v) },
          { key: "FGA", label: "Field Goal Attempts", abbr: "FGA", valueFn: (t) => t.FGA, displayFn: (v) => String(v) },
          {
            key: "FGP",
            label: "Field Goal Percentage",
            abbr: "FG%",
            qualifierText: "Minimum of 50 attempts",
            qualifyFn: (t) => t.FGA >= 50,
            valueFn: (t) => (t.FGA > 0 ? (t.FGM / t.FGA) * 100 : 0),
            displayFn: (v) => fmtPercent(v, 1),
          },
          { key: "TwoPM", label: "2-Pt Field Goals Made", abbr: "2PM", valueFn: (t) => t.TwoPM, displayFn: (v) => String(v) },
          { key: "TwoPA", label: "2-Pt Field Goal Attempts", abbr: "2PA", valueFn: (t) => t.TwoPA, displayFn: (v) => String(v) },
          {
            key: "TwoP",
            label: "2-Pt Field Goal Percentage",
            abbr: "2PT%",
            qualifierText: "Minimum of 50 attempts",
            qualifyFn: (t) => t.TwoPA >= 50,
            valueFn: (t) => (t.TwoPA > 0 ? (t.TwoPM / t.TwoPA) * 100 : 0),
            displayFn: (v) => fmtPercent(v, 1),
          },
          { key: "ThreePM", label: "3-Pt Field Goals Made", abbr: "3PM", valueFn: (t) => t.ThreePM, displayFn: (v) => String(v) },
          { key: "ThreePA", label: "3-Pt Field Goal Attempts", abbr: "3PA", valueFn: (t) => t.ThreePA, displayFn: (v) => String(v) },
          {
            key: "ThreeP",
            label: "3-Pt Field Goal Percentage",
            abbr: "3PT%",
            qualifierText: "Minimum of 30 attempts",
            qualifyFn: (t) => t.ThreePA >= 30,
            valueFn: (t) => (t.ThreePA > 0 ? (t.ThreePM / t.ThreePA) * 100 : 0),
            displayFn: (v) => fmtPercent(v, 1),
          },
          {
            key: "EFG",
            label: "Effective Field Goal Percentage",
            abbr: "EFG%",
            qualifierText: "Minimum of 50 attempts",
            qualifyFn: (t) => t.FGA >= 50,
            valueFn: (t) => (t.FGA > 0 ? ((t.FGM + 0.5 * t.ThreePM) / t.FGA) * 100 : 0),
            displayFn: (v) => fmtPercent(v, 1),
          },
          { key: "FTM", label: "Free Throws Made", abbr: "FTM", valueFn: (t) => t.FTM, displayFn: (v) => String(v) },
          { key: "FTA", label: "Free Throw Attempts", abbr: "FTA", valueFn: (t) => t.FTA, displayFn: (v) => String(v) },
          {
            key: "FTP",
            label: "Free Throw Percentage",
            abbr: "FT%",
            qualifierText: "Minimum of 30 attempts",
            qualifyFn: (t) => t.FTA >= 30,
            valueFn: (t) => (t.FTA > 0 ? (t.FTM / t.FTA) * 100 : 0),
            displayFn: (v) => fmtPercent(v, 1),
          },
        ],
      },
      {
        title: "Playmaking",
        records: [
          { key: "AST", label: "Assists", abbr: "AST", valueFn: (t) => t.Assists, displayFn: (v) => String(v) },
          {
            key: "APG",
            label: "Assists per Game",
            abbr: "APG",
            qualifierText: "Minimum of 10 games played",
            qualifyFn: (t) => t.GamesPlayed >= 10,
            valueFn: (t) => (t.GamesPlayed > 0 ? t.Assists / t.GamesPlayed : 0),
            displayFn: (v) => fmtNumber(v, 1),
          },
          {
            key: "ASTTO",
            label: "Assist-to-Turnover Ratio",
            abbr: "A/TO",
            qualifierText: "Minimum of 15 assists and at least 1 turnover",
            qualifyFn: (t) => t.Assists >= 15 && t.Turnovers > 0,
            valueFn: (t) => (t.Turnovers > 0 ? t.Assists / t.Turnovers : 0),
            displayFn: (v) => fmtNumber(v, 2),
          },
          { key: "TO", label: "Turnovers", abbr: "TO", valueFn: (t) => t.Turnovers, displayFn: (v) => String(v) },
        ],
      },
      {
        title: "Rebounding & Defense",
        records: [
          { key: "REB", label: "Rebounds", abbr: "REB", valueFn: (t) => t.Rebounds, displayFn: (v) => String(v) },
          {
            key: "RPG",
            label: "Rebounds per Game",
            abbr: "RPG",
            qualifierText: "Minimum of 10 games played",
            qualifyFn: (t) => t.GamesPlayed >= 10,
            valueFn: (t) => (t.GamesPlayed > 0 ? t.Rebounds / t.GamesPlayed : 0),
            displayFn: (v) => fmtNumber(v, 1),
          },
          { key: "STL", label: "Steals", abbr: "STL", valueFn: (t) => t.Steals, displayFn: (v) => String(v) },
          {
            key: "SPG",
            label: "Steals per Game",
            abbr: "SPG",
            qualifierText: "Minimum of 10 games played",
            qualifyFn: (t) => t.GamesPlayed >= 10,
            valueFn: (t) => (t.GamesPlayed > 0 ? t.Steals / t.GamesPlayed : 0),
            displayFn: (v) => fmtNumber(v, 1),
          },
          { key: "BLK", label: "Blocks", abbr: "BLK", valueFn: (t) => t.Blocks, displayFn: (v) => String(v) },
          {
            key: "BPG",
            label: "Blocks per Game",
            abbr: "BPG",
            qualifierText: "Minimum of 10 games played",
            qualifyFn: (t) => t.GamesPlayed >= 10,
            valueFn: (t) => (t.GamesPlayed > 0 ? t.Blocks / t.GamesPlayed : 0),
            displayFn: (v) => fmtNumber(v, 1),
          },
        ],
      },
      {
        title: "Milestones",
        records: [
          { key: "DDS", label: "Double-Doubles", abbr: "DDS", valueFn: (t) => t.DoubleDoubles, displayFn: (v) => String(v) },
          { key: "TDS", label: "Triple-Doubles", abbr: "TDS", valueFn: (t) => t.TripleDoubles, displayFn: (v) => String(v) },
        ],
      },
    ],
    []
  );

  const recordDefs = useMemo(() => sectionDefs.flatMap((section) => section.records), [sectionDefs]);

  useEffect(() => {
    const run = async () => {
      try {
        setError("");

        const [playerStatsRaw, playersRaw, seasonsRaw, gamesRaw, adjustmentsRaw] = await Promise.all([
          fetchJson("playergamestats.json", "/data/girls/basketball/playergamestats.json"),
          fetchJson("players.json", "/data/players.json"),
          fetchJson("seasons.json", "/data/girls/basketball/seasons.json"),
          fetchJson("games.json", "/data/girls/basketball/games.json"),
          fetchJsonOptional("adjustments.json", "/data/girls/basketball/adjustments.json"),
        ]);

        const playerStats = Array.isArray(playerStatsRaw) ? playerStatsRaw : [];
        const players = Array.isArray(playersRaw) ? playersRaw : [];
        const seasons = Array.isArray(seasonsRaw) ? seasonsRaw : [];
        const games = Array.isArray(gamesRaw) ? gamesRaw : [];
        const adjustments = Array.isArray(adjustmentsRaw) ? adjustmentsRaw : [];

        const seasonsMap = new Map(seasons.map((s) => [String(s.SeasonID), s]));
        const gameToSeasonMap = new Map(
          games
            .filter((g) => g && g.GameID != null && (g.SeasonID != null || g.Season != null))
            .map((g) => [String(g.GameID), String(g.SeasonID ?? g.Season)])
        );

        const playerMap = new Map(players.map((p) => [String(p.PlayerID), p]));
        const seasonMap = {};

        for (const gameStat of playerStats) {
          if (!gameStat || gameStat.PlayerID == null) continue;

          const seasonIdRaw = gameToSeasonMap.get(String(gameStat.GameID));
          if (seasonIdRaw == null) continue;

          const playerId = String(gameStat.PlayerID);
          const season = String(seasonIdRaw);
          const key = `${playerId}-${season}`;

          if (!seasonMap[key]) {
            seasonMap[key] = {
              PlayerID: playerId,
              Season: season,
              GamesPlayed: 0,
              Points: 0,
              Rebounds: 0,
              Assists: 0,
              Steals: 0,
              Blocks: 0,
              Turnovers: 0,
              TwoPM: 0,
              TwoPA: 0,
              ThreePM: 0,
              ThreePA: 0,
              FTM: 0,
              FTA: 0,
              DoubleDoubles: 0,
              TripleDoubles: 0,
            };
          }

          const entry = seasonMap[key];
          const played = countsAsPlayerGame(gameStat);

          if (played) entry.GamesPlayed += 1;

          entry.Points += safeNum(gameStat.Points);
          entry.Rebounds += safeNum(gameStat.Rebounds);
          entry.Assists += safeNum(gameStat.Assists);
          entry.Steals += safeNum(gameStat.Steals);
          entry.Blocks += safeNum(gameStat.Blocks);
          entry.Turnovers += safeNum(gameStat.Turnovers);
          entry.TwoPM += safeNum(gameStat.TwoPM);
          entry.TwoPA += safeNum(gameStat.TwoPA);
          entry.ThreePM += safeNum(gameStat.ThreePM);
          entry.ThreePA += safeNum(gameStat.ThreePA);
          entry.FTM += safeNum(gameStat.FTM);
          entry.FTA += safeNum(gameStat.FTA);

          if (played) {
            const categories = [
              safeNum(gameStat.Points),
              safeNum(gameStat.Rebounds),
              safeNum(gameStat.Assists),
              safeNum(gameStat.Steals),
              safeNum(gameStat.Blocks),
            ];
            const doubleDigitCategories = categories.filter((value) => value >= 10).length;
            if (doubleDigitCategories >= 2) entry.DoubleDoubles += 1;
            if (doubleDigitCategories >= 3) entry.TripleDoubles += 1;
          }
        }

        for (const adjustment of adjustments) {
          if (!adjustment || adjustment.PlayerID == null || adjustment.SeasonID == null) continue;

          const playerId = String(adjustment.PlayerID);
          const season = String(adjustment.SeasonID);
          const key = `${playerId}-${season}`;

          if (!seasonMap[key]) {
            seasonMap[key] = {
              PlayerID: playerId,
              Season: season,
              GamesPlayed: 0,
              Points: 0,
              Rebounds: 0,
              Assists: 0,
              Steals: 0,
              Blocks: 0,
              Turnovers: 0,
              TwoPM: 0,
              TwoPA: 0,
              ThreePM: 0,
              ThreePA: 0,
              FTM: 0,
              FTA: 0,
              DoubleDoubles: 0,
              TripleDoubles: 0,
            };
          }

          const entry = seasonMap[key];
          entry.GamesPlayed += safeNum(adjustment.GamesPlayed);
          entry.Points += safeNum(adjustment.Points);
          entry.Rebounds += safeNum(adjustment.Rebounds);
          entry.Assists += safeNum(adjustment.Assists);
          entry.Steals += safeNum(adjustment.Steals);
          entry.Blocks += safeNum(adjustment.Blocks);
          entry.Turnovers += safeNum(adjustment.Turnovers);
          entry.TwoPM += safeNum(adjustment.TwoPM);
          entry.TwoPA += safeNum(adjustment.TwoPA);
          entry.ThreePM += safeNum(adjustment.ThreePM);
          entry.ThreePA += safeNum(adjustment.ThreePA);
          entry.FTM += safeNum(adjustment.FTM);
          entry.FTA += safeNum(adjustment.FTA);
          entry.DoubleDoubles += safeNum(adjustment.DoubleDoubles);
          entry.TripleDoubles += safeNum(adjustment.TripleDoubles);
        }

        const seasonTotals = Object.values(seasonMap).map((total) => {
          const player = playerMap.get(String(total.PlayerID));
          const seasonObj = seasonsMap.get(String(total.Season));

          return {
            ...total,
            Name: player ? `${player.FirstName} ${player.LastName}` : "Unknown",
            PlayerImg: total.PlayerID ? `/images/girls/basketball/players/${total.PlayerID}.jpg` : null,
            FGM: safeNum(total.TwoPM) + safeNum(total.ThreePM),
            FGA: safeNum(total.TwoPA) + safeNum(total.ThreePA),
            SeasonLabel: formatSeasonLabel(seasonObj || total.Season),
          };
        });

        const next = {};

        for (const def of recordDefs) {
          const qualifyFn = def.qualifyFn || (() => true);

          const list = seasonTotals
            .filter((total) => total && total.PlayerID != null && total.Season != null)
            .filter((total) => qualifyFn(total))
            .map((total) => {
              const rawValue = Number(def.valueFn(total));

              return {
                sortValue: Number.isFinite(rawValue) ? rawValue : 0,
                displayValue: Number.isFinite(rawValue) ? def.displayFn(rawValue) : "—",
                playerId: String(total.PlayerID),
                playerName: total.Name || "Unknown",
                playerImg: total.PlayerImg,
                season: total.SeasonLabel || String(total.Season),
                gamesPlayed: Number(total.GamesPlayed) || 0,
              };
            })
            .filter((row) => Number.isFinite(row.sortValue) && row.sortValue > 0)
            .sort((a, b) => b.sortValue - a.sortValue)
            .slice(0, 20);

          while (list.length < 20) {
            list.push({
              sortValue: 0,
              displayValue: "—",
              playerId: null,
              playerName: "—",
              playerImg: null,
              season: "—",
              gamesPlayed: "—",
              _placeholder: true,
            });
          }

          next[def.key] = list;
        }

        setRowsByRecord(next);
      } catch (e) {
        setError(String(e?.message || e));
        console.error(e);
      }
    };

    run();
  }, [recordDefs]);

  const toggleExpanded = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-6 px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center">Season Records</h1>
      <p className="-mt-1.5 text-center text-sm italic text-gray-600">
        Select any record to see the top 20 historical results for that record
      </p>

      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className={recordTableStyles.headerCell}>Record</th>
              <th className={recordTableStyles.headerCell}>Player</th>
              <th className={recordTableStyles.headerCell}>Value</th>
              <th className={recordTableStyles.headerCell}>Season</th>
            </tr>
          </thead>

          <tbody>
            {sectionDefs.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="border-t bg-blue-50">
                  <td className={recordTableStyles.sectionCell} colSpan={4}>
                    {section.title}
                  </td>
                </tr>

                {section.records.map((def) => {
                  const top = (rowsByRecord[def.key] || [])[0];
                  const isOpen = expandedKey === def.key;

                  const topPlayer = top?.playerName ?? "—";
                  const topPlayerId = top?.playerId ?? null;
                  const topValue = top?.displayValue ?? "—";
                  const topSeason = top?.season ?? "—";

                  return (
                    <React.Fragment key={def.key}>
                      <tr
                        onClick={() => toggleExpanded(def.key)}
                        className={`border-t cursor-pointer hover:bg-gray-100 ${isOpen ? "bg-gray-50" : "bg-white"}`}
                      >
                        <td className={`${recordTableStyles.bodyCell} font-semibold`}>
                          <div className="leading-tight">
                            <div>{def.label}</div>
                            {def.qualifierText ? (
                              <div className="mt-1 text-[clamp(0.62rem,0.85vw,0.8rem)] italic font-normal text-gray-600">
                                {def.qualifierText}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className={recordTableStyles.bodyCell}>
                          <div className={recordTableStyles.playerWrap}>
                            {top?.playerImg && topPlayer !== "—" && topPlayer !== "Unknown" ? (
                              <img
                                src={top.playerImg}
                                alt={topPlayer}
                                className={recordTableStyles.headshot}
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = FALLBACK_HEADSHOT;
                                }}
                              />
                            ) : null}

                            {topPlayerId && topPlayer !== "—" && topPlayer !== "Unknown" ? (
                              <Link
                                to={`/athletics/girls/basketball/players/${topPlayerId}`}
                                className={recordTableStyles.playerLink}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {topPlayer}
                              </Link>
                            ) : (
                              <span className={recordTableStyles.playerText}>{topPlayer}</span>
                            )}
                          </div>
                        </td>
                        <td className={`${recordTableStyles.bodyCell} font-semibold`}>{topValue}</td>
                        <td className={recordTableStyles.bodyCell}>{topSeason}</td>
                      </tr>

                      {isOpen && (
                        <tr className="border-t">
                          <td className={recordTableStyles.bodyCell} colSpan={4}>
                            <div className="overflow-x-auto">
                              <table className={recordTableStyles.innerTable}>
                                <thead className="bg-gray-200 font-bold">
                                  <tr>
                                    <th className={recordTableStyles.headerCell}>#</th>
                                    <th className={recordTableStyles.headerCell}>Player</th>
                                    <th className={recordTableStyles.headerCell}>{def.abbr}</th>
                                    <th className={recordTableStyles.headerCell}>Season</th>
                                    <th className={recordTableStyles.headerCell}>GP</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(rowsByRecord[def.key] || []).map((row, idx) => (
                                    <tr
                                      key={idx}
                                      className={`border-t ${
                                        row._placeholder
                                          ? "bg-white text-gray-400"
                                          : idx % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                      }`}
                                    >
                                      <td className={`${recordTableStyles.detailCell} font-semibold`}>{idx + 1}</td>
                                      <td className={recordTableStyles.detailCell}>
                                        <div className={recordTableStyles.playerWrap}>
                                          {row.playerImg && row.playerName !== "—" && row.playerName !== "Unknown" ? (
                                            <img
                                              src={row.playerImg}
                                              alt={row.playerName}
                                              className={recordTableStyles.headshot}
                                              loading="lazy"
                                              onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = FALLBACK_HEADSHOT;
                                              }}
                                            />
                                          ) : null}

                                          {row.playerId && row.playerName !== "—" && row.playerName !== "Unknown" ? (
                                            <Link
                                              to={`/athletics/girls/basketball/players/${row.playerId}`}
                                              className={recordTableStyles.playerLink}
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {row.playerName}
                                            </Link>
                                          ) : (
                                            <span className={recordTableStyles.playerText}>{row.playerName}</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className={`${recordTableStyles.detailCell} font-semibold`}>{row.displayValue}</td>
                                      <td className={recordTableStyles.detailCell}>{row.season}</td>
                                      <td className={recordTableStyles.detailCell}>{row.gamesPlayed}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
