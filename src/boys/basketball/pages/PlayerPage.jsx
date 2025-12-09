import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// These must match the *field names* in playergamestats.json
const statKeys = [
  "Points",
  "Rebounds",
  "Assists",
  "Turnovers",
  "Steals",
  "Blocks",
  "ThreePM",
  "ThreePA",
  "TwoPM",
  "TwoPA",
  "FTM",
  "FTA",
];

// Display labels for each stat
const statLabels = {
  Points: "PTS",
  Rebounds: "REB",
  Assists: "AST",
  Turnovers: "TOV",
  Steals: "STL",
  Blocks: "BLK",
  ThreePM: "3PM",
  ThreePA: "3PA",
  TwoPM: "2PM",
  TwoPA: "2PA",
  FTM: "FTM",
  FTA: "FTA",
};

function PlayerPage() {
  const { playerId } = useParams();
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [groupedBySeason, setGroupedBySeason] = useState({});
  const [totalsBySeason, setTotalsBySeason] = useState({});
  const [overallTotals, setOverallTotals] = useState({});
  const [efficiencyBySeason, setEfficiencyBySeason] = useState({});
  const [overallEfficiency, setOverallEfficiency] = useState(null);

  const [perGameBySeason, setPerGameBySeason] = useState({});
  const [overallPerGame, setOverallPerGame] = useState({});
  const [showPerGame, setShowPerGame] = useState(false);

  const [per36BySeason, setPer36BySeason] = useState({});
  const [overallPer36, setOverallPer36] = useState({});
  const [showPer36, setShowPer36] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetch("/data/basketball/boys/players.json").then((res) => res.json()),
      fetch("/data/basketball/boys/games.json").then((res) => res.json()),
      fetch("/data/basketball/boys/playergamestats.json").then((res) =>
        res.json()
      ),
    ])
      .then(([playersData, gamesData, statsData]) => {
        setPlayers(playersData);
        setGames(gamesData);

        const playerIdNum = Number(playerId);
        const filteredStats = statsData.filter(
          (row) => Number(row.PlayerID) === playerIdNum
        );
        setStats(filteredStats);
        processStats(filteredStats, gamesData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load player data. Please try again later.");
        setLoading(false);
      });
  }, [playerId]);

  const processStats = (playerStats, allGames) => {
    const bySeason = {};
    playerStats.forEach((row) => {
      const season = row.Season;
      if (!bySeason[season]) {
        bySeason[season] = [];
      }
      bySeason[season].push(row);
    });

    setGroupedBySeason(bySeason);

    const seasonTotals = {};
    const seasonEff = {};
    const perGameSeason = {};
    const per36Season = {};

    const overall = { games: 0, minutes: 0 };
    statKeys.forEach((k) => {
      overall[k] = 0;
    });

    Object.entries(bySeason).forEach(([season, rows]) => {
      const seasonTotal = { games: rows.length, minutes: 0 };
      statKeys.forEach((k) => {
        seasonTotal[k] = 0;
      });

      rows.forEach((row) => {
        const minutes = Number(row.Minutes || 0);
        seasonTotal.minutes += minutes;
        overall.minutes += minutes;

        statKeys.forEach((k) => {
          const val = Number(row[k] || 0);
          seasonTotal[k] += val;
          overall[k] += val;
        });

        overall.games += 1;
      });

      seasonTotals[season] = seasonTotal;

      const fga =
        (seasonTotal.ThreePA || 0) + (seasonTotal.TwoPA || 0) || 0;
      const fgm =
        (seasonTotal.ThreePM || 0) + (seasonTotal.TwoPM || 0) || 0;
      const fta = seasonTotal.FTA || 0;
      const tov = seasonTotal.Turnovers || 0;
      const pts = seasonTotal.Points || 0;

      const effDen = fga + 0.44 * fta + tov;
      const seasonEffValue = effDen > 0 ? (pts / effDen).toFixed(3) : null;
      seasonEff[season] = seasonEffValue;

      const gCount = rows.length || 1;
      const perGame = {};
      statKeys.forEach((k) => {
        perGame[k] = (seasonTotal[k] / gCount).toFixed(1);
      });
      perGame.minutes = (seasonTotal.minutes / gCount).toFixed(1);
      perGameSeason[season] = perGame;

      const totalMinutes = seasonTotal.minutes || 0;
      const per36 = {};
      if (totalMinutes > 0) {
        statKeys.forEach((k) => {
          per36[k] = ((seasonTotal[k] * 36) / totalMinutes).toFixed(1);
        });
        per36.minutes = 36.0;
      } else {
        statKeys.forEach((k) => {
          per36[k] = "0.0";
        });
        per36.minutes = 0.0;
      }
      per36Season[season] = per36;
    });

    setTotalsBySeason(seasonTotals);
    setEfficiencyBySeason(seasonEff);
    setPerGameBySeason(perGameSeason);
    setPer36BySeason(per36Season);

    const totalFGA =
      (overall.ThreePA || 0) + (overall.TwoPA || 0) || 0;
    const totalFGM =
      (overall.ThreePM || 0) + (overall.TwoPM || 0) || 0;
    const totalFTA = overall.FTA || 0;
    const totalTOV = overall.Turnovers || 0;
    const totalPTS = overall.Points || 0;
    const overallEffDen = totalFGA + 0.44 * totalFTA + totalTOV;
    const overallEffValue =
      overallEffDen > 0 ? (totalPTS / overallEffDen).toFixed(3) : null;

    const totalGames = overall.games || 1;
    const overallPerGameCalc = {};
    statKeys.forEach((k) => {
      overallPerGameCalc[k] = (overall[k] / totalGames).toFixed(1);
    });
    overallPerGameCalc.minutes = (overall.minutes / totalGames).toFixed(1);

    const overallPer36Calc = {};
    if (overall.minutes > 0) {
      statKeys.forEach((k) => {
        overallPer36Calc[k] = ((overall[k] * 36) / overall.minutes).toFixed(1);
      });
      overallPer36Calc.minutes = 36.0;
    } else {
      statKeys.forEach((k) => {
        overallPer36Calc[k] = "0.0";
      });
      overallPer36Calc.minutes = 0.0;
    }

    setOverallTotals(overall);
    setOverallEfficiency(overallEffValue);
    setOverallPerGame(overallPerGameCalc);
    setOverallPer36(overallPer36Calc);
  };

  const getPlayer = () =>
    players.find((p) => String(p.PlayerID) === String(playerId));

  const groupGamesBySeason = () => {
    const bySeason = {};
    stats.forEach((row) => {
      const season = row.Season;
      const game = games.find((g) => g.GameID === row.GameID);
      if (!bySeason[season]) {
        bySeason[season] = [];
      }
      bySeason[season].push({ statRow: row, game });
    });

    Object.values(bySeason).forEach((arr) => {
      arr.sort((a, b) => {
        const dateA = a.game ? a.game.Date : 0;
        const dateB = b.game ? b.game.Date : 0;
        return dateA - dateB;
      });
    });

    return bySeason;
  };

  const formatSeasonLabel = (seasonVal) => {
    const firstYear = String(seasonVal);
    if (firstYear.length === 4) {
      const startYear = Number(firstYear);
      const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
      return `${startYear}–${endYearShort}`;
    }
    return String(seasonVal);
  };

  const formatDate = (ms) => {
    if (!ms) return "";
    const d = new Date(ms);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatOpponent = (game) => {
    if (!game) return "";
    let opponent = game.Opponent || "";

    if (game.IsRegionGame === "Yes" || game.GameType === "Region") {
      opponent += " (Region)";
    }

    if (game.GameType === "Tournament") {
      opponent += " (Tournament)";
    } else if (game.GameType === "Showcase") {
      opponent += " (Showcase)";
    } else if (game.GameType === "Region Tournament") {
      opponent += " (Region Tournament)";
    } else if (game.GameType === "State Tournament") {
      opponent += " (State Tournament)";
    }

    return opponent;
  };

  const formatResult = (game) => {
    if (!game || !game.Result || !game.TeamScore || !game.OpponentScore) {
      return "";
    }
    const diff = game.TeamScore - game.OpponentScore;
    const sign = diff > 0 ? "+" : "";
    return `${game.Result} (${sign}${diff})`;
  };

  const calculatePercentages = (totals) => {
    const threesMade = totals.ThreePM || 0;
    const threesAtt = totals.ThreePA || 0;
    const twosMade = totals.TwoPM || 0;
    const twosAtt = totals.TwoPA || 0;
    const ftMade = totals.FTM || 0;
    const ftAtt = totals.FTA || 0;

    const threePct =
      threesAtt > 0 ? ((threesMade / threesAtt) * 100).toFixed(1) : "–";
    const twoPct =
      twosAtt > 0 ? ((twosMade / twosAtt) * 100).toFixed(1) : "–";
    const ftPct = ftAtt > 0 ? ((ftMade / ftAtt) * 100).toFixed(1) : "–";

    const totalFGA = threesAtt + twosAtt;
    const totalFGM = threesMade + twosMade;
    const fgPct =
      totalFGA > 0 ? ((totalFGM / totalFGA) * 100).toFixed(1) : "–";

    return { threePct, twoPct, ftPct, fgPct };
  };

  const getDisplayTotals = (season) => {
    if (showPerGame) {
      return perGameBySeason[season] || {};
    } else if (showPer36) {
      return per36BySeason[season] || {};
    }
    return totalsBySeason[season] || {};
  };

  const getDisplayOverall = () => {
    if (showPerGame) return overallPerGame;
    if (showPer36) return overallPer36;
    return overallTotals;
  };

  const getDisplayUnitLabel = () => {
    if (showPerGame) return "Per Game";
    if (showPer36) return "Per 36 Minutes";
    return "Season Totals";
  };

  const formatMinutes = (val) => {
    if (val == null || val === "" || isNaN(val)) return "–";
    const num = Number(val);
    if (showPerGame || showPer36) {
      return num.toFixed(1);
    }
    return num.toFixed(0);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading player stats...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  const player = getPlayer();
  if (!player) {
    return (
      <div className="p-4 text-center text-red-600">
        Player not found for ID {playerId}.
      </div>
    );
  }

  const jersey = player.JerseyNumber ? `#${player.JerseyNumber}` : "";
  const classYear = player.Class ? `Class of ${player.Class}` : "";
  const position = player.Position || "";
  const headerDetails = [jersey, position, classYear].filter(Boolean).join(" • ");

  const seasonGameGroups = groupGamesBySeason();
  const displayOverall = getDisplayOverall();
  const { threePct: overall3P, twoPct: overall2P, ftPct: overallFT, fgPct: overallFG } =
    calculatePercentages(overallTotals);

  return (
    <div className="space-y-10 px-4">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">
          {player.FirstName} {player.LastName}
        </h1>
        <p className="text-gray-700">{headerDetails}</p>
        <p className="text-gray-600 text-sm">
          {getDisplayUnitLabel()}
          {overallEfficiency !== null && (
            <>
              {" "}
              • Shooting Efficiency:{" "}
              <span className="font-semibold">{overallEfficiency}</span>
            </>
          )}
        </p>

        <div className="flex justify-center gap-3 mt-2 text-sm">
          <button
            onClick={() => {
              setShowPerGame(false);
              setShowPer36(false);
            }}
            className={`px-3 py-1 rounded border ${
              !showPerGame && !showPer36
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-blue-600 border-blue-600"
            }`}
          >
            Totals
          </button>
          <button
            onClick={() => {
              setShowPerGame(true);
              setShowPer36(false);
            }}
            className={`px-3 py-1 rounded border ${
              showPerGame
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-blue-600 border-blue-600"
            }`}
          >
            Per Game
          </button>
          <button
            onClick={() => {
              setShowPerGame(false);
              setShowPer36(true);
            }}
            className={`px-3 py-1 rounded border ${
              showPer36
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-blue-600 border-blue-600"
            }`}
          >
            Per 36 Minutes
          </button>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-center">
          Career Summary ({getDisplayUnitLabel()})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 w-16">G</th>
                <th className="border px-2 py-1 w-16">MIN</th>
                <th className="border px-2 py-1 w-16">FG%</th>
                <th className="border px-2 py-1 w-16">2P%</th>
                <th className="border px-2 py-1 w-16">3P%</th>
                <th className="border px-2 py-1 w-16">FT%</th>
                {statKeys.map((key) => (
                  <th key={key} className="border px-2 py-1 w-16">
                    {statLabels[key]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">
                  {!showPerGame && !showPer36 ? displayOverall.games : "–"}
                </td>
                <td className="border px-2 py-1">
                  {formatMinutes(displayOverall.minutes)}
                </td>
                <td className="border px-2 py-1">{overallFG}</td>
                <td className="border px-2 py-1">{overall2P}</td>
                <td className="border px-2 py-1">{overall3P}</td>
                <td className="border px-2 py-1">{overallFT}</td>
                {statKeys.map((key) => (
                  <td key={key} className="border px-2 py-1">
                    {displayOverall[key] != null
                      ? Number(displayOverall[key]).toFixed(showPerGame || showPer36 ? 1 : 0)
                      : "0.0"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-xl font-semibold text-center">
          Season-by-Season ({getDisplayUnitLabel()})
        </h2>
        {Object.keys(groupedBySeason)
          .sort()
          .map((season) => {
            const totals = getDisplayTotals(season);
            const baseTotals = totalsBySeason[season] || {};
            const { threePct, twoPct, ftPct, fgPct } =
              calculatePercentages(baseTotals);

            return (
              <div key={season} className="space-y-2">
                <h3 className="text-lg font-semibold text-center">
                  {formatSeasonLabel(season)}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border table-fixed">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1 w-16">G</th>
                        <th className="border px-2 py-1 w-16">MIN</th>
                        <th className="border px-2 py-1 w-16">FG%</th>
                        <th className="border px-2 py-1 w-16">2P%</th>
                        <th className="border px-2 py-1 w-16">3P%</th>
                        <th className="border px-2 py-1 w-16">FT%</th>
                        {statKeys.map((key) => (
                          <th key={key} className="border px-2 py-1 w-16">
                            {statLabels[key]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-2 py-1">
                          {!showPerGame && !showPer36
                            ? (totalsBySeason[season]?.games ?? "–")
                            : "–"}
                        </td>
                        <td className="border px-2 py-1">
                          {formatMinutes(totals.minutes)}
                        </td>
                        <td className="border px-2 py-1">{fgPct}</td>
                        <td className="border px-2 py-1">{twoPct}</td>
                        <td className="border px-2 py-1">{threePct}</td>
                        <td className="border px-2 py-1">{ftPct}</td>
                        {statKeys.map((key) => (
                          <td key={key} className="border px-2 py-1">
                            {totals[key] != null
                              ? Number(totals[key]).toFixed(
                                  showPerGame || showPer36 ? 1 : 0
                                )
                              : "0.0"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-center">
          Game-by-Game (Season Totals)
        </h2>
        <p className="text-center text-sm text-gray-600">
          Game-by-game stats are always shown as raw totals, regardless of the
          Per Game / Per 36 toggle.
        </p>

        {Object.keys(seasonGameGroups)
          .sort()
          .map((season) => {
            const rows = seasonGameGroups[season];

            return (
              <div key={season} className="space-y-2">
                <h3 className="text-lg font-semibold text-center">
                  {formatSeasonLabel(season)}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border table-fixed">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1 w-24">Date</th>
                        <th className="border px-2 py-1 w-40">Opponent</th>
                        <th className="border px-2 py-1 w-16">Result</th>
                        <th className="border px-2 py-1 w-16">MIN</th>
                        <th className="border px-2 py-1 w-16">FG%</th>
                        <th className="border px-2 py-1 w-16">2P%</th>
                        <th className="border px-2 py-1 w-16">3P%</th>
                        <th className="border px-2 py-1 w-16">FT%</th>
                        {statKeys.map((key) => (
                          <th key={key} className="border px-2 py-1 w-16">
                            {statLabels[key]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ statRow, game }) => {
                        const threesMade = Number(statRow.ThreePM || 0);
                        const threesAtt = Number(statRow.ThreePA || 0);
                        const twosMade = Number(statRow.TwoPM || 0);
                        const twosAtt = Number(statRow.TwoPA || 0);
                        const ftMade = Number(statRow.FTM || 0);
                        const ftAtt = Number(statRow.FTA || 0);

                        const threePct =
                          threesAtt > 0
                            ? ((threesMade / threesAtt) * 100).toFixed(1)
                            : "–";
                        const twoPct =
                          twosAtt > 0
                            ? ((twosMade / twosAtt) * 100).toFixed(1)
                            : "–";
                        const ftPct =
                          ftAtt > 0
                            ? ((ftMade / ftAtt) * 100).toFixed(1)
                            : "–";

                        const totalFGA = threesAtt + twosAtt;
                        const totalFGM = threesMade + twosMade;
                        const fgPct =
                          totalFGA > 0
                            ? ((totalFGM / totalFGA) * 100).toFixed(1)
                            : "–";

                        return (
                          <tr key={statRow.GameID}>
                            <td className="border px-2 py-1 whitespace-nowrap">
                              {formatDate(game?.Date)}
                            </td>
                            <td className="border px-2 py-1 text-center whitespace-nowrap">
                              <Link
                                to={`/athletics/boys/basketball/games/${row.GameID}`}
                                className="text-blue-600 hover:underline"
                              >
                                {game ? formatOpponent(game) : ""}
                              </Link>
                            </td>
                            <td className="border px-2 py-1 whitespace-nowrap">
                              {formatResult(game)}
                            </td>
                            <td className="border px-2 py-1">
                              {statRow.Minutes != null &&
                              statRow.Minutes !== ""
                                ? Number(statRow.Minutes).toFixed(1)
                                : "0.0"}
                            </td>
                            <td className="border px-2 py-1">{fgPct}</td>
                            <td className="border px-2 py-1">{twoPct}</td>
                            <td className="border px-2 py-1">{threePct}</td>
                            <td className="border px-2 py-1">{ftPct}</td>
                            {statKeys.map((key) => (
                              <td
                                key={key}
                                className="border px-2 py-1"
                              >
                                {statRow[key] != null &&
                                statRow[key] !== ""
                                  ? Number(statRow[key]).toFixed(0)
                                  : "0"}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
      </section>
    </div>
  );
}

export default PlayerPage;
