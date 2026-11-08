const assert=require('node:assert/strict'),B=require('./dist/combat.js');
const DT=1/120,events=[];
const helpers={emit:(s,type,data)=>events.push({type,...data})};
function scene(n){let world=Math.floor((n-1)/10),e=B.createBoss(n,530,680,world,'boss-'+n),s={player:{x:80,y:680,h:44,w:36},enemies:[e],hazards:[],events:[]};return{s,e}}
function tick(s,e,t){for(let elapsed=0;elapsed<t;elapsed+=DT)B.advanceBoss(s,e,DT,helpers)}
for(let n=5;n<=100;n+=5){
 let{s,e}=scene(n);assert.equal(e.variant,n%10===5?0:1);assert(e.maxHp>=3&&e.maxHp<=6);assert.equal(e.arenaLeft,130);assert.equal(e.arenaRight,830);
 tick(s,e,8);assert(!e.active);assert.equal(e.clock,0);assert.equal(s.hazards.length,0);
 s.player.x=300;tick(s,e,.1);assert(e.active);assert.equal(e.phase,'warn');assert(!e.vulnerable);assert(e.warningDuration>.6);
 tick(s,e,.5);assert.equal(e.phase,'warn','attack must be visibly telegraphed');
 let kinds=new Set(),hasRest=false,minX=e.x,maxX=e.x,minY=e.y;
 for(let i=0;i<120*36;i++){B.advanceBoss(s,e,DT,helpers);kinds.add(e.attackKind);hasRest ||=e.phase==='rest';minX=Math.min(minX,e.x);maxX=Math.max(maxX,e.x);minY=Math.min(minY,e.y);assert(e.x>=e.arenaLeft+57&&e.x<=e.arenaRight-57);assert(Number.isFinite(e.x)&&Number.isFinite(e.y));if(e.phase!=='rest')assert(!e.vulnerable)}
 assert(hasRest);assert(kinds.size>=3,`boss ${n} needs attack variety`);assert(maxX-minX>80,`boss ${n} moves`);assert(minY<e.baseY-100,`boss ${n} jumps`);
 assert(s.hazards.some(h=>h.kind==='wave'&&h.bossId===e.id));
 if(kinds.has('shoot'))assert(s.hazards.some(h=>h.kind==='projectile'&&h.w>0&&Number.isFinite(h.vx)));
 if(kinds.has('summon')){let creeps=s.enemies.filter(a=>a.summonedBy===e.id);assert.equal(creeps.length,2);assert(creeps.every(a=>a.alive&&a.hp===1&&a.hit===.8));}
 // One hit immediately seals the current recovery and restarts a visible warning.
 for(let i=0;i<120*10&&e.phase!=='rest';i++)B.advanceBoss(s,e,DT,helpers);
 assert.equal(e.phase,'rest');e.hp--;B.advanceBoss(s,e,DT,helpers);assert.equal(e.phase,'warn');assert(!e.vulnerable);assert(e.hit>=.55);
 B.resetBoss(s,e);assert.equal(e.hp,e.maxHp);assert.equal(e.x,e.home);assert.equal(e.y,e.baseY);assert.equal(e.phase,'idle');assert(!e.active);assert(!s.hazards.some(h=>h.bossId===e.id));assert(!s.enemies.some(a=>a.summonedBy===e.id));assert(s.enemies.includes(e));
}
assert.equal(scene(5).e.maxHp,3);assert.equal(scene(100).e.maxHp,6);
// Ownership cleanup must retain other encounters' hazards and creatures.
{let{s,e}=scene(20);s.hazards.push({bossId:'other',kind:'wave'});s.enemies.push({summonedBy:'other',alive:true});B.resetBoss(s,e);assert.equal(s.hazards.length,1);assert(s.enemies.some(a=>a.summonedBy==='other'));}
console.log('PASS: 20 bosses / 100 levels; sleep/activation, warning >.6s, dash/jump/summon/shoot diversity, waves, projectiles, short recovery, one hit per opening, arena bounds and full encounter reset.');

