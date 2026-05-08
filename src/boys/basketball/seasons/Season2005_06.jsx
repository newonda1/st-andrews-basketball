import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The 2005-06 St. Andrew's boys basketball season is built around a complete 24-game schedule and a season roster with scoring totals. Under head coach Dave Clay, St. Andrew's finished 8-16, scored 1,138 points, and played through a schedule that moved from an encouraging November start into a demanding SCISA region run.

The season opened with four straight wins. St. Andrew's beat Bible Baptist, Patrick Henry, Abundant Life, and Bible Baptist again between Nov. 21 and Dec. 2, then hit a difficult tournament and early-winter stretch against Providence Christian, Hilton Head Christian, Holly Hill, Jefferson Davis, and Trinity Collegiate. A Jan. 5 road win at Abundant Life and Jan. 9 home win over Providence Christian brought the team back to 6-6 before region play began.

Region games became the hardest part of the file. St. Andrew's went 0-8 in region play against Hilton Head Christian, Thomas Heyward, Beaufort Academy, and Hilton Head Prep, with the closest region result coming in a 75-65 road loss at Thomas Heyward on Jan. 17. The schedule still carried a few non-region bright spots, including a Jan. 13 road win at Bible Baptist and a 57-55 road win at Patrick Henry on Feb. 4.

The season closed in the state tournament at Thomas Heyward Academy on Feb. 13. The surviving player totals are strongest as a scoring archive, with 14 players identified in the season roster. Ross Glendye leads the surviving totals with 288 points, followed by Kevin Crouch with 177, Jamie Cooper with 169, Gian Maleki with 142, Thomas Withers with 113, and Bryan Lee with 98.`;

export default function Season2005_06() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2005}
      seasonLabel="2005-06"
      seasonRecap={seasonRecap}
      seasonBriefs={[
        { label: "Record", value: "8-16" },
        { label: "Coach", value: "Dave Clay" },
        { label: "Finish", value: "State Tournament" },
      ]}
      rosterTitle="Roster"
      statSourceLabel="Archive"
      trimShootingColumns
      seasonImages={[]}
      showSeasonImagesPlaceholder
      showSeasonRoster
      rosterStaff={[{ name: "Dave Clay", role: "Head Coach" }]}
      hideBrackets
      hidePlayerStatsToggle
    />
  );
}
