
import React, { useEffect, useState } from 'react';
import SeasonLeaders from '../components/SeasonLeaders';
import SeasonSchedule from '../components/SeasonSchedule';
import PhotoUpload from '../components/PhotoUpload';

function Season2023_24() {
  return (
    <div className="bg-gray-100 p-8 rounded-lg shadow-md max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-center mb-4">2023–24 Season Recap</h1>
      
<p className="text-lg leading-relaxed space-y-4 text-justify">
  The 2023–24 St. Andrew’s basketball season was a campaign defined by <strong>perseverance, growth, and grit</strong>. 
  Under the leadership of <strong>Coach Mel Abrams Jr.</strong>, the Lions weathered early adversity, rallied through a dominant region performance, 
  and came within seconds of reaching the state championship for a third consecutive year — ultimately falling in heartbreaking fashion in the <strong>state semifinal</strong>.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  After graduating a core of veteran players, the Lions entered the season with a blend of returning talent and emerging contributors. 
  The transition wasn’t seamless though. The team lost <strong>three of its first four games</strong> and sat at <strong>7–7</strong> midway through the season, 
  searching for rhythm and consistency. But as region play began, the Lions refocused, rediscovered their identity, and <strong>reeled off 15 straight wins</strong>, 
  sweeping all 8 regular season region games and claiming their <strong>third consecutive region tournament title</strong>.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  Throughout the ups and downs, <strong>junior guard Zayden Edwards</strong> remained the team’s steady anchor. 
  His two-way dominance, highlighted by scoring bursts and lockdown defense, earned him a reputation as one of the most feared players in the region. 
  He surpassed <strong>1,000 career points</strong>, finished the season with multiple 30-point games, and consistently delivered in the clutch.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  Joining him in the backcourt was <strong>senior Will Thompson</strong>, who lit up defenses with his perimeter shooting and 
  broke the school’s all-time record for <strong>three-pointers in a season</strong>. 
  He finished the year with over 100 made threes and was a constant threat to opposing defenses. 
  Meanwhile, <strong>point guard Jaylen Sheppard</strong> orchestrated the offense with poise and precision, notching a <strong>triple-double</strong> 
  during region play and surpassing the school’s <strong>single-season assist record with 139</strong>.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  Other key contributors included <strong>RaKari Harrison</strong>, a force in the paint on both ends of the court, known for his rebounding tenacity and timely scoring. 
  <strong>Richard Williams</strong> provided energy off the bench, while <strong>Rhys Baillie</strong> capped off his senior year with his 
  <strong>career-high 25-point performance</strong> in a win over Pinewood.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  The regular season featured several signature wins. A <strong>buzzer-beater by Zayden Edwards</strong> stunned Savannah High, capping off a thrilling <strong>51–50 road win</strong>. 
  In the region semifinals, the Lions cruised past Pinewood Christian by nearly 40 points before capturing the region title in dominant fashion 
  with a <strong>67–42 win over Frederica Academy</strong>, marking their <strong>30th consecutive region win</strong>, a streak that extended over <strong>three full seasons</strong>.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  In the state playoffs, the Lions continued their run, eventually meeting <strong>Lakeview Academy</strong> in the <strong>Final Four</strong>. 
  The game was close throughout and included scores of <strong>25-25</strong> at halftime, <strong>50-50</strong> at the end of regulation, and <strong>54-54</strong> 
  with 5 seconds left in overtime. However, the Lions fell just short as Lakeview converted a contested layup as time expired to seal the victory. 
  The defeat ended St. Andrew’s quest for a <strong>third straight state championship</strong>, but not before the team had further cemented its place among the program’s elite eras.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  In every sense, the 2023–24 season was a testament to <strong>resilience and belief</strong> as the team overcame a rocky start, grew stronger with every game, 
  and battled their way to the brink of another championship appearance. 
  The players’ dedication and chemistry continued to add to the foundation of the program being built by Coach Abrams and added another proud chapter to the tradition of St. Andrew’s basketball.
</p>


      <h2 className="text-2xl font-semibold mt-8 mb-4">🏅 Season Leaders</h2>
      <SeasonLeaders seasonId={2023} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">📅 Season Schedule & Results</h2>
      <SeasonSchedule seasonId={2023} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">📸 Upload Your Photos</h2>
      <PhotoUpload seasonId={2023} />
    </div>
  );
}

export default Season2023_24;
