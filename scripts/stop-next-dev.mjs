import { readFile, rm } from "node:fs/promises";
import path from "node:path";

const lockPath = path.join(process.cwd(), ".next", "dev", "lock");

async function removeLockFile() {
  try {
    await rm(lockPath);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
      return;
    }
    throw err;
  }
}

async function main() {
  let lockRaw;
  try {
    lockRaw = await readFile(lockPath, "utf8");
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
      console.log("No Next dev server lock found.");
      return;
    }
    throw err;
  }

  let lock;
  try {
    lock = JSON.parse(lockRaw);
  } catch {
    console.warn("Could not parse .next/dev/lock; removing it.");
    await removeLockFile();
    return;
  }

  const pid = lock?.pid;
  const port = lock?.port;
  if (typeof pid !== "number") {
    console.log("No PID found in .next/dev/lock; removing it.");
    await removeLockFile();
    return;
  }

  try {
    process.kill(pid, 0);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ESRCH") {
      console.log(`No process found for PID ${pid}; removing lock.`);
      await removeLockFile();
      return;
    }
    throw err;
  }

  console.log(`Stopping Next dev server PID ${pid}${typeof port === "number" ? ` (port ${port})` : ""}...`);
  try {
    process.kill(pid, "SIGTERM");
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ESRCH") {
      await removeLockFile();
      return;
    }
    throw err;
  }

  // Wait briefly for the process to exit.
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    try {
      process.kill(pid, 0);
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "ESRCH") {
        break;
      }
      throw err;
    }
  }

  // If it is still alive, force kill.
  try {
    process.kill(pid, 0);
    console.warn(`PID ${pid} still running; sending SIGKILL...`);
    process.kill(pid, "SIGKILL");
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code !== "ESRCH") {
      throw err;
    }
  }

  await removeLockFile();
  console.log("Stopped.");
}

await main();