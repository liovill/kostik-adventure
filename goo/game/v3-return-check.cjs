'use strict';
// Independent geometry regression. Only player inputs move the hero after placement
// at a room entrance; enemies are disabled to isolate return-route reachability.
const assert=require('node:assert/strict');
const C=require('./dist/core.js');
const TYPES=new Set(['wind','lift','spring','moving']);
const failures=[];
let traversals=0;
function tick(s,input={}){
 const before=s.hearts;
 C.step(s,input,C.DT);
 assert.equal(s.hearts,before,`damage/fall at ${s.player.x.toFixed(1)},${s.player.y.toFixed(1)}`);
 assert.equal(s.status,'play','route unexpectedly terminated');
}
function reach(s,point,maxTicks=2400){
 const target={toleranceX:8,toleranceY:7,...point};
 if(target.form&&s.player.form!==target.form)assert(C.setForm(s,target.form),`cannot switch to ${target.form}`);
 for(let i=0;i<maxTicks;i++){
  let p=s.player;
  if(Math.abs(p.x-target.x)<target.toleranceX&&Math.abs(p.y-target.y)<target.toleranceY&&p.onGround)return;
  const dir=Math.sign(target.x-p.x),moving=Math.abs(p.x-target.x)>Math.min(5,target.toleranceX*.6);
  const support=s.platforms.find(a=>a.id===p.ground);
  const edge=support&&(dir>0?support.x+support.w-p.x:p.x-support.x)<48;
  const jump=p.onGround&&(p.y-target.y>12||moving&&edge);
  tick(s,{right:dir>0&&moving,left:dir<0&&moving,jumpPressed:jump});
 }
 throw new Error(`target ${target.x},${target.y} not reached; at ${s.player.x.toFixed(1)},${s.player.y.toFixed(1)} (${s.player.form})`);
}
for(let n=1;n<=100;n++){
 const definition=C.makeLevel(n);
 for(const roomDef of definition.rooms.filter(r=>TYPES.has(r.type))){
  const s=C.makeLevel(n),room=s.rooms.find(r=>r.id===roomDef.id);
  for(const e of s.enemies)e.alive=false;
  for(const h of s.hazards)h.dead=true;
  try{
   assert(Array.isArray(room.returnRoute?.backward)&&room.returnRoute.backward.length,`missing returnRoute.backward for ${room.type}`);
   Object.assign(s.player,{x:room.x+room.w-32,y:C.GROUND,w:36,h:44,form:'normal',vx:0,vy:0,onGround:false,ground:null,coyote:0,inv:0});
   s.spawn={x:s.player.x,y:s.player.y};
   for(let i=0;i<3;i++)tick(s);
   for(const point of room.returnRoute.backward)reach(s,point);
   reach(s,{x:room.x+32,y:C.GROUND});
   assert.equal(s.player.form,'normal','return route must not depend on the weakened bubble');
   traversals++;
  }catch(e){failures.push({level:n,room:room.id,type:room.type,error:e.message})}
 }
}
if(failures.length){console.error(JSON.stringify(failures,null,2));console.error(`FAIL: ${failures.length} return routes, ${traversals} passed`);process.exitCode=1}
else console.log(`PASS: ${traversals} reverse room traversals across 100 levels using actual player physics, normal form and no damage.`);
