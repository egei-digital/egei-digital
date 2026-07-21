
(() => {
const defs = {
  courses: {
    key:'egei_courses_admin',
    seed:[
      {id:'c1',name:'Microsoft Excel',category:'Informática',price:'230',duration:'1 mes',modality:'Presencial y Virtual',status:'Activo',image:'assets/images/cursos/excel.webp',description:'Excel Básico, Intermedio, Avanzado, Financiero y Estadístico.'},
      {id:'c2',name:'Microsoft Office',category:'Informática',price:'250',duration:'2 semanas',modality:'Presencial y Virtual',status:'Activo',image:'assets/images/cursos/office.webp',description:'Word, Excel, PowerPoint y herramientas de oficina.'},
      {id:'c3',name:'Diseño Gráfico',category:'Diseño',price:'200',duration:'Mensual',modality:'Presencial y Virtual',status:'Activo',image:'assets/images/cursos/diseno-grafico.webp',description:'Photoshop, Illustrator e InDesign.'}
    ],
    columns:['name','category','price','modality','status'],
    format:(x,k)=>k==='price'?(x?'Bs '+x:'—'):x
  },
  starts: {
    key:'egei_starts',
    seed:[
      {id:'s1',course:'Microsoft Excel',date:'2026-07-27',time:'09:00',spots:'20',modality:'Presencial y Virtual',status:'Inscripciones abiertas'},
      {id:'s2',course:'Microsoft Office',date:'2026-07-28',time:'19:00',spots:'15',modality:'Virtual',status:'Últimos cupos'}
    ],
    columns:['course','date','time','spots','status'],
    format:(x,k)=>k==='date'&&x?new Intl.DateTimeFormat('es-BO',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(x+'T00:00:00Z')):x
  },
  banners: {
    key:'egei_banners',
    seed:[
      {id:'b1',title:'Capacítate con EGEI Digital',subtitle:'Cursos presenciales y virtuales',buttonText:'Inscríbete ahora',buttonLink:'#preinscripcion',image:'assets/images/branding/banner-institucional.webp',expires:'2026-12-31',status:'Activo'}
    ],
    columns:['title','buttonText','expires','status'],
    format:(x,k)=>k==='expires'&&x?new Intl.DateTimeFormat('es-BO',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(x+'T00:00:00Z')):x
  },
  news: {
    key:'egei_news',
    seed:[
      {id:'n1',title:'Nueva convocatoria de cursos',date:'2026-07-21',status:'Publicado',summary:'Inscripciones abiertas para nuevos grupos.',content:'Conoce nuestra nueva convocatoria de cursos presenciales y virtuales.'}
    ],
    columns:['title','date','status'],
    format:(x,k)=>k==='date'&&x?new Intl.DateTimeFormat('es-BO',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(x+'T00:00:00Z')):x
  }
};

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const getData = type => {
  const def=defs[type], saved=localStorage.getItem(def.key);
  if(saved) return JSON.parse(saved);
  localStorage.setItem(def.key,JSON.stringify(def.seed));
  return [...def.seed];
};
const saveData=(type,data)=>localStorage.setItem(defs[type].key,JSON.stringify(data));
const statusClass=s=>{
  s=String(s||'').toLowerCase();
  if(s.includes('inactiv')||s.includes('borrador'))return 'inactive';
  if(s.includes('últimos'))return 'warning';
  if(s.includes('completo'))return 'complete';
  return '';
};
const showToast=msg=>{
  const el=document.querySelector('#admin-toast'); if(!el)return;
  el.textContent=msg;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),2200);
};

function render(type, filter=''){
  const def=defs[type], tbody=document.querySelector(`#${type}-table`);
  if(!tbody)return;
  const all=getData(type);
  const rows=all.filter(item=>Object.values(item).join(' ').toLowerCase().includes(filter.toLowerCase()));
  document.querySelector(`#${type}-count`).textContent=`${rows.length} registro${rows.length===1?'':'s'}`;
  tbody.innerHTML=rows.length?rows.map(item=>{
    const cells=def.columns.map(k=>{
      const value=def.format?def.format(item[k],k):item[k];
      if(k==='status')return `<td><span class="v8-status-pill ${statusClass(value)}">${escapeHTML(value||'—')}</span></td>`;
      return `<td>${escapeHTML(value||'—')}</td>`;
    }).join('');
    return `<tr>${cells}<td><div class="v8-row-actions"><button data-edit="${type}" data-id="${item.id}">Editar</button><button class="danger" data-delete="${type}" data-id="${item.id}">Eliminar</button></div></td></tr>`;
  }).join(''):`<tr><td colspan="${def.columns.length+1}" class="v8-empty-row">No hay registros para mostrar.</td></tr>`;
}

function openModal(type,item=null){
  const modal=document.querySelector(`#${type}-modal`);
  const form=document.querySelector(`#${type}-form`);
  form.reset();
  form.elements.id.value=item?.id||'';
  if(item) Object.entries(item).forEach(([k,v])=>{if(form.elements[k])form.elements[k].value=v??''});
  document.querySelector(`#${type}-modal-title`).textContent=item?'Editar registro':'Nuevo registro';
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');
}
function closeModal(modal){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}

Object.keys(defs).forEach(type=>{
  render(type);
  document.querySelector(`#${type}-search`)?.addEventListener('input',e=>render(type,e.target.value));
  document.querySelector(`#${type}-form`)?.addEventListener('submit',e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(e.currentTarget).entries());
    let list=getData(type);
    if(data.id){
      list=list.map(x=>x.id===data.id?{...x,...data}:x);
      showToast('Registro actualizado correctamente.');
    }else{
      data.id=type.charAt(0)+Date.now();
      list.unshift(data);
      showToast('Registro agregado correctamente.');
    }
    saveData(type,list);render(type);closeModal(document.querySelector(`#${type}-modal`));
    if(type==='courses')document.querySelector('#metric-courses').textContent=list.filter(x=>x.status==='Activo').length;
    if(type==='starts')document.querySelector('#metric-starts').textContent=list.length;
    if(type==='news')document.querySelector('#metric-news').textContent=list.length;
  });
});

document.addEventListener('click',e=>{
  const open=e.target.closest('[data-open-modal]');
  if(open){openModal(open.dataset.openModal.replace('-modal',''));return}
  if(e.target.closest('[data-close-modal]')){closeModal(e.target.closest('.v8-modal'));return}
  const edit=e.target.closest('[data-edit]');
  if(edit){const type=edit.dataset.edit;openModal(type,getData(type).find(x=>x.id===edit.dataset.id));return}
  const del=e.target.closest('[data-delete]');
  if(del){
    const type=del.dataset.delete;
    if(confirm('¿Deseas eliminar este registro?')){
      const list=getData(type).filter(x=>x.id!==del.dataset.id);
      saveData(type,list);render(type);showToast('Registro eliminado.');
      if(type==='courses')document.querySelector('#metric-courses').textContent=list.filter(x=>x.status==='Activo').length;
      if(type==='starts')document.querySelector('#metric-starts').textContent=list.length;
      if(type==='news')document.querySelector('#metric-news').textContent=list.length;
    }
  }
});
document.querySelectorAll('.v8-modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.v8-modal.open').forEach(closeModal)});

document.querySelector('#metric-courses').textContent=getData('courses').filter(x=>x.status==='Activo').length;
document.querySelector('#metric-starts').textContent=getData('starts').length;
document.querySelector('#metric-news').textContent=getData('news').length;
})();
