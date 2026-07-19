
let CONFIG;
let zoneIndex = 0;
let checked = {};
let store = "";
let inspector = "";
let position = "SM";

const app = document.getElementById("app");
const fmt = d => d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const minusDays = n => { const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()-n); return d; };
const dateMap = () => ({
  "Today": fmt(minusDays(0)), "P": fmt(minusDays(0)), "P+1": fmt(minusDays(1)),
  "P+2": fmt(minusDays(2)), "P+13": fmt(minusDays(13)),
  "P+14": fmt(minusDays(14)), "P+30": fmt(minusDays(30))
});
const discardText = life => life==="P" ? "Discard all remaining items at closing." : `Discard if Start Date is ${dateMap()[life]} or earlier.`;

function home(){
  const dm=dateMap();
  app.innerHTML=`<main class="screen">
    <div class="brand"><img class="logo" src="logo.jpg" alt="Yakiniku Like">
    <h1>Yakiniku Like</h1><div class="subtitle">Expired Killer</div>
    <div class="tagline">${CONFIG.tagline}</div></div>
    <section class="card"><label>Store</label>
      <select id="store">${CONFIG.stores.map(s=>`<option ${s===store?"selected":""}>${s}</option>`).join("")}</select>
    </section>
    <section class="card"><div class="date-title">TODAY · ${dm.Today}</div>
      <div class="date-grid">
      ${["P","P+1","P+2","P+13","P+14","P+30"].map(x=>`<div class="life">${x}</div><div class="date">${dm[x]}</div>`).join("")}
      </div>
    </section>
    <button class="primary" id="start">START INSPECTION</button>
    <div class="small" style="text-align:center;margin-top:10px">Dates are calculated automatically.</div>
  </main>`;
  document.getElementById("store").onchange=e=>{store=e.target.value;localStorage.setItem("ek_store",store)};
  document.getElementById("start").onclick=()=>{store=document.getElementById("store").value; zoneIndex=0;checked={};zone()};
}

function zone(){
  const z=CONFIG.zones[zoneIndex];
  const total=CONFIG.zones.length;
  app.innerHTML=`<main class="screen">
    <div class="header"><img src="logo.jpg"><div><div class="zone-title">${z.name}</div><div class="step">Step ${zoneIndex+1} of ${total}</div></div></div>
    <div class="progress"><div style="width:${((zoneIndex+1)/total)*100}%"></div></div>
    ${z.groups.map((g,gi)=>`<section class="group">
      <div class="group-head">Discard ${g.life} · ${dateMap()[g.life]}</div>
      <div class="group-note">${discardText(g.life)}</div>
      ${g.items.map((item,ii)=>{
        const id=`${zoneIndex}-${gi}-${ii}`;
        return `<label class="item"><input type="checkbox" data-id="${id}" ${checked[id]?"checked":""}><span>${item}</span></label>`;
      }).join("")}
    </section>`).join("")}
    <div id="warning" class="warning">Please check all items before continuing.</div>
    <div class="actions">
      <button class="secondary" id="back">${zoneIndex===0?"HOME":"BACK"}</button>
      <button class="primary" id="next" style="margin-top:0">${zoneIndex===total-1?"NEXT":"NEXT CHILLER"}</button>
    </div>
  </main>`;
  document.querySelectorAll('input[type=checkbox]').forEach(cb=>cb.onchange=e=>checked[e.target.dataset.id]=e.target.checked);
  document.getElementById("back").onclick=()=>{if(zoneIndex===0)home();else{zoneIndex--;zone()}};
  document.getElementById("next").onclick=()=>{
    const all=[...document.querySelectorAll('input[type=checkbox]')];
    if(!all.every(x=>x.checked)){document.getElementById("warning").style.display="block";return;}
    if(zoneIndex<total-1){zoneIndex++;zone()}else finalForm();
  };
}

function finalForm(){
  app.innerHTML=`<main class="screen">
    <div class="brand"><img class="logo" src="logo.jpg"><h1>Closing Inspection</h1></div>
    <section class="card">
      <label>Inspector Name</label><input id="name" type="text" placeholder="Enter name">
      <label style="margin-top:16px">Position</label>
      <select id="position">${CONFIG.positions.map(p=>`<option>${p}</option>`).join("")}</select>
      <label class="confirm"><input id="confirm" type="checkbox"><span>I confirm that all Shelf Life items have been inspected.</span></label>
    </section>
    <div id="warning" class="warning">Please enter your name and confirm the inspection.</div>
    <div class="actions"><button class="secondary" id="back">BACK</button><button class="primary" id="finish" style="margin-top:0">FINISH</button></div>
  </main>`;
  document.getElementById("back").onclick=()=>{zoneIndex=CONFIG.zones.length-1;zone()};
  document.getElementById("finish").onclick=()=>{
    inspector=document.getElementById("name").value.trim();
    position=document.getElementById("position").value;
    if(!inspector || !document.getElementById("confirm").checked){document.getElementById("warning").style.display="block";return;}
    success();
  };
}

function success(){
  const now=new Date();
  app.innerHTML=`<main class="screen success">
    <div class="check">✓</div><h2>Inspection Completed</h2>
    <div style="font-size:19px;font-weight:800">${CONFIG.tagline}</div><div style="font-size:24px;margin-top:6px">Thank You!</div>
    <div class="summary"><b>Store</b><br>${store}<br><br><b>Inspector</b><br>${inspector}<br><br><b>Position</b><br>${position}<br><br><b>Completed</b><br>${now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
    <button id="home">RETURN TO HOME</button>
  </main>`;
  document.getElementById("home").onclick=home;
}

fetch("config.json").then(r=>r.json()).then(c=>{
  CONFIG=c; store=localStorage.getItem("ek_store")||CONFIG.stores[0]; home();
});
if("serviceWorker" in navigator){navigator.serviceWorker.register("service-worker.js").catch(()=>{});}
