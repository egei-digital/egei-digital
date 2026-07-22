const menuButton=document.querySelector(".menu-toggle");
const navLinks=document.querySelector(".nav-links");
const backToTop=document.querySelector(".back-to-top");
const form=document.querySelector("#contact-form");
const courseSelect=document.querySelector("#curso");
const WHATSAPP_NUMBER="59176887684";

menuButton?.addEventListener("click",()=>{
  const open=navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded",String(open));
});
document.querySelectorAll(".nav-links a").forEach(link=>link.addEventListener("click",()=>{
  navLinks.classList.remove("open");
  menuButton?.setAttribute("aria-expanded","false");
}));

// Los botones de inscripción abren la ventana de preinscripción mediante data-enroll-open.
// Se conserva este comportamiento solo para botones informativos antiguos que no sean de inscripción.
document.querySelectorAll(".course-info:not([data-enroll-open]),.hero-course-button:not([data-enroll-open])").forEach(button=>{
  button.addEventListener("click",()=>{
    if (courseSelect) courseSelect.value=button.dataset.course || "";
    document.querySelector("#contacto")?.scrollIntoView({behavior:"smooth"});
  });
});

const siteHeader=document.querySelector(".site-header");
const updateHeader=()=>siteHeader?.classList.toggle("scrolled",window.scrollY>40);
window.addEventListener("scroll",updateHeader,{passive:true});
updateHeader();

window.addEventListener("scroll",()=>{
  backToTop.classList.toggle("visible",window.scrollY>600);
});
backToTop?.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));

form?.addEventListener("submit",event=>{
  event.preventDefault();
  const nombre=document.querySelector("#nombre").value.trim();
  const curso=courseSelect.value;
  const mensaje=document.querySelector("#mensaje").value.trim();
  const texto=[
    "Hola EGEI Digital, deseo solicitar información.",
    `Nombre: ${nombre}`,
    `Curso: ${curso}`,
    mensaje?`Consulta: ${mensaje}`:""
  ].filter(Boolean).join("\n");
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`,"_blank","noopener,noreferrer");
});

document.querySelector("#year").textContent=new Date().getFullYear();

const slides=[...document.querySelectorAll(".hero-slide")];
const dots=[...document.querySelectorAll(".hero-dot")];
let currentSlide=0;
let slideTimer;
function showSlide(i){
  currentSlide=(i+slides.length)%slides.length;
  slides.forEach((s,n)=>s.classList.toggle("active",n===currentSlide));
  dots.forEach((d,n)=>d.classList.toggle("active",n===currentSlide));
}
function restartSlider(){
  clearInterval(slideTimer);
  slideTimer=setInterval(()=>showSlide(currentSlide+1),6500);
}
document.querySelector(".hero-prev")?.addEventListener("click",()=>{showSlide(currentSlide-1);restartSlider()});
document.querySelector(".hero-next")?.addEventListener("click",()=>{showSlide(currentSlide+1);restartSlider()});
dots.forEach(d=>d.addEventListener("click",()=>{showSlide(Number(d.dataset.slideTo));restartSlider()}));
restartSlider();

const searchInput=document.querySelector("#course-search");
const cards=[...document.querySelectorAll(".course-card")];
const emptyState=document.querySelector("#empty-state");
let activeFilter="all";

function filterCourses(){
  const term=searchInput.value.toLowerCase().trim();
  let visible=0;
  cards.forEach(card=>{
    const matchesText=card.textContent.toLowerCase().includes(term);
    const matchesCategory=activeFilter==="all"||card.dataset.category===activeFilter;
    const show=matchesText&&matchesCategory;
    card.classList.toggle("is-hidden",!show);
    if(show)visible++;
  });
  emptyState.hidden=visible!==0;
}
searchInput?.addEventListener("input",filterCourses);
document.querySelectorAll(".filter-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter=btn.dataset.filter;
    filterCourses();
  });
});

document.querySelectorAll(".faq-question").forEach(button=>{
  button.addEventListener("click",()=>{
    const item=button.closest(".faq-item");
    const open=item.classList.toggle("open");
    button.setAttribute("aria-expanded",String(open));
  });
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
},{threshold:.15});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

const counters=[...document.querySelectorAll(".counter")];
const counterObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const el=entry.target;
    const target=Number(el.dataset.target);
    let value=0;
    const step=Math.max(1,Math.ceil(target/35));
    const timer=setInterval(()=>{
      value=Math.min(target,value+step);
      el.textContent=value;
      if(value>=target)clearInterval(timer);
    },35);
    counterObserver.unobserve(el);
  });
},{threshold:.6});
counters.forEach(counter=>counterObserver.observe(counter));

// Módulo 5: encabezado transparente sobre el video y sólido al desplazarse
(() => {
  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero-video');
  if (!header || !hero) return;
  const updateHeader = () => {
    const scrolled = window.scrollY > 45;
    header.classList.toggle('hero-transparent', !scrolled);
    header.classList.toggle('hero-scrolled', scrolled);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();


// Módulo 5.2: agenda académica mensual
(() => {
  const listEl = document.querySelector('#agenda-list');
  const monthsEl = document.querySelector('#agenda-months');
  const titleEl = document.querySelector('#agenda-month-title');
  if (!listEl || !monthsEl || !titleEl) return;

  const events = [
    { date:'2026-07-20', course:'Microsoft Excel', modality:'Presencial o Virtual', duration:'1 mes', status:'Cupos disponibles' },
    { date:'2026-07-21', course:'Microsoft Office', modality:'Presencial o Virtual', duration:'Programa completo', status:'Cupos disponibles' },
    { date:'2026-07-22', course:'Redes Sociales', modality:'Presencial o Virtual', duration:'1 mes', status:'Últimos cupos' },
    { date:'2026-08-03', course:'Auxiliar en Contabilidad', modality:'Presencial o Virtual', duration:'Programa modular', status:'Inscripciones abiertas' }
  ];
  const months=[...new Set(events.map(e=>e.date.slice(0,7)))];
  let selected=months[0];
  const monthName=value=>new Intl.DateTimeFormat('es-BO',{month:'long',year:'numeric'}).format(new Date(value+'-01T12:00:00'));
  const dayName=value=>new Intl.DateTimeFormat('es-BO',{weekday:'short'}).format(new Date(value+'T12:00:00')).replace('.','');
  const monthShort=value=>new Intl.DateTimeFormat('es-BO',{month:'short'}).format(new Date(value+'T12:00:00')).replace('.','');

  function render(){
    titleEl.textContent=monthName(selected);
    monthsEl.innerHTML=months.map(m=>`<button type="button" class="agenda-month-btn${m===selected?' active':''}" data-month="${m}">${new Intl.DateTimeFormat('es-BO',{month:'short'}).format(new Date(m+'-01T12:00:00')).replace('.','')}</button>`).join('');
    const rows=events.filter(e=>e.date.startsWith(selected));
    listEl.innerHTML=rows.length?rows.map(e=>`<article class="agenda-item">
      <div class="agenda-date"><strong>${Number(e.date.slice(8,10))}</strong><span>${dayName(e.date)} · ${monthShort(e.date)}</span></div>
      <div class="agenda-copy"><h4>${e.course}</h4><p>Inicio programado para nuevos participantes.</p><div class="agenda-meta"><span>${e.modality}</span><span>${e.duration}</span></div></div>
      <div class="agenda-actions"><span class="agenda-status">${e.status}</span><button type="button" class="agenda-enroll" data-enroll-open data-course="${e.course}">Inscribirme</button></div>
    </article>`).join(''):'<p class="agenda-empty">No existen inicios publicados para este mes.</p>';
    monthsEl.querySelectorAll('[data-month]').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.month;render()}));
  }
  render();
})();
