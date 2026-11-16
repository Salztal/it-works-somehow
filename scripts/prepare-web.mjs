import fs from 'node:fs';
import {webLessons} from '../src/content/web/course.ts';
import {webMissions} from '../src/content/web/missions.ts';
const out=new URL('../src/generated/web-catalog.json',import.meta.url);
fs.mkdirSync(new URL('../src/generated/',import.meta.url),{recursive:true});
fs.writeFileSync(out,JSON.stringify([...webLessons,...webMissions].map(l=>{const section='unit' in l?`unit-${l.unit}`:'exercises';return {id:l.id,number:l.number,title:l.title,description:l.description,section,path:`/web/${section}/${l.id}/`};}))+'\n');
