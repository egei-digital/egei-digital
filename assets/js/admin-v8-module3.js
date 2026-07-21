
(() => {
  if (!window.EGEIData) return;
  const table = document.querySelector('#registration-table');
  const search = document.querySelector('#registration-search');
  const filter = document.querySelector('#registration-status-filter');
  const count = document.querySelector('#registration-count');
  const endpoint = document.querySelector('#sync-endpoint');

  const esc = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const date = value => {
    if (!value) return '—';
    try { return new Intl.DateTimeFormat('es-BO',{dateStyle:'short',timeStyle:'short',timeZone:'America/La_Paz'}).format(new Date(value)); }
    catch { return value; }
  };
  const phoneLink = value => String(value||'').replace(/\D/g,'').replace(/^0+/,'');
  const statusClass = s => {
    s=String(s||'').toLowerCase();
    if(s.includes('nuevo')) return 'warning';
    if(s.includes('finalizado')) return 'complete';
    if(s.includes('contactado')) return 'draft';
    return '';
  };

  function render() {
    if (!table) return;
    const q = (search?.value || '').toLowerCase();
    const state = filter?.value || '';
    const all = EGEIData.read();
    const rows = all.filter(r => {
      const text = Object.values(r).join(' ').toLowerCase();
      return text.includes(q) && (!state || r.status === state);
    });
    count.textContent = `${rows.length} registro${rows.length===1?'':'s'}`;
    document.querySelector('#metric-registrations').textContent = all.length;
    table.innerHTML = rows.length ? rows.map(r => `
      <tr>
        <td>${esc(date(r.createdAt))}</td>
        <td><strong>${esc(r.name||'—')}</strong><br><small>${esc(r.email||'Sin correo')}</small></td>
        <td>${esc(r.phone||'—')}</td>
        <td>${esc(r.course||'—')}</td>
        <td>${esc(r.modality||'—')}<br><small>${esc(r.schedule||'Por confirmar')}</small></td>
        <td>
          <select class="v8-inline-select" data-reg-status="${esc(r.id)}">
            ${['Nuevo','Contactado','Reservado','Inscrito','Finalizado'].map(s=>`<option ${r.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td><span class="v8-status-pill ${r.syncStatus==='Sincronizado'?'':'warning'}">${esc(r.syncStatus||'Local')}</span></td>
        <td><div class="v8-row-actions">
          <a class="v8-action-link" target="_blank" rel="noopener" href="https://wa.me/591${esc(phoneLink(r.phone))}?text=${encodeURIComponent('Hola '+(r.name||'')+', te contactamos de EGEI Digital por tu interés en '+(r.course||'nuestros cursos')+'.')}">WhatsApp</a>
          <button class="danger" data-reg-delete="${esc(r.id)}">Eliminar</button>
        </div></td>
      </tr>`).join('') : `<tr><td colspan="8" class="v8-empty-row">Aún no existen preinscripciones.</td></tr>`;
  }

  search?.addEventListener('input',render);
  filter?.addEventListener('change',render);
  document.querySelector('#registration-refresh')?.addEventListener('click',render);
  document.querySelector('#registration-export')?.addEventListener('click',()=>EGEIData.exportCSV());

  table?.addEventListener('change',e=>{
    const id=e.target.dataset.regStatus;
    if(!id)return;
    const record=EGEIData.read().find(r=>r.id===id);
    if(record){EGEIData.updateRegistration({...record,status:e.target.value});render()}
  });
  table?.addEventListener('click',e=>{
    const id=e.target.closest('[data-reg-delete]')?.dataset.regDelete;
    if(id && confirm('¿Eliminar esta preinscripción?')){EGEIData.removeRegistration(id);render()}
  });
  window.addEventListener('egei:registration-created',render);

  function updateConnectionUI(){
    const configured=Boolean(EGEIData.config.endpoint);
    document.querySelector('#sync-indicator')?.classList.toggle('connected',configured);
    document.querySelector('#sync-status-title').textContent=configured?'Conexión configurada':'Modo local';
    document.querySelector('#sync-status-text').textContent=configured
      ?'Los nuevos registros intentarán sincronizarse con el servicio externo.'
      :'Los registros se guardan únicamente en este navegador.';
    if(endpoint) endpoint.value=EGEIData.config.endpoint;
  }
  document.querySelector('#sync-settings-form')?.addEventListener('submit',e=>{
    e.preventDefault();EGEIData.setEndpoint(endpoint.value);updateConnectionUI();
    const toast=document.querySelector('#admin-toast');
    if(toast){toast.textContent='Configuración guardada.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}
  });

  updateConnectionUI();
  render();
})();
