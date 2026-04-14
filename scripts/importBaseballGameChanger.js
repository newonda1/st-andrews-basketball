const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { importGameChangerCsv, printImportSummary } = require("./lib/baseballGameChangerImport");

const PROJECT_ROOT = process.cwd();

// ===== GET ARGUMENTS =====
const rawArgs = process.argv.slice(2);
const dryRun = rawArgs.includes("--dry-run");
const args = rawArgs.filter((arg) => arg !== "--dry-run");

if (args.length === 1 && /^\d{4}$/.test(args[0])) {
  const yearPrefix = args[0];
  const importDir = path.join(PROJECT_ROOT, "imports/baseball/gamechanger");

  if (!fs.existsSync(importDir)) {
    console.log(`Import folder not found: ${importDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(importDir)
    .filter((name) => name.startsWith(yearPrefix) && name.toLowerCase().endsWith(".csv"))
    .sort();

  if (!files.length) {
    console.log(`No CSV files found in imports/baseball/gamechanger for year prefix ${yearPrefix}.`);
    process.exit(1);
  }

  console.log(`Found ${files.length} file(s) for ${yearPrefix}:\n`);
  files.forEach((file) => console.log(`- ${file}`));
  console.log("");

  for (const file of files) {
    const currentGameId = path.basename(file, path.extname(file));
    const relativeFilePath = `imports/baseball/gamechanger/${file}`;

    console.log(`\n=== Importing ${currentGameId} ===\n`);

    const result = spawnSync(
      process.execPath,
      [__filename, currentGameId, relativeFilePath, ...(dryRun ? ["--dry-run"] : [])],
      {
        cwd: PROJECT_ROOT,
        stdio: "inherit",
      }
    );

    if (result.status !== 0) {
      console.log(`\nBatch import stopped on ${file}.`);
      process.exit(result.status || 1);
    }
  }

  console.log(`\nBatch import complete for ${files.length} file(s) starting with ${yearPrefix}.`);
  process.exit(0);
}

const [gameId, filePath] = args;

if (!gameId || !filePath) {
  console.log("Usage:");
  console.log("Single game: node scripts/importBaseballGameChanger.js <GameID> <csvPath> [--dry-run]");
  console.log("Batch by year: node scripts/importBaseballGameChanger.js <YYYY> [--dry-run]");
  process.exit(1);
}
try {
  const result = importGameChangerCsv({
    projectRoot: PROJECT_ROOT,
    gameId,
    filePath,
    write: !dryRun,
  });

  printImportSummary(result, { showPreview: true, showFullJson: true });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
