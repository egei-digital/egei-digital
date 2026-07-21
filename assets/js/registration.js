const form=document.querySelector("#registration-form");
const status=document.querySelector("#registration-status");
const WHATSAPP="59176887684";
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
  createdAt:new Date().toISOString()
 };
 const list=JSON.parse(localStorage.getItem("egei_registrations")||"[]");
 list.push(entry);
 localStorage.setItem("egei_registrations",JSON.stringify(list));
 status.textContent="Solicitud guardada correctamente.";
 const text=`Hola EGEI Digital, deseo preinscribirme.\nNombre: ${entry.name}\nCelular: ${entry.phone}\nCurso: ${entry.course}\nModalidad: ${entry.modality}\nObservaciones: ${entry.notes}`;
 window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`,"_blank");
 form.reset();
});