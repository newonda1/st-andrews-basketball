import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The winter NewsBank sweep confirms that Debra Morrell's 1999-00 team did make it through the season after the fall preview wondered whether St. Andrew's would have enough players. The Saints finished 11-13, reached the SCISA Region IV final, and earned a state tournament berth with a roster that leaned on Adair Johnson, Nadine Kaiser, Meghan Lowe, Kim Cooper, Carie Bugos, and Becca Cooper.

A Jan. 18 feature explained how fragile the season had been. St. Andrew's began preseason practice with only four players, canceled early games, and eventually had to promote middle school players while adding inexperienced help. Johnson, Kaiser, and Lowe kept the season upright while Morrell adjusted the program around the short roster.

The recovered schedule shows the team growing into February. Kaiser and Lowe were the primary scorers in the regular season, and the Feb. 11 area leaderboard credited Kaiser with 229 points through 15 listed games while Lowe had 131. Kaiser scored 24 against St. Paul's, 20 against Beaufort Academy, 20 against Sea Island, 21 in the return game with Beaufort, and 24 against Patrick Henry. She was named Girls City Player of the Week after leading the Sea Island and Harvest Baptist wins.

The postseason gave the season its best stretch. Kaiser scored 27 and Lowe 21 in a 58-44 region first-round win over St. Paul's, then St. Andrew's beat Patrick Henry 52-41 behind Kaiser, Johnson, and Lowe to clinch a state tournament appearance. Hilton Head Christian won the region final, but Morrell told the paper that a team this young had already moved far beyond preseason expectations.

Avalon ended the season in the SCISA tournament, 67-22. The final report listed St. Andrew's at 11-13, and the schedule still marks the remaining unrecovered losses as placeholders until those game details are confirmed.

The spring awards sweep also found St. Andrew's Hollis Stacy Award nominees: Kimberly Cooper and Megan Lowe, matching the basketball archive's Kim Cooper and Meghan Lowe.`;

const seasonImages = [
  {
    src: "/images/girls/basketball/seasons/1999-00/gallery/1999-00-girls-basketball-team.png",
    alt: "1999-00 St. Andrew's girls basketball team photo",
    caption:
      "(Back Row) Nadine Kaiser, Becca Cooper, Coach Morrell, Kim Cooper, Adair Johnson (Front Row) Gavin Brooks, Megan Lowe, Erin Stuart, Carie Bugos",
  },
  {
    src: "/images/girls/basketball/seasons/1999-00/gallery/1999-00-girls-basketball-01-senior-night.png",
    alt: "Players and cheerleaders cheering at Senior Night",
    caption: "The players and cheerleaders cheer on their captains at Senior Night.",
  },
  {
    src: "/images/girls/basketball/seasons/1999-00/gallery/1999-00-girls-basketball-02-adair-pass.png",
    alt: "Adair Johnson looking down the court with the basketball",
    caption:
      "Adair looks down the court for an open player to see if she can make a clear pass and have a chance to score",
  },
  {
    src: "/images/girls/basketball/seasons/1999-00/gallery/1999-00-girls-basketball-03-senior-recognition.png",
    alt: "Coach Morrell presenting Adair Johnson with senior recognition gifts",
    caption:
      "Coach Morrell presents Senior Adair Johnson with flowers, a plaque, and a picture on Senior Recognition Night.",
  },
  {
    src: "/images/girls/basketball/seasons/1999-00/gallery/1999-00-girls-basketball-04-mr-willis.png",
    alt: "The girls basketball team posing with Mr. Willis",
    caption:
      "The team poses with Mr. Willis after a long game. Mr. Willis refereed many of the girls' games.",
  },
  {
    src: "/images/girls/basketball/seasons/1999-00/gallery/1999-00-girls-basketball-05-huddle.png",
    alt: "The Lady Saints huddling on the floor during a game",
    caption:
      "The Lady Saints huddle on the floor so they can get a new game plan to beat Hilton Head Christian.",
  },
  {
    src: "/images/girls/basketball/seasons/1999-00/gallery/1999-00-girls-basketball-06-thinkers.png",
    alt: "Coach Morrell and Becca Cooper watching an intense game moment",
    caption:
      "The Thinker, Coach Morrell, and The Junior Thinker, Becca Cooper, watch a very intense moment during a game.",
  },
  {
    src: "/images/girls/basketball/seasons/1999-00/gallery/1999-00-girls-basketball-07-nadine-free-throw.png",
    alt: "Nadine Kaiser shooting a free throw",
    caption:
      "Nadine Kaiser swishes another foul shot. Nadine was the best free throw shooter of this year's team.",
  },
];

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
        { label: "Coach", value: "Debra Morrell" },
      ]}
      hideSeasonArticles
      hideSeasonFinishBrief
      seasonImages={seasonImages}
      showSeasonRoster
      headCoach="Debra Morrell"
    />
  );
}
