import a from '../content/security/basic-01-03.json';
import b from '../content/security/basic-04-06.json';
import c from '../content/security/advanced.json';
import d from '../content/security/lunatic.json';
export type Level = 'BASIC' | 'ADVANCED' | 'LUNATIC';
export type Source = { title: string; publisher: string; url: string; version: string; checked: string };
export type Lesson = {
  id: string; number: string; unit: string; unitTitle: string; level: Level; title: string; description: string;
  prerequisites: string[]; goals: string[];
  sections: { id: string; title: string; paragraphs: string[]; flow?: string[]; table?: { headers: string[]; rows: string[][] }; code?: string }[];
  example: { title: string; paragraphs: string[]; code?: string }; pitfalls: string[];
  quiz: { question: string; choices: string[]; correct: number; explanations: string[] }[];
  references: Source[]; related: string[];
};
export const security = [...a, ...b, ...c, ...d] as Lesson[];
export const levelSection = (level: Level) => level === 'BASIC' ? 'basics' : level.toLowerCase();
export const demos: Record<string, string> = {
  's04-01':'aes', 's04-02':'hash', 's04-03':'signature', 's06-01':'firewall',
  's07-01':'tls', 's07-03':'certificate', 's08-03':'mail', 's09-01':'priority', 's09-02':'logs', 's10-02':'dnssec',
};
export const securityToc = (l: Lesson) => [
  { slug:'goals',text:'学ぶこと・前提知識' }, ...l.sections.map(s => ({slug:s.id,text:s.title})),
  { slug:'example',text:'具体例' }, ...(demos[l.id] ? [{slug:'lab',text:'操作して確かめる'}] : []),
  ...(l.id === 's10-01' ? [{slug:'pcap',text:'合成PCAPの解析'}] : []),
  { slug:'pitfalls',text:'間違いやすいポイント' }, {slug:'quiz',text:'確認問題'}, {slug:'sources',text:'関連教材・参考資料'},
];
