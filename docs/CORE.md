# Core parser and validation semantics

## Implementation status
This milestone implements a Unicode-aware TLV reader/serializer, recognized nested template parsing, CRC-16/CCITT-FALSE and a **structural preview** validator. It is not a complete EMVCo compliance validator and cannot attest to CBSL/LankaPay compliance.

## Field lengths
EMVCo MPM's two-digit length represents the number of Unicode characters in the value (not UTF-8 byte count). Node's UTF-16 `string.length` is not the correct count for non-BMP characters; the parser uses `Array.from(value).length`. Byte offsets are retained separately for diagnostics. CRC is calculated over UTF-8 bytes of the original string.

See EMVCo MPM requirements sections 1.4.3, 4.4 and 4.7.3:
https://www.emvco.com/emv-technologies/qr-codes/

## Template recognition
The preview parses nested TLV under root template IDs 26-51, 62, 64, and 80-99. It does not interpret bank-specific subfields or guarantee that all identifiers in these ranges are valid for a given scheme. Unknown primitive fields remain opaque. Template depth is bounded.

## Limitations and security
- Only a handful of structural EMVCo checks are implemented. `valid: true` means **structural preview only**.
- Merchant name, country, currency, MCC, merchant account routing, fees, references, and CBSL-specific rules remain unverified.
- The parser accepts up to 8192 UTF-8 bytes by default for inspection (this is an implementation safety limit, not a scheme maximum).
- Neither a structurally valid payload nor a valid CRC establishes authenticity or confirmed payment.
- Unpaired Unicode surrogates are rejected to prevent silent lossy encoding.
