export type Question={question:string;choices:string[];correct:number;explanations:string[]};
export const q=(question:string,correct:number,...options:[string,string][]):Question=>({question,correct,choices:options.map(o=>o[0]),explanations:options.map(o=>o[1])});
export type Lesson={id:string;number:string;unit:number;title:string;description:string;situation:string;think:string;explanation:string[];example:{headers:string[];rows:string[][]};lab:string;practice:string;observation:string;pitfalls:string[];quiz:Question[];sources:string[];related:string[]};
export type Mission={id:string;number:string;title:string;description:string;background:string;assumptions:string;evidence:string[];quiz:Question[];assignment:string;explanation:string[];unknown:string[];risks:string[];lab:string;sources:string[];related:string[]};
export const units=['HTTPの仕組みを理解する','ブラウザと状態管理','通信経路とパフォーマンス','Webアプリケーションの処理','障害調査と実務応用'];
