export const TRACK_EVENT_ORDER = [
  "55 Meter Dash",
  "60 Meter Dash",
  "100 Meter Dash",
  "200 Meter Dash",
  "400 Meter Dash",
  "800 Meter Run",
  "1600 Meter Run",
  "3200 Meter Run",
  "100 Meter Hurdles",
  "110 Meter Hurdles",
  "400 Meter Hurdles",
  "300 Meter Hurdles",
  "4x100 Meter Relay",
  "4x400 Meter Relay",
  "4x800 Meter Relay",
  "Long Jump",
  "Triple Jump",
  "High Jump",
  "Pole Vault",
  "Shot Put",
  "Discus",
  "Javelin",
];

const GENDER_ORDER = {
  Girls: 0,
  Boys: 1,
};

export function formatTrackDate(value) {
  if (!value) return "TBD";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTrackDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "TBD";
  if (startDate && endDate) {
    return `${formatTrackDate(startDate)} - ${formatTrackDate(endDate)}`;
  }
  return formatTrackDate(startDate || endDate);
}

export function getTrackSeasonLabel(seasonOrId) {
  if (seasonOrId && typeof seasonOrId === "object" && seasonOrId.SeasonLabel) {
    return seasonOrId.SeasonLabel;
  }

  const seasonId = Number(
    seasonOrId && typeof seasonOrId === "object" ? seasonOrId.SeasonID : seasonOrId
  );

  if (!Number.isFinite(seasonId)) return String(seasonOrId ?? "Unknown Season");

  return `Spring ${seasonId}`;
}

export function buildTrackPlayerMap(players = []) {
  return new Map((players || []).map((player) => [String(player.PlayerID), player]));
}

export function resolveTrackAthleteName(entry, playerMap = new Map()) {
  if (entry?.PlayerID != null) {
    const player = playerMap.get(String(entry.PlayerID));
    if (player) {
      return `${player.FirstName || ""} ${player.LastName || ""}`.trim();
    }
  }

  return entry?.AthleteName || "St. Andrew's Relay Team";
}

export function sortTrackEventNames(a, b) {
  const aIndex = TRACK_EVENT_ORDER.indexOf(a);
  const bIndex = TRACK_EVENT_ORDER.indexOf(b);

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

export function buildTrackRoster(entries = [], playerMap = new Map()) {
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
      addAthleteEvent(resolveTrackAthleteName(entry, playerMap), entry.Event);
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
      events: Array.from(entry.events).sort(sortTrackEventNames),
    }))
    .sort((a, b) => a.athleteName.localeCompare(b.athleteName));
}

export function sortTrackResults(entries = [], playerMap = new Map()) {
  return (entries || []).slice().sort((a, b) => {
    const genderDiff =
      (GENDER_ORDER[a?.Gender] ?? 99) - (GENDER_ORDER[b?.Gender] ?? 99);
    if (genderDiff !== 0) return genderDiff;

    const eventDiff = sortTrackEventNames(a?.Event, b?.Event);
    if (eventDiff !== 0) return eventDiff;

    const athleteDiff = resolveTrackAthleteName(a, playerMap).localeCompare(
      resolveTrackAthleteName(b, playerMap)
    );
    if (athleteDiff !== 0) return athleteDiff;

    const roundDiff = String(a?.Round || "").localeCompare(String(b?.Round || ""));
    if (roundDiff !== 0) return roundDiff;

    return String(a?.Heat || "").localeCompare(String(b?.Heat || ""));
  });
}

export function buildTrackSeasonList(seasons = [], meets = []) {
  const seasonMap = new Map();

  (seasons || []).forEach((season) => {
    seasonMap.set(String(season.SeasonID), season);
  });

  (meets || []).forEach((meet) => {
    const key = String(meet.Season);
    if (!seasonMap.has(key)) {
      seasonMap.set(key, {
        SeasonID: meet.Season,
        SeasonLabel: getTrackSeasonLabel(meet.Season),
      });
    }
  });

  return Array.from(seasonMap.values()).sort(
    (a, b) => Number(b.SeasonID) - Number(a.SeasonID)
  );
}
