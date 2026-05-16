import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `Karl Demasi's second St. Andrew's boys basketball season finished 16-7, with the Saints going 4-2 in regular-season SCISA Region 4-AA play before their year ended in the region tournament. The winter NewsBank sweep filled in the December start of the schedule and clarified the shape of the region race: St. Andrew's was strong enough to win 16 games, but the postseason path closed before the state tournament.

The Saints opened with a 65-45 non-region win over Patrick Henry Academy behind Patrick Burns' 22 points. They then hosted the St. Andrew's Holiday Invitational, beating Abundant Life 76-60 as Jeff Smith posted a triple-double with 13 points, 10 rebounds, and 11 assists. Memorial Day stopped St. Andrew's 53-46 in the tournament final despite 18 points from Burns and 12 from Ben Robertson.

By January, the Saints were leaning on Burns as the scoring and rebounding anchor, Smith as a disruptive guard, Davy Clay as a steals-and-assists engine, and Cam Aldrich on the glass. The Jan. 25 Fast Break column reported Burns had averaged 26.7 points and 12.7 rebounds during three St. Andrew's wins the previous week. The final regular-season statistics later listed Burns with 418 points and 239 rebounds in 22 games, Aldrich with 163 rebounds, Clay with 71 assists and 110 steals, and Smith with 72 steals.

The region record came from a split with Hilton Head Christian and wins over James Island Christian and Colleton Prep. St. Andrew's beat James Island Christian twice, edged Colleton Prep 67-63 and 69-66, and lost twice to Hilton Head Christian. Outside the region, the Saints added wins over Patrick Henry, Charleston Collegiate, Beaufort Academy, St. John's Christian, St. Paul's Country Day, and Providence Christian.

The final week was demanding. Memorial Day beat St. Andrew's 56-52 on Feb. 9, but the Saints answered with a 70-61 win over James Island Christian on Feb. 12 as Aldrich scored 23 with 13 rebounds, Burns had 19 and 15, Smith scored 14, and Clay added 10. In the SCISA Region 4-AA Tournament, St. Andrew's fell behind Colleton Prep 32-5, rallied back into the game, and lost 66-61. Burns scored 28 in the finale, Smith had 14 points and 10 steals, Matt Hunt and Aldrich scored 8 each, and Robertson added 3.

Two early-season games remain preserved as placeholders because the newspaper statistical totals imply additional contests before Jan. 8, but the NewsBank sweep did not recover opponents, scores, or box scores. The spring awards package later named Burns to the Savannah Morning News Boys All-Coastal Empire third team after a junior season of 14 straight double-doubles.`;

export default function Season2001_02() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2001}
      seasonLabel="2001-02"
      seasonRecap={seasonRecap}
      seasonRecapLinks={[
        {
          Text: "St. Andrew's Holiday Invitational",
          ArticleID: "20011207-small-schools-big-prizes",
        },
        {
          Text: "Jeff Smith posted a triple-double",
          ArticleID: "20011209-memorial-day-captures-boys-tournament-title",
        },
        {
          Text: "Burns had averaged 26.7 points and 12.7 rebounds",
          ArticleID: "20020125-fast-break-burns-week",
        },
        {
          Text: "final regular-season statistics",
          ArticleID: "20020215-final-2001-02-prep-basketball-statistics",
        },
        {
          Text: "lost 66-61",
          ArticleID: "20020220-loss-to-colleton-prep-ends-saints-season",
        },
        {
          Text: "Boys All-Coastal Empire third team",
          ArticleID: "20020319-boys-all-coastal-empire",
        },
      ]}
      seasonBriefs={[
        { label: "Record", value: "16-7" },
        { label: "Coach", value: "Karl Demasi" },
        { label: "Finish", value: "Region Tournament" },
      ]}
      scoringOnly
      statSourceLabel="Archive"
      rosterTitle="Roster"
      showSeasonImagesPlaceholder
      showSeasonRoster
      rosterStaff={[{ name: "Karl Demasi", role: "Head Coach" }]}
      hideBrackets
    />
  );
}
