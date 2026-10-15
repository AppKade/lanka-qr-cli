import { parseTlv } from './tlv.ts';
/** CRC-16/CCITT-FALSE, poly 0x1021, init 0xFFFF, no reflection, xorout 0. */
export function crc16(input: string): string {
  let crc=0xffff;
  for (const byte of Buffer.from(input,'utf8')) {
    crc ^= byte<<8;
    for (let i=0;i<8;i++) crc = (crc & 0x8000) ? ((crc<<1)^0x1021)&0xffff : (crc<<1)&0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4,'0');
}
export function appendCrc(input: string): string {
  if (parseTlv(input).some(n=>n.id==='63')) throw new Error('Input already contains a CRC tag');
  const prefix=input+'6304'; return prefix+crc16(prefix);
}
export function verifyCrc(payload: string): boolean {
  const nodes=parseTlv(payload), last=nodes.at(-1);
  if (!last || last.id!=='63' || last.length!==4 || !/^[0-9a-fA-F]{4}$/.test(last.value)) return false;
  if (nodes.filter(n=>n.id==='63').length!==1) return false;
  return crc16(payload.slice(0,last.offset+4))===last.value.toUpperCase();
}
