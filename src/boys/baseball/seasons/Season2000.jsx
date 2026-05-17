import React from "react";

import { BaseballSeasonPage } from "./Season2008";

const seasonRecapParagraphs = [
  "The Spring 2000 baseball archive fills in Karl DeMasi's first St. Andrew's baseball season from the March 22 Agape Christian doubleheader through the May 3 Beaufort Academy win. Published record lines resolve to 10-7 overall and 5-5 in SCISA Region 4-AA, with four placeholders preserving unrecovered results.",
  "St. Andrew's swept Agape Christian 10-1 and 4-1 to start the recovered run. Jeff Smith, Matt Hunt, Jake Smith, and Tyson Lenka carried the first-game offense, and Adam Ciccio and Ryan Stratz combined on a no-hitter in the second game.",
  "April brought the season's strongest stretch. The Saints beat Patrick Henry 6-3 in eight innings, Beaufort Academy 10-7, Bible Baptist 10-0, and St. Paul's Country Day 17-1. Ryan Stratz had a 4-for-4 day against St. Paul's and a 3-for-4 game against Beaufort, Zack Hillard drove in five against Bible Baptist and four against St. Paul's, and Adam Sumers and Stevie Gregory homered in the Bible Baptist win.",
  "The final recovered win came May 3 at Beaufort Academy, where Matt Hunt and Ricky Wiggins each hit a three-run home run. Hunt also earned two recovered pitching wins, while Hillard closed the available record at 3-3 after the Beaufort victory.",
  "Leaderboard snapshots from March 31 and April 7 listed Jake Smith at .500, Zack Hillard at .348 with 14 RBIs, and Jeff Smith and Adam Ciccio among the area pitching leaders. The broad sweep also surfaced the April 8 Sea Island loss inside a Groves playoff article; Amdrew, Andrev, Saints soccer, coach/player, and opponent-name probes did not produce another OCR-only St. Andrew's spring sports box score.",
];

export default function Season2000() {
  return (
    <BaseballSeasonPage
      seasonId={2000}
      title="2000 Season"
      showSeasonImagesPlaceholder
      showSeasonRoster
      rosterStaff={[{ name: "Karl DeMasi", role: "Head Coach" }]}
      seasonRecapParagraphs={seasonRecapParagraphs}
    />
  );
}
