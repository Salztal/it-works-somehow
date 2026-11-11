import lessons from '../content/network/foundations.json';
import missions from '../content/network/missions.json';
import type { Lesson } from './security';
import {tcpTrace,tcpScenarios,outageCases,dhcpSteps,mappings,type TcpScenario} from './network-model';
export type NetworkLesson = Omit<Lesson,'level'|'unit'|'unitTitle'> & {unit?:string;unitTitle?:string;lab:string;tasks?:string[][]};
export const foundations = lessons as NetworkLesson[];
export const networkMissions = missions as NetworkLesson[];
export const networkAdditions = [...foundations,...networkMissions];
export function networkSearchText(id:string) {
  const l=networkAdditions.find(l=>l.id===id)!;
  const lab=l.lab==='tcp'?Object.keys(tcpScenarios).flatMap(s=>tcpTrace(s as TcpScenario)):
    l.lab==='troubleshoot'?outageCases:l.lab==='dhcp'?dhcpSteps:l.lab==='nat'?mappings:[];
  return JSON.stringify({lesson:l,lab});
}
export const networkUnits = ['通信の基本構造','IPアドレスとアドレス配布','ルーティングとアドレス変換','TCPとUDP','名前解決と通信解析','通信設計と障害対応'].map((title,i)=>({id:`unit-${'abcdef'[i]}`,letter:'ABCDEF'[i],title}));
export const networkToc = (l:NetworkLesson) => [
  {slug:'goals',text:'学習目標・前提知識'},...l.sections.map(s=>({slug:s.id,text:s.title})),
  {slug:'example',text:'具体的な通信例'},...(l.lab?[{slug:'lab',text:'操作して確かめる'}]:[]),
  ...(l.tasks?[{slug:'reasoning',text:'理由と設計を書く'}]:[]),
  {slug:'pitfalls',text:'よくある誤解'},{slug:'quiz',text:'確認問題'},{slug:'sources',text:'関連教材・一次資料'}
];
