import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `Michael Bennet's first St. Andrew's boys basketball team turned the 2002-03 season into a fast rebuild and a state runner-up finish. The Saints went 19-5, won 17 regular-season games, captured the region tournament, and reached the SCISA Class AA championship game behind a balanced group that could score from several spots on the floor.

St. Andrew's opened 6-1, with the only early loss coming to Hilton Head Prep in the Ret Thomas Memorial Tournament. The Jan. 7 rematch at St. Andrew's became one of the season's defining regular-season wins. Patrick Burns, the Saints' top scorer and rebounder at that point, sat for the entire second half, but St. Andrew's still beat Hilton Head Prep 65-58. Davy Clay scored 17 points, Josh Smith added 15, Cam Aldrich had 12, and Jeff Smith scored 10 as the Saints proved they could survive without their leading weapon for a night.

The Saints kept building through January. They beat Holly Hill, Bible Baptist, Charleston Collegiate, James Island Christian, Beaufort Academy, and Providence Christian, then added a 64-46 road win at Holly Hill and a 64-61 home win over Hilton Head Christian in early February. The best comeback of that stretch came Feb. 7, when St. Andrew's trailed James Island Christian by 10 entering the fourth quarter before closing with a 34-13 burst in an 82-71 win.

There were also hard jolts. Colleton Prep handed St. Andrew's two region losses, including a 74-48 defeat in the regular-season finale, and Memorial Day overwhelmed the Saints 92-53 in a Jan. 25 rematch. Those losses gave the season some turbulence, but they did not knock the Saints out of the postseason picture. St. Andrew's answered in the region tournament with a 62-40 win over James Island Christian and a 65-52 win over Colleton Prep, reversing the matchup that had caused the most trouble during the regular season.

The postseason run ended with a 69-57 loss to Pee Dee Academy in the SCISA Class AA state championship game, leaving St. Andrew's as state runner-up. The surviving box scores show how broad the offense became: Josh Smith finished with 285 points, Aldrich had 263, Clay scored 253, Jeff Smith added 233, and Burns still totaled 142 despite the injury that reshaped the year. Clay, Beau Hinton, Jeff Smith, and Josh Smith would become part of the program's next championship core, but this team had already pushed St. Andrew's back to the final weekend.

The spring awards sweep added one more note to the year: Davy Clay and Jeff Smith were honorable mention selections on the Savannah Morning News Boys All-Coastal Empire basketball teams after the Saints' state runner-up finish.`;

export default function Season2002_03() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2002}
      seasonLabel="2002-03"
      seasonRecap={seasonRecap}
      seasonBriefs={[
        { label: "Record", value: "19-5" },
        { label: "Coach", value: "Michael Bennet" },
        { label: "Finish", value: "State Runner-Up" },
      ]}
      scoringOnly
      statSourceLabel="Archive"
      rosterTitle="Roster"
      showSeasonImagesPlaceholder
      showSeasonRoster
      hideBrackets
    />
  );
}
