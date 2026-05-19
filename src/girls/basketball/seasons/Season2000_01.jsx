import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The winter NewsBank sweep turns the 2000-01 St. Andrew's girls basketball season from a preseason capsule into a working archive season. Debra Morrell's Saints finished 15-6, reached the SCISA Region 4-AA semifinals, and built the season around Meghan Lowe, Sarah Roddenberry, Becca Cooper, Kim Cooper, and Carie Bugos.

St. Andrew's opened with a 41-11 win at Abundant Life and beat Sea Island 45-28 in the St. Andrew's Holiday Tournament behind Lowe's 22 points. The Saints split the Memorial Christmas Tournament, beating Memorial Day before falling to Pinewood Christian, then opened January with wins over Bible Baptist and Sea Island. A Jan. 11 record line listed St. Andrew's at 7-2, so the schedule preserves one early unrecovered win as a placeholder.

The January push continued with wins over Colleton Prep, St. John's Christian, Beaufort Academy, and James Island Christian before Hilton Head Christian and Bible Baptist slowed the run. St. Andrew's answered with wins over James Island Christian, Colleton Prep, and Beaufort Academy in the final recovered regular-season stretch. The final NewsBank record line requires one unrecovered win and one unrecovered loss before the region semifinal, and both are marked as placeholders on the schedule.

The final regular-season statistics credited Lowe with 317 points and 57 steals in 20 games, while Roddenberry was listed with 49 steals. Lowe appeared throughout the winter as the primary scorer, but the recovered box scores also show Roddenberry, Bugos, Becca Cooper, and Kim Cooper supplying steady scoring in region play.

Beaufort Academy ended the season in the Region 4-AA semifinals, 48-41, despite 11 points from Lowe, 9 each from Roddenberry and Becca Cooper, 8 from Bugos, and 4 from Kim Cooper. The article listed St. Andrew's final record at 15-6.`;

export default function Season2000_01() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2000}
      seasonLabel="2000-01"
      trimShootingColumns
      hideScheduleToggle
      hidePlayerStatsToggle
      seasonRecap={seasonRecap}
      seasonRecapLinks={[
        {
          Text: "preseason capsule",
          ArticleID: "20001121-girls-basketball-capsules",
        },
        {
          Text: "41-11 win at Abundant Life",
          ArticleID: "20001202-st-andrews-girls-open-with-abundant-life",
        },
        {
          Text: "opened January with wins over Bible Baptist and Sea Island",
          ArticleID: "20010103-st-andrews-sweeps-bible-baptist",
        },
        {
          Text: "final regular-season statistics",
          ArticleID: "20010216-final-2000-01-girls-basketball-statistics",
        },
        {
          Text: "Region 4-AA semifinals",
          ArticleID: "20010221-st-andrews-girls-fall-in-region-semifinal",
        },
      ]}
      seasonBriefs={[
        { label: "Record", value: "15-6" },
        { label: "Coach", value: "Debra Morrell" },
        { label: "Finish", value: "Region Semifinals" },
      ]}
      hideSeasonArticles
      showSeasonImagesPlaceholder
      showSeasonRoster
      headCoach="Debra Morrell"
    />
  );
}
