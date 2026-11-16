import {mailLessons,mailMissions,mailCases} from '../lib/mail';
import {labs as mailLabs,labUI as mailUI} from '../content/mail/labs';
import {comparisons as mailComparisons} from '../content/mail/comparisons';
import {glossary as mailGlossary} from '../content/mail/glossary';
import { entries, network, href } from '../lib/catalog';
import { security } from '../lib/security';
import { networkSearchText } from '../lib/network';
import { gitLessons, gitMissions, rescueCases } from '../lib/git';
import {testLessons,testMissions} from '../lib/test-design';
import {labs} from '../content/test-design/labs';
import {webLessons,webMissions,webCases} from '../lib/web';
import {labs as webLabs} from '../content/web/labs';
import {comparisons} from '../content/web/comparisons';
import {springLessons,springMissions} from '../lib/spring';
import {labs as springLabs,labUI} from '../content/spring/labs';
import {comparisons as springComparisons} from '../content/spring/comparisons';
import type { APIRoute } from 'astro';
const manuscripts = import.meta.glob<string>('../generated/java/*.md', { query: '?raw', import: 'default', eager: true });
export const GET: APIRoute = () => new Response(JSON.stringify([...entries.map(e => ({
  key: `${e.area}:${e.id}`, title: e.label, area: e.area, url: href(e.path), description: e.description,
  text: (e.kind === 'mail' ? JSON.stringify([...mailLessons,...mailMissions].find(l=>l.id===e.id)) : e.kind === 'spring' ? JSON.stringify([...springLessons,...springMissions].find(l=>l.id===e.id)) : e.kind === 'web' ? JSON.stringify([...webLessons,...webMissions].find(l=>l.id===e.id)) : e.kind === 'test-design' ? JSON.stringify([...testLessons,...testMissions].find(l=>l.id===e.id)) : e.kind === 'git' ? JSON.stringify([...gitLessons,...gitMissions].find(l=>l.id===e.id)) : e.kind === 'java' ? manuscripts[`../generated/java/${e.id}.md`] : e.kind === 'foundation' || e.kind === 'network-mission' ? networkSearchText(e.id) : JSON.stringify(e.kind === 'security' ? security.find(l => l.id === e.id) : e.kind === 'mission' ? network.missions.find(m => m.id === e.id) : network.lessons.find(l => l.id === e.id))).replace(/<[^>]+>/g, ' '),
})), ...mailLabs.map(([key,title])=>({key:`mail:lab-${key}`,title,area:'mail',url:href(`/mail/lab/${key}/`),description:mailUI[key].steps,text:JSON.stringify(mailUI[key])})), ...mailCases.map(c=>({key:`mail:qa-${c.id}`,title:c.title,area:'mail',url:href(`/mail/diagnosis/#${c.id}`),description:c.first,text:JSON.stringify(c)})), ...mailComparisons.map(c=>({key:`mail:comparison-${c.id}`,title:c.title,area:'mail',url:href(`/mail/comparisons/#${c.id}`),description:c.when,text:JSON.stringify(c)})), ...mailGlossary.map(c=>({key:`mail:term-${c.id}`,title:c.term,area:'mail',url:href(`/mail/glossary/#${c.id}`),description:c.definition,text:JSON.stringify(c)})), ...springLabs.map(([key,title])=>({key:`spring:lab-${key}`,title,area:'spring',url:href(`/spring/lab/${key}/`),description:'注文APIの状態変化を追う学習用モデル',text:JSON.stringify(labUI[key])})), ...springComparisons.map(c=>({key:`spring:comparison-${c.id}`,title:c.title,area:'spring',url:href(`/spring/comparisons/#${c.id}`),description:c.when,text:JSON.stringify(c)})), ...webLabs.map(([key,title])=>({key:`web:lab-${key}`,title,area:'web',url:href(`/web/lab/${key}/`),description:'架空通信の条件を操作して観測する教材',text:JSON.stringify([...webLessons,...webMissions].filter(x=>x.lab===key))})), ...webCases.map(c=>({key:`web:qa-${c.id}`,title:c.title,area:'web',url:href(`/web/diagnosis/#${c.id}`),description:c.first,text:JSON.stringify(c)})), ...comparisons.map(c=>({key:`web:comparison-${c.id}`,title:c.title,area:'web',url:href(`/web/comparisons/#${c.id}`),description:c.when,text:JSON.stringify(c)})), ...labs.map(([key,title])=>({key:`test-design:lab-${key}`,title,area:'test-design',url:href(`/test-design/lab/${key}/`),description:'仕様と実行結果・未確認条件を確かめる操作教材',text:`テスト設計 ${title}`})),{key:'test-design:templates',title:'実務向けテンプレート',area:'test-design',url:href('/test-design/templates/'),description:'観点表・ケース表・不具合報告書',text:'仕様 期待結果 証跡 CSV Markdown テスト観点 テストケース 不具合報告'}, ...rescueCases.map(c=>({key:`git:qa-${c.id}`,title:c.title,area:'git',url:href(`/git/rescue/#${c.id}`),description:c.what,text:JSON.stringify(c)}))]), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
