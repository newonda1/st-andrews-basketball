const path = require("path");
const readline = require("readline");
const {
  describeGameRecord,
  getDefaultCsvPath,
  importGameChangerCsv,
  loadGameRecord,
  printImportSummary,
} = require("./lib/baseballGameChangerImport");

const PROJECT_ROOT = process.cwd();

function printUsage() {
  console.log("Usage:");
  console.log("node scripts/importSingleBaseballGameChanger.js <GameID> [csvPath] [--dry-run] [--yes]");
  console.log("node scripts/importSingleBaseballGameChanger.js [csvPath] --game <GameID> [--dry-run] [--yes]");
  console.log("node scripts/importSingleBaseballGameChanger.js");
}

function inferGameIdFromPath(filePath) {
  const base = path.basename(String(filePath || ""), path.extname(String(filePath || "")));
  return /^\d{8,}$/.test(base) ? base : "";
}

function parseArgs(argv) {
  const options = {
    gameId: "",
    filePath: "",
    dryRun: false,
    yes: false,
  };

  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--yes") {
      options.yes = true;
      continue;
    }

    if (arg === "--game") {
      options.gameId = argv[i + 1] || "";
      i += 1;
      continue;
    }

    if (arg === "--file") {
      options.filePath = argv[i + 1] || "";
      i += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    positionals.push(arg);
  }

  if (!options.gameId && positionals.length) {
    if (/^\d{8,}$/.test(positionals[0])) {
      options.gameId = positionals.shift();
    } else if (!options.filePath) {
      options.filePath = positionals.shift();
    }
  }

  if (!options.filePath && positionals.length) {
    options.filePath = positionals.shift();
  }

  if (!options.gameId && options.filePath) {
    options.gameId = inferGameIdFromPath(options.filePath);
  }

  if (!options.filePath && options.gameId) {
    options.filePath = path.relative(
      PROJECT_ROOT,
      getDefaultCsvPath(PROJECT_ROOT, options.gameId)
    );
  }

  return options;
}

function createQuestioner() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    ask(prompt) {
      return new Promise((resolve) => {
        rl.question(prompt, (answer) => resolve(answer.trim()));
      });
    },
    close() {
      rl.close();
    },
  };
}

async function promptForMissingValues(options) {
  if (!process.stdin.isTTY) {
    printUsage();
    process.exit(1);
  }

  const io = createQuestioner();

  try {
    let gameId = options.gameId;
    let filePath = options.filePath;

    if (!gameId) {
      const answer = await io.ask("GameID: ");
      gameId = answer;
    }

    const defaultPath = gameId
      ? path.relative(PROJECT_ROOT, getDefaultCsvPath(PROJECT_ROOT, gameId))
      : "";

    if (!filePath) {
      const answer = await io.ask(`CSV path [${defaultPath}]: `);
      filePath = answer || defaultPath;
    }

    return { ...options, gameId, filePath };
  } finally {
    io.close();
  }
}

async function confirmImport(gameId, filePath, dryRun) {
  if (!process.stdin.isTTY) return true;

  const io = createQuestioner();

  try {
    const gameRecord = loadGameRecord(PROJECT_ROOT, gameId);
    console.log(`Game: ${describeGameRecord(gameRecord)}`);
    console.log(`CSV file: ${path.relative(PROJECT_ROOT, path.resolve(PROJECT_ROOT, filePath))}`);
    if (dryRun) {
      console.log("Mode: dry run");
    }

    const answer = await io.ask("Proceed with import? [Y/n]: ");
    return answer === "" || /^y(es)?$/i.test(answer);
  } finally {
    io.close();
  }
}

async function main() {
  let options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  if (!options.gameId || !options.filePath) {
    options = await promptForMissingValues(options);
  }

  if (!options.gameId || !options.filePath) {
    printUsage();
    process.exit(1);
  }

  if (!options.yes) {
    const confirmed = await confirmImport(options.gameId, options.filePath, options.dryRun);
    if (!confirmed) {
      console.log("Import cancelled.");
      process.exit(0);
    }
  }

  const result = importGameChangerCsv({
    projectRoot: PROJECT_ROOT,
    gameId: options.gameId,
    filePath: options.filePath,
    write: !options.dryRun,
  });

  printImportSummary(result, { showPreview: true, showFullJson: false });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
