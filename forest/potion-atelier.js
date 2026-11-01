/* Академия волшебства: самостоятельная садовая мини-игра.
   Для Кирилла свободное экспериментирование, для Кости рецепты из 3 предметов.
   Игра не вмешивается в основное сохранение и не начисляет штрафы. */
(function(root){
"use strict";
const RECIPES=[
 {name:"Зелье цветения",ingredients:["🌸","🍓","🍯"],result:"🌺",message:"Сад расцвёл ещё ярче!"},
 {name:"Зелье дружбы",ingredients:["🍎","🦋","🌸"],result:"💖",message:"Волшебные бабочки нашли новых друзей!"},
 {name:"Зелье сияния",ingredients:["🍯","🍓","🦋"],result:"🌈",message:"Над садом появилась радуга!"}
];
const INGREDIENTS=[
 {symbol:"🌸",name:"цветок",color:"#f3a3d3"},
 {symbol:"🍓",name:"ягода",color:"#e96279"},
 {symbol:"🍯",name:"мёд",color:"#f6c85e"},
 {symbol:"🍎",name:"яблоко",color:"#ef876b"},
 {symbol:"🦋",name:"бабочка",color:"#9fd3f4"},
 {symbol:"🍃",name:"листик",color:"#a7e3a2"}
];
const $=id=>document.getElementById(id);
let hero=null,steps=[],round=0,completed=false,firstVisit=true;
const env=()=>root.Forest3Public||null;
const age=()=>env()?.hero()==="kirill"?"kirill":"kostya";
function voice(message){
 if(root.AcademyVoice&&root.Forest3Public?.voiceEnabled?.())root.AcademyVoice.speak(message,{role:"dragon"})
}
function sound(event){if(root.AcademySound)root.AcademySound.cue(event)}
function reset(nextRecipe=false){
 steps=[];completed=false;
 if(nextRecipe)round=(round+1)%RECIPES.length;
 render()
}
function ingredient(item){
 if(!env()||env().scene()!=="garden"||env().stage()<2||completed)return;
 const young=age()==="kirill",target=RECIPES[round].ingredients[steps.length];
 if(!young&&item.symbol!==target){
  $("atelierFeedback").textContent="💛 В рецепте сейчас другой предмет. Найди "+INGREDIENTS.find(x=>x.symbol===target).name+".";
  sound("try");return
 }
 steps.push(item.symbol);sound(steps.length===3?"flower":"select");
 const cauldron=$("atelierPot");
 cauldron.classList.remove("pop");void cauldron.offsetWidth;cauldron.classList.add("pop");
 if(steps.length>=3){
  completed=true;
  const recipe=RECIPES[round];
  const result=young?["🌷","🦋","🌈"][round%3]:recipe.result;
  $("atelierFeedback").textContent="✨ "+(young?"Ура! У тебя получилось волшебство!":recipe.message);
  $("atelierResult").textContent=result;
  $("atelierNext").classList.remove("hidden");
  $("atelierNext").textContent=young?"🌈 Ещё одно чудо!":"✨ Следующий рецепт";
  const scene=$("worldScene");if(scene){scene.classList.remove("potion-sparkle");void scene.offsetWidth;scene.classList.add("potion-sparkle")}
  voice(young?"Кирилл, ура! Ты сварил волшебное зелье!":"Костя, рецепт выполнен! "+recipe.message);
  sound("medal")
 }
 render()
}
function setup(){
 if(!$("atelierIngredients"))return false;
 const tray=$("atelierIngredients");
 if(tray.children.length)return true;
 for(const item of INGREDIENTS){
  const b=document.createElement("button");b.type="button";b.className="atelier-ingredient";
  const emoji=document.createElement("span");emoji.className="ingredient-icon";emoji.textContent=item.symbol;
  const title=document.createElement("small");title.textContent=item.name;
  b.appendChild(emoji);b.appendChild(title);b.setAttribute("aria-label","Добавить в волшебный котёл: "+item.name);
  b.onclick=()=>ingredient(item);tray.appendChild(b)
 }
 $("atelierNext").onclick=()=>reset(true);
 $("atelierReset").onclick=()=>reset(false);
 return true
}
function render(){
 const game=env(),block=$("potionAtelier");if(!block||!game||!setup())return;
 const visible=game.stage()>=2&&game.scene()==="garden";
 block.classList.toggle("hidden",!visible);
 if(!visible)return;
 const current=age();
 if(current!==hero){hero=current;steps=[];completed=false;firstVisit=true}
 const young=hero==="kirill",recipe=RECIPES[round];
 $("atelierTitle").textContent=young?"Кирилл и волшебный котёл":"Костя: "+recipe.name;
 $("atelierLead").textContent=young?"Клади любые продукты в котёл. Каждый из них создаёт новое волшебство!":"Добавляй ингредиенты в правильном порядке. Найди их на подносе.";
 $("atelierRecipe").textContent=young?"✨ Выбирай, что тебе нравится":recipe.ingredients.map((x,i)=>i<steps.length?"✅":x).join("  ➜  ");
 $("atelierIngredients").classList.toggle("toddler",young);
 $("atelierPotContents").textContent=steps.length?steps.join(" "):"✨";
 $("atelierCount").textContent=steps.length+" / 3";
 $("atelierNext").classList.toggle("hidden",!completed);
 $("atelierPot").style.setProperty("--brew-hue",steps.length?INGREDIENTS.find(x=>x.symbol===steps.at(-1))?.color||"#99cafe":"#99cafe");
 if(!completed)$("atelierResult").textContent="🫧";
 if(firstVisit){
  $("atelierFeedback").textContent=young?"Тронь любой большой ингредиент.":"Найди первый ингредиент в рецепте.";
  firstVisit=false
 }
}
root.PotionAtelier={render,reset};
if(typeof document!=="undefined")document.addEventListener("DOMContentLoaded",render,{once:true});
})(window);
