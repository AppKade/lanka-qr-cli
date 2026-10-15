# Implementation status

This is an **experimental developer toolkit**, not CBSL or LankaPay-certified software.

## Implemented
- TLV parsing, serialization and CRC-16/CCITT-FALSE checks with Unicode support.
- Preview structural validation.
- Partial EMVCo baseline checks for mandatory root fields, merchant account presence, MCC, currency format, amount format, country and merchant labels.
- `lankaqr-basic` adds the widely established local currency `144` and country `LK` checks. It deliberately does NOT validate LankaPay merchant routing or all national scheme rules.
- Synthetic demo payload generator uses `example.org` as the account-identifier namespace. It is NOT a real LankaPay merchant identity.
- Terminal/SVG/PNG QR rendering from an existing string.

## Usage
```bash
npm install
npm test && npm run build
npm run dev -- generate --config examples/test-merchant.json --out sample.txt
npm run dev -- validate --file sample.txt --profile lankaqr-basic
npm run dev -- render --file sample.txt --format svg --out sample.svg
npm run dev -- render --file sample.txt --format png --out sample.png
```

## Not supported yet
- Bank-approved production merchant identifiers and payment issuance.
- Complete EMVCo conditional rules and scheme-specific templates.
- Authoritative CBSL 2026 Annex + June addendum traceability and certification.
- Payment processing, payment-status confirmation, refunds, settlement or authentication.

References: https://www.emvco.com/emv-technologies/qr-codes/ and https://www.cbsl.gov.lk/en/node/20119 and https://www.cbsl.gov.lk/en/node/20562.
