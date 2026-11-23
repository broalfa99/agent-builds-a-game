// agent-builds-a-game — make.fun video-on-X entry
// The entry itself is the X post: a short vertical video about an AI coding
// agent building a tiny browser game ("Rocket Dodge") from one prompt.
// This program is the only thing the grader runs. It hands the post's
// address to the house by copying POST.json into the output directory.
//
// Run it locally the same way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// (Node 22, standard library only — nothing to install, no network.)

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const POST_FILE = "POST.json";

function fail(message: string): never {
  console.error(`agent-builds-a-game: ${message}`);
  process.exit(1);
}

const postPath = join(BOT_DIR, POST_FILE);
if (!existsSync(postPath)) {
  fail(`no ${POST_FILE} found in ${BOT_DIR}`);
}

// Read it first so a malformed file fails loudly instead of being copied blind.
let post: unknown;
try {
  post = JSON.parse(readFileSync(postPath, "utf8"));
} catch (err) {
  fail(`${POST_FILE} is not valid JSON: ${(err as Error).message}`);
}

const url = (post as { url?: unknown } | null)?.url;
if (
  typeof url !== "string" ||
  url.includes("<") ||
  url.includes(">") ||
  !/^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/\w+\/status\/\d+$/.test(url)
) {
  fail(`${POST_FILE} does not hold an X post address yet — replace the placeholder first`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(postPath, join(OUTPUT_DIR, POST_FILE));
} catch (err) {
  fail(`could not copy ${POST_FILE} to ${OUTPUT_DIR}: ${(err as Error).message}`);
}

console.log(`agent-builds-a-game: handed in ${url}`);
