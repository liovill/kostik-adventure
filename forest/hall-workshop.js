/* Academy v44, interactive workshop: sort, build and grow.
 * No dependencies beyond the existing Academy hall and shared save().
 * Supports tap-to-select, tap-to-place and real pointer drop on touch screens.
 */
"use strict";
const HALL_WORKSHOP_MODES={
 sort:{name:"Волшебная сортировка",icon:"🧺",desc:"Разложи находки по домикам."},
 bridge:{name:"Построй мост",icon:"🌉",desc:"Поставь детали на подходящие места."},
 garden:{name:"Вырасти цветок",icon:"🌻",desc:"Помоги семечку превратиться в цветок."}
};
const HALL_WORKSHOP_PLANS={
 kostya:{
  sort:{bins:[{id:"wood",icon:"🌲",name:"Лес"},{id:"water",icon:"🌊",name:"Вода"},{id:"farm",icon:"🚜",name:"Ферма"}],items:[
   {id:"fox",icon:"🦊",bin:"wood"},{id:"bear",icon:"🐻",bin:"wood"},
   {id:"fish",icon:"🐟",bin:"water"},{id:"dolphin",icon:"🐬",bin:"water"},
   {id:"cow",icon:"🐮",bin:"farm"},{id:"chicken",icon:"🐔",bin:"farm"}]},
  bridge:{bins:[1,2,3,4,5].map(n=>({id:String(n),icon:"●".repeat(n),name:"Доска "+n})),items:[1,2,3,4,5].map(n=>({id:"plank"+n,icon:String(n),bin:String(n)}))},
  garden:{steps:[{id:"soil",icon:"🪏",name:"Подготовь землю",result:"🌱 Земля готова!"},
   {id:"seed",icon:"🌰",name:"Посади семечко",result:"🌰 Семечко в земле!"},
   {id:"water",icon:"💧",name:"Полей росток",result:"🌱 Появился росток!"},
   {id:"sun",icon:"☀️",name:"Подари свет",result:"🌻 Цветок распустился!"}]}
 },
 kirill:{
  sort:{bins:[{id:"red",icon:"🔴",name:"Красное"},{id:"blue",icon:"🔵",name:"Синее"},{id:"green",icon:"🟢",name:"Зелёное"}],items:[
   {id:"red1",icon:"❤️",bin:"red"},{id:"red2",icon:"🔴",bin:"red"},
   {id:"blue1",icon:"💙",bin:"blue"},{id:"blue2",icon:"🔵",bin:"blue"},
   {id:"green1",icon:"💚",bin:"green"},{id:"green2",icon:"🟢",bin:"green"}]},
  bridge:{bins:[{id:"star",icon:"⭐",name:"Звезда"},{id:"flower",icon:"🌸",name:"Цветок"},{id:"leaf",icon:"🍀",name:"Листочек"}],
   items:[{id:"starpiece",icon:"⭐",bin:"star"},{id:"flowerpiece",icon:"🌸",bin:"flower"},{id:"leafpiece",icon:"🍀",bin:"leaf"}]},
  garden:{steps:[{id:"seed",icon:"🌰",name:"Посади семечко",result:"🌰 Семечко посажено!"},
   {id:"water",icon:"💧",name:"Полей цветок",result:"🌻 Цветок вырос!"}]}
 }
};
const HALL_WORKSHOP_IDS=["sort","bridge","garden"];
let hallWorkshopCurrent=null;
function hallWorkshopPlan(hero,mode){return HALL_WORKSHOP_PLANS[hero][mode]}
function hallWorkshopState(hero,mode){
 const p=hallWorkshopPlan(hero,mode);
 return{hero,mode,selected:null,placed:[],step:0,finished:false,total:mode==="garden"?p.steps.length:p.items.length}
}
function hallWorkshopAwardKey(mode){return "lab_"+mode}
function hallWorkshopEarned(hero,mode){return !!hallProfile(hero).traceAwards[hallWorkshopAwardKey(mode)]}
function hallWorkshopOpen(mode){
 if(!HALL_WORKSHOP_MODES[mode]||!state.active)return;
 hallWorkshopCurrent=hallWorkshopState(state.active,mode);
 hallSection("workshop");
 hallWorkshopRender();
 if(state.settings.voice)speak(HALL_WORKSHOP_MODES[mode].desc,false,"wizard")
}
function hallWorkshopTapItem(itemId){
 const round=hallWorkshopCurrent;
 if(!round||round.finished||round.mode==="garden"||round.placed.includes(itemId))return;
 round.selected=itemId;
 hallWorkshopRender();
 $("hallWorkshopFeedback").textContent="✨ Теперь нажми на подходящее место.";
}
function hallWorkshopPlace(binId){
 const round=hallWorkshopCurrent;
 if(!round||round.finished||round.mode==="garden")return false;
 if(round.selected===null){
  $("hallWorkshopFeedback").textContent="Сначала выбери предмет сверху.";
  return false
 }
 const plan=hallWorkshopPlan(round.hero,round.mode);
 const item=plan.items.find(i=>i.id===round.selected);
 if(!item||round.placed.includes(item.id))return false;
 if(item.bin!==binId){
  $("hallWorkshopFeedback").textContent="💛 Другой домик! Попробуй ещё.";
  if(window.AcademySound)window.AcademySound.cue("try");
  return false
 }
 round.placed.push(item.id);round.selected=null;
 if(window.AcademySound)window.AcademySound.cue("good");
 if(round.placed.length===round.total)hallWorkshopFinish();
 else hallWorkshopRender("🌟 Получилось! Выбери следующую находку.");
 return true
}
function hallWorkshopDoStep(stepId){
 const round=hallWorkshopCurrent;
 if(!round||round.finished||round.mode!=="garden")return false;
 const plan=hallWorkshopPlan(round.hero,round.mode);
 const step=plan.steps[round.step];
 if(!step||step.id!==stepId){
  $("hallWorkshopFeedback").textContent="💛 Выбери следующий шаг. Росток ждёт помощи!";
  if(window.AcademySound)window.AcademySound.cue("try");
  return false
 }
 round.step++;
 if(window.AcademySound)window.AcademySound.cue("flower");
 if(round.step===round.total)hallWorkshopFinish();
 else hallWorkshopRender("✨ "+step.result);
 return true
}
function hallWorkshopFinish(){
 const round=hallWorkshopCurrent;
 if(!round||round.finished)return;
 round.finished=true;
 const key=hallWorkshopAwardKey(round.mode);
 let first=false;
 if(!hallProfile(round.hero).traceAwards[key]){
  hallProfile(round.hero).traceAwards[key]=true;
  if(!save())delete hallProfile(round.hero).traceAwards[key];
  else first=true
 }
 hallWorkshopRender(first?"🏅 Новая звезда мастерской!":"🌟 Отличная работа! Можно сыграть ещё.");
 if(window.AcademySound)window.AcademySound.cue("medal");
 if(state.settings.voice)speak("Ура! Всё получилось! Молодец!",false,"wizard")
}
function hallWorkshopEl(tag,cls,text){
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(text!==undefined)el.textContent=text;
 return el
}
function hallWorkshopText(id,value){$(id).textContent=value}
function hallWorkshopDrawGarden(round,root){
 const plan=hallWorkshopPlan(round.hero,"garden");
 const preview=hallWorkshopEl("div","workshop-garden-stage");
 const stage=round.step;
 const art=stage===0?"🟫":stage===plan.steps.length?"🌻":round.hero==="kirill"?"🌱":stage===1?"🟫":stage===2?"🌰":"🌱";
 preview.appendChild(hallWorkshopEl("div","workshop-plant",art));
 preview.appendChild(hallWorkshopEl("div","workshop-garden-caption",stage===0?"Пустая грядка":stage===plan.steps.length?"Ура! Цветок вырос!":"Наш волшебный сад"));
 root.appendChild(preview);
 const tools=hallWorkshopEl("div","workshop-tools");
 for(const stepObj of plan.steps){
  const b=hallWorkshopEl("button","workshop-tool",stepObj.icon);
  b.type="button";
  b.title=stepObj.name;b.setAttribute("aria-label",stepObj.name);
  if(plan.steps.indexOf(stepObj)<stage){b.classList.add("completed");b.disabled=true}
  b.appendChild(hallWorkshopEl("small","",stepObj.name));
  b.onclick=()=>hallWorkshopDoStep(stepObj.id);
  tools.appendChild(b)
 }
 root.appendChild(tools)
}
function hallWorkshopPointerDrag(button,item){
 let start=null;
 button.addEventListener("pointerdown",e=>{
  if(e.button!==undefined&&e.button!==0)return;
  start={x:e.clientX,y:e.clientY,id:e.pointerId};
  try{button.setPointerCapture(e.pointerId)}catch(err){}
 });
 button.addEventListener("pointerup",e=>{
  if(!start||e.pointerId!==start.id)return;
  const delta=Math.hypot(e.clientX-start.x,e.clientY-start.y);
  start=null;
  if(delta<14)return; // ordinary tap is handled by click
  const zone=document.elementFromPoint(e.clientX,e.clientY)?.closest("[data-workshop-bin]");
  if(!zone)return;
  hallWorkshopCurrent.selected=item.id;
  hallWorkshopPlace(zone.dataset.workshopBin);
 });
 button.addEventListener("pointercancel",()=>{start=null});
}
function hallWorkshopDrawObjects(round,root){
 const plan=hallWorkshopPlan(round.hero,round.mode);
 const deck=hallWorkshopEl("div","workshop-deck");
 deck.setAttribute("aria-label","Предметы для размещения");
 for(const item of plan.items){
  const b=hallWorkshopEl("button","workshop-piece",item.icon);
  b.type="button";b.disabled=round.finished||round.placed.includes(item.id);
  if(round.selected===item.id)b.classList.add("selected");
  if(round.placed.includes(item.id))b.classList.add("placed");
  b.setAttribute("aria-label",round.placed.includes(item.id)?"Установлено: "+item.icon:"Взять "+item.icon);
  b.onclick=()=>hallWorkshopTapItem(item.id);
  hallWorkshopPointerDrag(b,item);deck.appendChild(b)
 }
 root.appendChild(deck);
 const boxes=hallWorkshopEl("div","workshop-bins "+(round.mode==="bridge"?"workshop-bridge":""));
 for(const bin of plan.bins){
  const b=hallWorkshopEl("button","workshop-bin");
  b.type="button";b.dataset.workshopBin=bin.id;
  const placed=plan.items.filter(i=>i.bin===bin.id&&round.placed.includes(i.id));
  const title=hallWorkshopEl("span","workshop-bin-title",bin.icon);
  const caption=hallWorkshopEl("small","workshop-bin-name",bin.name);
  const contents=hallWorkshopEl("span","workshop-bin-contents",placed.map(x=>x.icon).join(" "));
  if(placed.length)b.classList.add("filled");
  b.setAttribute("aria-label",bin.name+", установлено "+placed.length+" предметов");
  b.appendChild(title);b.appendChild(caption);b.appendChild(contents);
  b.onclick=()=>hallWorkshopPlace(bin.id);
  boxes.appendChild(b)
 }
 root.appendChild(boxes)
}
function hallWorkshopRender(message){
 if(hallMode!=="workshop"||!hallWorkshopCurrent)return;
 const r=hallWorkshopCurrent;
 if(r.hero!==state.active){hallWorkshopCurrent=null;hallSection("intro");return}
 const mode=HALL_WORKSHOP_MODES[r.mode],root=$("hallWorkshopBoard");root.innerHTML="";
 hallWorkshopText("hallWorkshopTitle",mode.icon+" "+mode.name);
 hallWorkshopText("hallWorkshopInstruction",r.mode==="sort"?"Возьми предмет, затем нажми на его домик. Можно перетаскивать пальцем.":r.mode==="bridge"?"Возьми деталь и поставь в подходящий пролёт моста. Можно перетаскивать.":"Нажимай на инструменты в правильном порядке.");
 hallWorkshopText("hallWorkshopProgress",r.mode==="garden"?r.step+" / "+r.total:r.placed.length+" / "+r.total);
 hallWorkshopText("hallWorkshopFeedback",message||(r.finished?"✨ Всё готово!":"Выбери первый предмет."));
 if(r.mode==="garden")hallWorkshopDrawGarden(r,root);
 else hallWorkshopDrawObjects(r,root);
 $("hallWorkshopAgain").classList.toggle("hidden",!r.finished);
 $("hallWorkshopSpeak").onclick=()=>speak($("hallWorkshopInstruction").textContent,true);
}
function hallWorkshopWire(){
 $("hallOpenSort").onclick=()=>hallWorkshopOpen("sort");
 $("hallOpenBridge").onclick=()=>hallWorkshopOpen("bridge");
 $("hallOpenGarden").onclick=()=>hallWorkshopOpen("garden");
 $("hallWorkshopBack").onclick=hallBack;
 $("hallWorkshopAgain").onclick=()=>hallWorkshopOpen(hallWorkshopCurrent.mode);
}
hallWorkshopWire();
