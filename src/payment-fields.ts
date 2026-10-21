/** EMVCo amount grammar; no claim of bank-side amount acceptance. */
export function validatePaymentFields(value: string): boolean {
  if (typeof value !== 'string') return false;
  if (!/^\d+(?:\.\d*)?$/.test(value) || value.length>13) return false;
  const digits=value.replace('.','');
  return /[1-9]/.test(digits);
}
