export type Question = {question:string;choices:string[];correct:number;explanations:string[]};
export type Section = {id:string;title:string;paragraphs:string[];code?:string;table?:{headers:string[];rows:string[][]};graph?:string};
export type GitLesson = {id:string;number:string;unit:number;title:string;description:string;goals:string[];situation:string;inspect:string;sections:Section[];practice:{task:string;expected:string;recovery:string};quiz:Question[];sources:string[];related:string[];lab?:string};
export type GitMission = {id:string;number:string;title:string;description:string;state:string;goal:string;inspect:string;choices:Question[];steps:Section[];verify:string;report:string;limit:string;sources:string[];related:string[];lab:string};
export const units = ['Gitの基本的な考え方','毎日の開発で使う','履歴をきれいにする','必要な変更だけ扱う','実務と事故対応'];
