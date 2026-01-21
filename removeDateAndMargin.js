// removeDateAndMargin.js
// One-off script to strip Date and ResultMargin from boys' games.json

const fs = require("fs");
const path = require("path");

// Adjust this if your path is different, but this matches what you've told me:
const filePath = path.join(
  __dirname,
  "public",
  "data",
  "boys",
  "basketball",
  "games.json"
);

console.log("Reading:", filePath);

const raw = fs.readFileSync(filePath, "utf8");
const games = JSON.parse(raw);

if (!Array.isArray(games)) {
  throw new Error("Expected games.json to contain an array of games.");
}

const cleaned = games.map((game) => {
  // Remove Date and ResultMargin, keep everything else
  const { Date, ResultMargin, ...rest } = game; // eslint-disable-line no-unused-vars
  return rest;
});

fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2));
console.log(
  `Wrote ${cleaned.length} games back to games.json without Date/ResultMargin.`
);