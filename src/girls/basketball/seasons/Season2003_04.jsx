import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `St. Andrew's followed its 2002-03 SCISA Class AA championship with another deep postseason run, finishing 21-5 and returning to the state semifinals under first-year head coach Kevin Kunst. The season also marked a clear stylistic shift. Drawing on a smaller, quicker roster, Kunst pushed the Saints toward a faster offensive identity built around pressure, transition chances, and a goal of reaching 60 points whenever the game allowed it.

That new pace showed up immediately. The Saints opened with a 56-11 win over Memorial Day, using a 29-4 run and 37 forced turnovers to announce the tempo they wanted. Mary Wilkowski had 18 points and 11 rebounds, Grace Wilkowski added 16 and 12, and senior Jennifer Moesch, a transfer from St. Vincent's, added 12 points and 12 assists. By late January, the Saints were 9-3 overall and 5-0 in SCISA Region 2-AA, with Grace and Mary Wilkowski at the center of a Savannah Morning News feature on the team's new high-scoring look.

The Wilkowski sisters gave the season its backbone. Grace, a sophomore, was described as steady and almost mistake-free while averaging 17.6 points and 13.3 rebounds at the time of the feature. Mary, a freshman, gave St. Andrew's a physical interior presence and was averaging 13.5 points and 12.2 rebounds. Around them, Moesch added speed and unpredictability at guard, Becca Cooper controlled the glass, and Carie Bugos, Maggie Hinchey, LeighAnne Evans, Stephanie Griffin, Michelle Griffin, Becca Timms, Rose Wilkowski, Emily Aimone, and Miller rounded out the group.

St. Andrew's controlled region play for most of the winter. The Saints beat Colleton Prep, Memorial Day, Patrick Henry, Holly Hill, Hilton Head Christian, James Island Christian, Beaufort Academy, and Providence Christian during a run that included several comfortable wins and a 50-38 first-place victory over Holly Hill. They reached the SCISA Region 2-AA tournament final after a 57-20 semifinal win over Beaufort Academy before Holly Hill handed them a 52-40 loss in the region championship game.

The Saints regrouped in the state tournament, beating Greenwood Christian 64-34 in the SCISA Class AA quarterfinals as Grace Wilkowski scored 23 points and Becca Cooper added 15 points and 16 rebounds. Their bid to defend the state title ended two days later against Pee Dee Academy, 69-57, in the semifinals. Even with that loss, the season preserved St. Andrew's place among the top teams in the classification: a 21-win year, a perfect regular-season region run, and a State Final Four finish.`;

const seasonImages = [
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-team.png",
    alt: "2003-04 St. Andrew's girls basketball team photo",
    caption: "2003-04 Lady Saints team photo",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-01-leighanne-evans-smile.png",
    alt: "Senior LeighAnne Evans smiling before a game",
    caption: "Senior LeighAnne Evans starts the game with a smile",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-02-becca-cooper-shot.png",
    alt: "Becca Cooper shooting while Maggie Hinchey moves toward the rebound",
    caption: "Captain Becca Cooper goes up for a shot as Maggie Hinchey moves in for the rebound.",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-03-mary-wilkowski-intro.png",
    alt: "Mary Wilkowski running onto the court before a game",
    caption: "Freshman Mary Wilkowski runs out as a second year starter",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-04-kunst-timeout.png",
    alt: "Coach Kevin Kunst talking to the team during a timeout",
    caption: "Coach Kunst going over the plan during a timeout",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-05-grace-wilkowski-free-throw.png",
    alt: "Grace Wilkowski following through on a free throw",
    caption: "Grace Wilkowski shows off her perfect follow through from the foul line",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-06-michelle-griffin-defense.png",
    alt: "Michelle Griffin defending a Colleton Prep player",
    caption: "Michelle Griffin pestering a Colleton Prep player on defense",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-07-jennifer-moesch-free-throw.png",
    alt: "Jennifer Moesch preparing for a free throw",
    caption: "Newcomer to the team Jennifer Moesch goes through her foul shot routine",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-08-offensive-rebound.png",
    alt: "The Lady Saints going for an offensive rebound against Memorial",
    caption: "The Lady Saints go up for the offensive rebound against Memorial",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-09-gym-camera.png",
    alt: "The girls posing playfully for the camera in the gym",
    caption: "The girls hamming it up for the camera in the gym",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-10-defense-memorial.png",
    alt: "The Lady Saints defending against Memorial",
    caption: "The Lady Saints locked in on defense against Memorial",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-11-mary-rebound-outlet.png",
    alt: "Mary Wilkowski grabbing a rebound and looking for an outlet pass",
    caption: "Mary Wilkowski grabs the defensive rebound and looks for Grace on the outlet pass",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-12-carie-bugos-ball-fake.png",
    alt: "Carie Bugos ball faking to create room for a shot",
    caption: "Senior Carie Bugos ball fakes in order to make room for the open shot",
  },
];

export default function Season2003_04() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2003}
      seasonLabel="2003-04"
      trimShootingColumns
      hideScheduleToggle
      hidePlayerStatsToggle
      seasonRecap={seasonRecap}
      seasonBriefs={[
        { label: "Record", value: "21-5" },
        { label: "Coach", value: "Kevin Kunst" },
        { label: "Finish", value: "State Final Four" },
      ]}
      embedFeaturedArticleInRecap
      seasonImages={seasonImages}
      showSeasonRoster
      headCoach="Kevin Kunst"
    />
  );
}
