#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseTlv } from './tlv.ts';
import { crc16, verifyCrc } from './crc.ts';
import { validateStructure } from './validate.ts';

const [command, ...rest] = process.argv.slice(2);
function help(): void {
  console.log(`lanka-qr preview | NOT a CBSL-certified or payment-ready tool
Usage:
  lanka-qr parse <payload>
  lanka-qr parse --file <path>
  lanka-qr validate <payload>
  lanka-qr crc <text>
  lanka-qr crc-verify <payload>
  lanka-qr --help`);
}
try {
  if (!command || ['--help', 'help', '-h'].includes(command)) { help(); process.exit(0); }
  const fileIndex = rest.indexOf('--file');
  if (fileIndex !== -1 && (!rest[fileIndex + 1] || rest[fileIndex+1].startsWith('--'))) throw new Error('--file requires a path');
  const raw = fileIndex >= 0 ? readFileSync(rest[fileIndex + 1], 'utf8').replace(/\r?\n$/, '') : rest.find(x=>!x.startsWith('--'));
  if (!raw) throw new Error('Payload or --file argument is required');
  if (command === 'parse') console.log(JSON.stringify({nodes: parseTlv(raw), note:'TLV decoding only, not full LANKAQR compliance'}, null, 2));
  else if (command === 'validate') {
    const result = validateStructure(raw);
    console.log(JSON.stringify(result, null, 2));
    if (!result.valid) process.exitCode = 1;
  } else if (command === 'crc') console.log(crc16(raw));
  else if (command === 'crc-verify') {
    const valid = verifyCrc(raw);
    console.log(valid ? 'CRC valid' : 'CRC invalid');
    if (!valid) process.exitCode = 1;
  } else { help(); process.exitCode=2; }
} catch (err) { console.error(err instanceof Error ? err.message : String(err)); process.exitCode=1; }
