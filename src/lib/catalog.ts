import javaRows from '../content/java-pages.json';
import network from '../content/network/course.json';
export { network };
export type Entry = { id: string; area: 'network' | 'java'; section: string; label: string; number: string; path: string; kind: 'network' | 'mission' | 'java'; description: string };
const networkLabels = ['ネットワークの役割', 'IPアドレスとサブネット', 'ゲートウェイとルーティング', 'DNS・ポート・HTTP', 'ファイアウォールとNSG', 'Azureの構成を考える'];
export { javaRows };
export const entries: Entry[] = [
  ...network.lessons.map((l, i) => ({ id: l.id, area: 'network' as const, section: i < 5 ? 'basics' : 'azure', label: networkLabels[i], number: l.number, path: `/network/${i < 5 ? 'basics' : 'azure'}/${l.id}/`, kind: 'network' as const, description: l.subtitle })),
  ...network.missions.map((m, i) => ({ id: m.id, area: 'network' as const, section: 'exercises', label: ['Web・DBの構成設計', 'Webアクセスの流れ', 'Azure構成図を読む'][i], number: m.n, path: `/network/exercises/${m.id}/`, kind: 'mission' as const, description: m.s })),
  ...javaRows.map(([id, label, number, section, description]) => ({ id, area: 'java' as const, section, label, number, path: id === 'setup' ? '/java/setup/' : `/java/${section}/${id}/`, kind: 'java' as const, description })),
];
export const sections = [
  { path: '/network/', area: 'network', label: 'ネットワーク', description: '通信の基礎からAzureの構成設計まで。図で理解し、問題とミッションで確かめます。' },
  { path: '/network/basics/', area: 'network', section: 'basics', label: 'ネットワーク基礎', description: '機器をつなぐ仕組みを、身近な例と図解から学びます。' },
  { path: '/network/azure/', area: 'network', section: 'azure', label: 'Azure・構成設計', description: '基礎で学んだ用語を、Azureネットワークの構成に結び付けます。' },
  { path: '/network/exercises/', area: 'network', section: 'exercises', label: 'ネットワーク演習', description: '3つのミッションで、要件と構成図から通信を考えます。' },
  { path: '/java/', area: 'java', label: 'Java', description: 'Java 17・MySQL・Servlet・JSP。小さなTodoアプリを作りながら、入力から保存までを学びます。' },
  { path: '/java/lessons/', area: 'java', section: 'lessons', label: 'Javaの講義', description: 'コンソール、データベース、Webの順に進みます。' },
  { path: '/java/exercises/', area: 'java', section: 'exercises', label: 'Javaの演習', description: '各章の開始コードで実装し、完成条件を確かめます。' },
];
export function href(path: string) { return import.meta.env.BASE_URL.replace(/\/$/, '') + path; }
export const areaLabel = (area: string) => area === 'network' ? 'ネットワーク' : 'Java';
export const entryKey = (e: Entry) => `${e.area}:${e.id}`;
