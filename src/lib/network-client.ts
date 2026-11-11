import {subnet,vlan,routing,dhcp,pat,dns,diagnose,outageCases,tcpTrace,tcpScenarios,type TcpScenario,type TcpStep} from './network-model';
for (const lab of document.querySelectorAll<HTMLElement>('[data-network-lab]')) {
  const result=lab.querySelector<HTMLElement>('[data-result]')!;
  if (lab.dataset.networkLab === 'tcp') {
    const scenario=lab.querySelector<HTMLSelectElement>('[data-field=scenario]')!,jump=lab.querySelector<HTMLSelectElement>('[data-field=step]')!;
    const first=lab.querySelector<HTMLButtonElement>('[data-action=first]')!,prev=lab.querySelector<HTMLButtonElement>('[data-action=prev]')!,next=lab.querySelector<HTMLButtonElement>('[data-action=next]')!;
    let steps:TcpStep[]=[],index=0;
    const packetText=(s:TcpStep)=>s.packet?`${s.packet.from==='Client'?'Client → Server':'Server → Client'} ${s.packet.flags} SEQ=${s.packet.seq} ACK=${s.packet.ack??'—（無効）'} LEN=${s.packet.length}`:'ローカル処理（パケットなし）';
    const render=()=>{
      const s=steps[index];jump.value=String(index);prev.disabled=index===0;first.disabled=index===0;next.disabled=index===steps.length-1;
      lab.querySelector('[data-client-state]')!.textContent=s.client;lab.querySelector('[data-server-state]')!.textContent=s.server;
      lab.querySelector('[data-client-numbers]')!.textContent=s.client==='CLOSED'?'接続用の変数なし（ISN例1000）':`SND.NXT=${s.clientNext} / RCV.NXT=${s.clientAck??'未確定'}`;
      lab.querySelector('[data-server-numbers]')!.textContent=s.server==='CLOSED'||s.server==='LISTEN'?'接続用の変数未確定（ISN例9000）':`SND.NXT=${s.serverNext} / RCV.NXT=${s.serverAck??'未確定'}`;
      result.textContent=`${index+1} / ${steps.length}：${s.label}\nClient ${s.client} / Server ${s.server}\n${packetText(s)}\n${s.text}`;
      const tbody=lab.querySelector('[data-timeline]')!;tbody.replaceChildren();
      for (const [i,row] of steps.entries()) {
        if (i>index) break;
        const tr=document.createElement('tr');if(i===index)tr.setAttribute('aria-current','step');
        for(const text of [`${i+1} ${row.label}`,row.client,`${packetText(row)}\n${({local:'処理',send:'送信',receive:'受信',loss:'損失',timer:'タイマー'})[row.event]}`,row.server]) {const td=document.createElement('td');td.textContent=text;tr.append(td);}tbody.append(tr);
      }
    };
    const select=()=>{if(!Object.hasOwn(tcpScenarios,scenario.value))return;steps=tcpTrace(scenario.value as TcpScenario);index=0;jump.replaceChildren(...steps.map((s,i)=>new Option(`${i+1} ${s.label}`,String(i))));render();};
    const move=(to:number)=>{index=Math.max(0,Math.min(steps.length-1,to));render();};
    first.addEventListener('click',()=>move(0));prev.addEventListener('click',()=>move(index-1));next.addEventListener('click',()=>move(index+1));jump.addEventListener('change',()=>move(Number(jump.value)));scenario.addEventListener('change',select);
    lab.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|SELECT|TEXTAREA/.test((event.target as HTMLElement).tagName))return;const to=event.key==='ArrowRight'?index+1:event.key==='ArrowLeft'?index-1:event.key==='Home'?0:event.key==='End'?steps.length-1:null;if(to!==null){event.preventDefault();move(to);}});select();
    continue;
  }
  const form=lab.querySelector<HTMLFormElement>('form')!;
  const caseSelect=form.querySelector<HTMLSelectElement>('[data-case-select]');
  caseSelect?.addEventListener('change',()=>{lab.querySelector('[data-case-logs]')!.textContent=outageCases.find(c=>c.id===caseSelect.value)!.logs.join('\n');result.textContent='新しいケースの証拠を読み、判断を照合してください。';});
  form.addEventListener('submit',event=>{
    event.preventDefault();const data=new FormData(form),str=(k:string)=>String(data.get(k)??''),num=(k:string)=>{const value=str(k);if(!value.trim())throw Error('数値を入力してください。');return Number(value);},check=(k:string)=>data.has(k);
    try {
      let text='';
      switch(lab.dataset.networkLab){
        case 'subnet': {const s=subnet(str('cidr'));text=`ネットワーク ${s.network}/${s.prefix}\nマスク ${s.mask}\n総範囲 ${s.network} 〜 ${s.end}（${s.size}個）\nブロードキャスト ${s.broadcast??'なし（この用途）'}\nホスト候補 ${s.hostFirst} 〜 ${s.hostLast}（${s.hosts}個）\n${s.note}`;break;}
        case 'vlan': {const r=vlan(num('source'),num('destination'),check('routed'));text=`${r.allow?'前提条件で転送可能':'L2では届かない'}：${r.path}`;break;}
        case 'routing': {const rows=str('routes').trim().split(/\r?\n/).map(line=>{const parts=line.split(',');if(parts.length!==2)throw Error('各行はCIDR,次ホップ/出口で入力してください。');return {cidr:parts[0].trim(),next:parts[1].trim()};});const r=routing(str('destination'),rows);text=r.candidates.map(c=>`${c.match?'一致':'不一致'} ${c.cidr} → ${c.next}`).join('\n')+'\n選択：'+(r.selected?`${r.selected.cidr} → ${r.selected.next}（一致中の最長 /${r.selected.prefix}）`:'一致なし。転送先を決定できません。');break;}
        case 'dhcp': {const r=dhcp(check('remote'),check('relay'),num('stage'),num('lease'),num('elapsed'));text=r.phase+'\n'+r.text;break;}
        case 'nat': text=pat(str('direction'),str('address').trim(),num('port'));break;
        case 'dns': {const r=dns(num('ttl'),num('elapsed'),check('truncated'),check('tcpAllowed'));text=r.phase+'\n'+r.text;break;}
        case 'troubleshoot': text=diagnose(str('caseId'),str('answer')).text;break;
      }
      result.textContent=text;
    } catch(error) {result.textContent=error instanceof Error?error.message:'条件を確認してください。';}
  });
}
