
(() => {
  const STORE = {
    students:'egei_students',
    institution:'egei_institution'
  };
  const get = (k, fallback=[]) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback)); } catch { return fallback; } };
  const set = (k,v) => localStorage.setItem(k,JSON.stringify(v));
  const esc = v => String(v ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const toast = msg => {
    const el=document.querySelector('#admin-toast'); if(!el)return;
    el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2200);
  };

  // Normalize Module 5 course and starts data
  const courses = get('egei_courses_admin',[]).map(c=>({
    id:c.id,name:c.name,duration:c.duration||'',price:c.price||'',discount:c.discount||'0',
    spots:c.spots||'20',image:c.image||'',description:c.description||''
  }));
  set('egei_courses_admin',courses);
  const starts = get('egei_starts',[]).map(s=>({
    id:s.id,course:s.course,date:s.date,time:s.time||'',modality:s.modality||'Presencial y Virtual',
    spots:s.spots||'20',color:s.color||'#1557d5'
  }));
  set('egei_starts',starts);

  // Replace module 2 renderer behavior for courses / starts
  const defs = {
    courses:{key:'egei_courses_admin',cols:['name','duration','price','discount','spots'],format:(v,k)=>k==='price'?'Bs '+(v||0):k==='discount'?(v||0)+'%':v},
    starts:{key:'egei_starts',cols:['course','date','time','modality','spots','color'],format:(v,k)=>k==='color'?`<span class="v8-color-chip"><i style="background:${esc(v)}"></i>${esc(v)}</span>`:k==='date'&&v?new Intl.DateTimeFormat('es-BO',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(v+'T00:00:00Z')):esc(v||'—')}
  };
  Object.entries(defs).forEach(([type,def])=>{
    const tbody=document.querySelector('#'+type+'-table');
    if(!tbody)return;
    const render=()=>{
      const q=(document.querySelector('#'+type+'-search')?.value||'').toLowerCase();
      const rows=get(def.key,[]).filter(x=>Object.values(x).join(' ').toLowerCase().includes(q));
      document.querySelector('#'+type+'-count').textContent=rows.length+' registros';
      tbody.innerHTML=rows.length?rows.map(x=>`<tr>${def.cols.map(k=>`<td>${k==='color'?def.format(x[k],k):esc(def.format(x[k],k)||'—')}</td>`).join('')}<td><div class="v8-row-actions"><button data-m5-edit="${type}" data-id="${x.id}">Editar</button><button class="danger" data-m5-delete="${type}" data-id="${x.id}">Eliminar</button></div></td></tr>`).join(''):`<tr><td colspan="${def.cols.length+1}" class="v8-empty-row">No hay registros.</td></tr>`;
    };
    document.querySelector('#'+type+'-search')?.addEventListener('input',render);
    document.querySelector('#'+type+'-form')?.addEventListener('submit',e=>{
      e.preventDefault(); e.stopImmediatePropagation();
      const data=Object.fromEntries(new FormData(e.currentTarget).entries());
      let rows=get(def.key,[]);
      if(data.id) rows=rows.map(x=>x.id===data.id?{...x,...data}:x); else {data.id=type[0]+Date.now();rows.unshift(data)}
      set(def.key,rows); document.querySelector('#'+type+'-modal').classList.remove('open'); render(); toast('Registro guardado.');
      if(type==='courses') document.querySelector('#metric-courses').textContent=rows.length;
      if(type==='starts') document.querySelector('#metric-starts').textContent=rows.length;
    },true);
    tbody.addEventListener('click',e=>{
      const edit=e.target.closest('[data-m5-edit]'), del=e.target.closest('[data-m5-delete]');
      if(edit){
        const row=get(def.key,[]).find(x=>x.id===edit.dataset.id), form=document.querySelector('#'+type+'-form');
        form.reset(); Object.entries(row||{}).forEach(([k,v])=>{if(form.elements[k])form.elements[k].value=v});
        document.querySelector('#'+type+'-modal').classList.add('open');
      }
      if(del&&confirm('¿Eliminar este registro?')){set(def.key,get(def.key,[]).filter(x=>x.id!==del.dataset.id));render()}
    });
    render();
  });

  // Students
  let students=get(STORE.students,[]);
  const sTable=document.querySelector('#students-table'), sSearch=document.querySelector('#student-search'),
        sCourse=document.querySelector('#student-course-filter'), sMod=document.querySelector('#student-modality-filter');
  const openStudent=(row=null)=>{
    const modal=document.querySelector('#student-modal'), form=document.querySelector('#student-form');
    form.reset(); form.elements.enrollmentDate.value=new Date().toISOString().slice(0,10);
    if(row) Object.entries(row).forEach(([k,v])=>{if(form.elements[k])form.elements[k].value=v??''});
    document.querySelector('#student-modal-title').textContent=row?'Editar estudiante':'Nuevo estudiante';
    modal.classList.add('open');
  };
  const closeStudent=()=>document.querySelector('#student-modal').classList.remove('open');
  const renderStudents=()=>{
    const courses=[...new Set(students.map(s=>s.course).filter(Boolean))].sort(), current=sCourse.value;
    sCourse.innerHTML='<option value="">Todos los cursos</option>'+courses.map(c=>`<option>${esc(c)}</option>`).join('');sCourse.value=current;
    const q=(sSearch.value||'').toLowerCase();
    const rows=students.filter(s=>Object.values(s).join(' ').toLowerCase().includes(q)&&(!sCourse.value||s.course===sCourse.value)&&(!sMod.value||s.modality===sMod.value));
    document.querySelector('#students-count').textContent=rows.length+' estudiantes';
    sTable.innerHTML=rows.length?rows.map(s=>`<tr><td><strong>${esc(s.name)}</strong></td><td>${esc(s.phone)}<br><small>${esc(s.email||'Sin correo')}</small></td><td>${esc(s.course)}</td><td>${esc(s.modality)}</td><td>${esc(s.enrollmentDate)}</td><td>${esc(s.notes||'—')}</td><td><div class="v8-row-actions"><button data-student-edit="${s.id}">Editar</button><button class="danger" data-student-delete="${s.id}">Eliminar</button></div></td></tr>`).join(''):'<tr><td colspan="7" class="v8-empty-row">No hay estudiantes registrados.</td></tr>';
  };
  document.querySelector('#student-new')?.addEventListener('click',()=>openStudent());
  document.querySelectorAll('[data-student-close]').forEach(x=>x.addEventListener('click',closeStudent));
  document.querySelector('#student-form')?.addEventListener('submit',e=>{
    e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget).entries());
    if(data.id)students=students.map(x=>x.id===data.id?{...x,...data}:x);else{data.id='st'+Date.now();students.unshift(data)}
    set(STORE.students,students);closeStudent();renderStudents();toast('Estudiante guardado.');
  });
  sTable?.addEventListener('click',e=>{
    const id=e.target.closest('[data-student-edit]')?.dataset.studentEdit, del=e.target.closest('[data-student-delete]')?.dataset.studentDelete;
    if(id)openStudent(students.find(x=>x.id===id));
    if(del&&confirm('¿Eliminar estudiante?')){students=students.filter(x=>x.id!==del);set(STORE.students,students);renderStudents()}
  });
  [sSearch,sCourse,sMod].forEach(x=>x?.addEventListener(x===sSearch?'input':'change',renderStudents));
  document.querySelector('#student-clear')?.addEventListener('click',()=>{sSearch.value='';sCourse.value='';sMod.value='';renderStudents()});
  const exportRows=(rows,name,headers,keys)=>{
    const csv=[headers,...rows.map(r=>keys.map(k=>r[k]||''))].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:'text/csv'}));a.download=name;a.click();URL.revokeObjectURL(a.href);
  };
  document.querySelector('#students-export')?.addEventListener('click',()=>exportRows(students,'estudiantes-egei.csv',['Nombre','Celular','Correo','Curso','Modalidad','Fecha','Observaciones'],['name','phone','email','course','modality','enrollmentDate','notes']));
  document.querySelector('#students-import')?.addEventListener('change',async e=>{
    const text=await e.target.files[0]?.text();if(!text)return;
    const lines=text.split(/\r?\n/).filter(Boolean), parsed=lines.slice(1).map(line=>{
      const cols=line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v=>v.replace(/^"|"$/g,'').replace(/""/g,'"'))||[];
      return {id:'st'+Date.now()+Math.random(),name:cols[0]||'',phone:cols[1]||'',email:cols[2]||'',course:cols[3]||'',modality:cols[4]||'',enrollmentDate:cols[5]||'',notes:cols[6]||''};
    });
    students=[...parsed,...students];set(STORE.students,students);renderStudents();toast(parsed.length+' estudiantes importados.');
  });
  renderStudents();

  // Reports
  const reportForm=document.querySelector('#report-form');
  let reportRows=[];
  const buildReport=()=>{
    const f=Object.fromEntries(new FormData(reportForm).entries());
    let rows=f.source==='students'?students:EGEIData.read();
    rows=rows.filter(r=>{
      const date=r.enrollmentDate||r.createdAt||'';
      return (!f.course||String(r.course||'').toLowerCase().includes(f.course.toLowerCase()))
       &&(!f.modality||r.modality===f.modality)&&(!f.status||r.status===f.status)
       &&(!f.from||date.slice(0,10)>=f.from)&&(!f.to||date.slice(0,10)<=f.to);
    });
    reportRows=rows;
    document.querySelector('#report-total').textContent=rows.length;
    const top=key=>Object.entries(rows.reduce((a,r)=>{const v=r[key]||'—';a[v]=(a[v]||0)+1;return a},{})).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';
    document.querySelector('#report-top-course').textContent=top('course');document.querySelector('#report-top-modality').textContent=top('modality');
    const student=f.source==='students', headers=student?['Nombre','Celular','Curso','Modalidad','Fecha']:['Nombre','Celular','Curso','Modalidad','Estado','Fecha'];
    const keys=student?['name','phone','course','modality','enrollmentDate']:['name','phone','course','modality','status','createdAt'];
    document.querySelector('#report-head').innerHTML='<tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+'</tr>';
    document.querySelector('#report-body').innerHTML=rows.slice(0,100).map(r=>'<tr>'+keys.map(k=>'<td>'+esc(r[k]||'—')+'</td>').join('')+'</tr>').join('')||'<tr><td colspan="'+headers.length+'" class="v8-empty-row">Sin resultados.</td></tr>';
    return {rows,headers,keys,source:f.source};
  };
  reportForm?.addEventListener('submit',e=>{e.preventDefault();const x=buildReport();exportRows(x.rows,'reporte-egei.csv',x.headers,x.keys)});
  document.querySelector('#report-preview')?.addEventListener('click',buildReport);
  document.querySelector('#report-print')?.addEventListener('click',()=>{buildReport();window.print()});
  buildReport();

  // Institution
  const instForm=document.querySelector('#institution-form'), saved=get(STORE.institution,{});
  Object.entries(saved).forEach(([k,v])=>{if(instForm?.elements[k])instForm.elements[k].value=v});
  instForm?.addEventListener('submit',e=>{
    e.preventDefault();const data=Object.fromEntries(new FormData(instForm).entries());set(STORE.institution,data);
    document.documentElement.style.setProperty('--brand',data.primaryColor);toast('Configuración institucional guardada.');
  });

  // restore sync config behavior
  const endpoint=document.querySelector('#sync-endpoint');
  if(endpoint)endpoint.value=EGEIData.config.endpoint||'';
  const updateSync=()=>{
    const ok=Boolean(EGEIData.config.endpoint),dot=document.querySelector('#sync-indicator');
    dot?.classList.toggle('connected',ok);
    document.querySelector('#sync-status-title').textContent=ok?'Conexión configurada':'Modo local';
    document.querySelector('#sync-status-text').textContent=ok?'Los nuevos registros intentarán sincronizarse.':'Los registros se guardan en este navegador.';
  };
  document.querySelector('#sync-settings-form')?.addEventListener('submit',e=>{e.preventDefault();EGEIData.setEndpoint(endpoint.value);updateSync();toast('Conexión guardada.')});
  updateSync();
})();
