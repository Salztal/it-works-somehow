import assert from 'node:assert/strict';
const base=process.env.TODO_TEST_URL||'http://127.0.0.1:38080/TodoJSP';
if(process.env.TODO_TEST_DATABASE!=='java_course_verify')throw Error('Confirm the deployed app uses java_course_verify by setting TODO_TEST_DATABASE.');
if(!/^http:\/\/127\.0\.0\.1:38080\/TodoJSP$/.test(base))throw Error('Use the dedicated local verification instance only.');
let cookie='',checks=0;
async function req(url,values){const headers={};if(cookie)headers.Cookie=cookie;
  if(values)headers['Content-Type']='application/x-www-form-urlencoded';
  const r=await fetch(base+url,{method:values?'POST':'GET',headers,body:values?new URLSearchParams(values):undefined,redirect:'manual'});
  const set=r.headers.get('set-cookie');if(set)cookie=set.split(';')[0];return{status:r.status,text:await r.text(),location:r.headers.get('location')};
}
function ok(value,message){assert.ok(value,message);checks++;}
function token(text){const m=text.match(/name="csrf" value="([^"]+)"/);assert.ok(m,'CSRF field exists');return m[1];}
let r=await req('/');ok(r.status===200,'menu JSP renders');
for(const url of ['/register','/view','/update','/delete','/deleteAll']){r=await req(url);ok(r.status===200,url+' JSP renders');}
r=await req('/register');const csrf=token(r.text);
// This dedicated instance must be configured to the disposable java_course_verify DB.
await req('/deleteAll',{csrf,confirmation:'DELETE ALL'});
r=await req('/register',{csrf:'wrong',title:'must not save',detail:''});ok(r.status===403,'invalid token rejected');
r=await req('/register',{csrf,title:'　 ',detail:'入力を保持'});ok(r.status===200&&r.text.includes('タイトルは1〜100文字'),'validation error');ok(r.text.includes('入力を保持'),'form values preserved');
r=await req('/register',{csrf,title:'<b>Web 日本語</b>',detail:'空白 と 記号 <script>alert(1)</script>'});ok(r.status===302&&r.location.endsWith('/view'),'POST redirects');
r=await req('/view');ok(r.text.includes('&lt;b&gt;Web 日本語&lt;/b&gt;'),'HTML title escaped');ok(r.text.includes('&lt;script&gt;alert(1)&lt;/script&gt;'),'detail escaped');
const id=r.text.match(/update\?id=(\d+)/)?.[1];ok(Boolean(id),'task ID available');
const before=r.text.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1];r=await req('/view');ok(r.text.includes(before),'reload does not insert');
r=await req('/update?id='+id);ok(r.text.includes('&lt;b&gt;Web 日本語&lt;/b&gt;'),'current value in update form');
r=await req('/update',{csrf,id,title:'更新 日本語',detail:'',completed:'1'});ok(r.status===302,'update redirects');
r=await req('/view');ok(r.text.includes('更新 日本語')&&r.text.includes('完了'),'updated values shown');
r=await req('/update',{csrf,id,title:'更新 日本語',detail:'',completed:'1'});ok(r.status===302,'unchanged update accepted');
r=await req('/update?id=2147483647');ok(r.text.includes('対象のタスクがありません'),'missing update target');
r=await req('/delete?id=abc');ok(r.text.includes('IDは1以上の整数'),'invalid ID handled');
r=await req('/delete?id='+id);ok(r.status===200&&r.text.includes('削除を実行する'),'delete confirmation');
r=await req('/view');ok(r.text.includes('更新 日本語'),'GET and cancel do not delete');
r=await req('/delete',{csrf,id});ok(r.status===302,'delete redirects');
r=await req('/view');ok(!r.text.includes('更新 日本語'),'target removed');
r=await req('/delete',{csrf,id});ok(r.text.includes('対象のタスクがありません'),'repeat delete reports missing');
r=await req('/register',{csrf,title:'keep on cancel',detail:''});ok(r.status===302,'second insert');
r=await req('/deleteAll',{csrf,confirmation:'no'});ok(r.text.includes('確認欄にDELETE ALL'),'delete all guard');
r=await req('/view');ok(r.text.includes('keep on cancel'),'guard preserves data');
r=await req('/deleteAll',{csrf,confirmation:'DELETE ALL'});ok(r.status===302,'delete all redirects');
r=await req('/view');ok(r.text.includes('タスクはありません'),'empty list');
r=await req('/register',{csrf,title:'SQL quote \' OR 1=1 --',detail:''});ok(r.status===302,'SQL-like input stored as data');
r=await req('/view');ok(r.text.includes('SQL quote'),'literal quote round trip');
await req('/deleteAll',{csrf,confirmation:'DELETE ALL'});
console.log('PASS Web HTTP/JSP '+checks+' checks.');
