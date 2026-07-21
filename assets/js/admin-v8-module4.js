
(() => {
  if (!window.EGEIData) return;

  let currentPage = 1;
  const table = document.querySelector('#registration-table');
  const search = document.querySelector('#registration-search');
  const statusFilter = document.querySelector('#registration-status-filter');
  const courseFilter = document.querySelector('#crm-course-filter');
  const modalityFilter = document.querySelector('#crm-modality-filter');
  const pageSize = document.querySelector('#crm-page-size');

  const esc = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const normalizePhone = value => {
    let p = String(value || '').replace(/\D/g,'').replace(/^0+/,'');
    if (p.startsWith('591')) return p;
    return '591' + p;
  };
  const dateTime = value => {
    if (!value) return '—';
    try {
      return new Intl.DateTimeFormat('es-BO',{
        day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',
        timeZone:'America/La_Paz'
      }).format(new Date(value)).replace(',','<br>');
    } catch { return value; }
  };

  function filteredRows() {
    const q = (search?.value || '').trim().toLowerCase();
    return EGEIData.read().filter(r => {
      const blob = [r.name,r.phone,r.email,r.course,r.modality,r.status].join(' ').toLowerCase();
      return blob.includes(q)
        && (!statusFilter.value || r.status === statusFilter.value)
        && (!courseFilter.value || r.course === courseFilter.value)
        && (!modalityFilter.value || r.modality === modalityFilter.value);
    });
  }

  function populateCourseFilter() {
    const current = courseFilter.value;
    const courses = [...new Set(EGEIData.read().map(r=>r.course).filter(Boolean))].sort();
    courseFilter.innerHTML = '<option value="">Todos los cursos</option>' +
      courses.map(c=>`<option>${esc(c)}</option>`).join('');
    courseFilter.value = current;
  }

  function statusBadge(s) {
    const cls = {
      Nuevo:'crm-new', Contactado:'crm-contacted', Reservado:'crm-reserved',
      Inscrito:'crm-enrolled', Finalizado:'crm-finished'
    }[s] || '';
    return `<span class="crm-status ${cls}">${esc(s||'Nuevo')}</span>`;
  }

  function renderMetrics(all) {
    const count = s => all.filter(r=>r.status===s).length;
    const mapping = {
      '#crm-total':all.length,'#crm-new':count('Nuevo'),'#crm-contacted':count('Contactado'),
      '#crm-reserved':count('Reservado'),'#crm-enrolled':count('Inscrito'),'#crm-finished':count('Finalizado')
    };
    Object.entries(mapping).forEach(([sel,val])=>{const el=document.querySelector(sel);if(el)el.textContent=val});
    const metric = document.querySelector('#metric-registrations'); if(metric) metric.textContent=all.length;

    const today = new Date();
    const sameDay = d => {
      const x = new Date(d); return x.toDateString() === today.toDateString();
    };
    const sameMonth = d => {
      const x = new Date(d); return x.getMonth()===today.getMonth() && x.getFullYear()===today.getFullYear();
    };
    document.querySelector('#crm-today').textContent = all.filter(r=>sameDay(r.createdAt)).length;
    document.querySelector('#crm-month').textContent = all.filter(r=>sameMonth(r.createdAt)).length;
    const converted = count('Inscrito') + count('Finalizado');
    document.querySelector('#crm-conversion').textContent = all.length ? ((converted/all.length)*100).toFixed(1)+'%' : '0%';

    const courseCounts = {};
    all.forEach(r=>{if(r.course)courseCounts[r.course]=(courseCounts[r.course]||0)+1});
    const topCourse = Object.entries(courseCounts).sort((a,b)=>b[1]-a[1])[0];
    document.querySelector('#crm-top-course').textContent = topCourse ? topCourse[0] : '—';

    const funnel = document.querySelector('#crm-funnel');
    const statuses = ['Nuevo','Contactado','Reservado','Inscrito','Finalizado'];
    funnel.innerHTML = statuses.map(s=>{
      const n=count(s), pct=all.length?(n/all.length*100):0;
      return `<div class="v8-funnel-row"><div><span>${s}</span><strong>${n}</strong></div><div class="v8-funnel-track"><i style="width:${pct}%"></i></div><small>${pct.toFixed(1)}%</small></div>`;
    }).join('');
  }

  function render() {
    populateCourseFilter();
    const all = EGEIData.read();
    renderMetrics(all);

    const rows = filteredRows();
    const size = Number(pageSize.value || 5);
    const pages = Math.max(1, Math.ceil(rows.length/size));
    if (currentPage > pages) currentPage = pages;
    const slice = rows.slice((currentPage-1)*size,currentPage*size);

    document.querySelector('#registration-count').textContent =
      rows.length ? `Mostrando ${(currentPage-1)*size+1} a ${Math.min(currentPage*size,rows.length)} de ${rows.length} registros` : '0 registros';
    document.querySelector('#crm-page').textContent = currentPage;
    document.querySelector('#crm-prev').disabled = currentPage<=1;
    document.querySelector('#crm-next').disabled = currentPage>=pages;

    table.innerHTML = slice.length ? slice.map(r=>`
      <tr>
        <td>${dateTime(r.createdAt)}</td>
        <td><strong>${esc(r.name||'—')}</strong></td>
        <td><span>☎ ${esc(r.phone||'—')}</span><br><small>✉ ${esc(r.email||'Sin correo')}</small></td>
        <td>${esc(r.course||'—')}</td>
        <td>${esc(r.modality||'—')}</td>
        <td>${esc(r.schedule||'Por confirmar')}</td>
        <td>${statusBadge(r.status)}</td>
        <td>
          <div class="v8-row-actions">
            <a class="crm-whatsapp" target="_blank" rel="noopener" href="https://wa.me/${normalizePhone(r.phone)}?text=${encodeURIComponent('Hola '+(r.name||'')+', te contactamos de Fundación EGEI Digital por tu interés en '+(r.course||'nuestros cursos')+'.')}">WhatsApp</a>
            <button data-crm-edit="${esc(r.id)}">Editar</button>
            <button class="danger" data-crm-delete="${esc(r.id)}">⋮</button>
          </div>
        </td>
      </tr>`).join('') : '<tr><td colspan="8" class="v8-empty-row">No se encontraron registros.</td></tr>';
  }

  function openModal(record=null) {
    const modal = document.querySelector('#crm-modal');
    const form = document.querySelector('#crm-form');
    form.reset();
    form.elements.id.value = record?.id || '';
    if (record) Object.entries(record).forEach(([k,v])=>{if(form.elements[k])form.elements[k].value=v??''});
    document.querySelector('#crm-modal-title').textContent = record ? 'Editar preinscripción' : 'Nueva preinscripción';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal() {
    const modal=document.querySelector('#crm-modal');
    modal.classList.remove('open');modal.setAttribute('aria-hidden','true');
  }

  [search,statusFilter,courseFilter,modalityFilter,pageSize].forEach(el=>el?.addEventListener(el===search?'input':'change',()=>{currentPage=1;render()}));
  document.querySelector('#crm-clear-filters')?.addEventListener('click',()=>{
    search.value='';statusFilter.value='';courseFilter.value='';modalityFilter.value='';currentPage=1;render();
  });
  document.querySelector('#crm-prev')?.addEventListener('click',()=>{if(currentPage>1){currentPage--;render()}});
  document.querySelector('#crm-next')?.addEventListener('click',()=>{currentPage++;render()});
  document.querySelector('#registration-export')?.addEventListener('click',()=>EGEIData.exportCSV());
  document.querySelector('#crm-export-all')?.addEventListener('click',()=>EGEIData.exportCSV());
  document.querySelector('#crm-new-registration')?.addEventListener('click',()=>openModal());

  document.querySelector('#crm-form')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (data.id) {
      const current = EGEIData.read().find(r=>r.id===data.id) || {};
      EGEIData.updateRegistration({...current,...data});
    } else {
      delete data.id;
      await EGEIData.createRegistration(data);
    }
    closeModal();render();
  });

  table?.addEventListener('click',e=>{
    const editId=e.target.closest('[data-crm-edit]')?.dataset.crmEdit;
    const deleteId=e.target.closest('[data-crm-delete]')?.dataset.crmDelete;
    if(editId) openModal(EGEIData.read().find(r=>r.id===editId));
    if(deleteId && confirm('¿Deseas eliminar este registro?')){EGEIData.removeRegistration(deleteId);render()}
  });

  document.querySelectorAll('#crm-modal [data-close-modal]').forEach(b=>b.addEventListener('click',closeModal));
  document.querySelector('#crm-modal')?.addEventListener('click',e=>{if(e.target.id==='crm-modal')closeModal()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
  window.addEventListener('egei:registration-created',render);

  document.querySelector('#crm-message-all')?.addEventListener('click',()=>{
    const phones=filteredRows().map(r=>r.phone).filter(Boolean);
    alert(phones.length ? `Hay ${phones.length} contactos filtrados. Por seguridad, WhatsApp no permite abrir mensajes masivos automáticos desde GitHub Pages.` : 'No hay contactos en el filtro actual.');
  });
  document.querySelector('#crm-report')?.addEventListener('click',()=>{
    alert('El reporte detallado estará disponible en el siguiente módulo de reportes.');
  });
  document.querySelector('#crm-sync')?.addEventListener('click',()=>{
    alert(EGEIData.config.endpoint ? 'La conexión está configurada. Los nuevos registros intentarán sincronizarse.' : 'Configura primero la URL de Excel Online o Power Automate en Configuración.');
  });

  render();
})();
