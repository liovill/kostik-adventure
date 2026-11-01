'use strict';
// Independent route probes. Initial placement at a room entrance is fixture setup;
// subsequent movement and interactions use the actual public fixed-step simulation.
const assert=require('node:assert/strict');
const C=require('./dist/core.js');
const failures=[];let cases=0,objectives=0,chains=0,collectedMajors=0,rescuedBabies=0;
function clean(n){const s=C.makeLevel(n);for(const e of s.enemies)e.alive=false;for(const h of s.hazards)h.dead=true;return s;}
function place(s,x,y=680){Object.assign(s.player,{x,y,w:36,h:44,vx:0,vy:0,form:'normal',ground:null,onGround:false,coyote:0,inv:0});}
function tick(s,input={}){const hearts=s.hearts;C.step(s,input,C.DT);assert.equal(s.hearts,hearts,`damage/fall at ${s.player.x.toFixed(1)},${s.player.y.toFixed(1)}`);assert.equal(s.status,'play');}
function wait(s,n=3){for(let i=0;i<n;i++)tick(s);}
function reach(s,point,max=2400){
 const tx=point.x,ty=point.y;
 for(let i=0;i<max;i++){
  const p=s.player;if(Math.abs(p.x-tx)<8&&(point.atMostY?p.y<=ty+12:Math.abs(p.y-ty)<12)&&p.onGround)return;
  const dir=Math.sign(tx-p.x),move=Math.abs(tx-p.x)>5;
  const support=s.platforms.find(f=>f.id===p.ground),edge=support&&(dir>0?support.x+support.w-p.x:p.x-support.x)<48;
  tick(s,{right:move&&dir>0,left:move&&dir<0,jumpPressed:point.jump!==false&&p.onGround&&(p.y-ty>12||move&&edge)});
 }
 throw new Error(`cannot reach ${tx.toFixed(1)},${ty}; at ${s.player.x.toFixed(1)},${s.player.y.toFixed(1)} grounded=${s.player.onGround}`);
}
function act(s,kind){const a=C.interaction(s);assert(a,`no action for ${kind}`);if(kind)assert.equal(s.chapterSwitches.find(n=>n.id===a.id)?.kind,kind,`wrong nearby action: ${a.label}`);tick(s,{interactPressed:true});}
function highPoints(r){const gap=(r.w-260)/4;return[0,1,2,3,4].map((j)=>({x:r.x+170+j*gap,y:[580,480,390,480,580][j]}));}
function lowerPoints(r){return[{x:r.x+280,y:740},{x:r.x+405,y:685},{x:r.x+560,y:660}];}
function primeOrdinaryPuzzles(s){for(const p of s.puzzles)p.solved=true;for(const d of s.doors)if(d.puzzleId)d.open=true;for(const l of s.lasers){l.disabled=true;l.active=false;}s.crates=[];}
function vaultRoute(r){return r.variant==='high'?[{x:r.x+95,y:590},{x:r.x+240,y:490},{x:r.x+385,y:390}]:[{x:r.x+75,y:600},{x:r.x+215,y:520}];}
function sourceAction(s,r){
 if(r.variant==='lower')reach(s,{x:r.powerPoint.x,y:740});else reach(s,{x:r.powerPoint.x,y:390});
 act(s,'source');const battery=s.chapterSwitches.find(n=>n.kind==='battery');if(battery){reach(s,{x:battery.x,y:r.powerPoint.y});act(s,'battery');assert(s.carriedBattery);}
}
function probe(name,fn){try{fn();cases++;}catch(error){failures.push({name,error:error.message});}}
for(let n=1;n<=10;n++){
 probe(`level ${n}: upper path and return`,()=>{const s=clean(n),r=s.rooms.find(r=>r.type==='branch-hub');place(s,r.x+35);wait(s);for(const p of highPoints(r))reach(s,p);reach(s,{x:r.x+r.w+25,y:680,atMostY:true});for(const p of highPoints(r).reverse())reach(s,p);reach(s,{x:r.x+35,y:680,atMostY:true});});
 probe(`level ${n}: lower discovery, exit and return`,()=>{const s=clean(n),r=s.rooms.find(r=>r.type==='branch-hub');place(s,r.x+35);wait(s);for(const p of lowerPoints(r))reach(s,p);reach(s,{x:r.x+r.w+25,y:680,atMostY:true});reach(s,{x:r.x+35,y:680,atMostY:true});});
 probe(`level ${n}: source before lower discovery`,()=>{const s=clean(n),r=s.rooms.find(r=>r.type==='branch-hub');place(s,r.x+35);wait(s);if(r.variant==='lower')reach(s,lowerPoints(r)[0]);else for(const p of highPoints(r).slice(0,3))reach(s,p);sourceAction(s,r);assert.equal(s.chapters[0].stage>=1,true);if(r.variant==='upper')for(const p of highPoints(r).slice(0,2).reverse())reach(s,p);reach(s,{x:r.x+35,y:680});reach(s,lowerPoints(r)[0]);});
 probe(`level ${n}: powered vault secret and return`,()=>{
  const s=clean(n),r=s.rooms.find(r=>r.type==='power-vault'),c=s.chapters[0],source=s.chapterSwitches.find(n=>n.kind==='source'),battery=s.chapterSwitches.find(n=>n.kind==='battery');source.activated=true;c.stage=1;if(battery){battery.carried=true;battery.activated=true;s.carriedBattery=battery.id;c.stage=2;}
  place(s,r.x+35);wait(s);const high=r.variant==='high';const route=high?[{x:r.x+95,y:590},{x:r.x+240,y:490},{x:r.x+385,y:390}]:[{x:r.x+75,y:600},{x:r.x+215,y:520}];for(const p of route)reach(s,p);act(s,'socket');assert(c.solved);reach(s,{x:r.secretSpot.x,y:r.powerCell.floorY});const secret=s.gems.find(g=>g.big&&g.roomId===r.id);if(secret){assert(secret.taken,'vault secret not collected');objectives++;}for(const p of [...route].reverse())reach(s,p);reach(s,{x:r.x+35,y:680,atMostY:true});
 });
}
// Cross-room wiring isolation: ordinary puzzles are pre-solved so these two
// scenarios specifically exercise continuous movement from the level start,
// activation, a forward delivery and a required backward delivery.
for(const n of [1,2])probe(`level ${n}: continuous source to socket`,()=>{
 const s=clean(n);primeOrdinaryPuzzles(s);const source=s.rooms.find(r=>r.source),target=s.rooms.find(r=>r.target);
 reach(s,{x:source.x+35,y:680,jump:false});
 if(source.variant==='lower')reach(s,lowerPoints(source)[0]);else for(const p of highPoints(source).slice(0,3))reach(s,p);
 sourceAction(s,source);
 if(target.x>source.x){for(const p of highPoints(source).slice(3))reach(s,p);reach(s,{x:source.x+source.w+25,y:680,atMostY:true});}
 else reach(s,{x:source.x+35,y:680});
 reach(s,{x:target.x+35,y:680,atMostY:true,jump:false});for(const p of vaultRoute(target))reach(s,p);act(s,'socket');assert(s.chapters[0].solved);reach(s,{x:target.secretSpot.x,y:target.powerCell.floorY});assert(s.gems.find(g=>g.big&&g.roomId===target.id).taken);chains++;
});
// Collect every mandatory object in the ten authored maps, in isolated room
// fixtures. Existing puzzle gates and bosses are pre-cleared here: their logic
// and fights have separate tests. No player repositioning occurs after setup.
for(let n=1;n<=10;n++){
 const definition=clean(n);
 for(const roomDef of definition.rooms){
  if(!definition.gems.some(g=>g.big&&g.roomId===roomDef.id)&&!definition.friends.some(f=>f.roomId===roomDef.id))continue;
  probe(`level ${n}: mandatory objects room ${roomDef.id} (${roomDef.type})`,()=>{
   const s=clean(n),r=s.rooms.find(r=>r.id===roomDef.id),x=r.x;primeOrdinaryPuzzles(s);for(const d of s.doors)d.open=true;
   if(s.boss)s.boss.alive=false;
   place(s,x+35);wait(s);
   if(r.type==='branch-hub'){
    reach(s,lowerPoints(r)[0]);reach(s,{x:x+35,y:680});for(const p of highPoints(r).slice(0,3))reach(s,p);
    for(const a of s.gems.filter(g=>g.big&&g.roomId===r.id))if(!a.taken)reach(s,{x:a.x,y:a.y+35});
    for(const a of s.friends.filter(f=>f.roomId===r.id))if(!a.rescued)reach(s,{x:a.x,y:a.y});
   }else if(r.type==='power-vault'){
    // The gate was opened as fixture setup; the earlier probes test its actual socket.
    for(const p of vaultRoute(r))reach(s,p);reach(s,{x:r.secretSpot.x,y:r.powerCell.floorY});
   }else{
    const routes={steps:[{x:x+195,y:580},{x:x+345,y:480}],rescue:[{x:x+160,y:580},{x:x+310,y:480},{x:x+455,y:385}],fork:[{x:x+190,y:580},{x:x+380,y:480}],tunnel:[{x:x+120,y:575}],moving:[{x:x+220,y:610},{x:x+360,y:580},{x:x+490,y:495}],lift:[{x:x+130,y:600},{x:x+250,y:510},{x:x+380,y:420}]};
    for(const p of routes[r.type]||[])reach(s,p);
    const targets=[...s.gems.filter(g=>g.big&&g.roomId===r.id).map(g=>({x:g.x,y:['boss','crate','laser','mirror','keys','sequence'].includes(r.type)?680:g.y+35})),...s.friends.filter(f=>f.roomId===r.id).map(f=>({x:f.x,y:['crate','laser','mirror','keys','sequence'].includes(r.type)?680:f.y}))];
    for(const p of targets)reach(s,p);
   }
   const majors=s.gems.filter(g=>g.big&&g.roomId===r.id),friends=s.friends.filter(f=>f.roomId===r.id);
   assert(majors.every(g=>g.taken),'mandatory big crystal not collected');assert(friends.every(f=>f.rescued),'mandatory baby not rescued');collectedMajors+=majors.length;rescuedBabies+=friends.length;
  });
 }
}
if(!failures.length){assert.equal(collectedMajors,30);assert.equal(rescuedBabies,10);}
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exitCode=1;}else console.log(`PASS: ${cases} physical route cases; ${objectives} vault crystals; all ${collectedMajors} mandatory crystals and ${rescuedBabies} babies across ten maps; ${chains} continuous cross-room chains. Enemies disabled to isolate geometry; not a full campaign playthrough.`);
