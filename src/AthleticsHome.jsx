import React from "react";
import { Link } from "react-router-dom";
import Footer from "./components/Footer";

const sports = [
  {
    name: "Boys Basketball",
    to: "/athletics/boys/basketball",
    icon: "/images/boys/basketball/boys_basketball_icon.png",
    accent: "text-blue-800",
    arrow: "text-blue-700",
  },
  {
    name: "Girls Basketball",
    to: "/athletics/girls/basketball",
    icon: "/images/girls/basketball/girls_basketball_icon.png",
    accent: "text-pink-800",
    arrow: "text-pink-700",
  },
  {
    name: "Boys Baseball",
    to: "/athletics/boys/baseball",
    icon: "/images/boys/baseball/boys_baseball_icon.png",
    accent: "text-blue-800",
    arrow: "text-blue-700",
  },
];

function AthleticsHome() {
  return (
    <>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <img
            src="/images/common/st_andrews_athletics_logo.png"
            alt="St. Andrew's Lions Athletics"
            className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto object-contain"
            loading="eager"
          />
        </header>

        <section className="max-w-3xl mx-auto mb-10">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-5 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-2">
              Historical Athletic Statistics
            </h1>
            <p className="text-gray-700 leading-relaxed">
              Select a sport below to view season results, team records,<br>player
              statistics, and historical program information.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {sports.map((sport, index) => (
              <Link
                key={sport.name}
                to={sport.to}
                className={`flex items-center gap-5 px-6 py-5 transition hover:bg-gray-50 ${
                  index !== sports.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <img
                  src={sport.icon}
                  alt={sport.name}
                  className="w-20 h-20 object-contain shrink-0"
                  loading="lazy"
                />

                <div className="flex-1 min-w-0">
                  <div className={`text-xl md:text-2xl font-semibold ${sport.accent}`}>
                    {sport.name}
                  </div>
                </div>

                <div
                  className={`text-sm md:text-base font-medium whitespace-nowrap ${sport.arrow}`}
                >
                  View Stats &rarr;
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

export default AthleticsHome;
