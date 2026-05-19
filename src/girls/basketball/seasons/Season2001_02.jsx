import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The winter NewsBank sweep turns the 2001-02 St. Andrew's girls basketball season from a preseason shell into a full archive season. Debra Morrell's Saints finished 17-7, went 4-2 in regular-season SCISA Region 4-AA play, reached the region tournament final, and advanced to the SCISA Class AA state quarterfinals one year before the program's first state championship.

St. Andrew's opened with a 42-31 win over Patrick Henry Academy as Becca Cooper scored 12, Meghan Lowe 10, Sarah Roddenberry 9, Kim Cooper 6, and Carie Bugos 5. At the St. Andrew's Holiday Invitational, the Saints beat Abundant Life 56-4 before falling 36-34 to Bible Baptist in the championship game. Grace Wilkowski, then an eighth-grader, scored all eight of her points in the fourth quarter of the final and added six rebounds.

The early schedule also included a loss at Hilton Head Prep and one unrecovered loss that is preserved as a placeholder because newspaper record lines show St. Andrew's was 3-3 after the Jan. 4 win over Beaufort Academy. From there the Saints built a steady January run. They beat Beaufort Academy, James Island Christian, Colleton Prep, Patrick Henry, Charleston Collegiate, Beaufort again, St. John's Christian, and St. Paul's Country Day before Hilton Head Christian handed them their first region loss.

Grace Wilkowski became the season's centerpiece. A Jan. 15 Savannah Morning News feature described the 14-year-old as St. Andrew's leading scorer and rebounder after she produced a 24-point, 23-rebound game against James Island Christian. The final regular-season statistics credited her with 234 points and 218 rebounds in 19 games, while Lowe appeared among the area steals leaders and Roddenberry was listed among the three-point percentage leaders.

The region race came down to Beaufort Academy, Colleton Prep, and Hilton Head Christian. St. Andrew's swept Beaufort and Colleton in regular-season region play, but Hilton Head Christian beat the Saints twice to leave them 4-2. St. Andrew's still answered in the region tournament, beating Colleton Prep 47-35 in the first round behind 12 points from Roddenberry, 11 from Bugos, and 9 from Becca Cooper. Hilton Head Christian won the region final 50-41, but the Saints qualified for the state tournament.

The state tournament opened with a 45-20 win over Charleston Collegiate at Thomas Heyward Academy, led by Lowe's 20 points. Pee Dee Academy ended the run two days later in Sumter, jumping ahead 14-0 and beating St. Andrew's 58-42. Grace Wilkowski scored 15, Roddenberry added 14, Lowe had 7 points and 10 rebounds, and Bugos scored 6 as the Saints closed the year 17-7. The spring awards package later listed Wilkowski and Roddenberry among the Savannah Morning News Girls All-Coastal Empire private-school honorable mention selections.`;

export default function Season2001_02() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2001}
      seasonLabel="2001-02"
      trimShootingColumns
      hideScheduleToggle
      hidePlayerStatsToggle
      seasonRecap={seasonRecap}
      seasonRecapLinks={[
        {
          Text: "42-31 win over Patrick Henry Academy",
          ArticleID: "20011205-st-andrews-girls-bend-dont-break",
        },
        {
          Text: "falling 36-34 to Bible Baptist",
          ArticleID: "20011209-bible-baptist-survives-slow-finish",
        },
        {
          Text: "Jan. 15 Savannah Morning News feature",
          ArticleID: "20020115-saints-winning-with-grace",
        },
        {
          Text: "final regular-season statistics",
          ArticleID: "20020215-final-2001-02-prep-basketball-statistics",
        },
        {
          Text: "beating Colleton Prep 47-35",
          ArticleID: "20020220-st-andrews-girls-beat-colleton-prep",
        },
        {
          Text: "Hilton Head Christian won the region final",
          ArticleID: "20020223-first-half-blues-cost-st-andrews-girls",
        },
        {
          Text: "45-20 win over Charleston Collegiate",
          ArticleID: "20020226-st-andrews-advances-to-scisa-semis",
        },
        {
          Text: "Pee Dee Academy ended the run",
          ArticleID: "20020228-st-andrews-stumbles-in-scisa-quarterfinal",
        },
        {
          Text: "Girls All-Coastal Empire private-school honorable mention",
          ArticleID: "20020320-girls-all-coastal-empire",
        },
      ]}
      seasonBriefs={[
        { label: "Record", value: "17-7" },
        { label: "Coach", value: "Debra Morrell" },
        { label: "Finish", value: "State Quarterfinals" },
      ]}
      hideSeasonArticles
      showSeasonImagesPlaceholder
      showSeasonRoster
      headCoach="Debra Morrell"
    />
  );
}
