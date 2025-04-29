import React from 'react';

function Home() {
  return (
    <>
      <header className="text-center mb-6">
        <img src="/logo.png" alt="St. Andrew's Logo" className="h-20 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">
          Celebrating the Legacy of St. Andrew&apos;s Basketball
        </h1>
      </header>
      <section className="mb-12">
        <div className="bg-gray-100 rounded-xl p-8 shadow-md">
          <p className="text-lg leading-relaxed mb-4 text-justify">
          The history of St. Andrew’s boys basketball is one of resilience, transformation, and championship legacy. Over nearly five decades, the program has evolved from its early foundational years into a powerhouse within Georgia's independent school athletics.
          </p>
          <p className="text-lg leading-relaxed mb-4 text-justify">
          The team began its journey in the late 1970s under Coach Dave Clay, who led the program through its early GISA seasons and into SCISA competition. These early years were marked by the grit and consistency required to build a program from the ground up. Coaches like Ron Lassiter, Joel Smoker, and Don Sherwood each helped lay the bricks of a growing basketball identity through the 1980s and early 1990s. The wins were often hard-fought, and the records fluctuated, but each season brought the team closer to a cohesive culture.
          </p>
        <div className="md:float-left md:mr-6 mb-6 text-center w-full md:w-80 animate-fade-in">
          <img
          src="/images/first_team_1978.png"
          alt="1978-79 St. Andrew's Basketball Team"
          className="w-full h-auto rounded-lg shadow-md mb-2"
          />
          <p className="text-sm italic">1978-79 St. Andrew's first boys basketball team</p>
        </div>
          <p className="text-lg leading-relaxed mb-4 text-justify">
          The 1992–1993 season marked a major milestone when Coach Paul Hill led the Lions to their first state championship in program history, capturing the GISA AA title. That breakthrough season set a new standard for the program and sparked a sense of belief that St. Andrew’s could compete at the highest levels.
          </p>
        <div className="md:float-right md:ml-6 mb-6 text-center w-full md:w-52 animate-fade-in">
          <img
          src="/images/chris_haslem_1993.png"
          alt="Chris Haslem during the 1992-93 Championship Season"
          className="w-full h-auto rounded-lg shadow-md mb-2"
          />
          <p className="text-sm italic">Chris Haslem leading the Lions to their first state title in 1993</p>
        </div>
          <p className="text-lg leading-relaxed mb-4 text-justify">
          The mid-90s through early 2000s continued that momentum. Under Coach Frank Dickson, the Lions built a reputation for postseason grit, culminating in a 1998 SCISA AA State Championship. That success was followed by another title in 2004 under Coach Michael Bennett, further solidifying the Lions as a consistent contender. During this stretch, the team became known for its strong home-court presence, quick defense, and tournament resilience.
          </p>
          <p className="text-lg leading-relaxed mb-4 text-justify">
          A transitional period followed in the late 2000s and early 2010s under Coach Joe Thoni, who brought stability and steady leadership. While state titles remained elusive during this stretch, the Lions remained a competitive presence in SCISA and continued to develop the foundation of a strong, enduring program.
          </p>
        <div className="md:float-left md:mr-6 mb-6 text-center w-full md:w-80 animate-fade-in">
          <img
          src="/images/state_champions_2025.jpg"
          alt="2024-2025 State Championship Team"
          className="w-full h-auto rounded-lg shadow-md mb-2"
          />
          <p className="text-sm italic">The players, coaches, and cheerleaders of the 2024-2025 state championship team</p>
        </div>
          <p className="text-lg leading-relaxed mb-4 text-justify">
          The arrival of Coach Mel Abrams Jr. in 2015 ushered in the most dominant era in St. Andrew’s basketball history. With a focus on culture, accountability, and high-level competition, Coach Abrams led the Lions to three state championships (2022, 2023, and 2025), including back-to-back GIAA AAA titles. His teams have averaged over 18 wins per season, regularly advanced deep into the playoffs, and elevated the program into one of the premier forces in Georgia’s independent school ranks.
          </p>
          <p className="text-lg leading-relaxed mb-4 text-justify">
          Across 639 total wins, 16 region championships, and 6 state championships, the story of St. Andrew’s basketball is one of perseverance and pride. It’s a story of student-athletes and coaches who committed themselves to excellence on and off the court, carrying the banner of the Lions through triumphs and trials alike. As new seasons unfold, they add chapters to this proud legacy—one game at a time.
          </p>
        </div>
      </section>
    </>
  );
}

export default Home;
