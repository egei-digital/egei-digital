const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const backToTop = document.querySelector(".back-to-top");
const form = document.querySelector("#contact-form");
const courseSelect = document.querySelector("#curso");

// Reemplaza este número por el WhatsApp oficial, con código de país y sin símbolos.
// Ejemplo Bolivia: 59170000000
const WHATSAPP_NUMBER = "59176887684";

menuButton?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".course-info").forEach(button => {
  button.addEventListener("click", () => {
    courseSelect.value = button.dataset.course;
    document.querySelector("#contacto").scrollIntoView({ behavior: "smooth" });
  });
});

window.addEventListener("scroll", () => {
  backToTop.classList.toggle("visible", window.scrollY > 600);
});

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

form?.addEventListener("submit", event => {
  event.preventDefault();

  const nombre = document.querySelector("#nombre").value.trim();
  const curso = courseSelect.value;
  const mensaje = document.querySelector("#mensaje").value.trim();

  const texto = [
    "Hola EGEI Digital, deseo solicitar información.",
    `Nombre: ${nombre}`,
    `Curso: ${curso}`,
    mensaje ? `Consulta: ${mensaje}` : ""
  ].filter(Boolean).join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

document.querySelector("#year").textContent = new Date().getFullYear();


const slides=[...document.querySelectorAll(".hero-slide")],dots=[...document.querySelectorAll(".hero-dot")];
let currentSlide=0,slideTimer;
function showSlide(i){currentSlide=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle("active",n===currentSlide));dots.forEach((d,n)=>d.classList.toggle("active",n===currentSlide))}
function restartSlider(){clearInterval(slideTimer);slideTimer=setInterval(()=>showSlide(currentSlide+1),6500)}
document.querySelector(".hero-prev")?.addEventListener("click",()=>{showSlide(currentSlide-1);restartSlider()});
document.querySelector(".hero-next")?.addEventListener("click",()=>{showSlide(currentSlide+1);restartSlider()});
dots.forEach(d=>d.addEventListener("click",()=>{showSlide(Number(d.dataset.slideTo));restartSlider()}));
document.querySelectorAll(".hero-course-button").forEach(b=>b.addEventListener("click",()=>{courseSelect.value=b.dataset.course;document.querySelector("#contacto").scrollIntoView({behavior:"smooth"})}));
restartSlider();

const searchInput=document.querySelector("#course-search"),courseCards=[...document.querySelectorAll(".course-card")],courseCount=document.querySelector("#course-count");
searchInput?.addEventListener("input",()=>{const t=searchInput.value.toLowerCase().trim();let visible=0;courseCards.forEach(c=>{const match=c.textContent.toLowerCase().includes(t);c.classList.toggle("is-hidden",!match);if(match)visible++});courseCount.textContent=`${visible} ${visible===1?"curso disponible":"cursos disponibles"}`});
