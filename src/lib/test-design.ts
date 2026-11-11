import {testLessons} from '../content/test-design/course';
import {testMissions} from '../content/test-design/missions';
export {testLessons,testMissions};
export {sources} from '../content/test-design/sources';
export {units} from '../content/test-design/types';
export const testPath=(id:string)=>{const l=testLessons.find(l=>l.id===id);return l?`/test-design/unit-${l.unit}/${id}/`:`/test-design/exercises/${id}/`;};
export const testToc=(id:string)=>('unit' in [...testLessons,...testMissions].find(x=>x.id===id)!?['situation','think','technique','example','practice','omissions','quiz','sources']:['situation','scope','quiz','assignment','model','risk','sources']).map(slug=>({slug,text:({situation:'実務の問題',think:'何を確認する？',technique:'考え方と技法',example:'設計の具体例',practice:'操作して試す',omissions:'見落としと注意点',quiz:'確認問題',sources:'関連教材・出典',scope:'現在のテスト範囲',assignment:'自分で設計する',model:'模範的な考え方',risk:'欠陥と残存リスク'} as Record<string,string>)[slug]}));
