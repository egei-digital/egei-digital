
const themeButton=document.querySelector('#theme-toggle');
if(localStorage.getItem('egei_theme')==='dark')document.body.classList.add('dark-mode');
themeButton?.addEventListener('click',()=>{document.body.classList.toggle('dark-mode');localStorage.setItem('egei_theme',document.body.classList.contains('dark-mode')?'dark':'light')});
