export const SWIMMING_EVENT_ORDER = [
  "200 Yard Medley Relay",
  "200 Yard Freestyle",
  "200 Yard IM",
  "50 Yard Freestyle",
  "100 Yard Butterfly",
  "100 Yard Freestyle",
  "500 Yard Freestyle",
  "200 Yard Freestyle Relay",
  "100 Yard Backstroke",
  "100 Yard Breaststroke",
  "400 Yard Freestyle Relay",
];

const GENDER_ORDER = {
  Girls: 0,
  Boys: 1,
};

export function formatSwimDate(value) {
  if (!value) return "TBD";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getSwimSeasonLabel(seasonOrId) {
  if (seasonOrId && typeof seasonOrId === "object" && seasonOrId.SeasonLabel) {
    return seasonOrId.SeasonLabel;
  }

  const seasonId = Number(
    seasonOrId && typeof seasonOrId === "object" ? seasonOrId.SeasonID : seasonOrId
  );

  if (!Number.isFinite(seasonId)) return String(seasonOrId ?? "Unknown Season");

  return `Winter ${seasonId}`;
}

export function buildSwimPlayerMap(players = []) {
  return new Map((players || []).map((player) => [String(player.PlayerID), player]));
}

export function resolveSwimAthleteName(entry, playerMap = new Map()) {
  if (entry?.PlayerID != null) {
    const player = playerMap.get(String(entry.PlayerID));
    if (player) {
      return `${player.FirstName || ""} ${player.LastName || ""}`.trim();
    }
  }

  return entry?.AthleteName || "St. Andrew's Relay Team";
}

export function sortSwimEventNames(a, b) {
  const aIndex = SWIMMING_EVENT_ORDER.indexOf(a);
  const bIndex = SWIMMING_EVENT_ORDER.indexOf(b);

  if (aIndex !== -1 || bIndex !== -1) {
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }

  return String(a || "").localeCompare(String(b || ""));
}

function parseRelayAthleteNames(value) {
  if (!value || !String(value).includes("/")) return [];

  return String(value)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function buildSwimRoster(entries = [], playerMap = new Map()) {
  const rosterMap = new Map();

  const addAthleteEvent = (name, event) => {
    if (!name || name === "St. Andrew's Relay Team") return;

    if (!rosterMap.has(name)) {
      rosterMap.set(name, {
        athleteName: name,
        events: new Set(),
      });
    }

    if (event) {
      rosterMap.get(name).events.add(event);
    }
  };

  (entries || []).forEach((entry) => {
    if (!entry?.Event) return;

    if (entry.PlayerID != null) {
      addAthleteEvent(resolveSwimAthleteName(entry, playerMap), entry.Event);
      return;
    }

    const relayNames = parseRelayAthleteNames(entry.AthleteName);

    if (relayNames.length) {
      relayNames.forEach((name) => addAthleteEvent(name, entry.Event));
      return;
    }

    addAthleteEvent(entry.AthleteName, entry.Event);
  });

  return Array.from(rosterMap.values())
    .map((entry) => ({
      athleteName: entry.athleteName,
      events: Array.from(entry.events).sort(sortSwimEventNames),
    }))
    .sort((a, b) => a.athleteName.localeCompare(b.athleteName));
}

export function sortSwimResults(entries = [], playerMap = new Map()) {
  return (entries || []).slice().sort((a, b) => {
    const genderDiff =
      (GENDER_ORDER[a?.Gender] ?? 99) - (GENDER_ORDER[b?.Gender] ?? 99);
    if (genderDiff !== 0) return genderDiff;

    const eventDiff = sortSwimEventNames(a?.Event, b?.Event);
    if (eventDiff !== 0) return eventDiff;

    const athleteDiff = resolveSwimAthleteName(a, playerMap).localeCompare(
      resolveSwimAthleteName(b, playerMap)
    );
    if (athleteDiff !== 0) return athleteDiff;

    return String(a?.Place || "").localeCompare(String(b?.Place || ""));
  });
}

export function buildSwimSeasonList(seasons = [], meets = []) {
  const seasonMap = new Map();

  (seasons || []).forEach((season) => {
    seasonMap.set(String(season.SeasonID), season);
  });

  (meets || []).forEach((meet) => {
    const key = String(meet.Season);
    if (!seasonMap.has(key)) {
      seasonMap.set(key, {
        SeasonID: meet.Season,
        SeasonLabel: getSwimSeasonLabel(meet.Season),
      });
    }
  });

  return Array.from(seasonMap.values()).sort(
    (a, b) => Number(b.SeasonID) - Number(a.SeasonID)
  );
}
