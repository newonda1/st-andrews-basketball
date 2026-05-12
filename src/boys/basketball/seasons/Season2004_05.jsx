import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The 2004-05 St. Andrew's boys basketball season opened as a full rebuild after the Saints' 2003-04 championship run. A newspaper season preview listed Dave Clay as the first-year head coach and looked back at St. Andrew's 19-8 finish from the year before, when the Saints went unbeaten in region play, won the SCISA AA region championship, and captured the SCISA AA state title.

The preview framed the biggest storyline around graduation losses. St. Andrew's had graduated five starters, including Davy Clay, a two-time all-state player, along with Beau Hinton and guard Josh Smith. With that championship core gone, the article identified Jamie Cooper, Kevin Crouch, and Matt Knight as the key returnees who would have to fill the physical and leadership void.

The same preview listed Cooper as a 6-1 junior center, Crouch as a 6-0 junior guard, and Knight as a 6-1 senior forward. Game-by-game results, player statistics, newspaper clips, and additional season details will be added here as source material is entered.`;

const seasonImages = [
  {
    src: "/images/boys/basketball/seasons/2004-05/gallery/2004-05-boys-basketball-team.png",
    alt: "2004-05 St. Andrew's boys basketball team photo",
    caption: "2004-05 St. Andrew's boys basketball team photo",
  },
  {
    src: "/images/boys/basketball/seasons/2004-05/gallery/2004-05-boys-basketball-01-ross-glendye-rebound.png",
    alt: "Ross Glendye leaping for a rebound",
    caption: "Ross Glendye leaps up over his opponents to grab the rebound",
  },
  {
    src: "/images/boys/basketball/seasons/2004-05/gallery/2004-05-boys-basketball-02-matt-knight-physical.png",
    alt: "Matt Knight playing physically against an opponent",
    caption: "Matt Knight gets physical with his opponent",
  },
  {
    src: "/images/boys/basketball/seasons/2004-05/gallery/2004-05-boys-basketball-03-pregame-huddle.png",
    alt: "Matt Knight, Chris Miller, and Jamie Cooper in a pregame huddle",
    caption:
      "Matt Knight, Chris Miller, and Jamie Cooper gather together for a group huddle before the game.",
  },
  {
    src: "/images/boys/basketball/seasons/2004-05/gallery/2004-05-boys-basketball-04-game-action.png",
    alt: "St. Andrew's boys basketball players watching from the sideline",
    caption: "",
  },
  {
    src: "/images/boys/basketball/seasons/2004-05/gallery/2004-05-boys-basketball-05-ross-glendye-open-teammate.png",
    alt: "Ross Glendye looking for an open teammate",
    caption: "Ross Glendye looks around for an open teammate.",
  },
  {
    src: "/images/boys/basketball/seasons/2004-05/gallery/2004-05-boys-basketball-06-coach-clay-halftime.png",
    alt: "Coach Clay speaking to his players at halftime",
    caption:
      "Coach Clay gives another inspirational speech to his players during half-time.",
  },
  {
    src: "/images/boys/basketball/seasons/2004-05/gallery/2004-05-boys-basketball-07-defensive-play.png",
    alt: "Ross Glendye and Kevin Crouch setting up a defensive play",
    caption: "Ross Glendye and Kevin Crouch set up a strong defensive play",
  },
];

export default function Season2004_05() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2004}
      seasonLabel="2004-05"
      seasonRecap={seasonRecap}
      seasonBriefs={[
        { label: "Record", value: "1-19" },
        { label: "Coach", value: "Dave Clay" },
        { label: "Finish", value: "To be added" },
      ]}
      rosterTitle="Roster"
      statSourceLabel="Archive"
      trimShootingColumns
      seasonImages={seasonImages}
      showSeasonRoster
      rosterStaff={[{ name: "Dave Clay", role: "Head Coach" }]}
      hideBrackets
      hidePlayerStatsToggle
    />
  );
}
