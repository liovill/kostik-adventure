'use strict';
// Test the actual publication checkout, not a copied combat implementation.
const assert=require('node:assert/strict'),B=require('./dist/combat.js');
const DT=1/120;
function fixture(n){const e=B.createBoss(n,600,680,Math.floor((n-1)/10),'boss-'+n),events=[];const s={player:{x:0,y:680,w:36,h:44},enemies:[e],hazards:[],events};const h={emit(s,type,data){events.push({type,...data})}};return{s,e,h,events}}
function advance(f,seconds){for(let i=0;i<Math.round(seconds/DT);i++)B.advanceBoss(f.s,f.e,DT,f.h)}
const firstCombos=new Set();
for(let n=5;n<=100;n+=5){
 const f=fixture(n),{s,e,h,events}=f;
 advance(f,3);assert.equal(e.active,false);assert.equal(e.combatPhase,1);assert.equal(e.clock,0);assert.equal(events.length,0,'sleeping encounter emits no attacks');
 s.player.x=e.arenaLeft+85;B.advanceBoss(s,e,DT,h);assert(e.active);assert.equal(e.combatPhase,1);assert.equal(e.attackPlan.length,1);
 const fullHp=e.maxHp;e.hp=Math.floor(fullHp/2);B.advanceBoss(s,e,DT,h);
 assert.equal(e.combatPhase,2,`boss ${n} changes combat phase at half health`);assert(e.rage);assert.equal(events.filter(x=>x.type==='bossPhase').length,1);assert.equal(e.attackPlan.length,2);assert.equal(e.phase,'warn');assert.equal(e.vulnerable,false);
 const expected=e.attackPlan.slice();firstCombos.add(expected.join('→'));const attacks=[],warnings=[];let warningTicks=0,previous='warn',restReached=false,turnTicks=0;
 for(let i=0;i<1800;i++){
  if(e.phase==='warn')warningTicks++;
  if(e.pose==='turn')turnTicks++;
  const before=events.length;B.advanceBoss(s,e,DT,h);
  for(let j=before;j<events.length;j++){const ev=events[j];if(ev.type==='bossAttack'){attacks.push(ev.attack);warnings.push(warningTicks*DT);warningTicks=0}if(ev.type==='bossRest'){restReached=true;assert.equal(attacks.length,2,'no recovery between the two combo attacks')}}
  if(restReached)break;
 }
 assert(restReached,`boss ${n} reaches a fair recovery after its chain`);assert.deepEqual(attacks,expected);assert(warnings.every(w=>w>=.75-DT),`boss ${n} every combo link has a full warning: ${warnings}`);assert(e.restDuration>=1.25&&e.restDuration<=1.6);assert(e.vulnerable);if(expected.includes('dash'))assert(turnTicks*DT>=.75-DT,'dash reversal has its own visible warning');
 // Damage consumes this recovery and starts a new telegraphed chain immediately.
 if(e.hp>1){e.hp--;B.advanceBoss(s,e,DT,h);assert.equal(e.phase,'warn');assert.equal(e.vulnerable,false);assert(e.hit>=.55-DT);assert.equal(events.filter(x=>x.type==='bossPhase').length,1,'phase toast fires once per encounter');}
 s.hazards.push({bossId:e.id,kind:'wave'},{bossId:'other',kind:'wave'});s.enemies.push({summonedBy:e.id,id:'owned'},{summonedBy:'other',id:'other'});B.resetBoss(s,e);
 assert.equal(e.combatPhase,1);assert.equal(e.rage,false);assert.equal(e.hp,fullHp);assert.equal(e.active,false);assert.equal(e.phase,'idle');assert.deepEqual(e.attackPlan,[]);assert.equal(e.comboIndex,0);assert(!s.hazards.some(a=>a.bossId===e.id));assert(s.hazards.some(a=>a.bossId==='other'));assert(!s.enemies.some(a=>a.summonedBy===e.id));assert(s.enemies.some(a=>a.summonedBy==='other'));
}
assert(firstCombos.size>=5,'boss archetypes use different phase-two tactical combinations');
// A merely small wound does not enrage a six-heart boss.
{const f=fixture(100);f.s.player.x=f.e.arenaLeft+85;advance(f,.05);f.e.hp=5;advance(f,.01);assert.equal(f.e.combatPhase,1);f.e.hp=3;advance(f,.01);assert.equal(f.e.combatPhase,2)}
console.log(`PASS: 20 actual boss phase transitions; ${firstCombos.size} distinct opening combinations, full warnings including dash reversal, two attacks per recovery, one hit per window, isolated full reset and arena-only activation.`);
