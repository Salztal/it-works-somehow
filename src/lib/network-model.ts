// Browser and verification use these same deterministic, network-free models.
export function ipv4(value: string): number {
  if (!/^(0|[1-9]\d{0,2})(\.(0|[1-9]\d{0,2})){3}$/.test(value) || value.split('.').some(n => Number(n) > 255)) throw Error('IPv4は0〜255の4組で入力してください（先頭の余分な0は不可）。');
  return value.split('.').reduce((n, part) => n * 256 + Number(part), 0);
}
export function dotted(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) throw Error('IPv4数値が範囲外です。');
  return [24,16,8,0].map(shift => (value >>> shift) & 255).join('.');
}
export function subnet(value: string) {
  const match = /^(\S+)\/(0|[1-9]|[12]\d|3[0-2])$/.exec(value.trim());
  if (!match) throw Error('IPv4/CIDR形式で入力してください。例：192.0.2.70/26（/0〜/32）。');
  const ip = ipv4(match[1]), prefix = Number(match[2]), size = 2 ** (32-prefix);
  const first = Math.floor(ip / size) * size, last = first + size - 1;
  return { prefix, size, network: dotted(first), end: dotted(last), mask: dotted(0x100000000-size),
    broadcast: prefix <= 30 ? dotted(last) : null,
    hostFirst: dotted(first + (prefix <= 30 ? 1 : 0)), hostLast: dotted(last - (prefix <= 30 ? 1 : 0)),
    hosts: prefix <= 30 ? size - 2 : size,
    note: prefix === 31 ? '/31：RFC 3021対応のポイントツーポイントで両端に使用。通常LANの説明とは別。' : prefix === 32 ? '/32：単一アドレス指定。サブネットブロードキャストなし。' : '通常LANの数学的なホスト候補。サービス固有の予約・実際の割当可否は別途確認。' };
}
export type Route = { cidr: string; next: string };
export function routing(destination: string, routes: Route[]) {
  const ip = ipv4(destination.trim());
  if (!routes.length || routes.length > 32) throw Error('ルートは1〜32行にしてください。');
  const seen = new Set<string>();
  const matches = routes.map(route => {
    const s = subnet(route.cidr), key = s.network+'/'+s.prefix;
    if (route.cidr !== key) throw Error('経路の宛先はネットワーク境界で指定してください：'+key);
    if (seen.has(key)) throw Error('同一プレフィックスの重複は扱いません。実機の採用規則やECMPは別途確認。');
    seen.add(key);
    if (!route.next.trim() || route.next.length > 80) throw Error('次ホップ/出口を1〜80文字で入力してください。');
    return {...route, prefix:s.prefix, match:ip >= ipv4(s.network) && ip <= ipv4(s.end)};
  });
  return { candidates:matches, selected:matches.filter(r => r.match).sort((a,b)=>b.prefix-a.prefix)[0] || null };
}
export function vlan(source: number, destination: number, routed: boolean) {
  for (const v of [source,destination]) if (!Number.isInteger(v) || v < 1 || v > 4094) throw Error('通常のVLAN IDは1〜4094の整数です。');
  return source === destination
    ? { allow:true, path:'同一VLANでL2転送。ARPブロードキャストも同一VLAN内へ。MAC学習・ポート転送可能という前提です。' }
    : routed ? { allow:true, path:'L3ゲートウェイ経由。両VLANのIP設定・往復経路・必要な許可がすべてある前提です。ARP自体がVLANを越えるわけではありません。' }
    : { allow:false, path:'L2だけでは異なるVLANへ転送しません。必要ならL3機能と往復経路・許可を設計します。' };
}
export const dhcpSteps = ['Discover：Client UDP68 → Server UDP67。初期取得を探索。','Offer：Serverがアドレス・リース・オプションを提案。まだ取得完了ではない。','Request：Clientが選んだサーバと要求IPを通知。','ACK：Serverが割当と設定を確認。競合検出等の条件を経て利用。'];
export function dhcp(remote: boolean, relay: boolean, stage: number, lease: number, elapsed: number) {
  if (!Number.isInteger(stage) || stage < 0 || stage > 3) throw Error('DORAの段階が範囲外です。');
  if (!Number.isInteger(lease) || lease < 8 || lease > 86400 || !Number.isInteger(elapsed) || elapsed < 0 || elapsed > 172800) throw Error('リース8〜86400秒、経過0〜172800秒の整数で入力してください。');
  if (remote && !relay) return { phase:'取得不可', text:'Discoverは通常ルータを越えません。別サブネットのServerへはリレーと往復経路・UDP許可が必要です。' };
  if (stage < 3) return {phase:['探索','提案','要求'][stage],text:dhcpSteps[stage]+(remote?' リレーがgiaddr等を使って中継する前提。':' 同一リンクの初期取得例。')};
  if (elapsed >= lease) return {phase:'期限切れ',text:'更新・再バインドに応答がなかった条件。割当IPの使用を停止し、再取得へ。'};
  if (elapsed >= lease*0.875) return {phase:'REBINDING',text:'T2既定値87.5%を超えた。元サーバで更新できず、他サーバも含め更新要求する例。'};
  if (elapsed >= lease*0.5) return {phase:'RENEWING',text:'T1既定値50%を超えた。元サーバへ更新要求する例。値はサーバ指定で変わる。'};
  return {phase:'BOUND',text:`取得済み。残り${lease-elapsed}秒。IP以外にGW・DNS等のオプションも確認。`};
}
export type Mapping = { inside: string; insidePort: number; outsidePort: number };
export const mappings: Mapping[] = [{inside:'192.0.2.10',insidePort:50000,outsidePort:40000},{inside:'192.0.2.11',insidePort:50000,outsidePort:40001}];
export function port(value: number) { if (!Number.isInteger(value) || value < 1 || value > 65535) throw Error('ポートは1〜65535の整数で入力してください。'); return value; }
export function pat(direction: string, address: string, value: number) {
  ipv4(address); port(value);
  if (direction === 'out') {
    const m=mappings.find(m=>m.inside===address && m.insidePort===value);
    return m ? `TCP ${address}:${value} → 198.51.100.20:443\n変換後：203.0.113.5:${m.outsidePort} → 198.51.100.20:443` : '対応表に内部タプルがありません。この固定教材は新規マッピングを割り当てません。';
  }
  if (direction !== 'in') throw Error('変換の方向が不正です。');
  const m=address==='198.51.100.20' && mappings.find(m=>m.outsidePort===value);
  return m ? `TCP ${address}:443 → 203.0.113.5:${value}\n逆変換後：${address}:443 → ${m.inside}:${m.insidePort}` : '対応する応答ではありません。内部へ配送しません（相手固定・TCP限定の教材）。';
}
export function dns(ttl: number, elapsed: number, truncated: boolean, tcpAllowed: boolean) {
  if (!Number.isInteger(ttl) || ttl < 0 || ttl > 86400 || !Number.isInteger(elapsed) || elapsed < 0 || elapsed > 172800) throw Error('TTLは0〜86400秒、経過は0〜172800秒の整数で入力してください。');
  const remaining=Math.max(0,ttl-elapsed);
  if (remaining>0) return {remaining,phase:'キャッシュ利用',text:`通常の正キャッシュに残り${remaining}秒。外部への再問い合わせなし。TCの設定は次の再問い合わせ時に適用。`};
  if (truncated && !tcpAllowed) return {remaining,phase:'TCP再試行失敗',text:'期限切れ/TTL0 → 再帰リゾルバ → 権威をたどる。UDP応答TC=1、TCP53が拒否され完全な答えを得られない。'};
  return {remaining,phase:'再問い合わせ',text:'期限切れ/TTL0 → 再帰リゾルバ → ルートの委任 → TLDの委任 → 権威の回答。'+(truncated?'UDP応答TC=1 → TCP53で再試行して回答。':'ここではUDPで完全な回答。TCPの利用も必要になり得る。')+' serve-stale・負のキャッシュ・暗号化DNSは省略。'};
}
export const outageCases = [
  {id:'filter',title:'DNS成功、TCPが確立しない',logs:['Client: A www.example.test = 198.51.100.20','Client: TCP 50000 → 443 SYNを再送','境界: 192.0.2.10 → 198.51.100.20 TCP443 deny','Server側: 対象SYNの観測なし'],correct:'filter',reason:'対象フローの境界拒否ログとServer未到着が一致。必要なTCP443許可を見直し、SYN/ACK・TLSまで再検査。単なる無応答だけなら原因は特定できません。'},
  {id:'dns',title:'名前解決で停止',logs:['Client: DNS = 192.0.2.53','想定設定: DNS = 192.0.2.54','192.0.2.53: 管理記録で廃止済み','Client: DNS問い合わせに応答なし、対象WebのSYNなし'],correct:'dns',reason:'配布すべきDNSとの不一致と廃止記録がある。DNS設定の根拠・DHCPオプションを修正し、名前解決から再試験。SYN前なのでTCP許可を広げる根拠はありません。'},
  {id:'return',title:'Serverは応答している',logs:['Client: SYN送信 / SYN,ACK未観測','Server: SYN受信 / SYN,ACK送信','R2: 192.0.2.0/24への経路なし / no routeで破棄','行き経路R1→R2→Serverは正常'],correct:'return',reason:'戻りのR2で経路なしという証拠がある。設計に沿う戻り経路を補い、同じTCPフローを両端で確認。DNS成功や行き到達だけで双方向成立とは言えません。'},
  {id:'tls',title:'TCP確立後にエラー',logs:['DNS: 198.51.100.20','TCP: SYN / SYN,ACK / ACKを両端で観測','TLS: 接続名www.example.test、提示証明書名other.example.test','Client: hostname mismatch'],correct:'tls',reason:'TCP後の名前検証エラー。正しい接続先と証明書のSAN・配信設定を確認する。検証無効化ではなく名前と証明書の整合性を直します。'},
  {id:'app',title:'暗号化通信の後に503',logs:['DNS・TCP・TLSは正常完了','HTTP: 503 Service Unavailable','Proxy: upstream health check failed','同時刻の上流アプリ: 未起動'],correct:'app',reason:'HTTP応答と上流の未起動ログが一致。プロキシ/上流アプリの起動・依存・健全性を確認。SYNやDNSの再設定だけでは説明できません。'}
] as const;
export function diagnose(caseId: string, answer: string) {
  const c=outageCases.find(c=>c.id===caseId);
  if (!c || !['filter','dns','return','tls','app'].includes(answer)) throw Error('用意されたケースと調査先を選んでください。');
  return {correct:c.correct===answer,text:(c.correct===answer?'整合する判断です。':'証拠に合いません。選んだ層が正常と確認済みでないか、具体的な失敗ログが別にないか確認。')+' '+c.reason};
}

export type TcpState = 'CLOSED'|'LISTEN'|'SYN-SENT'|'SYN-RECEIVED'|'ESTABLISHED'|'FIN-WAIT-1'|'FIN-WAIT-2'|'CLOSE-WAIT'|'LAST-ACK'|'TIME-WAIT';
export type TcpPacket = {from:'Client'|'Server';flags:string;seq:number;ack:number|null;length:number};
export type TcpStep = {label:string;client:TcpState;server:TcpState;clientNext:number;serverNext:number;clientAck:number|null;serverAck:number|null;packet:TcpPacket|null;event:'local'|'send'|'receive'|'loss'|'timer';text:string};
export type TcpScenario = 'normal'|'synack-loss'|'ack-loss'|'timeout'|'reset'|'finack-loss';
export const tcpScenarios: Record<TcpScenario,string> = {normal:'正常確立・FIN終了','synack-loss':'SYN/ACKを1回損失','ack-loss':'最終ACKを1回損失',timeout:'応答なし・打切り',reset:'確立後にRST中断','finack-loss':'最後のFIN確認ACKを損失'};
// A bounded teaching trace: one connection, no data/options/congestion model.
// Receive transitions follow RFC 9293 §3.10.7; send/receive are visibly distinct.
export function tcpTrace(scenario: TcpScenario): TcpStep[] {
  if (!Object.hasOwn(tcpScenarios,scenario)) throw Error('TCP事例が範囲外です。');
  let client:TcpState='CLOSED',server:TcpState='CLOSED',cn=1000,sn=9000,ca:number|null=null,sa:number|null=null;
  const trace:TcpStep[]=[];
  const step=(label:string,event:TcpStep['event'],text:string,packet:TcpPacket|null=null)=>trace.push({label,event,text,packet,client,server,clientNext:cn,serverNext:sn,clientAck:ca,serverAck:sa});
  const p=(from:TcpPacket['from'],flags:string,seq:number,ack:number|null):TcpPacket=>({from,flags,seq,ack,length:0});
  const syn=p('Client','SYN',1000,null),synack=p('Server','SYN,ACK',9000,1001),ack=p('Client','ACK',1001,9001);
  step('初期状態','local','まだ接続はありません。ISNは説明用の絶対番号1000/9000。');
  server='LISTEN';step('Serverが待受け','local','passive OPEN。待受ソケットと、以後の1接続の状態を区別します。');
  client='SYN-SENT';cn=1001;step('SYN送信','send','active OPEN。SYNは1つ消費。ACKフラグなしなのでACK欄は無効。',syn);
  if (scenario==='timeout') {
    step('SYN損失','loss','Serverへ届かずServerはLISTENのまま。',syn);
    for (const rto of [1,2]) {step(`RTO ${rto}秒満了`,'timer','RTOは再送の契機。直ちに接続全体を終了する期限とは別。');step('SYN再送','send','元のSYN SEQ=1000を再利用。次のSEQ=1001は変わらない。',syn);step('再送も損失','loss','この事例では再送にも応答がない。',syn);}
    step('RTO 4秒の説明待ち','timer','説明用バックオフ1→2→4秒。実際のRTO推定や再試行回数は実装依存。');
    client='CLOSED';step('接続試行を打切り','local','教材のポリシーは再送2回後に打切り。RFC共通の固定回数ではありません。');return trace;
  }
  server='SYN-RECEIVED';sa=1001;sn=9001;step('ServerがSYN受信','receive','IRS=1000、RCV.NXT=1001。SYN/ACKを形成しSYNの番号を確保してSND.NXT=9001にする。次の送信ステップはこの形成済みセグメント。',syn);
  step('SYN/ACK送信','send','形成済みのSYNを送信。SYNが1つ消費し、SND.NXT=9001。ClientのSYNをACK=1001で確認。',synack);
  if (scenario==='synack-loss') {step('SYN/ACK損失','loss','ClientはSYN-SENT、ServerはSYN-RECEIVEDのまま。',synack);step('ServerのRTO満了','timer','この例ではServer再送を先に処理。Client SYN再送との順序は環境で異なる。');step('SYN/ACK再送','send','SEQ=9000 / ACK=1001を再利用。SYNを新規に消費しない。',synack);}
  client='ESTABLISHED';ca=9001;step('ClientがSYN/ACK受信','receive','SYNと自分のSYNへのACKを受理。RFC 9293ではこの処理でESTABLISHEDとなり、最終ACKを形成します。Serverはまだ確認待ち。',synack);
  step('最終ACK送信','send','SEQ=1001 / ACK=9001。純粋ACKは番号を消費しません。',ack);
  if (scenario==='ack-loss') {step('最終ACK損失','loss','ClientはESTABLISHEDのまま。ServerはSYN-RECEIVEDで待つ。純粋ACK専用の再送タイマーはありません。',ack);step('ServerのRTO満了','timer','未確認SYNに対するSYN/ACKの再送タイマー。');step('SYN/ACK再送','send','同じSEQ=9000 / ACK=1001。',synack);step('Clientが重複SYN/ACKを受信','receive','既に受信済みのSYN。状態を戻さず現在のACKを返す例（§3.10.7.4のシーケンス検査）。',synack);step('ACKを再度送信','send','新規データなし。SEQ=1001 / ACK=9001のまま。',ack);}
  server='ESTABLISHED';step('Serverが最終ACK受信','receive','Server自身のSYNまで確認された。両端がESTABLISHED。TCPの確立でありTLSの認証・暗号化は別です。',ack);
  if (scenario==='reset') {const rst=p('Client','RST',1001,null);client='CLOSED';step('ClientがABORT / RST送信','send','アプリの中断例。FINによる片方向終了を行わない。',rst);server='CLOSED';step('Serverが有効なRSTを受信','receive','RCV.NXTに一致する受理可能なRSTという条件。任意の偽RSTで必ず切れるという意味ではない。',rst);return trace;}
  const fin=p('Client','FIN,ACK',1001,9001), finAck=p('Server','ACK',9001,1002), serverFin=p('Server','FIN,ACK',9001,1002), lastAck=p('Client','ACK',1002,9002);
  client='FIN-WAIT-1';cn=1002;step('ClientがFIN送信','send','データなしのClientが送信を終了。FINも1つ消費。',fin);
  server='CLOSE-WAIT';sa=1002;step('ServerがFIN受信','receive','Client方向の終了を受理。Serverアプリはまだ送信できる半閉鎖。',fin);
  step('ServerがFINへACK送信','send','ACK=1002。純粋ACKはServerのSEQを進めない。',finAck);
  client='FIN-WAIT-2';step('ClientがFINのACK受信','receive','自分のFINは確認されたがServerの送信終了はまだ。',finAck);
  server='LAST-ACK';sn=9002;step('ServerがFIN送信','send','Serverアプリも終了。SEQ=9001のFINで次は9002。',serverFin);
  client='TIME-WAIT';ca=9002;step('ClientがServerのFIN受信','receive','TIME-WAITに入り2 MSLタイマーを開始。ServerのFINを確認するACKを形成。',serverFin);
  step('Clientが最後のACK送信','send','SEQ=1002 / ACK=9002。ClientはTIME-WAITのまま。',lastAck);
  if (scenario==='finack-loss') {step('最後のACK損失','loss','ServerはLAST-ACKのまま。Clientに純粋ACK専用の再送タイマーはない。',lastAck);step('Server FINのRTO満了','timer','未確認のFINを再送する。');step('ServerがFIN再送','send','元のFIN SEQ=9001を再利用。',serverFin);step('Clientが重複FIN受信','receive','TIME-WAITで再ACKし、2 MSLタイマーを再開始する。',serverFin);step('Clientが再ACK','send','ACK=9002で再確認。TIME-WAITは継続。',lastAck);}
  server='CLOSED';step('Serverが最後のACK受信','receive','FINが確認されServerのこの接続はCLOSED。待受け全体の停止ではありません。',lastAck);
  client='CLOSED';step('2 MSL満了','timer','TIME-WAIT後にClientもCLOSED。MSLの具体値・タイマーは実装依存です。');
  return trace;
}
