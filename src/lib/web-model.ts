// Educational, deterministic models. No fetch, real cookies, credentials, or clocks.
const oneOf=(v:string,values:readonly string[])=>{if(!values.includes(v))throw Error(`未定義の入力: ${v}`);};
const finite=(n:number,min=0,max=100000)=>{if(!Number.isFinite(n)||n<min||n>max)throw Error('数値が対象範囲外です。');};
export const methods=['GET','HEAD','POST','PUT','PATCH','DELETE'] as const;
export function methodInfo(method:string){oneOf(method,methods);return {safe:['GET','HEAD'].includes(method),idempotent:['GET','HEAD','PUT','DELETE'].includes(method)};}
export type Response={status:number;headers:Record<string,string>;body:string};
export type Order={id:number;title:string};
export type RequestInput={method:string;path:string;contentType:string;body:string;accept?:string};
export const initialOrders=():Order[]=>[{id:1,title:'架空の注文'}];
export function request(input:RequestInput,orders:Order[]):{response:Response;orders:Order[]}{
 const {method,path,contentType,body}=input;
 if(body.length>4000||path.length>500||!path.startsWith('/')||path.startsWith('//')||/[\r\n#]/.test(path))throw Error('単一の相対パスと4000文字以内の本文を指定してください。');
 const respond=(status:number,data:unknown,headers:Record<string,string>={})=>({response:{status,headers:{...(![204,304].includes(status)?{'Content-Type':'application/json'}:{}),...headers},body:method==='HEAD'||[204,304].includes(status)?'':JSON.stringify(data)},orders:orders.map(o=>({...o}))});
 if(!methods.includes(method as typeof methods[number]))return respond(405,{error:'method not allowed'},{Allow:methods.join(', ')});
 if(input.accept&&input.accept!=='application/json')return respond(406,{error:'only application/json available'});
 const url=new URL(path,'https://api.example.test'),match=/^\/api\/orders(?:\/(\d+))?$/.exec(url.pathname);
 if(!match)return respond(404,{error:'route not found'});
 const id=match[1]?Number(match[1]):null,found=orders.find(o=>o.id===id);
 if(method==='GET'||method==='HEAD')return id===null?respond(200,orders):found?respond(200,found):respond(404,{error:'not found'});
 if(method==='DELETE'){if(id===null)return respond(405,{error:'item path required'},{Allow:'GET, HEAD, POST'});if(!found)return respond(404,{error:'not found'});const r=respond(204,null);r.orders=r.orders.filter(o=>o.id!==id);return r;}
 if((method==='POST'&&id!==null)||(['PUT','PATCH'].includes(method)&&id===null))return respond(405,{error:'method not allowed for path'},{Allow:id===null?'GET, HEAD, POST':'GET, HEAD, PUT, PATCH, DELETE'});
 if(contentType!=='application/json')return respond(415,{error:'JSON required'});
 let value:unknown;try{value=JSON.parse(body);}catch{return respond(400,{error:'invalid JSON'});}
 if(!value||typeof value!=='object'||Array.isArray(value)||typeof (value as {title?:unknown}).title!=='string'||!(value as {title:string}).title.trim()||(value as {title:string}).title.length>80)return respond(400,{error:'title: 1..80 characters required'});
 if(method==='PATCH'&&!found)return respond(404,{error:'not found'});
 const nextId=id??Math.max(0,...orders.map(o=>o.id))+1,next={id:nextId,title:(value as {title:string}).title};
 const r=respond(method==='POST'||!found?201:200,next,{Location:`/api/orders/${nextId}`});r.orders=[...r.orders.filter(o=>o.id!==nextId),next];return r;
}

export const redirectCodes=[301,302,303,307,308] as const;
export function redirected(code:number,method:string,body:string,postToGet=true){
 if(!redirectCodes.includes(code as typeof redirectCodes[number]))throw Error('対象外のリダイレクトです。');oneOf(method,methods);
 const changed=(code===303&&!['GET','HEAD'].includes(method))||([301,302].includes(code)&&method==='POST'&&postToGet);
 return {method:changed?'GET':method,body:changed?'':body};
}
export function redirectChain(code:number,method:string,body:string,loop:boolean,postToGet=true){
 let url='/start';const seen=new Set<string>(),rows:{url:string;method:string;body:string;status:number;location:string}[]=[];
 for(let hop=0;hop<10;hop++){
  const key=method+' '+url;if(seen.has(key))return {rows,stop:'loop' as const};seen.add(key);
  const location=url==='/start'?'/target':loop?'/start':'';
  rows.push({url,method,body,status:location?code:200,location});if(!location)return {rows,stop:'complete' as const};
  ({method,body}=redirected(code,method,body,postToGet));url=location;
 }
 return {rows,stop:'limit' as const};
}

export type CookieConfig={domain:string;path:string;secure:boolean;httpOnly:boolean;sameSite:'Strict'|'Lax'|'None';maxAge:number|null;expires:number};
export type DemoCookie=CookieConfig & {id:string;issued:number};
export type SessionState={now:number;serial:number;cookie:DemoCookie|null;sessions:Record<string,{until:number;valid:boolean}>};
export const initialSession=():SessionState=>({now:0,serial:0,cookie:null,sessions:{}});
export function domainMatch(host:string,domain:string){return host===domain||host.endsWith('.'+domain);}
export function pathMatch(path:string,scope:string){return path===scope||(path.startsWith(scope)&&(scope.endsWith('/')||path[scope.length]==='/'));}
const cookieExpiry=(c:DemoCookie)=>c.issued+(c.maxAge??c.expires);
export function sessionEvent(state:SessionState,event:'login'|'advance'|'logout'|'delete-cookie',config?:CookieConfig){
 const s:SessionState=structuredClone(state);
 if(event==='advance'){s.now+=120;return {state:s,message:'仮想時間を120秒進めました。'};}
 if(event==='delete-cookie'){s.cookie=null;return {state:s,message:'Cookieのみ削除。サーバー側状態は別に残り得ます。'};}
 if(event==='logout'){if(s.cookie&&s.sessions[s.cookie.id])s.sessions[s.cookie.id].valid=false;s.cookie=null;return {state:s,message:'提示中IDのサーバー側状態を無効化しCookieも削除。Cookieがなければ関連IDを特定できません。'};}
 if(event!=='login'||!config)throw Error('ログイン設定が必要です。');
 if(!['','example.test','app.example.test','other.test'].includes(config.domain)||!/^\/[a-zA-Z0-9/_-]*$/.test(config.path))throw Error('CookieのDomainまたはPathが対象範囲外です。');
 oneOf(config.sameSite,['Strict','Lax','None']);if(config.maxAge!==null)finite(config.maxAge,0,3600);finite(config.expires,0,3600);
 if(s.cookie&&s.sessions[s.cookie.id])s.sessions[s.cookie.id].valid=false;
 const id=`demo-${++s.serial}`;s.sessions[id]={until:s.now+120,valid:true};
 const accepted=(!config.domain||domainMatch('app.example.test',config.domain))&&!(config.sameSite==='None'&&!config.secure);
 s.cookie=accepted?{...config,id,issued:s.now}:null;
 return {state:s,message:accepted?'架空IDを更新し旧IDを失効。セッション120秒、Cookie期限は設定に従います。':'サーバー状態は作成済みですがブラウザはCookieを拒否（無関係DomainまたはNone without Secure）。'};
}
export type CookieRequest={host:string;path:string;https:boolean;crossSite:boolean;topLevel:boolean;method:string};
export function cookieRequest(s:SessionState,r:CookieRequest){
 oneOf(r.host,['app.example.test','api.example.test','other.test']);oneOf(r.method,methods);if(!r.path.startsWith('/'))throw Error('送信先Pathが不正です。');
 const c=s.cookie,reasons:string[]=[];
 if(!c)reasons.push('保存Cookieなし');
 if(c){if(s.now>=cookieExpiry(c))reasons.push('Cookie期限切れ');if(c.domain?!domainMatch(r.host,c.domain):r.host!=='app.example.test')reasons.push('Domain不一致');if(!pathMatch(r.path,c.path))reasons.push('Path不一致');if(c.secure&&!r.https)reasons.push('Secure: HTTPSが必要');if(c.sameSite==='Strict'&&r.crossSite)reasons.push('SameSite Strict');if(c.sameSite==='Lax'&&r.crossSite&&!(r.topLevel&&['GET','HEAD'].includes(r.method)))reasons.push('明示SameSite Lax');}
 const sent=reasons.length===0,session=c?s.sessions[c.id]:null,authenticated=sent&&!!session&&session.valid&&s.now<session.until;
 // document.cookie observation is for the fixed issuing document https://app.example.test/ .
 const scriptReadable=!!c&&!c.httpOnly&&s.now<cookieExpiry(c)&&pathMatch('/',c.path);
 return {sent,authenticated,status:authenticated?200:401,scriptReadable,reasons,sessionActive:!!session&&session.valid&&s.now<session.until};
}

export type CorsInput={origin:string;target:string;method:string;contentType:string;extraHeader:string;credentials:'omit'|'same-origin'|'include';allowOrigin:string;allowCredentials:boolean;allowMethods:string[];allowHeaders:string[];preflightOK:boolean};
const knownOrigins=['https://app.example.test','https://api.example.test','https://other.test'];
export function cors(i:CorsInput){
 oneOf(i.origin,knownOrigins);oneOf(i.target,knownOrigins);oneOf(i.method,methods);oneOf(i.credentials,['omit','same-origin','include']);
 oneOf(i.contentType,['','text/plain','application/x-www-form-urlencoded','multipart/form-data','application/json']);oneOf(i.extraHeader,['','Authorization','X-Debug']);
 if(i.allowOrigin!==''&&i.allowOrigin!=='*'&&!knownOrigins.includes(i.allowOrigin))throw Error('対象外の許可Originです。');
 const cross=i.origin!==i.target,credentialed=i.credentials==='include',headers=[...(i.contentType==='application/json'?['content-type']:[]),...(i.extraHeader?[i.extraHeader.toLowerCase()]:[])];
 const preflight=cross&&(!['GET','HEAD','POST'].includes(i.method)||headers.length>0);
 const originOK=i.allowOrigin===i.origin||(i.allowOrigin==='*'&&!credentialed),credentialsOK=!credentialed||i.allowCredentials;
 const allowedHeaders=i.allowHeaders.map(h=>h.toLowerCase());
 const pfOK=i.preflightOK&&originOK&&credentialsOK&&(['GET','HEAD','POST'].includes(i.method)||i.allowMethods.includes(i.method))&&headers.every(h=>allowedHeaders.includes(h)||(allowedHeaders.includes('*')&&!credentialed&&h!=='authorization'));
 const actualSent=!preflight||pfOK,readable=!cross||(actualSent&&originOK&&credentialsOK);
 return {preflight,preflightPassed:preflight?pfOK:null,actualSent,readable,httpStatus:actualSent?200:null,credentialsEligible:i.credentials==='include'||(!cross&&i.credentials==='same-origin'),preflightCredentials:false,reason:!cross?'同一Origin: CORSチェック対象外':preflight&&!pfOK?'Preflight不許可: 実要求なし':!readable?'HTTP応答はあるがJSから参照不可（副作用が起き得る）':'CORS共有成功。認証・認可とCookieの別条件は未判定'};
}

export type CachePolicy='max-age=60'|'no-cache'|'no-store'|'private, max-age=60';
export type CacheEntry={version:number;storedAt:number;policy:CachePolicy};
export type CacheState={now:number;version:number;entry:CacheEntry|null};
export const initialCache=():CacheState=>({now:0,version:1,entry:null});
export function cacheFetch(state:CacheState,policy:CachePolicy,shared:boolean,force=false){
 oneOf(policy,['max-age=60','no-cache','no-store','private, max-age=60']);finite(state.now);finite(state.version,1);
 const s:CacheState=structuredClone(state),old=s.entry;
 // Freshness uses the STORED response policy, not a new setting at the origin.
 if(old&&!force&&old.policy!=='no-cache'&&old.policy!=='no-store'&&!(shared&&old.policy.startsWith('private'))&&s.now-old.storedAt<60)return {state:s,status:null,source:'cache',display:old.version,requestHeaders:{},responseHeaders:{},body:'（通信なし）',note:'新鮮な保存応答を再利用。サーバー設定の変更はまだ受信していません。'};
 const candidate=old&&!(shared&&old.policy.startsWith('private'))?old:null;
 const same=!!candidate&&candidate.version===s.version,status=same?304:200;
 const store=policy!=='no-store'&&!(shared&&policy.startsWith('private'));
 s.entry=store?{version:s.version,storedAt:s.now,policy}:null;
 return {state:s,status,source:same?'revalidated':'origin',display:s.version,requestHeaders:candidate?{'If-None-Match':`"v${candidate.version}"`}:{},responseHeaders:{'Cache-Control':policy,ETag:`"v${s.version}"`},body:status===304?'':`本文 v${s.version}`,note:store?(same?'304の本文は空。保存済み実体を再検証して再利用。':'200で実体を保存。'):'今回の応答は保存しません。他のURLや履歴の一括削除ではありません。'};
}
export function cacheEvent(s:CacheState,event:'advance'|'update'){if(event==='advance')return {...s,now:s.now+60};if(event==='update')return {...s,version:s.version+1};throw Error('対象外の操作です。');}

export function proxyRoute(location:string,pass:string,uri:string,preserveHost:boolean){
 if(!/^\/[a-zA-Z0-9/_-]*$/.test(location)||!/^\/[a-zA-Z0-9/_-]*(?:\?[a-zA-Z0-9_=&%-]*)?$/.test(uri)||uri.includes('//'))throw Error('正規化済みの単純なパスを指定してください。%符号化パス・rewrite・正規表現は対象外です。');
 const m=/^http:\/\/(app|wrong):([0-9]{2,5})(\/[a-zA-Z0-9/_-]*)?$/.exec(pass);if(!m||Number(m[2])>65535)throw Error('転送先は http://app:8080 等の教材用宛先を指定してください。');
 const [path,query]=uri.split('?');if(!path.startsWith(location))return {matched:false,upstream:null,uri:null,host:null,status:404};
 const forwarded=(m[3]===undefined?path:m[3]+path.slice(location.length))+(query===undefined?'':'?'+query);
 return {matched:true,upstream:`http://${m[1]}:${m[2]}${forwarded}`,uri:forwarded,host:preserveHost?'shop.example.test':`${m[1]}:${m[2]}`,status:m[1]==='wrong'||m[2]!=='8080'?502:200};
}

export type LBState={cursor:number;actual:[boolean,boolean];known:[boolean,boolean];local:[boolean,boolean];sharedSession:boolean;affinity:number|null;history:string[]};
export const initialLB=():LBState=>({cursor:0,actual:[true,true],known:[true,true],local:[false,false],sharedSession:false,affinity:null,history:[]});
export function lbEvent(state:LBState,event:string,sticky:boolean,shared:boolean){
 const s:LBState=structuredClone(state);oneOf(event,['login','request','stop-a','stop-b','recover','check']);
 if(event==='stop-a'||event==='stop-b'){const n=event==='stop-a'?0:1;s.actual[n]=false;s.local[n]=false;s.history.push(`${n===0?'A':'B'}停止。ローカル状態消失。チェック結果はまだ古い。`);return {state:s,status:null,node:null};}
 if(event==='recover'){s.actual=[true,true];s.history.push('両台の稼働を復帰。チェック更新は別操作。');return {state:s,status:null,node:null};}
 if(event==='check'){s.known=[...s.actual];s.history.push('ヘルスチェックで振分け先の稼働判定を更新。');return {state:s,status:null,node:null};}
 const candidates=[0,1].filter(n=>s.known[n]);
 if(!candidates.length){s.history.push('503: 利用可能と判定した対象なし。');return {state:s,status:503,node:null};}
 const node=sticky&&s.affinity!==null&&candidates.includes(s.affinity)?s.affinity:candidates[s.cursor%candidates.length];s.cursor++;
 if(!s.actual[node]){s.history.push(`${node===0?'A':'B'}へ接続失敗 → この構成では502。`);return {state:s,status:502,node};}
 s.affinity=node;if(event==='login'){if(shared)s.sharedSession=true;else s.local[node]=true;}
 const status=event==='login'||(shared?s.sharedSession:s.local[node])?200:401;
 s.history.push(`${event==='login'?'ログイン':'要求'} → ${node===0?'A':'B'} / ${shared?'共有':'ローカル'} / ${status}`);
 s.history=s.history.slice(-40);return {state:s,status,node};
}

export const layers=['Browser','DNS / Connection','CDN / Load Balancer','Reverse Proxy','Application','Database'] as const;
export const faults=['none','dns','tls','connection','proxy','app','db','db-slow','upstream-timeout','session','cors','stale'] as const;
export type Fault=typeof faults[number];
export const faultLabels:Record<Fault,string>={none:'正常系',dns:'DNS名前解決失敗',tls:'TLS接続失敗',connection:'ブラウザの接続失敗',proxy:'nginx転送先誤り',app:'アプリ例外',db:'DB接続失敗','db-slow':'DB処理遅延','upstream-timeout':'upstream応答タイムアウト',session:'セッション期限切れ',cors:'CORSで応答参照不可',stale:'CDNに古いデータ'};
export type TraceStep={layer:number;ms:number;log:string};
export function trace(fault:Fault,input:RequestInput={method:'GET',path:'/api/orders',contentType:'application/json',body:''}){
 oneOf(fault,faults);oneOf(input.method,methods);if(!/^\/(?!\/)[^\r\n#]*$/.test(input.path)||input.path.length>500||input.body.length>4000)throw Error('単一の相対URLと短い架空本文を指定してください。');
 const steps:TraceStep[]=[{layer:0,ms:0,log:`req-demo ${input.method} https://shop.example.test${input.path}`},{layer:1,ms:20,log:'DNS成功・TCP/TLS接続成功（HTTP/2を仮定）'}];
 let status:number|null=200,readable=true,symptom='画面からデータを参照できる。追加資源・描画は本モデル対象外。',body='{"orders":[{"id":1,"title":"架空の注文 v2"}]}',issuer=4;
 if(['dns','tls','connection'].includes(fault)){status=null;readable=false;issuer=1;body='';steps[1]={layer:1,ms:fault==='dns'?10:30,log:fault==='dns'?'DNS NXDOMAIN':fault==='tls'?'TLS certificate verification failed':'TCP connection refused (browser → edge)'};symptom=`${faultLabels[fault]}。HTTP応答なし。`;}
 else{
  steps.push({layer:2,ms:5,log:fault==='stale'?'CDN cache HIT v1 (fresh)':'LB healthy target → nginx'});
  if(fault==='stale'){issuer=2;body='{"orders":[{"id":1,"title":"架空の注文 v1"}]}';symptom='HTTP200だが旧版。アプリとDBには到達しない。';}
  else{
   steps.push({layer:3,ms:fault==='proxy'?15:3,log:fault==='proxy'?'connect() failed: upstream app:8099':`proxy ${input.path} → app:8080${input.path.startsWith('/api/')?'/'+input.path.slice(5):input.path}`});
   if(fault==='proxy'){status=502;issuer=3;symptom='nginxが502を生成。誤ポートへの接続拒否。';}
   else{
    steps.push({layer:4,ms:fault==='upstream-timeout'?1000:12,log:fault==='app'?'Unhandled exception':fault==='session'?'Session expired':fault==='upstream-timeout'?'App handler stalled; no response before 1000ms':'Request accepted; authorization passed'});
    if(fault==='app'){status=500;issuer=4;symptom='アプリの未処理例外により500。';}
    else if(fault==='session'){status=401;issuer=4;symptom='アプリで期限切れ。DB呼出し前に401。';}
    else if(fault==='upstream-timeout'){status=504;issuer=3;symptom='nginxの上流待ちが仮想1000msを超え504。処理結果は未確定。';}
    else{
     steps.push({layer:5,ms:fault==='db-slow'?1500:fault==='db'?40:25,log:fault==='db'?'DB connection failed':fault==='db-slow'?'DB lock wait 1500ms (eventual outcome unmodeled)':'SELECT synthetic orders complete'});
     if(fault==='db'){status=500;issuer=4;symptom='DB接続失敗をアプリが捕捉し500を返す前提。';}
     if(fault==='db-slow'){status=504;issuer=3;symptom='DB待ちがnginxの仮想1000ms締切を超え504。更新結果は未確定。';}
     if(fault==='cors'){readable=false;symptom='サーバーは200を返したが、ACAOなしのため別OriginのJSは応答を読めない。';}
    }
   }
  }
 }
 if(status!==null&&status>=400)body=JSON.stringify({error:status,requestId:'req-demo'});
 if(input.method==='HEAD'||[204,304].includes(status??0))body='';
 const elapsed=steps.reduce((n,s)=>n+s.ms,0),observedMs=['db-slow','upstream-timeout'].includes(fault)?1028:elapsed;
 return {steps,status,readable,symptom,issuer,observedMs,body,request:{method:input.method,url:`https://shop.example.test${input.path}`,headers:{Host:'shop.example.test',Accept:'application/json','Content-Type':input.contentType,'X-Request-ID':'req-demo'},body:input.body},responseHeaders:status===null?{}:{'Content-Type':'application/json','X-Request-ID':'req-demo',...(status===401?{'WWW-Authenticate':'Session realm="demo"'}:{}),...(fault==='stale'?{'Age':'30','Cache-Control':'max-age=60'}:{})}};
}
export type TraceState={fault:Fault;cursor:number;history:string[];input:RequestInput;started:boolean};
export const initialTrace=():TraceState=>({fault:'none',cursor:0,history:[],input:{method:'GET',path:'/api/orders',contentType:'application/json',body:''},started:false});
export function traceEvent(state:TraceState,event:'send'|'step',fault:Fault=state.fault,input=state.input){
 const s:TraceState=structuredClone(state);
 if(event==='send'){trace(fault,input);s.fault=fault;s.input={...input};s.cursor=1;s.started=true;s.history.push(`送信: ${faultLabels[fault]} / ${input.method} ${input.path}`);}
 else if(event==='step'){if(!s.started)throw Error('先に送信してください。');const result=trace(s.fault,s.input);if(s.cursor<result.steps.length){const step=result.steps[s.cursor++];s.history.push(`${layers[step.layer]}: ${step.log}`);}}
 else throw Error('対象外の操作です。');
 s.history=s.history.slice(-80);return s;
}
