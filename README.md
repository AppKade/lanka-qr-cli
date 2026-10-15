<div align="center">

# 🇱🇰 LankaQR CLI

**Developer tools for understanding, inspecting, and testing Sri Lankan payment QR payloads.**

An open-source, offline-first TypeScript toolkit for EMVCo Merchant-Presented Mode (MPM) QR payload inspection, with a roadmap toward LANKAQR-specific validation and authorized payment integrations.

[![CI](https://github.com/AppKade/lanka-qr-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/AppKade/lanka-qr-cli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](package.json)
[![Status](https://img.shields.io/badge/status-early%20development-orange)](https://github.com/AppKade/lanka-qr-cli/issues)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Quick start](#quick-start) · [Features](#features) · [CLI examples](#cli-examples) · [Roadmap](#roadmap) · [Contributing](#contributing)

</div>

> [!IMPORTANT]
> **Early developer preview, not a certified LANKAQR implementation.** The current code provides basic printable-ASCII TLV parsing and CRC-16 calculation/verification. It does **not** yet enforce complete EMVCo or CBSL LANKAQR rules, generate payment-ready QR images, verify merchant identities, or process payments. CRC validity is **not proof of a safe QR or a successful payment**. This project is not affiliated with, endorsed by, or certified by CBSL, LankaPay, or EMVCo.

## Why this project?

Payment QR payloads are compact strings containing structured payment data. Developers integrating QR payments into POS systems, checkout flows, and test automation need to inspect these payloads, debug malformed fields, and verify checksums without relying on a live payment provider.

**LankaQR CLI aims to make that workflow simple and transparent**, starting with small, testable building blocks and expanding only when specification details have been verified.

## Features

| Capability | Status |
| --- | --- |
| Read top-level two-digit TLV tags, lengths, values, and offsets (printable ASCII only) | ✅ Available |
| Preserve duplicate top-level tags during parsing | ✅ Available |
| Calculate CRC-16/CCITT-FALSE | ✅ Available |
| Verify a final `63` CRC field and append a CRC programmatically | ✅ Available |
| Parse text or a local file from the CLI | ✅ Available |
| Unit tests and multi-OS GitHub Actions workflow | ✅ Configured |
| Byte-aware, Unicode-capable and nested-template parsing | 🔜 Planned |
| EMVCo field validation and versioned CBSL/LANKAQR profiles | 🔜 Planned |
| QR generation, image rendering, advanced diagnostics, and public SDK packaging | 🔜 Planned |
| Authorized acquiring-bank payment adapters and verified payment confirmation | 🔒 Later, partner-dependent |

**Legend:** Available means implemented in the source, not independently certified. Configured means the workflow is present; check the CI badge for its latest execution result.

## Quick start

**Prerequisites:** Node.js 22+ and npm.

```bash
git clone https://github.com/AppKade/lanka-qr-cli.git
cd lanka-qr-cli
npm install
npm test
npm run build
```

Run the CLI straight from source:

```bash
npm run dev -- --help
```

Or run the compiled binary after building:

```bash
node dist/cli.js --help
```

> [!NOTE]
> The package is currently marked `private` and is **not published to npm**. Use the repository locally for now. Commands and APIs may change before the first public release.

## CLI examples

**Inspect the structure of an illustrative test payload:**

```bash
npm run dev -- parse "00020153031445802LK"
```

Expected shape (shortened):

```json
{
  "nodes": [
    { "id": "00", "length": 2, "value": "01", "offset": 0 },
    { "id": "53", "length": 3, "value": "144", "offset": 6 },
    { "id": "58", "length": 2, "value": "LK", "offset": 13 }
  ],
  "crcValid": false
}
```

That string is **test data**, not a complete or payment-ready LANKAQR payload.

**Parse from a file:**

```bash
npm run dev -- parse --file ./sample.txt
```

**Calculate a CRC-16/CCITT-FALSE test vector:**

```bash
npm run dev -- crc "123456789"
# 29B1
```

**Verify a payload's final CRC field:**

```bash
npm run dev -- crc-verify "<payload>"
```

The command returns a non-zero exit code if the CRC check fails.

## Using the TypeScript core

The core functions are available in the source tree during development:

```ts
import { parseTlv, crc16, appendCrc, verifyCrc } from "./src/index.ts";

const nodes = parseTlv("00020153031445802LK");
const checksum = crc16("123456789"); // "29B1"
const payloadWithCrc = appendCrc("00020153031445802LK");
const isCrcValid = verifyCrc(payloadWithCrc); // true

console.log({ nodes, checksum, isCrcValid });
```

These are low-level utilities, not a production payment SDK.

## Roadmap

We are deliberately developing this in **two stages**:

### Stage 1: Open-source developer toolkit

1. **Specification traceability:** Verify the latest CBSL documents and applicable EMVCo MPM requirements, without guessing network-specific tag definitions. [Track progress](https://github.com/AppKade/lanka-qr-cli/issues/1).
2. **Robust parser:** Byte-safe field handling, nested templates, serializer, stricter error reporting, fuzz testing. [Track progress](https://github.com/AppKade/lanka-qr-cli/issues/2).
3. **Validation rules:** Layered EMVCo and LANKAQR validators with documented, versioned profiles. [Track progress](https://github.com/AppKade/lanka-qr-cli/issues/3).
4. **Developer tooling:** Rich CLI diagnostics, test-payload generation, terminal/PNG/SVG rendering, and a reusable TypeScript SDK. [Track progress](https://github.com/AppKade/lanka-qr-cli/issues/4).

### Stage 2: Verified payment integrations

Explore payment-provider adapters, approved merchant QR generation, authenticated transaction confirmation, and reconciliation **only with appropriate acquiring-partner documentation, sandbox access, and authorization**. [Track progress](https://github.com/AppKade/lanka-qr-cli/issues/5).

See the [full roadmap](docs/ROADMAP.md) and [requirements](docs/REQUIREMENTS.md).

## Specification and security boundaries

This project is intended to support standards-based development, but it must not be mistaken for an official payment product.

- [CBSL](https://www.cbsl.gov.lk/) provides applicable Sri Lankan payment regulations.
- [LankaPay](https://www.lankapay.net/) is responsible for relevant LANKAQR network arrangements.
- [EMVCo](https://www.emvco.com/emv-technologies/qr-codes/) publishes the underlying QR specifications.
- Network routing identifiers and live merchant configurations must not be fabricated.
- A valid checksum only checks payload integrity; it cannot validate merchant ownership or settlement.
- Never commit sensitive bank documents, merchant credentials, or customer financial data.

Read our [compliance notes](docs/COMPLIANCE.md) and [security policy](SECURITY.md).

## Development

```bash
npm test            # Run unit tests
npm run typecheck   # Type-check source
npm run build       # Compile TypeScript
npm run dev -- --help
```

The [CI workflow](.github/workflows/ci.yml) is configured for Ubuntu, Windows, and macOS. Please check the live badge above for the latest run result.

## Contributing

Contributions are welcome, especially standards references, carefully redacted test fixtures, parser edge cases, documentation improvements, and reproducible bug reports.

Before contributing, read [CONTRIBUTING.md](CONTRIBUTING.md). For security-sensitive reports, follow [SECURITY.md](SECURITY.md) rather than opening a public issue.

- [Open an issue](https://github.com/AppKade/lanka-qr-cli/issues/new)
- [Browse current tasks](https://github.com/AppKade/lanka-qr-cli/issues)
- [View pull requests](https://github.com/AppKade/lanka-qr-cli/pulls)

## License

Released under the [MIT License](LICENSE). Specifications, names, and third-party trademarks remain the property of their respective owners.

---

<div align="center">

Built and maintained in the open by [AppKade](https://github.com/AppKade).

**Made for developers building with Sri Lanka's payment ecosystem. 🇱🇰**

⭐ If the project helps your work, consider starring the repository.

</div>
