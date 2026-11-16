export type Question={question:string;choices:string[];correct:number;explanations:string[]};
export const q=(question:string,correct:number,...options:[string,string][]):Question=>({question,correct,choices:options.map(x=>x[0]),explanations:options.map(x=>x[1])});
export type Section={title:string;paragraphs:string[]};
export type Lesson={id:string;number:string;unit:number;title:string;description:string;prerequisite:string;part:string;situation:string;goals:string[];sections:Section[];diagram:string;table:{headers:string[];rows:string[][]};lab:string;practice:string;pitfalls:string[];quiz:Question[];sources:string[];related:string[]};
export type Mission={id:string;number:string;title:string;description:string;background:string;assumptions:string;evidence:string[];targets:string[];quiz:Question[];assignment:string;explanation:string[];unknown:string[];lab:string;sources:string[];related:string[]};
export const units=['電子メールの仕組み','メールサーバーの構造','DNS・認証・暗号化','メールサーバー運用','実務における障害調査'];
export const section=(title:string,...paragraphs:string[]):Section=>({title,paragraphs});
