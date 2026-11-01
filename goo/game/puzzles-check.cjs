'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),P=require('./dist/puzzles.js'),C=require('./dist/core.js');
const hooked=fs.readFileSync(require.resolve('./dist/core.js'),'utf8').includes('beforeStep('),DT=C.DT||1/120;
let serial=10000;
function fixture(type,roomId=0,x=330,n=10){
 let s=C.makeLevel(1);for(const k of ['platforms','walls','gems','enemies','buttons','doors','winds','springs','flags','friends','keys','hazards','signs','particles','events','rooms','gravitySwitches','puzzles','lasers','crates','plates','mirrors','receivers','switches','keyItems','chapters','chapterSwitches','chapterDoors','chapterLinks'])s[k]=[];s.carriedBattery=null;
 Object.assign(s,{n,status:'play',hearts:3,maxHearts:3,time:0,collected:0,major:0,rescued:0,defeated:0,lowGravity:false,gravityBoost:false,length:2000,goal:{x:1800,y:680},maxY:880,spawn:{x:x+35,y:680}});
 Object.assign(s.player,{x:x+35,y:680,w:36,h:44,form:'normal',vx:0,vy:0,onGround:true,ground:null,coyote:.13,inv:0});
 const tools={floor:(x,w,y=680)=>{const a={id:++serial,x,y,w,h:100,kind:'ground',oneWay:false};s.platforms.push(a);return a},plat:(x,y,w,h=24,extra={})=>{const a={id:++serial,x,y,w,h,oneWay:true,...extra};s.platforms.push(a);return a},wall:(x,y,w,h,extra={})=>{const a={id:++serial,x,y,w,h,...extra};s.walls.push(a);return a},gem:(x,y,big=false)=>s.gems.push({x,y,big,taken:false}),line:(x,y,n,dx=42)=>{for(let j=0;j<n;j++)s.gems.push({x:x+j*dx,y,big:false,taken:false})},sign:(x,y,text,voice)=>s.signs.push({x,y,text,voice,read:false}),enemy(){}};
 let room={id:roomId,type,x,w:700};s.rooms.push(room);P.initialize(s);assert(P.build(s,type,x,room,tools));return{s,room,tools};
}
const api={emit:(s,type,data={})=>s.events.push({type,...data}),hit:s=>C.hit(s),box:C.box,overlap:C.overlap};
function tick(s,input={}){if(hooked)C.step(s,input,DT);else{P.beforeStep(s,input,DT,api);C.step(s,input,DT);P.afterStep(s,input,DT,api)}}
function wait(s,n){for(let i=0;i<n;i++)tick(s)}
function reach(s,x,y,max=1600){for(let i=0;i<max;i++){const p=s.player;if(Math.abs(p.x-x)<6&&Math.abs(p.y-y)<5&&p.onGround)return;const delta=x-p.x,go=Math.abs(delta)>3,obstacle=s.crates.some(c=>delta>0?c.x-p.x>0&&c.x-p.x<65:c.x+c.w-p.x<0&&p.x-c.x-c.w<65),jump=p.onGround&&(p.y-y>12||obstacle);tick(s,{right:go&&delta>0,left:go&&delta<0,jumpPressed:jump});if(s.hearts<3)throw new Error(`Unexpected damage toward ${x},${y} at ${p.x},${p.y}`)}throw new Error(`Cannot reach ${x},${y}; got ${s.player.x},${s.player.y}`)}
function act(s){assert(P.getInteraction(s),'No interactable object nearby');tick(s,{interactPressed:true})}
function crossSecretAndReturn(s,room){const x=room.x;reach(s,x+574,680);assert(s.doors.filter(d=>d.puzzleId===room.puzzleId).every(d=>d.open));reach(s,x+680,680);reach(s,x+40,680);assert.equal(s.hearts,3)}
// Explicit interaction, not proximity, controls a lever. The real jump route avoids damage.
{
 const {s,room}=fixture('laser'),x=room.x;reach(s,x+165,580);reach(s,x+325,485);assert.equal(s.puzzles[0].solved,false);wait(s,90);assert.equal(s.puzzles[0].solved,false);act(s);assert(s.puzzles[0].solved);assert(s.lasers.every(l=>l.disabled));crossSecretAndReturn(s,room);
}
// Safe approach under incoming ray, one mirror turn powers the receiver.
{
 const {s,room}=fixture('mirror'),x=room.x;reach(s,x+165,580);reach(s,x+300,500);assert.equal(s.hearts,3);assert.equal(s.receivers[0].powered,false);wait(s,100);assert(!s.puzzles[0].solved);assert.equal(P.getInteraction(s).type,'mirror');act(s);assert(s.receivers[0].powered);assert(s.puzzles[0].solved);crossSecretAndReturn(s,room);
}
// A flat hero cannot push; normal form pushes with real movement and holds the pressure plate.
{
 const {s,room}=fixture('crate'),x=room.x,c=s.crates[0];C.setForm(s,'flat');for(let i=0;i<180;i++)tick(s,{right:true});assert.equal(c.x,c.homeX);assert(!s.puzzles[0].solved);C.setForm(s,'flat');for(let i=0;i<300&&!s.puzzles[0].solved;i++)tick(s,{right:true});assert(s.plates[0].pressed);assert(s.puzzles[0].solved);crossSecretAndReturn(s,room);
}
// Touching keys does not collect them. Both keys and an explicit lock interaction are required.
{
 const {s,room}=fixture('keys'),x=room.x;reach(s,x+162,580);assert.equal(s.keyItems[0].collected,false);act(s);assert(s.keyItems[0].collected);reach(s,x+335,480);act(s);assert(s.keyItems.every(k=>k.collected));assert.equal(s.puzzles[0].solved,false);reach(s,x+445,680);act(s);assert(s.puzzles[0].solved);crossSecretAndReturn(s,room);
}
// A wrong symbol resets the sequence; no auto-solving by stepping across the buttons.
{
 const {s,room}=fixture('sequence'),x=room.x,p=s.puzzles[0];const wrong=s.switches.find(sw=>sw.symbol!==p.solution[0]);reach(s,wrong.x,680);act(s);assert.equal(p.progress,0);for(const symbol of p.solution){const sw=s.switches.find(sw=>sw.symbol===symbol);reach(s,sw.x,680);act(s)}assert(p.solved);crossSecretAndReturn(s,room);
}
// Pulse telegraph precedes activation and an active beam costs one life, not one life each frame.
{
 const {s}=fixture('laser'),l=s.lasers.find(l=>l.kind==='pulse');l.clock=l.period-l.warning+.05;P.beforeStep(s,{},DT,api);assert(l.telegraph&&!l.active);l.clock=l.period+.01;P.beforeStep(s,{},DT,api);assert(l.active);Object.assign(s.player,{x:l.x,y:680});P.afterStep(s,{},DT,api);assert.equal(s.hearts,2);P.afterStep(s,{},DT,api);assert.equal(s.hearts,2);
}
// Reset touches only one room; collected secrets/friends and other solved puzzles survive.
{
 const {s,room,tools}=fixture('mirror');const other={id:9,type:'keys',x:1100,w:700};P.build(s,'keys',1100,other,tools);s.rooms.push(other);const first=s.puzzles[0],last=s.puzzles[1];first.solved=last.solved=true;s.doors.forEach(d=>d.open=true);s.mirrors[0].orientation=1;s.receivers[0].powered=true;s.keyItems.forEach(k=>k.collected=true);s.gems.push({x:700,y:630,big:true,taken:true});s.friends.push({x:700,y:630,rescued:true});P.resetRoom(s,room.id);assert(!first.solved);assert(last.solved);assert.equal(s.mirrors[0].orientation,0);assert(!s.receivers[0].powered);assert(s.keyItems.every(k=>k.collected));assert(s.doors.filter(d=>d.roomId===9).every(d=>d.open));assert(s.gems.at(-1).taken&&s.friends[0].rescued);
}
// Later courses combine additional prerequisites rather than changing only colours.
{
 const {s,room}=fixture('laser',0,330,90),x=room.x;assert.equal(s.switches.length,2);reach(s,x+165,580);reach(s,x+325,485);act(s);assert(!s.puzzles[0].solved,'One lever must not solve late laser');reach(s,x+45,680);reach(s,x+110,680);act(s);assert(s.puzzles[0].solved);crossSecretAndReturn(s,room);
}
{
 const {s,room}=fixture('mirror',0,330,90),x=room.x;assert(s.puzzles[0].needsPower);assert(!s.puzzles[0].powerOn);reach(s,x+165,580);reach(s,x+300,500);act(s);assert(!s.puzzles[0].solved,'Unpowered mirror cannot solve');reach(s,x+45,680);reach(s,x+100,680);act(s);assert(s.puzzles[0].solved);crossSecretAndReturn(s,room);
}
{
 const {s,room}=fixture('keys',0,330,90),x=room.x;assert.equal(s.keyItems.length,3);reach(s,x+162,580);act(s);reach(s,x+335,480);act(s);reach(s,x+445,680);act(s);assert(!s.puzzles[0].solved,'Two keys must not open late three-key lock');reach(s,x+400,680);tick(s,{jumpPressed:true});wait(s,17);assert.equal(P.getInteraction(s)?.type,'key');act(s);assert(s.keyItems.every(k=>k.collected));wait(s,100);reach(s,x+445,680);act(s);assert(s.puzzles[0].solved);crossSecretAndReturn(s,room);
}
{
 const {s,room}=fixture('sequence',0,330,90),p=s.puzzles[0];assert.equal(p.solution.length,5);for(const symbol of p.solution){const sw=s.switches.find(sw=>sw.symbol===symbol);reach(s,sw.x,680);act(s)}assert(p.solved);crossSecretAndReturn(s,room);
}
console.log('PASS: five base puzzle rooms and four late variants solved with real movement and explicit interaction, no damage; backtracking, pulse timing, form restriction, extra prerequisites and isolated reset checked.');
