import {webLessons} from '../content/web/course';
import {webMissions} from '../content/web/missions';
export {webLessons,webMissions};
export {sources} from '../content/web/sources';
export {units} from '../content/web/types';
export {webCases} from '../content/web/diagnosis';
export const webPath=(id:string)=>{const l=webLessons.find(x=>x.id===id);return l?`/web/unit-${l.unit}/${id}/`:`/web/exercises/${id}/`;};
export const webToc=(id:string)=>webLessons.some(l=>l.id===id)?[{slug:'situation',text:'観測した事象'},{slug:'think',text:'まず考える'},{slug:'mechanism',text:'仕組みと境界'},{slug:'example',text:'具体例'},{slug:'practice',text:'操作して観測する'},{slug:'pitfalls',text:'判断の注意点'},{slug:'quiz',text:'確認問題'},{slug:'sources',text:'関連教材・出典'}]:[{slug:'situation',text:'背景と前提'},{slug:'evidence',text:'証拠'},{slug:'quiz',text:'判断問題'},{slug:'assignment',text:'調査記録を作る'},{slug:'explanation',text:'解説'},{slug:'unknown',text:'未確認・残存リスク'},{slug:'sources',text:'関連教材・出典'}];
// Connections are rendered in BOTH directions without rewriting the old manuscripts.
export const webConnections:Record<string,string[]>={
 'n16-transport':['web-h01','web-h13'],'n17-tcp-handshake':['web-h01','web-h13'],'n19-dns':['web-h01','web-h13'],'dns-port-http':['web-h01','web-h03'],
 's07-01':['web-h01','web-h11'],'s03-02':['web-h06','web-h11'],'s03-01':['web-h10','web-h11'],'s05-01':['web-h04','web-h05'],'s08-01':['web-h05','web-h06'],
 'web-flow':['web-h01','web-h10'],'web-register':['web-h10','web-h11'],'web-crud':['web-h10','web-h13'],
 'td-t11':['web-h10','web-h13'],'td-t12':['web-h15'],'g02':['web-h15'],'g14':['web-h15'],
};
