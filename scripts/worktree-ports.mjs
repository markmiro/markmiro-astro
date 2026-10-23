// One dev port per git worktree, so several checkouts can run at once.
//
// Each worktree gets a small integer "slot": the main checkout is 0 and keeps
// the base port; every other worktree adds its slot to it. Slots are handed out
// on first use and remembered in a JSON file inside the shared `.git`
// directory, which every worktree of a repo can see and git never tracks.
// Entries whose directory is gone are dropped the next time a slot is
// allocated, so stale worktrees do not push the numbers up.
//
// Plain ESM with no dependencies, so `astro.config.mjs` can import it and
// `pnpm ports` can run it directly.

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Slot 0's dev port. Each project has its own base so projects don't collide. */
export const BASE_PORT = 8791;

const REGISTRY_FILE = "markmiro-astro-worktree-slots.json";

function git(args, cwd) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function readRegistry(path) {
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    if (
      parsed.version === 1 &&
      parsed.slots &&
      typeof parsed.slots === "object"
    ) {
      return { version: 1, slots: parsed.slots };
    }
  } catch {
    // Missing or unreadable: start over. Slots only need to be stable while
    // the file exists; a fresh file just hands the running worktrees new ones.
  }
  return { version: 1, slots: {} };
}

function writeRegistry(path, registry) {
  mkdirSync(dirname(path), { recursive: true });
  // Write-then-rename so a reader never sees a half-written file.
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(registry, null, 2) + "\n");
  renameSync(tmp, path);
}

/**
 * The slot of the worktree containing `cwd`: 0 for the main checkout (or
 * anything that is not a git worktree), otherwise a stable small integer
 * unique among this repo's live worktrees.
 */
export function worktreeSlot(cwd = process.cwd()) {
  const root = git(["rev-parse", "--show-toplevel"], cwd);
  const commonDir = git(
    ["rev-parse", "--path-format=absolute", "--git-common-dir"],
    cwd,
  );
  if (!root || !commonDir || dirname(commonDir) === root) return 0;

  const registryPath = join(commonDir, REGISTRY_FILE);
  const registry = readRegistry(registryPath);
  const existing = registry.slots[root];
  if (existing !== undefined) return existing;

  const live = Object.entries(registry.slots).filter(([dir]) =>
    existsSync(dir),
  );
  const taken = new Set(live.map(([, slot]) => slot));
  let slot = 1;
  while (taken.has(slot)) slot += 1;

  try {
    writeRegistry(registryPath, {
      version: 1,
      slots: { ...Object.fromEntries(live), [root]: slot },
    });
  } catch {
    // Read-only `.git` (unusual): the slot still works for this process, it
    // just will not be remembered.
  }
  return slot;
}

export function worktreePorts(cwd = process.cwd()) {
  const slot = worktreeSlot(cwd);
  return { slot, dev: BASE_PORT + slot };
}

// `pnpm ports`: show the plan for the current worktree.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { slot, dev } = worktreePorts();
  console.log(
    [
      `slot ${slot}${slot === 0 ? "  (main checkout)" : ""}`,
      `dev  ${dev}   pnpm dev`,
    ].join("\n"),
  );
}
