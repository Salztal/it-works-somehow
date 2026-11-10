import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {root,walk,write,zip,stub} from './lib.mjs';
const readme=`# Java Study 配布コード\n\nJava 17 + MySQL 8.0.20 + Tomcat 9の教材です。\n\n1. sql/01-schema.sqlで新しい学習用DBを作成します。既存のtasksは削除しません。\n2. sql/02-user.example.sqlをローカルへコピーし、パスワードを変更して学習用ユーザーを作ります。\n3. scripts/dependencies.ps1で固定版JARを取得します。\n4. 各プロジェクトのソース直下のdb.properties.exampleをdb.propertiesへコピーし、接続値を変更します。\n5. Eclipseへ既存プロジェクトとして読み込み、TodoのMain、またはTomcat 9上のTodoJSPを実行します。\n\n詳しい手順は講義サイトの環境構築ページを参照してください。\n開始コードの未実装箇所はUnsupportedOperationExceptionで章とメソッドを案内します。\n同じプロジェクト名のZIPを同じワークスペースに同時インポートしないでください。\n\n完成版は公開解答です。配布物に実際の設定、JAR、classは含めません。\n`;
function safe(relative){return !relative.split('/').some(p=>['bin','build','classes','.local','.tools','instructor-private','release'].includes(p))&&!/\.(class|jar)$/.test(relative)&&!/(^|\/)db\.properties$/.test(relative)&&!relative.endsWith('.local.sql');}
function collect(dirs){const map=new Map();for(const dir of dirs)for(const file of walk(path.join(root,dir))){const rel=path.relative(root,file).replaceAll('\\','/');if(safe(rel))map.set(rel,fs.readFileSync(file));}return map;}
const setup=collect(['sql']);for(const f of ['scripts/build.ps1','scripts/dependencies.ps1','DEPENDENCIES.md'])setup.set(f,fs.readFileSync(path.join(root,f)));setup.set('README.md',readme);
const all=collect(['Todo','TodoJSP']);for(const e of setup)all.set(...e);
const downloads=path.join(root,'docs/assets/downloads');fs.mkdirSync(downloads,{recursive:true});
const manifest=[];
function save(name,map){const data=zip(map);write(path.join(downloads,name),data);manifest.push({file:name,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),entries:map.size});}
save('completed.zip',all);save('setup-kit.zip',setup);
const consoleOnly=()=>new Map([...all].filter(([p])=>!p.startsWith('TodoJSP/')));
const webOnly=()=>new Map([...all].filter(([p])=>!p.startsWith('Todo/')));
const basic=[
 ['01-input-start.zip',`package main;\nimport java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("第1章：入力と表示を追加してください。");\n    }\n}\n`],
 ['02-menu-start.zip',`package main;\nimport java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        try (Scanner scanner = new Scanner(System.in)) {\n            System.out.println("第2章：ここにメニューを追加してください。");\n        }\n    }\n    private static void inputTask(Scanner scanner) {\n        System.out.print("タイトル：");\n        String title = scanner.nextLine();\n        System.out.print("詳細：");\n        String detail = scanner.nextLine();\n        System.out.println(title + " / " + detail);\n    }\n}\n`],
 ['03-dto-start.zip',`package main;\nimport java.util.Scanner;\nimport dto.TaskDto;\npublic class Main {\n    public static void main(String[] args) {\n        try (Scanner scanner = new Scanner(System.in)) {\n            System.out.print("タイトル：");\n            String title = scanner.nextLine();\n            System.out.print("詳細：");\n            String detail = scanner.nextLine();\n            System.out.println("第3章：DTOへ値を入れてshowTaskへ渡してください。");\n        }\n    }\n}\n`]
];
for(const [name,main]of basic){const map=consoleOnly();for(const [p]of map){if(p.startsWith('Todo/com.todo/')&&!p.endsWith('main/Main.java')&&!(name.startsWith('03-')&&p.endsWith('dto/TaskDto.java')))map.delete(p);}
  map.set('Todo/com.todo/main/Main.java',main);
  // Fundamentals have no JDBC dependency or library entry.
  map.set('Todo/.classpath',map.get('Todo/.classpath').toString().replace(/\s*<classpathentry kind="lib"[^>]+\/>/,''));
  save(name,map);
}
for(const [name,methods,chapter]of [['05-register-start.zip',['insertTask'],'5'],['06-list-start.zip',['selectAll'],'6'],['07-edit-start.zip',['updateTask','deleteTask'],'7']]){const map=consoleOnly();const p='Todo/com.todo/dao/TaskDao.java';let src=map.get(p).toString();for(const m of methods)src=stub(src,m,chapter);map.set(p,src);save(name,map);}
const flow=webOnly();
for(const [action,title]of [['register','登録'],['view','一覧'],['update','更新'],['delete','削除'],['deleteAll','全件削除']]){
  const name=action[0].toUpperCase()+action.slice(1)+'Servlet';
  flow.set('TodoJSP/com.todojsp/com/todojsp/controller/'+name+'.java',`package com.todojsp.controller;\nimport java.io.IOException;\nimport javax.servlet.ServletException;\nimport javax.servlet.annotation.WebServlet;\nimport javax.servlet.http.HttpServlet;\nimport javax.servlet.http.HttpServletRequest;\nimport javax.servlet.http.HttpServletResponse;\n@WebServlet("/${action}")\npublic class ${name} extends HttpServlet {\n    protected void doGet(HttpServletRequest request, HttpServletResponse response)\n            throws ServletException, IOException {\n        request.getRequestDispatcher("/WEB-INF/views/${action}.jsp").forward(request, response);\n    }\n}\n`);
  flow.set('TodoJSP/src/main/webapp/WEB-INF/views/'+action+'.jsp',`<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>\n<!DOCTYPE html><html lang="ja"><meta charset="UTF-8"><title>${title}画面</title><h1>${title}画面</h1><p>ここは${title}画面です。</p></html>\n`);
}
save('08-web-flow-start.zip',flow);
const reg=webOnly(),rp='TodoJSP/com.todojsp/com/todojsp/controller/RegisterServlet.java';reg.set(rp,stub(reg.get(rp).toString(),'doPost','9'));save('09-web-register-start.zip',reg);
const crud=webOnly(),dp='TodoJSP/com.todojsp/com/todojsp/dao/TaskDao.java';let ds=crud.get(dp).toString();for(const m of ['selectAll','updateTask','deleteTask'])ds=stub(ds,m,'10');crud.set(dp,ds);save('10-web-crud-start.zip',crud);
write(path.join(downloads,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await import('./build-site.mjs');
// Export via an explicit allowlist, never by copying the entire workspace.
const publicFiles=collect(['Todo','TodoJSP','sql','course','docs','planning','scripts','verification']);
for(const f of ['README.md','DEPENDENCIES.md','PUBLISHING.md','VALIDATION.md','package.json','.gitignore']){const p=path.join(root,f);if(fs.existsSync(p))publicFiles.set(f,fs.readFileSync(p));}
const exportDir=path.join(root,'release/java-study-public');
// A previous export may contain removed files; refuse stale additions during checking.
for(const [rel,data]of publicFiles)write(path.join(exportDir,rel),data);
write(path.join(root,'release/public-files.json'),JSON.stringify([...publicFiles.keys()].sort(),null,2)+'\n');
write(path.join(root,'release/java-study-public.zip'),zip(publicFiles));
console.log('Packaged '+manifest.length+' learner ZIPs; '+publicFiles.size+' public files.');
