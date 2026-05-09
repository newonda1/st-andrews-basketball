import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The 2005-06 St. Andrew's boys basketball season is now built around a complete 24-game archive, with newspaper recaps, box scores, tournament notes, and season stat corrections filling in the shape of Dave Clay's second year with the boys program. St. Andrew's finished 8-16, scored 1,138 points, and played a schedule that began with promise before turning into a rugged SCISA Region 4-AAA grind.

The Saints opened with four straight wins, beating Bible Baptist, Patrick Henry, Abundant Life, and Bible Baptist again between Nov. 21 and Dec. 2. Jamie Cooper started the season with a 20-point, 10-rebound double-double, Thomas Withers closed out Patrick Henry with late free throws, and Brian Lee scored 20 in a 67-64 home win over Abundant Life. The fast start carried St. Andrew's into the championship game of its Tip-Off Tournament before Providence Christian handed the Saints their first loss.

December and early January filled out the middle of the year with the Colleton Prep Holiday Tournament, a close loss to Providence, and a handful of non-region wins. The Saints beat Abundant Life on Jan. 5, held off Providence 59-54 on Jan. 9 by going 19-for-26 at the foul line, and got a 15-point, 12-rebound night from Kevin Crouch in a Jan. 13 win over Bible Baptist. Their final win came Feb. 4 at Patrick Henry, where Ross Glendye scored 20 and Ryan Kirby added 17 in a 57-55 road victory.

Region play was the hardest part of the season. St. Andrew's went 0-8 in SCISA Region 4-AAA against Hilton Head Christian, Thomas Heyward, Beaufort Academy, and Hilton Head Prep, with the closest region game coming in a 75-65 road loss at Thomas Heyward on Jan. 17. The season ended three weeks later in Ridgeland, where Thomas Heyward beat the Saints 65-43 in the first round of the SCISA Region 4-AA/AAA Tournament.

The corrected stat archive shows Glendye leading St. Andrew's with 299 points, followed by Crouch with 177, Cooper with 166, Gian Maleki with 142, Withers with 112, and Bryan Lee with 98. Cooper leads the surviving rebounding totals with 140, Withers finished with 89, and Crouch's corrected assist total stands at 79.`;

const seasonImages = [
  {
    src: "/images/boys/basketball/seasons/2005-06/gallery/2005-06-boys-basketball-team.png",
    alt: "2005-06 St. Andrew's boys basketball team photo",
    caption: "2005-06 St. Andrew's boys basketball team photo",
  },
  {
    src: "/images/boys/basketball/seasons/2005-06/gallery/2005-06-boys-basketball-01-kevin-crouch.png",
    alt: "Senior Kevin Crouch holding a basketball overhead",
    caption: "Senior Kevin Crouch",
  },
  {
    src: "/images/boys/basketball/seasons/2005-06/gallery/2005-06-boys-basketball-02-ross-glendye.png",
    alt: "Senior Ross Glendye holding a basketball",
    caption: "Senior Ross Glendye",
  },
  {
    src: "/images/boys/basketball/seasons/2005-06/gallery/2005-06-boys-basketball-03-jamie-cooper.png",
    alt: "Senior Jamie Cooper posing in uniform",
    caption: "Senior Jamie Cooper",
  },
  {
    src: "/images/boys/basketball/seasons/2005-06/gallery/2005-06-boys-basketball-04-billy-vine.png",
    alt: "Senior Billy Vine posing with a basketball",
    caption: "Senior Billy Vine",
  },
  {
    src: "/images/boys/basketball/seasons/2005-06/gallery/2005-06-boys-basketball-05-chris-miller.png",
    alt: "Senior Chris Miller dribbling a basketball",
    caption: "Senior Chris Miller",
  },
  {
    src: "/images/boys/basketball/seasons/2005-06/gallery/2005-06-boys-basketball-06-alex-chu.png",
    alt: "Senior Alex Chu portrait",
    caption: "Senior Alex Chu",
  },
  {
    src: "/images/boys/basketball/seasons/2005-06/gallery/2005-06-boys-basketball-07-gian-maleki.png",
    alt: "Senior Gian Maleki kneeling with a basketball",
    caption: "Senior Gian Maleki",
  },
  {
    src: "/images/boys/basketball/seasons/2005-06/gallery/2005-06-boys-basketball-08-steven-carbone.png",
    alt: "Senior Steve Carbone holding a basketball",
    caption: "Senior Steve Carbone",
  },
  {
    src: "/images/boys/basketball/seasons/2005-06/gallery/2005-06-boys-basketball-09-ryan-kirby.png",
    alt: "Senior Ryan Kirby holding a basketball overhead",
    caption: "Senior Ryan Kirby",
  },
];

export default function Season2005_06() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2005}
      seasonLabel="2005-06"
      seasonRecap={seasonRecap}
      seasonBriefs={[
        { label: "Record", value: "8-16" },
        { label: "Coach", value: "Dave Clay" },
        { label: "Finish", value: "Region Tournament" },
      ]}
      rosterTitle="Roster"
      statSourceLabel="Archive"
      trimShootingColumns
      seasonImages={seasonImages}
      showSeasonRoster
      rosterStaff={[{ name: "Dave Clay", role: "Head Coach" }]}
      hideBrackets
      hidePlayerStatsToggle
    />
  );
}
