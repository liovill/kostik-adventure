
"use strict";
/* Forest 3.0. No frameworks, trackers, timers for scoring, or external resources. */
const $=id=>document.getElementById(id);
const F3_STORAGE="royal-academy-family-v1",F3_HERO_STORAGE="academy-active-hero";
const F3_NAMES={kostya:"Костя",kirill:"Кирилл"};
const F3_SCENES=["grove","garden","river","clearing"];
const F3_SCENE_NAMES={grove:"🌲 Лесная опушка",garden:"🌼 Волшебный сад",river:"🌊 Сияющий ручей",clearing:"🐲 Драконья поляна"};
const F3_SCENE_NEEDS={grove:0,garden:2,river:4,clearing:6};
const F3_SCENE_POSITIONS={grove:[51,67],garden:[53,68],river:[35,62],clearing:[45,67]};
const F3_PROGRESS={stage:0,lights:[false,false,false],seeds:[false,false,false],patterns:0,planks:[false,false,false],memory:0,eggs:0,medal:false,replays:0};
const F3_TEXT={
 0:"Сова Луна сидит у старого дерева. Нажми на неё: она ждёт тебя!",
 1:"Лес загрустил и потерял искры света. Давай соберём их вместе!",
 2:"Огоньки спасены! Теперь посади семена, чтобы оживить сад.",
 3:"Цветы расцвели! Сова приготовила для нас древнюю мозаику.",
 4:"Загадки решены. Ручей впереди, но мост сломан. Построим новый!",
 5:"Мост готов! Осталось пробудить поющие камни. Запомни их цвета.",
 6:"Камни запели! На поляне ждёт волшебное яйцо. Поможем дракону!",
 7:"Ты спас Зачарованный лес. Каждое твоё действие вернуло ему свет!"
};
function f3Empty(){return{stage:0,lights:[false,false,false],seeds:[false,false,false],patterns:0,planks:[false,false,false],memory:0,eggs:0,medal:false,replays:0}}
function f3Clamp(x,max){return Number.isSafeInteger(x)?Math.max(0,Math.min(max,x)):0}
function f3Clean(p){
 const v=f3Empty();if(!p||typeof p!=="object")return v;
 v.stage=f3Clamp(p.stage,7);for(const key of ["lights","seeds","planks"])v[key]=Array.from({length:3},(_,i)=>Array.isArray(p[key])&&p[key][i]===true);
 v.patterns=f3Clamp(p.patterns,3);v.memory=f3Clamp(p.memory,2);v.eggs=f3Clamp(p.eggs,3);v.medal=p.medal===true||v.stage===7;v.replays=f3Clamp(p.replays,100000);return v
}
function f3ReadFamily(){try{const x=JSON.parse(localStorage.getItem(F3_STORAGE)||"{}");return x&&typeof x==="object"&&!Array.isArray(x)?x:{}}catch(e){return{}}}
let family=f3ReadFamily();
function f3EnsureFamily(){
 if(!family.forest3||typeof family.forest3!=="object")family.forest3={heroes:{}};
 if(!family.forest3.heroes||typeof family.forest3.heroes!=="object")family.forest3.heroes={};
 for(const key of ["kostya","kirill"])family.forest3.heroes[key]=f3Clean(family.forest3.heroes[key]);
 if(!family.settings||typeof family.settings!=="object")family.settings={voice:true,reduceMotion:false};
}
f3EnsureFamily();
let hero=(localStorage.getItem(F3_HERO_STORAGE)||family.active)==="kirill"?"kirill":"kostya";
let scene=F3_STAGES[family.forest3.heroes[hero].stage].scene;
let selectedSeed=null,selectedPlank=null,memoryShowing=true,memoryInput=[],feedbackTimer=null;
function state(){return family.forest3.heroes[hero]}
function save(){
 try{
  // Preserve any other Academy data, including its older towers and rewards.
  const latest=f3ReadFamily();
  latest.forest3=family.forest3;
  latest.settings=family.settings;
  latest.active=hero;
  family=latest;f3EnsureFamily();
  localStorage.setItem(F3_STORAGE,JSON.stringify(family));
  localStorage.setItem(F3_HERO_STORAGE,hero);
 }catch(e){$("missionFeedback").textContent="⚠️ Не удалось сохранить игру в браузере. Возможно, включён приватный режим."}
}
function say(text,force=false){
 if(!force&&!family.settings.voice)return;
 try{
  if(!window.speechSynthesis||typeof SpeechSynthesisUtterance==="undefined")return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(String(text));u.lang="ru-RU";u.rate=.87;u.pitch=1.04;
  const voices=window.speechSynthesis.getVoices?window.speechSynthesis.getVoices():[];
  const ru=voices.find(v=>/^ru/i.test(v.lang||""));if(ru)u.voice=ru;
  window.speechSynthesis.speak(u)
 }catch(e){}
}
function f3Avatar(who){
 const kid=who==="kirill",cape=kid?"#2d9779":"#385bab",tunic=kid?"#4bc5a0":"#5398eb";
 const hair=kid?
 '<circle cx="36" cy="39" r="14" fill="#e7be66"/><circle cx="49" cy="27" r="15" fill="#f7dc80"/><circle cx="64" cy="28" r="15" fill="#efc96f"/><circle cx="79" cy="39" r="14" fill="#e5bc61"/><circle cx="44" cy="22" r="10" fill="#f5da82"/>':
 '<path d="M20 54Q16 34 29 20C39 7 66 7 80 18Q97 32 92 55L83 52L82 45Q65 48 54 45Q42 50 33 46L30 57Z" fill="#29252c"/><path d="M33 35Q51 24 76 34" fill="none" stroke="#50414d" stroke-width="3" opacity=".55"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" role="img" aria-label="'+F3_NAMES[who]+'">'+
 '<ellipse cx="59" cy="143" rx="36" ry="6" fill="#163e3b" opacity=".3"/>'+
 '<path d="M35 80Q15 98 13 131L102 132Q99 101 76 80Z" fill="'+cape+'"/>'+
 '<path d="M35 115L29 143L47 143L54 115M72 115L71 143L87 143L81 115" fill="'+tunic+'" stroke="'+cape+'" stroke-width="4"/>'+
 '<ellipse cx="39" cy="140" rx="15" ry="7" fill="#574a4e"/><ellipse cx="83" cy="140" rx="15" ry="7" fill="#574a4e"/>'+
 '<rect x="34" y="85" width="50" height="44" rx="17" fill="'+tunic+'"/><path d="M39 103L59 113L79 102" stroke="#f9d68d" stroke-width="4" fill="none"/>'+
 '<path d="M35 96Q21 102 20 117M84 96Q98 103 97 114" fill="none" stroke="#f6c39f" stroke-width="12" stroke-linecap="round"/>'+
 '<ellipse cx="56" cy="52" rx="34" ry="37" fill="#f6c8a1"/><circle cx="25" cy="54" r="8" fill="#f6c8a1"/><circle cx="89" cy="54" r="8" fill="#f6c8a1"/>'+hair+
 '<ellipse cx="43" cy="59" rx="4.1" ry="5.5" fill="#233847"/><ellipse cx="69" cy="59" rx="4.1" ry="5.5" fill="#233847"/><circle cx="44" cy="57" r="1.6" fill="#fff"/><circle cx="70" cy="57" r="1.6" fill="#fff"/>'+
 '<circle cx="37" cy="70" r="5" fill="#e6a18a" opacity=".7"/><circle cx="76" cy="70" r="5" fill="#e6a18a" opacity=".7"/><path d="M47 77Q57 84 68 77" fill="none" stroke="#a36b62" stroke-width="3" stroke-linecap="round"/>'+
 (kid?'<circle cx="99" cy="108" r="13" fill="#80d6ab"/><circle cx="103" cy="104" r="2" fill="#234951"/>':
 '<path d="M99 128L104 43" fill="none" stroke="#8b6645" stroke-width="6" stroke-linecap="round"/><path d="M104 22L108 33L120 39L108 44L103 57L99 44L87 39L99 34Z" fill="#ffe383" stroke="#fff8bb" stroke-width="2"/>')+'</svg>'
}
function moveActor(x,y){
 const actor=$("heroActor");actor.style.left=x+"%";actor.style.top=y+"%";
 actor.classList.add("walking");clearTimeout(feedbackTimer);
 feedbackTimer=setTimeout(()=>actor.classList.remove("walking"),420)
}
function feedback(t){$("missionFeedback").textContent=t}
function story(t,who="🦉 Сова Луна",read=false){
 $("speakerName").textContent=who;$("storyText").textContent=t;if(read)say(t)
}
function activeSceneForStage(){return F3_STAGES[state().stage].scene}
function sceneIsCurrent(){return activeSceneForStage()===scene}
function unlocked(name){return state().stage>=F3_SCENE_NEEDS[name]}
function chooseScene(name,read=false){
 if(!F3_SCENES.includes(name))return;
 if(!unlocked(name)){feedback("🔒 Это место откроется по сюжету.");return}
 scene=name;render();if(read)say(F3_SCENE_NAMES[name])
}
function advance(){
 if(state().stage>=7)return;
 state().stage++;
 if(state().stage===7)state().medal=true;
 selectedSeed=null;selectedPlank=null;memoryShowing=true;memoryInput=[];
 scene=activeSceneForStage();save();render();story(F3_TEXT[state().stage],"🦉 Сова Луна",true);
 if(state().stage===7)feedback("🏆 Ты получил медаль Хранителя леса! Она сохранена.")
}
function render(){
 const p=state(),stage=F3_STAGES[p.stage];
 $("heroName").textContent=F3_NAMES[hero];$("heroSmall").textContent=hero==="kirill"?"🐲":"🧙‍♂️";
 $("voiceToggle").textContent=family.settings.voice?"🔊":"🔇";$("voiceToggle").setAttribute("aria-label",family.settings.voice?"Выключить озвучку":"Включить озвучку");
 $("progressTitle").textContent=p.stage>=7?"Победа!":stage.name;
 $("questCount").textContent=p.stage+" из 7 этапов";
 $("questTrackFill").style.width=Math.round(p.stage/7*100)+"%";
 const sc=$("worldScene");F3_SCENES.forEach(s=>sc.classList.toggle(s,s===scene));
 sc.classList.toggle("restored",p.stage>=7);
 $("sceneBadge").textContent=F3_SCENE_NAMES[scene];
 const buttons=document.querySelectorAll("[data-scene]");buttons.forEach(b=>{
  const destination=b.dataset.scene;b.classList.toggle("selected",scene===destination);
  b.classList.toggle("locked",!unlocked(destination));b.disabled=!unlocked(destination);
  b.setAttribute("aria-label",F3_SCENE_NAMES[destination]+(!unlocked(destination)?", пока закрыто":""))
 });
 const pos=F3_SCENE_POSITIONS[scene];moveActor(pos[0],pos[1]);
 $("heroActor").innerHTML=f3Avatar(hero);
 $("worldBridge").classList.toggle("built",p.planks.every(Boolean));
 const slots=$("bridgePlanks");slots.innerHTML="";for(let i=0;i<3;i++){const plank=document.createElement("span");plank.className=p.planks[i]?"present":"";slots.appendChild(plank)}
 F3_SEEDS.forEach((s,i)=>{$("bedArt"+i).textContent=p.seeds[i]?s.flower:"🌱"});
 $("worldNest").textContent=p.stage>=7?"🐲":"🥚";
 const lights=$("forestLights");lights.innerHTML="";
 if(scene==="grove"&&p.stage>=1){F3_FIRE.forEach((f,i)=>{
  if(p.lights[i])return;
  const btn=document.createElement("button");btn.className="light-button";
  btn.style.left=f.x+"%";btn.style.top=f.y+"%";btn.textContent=f.icon;
  btn.setAttribute("aria-label",f.label);btn.onclick=()=>takeLight(i);lights.appendChild(btn)
 })}
 const current=sceneIsCurrent();
 $("missionTitle").textContent=current?stage.title:"Здесь уже знакомая тропинка";
 $("missionIcon").textContent=current?stage.icon:"🗺️";
 $("missionDescription").textContent=current?stage.desc:"Осмотрись или вернись к месту, где продолжается история.";
 $("missionReset").textContent=p.stage===7?"↶ Играть сначала":"↶ Начать главу заново";
 feedback("");
 const root=$("missionBody");root.innerHTML="";
 if(!current){renderVisited(root)}
 else if(p.stage===0)renderIntro(root);
 else if(p.stage===1)renderLights(root);
 else if(p.stage===2)renderGarden(root);
 else if(p.stage===3)renderPatterns(root);
 else if(p.stage===4)renderBridge(root);
 else if(p.stage===5)renderMemory(root);
 else if(p.stage===6)renderEgg(root);
 else renderFinish(root);
 $("endingPanel").classList.toggle("hidden",p.stage!==7);
 if(p.stage===7)$("endingMessage").textContent=F3_NAMES[hero]+", ты вернул свет в лес, помог сове Луне и разбудил дракончика. Медаль Хранителя леса навсегда осталась в твоей книге приключений.";
 $("missionHint").disabled=p.stage===7;
 story(F3_TEXT[p.stage])
}
function element(tag,cls,text){
 const el=document.createElement(tag);if(cls)el.className=cls;
 if(text!==undefined)el.textContent=text;return el
}
function put(parent,tag,cls,text){const el=element(tag,cls,text);parent.appendChild(el);return el}
function primary(parent,label,callback,cls="story-button"){const b=put(parent,"button",cls,label);b.onclick=callback;return b}
function renderVisited(root){
 put(root,"div","scene-complete-banner","🌿 Ты уже помог этому месту.");
 primary(root,"✨ Вернуться к следующему делу",()=>chooseScene(activeSceneForStage(),true))
}
function renderIntro(root){
 put(root,"div","activity-head","🌟 Начало большой истории");
 put(root,"p","puzzle-hint","Сова Луна пригласит тебя стать Хранителем леса. Её можно потрогать на карте.");
 primary(root,"🦉 Поговорить с совой Луной",openTalk)
}
function openTalk(){
 if(state().stage!==0){story("Лес благодарен тебе! Впереди ждут новые открытия.","🦉 Сова Луна",true);return}
 $("talkText").textContent=hero==="kostya"?
 "Костя, наш лес теряет своё волшебство! Огоньки исчезли, цветы спят, мост рухнул, а в гнезде никто не просыпается. Ты поможешь нам вернуть свет?":
 "Кирилл, посмотри! Лес загрустил, а маленький дракончик спит. Давай вместе найдём огоньки, посадим цветочки и поможем всем друзьям!";
 $("talkTitle").textContent=hero==="kostya"?"Князь, лес зовёт тебя!":"Кудрявый, привет!";
 $("talkOverlay").classList.remove("hidden");say($("talkText").textContent)
}
function renderLights(root){
 put(root,"div","activity-head","Найдено огоньков: "+state().lights.filter(Boolean).length+" / 3");
 put(root,"p","puzzle-hint","Ищи сияющие огоньки на карте или нажимай на карточки ниже.");
 const grid=put(root,"div","firefly-buttons");
 F3_FIRE.forEach((f,i)=>{
  const found=state().lights[i],b=put(grid,"button","firefly-button"+(found?" found":""),found?"✨":"✦");
  b.disabled=found;b.setAttribute("aria-label",f.label);
  put(b,"span","mini-caption",found?"Найден!":f.label);
  b.onclick=()=>takeLight(i)
 })
}
function takeLight(i){
 if(state().stage!==1||!Number.isInteger(i)||i<0||i>=3||state().lights[i])return;
 state().lights[i]=true;const done=state().lights.filter(Boolean).length;moveActor(F3_FIRE[i].x,F3_FIRE[i].y);
 if(done===3){save();advance();return}save();render();feedback("✨ "+F3_FIRE[i].label+" вернулся! Осталось "+(3-done)+".");say("Отлично! Ты нашёл огонёк!")
}
function renderGarden(root){
 put(root,"div","activity-head","🌼 Посади все три волшебных семечка");
 put(root,"p","puzzle-hint","Выбери семечко и клумбу такого же цвета. Можно нажимать или перетаскивать.");
 const sources=put(root,"div","resource-row");
 F3_SEEDS.forEach((s,i)=>{
  const used=state().seeds[i],b=put(sources,"button","resource"+(used?" used":"")+(selectedSeed===i?" selected":""),s.symbol);
  b.disabled=used;b.setAttribute("aria-label",s.description);
  b.dataset.seed=String(i);
  b.onclick=()=>{if(state().stage!==2||used)return;selectedSeed=i;renderGardenInline();feedback("Теперь найди клумбу для семечка "+s.symbol)};
  bindDrag(b,i,"seed")
 });
 const slots=put(root,"div","place-row");
 F3_SEEDS.forEach((s,i)=>{
  const used=state().seeds[i],b=put(slots,"button","place"+(used?" done":""),used?s.flower:s.symbol);
  b.disabled=used;b.dataset.seedSlot=String(i);
  put(b,"small",null,s.target);b.onclick=()=>plantSeed(i)
 });
 put(root,"div","task-count",state().seeds.filter(Boolean).length+" из 3 клумб готовы");
}
function renderGardenInline(){
 const buttons=$("missionBody").querySelectorAll("[data-seed]");
 buttons.forEach(b=>b.classList.toggle("selected",Number(b.dataset.seed)===selectedSeed))
}
function plantSeed(i){
 if(state().stage!==2||state().seeds[i])return;
 if(selectedSeed===null){feedback("Сначала выбери семечко сверху.");return}
 if(selectedSeed!==i){feedback("💛 Цвета пока не совпадают. Попробуй другую клумбу.");return}
 state().seeds[i]=true;selectedSeed=null;const count=state().seeds.filter(Boolean).length;
 if(count===3){save();advance();return}save();render();feedback("🌸 Цветок вырос! Осталось "+(3-count)+".");say("Смотри! Цветочек вырос!")
}
function renderPatterns(root){
 const i=state().patterns,t=F3_PATTERN[hero][i];
 put(root,"div","activity-head","🔮 Мозаика "+(i+1)+" из 3");
 put(root,"div","pattern-line",t.visual);
 put(root,"p","puzzle-hint",t.q);
 const choices=put(root,"div","task-choices");
 t.choices.forEach(value=>{
  const b=put(choices,"button","task-choice"+(String(value).length>2?" textual":""),value);
  b.onclick=()=>{
   if(state().stage!==3)return;
   if(value!==t.correct){b.classList.add("wrong");feedback("💛 Посмотри на узор ещё раз. Попробуй другой вариант.");return}
   state().patterns++;if(state().patterns===3){save();advance();return}
   save();render();feedback("✨ Верно! Мозаика становится ярче.");say("Молодец! Узор оживает!")
  }
 })
}
function renderBridge(root){
 put(root,"div","activity-head","🪵 Построй мост: "+state().planks.filter(Boolean).length+" / 3");
 put(root,"p","puzzle-hint",hero==="kostya"?
 "На дощечках одна, две или три метки. Подбери правильную доску к числу на мосту.":
 "Подбери дощечку с таким же значком, как на мосту.");
 const pieces=F3_BRIDGE[hero],row=put(root,"div","resource-row");
 pieces.forEach((item,i)=>{
  const used=state().planks[i],b=put(row,"button","resource"+(used?" used":"")+(selectedPlank===i?" selected":""),item.symbol);
  b.disabled=used;b.dataset.plank=String(i);b.setAttribute("aria-label","Дощечка: "+item.label);
  b.onclick=()=>{if(state().stage!==4||used)return;selectedPlank=i;renderBridgeInline();feedback("Теперь найди место для этой дощечки.")};
  bindDrag(b,i,"plank")
 });
 const places=put(root,"div","place-row");
 pieces.forEach((item,i)=>{
  const done=state().planks[i],b=put(places,"button","place"+(done?" done":""),done?"🪵":item.target);
  b.disabled=done;b.dataset.plankSlot=String(i);b.setAttribute("aria-label","Место на мосту "+item.target);
  put(b,"small",null,done?"Построено!":"Место "+(i+1));b.onclick=()=>installPlank(i)
 });
 put(root,"div","task-count","Можно положить дощечку пальцем или перетащить на нужное место.");
}
function renderBridgeInline(){
 $("missionBody").querySelectorAll("[data-plank]").forEach(b=>b.classList.toggle("selected",Number(b.dataset.plank)===selectedPlank))
}
function installPlank(i){
 if(state().stage!==4||state().planks[i])return;
 if(selectedPlank===null){feedback("Сначала выбери дощечку выше.");return}
 if(selectedPlank!==i){feedback("💛 Эта дощечка подходит другому месту. Попробуй ещё.");return}
 state().planks[i]=true;selectedPlank=null;const done=state().planks.filter(Boolean).length;
 if(done===3){save();advance();return}save();render();feedback("🌉 Одна часть моста готова! Осталось "+(3-done)+".");say("Ура! Мост становится крепче!")
}
function bindDrag(btn,index,kind){
 let moving=false,start=null;
 btn.addEventListener("pointerdown",e=>{
  if((kind==="seed"&&state().stage!==2)||(kind==="plank"&&state().stage!==4))return;
  start=[e.clientX,e.clientY];moving=false;
  if(kind==="seed")selectedSeed=index;else selectedPlank=index;
  btn.classList.add("selected");
 });
 btn.addEventListener("pointermove",e=>{
  if(start&&Math.hypot(e.clientX-start[0],e.clientY-start[1])>15)moving=true
 });
 btn.addEventListener("pointerup",e=>{
  if(!moving||!start)return;
  const target=document.elementFromPoint?document.elementFromPoint(e.clientX,e.clientY):null;
  const slot=target&&target.closest?target.closest(kind==="seed"?"[data-seed-slot]":"[data-plank-slot]"):null;
  if(slot){const i=Number(slot.dataset[kind==="seed"?"seedSlot":"plankSlot"]);if(kind==="seed")plantSeed(i);else installPlank(i)}
  start=null;moving=false
 });
 btn.addEventListener("pointercancel",()=>{start=null;moving=false})
}
function renderMemory(root){
 const i=state().memory,info=F3_MEMORY[hero][i];
 put(root,"div","activity-head","🎵 Поющие камни: мелодия "+(i+1)+" из 2");
 if(memoryShowing){
  const prev=put(root,"div","memory-preview");
  put(prev,"div","memory-symbols",info.sequence.join(" "));
  put(prev,"div","puzzle-hint","Посмотри, запомни порядок и нажми кнопку.");
  primary(root,"✨ Я запомнил!",()=>{memoryShowing=false;memoryInput=[];render();feedback("Теперь нажимай на камни в том же порядке.")})
 }else{
  put(root,"p","puzzle-hint","Повтори цвета в том же порядке. Если забудешь, можно посмотреть ещё раз.");
  put(root,"div","memory-entry",memoryInput.join(" ")+"  "+"○ ".repeat(info.sequence.length-memoryInput.length));
  const choices=put(root,"div","memory-controls");
  info.choices.forEach(value=>{
   const b=put(choices,"button",null,value);
   b.setAttribute("aria-label","Камень "+value);
   b.onclick=()=>memoryPress(value)
  });
  primary(root,"👀 Посмотреть последовательность ещё раз",()=>{
   memoryShowing=true;memoryInput=[];render()
  },"quiet-button")
 }
 put(root,"div","task-count","Без таймера. Можно повторять столько раз, сколько нужно.");
}
function memoryPress(value){
 if(state().stage!==5||memoryShowing)return;
 const info=F3_MEMORY[hero][state().memory],n=memoryInput.length;
 if(value!==info.sequence[n]){memoryInput=[];feedback("💛 Попробуем снова. Можно посмотреть последовательность ещё раз.");render();feedback("💛 Давай попробуем снова. У тебя получится!");return}
 memoryInput.push(value);
 if(memoryInput.length===info.sequence.length){
  state().memory++;memoryShowing=true;memoryInput=[];
  if(state().memory===2){save();advance();return}save();render();feedback("🎵 Камни запели! Следующая мелодия.");say("Молодец! Мелодия получилась!")
 }else{render();feedback("✨ Правильно! Продолжай.")}
}
function renderEgg(root){
 const i=state().eggs,t=F3_EGGS[hero][i];
 put(root,"div","activity-head","🥚 Поможем дракончику: "+(i+1)+" из 3");
 put(root,"div","final-seal",i===0?"🥚":i===1?"🥚✨":"🐲✨");
 if(t.visual)put(root,"div","pattern-line",t.visual);
 put(root,"p","puzzle-hint",t.q);
 const choices=put(root,"div","task-choices");
 t.choices.forEach(value=>{
  const b=put(choices,"button","task-choice"+(String(value).length>2?" textual":""),value);
  b.onclick=()=>{
   if(state().stage!==6)return;
   if(value!==t.correct){b.classList.add("wrong");feedback("💛 Почти! Дракончик верит в тебя. Попробуй ещё.");return}
   state().eggs++;
   if(state().eggs===3){save();advance();return}
   save();render();feedback("✨ Яйцо засветилось ещё ярче!");say("Ура! Дракончик скоро проснётся!")
  }
 })
}
function renderFinish(root){
 put(root,"div","scene-complete-banner","🏆 Медаль Хранителя леса получена!");
 put(root,"p","puzzle-hint","Ты прошёл всю историю. Лес теперь живёт и светится благодаря тебе.");
 primary(root,"🏰 В семейную Академию",()=>{window.location.href="./?v=30"})
}
function resetChapter(){
 if(!window.confirm("Начать главу сначала? Медаль за первое прохождение сохранится."))return;
 const previous=state(),replay=f3Empty();replay.medal=previous.medal;replay.replays=previous.replays+1;
 family.forest3.heroes[hero]=replay;scene="grove";selectedSeed=null;selectedPlank=null;
 save();render();story("Лес готов к новому приключению! Поговори с совой Луной.","🦉 Сова Луна",true)
}
function switchHero(){
 hero=hero==="kostya"?"kirill":"kostya";save();scene=activeSceneForStage();selectedSeed=null;selectedPlank=null;memoryShowing=true;memoryInput=[];
 render();story("Привет, "+F3_NAMES[hero]+"! Твой лес и твои открытия ждут тебя.","🦉 Сова Луна",true)
}
function init(){
 $("voiceToggle").onclick=()=>{
  family.settings.voice=!family.settings.voice;save();render();
  if(family.settings.voice)say("Привет! Я сова Луна. Добро пожаловать в волшебный лес!")
 };
 $("sayStory").onclick=()=>say($("storyText").textContent,true);
 $("switchHero").onclick=switchHero;
 document.querySelectorAll("[data-scene]").forEach(b=>b.onclick=()=>chooseScene(b.dataset.scene,true));
 $("owlHotspot").onclick=openTalk;
 $("saplingHotspot").onclick=()=>{if(state().stage===2){chooseScene("garden");feedback("Выбери цвет семечка и подходящую клумбу.")}else story("Сад оживает от твоей заботы!","🦉 Сова Луна",true)};
 $("riverHotspot").onclick=()=>{if(state().stage===5)story("Посмотри на камни и запомни их мелодию.","🦉 Сова Луна",true);else story("Вода несёт в лес новые песни.","🦉 Сова Луна",true)};
 $("nestHotspot").onclick=()=>{if(state().stage===6)story("Скорее помоги дракончику выбраться из яйца!","🦉 Сова Луна",true);else story("Теперь здесь живёт наш новый друг, Искрик!","🦉 Сова Луна",true)};
 $("missionHint").onclick=()=>{const t=F3_HINTS[state().stage];feedback("💡 "+t);say(t,true)};
 $("missionReset").onclick=resetChapter;
 $("replayChapter").onclick=resetChapter;
 $("talkClose").onclick=()=>{$("talkOverlay").classList.add("hidden")};
 $("talkAccept").onclick=()=>{$("talkOverlay").classList.add("hidden");if(state().stage===0)advance()};
 document.addEventListener("keydown",e=>{if(e.key==="Escape")$("talkOverlay").classList.add("hidden")});
 render()
}
document.addEventListener("DOMContentLoaded",init,{once:true});
