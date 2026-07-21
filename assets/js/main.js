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

document.querySelectorAll(".course-info,.hero-course-button").forEach(button=>{
  button.addEventListener("click",()=>{
    courseSelect.value=button.dataset.course;
    document.querySelector("#contacto").scrollIntoView({behavior:"smooth"});
  });
});

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


// Módulo 5.1: calendario de próximos inicios en la página principal
(() => {
  const daysEl = document.querySelector('#calendar-days');
  const titleEl = document.querySelector('#calendar-title');
  const listEl = document.querySelector('#calendar-event-list');
  const eventsTitle = document.querySelector('#calendar-events-title');
  if (!daysEl || !titleEl || !listEl) return;

  const events = [
    { date: '2026-07-20', course: 'Microsoft Excel', detail: 'Presencial o Virtual · Duración: 1 mes' },
    { date: '2026-07-21', course: 'Microsoft Office', detail: 'Presencial o Virtual · Programa completo' },
    { date: '2026-07-22', course: 'Redes Sociales', detail: 'Presencial o Virtual · Duración: 1 mes' }
  ];
  const initial = events.length ? new Date(`${events[0].date}T12:00:00`) : new Date();
  let view = new Date(initial.getFullYear(), initial.getMonth(), 1);
  let selectedDate = '';
  const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const pretty = value => new Intl.DateTimeFormat('es-BO',{weekday:'long',day:'numeric',month:'long'}).format(new Date(`${value}T12:00:00`));

  function renderEvents(date='') {
    const monthEvents = events.filter(e => date ? e.date === date : new Date(`${e.date}T12:00:00`).getMonth() === view.getMonth() && new Date(`${e.date}T12:00:00`).getFullYear() === view.getFullYear());
    eventsTitle.textContent = date ? pretty(date) : 'Inicios programados';
    listEl.innerHTML = monthEvents.length ? monthEvents.map(e => `<article class="calendar-event"><time>${pretty(e.date)}</time><strong>${e.course}</strong><span>${e.detail}</span></article>`).join('') : '<p class="calendar-empty">No hay inicios publicados para esta fecha. Puedes consultar los próximos grupos disponibles.</p>';
  }

  function render() {
    titleEl.textContent = new Intl.DateTimeFormat('es-BO',{month:'long',year:'numeric'}).format(view);
    const year=view.getFullYear(), month=view.getMonth();
    const first=new Date(year,month,1); const offset=(first.getDay()+6)%7;
    const start=new Date(year,month,1-offset);
    const todayIso=iso(new Date());
    daysEl.innerHTML='';
    for(let i=0;i<42;i++){
      const d=new Date(start); d.setDate(start.getDate()+i); const value=iso(d);
      const dayEvents=events.filter(e=>e.date===value);
      const button=document.createElement('button'); button.type='button';
      button.className='calendar-day'+(d.getMonth()!==month?' other-month':'')+(value===todayIso?' today':'')+(dayEvents.length?' has-event':'')+(value===selectedDate?' selected':'');
      button.innerHTML=`<span class="calendar-day-number">${d.getDate()}</span>${dayEvents.length?'<i class="calendar-dot" aria-hidden="true"></i>':''}`;
      button.setAttribute('aria-label',dayEvents.length?`${pretty(value)}: ${dayEvents.map(e=>e.course).join(', ')}`:pretty(value));
      if(dayEvents.length) button.addEventListener('click',()=>{selectedDate=value;render();renderEvents(value)});
      daysEl.appendChild(button);
    }
    if(!selectedDate) renderEvents();
  }
  document.querySelector('#calendar-prev')?.addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);selectedDate='';render()});
  document.querySelector('#calendar-next')?.addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);selectedDate='';render()});
  render();
})();
