import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const recapContent = (
  <>
    <p className="mb-3 leading-relaxed">
      The 2003-04 St. Andrew&apos;s boys basketball team turned a strong regular
      season into a championship finish, going 19-8 under head coach Michael
      Bennett and winning both the SCISA Region 2-AA tournament and the SCISA Class
      AA state title.
    </p>
    <p className="mb-3 leading-relaxed">
      The Lions went 13-2 in regular-season region play, then beat Colleton Prep
      and Beaufort Academy to claim the region tournament championship. Davy Clay
      was named region tournament MVP after a 20-point, 10-steal night in the
      final, while Cass Sawyer added 19 points and 10 rebounds.
    </p>
    <p className="mb-3 leading-relaxed">
      St. Andrew&apos;s completed the run at the state tournament with wins over
      Greenwood Christian, Calhoun Academy, and Wardlaw Academy. The title game was
      a 61-48 win over Wardlaw, powered by an early 24-5 surge and pressure defense
      that helped bring the program its first state championship since 1998-99.
    </p>
    <p className="mb-3 leading-relaxed">
      The surviving scoring archive is led by Sawyer with 372 points, Josh Smith
      with 349, Clay with 342, and Beau Hinton with 221. The schedule and player
      table below preserve the game-by-game results and scoring totals currently
      available for the season.
    </p>
  </>
);

export default function Season2003_04() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2003}
      seasonLabel="2003-04"
      recapContent={recapContent}
      statSourceLabel="Archive"
      trimShootingColumns
      hidePlayerStatsToggle
    />
  );
}
