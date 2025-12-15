import React from "react";
import { Link } from "react-router-dom";

function AthleticsHome() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-blue-800">
          St. Andrew&apos;s Athletics
        </h1>
        <p className="text-gray-700">
          Choose a program to view schedules, results, and stats.
        </p>
      </header>

      {/* Main tiles */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Boys Basketball tile */}
        <Link
          to="/athletics/boys/basketball"
          className="border rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition transform bg-white flex flex-col justify-between"
        >
          <div className="flex items-start gap-4">
            <img
              src="/images/boys/basketball/boys_basketball_icon.png"
              alt="Boys Basketball"
              className="w-20 h-20 object-contain shrink-0"
              loading="lazy"
            />
            <div>
              <h2 className="text-xl font-semibold text-blue-800 mb-2">
                Boys Basketball
              </h2>
              <p className="text-gray-700 text-sm">
                View the full boys basketball site, including seasons, records,
                and game details.
              </p>
            </div>
          </div>

          <div className="mt-4 text-sm font-medium text-blue-700">
            View boys basketball &rarr;
          </div>
        </Link>

        {/* Girls Basketball tile */}
        <Link
          to="/athletics/girls/basketball"
          className="border rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition transform bg-white flex flex-col justify-between"
        >
          <div className="flex items-start gap-4">
            <img
              src="/images/girls/basketball/girls_basketball_icon.png"
              alt="Girls Basketball"
              className="w-20 h-20 object-contain shrink-0"
              loading="lazy"
            />
            <div>
              <h2 className="text-xl font-semibold text-pink-800 mb-2">
                Girls Basketball
              </h2>
              <p className="text-gray-700 text-sm">
                Explore the girls basketball program, including schedules,
                results, and player statistics.
              </p>
            </div>
          </div>

          <div className="mt-4 text-sm font-medium text-pink-700">
            View girls basketball &rarr;
          </div>
        </Link>
      </div>
    </div>
  );
}

export default AthleticsHome;
