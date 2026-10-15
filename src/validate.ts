import { parseTlv, TlvParseError, type TlvNode } from './tlv.ts';
import { verifyCrc } from './crc.ts';

export interface Diagnostic {
  code: string;
  severity: 'error' | 'warning';
  path: string;
  message: string;
}
export interface ValidationResult {
  /** Structural/basic EMVCo checks only, NOT a CBSL/LANKAQR compliance verdict. */
  valid: boolean;
  profile: 'emvco-structural-preview';
  diagnostics: Diagnostic[];
  nodes: TlvNode[];
}
export function validateStructure(payload: string): ValidationResult {
  const diagnostics: Diagnostic[] = [];
  let nodes: TlvNode[] = [];
  try { nodes = parseTlv(payload); }
  catch (error) {
    if (error instanceof TlvParseError) diagnostics.push({code:'TLV_MALFORMED',severity:'error',path:'$',message:error.message});
    else throw error;
    return {valid:false,profile:'emvco-structural-preview',diagnostics,nodes};
  }
  function checkDuplicates(fields: TlvNode[], path: string): void {
    const seen = new Set<string>();
    for (const node of fields) {
      const fieldPath = path + '.' + node.id;
      if (seen.has(node.id)) diagnostics.push({code:'DUPLICATE_TAG',severity:'error',path:fieldPath,message:'A data object ID occurs more than once in the same template'});
      seen.add(node.id);
      if (node.children) checkDuplicates(node.children,fieldPath);
    }
  }
  checkDuplicates(nodes,'$');
  if (nodes[0]?.id !== '00' || nodes[0]?.value !== '01') diagnostics.push({code:'PAYLOAD_FORMAT',severity:'error',path:'$.00',message:'Payload Format Indicator must be the first field with value 01'});
  const poi = nodes.find(n=>n.id==='01');
  if (poi && !['11','12'].includes(poi.value)) diagnostics.push({code:'INITIATION_METHOD',severity:'error',path:'$.01',message:'Point of Initiation Method must be 11 or 12'});
  const crc = nodes.find(n=>n.id==='63');
  if (!crc || nodes.at(-1)?.id !== '63' || !verifyCrc(payload)) diagnostics.push({code:'CRC_INVALID',severity:'error',path:'$.63',message:'A valid CRC tag must appear last'});
  return {valid:!diagnostics.some(d=>d.severity==='error'),profile:'emvco-structural-preview',diagnostics,nodes};
}
