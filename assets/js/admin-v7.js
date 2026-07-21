
if(sessionStorage.getItem('egei_admin')!=='ok')location.href='login.html';
logout.onclick=()=>{sessionStorage.removeItem('egei_admin');location.href='login.html'};
document.querySelectorAll('.admin-nav button[data-id]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.admin-section').forEach(s=>s.classList.remove('active'));document.querySelector('#'+b.dataset.id).classList.add('active')});
let regs=JSON.parse(localStorage.getItem('egei_registrations')||'[]'),news=JSON.parse(localStorage.getItem('egei_news')||'[]');
document.querySelector('#m-reg').textContent=regs.length;document.querySelector('#m-news').textContent=news.length;
document.querySelector('#registration-table').innerHTML=regs.length?regs.map(r=>`<tr><td>${r.name}</td><td>${r.phone}</td><td>${r.course}</td><td>${r.modality}</td></tr>`).join(''):'<tr><td colspan="4">Sin registros</td></tr>';
function render(){news=JSON.parse(localStorage.getItem('egei_news')||'[]');document.querySelector('#news-list').innerHTML=news.map(n=>`<article><strong>${n.title}</strong><p>${n.summary}</p></article>`).join('');document.querySelector('#m-news').textContent=news.length}render();
document.querySelector('#news-form').onsubmit=e=>{e.preventDefault();news.unshift({title:newsTitle.value,date:newsDate.value,summary:newsSummary.value});localStorage.setItem('egei_news',JSON.stringify(news));e.target.reset();render()};
