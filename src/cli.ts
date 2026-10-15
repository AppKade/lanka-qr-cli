#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { parseTlv } from './tlv.ts';
import { crc16, verifyCrc } from './crc.ts';
import { validateStructure } from './validate.ts';
import { validateRules, type RuleProfile } from './rules.ts';
import { generateTestPayload, type TestPayloadOptions } from './generate.ts';
import { renderQr, type OutputFormat } from './render.ts';
function help() {
  console.log(`lanka-qr | experimental developer toolkit, NOT certified for real payments
Usage:
  lanka-qr parse <payload> | parse --file <path>
  lanka-qr validate <payload> [--profile emvco-baseline|lankaqr-basic]
  lanka-qr generate --config test-merchant.json [--out payload.txt]
  lanka-qr render <payload> --format terminal|svg|png [--out qr.svg|qr.png]
  lanka-qr crc <text>
  lanka-qr crc-verify <payload>
Note: Generated merchant identifiers are synthetic and not valid for live payment acceptance.`);
}
const args=process.argv.slice(2),command=args[0],rest=args.slice(1);
function opt(name:string):string|undefined {
  const at=rest.indexOf(name);
  if(at<0)return undefined;
  if(!rest[at+1] || rest[at+1].startsWith('--')) throw new Error(`${name} requires a value`);
  return rest[at+1];
}
function payload():string {
  const path=opt('--file');
  const raw=path!==undefined ? readFileSync(path,'utf8').replace(/\r?\n$/,'') : rest[0];
  if(!raw || raw.startsWith('--')) throw new Error('Provide a payload or --file');
  return raw;
}
async function main() {
  if (!command || ['--help','help','-h'].includes(command)) {help();return;}
  if(command==='parse') console.log(JSON.stringify({nodes:parseTlv(payload()),note:'Not a complete compliance verdict'},null,2));
  else if(command==='validate'){
    const profile=opt('--profile');
    const result=profile===undefined ? validateStructure(payload()) : 
      (profile==='emvco-baseline' || profile==='lankaqr-basic' ? validateRules(payload(),profile as RuleProfile) : (()=>{throw new Error('Unsupported profile')})());
    console.log(JSON.stringify(result,null,2));
    if(!result.valid)process.exitCode=1;
  } else if(command==='generate'){
    const path=opt('--config');
    if(!path) throw new Error('generate requires --config JSON file');
    const config=JSON.parse(readFileSync(path,'utf8')) as TestPayloadOptions;
    const generated=generateTestPayload(config);
    const output=opt('--out');
    if(output){writeFileSync(output,generated);console.log(`Synthetic payload saved: ${output}`);}
    else console.log(generated);
  } else if(command==='render'){
    const format=(opt('--format')??'terminal') as OutputFormat;
    if(!['terminal','svg','png'].includes(format))throw new Error('Supported formats: terminal, svg, png');
    const rendered=await renderQr(payload(),format);
    const output=opt('--out');
    if(format==='png' && !output)throw new Error('PNG requires --out filename');
    if(output){writeFileSync(output,rendered);console.log(`QR image written: ${output}`);}
    else console.log(rendered);
  } else if(command==='crc')console.log(crc16(payload()));
  else if(command==='crc-verify'){const ok=verifyCrc(payload()); console.log(ok?'CRC valid':'CRC invalid');if(!ok)process.exitCode=1;}
  else{help();process.exitCode=2;}
}
main().catch(err=>{console.error(err instanceof Error?err.message:String(err));process.exitCode=1;});
