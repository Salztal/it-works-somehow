export type Question = {question:string; choices:string[]; correct:number; explanations:string[]};
export const q = (question:string, correct:number, ...options:[string,string][]):Question => ({question,correct,choices:options.map(o=>o[0]),explanations:options.map(o=>o[1])});
export type Lesson = {
 id:string; number:string; unit:number; title:string; description:string;
 situation:string; think:string; explanation:string[];
 example:{headers:string[];rows:string[][]}; practice:string; observation:string;
 pitfalls:string[]; quiz:Question[]; sources:string[]; related:string[]; lab:string;
};
export type Mission = {
 id:string;number:string;title:string;description:string;background:string;scope:string;
 choices:Question[];assignment:string;model:string[];defects:string[];risks:string[];
 sources:string[];related:string[];lab:string;
};
export const units=['テスト設計の基本','ブラックボックステスト設計','動作と組み合わせを考える','コード・変更・システム連携','実務でのテスト設計'];
