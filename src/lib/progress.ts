export type State = { version: 1; completed: Record<string, boolean>; answers: Record<string, number>; recall: Record<string, string>; notes: Record<string, string>; last: string | null };
export const empty = (): State => ({ version: 1, completed: {}, answers: {}, recall: {}, notes: {}, last: null });
// Keep the v1 format and original answer IDs for old Network/Java backups.
export function validate(value: unknown, keys: Set<string>): State {
  if (!value || typeof value !== 'object' || (value as State).version !== 1) throw Error('対応していない記録形式です。');
  const s = value as State, result = empty();
  for (const name of ['completed','answers','recall','notes'] as const) if (!s[name] || typeof s[name] !== 'object' || Array.isArray(s[name])) throw Error('記録の形式が正しくありません。');
  for (const [k,v] of Object.entries(s.completed)) if (keys.has(k) && v === true) result.completed[k] = true;
  for (const [k,v] of Object.entries(s.answers)) if (/^[\w-]+:\d+$/.test(k) && Number.isInteger(v) && v >= 0 && v < 4) result.answers[k] = v;
  for (const name of ['recall','notes'] as const) for (const [k,v] of Object.entries(s[name])) if (k !== '__proto__' && typeof v === 'string' && v.length <= 20000) result[name][k] = v;
  result.last = typeof s.last === 'string' && keys.has(s.last) ? s.last : null;
  return result;
}
export function grade(choice: number, correct: number, count: number) {
  if (!Number.isInteger(choice) || !Number.isInteger(correct) || choice < 0 || correct < 0 || choice >= count || correct >= count) throw Error('解答が範囲外です。');
  return choice === correct;
}
