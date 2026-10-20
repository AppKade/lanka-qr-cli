import { appendCrc } from './crc.ts';
import { serializeTlv, type SerializableNode } from './tlv.ts';
import { validatePaymentFields } from './payment-fields.ts';

export interface TestPayloadOptions {
  merchantName: string;
  merchantCity: string;
  merchantCategoryCode: string;
  merchantAccountId: string;
  amount?: string;
  reference?: string;
  initiation?: '11' | '12';
}
/** Generates a SYNTHETIC test QR payload. The template is intentionally not a live LankaPay identifier. */
export function generateTestPayload(options: TestPayloadOptions): string {
  const {merchantName,merchantCity,merchantCategoryCode,merchantAccountId,amount,reference,initiation='11'}=options;
  for (const [name,value] of Object.entries({merchantName,merchantCity,merchantCategoryCode,merchantAccountId})) {
    if (!value || typeof value!=='string') throw new Error(`${name} must be a non-empty string`);
  }
  if (!['11','12'].includes(initiation)) throw new Error('initiation must be 11 or 12');
  if (!/^\d{4}$/.test(merchantCategoryCode)) throw new Error('merchantCategoryCode must contain 4 digits');
  if (Array.from(merchantName).length>25 || Array.from(merchantCity).length>15) throw new Error('Merchant name or city exceeds EMVCo length limits');
  if (amount !== undefined && !validatePaymentFields(amount)) throw new Error('Invalid amount format: expected positive numeric value');
  if (reference !== undefined && (reference.length<1 || reference.length>25 || !/^[\x20-\x7e]+$/.test(reference))) throw new Error('Reference must be 1-25 printable ASCII characters');
  const nodes: SerializableNode[]=[
    {id:'00',value:'01'},
    {id:'01',value:initiation},
    {id:'26',children:[
      {id:'00',value:'example.org'},
      {id:'01',value:merchantAccountId}
    ]},
    {id:'52',value:merchantCategoryCode},
    {id:'53',value:'144'},
    ...(amount ? [{id:'54',value:amount}] : []),
    {id:'58',value:'LK'},
    {id:'59',value:merchantName},
    {id:'60',value:merchantCity},
    ...(reference ? [{id:'62',children:[{id:'05',value:reference}]}] : [])
  ];
  return appendCrc(serializeTlv(nodes));
}
