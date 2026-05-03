import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const recapContent = (
  <>
    <p className="mb-3 leading-relaxed">
      The 2003-04 St. Andrew&apos;s boys basketball team turned a demanding early
      schedule into a championship season, going 19-8 under head coach Michael
      Bennett and winning both the SCISA Region 2-AA tournament and the SCISA Class
      AA state title. The Saints were 2-5 after a December and early-January stretch
      that included Memorial Day, Hilton Head Prep, Robert Toombs Christian,
      Pinewood Christian, and other tournament opponents, but the newspaper recaps
      show a team beginning to find its identity through pressure defense, balanced
      scoring, and the backcourt energy of senior point guard Davy Clay.
    </p>
    <p className="mb-3 leading-relaxed">
      Region play changed the course of the season. St. Andrew&apos;s opened SCISA
      2-AA competition with wins over Holly Hill, Charleston Collegiate, and James
      Island Christian, then moved into the region lead with a 76-59 home win over
      Charleston Collegiate on Jan. 17. Clay had 16 points, 10 assists, and nine
      steals that night, and the Saints broke open the game with a 21-6 third-quarter
      run fueled by full-court pressure. Even after an overtime loss to Beaufort
      Academy, St. Andrew&apos;s regrouped to finish 9-1 in regular-season region play,
      clinching the No. 1 seed with a road win at Beaufort and the regular-season
      title with a 64-39 win at Colleton Prep.
    </p>
    <p className="mb-3 leading-relaxed">
      The postseason carried the same formula forward. Josh Smith scored 22 points
      as the Saints beat Colleton Prep in the region semifinals, then Clay and Cass
      Sawyer posted double-doubles in a 65-51 region tournament championship win
      over Beaufort Academy at Charleston Collegiate. Clay, who had 20 points and
      10 steals in the final, was named tournament MVP, while Sawyer earned
      all-tournament honors after scoring 19 points with 10 rebounds.
    </p>
    <p className="mb-3 leading-relaxed">
      St. Andrew&apos;s completed the run at the Sumter County Exhibition Center with
      state tournament wins over Greenwood Christian, Calhoun Academy, and Wardlaw
      Academy. Clay had 16 points and seven assists in the quarterfinal, Sawyer
      erupted for 32 points in the semifinal win over Calhoun, and the championship
      game opened with a 15-0 burst that helped the Saints race past Wardlaw 61-48.
      The March 7 Savannah Morning News story credited St. Andrew&apos;s speed, quickness,
      and swarming full-court defense for delivering the program&apos;s first state title
      since 1998-99.
    </p>
    <p className="mb-3 leading-relaxed">
      The surviving statistical archive is led by Sawyer with 365 points, Smith with
      357, Clay with 342, and Beau Hinton with 222. Clay&apos;s season is especially
      vivid in the surviving reports: he repeatedly paired scoring with steals and
      assists, including near triple-doubles, 15-steal and 16-steal nights, and a
      Jan. 23 Savannah Morning News Athlete Spotlight that called out his unusual
      points-and-steals double-double. Smith supplied interior production and
      rebounding, Sawyer became the Saints&apos; most prolific scorer down the stretch,
      and Hinton gave the group another steady double-figure threat as the Saints
      surged from 2-5 to champions.
    </p>
    <figure className="mt-5 overflow-hidden rounded border border-gray-200 bg-gray-50">
      <img
        src="/images/boys/basketball/seasons/2003-04/davy-clay-athlete-spotlight-2004-01-23.png"
        alt="Savannah Morning News Athlete Spotlight clipping for Davy Clay from Jan. 23, 2004"
        className="w-full object-contain"
        loading="lazy"
      />
      <figcaption className="px-4 py-3 text-sm leading-6 text-gray-700">
        The Jan. 23, 2004 Savannah Morning News Athlete Spotlight featured senior
        point guard Davy Clay, noting his unusual points-and-steals double-double
        average and his place atop the Coastal Empire leaders in steals and assists.
      </figcaption>
    </figure>
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
