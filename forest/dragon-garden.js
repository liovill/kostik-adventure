
"use strict";
// Shared dragon garden. Every completed activity variant grants one heart once.
const DRAGON_ACTIVITY_DATA={
kostya:{
feed:[
{q:"Сколько яблок мы собрали?",visual:"🍎 🍎 🍎",options:["2","3","4"],answer:"3",say:"Посчитай яблоки. Сколько их?"},
{q:"Какой фрукт растёт на яблоне?",visual:"🌳",options:["🍌","🍎","🍐"],answer:"🍎",say:"Какой фрукт растёт на яблоне?"},
{q:"Было четыре ягодки, одну съели. Сколько осталось?",visual:"4 − 1 = ❓",options:["2","3","5"],answer:"3",say:"Было четыре ягодки, одну съели. Сколько осталось?"},
{q:"Какую еду выбирают для фруктового угощения?",visual:"🧺",options:["🍎","🧸","⚽"],answer:"🍎",say:"Что положим в корзинку с фруктовым угощением?"}
],
colors:[
{q:"Какой цвет продолжит узор?",visual:"🔴 🟡 🔴 🟡 ❓",options:["🟡","🟢","🔴"],answer:"🔴",say:"Красный, жёлтый, красный, жёлтый. Какой цвет дальше?"},
{q:"Какой цвет получится, если смешать синий и жёлтый?",visual:"🔵 + 🟡 = ❓",options:["🟢","🟣","🔴"],answer:"🟢",say:"Какой цвет получится, если смешать синий и жёлтый?"},
{q:"Какой цвет продолжит узор?",visual:"🟢 🟢 🔵 🟢 🟢 ❓",options:["🔴","🔵","🟡"],answer:"🔵",say:"Зелёный, зелёный, синий, зелёный, зелёный. Что дальше?"},
{q:"Какой предмет такого же цвета, как солнце?",visual:"☀️",options:["🟣","🟡","🔵"],answer:"🟡",say:"Выбери цвет солнца."}
],
memory:[
{kind:"memory",q:"Запомни волшебный знак",visual:"🦋",options:["🐝","🦋","🌼"],answer:"🦋"},
{kind:"memory",q:"Запомни волшебный знак",visual:"🔮",options:["💎","⭐","🔮"],answer:"🔮"},
{kind:"memory",q:"Запомни волшебный знак",visual:"🌠",options:["🌠","☁️","☀️"],answer:"🌠"},
{kind:"memory",q:"Запомни волшебный знак",visual:"🍄",options:["🌻","🍄","🌲"],answer:"🍄"}
]
},
kirill:{
feed:[
{q:"Найди яблочко для Искрика",visual:"",options:["🍌","🍎","🍐"],answer:"🍎",say:"Найди яблочко для Искрика."},
{q:"Где морковка?",visual:"",options:["🥕","🍒","🍉"],answer:"🥕",say:"Где морковка?"},
{q:"Найди банан",visual:"",options:["🍎","🍋","🍌"],answer:"🍌",say:"Найди банан."},
{q:"Где клубничка?",visual:"",options:["🍓","🍐","🍇"],answer:"🍓",say:"Где клубничка?"}
],
colors:[
{q:"Найди красный цвет",visual:"",options:["🔴","🟢","🔵"],answer:"🔴",say:"Найди красный цвет."},
{q:"Найди синий цвет",visual:"",options:["🟡","🔵","🟣"],answer:"🔵",say:"Найди синий цвет."},
{q:"Найди жёлтый цвет",visual:"",options:["🟡","🔴","🟢"],answer:"🟡",say:"Найди жёлтый цвет."},
{q:"Найди зелёный цвет",visual:"",options:["🔵","🟢","🟠"],answer:"🟢",say:"Найди зелёный цвет."}
],
memory:[
{kind:"memory",q:"Посмотри и запомни",visual:"⭐",options:["🌙","⭐","☀️"],answer:"⭐"},
{kind:"memory",q:"Посмотри и запомни",visual:"🐱",options:["🐶","🐱","🐻"],answer:"🐱"},
{kind:"memory",q:"Посмотри и запомни",visual:"🌷",options:["🍄","🌻","🌷"],answer:"🌷"},
{kind:"memory",q:"Посмотри и запомни",visual:"🐲",options:["🐲","🐸","🐰"],answer:"🐲"}
]
}
};
const DRAGON_ACTIONS=[{key:"feed",label:"Угощение",icon:"🍎",desc:"Фрукты и счёт"},{key:"colors",label:"Магия цветов",icon:"🎨",desc:"Цвета и узоры"},{key:"memory",label:"Память Искрика",icon:"🧠",desc:"Запомни символ"}];
let petCurrent=null,petSolved=false,petMemoryRevealed=false,petReplay={feed:0,colors:0,memory:0},petStageAtOpen=0;
function petCount(h){const info=state.pet&&state.pet.done&&state.pet.done[h];if(!info)return 0;return DRAGON_ACTIONS.reduce((n,a)=>n+(Array.isArray(info[a.key])?info[a.key].filter(Boolean).length:0),0)}
function petFamilyHearts(){return petCount("kostya")+petCount("kirill")}
function petHatched(){return petFamilyHearts()>=3||familyTotal()>=4}
function petAge(){return !petHatched()?0:petFamilyHearts()>=10?2:1}
function petBadge(){const n=petAge();return n===0?"🥚 Волшебное яйцо":n===1?"🐲 Дракончик Искрик":"🐉 Искрик вырос!"}
function dragonArt(age){if(age===0)return '<svg viewBox="0 0 350 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Волшебное яйцо дракончика"><defs><linearGradient id="shell" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#fff9e1"/><stop offset=".5" stop-color="#d5f6c0"/><stop offset="1" stop-color="#92c1a2"/></linearGradient></defs><ellipse cx="175" cy="285" rx="113" ry="20" fill="#1c665c" opacity=".4"/><path d="M173 38C84 37 53 138 86 230C101 283 149 296 177 296C246 296 279 243 265 173C252 87 218 38 173 38Z" fill="url(#shell)" stroke="#77a999" stroke-width="7"/><path d="M115 107L138 81L162 111L188 78L210 111L235 95" fill="none" stroke="#ffffffbb" stroke-width="8" stroke-linejoin="round"/><path d="M111 190L145 170L168 196L196 175L226 193" fill="none" stroke="#81b6b0aa" stroke-width="10" stroke-linejoin="round"/><path d="M143 232L162 214L187 236L210 218" fill="none" stroke="#ffffff8e" stroke-width="8"/><path d="M105 95C124 65 152 57 175 55" fill="none" stroke="#fff" stroke-width="14" opacity=".65" stroke-linecap="round"/><path d="M150 126Q176 100 201 126" fill="none" stroke="#b4dfbd" stroke-width="12" stroke-linecap="round"/><circle cx="157" cy="150" r="8" fill="#96bea7"/><circle cx="191" cy="150" r="8" fill="#96bea7"/><path d="M158 171Q175 183 190 171" stroke="#7aab8d" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M66 70L74 47L81 70L106 76L80 85L73 107L66 85L43 77Z" fill="#fff7b3"/><circle cx="270" cy="83" r="9" fill="#fff6c4"/><path d="M291 211L296 198L301 211L316 216L302 221L297 233L292 221L279 216Z" fill="#f7eb9d"/></svg>';
return '<svg viewBox="0 0 420 350" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Добрый зелёный дракончик Искрик"><defs><linearGradient id="dragonBody" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#9cefc0"/><stop offset=".55" stop-color="#4dcba0"/><stop offset="1" stop-color="#269c8c"/></linearGradient><linearGradient id="dragonWing" x1="0" y1="0" x2=".5" y2="1"><stop stop-color="#9b90f0"/><stop offset="1" stop-color="#575ab4"/></linearGradient></defs>'+
'<ellipse cx="203" cy="313" rx="115" ry="19" fill="#205a60" opacity=".35"/>'+
'<g class="dragon-tail"><path d="M259 239Q344 264 359 212Q370 168 330 174Q347 194 333 211Q318 229 262 207" fill="#39b89b" stroke="#208b7d" stroke-width="7"/><path d="M350 181L376 160L369 199Z" fill="#77d4b0"/></g>'+
'<g class="dragon-wing"><path d="M164 181Q87 118 56 82Q77 91 79 61Q110 100 124 92Q140 91 133 60Q189 100 200 176Z" fill="url(#dragonWing)" stroke="#5158ac" stroke-width="6"/><path d="M160 171L87 92M165 174L132 86" fill="none" stroke="#bfb7ff" stroke-width="5"/></g>'+
'<g class="dragon-wing"><path d="M259 178Q316 126 340 93Q334 130 359 130Q350 158 333 173Q352 177 373 165Q331 222 257 221Z" fill="url(#dragonWing)" stroke="#5158ac" stroke-width="6"/></g>'+
'<path d="M147 210Q134 151 192 144Q269 136 278 210Q292 284 234 298Q153 307 147 210Z" fill="url(#dragonBody)" stroke="#1f9684" stroke-width="7"/>'+
'<ellipse cx="214" cy="238" rx="47" ry="56" fill="#d9f4c4" stroke="#b5e7b5" stroke-width="4"/>'+
'<path d="M159 275Q143 282 131 299Q136 313 172 307L186 283M248 283Q264 289 282 303Q281 319 241 310L232 290" fill="#49bfa0" stroke="#1d9987" stroke-width="6" stroke-linejoin="round"/>'+
'<path d="M157 169Q144 148 122 150Q103 155 118 174L152 196M266 166Q283 148 302 156Q320 170 296 186L267 197" fill="url(#dragonBody)" stroke="#218c7f" stroke-width="6"/>'+
'<path d="M157 76L141 40Q166 39 182 62L207 43Q224 58 225 78" fill="#e5bb7d" stroke="#b18c5c" stroke-width="5"/>'+
'<path d="M154 98L130 74L150 72L175 92M246 95L276 75L271 102L252 117" fill="#3bbd9e" stroke="#238f82" stroke-width="6"/>'+
'<path d="M139 133Q140 61 218 61Q291 64 282 138Q278 192 240 206Q202 218 164 196Q130 179 139 133Z" fill="url(#dragonBody)" stroke="#1e9885" stroke-width="7"/>'+
'<path d="M169 167Q194 139 235 153Q262 160 268 185Q256 214 211 213Q167 214 152 188Z" fill="#a5e8b8" stroke="#6bc9a7" stroke-width="5"/>'+
'<ellipse class="eye" cx="173" cy="130" rx="14" ry="19" fill="#203b4c"/><ellipse class="eye" cx="249" cy="130" rx="14" ry="19" fill="#203b4c"/>'+
'<ellipse cx="169" cy="123" rx="5" ry="7" fill="#fff"/><ellipse cx="245" cy="123" rx="5" ry="7" fill="#fff"/>'+
'<circle cx="184" cy="186" r="5" fill="#477a73"/><circle cx="240" cy="186" r="5" fill="#477a73"/>'+
'<path d="M185 194Q212 219 241 194" stroke="#398973" stroke-width="5" fill="none" stroke-linecap="round"/>'+
'<ellipse cx="153" cy="173" rx="12" ry="7" fill="#fbadb0" opacity=".62"/><ellipse cx="271" cy="172" rx="12" ry="7" fill="#fbadb0" opacity=".62"/>'+
(age===2?'<path d="M88 41L94 22L100 41L120 47L100 53L94 73L88 53L69 47Z" fill="#ffe79b"/><path d="M338 48L344 29L350 48L370 54L350 60L344 80L338 60L319 54Z" fill="#fff6bb"/>':'')+'</svg>'}
function petTaskIndex(key){const done=state.pet.done[state.active][key];const next=done.findIndex(x=>!x);if(next>=0)return next;const chosen=petReplay[key]%done.length;petReplay[key]++;return chosen}
function drawGarden(){const age=petAge(),total=petFamilyHearts();$("gardenHero").innerHTML=avatar(state.active);$("gardenHeading").textContent=age===0?"Разбудим Искрика!":age===1?"Искрик ждёт тебя!":"Искрик и волшебный сад";$("gardenDescription").textContent=age===0?"Помоги братьям разбудить яйцо дракончика. Каждое новое задание добавляет сердечко заботы.":"Здесь можно играть, учиться и помогать Искрику. Он рад видеть тебя в любое время!";$("petTouch").innerHTML=dragonArt(age);$("petTouch").classList.toggle("egg",age===0);$("petLevelTag").textContent=petBadge();$("petHearts").textContent="❤️ "+total+" / 24";$("petProgress").style.width=Math.min(100,total/24*100)+"%";$("petMessage").textContent=age===0?"🥚 Искрик спит. Поможем ему вылупиться!":age===1?"🐲 Искрик рад играть с тобой!":"🐉 Искрик подрос благодаря вашей заботе!";$("gardenFamily").innerHTML="";for(const h of Object.keys(NAMES)){const box=document.createElement("div");box.className="family-card";const icon=document.createElement("span");icon.className="symbol";icon.textContent=h==="kostya"?"🧙‍♂️":"👶🏼";const text=document.createElement("span");const title=document.createElement("strong");title.textContent=NAMES[h]+": "+petCount(h)+" ❤️";const small=document.createElement("small");small.textContent="Из 12 открытий";text.appendChild(title);text.appendChild(small);box.appendChild(icon);box.appendChild(text);$("gardenFamily").appendChild(box)}for(const action of DRAGON_ACTIONS){$("petCount-"+action.key).textContent=state.pet.done[state.active][action.key].filter(Boolean).length+" / 4"}}
function petStart(key){if(window.AcademySound)window.AcademySound.cue("select");if(!DRAGON_ACTIVITY_DATA[state.active]||!DRAGON_ACTIVITY_DATA[state.active][key])return;const i=petTaskIndex(key);petCurrent={key,i,task:DRAGON_ACTIVITY_DATA[state.active][key][i]};petSolved=false;petMemoryRevealed=false;$("petOverlay").classList.remove("hidden");$("petFeedback").textContent="";$("petContinue").classList.add("hidden");$("petAnswers").innerHTML="";$("petMemory").innerHTML="";$("petMemory").classList.add("hidden");$("petVisual").textContent="";$("petSubtitle").textContent="Помоги Искрику и получи сердечко за новое открытие.";$("petTitle").textContent=petCurrent.task.q;$("petActivityLabel").textContent=DRAGON_ACTIONS.find(a=>a.key===key).icon+" "+DRAGON_ACTIONS.find(a=>a.key===key).label+" · "+(i+1)+" / 4";$("petVisual").textContent=petCurrent.task.visual||"";if(petCurrent.task.kind==="memory")petShowMemory();else petChoices();if(state.settings.voice)speak(petCurrent.task.say||petCurrent.task.q,false,"dragon")}
function petChoices(){const t=petCurrent.task;$("petAnswers").innerHTML="";for(const answer of t.options){const button=document.createElement("button");button.className=answer.length>3?"long":"";button.textContent=answer;button.onclick=()=>petAnswer(answer,button);$("petAnswers").appendChild(button)}}
function petShowMemory(){const root=$("petMemory");root.classList.remove("hidden");$("petVisual").textContent="";const sign=document.createElement("div");sign.className="pet-memory-preview";sign.textContent=petCurrent.task.visual;const hint=document.createElement("p");hint.className="muted";hint.textContent="Посмотри и запомни. Когда будешь готов, нажми кнопку!";const button=document.createElement("button");button.className="button";button.textContent="✨ Я запомнил!";button.onclick=()=>{root.innerHTML="";root.classList.add("hidden");petMemoryRevealed=true;$("petTitle").textContent="Какой знак ты видел?";petChoices();if(state.settings.voice)speak("Какой знак ты видел?",false,"dragon")};root.appendChild(sign);root.appendChild(hint);root.appendChild(button)}
function petAnswer(value,button){if(!petCurrent||petSolved)return;if(value!==petCurrent.task.answer){if(window.AcademySound)window.AcademySound.cue("try");button.classList.add("incorrect");button.disabled=true;$("petFeedback").textContent="💛 Попробуй ещё!";if(state.settings.voice)speak("Попробуй ещё, у тебя получится!",false,"dragon");return}petSolved=true;if(window.AcademySound)window.AcademySound.cue("dragon");button.classList.add("correct");$("petAnswers").querySelectorAll("button").forEach(b=>b.disabled=true);const had=state.pet.done[state.active][petCurrent.key][petCurrent.i];if(!had){state.pet.done[state.active][petCurrent.key][petCurrent.i]=true;save();$("petFeedback").textContent="🎉 Молодец! Новое сердечко для Искрика! ❤️"}else $("petFeedback").textContent="🌟 Молодец! Ты повторил знакомое задание!";$("petContinue").classList.remove("hidden");$("petContinue").textContent="🐲 К Искрику";$("petContinue").onclick=()=>petClose();if(state.settings.voice)speak("Ура! Правильно! Искрик радуется!",false,"dragon")}
function petClose(){$("petOverlay").classList.add("hidden");petCurrent=null;if(window.AcademyVoice)window.AcademyVoice.stop();if(view==="garden"){const lastAge=petStageAtOpen;drawGarden();if(lastAge<petAge()){petStageAtOpen=petAge();const hint=petAge()===1?"🎉 Ура! Искрик вылупился из яйца!":"🐉 Искрик подрос! Братья помогли ему стать сильнее!";$("petMessage").textContent=hint;notify(hint);if(!state.settings.reduceMotion){$("petTouch").classList.add("celebrating");setTimeout(()=>$("petTouch").classList.remove("celebrating"),1600)}if(state.settings.voice)speak(hint,false,"dragon")}}}
function gardenPetTouch(){if(view!=="garden")return;if(window.AcademySound)window.AcademySound.cue("tap");$("petMessage").textContent=petAge()===0?"🥚 Слышишь? Искрик шевелится в яйце!":"🐲 Искрик улыбается и машет крыльями!";$("petTouch").classList.remove("celebrating");void $("petTouch").offsetWidth;$("petTouch").classList.add("celebrating");setTimeout(()=>$("petTouch").classList.remove("celebrating"),1500)}
function gardenBind(){$("petTouch").onclick=gardenPetTouch;$("petClose").onclick=petClose;$("petContinue").onclick=petClose;$("petSpeak").onclick=()=>{if(!petCurrent)return;speak(petMemoryRevealed?"Какой знак ты видел?":petCurrent.task.say||petCurrent.task.q,true,"dragon")};document.querySelectorAll("[data-pet]").forEach(b=>b.onclick=()=>petStart(b.dataset.pet));$("petBackMap").onclick=()=>show("map")}
gardenBind();
