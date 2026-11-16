import {springLessons} from '../content/spring/course.ts';
import {springMissions} from '../content/spring/missions.ts';
export {springLessons,springMissions};
export {units} from '../content/spring/types.ts';
export {sources,baseline} from '../content/spring/sources.ts';
export const springPath=(id:string)=>{const l=springLessons.find(x=>x.id===id);if(!l&&!springMissions.some(x=>x.id===id))throw Error('未知のSpring教材 '+id);return l?`/spring/unit-${l.unit}/${id}/`:`/spring/exercises/${id}/`;};
export const springToc=(id:string)=>springLessons.some(l=>l.id===id)?[{slug:'situation',text:'事象と前提'},{slug:'mechanism',text:'原因と状態変化'},{slug:'diagram',text:'図と比較'},{slug:'practice',text:'操作して確認'},{slug:'quiz',text:'確認問題'},{slug:'sources',text:'関連教材・出典'}]:[{slug:'situation',text:'背景と事象'},{slug:'evidence',text:'調査対象と証拠'},{slug:'quiz',text:'判断問題'},{slug:'assignment',text:'調査記録'},{slug:'explanation',text:'解説と未確認事項'},{slug:'sources',text:'関連教材・出典'}];
// Render reciprocal links around the old manuscripts; their content and IDs are preserved.
export const springConnections:Record<string,string[]>={
 'web-flow':['spring-s01','spring-s04'],'web-register':['spring-s05'],'database':['spring-s07','spring-s08'],'console-dto':['spring-s04'],
 'web-h03':['spring-s05','spring-s06'],'web-h04':['spring-s10'],'web-h05':['spring-s10'],'web-h10':['spring-s04','spring-s15'],
 's03-01':['spring-s10'],'s03-02':['spring-s10'],'s05-01':['spring-s05','spring-s10'],
 'td-t11':['spring-s12','spring-s15'],'td-t12':['spring-s15'],
};
