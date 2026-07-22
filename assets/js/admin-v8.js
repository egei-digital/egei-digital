
if(sessionStorage.getItem('egei_admin')!=='active'){location.replace('login.html')}

const shell=document.querySelector('#admin-shell');
const sidebar=document.querySelector('#sidebar');
const themeToggle=document.querySelector('#theme-toggle');
const sidebarToggle=document.querySelector('#sidebar-toggle');
const sectionTitle=document.querySelector('#section-title');
const titleMap={dashboard:'Dashboard',courses:'Cursos',starts:'Próximos inicios',banners:'Banners',news:'Noticias',registrations:'Preinscripciones',students:'Estudiantes',reports:'Reportes',settings:'Configuración'};

function applyTheme(theme){
  document.body.classList.toggle('v8-dark',theme==='dark');
  themeToggle.textContent=theme==='dark'?'☀':'☾';
  localStorage.setItem('egei_admin_theme',theme);
}
applyTheme(localStorage.getItem('egei_admin_theme')||'light');
themeToggle.addEventListener('click',()=>applyTheme(document.body.classList.contains('v8-dark')?'light':'dark'));

sidebarToggle.addEventListener('click',()=>{
  if(innerWidth<=760){sidebar.classList.toggle('mobile-open')}
  else{shell.classList.toggle('collapsed')}
});

function openSection(id){
  document.querySelectorAll('.v8-section').forEach(s=>s.classList.toggle('active',s.id===id));
  document.querySelectorAll('.v8-nav-item').forEach(b=>b.classList.toggle('active',b.dataset.section===id));
  sectionTitle.textContent=titleMap[id]||'Panel';
  sidebar.classList.remove('mobile-open');
}
document.querySelectorAll('.v8-nav-item').forEach(b=>b.addEventListener('click',()=>openSection(b.dataset.section)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>openSection(b.dataset.go)));

document.querySelector('#logout-button').addEventListener('click',()=>{
  sessionStorage.removeItem('egei_admin');
  location.href='login.html';
});

function updateClock(){
  const now=new Date();
  const time=new Intl.DateTimeFormat('es-BO',{timeZone:'America/La_Paz',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
  const date=new Intl.DateTimeFormat('es-BO',{timeZone:'America/La_Paz',weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(now);
  document.querySelector('#current-clock').textContent=time;
  document.querySelector('#current-date').textContent=date;
  document.querySelector('#welcome-date').textContent=date.charAt(0).toUpperCase()+date.slice(1);
}
updateClock();setInterval(updateClock,1000);

const registrations=JSON.parse(localStorage.getItem('egei_registrations')||'[]');
const news=JSON.parse(localStorage.getItem('egei_news')||'[]');
const starts=JSON.parse(localStorage.getItem('egei_starts')||'[]');
document.querySelector('#metric-registrations').textContent=registrations.length;
document.querySelector('#metric-news').textContent=news.length;
document.querySelector('#metric-starts').textContent=starts.length||3;

const last=localStorage.getItem('egei_last_access');
if(last){
  document.querySelector('#last-access').textContent=new Intl.DateTimeFormat('es-BO',{dateStyle:'short',timeStyle:'short',timeZone:'America/La_Paz'}).format(new Date(last));
}

const values=[0,0,0,0,0,0,0];
registrations.forEach(r=>{
  const date=new Date(r.createdAt||r.date||Date.now());
  const diff=Math.floor((Date.now()-date.getTime())/86400000);
  if(diff>=0&&diff<7)values[6-diff]++;
});
const labels=[];
for(let i=6;i>=0;i--){
  const d=new Date(Date.now()-i*86400000);
  labels.push(new Intl.DateTimeFormat('es-BO',{weekday:'short',timeZone:'America/La_Paz'}).format(d).replace('.',''));
}
const max=Math.max(1,...values);
document.querySelector('#activity-chart').innerHTML=values.map((v,i)=>`<div class="v8-chart-column"><div class="v8-chart-bar" style="height:${28+(v/max)*150}px"><b>${v}</b></div><span>${labels[i]}</span></div>`).join('');
