import assert from 'node:assert/strict';
import fs from 'node:fs';
import {webLessons} from '../src/content/web/course.ts';
import {webMissions} from '../src/content/web/missions.ts';
import {webCases} from '../src/content/web/diagnosis.ts';
import {comparisons} from '../src/content/web/comparisons.ts';
import {labs} from '../src/content/web/labs.ts';
import {sources} from '../src/content/web/sources.ts';
import {labUI} from '../src/content/web/lab-fields.ts';
import {methods,methodInfo,request,initialOrders,redirected,redirectChain,initialSession,sessionEvent,cookieRequest,initialCache,cacheFetch,cacheEvent,cors,proxyRoute,initialLB,lbEvent,trace,traceEvent,initialTrace} from '../src/lib/web-model.ts';
import {empty,validate,grade} from '../src/lib/progress.ts';
import {searchIndex} from '../src/lib/search.ts';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8'),base=process.env.BASE_PATH||'/';
const all=[...webLessons,...webMissions],index=JSON.parse(read('dist/search.json')),catalog=JSON.parse(read('src/generated/web-catalog.json'));
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&#39;',"'").replaceAll('&quot;','"');
assert.equal(webLessons.length,15);assert.equal(webMissions.length,5);assert.equal(webCases.length,13);assert.equal(comparisons.length,12);assert.equal(labs.length,8);
assert.deepEqual([1,2,3,4,5].map(u=>webLessons.filter(l=>l.unit===u).length),[3,3,3,3,3]);
assert.equal(new Set(all.map(l=>l.id)).size,20);assert.equal(catalog.length,20);
// Reviewed answer key, independent of both grade() and the content's correct field.
const answerKey=[[1,2,0],[2,1,0],[1,0,3],[2,0,1],[1,3,0],[2,1,3],[1,0,2],[0,2,1],[2,1,0],[1,0,3],[2,0,1],[3,1,0],[1,2,0],[3,0,2],[1,0,2],[1,2,0],[2,0,1],[1,0,2],[3,1,0],[2,0,1]];
let questions=0,answerBranches=0;const seen=new Set();
all.forEach((l,li)=>{
 const e=index.find(e=>e.key===`web:${l.id}`);assert.ok(e);const html=decode(read('dist/'+e.url.slice(base.length)+'index.html'));
 const prose='unit' in l?l.explanation:[l.background,l.assumptions,...l.evidence,...l.explanation,...l.unknown,...l.risks];
 assert.ok(prose.join('').length>450,'Thin content '+l.id);for(const p of prose)assert.ok(html.includes(p),'Missing rendered prose '+l.id);
 for(const key of l.sources)assert.ok(sources[key]);for(const key of l.related)assert.ok(all.some(o=>o.id===key));assert.ok(labUI[l.lab]);
 assert.equal(l.quiz.length,3);l.quiz.forEach((q,qi)=>{assert.ok(!seen.has(q.question));seen.add(q.question);assert.equal(q.correct,answerKey[li][qi]);assert.equal(q.choices.length,4);assert.equal(q.explanations.length,4);questions++;
 q.choices.forEach((choice,n)=>{assert.ok(q.explanations[n].length>8);assert.ok(html.includes(choice));assert.ok(html.includes(q.explanations[n]));assert.equal(grade(n,q.correct,4),n===answerKey[li][qi]);answerBranches++;});
 });
});
for(const c of webCases){const html=decode(read('dist/web/diagnosis/index.html'));for(const t of [c.first,c.evidence,c.avoid,c.unknown,...c.causes,...c.steps])assert.ok(html.includes(t));for(const key of c.related)assert.ok(webLessons.some(l=>l.id===key));assert.ok(labUI[c.lab]);assert.ok(index.some(e=>e.key===`web:qa-${c.id}`));}
for(const c of comparisons){assert.ok(sources[c.source]);assert.ok(c.when.length>15);assert.ok(index.some(e=>e.key===`web:comparison-${c.id}`));}
for(const [key] of labs){const html=read(`dist/web/lab/${key}/index.html`);assert.ok(html.includes(`data-web-lab="${key}"`));assert.ok(html.includes('初期状態に戻す'));assert.ok(html.includes('aria-live="polite"'));assert.ok(index.some(e=>e.key===`web:lab-${key}`));}
for(const s of Object.values(sources)){assert.equal(s.checked,'2026-11-12');assert.ok(s.version&&s.scope);assert.equal(new URL(s.url).protocol,'https:');}
// Model oracles below are fixed expected results derived from the documented contracts.
assert.deepEqual(methods.map(m=>[m,...Object.values(methodInfo(m))]),[['GET',true,true],['HEAD',true,true],['POST',false,false],['PUT',false,true],['PATCH',false,false],['DELETE',false,true]]);
const req=(method,path='/api/orders',body='{"title":"test"}',contentType='application/json',orders=initialOrders(),accept='application/json')=>request({method,path,body,contentType,accept},orders);
for(const [m,p,b,ct,status] of [['GET','/api/orders','','',200],['HEAD','/api/orders/1','','',200],['POST','/api/orders','{"title":"ok"}','application/json',201],['PUT','/api/orders/1','{"title":"new"}','application/json',200],['PUT','/api/orders/2','{"title":"new"}','application/json',201],['PATCH','/api/orders/9','{"title":"new"}','application/json',404],['POST','/api/orders','broken','application/json',400],['POST','/api/orders','{"title":""}','application/json',400],['POST','/api/orders','title=x','text/plain',415],['DELETE','/api/orders/1','','',204],['DELETE','/api/orders','','',405],['GET','/missing','','',404],['OPTIONS','/api/orders','','',405]])assert.equal(req(m,p,b,ct).response.status,status);
assert.equal(req('HEAD').response.body,'');assert.equal(req('DELETE','/api/orders/1').response.body,'');assert.equal(req('GET','/api/orders','','',initialOrders(),'text/html').response.status,406);
let r=req('POST');r=req('POST','/api/orders','{"title":"test"}','application/json',r.orders);assert.equal(r.orders.length,3);
r=req('PUT','/api/orders/1');const r2=req('PUT','/api/orders/1','{"title":"test"}','application/json',r.orders);assert.deepEqual(r.orders,r2.orders);
r=req('DELETE','/api/orders/1');assert.equal(req('DELETE','/api/orders/1','','',r.orders).response.status,404);
assert.throws(()=>req('GET','https://outside.test'));assert.throws(()=>methodInfo('UNKNOWN'));
for(const [code,method,expected] of [[301,'POST','GET'],[302,'POST','GET'],[303,'PUT','GET'],[303,'HEAD','HEAD'],[307,'POST','POST'],[308,'PUT','PUT'],[302,'PUT','PUT']]){const r=redirected(code,method,'demo');assert.equal(r.method,expected);assert.equal(r.body,expected!==method?'':'demo');}
assert.equal(redirected(302,'POST','demo',false).method,'POST');assert.equal(redirectChain(307,'POST','demo',true).stop,'loop');assert.equal(redirectChain(302,'POST','demo',false).rows[1].method,'GET');assert.throws(()=>redirected(200,'GET',''));
const cfg={domain:'',path:'/',secure:true,httpOnly:true,sameSite:'Lax',maxAge:300,expires:600};
const cr={host:'app.example.test',path:'/api/orders',https:true,crossSite:false,topLevel:false,method:'GET'};
let s=sessionEvent(initialSession(),'login',cfg).state;assert.equal(cookieRequest(s,cr).authenticated,true);assert.equal(cookieRequest(s,cr).scriptReadable,false);
// Cookie sending truth table covers host-only/Domain, Path boundary, Secure, Lax navigation and Strict.
for(const [config,context,sent] of [[{}, {},true],[{}, {host:'api.example.test'},false],[{domain:'example.test'},{host:'api.example.test'},true],[{path:'/app'},{path:'/apple'},false],[{path:'/app'},{path:'/app/orders'},true],[{}, {https:false},false],[{secure:false},{https:false},true],[{}, {crossSite:true},false],[{}, {crossSite:true,topLevel:true},true],[{}, {crossSite:true,topLevel:true,method:'POST'},false],[{sameSite:'Strict'},{crossSite:true,topLevel:true},false],[{sameSite:'None'},{crossSite:true},true],[{sameSite:'None',secure:false},{},false],[{domain:'other.test'},{},false],[{maxAge:0},{},false]]){const state=sessionEvent(initialSession(),'login',{...cfg,...config}).state;assert.equal(cookieRequest(state,{...cr,...context}).sent,sent);}
assert.equal(cookieRequest(sessionEvent(initialSession(),'login',{...cfg,httpOnly:false}).state,cr).scriptReadable,true);
const old=s.cookie.id;s=sessionEvent(s,'login',cfg).state;assert.equal(s.sessions[old].valid,false);s=sessionEvent(s,'advance').state;assert.equal(cookieRequest(s,cr).sent,true);assert.equal(cookieRequest(s,cr).authenticated,false);
s=sessionEvent(initialSession(),'login',cfg).state;s=sessionEvent(s,'delete-cookie').state;assert.equal(s.sessions['demo-1'].valid,true);assert.equal(cookieRequest(s,cr).sent,false);
s=sessionEvent(initialSession(),'login',cfg).state;s=sessionEvent(s,'logout').state;assert.equal(s.sessions['demo-1'].valid,false);assert.equal(s.cookie,null);
assert.throws(()=>sessionEvent(initialSession(),'login',{...cfg,path:'bad'}));
const ci={origin:'https://app.example.test',target:'https://api.example.test',method:'POST',contentType:'application/json',extraHeader:'',credentials:'include',allowOrigin:'https://app.example.test',allowCredentials:true,allowMethods:['GET','HEAD','POST','PUT','PATCH','DELETE'],allowHeaders:['content-type','authorization','x-debug'],preflightOK:true};
// [patch, preflight, actual request sent, JS-readable], checked separately from runtime implementation.
for(const [patch,pf,sent,read] of [[{},true,true,true],[{allowOrigin:'*'},true,false,false],[{allowCredentials:false},true,false,false],[{contentType:'text/plain',allowOrigin:'*'},false,true,false],[{contentType:'text/plain',allowOrigin:''},false,true,false],[{credentials:'omit',allowOrigin:'*'},true,true,true],[{contentType:'',method:'GET',credentials:'omit',allowOrigin:'*'},false,true,true],[{method:'PUT',contentType:'',allowMethods:['GET']},true,false,false],[{contentType:'',method:'GET',extraHeader:'Authorization',allowHeaders:[]},true,false,false],[{preflightOK:false},true,false,false],[{target:'https://app.example.test',allowOrigin:'',allowCredentials:false},false,true,true],[{allowHeaders:[]},true,false,false],[{contentType:'application/x-www-form-urlencoded'},false,true,true],[{contentType:'multipart/form-data'},false,true,true],[{credentials:'same-origin',allowOrigin:'*'},true,true,true]]){const r=cors({...ci,...patch});assert.deepEqual([r.preflight,r.actualSent,r.readable],[pf,sent,read]);assert.equal(r.preflightCredentials,false);}
assert.throws(()=>cors({...ci,method:'TRACE'}));
let cache=initialCache(),cf=cacheFetch(cache,'max-age=60',false);assert.equal(cf.status,200);cache=cf.state;cf=cacheFetch(cache,'max-age=60',false);assert.equal(cf.status,null);
cache=cacheEvent(cache,'advance');cf=cacheFetch(cache,'max-age=60',false);assert.equal(cf.status,304);assert.equal(cf.body,'');assert.deepEqual(cf.requestHeaders,{'If-None-Match':'"v1"'});
cache=cacheEvent(cf.state,'update');cf=cacheFetch(cache,'max-age=60',false);assert.equal(cf.display,1);assert.equal(cf.status,null);cf=cacheFetch(cache,'max-age=60',false,true);assert.equal(cf.status,200);assert.equal(cf.display,2);
cf=cacheFetch(initialCache(),'no-cache',false);assert.ok(cf.state.entry);assert.equal(cacheFetch(cf.state,'no-cache',false).status,304);
cf=cacheFetch(initialCache(),'no-store',false);assert.equal(cf.state.entry,null);assert.equal(cacheFetch(cf.state,'no-store',false).status,200);
assert.equal(cacheFetch(initialCache(),'private, max-age=60',true).state.entry,null);assert.ok(cacheFetch(initialCache(),'private, max-age=60',false).state.entry);
assert.equal(cacheFetch(cacheFetch(initialCache(),'max-age=60',false).state,'no-store',false).status,null,'New origin policy does not erase fresh stored response');
assert.throws(()=>cacheFetch(initialCache(),'unknown',false));
for(const [loc,pass,uri,expected] of [['/api/','http://app:8080','/api/orders?q=1','/api/orders?q=1'],['/api/','http://app:8080/','/api/orders?q=1','/orders?q=1'],['/api/','http://app:8080/v1/','/api/orders','/v1/orders'],['/api','http://app:8080/v1','/api/orders','/v1/orders']])assert.equal(proxyRoute(loc,pass,uri,false).uri,expected);
assert.equal(proxyRoute('/api/','http://app:8080/','/other',false).matched,false);assert.equal(proxyRoute('/api/','http://app:8080/','/api/a',false).host,'app:8080');assert.equal(proxyRoute('/api/','http://app:8080/','/api/a',true).host,'shop.example.test');assert.equal(proxyRoute('/','http://wrong:8080','/a',false).status,502);assert.throws(()=>proxyRoute('/','https://outside.test','/a',true));
for(const [sticky,shared,expected] of [[false,false,401],[true,false,200],[false,true,200],[true,true,200]]){let lb=lbEvent(initialLB(),'login',sticky,shared).state;assert.equal(lbEvent(lb,'request',sticky,shared).status,expected);}
let lb=lbEvent(initialLB(),'login',true,false).state;lb=lbEvent(lb,'stop-a',true,false).state;assert.equal(lbEvent(lb,'request',true,false).status,502);lb=lbEvent(lb,'check',true,false).state;assert.equal(lbEvent(lb,'request',true,false).status,401);lb=lbEvent(lb,'stop-b',true,false).state;lb=lbEvent(lb,'check',true,false).state;assert.equal(lbEvent(lb,'request',true,false).status,503);lb=lbEvent(lb,'recover',true,false).state;lb=lbEvent(lb,'check',true,false).state;assert.equal(lbEvent(lb,'login',true,false).status,200);assert.throws(()=>lbEvent(initialLB(),'unknown',false,false));
// Fault location and HTTP/no-HTTP are explicit fixed oracles, not calculated with the model.
for(const [fault,status,readable,last,issuer,ms] of [['none',200,true,5,4,65],['dns',null,false,1,1,10],['tls',null,false,1,1,30],['connection',null,false,1,1,30],['proxy',502,true,3,3,40],['app',500,true,4,4,40],['db',500,true,5,4,80],['db-slow',504,true,5,3,1028],['upstream-timeout',504,true,4,3,1028],['session',401,true,4,4,40],['cors',200,false,5,4,65],['stale',200,true,2,2,25]]){const r=trace(fault);assert.deepEqual([r.status,r.readable,r.steps.at(-1).layer,r.issuer,r.observedMs],[status,readable,last,issuer,ms]);}
let tr=traceEvent(initialTrace(),'send','dns');tr=traceEvent(tr,'step');assert.equal(tr.cursor,2);tr=traceEvent(tr,'send','none');for(let n=0;n<5;n++)tr=traceEvent(tr,'step');assert.equal(tr.cursor,6);assert.equal(trace(tr.fault).status,200);assert.throws(()=>traceEvent(initialTrace(),'step'));assert.throws(()=>trace('unknown'));
for(const factory of [initialOrders,initialSession,initialCache,initialLB,initialTrace])assert.deepEqual(factory(),factory());
const before=initialSession();sessionEvent(before,'login',cfg);assert.deepEqual(before,initialSession());const cacheBefore=initialCache();cacheFetch(cacheBefore,'no-cache',false);assert.deepEqual(cacheBefore,initialCache());
// Old and mixed v1 backups retain completions, answers, notes, recall, and the namespace.
const keys=new Set(index.map(e=>e.key));const legacy={...empty(),completed:{'network:routing':true,'java:console-input':true,'security:s01-01':true,'git:g01':true,'test-design:td-t01':true},answers:{'routing:0':1,'td-t01:0':1},recall:{'routing:why':'経路'},notes:{'java:console-input':'旧メモ'},last:'java:console-input'};
assert.deepEqual(validate(JSON.parse(JSON.stringify(legacy)),keys),legacy);const mixed=structuredClone(legacy);mixed.completed['web:web-h01']=true;mixed.answers['web-h01:0']=1;mixed.recall['web-m1:investigation']='HTTP前の失敗';mixed.notes['web:web-h01']='観測';mixed.last='web:web-h01';assert.deepEqual(validate(JSON.parse(JSON.stringify(mixed)),keys),mixed);
assert.ok(read('src/lib/client.ts').includes('technical-notes:v1:${document.body.dataset.base}'));
for(const [query,key] of [['Preflight','web:web-h06'],['no-cache','web:web-h07'],['proxy_pass','web:web-h08'],['CORS','web:lab-cors'],['二重登録','web:qa-duplicate'],['回帰','test-design:td-t12'],['Servlet','java:web-flow']])assert.ok(searchIndex(index,query).some(e=>e.key===key),'Search: '+query);
for(const p of ['src/lib/web-model.ts','src/lib/web-client.ts'])assert.ok(!/\bfetch\s*\(|document\.cookie\s*=|localStorage\.setItem/.test(read(p)),'No real simulator traffic/credentials');
console.log(JSON.stringify({status:'PASS',base,lessons:15,missions:5,questions,answerBranches,labs:8,diagnoses:13,comparisons:12,model:'fixed independent HTTP/redirect/Cookie/session/CORS/cache/nginx/LB/trace oracles',progress:'v1 legacy + mixed JSON round trips'},null,2));
