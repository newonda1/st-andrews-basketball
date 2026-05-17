import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The winter NewsBank sweep fills in Clarence Wilson's interim season at St. Andrew's. The Saints finished 21-9 by the recovered record path, won the SCISA Class AA Region IV championship, and reached the state Final Four for the third time in four SCISA seasons.

The early archive is still incomplete, so the schedule preserves record-path placeholders where the newspaper's published records require games that did not appear in the search results. The recovered box scores still give the season a clear shape: St. Andrew's beat Hilton Head Christian in its own December tournament, knocked Memorial Day from the unbeaten ranks in January, and worked through the Region IV schedule with Evan Aldrich, Lee Stubbs, Andy Teitz, Todd Tribble, and Justin Dixon leading the scoring core.

The Feb. 11 Savannah Morning News leaderboard snapshot credited Aldrich with 453 points through 22 listed games, Stubbs with 372 points, 282 rebounds and 113 blocks, Teitz with 249 points and 107 assists, Dixon with 131 points, and Tribble with 125. A broad OCR sweep found the earlier Feb. 4 version under the misspelling "St. Amdrew's," which confirmed that the regular St. Andrew's search had missed at least one statistics page. The weekly honor rolls also tracked the surge, including Aldrich as City Player of the Week after the St. Paul's and Memorial Day wins.

Aldrich's senior finish became the headline. He scored 36 against Patrick Henry on Feb. 18 and passed Ray Rodgers for the school career scoring record with 1,595 points. Teitz and Stubbs then took larger turns in the postseason, with Teitz scoring 18 in the region semifinal against Hilton Head Christian and 19 in the region championship against Sea Island.

St. Andrew's beat Sea Island 54-53 for the region title when Aldrich hit the winner in the closing seconds, then beat Hudgens Academy 63-54 in overtime in the state quarterfinals after Teitz forced overtime with a late 3-pointer. Northwood Academy ended the run in the semifinals, 83-62. The semifinal article printed a 21-4 final record, but the recovered game-by-game record path supports 21-9.`;

export default function Season1999_00() {
  return (
    <MaxPrepsSeasonPage
      seasonId={1999}
      seasonLabel="1999-00"
      scoringOnly
      statSourceLabel="Archive"
      seasonRecap={seasonRecap}
      seasonBriefs={[
        { label: "Record", value: "21-9" },
        { label: "Coach", value: "Clarence Wilson" },
        { label: "Finish", value: "Region Champion / State Final Four" },
      ]}
      showSeasonImagesPlaceholder
      showSeasonRoster
      rosterTitle="Roster"
      rosterStaff={[{ name: "Clarence Wilson", role: "Interim Head Coach" }]}
      hideBrackets
    />
  );
}
