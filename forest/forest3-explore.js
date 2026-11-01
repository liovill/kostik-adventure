/* Forest Explorer v42: a child-friendly tap-to-walk layer.
   The existing quests and saves remain authoritative. No third-party assets. */
(function(root,doc){
"use strict";
const $=id=>doc.getElementById(id);
const LIMITS={minX:15,maxX:85,minY:49,maxY:76};
let mounted=false,context="",position=null,target=null,timer=null,trip=0,marker=null;
const api=()=>root.Forest3Public;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function reduced(){
 return !!$("forestApp")?.classList.contains("reduce-motion")||
 !!root.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}
function currentContext(){
 const p=api();
 return p?p.hero()+":"+p.scene()+":"+p.stage():"";
}
function actor(){return $("heroActor")}
function status(text){
 const label=$("forestWalkStatus");
 if(label)label.textContent=text;
}
function cancel(){
 trip++;
 root.clearTimeout(timer);timer=null;target=null;
 const a=actor();if(a){
  a.classList.remove("exploring");
  a.style.transition="";
 }
 if(marker){marker.remove();marker=null}
}
function mount(){
 if(mounted||!api()||!$("worldScene"))return;
 const world=$("worldScene");
 const info=doc.createElement("div");
 info.id="forestWalkStatus";info.className="forest-walk-status";
 info.setAttribute("role","status");info.setAttribute("aria-live","polite");
 info.textContent="👣 Коснись поляны, чтобы герой пошёл гулять";
 $("scenePicker")?.insertAdjacentElement("afterend",info);
 // Background clicks move the hero. Buttons keep their existing controls.
 world.addEventListener("click",event=>{
  if(!api()||!event.target||!event.target.closest)return;
  if(event.target.closest("button,a,[role='button']"))return;
  const bounds=world.getBoundingClientRect();
  if(bounds.width<1||bounds.height<1)return;
  const x=(event.clientX-bounds.left)*100/bounds.width;
  const y=(event.clientY-bounds.top)*100/bounds.height;
  walkTo(x,y,null,"Прогулка по лесу");
 });
 mounted=true;
}
function origin(){
 const a=actor(),world=$("worldScene");
 if(!a||!world)return{x:50,y:67};
 // Read the actual rendered position to allow retargeting mid-walk.
 const box=a.getBoundingClientRect(),scene=world.getBoundingClientRect();
 if(scene.width>0&&scene.height>0&&box.width>0&&box.height>0){
  return{x:clamp((box.left+box.width/2-scene.left)*100/scene.width,0,100),
         y:clamp((box.top+box.height/2-scene.top)*100/scene.height,0,100)};
 }
 return position||{x:50,y:67}
}
function placeMarker(x,y){
 if(marker){marker.remove();marker=null}
 if(reduced())return;
 const world=$("worldScene");
 if(!world)return;
 marker=doc.createElement("span");marker.className="forest-walk-marker";
 marker.style.left=x+"%";marker.style.top=y+"%";
 marker.setAttribute("aria-hidden","true");world.appendChild(marker)
}
function walkTo(x,y,onArrive,label){
 mount();
 const a=actor(),world=$("worldScene");
 if(!a||!world||!api()){if(typeof onArrive==="function")onArrive();return false}
 if(context!==currentContext())render();
 // Landing points are deliberately on the walkable foreground.
 const dest={x:clamp(Number.isFinite(x)?x:50,LIMITS.minX,LIMITS.maxX),
             y:clamp(Number.isFinite(y)?y:67,LIMITS.minY,LIMITS.maxY)};
 const from=origin(),bounds=world.getBoundingClientRect();
 const distance=Math.hypot((dest.x-from.x)*(bounds.width||400)/100,(dest.y-from.y)*(bounds.height||380)/100);
 const duration=reduced()?0:Math.round(clamp(distance*5.4,420,1550));
 cancel();
 const token=trip,startingContext=context;
 position=dest;target=dest;
 a.style.transition="none";
 a.style.left=from.x+"%";a.style.top=from.y+"%";
 // A layout read ensures the next left/top assignment actually animates.
 void a.offsetWidth;
 if(duration){
  a.style.transition="left "+duration+"ms linear, top "+duration+"ms linear";
  a.classList.add("exploring");
 }
 placeMarker(dest.x,dest.y);
 a.style.left=dest.x+"%";a.style.top=dest.y+"%";
 status(duration?"👣 "+(label||"Идём исследовать лес"):"✨ Герой на месте!");
 function finish(){
  if(token!==trip||currentContext()!==startingContext)return;
  timer=null;target=null;
  a.classList.remove("exploring");a.style.transition="";
  if(marker){marker.remove();marker=null}
  if(typeof onArrive==="function"){
   status("✨ Нашли! "+(label||""));
   onArrive();
  }else{
   status("🌿 Отлично! Выбери предмет или новое место");
   if(root.AcademySound)root.AcademySound.cue("select");
  }
 }
 if(!duration)finish();
 else timer=root.setTimeout(finish,duration+35);
 return true
}
function walkToObject(item,onArrive){
 if(!item||!api())return false;
 // The avatar stands beneath the object, not on top of it.
 return walkTo(item.x,item.y+24,onArrive,item.name||item.label||"Интересная находка")
}
function walkToElement(element,onArrive){
 const world=$("worldScene");
 if(!element||!world)return false;
 const r=element.getBoundingClientRect(),w=world.getBoundingClientRect();
 if(w.width<=0||w.height<=0){onArrive?.();return false}
 return walkTo((r.left+r.width/2-w.left)*100/w.width,
   (r.top+r.height/2-w.top)*100/w.height+20,onArrive,
   element.getAttribute("aria-label")||"Лесной друг")
}
function render(){
 mount();
 if(!mounted||!api())return;
 const next=currentContext(),a=actor();
 if(next!==context){
  cancel();
  context=next;
  const x=parseFloat(a?.style.left),y=parseFloat(a?.style.top);
  position={x:Number.isFinite(x)?x:50,y:Number.isFinite(y)?y:67};
  status(api().stage()===0?"🦉 Сначала познакомься с совой Луной":
    "👣 Коснись поляны или волшебного предмета");
 }else if(position&&a){
  // Core story render also positions the sprite; restore exploration position
  // without briefly animating back to spawn after quest UI refreshes.
  a.style.transition="none";
  a.style.left=position.x+"%";a.style.top=position.y+"%";
  if(target){a.classList.add("exploring")}
 }
}
root.ForestExplorer={render,walkTo,walkToObject,walkToElement,cancel,
 getPosition:()=>position?{...position}:null};
})(window,document);
