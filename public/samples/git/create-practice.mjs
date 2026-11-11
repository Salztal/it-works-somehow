import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

// Only creates a fresh OS temporary directory. No arguments, existing checkout, remote, or cleanup.
export function createPractice(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'git-practice-'));
 const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>!k.toUpperCase().startsWith('GIT_')));
 Object.assign(env,{GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:process.platform==='win32'?'NUL':'/dev/null',GIT_AUTHOR_NAME:'Git Practice',GIT_COMMITTER_NAME:'Git Practice',GIT_AUTHOR_EMAIL:'practice@example.invalid',GIT_COMMITTER_EMAIL:'practice@example.invalid',GIT_EDITOR:'true',GIT_TERMINAL_PROMPT:'0'});
 for(const name of ['m1','m2','m3','m4','m5']){
  const dir=path.join(root,name);fs.mkdirSync(dir);
  const git=(...args)=>execFileSync('git',['-c','commit.gpgSign=false','-c','core.autocrlf=false','-c',`core.hooksPath=${path.join(root,'no-hooks')}`,...args],{cwd:dir,env,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const write=(file,value)=>fs.writeFileSync(path.join(dir,file),value+'\n');
  const commit=msg=>{git('add','--all');git('commit','-m',msg);};
  git('init','-b','main');write('guide.txt','利用案内');write('price.txt','price = base');commit('A: 開始');
  if(name==='m1'){write('guide.txt','利用案内：受付9時');commit('C: 作業枝に入れたかった修正');}
  if(name==='m2'){git('switch','-c','topic');for(let i=1;i<=3;i++){write('guide.txt',`利用案内：修正${i}`);commit(['修正','再修正','追加修正'][i-1]);}git('switch','main');write('main.txt','mainの別作業');commit('B: 基準側の追加');}
  if(name==='m3'){git('switch','-c','topic');write('price.txt','price = base * 0.9');commit('C: 割引計算');git('switch','main');write('price.txt','price = base * 1.1');commit('B: 税込表示');}
  if(name==='m4'){write('shipping.txt','誤った送料条件');commit('B: 送料の不具合');write('display.txt','表示の修正');commit('C: 残したい別担当の修正');}
  if(name==='m5'){write('guide.txt','利用案内：受付9時');commit('C: 救出したい記録');git('reset','--mixed','HEAD~1');}
 }
 fs.writeFileSync(path.join(root,'README.txt'),`Git実務講座の使い捨て練習環境\n外部接続・リモート登録なし。合成作者情報はこの子プロセスだけに使用。\nM1: mainの誤コミットを保護して作業枝へ。\nM2: topicを統合する方式を選ぶ。\nM3: mainで git merge topic すると競合。割引と税込の両方を残す。\nM4: Bの実IDをshowで調べてrevert。共有済みを想定するが実際にはPushしない。\nM5: mixed reset後。reflogからCを調べ新しい救出枝を作る。\n練習は各mフォルダー内だけで実施。終了後の削除は自分で場所を確認して行う。\n`);
 return root;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)console.log('作成した練習環境（この場所だけで練習）：\n'+createPractice());
