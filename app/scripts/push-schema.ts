/**
 * Push database schema with automatic responses to prompts
 */

import { spawn } from "child_process";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const proc = spawn("npx", ["drizzle-kit", "push"], {
  stdio: ["pipe", "inherit", "inherit"],
  env: process.env,
});

// Wait a bit for the prompt to appear, then send 'c' and Enter
setTimeout(() => {
  proc.stdin?.write("c\n");
}, 3000);

// Send another 'c' for any subsequent prompts
setTimeout(() => {
  proc.stdin?.write("c\n");
}, 5000);

proc.on("close", (code) => {
  console.log(`\nSchema push completed with code ${code}`);
  process.exit(code ?? 0);
});

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  proc.kill();
  process.exit(0);
});
