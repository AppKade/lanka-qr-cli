# Development roadmap

1. **Specification registry:** Obtain CBSL March 2026 Circular 02, June 2026 Addendum 1, relevant EMVCo MPM edition and authorized network details. Map rules to fields and evidence.
2. **Parser/CRC core:** Byte-safe parsing, serialization, nested templates, verified CRC vectors, fuzz testing.
3. **Validation:** Versioned EMVCo and LANKAQR rule profiles, diagnostics, independently verified fixtures.
4. **CLI and rendering:** Parse, validate, inspect, generate synthetic test QR, render terminal/PNG/SVG, JSON output.
5. **Developer beta:** Stable SDK, documentation, examples, cross-platform CI and npm release.
6. **Production discovery:** Authorized acquiring partner, sandbox access, network documentation, compliance assessment.
7. **First payment adapter:** Provider-approved QR issuance, verified confirmation, idempotency, reconciliation and controlled pilot.

Do not proceed to Stage 2 live operations until partner authorization, security checks and applicable regulatory reviews are complete.
