# lanka-qr-cli

Open-source developer toolkit for inspecting EMVCo merchant-presented payment QR payloads and, in future, validating Sri Lanka-specific LANKAQR requirements.

> **Developer preview:** Not certified by CBSL or LankaPay. Current functionality covers printable-ASCII TLV parsing and CRC verification only. It cannot authenticate merchants, confirm payments, or guarantee scheme compliance.

## Run locally

Requires Node.js 22+.

```bash
npm install
npm test
npm run build
npm run dev -- parse "00020153031445802LK"
npm run dev -- crc "123456789"
```

## Development stages
1. **Open-source toolkit:** byte-safe TLV parsing, EMVCo and verified CBSL rule profiles, diagnostics, QR rendering, typed SDK.
2. **Authorized payment integrations:** provider adapters, transaction status, reconciliation and security, gated on acquirer documentation, sandbox access and approval.

Read [requirements](docs/REQUIREMENTS.md), [roadmap](docs/ROADMAP.md), and [compliance boundaries](docs/COMPLIANCE.md).
