import fs from 'node:fs';
import path from 'node:path';
import {root,write,method} from './lib.mjs';
export const pages=[
 ['index','はじめに','START'],['setup','環境構築','00'],['console-input','入力と出力','01'],['console-menu','メニューと繰り返し','02'],['console-dto','DTOで値を渡す','03'],['database','SQLの基本','04'],['console-register','DBへ登録する','05'],['console-list','一覧を取得する','06'],['console-edit','更新と削除','07'],['web-flow','ServletとJSP','08'],['web-register','フォームから登録','09'],['web-crud','WebのCRUD','10'],['extra','追加課題','＋'],['exercises','演習・ダウンロード','EX'],['troubleshooting','つまずき集','HELP'],['glossary','用語集','WORDS'],['validation','検証結果','QA'],['publishing','公開の手順','GUIDE']
];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function inline(s){
  const codes=[];s=s.replace(/`([^`]+)`/g,(_,c)=>`\u0000${codes.push('<code>'+esc(c)+'</code>')-1}\u0000`);
  s=esc(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,t,u)=>`<a href="${u.replace(/\.md(?=$|#)/,'.html')}">${t}</a>`).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  return s.replace(/\u0000(\d+)\u0000/g,(_,i)=>codes[Number(i)]);
}
function markdown(text){
  const lines=text.split(/\r?\n/);let out='',i=0;const headings=[];
  while(i<lines.length){const line=lines[i];
    if(!line.trim()){i++;continue;}
    if(line.startsWith('```')){const lang=line.slice(3);const code=[];i++;while(i<lines.length&&!lines[i].startsWith('```'))code.push(lines[i++]);if(i===lines.length)throw Error('Unclosed code fence');i++;out+=`<figure class="code-block"><figcaption>${esc(lang||'code')}<button type="button" class="copy">コピー</button></figcaption><pre><code>${esc(code.join('\n'))}</code></pre></figure>`;continue;}
    const h=line.match(/^(#{1,3}) (.+)$/);if(h){const level=h[1].length,id='section-'+headings.length;headings.push({level,id,title:h[2]});out+=`<h${level} id="${id}">${inline(h[2])}</h${level}>`;i++;continue;}
    if(line.startsWith('|')){const rows=[];while(i<lines.length&&lines[i].startsWith('|'))rows.push(lines[i++].split('|').slice(1,-1).map(c=>c.trim()));const head=rows.shift();if(rows[0]?.every(c=>/^:?-+:?$/.test(c)))rows.shift();out+=`<div class="table-scroll"><table><thead><tr>${head.map(c=>'<th scope="col">'+inline(c)+'</th>').join('')}</tr></thead><tbody>${rows.map(r=>'<tr>'+r.map(c=>'<td>'+inline(c)+'</td>').join('')+'</tr>').join('')}</tbody></table></div>`;continue;}
    const list=line.match(/^(-|\d+\.) /);if(list){const tag=list[1]==='-'?'ul':'ol';let items='';while(i<lines.length&&/^(?:-|\d+\.) /.test(lines[i]))items+='<li>'+inline(lines[i++].replace(/^(?:-|\d+\.) /,''))+'</li>';out+=`<${tag}>${items}</${tag}>`;continue;}
    const para=[];while(i<lines.length&&lines[i].trim()&&!/^(?:#{1,3} |```|\||- |\d+\. )/.test(lines[i]))para.push(lines[i++]);out+='<p>'+inline(para.join(' '))+'</p>';
  }
  return {html:out,headings};
}
for(let i=0;i<pages.length;i++){
  const [slug,label,num]=pages[i],file=path.join(root,'course',slug+'.md');
  if(!fs.existsSync(file))throw Error('Missing course: '+file);
  let source=fs.readFileSync(file,'utf8');
  source=source.replace(/\{\{code:([^|}]+)\|([^}]+)\}\}/g,(_,p,n)=>'```java\n'+method(fs.readFileSync(path.join(root,p),'utf8'),n).text+'\n```');
  const {html,headings}=markdown(source);const toc=headings.filter(h=>h.level===2);
  const nav=pages.map(([s,l,n])=>`<a href="${s}.html" ${s===slug?'aria-current="page"':''}><span>${n}</span>${l}</a>`).join('');
  const prev=pages[i-1],next=pages[i+1];
  write(path.join(root,'docs',slug+'.html'),`<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Java 17とMySQLを使い、コンソール版からWeb版へ進む初学者向け講義教材。"><title>${esc(label)} | Java Study</title><link rel="stylesheet" href="assets/style.css"><script src="assets/app.js" defer></script></head>
<body data-page="${slug}"><a class="skip" href="#content">本文へ移動</a><header class="mobile-header"><a href="index.html">J<span class="brand-dot">.</span> Java Study</a><button id="menu-toggle" aria-expanded="false" aria-controls="sidebar">目次</button></header>
<aside class="sidebar" id="sidebar"><a class="brand" href="index.html">J<span class="brand-dot">.</span><span>Java Study<small>小さく作って、仕組みをつかむ。</small></span></a><div class="edition">JAVA 17 / MYSQL 8.0</div><label class="search-label" for="nav-search">目次を探す</label><input type="search" id="nav-search" placeholder="登録、DTO、Web…"><nav aria-label="講義の目次">${nav}</nav><p class="sidebar-note">入力から、保存へ。<br>コンソールから、Webへ。</p></aside>
<div class="page"><div class="page-top"><span>BEGINNER JAVA COURSE</span><span>CONSOLE → DATABASE → WEB</span></div><div class="reading-layout"><main id="content" tabindex="-1"><div class="chapter-label">${esc(num)} / ${slug==='index'?'LEARNING GUIDE':'LECTURE NOTES'}</div><article>${html}</article><div class="lesson-end"><button id="mark-done" type="button" aria-pressed="false">このページを確認済みにする</button><span id="progress" role="status"></span></div><nav class="pager" aria-label="前後のページ">${prev?`<a href="${prev[0]}.html"><small>← 前へ</small>${esc(prev[1])}</a>`:'<span></span>'}${next?`<a href="${next[0]}.html"><small>次へ →</small>${esc(next[1])}</a>`:''}</nav></main><aside class="on-this-page"><p>このページ</p>${toc.map(h=>`<a href="#${h.id}">${esc(h.title)}</a>`).join('')}</aside></div><footer>Java Study · Java 17 + MySQL 8.0 · 講義と手元の実行を、ひとつずつ。</footer></div></body></html>`);
}
write(path.join(root,'docs','.nojekyll'),'');
write(path.join(root,'docs','404.html'),'<!DOCTYPE html><html lang="ja"><meta charset="UTF-8"><title>ページが見つかりません</title><h1>ページが見つかりません</h1><p>URLの末尾をindex.htmlへ変更し、目次から開き直してください。</p></html>');
console.log('Built '+pages.length+' course pages.');
