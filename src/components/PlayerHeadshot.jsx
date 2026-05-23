import React, { useEffect, useMemo, useState } from "react";

const SPORT_IMAGE_BASES = {
  "boys-baseball": "/images/boys/baseball/players",
  "boys-basketball": "/images/boys/basketball/players",
  football: "/images/boys/football/players",
  "girls-basketball": "/images/girls/basketball/players",
};

function initialsForName(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export function buildPlayerHeadshotSources(playerId, { sportKey = "", gender = "", src = "" } = {}) {
  if (!playerId) return [];

  const sportImageBase = SPORT_IMAGE_BASES[sportKey];
  const fallbackBases =
    gender === "Girls"
      ? [SPORT_IMAGE_BASES["girls-basketball"]]
      : [
          SPORT_IMAGE_BASES["boys-basketball"],
          SPORT_IMAGE_BASES.football,
          SPORT_IMAGE_BASES["boys-baseball"],
        ];

  return [
    `/images/athletes/players/${playerId}.png`,
    `/images/athletes/players/${playerId}.jpg`,
    `/images/athletes/players/${playerId}.jpeg`,
    src,
    sportImageBase ? `${sportImageBase}/${playerId}.jpg` : "",
    ...fallbackBases.map((base) => `${base}/${playerId}.jpg`),
  ].filter((value, index, values) => value && values.indexOf(value) === index);
}

export default function PlayerHeadshot({
  playerId,
  name = "",
  sportKey = "",
  gender = "",
  src = "",
  fallbackSrc = "",
  className = "",
  fallbackClassName = "",
  loading = "lazy",
}) {
  const sources = useMemo(
    () => buildPlayerHeadshotSources(playerId, { sportKey, gender, src }),
    [gender, playerId, sportKey, src]
  );
  const [imageIndex, setImageIndex] = useState(0);
  const currentSrc = sources[imageIndex] || "";
  const fallbackInitials = initialsForName(name);
  const finalFallbackClassName = fallbackClassName || className;

  useEffect(() => {
    setImageIndex(0);
  }, [sources]);

  if (currentSrc) {
    return (
      <img
        src={currentSrc}
        alt={name}
        className={className}
        loading={loading}
        onError={() => setImageIndex((index) => index + 1)}
      />
    );
  }

  if (fallbackSrc) {
    return (
      <img
        src={fallbackSrc}
        alt=""
        className={finalFallbackClassName}
        loading={loading}
      />
    );
  }

  return (
    <div
      className={`${finalFallbackClassName} flex items-center justify-center bg-slate-900 text-xs font-semibold text-white`}
      aria-label={name}
      role="img"
    >
      {fallbackInitials}
    </div>
  );
}
