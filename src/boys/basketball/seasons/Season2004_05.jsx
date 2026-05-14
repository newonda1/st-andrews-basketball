import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The 2004-05 St. Andrew's boys basketball season was a hard reset after one of the program's best runs. The Saints had gone 19-8 in 2003-04, swept through region play unbeaten, won the SCISA AA region title, and finished the climb with the SCISA AA state championship. A new season preview made the contrast plain: Dave Clay was taking over as head coach, and St. Andrew's had graduated all five starters from that championship team, including two-time all-state guard Davy Clay, Beau Hinton, and Josh Smith.

The preview pointed to Jamie Cooper, Kevin Crouch, and Matt Knight as the returning players asked to steady the rebuild. Around them, the season quickly became a test of younger varsity roles and new responsibility. Ross Glendye, Trevor Shanklin, Billy Vine, Thomas Withers, Christian Maleki, Chris Miller, and others moved into heavier minutes while the Saints tried to replace the scoring, ball handling, and late-game assurance that had left with the senior class.

The opening month showed both the challenge and the flashes. Bible Baptist beat St. Andrew's 58-50 in the opener despite 21 points from Glendye and 12 from Shanklin, and Pinewood Christian followed with a 75-43 win even as Cooper scored 16. St. Andrew's then took Colleton Prep to halftime with a 31-25 lead before falling 64-58 behind Crouch's 20 points, Vine's 14, and Glendye's 13. A night later, Glendye scored 30 at Memorial Day, but the Matadors used a big third quarter to hand the Saints a 70-61 loss.

St. Andrew's stayed competitive in pieces through early December. Frederica Academy escaped the Compton Center with a 52-50 win on Dec. 4 as Glendye scored 21 and Crouch added 10, then beat the Saints again three days later on St. Simons. Hilton Head Prep and Laurence Manning both won in Hilton Head, and the Bulloch Academy-Pinewood Christian Classic brought two more losses, including an overtime game against David Emanuel in which Vine, Withers, and Cooper each scored 10.

The Saints nearly broke through again after the holiday break. On Jan. 5, they led Colleton Prep by five at halftime before falling 52-51, with Glendye scoring 21 and Crouch adding 11. Region play began against a strong SCISA slate, and Hilton Head Christian, Thomas Heyward, Beaufort Academy, and Hilton Head Prep all handed St. Andrew's losses before the Saints found their lone win of the season at Bible Baptist on Jan. 15. Cooper led that 60-38 victory with 17 points and 14 rebounds, Crouch added 14, and Shanklin scored 11 as St. Andrew's finally turned one of its better nights into a result.

The second half of the region schedule underlined how steep the rebuild remained. Hilton Head Christian beat the Saints 66-36 on Jan. 28, Providence Christian won a Feb. 1 non-region game despite Cooper's 20 points, and Thomas Heyward took the Feb. 4 rematch even with Cooper scoring 20 again. Beaufort Academy won 71-40 on Feb. 8 as Glendye led St. Andrew's with 16, and Hilton Head Prep closed the regular season with an 87-34 win in Hilton Head. The Saints finished regular-season region play 0-8.

St. Andrew's saved one of its strongest offensive nights for the region tournament. In the first round at Beaufort Academy, Glendye scored 32 points and Crouch added 14, but Beaufort held on 66-57 and ended the Saints' season at 1-23. The final record told the story of a roster thrown into a championship-sized vacancy, but the game logs also preserve the growth points: Glendye became the Saints' primary scorer, Cooper gave the team its most consistent interior production, and Vine, Crouch, Shanklin, Withers, and Maleki kept absorbing bigger roles as the season wore on.`;

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
        { label: "Record", value: "1-23" },
        { label: "Coach", value: "Dave Clay" },
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
