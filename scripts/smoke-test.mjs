import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const port = 3210;
const baseUrl = `http://127.0.0.1:${port}`;
const nextBin = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);
const server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
  cwd: new URL("..", import.meta.url),
  env: process.env,
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

async function waitUntilReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await fetch(`${baseUrl}/login`, { redirect: "manual" });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Next.js did not become ready.\n${serverOutput}`);
}

async function expectRoute(path, status, location) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  assert.equal(response.status, status, `${path} returned ${response.status}`);
  if (location) {
    assert.equal(
      response.headers.get("location"),
      location,
      `${path} redirected incorrectly`,
    );
  }
}

try {
  await waitUntilReady();

  await expectRoute("/", 307, "/login");
  await expectRoute("/login", 200);
  await expectRoute("/otp", 307, "/login?next=%2Fotp");
  await expectRoute("/onboarding", 307, "/login?next=%2Fonboarding");
  await expectRoute("/home", 307, "/login?next=%2Fhome");
  await expectRoute("/discover", 307, "/login?next=%2Fdiscover");
  await expectRoute("/profile", 307, "/login?next=%2Fprofile");
  await expectRoute("/shop", 307, "/login?next=%2Fshop");
  await expectRoute("/admin/shop", 307, "/login?next=%2Fadmin%2Fshop");

  const invalidRegistration = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: baseUrl,
    },
    body: JSON.stringify({
      email: "not-an-email",
      password: "short",
    }),
  });
  assert.equal(
    invalidRegistration.status,
    400,
    "Registration validation route failed",
  );

  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200, "Supabase health check failed");
  const healthBody = await health.json();
  assert.equal(healthBody.database, "connected");

  console.log(
    "Smoke test passed: password auth routes, registration validation, admin protection, and Supabase health.",
  );
} finally {
  server.kill();
}
