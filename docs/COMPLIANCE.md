# Compliance boundary and specification tracker

**Current status: NOT CERTIFIED.** This repository is an experimental developer tool, not an operational payment system.

Primary documents to review in full:
- CBSL Payment and Settlement Systems Circular 02 of 2026 and Annex 1.
- CBSL June 2026 Addendum 1.
- Applicable EMVCo Merchant-Presented Mode specification.
- LankaPay network-specific allocation, merchant templates and branding documents from authorized sources.
- Partner-issued redacted fixtures and sandbox test vectors.

For each implementation rule record: ID, profile version, field path, constraint, source URL and section, verification status, fixture references.

Unverified until source review: merchant account tags 26/27, nested IDs/GUID, P2P MCC, additional data, fee fields, reference label and amount limitations. Do not hardcode unconfirmed routing assumptions.

CRC protects integrity against accidental corruption. It does NOT authenticate a merchant, prove that a QR is safe, or confirm a payment.
