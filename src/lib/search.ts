export type SearchDocument = { title:string; description:string; text:string };
const normalize=(s:string)=>s.normalize('NFKC').toLocaleLowerCase('ja');
export function searchIndex<T extends SearchDocument>(index:T[],query:string):T[] {
  const q=query.trim();if(!q)return [];
  const words=normalize(q).split(/\s+/);
  return index.filter(r=>words.every(w=>normalize(r.title+' '+r.description+' '+r.text).includes(w)))
    .sort((a,b)=>Number(normalize(b.title).includes(normalize(q)))-Number(normalize(a.title).includes(normalize(q))));
}
