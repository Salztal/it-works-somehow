import {initial,transition,tip,reachable,scenarios,type GitState,type Action} from './git-model';
const root=document.querySelector<HTMLElement>('#git-lab')!;
const q=<T extends HTMLElement=HTMLElement>(selector:string)=>root.querySelector<T>(selector)!;
const select=q<HTMLSelectElement>('#git-scenario');
const requested=new URLSearchParams(location.search).get('scenario');
if(scenarios.some(([id])=>id===requested))select.value=requested!;
let start=initial(select.value),state=structuredClone(start);
function node<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;}
function graph(host:HTMLElement,s:GitState){host.replaceChildren();const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');const width=Math.max(620,s.commits.length*150+70);svg.setAttribute('viewBox',`0 0 ${width} 260`);svg.style.minWidth=`${width}px`;svg.setAttribute('role','img');svg.setAttribute('aria-label','コミットと親子関係。詳細は文字の親一覧を参照。');
 const positions=new Map(s.commits.map((c,i)=>[c.id,{x:60+i*150,y:c.id==='C'||c.id==='D'?160:80}]));
 const visible=new Set<string>();Object.values(s.branches).forEach(id=>reachable(s,id).forEach(id=>visible.add(id)));if(s.detached)reachable(s,s.detached).forEach(id=>visible.add(id));
 for(const c of s.commits){const pos=positions.get(c.id)!;for(const p of c.parents){const parent=positions.get(p)!;const line=document.createElementNS(ns,'path');line.setAttribute('d',`M${pos.x-15},${pos.y} C${pos.x-65},${pos.y} ${parent.x+65},${parent.y} ${parent.x+15},${parent.y}`);line.setAttribute('class','git-edge');if(!visible.has(c.id))line.setAttribute('opacity','.35');svg.append(line);}}
 for(const c of s.commits){const {x,y}=positions.get(c.id)!;const group=document.createElementNS(ns,'g');if(!visible.has(c.id))group.setAttribute('opacity','.4');const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx',String(x));circle.setAttribute('cy',String(y));circle.setAttribute('r','17');circle.setAttribute('class',tip(s)===c.id?'git-node git-current':'git-node');group.append(circle);
  const text=(value:string,dy:number,cls:string)=>{const t=document.createElementNS(ns,'text');t.setAttribute('x',String(x));t.setAttribute('y',String(y+dy));t.setAttribute('text-anchor','middle');t.setAttribute('class',cls);t.textContent=value;group.append(t);};
  text(c.id,5,'git-node-id');const refs=Object.entries(s.branches).filter(([,id])=>id===c.id).map(([name])=>name);if(tip(s)===c.id)refs.unshift(s.head?'HEAD':'HEAD (detached)');refs.forEach((r,i)=>text(r,-28-i*19,'git-ref'));text(c.source?`元 ${c.source} の差分`:`親 ${c.parents.join(' + ')||'なし'}`,42,'git-parent');svg.append(group);
 }host.append(svg);}
const dump=(tree:Record<string,string>)=>Object.entries(tree).map(([f,v])=>`${f}\n  ${v.replaceAll('\n','\n  ')}`).join('\n\n')||'（ファイルなし）';
function action(host:HTMLElement,label:string,a:Action){const b=node('button',label);b.type='button';b.className='button secondary';b.addEventListener('click',()=>{state=transition(state,a);render();});host.append(b);}
function render(){graph(q('[data-graph]'),state);q('[data-head]').textContent=`HEAD → ${state.head??'(detached)'} → ${tip(state)}${state.pending?` ／ ${state.pending.kind}進行中`:''}`;q('[data-lab-message]').textContent=state.message;
 q('[data-working-tree]').textContent=dump(state.wt);q('[data-index]').textContent=dump(state.index)+(state.pending?.conflicts.length?'\n\n競合パス：'+state.pending.conflicts.map(f=>`${f} (${state.pending!.staged.includes(f)?'解決内容をステージ済み':'未統合エントリー・stage 1/2/3相当'})`).join(', '):'');
 const parents=q('[data-parent-list]');parents.replaceChildren(...state.commits.map(c=>node('li',`${c.id}：${c.message} / 親 ${c.parents.join(', ')||'なし'}${c.source?` / 適用元 ${c.source}`:''}`)));
 q('[data-state-diff]').textContent=`HEAD: ${start.head} → ${state.head??'detached'}\n先端: ${tip(start)} → ${tip(state)}\n新規コミット: ${state.commits.filter(c=>!start.commits.some(x=>x.id===c.id)).map(c=>c.id).join(', ')||'なし'}\nブランチ: ${JSON.stringify(start.branches)}\n        → ${JSON.stringify(state.branches)}\nWorking Tree変更: ${Object.keys({...start.wt,...state.wt}).filter(f=>start.wt[f]!==state.wt[f]).join(', ')||'なし'}\nIndex変更: ${Object.keys({...start.index,...state.index}).filter(f=>start.index[f]!==state.index[f]).join(', ')||'なし'}`;
 q('[data-lab-history]').replaceChildren(...(state.history.length?state.history.map(h=>node('li',h)):[node('li','まだ操作していません。')]));
 q('[data-reflog]').replaceChildren(...(state.reflog.length?state.reflog.map((r,i)=>node('li',`${i}：${r.from} → ${r.to} / ${r.reason}`)):[node('li','この演習ではまだ参照を移動していません。')]));
 const host=q('[data-lab-actions]');host.replaceChildren();const conflict=!!state.pending;q('[data-conflict-panel]').hidden=!conflict;
 q('[data-resolution-feedback]').textContent=state.pending?.resolved.includes('price.txt')?(state.wt['price.txt']==='price = base * 0.9 * 1.1'?'両方の要件が残っています。ステージと続行へ進めます。':'片方の要件が失われています。最終形を選び直してください。'):'';
 if(conflict){const h=q('[data-conflict-actions]');h.replaceChildren();const b=node('button','選んだ最終形に編集する');b.className='button secondary';b.type='button';b.addEventListener('click',()=>{state=transition(state,{type:'resolve',file:'price.txt',value:q<HTMLSelectElement>('#git-resolution').value});render();});h.append(b);action(h,'解決したファイルをステージする',{type:'stage',file:'price.txt'});const cont=node('button','進行中の操作を続行する');cont.type='button';cont.className='button';cont.addEventListener('click',()=>{if(state.wt['price.txt']!=='price = base * 0.9 * 1.1'){q('[data-resolution-feedback]').textContent='この演習の要件は割引と税込表示の両方です。最終形を見直してください。';return;}state=transition(state,{type:'continue'});render();});h.append(cont);action(h,'この操作を中断して開始前へ戻る',{type:'abort'});return;}
 const scenario=select.value;
 if(scenario==='branch'){
  if(!state.branches['task/guide'])action(host,'新しい作業場所を作る',{type:'branch',target:'task/guide'});
  if(state.branches['task/guide']&&state.head!=='task/guide')action(host,'作った作業場所へ移る',{type:'switch',target:'task/guide'});
  action(host,'案内文を編集する',{type:'edit',file:'guide.txt',value:'利用案内：受付9時'});action(host,'案内文を次の記録に選ぶ',{type:'stage',file:'guide.txt'});action(host,'選んだ内容を記録する',{type:'commit'});
  if(state.head==='task/guide')action(host,'基準のmainへ戻って比べる',{type:'switch',target:'main'});
 }else if(scenario==='merge'||scenario==='ff'||scenario==='conflict')action(host,'相手の作業全体を統合する',{type:'merge',target:'topic'});
 else if(scenario==='squash'){action(host,'変更をまとめてIndexに用意する',{type:'squash',target:'topic'});action(host,'まとめた変更を1件として記録する',{type:'commit'});}
 else if(scenario==='pick'||scenario==='pick-conflict')action(host,'この修正だけを適用する',{type:'pick',target:'C'});
 else if(scenario==='rebase'||scenario==='rebase-conflict')action(host,'未公開作業をmainの続きに並べ直す',{type:'rebase',target:'main'});
 else if(scenario==='revert')action(host,'元の記録Cを残し、変更を打ち消す',{type:'revert',target:'C'});
 else if(scenario==='rescue'){
  action(host,'1つ前へ位置とIndexを戻す（編集は残す）',{type:'reset',target:'A'});
  const candidate=state.reflog.find(r=>r.from==='C');if(candidate&&!state.branches['rescue-found'])action(host,'移動履歴のCを確認し、救出名を付ける',{type:'rescue',value:candidate.from});
 }
 q('[data-lab-goal]').textContent=scenarios.find(([id])=>id===scenario)![1]+'。操作前後の領域を比較し、履歴を読み取ってください。';
}
function reset(){start=initial(select.value);state=structuredClone(start);graph(q('[data-start-graph]'),start);q('[data-start-state]').textContent=`HEAD → ${start.head} → ${tip(start)}\nWorking Tree / Index:\n${dump(start.wt)}`;q<HTMLSelectElement>('#git-resolution').selectedIndex=0;render();}
select.addEventListener('change',()=>{const u=new URL(location.href);u.searchParams.set('scenario',select.value);history.replaceState(null,'',u);reset();});q('[data-lab-reset]').addEventListener('click',reset);reset();
