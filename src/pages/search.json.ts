import { entries, network, href } from '../lib/catalog';
import { security } from '../lib/security';
import { networkSearchText } from '../lib/network';
import { gitLessons, gitMissions, rescueCases } from '../lib/git';
import {testLessons,testMissions} from '../lib/test-design';
import {labs} from '../content/test-design/labs';
import type { APIRoute } from 'astro';
const manuscripts = import.meta.glob<string>('../generated/java/*.md', { query: '?raw', import: 'default', eager: true });
export const GET: APIRoute = () => new Response(JSON.stringify([...entries.map(e => ({
  key: `${e.area}:${e.id}`, title: e.label, area: e.area, url: href(e.path), description: e.description,
  text: (e.kind === 'test-design' ? JSON.stringify([...testLessons,...testMissions].find(l=>l.id===e.id)) : e.kind === 'git' ? JSON.stringify([...gitLessons,...gitMissions].find(l=>l.id===e.id)) : e.kind === 'java' ? manuscripts[`../generated/java/${e.id}.md`] : e.kind === 'foundation' || e.kind === 'network-mission' ? networkSearchText(e.id) : JSON.stringify(e.kind === 'security' ? security.find(l => l.id === e.id) : e.kind === 'mission' ? network.missions.find(m => m.id === e.id) : network.lessons.find(l => l.id === e.id))).replace(/<[^>]+>/g, ' '),
})), ...labs.map(([key,title])=>({key:`test-design:lab-${key}`,title,area:'test-design',url:href(`/test-design/lab/${key}/`),description:'仕様と実行結果・未確認条件を確かめる操作教材',text:`テスト設計 ${title}`})),{key:'test-design:templates',title:'実務向けテンプレート',area:'test-design',url:href('/test-design/templates/'),description:'観点表・ケース表・不具合報告書',text:'仕様 期待結果 証跡 CSV Markdown テスト観点 テストケース 不具合報告'}, ...rescueCases.map(c=>({key:`git:qa-${c.id}`,title:c.title,area:'git',url:href(`/git/rescue/#${c.id}`),description:c.what,text:JSON.stringify(c)}))]), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
