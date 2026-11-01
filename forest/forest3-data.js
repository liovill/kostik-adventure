"use strict";
/* Forest 3.0: story-led interactions tailored for two different ages. */
const F3_STAGES=[
 {scene:"grove",icon:"🦉",title:"Тайна совы Луны",desc:"Поговори с совой. Она знает, почему волшебный лес потускнел.",name:"Знакомство"},
 {scene:"grove",icon:"✨",title:"Потерянные огоньки",desc:"Найди три светлячка. Каждая искорка возвращает лесу немного света.",name:"Огоньки"},
 {scene:"garden",icon:"🌱",title:"Разбуди волшебный сад",desc:"Подбери семена к клумбам по цвету. Цветы вырастут прямо у тебя на глазах.",name:"Живой сад"},
 {scene:"garden",icon:"🔮",title:"Мозаика мудрой совы",desc:"Продолжи волшебные последовательности, чтобы открыть дорогу к реке.",name:"Узоры"},
 {scene:"river",icon:"🪵",title:"Мост через ручей",desc:"Подбери дощечки к подходящим местам. Мост будет строиться после каждого твоего действия.",name:"Мост"},
 {scene:"river",icon:"🎵",title:"Поющие камни",desc:"Запомни мелодию цветных камней и повтори её. Можно пересмотреть подсказку сколько угодно раз.",name:"Камни"},
 {scene:"clearing",icon:"🥚",title:"Яйцо маленького дракона",desc:"Реши три загадки лесных жителей и помоги волшебному яйцу проснуться.",name:"Дракон"},
 {scene:"clearing",icon:"🏆",title:"Сердце леса спасено!",desc:"Лес вновь сияет! Ты помог его жителям и стал настоящим хранителем.",name:"Победа"}
];
const F3_FIRE=[
 {x:38,y:34,icon:"✦",label:"Первый огонёк"},
 {x:74,y:49,icon:"✧",label:"Второй огонёк"},
 {x:24,y:71,icon:"✦",label:"Третий огонёк"}
];
const F3_SEEDS=[
 {id:"red",symbol:"🔴",target:"Красная клумба",flower:"🌹",description:"Красное семечко"},
 {id:"blue",symbol:"🔵",target:"Синяя клумба",flower:"🪻",description:"Синее семечко"},
 {id:"yellow",symbol:"🟡",target:"Жёлтая клумба",flower:"🌻",description:"Жёлтое семечко"}
];
const F3_BRIDGE={
 kostya:[
  {id:"one",symbol:"●",label:"Одна метка",target:"1"},
  {id:"two",symbol:"●●",label:"Две метки",target:"2"},
  {id:"three",symbol:"●●●",label:"Три метки",target:"3"}
 ],
 kirill:[
  {id:"sun",symbol:"☀️",label:"Солнышко",target:"☀️"},
  {id:"leaf",symbol:"🍀",label:"Листочек",target:"🍀"},
  {id:"flower",symbol:"🌸",label:"Цветочек",target:"🌸"}
 ]
};
const F3_PATTERN={
 kostya:[
  {visual:"🌙 ⭐ 🌙 ⭐ ❓",q:"Какой знак должен быть следующим?",correct:"🌙",choices:["🌙","🌟","⭐"],say:"Луна, звезда, луна, звезда. Какой символ дальше?"},
  {visual:"🟢 🟢 🔵 🟢 🟢 ❓",q:"Чем закончится узор?",correct:"🔵",choices:["🟢","🟡","🔵"],say:"Два зелёных, один синий. Два зелёных. Что идёт дальше?"},
  {visual:"1  ·  3  ·  5  ·  ❓",q:"Какое число дальше?",correct:"7",choices:["6","7","8"],say:"Один, три, пять. Какое число будет следующим?"}
 ],
 kirill:[
  {visual:"🔴 🔴 ❓",q:"Найди такой же цвет!",correct:"🔴",choices:["🔴","🔵","🟢"],say:"Красный, красный. Найди такой же цвет."},
  {visual:"🐱 🐱 ❓",q:"Найди такого же зверька!",correct:"🐱",choices:["🐶","🐱","🐸"],say:"Кошечка и кошечка. Где такая же кошечка?"},
  {visual:"⭐ ⭐ ❓",q:"Какая звёздочка подходит?",correct:"⭐",choices:["🌙","⭐","☀️"],say:"Звёздочка, звёздочка. Найди такую же звёздочку."}
 ]
};
const F3_MEMORY={
 kostya:[
  {sequence:["🔵","🟡","🔴"],choices:["🔵","🟡","🔴"]},
  {sequence:["🟡","🔴","🔵","🟡"],choices:["🔵","🟡","🔴"]}
 ],
 kirill:[
  {sequence:["🔵","🟡"],choices:["🔵","🟡","🔴"]},
  {sequence:["🟡","🔴"],choices:["🔴","🔵","🟡"]}
 ]
};
const F3_EGGS={
 kostya:[
  {q:"Кто помог нам узнать тайну леса?",visual:"🌲",correct:"🦉",choices:["🐟","🦉","🐻"],say:"Вспомни, кто рассказал нам тайну леса?"},
  {q:"Сколько клумб мы оживили?",visual:"🌻 🌹 🪻",correct:"3",choices:["2","3","4"],say:"Посчитай, сколько клумб мы оживили."},
  {q:"Что нужно маленькому дракону, чтобы подружиться с нами?",visual:"🐲 💛",correct:"❤️",choices:["🧱","❤️","⛈️"],say:"Что поможет дракону стать нашим другом? Найди сердечко."}
 ],
 kirill:[
  {q:"Где дракончик?",visual:"",correct:"🐲",choices:["🐱","🐲","🐰"],say:"Где дракончик?"},
  {q:"Найди зелёный цвет!",visual:"",correct:"🟢",choices:["🔴","🔵","🟢"],say:"Найди зелёный цвет."},
  {q:"Где сердечко для Искрика?",visual:"",correct:"❤️",choices:["⭐","❤️","🍎"],say:"Где сердечко для Искрика?"}
 ]
};
const F3_HINTS=[
 "Нажми на сову Луну в лесу или на большую кнопку ниже.",
 "Найди сияющие звёздочки на карте. Можно нажимать и на кнопки с огоньками ниже.",
 "Нажми на семечко, затем на клумбу такого же цвета. Можно перетащить семечко прямо на клумбу.",
 "Посмотри, как повторяются картинки или числа. Выбери то, что должно идти следующим.",
 "Нажми на дощечку, затем на место с таким же знаком. Перетаскивание тоже работает.",
 "Посмотри на показанные цвета. Нажми «Я запомнил!», затем повтори их на камнях. Можно посмотреть ещё раз.",
 "Поговори с маленьким драконом и выбери правильный ответ на каждую загадку.",
 "Ты уже помог всему лесу! Можешь пройти историю ещё раз без потери медали."
];
function f3CheckData(){
 const problems=[];
 for(const hero of ["kostya","kirill"]){
  for(const t of F3_PATTERN[hero])if(t.choices.length!==3||new Set(t.choices).size!==3||!t.choices.includes(t.correct)||String(t.visual).includes(" "+t.correct+" ❓")&&false)problems.push(hero+" invalid pattern");
  for(const t of F3_EGGS[hero])if(t.choices.length!==3||new Set(t.choices).size!==3||!t.choices.includes(t.correct))problems.push(hero+" invalid egg");
  for(const t of F3_MEMORY[hero])if(t.sequence.some(x=>!t.choices.includes(x)))problems.push(hero+" invalid memory");
  if(F3_BRIDGE[hero].length!==3||new Set(F3_BRIDGE[hero].map(t=>t.target)).size!==3)problems.push(hero+" invalid bridge");
 }
 return problems
}
