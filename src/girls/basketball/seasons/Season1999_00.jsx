import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The winter NewsBank sweep confirms that Deborah Morell's 1999-00 team did make it through the season after the fall preview wondered whether St. Andrew's would have enough players. The Saints finished 11-13, reached the SCISA Region IV final, and earned a state tournament berth with a roster that leaned on Adair Johnson, Nadine Kaiser, Meghan Lowe, Kim Cooper, Carie Bugos, and Becca Cooper.

A Jan. 18 feature explained how fragile the season had been. St. Andrew's began preseason practice with only four players, canceled early games, and eventually had to promote middle school players while adding inexperienced help. Johnson, Kaiser, and Lowe kept the season upright while Morell adjusted the program around the short roster.

The recovered schedule shows the team growing into February. Kaiser and Lowe were the primary scorers in the regular season, and the Feb. 11 area leaderboard credited Kaiser with 229 points through 15 listed games while Lowe had 131. Kaiser scored 24 against St. Paul's, 20 against Beaufort Academy, 20 against Sea Island, 21 in the return game with Beaufort, and 24 against Patrick Henry. She was named Girls City Player of the Week after leading the Sea Island and Harvest Baptist wins.

The postseason gave the season its best stretch. Kaiser scored 27 and Lowe 21 in a 58-44 region first-round win over St. Paul's, then St. Andrew's beat Patrick Henry 52-41 behind Kaiser, Johnson, and Lowe to clinch a state tournament appearance. Hilton Head Christian won the region final, but Morell told the paper that a team this young had already moved far beyond preseason expectations.

Avalon ended the season in the SCISA tournament, 67-22. The final report listed St. Andrew's at 11-13, and the schedule uses five placeholders to preserve the unrecovered results needed to reconcile that published final record.

The spring awards sweep also found St. Andrew's Hollis Stacy Award nominees: Kimberly Cooper and Megan Lowe, matching the basketball archive's Kim Cooper and Meghan Lowe.`;

export default function Season1999_00() {
  return (
    <MaxPrepsSeasonPage
      seasonId={1999}
      seasonLabel="1999-00"
      trimShootingColumns
      hideScheduleToggle
      hidePlayerStatsToggle
      seasonRecap={seasonRecap}
      seasonRecapLinks={[
        {
          Text: "Jan. 18 feature",
          ArticleID: "20000118-lack-of-interest-baffles-st-andrews-girls-coach",
        },
        {
          Text: "Feb. 11 area leaderboard",
          ArticleID: "20000211-1999-00-girls-basketball-statistics",
        },
        {
          Text: "58-44 region first-round win",
          ArticleID: "20000223-girls-region-first-round-st-pauls",
        },
        {
          Text: "beat Patrick Henry 52-41",
          ArticleID: "20000226-girls-region-semifinal-patrick-henry",
        },
        {
          Text: "Avalon ended the season",
          ArticleID: "20000302-girls-state-tournament-avalon",
        },
      ]}
      seasonBriefs={[
        { label: "Record", value: "11-13" },
        { label: "Coach", value: "Deborah Morell" },
        { label: "Finish", value: "Region Runner-Up / State Tournament" },
      ]}
      hideSeasonArticles
      showSeasonImagesPlaceholder
      showSeasonRoster
      headCoach="Deborah Morell"
    />
  );
}
