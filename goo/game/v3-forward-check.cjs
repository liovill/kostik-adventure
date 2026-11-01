'use strict';
const assert=require('node:assert/strict'),C=require('./dist/core.js');
const failures=[];let traversals=0,rescues=0;
function tick(s,input={}){let hp=s.hearts;C.step(s,input,C.DT);assert.equal(s.hearts,hp,`damage/fall at ${s.player.x.toFixed(1)},${s.player.y.toFixed(1)}`);assert.equal(s.status,'play','unexpected terminal state');}
function reach(s,target,max=2400){const tx=target.x,ty=target.y;for(let i=0;i<max;i++){let p=s.player;if(Math.abs(p.x-tx)<8&&p.y<=ty+7&&p.onGround)return;let dir=Math.sign(tx-p.x),move=Math.abs(p.x-tx)>5,f=s.platforms.find(f=>f.id===p.ground),edge=f&&(dir>0?f.x+f.w-p.x:p.x-f.x)<48;tick(s,{right:dir>0&&move,left:dir<0&&move,jumpPressed:p.onGround&&(p.y-ty>12||move&&edge)})}throw new Error(`target ${tx},${ty}; at ${s.player.x.toFixed(1)},${s.player.y.toFixed(1)}`)}
// The ten authored expeditions have their own route and collectible checks.
for(let n=11;n<=100;n++)for(let ri=0;ri<C.makeLevel(n).rooms.length;ri++){
 let s=C.makeLevel(n),r=s.rooms[ri],x=r.x;
 if(r.puzzleId||r.type==='boss')continue;
 for(let e of s.enemies)e.alive=false;for(let h of s.hazards)h.dead=true;
 Object.assign(s.player,{x:x+32,y:C.GROUND,vx:0,vy:0,onGround:false,ground:null,inv:0,form:'normal'});s.spawn={x:x+32,y:C.GROUND};
 try{
  for(let i=0;i<3;i++)tick(s);
  if(r.type==='rescue'){
   for(let p of [{x:x+160,y:580},{x:x+310,y:480},{x:x+455,y:385},{x:x+520,y:480},{x:x+620,y:595}])reach(s,p);
   let friends=s.friends.filter(f=>f.roomId===r.id);assert(friends.length>0,'rescue room must contain a baby');assert(friends.every(f=>f.rescued),'climbing the rescue route must collect its baby');rescues++;
  }else if(r.type==='wind'){
   reach(s,{x:x+220,y:590});assert(C.setForm(s,'bubble'),'bubble available');
   let rose=false;for(let i=0;i<1600;i++){if(s.player.y<380){rose=true;break}tick(s)}assert(rose,'wind must lift the weakened bubble');
   for(let i=0;i<1200&&s.player.x<x+450;i++)tick(s,{right:true});assert(s.player.x>=x+450,'reach upper wind ledge');assert(C.setForm(s,'bubble'),'return to normal');reach(s,{x:x+450,y:405});reach(s,{x:x+555,y:500});reach(s,{x:x+640,y:600});
  }else if(r.returnRoute?.backward){for(let point of [...r.returnRoute.backward].reverse())reach(s,point)}
  else if(r.type==='fork'){for(let p of [{x:x+190,y:580},{x:x+380,y:480},{x:x+550,y:570}])reach(s,p)}
  else if(r.type==='crumble'){for(let p of [{x:x+205,y:610},{x:x+310,y:545},{x:x+415,y:610},{x:x+520,y:545}])reach(s,p)}
  else if(r.type==='chase'){for(let p of [{x:x+240,y:585},{x:x+410,y:680},{x:x+540,y:575}])reach(s,p)}
  else if(r.type==='tunnel'){assert(C.setForm(s,'flat'));reach(s,{x:x+550,y:680});assert(C.setForm(s,'flat'))}
  else if(r.type==='gate'){for(let p of [{x:x+180,y:580},{x:x+340,y:485}])reach(s,p);assert(s.doors.find(d=>d.id==='gate-'+r.id).open)}
  reach(s,{x:x+r.w+25,y:C.GROUND});traversals++;
 }catch(e){failures.push({level:n,room:r.id,type:r.type,error:e.message})}
}
if(failures.length){console.error(JSON.stringify(failures,null,2));console.error(`FAIL: ${failures.length} forward routes; ${traversals} rooms and ${rescues} baby rescues passed`);process.exitCode=1}
else{assert.equal(rescues,90,'all remaining 90 courses have a physically reachable rescue');console.log(`PASS: ${traversals} forward traversal rooms across levels 11–100, including 90 actual-input baby rescues and weakened-bubble wind shafts.`)}

