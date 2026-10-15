/** EMVCo-style ID-Length-Value parser. Lengths count Unicode characters, not UTF-8 bytes.
 * CRC separately operates on UTF-8 bytes. Validation of scheme-specific fields is separate.
 */
export interface TlvNode {
  id: string;
  length: number;
  value: string;
  /** Byte offset in the UTF-8 encoded input, for diagnostics. */
  offset: number;
  /** Zero-based Unicode code-point offset. */
  characterOffset: number;
  /** Parsed children only for recognized EMVCo template ranges. */
  children?: TlvNode[];
}
export interface ParseOptions {
  /** Decode supported template data objects recursively. Default: true. */
  nested?: boolean;
  /** Maximum permitted nesting depth; default 8. */
  maxDepth?: number;
  /** Maximum UTF-8 payload size; default 8192 bytes. */
  maxBytes?: number;
}
export class TlvParseError extends Error {
  readonly offset: number;
  constructor(message: string, offset: number) {
    super(`${message} at UTF-8 byte offset ${offset}`);
    this.offset = offset;
    this.name = 'TlvParseError';
  }
}
function isTemplate(id: string): boolean {
  const num = Number(id);
  return (num >= 26 && num <= 51) || id === '62' || id === '64' || (num >= 80 && num <= 99);
}
function parseNodes(value: string, startByte: number, startCharacter: number, depth: number, nested: boolean, maxDepth: number): TlvNode[] {
  const chars = Array.from(value);
  const result: TlvNode[] = [];
  let pos = 0, byteOffset = startByte;
  while (pos < chars.length) {
    const currentOffset = byteOffset;
    if (chars.length - pos < 4) throw new TlvParseError('Incomplete TLV header', currentOffset);
    const id = chars.slice(pos, pos + 2).join('');
    const lenText = chars.slice(pos + 2, pos + 4).join('');
    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(lenText)) throw new TlvParseError('ID and length must each be two digits', currentOffset);
    const length = Number(lenText);
    if (length === 0) throw new TlvParseError('Zero-length data objects are not supported', currentOffset);
    if (pos + 4 + length > chars.length) throw new TlvParseError('Declared value exceeds input length', currentOffset);
    const rawValue = chars.slice(pos + 4, pos + 4 + length).join('');
    const node: TlvNode = { id, length, value: rawValue, offset: currentOffset, characterOffset: startCharacter + pos };
    if (nested && isTemplate(id)) {
      if (depth >= maxDepth) throw new TlvParseError('Maximum TLV template nesting depth exceeded', currentOffset);
      node.children = parseNodes(rawValue, currentOffset + 4, startCharacter + pos + 4, depth + 1, nested, maxDepth);
    }
    result.push(node);
    const rawField = chars.slice(pos, pos + 4 + length).join('');
    byteOffset += Buffer.byteLength(rawField, 'utf8');
    pos += 4 + length;
  }
  return result;
}
export function parseTlv(input: string, options: ParseOptions = {}): TlvNode[] {
  const maxBytes = options.maxBytes ?? 8192;
  const maxDepth = options.maxDepth ?? 8;
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) throw new RangeError('maxBytes must be positive');
  if (!Number.isSafeInteger(maxDepth) || maxDepth < 0) throw new RangeError('maxDepth must be nonnegative');
  if (Buffer.byteLength(input, 'utf8') > maxBytes) throw new TlvParseError('Input exceeds maximum byte size', 0);
  // Node's encoder silently replaces unpaired surrogates; forbid lossy CRC roundtrips.
  if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(input)) {
    throw new TlvParseError('Input contains an unpaired Unicode surrogate', 0);
  }
  return parseNodes(input, 0, 0, 0, options.nested ?? true, maxDepth);
}
export type SerializableNode = { id: string; value?: string; children?: SerializableNode[] };
export function serializeTlv(nodes: readonly SerializableNode[]): string {
  return nodes.map(node => {
    if (!/^\d{2}$/.test(node.id)) throw new Error('A TLV ID must be exactly two digits');
    if (node.value !== undefined && node.children !== undefined && serializeTlv(node.children) !== node.value) throw new Error(`Tag ${node.id}: value does not match serialized children`);
    const value = node.children !== undefined ? serializeTlv(node.children) : node.value;
    if (value === undefined) throw new Error(`Tag ${node.id}: value is required`);
    const len = Array.from(value).length;
    if (len < 1 || len > 99) throw new Error(`Tag ${node.id}: length must be between 1 and 99 characters`);
    if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value)) throw new Error('Unpaired surrogate is not supported');
    return node.id + String(len).padStart(2, '0') + value;
  }).join('');
}
