(() => {
  const read=(key,fallback=[])=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const regs=read('egei_registrations',[]);
  const starts=read('egei_starts',[]);
  const students=read('egei_students',[]);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const statusMap={nuevo:'Nuevos',contactado:'Contactados',seguimiento:'Seguimiento',inscrito:'Inscritos'};
  const statusCounts={nuevo:0,contactado:0,seguimiento:0,inscrito:students.length};
  regs.forEach(r=>{const k=String(r.status||'nuevo').toLowerCase();statusCounts[k]=(statusCounts[k]||0)+1});
  const max=Math.max(1,...Object.values(statusCounts));
  const funnel=document.querySelector('#v66-funnel');
  if(funnel) funnel.innerHTML=Object.entries(statusCounts).map(([k,v])=>`<div class="v66-funnel-row"><span>${statusMap[k]||k}</span><div class="v66-funnel-track"><div class="v66-funnel-fill" style="width:${Math.max(4,v/max*100)}%"></div></div><b>${v}</b></div>`).join('');

  const next=document.querySelector('#v66-next-list');
  const nextRows=[...starts].filter(s=>s.date).sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,4);
  if(next) next.innerHTML=nextRows.length?nextRows.map(s=>{const d=new Date(s.date+'T00:00:00');const day=String(d.getDate()).padStart(2,'0');const month=new Intl.DateTimeFormat('es-BO',{month:'short',timeZone:'UTC'}).format(d).replace('.','');return `<div class="v66-next-item"><div class="v66-date-tile"><b>${day}</b><small>${month}</small></div><div><strong>${esc(s.course||'Curso')}</strong><p>${esc(s.time||'Horario por confirmar')} · ${esc(s.spots||0)} cupos</p></div><span class="v66-mode">${esc(s.modality||'Modalidad')}</span></div>`}).join(''):'<div class="v66-empty">Todavía no hay inicios programados.</div>';

  const recent=document.querySelector('#v66-recent-list');
  const recentRows=[...regs].sort((a,b)=>new Date(b.createdAt||b.date||0)-new Date(a.createdAt||a.date||0)).slice(0,5);
  if(recent) recent.innerHTML=recentRows.length?recentRows.map(r=>{const name=r.name||r.fullName||'Interesado';const initials=name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();const date=new Date(r.createdAt||r.date||Date.now());const time=new Intl.DateTimeFormat('es-BO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(date);return `<div class="v66-recent-item"><div class="v66-avatar-mini">${esc(initials)}</div><div><strong>${esc(name)}</strong><p>${esc(r.course||'Curso por definir')} · ${esc(r.modality||'Sin modalidad')}</p></div><span class="v66-time">${esc(time)}</span></div>`}).join(''):'<div class="v66-empty">Las nuevas preinscripciones aparecerán aquí.</div>';

  const byCourse=regs.reduce((a,r)=>{const c=r.course||'Sin curso';a[c]=(a[c]||0)+1;return a},{});
  const top=Object.entries(byCourse).sort((a,b)=>b[1]-a[1])[0];
  const topBox=document.querySelector('#v66-top-course');
  if(topBox) topBox.innerHTML=top?`<div class="v66-course-spotlight"><small>Mayor interés registrado</small><h4>${esc(top[0])}</h4><strong>${top[1]}</strong><p>consultas o preinscripciones</p></div>`:'<div class="v66-empty">Aún no hay datos suficientes.</div>';

  const notifications=[];
  if(!starts.length)notifications.push(['Agenda sin fechas','Agrega próximos inicios para que aparezcan en la página pública.']);
  const low=starts.filter(s=>Number(s.spots||0)<=5);
  if(low.length)notifications.push(['Cupos por agotarse',`${low.length} inicio(s) tienen 5 cupos o menos.`]);
  if(regs.filter(r=>String(r.status||'nuevo').toLowerCase()==='nuevo').length)notifications.push(['Interesados pendientes','Hay preinscripciones nuevas que todavía no fueron contactadas.']);
  if(!notifications.length)notifications.push(['Todo en orden','No hay alertas importantes en este momento.']);
  const count=document.querySelector('#notification-count');if(count)count.textContent=notifications.length;
  const nList=document.querySelector('#notification-list');if(nList)nList.innerHTML=notifications.map(n=>`<div class="v66-notification-item"><strong>${esc(n[0])}</strong><p>${esc(n[1])}</p></div>`).join('');
  const panel=document.querySelector('#notification-panel');
  document.querySelector('#notification-toggle')?.addEventListener('click',()=>panel?.classList.toggle('open'));
  document.querySelector('#notification-close')?.addEventListener('click',()=>panel?.classList.remove('open'));

  const commands=[
    ['dashboard','⌂','Dashboard','Resumen general del sistema'],['courses','▤','Cursos','Administrar oferta académica'],['starts','▣','Próximos inicios','Programar fechas y cupos'],['registrations','◎','Preinscripciones','Revisar nuevos interesados'],['students','👥','Estudiantes','Gestionar alumnos inscritos'],['reports','▥','Reportes','Filtrar y exportar información'],['settings','⚙','Configuración','Datos institucionales e integraciones']
  ];
  const palette=document.querySelector('#command-palette'),search=document.querySelector('#command-search'),results=document.querySelector('#command-results');
  const renderCommands=()=>{const q=(search?.value||'').toLowerCase();if(results)results.innerHTML=commands.filter(x=>(x[2]+' '+x[3]).toLowerCase().includes(q)).map(x=>`<button class="v66-command-item" data-command="${x[0]}"><span>${x[1]}</span><div><b>${x[2]}</b><small>${x[3]}</small></div></button>`).join('')};
  const openPalette=()=>{palette?.classList.add('open');palette?.setAttribute('aria-hidden','false');renderCommands();setTimeout(()=>search?.focus(),40)};
  const closePalette=()=>{palette?.classList.remove('open');palette?.setAttribute('aria-hidden','true')};
  document.querySelector('#command-button')?.addEventListener('click',openPalette);
  search?.addEventListener('input',renderCommands);
  results?.addEventListener('click',e=>{const b=e.target.closest('[data-command]');if(!b)return;document.querySelector(`.v8-nav-item[data-section="${b.dataset.command}"]`)?.click();closePalette()});
  palette?.addEventListener('click',e=>{if(e.target===palette)closePalette()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closePalette();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette()}});

  document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>document.querySelector(`.v8-nav-item[data-section="${b.dataset.go}"]`)?.click()));
})();
