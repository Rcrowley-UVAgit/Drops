// Supabase Edge Function: send-drop-notification
// Sends push notifications to group members when someone drops a song.
// Supports both APNs (iOS native) and Web Push (PWA).
//
// Required Supabase secrets:
//   VAPID_PUBLIC_KEY   — from `npx web-push generate-vapid-keys`
//   VAPID_PRIVATE_KEY  — from `npx web-push generate-vapid-keys`
//   APNS_KEY_ID        — (optional) from Apple Developer > Keys
//   APNS_TEAM_ID       — (optional) your Apple Developer Team ID
//   APNS_PRIVATE_KEY   — (optional) contents of the .p8 file
//   SUPABASE_SERVICE_ROLE_KEY — auto-provided by Supabase

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── APNs config (optional, for native iOS) ──────────────────

const APNS_KEY_ID = Deno.env.get("APNS_KEY_ID") || "";
const APNS_TEAM_ID = Deno.env.get("APNS_TEAM_ID") || "";
const APNS_PRIVATE_KEY = Deno.env.get("APNS_PRIVATE_KEY") || "";
const BUNDLE_ID = "com.revinyl.drops";
const APNS_HOST = Deno.env.get("APNS_SANDBOX") === "true"
  ? "api.sandbox.push.apple.com"
  : "api.push.apple.com";
const HAS_APNS = Boolean(APNS_KEY_ID && APNS_TEAM_ID && APNS_PRIVATE_KEY);

// ─── VAPID config (for web push) ─────────────────────────────

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = "mailto:hello@revinyl.app";
const HAS_VAPID = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

// ─── Helpers ─────────────────────────────────────────────────

function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

// ─── APNs JWT ────────────────────────────────────────────────

async function createApnsJwt(): Promise<string> {
  const pemContents = APNS_PRIVATE_KEY
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const keyData = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8", keyData,
    { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"],
  );

  const encodeJson = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const headerB64 = encodeJson({ alg: "ES256", kid: APNS_KEY_ID });
  const payloadB64 = encodeJson({ iss: APNS_TEAM_ID, iat: Math.floor(Date.now() / 1000) });
  const signingInput = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

// ─── Send APNs push ──────────────────────────────────────────

async function sendApnsPush(
  token: string, title: string, body: string, data: Record<string, string>,
) {
  const jwt = await createApnsJwt();
  const payload = { aps: { alert: { title, body }, sound: "default", badge: 1 }, ...data };

  const response = await fetch(`https://${APNS_HOST}/3/device/${token}`, {
    method: "POST",
    headers: {
      authorization: `bearer ${jwt}`,
      "apns-topic": BUNDLE_ID,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`APNs error for ${token.slice(0, 8)}...: ${response.status} ${err}`);
    if (response.status === 410) return { token, status: "expired" as const };
  }
  return { token, status: response.ok ? "sent" as const : "failed" as const };
}

// ─── VAPID JWT for Web Push ──────────────────────────────────

async function createVapidJwt(audience: string): Promise<string> {
  const keyData = base64UrlDecode(VAPID_PRIVATE_KEY);
  const key = await crypto.subtle.importKey(
    "pkcs8", keyData,
    { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"],
  ).catch(() => {
    // If pkcs8 fails, try raw import (32 bytes)
    return crypto.subtle.importKey(
      "raw", keyData,
      { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"],
    );
  }).catch(async () => {
    // Try JWK import as last resort
    const jwk = {
      kty: "EC", crv: "P-256",
      d: VAPID_PRIVATE_KEY,
      x: "", y: "",
    };
    // Extract x,y from public key
    const pubBytes = base64UrlDecode(VAPID_PUBLIC_KEY);
    if (pubBytes.length === 65 && pubBytes[0] === 0x04) {
      jwk.x = base64UrlEncode(pubBytes.slice(1, 33));
      jwk.y = base64UrlEncode(pubBytes.slice(33, 65));
    }
    return crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  });

  const encodeJson = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const header = encodeJson({ typ: "JWT", alg: "ES256" });
  const payload = encodeJson({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: VAPID_SUBJECT,
  });

  const signingInput = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

// ─── Web Push encryption (RFC 8291) ──────────────────────────

async function encryptPayload(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payloadText: string,
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const clientPublicKey = base64UrlDecode(subscription.keys.p256dh);
  const clientAuth = base64UrlDecode(subscription.keys.auth);

  // Generate server ECDH key pair
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"],
  );

  const serverPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", serverKeyPair.publicKey),
  );

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    "raw", clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" }, false, [],
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientKey }, serverKeyPair.privateKey, 256,
    ),
  );

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF helpers
  async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
    const key = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return new Uint8Array(await crypto.subtle.sign("HMAC", key, ikm));
  }

  async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
    const key = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const infoWithCounter = new Uint8Array([...info, 1]);
    const result = new Uint8Array(await crypto.subtle.sign("HMAC", key, infoWithCounter));
    return result.slice(0, length);
  }

  const encoder = new TextEncoder();

  // Build info strings per RFC 8291
  function createInfo(type: string, clientPub: Uint8Array, serverPub: Uint8Array): Uint8Array {
    const label = encoder.encode(`Content-Encoding: ${type}\0`);
    const contextP256 = encoder.encode("P-256\0");
    const clientLen = new Uint8Array([0, clientPub.length]);
    const serverLen = new Uint8Array([0, serverPub.length]);
    return new Uint8Array([
      ...label, ...contextP256,
      ...clientLen, ...clientPub,
      ...serverLen, ...serverPub,
    ]);
  }

  // Auth info
  const authInfo = encoder.encode("Content-Encoding: auth\0");

  // IKM from auth secret
  const authPrk = await hkdfExtract(clientAuth, sharedSecret);
  const ikm = await hkdfExpand(authPrk, authInfo, 32);

  // PRK from salt
  const prk = await hkdfExtract(salt, ikm);

  // Content encryption key
  const cekInfo = createInfo("aes128gcm", clientPublicKey, serverPublicKeyRaw);
  const cek = await hkdfExpand(prk, cekInfo, 16);

  // Nonce
  const nonceInfo = createInfo("nonce", clientPublicKey, serverPublicKeyRaw);
  const nonce = await hkdfExpand(prk, nonceInfo, 12);

  // Pad and encrypt payload
  const paddedPayload = new Uint8Array([...encoder.encode(payloadText), 2]); // delimiter
  const encKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, encKey, paddedPayload),
  );

  // Build aes128gcm record: salt(16) + rs(4) + idlen(1) + keyid(65) + ciphertext
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096);
  const idLen = new Uint8Array([serverPublicKeyRaw.length]);

  const encrypted = new Uint8Array([
    ...salt, ...rs, ...idLen, ...serverPublicKeyRaw, ...ciphertext,
  ]);

  return { encrypted, salt, serverPublicKey: serverPublicKeyRaw };
}

// ─── Send Web Push ───────────────────────────────────────────

async function sendWebPush(
  subscriptionJson: string, title: string, body: string, data: Record<string, string>,
) {
  try {
    const subscription = JSON.parse(subscriptionJson);
    const endpoint = subscription.endpoint;
    const audience = new URL(endpoint).origin;

    const jwt = await createVapidJwt(audience);
    const payload = JSON.stringify({ title, body, url: `/group/${data.groupId}` });

    const { encrypted } = await encryptPayload(subscription, payload);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        "TTL": "86400",
        "Urgency": "high",
      },
      body: encrypted,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Web push error: ${response.status} ${err}`);
      if (response.status === 410 || response.status === 404) {
        return { token: subscriptionJson, status: "expired" as const };
      }
      return { token: subscriptionJson, status: "failed" as const };
    }

    return { token: subscriptionJson, status: "sent" as const };
  } catch (err) {
    console.error(`Web push exception: ${err.message}`);
    return { token: subscriptionJson, status: "failed" as const };
  }
}

// ─── Edge Function Handler ───────────────────────────────────

Deno.serve(async (req) => {
  try {
    const { drop_id, group_id, user_id, song_title, song_artist } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get the dropper's name
    const { data: dropper } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user_id)
      .single();

    const dropperName = dropper?.display_name || "Someone";

    // Get all group members except the dropper
    const { data: members } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", group_id)
      .neq("user_id", user_id);

    if (!members || members.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const memberIds = members.map((m) => m.user_id);

    // Get ALL device tokens (both ios and web)
    const { data: tokens } = await supabase
      .from("device_tokens")
      .select("token, user_id, platform")
      .in("user_id", memberIds);

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no_tokens" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const title = "ReVinyl";
    const body = `${dropperName} just dropped ${song_title} by ${song_artist}`;
    const pushData = { groupId: group_id, dropId: drop_id };

    // Send to each platform
    const results = await Promise.all(
      tokens.map((t) => {
        if (t.platform === "ios" && HAS_APNS) {
          return sendApnsPush(t.token, title, body, pushData);
        }
        if (t.platform === "web" && HAS_VAPID) {
          return sendWebPush(t.token, title, body, pushData);
        }
        return { token: t.token, status: "skipped" as const };
      }),
    );

    // Clean up expired tokens
    const expiredTokens = results
      .filter((r) => r.status === "expired")
      .map((r) => r.token);

    if (expiredTokens.length > 0) {
      await supabase
        .from("device_tokens")
        .delete()
        .in("token", expiredTokens);
    }

    const sent = results.filter((r) => r.status === "sent").length;

    return new Response(
      JSON.stringify({ sent, total: tokens.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("send-drop-notification error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
