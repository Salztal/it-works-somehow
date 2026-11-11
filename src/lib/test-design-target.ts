import type {AmountResult,TodoCase} from './test-design-spec.ts';
// The correct target is also implemented independently, rather than echoing the oracle.
export function normalAmount(raw:string):AmountResult {
 const input=raw.trim();if(input.length===0)return '未入力エラー';
 if(!/^[+-]?[0-9]+$/.test(input))return '形式エラー';
 const n=BigInt(input);return n<1n||n>1000000n?'範囲エラー':'受理';
}
export function normalTodo(c:TodoCase):string {
 const records=[{id:'A',priority:3 as number|null},{id:'B',priority:null as number|null},{id:'C',priority:1 as number|null}];
 if(c.operation==='migrate')return records.map(r=>`${r.id}:${r.priority??2}`).join(' / ');
 const value=c.value.trim();
 if(!value&&c.operation!=='search')return `保存：優先度${c.operation==='create'?2:records[0].priority}`;
 if(!['1','2','3'].includes(value))return '入力エラー';
 const n=Number(value);
 if(c.operation==='search')return '行：'+(records.filter(r=>r.priority===n).map(r=>r.id).join(',')||'なし');
 return `保存：優先度${n}`;
}
// Intentionally faulty code; independent from the expected-value oracle.
export function faultyAmount(raw:string):AmountResult {
 const text=raw.trim();
 // BUG: blank falls through numeric coercion; BUG: 0 accepted; BUG: max rejected.
 if(text!==''&&!/^[+-]?\d+$/.test(text))return '形式エラー';
 const n=Number(text);
 if(n<0||n>=1000000)return '範囲エラー';
 return '受理';
}
export function faultyTodo(c:TodoCase):string {
 if(c.operation==='migrate')return 'A:3 / B:空欄 / C:1'; // missing backfill
 const input=c.value.trim();
 if(input!==''&&!['1','2','3'].includes(input))return '入力エラー';
 if(c.operation==='search')return input===''?'入力エラー':'行：A,B,C'; // ignored filter
 const priority=input===''?2:Number(input); // update wrongly defaults, too
 return `保存：優先度${priority}`;
}
