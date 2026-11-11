import { firewall, mail, chain, tlsSteps, logs, priorityCases } from './security-model';
import { hex, hashText, encryptText, decryptText, signText, verifyText } from './security-crypto';
for (const lab of document.querySelectorAll<HTMLElement>('[data-lab]')) {
  const kind=lab.dataset.lab!, result=lab.querySelector<HTMLElement>('[data-result]')!, bytes=lab.querySelector<HTMLElement>('[data-bytes]');
  const input=(name:string)=>lab.querySelector<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>(`[name="${name}"]`)!;
  const checked=(name:string)=>(input(name) as HTMLInputElement).checked;
  const show=(s:string)=>result.textContent=s;
  let key:CryptoKey|CryptoKeyPair|undefined, data:Uint8Array|undefined, iv:Uint8Array|undefined, generation=0, busy=false;
  function controls() { lab.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(b=>{ const a=b.dataset.action; b.disabled=a==='reset'?false:busy || ((a==='check'||a==='tamper')&&!data); }); }
  function reset() {
    generation++; busy=false; key=undefined; data=undefined; iv=undefined;
    lab.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('input,textarea,select').forEach(el=>{
      if(el instanceof HTMLInputElement) { if(el.type==='checkbox') el.checked=el.defaultChecked; else el.value=el.defaultValue; }
      else if(el instanceof HTMLTextAreaElement) el.value=el.defaultValue;
      else el.selectedIndex=0;
    });
    if(bytes) bytes.textContent='まだ計算していません。'; show('実験を初期状態に戻しました。'); controls();
  }
  lab.addEventListener('click', async event=>{
    const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');
    if(!button) return;
    if(button.dataset.step) { const s=tlsSteps[Number(button.dataset.step)]; show(`${s[1]}: ${s[0]} — ${s[2]}`); return; }
    if(button.dataset.log) { show(logs[Number(button.dataset.log)][5]); return; }
    if(button.dataset.priority) { show(priorityCases[Number(button.dataset.priority)][2]); return; }
    const action=button.dataset.action;
    if(action==='reset') { reset(); return; }
    if(!action || busy) return;
    const token=generation;
    try {
      if(action==='firewall') { const r=firewall(input('zone').value,Number(input('port').value),checked('broad')); show(`${r.allow?'許可':'拒否'}：${r.rule}。${!r.allow?'このルールの通信はFWで拒否。':checked('alert') ? input('mode').value==='ips'?'IPSが検知して遮断（この例は遮断設定）。':'IDSは検知・通知するが、この配置では通信を直接止めない。':'検知一致なし。ただし未検知が安全の証明ではない。'}`); return; }
      if(action==='mail') { const r=mail(input('from').value,input('spf').value,checked('spfPass'),input('dkim').value,checked('dkimPass')); show(`DMARC ${r.pass?'pass':'fail'}。aligned SPF: ${r.alignedSpf} / aligned DKIM: ${r.alignedDkim}。${r.pass?'認証passでも内容の安全は保証しません。':`要求ポリシー p=${input('policy').value}。実際の扱いは受信側方針にも依存します。`}`); return; }
      if(action==='chain') { show(chain(kind as 'certificate'|'dnssec',[0,1,2,3].map(i=>checked(`check${i}`)))); return; }
      if(!globalThis.isSecureContext || !globalThis.crypto?.subtle) throw Error('Web Crypto APIが利用できません。HTTPSまたは対応ブラウザのlocalhostで開いてください。');
      const text=input('text').value;
      if(text.length>4096) throw Error('入力は4096文字以内にしてください。');
      busy=true; controls(); show('計算中…');
      if(action==='hash') {
        const other=input('other').value; if(other.length>4096) throw Error('入力は4096文字以内にしてください。');
        const [a,b]=await Promise.all([hashText(text),hashText(other)]);
        if(token!==generation) return; bytes!.textContent=`A: ${a}\nB: ${b}`; show(a===b?'ハッシュ値は一致します。この値だけで作成者を認証することはできません。':'ハッシュ値は不一致です。入力に違いがあります。');
      } else if(action==='create') {
        if(kind==='aes') {
          const encrypted=await encryptText(text,key as CryptoKey | undefined);
          if(token!==generation) return; key=encrypted.key; iv=encrypted.iv; data=encrypted.data; bytes!.textContent=`IV: ${hex(iv)}\n暗号文 + tag: ${hex(data)}`; show('暗号化しました。保存した暗号文を復号し、次に反転して比較してください。');
        } else {
          const signed=await signText(text);
          if(token!==generation) return; key=signed.key; data=signed.data; bytes!.textContent=`署名: ${hex(data)}`; show('署名しました。文を編集する前後で検証を比較してください。');
        }
      } else if(action==='tamper' && data) { data[0]^=1; bytes!.textContent=`${kind==='aes'?'暗号文 + tag':'署名'}（先頭1bitを反転）: ${hex(data)}`; show('保存データを1ビット反転しました。復号・検証で失敗を確認してください。'); }
      else if(action==='check' && data && key) {
        if(kind==='aes') {
          const plain=await decryptText(key as CryptoKey,iv!,data);
          if(token!==generation) return; show(`復号成功：${plain}`);
        } else {
          const ok=await verifyText((key as CryptoKeyPair).publicKey,text,data);
          if(token!==generation) return; show(ok?'署名検証に成功しました。保存した公開鍵に対応する署名です。名前の本人確認は別途必要です。':'署名検証に失敗しました。文または署名が一致しません。');
        }
      }
    } catch(e) { if(token===generation) show(e instanceof DOMException && e.name==='OperationError'?'復号に失敗しました。暗号文・tag・鍵・IVの不一致等を検出しました。改ざんした平文を出力しません。':e instanceof Error?e.message:'計算できませんでした。'); }
    finally { if(token===generation) { busy=false; controls(); } }
  });
}
