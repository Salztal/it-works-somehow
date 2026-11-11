import fs from 'node:fs';
import path from 'node:path';
import {gitLessons} from '../src/content/git/course.ts';
import {gitMissions} from '../src/content/git/missions.ts';
const out=path.resolve(import.meta.dirname,'../src/generated');
fs.mkdirSync(out,{recursive:true});
// Keep lesson prose and answer explanations out of the shared progress/search client bundle.
const rows=[...gitLessons,...gitMissions].map(l=>{
 const section='unit' in l?`unit-${l.unit}`:'exercises';
 return {id:l.id,number:l.number,title:l.title,description:l.description,section,path:`/git/${section}/${l.id}/`};
});
fs.writeFileSync(path.join(out,'git-catalog.json'),JSON.stringify(rows)+'\n');
