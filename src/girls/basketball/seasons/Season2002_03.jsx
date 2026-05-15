import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `St. Andrew's turned a six-player varsity roster into the school's first girls basketball state championship, finishing 23-3 and winning the SCISA Class AA title under head coach Deborah Morell. The Saints opened the season with only six varsity players: senior Meghan Lowe, juniors Carie Bugos, LeighAnne Evans, and Becca Cooper, freshman Grace Wilkowski, and eighth-grader Mary Wilkowski. Morell told the Savannah Morning News early in December that the group was already one of her most cohesive teams, and that chemistry became the season's defining edge.

The Saints were immediately competitive. They opened with a 56-34 win over Bible Baptist as Cooper scored 16 points with 12 rebounds, Mary Wilkowski added 13, Grace Wilkowski scored 12, and Lowe had 9. Three days later they rolled through Providence Christian 40-8, then beat Memorial Day 50-27 for the St. Andrew's Holiday Invitational championship. Mary Wilkowski had 17 points and 10 rebounds in the final and was named tournament MVP, while Grace Wilkowski and Bugos also made the all-tournament team.

St. Andrew's took its first loss in the Ret Thomas Memorial Tournament final against Hilton Head Prep, then rebuilt momentum through January. The NewsBank sweep added several previously missing box scores from that stretch: a 54-4 win over Abundant Life, a 48-25 win over Bible Baptist, region wins over Charleston Collegiate and James Island Christian, a 43-29 win at Beaufort Academy, a 41-29 win over Colleton Prep, and a 45-21 win over Memorial Day. Grace Wilkowski piled up double-doubles, including 22 points and 18 rebounds against Charleston Collegiate and 16 points with 15 rebounds in the rematch one night after scoring 13 and grabbing 12 against James Island Christian.

The short roster forced St. Andrew's to adapt. Grace missed the Jan. 28 Providence Christian game with an illness, and the Saints still won 43-16 behind JV and underclassman contributions from Emily Aimone, Stephanie Vine, Meghan Miller, Kristen Albritton, Maggie Hinchey, and Peisel. The post-title feature later noted that St. Andrew's added three underclassmen for the state tournament, but the core six carried the year: Lowe as the senior scorer and leader, Bugos as the ballhandler, Evans as the defensive spark, Cooper on the glass, and the Wilkowski sisters as young frontcourt anchors.

St. Andrew's finished regular-season region play unbeaten at 10-0 after a 60-46 win at Colleton Prep. The available NewsBank box scores document 23 games in detail, while newspaper record lines and the final state-title feature confirm the full 23-3 season record, meaning three regular-season wins remain identified only through the team's published records rather than full box scores. The final regular-season statistics published Feb. 14 listed Grace Wilkowski with 243 points and 209 rebounds through the latest submitted totals, and Lowe with 224 points.

In the Region 2-AA tournament, St. Andrew's beat Beaufort Academy 61-26 in the semifinal before falling 38-35 to Holly Hill in the championship game. The Saints regrouped in the state tournament. Grace Wilkowski scored a career-high 30 points with 15 rebounds in a 54-33 quarterfinal win over Avalon, then had 21 points and nine rebounds as St. Andrew's beat Trinity Collegiate 50-38 in the semifinal. In the championship game, the Saints rallied from a 30-23 halftime deficit to beat Carolina Academy 47-42. Lowe scored 17, Grace Wilkowski added 12, Mary Wilkowski scored 11, and Bugos hit four late free throws before Grace closed out the title at the line.

The spring postseason honors kept the season in view after the final buzzer. Grace Wilkowski made the Savannah Morning News Girls All-Coastal Empire third team, Meghan Lowe received honorable mention, and High School Sports Report later named Wilkowski the SCISAA Class AA Player of the Year after averaging 14.7 points and 13 rebounds. Deborah Morell was also named Class AA Coach of the Year after guiding St. Andrew's to the 23-3 championship season.`;

export default function Season2002_03() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2002}
      seasonLabel="2002-03"
      trimShootingColumns
      hideScheduleToggle
      hidePlayerStatsToggle
      seasonRecap={seasonRecap}
      seasonRecapLinks={[
        {
          Text: "St. Andrew's Holiday Invitational championship",
          ArticleID: "20021208-saints-knock-off-matadors-remain-undefeated",
        },
        {
          Text: "beat Carolina Academy 47-42",
          ArticleID: "20030302-st-andrews-beats-carolina-academy-to-take-crown",
        },
        {
          Text: "post-title feature",
          ArticleID: "20030311-team-of-six-carried-saints-to-state-title",
        },
        {
          Text: "Girls All-Coastal Empire third team",
          ArticleID: "20030405-girls-all-coastal-empire-basketball-teams",
        },
        {
          Text: "Class AA Player of the Year",
          ArticleID: "20030522-sc-publication-honors-st-andrews-coach-athletes",
        },
      ]}
      seasonBriefs={[
        { label: "Record", value: "23-3" },
        { label: "Coach", value: "Deborah Morell" },
        { label: "Finish", value: "SCISA Class AA Champion" },
      ]}
      hideSeasonArticles
      showSeasonImagesPlaceholder
      showSeasonRoster
      headCoach="Deborah Morell"
    />
  );
}
