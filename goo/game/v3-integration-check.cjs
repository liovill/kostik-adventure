'use strict';
// Requirement-level regressions. This intentionally tests the published core API,
// not source strings or a duplicate implementation of the game rules.
const assert=require('node:assert/strict');
const C=require('./dist/core.js');
assert.equal(typeof C.canExit,'function','core must expose the same exit predicate used by rendering and victory');
assert.equal(C.COURSES.length,100,'the campaign contains 100 course definitions');
const place=(s,x,y)=>Object.assign(s.player,{x,y,vx:0,vy:0,onGround:false,ground:null,coyote:0,inv:0});
function openObstacles(s){
 for(const e of s.enemies)e.alive=false;
 if(s.boss)s.boss.alive=false;
 for(const d of s.doors)d.open=true;
 for(const p of s.puzzles||[])p.solved=true;
 for(const chapter of s.chapters||[])chapter.solved=true;
 for(const h of s.hazards)h.dead=true;
}
function collectAll(s){for(const g of s.gems)if(g.big)g.taken=true;for(const f of s.friends)f.rescued=true;s.major=3;s.rescued=s.friends.length;}
let bosses=0,pickups=0,portalCases=0;
for(let n=1;n<=100;n++){
 const s=C.makeLevel(n);
 assert.equal(s.n,n);
 assert.equal(s.hearts,3,`level ${n}: initial hearts`);
 assert.equal(s.maxHearts,3,`level ${n}: maximum hearts`);
 const major=s.gems.filter(g=>g.big);
 assert.equal(major.length,3,`level ${n}: exactly three major secrets`);
 assert(s.friends.length>0,`level ${n}: a baby must be available`);
 assert.equal(!!s.boss,n%5===0,`level ${n}: boss cadence`);
 if(s.boss){
  bosses++;
  assert.equal(s.rooms.at(-1).type,'boss',`level ${n}: boss room is last`);
  assert(Math.max(...major.map(g=>g.x))>s.boss.x+s.boss.w/2+35,`level ${n}: final crystal must be protected beyond the boss`);
  const reward=major.find(g=>g.bossReward);
  assert(reward,`level ${n}: a boss reward crystal is explicitly protected`);
  place(s,reward.x,reward.y+22);s.player.inv=20;
  C.step(s,{},C.DT);
  assert.equal(reward.taken,false,`level ${n}: clipping behind the gate cannot collect a living boss's reward`);
 }
 assert(Array.isArray(s.healthPickups),`level ${n}: heart pickups collection exists`);
 pickups+=s.healthPickups.length;
 openObstacles(s);
 // Fake display counters must never unlock a course with missing physical secrets.
 s.major=3;s.rescued=s.friends.length;
 assert.equal(C.canExit(s),false,`level ${n}: counters cannot substitute for collectible state`);
 place(s,s.goal.x,s.goal.y);
 C.step(s,{},C.DT);
 assert.equal(s.status,'play',`level ${n}: arriving without secrets cannot finish`);
 collectAll(s);
 major[0].taken=false;
 assert.equal(C.canExit(s),false,`level ${n}: one missing major must lock exit`);
 major[0].taken=true;
 s.friends.at(-1).rescued=false;
 assert.equal(C.canExit(s),false,`level ${n}: last unrescued baby must lock exit`);
 s.friends.at(-1).rescued=true;
 assert.equal(C.canExit(s),true,`level ${n}: all goals and clear obstacles unlock exit`);
 if(s.boss){s.boss.alive=true;assert.equal(C.canExit(s),false,`level ${n}: a living boss still blocks the exit`);s.boss.alive=false;}
 place(s,s.goal.x,s.goal.y);
 C.step(s,{},C.DT);
 assert.equal(s.status,'won',`level ${n}: complete objectives allow victory`);
 portalCases++;
}
assert.equal(bosses,20,'twenty boss encounters across the campaign');
assert(pickups>0,'campaign contains collectible heart refills');
assert.equal(C.makeLevel(101).n,100,'out-of-range level clamps to the final course');
// A refill heals exactly one missing heart and cannot exceed three hearts.
{
 let s;for(let n=1;n<=100;n++){s=C.makeLevel(n);if(s.healthPickups.length)break}
 openObstacles(s);s.hearts=2;
 const h=s.healthPickups[0];place(s,h.x,h.y+22);
 C.step(s,{},C.DT);
 assert.equal(s.hearts,3,'heart refill restores one heart');
 assert(h.taken,'heart refill is consumed');
 C.step(s,{},C.DT);
 assert.equal(s.hearts,3,'heart refill cannot repeatedly add health');
}
// Damage preserves already found secrets and rescued babies; zero health loses.
{
 const s=C.makeLevel(7);openObstacles(s);
 const g=s.gems.find(g=>g.big),f=s.friends[0];g.taken=true;f.rescued=true;s.major=1;s.rescued=1;
 s.player.inv=0;C.hit(s);
 assert.equal(s.hearts,2);assert(g.taken);assert(f.rescued);assert.equal(s.status,'play');
 s.player.inv=0;C.hit(s);assert.equal(s.hearts,1);
 s.player.inv=0;C.hit(s);assert.equal(s.hearts,0);assert.equal(s.status,'lost');
 const restarted=C.makeLevel(7);assert.equal(restarted.hearts,3);assert.equal(restarted.major,0);assert(restarted.gems.filter(g=>g.big).every(g=>!g.taken));assert(restarted.friends.every(f=>!f.rescued));
}
// Damage resets the current puzzle, not the rest of the level or found secrets.
{
 let s;for(let n=1;n<=100;n++){let candidate=C.makeLevel(n);if(candidate.puzzles?.length>=2){s=candidate;break}}
 assert(s,'campaign provides a later course with two independent puzzle rooms');
 const current=s.puzzles[0],other=s.puzzles[1],room=s.rooms.find(r=>r.id===current.roomId);
 for(const p of [current,other]){p.solved=true;p.progress=2;for(const d of s.doors.filter(d=>d.puzzleId===p.id))d.open=true;for(const a of s.crates.filter(a=>a.puzzleId===p.id))a.x+=30;for(const a of s.mirrors.filter(a=>a.puzzleId===p.id))a.orientation=1-a.initialOrientation;for(const a of s.keyItems.filter(a=>a.puzzleId===p.id))a.collected=true;}
 const otherSnapshot=JSON.stringify({puzzle:other,doors:s.doors.filter(d=>d.puzzleId===other.id),crates:s.crates.filter(a=>a.puzzleId===other.id),mirrors:s.mirrors.filter(a=>a.puzzleId===other.id),keys:s.keyItems.filter(a=>a.puzzleId===other.id)});
 const g=s.gems.find(g=>g.big),f=s.friends[0];g.taken=true;f.rescued=true;s.major=1;s.rescued=1;
 place(s,room.x+120,C.GROUND);C.hit(s);
 assert.equal(s.hearts,2);assert.equal(current.solved,false,'current puzzle resets');assert.equal(current.progress,0,'current sequence resets');
 for(const d of s.doors.filter(d=>d.puzzleId===current.id))assert.equal(d.open,false,'current puzzle door closes');
 for(const a of s.crates.filter(a=>a.puzzleId===current.id)){assert.equal(a.x,a.homeX);assert.equal(a.y,a.homeY)}
 for(const a of s.mirrors.filter(a=>a.puzzleId===current.id))assert.equal(a.orientation,a.initialOrientation);
 for(const a of s.keyItems.filter(a=>a.puzzleId===current.id))assert.equal(a.collected,false);
 assert.equal(JSON.stringify({puzzle:other,doors:s.doors.filter(d=>d.puzzleId===other.id),crates:s.crates.filter(a=>a.puzzleId===other.id),mirrors:s.mirrors.filter(a=>a.puzzleId===other.id),keys:s.keyItems.filter(a=>a.puzzleId===other.id)}),otherSnapshot,'another room must not reset');
 assert(g.taken&&f.rescued,'damage must not erase already found level objectives');
 assert(s.player.x<=room.x+150,'respawn stays at the puzzle entrance, before its newly closed gate');
}
console.log(`PASS: ${portalCases} objective-gated courses, 20 boss rooms, 100-level bounds, heart refill/three-life limit, damage preservation and clean level restart.`);
