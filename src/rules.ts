import { type TlvNode } from './tlv.ts';
import { validateStructure, type Diagnostic } from './validate.ts';
import { validatePaymentFields } from './payment-fields.ts';

export type RuleProfile = 'emvco-baseline' | 'lankaqr-basic';
export interface RulesResult {
  valid: boolean;
  profile: RuleProfile;
  /** A subset of MPM rules, NOT complete EMVCo or CBSL certification. */
  scope: 'partial';
  diagnostics: Diagnostic[];
}
const check=(nodes:TlvNode[],id:string)=>nodes.find(node=>node.id===id);
export function validateRules(payload:string,profile:RuleProfile='emvco-baseline'):RulesResult {
  if (!['emvco-baseline','lankaqr-basic'].includes(profile)) throw new Error('Unsupported profile');
  const structural=validateStructure(payload);
  const diagnostics=[...structural.diagnostics];
  if (!structural.valid && structural.diagnostics.some(d=>d.code==='TLV_MALFORMED')) return {valid:false,profile,scope:'partial',diagnostics};
  const nodes=structural.nodes;
  const error=(code:string,id:string,message:string)=>diagnostics.push({code,severity:'error',path:`$.${id}`,message});
  for (const id of ['52','53','58','59','60']) if (!check(nodes,id)) error('REQUIRED_FIELD',id,`Required EMVCo field ${id} is missing`);
  if (!nodes.some(n=>Number(n.id)>=2 && Number(n.id)<=51)) error('MERCHANT_ACCOUNT_MISSING','02-51','At least one merchant account information object is required');
  const mcc=check(nodes,'52');
  if (mcc && !/^\d{4}$/.test(mcc.value)) error('MCC_FORMAT','52','Merchant category code must be four digits');
  const currency=check(nodes,'53');
  if (currency && !/^\d{3}$/.test(currency.value)) error('CURRENCY_FORMAT','53','Currency must be a three-digit ISO 4217 numeric code');
  const country=check(nodes,'58');
  if (country && !/^[A-Z]{2}$/.test(country.value)) error('COUNTRY_FORMAT','58','Country must be uppercase ISO 3166-1 alpha-2 code');
  const name=check(nodes,'59');
  if (name && (name.length<1 || name.length>25)) error('MERCHANT_NAME_LENGTH','59','Merchant name length must be 1-25 characters');
  const city=check(nodes,'60');
  if (city && (city.length<1 || city.length>15)) error('MERCHANT_CITY_LENGTH','60','Merchant city length must be 1-15 characters');
  const amount=check(nodes,'54');
  if (amount && !validatePaymentFields(amount.value)) error('AMOUNT_FORMAT','54','Amount must be positive digits with at most one decimal point and at most 13 characters');
  if (profile==='lankaqr-basic') {
    if(currency && currency.value!=='144') error('LANKAQR_CURRENCY','53','LANKAQR local currency must be LKR (144)');
    if(country && country.value!=='LK') error('LANKAQR_COUNTRY','58','LANKAQR merchant country must be LK');
    diagnostics.push({code:'NETWORK_NOT_VERIFIED',severity:'warning',path:'$.26',message:'LankaPay merchant account routing, reference fields, and latest CBSL scheme amendments are NOT validated by this basic profile'});
  }
  return {valid:!diagnostics.some(d=>d.severity==='error'),profile,scope:'partial',diagnostics};
}
