# Requirements and implementation state

## Stage 1: Open-source developer toolkit
| ID | Requirement | Status |
| --- | --- | --- |
| FR-001 | Preserve TLV ordering, duplicate tags, and offsets | Implemented |
| FR-002 | Unicode code-point field lengths and UTF-8 byte offsets | Implemented |
| FR-003 | Template-aware nested parsing with bounded depth/input size | Preview implemented |
| FR-004 | CRC-16/CCITT-FALSE calculation/verification | Implemented |
| FR-005 | EMVCo mandatory/conditional field validation | Partial, structural preview |
| FR-006 | Versioned, verified CBSL/LANKAQR rules with source citations | Planned, blocked on complete specification review |
| FR-007 | CLI parse, validate structural preview, CRC and file input | Partial |
| FR-008 | QR test payload generator and PNG/SVG rendering | Planned |
| FR-009 | Public SDK publishing, batch validation and payload diffing | Planned |

## Stage 2: Authorized production integrations
Payment intents, approved merchant identification, bank-specific adapters, authenticated transaction confirmation, webhook replay protection and reconciliation remain **out of scope** until an authorized acquiring partner, sandbox documentation and compliance review are available.

## Acceptance principles
Tests must cover malformed inputs, Unicode and nesting, duplicate fields, CRC standard vectors, and negative cases. CI should pass on Linux, Windows and macOS. Never claim certification based solely on locally passing tests.
