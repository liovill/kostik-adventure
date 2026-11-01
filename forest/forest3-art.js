/* Original animated storybook portraits and eight optional scene discoveries.
 * No third-party assets or continuous JavaScript animation timers.
 */
(function(root,doc){
"use strict";
const OWL="<svg class=\"forest-owl-svg\" viewBox=\"0 0 120 130\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\" focusable=\"false\">\n<ellipse cx=\"59\" cy=\"121\" rx=\"38\" ry=\"7\" fill=\"#163d43\" opacity=\".25\"/>\n<path d=\"M31 42L20 13L49 32L70 31L97 12L90 47Q101 65 94 96Q82 121 58 119Q27 116 23 90Q18 61 31 42Z\" fill=\"#78533f\" stroke=\"#493d40\" stroke-width=\"3\"/>\n<path d=\"M34 39L31 25L51 37M85 39L90 25L70 37\" fill=\"#d5a16a\"/>\n<ellipse cx=\"59\" cy=\"81\" rx=\"29\" ry=\"34\" fill=\"#bd8a5a\"/>\n<path d=\"M31 76Q12 78 20 99L42 105M87 76Q107 78 100 99L79 105\" fill=\"#906245\" stroke=\"#594638\" stroke-width=\"3\"/>\n<path d=\"M30 53Q37 35 55 41L60 57Q66 34 85 42Q98 51 88 75Q74 84 60 72Q45 85 31 76Z\" fill=\"#ead5a5\"/>\n<circle cx=\"44\" cy=\"58\" r=\"15\" fill=\"#fff0d4\"/><circle cx=\"76\" cy=\"58\" r=\"15\" fill=\"#fff0d4\"/>\n<circle cx=\"46\" cy=\"59\" r=\"7\" fill=\"#344a51\"/><circle cx=\"75\" cy=\"59\" r=\"7\" fill=\"#344a51\"/>\n<circle cx=\"48\" cy=\"56\" r=\"2.5\" fill=\"#fff\"/><circle cx=\"77\" cy=\"56\" r=\"2.5\" fill=\"#fff\"/>\n<g class=\"owl-eye-blink\"><path d=\"M32 59Q45 72 58 59M62 59Q75 72 88 59\" stroke=\"#8d663f\" stroke-width=\"9\" fill=\"none\" stroke-linecap=\"round\"/></g>\n<path d=\"M54 73L61 88L68 73Q60 77 54 73Z\" fill=\"#eeb75b\" stroke=\"#a87242\" stroke-width=\"1.5\"/>\n<path d=\"M45 97Q60 110 75 97\" fill=\"none\" stroke=\"#f7dca9\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M41 117L40 126M76 117L77 126\" stroke=\"#c99354\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n<path d=\"M28 117L92 117\" stroke=\"#765c46\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n</svg>";
const DRAGON="<svg class=\"forest-dragon-svg\" viewBox=\"0 0 145 138\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\" focusable=\"false\">\n<ellipse cx=\"71\" cy=\"128\" rx=\"45\" ry=\"7\" fill=\"#143946\" opacity=\".24\"/>\n<path d=\"M43 86Q12 63 15 38Q38 41 59 75M92 78Q120 53 134 35Q137 69 110 95\" fill=\"#9de4b3\" stroke=\"#438e83\" stroke-width=\"3\"/>\n<path d=\"M98 106Q138 103 130 81Q120 94 105 93\" fill=\"none\" stroke=\"#4da592\" stroke-width=\"17\" stroke-linecap=\"round\"/>\n<path d=\"M42 92Q35 56 74 54Q114 55 111 96Q103 125 71 125Q40 125 42 92Z\" fill=\"#56b99b\" stroke=\"#2f897f\" stroke-width=\"3\"/>\n<ellipse cx=\"72\" cy=\"101\" rx=\"25\" ry=\"20\" fill=\"#b4ead2\"/>\n<path d=\"M38 49Q29 24 47 19L59 38M86 34Q101 11 111 28L99 48\" fill=\"#65c7a3\" stroke=\"#2b897f\" stroke-width=\"3\"/>\n<path d=\"M37 63Q23 34 51 26Q67 19 88 28Q118 35 112 70Q104 98 73 98Q43 94 37 63Z\" fill=\"#72d4b1\" stroke=\"#2f978d\" stroke-width=\"3\"/>\n<ellipse cx=\"54\" cy=\"57\" rx=\"12\" ry=\"15\" fill=\"#fff6e2\"/><ellipse cx=\"91\" cy=\"56\" rx=\"12\" ry=\"15\" fill=\"#fff6e2\"/>\n<ellipse cx=\"57\" cy=\"59\" rx=\"6\" ry=\"8\" fill=\"#284953\"/><ellipse cx=\"89\" cy=\"58\" rx=\"6\" ry=\"8\" fill=\"#284953\"/>\n<circle cx=\"58\" cy=\"55\" r=\"2\" fill=\"#fff\"/><circle cx=\"91\" cy=\"55\" r=\"2\" fill=\"#fff\"/>\n<g class=\"dragon-eye-blink\"><path d=\"M43 57Q56 67 66 57M79 56Q91 66 102 56\" stroke=\"#5dbf9a\" stroke-width=\"10\" fill=\"none\" stroke-linecap=\"round\"/></g>\n<ellipse cx=\"44\" cy=\"75\" rx=\"8\" ry=\"5\" fill=\"#f7a6a1\" opacity=\".75\"/><ellipse cx=\"101\" cy=\"73\" rx=\"8\" ry=\"5\" fill=\"#f7a6a1\" opacity=\".75\"/>\n<path d=\"M58 79Q73 89 86 78\" fill=\"none\" stroke=\"#346e69\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M46 110L36 122M96 111L106 122\" stroke=\"#3c9c89\" stroke-width=\"10\" stroke-linecap=\"round\"/>\n<path d=\"M37 30L51 10L61 31M79 26L91 8L100 34\" fill=\"#f4dc8b\" stroke=\"#d49e66\" stroke-width=\"2\"/>\n</svg>";
const SECRETS=[
 {id:"grove-mushroom",scene:"grove",icon:"🍄",label:"Лесной гриб",x:73,y:76,
  text:"Ты нашёл светящийся гриб! Он загорелся, потому что лес чувствует твою доброту."},
 {id:"grove-moonflower",scene:"grove",icon:"🌙",label:"Лунный цветок",x:53,y:30,
  text:"Смотри, лунный цветок! Даже в сумерках он хранит немного волшебного света."},
 {id:"garden-butterfly",scene:"garden",icon:"🦋",label:"Радужная бабочка",x:73,y:30,
  text:"Радужная бабочка проснулась. Теперь в волшебном саду стало ещё уютнее."},
 {id:"garden-nectar",scene:"garden",icon:"🍯",label:"Сладкий нектар",x:20,y:43,
  text:"Ты нашёл сладкий нектар. Его очень любят бабочки и маленькие дракончики."},
 {id:"river-pearl",scene:"river",icon:"💎",label:"Речная жемчужина",x:17,y:72,
  text:"В воде блеснула речная жемчужина! Поющие камни знают её древнюю песню."},
 {id:"river-fish",scene:"river",icon:"🐟",label:"Серебряная рыбка",x:80,y:79,
  text:"Серебряная рыбка выпрыгнула из ручья и помахала тебе хвостом."},
 {id:"clearing-feather",scene:"clearing",icon:"🪶",label:"Перо волшебства",x:21,y:42,
  text:"Ты нашёл необычное перо. Сова Луна говорит, что это знак настоящего хранителя."},
 {id:"clearing-star",scene:"clearing",icon:"🌟",label:"Звезда Искрика",x:78,y:75,
  text:"Звёздочка Искрика засияла! Дракончик запомнит этот маленький праздник."}
];
let mounted=false;
const find=id=>doc.getElementById(id);
const player=()=>root.Forest3Public;
function mount(){
 if(mounted||!find("sceneDiscoveries")||!player())return;
 mounted=true;
 const owl=find("owlHotspot")?.querySelector(".hotspot-emoji");
 if(owl)owl.innerHTML=OWL;
 for(const cls of [".owl-face",".talk-owl"]){
  const e=doc.querySelector(cls);
  if(e){e.innerHTML=OWL;e.setAttribute("aria-hidden","true")}
 }
 const container=find("sceneDiscoveries");
 for(const item of SECRETS){
  const b=doc.createElement("button");b.type="button";b.className="forest-discovery";
  b.dataset.secret=item.id;b.dataset.scene=item.scene;
  b.style.left=item.x+"%";b.style.top=item.y+"%";
  b.setAttribute("aria-label","Найти секрет: "+item.label);
  const emoji=doc.createElement("span");emoji.className="forest-secret-icon";emoji.textContent=item.icon;emoji.setAttribute("aria-hidden","true");
  const label=doc.createElement("small");label.textContent=item.label;
  b.appendChild(emoji);b.appendChild(label);
  b.onclick=()=>{
   if(!player()||player().scene()!==item.scene)return;
   const fresh=player().discover(item.id,item.text);
   if(fresh)celebrate(b);
   render()
  };
  container.appendChild(b)
 }
 const motes=find("forestMotes");
 if(motes)for(let i=0;i<10;i++){
  const d=doc.createElement("span");d.className="forest-mote";
  d.style.left=(8+i*9.1)+"%";d.style.top=(17+(i*31%57))+"%";
  d.style.setProperty("--delay",(-i*.77)+"s");
  d.style.setProperty("--duration",(4.6+(i%5)*.9)+"s");
  motes.appendChild(d)
 }
}
function celebrate(target){
 const surface=find("sceneCelebration");if(!surface)return;
 if(root.matchMedia&&root.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 const box=target.getBoundingClientRect(),area=surface.getBoundingClientRect();
 const burst=doc.createElement("span");burst.className="forest-burst";
 burst.style.left=(box.left+box.width/2-area.left)+"px";
 burst.style.top=(box.top+box.height/2-area.top)+"px";
 for(let i=0;i<9;i++){
  const spark=doc.createElement("span");spark.className="forest-burst-star";spark.textContent=i%3===0?"✦":"✧";
  spark.style.setProperty("--angle",i*40+"deg");
  burst.appendChild(spark)
 }
 surface.appendChild(burst);
 root.setTimeout(()=>burst.remove(),1050)
}
function render(){
 const api=player();if(!api||!find("forestApp"))return;
 mount();if(!mounted)return;
 const discovered=new Set(api.discoveries());
 for(const b of find("sceneDiscoveries").children){
  const item=SECRETS.find(i=>i.id===b.dataset.secret);
  b.classList.toggle("hidden",item.scene!==api.scene()||api.stage()===0);
  b.classList.toggle("found",discovered.has(item.id));
  b.setAttribute("aria-label",(discovered.has(item.id)?"Уже найдено: ":"Найти секрет: ")+item.label)
 }
 const count=find("forestSecretCount");if(count)count.textContent=discovered.size+" / "+SECRETS.length;
 const hint=find("forestSecretHint");if(hint)hint.textContent=discovered.size===SECRETS.length?"Все тайны найдены! Лес благодарит тебя.":"Потрогай волшебные предметы на карте";
 const nest=find("worldNest");
 if(nest&&api.stage()>=7&&nest.dataset.dragonArt!=="ready"){nest.innerHTML=DRAGON;nest.dataset.dragonArt="ready"}
 else if(nest&&api.stage()<7&&nest.dataset.dragonArt==="ready"){nest.textContent="🥚";nest.dataset.dragonArt="egg"}
 const hotspot=find("nestHotspot")?.querySelector(".hotspot-emoji");
 if(hotspot)hotspot.innerHTML=api.stage()>=7?DRAGON:"✨";
}
root.ForestArt={render,secretCount:()=>SECRETS.length};
})(window,document);
