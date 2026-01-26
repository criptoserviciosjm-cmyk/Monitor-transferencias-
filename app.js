/**
 * INV J.B - PWA estática para Netlify
 * Admin: abre "Editar" y coloca tu clave.
 * Cambia la clave aquí si quieres:
 */
const ADMIN_PASS = "INVJB2026";

const els = {
  title: document.getElementById("appTitle"),
  usdBcv: document.getElementById("usdBcv"),
  brlVes: document.getElementById("brlVes"),
  vesBrl: document.getElementById("vesBrl"),
  updatedAt: document.getElementById("updatedAt"),
  refreshBtn: document.getElementById("refreshBtn"),
  adminBtn: document.getElementById("adminBtn"),
  adminModal: document.getElementById("adminModal"),
  inUsdBcv: document.getElementById("inUsdBcv"),
  inBrlVes: document.getElementById("inBrlVes"),
  inVesBrl: document.getElementById("inVesBrl"),
  inNote: document.getElementById("inNote"),
  inUpdatedAt: document.getElementById("inUpdatedAt"),
  downloadRates: document.getElementById("downloadRates"),
  cancelAdmin: document.getElementById("cancelAdmin"),
};

let currentData = null;

function formatNumber(n){
  if(n === null || n === undefined || n === "") return "—";
  const num = Number(n);
  if(Number.isNaN(num)) return "—";
  // keep integers clean, otherwise 2 decimals
  return Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/\.00$/,"");
}

function formatDate(iso){
  if(!iso) return "—";
  try{
    const d = new Date(iso);
    // dd/mm/yyyy, hh:mm:ss
    const pad = (x)=>String(x).padStart(2,"0");
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }catch{
    return iso;
  }
}

async function loadRates(){
  const bust = `v=${Date.now()}`;
  const res = await fetch(`/rates.json?${bust}`, { cache: "no-store" });
  if(!res.ok) throw new Error("No se pudo leer rates.json");
  const data = await res.json();
  currentData = data;

  els.title.textContent = data.appTitle || "Inversiónes J.B";
  els.usdBcv.textContent = formatNumber(data?.rates?.USD_BCV);
  els.brlVes.textContent = formatNumber(data?.rates?.BRL_VES);
  els.vesBrl.textContent = formatNumber(data?.rates?.VES_BRL);
  els.updatedAt.textContent = formatDate(data.updatedAt);

  // fill admin fields
  els.inUsdBcv.value = data?.rates?.USD_BCV ?? "";
  els.inBrlVes.value = data?.rates?.BRL_VES ?? "";
  els.inVesBrl.value = data?.rates?.VES_BRL ?? "";
  els.inUpdatedAt.value = formatDate(data.updatedAt);
}

function promptPass(){
  const p = prompt("Clave de administrador:");
  return (p || "").trim();
}

function openAdmin(){
  const pass = promptPass();
  if(pass !== ADMIN_PASS){
    alert("Clave incorrecta.");
    return;
  }
  // refresh timestamp preview
  els.inUpdatedAt.value = formatDate(new Date().toISOString());
  els.adminModal.showModal();
}

function buildRatesJson(){
  const parse = (v)=>{
    const x = String(v ?? "").trim().replace(",", ".");
    if(x === "") return null;
    const n = Number(x);
    return Number.isNaN(n) ? null : n;
  };

  const usd = parse(els.inUsdBcv.value);
  const brlves = parse(els.inBrlVes.value);
  const vesbrl = parse(els.inVesBrl.value);

  if([usd, brlves, vesbrl].some(v => v === null)){
    alert("Revisa los valores: deben ser números.");
    return null;
  }

  const out = {
    appTitle: currentData?.appTitle || "Inversiónes J.B",
    updatedAt: new Date().toISOString(),
    rates: {
      USD_BCV: usd,
      BRL_VES: brlves,
      VES_BRL: vesbrl
    },
    note: String(els.inNote.value || "").trim()
  };
  return out;
}

function downloadJson(obj){
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rates.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

els.refreshBtn.addEventListener("click", async ()=>{
  els.refreshBtn.disabled = true;
  try{ await loadRates(); }
  catch(e){ alert(e.message || "Error"); }
  finally{ els.refreshBtn.disabled = false; }
});

els.adminBtn.addEventListener("click", openAdmin);

els.cancelAdmin.addEventListener("click", ()=>{
  els.adminModal.close();
});

els.downloadRates.addEventListener("click", ()=>{
  const out = buildRatesJson();
  if(!out) return;
  downloadJson(out);
  els.adminModal.close();
  // show immediately in UI (without needing redeploy)
  currentData = out;
  els.usdBcv.textContent = formatNumber(out.rates.USD_BCV);
  els.brlVes.textContent = formatNumber(out.rates.BRL_VES);
  els.vesBrl.textContent = formatNumber(out.rates.VES_BRL);
  els.updatedAt.textContent = formatDate(out.updatedAt);
});

// register service worker
if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("/sw.js").catch(()=>{});
  });
}

// boot
loadRates().catch(()=>{
  // fallback to empty state
});
