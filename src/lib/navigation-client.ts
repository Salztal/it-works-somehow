// Native details/summary remains usable when JavaScript is unavailable.
const menu=document.querySelector<HTMLDetailsElement>('[data-catalog-menu]');
if(menu){
 const summary=menu.querySelector<HTMLElement>('summary')!;
 const close=(returnFocus=false)=>{menu.open=false;summary.setAttribute('aria-expanded','false');if(returnFocus)summary.focus();};
 const expanded=()=>summary.setAttribute('aria-expanded',String(menu.open));
 menu.addEventListener('toggle',expanded);expanded();
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){event.preventDefault();close(menu.contains(document.activeElement));}});
 document.addEventListener('click',event=>{if(menu.open&&!menu.contains(event.target as Node))close();});
 document.addEventListener('focusin',event=>{if(menu.open&&!menu.contains(event.target as Node))close();});
}
