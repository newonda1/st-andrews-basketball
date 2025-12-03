import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Season2025_26() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [leadersByStat, setLeadersByStat] = useState({});
  const [seasonTotals, setSeasonTotals] = useState([]); 

  const statLabels = {
    Points: 'Points',
    Rebounds: 'Rebounds',
    Assists: 'Assists',
    Steals: 'Steals',
    Blocks: 'Blocks',
    ThreePM: '3-pointers made',
    TwoPM: '2-pointers made',
    FTPercentage: 'Free Throw %',
  };

  const SEASON_ID = 2025; // 2025–26 season

  useEffect(() => {
    async function fetchData() {
      const gamesRes = await fetch('/data/games.json');
      const statsRes = await fetch('/data/playergamestats.json');
      const playersRes = await fetch('/data/players.json');

      const gamesData = await gamesRes.json();
      const statsData = await statsRes.json();
      const playersData = await playersRes.json();

      // Filter to just 2025–26 games and sort by date
      const seasonGames = gamesData
        .filter((g) => g.Season === SEASON_ID)
        .sort((a, b) => a.Date - b.Date);

      const seasonGameIds = new Set(seasonGames.map((g) => g.GameID));

      // Only stats from games in this season
      const seasonStats = statsData.filter((s) => seasonGameIds.has(s.GameID));

      setGames(seasonGames);
      setPlayerStats(seasonStats);
      setPlayers(playersData);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (playerStats.length === 0) {
      setLeadersByStat({});
      return;
    }

    const totals = {};

    playerStats.forEach((stat) => {
      const id = stat.PlayerID;
      if (!totals[id]) {
        totals[id] = {
          PlayerID: id,
          Points: 0,
          Rebounds: 0,
          Assists: 0,
          Steals: 0,
          Blocks: 0,
          ThreePM: 0,
          TwoPM: 0,
          FTM: 0,
          FTA: 0,
          GamesPlayed: 0,
        };
      }

      totals[id].Points += stat.Points || 0;
      totals[id].Rebounds += stat.Rebounds || 0;
      totals[id].Assists += stat.Assists || 0;
      totals[id].Steals += stat.Steals || 0;
      totals[id].Blocks += stat.Blocks || 0;
      totals[id].ThreePM += stat.ThreePM || 0;
      totals[id].TwoPM += stat.TwoPM || 0;
      totals[id].FTM += stat.FTM || 0;
      totals[id].FTA += stat.FTA || 0;
      totals[id].GamesPlayed += 1;
    });

    const calculateFTPercent = (player) =>
      player.FTA > 0 ? (player.FTM / player.FTA) * 100 : 0;

    const sortAndTakeTop3 = (statName, isPercent = false) => {
      let allPlayers = Object.values(totals);

      if (isPercent && statName === 'FTM') {
        // Only include players with a meaningful FT sample size
        allPlayers = allPlayers.filter((p) => p.FTA >= 25);
      }

      return allPlayers
        .map((p) => ({
          ...p,
          StatValue: isPercent ? calculateFTPercent(p) : p[statName],
        }))
        .sort((a, b) => b.StatValue - a.StatValue)
        .slice(0, 3);
    };

    const stats = {
      Points: sortAndTakeTop3('Points'),
      Rebounds: sortAndTakeTop3('Rebounds'),
      Assists: sortAndTakeTop3('Assists'),
      Steals: sortAndTakeTop3('Steals'),
      Blocks: sortAndTakeTop3('Blocks'),
      ThreePM: sortAndTakeTop3('ThreePM'),
      TwoPM: sortAndTakeTop3('TwoPM'),
      FTPercentage: sortAndTakeTop3('FTM', true),
    };

    setLeadersByStat(stats);
  }, [playerStats]);

  // Build season totals including shooting stats
  useEffect(() => {
    if (playerStats.length === 0) {
      setSeasonTotals([]);
      return;
    }

    const totalsMap = {};

    playerStats.forEach((stat) => {
      const id = stat.PlayerID;

      if (!totalsMap[id]) {
        totalsMap[id] = {
          PlayerID: id,
          Points: 0,
          Rebounds: 0,
          Assists: 0,
          Steals: 0,
          Blocks: 0,
          ThreePM: 0,
          ThreePA: 0,
          TwoPM: 0,
          TwoPA: 0,
          FTM: 0,
          FTA: 0,
        };
      }

      const t = totalsMap[id];

      t.Points += stat.Points || 0;
      t.Rebounds += stat.Rebounds || 0;
      t.Assists += stat.Assists || 0;
      t.Steals += stat.Steals || 0;
      t.Blocks += stat.Blocks || 0;

      t.ThreePM += stat.ThreePM || 0;
      t.ThreePA += stat.ThreePA || 0; // requires ThreePA field in playergamestats.json
      t.TwoPM += stat.TwoPM || 0;
      t.TwoPA += stat.TwoPA || 0;     // requires TwoPA field
      t.FTM += stat.FTM || 0;
      t.FTA += stat.FTA || 0;
    });

    setSeasonTotals(Object.values(totalsMap));
  }, [playerStats]);;

  const getPlayerName = (id) => {
    const player = players.find((p) => p.PlayerID === id);
    return player ? `${player.FirstName} ${player.LastName}` : 'Unknown Player';
  };

    const getJerseyNumber = (id) => {
    const player = players.find((p) => p.PlayerID === id);
    // Adjust "JerseyNumber" to match your actual field name in players.json if needed
    return player && player.JerseyNumber != null ? player.JerseyNumber : '';
  };

    const formatPct = (made, att) => {
    if (!att || att === 0) return '0.0';
    return ((made / att) * 100).toFixed(1);
  };

  const formatDate = (ms) => {
    if (!ms || ms < 0) return '';
    return new Date(ms).toLocaleDateString();
  };

  const formatResult = (game) => {
    // For games not yet played / not complete, leave blank
    if (game.IsComplete !== 'Yes' || !game.Result) return '';
    return game.Result;
  };

  const formatScore = (game) => {
    if (
      game.IsComplete !== 'Yes' ||
      game.TeamScore == null ||
      game.OpponentScore == null
    ) {
      return '';
    }
    return `${game.TeamScore} - ${game.OpponentScore}`;
  };

  return (
    <div className="bg-gray-100 p-8 rounded-lg shadow-md max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-center mb-4">2025–26 Season</h1>

      {/* 1. OVERVIEW */}
      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-2xl font-semibold mt-4 mb-3">Season Overview</h2>

        <div className="text-gray-800 leading-relaxed">
          <a
            href="https://www.flipsnack.com/6D6FD76F8D6/boys-basketball-media-guide-2025-2026.html" 
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/Season2025_26_1.PNG"
              alt="2025–26 St. Andrew's boys' basketball roster"
              className="float-left mr-4 mb-3 w-full max-w-xs rounded-lg shadow cursor-pointer"
            />
          </a>
          
          <p className="mb-5 leading-relaxed">
            After winning three state championships in the past four years, the
            St. Andrew’s Lions enter the 2025-26 basketball season carrying both
            high expectations and a new identity. For the first time in five
            years, the Lions will take the court without an Edwards brother in
            the lineup, a symbolic turning of the page for one of Georgia’s most
            dominant small-school programs.
          </p>

          <p className="mb-6 leading-relaxed">
            Head coach Mel Abrams, now in his 11th season, guided last year’s
            team to a 26-3 overall record and a perfect 10-0 record in region
            play, which extended their region winning streak to 40 straight games
            over the past four years. But as Abrams looks ahead, he knows
            maintaining that standard will require new voices and new leadership
            to emerge. “Our ability to defend individually and collectively will
            be an area the coaches are observing closely,” Abrams said. “How we
            defend and rebound as a group will determine how far we go.”
          </p>

          <p className="mb-5 leading-relaxed">
            The Lions return a solid core led by Ja’Cari Glover (6’5, F, class
            of ’26), who established himself as one of the region’s most
            versatile forwards last season. Glover’s ability to score, rebound,
            and guard multiple positions will once again anchor the Lions’
            attack. Supporting him is a talented backcourt featuring Page Getter
            (6’3, G, ’28) and Chase Brown (6’3, G, ’28), both young guards who
            gained valuable experience during last year’s playoff run. Guus Blom
            (6’0, SG, ’26), will also be a crucial contributor as a steady
            perimeter shooter and a two-way player.
          </p>

           <img
             src="/images/Season2025_26_2.PNG"
              alt="St. Andrew's boys' basketball action collage"
            className="float-right ml-4 mt-4 mb-3 w-full max-w-sm rounded-lg shadow"
           />
          
          <p className="mb-3 leading-relaxed">
            Replacing Zayden Edwards (6’1, G), last year’s all-state performer
            and team captain, along with Miles Cummings (6’8, C), the Lions’
            interior anchor, will be no small task. Their graduation marks the
            end of an era defined by dominance and chemistry but also opens the
            door for new contributors to shape the team’s future. One promising
            addition is Milos Copic (6’6, SG, ’26), a newcomer from Serbia whose
            perimeter shooting and rebounding could provide an immediate boost.
            His versatility gives St. Andrew’s another dimension on offense while
            helping to fill the void left by last year’s senior class.
          </p>

          <p className="mb-4 leading-relaxed">
            St. Andrew’s has built a demanding non-region schedule, designed to
            test the Lions early and prepare them for another deep postseason
            run. For Abrams and his staff, the focus remains on growth,
            particularly on the defensive end as this new-look roster learns to
            play together. “Ja’Cari needs to build on what he did last year,”
            Abrams noted. “If our key returners can take the next step on both
            ends of the court, we have a chance to be very good again.”
          </p>

          <p className="mb-3 leading-relaxed">
            Even amid change, the culture of St. Andrew’s basketball remains
            unmistakable as it will continue to focus on unselfish play,
            relentless defense, and a commitment to excellence that has made the
            program a powerhouse. The names on the roster may be new, but the
            goal is unchanged. As the Lions open a new chapter without an
            Edwards leading the way, the question isn’t whether they can sustain
            their success. Instead, it’s on how they’ll redefine it.
          </p>
          <div className="clear-both" />
        </div>
      </section>

      {/* 2. SEASON LEADERS */}
      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">🏅 Season Leaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(leadersByStat).length === 0 && (
            <p className="text-gray-600 col-span-2">
              No individual statistics are available yet for this season.
            </p>
          )}

          {Object.entries(leadersByStat).map(([statName, topPlayers]) => (
            <div key={statName} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-semibold mb-2 text-center">
                {statLabels[statName]}
              </h3>
              <table className="w-full text-sm text-center">
                <thead>
                  <tr>
                    <th className="border p-1">Player</th>
                    <th className="border p-1">{statLabels[statName]}</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlayers.length === 0 ? (
                    <tr>
                      <td className="border p-1" colSpan={2}>
                        No stats available yet.
                      </td>
                    </tr>
                  ) : (
                    topPlayers.map((player, index) => (
                      <tr key={player.PlayerID || index}>
                        <td className="border p-1">
                          <Link
                            to={`/players/${player.PlayerID}`}
                            className="text-blue-700 hover:underline"
                          >
                            {getPlayerName(player.PlayerID)}
                          </Link>
                        </td>
                        <td className="border p-1">
                          {statName === 'FTPercentage'
                            ? `${player.StatValue.toFixed(1)}%`
                            : player.StatValue}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FULL SCHEDULE – future games have blank result/score */}
      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          📅 Schedule &amp; Results
        </h2>
        <div className="overflow-x-auto px-1">
          <table className="w-full border text-center text-xs sm:text-sm md:text-base">
            <thead>
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Opponent</th>
                <th className="border px-2 py-1">Result</th>
                <th className="border px-2 py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, idx) => {
                const hasResult = game.Result === 'W' || game.Result === 'L';

                const opponentCell = hasResult ? (
                  <Link
                    to={`/games/${game.GameID}`}
                    className="text-blue-700 hover:underline"
                  >
                    {game.Opponent}
                  </Link>
                ) : (
                  game.Opponent
                );

                return (
                  <tr key={game.GameID || idx}>
                    <td className="border px-2 py-1 text-center">
                      {formatDate(game.Date)}
                    </td>
                    <td className="border px-2 py-1 text-center">{opponentCell}</td>
                    <td className="border px-2 py-1 text-center">
                      {formatResult(game)}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap text-center">
                      {formatScore(game)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

       {/* 4. SEASON PLAYER TOTALS */}
      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          📊 Season Player Totals
        </h2>

        {seasonTotals.length === 0 ? (
          <p className="text-gray-600">
            No player statistics are available yet for this season.
          </p>
        ) : (
          <div className="overflow-x-auto px-1">
            <table className="w-full border text-center text-xs sm:text-sm md:text-base">
              <thead>
                <tr>
                  <th className="border px-2 py-1 text-left">Player</th>
                  <th className="border px-2 py-1">#</th>
                  <th className="border px-2 py-1">PTS</th>
                  <th className="border px-2 py-1">REB</th>
                  <th className="border px-2 py-1">AST</th>
                  <th className="border px-2 py-1">STL</th>
                  <th className="border px-2 py-1">BLK</th>

                  <th className="border px-2 py-1">3M</th>
                  <th className="border px-2 py-1">3A</th>
                  <th className="border px-2 py-1">3%</th>

                  <th className="border px-2 py-1">2M</th>
                  <th className="border px-2 py-1">2A</th>
                  <th className="border px-2 py-1">2%</th>

                  <th className="border px-2 py-1">FTM</th>
                  <th className="border px-2 py-1">FTA</th>
                  <th className="border px-2 py-1">FT%</th>
                </tr>
              </thead>
              <tbody>
                {seasonTotals
                  .slice()
                  .sort((a, b) =>
                    getPlayerName(a.PlayerID).localeCompare(
                      getPlayerName(b.PlayerID)
                    )
                  )
                  .map((player) => (
                    <tr key={player.PlayerID}>
                      <td className="border px-2 py-1 text-left">
                        <Link
                          to={`/players/${player.PlayerID}`}
                          className="text-blue-700 hover:underline"
                        >
                          {getPlayerName(player.PlayerID)}
                        </Link>
                      </td>
                      <td className="border px-2 py-1">
                        {getJerseyNumber(player.PlayerID)}
                      </td>

                      <td className="border px-2 py-1">{player.Points}</td>
                      <td className="border px-2 py-1">{player.Rebounds}</td>
                      <td className="border px-2 py-1">{player.Assists}</td>
                      <td className="border px-2 py-1">{player.Steals}</td>
                      <td className="border px-2 py-1">{player.Blocks}</td>

                      <td className="border px-2 py-1">{player.ThreePM}</td>
                      <td className="border px-2 py-1">{player.ThreePA}</td>
                      <td className="border px-2 py-1">
                        {formatPct(player.ThreePM, player.ThreePA)}%
                      </td>

                      <td className="border px-2 py-1">{player.TwoPM}</td>
                      <td className="border px-2 py-1">{player.TwoPA}</td>
                      <td className="border px-2 py-1">
                        {formatPct(player.TwoPM, player.TwoPA)}%
                      </td>

                      <td className="border px-2 py-1">{player.FTM}</td>
                      <td className="border px-2 py-1">{player.FTA}</td>
                      <td className="border px-2 py-1">
                        {formatPct(player.FTM, player.FTA)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      
    </div>
  );
}

export default Season2025_26;
