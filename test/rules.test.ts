import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateTestPayload} from '../src/generate.ts';
import {validateRules} from '../src/rules.ts';
import {verifyCrc,appendCrc} from '../src/crc.ts';
import {serializeTlv,parseTlv} from '../src/tlv.ts';
import {renderQr} from '../src/render.ts';

const sample={merchantName:'Sample Store',merchantCity:'Colombo',merchantCategoryCode:'5999',merchantAccountId:'TEST123',amount:'1500.00',reference:'ORDER-123'};
test('test payload generator creates parseable CRC-valid payload',()=>{
  const payload=generateTestPayload(sample);
  assert.equal(verifyCrc(payload),true);
  const nodes=parseTlv(payload);
  assert.equal(nodes.find(n=>n.id==='53')?.value,'144');
  assert.equal(nodes.find(n=>n.id==='26')?.children?.find(n=>n.id==='00')?.value,'example.org');
  assert.equal(validateRules(payload,'lankaqr-basic').valid,true);
});
test('synthetic generator rejects invalid amount and MCC',()=>{
  assert.throws(()=>generateTestPayload({...sample,amount:'0'}));
  assert.throws(()=>generateTestPayload({...sample,amount:'1,500'}));
  assert.throws(()=>generateTestPayload({...sample,merchantCategoryCode:'abc'}));
});
test('baseline validation catches required fields',()=>{
  const result=validateRules(appendCrc('000201'));
  assert.equal(result.valid,false);
  assert.ok(result.diagnostics.some(d=>d.code==='MERCHANT_ACCOUNT_MISSING'));
  assert.ok(result.diagnostics.some(d=>d.code==='REQUIRED_FIELD'));
});
test('LANKAQR basic flags non-LKR and non-LK but does not claim certification',()=>{
  const payload=generateTestPayload(sample).replace('5303144','5303840').replace('5802LK','5802US');
  const result=validateRules(payload,'lankaqr-basic');
  assert.equal(result.scope,'partial');
  assert.ok(result.diagnostics.some(d=>d.code==='LANKAQR_CURRENCY'));
  assert.ok(result.diagnostics.some(d=>d.code==='LANKAQR_COUNTRY'));
});
test('validates amounts: no zero or invalid separators',()=>{
  const mk=(amount:string)=>appendCrc(serializeTlv([
    {id:'00',value:'01'},{id:'26',children:[{id:'00',value:'example.org'}]},
    {id:'52',value:'5999'},{id:'53',value:'144'},{id:'54',value:amount},
    {id:'58',value:'LK'},{id:'59',value:'Sample'},{id:'60',value:'Colombo'}
  ]));
  assert.equal(validateRules(mk('0.00'),'emvco-baseline').valid,false);
  assert.equal(validateRules(mk('12,00'),'emvco-baseline').valid,false);
  assert.equal(validateRules(mk('1500.00'),'emvco-baseline').valid,true);
});
test('QR renderer produces SVG and PNG',async()=>{
  const p=generateTestPayload(sample);
  const svg=await renderQr(p,'svg');
  assert.match(String(svg),/<svg/);
  const png=await renderQr(p,'png');
  assert.equal(Buffer.isBuffer(png),true);
  assert.equal((png as Buffer).subarray(0,8).toString('hex'),'89504e470d0a1a0a');
});
