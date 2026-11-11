import {expectedAmount,expectedTodo,type TodoCase} from './test-design-spec.ts';
import {faultyAmount,faultyTodo,normalAmount,normalTodo} from './test-design-target.ts';
export const amountCandidates=['-1','0','1','2','500000','999999','1000000','1000001','1.5','abc',''];
export const amountConditions=['下限の外側（0）','下限ちょうど','下限の内側','範囲内の代表','上限の内側','上限ちょうど','上限超過の整数','小数形式','数字以外の形式','空欄','負の整数（代表）'];
export function amountCondition(raw:string):string {
 const s=raw.trim();if(!s)return amountConditions[9];
 if(!/^[+-]?\d+$/.test(s))return /^[-+]?\d+\.\d+$/.test(s)?amountConditions[7]:amountConditions[8];
 const n=Number(s);return amountConditions[n<0?10:n===0?0:n===1?1:n===2?2:n===999999?4:n===1000000?5:n>1000000?6:3];
}
export function runAmount(values:string[],normal=false){
 const rows=values.map(value=>{const expected=expectedAmount(value),actual=normal?normalAmount(value):faultyAmount(value);return {value,expected,actual,match:expected===actual,condition:amountCondition(value)};});
 const covered=amountConditions.filter(c=>rows.some(r=>r.condition===c));
 return {rows,covered,missing:amountConditions.filter(c=>!covered.includes(c))};
}
export function integerPartitions(min:number,max:number,mode:2|3){
 if(mode!==2&&mode!==3)throw Error('境界値分析は2値または3値を指定してください。');
 if(!Number.isSafeInteger(min)||!Number.isSafeInteger(max)||min>max||min<=Number.MIN_SAFE_INTEGER||max>=Number.MAX_SAFE_INTEGER)throw Error('下限≦上限となる安全な整数を入力してください（両隣の値も安全な整数に限定）。');
 const values=[min-1,min,max,max+1,...(mode===3?[min+1,max-1]:[])];
 return {classes:[`無効：${min}未満の整数`,`有効：${min}〜${max}の整数`,`無効：${max}超の整数`],values:[...new Set(values)].sort((a,b)=>a-b)};
}
export type Rule={id:string;high:boolean;approver:boolean;submitted:boolean;approved:boolean};
export type RuleAction=''|'拒否'|'自動承認'|'承認'|'保留';
export const decisionRules:Rule[]=Array.from({length:16},(_,i)=>({id:`R${i+1}`,high:!!(i&8),approver:!!(i&4),submitted:!!(i&2),approved:!!(i&1)}));
export function ruleExpected(r:Rule):RuleAction|'不可能'{
 if(r.submitted&&r.approved)return '不可能';
 if(!r.submitted||r.approved)return '拒否';
 if(!r.high)return '自動承認';
 return r.approver?'承認':'保留';
}
export function initialRules():Record<string,RuleAction>{return Object.fromEntries(decisionRules.filter(r=>ruleExpected(r)!=='不可能').map(r=>[r.id,r.id==='R3'?'':r.id==='R7'?'保留':ruleExpected(r)])) as Record<string,RuleAction>;}
export function checkRules(actions:Record<string,RuleAction>){const possible=decisionRules.filter(r=>ruleExpected(r)!=='不可能');return {total:possible.length,missing:possible.filter(r=>!actions[r.id]).map(r=>r.id),wrong:possible.filter(r=>actions[r.id]&&actions[r.id]!==ruleExpected(r)).map(r=>r.id)};}
export const states=['下書き','申請中','差戻し','承認済み','取消済み'] as const;
export const events=['申請','承認','取消','差戻し'] as const;
export type WorkflowState=typeof states[number];
export type WorkflowEvent=typeof events[number];
const transitions:Partial<Record<WorkflowState,Partial<Record<WorkflowEvent,WorkflowState>>>>={下書き:{申請:'申請中',取消:'取消済み'},申請中:{承認:'承認済み',取消:'取消済み',差戻し:'差戻し'},差戻し:{申請:'申請中',取消:'取消済み'}};
export const validTransitions=states.flatMap(s=>events.filter(e=>transitions[s]?.[e]).map(e=>`${s}→${e}`));
export type Workflow={state:WorkflowState;visited:WorkflowState[];valid:string[];invalid:string[];history:string[]};
export const initialWorkflow=():Workflow=>({state:'下書き',visited:['下書き'],valid:[],invalid:[],history:[]});
export function workflowEvent(model:Workflow,event:string):Workflow{
 if(!events.includes(event as WorkflowEvent))throw Error('未定義のイベントです。');
 const next=transitions[model.state]?.[event as WorkflowEvent],key=`${model.state}→${event}`;
 return {state:next??model.state,visited:[...new Set([...model.visited,next??model.state])],valid:next?[...new Set([...model.valid,key])]:[...model.valid],invalid:next?[...model.invalid]:[...new Set([...model.invalid,key])],history:[...model.history,`${model.state} ＋ ${event} → ${next??'拒否（状態不変）'}`]};
}
export type CoverageCase={amount:number;approved:boolean};
export function codeCoverage(cases:CoverageCase[]){
 const statements=new Set<string>(),branches=new Set<string>();
 const rows=cases.map(c=>{
 if(!Number.isFinite(c.amount))throw Error('金額は有限の数値で入力してください。');
 let actual='拒否';statements.add('初期代入');
 const condition=c.amount>=1&&c.approved;branches.add(condition?'真':'偽');
 if(condition){actual='受理';statements.add('受理代入');}statements.add('return');
 // Requirement oracle deliberately includes the missing upper bound and integer requirement.
 const expected=Number.isInteger(c.amount)&&c.amount>=1&&c.amount<=1000000&&c.approved?'受理':'拒否';
 return {...c,actual,expected,match:actual===expected,branch:condition?'真':'偽'};
 });return {rows,statements:[...statements],branches:[...branches],statementTotal:3,branchTotal:2};
}
export const impactNodes:Record<string,string>={form:'入力画面',api:'API',dto:'DTO',dao:'DAO・SQL',db:'DB',search:'検索',list:'一覧画面',migration:'移行処理',legacy:'既存データ'};
export const impactEdges=[['form','api'],['api','dto'],['dto','dao'],['dao','db'],['search','dao'],['list','search'],['migration','db'],['legacy','migration']];
// Impact may travel to callers and consumers, so walk both directions in this teaching graph.
export function traceImpact(start:string){
 if(!Object.hasOwn(impactNodes,start))throw Error('未定義の変更対象です。');
 const paths:Record<string,string[]>={[start]:[start]},queue=[start];
 while(queue.length){const node=queue.shift()!;for(const [a,b] of impactEdges){const other=a===node?b:b===node?a:null;if(other&&!paths[other]){paths[other]=[...paths[node],other];queue.push(other);}}}return paths;
}
export const pairCases=Array.from({length:8},(_,i)=>[!!(i&4),!!(i&2),!!(i&1)]);
export function pairCoverage(ids:number[]){
 if(ids.some(i=>!Number.isInteger(i)||i<0||i>7))throw Error('未定義の組み合わせです。');
 const covered=new Set<string>();for(const i of ids)for(const [a,b] of [[0,1],[0,2],[1,2]])covered.add(`${a}${b}:${Number(pairCases[i][a])}${Number(pairCases[i][b])}`);
 return {covered:covered.size,total:12,tripleDefect:ids.includes(7)};
}
export const todoConditions=['新規省略','新規有効値','下限外0','上限外4','形式違反','更新省略','更新明示','優先度検索','旧データ移行'];
export function todoCondition(c:TodoCase){if(c.operation==='migrate')return todoConditions[8];if(c.operation==='search')return /^[1-3]$/.test(c.value.trim())?todoConditions[7]:todoConditions[4];if(c.operation==='update')return c.value.trim()===''?todoConditions[5]:/^[1-3]$/.test(c.value.trim())?todoConditions[6]:todoConditions[4];const t=c.value.trim();return todoConditions[t===''?0:/^[1-3]$/.test(t)?1:t==='0'?2:t==='4'?3:4];}
export function runTodo(cases:TodoCase[],normal=false){const rows=cases.map(c=>{const expected=expectedTodo(c),actual=normal?normalTodo(c):faultyTodo(c);return {...c,expected,actual,match:expected===actual,condition:todoCondition(c)};});const covered=todoConditions.filter(c=>rows.some(r=>r.condition===c));return {rows,covered,missing:todoConditions.filter(c=>!covered.includes(c))};}
