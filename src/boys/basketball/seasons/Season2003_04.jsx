import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The 2003-04 St. Andrew's boys basketball team turned a demanding early schedule into a championship season, going 19-8 under head coach Michael Bennet and winning both the SCISA Region 2-AA tournament and the SCISA Class AA state title. The Saints were 2-5 after a December and early-January stretch that included Memorial Day, Hilton Head Prep, Robert Toombs Christian, Pinewood Christian, and other tournament opponents, but the newspaper recaps show a team beginning to find its identity through pressure defense, balanced scoring, and the backcourt energy of senior point guard Davy Clay.

Region play changed the course of the season. St. Andrew's opened SCISA 2-AA competition with wins over Holly Hill, Charleston Collegiate, and James Island Christian, then moved into the region lead with a 76-59 home win over Charleston Collegiate on Jan. 17. Clay had 16 points, 10 assists, and nine steals that night, and the Saints broke open the game with a 21-6 third-quarter run fueled by full-court pressure. Even after an overtime loss to Beaufort Academy, St. Andrew's regrouped to finish 9-1 in regular-season region play, clinching the No. 1 seed with a road win at Beaufort and the regular-season title with a 64-39 win at Colleton Prep.

The postseason carried the same formula forward. Josh Smith scored 22 points as the Saints beat Colleton Prep in the region semifinals, then Clay and Cass Sawyer posted double-doubles in a 65-51 region tournament championship win over Beaufort Academy at Charleston Collegiate. Clay, who had 20 points and 10 steals in the final, was named tournament MVP, while Sawyer earned all-tournament honors after scoring 19 points with 10 rebounds.

St. Andrew's completed the run at the Sumter County Exhibition Center with state tournament wins over Greenwood Christian, Calhoun Academy, and Wardlaw Academy. Clay had 16 points and seven assists in the quarterfinal, Sawyer erupted for 32 points in the semifinal win over Calhoun, and the championship game opened with a 15-0 burst that helped the Saints race past Wardlaw 61-48. The March 7 Savannah Morning News story credited St. Andrew's speed, quickness, and swarming full-court defense for delivering the program's first state title since 1998-99.

The surviving statistical archive is led by Sawyer with 365 points, Smith with 357, Clay with 342, and Beau Hinton with 222. Clay's season is especially vivid in the surviving reports: he repeatedly paired scoring with steals and assists, including near triple-doubles, 15-steal and 16-steal nights, and a Jan. 23 Savannah Morning News Athlete Spotlight that called out his unusual points-and-steals double-double. Smith supplied interior production and rebounding, Sawyer became the Saints' most prolific scorer down the stretch, and Hinton gave the group another steady double-figure threat as the Saints surged from 2-5 to champions.`;

const recapArticle = {
  src: "/images/boys/basketball/seasons/2003-04/davy-clay-athlete-spotlight-2004-01-23.png",
  alt: "Savannah Morning News Athlete Spotlight clipping for Davy Clay from Jan. 23, 2004",
  thumbnailAlt: "Davy Clay portrait in the Jan. 23, 2004 Athlete Spotlight clipping",
  thumbnailPosition: "30% 50%",
  meta: "January 23, 2004 • Savannah Morning News",
  title: "Athlete Spotlight: Davy Clay",
  caption:
    "The Athlete Spotlight highlighted Clay's unusual points-and-steals double-double and his place atop the Coastal Empire leaders in steals and assists.",
};

const seasonImages = [
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-team.png",
    alt: "2003-04 St. Andrew's boys basketball team photo",
    caption: "2003-04 St. Andrew's boys basketball team photo",
  },
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-01-davy-clay-point-guard.png",
    alt: "Davy Clay bringing the ball down the court",
    caption:
      "Senior point guard Davy Clay brings the ball down the court while concentrating on the next play he will call.",
  },
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-02-beau-hinton-inbounds.png",
    alt: "Beau Hinton making an inbounds pass",
    caption: "Beau Hinton makes a strong pass in bounds to get another offensive play started.",
  },
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-03-daniel-eichholz-ball.png",
    alt: "Daniel Eichholz fighting for the ball as Jacob Rauers and Davy Clay watch",
    caption:
      "Daniel Eichholz fights for the ball while Jacob Rauers and Davy Clay watch with anticipation.",
  },
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-04-davy-clay-pressure.png",
    alt: "Davy Clay applying defensive pressure against Beaufort Academy",
    caption: "Davy Clay puts the pressure on Beaufort Academy.",
  },
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-05-senior-boys-playful.png",
    alt: "Senior boys showing their playful sides for the camera",
    caption: "The Senior boys show the camera their playful sides.",
  },
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-06-crouch-glenn-free-throw.png",
    alt: "Andy Crouch and Omar Glenn waiting during a free throw",
    caption:
      "Andy Crouch and Omar Glenn catch their breath while they wait for their teammate to sink his foul shot.",
  },
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-07-josh-smith-defense.png",
    alt: "Josh Smith sprinting down the court to get back on defense",
    caption: "Josh Smith sprints down the court to get in position for defense.",
  },
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-08-bennet-timeout.png",
    alt: "Coach Bennet giving the boys a pep talk during a timeout",
    caption: "Coach Bennet gives the boys a quick pep talk during a time out.",
  },
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-09-andy-crouch-rebound.png",
    alt: "Andy Crouch reaching for a rebound while Omar Glenn steps in",
    caption:
      "Senior Andy Crouch reaches high for the rebound while Junior Omar Glenn steps in to help out.",
  },
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-10-cass-sawyer-free-throw.png",
    alt: "Cass Sawyer lining up a free throw",
    caption: "Cass Sawyer lines up a free throw",
  },
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-11-sawyer-rauers-sideline.png",
    alt: "Cass Sawyer and Jacob Rauers looking to the sideline for instructions",
    caption: "Cass Sawyer and Jacob Rauers look over to the side line for instructions",
  },
  {
    src: "/images/boys/basketball/seasons/2003-04/gallery/2003-04-boys-basketball-12-next-play-plan.png",
    alt: "The Saints making a plan for the next play",
    caption: "Making a plan for the next play",
  },
];

export default function Season2003_04() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2003}
      seasonLabel="2003-04"
      seasonRecap={seasonRecap}
      seasonBriefs={[
        { label: "Record", value: "19-8" },
        { label: "Coach", value: "Michael Bennet" },
        { label: "Finish", value: "State Champions" },
      ]}
      rosterTitle="Roster"
      recapArticle={recapArticle}
      statSourceLabel="Archive"
      trimShootingColumns
      seasonImages={seasonImages}
      showSeasonRoster
      rosterStaff={[
        { name: "Michael Bennet", role: "Head Coach" },
        { name: "Dave Clay", role: "Assistant Coach" },
      ]}
      hideBrackets
      hidePlayerStatsToggle
    />
  );
}
