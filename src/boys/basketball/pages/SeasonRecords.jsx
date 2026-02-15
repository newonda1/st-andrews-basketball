import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
  // seasonObjOrId can be a seasons.json object or a season id/year.
  if (seasonObjOrId && typeof seasonObjOrId === "object") {
    const ys = Number(seasonObjOrId.YearStart);
    const ye = Number(seasonObjOrId.YearEnd);
    if (Number.isFinite(ys) && Number.isFinite(ye)) {
      return `${ys}-${String(ye).slice(-2)}`;
    }
    // fallback to SeasonID if needed
    const sid = Number(seasonObjOrId.SeasonID);
    if (Number.isFinite(sid)) return formatSeasonLabel(sid);
  }

  const id = Number(seasonObjOrId);
  if (Number.isFinite(id)) {
    // If seasons.json lookup fails, assume Season is the starting year.
    return `${id}-${String(id + 1).slice(-2)}`;
  }

  return "—";
}

const FALLBACK_HEADSHOT = "/images/common/logo.png";

export default function SeasonRecords() {
  const [rowsByRecord, setRowsByRecord] = useState({});
  const [error, setError] = useState("");
  const [expandedKey, setExpandedKey] = useState(null);

  const recordDefs = useMemo(
    () => [
      // Counting stats
      { key: "PTS", label: "Points", abbr: "PTS", valueFn: (t) => t.Points, displayFn: (v) => String(v) },
      {
        key: "PPG",
        label: "Points per game",
        abbr: "PPG",
        qualifierText: "Minimum of 10 games played",
        qualifyFn: (t) => t.GamesPlayed >= 10,
        valueFn: (t) => (t.GamesPlayed > 0 ? t.Points / t.GamesPlayed : 0),
        displayFn: (v) => fmtNumber(v, 1),
      },

      { key: "REB", label: "Rebounds", abbr: "REB", valueFn: (t) => t.Rebounds, displayFn: (v) => String(v) },
      {
        key: "RPG",
        label: "Rebounds per game",
        abbr: "RPG",
        qualifierText: "Minimum of 10 games played",
        qualifyFn: (t) => t.GamesPlayed >= 10,
        valueFn: (t) => (t.GamesPlayed > 0 ? t.Rebounds / t.GamesPlayed : 0),
        displayFn: (v) => fmtNumber(v, 1),
      },

      { key: "AST", label: "Assists", abbr: "AST", valueFn: (t) => t.Assists, displayFn: (v) => String(v) },
      {
        key: "APG",
        label: "Assists per game",
        abbr: "APG",
        qualifierText: "Minimum of 10 games played",
        qualifyFn: (t) => t.GamesPlayed >= 10,
        valueFn: (t) => (t.GamesPlayed > 0 ? t.Assists / t.GamesPlayed : 0),
        displayFn: (v) => fmtNumber(v, 1),
      },

      { key: "STL", label: "Steals", abbr: "STL", valueFn: (t) => t.Steals, displayFn: (v) => String(v) },
      {
        key: "SPG",
        label: "Steals per game",
        abbr: "SPG",
        qualifierText: "Minimum of 10 games played",
        qualifyFn: (t) => t.GamesPlayed >= 10,
        valueFn: (t) => (t.GamesPlayed > 0 ? t.Steals / t.GamesPlayed : 0),
        displayFn: (v) => fmtNumber(v, 1),
      },

      { key: "BLK", label: "Blocks", abbr: "BLK", valueFn: (t) => t.Blocks, displayFn: (v) => String(v) },
      {
        key: "BPG",
        label: "Blocks per game",
        abbr: "BPG",
        qualifierText: "Minimum of 10 games played",
        qualifyFn: (t) => t.GamesPlayed >= 10,
        valueFn: (t) => (t.GamesPlayed > 0 ? t.Blocks / t.GamesPlayed : 0),
        displayFn: (v) => fmtNumber(v, 1),
      },

      // Shooting totals
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

      // Milestones
      { key: "DDS", label: "Double-Doubles", abbr: "DDS", valueFn: (t) => t.DoubleDoubles, displayFn: (v) => String(v) },
      { key: "TDS", label: "Triple-Doubles", abbr: "TDS", valueFn: (t) => t.TripleDoubles, displayFn: (v) => String(v) },

      // Other
      { key: "TO", label: "Turnovers", abbr: "TO", valueFn: (t) => t.Turnovers, displayFn: (v) => String(v) },
    ],
    []
  );

  useEffect(() => {
    const run = async () => {
      try {
        setError("");

        const [playerStatsRaw, playersRaw, seasonsRaw] = await Promise.all([
          fetchJson("playergamestats.json", "/data/boys/basketball/playergamestats.json"),
          fetchJson("players.json", "/data/boys/basketball/players.json"),
          fetchJson("seasons.json", "/data/boys/basketball/seasons.json"),
        ]);

        const playerStats = Array.isArray(playerStatsRaw) ? playerStatsRaw : [];
        const players = Array.isArray(playersRaw) ? playersRaw : [];
        const seasons = Array.isArray(seasonsRaw) ? seasonsRaw : [];
        const seasonsMap = new Map(seasons.map((s) => [String(s.SeasonID), s]));

        const playerMap = new Map(players.map((p) => [String(p.PlayerID), p]));

        // Build season totals per player-season
        const seasonMap = {};

        for (const g of playerStats) {
          if (!g || g.PlayerID == null || g.Season == null) continue;

          const pid = String(g.PlayerID);
          const season = String(g.Season);
          const key = `${pid}-${season}`;

          if (!seasonMap[key]) {
            seasonMap[key] = {
              PlayerID: pid,
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

          // Match your existing SeasonRecords logic: count GP only when minutes > 0
          const played = g.MinutesPlayed != null && Number(g.MinutesPlayed) > 0;
          if (played) entry.GamesPlayed += 1;

          // Sum stats
          entry.Points += safeNum(g.Points);
          entry.Rebounds += safeNum(g.Rebounds);
          entry.Assists += safeNum(g.Assists);
          entry.Steals += safeNum(g.Steals);
          entry.Blocks += safeNum(g.Blocks);
          entry.Turnovers += safeNum(g.Turnovers);
          entry.TwoPM += safeNum(g.TwoPM);
          entry.TwoPA += safeNum(g.TwoPA);
          entry.ThreePM += safeNum(g.ThreePM);
          entry.ThreePA += safeNum(g.ThreePA);
          entry.FTM += safeNum(g.FTM);
          entry.FTA += safeNum(g.FTA);

          // Double/Triple-doubles (standard categories)
          if (played) {
            const cats = [safeNum(g.Points), safeNum(g.Rebounds), safeNum(g.Assists), safeNum(g.Steals), safeNum(g.Blocks)];
            const tens = cats.filter((v) => v >= 10).length;
            if (tens >= 2) entry.DoubleDoubles += 1;
            if (tens >= 3) entry.TripleDoubles += 1;
          }
        }

        const seasonTotals = Object.values(seasonMap).map((t) => {
          const player = playerMap.get(String(t.PlayerID));
          const name = player ? `${player.FirstName} ${player.LastName}` : "Unknown";

          const FGM = safeNum(t.TwoPM) + safeNum(t.ThreePM);
          const FGA = safeNum(t.TwoPA) + safeNum(t.ThreePA);

          const seasonObj = seasonsMap.get(String(t.Season));
          const seasonLabel = formatSeasonLabel(seasonObj || t.Season);

          return {
            ...t,
            Name: name,
            PlayerImg: t.PlayerID ? `/images/boys/basketball/players/${t.PlayerID}.jpg` : null,
            FGM,
            FGA,
            SeasonLabel: seasonLabel,
          };
        });

        // Build top-20 lists for each record
        const next = {};

        for (const def of recordDefs) {
          const qualifyFn = def.qualifyFn || (() => true);

          const list = seasonTotals
            .filter((t) => t && t.PlayerID != null && t.Season != null)
            .filter((t) => qualifyFn(t))
            .map((t) => {
              const raw = Number(def.valueFn(t));
              return {
                sortValue: Number.isFinite(raw) ? raw : 0,
                displayValue: def.displayFn ? def.displayFn(raw) : String(raw),
                playerId: String(t.PlayerID),
                playerName: t.Name || "Unknown",
                playerImg: t.PlayerImg,
                season: t.SeasonLabel || String(t.Season),
                gamesPlayed: Number(t.GamesPlayed) || 0,
              };
            })
            .filter((r) => Number.isFinite(r.sortValue) && r.sortValue > 0)
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
    <div className="space-y-6 px-4">
      <h1 className="text-2xl font-bold text-center">Season Records</h1>
      <p className="-mt-3 text-center text-sm italic text-gray-600">
        Select any record to see the top 20 historical results for that record
      </p>

      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-xs border text-center">
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className="border px-2 py-1">Record</th>
              <th className="border px-2 py-1">Player</th>
              <th className="border px-2 py-1">Value</th>
              <th className="border px-2 py-1">Season</th>
            </tr>
          </thead>

          <tbody>
            {recordDefs.map((def) => {
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
                    <td className="border px-2 py-2 font-semibold">
                      <div className="leading-tight">
                        <div>{def.label}</div>
                        {def.qualifierText ? (
                          <div className="text-[11px] italic font-normal text-gray-600">
                            {def.qualifierText}
                          </div>
                        ) : null}
                      </div>
                    </td>

                    <td className="border px-2 py-2">
                      <div className="flex items-center justify-center gap-2">
                        {top?.playerImg && topPlayer !== "—" && topPlayer !== "Unknown" ? (
                          <img
                            src={top.playerImg}
                            alt={topPlayer}
                            className="h-7 w-7 rounded-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_HEADSHOT;
                            }}
                          />
                        ) : (
                          <img
                            src={FALLBACK_HEADSHOT}
                            alt="Player"
                            className="h-7 w-7 rounded-full object-cover"
                            loading="lazy"
                          />
                        )}

                        {topPlayerId && topPlayer !== "—" && topPlayer !== "Unknown" ? (
                          <Link
                            to={`/athletics/boys/basketball/players/${topPlayerId}`}
                            className="hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {topPlayer}
                          </Link>
                        ) : (
                          <span>{topPlayer}</span>
                        )}
                      </div>
                    </td>

                    <td className="border px-2 py-2 font-semibold">{topValue}</td>
                    <td className="border px-2 py-2">{topSeason}</td>
                  </tr>

                  {isOpen && (
                    <tr className="border-t">
                      <td className="border px-2 py-2" colSpan={4}>
                        <div className="overflow-x-auto">
                          <table className="min-w-full table-auto text-xs border text-center">
                            <thead className="bg-gray-200 font-bold">
                              <tr>
                                <th className="border px-2 py-1">#</th>
                                <th className="border px-2 py-1">Player</th>
                                <th className="border px-2 py-1">{def.abbr}</th>
                                <th className="border px-2 py-1">Season</th>
                                <th className="border px-2 py-1">GP</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(rowsByRecord[def.key] || []).map((r, idx) => (
                                <tr
                                  key={idx}
                                  className={`border-t ${
                                    r._placeholder
                                      ? "bg-white text-gray-400"
                                      : idx % 2 === 0
                                      ? "bg-white"
                                      : "bg-gray-50"
                                  }`}
                                >
                                  <td className="border px-2 py-1 font-semibold">{idx + 1}</td>
                                  <td className="border px-2 py-1">
                                    <div className="flex items-center justify-center gap-2">
                                      <img
                                        src={r.playerImg || FALLBACK_HEADSHOT}
                                        alt={r.playerName}
                                        className="h-7 w-7 rounded-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src = FALLBACK_HEADSHOT;
                                        }}
                                      />

                                      {r.playerId && r.playerName !== "—" && r.playerName !== "Unknown" ? (
                                        <Link
                                          to={`/athletics/boys/basketball/players/${r.playerId}`}
                                          className="hover:underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {r.playerName}
                                        </Link>
                                      ) : (
                                        <span>{r.playerName}</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="border px-2 py-1 font-semibold">{r.displayValue}</td>
                                  <td className="border px-2 py-1">{r.season}</td>
                                  <td className="border px-2 py-1">{r.gamesPlayed}</td>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
