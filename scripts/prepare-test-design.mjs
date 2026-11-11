import fs from 'node:fs';
import {testLessons} from '../src/content/test-design/course.ts';
import {testMissions} from '../src/content/test-design/missions.ts';
const out=new URL('../src/generated/',import.meta.url);fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(new URL('test-design-catalog.json',out),JSON.stringify([...testLessons,...testMissions].map(l=>{const section='unit' in l?`unit-${l.unit}`:'exercises';return {id:l.id,number:l.number,title:l.title,description:l.description,section,path:`/test-design/${section}/${l.id}/`};}))+'\n');
const downloads=new URL('../public/downloads/test-design/',import.meta.url);
fs.mkdirSync(downloads,{recursive:true});
for(const name of ['viewpoints.csv','test-cases.csv','defect-report.csv','templates.md'])fs.copyFileSync(new URL(`../src/content/test-design/templates/${name}`,import.meta.url),new URL(name,downloads));
