import { gitLessons } from '../content/git/course';
import { gitMissions } from '../content/git/missions';
export { gitLessons, gitMissions };
export { units } from '../content/git/types';
export { rescueCases, states } from '../content/git/rescue';
export { sources } from '../content/git/sources';
export const gitPath=(id:string)=>{const l=gitLessons.find(l=>l.id===id);return l?`/git/unit-${l.unit}/${id}/`:`/git/exercises/${id}/`;};
export const gitToc=(id:string)=>{
 const l=gitLessons.find(l=>l.id===id),m=gitMissions.find(m=>m.id===id);
 return [...(l?[{slug:'situation',text:'こんなときに困る'},{slug:'inspect',text:'まず状態を確認'},...l.sections.map(s=>({slug:s.id,text:s.title})),{slug:'practice',text:'練習と確認'}]:[{slug:'situation',text:'状態と目的'},{slug:'inspect',text:'調査する'},{slug:'quiz',text:'選んで判断する'},...m!.steps.map(s=>({slug:s.id,text:s.title})),{slug:'verify',text:'結果の検証と報告'}]),...(l?[{slug:'quiz',text:'確認問題'}]:[]),{slug:'sources',text:'関連教材・参考資料'}];
};
