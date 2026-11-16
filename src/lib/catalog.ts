import mailCatalog from '../generated/mail-catalog.json';
import {units as mailUnits} from '../content/mail/types';
import javaRows from '../content/java-pages.json';
import network from '../content/network/course.json';
import security from '../generated/security-catalog.json';
import { foundations, networkMissions, networkUnits } from './network';
import gitCatalog from '../generated/git-catalog.json';
import { units } from '../content/git/types';
import testCatalog from '../generated/test-design-catalog.json';
import {units as testUnits} from '../content/test-design/types';
import webCatalog from '../generated/web-catalog.json';
import springCatalog from '../generated/spring-catalog.json';
import {units as springUnits} from '../content/spring/types';
import {units as webUnits} from '../content/web/types';
const levelSection = (level: string) => level === 'BASIC' ? 'basics' : level.toLowerCase();
export { network };
export type Entry = { id: string; area: 'network' | 'java' | 'security' | 'git' | 'test-design' | 'web' | 'spring' | 'mail'; section: string; label: string; number: string; path: string; kind: 'network' | 'mission' | 'foundation' | 'network-mission' | 'java' | 'security' | 'git' | 'test-design' | 'web' | 'spring' | 'mail'; description: string; level?: string };
const networkLabels = ['ネットワークの役割', 'IPアドレスとサブネット', 'ゲートウェイとルーティング', 'DNS・ポート・HTTP', 'ファイアウォールとNSG', 'Azureの構成を考える'];
const legacyNetworkEntries = network.lessons.map((l, i) => ({ id: l.id, area: 'network' as const, section: i < 5 ? 'basics' : 'azure', label: networkLabels[i], number: l.number, path: `/network/${i < 5 ? 'basics' : 'azure'}/${l.id}/`, kind: 'network' as const, description: l.subtitle }));
export { javaRows };
export const entries: Entry[] = [
  ...mailCatalog.map(l=>({id:l.id,area:'mail' as const,section:l.section,label:l.title,number:l.number,path:l.path,kind:'mail' as const,description:l.description})),
  ...springCatalog.map(l=>({id:l.id,area:'spring' as const,section:l.section,label:l.title,number:l.number,path:l.path,kind:'spring' as const,description:l.description})),
  ...webCatalog.map(l=>({id:l.id,area:'web' as const,section:l.section,label:l.title,number:l.number,path:l.path,kind:'web' as const,description:l.description})),
  ...legacyNetworkEntries.slice(0,5),
  ...foundations.map(l => ({id:l.id,area:'network' as const,section:`unit-${l.unit!.toLowerCase()}`,label:l.title,number:l.number,path:`/network/unit-${l.unit!.toLowerCase()}/${l.id}/`,kind:'foundation' as const,description:l.description})),
  ...legacyNetworkEntries.slice(5),
  ...network.missions.map((m, i) => ({ id: m.id, area: 'network' as const, section: 'exercises', label: ['Web・DBの構成設計', 'Webアクセスの流れ', 'Azure構成図を読む'][i], number: m.n, path: `/network/exercises/${m.id}/`, kind: 'mission' as const, description: m.s })),
  ...networkMissions.map(m=>({id:m.id,area:'network' as const,section:'exercises',label:m.title,number:m.number,path:`/network/exercises/${m.id}/`,kind:'network-mission' as const,description:m.description})),
  ...javaRows.map(([id, label, number, section, description]) => ({ id, area: 'java' as const, section, label, number, path: id === 'setup' ? '/java/setup/' : `/java/${section}/${id}/`, kind: 'java' as const, description })),
  ...security.map(l => ({ id: l.id, area: 'security' as const, section: levelSection(l.level), label: l.title, number: l.number, path: `/security/${levelSection(l.level)}/${l.id}/`, kind: 'security' as const, description: l.description, level: l.level })),
  ...gitCatalog.map(l=>({id:l.id,area:'git' as const,section:l.section,label:l.title,number:l.number,path:l.path,kind:'git' as const,description:l.description})),
  ...testCatalog.map(l=>({id:l.id,area:'test-design' as const,section:l.section,label:l.title,number:l.number,path:l.path,kind:'test-design' as const,description:l.description})),
];
export const sections = [
  {path:'/mail/',area:'mail',label:'Mail・メールサーバー',description:'なぜ届くのか、なぜ届かないのか。5 Unit・15講義・5ミッション・60問、8操作教材と15症例で責任境界を追う。'},
  ...mailUnits.map((u,i)=>({path:`/mail/unit-${i+1}/`,area:'mail',section:`unit-${i+1}`,label:`Unit ${i+1}：${u}`,description:`Mail：${u}を3講義と操作教材で学びます。`})),
  {path:'/mail/exercises/',area:'mail',section:'exercises',label:'Mailの実践ミッション',description:'受付失敗・キュー滞留・Alignment・迷惑メール・確認メールの5件を合成証拠から調べる。'},
  {path:'/spring/',area:'spring',label:'Spring Boot・業務アプリ設計',description:'架空の注文APIで依存・永続化・Transactionの状態を追う。4 Unit・15講義・5ミッション・72問。ブラウザ内の概念教材。'},
  ...springUnits.map((u,i)=>({path:`/spring/unit-${i+1}/`,area:'spring',section:`unit-${i+1}`,label:`Unit ${i+1}：${u}`,description:`Spring設計：${u}を注文APIで学びます。`})),
  {path:'/spring/exercises/',area:'spring',section:'exercises',label:'Spring設計の実践ミッション',description:'処理追跡・Entity状態・例外・二重登録・機能追加の設計判断を行う5件。'},
  {path:'/web/',area:'web',label:'HTTP・Webアプリ',description:'ブラウザからDBまでの通信を観測し、根拠を持って切り分ける。5 Unit・15講義・5ミッション・60問と8操作教材。'},
  ...webUnits.map((u,i)=>({path:`/web/unit-${i+1}/`,area:'web',section:`unit-${i+1}`,label:`Unit ${i+1}：${u}`,description:`HTTP・Webアプリ：${u}を3講義と操作教材で学びます。`})),
  {path:'/web/exercises/',area:'web',section:'exercises',label:'HTTP・Webアプリの実践ミッション',description:'画面表示・ログイン・CORS・キャッシュ・500系障害を証拠から判断する5件。'},
  {path:'/test-design/',area:'test-design',label:'テスト設計',description:'何を確認し、何が未確認かを説明する。5ユニット・15講義・5ミッション・60問で、仕様からテスト観点を設計します。'},
  ...testUnits.map((u,i)=>({path:`/test-design/unit-${i+1}/`,area:'test-design',section:`unit-${i+1}`,label:`Unit ${i+1}：${u}`,description:`テスト設計：${u}を3講義と操作教材で学びます。`})),
  {path:'/test-design/exercises/',area:'test-design',section:'exercises',label:'テスト設計の実践ミッション',description:'境界・条件・状態・変更・十分性を判断する5件の架空案件。'},
  {path:'/git/',area:'git',label:'Git実務講座',description:'やりたいこと・困った状況から、安全な操作とその結果を学ぶ15レッスンと5ミッション。'},
  ...units.map((u,i)=>({path:`/git/unit-${i+1}/`,area:'git',section:`unit-${i+1}`,label:`Unit ${i+1}：${u}`,description:`Git実務講座：${u}を3レッスンで学びます。`})),
  {path:'/git/exercises/',area:'git',section:'exercises',label:'Gitの実践ミッション',description:'状態・目的・選択肢・結果・理由を確かめる5つの事故対応。'},
  { path: '/security/', area: 'security', label: 'Security', description: '情報セキュリティの基礎、設計と調査、プロトコルの実験を10ユニット・30レッスンで学びます。' },
  { path: '/security/basics/', area: 'security', section: 'basics', label: 'Security BASIC', description: 'CIAとリスクから、攻撃、防御、暗号、認証、組織的な管理まで。6ユニット・18レッスン。' },
  { path: '/security/advanced/', area: 'security', section: 'advanced', label: 'Security ADVANCED', description: 'TLS・PKI、認証基盤とメール、脆弱性管理とインシデント分析。3ユニット・9レッスン。' },
  { path: '/security/lunatic/', area: 'security', section: 'lunatic', label: 'Security LUNATIC', description: 'TLSのパケット、DNSSECの署名検証、PQCの仕組みと限界。1ユニット・3レッスン。' },
  { path: '/network/', area: 'network', label: 'ネットワーク', description: '24レッスン・77問の確認問題・7ミッション。通信の入門からTCP/IPの観測・障害対応、Azureへの応用まで。' },
  ...networkUnits.map(u=>({path:`/network/${u.id}/`,area:'network',section:u.id,label:`Unit ${u.letter}：${u.title}`,description:`ベンダー非依存のTCP/IP基礎。${u.title}を3レッスンで学びます。`})),
  { path: '/network/basics/', area: 'network', section: 'basics', label: 'ネットワーク基礎', description: '機器をつなぐ仕組みを、身近な例と図解から学びます。' },
  { path: '/network/azure/', area: 'network', section: 'azure', label: 'Azure・構成設計', description: '基礎で学んだ用語を、Azureネットワークの構成に結び付けます。' },
  { path: '/network/exercises/', area: 'network', section: 'exercises', label: 'ネットワーク演習', description: '既存3件と新規M4〜M7、計7つのミッション。設計・パケット・通信経路・障害対応を理由とともに説明します。' },
  { path: '/java/', area: 'java', label: 'Java', description: 'Java 17・MySQL・Servlet・JSP。小さなTodoアプリを作りながら、入力から保存までを学びます。' },
  { path: '/java/lessons/', area: 'java', section: 'lessons', label: 'Javaの講義', description: 'コンソール、データベース、Webの順に進みます。' },
  { path: '/java/exercises/', area: 'java', section: 'exercises', label: 'Javaの演習', description: '各章の開始コードで実装し、完成条件を確かめます。' },
];
export function href(path: string) { return import.meta.env.BASE_URL.replace(/\/$/, '') + path; }
export const areaLabel = (area: string) => area === 'mail' ? 'Mail・メールサーバー' : area === 'spring' ? 'Spring Boot・業務アプリ設計' : area === 'web' ? 'HTTP・Webアプリ' : area === 'network' ? 'ネットワーク' : area === 'security' ? 'Security' : area === 'git' ? 'Git' : area === 'test-design' ? 'テスト設計' : 'Java';
export const entryKey = (e: Entry) => `${e.area}:${e.id}`;
