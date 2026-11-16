import {mailLessons} from '../content/mail/course.ts';
import {mailMissions} from '../content/mail/missions.ts';
export {mailLessons,mailMissions};
export {mailCases} from '../content/mail/diagnosis.ts';
export {units} from '../content/mail/types.ts';
export {sources,baseline} from '../content/mail/sources.ts';
export const mailPath=(id:string)=>{const l=mailLessons.find(x=>x.id===id);if(!l&&!mailMissions.some(x=>x.id===id))throw Error('未知のMail教材 '+id);return l?`/mail/unit-${l.unit}/${id}/`:`/mail/exercises/${id}/`;};
export const mailToc=(id:string)=>mailLessons.some(l=>l.id===id)?[{slug:'situation',text:'事象と前提'},{slug:'mechanism',text:'原因と状態変化'},{slug:'diagram',text:'図と比較'},{slug:'practice',text:'操作して確認'},{slug:'quiz',text:'確認問題'},{slug:'sources',text:'関連教材・出典'}]:[{slug:'situation',text:'背景と事象'},{slug:'evidence',text:'調査対象と証拠'},{slug:'quiz',text:'判断問題'},{slug:'assignment',text:'調査記録'},{slug:'explanation',text:'解説と未確認事項'},{slug:'sources',text:'関連教材・出典'}];
// Reciprocal links wrap existing manuscripts without changing their saved IDs or original text.
export const mailConnections:Record<string,string[]>={
 'n19-dns':['mail-ml07'],'n16-transport':['mail-ml02','mail-ml09'],'n24-troubleshooting':['mail-ml13','mail-ml15'],
 's08-01':['mail-ml08'],'s07-01':['mail-ml09'],
 'web-h03':['mail-ml09'],'web-h15':['mail-ml15'],
 'spring-s10':['mail-ml15'],'spring-s13':['mail-ml06','mail-ml15'],
 'td-t07':['mail-ml06'],'td-t11':['mail-ml13'],
 'web-register':['mail-ml15'],'web-flow':['mail-ml01']
};
