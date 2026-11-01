/* Living Forest v41: independent, repeatable touch interactions.
   Progress is stored separately from story/Academy saves. All art is original SVG. */
(function(root,doc){
"use strict";
const STORAGE="forest-living-world-v1";
const ICONS={
 leaves:'<path d="M31 57V29" stroke="#815b46" stroke-width="7" stroke-linecap="round"/><path d="M31 36C9 39 7 17 20 13C24 2 46 4 47 17C61 24 51 43 31 36Z" fill="#9ce69e" stroke="#397b66" stroke-width="3"/><path d="M28 23L33 35M43 20L33 33" stroke="#d5ffd0" stroke-width="3" stroke-linecap="round"/>',
 bells:'<path d="M12 12H52M20 12V22M33 12V17M46 12V22" stroke="#eadcb5" stroke-width="4" stroke-linecap="round"/><path d="M15 22H25V43H15Z" fill="#ffdc8b"/><path d="M28 17H38V49H28Z" fill="#f0a774"/><path d="M41 22H51V43H41Z" fill="#b7f0de"/><circle cx="20" cy="47" r="4" fill="#fff8bc"/><circle cx="33" cy="54" r="4" fill="#fff8bc"/><circle cx="46" cy="47" r="4" fill="#fff8bc"/>',
 rain:'<path d="M16 35C5 33 8 17 20 18C24 5 43 7 45 20C58 17 61 33 49 35Z" fill="#f5fcf2" stroke="#92c9cf" stroke-width="3"/><path d="M20 43L17 51M32 43L29 55M44 43L41 51" stroke="#6bd9f5" stroke-width="5" stroke-linecap="round"/>',
 bug:'<path d="M17 38Q8 26 15 18M47 38Q56 26 49 18" fill="none" stroke="#c3f2db" stroke-width="4"/><ellipse cx="32" cy="38" rx="21" ry="19" fill="#ff9181" stroke="#7b3c49" stroke-width="3"/><path d="M32 19V56" stroke="#7b3c49" stroke-width="4"/><circle cx="22" cy="30" r="4" fill="#583b4a"/><circle cx="41" cy="42" r="4" fill="#583b4a"/><circle cx="23" cy="47" r="3" fill="#583b4a"/><circle cx="32" cy="17" r="9" fill="#433746"/>',
 water:'<ellipse cx="32" cy="41" rx="26" ry="12" fill="none" stroke="#b2f8ff" stroke-width="4"/><ellipse cx="32" cy="41" rx="13" ry="6" fill="none" stroke="#7fe1fc" stroke-width="4"/><path d="M32 7C25 20 21 25 24 32Q32 39 40 32C43 25 39 20 32 7Z" fill="#cffaff" stroke="#69c6e2" stroke-width="3"/>',
 fish:'<path d="M10 32L3 18V46Z" fill="#95d9ce"/><path d="M10 32Q29 9 53 25Q60 32 53 39Q29 55 10 32Z" fill="#ffdc8e" stroke="#c28d6b" stroke-width="3"/><path d="M28 26L34 9L42 27" fill="#a4f0d6"/><circle cx="46" cy="29" r="3" fill="#24414e"/><path d="M48 36Q44 40 39 38" fill="none" stroke="#bd7360" stroke-width="2"/>',
 crystal:'<path d="M17 18L30 5L47 18L53 38L32 60L11 38Z" fill="#a9a3f7" stroke="#e6edff" stroke-width="3"/><path d="M17 18H47L32 60Z" fill="#80e1de"/><path d="M30 5L32 60L47 18" fill="none" stroke="#f7f5ff" stroke-width="3" opacity=".8"/>',
 star:'<path d="M32 4L40 23L60 25L45 38L49 58L32 47L15 58L19 38L4 25L24 23Z" fill="#ffe69a" stroke="#fff7d5" stroke-width="3"/><circle cx="26" cy="34" r="2.6" fill="#765e6e"/><circle cx="39" cy="34" r="2.6" fill="#765e6e"/><path d="M27 39Q32 43 37 39" stroke="#765e6e" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
};
const OBJECTS=[
 {id:"leaves",scene:"grove",x:13,y:27,name:"Шелест листвы",icon:"leaves",effect:"wind",cue:"flower",line:"Деревья машут тебе ветвями. Слышишь, как шелестят листья?"},
 {id:"bells",scene:"grove",x:85,y:32,name:"Лесные колокольчики",icon:"bells",effect:"bells",cue:"good",line:"Динь-динь! Волшебные колокольчики приветствуют тебя."},
 {id:"rain",scene:"garden",x:43,y:26,name:"Тёплый дождик",icon:"rain",effect:"rain",cue:"flower",line:"Кап-кап! Цветочки пьют дождевую воду и тянутся к солнышку."},
 {id:"bug",scene:"garden",x:88,y:40,name:"Божья коровка",icon:"bug",effect:"bug",cue:"select",line:"Божья коровка раскрыла крылышки и полетела в гости к цветам."},
 {id:"water",scene:"river",x:21,y:37,name:"Круги на воде",icon:"water",effect:"ripples",cue:"bridge",line:"Плюх! По ручью побежали волшебные круги."},
 {id:"fish",scene:"river",x:76,y:31,name:"Весёлая рыбка",icon:"fish",effect:"fish",cue:"good",line:"Рыбка выпрыгнула из воды и показала серебристый хвостик."},
 {id:"crystal",scene:"clearing",x:33,y:34,name:"Кристалл света",icon:"crystal",effect:"crystal",cue:"firefly",line:"Кристалл засиял! Драконья поляна становится светлее."},
 {id:"star",scene:"clearing",x:79,y:27,name:"Звезда дружбы",icon:"star",effect:"starlight",cue:"medal",line:"Звезда дружбы послала добрый привет маленькому дракончику."}
];
const $=id=>doc.getElementById(id);
let mounted=false,fadeTimer=null;
function api(){return root.Forest3Public}
function read(){
 try{const value=JSON.parse(root.localStorage.getItem(STORAGE)||"{}");return value&&typeof value==="object"&&!Array.isArray(value)?value:{}}
 catch(error){return {}}
}
function discoveries(hero){
 const saved=read()[hero];
 return Array.isArray(saved)?saved.filter(id=>typeof id==="string"&&OBJECTS.some(o=>o.id===id)):[]
}
function remember(id){
 const who=api().hero();
 const saved=read(),all=new Set(discoveries(who));
 const first=!all.has(id);
 all.add(id);
 saved[who]=[...all];
 try{root.localStorage.setItem(STORAGE,JSON.stringify(saved))}
 catch(error){ /* game remains playable without local storage */ }
 return first
}
function motionOff(){
 return $("forestApp")?.classList.contains("reduce-motion")||
 !!root.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}
function mount(){
 if(mounted||!api()||!$("worldScene"))return;
 const layer=doc.createElement("div");layer.id="worldActivities";layer.className="world-activities";
 layer.setAttribute("aria-label","Игровые предметы леса");
 $("worldScene").appendChild(layer);
 const footer=doc.createElement("div");footer.className="world-activity-footer";
 footer.innerHTML='<span aria-hidden="true">🌿</span><span>Лес отвечает на касания <strong id="worldActivityCount">0 / 8</strong><small id="worldActivityHint">Нажми на предмет, и он оживёт. Можно играть снова!</small></span>';
 const anchor=$("scenePicker");anchor?.insertAdjacentElement("afterend",footer);
 for(const item of OBJECTS){
  const b=doc.createElement("button");b.type="button";
  b.className="world-activity";b.dataset.object=item.id;
  b.style.left=item.x+"%";b.style.top=item.y+"%";
  b.setAttribute("aria-label","Оживить: "+item.name);
  b.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">'+ICONS[item.icon]+'</svg><small>'+item.name+'</small>';
  b.addEventListener("click",()=>activate(item,b));
  layer.appendChild(b)
 }
 mounted=true
}
function sparkles(item){
 if(motionOff())return;
 const surface=$("sceneCelebration");if(!surface)return;
 const spark=doc.createElement("span");spark.className="world-activity-sparks";
 spark.style.left=item.x+"%";spark.style.top=item.y+"%";
 for(let i=0;i<8;i++){
  const e=doc.createElement("span");e.textContent=i%2?"✧":"✦";
  e.style.setProperty("--dx",Math.round(Math.cos(i*Math.PI/4)*65)+"px");
  e.style.setProperty("--dy",Math.round(Math.sin(i*Math.PI/4)*55)+"px");
  spark.appendChild(e)
 }
 surface.appendChild(spark);
 root.setTimeout(()=>spark.remove(),1000)
}
function activate(item,button){
 if(!api()||api().stage()===0||api().scene()!==item.scene)return;
 const first=remember(item.id);
 const scene=$("worldScene");
 if(!scene)return;
 const classes=["wind","bells","rain","bug","ripples","fish","crystal","starlight"].map(x=>"world-"+x);
 scene.classList.remove(...classes);
 button.classList.remove("reacting");
 void scene.offsetWidth;
 scene.classList.add("world-"+item.effect);
 button.classList.add("reacting");
 root.clearTimeout(fadeTimer);
 fadeTimer=root.setTimeout(()=>{
  scene.classList.remove(...classes);
  button.classList.remove("reacting")
 },1050);
 sparkles(item);
 const hero=$("heroActor");
 if(hero&&!motionOff()){
  hero.classList.remove("cheer");void hero.offsetWidth;hero.classList.add("cheer");
  root.setTimeout(()=>hero.classList.remove("cheer"),850)
 }
 if(root.AcademySound)root.AcademySound.cue(item.cue);
 const speaker=$("speakerName"),story=$("storyText");
 if(speaker)speaker.textContent="🌿 Живой лес";
 if(story)story.textContent=item.line;
 if(first&&root.AcademyVoice)root.AcademyVoice.speak(item.line,{role:"owl"});
 render()
}
function render(){
 mount();
 if(!mounted||!api())return;
 const scene=api().scene(),stage=api().stage();
 const found=new Set(discoveries(api().hero()));
 for(const b of $("worldActivities").children){
  const item=OBJECTS.find(o=>o.id===b.dataset.object);
  const visible=stage>0&&item.scene===scene;
  b.classList.toggle("hidden",!visible);
  b.classList.toggle("visited",found.has(item.id));
  b.disabled=!visible;
  b.setAttribute("aria-label",(found.has(item.id)?"Поиграть снова: ":"Оживить: ")+item.name)
 }
 const counter=$("worldActivityCount");
 if(counter)counter.textContent=found.size+" / "+OBJECTS.length;
 const hint=$("worldActivityHint");
 if(hint)hint.textContent=stage===0?"Сначала познакомься с совой Луной.":
 found.size===OBJECTS.length?"Все предметы ожили! Их можно трогать снова.":
 "Нажми на предмет, и он оживёт. Можно играть снова!"
}
root.ForestWorld={render,objects:()=>OBJECTS.map(o=>({id:o.id,scene:o.scene}))};
})(window,document);
