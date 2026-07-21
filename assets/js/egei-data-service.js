
window.EGEIData = (() => {
  const CONFIG = {
    storageKey: 'egei_registrations',
    endpoint: localStorage.getItem('egei_sync_endpoint') || '',
    firebaseEnabled: false
  };

  const read = () => {
    try { return JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]'); }
    catch { return []; }
  };

  const saveLocal = record => {
    const list = read();
    list.unshift(record);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(list));
    return record;
  };

  const sendRemote = async record => {
    if (!CONFIG.endpoint) return { ok:false, skipped:true };
    const response = await fetch(CONFIG.endpoint, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(record)
    });
    if (!response.ok) throw new Error('No se pudo sincronizar con el servicio externo.');
    return { ok:true };
  };

  const createRegistration = async payload => {
    const record = {
      id: 'r' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'Nuevo',
      source: 'Página web',
      syncStatus: CONFIG.endpoint ? 'Pendiente' : 'Local',
      ...payload
    };
    saveLocal(record);
    if (CONFIG.endpoint) {
      try {
        await sendRemote(record);
        record.syncStatus = 'Sincronizado';
      } catch (error) {
        record.syncStatus = 'Pendiente';
        record.syncError = error.message;
      }
      const list = read().map(x => x.id === record.id ? record : x);
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(list));
    }
    window.dispatchEvent(new CustomEvent('egei:registration-created',{detail:record}));
    return record;
  };

  const updateRegistration = updated => {
    const list = read().map(x => x.id === updated.id ? {...x,...updated} : x);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(list));
  };

  const removeRegistration = id => {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(read().filter(x => x.id !== id)));
  };

  const setEndpoint = endpoint => {
    localStorage.setItem('egei_sync_endpoint', endpoint.trim());
    CONFIG.endpoint = endpoint.trim();
  };

  const exportCSV = () => {
    const rows = read();
    const headers = ['Fecha','Nombre','Celular','Correo','Curso','Modalidad','Horario','Estado','Observaciones','Sincronización'];
    const values = rows.map(r => [
      r.createdAt || '', r.name || '', r.phone || '', r.email || '', r.course || '',
      r.modality || '', r.schedule || '', r.status || '', r.comments || '', r.syncStatus || ''
    ]);
    const csv = [headers,...values].map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(["\ufeff"+csv],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'preinscripciones-egei.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return { read, createRegistration, updateRegistration, removeRegistration, setEndpoint, exportCSV, config:CONFIG };
})();
