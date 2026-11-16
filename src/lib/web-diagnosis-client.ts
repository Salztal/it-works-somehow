export {};
const select=document.querySelector<HTMLSelectElement>('#web-symptom');
const show=(id:string)=>{const cases=[...document.querySelectorAll<HTMLDetailsElement>('[data-web-case]')];for(const c of cases){c.hidden=!!id&&c.id!==id;if(id&&c.id===id)c.open=true;}const status=document.querySelector('[data-diagnosis-status]');if(status)status.textContent=id?'選んだ症例の確認手順を表示しています。':`${cases.length}症例を表示しています。`;};
select?.addEventListener('change',()=>show(select.value));
document.querySelectorAll<HTMLAnchorElement>('[data-case-link]').forEach(a=>a.addEventListener('click',()=>{if(select)select.value='';show('');const c=document.getElementById(a.dataset.caseLink!);if(c instanceof HTMLDetailsElement)c.open=true;}));
const openHash=()=>{const id=location.hash.slice(1);const c=document.getElementById(id);if(c instanceof HTMLDetailsElement){if(select)select.value='';show('');c.open=true;}};
openHash();window.addEventListener('hashchange',openHash);
