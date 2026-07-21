const registrations=JSON.parse(localStorage.getItem("egei_registrations")||"[]");
const news=JSON.parse(localStorage.getItem("egei_news")||"[]");
document.querySelector("#metric-registrations").textContent=registrations.length;
document.querySelector("#metric-news").textContent=news.length;
const tbody=document.querySelector("#registration-table");
tbody.innerHTML=registrations.length?registrations.map(r=>`<tr><td>${r.name}</td><td>${r.phone}</td><td>${r.course}</td><td>${r.modality}</td><td>${new Date(r.createdAt).toLocaleDateString()}</td></tr>`).join(""):`<tr><td colspan="5">No hay registros todavía.</td></tr>`;
function renderNews(){
 const list=JSON.parse(localStorage.getItem("egei_news")||"[]");
 document.querySelector("#metric-news").textContent=list.length;
 document.querySelector("#news-list").innerHTML=list.length?list.map(n=>`<article style="padding:12px 0;border-bottom:1px solid #ddd"><strong>${n.title}</strong><small style="display:block">${n.date}</small><p>${n.summary}</p></article>`).join(""):"No hay noticias.";
}
renderNews();
document.querySelector("#news-form").addEventListener("submit",e=>{
 e.preventDefault();
 const list=JSON.parse(localStorage.getItem("egei_news")||"[]");
 list.unshift({title:document.querySelector("#news-title").value,date:document.querySelector("#news-date").value,summary:document.querySelector("#news-summary").value});
 localStorage.setItem("egei_news",JSON.stringify(list));
 e.target.reset();renderNews();
});