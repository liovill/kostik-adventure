const assert=require('node:assert/strict'),C=require('./dist/core.js');
const DT=C.DT||1/120;
const tick=(s,count=1,input={})=>{for(let i=0;i<count;i++)C.step(s,input,DT)};
function make(n){let s=C.makeLevel(n),r=s.rooms.find(r=>r.type==='boss');for(let e of s.enemies)if(!e.boss)e.alive=false;Object.assign(s.player,{x:r.x+160,y:680,vy:0,vx:0,inv:100});return{s,r,e:s.boss}}
const failures=[];
function check(name,fn){try{fn();console.log('PASS:',name)}catch(e){failures.push(name+': '+e.message);console.log('FAIL:',name,e.message)}}
check('boss sleeps until player enters arena',()=>{let{s,e}=make(5);tick(s,120);assert(!e.active);assert.equal(e.clock,0);assert.equal(e.hp,e.maxHp);assert(!s.hazards.some(h=>h.bossId===e.id));});
check('boss clock runs once per physics tick',()=>{let{s,r,e}=make(5);s.player.x=r.x+180;tick(s);let before=e.clock;tick(s,60);assert(Math.abs(e.clock-before-60*DT)<.001,`expected ${60*DT}, got ${e.clock-before}`)});
check('activation closes entrance and keeps exit closed',()=>{let{s,r,e}=make(5);s.player.x=r.x+180;tick(s);assert(e.active);assert(!s.doors.find(d=>d.kind==='boss-entry').open);assert(!s.doors.find(d=>d.kind==='boss').open);});
check('entrance bars prevent retreat during the fight',()=>{let{s,r}=make(5);s.player.x=r.x+180;tick(s);tick(s,120,{left:true});let door=s.doors.find(d=>d.kind==='boss-entry');assert(s.player.x>=door.x+door.w+s.player.w/2-1)});
check('exit bars prevent skipping the boss reward',()=>{let{s,r,e}=make(5);s.player.x=r.x+790;tick(s,120,{right:true});let door=s.doors.find(d=>d.kind==='boss');assert(s.player.x<=door.x-s.player.w/2+1);let reward=s.gems.find(g=>g.bossReward);assert(!reward.taken);assert(e.alive);assert(!s.portalReady);});
check('generic stomp cannot damage a sleeping/preparing boss',()=>{let{s,e}=make(5);s.player.x=e.x;s.player.y=e.y-e.h-2;s.player.vy=300;tick(s,3);assert.equal(e.hp,e.maxHp);});
check('boss damage resets encounter, owned hazards and entrance',()=>{let{s,r,e}=make(5);s.player.x=r.x+180;tick(s);e.hp=1;e.seenHp=1;s.hazards.push({kind:'projectile',x:e.x,y:e.y,vx:0,vy:0,w:20,h:20,life:3,bossId:e.id});s.enemies.push({id:'test-summon',summonedBy:e.id,alive:true});s.player.inv=0;C.hit(s);assert.equal(e.hp,e.maxHp);assert(!e.active);assert(s.doors.find(d=>d.kind==='boss-entry').open);assert.equal(s.player.x,r.spawn.x);assert(!s.hazards.some(h=>h.bossId===e.id));assert(!s.enemies.some(a=>a.summonedBy===e.id));});
check('one hit consumes a boss recovery window',()=>{let{s,e}=make(5);s.player.x=e.x-150;tick(s);for(let i=0;i<1200&&e.phase!=='rest';i++)tick(s);assert.equal(e.phase,'rest');Object.assign(s.player,{x:e.x,y:e.y-e.h-2,vy:300,inv:100});let hp=e.hp;tick(s,3);assert.equal(e.hp,hp-1);assert.equal(e.phase,'warn');assert(!e.vulnerable);});
if(failures.length){console.error(failures.join('\n'));process.exitCode=1}else console.log('PASS: integrated boss encounter checks.');
