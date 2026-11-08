'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),C=require('./dist/core.js');
function clean(s){for(const e of s.enemies)e.alive=false;for(const h of s.hazards)h.dead=true;return s}
function jumpApex(form){const s=clean(C.makeLevel(7));if(form!=='normal')assert(C.setForm(s,form));const start=s.player.y;C.step(s,{jumpPressed:true},C.DT);let min=s.player.y;for(let i=0;i<240;i++){C.step(s,{},C.DT);min=Math.min(min,s.player.y);if(s.player.onGround&&i>3)break}assert.equal(s.hearts,3);return start-min}
const normal=jumpApex('normal'),bubble=jumpApex('bubble');
assert(normal>=120&&normal<=140,`normal apex ${normal}`);
assert(bubble>=30&&bubble<=50,`bubble apex ${bubble}`);
assert(bubble<normal*.5,'bubble must not be a universal high-jump upgrade');
const s=clean(C.makeLevel(7));C.step(s,{right:true},C.DT);const normalSpeed=s.player.vx;assert(C.setForm(s,'bubble'));C.step(s,{right:true},C.DT);const bubbleSpeed=s.player.vx;assert(bubbleSpeed<normalSpeed);assert(bubbleSpeed<=160);
assert(C.setForm(s,'bubble'));s.player.vy=-600;s.player.onGround=false;assert(C.setForm(s,'bubble'));assert(s.player.vy>=-280,'midair transformation must cap inherited upward velocity');
assert(C.setForm(s,'bubble'));s.player.vy=100;s.player.onGround=false;assert(C.setForm(s,'bubble'));assert.equal(s.player.vy,100,'inflating while falling must not add an upward impulse');
const windy=clean(C.makeLevel(7)),wind=windy.winds.find(w=>w.power>0&&!w.decor);assert(wind);Object.assign(windy.player,{x:wind.x+wind.w*.5,y:C.GROUND,vx:0,vy:0,onGround:false,ground:null});assert(C.setForm(windy,'bubble'));const startY=windy.player.y;for(let i=0;i<120;i++)C.step(windy,{},C.DT);const rise=startY-windy.player.y;assert(rise>=180,`wind rise ${rise}`);assert.equal(windy.hearts,3);
for(let n=1;n<=100;n++){let level=C.makeLevel(n);assert(level.gems.filter(g=>!g.big).length<=20,`level ${n} contains too many small gems`);assert.equal(level.hearts,3);assert.equal(level.maxHearts,3);}
// Read catalogue data without launching the browser UI. Rewards are computed
// from the declared economy contract, including zero optional small crystals.
const prefix=fs.readFileSync('dist/app.js','utf8').split('let saved=')[0];
const stub={getElementById(){return{getContext(){return{}}}}};
const catalogue=vm.runInNewContext(prefix+';({count:SKINS.length,paid:SKINS.filter(x=>x.cost>0).length,total:SKINS.reduce((a,b)=>a+b.cost,0)})',{GooCore:C,document:stub});
assert.equal(catalogue.paid,59);assert.equal(catalogue.total,7440);
let minimumLevelRewards=0,maxLevelRewards=0;for(let n=1;n<=100;n++){const base=12+(n%5===0?4:0)+Math.floor(n/10)*2;minimumLevelRewards+=base;maxLevelRewards+=base+5}
const worldBonuses=Array.from({length:10},(_,w)=>160+70*(w+1)).reduce((a,b)=>a+b,0);
assert(minimumLevelRewards+worldBonuses>=catalogue.total,'every paid outfit should be affordable after a complete campaign without farming or optional small gems');
console.log(`PASS: normal apex ${normal.toFixed(1)}, bubble apex ${bubble.toFixed(1)}, speeds ${normalSpeed}/${bubbleSpeed}, wind rise ${rise.toFixed(1)}; all 100 maps have <=20 small gems and 3 hearts.`);
console.log(`ECONOMY: minimum level rewards ${minimumLevelRewards} + one-time world bonuses ${worldBonuses} = ${minimumLevelRewards+worldBonuses}; all ${catalogue.paid} paid items cost ${catalogue.total} (surplus ${minimumLevelRewards+worldBonuses-catalogue.total}).`);
