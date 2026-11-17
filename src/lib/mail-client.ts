import {initialLab,labEvent,labLog,labRows} from './mail-model';
import type {Config} from './mail-model';
import type {LabKind} from '../content/mail/labs';
document.querySelectorAll<HTMLElement>('[data-mail-lab]').forEach(root=>{
 const kind=root.dataset.mailLab as LabKind;
 const config=():Config=>Object.fromEntries([...root.querySelectorAll<HTMLSelectElement>('[data-field]')].map(el=>[el.dataset.field!,el.value]));
 let state=initialLab(kind,config()),actionLabel='未操作';
 const viewRows=()=>{const rows=labRows(state);if(['dns','imap','headers'].includes(kind)){delete rows.段階;rows.直近の操作=actionLabel;}return rows;};
 let before=viewRows();
 const body=root.querySelector<HTMLTableSectionElement>('[data-state]')!,log=root.querySelector<HTMLOListElement>('[data-log]')!,message=root.querySelector<HTMLElement>('[data-lab-message]')!;
 const draw=()=>{
  const rows=viewRows();body.replaceChildren();
  const position=state.step<=1?0:state.step<=5?1:state.step===6?2:state.step===7?3:state.step===8?4:state.step<=10?5:state.step===11?6:7;
  root.querySelectorAll<HTMLElement>('[data-route-step]').forEach(el=>{if(Number(el.dataset.routeStep)===position)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  for(const key of new Set([...Object.keys(before),...Object.keys(rows)])){
   const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=key;tr.append(th);
   for(const value of [before[key]??'—',rows[key]??'—']){const td=document.createElement('td');td.textContent=value;tr.append(td);}
   if(before[key]!==rows[key])tr.classList.add('mail-changed');body.append(tr);
  }
  log.replaceChildren();for(const text of labLog(state)){const li=document.createElement('li');li.textContent=text;log.append(li);}
 };
 const reset=()=>{state=initialLab(kind,config());actionLabel='未操作';before=viewRows();message.textContent='初期状態に戻しました。条件に基づく学習用モデルです。';draw();};
 root.querySelector('[data-reset]')!.addEventListener('click',reset);
 root.querySelectorAll<HTMLSelectElement>('[data-field]').forEach(el=>el.addEventListener('change',()=>{if((kind==='trace'&&el.dataset.field==='fault')||(kind==='queue'&&el.dataset.field==='response')||(kind==='imap'&&el.dataset.field==='folder')){message.textContent='障害・応答・同期先条件を変更しました。現在の状態を保持しています。';}else reset();}));
 root.querySelectorAll<HTMLButtonElement>('[data-event]').forEach(button=>button.addEventListener('click',()=>{
  try {const next=labEvent(state,button.dataset.event!,config());before=viewRows();state=next;actionLabel=button.textContent?.trim()||button.dataset.event!;message.textContent=labLog(state).at(-1)||'操作しました。';draw();}
  catch(error){message.textContent=`操作は適用されませんでした：${error instanceof Error?error.message:'条件を確認してください。'}`;}
 }));
 draw();
});
