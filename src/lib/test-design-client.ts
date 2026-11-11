import {amountConditions,amountCandidates,runAmount,integerPartitions,initialRules,checkRules,initialWorkflow,workflowEvent,validTransitions,states,events,codeCoverage,impactNodes,traceImpact,pairCoverage,runTodo,type Workflow,type RuleAction} from './test-design-model';
import type {TodoCase} from './test-design-spec';
type Editable={value:string;selected:boolean;approved?:boolean;operation?:TodoCase['operation']};
const operationLabels:Record<string,string>={create:'新規登録',update:'既存A更新',search:'優先度検索',migrate:'旧データ移行'};
function el<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
function table(headers:string[],rows:(string|HTMLElement)[][],caption:string){
 const region=el('div');region.className='table-scroll';region.tabIndex=0;region.setAttribute('role','region');region.setAttribute('aria-label',caption);
 const t=el('table');t.append(el('caption',caption));const head=el('thead'),tr=el('tr');for(const h of headers){const th=el('th',h);th.scope='col';tr.append(th);}head.append(tr);t.append(head);
 const body=el('tbody');for(const row of rows){const r=el('tr');row.forEach((value,i)=>{const cell=i===0?el('th'):el('td');if(i===0)(cell as HTMLTableCellElement).scope='row';typeof value==='string'?cell.textContent=value:cell.append(value);r.append(cell);});body.append(r);}t.append(body);region.append(t);return region;
}
for(const root of document.querySelectorAll<HTMLElement>('[data-test-lab]')){
 const kind=root.dataset.testLab!,find=<T extends HTMLElement>(s:string)=>root.querySelector<T>(s)!,all=<T extends HTMLElement>(s:string)=>[...root.querySelectorAll<T>(s)];
 const summary=find<HTMLElement>('[data-summary]'),results=find<HTMLElement>('[data-results]');
 const setSummary=(message:string)=>summary.textContent=message;
 const invalidate=()=>{results.replaceChildren();all<HTMLElement>('[data-statement]').forEach(e=>e.classList.remove('is-covered'));setSummary('条件が変わりました。再実行するまで確認済みとして扱いません。');};
 const attempt=(action:()=>void)=>{try{action();}catch(error){results.replaceChildren();setSummary(error instanceof Error?error.message:'入力を確認してください。');}};
 const button=(selector:string,action:()=>void)=>root.querySelector(selector)?.addEventListener('click',()=>attempt(action));
 let cases:Editable[]=[],workflow:Workflow=initialWorkflow();
 function renderEditor(){
  const editor=find<HTMLElement>('[data-case-editor]');if(!editor)return;
  const rows=cases.map((c,i)=>{
   const use=el('input');use.type='checkbox';use.checked=c.selected;use.setAttribute('aria-label',`ケース${i+1}を実行対象にする`);use.addEventListener('change',()=>{c.selected=use.checked;invalidate();});
   const input=el('input');input.type=kind==='coverage'?'number':'text';input.step='any';input.maxLength=200;input.value=c.value;input.setAttribute('aria-label',`ケース${i+1}の${kind==='capstone'?'優先度':'金額'}（空欄可）`);input.addEventListener('input',()=>{c.value=input.value;invalidate();});
   const remove=el('button','削除');remove.type='button';remove.className='button secondary';remove.setAttribute('aria-label',`ケース${i+1}を削除`);remove.addEventListener('click',()=>{cases.splice(i,1);renderEditor();invalidate();const focus=editor.querySelectorAll('button')[Math.min(i,cases.length-1)]||root.querySelector('[data-new-value]');(focus as HTMLElement)?.focus();});
   const useLabel=el('label');useLabel.className='test-check test-table-check';useLabel.append(use);
   const row:(string|HTMLElement)[]=[String(i+1),useLabel];
   if(kind==='capstone'){const select=el('select');select.setAttribute('aria-label',`ケース${i+1}の操作`);for(const [value,label] of Object.entries(operationLabels)){const option=el('option',label);option.value=value;select.append(option);}select.value=c.operation!;select.addEventListener('change',()=>{c.operation=select.value as TodoCase['operation'];input.disabled=c.operation==='migrate';invalidate();});input.disabled=c.operation==='migrate';row.push(select);}
   row.push(input);
   if(kind==='coverage'){const approved=el('input');approved.type='checkbox';approved.checked=!!c.approved;approved.setAttribute('aria-label',`ケース${i+1}は承認済み`);approved.addEventListener('change',()=>{c.approved=approved.checked;invalidate();});const label=el('label');label.className='test-check test-table-check';label.append(approved);row.push(label);}
   row.push(remove);return row;
  });
  const headers=['ケース','実行',...(kind==='capstone'?['操作']:[]),kind==='capstone'?'優先度':'金額',...(kind==='coverage'?['承認済み']:[]),'削除'];
  editor.replaceChildren(table(headers,rows,'選択・編集できるテストケース'));
 }
 function resetCases(){cases=kind==='omissions'?amountCandidates.map(value=>({value,selected:value==='500000'})):kind==='coverage'?[{value:'500000',selected:true,approved:true}]:[{value:'2',operation:'create',selected:true}];const target=root.querySelector<HTMLSelectElement>('[data-target]');if(target)target.value='faulty';const add=root.querySelector<HTMLFormElement>('[data-add-form]');add?.reset();renderEditor();invalidate();setSummary('初期状態です。まだ実行していません。');}
 if(['omissions','coverage','capstone'].includes(kind)){
  resetCases();find<HTMLFormElement>('[data-add-form]').addEventListener('submit',event=>{event.preventDefault();attempt(()=>{
   if(cases.length>=40)throw Error('ケースは40件までです。不要なケースを削除してください。');
   const input=find<HTMLInputElement>('[data-new-value]');
   if(kind==='coverage'&&(input.value===''||!Number.isFinite(Number(input.value))))throw Error('金額を有限の数値で入力してください。');
   cases.push({value:input.value,selected:true,approved:!!root.querySelector<HTMLInputElement>('[data-new-approved]')?.checked,operation:root.querySelector<HTMLSelectElement>('[data-new-operation]')?.value as TodoCase['operation']});renderEditor();invalidate();
  });});
  find<HTMLSelectElement>('[data-target]')?.addEventListener('change',invalidate);
  button('[data-run]',()=>{
   const selected=cases.filter(c=>c.selected);if(!selected.length)throw Error('実行するケースを1件以上選んでください。');
   if(kind==='coverage'){
    if(selected.some(c=>c.value.trim()===''))throw Error('カバレッジ教材の金額に空欄は使えません。数値を入力してください。');
    const report=codeCoverage(selected.map(c=>({amount:Number(c.value),approved:!!c.approved})));
    results.replaceChildren(table(['金額 / 承認','通った分岐','仕様の期待','実際','比較'],report.rows.map(r=>[`${r.amount} / ${r.approved?'承認済み':'未承認'}`,r.branch,r.expected,r.actual,r.match?'一致':'不一致：仕様の検査不足']),'実行結果と分岐'));
    for(const line of all<HTMLElement>('[data-statement]'))line.classList.toggle('is-covered',report.statements.includes(line.dataset.statement!));
    setSummary(`命令 ${report.statements.length}/3（${Math.round(report.statements.length/3*100)}%）、分岐 ${report.branches.length}/2（${report.branches.length*50}%）。不一致 ${report.rows.filter(r=>!r.match).length}件。網羅率は要求の充足や無欠陥を保証しません。`);return;
   }
   const normal=find<HTMLSelectElement>('[data-target]').value==='normal';
   if(kind==='omissions'){
    const report=runAmount(selected.map(c=>c.value),normal);
    results.replaceChildren(table(['入力','確認条件','仕様の期待','実際','比較'],report.rows.map(r=>[r.value||'（空欄）',r.condition,r.expected,r.actual,r.match?'一致':'不一致：この条件で欠陥を検出']),'期待結果と実際結果'));
    const defects=report.rows.filter(r=>!r.match).map(r=>`${r.value||'空欄'} → 期待${r.expected} / 実際${r.actual}`);
    setSummary(`条件の確認 ${report.covered.length}/${amountConditions.length}。検出条件：${defects.length?defects.join('、'):'今回の実行では不一致未検出（欠陥なしとは言えません）'}。未確認：${report.missing.join('、')||'この分類内は全て確認。分類外のリスクは残ります'}。`);
   }else{
    const report=runTodo(selected.map(c=>({operation:c.operation!,value:c.value})),normal);
    results.replaceChildren(table(['操作 / 入力','確認条件','仕様の期待','実際','比較'],report.rows.map(r=>[`${operationLabels[r.operation]} / ${r.operation==='migrate'?'入力不要':r.value||'省略'}`,r.condition,r.expected,r.actual,r.match?'一致':'不一致：この条件で欠陥を検出']),'仕様変更の実行結果'));
    setSummary(`条件の確認 ${report.covered.length}/9。不一致 ${report.rows.filter(r=>!r.match).length}件。未確認：${report.missing.join('、')||'この分類内は全て確認。実DB・同時更新等は対象外'}。ケースは独立した初期データから実行しました。`);
   }
  });button('[data-reset]',resetCases);
 }
 if(kind==='boundaries'){
  const form=find<HTMLFormElement>('[data-bound-form]');form.addEventListener('input',invalidate);form.addEventListener('submit',event=>{event.preventDefault();attempt(()=>{
   const minInput=find<HTMLInputElement>('[data-min]'),maxInput=find<HTMLInputElement>('[data-max]');if(!minInput.value||!maxInput.value)throw Error('上下限を入力してください。');
   const min=Number(minInput.value),max=Number(maxInput.value),mode=Number(find<HTMLSelectElement>('[data-mode]').value) as 2|3,report=integerPartitions(min,max,mode);
   const list=el('ul');report.classes.forEach(c=>list.append(el('li',c)));results.replaceChildren(list,table(['候補値','所属'],report.values.map(v=>[String(v),v<min?'無効：下限の外':v>max?'無効：上限の外':'有効：範囲内']),'重複を除いた境界値候補'));
   setSummary(`${mode}値境界値分析の候補 ${report.values.length}個。これは候補の生成であり、プログラムの実行結果ではありません。形式・空欄・権限は別観点です。`);
  });});button('[data-reset]',()=>{form.reset();invalidate();setSummary('初期の整数範囲へ戻しました。候補は未生成です。');});
 }
 if(kind==='decision'){
  all<HTMLSelectElement>('[data-rule]').forEach(e=>e.addEventListener('change',invalidate));
  button('[data-run]',()=>{const actions=Object.fromEntries(all<HTMLSelectElement>('[data-rule]').map(e=>[e.dataset.rule!,e.value as RuleAction]));const r=checkRules(actions);setSummary(`実現可能 ${r.total}ルール（不可能4件は状態制約により除外）。未定義：${r.missing.join('、')||'なし'}。仕様と矛盾する動作：${r.wrong.join('、')||'なし'}。一致 ${r.total-r.missing.length-r.wrong.length}/${r.total}。実装を実行した結果ではなく、表の設計の照合です。`);});
  button('[data-reset]',()=>{const seed=initialRules();all<HTMLSelectElement>('[data-rule]').forEach(e=>e.value=seed[e.dataset.rule!]);invalidate();setSummary('初期の表へ戻しました。未定義と矛盾を探してください。');});
 }
 if(kind==='state'){
  function showWorkflow(){find<HTMLElement>('[data-state]').textContent=`現在：${workflow.state}`;const list=el('ol');workflow.history.forEach(h=>list.append(el('li',h)));results.replaceChildren(list);setSummary(`状態 ${workflow.visited.length}/${states.length}。有効遷移 ${workflow.valid.length}/${validTransitions.length}。禁止の試行 ${workflow.invalid.length}/${states.length*events.length-validTransitions.length}。未確認の有効遷移：${validTransitions.filter(t=>!workflow.valid.includes(t)).join('、')||'なし（順序・権限等は別観点）'}。`);}
  all<HTMLButtonElement>('[data-event]').forEach(b=>b.addEventListener('click',()=>attempt(()=>{workflow=workflowEvent(workflow,b.dataset.event!);showWorkflow();})));
  button('[data-restart]',()=>{workflow={...workflow,state:'下書き'};showWorkflow();setSummary(summary.textContent+' 開始状態へ戻しました。この復帰は業務遷移には数えません。');});
  button('[data-reset]',()=>{workflow=initialWorkflow();showWorkflow();});
 }
 if(kind==='pairwise'){
  all<HTMLInputElement>('[data-pair]').forEach(c=>c.addEventListener('change',invalidate));
  button('[data-run]',()=>{const ids=all<HTMLInputElement>('[data-pair]:checked').map(c=>Number(c.dataset.pair));if(!ids.length)throw Error('1件以上の組み合わせを選んでください。');const r=pairCoverage(ids);setSummary(`実行${ids.length}件、2因子の値ペア ${r.covered}/${r.total}。3条件同時の欠陥：${r.tripleDefect?'111の実行で検出':'未検出（不存在の証明ではありません）'}。ペア100%でも、3条件以上の同時成立は未確認になり得ます。`);});
  button('[data-reset]',()=>{all<HTMLInputElement>('[data-pair]').forEach(c=>c.checked=[0,3,5,6].includes(Number(c.dataset.pair)));invalidate();setSummary('4件の初期選択へ戻しました。まだ実行していません。');});
 }
 if(kind==='impact'){
  all<HTMLInputElement>('[data-impact]').forEach(c=>c.addEventListener('change',invalidate));find<HTMLSelectElement>('[data-start]').addEventListener('change',invalidate);
  button('[data-run]',()=>{const paths=traceImpact(find<HTMLSelectElement>('[data-start]').value),selected=new Set(all<HTMLInputElement>('[data-impact]:checked').map(c=>c.dataset.impact!));
   results.replaceChildren(table(['候補','起点からの依存経路','選択'],Object.entries(paths).map(([key,path])=>[impactNodes[key],path.map(p=>impactNodes[p]).join(' ↔ '),selected.has(key)?'選択済み':'未選択：理由を検討']),'呼出元とデータ利用先への影響経路'));
   setSummary(`この合成グラフで影響候補 ${Object.keys(paths).length}件。未選択：${Object.keys(paths).filter(k=>!selected.has(k)).map(k=>impactNodes[k]).join('、')||'なし'}。選択は実施済みを意味しません。リスクに応じて実施範囲と除外理由を決めてください。`);
  });button('[data-reset]',()=>{find<HTMLSelectElement>('[data-start]').value='api';all<HTMLInputElement>('[data-impact]').forEach(c=>c.checked=['form','api','dto'].includes(c.dataset.impact!));invalidate();setSummary('API起点の初期選択へ戻しました。まだ依存を調査していません。');});
 }
}
