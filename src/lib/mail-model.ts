import {labUI,type LabKind} from '../content/mail/labs.ts';
export type Config=Record<string,string>;
export type MailState={kind:LabKind;phase:string;step:number;hours:number;resume:number;attempts:number;rows:Record<string,string>;log:string[];server:boolean;seen:boolean;folder:string;cache:string;logged:boolean;fetched:boolean};
export function defaultConfig(kind:LabKind):Config{
 if(!Object.hasOwn(labUI,kind))throw Error('未定義の教材です。');
 return Object.fromEntries(labUI[kind].fields.map(f=>[f.name,f.options[0][0]]));
}
function config(kind:LabKind,input:Config):Config{
 const result=defaultConfig(kind);
 for(const [key,value] of Object.entries(input)){
  const field=labUI[kind].fields.find(f=>f.name===key);
  if(!field||!field.options.some(o=>o[0]===value))throw Error('未定義の入力です：'+key);
  result[key]=value;
 }
 return result;
}
export function initialLab(kind:LabKind,input:Config={}):MailState{
 config(kind,input);
 const state:MailState={kind,phase:'initial',step:0,hours:0,resume:0,attempts:0,rows:{段階:'未操作',結果の理由:'前提を確認して操作する。',未確認:labUI[kind].unknown},log:['[合成データ] 外部通信は行いません。'],server:false,seen:false,folder:'INBOX',cache:'未同期',logged:false,fetched:false};
 if(kind==='smtp'){state.phase='connected';state.rows.応答='220 mx.receiver.test ESMTP ready';state.log.push('S: 220 mx.receiver.test ESMTP ready');}
 if(kind==='trace')Object.assign(state.rows,{経路:'MUA → MSA/MTA → キュー → DNS → 宛先MTA → LMTP → メールボックス → IMAP → MUA',送信側の観測:'まだ送信していない',受信側の観測:'まだ接続されていない',Envelope:'未作成',表示ヘッダー:'未作成',送信側キュー:'なし',受信側キュー:'なし',メールボックス:'未保存',IMAP:'未取得'});
 if(kind==='queue')Object.assign(state.rows,{キュー:'なし',経過時間:'0h / 教材期限72h',試行回数:'0',通知:'未生成'});
 if(kind==='imap')imapRows(state);
 return state;
}
const note=(s:MailState,reason:string)=>{s.rows.結果の理由=reason;s.log.push(reason);};
const requirePhase=(s:MailState,...phases:string[])=>{if(!phases.includes(s.phase))throw Error('現在の段階では実行できません：'+s.phase);};
function bounce(s:MailState,reason:string,owner='送信側'){
 s.phase='bounced';s.rows.段階='不達';s.rows.通知=`${owner}でDSN生成（配送は未確認）`;s.rows[owner==='送信側'?'送信側キュー':'受信側キュー']='bounced / 除去';
 note(s,`[${owner}] status=bounced; ${reason}。逆配送先bounce@example.testへの通知を生成するモデル。通知の到達は未確認。`);
}
function defer(s:MailState,reason:string,resume:number,owner='送信側'){
 s.phase='deferred';s.resume=resume;s.rows.段階='再試行待ち';s.rows[owner==='送信側'?'送信側キュー':'受信側キュー']='deferred';s.rows.再試行の責任=owner;
 note(s,`[${owner}] status=deferred; ${reason}。現在のホップが保持して再試行する。`);
}
const traceSteps=['作成済み','EHLO','MAIL FROM','RCPT TO','DATA 354','送信側受付','MX解決','宛先接続・TLS','宛先MTA受理','メールボックス保存','IMAP取得','既読フラグ更新'];
function trace(s:MailState,event:string,c:Config){
 if(event==='compose'){
  requirePhase(s,'initial');s.phase='running';s.step=1;s.rows.段階=traceSteps[0];s.rows.Envelope='MAIL FROM:<bounce@example.test> / RCPT TO:<yui@receiver.test>';
  s.rows.表示ヘッダー=`From: aki@${c.author}\nTo: yui@receiver.test\nSubject: 学習用の便り\nMessage-ID: <ml8-001@example.test>`;
  note(s,'[MUA] 架空メッセージを作成。Envelope Fromと表示Fromは別の値。');return;
 }
 if(event==='retry'){
  requirePhase(s,'deferred','held','imap-failed');
  if(s.phase==='imap-failed'){s.phase='running';s.step=10;note(s,'[受信者] IMAPの再試行。SMTPでの再送は行わない。');return;}
  s.hours+=24;s.rows.経過時間=`${s.hours}h / 教材期限72h`;
  if(s.hours>=72){bounce(s,'教材の配送期限切れ',s.resume===9?'受信側':'送信側');return;}
  s.phase='running';s.step=s.resume;note(s,`[時計] ${s.hours}h。条件を見直して保持中のMTAが再試行。`);return;
 }
 requirePhase(s,'running');
 if(s.step>=traceSteps.length)throw Error('完了済みです。リセットしてください。');
 const n=s.step,f=c.fault;
 if(n===6&&f==='stuck'){s.phase='held';s.resume=6;s.rows.段階='送信側キュー滞留';s.rows.送信側キュー='incoming / 停滞';note(s,'[送信側] qmgrの配送処理が止まりincomingに滞留。宛先への試行は未実施。教材の時計で再試行を観察する。');return;}
 if(n===6&&f==='mx'){defer(s,'MX交換ホストのA/AAAAを解決できない',6);return;}
 if(n===7&&f==='connect'){defer(s,'mx.receiver.test:25 connect timeout',7);return;}
 if(n===7&&f==='tls'){defer(s,'TLS handshake failed / この教材の必須TLS方針',7);s.rows.受信側の観測='TLS接続失敗。本文は未受理。';return;}
 if(n===8){
  s.attempts++;s.rows.試行回数=String(s.attempts);
  s.rows.宛先へ送るEnvelope=f==='dmarc'?'MAIL FROM:<bounce@vendor.test>（送信側の外部配信用書換を仮定）':'MAIL FROM:<bounce@example.test>';
  s.rows.受信側の認証対象=f==='dmarc'?`SPF: vendor.test / DKIM d=vendor.test / From: ${c.author}`:`SPF: example.test / DKIM d=example.test / From: ${c.author}`;
  if(f==='4xx'){s.rows.受信側の観測='451を返し本文は未受理';defer(s,'451 4.3.0 Temporary local problem',8);return;}
  if(['5xx','policy','dmarc'].includes(f)){
   const reason=f==='5xx'?'550 5.1.1 No such user':f==='dmarc'?'550 5.7.1 DMARC fail: SPF/DKIM pass but neither aligned':'554 5.7.1 Receiver policy rejection';
   s.rows.受信側の観測=reason+' / 本文は未受理';s.rows.送信側の観測='宛先からの拒否応答を確認';
   if(f==='dmarc'){s.rows.認証='SPF pass vendor.test / DKIM pass d=vendor.test / Fromとの整合なし → DMARC fail';note(s,'[障害条件] キュー受付後の送信側書換で外部配信用Envelopeと署名ドメインをvendor.testにする。表示Fromは維持。受信側が評価する識別子を別行に表示。');}
   bounce(s,reason);return;
  }
 }
 if(n===9&&f==='quota'){s.rows.受信側の観測='R8B02: LMTP 452 4.2.2 over quota';defer(s,'R8B02: LMTP 452 4.2.2 over quota',9,'受信側');return;}
 if(n===10&&f==='imap'){s.phase='imap-failed';s.rows.IMAP='NO authentication failed';note(s,'[受信者] IMAPログイン失敗。送信側からはこの失敗を観測できない。保存済みメールは保持。');return;}
 s.rows.段階=traceSteps[n];
 const logs:Record<number,string>={1:'[送信者↔MSA] 220 / EHLO client.example.test → 250 (Submission TLS・AUTH成功を仮定)',2:'[送信者↔MSA] MAIL FROM:<bounce@example.test> → 250',3:'[送信者↔MSA] RCPT TO:<yui@receiver.test> → 250（本文受理はまだ）',4:'[送信者↔MSA] DATA → 354。ヘッダー・本文を送る段階。',5:'[送信側] 本文終端 . → 250 2.0.0 queued as S8A01; cleanup → incoming。宛先受理は未確認。',6:'[送信側] DNS receiver.test MX 10 mx.receiver.test / A 192.0.2.20; qmgr active',7:'[両MTA] TCP接続・EHLO・STARTTLS・証明書検証・再EHLO成功（必須方針）',8:'[送信側] 宛先へMAIL/RCPT/DATA・本文終端 → 250 2.0.0 queued as R8B02; status=sent（次ホップへ引継ぎ）',9:'[受信側のみ] R8B02: LMTP 250 2.0.0 saved to yui INBOX; status=sent',10:'[受信者のみ] IMAP認証・SELECT INBOX・UID FETCH BODY.PEEK[]成功。未読のまま取得。',11:'[受信者のみ] STORE +FLAGS (\\Seen)。人の閲覧・理解は証明しない。'};
 note(s,logs[n]);
 if(n===5){s.rows.送信側の観測='250受付 / Queue S8A01';s.rows.送信側キュー='incoming';}
 if(n===6)s.rows.送信側キュー='active';
 if(n===8){s.rows.送信側の観測='宛先250 / Queue R8B02 / status=sent。最終保存は見えない';s.rows.送信側キュー='sent / 除去';s.rows.受信側キュー='incoming / R8B02';s.rows.受信側の観測='MTA受付。ローカル配送は未実施';s.rows.認証=f==='spf'?'SPF fail / aligned DKIM pass → DMARC pass':f==='dkim'?'SPF aligned pass / DKIM fail → DMARC pass':'SPF aligned pass / DKIM aligned pass → DMARC pass';}
 if(n===9){s.rows.受信側キュー='sent / 除去';s.rows.メールボックス='INBOXに保存・未読';s.rows.受信側の観測='LMTP保存成功（送信者には直接見えない）';}
 if(n===10)s.rows.IMAP='取得済み・未読';
 if(n===11){s.rows.IMAP='既読フラグあり・人の閲覧は未確認';s.rows.メールボックス='INBOXに保存・既読フラグあり';s.phase='done';}
 s.step++;
}
function smtp(s:MailState,event:string,c:Config){
 if(s.phase==='closed')throw Error('接続は終了しています。リセットしてください。');
 if(s.phase==='body'&&event!=='body')throw Error('DATAの本文入力中です。先に本文終端を送ってください。この間のQUIT等をSMTPコマンドとしては処理しません。');
 if(event==='quit'&&s.phase!=='body'){s.phase='closed';s.rows.応答='221 Bye';note(s,'C: QUIT / S: 221。未受理なら配送責任は移らない。');return;}
 if(event==='ehlo'){s.phase='greeted';s.rows.応答='250';s.rows.段階='greeted';note(s,'C: EHLO sender.example.test / S: 250。拡張機能を確認し、進行中のEnvelope指定は初期化する。');return;}
 if(event==='mail'&&s.server)throw Error('このモデルは1通のみです。次のメッセージにはリセットしてください。');
 if(event==='mail'&&['envelope','recipient'].includes(s.phase))s.phase='greeted';
 const needed:Record<string,string>={ehlo:'connected',mail:'greeted',rcpt:'envelope',data:'recipient',body:'body'};
 if(needed[event]!==s.phase){s.rows.応答='503 Bad sequence of commands';note(s,'S: 503 順序違反。状態と配送責任は変更しない。');return;}
 if(event==='rcpt'&&c.response!=='250'){
  const r=c.response;s.rows.応答=r;s.rows.分類=r[0]==='4'?'一時失敗':'恒久失敗';
  if(r==='421')s.phase='closed';
  note(s,`C: RCPT TO:<yui@receiver.test> / S: ${r}。本文未受理。${r[0]==='4'?'送信側が後で再試行する。':'同じ要求の無条件再送はしない。'}`);return;
 }
 const transitions:Record<string,[string,string,string]>={ehlo:['greeted','250','EHLO sender.example.test'],mail:['envelope','250','MAIL FROM:<bounce@example.test>'],rcpt:['recipient','250','RCPT TO:<yui@receiver.test>'],data:['body','354','DATA'],body:['accepted','250 2.0.0 queued as R8B02','ヘッダー・本文・<CRLF>.<CRLF>']};
 const [phase,response,command]=transitions[event];s.phase=phase;s.rows.応答=response;s.rows.段階=phase;if(event==='body')s.server=true;
 note(s,`C: ${command} / S: ${response}。${event==='body'?'このMTAが受理。保存と閲覧は未確認。':'このコマンドへの応答で、最終配送の証明ではない。'}`);
}
export function resolveMX(record:string):{status:string;hosts:string[]}{
 switch(record){
  case 'normal':case 'equal':return {status:'candidates',hosts:['mx1.receiver.test','mx2.receiver.test']};
  case 'absent':return {status:'implicit',hosts:['receiver.test']};
  case 'null':return {status:'no-service',hosts:[]};
  case 'servfail':return {status:'temporary-dns-error',hosts:[]};
  case 'nxdomain':return {status:'domain-not-found',hosts:[]};
  case 'broken':return {status:'mx-address-missing',hosts:[]};
  default:throw Error('未定義のDNS応答');
 }
}
function dns(s:MailState,event:string,c:Config){
 const mx=resolveMX(c.record);
 if(event==='lookup'){
  requirePhase(s,'initial');s.phase=mx.hosts.length?'resolved':'failed';s.rows.DNS結果=mx.status;s.rows.候補=mx.hosts.join(' → ')||'なし';
  s.rows.DNS応答={normal:'MX 20 mx2.receiver.test / MX 10 mx1.receiver.test',equal:'MX 10 mx1.receiver.test / MX 10 mx2.receiver.test',absent:'NOERROR MXなし / receiver.test A 192.0.2.20',null:'MX 0 .',servfail:'SERVFAIL',nxdomain:'NXDOMAIN',broken:'MX 10 missing.receiver.test / A・AAAAなし'}[c.record]!;
  note(s,c.record==='normal'?'MXを数値の小さい順で選ぶ。IPは交換ホストのA/AAAAから解決する。':c.record==='absent'?'MX不在。宛先ドメイン自身を暗黙MXとしてAを使う。':c.record==='null'?'Null MXは受信しない宣言。Aへフォールバックしない。':`合成DNS結果: ${mx.status}。応答の種類を区別する。`);return;
 }
 requirePhase(s,'resolved');const host=mx.hosts[s.step];if(!host)throw Error('候補がありません。');s.step++;s.rows.接続候補=host;
 if(c.reachable==='yes'){s.phase='connected';s.rows.接続='成功';note(s,`${host} の合成Aへ接続成功。SMTP受理はまだ未確認。`);}
 else{if(s.step>=mx.hosts.length)s.phase='failed';s.rows.接続='失敗';note(s,`${host} connect timeout。${s.phase==='failed'?'候補を使い切った。送信側で一時失敗として保持する想定。':'次のMX候補を試す。'}`);}
}
function queue(s:MailState,event:string,c:Config){
 if(event==='enqueue'){requirePhase(s,'initial');s.phase='incoming';s.rows.キュー='incoming / S8A01';note(s,'cleanup: S8A01をincomingへ保存。送信側が配送責任を引き受けた。');}
 if(event==='activate'){requirePhase(s,'incoming');s.phase='active';s.rows.キュー='active';note(s,'qmgr: 配送エージェントの処理対象にした。');}
 if(event==='deliver'){
  requirePhase(s,'active');s.attempts++;s.rows.試行回数=String(s.attempts);
  if(c.response==='250'){s.phase='sent';s.rows.キュー='sent / 除去';note(s,'smtp: 250 accepted; status=sent。次ホップへの引渡し成功。最終保存・閲覧は別。');}
  else if(c.response==='451'){s.phase='deferred';s.rows.キュー='deferred';s.resume=s.hours+24;note(s,`smtp: 451; status=deferred。次回は${s.resume}h以降。`);}
  else{s.phase='bounced';s.rows.キュー='bounced / 除去';s.rows.通知='DSN生成・配送未確認';note(s,'smtp: 550; status=bounced。無条件再送せず逆配送先への通知処理へ。');}
 }
 if(event==='tick'){
  requirePhase(s,'deferred');s.hours+=24;s.rows.経過時間=`${s.hours}h / 教材期限72h`;
  if(s.hours>=72){s.phase='bounced';s.rows.キュー='bounced / 除去';s.rows.通知='期限切れDSN生成・配送未確認';note(s,'配送期限72hに到達。実製品の既定値ではない。');}
  else note(s,`${s.hours}h。再試行時刻と滞留を観測する。`);
 }
 if(event==='retry'){requirePhase(s,'deferred');if(s.hours<s.resume)throw Error('再試行時刻前です。時計を進めてください。');s.phase='active';s.rows.キュー='active';note(s,'qmgr: 期限内の再試行を開始。配送応答は次の操作で確認する。');}
 s.rows.段階=s.phase;
}
function imapRows(s:MailState){Object.assign(s.rows,{サーバー保存:s.server?'保存済み':'未保存',サーバーフォルダー:s.server?s.folder:'なし',サーバーフラグ:s.seen?'\\Seen':'未読',IMAP接続:s.logged?'認証済み':'未認証',端末キャッシュ:s.cache,本文取得:s.fetched?'取得済み（閲覧証明ではない）':'未取得'});}
function imap(s:MailState,event:string,c:Config){
 if(event==='deliver'){if(s.server)throw Error('1通は既に保存済みです。');s.server=true;note(s,'LMTP: 250 saved to INBOX。受信済み・未読。端末はまだ同期していない。');}
 if(event==='login'){if(c.auth==='fail'){note(s,'IMAP: NO authentication failed。保存済みメールは変更しない。');}else{s.logged=true;note(s,'IMAP: OK LOGIN。メールを取得したわけではない。');}}
 if(event==='sync'){if(!s.logged)throw Error('IMAPログインが必要です。');s.cache=s.server&&s.folder===c.folder?`${c.folder}: UID 81 / ${s.seen?'既読':'未読'}`:`${c.folder}: 0件`;note(s,'IMAP: SELECTとフラグ同期。選択外フォルダーのメールは見えない。');}
 if(event==='fetch'||event==='read'){if(!s.logged||!s.server||s.folder!==c.folder||!s.cache.startsWith(c.folder+': UID'))throw Error('ログイン後、保存されたフォルダーを同期してください。');if(event==='read'){s.seen=true;s.cache=`${c.folder}: UID 81 / 既読`;note(s,'IMAP: STORE +FLAGS (\\Seen)。本文取得や人の閲覧・理解の証明ではない。');}else{s.fetched=true;note(s,'IMAP: UID FETCH BODY.PEEK[]。取得しても既読は立てない。');}}
 if(event==='move'){if(!s.server)throw Error('保存済みメールが必要です。');if(s.folder==='Spam')throw Error('既にSpamです。');s.folder='Spam';note(s,'受信側ルールでINBOXからSpamへ移動。端末キャッシュは次の同期まで古い。');}
 imapRows(s);
}
// Organizational Domains are fixed synthetic DNS facts, never a last-two-label heuristic.
function org(domain:string){if(domain==='example.test'||domain==='news.example.test')return 'example.test';if(domain==='vendor.test')return 'vendor.test';throw Error('組織境界が未定義');}
function aligned(a:string,b:string,mode:string){return mode==='s'?a===b:org(a)===org(b);}
export function evaluateAuth(input:Config={}){
 const c=config('auth',input);let spf:string;
 if(['none','temperror','permerror','neutral'].includes(c.spf))spf=c.spf;
 else spf=c.ip==='192.0.2.10'?'pass':c.spf==='soft'?'softfail':'fail';
 const spfAligned=aligned(c.envelope,c.author,c.aspf),dkimAligned=aligned(c.signer,c.author,c.adkim);
 const pass=(spf==='pass'&&spfAligned)||(c.dkim==='pass'&&dkimAligned);
 const dmarc=pass?'pass':spf==='temperror'||c.dkim==='temperror'?'未確定（認証一時エラー）':'fail';
 return {spf,dkim:c.dkim,spfAligned,dkimAligned,dmarc,policy:c.policy};
}
function auth(s:MailState,c:Config){
 const a=evaluateAuth(c);Object.assign(s.rows,{段階:'評価済み',SPF:a.spf,'SPF照合対象':`IP ${c.ip} / MAIL FROM ${c.envelope}`,'SPF Alignment':`${a.spfAligned?'整合':'不整合'} (${c.aspf})`,'DKIM検証結果（仮定）':a.dkim,'DKIM d=':c.signer,'DKIM Alignment':`${a.dkimAligned?'整合':'不整合'} (${c.adkim})`,'Author Domain':c.author,DMARC:a.dmarc,公開方針:`p=${a.policy}`,最終配置:'受信側の判断は未確認'});
 note(s,a.dmarc==='pass'?'整合したSPFまたはDKIMのpassがあるためDMARC pass。受信箱配置は保証しない。':a.dmarc==='fail'?`整合した方式のpassがない。DMARC fail。p=${a.policy}は要求方針で、受信側の最終判断とは別。`:'整合した成功がなく、一時エラーで評価が未確定。受信側の一時失敗等の処置は別途確認。');
}
function tls(s:MailState,c:Config){
 if(['failed','done'].includes(s.phase))throw Error('終了済みです。条件変更またはリセットしてください。');
 const submission=c.mode!=='25',strict=submission||c.policy==='strict';
 if(s.step===0){s.rows.接続先=`port ${c.mode} / ${submission?'Submission':'Relay'}`;note(s,c.mode==='465'?'TCP接続。SMTP挨拶より前にTLSを開始する。':'TCP接続 / 220 / EHLO。STARTTLS広告を確認する。');}
 if(s.step===1){
  if(c.tls==='broken'||(c.tls==='no'&&(strict||c.mode==='465'))){s.phase='failed';s.rows.TLS='失敗';note(s,'TLS条件を満たさないため停止。パスワード送信・本文受付は未実施。');return;}
  if(c.tls==='no'){s.rows.TLS='平文継続（Relay Opportunisticのみ）';s.rows.相手検証='未検証';note(s,'STARTTLSなし。Opportunistic Relayの仮定で平文へ進む。安全性の保証ではない。');}
  else{s.rows.TLS='暗号化成功';s.rows.相手検証=c.certificate==='valid'?'検証可能な証明書':'検証失敗の証明書';note(s,c.mode==='465'?'TLS成功後に220 / EHLO。':'STARTTLS / 220 → TLS成功 → 再EHLO。');}
 }
 if(s.step===2){
  if(c.tls==='yes'&&c.certificate==='invalid'&&strict){s.phase='failed';s.rows.相手検証='失敗・停止';note(s,'証明書の信頼・名前・期限の検証に失敗。暗号化済みでも正当な相手とは確定しない。');return;}
  s.rows.相手検証=strict?'検証成功（合成条件）':'厳格検証を要求しない（相手の正当性は未保証）';note(s,strict?'必須の証明書検証条件を満たした。':'Opportunistic方針。暗号化の有無と認証された相手かを区別する。');
 }
 if(s.step===3){
  if(submission&&c.auth==='fail'){s.phase='failed';s.rows.AUTH='535 5.7.8';note(s,'AUTH拒否。メール本文を受け付けた証拠はない。');return;}
  s.rows.AUTH=submission?'235 Authentication successful':'MTA間Relayでは要求しない';note(s,submission?'TLS・検証後にAUTH成功。本文受付は別段階。':'Relay接続に利用者のSMTP AUTHは要求しない。');
 }
 if(s.step===4){s.phase='done';s.rows.結果='SMTPトランザクション開始可能（本文未受付）';note(s,'接続条件の確認まで完了。実送信、保存、E2E暗号化は行っていない。');}
 s.step++;s.rows.段階=String(s.step);
}
function headers(s:MailState,event:string,c:Config){
 if(event==='headers'){
  s.rows.ヘッダー=`Received: from sender.example.test by mx.receiver.test with ESMTPS id R8B02; Mon, 16 Nov 2026 21:00:02 +0900\nReceived: from fake.invalid by forged.invalid; Mon, 16 Nov 2026 20:59:00 +0900\nAuthentication-Results: mx.receiver.test; dmarc=${c.scenario==='untrusted'?'fail':'pass'} header.from=example.test\nAuthentication-Results: forged.invalid; dmarc=pass\nFrom: aki@example.test\nReturn-Path: <bounce@example.test>\nMessage-ID: <ml8-001@example.test>`;
  note(s,'上のReceivedは信頼する受信側の追加。下の行とforged.invalidのpassは信頼境界外で、真偽は未確認。時系列は下から上だが全行を信用しない。');
 }
 if(event==='sender'){
  s.rows.送信側='21:00:00 cleanup S8A01 message-id=<ml8-001@example.test>\n21:00:02 smtp S8A01 relay=mx.receiver.test dsn=2.0.0 status=sent (250 queued as R8B02)';
  s.rows.確定範囲='宛先MTAへの引渡し。最終保存・閲覧は未確認。';note(s,'S8A01とR8B02は別ホストのQueue ID。同じMessage-ID・時刻・応答を照合する。');
 }
 if(event==='receiver'){
  s.rows.受信側=c.scenario==='quota'?'21:00:03 lmtp R8B02 dsn=4.2.2 status=deferred (452 over quota)':'21:00:03 lmtp R8B02 dsn=2.0.0 status=sent (saved to INBOX)';
  s.rows.確定範囲=c.scenario==='quota'?'受信側が保持してローカル配送待ち。送信側のsentは変わらない。':'メールボックス保存。取得・人の閲覧は未確認。';
  note(s,c.scenario==='untrusted'?'受信側でDMARC failだが、ローカル方針で受理・保存した架空例。公開方針と最終処置は別。':s.rows.確定範囲);
 }
}
export function labEvent(previous:MailState,event:string,input:Config={}):MailState{
 const c=config(previous.kind,input);
 if(!labUI[previous.kind].actions.some(a=>a[0]===event))throw Error('未定義の操作です。');
 const s=structuredClone(previous);
 switch(s.kind){case 'trace':trace(s,event,c);break;case 'smtp':smtp(s,event,c);break;case 'dns':dns(s,event,c);break;case 'queue':queue(s,event,c);break;case 'imap':imap(s,event,c);break;case 'auth':auth(s,c);break;case 'tls':tls(s,c);break;case 'headers':headers(s,event,c);break;}
 return s;
}
export const labRows=(s:MailState)=>({...s.rows});
export const labLog=(s:MailState)=>[...s.log];
