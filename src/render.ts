import QRCode from 'qrcode';
export type OutputFormat='terminal'|'svg'|'png';
export async function renderQr(payload:string,format:OutputFormat):Promise<string|Buffer> {
  if (!payload) throw new Error('Cannot render empty payload');
  if (format==='svg') return QRCode.toString(payload,{type:'svg',errorCorrectionLevel:'M'});
  if (format==='png') return QRCode.toBuffer(payload,{type:'png',errorCorrectionLevel:'M'});
  return QRCode.toString(payload,{type:'terminal',small:true,errorCorrectionLevel:'M'});
}
