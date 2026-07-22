(() => {
  const form = document.querySelector('#login-form');
  const userInput = document.querySelector('#login-user');
  const passwordInput = document.querySelector('#login-password');
  const rememberInput = document.querySelector('#remember-user');
  const togglePassword = document.querySelector('#toggle-password');
  const error = document.querySelector('#login-error');

  const rememberedUser = localStorage.getItem('egei_remembered_user');
  if (rememberedUser) {
    userInput.value = rememberedUser;
    rememberInput.checked = true;
  }

  togglePassword.addEventListener('click', () => {
    const visible = passwordInput.type === 'text';
    passwordInput.type = visible ? 'password' : 'text';
    togglePassword.classList.toggle('is-visible', !visible);
    togglePassword.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
    togglePassword.setAttribute('title', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
    passwordInput.focus();
  });

  [userInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => { error.textContent = ''; });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const user = userInput.value.trim();
    const password = passwordInput.value;

    if (!user || !password) {
      error.textContent = 'Completa el usuario y la contraseña.';
      return;
    }

    if (user === 'admin' && password === 'egei2026') {
      if (rememberInput.checked) localStorage.setItem('egei_remembered_user', user);
      else localStorage.removeItem('egei_remembered_user');

      sessionStorage.setItem('egei_admin', 'active');
      localStorage.setItem('egei_last_access', new Date().toISOString());
      location.href = 'index.html';
      return;
    }

    error.textContent = 'Usuario o contraseña incorrectos.';
    passwordInput.select();
  });
})();
