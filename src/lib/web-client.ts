import {methods,initialOrders,request,methodInfo,redirectChain,initialSession,sessionEvent,cookieRequest,cors,initialCache,cacheFetch,cacheEvent,proxyRoute,initialLB,lbEvent,initialTrace,traceEvent,trace,layers,faultLabels,type Fault,type CookieConfig,type CorsInput,type CachePolicy} from './web-model';

document.querySelectorAll<HTMLElement>('[data-web-lab]').forEach(root=>{
 const kind=root.dataset.webLab!,form=root.querySelector<HTMLFormElement>('form')!;
 const field=(key:string)=>{const el=root.querySelector<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>(`[data-field="${key}"]`);if(!el)throw Error(`項目なし: ${key}`);return el;};
 const val=(key:string)=>field(key).value,checked=(key:string)=>(field(key) as HTMLInputElement).checked;
 const write=(key:string,value:string)=>{const el=root.querySelector<HTMLElement>(`[data-web-${key}]`);if(el)el.textContent=value;};
 const pretty=(v:unknown)=>JSON.stringify(v,null,2);
 let orders=initialOrders(),session=initialSession(),cache=initialCache(),lb=initialLB(),tr=initialTrace();
 let history:string[]=[],selectedLayer=0;
 const addHistory=(text:string)=>{history.push(text);history=history.slice(-80);const list=root.querySelector('[data-web-history]')!;list.replaceChildren(...history.map(h=>{const li=document.createElement('li');li.textContent=h;return li;}));};
 const status=(text:string)=>write('status',text);
 const input=()=>({method:val('method'),path:val('path'),contentType:'application/json',body:val('body')});
 const showLayer=()=>{const result=trace(tr.fault,tr.input),step=result.steps.find(s=>s.layer===selectedLayer),arrived=tr.started&&result.steps.slice(0,tr.cursor).some(s=>s.layer===selectedLayer),done=tr.cursor===result.steps.length;
 const detail=root.querySelector<HTMLElement>('[data-layer-detail]')!;detail.textContent=arrived&&step?`${layers[selectedLayer]} / 仮想処理 ${step.ms}ms\n要求: ${tr.input.method} ${tr.input.path}\nログ: ${step.log}\n応答: ${done?(result.status===null?'HTTP応答なし':`${result.status}（生成: ${layers[result.issuer]}）`):'処理途中・まだ応答を観測していません'}`:'この層は未到達です。';
 root.querySelectorAll<HTMLButtonElement>('[data-layer]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.layer)===selectedLayer)));};
 const renderTrace=()=>{
  const r=trace(tr.fault,tr.input),done=tr.started&&tr.cursor>=r.steps.length;
  status(!tr.started?'未送信です。':done?`${r.status===null?'HTTP応答なし':`HTTP ${r.status}`} / JS参照: ${r.readable?'可':'不可'} / ブラウザ仮想待ち ${r.observedMs}ms。${r.symptom}`:`処理中: ${tr.cursor} / ${r.steps.length}段階。次の層へ進めてください。`);
  write('request',tr.started?pretty(r.request):'未送信');write('response',done?pretty({status:r.status,headers:r.responseHeaders,body:r.body,javaScriptReadable:r.readable}):'未観測');
  write('details',tr.started?r.steps.slice(0,tr.cursor).map(s=>`${layers[s.layer]} | 仮想${s.ms}ms | req-demo | ${s.log}`).join('\n')+(done?`\n返却経路: ${layers[r.issuer]} → 入口 → Browser\n${r.symptom}`:''):'記録なし');
  root.querySelectorAll<HTMLButtonElement>('[data-layer]').forEach(b=>{const n=Number(b.dataset.layer),s=r.steps.slice(0,tr.cursor).find(s=>s.layer===n),arrived=tr.started&&!!s;b.disabled=!arrived;const t=root.querySelector(`[data-layer-time="${n}"]`)!;t.textContent=arrived?`仮想 ${s!.ms}ms`:done?'未到達':'未到達';});
  const step=root.querySelector<HTMLButtonElement>('[data-action="step"]');if(step)step.disabled=!tr.started||done;
  showLayer();
 };
 const renderCookie=(message:string)=>{
  const r=cookieRequest(session,{host:val('host'),path:val('path'),https:checked('https'),crossSite:checked('crossSite'),topLevel:checked('topLevel'),method:val('method')});
  const c=session.cookie;
  status(`${message} HTTP ${r.status} / Cookie送信: ${r.sent?'あり':'なし'} / セッション認証: ${r.authenticated?'成功':'未認証'}`);
  write('request',`${val('method')} ${checked('https')?'https':'http'}://${val('host')}${val('path')}\nCookie: ${r.sent?`${c!.id}（合成ID）`:'（送信なし）'}\n理由: ${r.reasons.join(' / ')||'全送信条件を満たす'}`);
  write('response',pretty({status:r.status,sessionActive:r.sessionActive,documentCookieAtIssuingRoot:r.scriptReadable?'JS参照可':'JS参照不可',note:'HttpOnlyは自動送信やCSRFを止める属性ではありません。'}));
  write('details',pretty({virtualSeconds:session.now,cookie:c,serverSessions:session.sessions}));
 };
 const act=(event:string)=>{
  try{
   if(event==='reset'){
    form.reset();orders=initialOrders();session=initialSession();cache=initialCache();lb=initialLB();tr=initialTrace();history=[];selectedLayer=0;
    write('request','未送信');write('response','未観測');write('details','記録なし');write('comparison','');const comparison=root.querySelector<HTMLElement>('[data-web-compare]');if(comparison)comparison.hidden=true;
    root.querySelector('[data-web-history]')!.replaceChildren();if(kind==='trace')renderTrace();status('初期状態に戻しました。入力・仮想データ・履歴を初期化しました。');return;
   }
   if(kind==='trace'){
    if(event==='compare'){
     const chosen=trace(val('fault') as Fault,input()),normal=trace('none',input());
     root.querySelector<HTMLElement>('[data-web-compare]')!.hidden=false;
     write('comparison',pretty([{case:'正常系',status:normal.status,jsReadable:normal.readable,virtualBrowserMs:normal.observedMs,visited:normal.steps.map(s=>layers[s.layer])},{case:faultLabels[val('fault') as Fault],status:chosen.status,jsReadable:chosen.readable,virtualBrowserMs:chosen.observedMs,visited:chosen.steps.map(s=>layers[s.layer]),symptom:chosen.symptom}]));
     status('比較結果を表示しました。現在の追跡とは別に、同じ入力の全行程を比較しています。');
    }else{tr=traceEvent(tr,event as 'send'|'step',val('fault') as Fault,input());if(event==='send'){selectedLayer=0;root.querySelector<HTMLElement>('[data-web-compare]')!.hidden=true;}else selectedLayer=trace(tr.fault,tr.input).steps[tr.cursor-1].layer;renderTrace();}
   }
   if(kind==='request'){
    const method=val('method'),body=['POST','PUT','PATCH'].includes(method)?val('body'):'';
    const result=request({method,path:val('path'),contentType:val('contentType'),body,accept:val('accept')},orders);orders=result.orders;
    const info=methodInfo(method);status(`HTTP ${result.response.status} / 安全性: ${info.safe?'安全':'安全ではない'} / 冪等性: ${info.idempotent?'あり':'一般的保証なし'} / 保存 ${orders.length}件`);
    write('request',`${method} ${val('path')} HTTP/1.1\nHost: api.example.test\nAccept: ${val('accept')}\n${body?`Content-Type: ${val('contentType')}\nContent-Length: ${new TextEncoder().encode(body).length}\n`:''}\n${body}`);
    write('response',pretty(result.response));write('details',pretty({syntheticDatabase:orders,note:'PUT/DELETEの冪等性は応答の同一性ではなく意図した効果についてです。'}));
   }
   if(kind==='redirect'){
    const r=redirectChain(Number(val('code')),val('method'),val('body'),checked('loop'),checked('postToGet'));
    status(r.stop==='complete'?'移動先で200を観測しました。':r.stop==='loop'?'同じURL・メソッドへの再訪を検出して停止しました。':'追従上限に達しました。');
    write('request',`${val('method')} /start\n\n${val('body')}`);write('response',r.rows.map((h,i)=>`${i+1}. ${h.method} ${h.url} → ${h.status}${h.location?' Location: '+h.location:''}\n本文: ${h.body||'（なし）'}`).join('\n\n'));write('details',`停止理由: ${r.stop}\n301/302のPOST変更: ${checked('postToGet')?'GETへ変更':'保持（互換クライアント）'}\n307/308は保持。303はGET/HEADで取得。`);
   }
   if(kind==='cookie'){
    if(event!=='request'){
     const config:CookieConfig={domain:val('domain'),path:val('cookiePath'),secure:checked('secure'),httpOnly:checked('httpOnly'),sameSite:val('sameSite') as CookieConfig['sameSite'],maxAge:val('maxAge')===''?null:Number(val('maxAge')),expires:Number(val('expires'))};
     const r=sessionEvent(session,event as 'login'|'advance'|'logout'|'delete-cookie',config);session=r.state;renderCookie(r.message);
    }else renderCookie('現在の設定で送信条件を判定。');
   }
   if(kind==='cors'){
    const i:CorsInput={origin:val('origin'),target:val('target'),method:val('method'),contentType:val('contentType'),extraHeader:val('extraHeader'),credentials:val('credentials') as CorsInput['credentials'],allowOrigin:val('allowOrigin'),allowCredentials:checked('allowCredentials'),allowMethods:checked('allowMethods')?[...methods]:['GET','HEAD','POST'],allowHeaders:val('allowHeaders')==='all'?['content-type','authorization','x-debug']:val('allowHeaders')==='none'?[]:[val('allowHeaders')],preflightOK:checked('preflightOK')};
    const r=cors(i);status(`Preflight: ${r.preflight?(r.preflightPassed?'成功':'失敗'):'なし'} / 実要求: ${r.actualSent?'送信':'未送信'} / JS参照: ${r.readable?'可':'不可'}。${r.reason}`);
    write('request',pretty({Origin:i.origin,target:i.target,method:i.method,contentType:i.contentType,additionalHeader:i.extraHeader,credentials:i.credentials,preflight:r.preflight?{method:'OPTIONS',credentials:'なし',requestedMethod:i.method}:null}));
    write('response',pretty({preflightStatus:r.preflight?(i.preflightOK?204:403):null,actualHTTPStatus:r.httpStatus,ACAO:i.allowOrigin||'未設定',ACAC:i.allowCredentials?'true':'未設定',allowMethods:i.allowMethods,allowHeaders:i.allowHeaders,javaScriptReadable:r.readable}));write('details',pretty(r));
   }
   if(kind==='cache'){
    if(event==='advance'||event==='update'){cache=cacheEvent(cache,event);status(`仮想${cache.now}秒 / オリジン本文v${cache.version}。未取得の変更は表示本文に反映されません。`);write('details',pretty(cache));}
    else{const r=cacheFetch(cache,val('policy') as CachePolicy,checked('shared'),event==='revalidate');cache=r.state;status(`${r.status===null?'HTTP通信なし（キャッシュ再利用）':`HTTP ${r.status}`} / 表示本文 v${r.display}。${r.note}`);write('request',pretty({method:'GET',url:'/app.js',headers:r.requestHeaders,virtualSeconds:cache.now,forcedRevalidation:event==='revalidate'}));write('response',pretty({status:r.status,headers:r.responseHeaders,wireBody:r.body,displayVersion:r.display,source:r.source}));write('details',pretty(cache));}
   }
   if(kind==='proxy'){
    const r=proxyRoute(val('location'),val('pass'),val('uri'),checked('preserveHost'));status(`この構成の模擬結果 HTTP ${r.status} / ${r.matched?'location一致':'location不一致（他locationはモデル外）'}`);
    write('request',`GET ${val('uri')}\nHost: shop.example.test\n\nlocation ${val('location')} {\n  proxy_pass ${val('pass')};\n  ${checked('preserveHost')?'proxy_set_header Host $host;':'# Host既定: $proxy_host'}\n}`);write('response',pretty(r));write('details',`上流の受信URI: ${r.uri??'転送なし'}\n上流Host: ${r.host??'なし'}\nTLS終端: 入口HTTPS → 上流HTTPの前提\nX-Forwarded-Proto: https（信頼した入口で外部値を除去）\n結果コードはこの架空構成の契約で、実nginx実行結果ではありません。`);
   }
   if(kind==='lb'){
    const r=lbEvent(lb,event,checked('sticky'),checked('shared'));lb=r.state;status(`${r.status===null?'構成状態を更新':`HTTP ${r.status} / 対象 ${r.node===null?'なし':r.node===0?'A':'B'}`}。ヘルスチェックの認識と実稼働を区別してください。`);
    write('request',event==='login'?'合成利用者のログイン':`操作: ${event}\nSticky: ${checked('sticky')} / 共有: ${checked('shared')}`);write('response',pretty({status:r.status,node:r.node===null?null:r.node===0?'A':'B',actual:lb.actual,healthCheckKnown:lb.known}));write('details',pretty(lb));
   }
   addHistory(`${event}: ${root.querySelector('[data-web-status]')!.textContent}`);
  }catch(e){status(`入力または操作を確認してください: ${e instanceof Error?e.message:String(e)}`);}
 };
 form.addEventListener('submit',e=>{e.preventDefault();act(form.querySelector<HTMLElement>('[data-action]')!.dataset.action!);});
 root.querySelectorAll<HTMLButtonElement>('button[data-action][type="button"]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.action!)));
 root.querySelectorAll<HTMLButtonElement>('[data-layer]').forEach(b=>b.addEventListener('click',()=>{selectedLayer=Number(b.dataset.layer);showLayer();}));
 if(kind==='trace')renderTrace();
 if(kind==='cache')field('shared').addEventListener('change',()=>{cache=initialCache();status('キャッシュ範囲を切り替えて初期化しました。再取得してください。');write('details',pretty(cache));write('request','未送信');write('response','未観測');addHistory('私用／共有の範囲変更: キャッシュ初期化');});
 if(kind==='lb')for(const k of ['sticky','shared'])field(k).addEventListener('change',()=>{lb=initialLB();status('構成を変更して初期化しました。ログインから比較してください。');write('details',pretty(lb));write('request','未送信');write('response','未観測');addHistory('LB構成変更: 状態初期化');});
});
