
document.querySelector('#login-form').onsubmit=e=>{e.preventDefault();if(user.value==='admin'&&password.value==='egei2026'){sessionStorage.setItem('egei_admin','ok');location.href='index.html'}else error.textContent='Datos incorrectos'};
