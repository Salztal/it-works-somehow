import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {initial,transition,tip} from '../src/lib/git-model.ts';
import {createPractice} from '../public/samples/git/create-practice.mjs';
const fixtureRoot=fs.mkdtempSync(path.join(os.tmpdir(),'git-model-check-'));
const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>!k.toUpperCase().startsWith('GIT_')));
Object.assign(env,{GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:process.platform==='win32'?'NUL':'/dev/null',GIT_AUTHOR_NAME:'Git Practice',GIT_COMMITTER_NAME:'Git Practice',GIT_AUTHOR_EMAIL:'practice@example.invalid',GIT_COMMITTER_EMAIL:'practice@example.invalid',GIT_EDITOR:'true',GIT_TERMINAL_PROMPT:'0',GIT_SEQUENCE_EDITOR:'true'});
const evidence=[];
function fixture(scenario){const dir=path.join(fixtureRoot,scenario);fs.mkdirSync(dir);const hashes=new Map();let state=initial(scenario);
 const git=(...args)=>execFileSync('git',['-c','commit.gpgSign=false','-c','core.autocrlf=false','-c',`core.hooksPath=${path.join(fixtureRoot,'no-hooks')}`,...args],{cwd:dir,env,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 const writeTree=tree=>{for(const f of fs.readdirSync(dir))if(f!=='.git')fs.unlinkSync(path.join(dir,f));for(const [f,v] of Object.entries(tree))fs.writeFileSync(path.join(dir,f),v+'\n');};
 git('init','-b','main');for(const c of state.commits){if(c.parents.length)git('switch','--detach',hashes.get(c.parents[0]));writeTree(c.tree);git('add','--all');git('commit','-m',c.message);hashes.set(c.id,git('rev-parse','HEAD'));}
 if(state.commits.length===1)git('switch','--detach',hashes.get('A'));for(const [name,id] of Object.entries(state.branches))git('branch','-f',name,hashes.get(id));git('switch',state.head);
 const label=hash=>[...hashes].find(([,v])=>v===hash)?.[0]??hash;
 const compare=stage=>{
  assert.equal(label(git('rev-parse','HEAD')),tip(state),scenario+' HEAD '+stage);
  const refs=Object.fromEntries(git('for-each-ref','--format=%(refname:short) %(objectname)','refs/heads/').split('\n').map(line=>{const [n,h]=line.split(' ');return [n,label(h)];}));assert.deepEqual(refs,state.branches,scenario+' branches');
  for(const c of state.commits){const parents=git('rev-list','--parents','-1',hashes.get(c.id)).split(' ').slice(1).map(label);assert.deepEqual(parents,c.parents,scenario+' parents '+c.id);}
  const actualWT=Object.fromEntries(fs.readdirSync(dir).filter(f=>f!=='.git').map(f=>[f,fs.readFileSync(path.join(dir,f),'utf8').replace(/\r?\n$/,'')]));
  const conflicts=state.pending?.conflicts.filter(f=>!state.pending.staged.includes(f))??[];
  for(const f of new Set([...Object.keys(actualWT),...Object.keys(state.wt)]))if(!conflicts.includes(f))assert.equal(actualWT[f],state.wt[f],scenario+' Working Tree '+f);
  const unmerged=[...new Set(git('diff','--name-only','--diff-filter=U').split('\n').filter(Boolean))];assert.deepEqual(unmerged.sort(),[...conflicts].sort(),scenario+' unmerged');
  const indexTree={};for(const line of git('ls-files','--stage').split('\n').filter(Boolean)){const [meta,f]=line.split('\t');if(meta.endsWith(' 0'))indexTree[f]=git('show',':'+f);}
  assert.deepEqual(indexTree,state.index,scenario+' Index');
  const sym=(()=>{try{return git('symbolic-ref','--short','HEAD');}catch{return null;}})();assert.equal(sym,state.head,scenario+' symbolic HEAD');
  evidence.push({scenario,stage,head:tip(state),branches:state.branches,commits:state.commits.map(c=>({id:c.id,parents:c.parents})),unmerged,wt:state.pending?'conflict paths checked separately':actualWT,index:indexTree});
 };
 const act=a=>{const prev=state;state=transition(state,a);assert.ok(!state.message.startsWith('操作できません'),state.message);
  try{switch(a.type){
   case 'branch':git('branch',a.target);break;case 'switch':git('switch',a.target);break;
   case 'edit':case 'resolve':fs.writeFileSync(path.join(dir,a.file),a.value+'\n');break;case 'stage':git('add','--',a.file);break;case 'commit':git('commit','-m','案内文を訂正');break;
   case 'merge':git('merge','--no-edit',a.target);break;case 'squash':git('merge','--squash',a.target);break;case 'pick':git('cherry-pick',hashes.get(a.target));break;case 'rebase':git('rebase',a.target);break;case 'revert':git('revert','--no-edit',hashes.get(a.target));break;
   case 'reset':git('reset','--mixed',hashes.get(a.target));break;case 'rescue':git('branch','rescue-found',hashes.get(a.value));break;
   case 'continue':git(prev.pending.kind==='pick'?'cherry-pick':prev.pending.kind,'--continue');break;case 'abort':git(prev.pending.kind==='pick'?'cherry-pick':prev.pending.kind,'--abort');break;
  }}catch(error){if(!state.pending?.conflicts.length)throw error;assert.ok(git('diff','--name-only','--diff-filter=U'),'Expected conflict');}
  const newCommits=state.commits.filter(c=>!hashes.has(c.id));if(newCommits.length){const ids=git('rev-list','--reverse','HEAD','--not',...[...hashes.values()]).split('\n').filter(Boolean);assert.equal(ids.length,newCommits.length);newCommits.forEach((c,i)=>hashes.set(c.id,ids[i]));}
  compare(a.type);
 };
 compare('start');return {act,get:()=>state,git};
}
let f=fixture('branch');for(const a of [{type:'branch',target:'task'},{type:'switch',target:'task'},{type:'edit',file:'guide.txt',value:'1'},{type:'stage',file:'guide.txt'},{type:'edit',file:'guide.txt',value:'2'},{type:'commit'}])f.act(a);
for(const scenario of ['ff','merge','squash','pick','rebase','revert','rescue']){f=fixture(scenario);if(scenario==='ff'||scenario==='merge')f.act({type:'merge',target:'topic'});if(scenario==='squash'){f.act({type:'squash',target:'topic'});assert.throws(()=>f.git('rev-parse','--verify','MERGE_HEAD'));f.act({type:'commit'});}if(scenario==='pick')f.act({type:'pick',target:'C'});if(scenario==='rebase')f.act({type:'rebase',target:'main'});if(scenario==='revert')f.act({type:'revert',target:'C'});if(scenario==='rescue'){const oldHash=f.git('rev-parse','HEAD');f.act({type:'reset',target:'A'});assert.ok(f.git('reflog','--format=%H').split('\n').includes(oldHash));f.act({type:'rescue',value:'C'});}}
for(const [scenario,type,target] of [['conflict','merge','topic'],['pick-conflict','pick','C'],['rebase-conflict','rebase','main']]){f=fixture(scenario);f.act({type,target});f.act({type:'abort'});f.act({type,target});f.act({type:'resolve',file:'price.txt',value:'price = base * 0.9 * 1.1'});f.act({type:'stage',file:'price.txt'});f.act({type:'continue'});}
const practice=createPractice();assert.deepEqual(fs.readdirSync(practice).filter(n=>n.startsWith('m')).sort(),['m1','m2','m3','m4','m5']);
for(const name of ['m1','m2','m3','m4','m5'])assert.equal(execFileSync('git',['remote'],{cwd:path.join(practice,name),env,encoding:'utf8'}).trim(),'');
const out=path.resolve(import.meta.dirname,'../.local');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'git-real-result.json'),JSON.stringify({status:'PASS',git:execFileSync('git',['--version'],{encoding:'utf8'}).trim(),snapshots:evidence.length,evidence,practice:'5 isolated repositories, no remote'},null,2));console.log('PASS: real Git comparison, '+evidence.length+' snapshots; practice M1–M5. Temporary fixtures retained for inspection; existing checkout untouched.');
