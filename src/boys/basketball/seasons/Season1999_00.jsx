import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The winter NewsBank sweep fills in Clarence Wilson's interim season at St. Andrew's. The Saints finished 21-9 by the recovered record path, won the SCISA Class AA Region IV championship, and reached the state Final Four for the third time in four SCISA seasons.

The early archive is still incomplete, so the schedule preserves record-path placeholders where the newspaper's published records require games that did not appear in the search results. The recovered box scores still give the season a clear shape: St. Andrew's beat Hilton Head Christian in its own December tournament, knocked Memorial Day from the unbeaten ranks in January, and worked through the Region IV schedule with Evan Aldrich, Lee Stubbs, Andy Tietz, Todd Tribble, and Justin Dixon leading the scoring core.

The Feb. 11 Savannah Morning News leaderboard snapshot credited Aldrich with 453 points through 22 listed games, Stubbs with 372 points, 282 rebounds and 113 blocks, Tietz with 249 points and 107 assists, Dixon with 131 points, and Tribble with 125. A broad OCR sweep found the earlier Feb. 4 version under the misspelling "St. Amdrew's," which confirmed that the regular St. Andrew's search had missed at least one statistics page. The weekly honor rolls also tracked the surge, including Aldrich as City Player of the Week after the St. Paul's and Memorial Day wins.

Aldrich's senior finish became the headline. He scored 36 against Patrick Henry on Feb. 18 and passed Ray Rodgers for the school career scoring record with 1,595 points. Tietz and Stubbs then took larger turns in the postseason, with Tietz scoring 18 in the region semifinal against Hilton Head Christian and 19 in the region championship against Sea Island.

St. Andrew's beat Sea Island 54-53 for the region title when Aldrich hit the winner in the closing seconds, then beat Hudgens Academy 63-54 in overtime in the state quarterfinals after Tietz forced overtime with a late 3-pointer. Northwood Academy ended the run in the semifinals, 83-62. The semifinal article printed a 21-4 final record, but the recovered game-by-game record path supports 21-9.

The spring awards sweep added one postseason honor: Aldrich received honorable mention on the Savannah Morning News Boys All-Coastal Empire basketball team.`;

const seasonImages = [
  {
    src: "/images/boys/basketball/seasons/1999-00/gallery/1999-00-boys-basketball-team.png",
    alt: "1999-00 St. Andrew's boys basketball team photo",
    caption:
      "(Back Row) Coach Russell, Evan Aldrich, Lee Stubbs, Justin Howard, Randall Phillips, Coach Wilson (Front Row) Patrick Burns, Andy Tietz, Quint Dixon, Justin Dixon",
  },
  {
    src: "/images/boys/basketball/seasons/1999-00/gallery/1999-00-boys-basketball-01-justin-dixon-pass.png",
    alt: "Justin Dixon looking for a pass against Patrick Henry",
    caption:
      "Sophomore Justin Dixon does a great job of looking the pass against Patrick Henry, which was an easy win",
  },
  {
    src: "/images/boys/basketball/seasons/1999-00/gallery/1999-00-boys-basketball-02-pregame-high-five.png",
    alt: "Justin Dixon, Andy Tietz, Lee Stubbs, and Todd Tribble high five before a game",
    caption:
      "Justin Dixon, Andy Tietz, Lee Stubbs, and Todd Tribble show enthusiasm by giving each other a high five before another winning game",
  },
  {
    src: "/images/boys/basketball/seasons/1999-00/gallery/1999-00-boys-basketball-03-andy-tietz-pass.png",
    alt: "Andy Tietz holding the ball away from Patrick Henry",
    caption: "Andy Tietz holds the ball away from Patrick Henry while looking for a pass",
  },
  {
    src: "/images/boys/basketball/seasons/1999-00/gallery/1999-00-boys-basketball-04-aldrich-stubbs-akilah-prescott.png",
    alt: "Evan Aldrich and Lee Stubbs sitting with Akilah Prescott",
    caption:
      "Seniors Evan Aldrich and Lee Stubbs sit with Akilah Prescott, an Angel Squad cheerleader, while watching the Varsity Girls play.",
  },
  {
    src: "/images/boys/basketball/seasons/1999-00/gallery/1999-00-boys-basketball-05-justin-howard-sideline.png",
    alt: "Justin Howard waiting on the sideline",
    caption:
      "Freshman Justin Howard waits his turn to join the Varsity Boys action in another exciting game.",
  },
];

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
      seasonImages={seasonImages}
      showSeasonRoster
      rosterTitle="Roster"
      rosterStaff={[
        { name: "Clarence Wilson", role: "Head Coach" },
        { name: "Coach Russell", role: "Assistant Coach" },
      ]}
      hideBrackets
    />
  );
}
