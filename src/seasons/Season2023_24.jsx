
import React, { useEffect, useState } from 'react';

function Season2023_24() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [leadersByStat, setLeadersByStat] = useState({});
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const statLabels = {
    Points: 'Points',
    Rebounds: 'Rebounds',
    Assists: 'Assists',
    Steals: 'Steals',
    Blocks: 'Blocks',
    ThreePM: '3-pointers made',
    TwoPM: '2-pointers made',
    FTPercentage: 'Free Throw %'
  };

  useEffect(() => {
    async function fetchData() {
      const gamesRes = await fetch("/data/games.json");
      const statsRes = await fetch("/data/playergamestats.json");
      const playersRes = await fetch("/data/players.json");
      const gamesData = await gamesRes.json();
      const statsData = await statsRes.json();
      const playersData = await playersRes.json();

      setGames(gamesData.filter(g => g.Season === 2023));
      setPlayerStats(statsData.filter(s => {
        const game = gamesData.find(g => g.GameID === s.GameID);
        return game && game.Season === 2023;
      }));
      setPlayers(playersData);
    }
    fetchData();
  }, []);

  return (
    <div className="bg-gray-100 p-8 rounded-lg shadow-md max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-center mb-4">2023–24 Season Recap</h1>
      <p className="text-lg leading-relaxed space-y-4 text-justify">The 2023–24 St. Andrew’s basketball season was a campaign defined by perseverance, growth, and grit. Under the leadership of Coach Mel Abrams Jr., the Lions weathered early adversity, rallied through a dominant region performance, and came within seconds of reaching the state championship for a third consecutive year — ultimately falling in heartbreaking fashion in the state semifinal.</p>
<p className="text-lg leading-relaxed space-y-4 text-justify">After graduating a core of veteran players, the Lions entered the season with a blend of returning talent and emerging contributors. The transition wasn’t seamless though. The team lost three of its first four games and sat at 7–7 midway through the season, searching for rhythm and consistency. But as region play began, the Lions refocused, rediscovered their identity, and reeled off 15 straight wins, sweeping all 8 regular season region games and claiming their third consecutive region tournament title.</p>
<p className="text-lg leading-relaxed space-y-4 text-justify">Throughout the ups and downs, junior guard Zayden Edwards remained the team’s steady anchor. His two-way dominance, highlighted by scoring bursts and lockdown defense, earned him a reputation as one of the most feared players in the region. He surpassed 1,000 career points, finished the season with multiple 30-point games, and consistently delivered in the clutch.</p>
<p className="text-lg leading-relaxed space-y-4 text-justify">Joining him in the backcourt was senior Will Thompson, who lit up defenses with his perimeter shooting and broke the school’s all-time record for three-pointers in a season. He finished the year with over 100 made threes and was a constant threat to opposing defenses. Meanwhile, point guard Jaylen Sheppard orchestrated the offense with poise and precision, notching a triple-double during region play and surpassing the school’s single-season assist record with 139.</p>
<p className="text-lg leading-relaxed space-y-4 text-justify">Other key contributors included RaKari Harrison, a force in the paint on both ends of the court, known for his rebounding tenacity and timely scoring. Richard Williams provided energy off the bench, while Rhys Baillie capped off his senior year with his career-high 25-point performance in a win over Pinewood.</p>
<p className="text-lg leading-relaxed space-y-4 text-justify">The regular season featured several signature wins. A buzzer-beater by Zayden Edwards stunned Savannah High, capping off a thrilling 51–50 road win. In the region semifinals, the Lions cruised past Pinewood Christian by nearly 40 points before capturing the region title in dominant fashion with a 67–42 win over Frederica Academy, marking their 30th consecutive region win, a streak that extended over three full seasons.</p>
<p className="text-lg leading-relaxed space-y-4 text-justify">In the state playoffs, the Lions continued their run, eventually meeting Lakeview Academy in the Final Four. The game was close throughout and included scores of 25-25 at halftime, 50-50 at the end of regulation, and 54-54 with 5 seconds left in overtime. However, the Lions fell just short as Lakeview converted a contested layup as time expired to seal the victory. The defeat ended St. Andrew’s quest for a third straight state championship, but not before the team had further cemented its place among the program’s elite eras.</p>
<p className="text-lg leading-relaxed space-y-4 text-justify">In every sense, the 2023–24 season was a testament to resilience and belief as the team overcame a rocky start, grew stronger with every game, and battled their way to the brink of another championship appearance. The players’ dedication and chemistry continued to add to the foundation of the program being built by Coach Abrams and added another proud chapter to the tradition of St. Andrew’s basketball.</p>

    </div>
  );
}

export default Season2023_24;
