# XEXO Bot — v3

> by **yamisaint** | Telegram: [@saintbypass](https://t.me/saintbypass)  
> 📦 Shop: [t.me/sourcecodemarket666](https://t.me/sourcecodemarket666)  
> 💻 GitHub: [github.com/blackclover20007](https://github.com/blackclover20007)  
> 📡 WA Channel: [Join Here](https://whatsapp.com/channel/0029Vb9VrNQKbYMGK2la9F1q)

---

## Setup

```bash
npm install
node index.js
```

On first run with no session the bot prompts:

```
╔══════════════════════════════════════════╗
║       X E X O  —  Pairing Setup          ║
║           by yamisaint                   ║
╠══════════════════════════════════════════╣
║  Enter your WhatsApp number              ║
║  Format : country code + digits          ║
║  Example: 263714373922                   ║
╚══════════════════════════════════════════╝
  Number:
```

Enter your number (country code + digits, no `+` or spaces).  
WhatsApp → Settings → Linked Devices → Link a Device → Link with phone number → enter the code shown.

When connected, the bot sends the owner (263784970429) a picture notification with all links.

---

## config.js reference

| Key | Default | Notes |
|-----|---------|-------|
| `BOT_NAME` | `"XEXO"` | Display name |
| `OWNER_NAME` | `"yamisaint"` | Shown in menus and status |
| `OWNER_NUMBER` | `"263784970429"` | Gets the connect notification |
| `PAIRING_NUMBER` | `""` | Blank = interactive prompt |
| `USE_PAIRING_CODE` | `true` | false = QR fallback |
| `OWNERS` | `["263784970429"]` | Only these numbers can run commands |
| `PREFIX` | `"."` | Command prefix |
| `SESSION_DIR` | `"./auth_xeon"` | Auth session folder |
| `CONNECT_PIC` | image URL | Sent to owner on every connect |

---

## Commands

### Targeting
```
.target 263714373922        set default target
.target                     show current target
```

### Crash Payloads (DM)
```
.crashfinity [number]       payment-msg unicode bomb
.crashjam    [number]       text burst × 5 rounds
.stickercrash [number]      malformed sticker burst × 6
.vcardbomb   [number]       200-contact vCard OOM
.audioloop   [number]       infinite-decode voice note × 8
.pollnuke    [number]       500-option poll layout crash × 4
```

`[number]` is optional if a default target is set.

### Group Payloads
```
.gcfreeze 120363...@g.us [rounds]    list/text/button flood (default 8 rounds)
```

### Utils
```
.ping       latency check + bot name
.status     owner · target · prefix · uptime
.menu       full command menu with owner links
```

---

## Payload Details

| Command | Technique | Primary Effect |
|---------|-----------|----------------|
| `crashfinity` | `requestPaymentMessage` + 1500-char unicode body | Render crash on payment card |
| `crashjam` | `extendedTextMessage` × 5, 800× Javanese combining | Layout engine stall |
| `stickercrash` | Malformed `documentMessage`, bad hash, 6 concurrent relays | Media pipeline OOM |
| `vcardbomb` | `contactsArrayMessage`, 200 vCards × 4 KB poison PHOTO blob | Contact thumbnail OOM / ANR |
| `audioloop` | `audioMessage`, `seconds=INT32_MAX`, noise data, 8 bursts | Decode loop CPU lock |
| `pollnuke` | `pollCreationMessage`, 500 options × 2 KB poison, 4 bursts | Poll layout ANR |
| `gcfreeze` | list + text + buttons × 8 rounds, 24 concurrent relays/round | Group client freeze |

---

## File Structure

```
xexo-whatsapp-bot/
├── index.js                 main bot + command router
├── config.js                settings + owner info
├── package.json
├── README.md
└── payloads/
    ├── crashfinity.js
    ├── crashjam.js
    ├── stickerCrash.js
    ├── groupFreeze.js
    ├── vcardBomb.js
    ├── audioLoop.js
    └── pollNuke.js
```

---

## Requirements

- Node.js >= 18
- `npm install` installs: `@whiskeysockets/baileys`, `pino`, `qrcode-terminal`

---

> XEXO Bot — coded by yamisaint  
> 📲 [@saintbypass](https://t.me/saintbypass) · [sourcecodemarket666](https://t.me/sourcecodemarket666) · [blackclover20007](https://github.com/blackclover20007)
