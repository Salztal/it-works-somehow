import fs from 'node:fs';
import {springLessons} from '../src/content/spring/course.ts';
import {springMissions} from '../src/content/spring/missions.ts';
fs.mkdirSync(new URL('../src/generated/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('../src/generated/spring-catalog.json',import.meta.url),JSON.stringify([...springLessons,...springMissions].map(l=>{const section='unit' in l?`unit-${l.unit}`:'exercises';return {id:l.id,number:l.number,title:l.title,description:l.description,section,path:`/spring/${section}/${l.id}/`};}))+'\n');
