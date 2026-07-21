
(() => {
  const modal = document.querySelector('#egei-enroll-modal');
  const form = document.querySelector('#egei-enroll-form');
  if (!modal || !form || !window.EGEIData) return;

  const courseSelect = document.querySelector('#egei-course-select');
  const status = document.querySelector('#egei-form-status');

  const fallbackCourses = [
    'Microsoft Excel','Microsoft Office','Auxiliar en Contabilidad',
    'Diseño Gráfico','Comercio Exterior y Aduanas',
    'Ensamblaje e Instalación de Computadoras','Redes Sociales'
  ];
  let courses = fallbackCourses;
  try {
    const saved = JSON.parse(localStorage.getItem('egei_courses_admin') || '[]');
    const active = saved.filter(c => c.status !== 'Inactivo').map(c => c.name);
    if (active.length) courses = active;
  } catch {}
  courseSelect.innerHTML = '<option value="">Selecciona un curso</option>' +
    courses.map(c => `<option>${c}</option>`).join('');

  const open = course => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    if (course && courses.includes(course)) courseSelect.value = course;
    setTimeout(()=>form.querySelector('input[name="name"]').focus(),80);
  };
  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  };

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-enroll-open]');
    if (trigger) {
      e.preventDefault();
      open(trigger.dataset.course || '');
    }
    if (e.target.closest('[data-enroll-close]') || e.target === modal) close();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.textContent = 'Enviando preinscripción...';
    status.className = 'egei-form-status';
    const data = Object.fromEntries(new FormData(form).entries());
    delete data.consent;
    try {
      const record = await EGEIData.createRegistration(data);
      form.reset();
      status.textContent = record.syncStatus === 'Sincronizado'
        ? '¡Registro enviado y sincronizado correctamente!'
        : '¡Preinscripción registrada! Nos comunicaremos contigo por WhatsApp.';
      status.classList.add('success');
      setTimeout(close,2200);
    } catch (error) {
      status.textContent = 'No se pudo completar el registro. Intenta nuevamente.';
      status.classList.add('error');
    }
  });

  if (location.hash === '#preinscripcion') open();
})();
