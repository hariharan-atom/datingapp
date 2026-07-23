import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const REQUEST_TIMEOUT_MS = 20_000;

function fetchWithTimeout(input, init = {}) {
  return fetch(input, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

async function runStep(label, action) {
  console.log(`→ ${label}`);
  const result = await action();
  console.log(`✓ ${label}`);
  return result;
}

function loadEnvFile() {
  const source = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

loadEnvFile();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert(url && anonKey && serviceRoleKey, "Supabase environment is required.");

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: fetchWithTimeout },
});
const anon = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: fetchWithTimeout },
});
const port = 3211;
const baseUrl = `http://127.0.0.1:${port}`;
const password = `Atom-${crypto.randomUUID()}!`;
const marker = crypto.randomUUID().slice(0, 8);
const createdUserIds = [];

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
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(
        `Next.js exited before becoming ready (code ${server.exitCode}).\n${serverOutput}`,
      );
    }
    try {
      const response = await fetch(`${baseUrl}/icon.svg`, {
        signal: AbortSignal.timeout(2_000),
      });
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Next.js did not become ready.\n${serverOutput}`);
}

async function createMember(name, suffix) {
  const email = `codex-social-${marker}-${suffix}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  assert.ifError(error);
  assert(data.user);
  createdUserIds.push(data.user.id);

  const { error: profileError } = await admin.from("profiles").upsert({
    user_id: data.user.id,
    display_name: name,
    birth_date: "1998-05-10",
    gender: suffix === "a" ? "woman" : "man",
    bio: `${name} is testing the real friend discovery flow.`,
    occupation: "Product designer",
    education: "University",
    languages: ["English", "Tamil"],
    relationship_goal: "long_term",
    is_discoverable: true,
    profile_score: 82,
  });
  assert.ifError(profileError);
  const { error: userError } = await admin
    .from("users")
    .update({
      onboarding_complete: true,
      is_active: true,
      last_active_at: new Date().toISOString(),
    })
    .eq("id", data.user.id);
  assert.ifError(userError);

  const { data: session, error: signInError } =
    await anon.auth.signInWithPassword({ email, password });
  assert.ifError(signInError);
  assert(session.session);
  return { id: data.user.id, token: session.session.access_token };
}

async function api(path, token, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const body = await response.json();
  assert(
    response.ok,
    `${init.method ?? "GET"} ${path} failed (${response.status}): ${JSON.stringify(body)}`,
  );
  return body;
}

async function stopServer() {
  if (server.exitCode !== null) return;

  const exited = new Promise((resolve) => {
    server.once("exit", () => resolve(true));
  });
  server.kill();
  const stopped = await Promise.race([
    exited,
    new Promise((resolve) => setTimeout(() => resolve(false), 5_000)),
  ]);
  if (!stopped && server.exitCode === null) server.kill("SIGKILL");
  server.stdout.destroy();
  server.stderr.destroy();
  server.unref();
}

try {
  await runStep("Start the production server", waitUntilReady);
  const memberA = await runStep("Create member A", () =>
    createMember("Test Anika", "a"),
  );
  const memberB = await runStep("Create member B", () =>
    createMember("Test Vihaan", "b"),
  );

  const discoveryA = await runStep("Load discovery for member A", () =>
    api("/api/profiles/discovery", memberA.token),
  );
  const discoveryB = await runStep("Load discovery for member B", () =>
    api("/api/profiles/discovery", memberB.token),
  );
  assert(
    discoveryA.profiles.some((profile) => profile.id === memberB.id),
    "Member B was not published to member A.",
  );
  assert(
    discoveryB.profiles.some((profile) => profile.id === memberA.id),
    "Member A was not published to member B.",
  );
  assert(
    !discoveryA.profiles.some((profile) => profile.id === memberA.id),
    "A member discovered their own profile.",
  );

  const firstLike = await runStep("Save the first like", () =>
    api(`/api/profiles/${memberB.id}/action`, memberA.token, {
      method: "POST",
      body: JSON.stringify({ action: "like" }),
    }),
  );
  assert.equal(firstLike.matched, false, "One-sided like created a match.");

  const mutualLike = await runStep("Create a mutual match", () =>
    api(`/api/profiles/${memberA.id}/action`, memberB.token, {
      method: "POST",
      body: JSON.stringify({ action: "like" }),
    }),
  );
  assert.equal(
    mutualLike.matched,
    true,
    "Mutual likes did not create a match.",
  );
  assert(mutualLike.chatId, "Mutual match did not create a chat.");

  const chatsA = await runStep("Load member A conversations", () =>
    api("/api/chats", memberA.token),
  );
  const chatsB = await runStep("Load member B conversations", () =>
    api("/api/chats", memberB.token),
  );
  assert(
    chatsA.conversations.some(
      (chat) => chat.id === mutualLike.chatId && chat.profile.id === memberB.id,
    ),
    "Member A cannot see the new match conversation.",
  );
  assert(
    chatsB.conversations.some(
      (chat) => chat.id === mutualLike.chatId && chat.profile.id === memberA.id,
    ),
    "Member B cannot see the new match conversation.",
  );

  const sent = await runStep("Persist a chat message", () =>
    api(`/api/chats/${mutualLike.chatId}`, memberB.token, {
      method: "POST",
      body: JSON.stringify({ body: "Hello from the social integration test." }),
    }),
  );
  assert.equal(sent.message.sender, "me");
  const chatA = await runStep("Read the message as its recipient", () =>
    api(`/api/chats/${mutualLike.chatId}`, memberA.token),
  );
  assert(
    chatA.chat.messages.some(
      (message) =>
        message.sender === "them" &&
        message.body === "Hello from the social integration test.",
    ),
    "The recipient could not read the persisted message.",
  );

  const notificationsA = await runStep("Load recipient notifications", () =>
    api("/api/notifications", memberA.token),
  );
  assert(
    notificationsA.notifications.some(
      (notification) =>
        notification.type === "message" &&
        notification.href === `/messages/${mutualLike.chatId}`,
    ),
    "Message notification was not delivered.",
  );
  const currentProfile = await runStep("Load the signed-in profile", () =>
    api("/api/profiles/me", memberA.token),
  );
  assert.equal(
    currentProfile.profile.id,
    memberA.id,
    "Profile page returned another member.",
  );

  console.log(
    "Social integration passed: account publication, isolated profiles, mutual matching, chat, persisted messages, and notifications.",
  );
} finally {
  for (const userId of createdUserIds) {
    try {
      await admin.auth.admin.deleteUser(userId);
    } catch (error) {
      console.error(`Could not remove integration user ${userId}:`, error);
    }
  }
  await stopServer();
}
