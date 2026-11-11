import { entries, network, href } from '../lib/catalog';
import { security } from '../lib/security';
import { networkSearchText } from '../lib/network';
import type { APIRoute } from 'astro';
const manuscripts = import.meta.glob<string>('../generated/java/*.md', { query: '?raw', import: 'default', eager: true });
export const GET: APIRoute = () => new Response(JSON.stringify(entries.map(e => ({
  key: `${e.area}:${e.id}`, title: e.label, area: e.area, url: href(e.path), description: e.description,
  text: (e.kind === 'java' ? manuscripts[`../generated/java/${e.id}.md`] : e.kind === 'foundation' || e.kind === 'network-mission' ? networkSearchText(e.id) : JSON.stringify(e.kind === 'security' ? security.find(l => l.id === e.id) : e.kind === 'mission' ? network.missions.find(m => m.id === e.id) : network.lessons.find(l => l.id === e.id))).replace(/<[^>]+>/g, ' '),
}))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
