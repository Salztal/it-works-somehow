// Specification oracle: never import the experimental implementation here.
export type AmountResult='受理'|'未入力エラー'|'形式エラー'|'範囲エラー';
export function expectedAmount(raw:string):AmountResult {
 const text=raw.trim();
 if(text==='')return '未入力エラー';
 if(!/^[+-]?\d+$/.test(text))return '形式エラー';
 const amount=Number(text);
 return amount>=1&&amount<=1000000?'受理':'範囲エラー';
}
export type TodoCase={operation:'create'|'update'|'search'|'migrate';value:string};
export const todoRows=[{id:'A',priority:3},{id:'B',priority:null},{id:'C',priority:1}] as const;
export function expectedTodo(c:TodoCase):string {
 if(c.operation==='migrate')return 'A:3 / B:2 / C:1';
 const text=c.value.trim();
 if(c.operation!=='search'&&text==='')return c.operation==='create'?'保存：優先度2':'保存：優先度3';
 if(!/^[1-3]$/.test(text))return '入力エラー';
 if(c.operation==='search')return text==='3'?'行：A':text==='1'?'行：C':'行：なし';
 return `保存：優先度${text}`;
}
