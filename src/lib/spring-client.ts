import {initialLab,labEvent,labLog,labRows} from './spring-model';
import type {Config} from './spring-model';
import type {LabKind} from '../content/spring/labs';
document.querySelectorAll<HTMLElement>('[data-spring-lab]').forEach(root=>{
 const kind=root.dataset.springLab as LabKind;
 const config=():Config=>Object.fromEntries([...root.querySelectorAll<HTMLSelectElement>('[data-field]')].map(el=>[el.dataset.field!,el.value]));
 let state=initialLab(kind,config()),before=labRows(state);
 const body=root.querySelector<HTMLTableSectionElement>('[data-state]')!,log=root.querySelector<HTMLOListElement>('[data-log]')!,message=root.querySelector<HTMLElement>('[data-lab-message]')!;
 const draw=()=>{
  const rows=labRows(state);body.replaceChildren();
  for(const key of new Set([...Object.keys(before),...Object.keys(rows)])){
   const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=key;tr.append(th);
   for(const value of [before[key]??'—',rows[key]??'—']){const td=document.createElement('td');td.textContent=value;tr.append(td);}
   if(before[key]!==rows[key])tr.classList.add('spring-changed');body.append(tr);
  }
  log.replaceChildren();for(const text of labLog(state)){const li=document.createElement('li');li.textContent=text;log.append(li);}
 };
 const reset=()=>{state=initialLab(kind,config());before=labRows(state);message.textContent='初期状態に戻しました。条件に基づく学習用モデルです。';draw();};
 root.querySelector('[data-reset]')!.addEventListener('click',reset);
 root.querySelectorAll<HTMLSelectElement>('[data-field]').forEach(el=>el.addEventListener('change',()=>{if(kind==='idempotency'){message.textContent='要求条件を変更しました。処理済み記録は保持しています。';}else reset();}));
 root.querySelectorAll<HTMLButtonElement>('[data-event]').forEach(button=>button.addEventListener('click',()=>{
  try {const next=labEvent(state,button.dataset.event!,config());before=labRows(state);state=next;message.textContent=labLog(state).at(-1)||'操作しました。';draw();}
  catch(error){message.textContent=`操作は適用されませんでした：${error instanceof Error?error.message:'条件を確認してください。'}`;}
 }));
 draw();
});
