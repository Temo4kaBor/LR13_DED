/* Simple standalone implementation of the Motivator app (no frameworks) */
/* Data */
const motivationalQuotes = {
  success: [
    { quote: "Единственный способ делать великую работу — любить то, что вы делаете", author: "Стив Джобс" },
    { quote: "Успех — это способность идти от одной неудачи к другой, не теряя энтузиазма", author: "Уинстон Черчилль" },
    { quote: "Величайшая слава не в том, чтобы никогда не падать, а в том, чтобы подниматься каждый раз, когда мы падаем", author: "Конфуций" }
  ],
  life: [
    { quote: "Жизнь — это то, что с вами происходит, пока вы строите другие планы", author: "Джон Леннон" },
    { quote: "Ваша единственная обязанность в любой жизненной ситуации — быть верным себе", author: "Ричард Бах" },
    { quote: "Не бойтесь идти медленно, бойтесь остановиться", author: "Китайская пословица" }
  ],
  dreams: [
    { quote: "Будущее принадлежит тем, кто верит в красоту своих мечтаний", author: "Элеонора Рузвельт" },
    { quote: "Мечты сбываются. Если у вас нет мечты, то как она может сбыться?", author: "Оскар Хаммерштейн II" },
    { quote: "Все наши мечты могут стать реальностью, если у нас хватит смелости следовать им", author: "Уолт Дисней" }
  ]
};
const allQuotes = [...motivationalQuotes.success, ...motivationalQuotes.life, ...motivationalQuotes.dreams];

/* Utils */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const rand = n => Math.floor(Math.random()*n);

/* Tabs */
$$('.tab-btn').forEach(btn=>btn.addEventListener('click', ()=>{
  $$('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const target = btn.dataset.tab;
  $$('[data-tabpanel]').forEach(p=>p.classList.add('hidden'));
  document.getElementById(target).classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
}));

// Quotes UI
const categoryRow = $('#categoryRow');
const totalQuotesEl = $('#totalQuotes');
const totalCatsEl = $('#totalCats');
const quoteText = $('#quoteText');
const quoteAuthor = $('#quoteAuthor');
const randomBtn = $('#randomBtn');
const loadingEl = $('#loading');
let currentCategory = 'all';
let currentIndex = 0;

function renderCategories(){
  const cats = [{id:'all',label:'Все'}, {id:'success',label:'Успех'}, {id:'life',label:'Жизнь'}, {id:'dreams',label:'Мечты'}];
  categoryRow.innerHTML = '';
  cats.forEach(c=>{
    const b = document.createElement('button');
    b.textContent = c.label;
    b.className = 'cat-btn' + (c.id===currentCategory? ' active':'');
    b.onclick = ()=>{ currentCategory=c.id; currentIndex=0; renderCategories(); renderQuote(); };
    categoryRow.appendChild(b);
  });
  totalCatsEl.textContent = cats.length.toString();
}

function getCurrentQuotes(){
  if(currentCategory==='all') return allQuotes;
  return motivationalQuotes[currentCategory] || allQuotes;
}

function renderQuote(index){
  const quotes = getCurrentQuotes();
  if(index===undefined) index = currentIndex;
  const q = quotes[index % quotes.length];
  quoteText.textContent = q.quote;
  quoteAuthor.textContent = q.author ? '— ' + q.author : '';
  totalQuotesEl.textContent = allQuotes.length;
}

randomBtn.addEventListener('click', ()=>{
  loadingEl.classList.remove('hidden');
  randomBtn.disabled = true;
  setTimeout(()=>{
    const quotes = getCurrentQuotes();
    let newIndex;
    do { newIndex = rand(quotes.length); } while(newIndex === currentIndex && quotes.length>1);
    currentIndex = newIndex;
    renderQuote();
    loadingEl.classList.add('hidden');
    randomBtn.disabled = false;
  }, 700);
});

// initial render
renderCategories();
renderQuote(0);

/* Simple particles animation */
const particlesRoot = document.getElementById('particles');
for(let i=0;i<18;i++){
  const p = document.createElement('div');
  p.className='p';
  const size = 4 + Math.random()*8;
  p.style.width = p.style.height = size+'px';
  p.style.left = Math.random()*100 + '%';
  p.style.top = Math.random()*100 + '%';
  p.style.opacity = 0.15+Math.random()*0.6;
  p.style.animationDelay = (Math.random()*5)+'s';
  particlesRoot.appendChild(p);
}

/* Goals tracker with localStorage */
const goalsKey = 'motivator_goals_v1';
const goalsListEl = $('#goalsList');
const goalInput = $('#goalInput');
const addGoalBtn = $('#addGoalBtn');

let goals = JSON.parse(localStorage.getItem(goalsKey) || '[]');

function saveGoals(){ localStorage.setItem(goalsKey, JSON.stringify(goals)); updateAchievements(); }
function renderGoals(){
  goalsListEl.innerHTML='';
  if(goals.length===0){ goalsListEl.innerHTML='<li class="goal-item">Пока нет целей. Добавь первую!</li>'; return; }
  goals.forEach((g,idx)=>{
    const li = document.createElement('li');
    li.className='goal-item';
    li.innerHTML = `<div class="title">${escapeHtml(g.title)}</div>
      <div class="actions">
        <button class="glass-btn mark-btn">${g.done? 'Выполнено':'Отметить'}</button>
        <button class="glass-btn del-btn">Удалить</button>
      </div>`;
    li.querySelector('.mark-btn').onclick = ()=>{ goals[idx].done = !goals[idx].done; saveGoals(); renderGoals(); };
    li.querySelector('.del-btn').onclick = ()=>{ goals.splice(idx,1); saveGoals(); renderGoals(); };
    goalsListEl.appendChild(li);
  });
}
addGoalBtn.addEventListener('click', ()=>{ const v = goalInput.value.trim(); if(!v) return; goals.push({title:v, done:false, created:Date.now()}); goalInput.value=''; saveGoals(); renderGoals(); });
function escapeHtml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
renderGoals();

/* Habits calendar (simple 7-day tracker per habit) */
const habitsKey = 'motivator_habits_v1';
const habitsContainer = $('#habitsContainer');
const habitInput = $('#habitInput');
const addHabitBtn = $('#addHabitBtn');
let habits = JSON.parse(localStorage.getItem(habitsKey) || '[]');

function saveHabits(){ localStorage.setItem(habitsKey, JSON.stringify(habits)); updateAchievements(); }
function renderHabits(){
  habitsContainer.innerHTML='';
  if(habits.length===0){ habitsContainer.innerHTML='<div class="habit-row">Нет привычек — добавь первую</div>'; return; }
  habits.forEach((h, idx)=>{
    const row = document.createElement('div'); row.className='habit-row';
    const title = document.createElement('div'); title.style.flex='1'; title.textContent=h.title;
    const days = document.createElement('div'); days.className='habit-days';
    // 7-day toggles
    for(let d=0;d<7;d++){
      const day = document.createElement('div'); day.className='habit-day' + (h.days && h.days[d] ? ' active' : '' );
      day.textContent = ['П','В','С','Ч','П','С','В'][d];
      day.onclick = ()=>{ h.days = h.days || Array(7).fill(false); h.days[d] = !h.days[d]; saveHabits(); renderHabits(); };
      days.appendChild(day);
    }
    const del = document.createElement('button'); del.className='glass-btn'; del.textContent='Удалить'; del.onclick=()=>{ habits.splice(idx,1); saveHabits(); renderHabits(); };
    row.appendChild(title); row.appendChild(days); row.appendChild(del);
    habitsContainer.appendChild(row);
  });
}
addHabitBtn.addEventListener('click', ()=>{ const v = habitInput.value.trim(); if(!v) return; habits.push({title:v, days:Array(7).fill(false)}); habitInput.value=''; saveHabits(); renderHabits(); });
renderHabits();

/* Gratitude journal */
const gratKey = 'motivator_grat_v1';
const gratListEl = $('#gratList');
const gratInput = $('#gratInput');
const addGratBtn = $('#addGratBtn');
let grats = JSON.parse(localStorage.getItem(gratKey) || '[]');
function saveGrats(){ localStorage.setItem(gratKey, JSON.stringify(grats)); updateAchievements(); }
function renderGrats(){
  gratListEl.innerHTML='';
  if(grats.length===0){ gratListEl.innerHTML='<li class="grat-item">Записей нет — добавь что-то хорошее!</li>'; return; }
  grats.slice().reverse().forEach((g, idx)=>{
    const li = document.createElement('li'); li.className='grat-item'; li.textContent = g.text + ' — ' + new Date(g.date).toLocaleString();
    const del = document.createElement('button'); del.className='glass-btn'; del.textContent='Удалить'; del.onclick=()=>{ const realIdx = grats.length-1-idx; grats.splice(realIdx,1); saveGrats(); renderGrats(); };
    li.appendChild(del); gratListEl.appendChild(li);
  });
}
addGratBtn.addEventListener('click', ()=>{ const v = gratInput.value.trim(); if(!v) return; grats.push({text:v, date:Date.now()}); gratInput.value=''; saveGrats(); renderGrats(); });
renderGrats();

/* Achievements (simple earned badges) */
const achContainer = $('#achievementsContainer');
function updateAchievements(){
  const earned = [];
  if(goals.some(g=>g.done)) earned.push({title:'Завершил цель', desc:'Заведи и отметь хотя бы одну цель'});
  if(grats.length>=3) earned.push({title:'3 благодарности', desc:'Добавлено 3 записи благодарности'});
  if(habits.some(h=> (h.days||[]).filter(Boolean).length>=5 )) earned.push({title:'Стабильная привычка', desc:'Отметил 5 дней у одной привычки'});
  renderAchievements(earned);
}
function renderAchievements(list){
  achContainer.innerHTML='';
  if(list.length===0){ achContainer.innerHTML='<div>Пока нет достижений — делай маленькие шаги!</div>'; return; }
  list.forEach(a=>{
    const d = document.createElement('div'); d.className='achievement'; d.innerHTML = `<strong>${a.title}</strong><div style="font-size:13px;opacity:.85">${a.desc}</div>`;
    achContainer.appendChild(d);
  });
}
updateAchievements();

/* Small helpers */
// keyboard enter handlers
[['#goalInput','#addGoalBtn'], ['#habitInput','#addHabitBtn'], ['#gratInput','#addGratBtn']].forEach(pair=>{
  const [inputSel, btnSel] = pair;
  const input = document.querySelector(inputSel);
  if(!input) return;
  input.addEventListener('keyup', e=>{ if(e.key==='Enter'){ document.querySelector(btnSel).click(); } });
});

/* initial achievements update when something changes */
window.addEventListener('storage', ()=>{ goals = JSON.parse(localStorage.getItem(goalsKey)||'[]'); habits = JSON.parse(localStorage.getItem(habitsKey)||'[]'); grats = JSON.parse(localStorage.getItem(gratKey)||'[]'); renderGoals(); renderHabits(); renderGrats(); updateAchievements(); });

// style for particles (create via JS to keep single-file separation)
const style = document.createElement('style');
style.textContent = `.p{position:absolute;border-radius:50%;background:rgba(255,255,255,.12);animation:float 8s ease-in-out infinite;opacity:.6} @keyframes float{0%{transform:translateY(0) scale(.7)}50%{transform:translateY(-60px) scale(1)}100%{transform:translateY(0) scale(.7)}}`;
document.head.appendChild(style);

console.log('Motivator ready — local standalone version');