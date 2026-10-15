/** ASCII-only TLV parser preview. Does not handle nested templates or Unicode. */
export interface TlvNode { id: string; length: number; value: string; offset: number }
export class TlvParseError extends Error {
  constructor(message: string, readonly offset: number) { super(`${message} at byte offset ${offset}`); this.name = 'TlvParseError'; }
}
export function parseTlv(input: string): TlvNode[] {
  if (!/^[\x20-\x7E]*$/.test(input)) throw new TlvParseError('Only printable ASCII is supported in this preview', 0);
  if (Buffer.byteLength(input, 'utf8') > 8192) throw new TlvParseError('Input exceeds 8192 bytes', 0);
  const nodes: TlvNode[] = [];
  for (let pos=0; pos<input.length;) {
    if (input.length-pos < 4) throw new TlvParseError('Incomplete tag header',pos);
    const id=input.slice(pos,pos+2), lenText=input.slice(pos+2,pos+4);
    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(lenText)) throw new TlvParseError('Tag and length must be two digits',pos);
    const length=Number(lenText), start=pos+4;
    if (start+length > input.length) throw new TlvParseError('Value exceeds payload boundary',pos);
    nodes.push({id,length,value:input.slice(start,start+length),offset:pos});
    pos=start+length;
  }
  return nodes;
}
