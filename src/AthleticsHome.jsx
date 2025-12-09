import React from "react";
import { Link } from "react-router-dom";

function AthleticsHome() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-blue-800">
          St. Andrew&apos;s Athletics
        </h1>
        <p className="text-gray-700">
          Choose a program to view schedules, results, and stats.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Boys Basketball card */}
        <Link
          to="/athletics/boys/basketball"
          className="border rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition transform bg-white flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              Boys Basketball
            </h2>
            <p className="text-gray-700 text-sm">
              View the full boys basketball site, including seasons, records,
              and game details.
            </p>
          </div>
          <div className="mt-4 text-sm font-medium text-blue-700">
            View boys basketball &rarr;
          </div>
        </Link>

        {/* Girls Basketball card */}
        <Link
          to="/athletics/girls/basketball"
          className="border rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition transform bg-white flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold text-pink-800 mb-2">
              Girls Basketball
            </h2>
            <p className="text-gray-700 text-sm">
              The girls basketball stats site is under construction. We&apos;re
              starting with the current season.
            </p>
          </div>
          <div className="mt-4 text-sm font-medium text-pink-700">
            Open girls basketball &rarr;
          </div>
        </Link>
      </div>
    </div>
  );
}

export default AthleticsHome;
