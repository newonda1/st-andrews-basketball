import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `Karl Demasi's first St. Andrew's team turned a streaky winter into another deep SCISA run. The Saints started with wins over Abundant Life, Sea Island, Pinewood Christian, and Bible Baptist, and the recovered box scores show a balanced core around Tobi Specht, Jeff Smith, Patrick Burns, Justin Dixon, Davy Clay, Cam Aldrich, and Ben Robertson.

January brought the season's defining midyear arc. St. Andrew's beat Beaufort Academy 60-52 after halftime adjustments and Specht's second-half shooting, then a Savannah Morning News feature spotlighted Specht as one of the international student-athletes shaping the team. The Saints also worked through region losses to Hilton Head Christian, Colleton Prep, and James Island Christian before entering the Region 4-AA tournament as a dangerous fourth seed.

That tournament changed the shape of the year. St. Andrew's upset top-seeded Hilton Head Christian 70-65 in overtime behind 22 points from Specht, 17 from Justin Dixon, 12 from Smith, and 11 from Burns, then beat Colleton Prep 75-53 for the region championship. Dixon was named region-tournament MVP, Specht made the all-tournament team, and the Saints secured another state-tournament berth.

The state run opened with a 72-55 win over Sea Island Academy and continued with a 69-60 quarterfinal win over Carolina Academy, when Specht scored 32 and made seven 3-pointers. Pee Dee Academy ended the season in the semifinals, 68-52, leaving St. Andrew's 16-11 with a region championship and a state final-four appearance. The recovered scoring archive credits Specht with 472 points, Smith with 273, Burns with 238, and Justin Dixon with 205.`;

export default function Season2000_01() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2000}
      seasonLabel="2000-01"
      scoringOnly
      statSourceLabel="Archive"
      seasonRecap={seasonRecap}
      seasonBriefs={[
        { label: "Record", value: "16-11" },
        { label: "Coach", value: "Karl Demasi" },
        { label: "Finish", value: "State Final Four" },
      ]}
      showSeasonImagesPlaceholder
      showSeasonRoster
      rosterTitle="Roster"
      rosterStaff={[{ name: "Karl Demasi", role: "Head Coach" }]}
      hideBrackets
    />
  );
}
