# Requirements (planning)

## Stage 1: open-source developer toolkit
- FR-001 P0: Read TLV payload preserving original tag order, duplicate tags and offsets.
- FR-002 P0: Support specification-correct byte lengths and non-ASCII encodings (preview intentionally supports ASCII only).
- FR-003 P0: Template-aware nested parsing with bounded depth and input size.
- FR-004 P0: Calculate and validate CRC-16/CCITT-FALSE over the complete payload through 6304.
- FR-005 P0: Validate EMVCo MPM mandatory/conditional fields with stable diagnostic codes.
- FR-006 P0: Versioned CBSL/LANKAQR rules; each rule linked to an authoritative source and test.
- FR-007 P0: CLI for parsing, inspection, validation, checksum and file input; machine-readable JSON.
- FR-008 P1: Deterministic serializer and synthetic QR payload generator, terminal/SVG/PNG output.
- FR-009 P1: Typed SDK, batch validation and QR payload diffing.

## Nonfunctional
- Offline-first and stateless. No authentication, accounts, payment service, database or secrets for Stage 1.
- No ambiguous claims of compliance or merchant authenticity.
- Test on Windows, macOS and Linux; target >=90% core branch coverage plus fuzz tests.
- Profile versioning independent of package semver, traceable rule provenance, input limits.

## Stage 2: authorized production integrations (gated)
- PAY-001: Acquirer-issued merchant identifiers and approved QR template.
- PAY-002: Explicit provider capability contract; never assume a uniform LankaPay API.
- PAY-003: Payment intents, unique references and safe status transitions.
- PAY-004: Confirm payments via authenticated provider response/event only, never QR scan alone.
- PAY-005: Idempotent endpoints, webhook deduplication, replay prevention and expiry handling.
- PAY-006: Reconciliation, auditability, redacted logs and secure secrets.
- PAY-007: Partner sandbox, UAT, compliance and security review before go-live.
- PAY-008 P1: Provider-supported refunds/reversals and optional merchant reporting.

Out of scope without separate approval: wallets, custody, issuing merchant identities, payment switching, and independent processing.
