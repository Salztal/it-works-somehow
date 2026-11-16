export {};
const input=document.querySelector<HTMLInputElement>('#mail-symptom'),select=document.querySelector<HTMLSelectElement>('#mail-case-select');
if(input&&select){
 const cases=[...document.querySelectorAll<HTMLDetailsElement>('[data-mail-case]')],status=document.querySelector<HTMLElement>('[data-mail-case-status]')!;
 const filter=()=>{const words=input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);let count=0;for(const item of cases){item.hidden=!!select.value&&item.id!==select.value||!words.every(w=>item.dataset.search!.toLocaleLowerCase().includes(w));if(!item.hidden)count++;if(select.value===item.id)item.open=true;const link=document.querySelector<HTMLElement>(`[data-case-link="${item.id}"]`);if(link)link.hidden=item.hidden;}status.textContent=`${count}症例を表示しています。${count===0?'検索語・症例の選択を見直してください。':''}`;};
 input.addEventListener('input',filter);select.addEventListener('change',filter);
 const openHash=()=>{const item=cases.find(c=>`#${c.id}`===location.hash);if(item){input.value='';select.value='';filter();item.open=true;}};window.addEventListener('hashchange',openHash);openHash();
}
