#!/usr/bin/env node

process.argv.splice(2, 0, "--sport", "boys");
require("./auditBasketballArchive");
