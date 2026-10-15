import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crc16, appendCrc, verifyCrc } from '../src/crc.ts';
import { parseTlv, serializeTlv, TlvParseError } from '../src/tlv.ts';
import { validateStructure } from '../src/validate.ts';

test('standard CRC-16/CCITT-FALSE vector', () => assert.equal(crc16('123456789'), '29B1'));
test('preserves duplicate tags and both offsets', () => assert.deepEqual(parseTlv('000201000202'), [
  {id:'00',length:2,value:'01',offset:0,characterOffset:0},
  {id:'00',length:2,value:'02',offset:6,characterOffset:6}
]));
test('bounds check', () => assert.throws(()=>parseTlv('0005AB'),TlvParseError));
test('rejects incomplete header', () => assert.throws(()=>parseTlv('000'),TlvParseError));
test('rejects zero length', () => assert.throws(()=>parseTlv('5900'),TlvParseError));
test('rejects invalid IDs', () => assert.throws(()=>parseTlv('ZZ02OK'),TlvParseError));
test('Unicode length counts characters rather than bytes', () => {
  const nodes = parseTlv('5902ශ්6005Kandy', {nested:false});
  assert.equal(nodes[0]?.value, 'ශ්');
  assert.equal(nodes[1]?.offset, Buffer.byteLength('5902ශ්', 'utf8'));
});
test('non BMP Unicode character counts as one character', () => {
  assert.equal(parseTlv('5901😀', {nested:false})[0]?.value, '😀');
});
test('serializer emits Unicode character length', () => {
  assert.equal(serializeTlv([{id:'59',value:'😀'}]),'5901😀');
  assert.equal(serializeTlv([{id:'59',value:'ශ්'}]),'5902ශ්');
});
test('nested template roundtrip and diagnostic offsets', () => {
  const payload = serializeTlv([{id:'00',value:'01'}, {id:'62',children:[{id:'05',value:'REF123'}]}]);
  const nodes = parseTlv(payload);
  assert.equal(nodes[1]?.children?.[0]?.value,'REF123');
  assert.equal(serializeTlv(nodes),payload);
});
test('limits template depth and value lengths', () => {
  const payload=serializeTlv([{id:'62',children:[{id:'05',value:'REF'}]}]);
  assert.throws(()=>parseTlv(payload,{maxDepth:0}),TlvParseError);
  assert.throws(()=>serializeTlv([{id:'59',value:'a'.repeat(100)}]));
});
test('rejects unpaired Unicode surrogate', () => assert.throws(()=>parseTlv('5901\uD800'),TlvParseError));
test('CRC verifies Unicode bytes and rejects modified payload', () => {
  const payload=appendCrc(serializeTlv([{id:'00',value:'01'},{id:'59',value:'ශ්'}]));
  assert.equal(verifyCrc(payload),true);
  const corrupted=payload.replace('ශ්','මං');
  assert.equal(verifyCrc(corrupted),false);
});
test('CRC must appear last',()=>assert.equal(verifyCrc('630429B1000201'),false));
test('CRC cannot be appended twice',()=>assert.throws(()=>appendCrc(appendCrc('000201'))));
test('basic validation passes test-only structural fixture',()=>{
  const payload=appendCrc('00020153031445802LK');
  const result=validateStructure(payload);
  assert.equal(result.valid,true);
  assert.equal(result.profile,'emvco-structural-preview');
});
test('duplicate tags produce diagnostics',()=>{
  const result=validateStructure(appendCrc('000201000201'));
  assert.equal(result.valid,false);
  assert.ok(result.diagnostics.some(d=>d.code==='DUPLICATE_TAG'));
});
test('invalid initiation method is rejected',()=>{
  const result=validateStructure(appendCrc('000201010299'));
  assert.ok(result.diagnostics.some(d=>d.code==='INITIATION_METHOD'));
});
