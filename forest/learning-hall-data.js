
"use strict";
/* Generative lesson catalogue. Each subject supports many deterministic parameter combinations.
   No question displays the answer in its prompt. */
const HALL_SUBJECTS=[
 {id:"math",icon:"🧮",name:"Математика",desc:"Счёт и числа",tone:"#3177a2"},
 {id:"letters",icon:"🔤",name:"Буквы и речь",desc:"Звуки, слова и буквы",tone:"#8260b4"},
 {id:"logic",icon:"🧩",name:"Логика",desc:"Узоры и внимание",tone:"#b4774a"},
 {id:"nature",icon:"🌿",name:"Окружающий мир",desc:"Животные и природа",tone:"#458a70"}
];
const HALL_ITEMS={
 animals:[{name:"кот",icon:"🐱",letter:"К",home:"дом"},{name:"собака",icon:"🐶",letter:"С",home:"дом"},{name:"лиса",icon:"🦊",letter:"Л",home:"лес"},{name:"заяц",icon:"🐰",letter:"З",home:"лес"},{name:"рыба",icon:"🐟",letter:"Р",home:"вода"},{name:"медведь",icon:"🐻",letter:"М",home:"лес"},{name:"утка",icon:"🦆",letter:"У",home:"вода"},{name:"ёж",icon:"🦔",letter:"Ё",home:"лес"},{name:"корова",icon:"🐮",letter:"К",home:"ферма"},{name:"волк",icon:"🐺",letter:"В",home:"лес"},{name:"слон",icon:"🐘",letter:"С",home:"саванна"},{name:"лягушка",icon:"🐸",letter:"Л",home:"вода"}],
 words:[{word:"КОТ",icon:"🐱"},{word:"ДОМ",icon:"🏠"},{word:"ЛЕС",icon:"🌲"},{word:"МЯЧ",icon:"⚽"},{word:"СЫР",icon:"🧀"},{word:"НОС",icon:"👃"},{word:"СОК",icon:"🧃"},{word:"ЛУК",icon:"🧅"},{word:"КИТ",icon:"🐳"},{word:"УХО",icon:"👂"},{word:"СУП",icon:"🥣"},{word:"ЗУБ",icon:"🦷"},{word:"РУКА",icon:"✋"},{word:"РОТ",icon:"👄"},{word:"КЛЮЧ",icon:"🔑"},{word:"КНИГА",icon:"📖"}],
 colors:[{color:"красный",icon:"🔴"},{color:"синий",icon:"🔵"},{color:"жёлтый",icon:"🟡"},{color:"зелёный",icon:"🟢"},{color:"фиолетовый",icon:"🟣"},{color:"оранжевый",icon:"🟠"}],
 shapes:[{name:"круг",icon:"🔵"},{name:"треугольник",icon:"🔺"},{name:"квадрат",icon:"🟦"},{name:"звезда",icon:"⭐"},{name:"сердце",icon:"❤️"}],
 nature:[{q:"Кто летает в небе?",answer:"🐦",options:["🐟","🐦","🐱"]},{q:"Какое животное живёт в воде?",answer:"🐟",options:["🐻","🐟","🐰"]},{q:"Что растёт на дереве?",answer:"🍎",options:["🍎","🧸","🚗"]},{q:"Что нужно растению для роста?",answer:"💧",options:["📺","💧","🧱"]},{q:"Что можно увидеть ночью?",answer:"🌙",options:["🌙","☀️","🌻"]},{q:"Что помогает согреться зимой?",answer:"🧣",options:["🧣","🩴","🕶️"]},{q:"Кто делает мёд?",answer:"🐝",options:["🐟","🐝","🐱"]},{q:"На чём можно плавать по воде?",answer:"⛵",options:["🚂","⛵","🚲"]},{q:"Кто живёт на ферме?",answer:"🐮",options:["🐯","🐮","🦈"]},{q:"Что появляется после дождя и солнца?",answer:"🌈",options:["🌈","🌙","🌋"]}]
};
function hallRandom(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let z=n;z=Math.imul(z^(z>>>15),z|1);z^=z+Math.imul(z^(z>>>7),z|61);return ((z^(z>>>14))>>>0)/4294967296}}
function hallSeed(hero,subject,index){let s=2166136261;const str=hero+"|"+subject+"|"+index;for(let i=0;i<str.length;i++){s^=str.charCodeAt(i);s=Math.imul(s,16777619)}return s>>>0}
function hallPick(random,list){return list[Math.floor(random()*list.length)]}
function hallShuffle(random,arr){const out=arr.slice();for(let i=out.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function hallAnswer(q,visual,answer,distractors,say,kind){const choices=[String(answer),...distractors.map(String)].filter((v,i,a)=>a.indexOf(v)===i);if(choices.length<3)throw new Error("Hall: not enough unique choices");return{kind:kind||"choice",q,visual,answer:String(answer),options:choices.slice(0,3),say:say||q}}
function generateHallTask(hero,subject,index){
 const rand=hallRandom(hallSeed(hero,subject,index)),pick=x=>hallPick(rand,x),shuffle=x=>hallShuffle(rand,x),easy=hero==="kirill";
 // Shuffle task types per lesson instead of repeating the same five in the same order.
 const round=Math.floor(index/5),sequence=hallShuffle(hallRandom(hallSeed(hero,subject,round)^0x5A17F00D),[0,1,2,3,4]);
 const variant=sequence[index%5];let q;
 if(subject==="math"){
  if(easy){
   if(variant===0){const icon=pick(["⭐","🌸","🐞","🍓","🧸","🐟","🍎","🦋"]),n=1+Math.floor(rand()*3);q=hallAnswer("Найди столько же предметов",icon.repeat(n),icon.repeat(n),[1,2,3].filter(x=>x!==n).map(x=>icon.repeat(x)),"Посмотри на предметы сверху. Найди внизу такую же группу.")}
   else if(variant===1){const icon=pick(["⚽","🐻","🧸","🍪","🚗","🐶"]),n=1+Math.floor(rand()*3);q=hallAnswer("Найди нужное количество предметов","",icon.repeat(n),[1,2,3].filter(x=>x!==n).map(x=>icon.repeat(x)),"Найди "+n+" одинаковых предмета.")}
   else if(variant===2){const icon=pick(["🍎","🍌","🥕","🍄","🐬","🌻"]),n=1+Math.floor(rand()*3);q=hallAnswer("Найди такую же группу",icon.repeat(n),icon.repeat(n),[1,2,3].filter(x=>x!==n).map(x=>icon.repeat(x)),"Найди точно такую же группу предметов.")}
   else if(variant===3){const group=pick(["🍓","🍐","🧸","🐣","🚀","🌼","🐢","🍒"]);const n=1+Math.floor(rand()*3);q=hallAnswer("Найди столько же предметов",group.repeat(n),group.repeat(n),[1,2,3].filter(x=>x!==n).map(x=>group.repeat(x)),"Найди столько же предметов, сколько показано сверху.")}
   else {const animal=pick(["🐱","🐶","🐰","🐥","🐼","🐭"]),n=2+Math.floor(rand()*2);q=hallAnswer("Найди зверят","",animal.repeat(n),[1,3,4].filter(x=>x!==n).slice(0,2).map(x=>animal.repeat(x)),"Найди "+(n===2?"двух":"трёх")+" одинаковых зверят.")}
  }else{
   const level=Math.min(3,Math.floor(index/16)),lim=[5,10,15,20][level];
   if(variant===0){const n=2+Math.floor(rand()*Math.min(lim-1,9)),emoji=pick(["🍄","⭐","🍓","🐞","🍎"]);q=hallAnswer("Сколько предметов ты видишь?",Array(n).fill(emoji).join(" "),n,shuffle([n+1,n-1,n+2,n-2]).filter(x=>x>=1).slice(0,2),"Посчитай предметы и выбери число.")}
   else if(variant===1){const a=1+Math.floor(rand()*(lim-1)),b=1+Math.floor(rand()*(lim-a)),sum=a+b;q=hallAnswer("Реши пример",a+" + "+b+" = ❓",sum,[sum+1,Math.max(0,sum-1)],"Сколько будет "+a+" плюс "+b+"?")}
   else if(variant===2){const a=2+Math.floor(rand()*(lim-1)),b=1+Math.floor(rand()*a),n=a-b;q=hallAnswer("Сколько останется?",a+" − "+b+" = ❓",n,[n+1,n===0?2:n-1],"Сколько будет "+a+" минус "+b+"?")}
   else if(variant===3){let a=1+Math.floor(rand()*lim),b=1+Math.floor(rand()*lim);const answer=a>b?">":a<b?"<":"=";q=hallAnswer("Какой знак подходит?",a+" ❓ "+b,answer,["<",">","="].filter(x=>x!==answer),"Сравни числа "+a+" и "+b+".")}
   else {let first=1+Math.floor(rand()*8),step=pick([1,2,3]),n=first+step*3;q=hallAnswer("Продолжи последовательность",first+" • "+(first+step)+" • "+(first+step*2)+" • ❓",n,[n+step,n-1],"Какое число идёт следующим?")}
  }
 }
 else if(subject==="letters"){
  if(easy){
   if(variant===0){const x=pick(HALL_ITEMS.animals);q=hallAnswer("Найди животное","",x.icon,shuffle(HALL_ITEMS.animals.filter(a=>a.icon!==x.icon)).slice(0,2).map(a=>a.icon),"Найди: "+x.name+".")}
   else if(variant===1){const x=pick(["🍎","🚗","🏠","⚽","🧸","📘"]);q=hallAnswer("Найди такой же предмет",x,x,shuffle(["🍎","🚗","🏠","⚽","🧸","📘"].filter(t=>t!==x)).slice(0,2),"Найди такую же картинку.")}
   else if(variant===2){const x=pick(HALL_ITEMS.colors);q=hallAnswer("Найди "+x.color+" цвет","",x.icon,shuffle(HALL_ITEMS.colors.filter(c=>c.icon!==x.icon)).slice(0,2).map(c=>c.icon),"Найди "+x.color+" цвет.")}
   else if(variant===3){const group=["🐶","🐱","🐰","🦊","🐻","🐸"];const x=pick(group);q=hallAnswer("Где "+({"🐶":"собачка","🐱":"кошечка","🐰":"зайчик","🦊":"лиса","🐻":"медведь","🐸":"лягушка"}[x])+"?","",x,shuffle(group.filter(t=>t!==x)).slice(0,2),"Посмотри и найди животное.")}
   else {const x=pick(HALL_ITEMS.shapes);q=hallAnswer("Найди "+x.name,"",x.icon,shuffle(HALL_ITEMS.shapes.filter(t=>t.icon!==x.icon)).slice(0,2).map(t=>t.icon),"Найди "+x.name+".")}
  }else{
   if(variant===0){const x=pick(HALL_ITEMS.animals);const letters=shuffle([...new Set(HALL_ITEMS.animals.map(a=>a.letter).filter(c=>c!==x.letter))]).slice(0,2);q=hallAnswer("С какого звука начинается название животного?",x.icon,x.letter,letters,"Посмотри на картинку. Это "+x.name+". С какого звука начинается название?")}
   else if(variant===1){const x=pick(HALL_ITEMS.words),others=shuffle(HALL_ITEMS.words.filter(a=>a.word!==x.word)).slice(0,2);q=hallAnswer("Выбери слово по картинке",x.icon,x.word,others.map(a=>a.word),"Посмотри на картинку и найди слово "+x.word.toLowerCase()+".")}
   else if(variant===2){let letter=pick(["М","Л","С","Р","Н","К","Т","П"]);const syll=letter+"А";q=hallAnswer("Какой слог получится?",letter+" + А = ❓",syll,[letter+"О","А"+letter],"Соедини звуки "+letter+" и А.")}
   else if(variant===3){const x=pick(HALL_ITEMS.words),others=shuffle(HALL_ITEMS.words.filter(a=>a.word[0]!==x.word[0])).slice(0,2);q=hallAnswer("Какое слово начинается с буквы «"+x.word[0]+"»?","",x.word,others.map(a=>a.word),"Найди слово, которое начинается с буквы "+x.word[0]+".")}
   else {const x=pick(["А","М","О","Т","К","И","Л","С","Н"]);const lower=x.toLowerCase();q=hallAnswer("Найди маленькую букву для большой «"+x+"»","",lower,shuffle(["а","м","о","т","к","и","л","с","н"].filter(t=>t!==lower)).slice(0,2),"Найди маленькую букву "+x+".")}
  }
 }
 else if(subject==="logic"){
  const colors=["🔴","🔵","🟢","🟡","🟣","🟠"],shapes=["🔺","🔵","🟦","⭐","❤️"];
  if(easy){
   if(variant===0){const x=pick(shapes);q=hallAnswer("Найди такую же фигуру",x,x,shuffle(shapes.filter(a=>a!==x)).slice(0,2),"Найди такую же фигуру.")}
   else if(variant===1){const x=pick(colors);q=hallAnswer("Найди такой же цвет",x,x,shuffle(colors.filter(a=>a!==x)).slice(0,2),"Найди такой же цвет.")}
   else if(variant===2){const x=pick(["🐱","🐶","🐰","🐼","🐸"]);q=hallAnswer("Кого ты видишь на картинке?",x,x,shuffle(["🐱","🐶","🐰","🐼","🐸"].filter(a=>a!==x)).slice(0,2),"Найди такое же животное.")}
   else if(variant===3){const x=pick(colors);q=hallAnswer("Что продолжит дорожку?",x+" "+x+" ❓",x,shuffle(colors.filter(a=>a!==x)).slice(0,2),"Какой цвет продолжит дорожку?")}
   else {const x=pick(shapes);q=hallAnswer("Найди два одинаковых знака",x+" "+x,x,shuffle(shapes.filter(a=>a!==x)).slice(0,2),"Найди одинаковый знак.")}
  }else{
   if(variant===0){let a=pick(colors),b=pick(colors.filter(x=>x!==a));q=hallAnswer("Продолжи цветной узор",a+" "+b+" "+a+" "+b+" ❓",a,[b,pick(colors.filter(x=>x!==a&&x!==b))],"Какой цвет дальше?")}
   else if(variant===1){let seq=pick([["⭐","🌙"],["🐱","🐶"],["🟦","🔺"],["🍎","🍐"]]);q=hallAnswer("Продолжи ряд",seq[0]+" "+seq[0]+" "+seq[1]+" "+seq[0]+" "+seq[0]+" ❓",seq[1],[seq[0],"🌈"],"Какой символ следующий?")}
   else if(variant===2){const nums=[1,2,3,4,5,6,7,8,9];let start=pick(nums.slice(0,5)),step=pick([1,2,3]),ans=start+3*step;q=hallAnswer("Найди продолжение ряда",start+" • "+(start+step)+" • "+(start+step*2)+" • ❓",ans,[ans+step,ans-1],"Какое число идёт дальше?")}
   else if(variant===3){const x=pick([{a:"🐶",b:"🐱",c:"🐰",odd:"🚗"},{a:"🍎",b:"🍐",c:"🍌",odd:"🛴"},{a:"🚗",b:"🚌",c:"🚕",odd:"🐢"},{a:"🌲",b:"🌳",c:"🌴",odd:"📚"}]);q=hallAnswer("Что лишнее в группе?",shuffle([x.a,x.b,x.c,x.odd]).join(" "),x.odd,shuffle([x.a,x.b,x.c]).slice(0,2),"Найди предмет, который не относится к остальным.")}
   else {const x=pick(shapes);q=hallAnswer("Найди такой же знак",x+"  ➜  ❓",x,shuffle(shapes.filter(a=>a!==x)).slice(0,2),"Посмотри на знак и найди точно такой же.")}
  }
 }
 else if(subject==="nature"){
  if(easy){
   if(variant===0){const animal=pick(HALL_ITEMS.animals);q=hallAnswer("Где животное?","",animal.icon,shuffle(HALL_ITEMS.animals.filter(a=>a.icon!==animal.icon)).slice(0,2).map(a=>a.icon),"Найди животное: "+animal.name+".")}
   else if(variant===1){let x=pick(["☀️","🌙","🌧️","❄️","🌈"]);q=hallAnswer("Найди такую же картинку",x,x,shuffle(["☀️","🌙","🌧️","❄️","🌈"].filter(t=>t!==x)).slice(0,2),"Найди такую же картинку.")}
   else if(variant===2){let x=pick([{q:"Где солнышко?",v:"☀️"},{q:"Где дождик?",v:"🌧️"},{q:"Где снег?",v:"❄️"},{q:"Где радуга?",v:"🌈"}]);q=hallAnswer(x.q,"",x.v,shuffle(["☀️","🌧️","❄️","🌈"].filter(v=>v!==x.v)).slice(0,2),x.q)}
   else if(variant===3){let x=pick(["🍎","🥕","🍌","🍓"]);q=hallAnswer("Найди такой же продукт",x,x,shuffle(["🍎","🥕","🍌","🍓"].filter(t=>t!==x)).slice(0,2),"Найди такую же еду.")}
   else {let x=pick(["🐦","🐟","🦋","🐝"]);q=hallAnswer("Найди такое же живое существо",x,x,shuffle(["🐦","🐟","🦋","🐝"].filter(t=>t!==x)).slice(0,2),"Найди такое же существо.")}
  }else{
   if(variant===0){const x=pick(HALL_ITEMS.animals.filter(a=>["лиса","заяц","рыба","медведь","корова","волк"].includes(a.name)));const opts=shuffle(["лес","дом","вода","ферма"].filter(v=>v!==x.home)).slice(0,2);q=hallAnswer("Где обычно живёт это животное?",x.icon,x.home,opts,"Где обычно живёт "+x.name+"?")}
   else if(variant===1){const x=pick(HALL_ITEMS.nature);q=hallAnswer(x.q,"",x.answer,x.options.filter(x2=>x2!==x.answer),x.q)}
   else if(variant===2){const arr=[{q:"Какое время года после зимы?",a:"весна",o:["лето","осень"]},{q:"Какое время года после лета?",a:"осень",o:["зима","весна"]},{q:"Когда листья часто желтеют?",a:"осень",o:["весна","лето"]},{q:"Когда чаще всего идёт снег?",a:"зима",o:["лето","весна"]}];let x=pick(arr);q=hallAnswer(x.q,"",x.a,x.o,x.q)}
   else if(variant===3){const x=pick([{q:"Что относится к транспорту?",a:"🚲",o:["🐱","🌼"]},{q:"Что относится к растениям?",a:"🌻",o:["🐻","🚕"]},{q:"Что относится к посуде?",a:"🥄",o:["🚲","🦊"]},{q:"Что относится к одежде?",a:"🧥",o:["🍎","⚽"]}]);q=hallAnswer(x.q,"",x.a,x.o,x.q)}
   else {const x=pick([{q:"Что сначала: семя или росток?",a:"семя",o:["цветок","яблоко"]},{q:"Какой предмет поможет увидеть в темноте?",a:"🔦",o:["🥄","🌼"]},{q:"Что важно сделать перед едой?",a:"вымыть руки",o:["бегать","нарисовать круг"]},{q:"Что нужно сделать, переходя дорогу со взрослым?",a:"посмотреть по сторонам",o:["бежать","закрыть глаза"]}]);q=hallAnswer(x.q,"",x.a,x.o,x.q)}
  }
 }else throw new Error("unknown hall subject "+subject);
 q.options=shuffle(q.options);q.id=hero+"-"+subject+"-"+index;q.subject=subject;q.number=index;return q
}
