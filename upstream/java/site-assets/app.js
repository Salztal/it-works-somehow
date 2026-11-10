const toggle=document.querySelector('#menu-toggle');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));document.querySelector('#sidebar').classList.toggle('open',open);});
document.querySelector('#nav-search')?.addEventListener('input',e=>{const q=e.target.value.toLocaleLowerCase();document.querySelectorAll('#sidebar nav a').forEach(a=>a.classList.toggle('is-hidden',!a.textContent.toLocaleLowerCase().includes(q)));});
document.querySelectorAll('.copy').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(button.closest('figure').querySelector('code').textContent);button.textContent='コピーしました';setTimeout(()=>button.textContent='コピー',1800);}catch{button.textContent='コードを選択してコピー';}}));
const done=document.querySelector('#mark-done'),page=document.body.dataset.page,key='java-study-progress-v1';
let saved=[];try{const value=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(value))saved=value.filter(x=>typeof x==='string');}catch{}
function update(){const checked=saved.includes(page);done?.setAttribute('aria-pressed',String(checked));if(done)done.textContent=checked?'✓ 確認済み（クリックで戻す）':'このページを確認済みにする';const p=document.querySelector('#progress');if(p)p.textContent='確認済み '+saved.length+' ページ · このブラウザに保存';}
done?.addEventListener('click',()=>{saved=saved.includes(page)?saved.filter(x=>x!==page):[...saved,page];try{localStorage.setItem(key,JSON.stringify(saved));}catch{}update();});update();
