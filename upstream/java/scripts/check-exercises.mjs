import fs from 'node:fs';
import path from 'node:path';
import cp from 'node:child_process';
import {root,walk,write,unzipStore,method} from './lib.mjs';
const value=n=>{const i=process.argv.indexOf(n);return i>=0?process.argv[i+1]:undefined;};
const jdk=value('-JavaHome')||process.env.JAVA_HOME,tomcat=value('-TomcatHome')||process.env.CATALINA_HOME;
if(!jdk||!tomcat)throw Error('Pass -JavaHome and -TomcatHome.');
let checked=0;
const withDatabase=process.argv.includes('-WithDatabase');
function compile(dir,out){
  const sources=walk(dir).filter(f=>f.endsWith('.java'));
  fs.mkdirSync(out,{recursive:true});
  const result=cp.spawnSync(path.join(jdk,'bin/javac.exe'),['--release','17','-encoding','UTF-8','-cp',path.join(tomcat,'lib/servlet-api.jar'),'-d',out,...sources],{encoding:'utf8'});
  if(result.status!==0)throw Error(result.stdout+'\n'+result.stderr);
  return sources.length;
}
function java(classpath,name,input){const r=cp.spawnSync(path.join(jdk,'bin/java.exe'),['-Dfile.encoding=UTF-8','-cp',classpath,name],{encoding:'utf8',input});if(r.status!==0)throw Error(r.stdout+'\n'+r.stderr);return r.stdout;}
for(const file of walk(path.join(root,'docs/assets/downloads')).filter(f=>f.endsWith('-start.zip'))){
  const name=path.basename(file,'.zip'),dir=path.join(root,'.local/exercise-checks',name);
  for(const [entry,data]of unzipStore(fs.readFileSync(file))){const dest=path.resolve(dir,entry);if(!dest.startsWith(dir+path.sep))throw Error('Unsafe ZIP entry');write(dest,data);}
  const out=path.join(dir,'compiled');const count=compile(dir,out);
  console.log('PASS '+name+' ('+count+' Java files)');checked++;
  // Apply the exact method replacements described by the lecture, then compile again.
  const solved=path.join(root,'.local/exercise-solved',name);
  for(const [entry,data]of unzipStore(fs.readFileSync(file)))write(path.join(solved,entry),data);
  const lesson=Number(name.slice(0,2));
  const changes={5:[['Todo/com.todo/dao/TaskDao.java',['insertTask']]],6:[['Todo/com.todo/dao/TaskDao.java',['selectAll']]],7:[['Todo/com.todo/dao/TaskDao.java',['updateTask','deleteTask']]],9:[['TodoJSP/com.todojsp/com/todojsp/controller/RegisterServlet.java',['doPost']]],10:[['TodoJSP/com.todojsp/com/todojsp/dao/TaskDao.java',['selectAll','updateTask','deleteTask']]]};
  for(const [p,names]of changes[lesson]||[]){let src=fs.readFileSync(path.join(solved,p),'utf8');const answer=fs.readFileSync(path.join(root,p),'utf8');for(const n of names){const before=method(src,n).text;src=src.replace(before,method(answer,n).text);}write(path.join(solved,p),src);}
  const mainFile=path.join(solved,'Todo/com.todo/main/Main.java');
  if(lesson<=3){
    let src=fs.readFileSync(mainFile,'utf8');
    if(lesson===1)src=src.replace('System.out.println("第1章：入力と表示を追加してください。");',`try (Scanner scanner = new Scanner(System.in)) {\n            System.out.print("タイトル：");\n            String title = scanner.nextLine();\n            System.out.println("入力したタイトル：" + title);\n            System.out.print("詳細：");\n            String detail = scanner.nextLine();\n            System.out.println("入力した詳細：" + detail);\n        }`);
    if(lesson===2)src=src.replace('System.out.println("第2章：ここにメニューを追加してください。");',`while (true) {\n                System.out.println("1:入力  6:終了");\n                String number = scanner.nextLine();\n                if (number.equals("6")) { System.out.println("終了します。"); return; }\n                if (number.equals("1")) { inputTask(scanner); }\n                else if (number.equals("2")) { System.out.println("一覧表示はこれから実装します。"); }\n                else { System.out.println("1または6を選択してください。"); }\n            }`);
    if(lesson===3){src=src.replace('System.out.println("第3章：DTOへ値を入れてshowTaskへ渡してください。");','TaskDto task = new TaskDto();\n            task.setTitle(title);\n            task.setDetail(detail);\n            task.setCompleted(true);\n            showTask(task);');src=src.trimEnd().slice(0,-1)+`    private static void showTask(TaskDto task) {\n        System.out.println("タイトル：" + task.getTitle());\n        System.out.println("詳細：" + task.getDetail());\n        if (task.getCompleted()) { System.out.println("完了"); }\n        else { System.out.println("未完了"); }\n    }\n}\n`;}
    write(mainFile,src);
  }
  const solvedOut=path.join(solved,'compiled');compile(solved,solvedOut);
  if(lesson<=3){const output=java(solvedOut,'main.Main',lesson===2?'1\n日本語 と 空白\n詳細\n2\nabc\n6\n':'日本語 と 空白\n詳細\n');if(!output.includes('日本語 と 空白')||!output.includes('詳細'))throw Error('Foundation output mismatch');console.log('PASS solved '+name+' execution');}
  else if(withDatabase && lesson!==8){
    const web=lesson>=9,config=path.join(root,web?'TodoJSP/com.todojsp/db.properties':'Todo/com.todo/db.properties');
    fs.copyFileSync(config,path.join(solvedOut,'db.properties'));
    const testName='Solved'+lesson+'Checks',prefix=web?'com.todojsp.':'';
    const testDir=path.join(root,'.local/solved-test',name);fs.mkdirSync(testDir,{recursive:true});
    const testSource=path.join(testDir,testName+'.java');write(testSource,fs.readFileSync(path.join(root,'verification/CrudChecks.java.template'),'utf8').replaceAll('PREFIX',prefix).replaceAll('CLASSNAME',testName));
    const testcp=solvedOut+';'+path.join(root,'Todo/lib/*');const result=cp.spawnSync(path.join(jdk,'bin/javac.exe'),['--release','17','-encoding','UTF-8','-cp',testcp,'-d',testDir,testSource],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);
    console.log(java(testDir+';'+testcp,testName));
  }
  else console.log('PASS solved '+name+' compilation');
}
console.log('PASS all '+checked+' exercise starts compile.');
