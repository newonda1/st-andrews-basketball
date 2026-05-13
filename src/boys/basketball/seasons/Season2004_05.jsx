import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The 2004-05 St. Andrew's boys basketball season opened as a full rebuild after the Saints' 2003-04 championship run. A newspaper season preview listed Dave Clay as the first-year head coach and looked back at St. Andrew's 19-8 finish from the year before, when the Saints went unbeaten in region play, won the SCISA AA region championship, and captured the SCISA AA state title.

The preview framed the biggest storyline around graduation losses. St. Andrew's had graduated five starters, including Davy Clay, a two-time all-state player, along with Beau Hinton and guard Josh Smith. With that championship core gone, the article identified Jamie Cooper, Kevin Crouch, and Matt Knight as the key returnees who would have to fill the physical and leadership void.

The same preview listed Cooper as a 6-1 junior center, Crouch as a 6-0 junior guard, and Knight as a 6-1 senior forward.

The first entered game results show the Saints opening with eight straight non-region losses before moving into tournament play. Bible Baptist beat St. Andrew's 58-50 on Nov. 22 despite 21 points from Ross Glendye and 12 from Trevor Shanklin, then Pinewood Christian defeated the Saints 75-43 on Nov. 30 behind Ric Roderick's 21-point night. Jamie Cooper led St. Andrew's with 16 points against Pinewood, while Glendye added 10.

St. Andrew's traveled to Walterboro on Dec. 2 and led Colleton Prep 31-25 at halftime before falling 64-58. Kevin Crouch scored a game-high 20 points, Billy Vine added 14, and Glendye scored 13. The next night at Memorial Day, Glendye erupted for 30 points and Crouch added 12, but Memorial outscored the Saints 25-12 in the third quarter to win 70-61.

On Dec. 4, Frederica Academy edged the Saints 52-50 at St. Andrew's. Glendye scored a game-high 21 points and Crouch added 10 as the Saints fell to 0-5. Three days later in St. Simons Island, Frederica won the rematch 57-36 behind Matt Bloomingfield's 17 points, while Shanklin led St. Andrew's with 12.

Hilton Head Prep used a balanced offense to beat St. Andrew's 71-34 on Dec. 10 in Hilton Head. Thomas Withers paced the Saints with 10 points, and Shanklin added 8. The next day in Hilton Head, Laurence Manning Academy defeated St. Andrew's 67-46 behind Alan Johnson's 21 points; Withers led the Saints with 12, while Crouch added 11 and Glendye scored 10.

On Dec. 16, Pinewood Christian beat St. Andrew's 86-36 in the Bulloch Academy-Pinewood Christian Classic in Bellville. Ric Roderick scored 21 for Pinewood, while Christian Maleki, Crouch, Withers, and Cooper shared the St. Andrew's lead with 6 points apiece. Two days later in the same tournament, David Emanuel forced overtime with three late free throws and beat St. Andrew's 68-54 despite 10 points each from Billy Vine, Withers, and Cooper.

St. Andrew's returned from the break on Jan. 5 and nearly broke through at home against Colleton Prep. The Saints led by five at halftime, and Glendye scored a game-high 21 points, but Colleton Prep rallied in the third quarter and held on 52-51. Game-by-game results, player statistics, newspaper clips, and additional season details will continue to be added here as source material is entered.`;

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
