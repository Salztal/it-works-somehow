import fs from 'node:fs';
import {mailLessons} from '../src/content/mail/course.ts';
import {mailMissions} from '../src/content/mail/missions.ts';
fs.mkdirSync(new URL('../src/generated/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('../src/generated/mail-catalog.json',import.meta.url),JSON.stringify([...mailLessons,...mailMissions].map(l=>{const section='unit' in l?`unit-${l.unit}`:'exercises';return {id:l.id,number:l.number,title:l.title,description:l.description,section,path:`/mail/${section}/${l.id}/`};}))+'\n');
