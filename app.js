/* GarageBlock — single-user home gym tracker.
   All data lives in localStorage under KEY. Export/import JSON for backup. */
"use strict";

/* ---------- embedded program data (from Fitness_Training_Nutrition_Tracker.xlsx) ---------- */
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const PHASES = {1:"Technique",2:"Technique",3:"Build",4:"Build",5:"Build",6:"Build",
  7:"Progress",8:"Progress",9:"Progress",10:"Progress",11:"Deload/Test",12:"Deload/Test"};
const PHASE_CLASS = {"Technique":"steel","Build":"acc","Progress":"green","Deload/Test":"violet","Maintain":"gold"};
const PHASE_TIP = {
  Technique:"Groove positions. Keep loads honest, own every rep.",
  Build:"Add small load or a rep when last week felt solid.",
  Progress:"Push top sets while keeping 1\u20133 reps in reserve.",
  "Deload/Test":"Cut volume, stay crisp, then test top sets fresh.",
  Maintain:"Program complete. Repeat the weekly template and keep building."
};

const TEMPLATE = [
{day:"Monday",session:"Strength A",ex:"Safety Squat Bar Squat",sets:4,reps:"5",intensity:"RPE 6\u20138",rest:"2\u20133 min",note:"Use box squat if knee prefers",lift:true},
{day:"Monday",session:"Strength A",ex:"Bench Press",sets:4,reps:"6",intensity:"1\u20133 RIR",rest:"2 min",note:"DB bench if shoulder prefers",lift:true},
{day:"Monday",session:"Strength A",ex:"Chest-Supported DB Row",sets:4,reps:"10",intensity:"1\u20133 RIR",rest:"90 sec",note:"Ring row acceptable",lift:true},
{day:"Monday",session:"Strength A",ex:"Romanian Deadlift",sets:3,reps:"8",intensity:"1\u20133 RIR",rest:"2 min",note:"Control eccentric",lift:true},
{day:"Monday",session:"Strength A",ex:"Ring Push-up",sets:2,reps:"AMRAP - 2",intensity:"Stop before failure",rest:"90 sec",note:"Elevate rings as needed",lift:true},
{day:"Monday",session:"Strength A",ex:"Plank",sets:3,reps:"45\u201360 sec",intensity:"Controlled",rest:"60 sec",note:"",lift:true},
{day:"Tuesday",session:"Cardio",ex:"Peloton Zone 2",sets:1,reps:"40\u201345 min",intensity:"Conversational",rest:"\u2014",note:"Easy enough to recover",lift:false},
{day:"Wednesday",session:"Softball",ex:"Softball + warm-up",sets:1,reps:"Game",intensity:"Moderate/Hard",rest:"\u2014",note:"Bands, hips, throwing progression",lift:false},
{day:"Thursday",session:"Strength B",ex:"Deadlift",sets:3,reps:"5",intensity:"RPE 6\u20138",rest:"2\u20133 min",note:"Alternate lighter week if fatigued",lift:true},
{day:"Thursday",session:"Strength B",ex:"Standing Overhead Press",sets:3,reps:"8",intensity:"1\u20133 RIR",rest:"2 min",note:"Landmine press if shoulder prefers",lift:true},
{day:"Thursday",session:"Strength B",ex:"Pull-up / Ring Row",sets:4,reps:"6\u201310",intensity:"1\u20133 RIR",rest:"90 sec",note:"Use band assistance",lift:true},
{day:"Thursday",session:"Strength B",ex:"SSB Split Squat",sets:3,reps:"8/leg",intensity:"Controlled",rest:"90 sec",note:"Bodyweight or DB if needed",lift:true},
{day:"Thursday",session:"Strength B",ex:"Landmine Press",sets:3,reps:"10/side",intensity:"1\u20133 RIR",rest:"90 sec",note:"",lift:true},
{day:"Thursday",session:"Strength B",ex:"Hanging Knee Raise",sets:3,reps:"10\u201312",intensity:"Controlled",rest:"60 sec",note:"Dead bug substitute",lift:true},
{day:"Friday",session:"Recovery",ex:"Easy Row + Mobility",sets:1,reps:"20 + 10 min",intensity:"Very easy",rest:"\u2014",note:"Hips, quads, chest, T-spine",lift:false},
{day:"Saturday",session:"Strength C",ex:"SSB Box Squat",sets:3,reps:"8",intensity:"RPE 6\u20137",rest:"2 min",note:"Keep it smooth",lift:true},
{day:"Saturday",session:"Strength C",ex:"Incline DB Bench",sets:3,reps:"10",intensity:"1\u20133 RIR",rest:"90 sec",note:"Neutral grip if preferred",lift:true},
{day:"Saturday",session:"Strength C",ex:"1-Arm DB Row",sets:3,reps:"10/side",intensity:"1\u20133 RIR",rest:"90 sec",note:"",lift:true},
{day:"Saturday",session:"Strength C",ex:"Farmer Carry",sets:4,reps:"30\u201345 sec",intensity:"Brisk",rest:"60 sec",note:"",lift:true},
{day:"Saturday",session:"Strength C",ex:"Medicine Ball Slam",sets:3,reps:"10\u201315",intensity:"Explosive",rest:"60 sec",note:"Stop if back feels off",lift:true},
{day:"Saturday",session:"Strength C",ex:"Band Face Pull",sets:3,reps:"15",intensity:"Controlled",rest:"60 sec",note:"",lift:true},
{day:"Sunday",session:"Recovery",ex:"Neighborhood Walk",sets:1,reps:"45\u201360 min",intensity:"Easy",rest:"\u2014",note:"Optional mobility",lift:false}
];

const LIBRARY = [
{movement:"Squat",primary:"Safety Squat Bar Squat",alt:"SSB Box Squat / Goblet Squat",equipment:"SSB, rack",cue:"Brace, knees track over toes",when:"Use box if knee comfort improves"},
{movement:"Hinge",primary:"Deadlift",alt:"Romanian Deadlift",equipment:"Barbell",cue:"Push floor away, neutral spine",when:"Use RDL if recovery is poor"},
{movement:"Horizontal Push",primary:"Bench Press",alt:"DB Bench / Ring Push-up",equipment:"Bench, barbell, DBs",cue:"Shoulder blades set",when:"Use neutral grip if shoulder irritated"},
{movement:"Vertical Push",primary:"Standing Press",alt:"Landmine Press",equipment:"Barbell / landmine",cue:"Ribs down",when:"Use landmine for shoulder comfort"},
{movement:"Horizontal Pull",primary:"Chest-Supported DB Row",alt:"Ring Row",equipment:"DBs / rings",cue:"Pull elbows toward hips",when:"Rings for quick setup"},
{movement:"Vertical Pull",primary:"Pull-up",alt:"Band-Assisted Pull-up / Ring Row",equipment:"Rack, bands, rings",cue:"Full control",when:"Use assistance to stay 1\u20133 RIR"},
{movement:"Single Leg",primary:"SSB Split Squat",alt:"DB Split Squat / Reverse Lunge",equipment:"SSB / DBs",cue:"Stable front foot",when:"Use reverse lunge if knees prefer"},
{movement:"Core",primary:"Hanging Knee Raise",alt:"Dead Bug / Plank",equipment:"Pull-up bar / floor",cue:"Avoid swinging",when:"Use floor version if back fatigued"},
{movement:"Carry",primary:"Farmer Carry",alt:"Suitcase Carry",equipment:"Dumbbells",cue:"Tall posture",when:"Use one side for anti-rotation"},
{movement:"Power",primary:"Medicine Ball Slam",alt:"Band Face Pull finisher",equipment:"Med ball / bands",cue:"Explosive, reset each rep",when:"Skip if back feels off"}
];

const MEALS = [
{meal:"Breakfast",protein:"Greek yogurt + whey",carb:"Oats / fruit",produce:"Berries",fat:"Optional chia",grams:"45\u201355 g"},
{meal:"Breakfast",protein:"Eggs + egg whites",carb:"Toast / potatoes",produce:"Spinach / peppers",fat:"Light cheese",grams:"40\u201350 g"},
{meal:"Lunch",protein:"Chicken breast",carb:"Rice / potatoes",produce:"Broccoli / mixed veg",fat:"Salsa / light sauce",grams:"45\u201360 g"},
{meal:"Lunch",protein:"Lean ground turkey",carb:"Rice / tortillas",produce:"Peppers / lettuce",fat:"Avocado portion",grams:"40\u201355 g"},
{meal:"Dinner",protein:"Lean steak",carb:"Potatoes / rice",produce:"Green vegetables",fat:"Measured oil",grams:"45\u201355 g"},
{meal:"Dinner",protein:"Fish or chicken",carb:"Rice / potatoes",produce:"Vegetables",fat:"Light sauce",grams:"40\u201355 g"},
{meal:"Snack",protein:"Cottage cheese",carb:"Fruit",produce:"\u2014",fat:"\u2014",grams:"25\u201330 g"},
{meal:"Snack",protein:"Protein shake",carb:"Banana / rice cakes",produce:"\u2014",fat:"\u2014",grams:"25\u201335 g"}
];

const EQUIPMENT = ["Safety Squat Bar","Power Rack","Olympic Barbell","Adjustable Bench","Dumbbells","Bumper Plates",
"Gymnastic Rings","Resistance Bands","Landmine","Peloton","Rower","Plyo Box","Medicine Ball","Pull-up Bar","Open Floor Space"];

/* ---------- storage ---------- */
const KEY = "garageblock.v1";
const DEFAULTS = {
  v:1,
  settings:{startDate:"2026-07-20",startWeight:190,goalWeight:170,cal:2150,protein:185,
    steps:8000,water:90,lifts:3,cardio:2,units:"lb",
    bars:[{name:"Ohio Bar",w:45},{name:"SSB",w:70},{name:"Curl Bar",w:30}],
    plateInv:{"45":4,"35":2,"25":2,"10":4,"5":2,"2.5":2},barPref:{},
    autoSync:false,mode:"rolling"},
  work:{},       // "week-idx" -> {date, sets:[{w,r}...], done, rpe, note}
  extras:{},     // "YYYY-MM-DD" -> [{ex, sets:[{w,r}], note}]
  skips:{},      // "week|Day" -> true (session waved off; queue moves on)
  nut:{},        // "YYYY-MM-DD" -> {weight,waist,cal,protein,steps,water,sleep,hunger,note}
  meta:{created:Date.now(),lastExport:null}
};
let S;
function load(){
  try{
    const raw = localStorage.getItem(KEY);
    S = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULTS));
    // fill any missing keys from defaults (schema drift safety)
    for(const k of Object.keys(DEFAULTS)) if(S[k]===undefined) S[k]=JSON.parse(JSON.stringify(DEFAULTS[k]));
    for(const k of Object.keys(DEFAULTS.settings)) if(S.settings[k]===undefined) S.settings[k]=JSON.parse(JSON.stringify(DEFAULTS.settings[k]));
    // migrate v1 plate-math settings (typed string + two bar fields) to chips + bar list
    if(typeof S.settings.plates==="string"){
      const inv={};
      S.settings.plates.split(",").forEach(part=>{
        const m=part.trim().match(/([\d.]+)\s*[x\u00d7]\s*(\d+)/i);
        if(m) inv[m[1]]=+m[2]*2; // old setting counted per side; chips count total plates
      });
      if(Object.keys(inv).length) S.settings.plateInv=inv;
      if(typeof S.settings.barWeight==="number"&&S.settings.barWeight!==45) S.settings.bars[0].w=S.settings.barWeight;
      if(typeof S.settings.ssbWeight==="number"&&S.settings.ssbWeight!==60) S.settings.bars[1].w=S.settings.ssbWeight;
      delete S.settings.plates; delete S.settings.barWeight; delete S.settings.ssbWeight;
    }
  }catch(e){ S = JSON.parse(JSON.stringify(DEFAULTS)); }
}
function save(){
  S.meta.updated = Date.now();
  try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ toast("Could not save. Storage may be full."); }
  if(S.settings.autoSync) queueSync();
}

/* ---------- date + math helpers ---------- */
function iso(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function fromISO(s){ const p=s.split("-"); return new Date(+p[0], +p[1]-1, +p[2]); }
function todayISO(){ return iso(new Date()); }
function addDays(s,n){ const d=fromISO(s); d.setDate(d.getDate()+n); return iso(d); }
function fmtShort(s){ const d=fromISO(s); return d.toLocaleDateString(undefined,{month:"short",day:"numeric"}); }
function fmtDay(s){ const d=fromISO(s); return d.toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"}); }
function dayName(s){ const d=fromISO(s); return DAYS[(d.getDay()+6)%7]; }
function weekOf(dateISO){
  const start = fromISO(S.settings.startDate);
  const d = fromISO(dateISO);
  const diff = Math.floor((d - start)/(864e5));
  return Math.floor(diff/7)+1; // can be <1 (pre-program) or >12 (maintain)
}
function dateFor(week, day){ // ISO date of a given program week + day name
  const start = fromISO(S.settings.startDate);
  const di = DAYS.indexOf(day);
  const startDow = (start.getDay()+6)%7; // 0=Mon
  const d = new Date(start);
  d.setDate(d.getDate() - startDow + (week-1)*7 + di);
  return iso(d);
}
function phaseOf(week){ return week<1 ? "Technique" : (PHASES[week] || "Maintain"); }
/* rolling-schedule queue */
function slotKey(w,day){ return w+"|"+day; }
function slotComplete(w,day){
  if(S.skips[slotKey(w,day)]) return true;
  const items=sessionItems(day);
  const strength=items.filter(t=>t.lift);
  const list=strength.length?strength:items;
  return list.every(t=>{ const r=S.work[w+"-"+t.idx]; return r&&r.done; });
}
function nextSlot(){
  for(let w=1;w<=52;w++){
    for(const d of DAYS){ if(!slotComplete(w,d)) return {week:w, day:d}; }
  }
  return {week:52, day:"Sunday"};
}
function skipSlot(w,day){ S.skips[slotKey(w,day)]=true; save(); render(); toast("Skipped. Rolling to the next session."); }
function unskipSlot(w,day){ delete S.skips[slotKey(w,day)]; save(); render(); }
function e1rm(w,r){ if(!w||!r) return 0; if(r===1) return w; return Math.round(w*(1+r/30)); }
function esc(x){ return String(x==null?"":x).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function num(v){ const n=parseFloat(v); return isNaN(n)?null:n; }

/* rest string -> seconds (uses the upper bound of a range) */
function restSeconds(str){
  if(!str || str==="\u2014") return 0;
  const m = String(str).match(/(\d+)\s*[\u2013-]\s*(\d+)\s*(min|sec)|(\d+)\s*(min|sec)/i);
  if(!m) return 0;
  if(m[2]) return (+m[2]) * (m[3].toLowerCase()==="min"?60:1);
  return (+m[4]) * (m[5].toLowerCase()==="min"?60:1);
}

/* ---------- plate math ---------- */
const PLATE_DENOMS=[55,45,35,25,15,10,5,2.5,1.25];
function plateInventory(){
  // chips count TOTAL plates owned; a barbell loads in pairs, so usable per side = floor(total/2)
  const inv=S.settings.plateInv||{};
  return Object.keys(inv).map(p=>({p:+p,n:Math.floor((inv[p]||0)/2)})).filter(o=>o.n>0).sort((a,b)=>b.p-a.p);
}
function platesTap(p){ const inv=S.settings.plateInv; inv[p]=Math.min(24,(inv[p]||0)+1); save(); render(); }
function platesMinus(p){ const inv=S.settings.plateInv; inv[p]=Math.max(0,(inv[p]||0)-1); if(!inv[p]) delete inv[p]; save(); render(); }
const STRAIGHT_BAR = ["Bench Press","Deadlift","Romanian Deadlift","Standing Overhead Press"];
function defaultBarIdx(exName){
  const bars=S.settings.bars;
  if(/SSB|Safety Squat Bar/i.test(exName)){ const i=bars.findIndex(b=>/ssb|safety/i.test(b.name)); return i>=0?i:null; }
  if(STRAIGHT_BAR.includes(exName)){ const i=bars.findIndex(b=>!/ssb|safety|curl/i.test(b.name)); return i>=0?i:null; }
  return null; // dumbbell / landmine / bodyweight
}
function barIdxFor(exName){
  const pref=S.settings.barPref||{};
  if(pref[exName]!==undefined) return pref[exName]; // may be -1 = no bar
  return defaultBarIdx(exName);
}
function barWeightFor(exName){ // kept for tests/back-compat: returns weight or null
  const i=barIdxFor(exName);
  return (i==null||i<0)?null:+S.settings.bars[i].w;
}
let logBarW=null, logBarEx=null; // bar weight + exercise for the open log modal
function setLogBar(i){
  S.settings.barPref[logBarEx]=i; save();
  logBarW = i<0?null:+S.settings.bars[i].w;
  // repaint picker buttons + hint without rebuilding the modal (keeps typed values)
  document.querySelectorAll("#bar-seg button").forEach((b,bi)=>b.classList.toggle("on",(+b.dataset.i)===i));
  const hint=document.getElementById("plate-hint");
  if(hint){ if(logBarW==null){ hint.textContent=""; } else { for(let k=0;k<12;k++){ const f=document.getElementById("lg-w"+k); if(f&&f.value){ plateHint(k); return; } } hint.textContent=""; } }
}
function plateMath(target, bar){
  if(!target || target<bar) return null;
  let used=[], left=(target-bar)/2;
  for(const {p,n} of plateInventory()){
    let c=0;
    while(c<n && left>=p-1e-9){ left-=p; c++; }
    if(c) used.push(c>1? c+"\u00d7"+p : String(p));
  }
  const loaded=target-2*left;
  return {exact:Math.abs(left)<1e-9, perSide:used.join(" + ")||"bar only", loaded:Math.round(loaded*10)/10};
}
function plateHint(i){
  const el=document.getElementById("plate-hint");
  if(!el || logBarW==null) return;
  const w=num(document.getElementById("lg-w"+i).value);
  if(w==null){ el.textContent=""; return; }
  const pm=plateMath(w, logBarW);
  if(!pm){ el.textContent = "Below bar weight ("+logBarW+" lb)"; return; }
  el.innerHTML = pm.exact
    ? `${w} lb on a ${logBarW} lb bar \u00b7 per side: <b>${esc(pm.perSide)}</b>`
    : `${w} lb not loadable with your plates \u00b7 closest ${pm.loaded} lb \u00b7 per side: <b>${esc(pm.perSide)}</b>`;
}

/* all logged performances of an exercise, newest first: [{date, sets:[{w,r}]}] */
function historyFor(ex){
  const out=[];
  for(const k of Object.keys(S.work)){
    const idx = +k.split("-")[1];
    const t = TEMPLATE[idx];
    if(!t || t.ex!==ex) continue;
    const rec = S.work[k];
    if(rec && rec.sets && rec.sets.some(s=>s&&s.w!=null)) out.push({date:rec.date||dateFor(+k.split("-")[0],t.day), sets:rec.sets.filter(s=>s&&s.w!=null)});
  }
  for(const d of Object.keys(S.extras)){
    for(const e of S.extras[d]){
      if(e.ex===ex && e.sets && e.sets.some(s=>s&&s.w!=null)) out.push({date:d, sets:e.sets.filter(s=>s&&s.w!=null)});
    }
  }
  out.sort((a,b)=> a.date<b.date?1:-1);
  return out;
}
function bestE1RM(ex, beforeDate){
  let best=0;
  for(const h of historyFor(ex)){
    if(beforeDate && h.date>=beforeDate) continue;
    for(const s of h.sets){ const v=e1rm(s.w,s.r); if(v>best) best=v; }
  }
  return best;
}

/* ---------- UI plumbing ---------- */
let VIEW="today";
let planWeek=null;            // selected week in Plan view
let todayCtx=null;            // {week, day, date} override when opened from Plan
let liftChartEx="Safety Squat Bar Squat";

function go(v){
  VIEW=v;
  document.querySelectorAll(".view").forEach(el=>el.classList.remove("on"));
  document.getElementById("view-"+v).classList.add("on");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("on", b.dataset.v===v));
  if(v!=="today") todayCtx=null;
  render();
  window.scrollTo(0,0);
}
function render(){
  renderHeader();
  if(VIEW==="today") renderToday();
  else if(VIEW==="plan") renderPlan();
  else if(VIEW==="nutrition") renderNutrition();
  else if(VIEW==="progress") renderProgress();
  else renderMore();
  renderBackupBanner();
}
function renderHeader(){
  const w = weekOf(todayISO());
  const ph = phaseOf(w);
  const label = w<1 ? "Starts "+fmtShort(S.settings.startDate) : (w>12 ? "Maintain" : "Week "+w+" \u00b7 "+ph);
  document.getElementById("hd-sub").textContent = label;
}
let toastT;
function toast(msg){
  const el=document.getElementById("toast");
  el.textContent=msg; el.classList.add("show");
  clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove("show"),2200);
}
function openModal(html){ document.getElementById("modal").innerHTML=html; document.getElementById("modal-bg").classList.add("show"); }
function closeModal(){ document.getElementById("modal-bg").classList.remove("show"); }

function renderBackupBanner(){
  const hasData = Object.keys(S.work).length + Object.keys(S.nut).length + Object.keys(S.extras).length > 5;
  const stale = !S.meta.lastExport || (Date.now()-S.meta.lastExport) > 14*864e5;
  document.getElementById("backup-banner").style.display = (hasData && stale) ? "flex" : "none";
}

/* ---------- TODAY ---------- */
function sessionItems(day){ return TEMPLATE.map((t,i)=>({...t, idx:i})).filter(t=>t.day===day); }

function renderToday(){
  const el = document.getElementById("view-today");
  const rolling = S.settings.mode==="rolling" && !todayCtx && weekOf(todayISO())>=1;
  let week, day, date, slot=null;
  if(todayCtx){ week=todayCtx.week; day=todayCtx.day; date=todayCtx.date; }
  else if(rolling){ slot=nextSlot(); week=slot.week; day=slot.day; date=todayISO(); }
  else { date=todayISO(); week=weekOf(date); day=dayName(date); }
  const ph = phaseOf(week);
  const items = sessionItems(day);
  const sessName = items.length ? items[0].session : "Rest";
  const wkLabel = week<1 ? "Pre-program" : (week>12 ? "Maintain" : "Week "+week);

  let h = "";
  if(todayCtx){
    const skipped = S.skips[slotKey(week,day)];
    h += `<div class="banner" style="background:#1c2733;border-color:#33506b;color:var(--steel)">
      <span class="grow">Viewing ${esc(wkLabel)} \u00b7 ${esc(day)}${skipped?" \u00b7 skipped":""}</span>
      ${skipped?`<button class="btn btn-sm" onclick="unskipSlot(${week},'${day}')">Unskip</button>`:""}
      <button class="btn btn-sm" onclick="todayCtx=null;render()">Back</button></div>`;
  }
  let subline;
  if(rolling){
    const sched = dateFor(week, day);
    const behind = sched < todayISO();
    subline = `${esc(wkLabel)} \u00b7 ${esc(day)}${behind?` <span class="chip gold" style="font-size:11px">catching up</span>`:""} \u00b7 <span class="chip ${PHASE_CLASS[ph]||""}">${esc(ph)}</span>`;
  } else {
    subline = `${fmtDay(date)} \u00b7 <span class="chip ${PHASE_CLASS[ph]||""}">${esc(ph)}</span>`;
  }
  h += `<div class="sess-head">
    <div>${rolling?'<div class="faint small" style="letter-spacing:.08em;text-transform:uppercase;font-weight:600">Next up</div>':""}
      <div class="big disp">${esc(sessName)}</div>
      <div class="muted small">${subline}</div></div>
    ${week>=1 ? sessionDoneBadge(week, items) : ""}
  </div>`;
  if(PHASE_TIP[ph]) h += `<div class="faint small" style="margin:-4px 2px 12px">${esc(PHASE_TIP[ph])}</div>`;

  if(week<1){
    h += `<div class="card"><h2>Program starts ${fmtShort(S.settings.startDate)}</h2>
      <p class="muted small">You can preview any session from the Plan tab, adjust targets in More \u2192 Settings, or start logging nutrition now under Fuel.</p></div>`;
  }

  for(const t of items){
    h += exerciseCard(week, t, date);
  }
  if(rolling){
    h += `<div class="row" style="margin:2px 0 12px">
      <button class="btn ghost btn-sm" style="color:var(--faint)" onclick="if(confirm('Skip this session? The queue moves to the next one. You can unskip it later from Plan.'))skipSlot(${week},'${day}')">Skip this session \u2192</button>
    </div>`;
  }

  // extras logged on this date
  const ext = S.extras[date]||[];
  ext.forEach((e,i)=>{ h += extraCard(date, e, i); });
  h += `<button class="btn ghost" style="width:100%;border-style:dashed" onclick="addExtra('${date}')">+ Add extra exercise</button>`;
  el.innerHTML = h;
}

function sessionDoneBadge(week, items){
  const strength = items.filter(t=>t.lift);
  const list = strength.length?strength:items;
  const done = list.filter(t=>{ const r=S.work[week+"-"+t.idx]; return r&&r.done; }).length;
  if(!list.length) return "";
  const cls = done===list.length ? "green":"";
  return `<span class="chip ${cls}">${done}/${list.length} done</span>`;
}

function exerciseCard(week, t, date){
  const k = week+"-"+t.idx;
  const rec = S.work[k];
  const done = rec && rec.done;
  const rest = restSeconds(t.rest);
  const last = historyFor(t.ex).find(hh=>hh.date < date);
  const prBefore = bestE1RM(t.ex, date);
  let prNow = false;
  if(rec && rec.sets) for(const s of rec.sets){ if(s&&s.w!=null&&prBefore>0&&e1rm(s.w,s.r)>prBefore){ prNow=true; break; } }

  let pills="";
  if(t.lift){
    for(let i=0;i<t.sets;i++){
      const s = rec && rec.sets ? rec.sets[i] : null;
      pills += s && s.w!=null
        ? `<div class="pill filled"><span class="lab">SET ${i+1}</span>${esc(s.w)}\u00d7${esc(s.r!=null?s.r:"?")}</div>`
        : `<div class="pill"><span class="lab">SET ${i+1}</span>\u2013</div>`;
    }
  }
  const lastHtml = last ? `<span class="lasttime">Last: ${last.sets.map(s=>s.w+"\u00d7"+s.r).join(", ")} (${fmtShort(last.date)})</span>` : "";
  return `<div class="ex-card ${done?"done":""}">
    <div class="ex-top">
      <div class="grow">
        <div class="ex-name">${esc(t.ex)} ${prNow?'<span class="pr-flag">\u2605 PR</span>':""}</div>
        <div class="ex-rx">${t.sets} \u00d7 ${esc(t.reps)} \u00b7 ${esc(t.intensity)}${rest?` \u00b7 rest ${esc(t.rest)}`:""}</div>
      </div>
      ${done?'<span class="chip green">\u2713</span>':""}
    </div>
    ${t.lift?`<div class="setpills" role="button" tabindex="0" onclick="openLog(${week},${t.idx},'${date}')" onkeydown="if(event.key==='Enter')openLog(${week},${t.idx},'${date}')">${pills}</div>`:""}
    <div class="ex-actions">
      <button class="btn btn-sm ${done?"":"primary"}" onclick="openLog(${week},${t.idx},'${date}')">${t.lift?(done?"Edit sets":"Log sets"):(done?"Edit":"Mark done")}</button>
      ${rest?`<button class="btn btn-sm" onclick="timerStart(${rest})">\u23f1 ${esc(t.rest)}</button>`:""}
      ${lastHtml}
    </div>
    ${t.note?`<div class="ex-note">${esc(t.note)}</div>`:""}
  </div>`;
}

function extraCard(date, e, i){
  const setsTxt = (e.sets||[]).filter(s=>s&&s.w!=null).map(s=>s.w+"\u00d7"+s.r).join(", ");
  return `<div class="ex-card done">
    <div class="ex-top"><div class="grow">
      <div class="ex-name">${esc(e.ex)} <span class="chip gold" style="font-size:11px">extra</span></div>
      <div class="ex-rx">${esc(setsTxt||e.note||"logged")}</div></div>
      <button class="iconbtn" aria-label="Delete extra" onclick="delExtra('${date}',${i})">\u2715</button>
    </div></div>`;
}
function addExtra(date){
  openModal(`<h2>Extra exercise</h2>
    <div class="nfield" style="margin-bottom:10px"><label>Exercise name</label><input id="xx-name" placeholder="e.g. Curls, Rower intervals"></div>
    <div class="nfield" style="margin-bottom:10px"><label>Sets (weight \u00d7 reps, one per line \u2014 or leave blank)</label>
      <textarea id="xx-sets" rows="3" placeholder="45x12&#10;50x10"></textarea></div>
    <div class="nfield" style="margin-bottom:14px"><label>Note</label><input id="xx-note"></div>
    <div class="row"><button class="btn primary grow" onclick="saveExtra('${date}')">Save</button>
    <button class="btn" onclick="closeModal()">Cancel</button></div>`);
}
function saveExtra(date){
  const name = document.getElementById("xx-name").value.trim();
  if(!name){ toast("Name the exercise first."); return; }
  const sets = document.getElementById("xx-sets").value.split(/\n+/).map(l=>{
    const m=l.match(/([\d.]+)\s*[x\u00d7]\s*([\d.]+)/i); return m?{w:+m[1],r:+m[2]}:null;
  }).filter(Boolean);
  const note = document.getElementById("xx-note").value.trim();
  (S.extras[date] = S.extras[date]||[]).push({ex:name, sets, note});
  save(); closeModal(); render(); toast("Extra logged.");
}
function delExtra(date,i){
  S.extras[date].splice(i,1);
  if(!S.extras[date].length) delete S.extras[date];
  save(); render();
}

/* set logging modal */
function openLog(week, idx, date){
  const t = TEMPLATE[idx];
  const k = week+"-"+idx;
  const rec = S.work[k] || {date, sets:[], done:false, rpe:"", note:""};
  const last = historyFor(t.ex).find(hh=>hh.date < date);

  if(!t.lift){
    openModal(`<h2>${esc(t.ex)}</h2>
      <p class="muted small" style="margin-bottom:10px">${esc(t.reps)} \u00b7 ${esc(t.intensity)}</p>
      <div class="nfield" style="margin-bottom:10px"><label>Output / duration (optional)</label>
        <input id="lg-out" value="${esc(rec.note||"")}" placeholder="e.g. 42 min, 180W avg"></div>
      <div class="row">
        <button class="btn primary grow" onclick="saveSimple(${week},${idx},'${date}')">Mark complete</button>
        ${rec.done?`<button class="btn danger" onclick="clearLog(${week},${idx})">Clear</button>`:""}
        <button class="btn" onclick="closeModal()">Cancel</button></div>`);
    return;
  }

  let rows="";
  for(let i=0;i<t.sets;i++){
    const s = rec.sets[i]||{};
    const lw = last && last.sets[i] ? last.sets[i].w : (last && last.sets[0] ? last.sets[0].w : "");
    const lr = last && last.sets[i] ? last.sets[i].r : "";
    rows += `<div class="setgrid">
      <div class="n">${i+1}</div>
      <input inputmode="decimal" id="lg-w${i}" placeholder="${lw!==""?lw+" lb":"weight"}" value="${s.w!=null?s.w:""}" aria-label="Set ${i+1} weight" oninput="plateHint(${i})" onfocus="plateHint(${i})">
      <input inputmode="numeric" id="lg-r${i}" placeholder="${lr!==""?lr+" reps":"reps"}" value="${s.r!=null?s.r:""}" aria-label="Set ${i+1} reps">
      <button class="iconbtn" title="Copy previous set" onclick="copySet(${i})">\u2193</button>
    </div>`;
  }
  logBarEx = t.ex;
  logBarW = barWeightFor(t.ex);
  const showBarPicker = defaultBarIdx(t.ex)!=null || (S.settings.barPref||{})[t.ex]!==undefined;
  const barSeg = showBarPicker ? `<div class="seg" id="bar-seg" style="margin:0 0 8px">
      ${S.settings.bars.map((b,i)=>`<button data-i="${i}" class="${barIdxFor(t.ex)===i?"on":""}" onclick="setLogBar(${i})">${esc(b.name)} ${b.w}</button>`).join("")}
      <button data-i="-1" class="${barIdxFor(t.ex)===-1?"on":""}" onclick="setLogBar(-1)">No bar</button>
    </div>` : "";
  openModal(`<h2>${esc(t.ex)}</h2>
    <p class="muted small" style="margin-bottom:12px">${t.sets} \u00d7 ${esc(t.reps)} \u00b7 ${esc(t.intensity)}
      ${last?`<br>Last time: ${last.sets.map(s=>s.w+"\u00d7"+s.r).join(", ")} (${fmtShort(last.date)})`:""}</p>
    ${rows}
    ${barSeg}
    ${showBarPicker?`<div id="plate-hint" class="small" style="min-height:18px;color:var(--steel);margin:2px 0 4px"></div>`:""}
    <div class="row" style="margin:8px 0 10px">
      <div class="nfield grow"><label>RPE (optional)</label><input inputmode="decimal" id="lg-rpe" value="${esc(rec.rpe||"")}" placeholder="6\u20138"></div>
      <div class="nfield" style="flex:2"><label>Note</label><input id="lg-note" value="${esc(rec.note||"")}"></div>
    </div>
    <div class="row">
      <button class="btn primary grow" onclick="saveLog(${week},${idx},'${date}',${t.sets})">Save${restSeconds(t.rest)?" + rest":""}</button>
      ${rec.sets.length?`<button class="btn danger" onclick="clearLog(${week},${idx})">Clear</button>`:""}
      <button class="btn" onclick="closeModal()">Cancel</button>
    </div>`);
  setTimeout(()=>{ const f=document.getElementById("lg-w0"); if(f){ if(!f.value) f.focus(); if(f.value) plateHint(0); } }, 60);
}
function copySet(i){
  if(i===0) return;
  const pw=document.getElementById("lg-w"+(i-1)).value, pr=document.getElementById("lg-r"+(i-1)).value;
  document.getElementById("lg-w"+i).value=pw; document.getElementById("lg-r"+i).value=pr;
}
function saveSimple(week, idx, date){
  const k=week+"-"+idx;
  S.work[k]={date, sets:[], done:true, rpe:"", note:document.getElementById("lg-out").value.trim()};
  save(); closeModal(); render(); toast("Session marked complete.");
}
function saveLog(week, idx, date, nSets){
  const t=TEMPLATE[idx], k=week+"-"+idx;
  const sets=[];
  for(let i=0;i<nSets;i++){
    const w=num(document.getElementById("lg-w"+i).value);
    const r=num(document.getElementById("lg-r"+i).value);
    sets.push(w!=null?{w,r:(r!=null?r:null)}:null);
  }
  const any = sets.some(s=>s);
  const prBefore = bestE1RM(t.ex, date);
  S.work[k]={date, sets, done:any, rpe:document.getElementById("lg-rpe").value.trim(), note:document.getElementById("lg-note").value.trim()};
  save(); closeModal(); render();
  let pr=false;
  for(const s of sets){ if(s&&s.w!=null&&s.r&&prBefore>0&&e1rm(s.w,s.r)>prBefore){pr=true;break;} }
  if(pr) toast("\u2605 New estimated 1RM PR on "+t.ex+"!");
  const rest=restSeconds(t.rest);
  if(any && rest) timerStart(rest);
}
function clearLog(week, idx){
  delete S.work[week+"-"+idx];
  save(); closeModal(); render();
}

/* ---------- rest timer ---------- */
let timerEnd=0, timerTotal=0, timerInt=null, audioCtx=null;
function timerStart(sec){
  timerTotal=sec; timerEnd=Date.now()+sec*1000;
  document.getElementById("timerbar").classList.add("show");
  if(timerInt) clearInterval(timerInt);
  timerInt=setInterval(timerTick,200); timerTick();
}
function timerAdd(sec){ timerEnd+=sec*1000; timerTotal+=sec; }
function timerStop(){
  clearInterval(timerInt); timerInt=null;
  document.getElementById("timerbar").classList.remove("show");
}
function timerTick(){
  const left=Math.max(0, Math.round((timerEnd-Date.now())/1000));
  document.getElementById("timer-t").textContent=Math.floor(left/60)+":"+String(left%60).padStart(2,"0");
  document.getElementById("timer-fill").style.width=(timerTotal?100*left/timerTotal:0)+"%";
  if(left<=0){ timerDone(); }
}
function timerDone(){
  timerStop(); beep();
  if(navigator.vibrate) navigator.vibrate([180,90,180]);
  toast("Rest over. Next set.");
}
function beep(){
  try{
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    const now=audioCtx.currentTime;
    [0,0.22].forEach(off=>{
      const o=audioCtx.createOscillator(), g=audioCtx.createGain();
      o.type="square"; o.frequency.value=880;
      g.gain.setValueAtTime(0.0001,now+off);
      g.gain.exponentialRampToValueAtTime(0.25,now+off+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,now+off+0.18);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(now+off); o.stop(now+off+0.2);
    });
  }catch(e){}
}

/* ---------- PLAN ---------- */
function renderPlan(){
  const el=document.getElementById("view-plan");
  const nowW = Math.min(Math.max(weekOf(todayISO()),1),12);
  if(planWeek==null) planWeek=nowW;
  let bar="";
  for(let w=1;w<=12;w++){
    const ph=PHASES[w];
    bar+=`<button class="wk ${w===planWeek?"on":""} ${w===nowW?"now":""}" onclick="planWeek=${w};render()">
      <span class="n">${w}</span><span class="p">${ph.split("/")[0]}</span></button>`;
  }
  const ph=PHASES[planWeek];
  let days="";
  for(const d of DAYS){
    const items=sessionItems(d);
    const strength=items.filter(t=>t.lift);
    const list=strength.length?strength:items;
    const done=list.filter(t=>{const r=S.work[planWeek+"-"+t.idx];return r&&r.done;}).length;
    const skipped=S.skips[slotKey(planWeek,d)];
    const dot = skipped&&done<list.length ? "skip" : (done===0?"":(done===list.length?"full":"part"));
    const dISO=dateFor(planWeek,d);
    days+=`<div class="dayrow" role="button" tabindex="0"
      onclick="todayCtx={week:${planWeek},day:'${d}',date:'${dISO}'};go('today')"
      onkeydown="if(event.key==='Enter'){todayCtx={week:${planWeek},day:'${d}',date:'${dISO}'};go('today')}">
      <span class="dn">${d.slice(0,3)}</span>
      <span class="dot ${dot}"></span>
      <span class="grow">${esc(items[0].session)} <span class="faint small">\u00b7 ${items.length} item${items.length>1?"s":""}</span></span>
      <span class="faint small">${fmtShort(dISO)}</span>
      <span class="faint">\u203a</span></div>`;
  }
  // 12-week completion strip
  let comp="";
  for(let w=1;w<=12;w++){
    const list=TEMPLATE.map((t,i)=>({t,i})).filter(x=>x.t.lift);
    const done=list.filter(x=>{const r=S.work[w+"-"+x.i];return r&&r.done;}).length;
    const pct=Math.round(100*done/list.length);
    comp+=`<div style="flex:1;height:26px;border-radius:5px;background:var(--panel2);position:relative;overflow:hidden" title="Week ${w}: ${pct}%">
      <i style="position:absolute;left:0;bottom:0;top:0;width:${pct}%;background:${pct===100?"var(--green)":"var(--accent-dim)"}"></i></div>`;
  }
  el.innerHTML=`
    <div class="wkbar">${bar}</div>
    <div class="card">
      <div class="row" style="justify-content:space-between;margin-bottom:6px">
        <h2 style="margin:0">Week ${planWeek}</h2>
        <span class="chip ${PHASE_CLASS[ph]}">${esc(ph)}</span>
      </div>
      <div class="faint small" style="margin-bottom:6px">${esc(PHASE_TIP[ph])}</div>
      ${days}
    </div>
    <div class="card">
      <h3 style="margin-bottom:8px">Strength sessions completed by week</h3>
      <div class="row" style="gap:4px">${comp}</div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:8px">Phase map</h3>
      <div class="small muted">
        Weeks 1\u20132 <span class="chip steel">Technique</span> \u00b7
        Weeks 3\u20136 <span class="chip acc">Build</span> \u00b7
        Weeks 7\u201310 <span class="chip green">Progress</span> \u00b7
        Weeks 11\u201312 <span class="chip violet">Deload/Test</span>
      </div>
      <p class="faint small" style="margin-top:8px">Same weekly template all 12 weeks: 3 strength days (A/B/C), Zone 2 cardio, softball, two recovery days. Progress by adding small load or reps inside the rep targets while keeping 1\u20133 reps in reserve.</p>
    </div>`;
}

/* ---------- NUTRITION ---------- */
let nutDate = todayISO();
const NUT_FIELDS=[
  {k:"weight",label:"Weight (lb)",step:"0.1"},
  {k:"waist",label:"Waist (in)",step:"0.1"},
  {k:"cal",label:"Calories",target:"cal"},
  {k:"protein",label:"Protein (g)",target:"protein"},
  {k:"steps",label:"Steps",target:"steps"},
  {k:"water",label:"Water (oz)",target:"water"},
  {k:"sleep",label:"Sleep (hrs)",step:"0.25"},
  {k:"hunger",label:"Hunger (1\u20135)"}
];
function renderNutrition(){
  const el=document.getElementById("view-nutrition");
  const rec=S.nut[nutDate]||{};
  let fields="";
  for(const f of NUT_FIELDS){
    const v=rec[f.k]!=null?rec[f.k]:"";
    let bar="";
    if(f.target){
      const tgt=S.settings[f.target];
      const p=v?Math.min(100,100*v/tgt):0;
      const overCal=f.k==="cal"&&v>tgt;
      const hit=(f.k!=="cal"&&v>=tgt)||(f.k==="cal"&&v>0&&v<=tgt);
      bar=`<div class="tbar"><i class="${overCal?"over":(hit?"hit":"")}" style="width:${p}%"></i></div>
        <div class="faint" style="font-size:10.5px;margin-top:2px">target ${tgt}</div>`;
    }
    fields+=`<div class="nfield"><label>${f.label}</label>
      <input inputmode="decimal" ${f.step?`step="${f.step}"`:""} value="${v}" onchange="nutSet('${f.k}',this.value)">${bar}</div>`;
  }
  // week summary (Mon-Sun containing nutDate)
  const dow=(fromISO(nutDate).getDay()+6)%7;
  const mon=addDays(nutDate,-dow);
  const wkDates=[...Array(7)].map((_,i)=>addDays(mon,i));
  const vals=k=>wkDates.map(d=>S.nut[d]&&S.nut[d][k]!=null?+S.nut[d][k]:null).filter(v=>v!=null);
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  const f1=(v,d)=>v==null?"\u2013":(+v).toFixed(d);
  const aW=avg(vals("weight")),aC=avg(vals("cal")),aP=avg(vals("protein")),aS=avg(vals("steps"));
  const streak=calcStreak();
  el.innerHTML=`
    <div class="row" style="justify-content:space-between;margin-bottom:10px">
      <button class="iconbtn" onclick="nutDate=addDays(nutDate,-1);render()" aria-label="Previous day">\u2039</button>
      <div class="disp" style="font-size:20px">${fmtDay(nutDate)}${nutDate===todayISO()?"":" "}</div>
      <button class="iconbtn" onclick="nutDate=addDays(nutDate,1);render()" ${nutDate>=todayISO()?"disabled":""} aria-label="Next day">\u203a</button>
    </div>
    ${nutDate!==todayISO()?`<div class="small" style="text-align:center;margin:-6px 0 10px"><a href="#" onclick="nutDate=todayISO();render();return false">Jump to today</a></div>`:""}
    <div class="card"><div class="ngrid">${fields}</div>
      <div class="nfield" style="margin-top:10px"><label>Notes</label>
      <input value="${esc(rec.note||"")}" onchange="nutSet('note',this.value)" placeholder="How the day went"></div>
    </div>
    <div class="card">
      <div class="row" style="justify-content:space-between"><h3>This week's averages</h3>
        ${streak>1?`<span class="chip gold">\u{1F525} ${streak}-day streak</span>`:""}</div>
      <table style="margin-top:6px">
        <tr><th>Weight</th><th>Calories</th><th>Protein</th><th>Steps</th></tr>
        <tr><td>${f1(aW,1)}</td><td>${f1(aC,0)}</td><td>${f1(aP,0)} g</td><td>${aS?Math.round(aS).toLocaleString():"\u2013"}</td></tr>
      </table>
      <p class="faint small" style="margin-top:8px">Judge progress on the weekly average, not any single day. Pace goal: 0.5\u20131.0 lb per week down.</p>
    </div>
    <div class="card"><h3 style="margin-bottom:6px">Meal builder</h3>
      <div style="overflow-x:auto"><table>
        <tr><th>Meal</th><th>Protein</th><th>Carb</th><th>Produce</th><th>Fat</th><th>~Protein</th></tr>
        ${MEALS.map(m=>`<tr><td>${esc(m.meal)}</td><td>${esc(m.protein)}</td><td>${esc(m.carb)}</td><td>${esc(m.produce)}</td><td>${esc(m.fat)}</td><td>${esc(m.grams)}</td></tr>`).join("")}
      </table></div></div>`;
}
function nutSet(k,v){
  const rec=S.nut[nutDate]||(S.nut[nutDate]={});
  if(k==="note") rec.note=v.trim();
  else{ const n=num(v); if(n==null) delete rec[k]; else rec[k]=n; }
  if(!Object.keys(rec).length || (Object.keys(rec).length===1&&rec.note==="")) delete S.nut[nutDate];
  save(); render();
}
function calcStreak(){
  let n=0,d=todayISO();
  if(!S.nut[d]) d=addDays(d,-1); // today not logged yet doesn't break streak
  while(S.nut[d]&&Object.keys(S.nut[d]).length){ n++; d=addDays(d,-1); }
  return n;
}

/* ---------- PROGRESS ---------- */
const LIFT_CHOICES=["Safety Squat Bar Squat","Bench Press","Deadlift","Standing Overhead Press"];
function renderProgress(){
  const el=document.getElementById("view-progress");
  // weight series
  const wDates=Object.keys(S.nut).filter(d=>S.nut[d].weight!=null).sort();
  const wSeries=wDates.map(d=>({x:d,y:S.nut[d].weight}));
  const latest=wSeries.length?wSeries[wSeries.length-1].y:S.settings.startWeight;
  const change=latest-S.settings.startWeight;
  const toGoal=latest-S.settings.goalWeight;
  // 7-day rolling avg
  const avgSeries=wSeries.map((p,i)=>{
    const from=fromISO(p.x); from.setDate(from.getDate()-6); const lo=iso(from);
    const win=wSeries.filter(q=>q.x>=lo&&q.x<=p.x);
    return {x:p.x,y:win.reduce((a,b)=>a+b.y,0)/win.length};
  });
  // lift e1rm series
  const lh=historyFor(liftChartEx).slice().reverse();
  const liftSeries=lh.map(h=>({x:h.date,y:Math.max(...h.sets.map(s=>e1rm(s.w,s.r||1)))})).filter(p=>p.y>0);
  // adherence: last 8 program weeks
  const curW=Math.max(weekOf(todayISO()),1);
  const weeks=[]; for(let w=Math.max(1,curW-7);w<=curW;w++) weeks.push(w);
  const adh=weeks.map(w=>{
    const st=["Strength A","Strength B","Strength C"].filter(sname=>{
      return TEMPLATE.some((t,i)=>t.session===sname&&S.work[w+"-"+i]&&S.work[w+"-"+i].done);
    }).length;
    const cd=TEMPLATE.map((t,i)=>({t,i})).filter(x=>x.t.session==="Cardio"||x.t.session==="Softball")
      .filter(x=>{const r=S.work[w+"-"+x.i];return r&&r.done;}).length;
    return {w,st,cd};
  });
  // PR table
  const prExs=[...new Set(TEMPLATE.filter(t=>t.lift).map(t=>t.ex))];
  let prRows="";
  for(const ex of prExs){
    const hist=historyFor(ex);
    if(!hist.length) continue;
    let bw=0,br=0,be=0,bd="";
    for(const h of hist) for(const s of h.sets){
      const v=e1rm(s.w,s.r||1);
      if(v>be){be=v;bw=s.w;br=s.r||1;bd=h.date;}
    }
    prRows+=`<tr><td>${esc(ex)}</td><td>${bw}\u00d7${br}</td><td>${be}</td><td class="faint">${fmtShort(bd)}</td></tr>`;
  }
  el.innerHTML=`
    <div class="statgrid">
      <div class="stat"><div class="v">${(+latest).toFixed(1)}</div><div class="l">Current lb</div></div>
      <div class="stat"><div class="v" style="color:${change<=0?"var(--green)":"var(--red)"}">${change>0?"+":""}${change.toFixed(1)}</div><div class="l">Change</div></div>
      <div class="stat"><div class="v">${toGoal>0?toGoal.toFixed(1):"\u2713"}</div><div class="l">${toGoal>0?"To goal":"Goal hit"}</div></div>
    </div>
    <div class="card"><h3 style="margin-bottom:8px">Bodyweight</h3>
      ${wSeries.length>1?lineChart([{pts:wSeries,color:"#4a5160",w:1.5},{pts:avgSeries,color:"var(--accent)",w:2.5}],{goal:S.settings.goalWeight}):'<div class="empty">Log weight under Fuel to see the trend. The orange line is your 7-day average.</div>'}
      ${wSeries.length>1?'<div class="faint small" style="margin-top:6px">Gray: daily \u00b7 Orange: 7-day average \u00b7 Dashed: goal</div>':""}
    </div>
    <div class="card"><h3 style="margin-bottom:8px">Estimated 1RM</h3>
      <div class="seg">${LIFT_CHOICES.map(x=>`<button class="${x===liftChartEx?"on":""}" onclick="liftChartEx='${x}';render()">${esc(x.replace("Safety Squat Bar","SSB").replace("Standing Overhead","OH"))}</button>`).join("")}</div>
      ${liftSeries.length>1?lineChart([{pts:liftSeries,color:"var(--steel)",w:2.5,dots:true}],{}):'<div class="empty">Log at least two sessions of this lift to chart estimated 1RM (Epley: weight \u00d7 (1 + reps/30)).</div>'}
    </div>
    <div class="card"><h3 style="margin-bottom:8px">Weekly adherence</h3>
      ${barChart(adh)}
      <div class="faint small" style="margin-top:6px">Orange: strength sessions (target ${S.settings.lifts}) \u00b7 Blue: cardio + softball (target ${S.settings.cardio+1})</div>
    </div>
    <div class="card"><h3 style="margin-bottom:8px">Personal records (est. 1RM)</h3>
      ${prRows?`<table><tr><th>Exercise</th><th>Best set</th><th>e1RM</th><th>Date</th></tr>${prRows}</table>`:'<div class="empty">PRs appear here once you log working sets.</div>'}
    </div>`;
}

/* tiny SVG line chart */
function lineChart(series,opts){
  const W=680,H=220,P={l:38,r:10,t:12,b:22};
  const all=series.flatMap(s=>s.pts);
  if(!all.length) return "";
  const xs=all.map(p=>fromISO(p.x).getTime());
  let ys=all.map(p=>p.y);
  if(opts.goal!=null) ys=ys.concat([opts.goal]);
  const x0=Math.min(...xs),x1=Math.max(...xs)||x0+1;
  let y0=Math.min(...ys),y1=Math.max(...ys);
  const pad=(y1-y0)*0.12||2; y0-=pad;y1+=pad;
  const X=t=>P.l+(W-P.l-P.r)*(x1===x0?0.5:(t-x0)/(x1-x0));
  const Y=v=>H-P.b-(H-P.t-P.b)*((v-y0)/(y1-y0));
  let g="";
  // y gridlines
  for(let i=0;i<=3;i++){
    const v=y0+(y1-y0)*i/3, y=Y(v);
    g+=`<line x1="${P.l}" y1="${y}" x2="${W-P.r}" y2="${y}" stroke="#2a2e37" stroke-width="1"/>
        <text x="${P.l-6}" y="${y+4}" fill="#6B717D" font-size="11" text-anchor="end">${Math.round(v)}</text>`;
  }
  // x labels: first + last
  const fx=all.reduce((a,b)=>a.x<b.x?a:b).x, lx=all.reduce((a,b)=>a.x>b.x?a:b).x;
  g+=`<text x="${P.l}" y="${H-6}" fill="#6B717D" font-size="11">${fmtShort(fx)}</text>
      <text x="${W-P.r}" y="${H-6}" fill="#6B717D" font-size="11" text-anchor="end">${fmtShort(lx)}</text>`;
  if(opts.goal!=null){
    const y=Y(opts.goal);
    g+=`<line x1="${P.l}" y1="${y}" x2="${W-P.r}" y2="${y}" stroke="var(--green)" stroke-width="1.5" stroke-dasharray="5 5" opacity=".7"/>`;
  }
  for(const s of series){
    const pts=s.pts.slice().sort((a,b)=>a.x<b.x?-1:1);
    const d=pts.map((p,i)=>(i?"L":"M")+X(fromISO(p.x).getTime()).toFixed(1)+" "+Y(p.y).toFixed(1)).join(" ");
    g+=`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.w}" stroke-linejoin="round" stroke-linecap="round"/>`;
    if(s.dots) for(const p of pts) g+=`<circle cx="${X(fromISO(p.x).getTime()).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.5" fill="${s.color}"/>`;
  }
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Chart">${g}</svg>`;
}
function barChart(adh){
  const W=680,H=170,P={l:10,r:10,t:14,b:24};
  const n=adh.length, bw=(W-P.l-P.r)/n;
  const max=Math.max(4,...adh.map(a=>Math.max(a.st,a.cd)));
  const Y=v=>H-P.b-(H-P.t-P.b)*(v/max);
  let g="";
  const tgtY=Y(S.settings.lifts);
  g+=`<line x1="${P.l}" y1="${tgtY}" x2="${W-P.r}" y2="${tgtY}" stroke="var(--accent)" stroke-width="1" stroke-dasharray="4 4" opacity=".55"/>`;
  adh.forEach((a,i)=>{
    const x=P.l+i*bw;
    g+=`<rect x="${x+bw*0.14}" y="${Y(a.st)}" width="${bw*0.3}" height="${H-P.b-Y(a.st)}" rx="3" fill="var(--accent)"/>
        <rect x="${x+bw*0.52}" y="${Y(a.cd)}" width="${bw*0.3}" height="${H-P.b-Y(a.cd)}" rx="3" fill="var(--steel)"/>
        <text x="${x+bw/2}" y="${H-7}" fill="#6B717D" font-size="11" text-anchor="middle">W${a.w}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Weekly adherence">${g}</svg>`;
}

/* ---------- MORE (settings, library, data) ---------- */
function renderMore(){
  const el=document.getElementById("view-more");
  const s=S.settings;
  const set=(k,label,step)=>`<div class="nfield"><label>${label}</label>
    <input ${k==="startDate"?'type="date"':'inputmode="decimal"'} value="${s[k]}" onchange="settingSet('${k}',this.value)"></div>`;
  const counts=`${Object.keys(S.work).length} workout entries \u00b7 ${Object.keys(S.nut).length} nutrition days`;
  const lastExp=S.meta.lastExport?new Date(S.meta.lastExport).toLocaleDateString():"never";
  el.innerHTML=`
    <div class="card"><h2>Targets & settings</h2>
      <div class="ngrid">
        ${set("startDate","Program start date")}
        ${set("startWeight","Starting weight (lb)")}
        ${set("goalWeight","Goal weight (lb)")}
        ${set("cal","Daily calories")}
        ${set("protein","Daily protein (g)")}
        ${set("steps","Daily steps")}
        ${set("water","Daily water (oz)")}
        ${set("lifts","Lifting days / week")}
        ${set("cardio","Cardio days / week")}
      </div>
      <p class="faint small" style="margin-top:10px">Rules of the block: leave 1\u20133 reps in reserve, 45\u201360 min sessions, 7\u20138 hrs sleep, weekly-average check-ins.</p>
      <hr>
      <div class="nfield"><label>Schedule mode</label>
        <div class="seg" style="margin-bottom:0">
          <button class="${s.mode==="rolling"?"on":""}" onclick="S.settings.mode='rolling';save();render()">Rolling</button>
          <button class="${s.mode!=="rolling"?"on":""}" onclick="S.settings.mode='calendar';save();render()">Calendar</button>
        </div>
        <p class="faint small" style="margin-top:6px">Rolling: your next workout is always the first unfinished session \u2014 miss a day and it just waits for you. Calendar: Today always shows the actual weekday's session.</p>
      </div>
    </div>

    <div class="card"><h2>Plate math</h2>
      <h3 style="margin-bottom:6px">Bars</h3>
      ${s.bars.map((b,i)=>`<div class="row" style="margin-bottom:8px">
        <input value="${esc(b.name)}" onchange="barSet(${i},'name',this.value)" style="flex:2" aria-label="Bar name">
        <input inputmode="decimal" value="${b.w}" onchange="barSet(${i},'w',this.value)" style="flex:1" aria-label="Bar weight (lb)">
        <span class="faint small">lb</span>
      </div>`).join("")}
      <h3 style="margin:12px 0 6px">Plates you own</h3>
      <div class="row" style="gap:8px">
        ${PLATE_DENOMS.map(p=>{
          const n=(s.plateInv||{})[p]||0;
          return `<span class="platechip ${n?"has":""}">
            <button onclick="platesTap(${p})" aria-label="Add a ${p} lb plate">${p}${n?` <b>\u00d7${n}</b>`:""}</button>
            ${n?`<button class="pm" onclick="platesMinus(${p})" aria-label="Remove a ${p} lb plate">\u2212</button>`:""}
          </span>`;
        }).join("")}
      </div>
      <p class="faint small" style="margin-top:10px">Tap once per plate you own: two 45s = tap 45 twice. The math loads plates in pairs, so an odd plate is held in reserve (a lone 25 can't go on both sides). While logging a lift, pick the bar you're using and the per-side loadout appears under the set rows.</p>
    </div>

    <div class="card"><h2>Gist sync</h2>
      ${ghToken()?`
        <p class="small muted" style="margin-bottom:8px">Connected. ${S.meta.gistId?`Gist <span class="faint">${esc(S.meta.gistId.slice(0,10))}\u2026</span>`:"First push will create a private Gist."}
        ${S.meta.lastSync?` \u00b7 last sync ${new Date(S.meta.lastSync).toLocaleString()}`:""}</p>
        <div class="row">
          <button class="btn primary" onclick="gistPush(false)">Push to Gist</button>
          <button class="btn" onclick="gistPull(false)">Pull from Gist</button>
        </div>
        <div class="row" style="margin-top:10px">
          <label class="small" style="display:flex;gap:8px;align-items:center;cursor:pointer">
            <input type="checkbox" style="width:auto" ${s.autoSync?"checked":""} onchange="S.settings.autoSync=this.checked;save();render()">
            Auto-push a few seconds after every change
          </label>
        </div>
        <div id="sync-status" class="faint small" style="margin-top:6px"></div>
        <hr><button class="btn danger btn-sm" onclick="disconnectGist()">Disconnect this device</button>
      `:`
        <p class="small muted" style="margin-bottom:8px">Sync your data across devices through a private GitHub Gist. Free, no server, uses the GitHub account you already have.</p>
        <div class="nfield"><label>GitHub token (gist scope only)</label>
          <input id="gh-token-in" type="password" placeholder="github_pat_\u2026 or ghp_\u2026" autocomplete="off"></div>
        <div class="row" style="margin-top:10px"><button class="btn primary" onclick="setGhToken(document.getElementById('gh-token-in').value)">Connect</button></div>
        <p class="faint small" style="margin-top:8px">The token is stored only in this browser and is never included in JSON backups. Create one at github.com/settings/tokens with ONLY the gist scope.</p>
      `}
    </div>

    <div class="card"><h2>Data safety</h2>
      <p class="small muted" style="margin-bottom:4px">${counts}</p>
      <p class="small faint" style="margin-bottom:10px">Everything is stored in this browser's localStorage. Clearing site data wipes it, so export a backup regularly. Last export: <b>${lastExp}</b>.</p>
      <div class="row">
        <button class="btn primary" onclick="exportJSON()">Export backup (JSON)</button>
        <button class="btn" onclick="document.getElementById('importfile').click()">Import backup</button>
      </div>
      <div class="row" style="margin-top:8px">
        <button class="btn" onclick="exportCSV('work')">Workouts CSV</button>
        <button class="btn" onclick="exportCSV('nut')">Nutrition CSV</button>
      </div>
      <input type="file" id="importfile" accept=".json,application/json" style="display:none" onchange="importJSON(this)">
      <hr>
      <button class="btn danger" onclick="resetAll()">Erase all data</button>
    </div>

    <div class="card"><h2>Exercise library</h2>
      <div style="overflow-x:auto"><table>
        <tr><th>Movement</th><th>Primary</th><th>Alternative</th><th>Cue</th><th>Swap when</th></tr>
        ${LIBRARY.map(l=>`<tr><td>${esc(l.movement)}</td><td>${esc(l.primary)}</td><td>${esc(l.alt)}</td><td class="faint">${esc(l.cue)}</td><td class="faint">${esc(l.when)}</td></tr>`).join("")}
      </table></div></div>

    <div class="card"><h2>Equipment</h2>
      <div class="row">${EQUIPMENT.map(e=>`<span class="chip">${esc(e)}</span>`).join("")}</div>
    </div>

    <div class="card"><h3>About</h3>
      <p class="small faint">GarageBlock is a single-file web app built for a 12-week home-gym block: Technique \u2192 Build \u2192 Progress \u2192 Deload/Test. Works offline once loaded, installable to your home screen, no accounts, no server \u2014 your data never leaves this device except when you export it.</p>
    </div>`;
}
function settingSetText(k,v){ S.settings[k]=v.trim(); save(); render(); }
function barSet(i,k,v){
  if(k==="w"){ const n=num(v); if(n!=null&&n>=0) S.settings.bars[i].w=n; }
  else { v=v.trim(); if(v) S.settings.bars[i].name=v; }
  save(); render();
}
function settingSet(k,v){
  if(k==="startDate"){ if(/^\d{4}-\d{2}-\d{2}$/.test(v)) S.settings[k]=v; }
  else { const n=num(v); if(n!=null) S.settings[k]=n; }
  save(); render();
}

/* ---------- Gist sync ---------- */
const TOKEN_KEY="garageblock.token", GIST_FILE="garageblock.json";
function ghToken(){ return localStorage.getItem(TOKEN_KEY)||""; }
function setGhToken(v){ v=v.trim(); if(v) localStorage.setItem(TOKEN_KEY,v); else localStorage.removeItem(TOKEN_KEY); render(); }
function ghHeaders(){ return {"Authorization":"Bearer "+ghToken(),"Accept":"application/vnd.github+json","Content-Type":"application/json"}; }

let syncT=null, syncing=false;
function queueSync(){
  if(!ghToken()) return;
  clearTimeout(syncT);
  syncT=setTimeout(()=>gistPush(true), 4000);
}
async function gistPush(quiet){
  if(!ghToken()){ toast("Add a GitHub token first."); return; }
  if(syncing) return; syncing=true;
  setSyncStatus("Syncing\u2026");
  try{
    const body=JSON.stringify({description:"GarageBlock data (auto-synced)",public:false,
      files:{[GIST_FILE]:{content:JSON.stringify(S)}}});
    let res;
    if(S.meta.gistId){
      res=await fetch("https://api.github.com/gists/"+S.meta.gistId,{method:"PATCH",headers:ghHeaders(),body});
      if(res.status===404){ S.meta.gistId=null; } // gist deleted; recreate below
    }
    if(!S.meta.gistId){
      res=await fetch("https://api.github.com/gists",{method:"POST",headers:ghHeaders(),body});
      if(res.ok){ const j=await res.json(); S.meta.gistId=j.id; localStorage.setItem(KEY,JSON.stringify(S)); }
    }
    if(!res.ok){
      const msg=res.status===401?"Token rejected. Check it has the gist scope.":"Sync failed (HTTP "+res.status+").";
      setSyncStatus(""); if(!quiet) toast(msg); else setSyncStatus(msg);
      return;
    }
    S.meta.lastSync=Date.now(); localStorage.setItem(KEY,JSON.stringify(S));
    setSyncStatus("Synced "+new Date().toLocaleTimeString());
    if(!quiet) toast("Pushed to Gist.");
  }catch(e){
    setSyncStatus("Offline \u2014 will sync when you push again.");
    if(!quiet) toast("Couldn't reach GitHub. Are you online?");
  }finally{ syncing=false; }
}
async function gistPull(quiet){
  if(!ghToken()||!S.meta.gistId){ if(!quiet) toast(S.meta.gistId?"Add a GitHub token first.":"Nothing to pull yet \u2014 push once first."); return; }
  try{
    const res=await fetch("https://api.github.com/gists/"+S.meta.gistId,{headers:ghHeaders()});
    if(!res.ok){ if(!quiet) toast("Pull failed (HTTP "+res.status+")."); return; }
    const j=await res.json();
    const f=j.files&&j.files[GIST_FILE];
    if(!f){ if(!quiet) toast("No GarageBlock file in that Gist."); return; }
    let content=f.content;
    if(f.truncated){ const r2=await fetch(f.raw_url); content=await r2.text(); }
    const remote=JSON.parse(content);
    if(!remote||remote.v!==1||!remote.settings) throw new Error("format");
    const rU=remote.meta&&remote.meta.updated||0, lU=S.meta.updated||0;
    if(rU<=lU){ if(!quiet) toast("This device is already up to date."); return; }
    if(!confirm("Newer data found in your Gist (saved "+new Date(rU).toLocaleString()+"). Replace what's on this device?")) return;
    const gid=S.meta.gistId;
    S=remote; S.meta.gistId=gid;
    for(const k of Object.keys(DEFAULTS)) if(S[k]===undefined) S[k]=JSON.parse(JSON.stringify(DEFAULTS[k]));
    localStorage.setItem(KEY,JSON.stringify(S));
    render(); toast("Pulled latest data from Gist.");
  }catch(e){ if(!quiet) toast("Pull failed. "+(e.message==="format"?"That Gist isn't a GarageBlock backup.":"Check your connection.")); }
}
function setSyncStatus(msg){ const el=document.getElementById("sync-status"); if(el) el.textContent=msg; }
function disconnectGist(){
  if(!confirm("Remove the token from this device? Your Gist and local data stay untouched.")) return;
  localStorage.removeItem(TOKEN_KEY); S.settings.autoSync=false; save(); render();
}

/* ---------- export / import ---------- */
function download(name, text, type){
  const blob=new Blob([text],{type:type||"application/octet-stream"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download=name; document.body.appendChild(a); a.click();
  setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},400);
}
function exportJSON(){
  S.meta.lastExport=Date.now(); save();
  download("garageblock-backup-"+todayISO()+".json", JSON.stringify(S,null,1), "application/json");
  toast("Backup downloaded."); renderBackupBanner();
}
function csvCell(v){ v=String(v==null?"":v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
function exportCSV(which){
  let rows;
  if(which==="work"){
    rows=[["date","week","day","session","exercise","set","weight","reps","rpe","note"]];
    const keys=Object.keys(S.work).sort((a,b)=>{
      const da=S.work[a].date||"", db=S.work[b].date||""; return da<db?-1:1;
    });
    for(const k of keys){
      const [w,i]=k.split("-").map(Number);
      const t=TEMPLATE[i]; if(!t) continue;
      const r=S.work[k];
      if(t.lift&&r.sets&&r.sets.some(Boolean)){
        r.sets.forEach((s,si)=>{ if(s) rows.push([r.date,w,t.day,t.session,t.ex,si+1,s.w,s.r!=null?s.r:"",r.rpe||"",r.note||""]); });
      } else if(r.done){
        rows.push([r.date,w,t.day,t.session,t.ex,"","","",r.rpe||"",r.note||""]);
      }
    }
    for(const d of Object.keys(S.extras).sort()){
      S.extras[d].forEach(e=>{
        if(e.sets&&e.sets.length) e.sets.forEach((s,si)=>rows.push([d,weekOf(d),dayName(d),"Extra",e.ex,si+1,s.w,s.r,"",e.note||""]));
        else rows.push([d,weekOf(d),dayName(d),"Extra",e.ex,"","","","",e.note||""]);
      });
    }
  } else {
    rows=[["date","weight","waist","calories","protein","steps","water","sleep","hunger","note"]];
    for(const d of Object.keys(S.nut).sort()){
      const r=S.nut[d];
      rows.push([d,r.weight??"",r.waist??"",r.cal??"",r.protein??"",r.steps??"",r.water??"",r.sleep??"",r.hunger??"",r.note||""]);
    }
  }
  download("garageblock-"+which+"-"+todayISO()+".csv", rows.map(r=>r.map(csvCell).join(",")).join("\n"), "text/csv");
  toast("CSV downloaded.");
}
function importJSON(input){
  const f=input.files[0]; if(!f) return;
  const rd=new FileReader();
  rd.onload=()=>{
    try{
      const data=JSON.parse(rd.result);
      if(!data||typeof data!=="object"||!data.settings||data.v!==1) throw new Error("format");
      if(!confirm("Replace everything in this browser with the imported backup?")){ input.value=""; return; }
      S=data;
      for(const k of Object.keys(DEFAULTS)) if(S[k]===undefined) S[k]=JSON.parse(JSON.stringify(DEFAULTS[k]));
      save(); render(); toast("Backup imported.");
    }catch(e){ toast("That file isn't a GarageBlock backup."); }
    input.value="";
  };
  rd.readAsText(f);
}
function resetAll(){
  if(!confirm("Erase all workouts, nutrition logs, and settings on this device? This cannot be undone.")) return;
  if(!confirm("Really erase everything? Export a backup first if you want to keep anything.")) return;
  localStorage.removeItem(KEY); load(); render(); toast("All data erased.");
}

/* ---------- boot ---------- */
load();
go("today");
if(S.settings.autoSync && ghToken() && S.meta.gistId){ gistPull(true); }
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{ navigator.serviceWorker.register("./sw.js").catch(()=>{}); });
}
