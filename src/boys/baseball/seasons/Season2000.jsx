import React from "react";

import { BaseballSeasonPage } from "./Season2008";

const seasonImages = [
  {
    src: "/images/boys/baseball/seasons/2000/gallery/2000-baseball-team.png",
    alt: "1999-00 St. Andrew's boys baseball team photo",
    caption:
      "(Back Row) Justin Howard, Billy McCarthy, Tyson Lemka, Adem Sumer, Adam Ciccio, Zach Hillard, Ricky Wiggins, Jake Smith (Front Row) Cory Brinson, Brent Marona, Jeff Smith, Stevie Gregory, Ryan Stratz, Matt Hunt",
  },
];

const seasonRecapParagraphs = [
  "The Spring 2000 baseball archive now covers Karl DeMasi's first St. Andrew's baseball season from three yearbook-confirmed games before March 22 through the May 3 Beaufort Academy win. The Saints finished 10-7 overall and 5-5 in SCISA Region 4-AA, with the yearbook filling the final score-only gaps in the schedule.",
  "The yearbook records St. Andrew's opening run as a 12-0 loss to Sea Island, a 15-8 loss to St. Paul's Country Day, and an 8-6 win over Bible Baptist before the March 22 Agape Christian doubleheader. The Saints then swept Agape Christian 10-1 and 4-1, with Jeff Smith, Matt Hunt, Jake Smith, and Tyson Lemka carrying the first-game offense before Adam Ciccio and Ryan Stratz combined on a no-hitter in the second game.",
  "April brought the season's strongest stretch. The Saints beat Patrick Henry 6-3 in eight innings, Beaufort Academy 10-7, Bible Baptist 10-0, and St. Paul's Country Day 17-1. Ryan Stratz had a 4-for-4 day against St. Paul's and a 3-for-4 game against Beaufort, Zach Hillard drove in five against Bible Baptist and four against St. Paul's, and Adem Sumer and Stevie Gregory homered in the Bible Baptist win.",
  "A yearbook-only 14-1 loss to Hilton Head Christian filled the final remaining gap between the April 28 Memorial Day loss and the May 3 Beaufort Academy win. At Beaufort, Matt Hunt and Ricky Wiggins each hit a three-run home run. Hunt also earned two recovered pitching wins, while Hillard closed the available record at 3-3 after the Beaufort victory.",
  "Leaderboard snapshots from March 31 and April 7 listed Jake Smith at .500, Zach Hillard at .348 with 14 RBIs, and Jeff Smith and Adam Ciccio among the area pitching leaders. The broad sweep also surfaced the April 8 Sea Island loss inside a Groves playoff article, and the yearbook now identifies the remaining score-only results.",
];

export default function Season2000() {
  return (
    <BaseballSeasonPage
      seasonId={2000}
      title="2000 Season"
      seasonImages={seasonImages}
      showSeasonRoster
      rosterStaff={[{ name: "Karl DeMasi", role: "Head Coach" }]}
      seasonRecapParagraphs={seasonRecapParagraphs}
    />
  );
}
