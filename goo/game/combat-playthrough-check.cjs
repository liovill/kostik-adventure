'use strict';
// Local entrance placement is the only scene mutation. Every later movement,
// stomp, phase transition, hit and victory comes from normal C.step inputs.
const C=require('./dist/core.js');
const assert=require('node:assert/strict');
const DT=C.DT;
function trial(n,options={}){
 const threshold=options.threshold||130,s=C.makeLevel(n),b=s.boss,room=s.rooms.find(r=>r.type==='boss');
 Object.assign(s.player,{x:room.spawn.x,y:room.spawn.y,vx:0,vy:0,onGround:false,ground:null,coyote:0});
 const trace=[],started=s.hearts;let jumpAt=-10,lastHp=b.hp,lastHeart=s.hearts,phaseSeen=false;
 for(let i=0;i<120*100&&s.status==='play';i++){
  const p=s.player,dx=b.x-p.x,dist=Math.abs(dx);let direction=Math.sign(dx),jump=false;
  if(dist<13)direction=0;
  if(options.dodgeJump&&b.active&&b.attackKind==='jump'&&b.phase!=='rest'){
   const danger=b.phase==='warn'?b.warnTargetX:b.x;
   if(Math.abs(p.x-danger)<145)direction=p.x<danger?-1:1;else direction=0;
  }
  const shelter=options.dodgeShoot&&b.active&&b.attackKind==='shoot'&&b.phase!=='rest';
  const shelterX=b.home-250;
  if(shelter)direction=Math.abs(p.x-shelterX)>8?Math.sign(shelterX-p.x):0;
  if(p.onGround&&s.time-jumpAt>.22){
   const waveNear=s.hazards.some(h=>h.kind==='wave'&&!h.dead&&Math.abs(h.x-p.x)<100);
   const support=s.platforms.find(a=>a.id===p.ground),edge=support&&(direction>0?support.x+support.w-p.x:p.x-support.x)<55;
   const climbShelter=shelter&&p.y>590&&Math.abs(p.x-shelterX)<140;
   const attackJump=!shelter&&(dist<threshold||options.edgeJump&&edge&&p.y<650);
   if(attackJump||waveNear||climbShelter){jump=true;jumpAt=s.time;}
  }
  C.step(s,{left:direction<0,right:direction>0,jumpPressed:jump},DT);
  if(b.combatPhase===2)phaseSeen=true;
  if(b.hp!==lastHp||s.hearts!==lastHeart){trace.push({time:+s.time.toFixed(2),bossHp:b.hp,hearts:s.hearts,phase:b.phase,combatPhase:b.combatPhase,x:+p.x.toFixed(1),y:+p.y.toFixed(1)});lastHp=b.hp;lastHeart=s.hearts;}
  if(!b.alive)return{level:n,won:true,elapsed:+s.time.toFixed(2),hearts:s.hearts,mistakes:started-s.hearts,phaseSeen,threshold,dodgeJump:!!options.dodgeJump,dodgeShoot:!!options.dodgeShoot,edgeJump:!!options.edgeJump,trace};
 }
 return{level:n,won:false,elapsed:+s.time.toFixed(2),hearts:s.hearts,bossHp:b.hp,status:s.status,phaseSeen,threshold,dodgeJump:!!options.dodgeJump,dodgeShoot:!!options.dodgeShoot,edgeJump:!!options.edgeJump,trace};
}
if(require.main===module){
 if(process.argv.includes('--sweep')){
  const results=[];for(let n of [5,10])for(let threshold of [90,110,130,150,170])for(let dodgeJump of [false,true])for(let dodgeShoot of [false,true])for(let edgeJump of [false,true])results.push(trial(n,{threshold,dodgeJump,dodgeShoot,edgeJump}));
  for(let n of [5,10]){let trials=results.filter(r=>r.level===n),wins=trials.filter(r=>r.won).sort((a,b)=>b.hearts-a.hearts||a.elapsed-b.elapsed),best=wins[0]||trials.sort((a,b)=>a.bossHp-b.bossHp||b.hearts-a.hearts)[0];console.log(JSON.stringify({level:n,successfulPolicies:wins.length,totalPolicies:trials.length,best},null,2));assert(wins.length>0,`no tested policy defeated boss ${n}`)}
 }else{
  const results=[trial(5,{threshold:110,dodgeJump:true}),trial(10,{threshold:90,dodgeShoot:true,edgeJump:true})];
  for(let result of results){assert(result.won,`boss ${result.level} was not defeated`);assert(result.phaseSeen,`boss ${result.level} phase two was not exercised`);assert.equal(result.mistakes,0,`boss ${result.level} must be beatable without damage`);console.log(JSON.stringify(result,null,2))}
  console.log('PASS: bosses 5 and 10 defeated with ordinary inputs, both combat phases exercised, no health/pose overrides and no player damage. This proves reachability, not human reaction difficulty.');
 }
}
module.exports={trial};
