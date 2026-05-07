import React from "react";

import SportHomePage from "../../../components/SportHomePage";

const footballArchiveImages = [
  {
    src: "/images/boys/football/seasons/2002/2002-football-davy-clay-water-break.png",
    alt: "Davy Clay on the sideline during the 2002-03 football season",
    caption: "2002-03 sideline",
  },
  {
    src: "/images/boys/football/seasons/2002/2002-football-defense.png",
    alt: "St. Andrew's football defense lining up during the 2002-03 season",
    caption: "2002-03 defense",
  },
  {
    src: "/images/boys/football/seasons/2002/2002-football-homecoming-entrance.png",
    alt: "St. Andrew's football players entering the field during homecoming in 2002-03",
    caption: "2002-03 homecoming",
  },
  {
    src: "/images/boys/football/seasons/2002/2002-football-jason-victor-touchdown.png",
    alt: "Jason Victor scoring a touchdown during the 2002-03 football season",
    caption: "2002-03 touchdown",
  },
  {
    src: "/images/boys/football/seasons/2002/2002-football-jeff-smith-punt-return.png",
    alt: "Jeff Smith returning a punt during the 2002-03 football season",
    caption: "2002-03 punt return",
  },
  {
    src: "/images/boys/football/seasons/2002/2002-football-jesse-coleman-defense.png",
    alt: "Jesse Coleman on defense during the 2002-03 football season",
    caption: "2002-03 defense",
  },
  {
    src: "/images/boys/football/seasons/2002/2002-football-team.png",
    alt: "St. Andrew's 2002-03 football team photo",
    caption: "2002-03 team",
  },
  {
    src: "/images/boys/football/seasons/2003/2003-football-aj-roberts-field.png",
    alt: "AJ Roberts on the field during the 2003-04 football season",
    caption: "2003-04 field",
  },
  {
    src: "/images/boys/football/seasons/2003/2003-football-gibbons-clay-benediction.png",
    alt: "St. Andrew's football players gathered after a 2003-04 game",
    caption: "2003-04 postgame",
  },
  {
    src: "/images/boys/football/seasons/2003/2003-football-hunter-saussy-run.png",
    alt: "Hunter Saussy running the ball during the 2003-04 football season",
    caption: "2003-04 run",
  },
  {
    src: "/images/boys/football/seasons/2003/2003-football-josh-smith-route.png",
    alt: "Josh Smith running a route during the 2003-04 football season",
    caption: "2003-04 route",
  },
  {
    src: "/images/boys/football/seasons/2003/2003-football-kunst-timeout.png",
    alt: "St. Andrew's football team in a timeout during the 2003-04 season",
    caption: "2003-04 timeout",
  },
  {
    src: "/images/boys/football/seasons/2003/2003-football-line-contact.png",
    alt: "Football line contact during a 2003-04 St. Andrew's game",
    caption: "2003-04 line play",
  },
  {
    src: "/images/boys/football/seasons/2003/2003-football-pregame-entrance.png",
    alt: "St. Andrew's football pregame entrance during the 2003-04 season",
    caption: "2003-04 entrance",
  },
  {
    src: "/images/boys/football/seasons/2003/2003-football-saussy-knight-sideline.png",
    alt: "St. Andrew's players on the sideline during the 2003-04 football season",
    caption: "2003-04 sideline",
  },
  {
    src: "/images/boys/football/seasons/2003/2003-football-sideline-huddle.png",
    alt: "St. Andrew's football sideline huddle during the 2003-04 season",
    caption: "2003-04 huddle",
  },
  {
    src: "/images/boys/football/seasons/2003/2003-football-team-field-entrance.png",
    alt: "St. Andrew's football team entering the field during the 2003-04 season",
    caption: "2003-04 field entrance",
  },
  {
    src: "/images/boys/football/seasons/2003/2003-football-team.png",
    alt: "St. Andrew's 2003-04 football team photo",
    caption: "2003-04 team",
  },
  {
    src: "/images/boys/football/seasons/2003/2003-football-william-aj-break.png",
    alt: "St. Andrew's football players breaking through during the 2003-04 season",
    caption: "2003-04 break",
  },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Football"
      headline="A fuller home for St. Andrew's football history."
      intro="The football archive now spans 30 season records from 1996 through 2025, with 299 games, opponent history, team records, rosters, player pages, and individual stat tables connected across the site."
      secondaryIntro="Recovered SCISA-era schedules and playoff brackets now sit alongside MaxPreps-era schedules, scores, rosters, season totals, game logs, and newspaper stat adjustments."
      icon="/images/common/football_icon.png"
      iconAlt="St. Andrew's football icon"
      heroImage="/images/boys/football/seasons/2002/2002-football-team.png"
      heroImageAlt="St. Andrew's 2002-03 football team photo"
      heroImageCaption="2002-03 Football Team"
      storyTitle="Program Archive"
      storyParagraphs={[
        "The archive now covers the late-1990s SCISA championship era, the early-2000s region-title seasons, and the full modern run through 2025. It preserves the 1998 state championship, 1996 and 1997 state runner-up seasons, and the 2002 region championship in one searchable program record.",
        "The current files include 432 player records, 24 roster seasons, 12 team stat seasons, 1,550 player game-log rows, and 20 season-total adjustments, giving the football pages enough structure for season summaries, career leaders, single-game records, team records, and opponent-by-opponent history.",
      ]}
      highlights={[
        "30 archived seasons",
        "299 games in the database",
        "432 player records",
        "1,550 player game-log rows",
        "60 recorded opponents",
        "1998 state championship",
        "1996 and 1997 state runner-up finishes",
        "2002 region championship",
        "24 roster seasons",
        "12 team stat seasons",
      ]}
      archiveImages={footballArchiveImages}
    />
  );
}
