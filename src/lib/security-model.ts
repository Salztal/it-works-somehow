export const tlsSteps = [
  ['ClientHello','C → S','対応方式と公開key_shareを提案。通常のこの例ではまだ平文。秘密値は送らない。'],
  ['ServerHello','S → C','方式とkey_shareを選択。この後のハンドシェイク用鍵を導出。'],
  ['EncryptedExtensions','S → C','暗号化した拡張。ServerHelloに必要な鍵交換の情報とは段階が違う。'],
  ['Certificate','S → C','証明書チェーンを提示。信頼点、制約、用途、名前、期限等を確認。'],
  ['CertificateVerify','S → C','文脈を付けたトランスクリプトへ署名し、秘密鍵所持を接続に結び付ける。'],
  ['Finished','S → C','導出したfinished_keyによるMAC。トランスクリプトと鍵の一致を確認。'],
  ['Finished','C → S','クライアントも鍵とトランスクリプトを確認。'],
  ['Application Data','C ↔ S','用途・方向別のアプリ用鍵とnonceによるAEAD。'],
];
export function firewall(zone: string, port: number, broadFirst: boolean) {
  if (!['internet','admin'].includes(zone) || !Number.isInteger(port) || port < 1 || port > 65535) throw Error('送信元と1〜65535の整数ポートを指定してください。');
  if (broadFirst) return {allow:false, rule:'1: 全通信を拒否（先頭で一致し、後続の許可は評価されない）'};
  if (zone === 'admin' && port === 22) return {allow:true, rule:'1: 管理網 → TCP/22 を許可'};
  if (port === 443) return {allow:true, rule:'2: 任意 → TCP/443 を許可'};
  return {allow:false, rule:'3: その他を拒否'};
}
export function domain(s: string) {
  const value=s.trim().toLowerCase();
  if (value.length > 253 || !value.includes('.') || !value.split('.').every(x => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(x))) throw Error('例 example.test のようなASCIIドメインを入力してください（末尾ドットなし）。');
  return value;
}
export function mail(from: string, spfDomain: string, spfPass: boolean, dkimDomain: string, dkimPass: boolean) {
  const f=domain(from), s=domain(spfDomain), d=domain(dkimDomain);
  const alignedSpf=spfPass && f===s, alignedDkim=dkimPass && f===d;
  return {pass:alignedSpf || alignedDkim, alignedSpf, alignedDkim};
}
export function chain(kind: 'certificate'|'dnssec', checks: boolean[]) {
  if (checks.length !== 4) throw Error('検証条件が不足しています。');
  const labels=kind==='certificate' ? ['信頼点へのパス','接続先名','有効期間','失効状態・方針'] : ['設定済み信頼点','親のDS RRset署名','DSと子DNSKEY','対象RRset署名と有効期間'];
  const i=checks.findIndex(x=>!x);
  return i<0 ? 'この簡略モデルの条件は全て成立。実装では他の制約・アルゴリズム・鮮度等の検査も必要。' : `${labels[i]}で検証を続行できません。${kind==='dnssec' ? '署名された委任を期待するこのモデルでは、信頼点不備またはbogusの原因を調査します。未署名委任のinsecureとは区別します。' : '安全な接続として無条件に受け入れません。'}`;
}
export const logs = [
  ['09:00:01Z','198.51.100.8','u17','login fail','r1','認証失敗。単独では誤入力も考えられる。'],
  ['09:00:04Z','198.51.100.8','u17','login fail','r2','短時間の反復。頻度と他アカウントへの試行も調査。'],
  ['09:00:07Z','198.51.100.8','u17','login fail','r3','同じ主体への失敗が連続。まだ侵害成功とは断定しない。'],
  ['09:02:00Z','198.51.100.8','u17','login success','r4','成功へ変化。MFA、端末、正規作業と照合。'],
  ['09:03:00Z','198.51.100.8','u17','export 1200 rows','r5','成功後に大量取得。対象データ・権限・業務上の必要性を調査。'],
  ['09:04:00Z','203.0.113.7','u22','GET /help 200','r6','ヘルプの200だけでは不正アクセスや認証成功の証明にならない。'],
];
export const priorityCases = [
  ['A','CVSS 9.8 / 隔離検証機 / 既知の悪用情報なし','隔離の実効性を確認し、期限と担当を決めて修正。数値が高くても公開状況等を無視しない。'],
  ['B','CVSS 8.1 / 公開認証基盤 / 既知の悪用あり','この仮定では緊急封じ込めと修正を優先。侵害形跡の調査も行う。停止影響も考えて決定する。'],
];
