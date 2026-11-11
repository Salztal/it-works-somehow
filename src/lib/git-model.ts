// Educational model: whole-file three-way comparison, no network or filesystem API.
export type Tree = Record<string,string>;
export type Commit = {id:string;parents:string[];tree:Tree;message:string;source?:string};
type Snapshot = {head:string|null;detached:string|null;branches:Record<string,string>;wt:Tree;index:Tree};
type Pending = {kind:'merge'|'pick'|'rebase'|'revert';before:Snapshot;target:string;conflicts:string[];resolved:string[];staged:string[];queue:string[];branch?:string;original?:string};
export type GitState = Snapshot & {commits:Commit[];reflog:{from:string;to:string;reason:string}[];history:string[];pending?:Pending;message:string;serial:number};
export type Action = {type:'branch'|'switch'|'edit'|'stage'|'commit'|'merge'|'squash'|'pick'|'rebase'|'revert'|'reset'|'rescue'|'resolve'|'continue'|'abort';target?:string;file?:string;value?:string};
export const tip=(s:GitState):string=>s.head ? s.branches[s.head] : s.detached!;
export const getCommit=(s:GitState,id:string)=>s.commits.find(c=>c.id===id)!;
const clone=<T>(x:T):T=>structuredClone(x);
const equal=(a:Tree,b:Tree)=>JSON.stringify(Object.entries(a).sort())===JSON.stringify(Object.entries(b).sort());
const snapshot=(s:GitState):Snapshot=>clone({head:s.head,detached:s.detached,branches:s.branches,wt:s.wt,index:s.index});
export const clean=(s:GitState)=>equal(s.wt,s.index)&&equal(s.index,getCommit(s,tip(s)).tree);
export function reachable(s:GitState,id:string):Set<string>{const out=new Set<string>();const visit=(x:string)=>{if(out.has(x))return;out.add(x);getCommit(s,x)?.parents.forEach(visit);};visit(id);return out;}
const move=(s:GitState,to:string,reason:string)=>{const from=tip(s);if(s.head)s.branches[s.head]=to;else s.detached=to;s.reflog.unshift({from,to,reason});};
function record(s:GitState,parents:string[],tree:Tree,message:string,source?:string){const id=`N${++s.serial}`;s.commits.push({id,parents,tree:clone(tree),message,source});move(s,id,message);s.index=clone(tree);s.wt=clone(tree);return id;}
function mergeTrees(base:Tree,ours:Tree,theirs:Tree){const tree=clone(ours),conflicts:string[]=[];
 for(const file of new Set([...Object.keys(base),...Object.keys(ours),...Object.keys(theirs)])){
   if(theirs[file]===base[file] || ours[file]===theirs[file])continue;
   if(ours[file]===base[file]){if(theirs[file]===undefined)delete tree[file];else tree[file]=theirs[file];}
   else {conflicts.push(file);tree[file]=`<<<<<<< 現在側\n${ours[file]??'(削除)'}\n=======\n${theirs[file]??'(削除)'}\n>>>>>>> 適用側`;}
 }return {tree,conflicts};}
function apply(s:GitState,base:Tree,theirs:Tree,p:Pending){const ours=getCommit(s,tip(s)).tree,{tree,conflicts}=mergeTrees(base,ours,theirs);s.wt=tree;s.index=clone(tree);p.conflicts=conflicts;p.resolved=[];p.staged=[];s.pending=p;
 // Conflict paths have unmerged index entries, represented separately rather than a stage-0 blob.
 for(const f of conflicts)delete s.index[f];
 if(conflicts.length){s.message=`${p.kind}を停止：${conflicts.join(', ')} が競合。最終形へ編集し、ステージ後に続行するか、中断してください。`;return false;}return true;}
function replay(s:GitState,p:Pending){while(p.queue.length){const original=p.queue.shift()!,c=getCommit(s,original);p.target=original;
 if(!apply(s,getCommit(s,c.parents[0]).tree,c.tree,p))return;
 record(s,[tip(s)],s.index,`${c.message}（再適用）`,original);
 }s.branches[p.branch!]=tip(s);s.head=p.branch!;s.detached=null;s.pending=undefined;s.message='rebase完了。元のコミットは残り、作業ブランチは再作成した先端を指します。基準ブランチは不変です。';}
export function transition(input:GitState,a:Action):GitState{
 const s=clone(input);const fail=(message:string)=>({...clone(input),message:`操作できません：${message}`});
 const allowed=['resolve','stage','continue','abort'];
 if(s.pending&&!allowed.includes(a.type))return fail('進行中の操作を解決・続行するか、中断してから次へ進んでください。');
 const target=a.target ? s.branches[a.target]??a.target : undefined;
 const needsTarget=['switch','merge','squash','pick','rebase','revert','reset'];
 if(needsTarget.includes(a.type)&&(!target||!getCommit(s,target)))return fail('対象のブランチまたはコミットがありません。');
 if(['switch','merge','squash','pick','rebase','revert'].includes(a.type)&&!clean(s))return fail('この演習では開始前をクリーンにします。編集・Indexを確認し、記録してから操作してください。');
 const before=snapshot(s),old=tip(s);
 switch(a.type){
 case 'branch':case 'rescue':{
   const name=a.type==='rescue'?'rescue-found':a.target;
   if(!name||!/^[-\w/]+$/.test(name)||s.branches[name])return fail('新しい未使用のブランチ名が必要です。');
   const id=a.type==='rescue'?a.value:old;
   if(!id||!getCommit(s,id))return fail('救出候補のコミットがありません。');
   s.branches[name]=id;s.message=`${name} → ${id} を作成。HEAD・Index・作業ファイルは不変です。`;break;}
 case 'switch':if(!a.target||!s.branches[a.target])return fail('この演習はブランチへの切替だけを扱います。');s.head=a.target;s.detached=null;s.index=clone(getCommit(s,target!).tree);s.wt=clone(s.index);s.reflog.unshift({from:old,to:tip(s),reason:`switch ${a.target}`});s.message=`HEAD → ${a.target} → ${tip(s)} に切替。作業ファイルとIndexもその記録へ更新。`;break;
 case 'edit':if(!a.file||a.value===undefined)return fail('ファイルと内容を指定してください。');s.wt[a.file]=a.value;s.message='Working Treeだけ変更。Indexと履歴はまだ変わりません。';break;
 case 'resolve':if(!s.pending||!a.file||!s.pending.conflicts.includes(a.file)||a.value===undefined)return fail('競合ファイルと最終形が必要です。');s.wt[a.file]=a.value;s.pending.resolved=[...new Set([...s.pending.resolved,a.file])];s.pending.staged=s.pending.staged.filter(f=>f!==a.file);s.message='最終形をWorking Treeへ設定。まだ解決済みとしてステージしていません。';break;
 case 'stage':{
   if(!a.file||s.wt[a.file]===undefined)return fail('この演習では存在するファイルを指定します。');
   if(s.pending?.conflicts.includes(a.file)&&!s.pending.resolved.includes(a.file))return fail('先に双方の意図を読んで最終形を選んでください。');
   s.index[a.file]=s.wt[a.file];if(s.pending)s.pending.staged=[...new Set([...s.pending.staged,a.file])];s.message='Indexへ現在のファイルをコピー。HEADは不変。';break;}
 case 'commit':if(equal(s.index,getCommit(s,old).tree))return fail('Indexに新しい変更がありません。');record(s,[old],s.index,'案内文を訂正');s.message='Indexからコミット作成。現在のブランチだけが進みます。';
   // record must not discard edits made after staging.
   s.wt=before.wt;break;
 case 'merge':case 'squash':{
   if(reachable(s,old).has(target!)){s.message='既に対象の履歴を含んでいます。変更なし。';break;}
   if(a.type==='merge'&&reachable(s,target!).has(old)){move(s,target!,'merge fast-forward');s.wt=clone(getCommit(s,target!).tree);s.index=clone(s.wt);s.message='fast-forward：既存コミットへ参照を移動。新規コミットなし。';break;}
   const other=reachable(s,target!);const base=[...reachable(s,old)].find(x=>other.has(x));if(!base)return fail('共通祖先がありません。');
   const result=mergeTrees(getCommit(s,base).tree,s.wt,getCommit(s,target!).tree);
   if(a.type==='squash'){
     if(result.conflicts.length)return fail('競合するsquashはこの限定演習の対象外です。G08の静的ケースを参照してください。');
     s.wt=result.tree;s.index=clone(result.tree);s.message='squash：統合相当の変更をIndexへ。HEAD不変、MERGE_HEADなし。次は差分を確認して記録。';
   }else{const p:Pending={kind:'merge',before,target:target!,conflicts:[],resolved:[],staged:[],queue:[]};if(apply(s,getCommit(s,base).tree,getCommit(s,target!).tree,p)){record(s,[old,target!],s.index,'作業を統合');s.pending=undefined;s.message='親2つのmerge commitを作成。相手ブランチは不変。';}}break;}
 case 'pick':case 'revert':{
   const c=getCommit(s,target!);if(c.parents.length!==1)return fail('この演習は親1つの通常コミットのみ扱います。');
   const base=a.type==='pick'?getCommit(s,c.parents[0]).tree:c.tree;
   const theirs=a.type==='pick'?c.tree:getCommit(s,c.parents[0]).tree;
   const result=mergeTrees(base,s.wt,theirs);if(!result.conflicts.length&&equal(result.tree,s.wt))return fail('差分が空です。重複適用等を確認してください。この演習では空の変更を記録しません。');
   const p:Pending={kind:a.type==='pick'?'pick':'revert',before,target:target!,conflicts:[],resolved:[],staged:[],queue:[]};
   if(apply(s,base,theirs,p)){record(s,[old],s.index,a.type==='pick'?`${c.message}（選択適用）`:`${target}を打消す`,target);s.pending=undefined;s.message=a.type==='pick'?'選んだ差分から新しいコミットを作成。元のコミットとブランチは不変。':'元のコミットを残し、逆向きの差分を新しい打消しコミットとして追加。';}break;}
 case 'rebase':{
   if(!s.head)return fail('作業ブランチ上で始めてください。');
   if(reachable(s,old).has(target!)){s.message='既に基準を祖先に含みます。この通常ケースでは並べ直し不要です。';break;}
   const anc=reachable(s,target!),queue:string[]=[];let id=old;
   while(!anc.has(id)){const c=getCommit(s,id);if(c.parents.length!==1)return fail('この演習は合流を含まない通常コミットだけを並べ直します。');queue.unshift(id);id=c.parents[0];}
   if(!queue.length&&anc.has(old)){move(s,target!,'rebase fast-forward');s.wt=clone(getCommit(s,target!).tree);s.index=clone(s.wt);s.message='再適用不要。基準が先にあるので早送り。';break;}
   if(queue.some(id=>equal(getCommit(s,id).tree,getCommit(s,getCommit(s,id).parents[0]).tree)))return fail('空コミットの再適用は対象外。');
   const p:Pending={kind:'rebase',before,target:target!,conflicts:[],resolved:[],staged:[],queue,branch:s.head,original:old};
   s.head=null;s.detached=target!;s.reflog.unshift({from:old,to:target!,reason:'rebase start (detached HEAD)'});s.wt=clone(getCommit(s,target!).tree);s.index=clone(s.wt);replay(s,p);break;}
 case 'reset':move(s,target!,'reset --mixed');s.index=clone(getCommit(s,target!).tree);s.message='mixed reset：ブランチとIndexを指定先へ。Working Treeは保持。元の先端はreflogに記録。';break;
 case 'continue':{
   const p=s.pending;if(!p)return fail('進行中の操作がありません。');
   if(p.conflicts.some(f=>!p.resolved.includes(f)||!p.staged.includes(f)||s.index[f]!==s.wt[f]))return fail('全競合の最終形を選び、その内容をステージしてください。');
   if(p.kind==='merge'){record(s,[old,p.target],s.index,'競合を解決して統合');s.pending=undefined;s.message='双方の意図を含む親2つの合流記録を作成。';}
   else if(p.kind==='rebase'){const c=getCommit(s,p.target);record(s,[old],s.index,`${c.message}（再適用）`,c.id);replay(s,p);}
   else{record(s,[old],s.index,p.kind==='pick'?'競合を解決して選択適用':'競合を解決して打消し',p.target);s.pending=undefined;s.message='競合を解決し、新しい通常コミットを作成。';}break;}
 case 'abort':if(!s.pending)return fail('進行中の操作がありません。');{const from=tip(s),p=s.pending;Object.assign(s,clone(p.before));s.pending=undefined;s.reflog.unshift({from,to:tip(s),reason:`${p.kind} --abort`});s.message='クリーンだった開始状態へ復帰。中断後の解決編集は戻ります。必要なら事前にメモしてください。';}break;
 }
 s.history.push(`${a.type}${a.target?' '+a.target:''}：${s.message}`);return s;
}
export const scenarios = [
 ['branch','新しい作業を始めて記録する'],['ff','相手の続きへ早送りする'],['merge','別々に進んだ作業を統合する'],['squash','複数の修正を1件にまとめる'],['pick','この修正だけ別の枝へ持っていく'],['rebase','未公開作業を新しい基準へ並べ直す'],['conflict','割引と税込表示の競合を解決する'],['pick-conflict','選んだ修正が競合した'],['rebase-conflict','並べ直しの途中で競合した'],['revert','共有した通常コミットを打ち消す'],['rescue','見えなくなった記録を救出する']
] as const;
export function initial(scenario:string):GitState{
 const A:Commit={id:'A',parents:[],tree:{'guide.txt':'利用案内','price.txt':'price = base'},message:'開始'};
 const B:Commit={id:'B',parents:['A'],tree:{...A.tree,'main.txt':'mainの別作業'},message:'基準側の追加'};
 const C:Commit={id:'C',parents:['A'],tree:{...A.tree,'guide.txt':'利用案内：受付9時'},message:'受付時間を追記'};
 const D:Commit={id:'D',parents:['C'],tree:{...C.tree,'topic.txt':'追加案内'},message:'詳細案内を追加'};
 let commits=[A,B,C,D],branches:Record<string,string>={main:'B',topic:'D'},head='main';
 if(scenario==='branch'){commits=[A];branches={main:'A'};}
 if(scenario==='ff'){commits=[A,C,D];branches={main:'A',topic:'D'};}
 if(scenario==='pick')branches={main:'B',topic:'C'};
 if(scenario==='rebase')head='topic';
 if(['conflict','pick-conflict','rebase-conflict'].includes(scenario)){
   B.tree={...A.tree,'price.txt':'price = base * 1.1'};B.message='税込表示';
   C.tree={...A.tree,'price.txt':'price = base * 0.9'};C.message='割引計算';
   commits=[A,B,C];branches={main:'B',topic:'C'};if(scenario==='rebase-conflict')head='topic';
 }
 if(scenario==='revert'||scenario==='rescue'){commits=[A,C];branches={main:'C'};}
 const tree=clone(commits.find(c=>c.id===branches[head])!.tree);
 return {head,detached:null,branches,commits,wt:clone(tree),index:clone(tree),reflog:[],history:[],serial:0,message:'開始状態です。図と各領域を読み、目的に合う操作を選びます。'};
}
