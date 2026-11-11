import { entries, network, href } from '../lib/catalog';
import { security } from '../lib/security';
import { networkSearchText } from '../lib/network';
import { gitLessons, gitMissions, rescueCases } from '../lib/git';
import type { APIRoute } from 'astro';
const manuscripts = import.meta.glob<string>('../generated/java/*.md', { query: '?raw', import: 'default', eager: true });
export const GET: APIRoute = () => new Response(JSON.stringify([...entries.map(e => ({
  key: `${e.area}:${e.id}`, title: e.label, area: e.area, url: href(e.path), description: e.description,
  text: (e.kind === 'git' ? JSON.stringify([...gitLessons,...gitMissions].find(l=>l.id===e.id)) : e.kind === 'java' ? manuscripts[`../generated/java/${e.id}.md`] : e.kind === 'foundation' || e.kind === 'network-mission' ? networkSearchText(e.id) : JSON.stringify(e.kind === 'security' ? security.find(l => l.id === e.id) : e.kind === 'mission' ? network.missions.find(m => m.id === e.id) : network.lessons.find(l => l.id === e.id))).replace(/<[^>]+>/g, ' '),
})), ...rescueCases.map(c=>({key:`git:qa-${c.id}`,title:c.title,area:'git',url:href(`/git/rescue/#${c.id}`),description:c.what,text:JSON.stringify(c)}))]), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
