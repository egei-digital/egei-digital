const form=document.querySelector("#registration-form");
const status=document.querySelector("#registration-status");
form.addEventListener("submit",e=>{
 e.preventDefault();
 const entry={
  id:Date.now(),
  name:document.querySelector("#reg-name").value.trim(),
  phone:document.querySelector("#reg-phone").value.trim(),
  email:document.querySelector("#reg-email").value.trim(),
  course:document.querySelector("#reg-course").value,
  modality:document.querySelector("#reg-modality").value,
  notes:document.querySelector("#reg-notes").value.trim(),
  createdAt:new Date().toISOString(),
  communicationAllowed:true,
  source:"Formulario web"
 };
 const list=JSON.parse(localStorage.getItem("egei_registrations")||"[]");
 list.push(entry);
 localStorage.setItem("egei_registrations",JSON.stringify(list));
 status.textContent="Preinscripción enviada directamente. El equipo de EGEI Digital podrá contactarte y enviarte comunicados.";
 form.reset();
});