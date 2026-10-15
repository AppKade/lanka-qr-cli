#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {parseTlv} from './tlv.ts';
import {crc16,verifyCrc} from './crc.ts';
const [command,...args]=process.argv.slice(2);
function help() { console.log('lanka-qr preview (NOT a certified LANKAQR validator)\nUsage: lanka-qr parse <payload> | parse --file <path> | crc <text> | crc-verify <payload>'); }
try {
  if (!command || ['help','--help','-h'].includes(command)) help();
  else {
    const file=args.indexOf('--file');
    const payload=file>=0 ? readFileSync(args[file+1]??'','utf8').trim() : args.find(v=>!v.startsWith('--'));
    if (!payload) throw new Error('Payload or --file is required');
    if (command==='parse') console.log(JSON.stringify({nodes:parseTlv(payload),crcValid:verifyCrc(payload),note:'Structure and CRC only, not CBSL compliance or merchant verification'},null,2));
    else if (command==='crc') console.log(crc16(payload));
    else if (command==='crc-verify') { const ok=verifyCrc(payload);console.log(ok?'CRC valid':'CRC invalid');if(!ok)process.exitCode=1; }
    else {help();process.exitCode=2;}
  }
} catch(e) {console.error(e instanceof Error?e.message:String(e));process.exitCode=1;}
