// Educational state model, not a persistence provider. See the UI's explicit assumptions.
export type JPAState={scenario:string;tx:'active'|'committed'|'rolled-back';java:number|null;id:number|null;status:'absent'|'new'|'managed'|'detached'|'removed';pc:number|null;linked:boolean;removed:boolean;db:number|null;committed:number|null;sql:string[];log:string[]};
export function initialJPA(scenario='existing'):JPAState {
 if(!['existing','new'].includes(scenario))throw Error('注文シナリオが未定義です。');
 return {scenario,tx:'active',java:scenario==='new'?1:null,id:scenario==='new'?null:42,status:scenario==='new'?'new':'absent',pc:null,linked:false,removed:false,db:scenario==='new'?null:1,committed:scenario==='new'?null:1,sql:[],log:['学習用Transaction開始。確定前のDB作業領域を用意。']};
}
export function pendingJPA(s:JPAState):string[] {
 if(s.tx!=='active')return [];
 if(s.removed)return s.db===null?[]:['DELETE orders WHERE id=42'];
 if(s.pc===null || s.pc===s.db)return [];
 return [s.db===null?`INSERT orders (id, quantity) VALUES (42, ${s.pc})`:`UPDATE orders SET quantity=${s.pc} WHERE id=42`];
}
export function jpaEvent(input:JPAState,event:string):JPAState {
 const s=structuredClone(input);const say=(t:string)=>s.log.push(t);const require=(v:boolean,t:string)=>{if(!v)throw Error(t);};
 require(['find','change','persist','merge','save','change-managed','remove','flush','detach','commit','rollback'].includes(event),'未定義の操作です。');
 // A Java reference may be changed even after the Context's lifetime ends.
 if(event==='change'){require(s.java!==null,'先に取得するか新規シナリオを選んでください。');s.java!++;if(s.linked)s.pc=s.java;say(`元参照の数量を${s.java}へ。${s.linked?'管理側も同じ参照。':'管理側は追跡しない。'}`);return s;}
 require(s.tx==='active','Transaction終了後です。新しい試行はリセットしてください。');
 const persist=()=>{require(s.status==='new'&&s.pc===null,'persistはこのモデルではnewのみです。');s.id=42;s.status='managed';s.pc=s.java;s.linked=true;say('persist：元参照をmanagedへ。採番SQLは省略しINSERTを遅延。');};
 const merge=()=>{require(s.scenario==='existing'&&(s.status==='detached'||s.status==='managed'),'このmerge操作は既存注文シナリオのmanaged/detachedのみを扱います。');require(!s.removed,'削除予定はmergeできません。');s.pc=s.java;if(s.status==='detached'){s.linked=false;say('merge：元はdetachedのまま。戻り値の管理コピーへ状態を転記。');}else say('merge：既にmanaged。追加の確定は行わない。');};
 const flush=()=>{const pending=pendingJPA(s);s.sql.push(...pending);if(s.removed)s.db=null;else if(s.pc!==null)s.db=s.pc;say(pending.length?'flush：書込みSQL発行、DB内へ同期。まだ確定しない。':'flush：同期対象の差分なし。');};
 switch(event){
 case 'find':require(s.scenario==='existing'&&!s.removed,'このシナリオでは既存注文を取得できません。');if(s.pc!==null){s.java=s.pc;s.status='managed';s.linked=true;say('同じContextの管理参照を再利用。SELECT追加なし。');}else{require(s.db!==null,'対象行がありません。');s.java=s.db;s.pc=s.db;s.status='managed';s.linked=true;s.sql.push('SELECT quantity FROM orders WHERE id=42');say('取得：managed参照をContextへ登録。');}break;
 case 'persist':persist();break;
 case 'merge':merge();break;
 case 'save':if(s.status==='new'){persist();say('save：この新規シナリオでは新規判定→persist。');}else{merge();say('save：この既存シナリオでは新規でない判定→merge。戻り値を使う。');}break;
 case 'change-managed':require(s.pc!==null&&!s.removed,'管理対象がありません。');s.pc!++;if(s.linked)s.java=s.pc;say(`管理側の数量を${s.pc}へ。`);break;
 case 'remove':require(s.pc!==null&&!s.removed,'削除できる管理対象がありません。');s.removed=true;if(s.linked)s.status='removed';say('remove：管理対象を削除予定へ。DELETEは同期時。');break;
 case 'detach':require(s.pc!==null&&!s.removed,'このモデルのdetachは削除予定でない管理対象のみです。');s.pc=null;s.linked=false;s.status='detached';say('detach：未同期の差分を追跡から外す。既に発行したSQLは取り消さない。');break;
 case 'flush':flush();break;
 case 'commit':flush();s.committed=s.db;s.tx='committed';s.pc=null;s.linked=false;if(s.java!==null && s.status!=='new')s.status=s.status==='removed'?'new':'detached';say('commit：DB確定。Context終了。削除済み参照はnew相当として表示（再利用は扱わない）。');break;
 case 'rollback':s.db=s.committed;s.tx='rolled-back';s.pc=null;s.linked=false;if(s.java!==null && s.status!=='new')s.status='detached';say('rollback：DB内の未確定変更を取消しContext終了。Javaの値の巻戻しはしない。');break;
 }
 return s;
}
