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

  if (WHATSAPP_NUMBER === "59100000000") {
    alert("Antes de publicar, configura el número oficial de WhatsApp en assets/js/main.js.");
    return;
  }

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
