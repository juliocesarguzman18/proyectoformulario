
let brigadas = [];          
let bomberosTemp = [];      
let draft = {              
  brigadaId: null,
  comandanteId: null,
  logisticaId: null,
  epp:{ ropa:{}, botas:{}, guantes:{} },
  herramientas: [],         
  logistica:{ combustible:"Gasolina", combustibleMonto:0, repuesto:"Amortiguadores", repuestoMonto:0 },
  alimentos: [],            
  medicamentos: []          
};


const TALLAS_ROPA = ["XS","S","M","L","XL"];
const NUM_BOTAS = Array.from({length:7}, (_,i)=> 37+i); 
const TALLAS_GUANTES = ["XS","S","M","L","XL","XXL"];
const OPC_HERRAMIENTAS = ["McLeod","Batefuego","Pulaski","Pala","Motosierra"];
const MAX_CANT = 10;

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const create = (tag, attrs={}) => Object.assign(document.createElement(tag), attrs);
const notify = (msg) => alert(msg); 

let currentStep = 0; 
const stepsEls = $$(".form-step");
const stepperEls = $$(".step");
const showStep = (i) => {
  if (i<0 || i>=stepsEls.length) return;
  stepsEls.forEach((el,idx)=> el.classList.toggle("active", idx===i));
  stepperEls.forEach((el,idx)=> el.classList.toggle("active", idx===i));
  currentStep = i;
  if (i === 4) renderResumen();
};
$$("[data-next]").forEach(b=> b.addEventListener("click", ()=> {
  
  if (currentStep===0 && brigadas.length===0){
    notify("Primero guarda al menos una brigada.");
    return;
  }
  if (currentStep===1 && !draft.brigadaId){
    notify("Selecciona una brigada.");
    return;
  }
  showStep(currentStep+1);
}));
$$("[data-prev]").forEach(b=> b.addEventListener("click", ()=> showStep(currentStep-1)));

const modal = $("#bomberoModal");
$("#addBomberoBtn").addEventListener("click", ()=> modal.style.display="grid");
$("#closeModal").addEventListener("click", ()=> modal.style.display="none");
$("#cancelModal").addEventListener("click", ()=> modal.style.display="none");
$("#saveBombero").addEventListener("click", ()=>{
  const nombre = $("#bomberoNombre").value.trim();
  const rol = $("#bomberoRol").value;
  const telefono = $("#bomberoTelefono").value.trim();
  const correo = $("#bomberoCorreo").value.trim();
  if (!nombre) return notify("Ingresa el nombre del bombero.");
  bomberosTemp.push({ id: crypto.randomUUID(), nombre, rol, telefono, correo });
  $("#bomberoNombre").value = $("#bomberoTelefono").value = $("#bomberoCorreo").value = "";
  renderBomberosTemp();
  modal.style.display="none";
});
function renderBomberosTemp(){
  const cont = $("#bomberosList");
  cont.innerHTML = "";
  bomberosTemp.forEach((b,idx)=>{
    const chip = create("div",{className:"chip"});
    chip.textContent = `${b.nombre} · ${b.rol}`;
    const del = create("button",{className:"del",innerHTML:"&times;"});
    del.addEventListener("click", ()=>{ bomberosTemp.splice(idx,1); renderBomberosTemp();});
    chip.appendChild(del);
    cont.appendChild(chip);
  });
}


$("#saveBrigada").addEventListener("click", ()=>{
  const nombre = $("#brigadaNombre").value.trim();
  const ciudad = $("#brigadaCiudad").value;
  const emergencia = $("#brigadaEmergencia").value.trim();
  if (!nombre || !emergencia) return notify("Completa nombre y número de emergencia.");
  if (brigadas.some(b=> b.nombre.toLowerCase() === nombre.toLowerCase()))
    return notify("El nombre de brigada ya existe. Debe ser único.");

  const nueva = {
    id: crypto.randomUUID(),
    nombre, ciudad, emergencia,
    bomberos: [...bomberosTemp]
  };
  brigadas.push(nueva);
  bomberosTemp = [];
  renderBomberosTemp();
  $("#brigadaNombre").value = "";
  $("#brigadaEmergencia").value = "";
  updateBrigadaSelect(nueva.id);
  notify("Brigada guardada.");
});


function updateBrigadaSelect(preselectId=null){
  const sel = $("#brigadaSelect");
  sel.innerHTML = brigadas.map(b=> `<option value="${b.id}">${b.nombre}</option>`).join("");
  const value = preselectId || (brigadas[brigadas.length-1]?.id ?? null);
  if (value){
    sel.value = value;
    draft.brigadaId = value;
    loadBrigadaInfo(value);
  }
}

$("#brigadaSelect").addEventListener("change", (e)=>{
  draft.brigadaId = e.target.value || null;
  loadBrigadaInfo(draft.brigadaId);
});

function loadBrigadaInfo(id){
  const b = brigadas.find(x=> x.id===id);
  if (!b) return;
  
  const comandantes = b.bomberos.filter(x=> x.rol==="Comandante");
  const logisticas  = b.bomberos.filter(x=> x.rol==="Logística");
  const selC = $("#selectComandante");
  const selL = $("#selectLogistica");
  selC.innerHTML = comandantes.length ? comandantes.map(x=> `<option value="${x.id}">${x.nombre}</option>`).join("") : `<option value="">— Sin registrados —</option>`;
  selL.innerHTML = logisticas.length ? logisticas.map(x=> `<option value="${x.id}">${x.nombre}</option>`).join("") : `<option value="">— Sin registrados —</option>`;


  const cmd = comandantes[0] || null;
  const log = logisticas[0] || null;
  $("#contactoComandante").value = cmd?.telefono || "No asignado";
  $("#contactoLogistica").value = log?.telefono || "No asignado";
  $("#contactoEmergencia").value = b.emergencia;

  draft.comandanteId = cmd?.id || null;
  draft.logisticaId  = log?.id || null;
}

$("#selectComandante").addEventListener("change", e=>{
  const b = brigadas.find(x=> x.id===draft.brigadaId);
  const cmd = b?.bomberos.find(x=> x.id===e.target.value) || null;
  $("#contactoComandante").value = cmd?.telefono || "No asignado";
  draft.comandanteId = cmd?.id || null;
});
$("#selectLogistica").addEventListener("change", e=>{
  const b = brigadas.find(x=> x.id===draft.brigadaId);
  const lo = b?.bomberos.find(x=> x.id===e.target.value) || null;
  $("#contactoLogistica").value = lo?.telefono || "No asignado";
  draft.logisticaId = lo?.id || null;
});
$("#saveDraftInfo").addEventListener("click", ()=> notify("Información guardada en borrador."));

function option0toN(n=MAX_CANT){
  return Array.from({length:n+1}, (_,i)=> `<option>${i}</option>`).join("");
}
function renderEPP(){
  
  const ropaC = $("#ropaContainer");
  ropaC.innerHTML = "";
  TALLAS_ROPA.forEach(t=>{
    const label = create("label");
    label.innerHTML = `${t}<select data-ropa="${t}">${option0toN()}</select>`;
    const sel = label.querySelector("select");
    sel.value = draft.epp.ropa[t] ?? "0";
    sel.addEventListener("change", e=> draft.epp.ropa[t] = Number(e.target.value));
    ropaC.appendChild(label);
  });
  
  const botasC = $("#botasContainer");
  botasC.innerHTML = "";
  NUM_BOTAS.forEach(n=>{
    const label = create("label");
    label.innerHTML = `${n}<select data-bota="${n}">${option0toN()}</select>`;
    const sel = label.querySelector("select");
    sel.value = draft.epp.botas[n] ?? "0";
    sel.addEventListener("change", e=> draft.epp.botas[n] = Number(e.target.value));
    botasC.appendChild(label);
  });
  
  const guaC = $("#guantesContainer");
  guaC.innerHTML = "";
  TALLAS_GUANTES.forEach(t=>{
    const label = create("label");
    label.innerHTML = `${t}<select data-guante="${t}">${option0toN()}</select>`;
    const sel = label.querySelector("select");
    sel.value = draft.epp.guantes[t] ?? "0";
    sel.addEventListener("change", e=> draft.epp.guantes[t] = Number(e.target.value));
    guaC.appendChild(label);
  });
}

const herrSel = $("#herramientaSelect");
OPC_HERRAMIENTAS.forEach(h=> herrSel.appendChild(new Option(h,h)));
$("#addHerramienta").addEventListener("click", ()=>{
  const nombre = $("#herramientaSelect").value;
  const cantidad = Number($("#herramientaCantidad").value || 0);
  if (!cantidad || cantidad<0) return notify("Ingresa una cantidad válida.");
  draft.herramientas.push({id:crypto.randomUUID(), nombre, cantidad});
  $("#herramientaCantidad").value = "";
  renderHerramientas();
});
function renderHerramientas(){
  const list = $("#herramientasList");
  list.innerHTML = "";
  draft.herramientas.forEach((it,idx)=>{
    const row = create("div",{className:"item"});
    row.innerHTML = `<div><strong>${it.nombre}</strong> <small>x ${it.cantidad}</small></div>`;
    const del = create("button",{className:"btn outline",textContent:"Eliminar"});
    del.addEventListener("click", ()=>{
      draft.herramientas.splice(idx,1);
      renderHerramientas();
    });
    row.appendChild(del);
    list.appendChild(row);
  });
}
$("#plantillaEPP").addEventListener("click", ()=>{

  draft.epp.ropa = { XS:1, S:2, M:4, L:4, XL:2 };
  draft.epp.botas = { 38:2, 39:2, 40:3, 41:3 };
  draft.epp.guantes = { S:2, M:4, L:3 };
  renderEPP();
  notify("Plantilla EPP aplicada.");
});
$("#saveDraftEquip").addEventListener("click", ()=> notify("Equipamiento guardado en borrador."));

$("#addAlimento").addEventListener("click", ()=>{
  const nombre = $("#alimento").value;
  const cantidad = Number($("#alimentoCantidad").value||0);
  if (!cantidad || cantidad<0) return notify("Ingresa una cantidad válida.");
  draft.alimentos.push({id:crypto.randomUUID(), nombre, cantidad});
  $("#alimentoCantidad").value="";
  renderChips("alimentosList", draft.alimentos);
});
$("#addMedicamento").addEventListener("click", ()=>{
  const nombre = $("#medicamento").value;
  const cantidad = Number($("#medicamentoCantidad").value||0);
  if (!cantidad || cantidad<0) return notify("Ingresa una cantidad válida.");
  draft.medicamentos.push({id:crypto.randomUUID(), nombre, cantidad});
  $("#medicamentoCantidad").value="";
  renderChips("medicamentosList", draft.medicamentos);
});
function renderChips(containerId, arr){
  const cont = $("#"+containerId);
  cont.innerHTML = "";
  arr.forEach((x,idx)=>{
    const chip = create("div",{className:"chip"});
    chip.textContent = `${x.nombre} · ${x.cantidad}`;
    const del = create("button",{className:"del",innerHTML:"&times;"});
    del.addEventListener("click", ()=>{
      arr.splice(idx,1);
      renderChips(containerId, arr);
    });
    chip.appendChild(del);
    cont.appendChild(chip);
  });
}
$("#plantillaInsumos").addEventListener("click", ()=>{
  draft.logistica = { combustible:"Gasolina", combustibleMonto:200, repuesto:"Llantas", repuestoMonto:350 };
  draft.alimentos = [{id:crypto.randomUUID(),nombre:"Agua",cantidad:12},{id:crypto.randomUUID(),nombre:"Barras energéticas",cantidad:20}];
  draft.medicamentos = [{id:crypto.randomUUID(),nombre:"Paracetamol",cantidad:10},{id:crypto.randomUUID(),nombre:"Gasas",cantidad:15}];

  $("#combustible").value = draft.logistica.combustible;
  $("#combustibleMonto").value = draft.logistica.combustibleMonto;
  $("#repuesto").value = draft.logistica.repuesto;
  $("#repuestoMonto").value = draft.logistica.repuestoMonto;
  renderChips("alimentosList", draft.alimentos);
  renderChips("medicamentosList", draft.medicamentos);
  notify("Plantilla de insumos aplicada.");
});
$("#saveDraftLog").addEventListener("click", ()=>{
  draft.logistica.combustible = $("#combustible").value;
  draft.logistica.combustibleMonto = Number($("#combustibleMonto").value||0);
  draft.logistica.repuesto = $("#repuesto").value;
  draft.logistica.repuestoMonto = Number($("#repuestoMonto").value||0);
  notify("Logística/insumos guardado en borrador.");
});

function renderResumen(){
  const b = brigadas.find(x=> x.id===draft.brigadaId);
  if (!b){ $("#resumen").innerHTML = "<p>Seleccione una brigada.</p>"; return; }

  const comandante = b.bomberos.find(x=> x.id===draft.comandanteId);
  const logistica = b.bomberos.find(x=> x.id===draft.logisticaId);

  const listify = (obj) => Object.entries(obj||{}).filter(([,v])=> v>0).map(([k,v])=> `<li>${k}: ${v}</li>`).join("") || "<li>—</li>";
  const listTools = draft.herramientas.length ? draft.herramientas.map(h=> `<li>${h.nombre}: ${h.cantidad}</li>`).join("") : "<li>—</li>";
  const listArr = (arr) => arr.length ? arr.map(a=> `<li>${a.nombre}: ${a.cantidad}</li>`).join("") : "<li>—</li>";

  $("#resumen").innerHTML = `
    <div class="block">
      <h4>Brigada</h4>
      <ul>
        <li><strong>Nombre:</strong> ${b.nombre}</li>
        <li><strong>Ciudad:</strong> ${b.ciudad}</li>
        <li><strong>Emergencia:</strong> ${b.emergencia}</li>
        <li><strong>Comandante:</strong> ${comandante? comandante.nombre+" ("+(comandante.telefono||"—")+")":"No asignado"}</li>
        <li><strong>Logística:</strong> ${logistica? logistica.nombre+" ("+(logistica.telefono||"—")+")":"No asignado"}</li>
      </ul>
    </div>
    <div class="block">
      <h4>EPP – Ropa</h4>
      <ul>${listify(draft.epp.ropa)}</ul>
    </div>
    <div class="block">
      <h4>EPP – Botas</h4>
      <ul>${listify(draft.epp.botas)}</ul>
    </div>
    <div class="block">
      <h4>EPP – Guantes</h4>
      <ul>${listify(draft.epp.guantes)}</ul>
    </div>
    <div class="block">
      <h4>Herramientas</h4>
      <ul>${listTools}</ul>
    </div>
    <div class="block">
      <h4>Logística</h4>
      <ul>
        <li>Combustible: ${draft.logistica.combustible} (Bs. ${draft.logistica.combustibleMonto||0})</li>
        <li>Repuesto: ${draft.logistica.repuesto} (Bs. ${draft.logistica.repuestoMonto||0})</li>
      </ul>
    </div>
    <div class="block">
      <h4>Alimentos</h4>
      <ul>${listArr(draft.alimentos)}</ul>
    </div>
    <div class="block">
      <h4>Medicamentos</h4>
      <ul>${listArr(draft.medicamentos)}</ul>
    </div>
  `;
}

$("#wizardForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  notify("Guardado (demo). Los datos viven en memoria hasta recargar.");
});


function init(){
  renderEPP();
  renderHerramientas();
  renderChips("alimentosList", draft.alimentos);
  renderChips("medicamentosList", draft.medicamentos);
}
init();
