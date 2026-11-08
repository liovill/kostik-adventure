'use strict';
// Chapter state integration tests. Physical room/branch traversal is covered by chapter-route-qa.cjs.
const assert=require('node:assert/strict');
const C=require('./dist/core.js'),P=C.Chapters;
function at(s,n){Object.assign(s.player,{x:n.x,y:n.kind==='battery'?n.y+22:n.y,vx:0,vy:0,form:'normal',w:36,h:44,ground:null,onGround:false,coyote:0,inv:0});}
function action(s,n){at(s,n);const item=C.interaction(s);assert.equal(item?.type,'chapter');assert.equal(item?.id,n.id);const prior=s.puzzles.map(p=>p.solved+':'+p.progress);C.step(s,{interactPressed:true},C.DT);assert.deepEqual(s.puzzles.map(p=>p.solved+':'+p.progress),prior,'One chapter action must not also trigger a local puzzle');}
function otherGoals(s){for(const g of s.gems)if(g.big)g.taken=true;for(const f of s.friends)f.rescued=true;for(const p of s.puzzles)p.solved=true;for(const e of s.enemies)if(e.boss)e.alive=false;for(const d of s.doors)d.open=true;s.major=3;s.rescued=s.friends.length;}
function nodes(s){return{source:s.chapterSwitches.find(n=>n.kind==='source'),battery:s.chapterSwitches.find(n=>n.kind==='battery'),socket:s.chapterSwitches.find(n=>n.kind==='socket')}}
for(let n=1;n<=10;n++){
 const s=C.makeLevel(n),c=s.chapters[0],nd=nodes(s);assert.equal(s.chapters.length,1);assert.equal(s.hearts,3);assert.equal(s.gems.filter(g=>g.big).length,3);assert.equal(new Set(s.gems.filter(g=>g.big).map(g=>g.roomId)).size,3);assert.equal(s.friends.length,1);assert.equal(C.canExit(s),false);
 if(n===5||n===10){assert(s.boss);const g=s.gems.find(g=>g.bossReward);assert(g&&g.roomId===s.boss.room);assert(g.x>s.doors.find(d=>d.kind==='boss').x,'Boss reward must be beyond the arena gate');}
 // Direction is relative to the actual source node, not to the room's left edge.
 s.player.x=nd.source.x-30;assert(P.hint(s,null,1).includes('справа'));assert(P.hint(s,null,2).includes('справа'));s.player.x=nd.source.x+30;assert(P.hint(s,null,1).includes('слева'));assert(P.hint(s,null,2).includes('слева'));
 // A receiver without energy cannot solve the chapter, even if every other objective is completed.
 action(s,nd.socket);assert(!c.solved);otherGoals(s);assert.equal(C.canExit(s),false,'Actual chapter state must gate the portal independently of collectible counters');
 action(s,nd.source);assert(nd.source.activated);assert.equal(c.stage,1);assert.equal(C.canExit(s),false);
 const bridge=s.platforms.find(p=>p.kind==='powered-bridge');assert(bridge&&!bridge.gone,'Source must power a genuine return bridge');
 if(nd.battery){action(s,nd.socket);assert(!c.solved,'A powered source alone cannot fill a battery socket');action(s,nd.battery);assert.equal(s.carriedBattery,nd.battery.id);assert.equal(c.stage,2);assert(nd.battery.carried&&!nd.battery.installed);}
 action(s,nd.socket);assert(c.solved);assert.equal(c.stage,3);assert(s.chapterDoors.every(d=>d.open));assert.equal(s.carriedBattery,null);assert.equal(C.canExit(s),true);
 // Damage in the target resets only its installation; upstream power and previously completed puzzles survive.
 const priorPuzzles=s.puzzles.map(p=>p.solved);at(s,nd.socket);C.hit(s);assert.equal(s.hearts,2);assert(!c.solved&&!nd.socket.activated);assert(nd.source.activated);assert(s.chapterDoors.every(d=>!d.open));assert.deepEqual(s.puzzles.map(p=>p.solved),priorPuzzles);assert(s.gems.filter(g=>g.big).every(g=>g.taken));assert(s.friends.every(f=>f.rescued));assert(!bridge.gone);assert.equal(C.canExit(s),false);
 if(nd.battery){assert.equal(s.carriedBattery,nd.battery.id);assert(nd.battery.carried&&!nd.battery.installed);assert.equal(c.stage,2);}else assert.equal(c.stage,1);
 action(s,nd.socket);assert(c.solved,'Remote socket must be re-solvable after taking damage without another full backtrack');
 // Damage somewhere else does not undo a completed remote installation.
 const elsewhere=s.rooms.find(r=>r.id!==c.targetRoomId&&r.id!==c.sourceRoomId);Object.assign(s.player,{x:elsewhere.x+35,y:680,inv:0});C.hit(s);assert(c.solved&&nd.socket.activated&&nd.source.activated);
 // Starting a whole new attempt clears all chapter power and inventory.
 const retry=C.makeLevel(n);assert.equal(retry.chapters[0].stage,0);assert.equal(retry.chapters[0].solved,false);assert.equal(retry.carriedBattery,null);assert(retry.chapterSwitches.every(n=>!n.activated));
}
for(let n=11;n<=100;n++){const s=C.makeLevel(n);assert.equal(s.chapters.length,0,'Later ninety courses must remain free of the new authored chains');assert.equal(P.complete(s),true);}
const first=Array.from({length:10},(_,i)=>C.makeLevel(i+1));assert.equal(new Set(first.map(s=>s.rooms.map(r=>r.type+':'+r.w+':'+(r.variant||'')).join(','))).size,10);assert(new Set(first.map(s=>{const g=s.gems.find(g=>g.big);return g.x+','+g.y})).size>5);assert(new Set(first.map(s=>s.friends[0].x+','+s.friends[0].y)).size>5);
console.log('PASS: ten authored schemes, actual chapter portal gating, explicit source/battery/socket interactions, no double puzzle actions, powered return bridges, target-room damage reset with safe battery recovery, upstream/other-room preservation, whole-attempt reset, hint directions and unchanged chapter state for courses11–100.');
