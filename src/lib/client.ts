import { entries, entryKey, href, areaLabel } from './catalog';
import { empty, validate as validateState, grade } from './progress';
import { searchIndex } from './search';
const keys = new Set(entries.map(entryKey));
const storageKey = `technical-notes:v1:${document.body.dataset.base}`;
const validate = (value: unknown) => validateState(value, keys);
function storageError(message = 'ブラウザに記録を保存できません。学習は続けられますが、画面を閉じると今回の記録は失われます。') { const el = document.querySelector<HTMLElement>('#storage-status'); if (el) { el.hidden = false; el.textContent = message; } }
let state = empty();
try { const saved = localStorage.getItem(storageKey); if (saved) state = validate(JSON.parse(saved)); } catch { storageError('保存済み記録を読み出せませんでした。学習記録ページでバックアップの読込みやリセットができます。'); }
function save() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { storageError(); } }
const current = document.body.dataset.current;
if (current && keys.has(current)) { state.last = current; save(); }
function render() {
  document.querySelectorAll<HTMLElement>('[data-progress-key]').forEach(el => { const done = !!state.completed[el.dataset.progressKey!]; el.classList.toggle('is-done', done); const indicator = el.querySelector('.done-indicator'); if (indicator) { indicator.textContent = done ? '✓' : ''; indicator.setAttribute('aria-hidden', String(!done)); } });
  for (const area of ['network','java','security']) {
    const list = entries.filter(e => e.area === area), count = list.filter(e => state.completed[entryKey(e)]).length;
    document.querySelectorAll(`[data-course-count="${area}"]`).forEach(el => el.textContent = `${count} / ${list.length}`);
    document.querySelectorAll<HTMLProgressElement>(`[data-course-progress="${area}"]`).forEach(el => { el.value = count; el.setAttribute('aria-label', `${areaLabel(area)}の完了 ${count} / ${list.length}`); });
  }
  const last = entries.find(e => entryKey(e) === state.last);
  if (last) {
    document.querySelectorAll('[data-resume-title]').forEach(el => el.textContent = last.label);
    document.querySelectorAll('[data-resume-detail]').forEach(el => el.textContent = `${areaLabel(last.area)} / ${state.completed[entryKey(last)] ? '完了済みの章を振り返る' : '最後に開いた章から再開できます。'}`);
    document.querySelectorAll<HTMLAnchorElement>('[data-resume-link]').forEach(el => { el.href = href(last.path); el.textContent = 'つづきから読む →'; });
  }
  const complete = document.querySelector<HTMLButtonElement>('#mark-complete');
  if (complete && current) { const done = !!state.completed[current]; complete.setAttribute('aria-pressed', String(done)); complete.textContent = done ? '✓ 完了済み（取り消す）' : 'この章を完了にする'; }
  document.querySelectorAll('[data-page-status]').forEach(el => el.textContent = current && state.completed[current] ? '✓ 完了済み' : '未完了');
}
document.querySelector('#mark-complete')?.addEventListener('click', () => { if (!current) return; state.completed[current] ? delete state.completed[current] : state.completed[current] = true; save(); render(); });
function answer(field: HTMLFieldSetElement, choice: number) {
  const correct = Number(field.dataset.correct), buttons = [...field.querySelectorAll<HTMLButtonElement>('[data-choice]')];
  for (const b of buttons) { const n = Number(b.dataset.choice); b.setAttribute('aria-pressed', String(n === choice)); b.classList.toggle('correct-choice', n === correct); b.classList.toggle('wrong-choice', n === choice && n !== correct); }
  const feedback = field.querySelector<HTMLElement>('.feedback')!;
  const text = buttons.find(b => Number(b.dataset.choice) === correct)?.childNodes[1]?.textContent || '';
  const reasons: string[] | undefined = field.dataset.reasons ? JSON.parse(field.dataset.reasons) : undefined;
  const ok = grade(choice, correct, buttons.length);
  feedback.textContent = `${ok ? '正解です。' : '不正解です。'} 正解：${text}。${reasons ? (ok ? reasons[correct] : `選んだ回答：${reasons[choice]} 正解の理由：${reasons[correct]}`) : field.dataset.explanation}`;
  feedback.className = `feedback ${ok ? 'correct' : 'incorrect'}`;
}
document.querySelectorAll<HTMLFieldSetElement>('.quiz').forEach(field => {
  const container = field.closest<HTMLElement>('[data-lesson]')!, key = `${container.dataset.lesson}:${field.dataset.question}`;
  const choices = [...field.querySelectorAll<HTMLButtonElement>('[data-choice]')];
  // Shuffle DOM order while retaining original answer indices.
  for (let i = choices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [choices[i], choices[j]] = [choices[j], choices[i]]; }
  choices.forEach((b,i) => { b.querySelector('span')!.textContent = 'ABCD'[i]; field.querySelector('.choices')!.append(b); b.addEventListener('click', () => { const n = Number(b.dataset.choice); state.answers[key] = n; answer(field,n); save(); }); });
  if (state.answers[key] !== undefined) answer(field, state.answers[key]);
});
document.querySelectorAll<HTMLTextAreaElement>('[data-recall],[data-note]').forEach(el => { const section = el.dataset.recall ? 'recall' : 'notes', key = el.dataset.recall || el.dataset.note!; el.value = state[section][key] || ''; el.maxLength = 20000; el.addEventListener('input', () => { state[section][key] = el.value; save(); }); });
const recordStatus = document.querySelector('#record-status');
document.querySelector('#export-progress')?.addEventListener('click', () => { const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], {type:'application/json'})); const a = document.createElement('a'); a.href = url; a.download = 'technical-notes-progress.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000); if (recordStatus) recordStatus.textContent = '記録を書き出しました。'; });
document.querySelector('#reset-progress')?.addEventListener('click', () => { if (!confirm('完了・回答・メモをすべて削除しますか？必要なら先にJSONを書き出してください。')) return; state = empty(); save(); location.reload(); });
document.querySelector<HTMLInputElement>('#import-progress')?.addEventListener('change', async event => { const input = event.currentTarget as HTMLInputElement, file = input.files?.[0]; if (!file) return; try { if (file.size > 1024 * 1024) throw Error('ファイルが大きすぎます（上限1MB）。'); const imported = validate(JSON.parse(await file.text())); if (!confirm('現在の学習記録を、ファイルの記録に置き換えますか？')) return; state = imported; save(); location.reload(); } catch(e) { if(recordStatus) recordStatus.textContent = e instanceof Error ? e.message : '読み込めませんでした。'; } finally { input.value = ''; } });
document.querySelectorAll<HTMLPreElement>('.prose pre').forEach(pre => { const wrapper = document.createElement('div'); wrapper.className = 'code-wrapper'; pre.before(wrapper); wrapper.append(pre); const b = document.createElement('button'); b.type='button'; b.className='copy-code'; b.textContent='コピー'; b.setAttribute('aria-label','コードをコピー'); b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(pre.textContent || ''); b.textContent='コピーしました'; } catch { b.textContent='手動で選択してコピー'; } setTimeout(()=>b.textContent='コピー',2000); }); wrapper.prepend(b); });
const courseMenu = document.querySelector<HTMLDetailsElement>('.course-navigation');
if(courseMenu) { const media = matchMedia('(max-width: 900px)'); const updateMenu = () => courseMenu.open = !media.matches; updateMenu(); media.addEventListener('change', updateMenu); }
document.addEventListener('keydown', event => { if(event.key==='/' && !event.ctrlKey && !event.metaKey && !event.altKey && !/INPUT|TEXTAREA|SELECT/.test((event.target as HTMLElement).tagName) && !(event.target as HTMLElement).isContentEditable) { event.preventDefault(); const input = document.querySelector<HTMLInputElement>('#query'); input ? input.focus() : location.assign(href('/search/')); } });
render();
// Highlight the heading currently reached without moving keyboard focus.
const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('.page-toc a')];
if ('IntersectionObserver' in window && tocLinks.length) {
  const observer = new IntersectionObserver(items => {
    const active = items.filter(x => x.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top)[0];
    if (!active) return;
    for (const a of tocLinks) active.target.id === a.hash.slice(1) ? a.setAttribute('aria-current','location') : a.removeAttribute('aria-current');
  }, { rootMargin:'-15% 0px -60% 0px', threshold:0 });
  for (const a of tocLinks) { const h = document.getElementById(a.hash.slice(1)); if (h) observer.observe(h); }
}
const form = document.querySelector<HTMLFormElement>('#search-form');
if(form) {
  type Result = { key:string; title:string; area:string; url:string; description:string; text:string };
  let index: Result[] | undefined;
  const input = document.querySelector<HTMLInputElement>('#query')!, status = document.querySelector('#search-status')!, results = document.querySelector('#search-results')!;
  let generation = 0;
  const search = async () => {
    const thisGeneration = ++generation, q = input.value.trim();
    results.replaceChildren();
    const u = new URL(location.href); q ? u.searchParams.set('q',q) : u.searchParams.delete('q'); history.replaceState(null,'',u);
    if(!q) { status.textContent='調べたい言葉を入力してください。'; return; }
    status.textContent='検索中…';
    try {
      if(!index) { const response=await fetch(href('/search.json')); if(!response.ok) throw Error(); index=await response.json(); }
      if(thisGeneration !== generation) return;
      const matches = searchIndex(index!,q);
      status.textContent = matches.length ? `${matches.length}件の教材が見つかりました。` : `「${q}」に一致する教材はありません。別の言葉や短い用語で試してください。`;
      for(const r of matches) { const li=document.createElement('li'), a=document.createElement('a'), meta=document.createElement('small'), title=document.createElement('strong'), detail=document.createElement('p'); a.href=r.url; meta.textContent=areaLabel(r.area); title.textContent=r.title; detail.textContent=r.description; a.append(meta,title,detail); li.append(a); results.append(li); }
    } catch { if(thisGeneration===generation) status.textContent='検索索引を読み込めません。通信を確認して検索し直してください。'; }
  };
  input.value = new URLSearchParams(location.search).get('q') || '';
  form.addEventListener('submit', event=>{ event.preventDefault(); void search(); });
  let timer: ReturnType<typeof setTimeout>; input.addEventListener('input', ()=>{ clearTimeout(timer); timer=setTimeout(()=>void search(),180); });
  if(input.value) void search();
}
