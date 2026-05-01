export const CROSS_COUNTRY_EVENT_ORDER = [
  "One Mile Run",
  "3200 Meter Run",
  "Two Mile Run",
  "5K Run",
];

const GENDER_ORDER = {
  Girls: 0,
  Boys: 1,
};

export const CROSS_COUNTRY_DIVISIONS = [
  { key: "high-school", label: "High School" },
  { key: "middle-school", label: "Middle School" },
];

const DIVISION_ORDER = {
  "high-school": 0,
  "middle-school": 1,
};

export function formatCrossCountryDate(value) {
  if (!value) return "TBD";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getCrossCountrySeasonLabel(seasonOrId) {
  if (
    seasonOrId &&
    typeof seasonOrId === "object" &&
    seasonOrId.SeasonLabel
  ) {
    return seasonOrId.SeasonLabel;
  }

  const seasonId = Number(
    seasonOrId && typeof seasonOrId === "object"
      ? seasonOrId.SeasonID
      : seasonOrId
  );

  if (!Number.isFinite(seasonId)) {
    return String(seasonOrId ?? "Unknown Season");
  }

  return `${seasonId - 1}-${String(seasonId).slice(-2)}`;
}

export function buildCrossCountryPlayerMap(players = []) {
  return new Map((players || []).map((player) => [String(player.PlayerID), player]));
}

export function resolveCrossCountryAthleteName(entry, playerMap = new Map()) {
  if (entry?.PlayerID != null) {
    const player = playerMap.get(String(entry.PlayerID));
    if (player) {
      return `${player.FirstName || ""} ${player.LastName || ""}`.trim();
    }
  }

  return entry?.AthleteName || "St. Andrew's Runner";
}

export function cleanCrossCountryRaceLabel(value) {
  const label = String(value || "").trim();
  if (!label) return "Results";

  return label.replace(/^\d+(?:st|nd|rd|th)\s+/i, "").trim() || label;
}

export function getCrossCountryDivision(entry, meet) {
  const storedDivision = String(entry?.Division || "").trim().toLowerCase();
  const level = String(meet?.Level || "").trim().toLowerCase();
  const meetType = String(meet?.MeetType || "").trim().toLowerCase();
  const race = String(entry?.Race || "").trim().toLowerCase();
  const meetName = String(meet?.Name || "").trim().toLowerCase();

  if (storedDivision.includes("middle")) {
    return "middle-school";
  }

  if (
    storedDivision.includes("high") ||
    storedDivision.includes("varsity") ||
    storedDivision === "hs"
  ) {
    return "high-school";
  }

  if (
    level === "middle school" ||
    meetType === "middle school" ||
    /\b(ms|middle school)\b/.test(race) ||
    /\b(ms|middle school)\b/.test(meetName)
  ) {
    return "middle-school";
  }

  return "high-school";
}

export function getCrossCountryDivisionLabel(division) {
  return (
    CROSS_COUNTRY_DIVISIONS.find((entry) => entry.key === division)?.label ||
    "High School"
  );
}

export function sortCrossCountryDivisions(a, b) {
  return (DIVISION_ORDER[a] ?? 99) - (DIVISION_ORDER[b] ?? 99);
}

export function parseCrossCountryTime(mark) {
  if (!mark) return null;

  const value = String(mark).trim().replace(/[a-zA-Z]+$/, "");
  const parts = value.split(":").map((part) => Number(part));

  if (parts.some((part) => !Number.isFinite(part))) return null;

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];

  return null;
}

export function parseCrossCountryPlace(place) {
  const match = String(place || "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function sortCrossCountryEventNames(a, b) {
  const aIndex = CROSS_COUNTRY_EVENT_ORDER.indexOf(a);
  const bIndex = CROSS_COUNTRY_EVENT_ORDER.indexOf(b);

  if (aIndex !== -1 || bIndex !== -1) {
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }

  return String(a || "").localeCompare(String(b || ""));
}

export function buildCrossCountryRoster(entries = [], playerMap = new Map()) {
  const rosterMap = new Map();

  (entries || []).forEach((entry) => {
    const athleteName = resolveCrossCountryAthleteName(entry, playerMap);
    if (!athleteName) return;

    if (!rosterMap.has(athleteName)) {
      rosterMap.set(athleteName, {
        athleteName,
        events: new Set(),
        races: new Set(),
      });
    }

    const rosterEntry = rosterMap.get(athleteName);
    if (entry?.Event) rosterEntry.events.add(entry.Event);
    if (entry?.Race) rosterEntry.races.add(cleanCrossCountryRaceLabel(entry.Race));
  });

  return Array.from(rosterMap.values())
    .map((entry) => ({
      athleteName: entry.athleteName,
      events: Array.from(entry.events).sort(sortCrossCountryEventNames),
      races: Array.from(entry.races).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.athleteName.localeCompare(b.athleteName));
}

export function sortCrossCountryResults(entries = [], playerMap = new Map()) {
  return (entries || []).slice().sort((a, b) => {
    const genderDiff =
      (GENDER_ORDER[a?.Gender] ?? 99) - (GENDER_ORDER[b?.Gender] ?? 99);
    if (genderDiff !== 0) return genderDiff;

    const eventDiff = sortCrossCountryEventNames(a?.Event, b?.Event);
    if (eventDiff !== 0) return eventDiff;

    const aPlace = parseCrossCountryPlace(a?.Place);
    const bPlace = parseCrossCountryPlace(b?.Place);
    if (aPlace != null || bPlace != null) {
      if (aPlace == null) return 1;
      if (bPlace == null) return -1;
      if (aPlace !== bPlace) return aPlace - bPlace;
    }

    const aTime = parseCrossCountryTime(a?.Mark);
    const bTime = parseCrossCountryTime(b?.Mark);
    if (aTime != null || bTime != null) {
      if (aTime == null) return 1;
      if (bTime == null) return -1;
      if (aTime !== bTime) return aTime - bTime;
    }

    return resolveCrossCountryAthleteName(a, playerMap).localeCompare(
      resolveCrossCountryAthleteName(b, playerMap)
    );
  });
}

export function buildCrossCountrySeasonList(seasons = [], meets = []) {
  const seasonMap = new Map();

  (seasons || []).forEach((season) => {
    seasonMap.set(String(season.SeasonID), season);
  });

  (meets || []).forEach((meet) => {
    const key = String(meet.Season);
    if (!seasonMap.has(key)) {
      seasonMap.set(key, {
        SeasonID: meet.Season,
        SeasonLabel: getCrossCountrySeasonLabel(meet.Season),
      });
    }
  });

  return Array.from(seasonMap.values()).sort(
    (a, b) => Number(b.SeasonID) - Number(a.SeasonID)
  );
}
