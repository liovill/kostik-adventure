/* Boss encounters: deterministic, telegraphed attacks and one hit per recovery. */
(function(root){
'use strict';
const KINDS=['vacuum','mushroom','rex','guardian','chaos'];
const NAMES=[['Робот-сборщик','Робот-пылесос'],['Грибной страж','Грибной великан'],['Каменный зуб','Сердитый динозавр'],['Лунный дозорный','Космический страж'],['Рогатый хранитель','Повелитель портала'],['Песчаный робот','Буревой пылесос'],['Ледяной гриб','Хозяин снежных волн'],['Лавовый ящер','Огненный динозавр'],['Морской дозорный','Страж глубин'],['Теневой хранитель','Повелитель миров']];
const COLORS=['#8dc6dd','#d7a1ff','#b9d888','#adbcff','#e0a4f4','#f4c185','#b4e8ff','#ffac85','#80dfd7','#e9a8dc'];
const PATTERNS={vacuum:[['dash','shoot','jump'],['shoot','dash','summon','jump']],mushroom:[['jump','summon','shoot'],['summon','jump','dash','shoot']],rex:[['dash','jump','summon'],['dash','summon','jump','shoot']],guardian:[['shoot','dash','jump'],['shoot','summon','dash','jump']],chaos:[['jump','dash','summon','shoot'],['summon','dash','shoot','jump']]};
// Phase two changes the encounter's rhythm: two complementary attacks precede
// each recovery. Every link receives a fresh, full-length warning.
const PHASE_TWO={
 vacuum:[[['dash','jump'],['shoot','summon']],[['summon','shoot'],['dash','jump'],['jump','dash']]],
 mushroom:[[['summon','shoot'],['jump','dash']],[['jump','shoot'],['summon','dash'],['dash','jump']]],
 rex:[[['dash','jump'],['summon','dash']],[['jump','dash'],['shoot','jump'],['summon','shoot']]],
 guardian:[[['shoot','dash'],['jump','shoot']],[['summon','shoot'],['dash','jump'],['shoot','summon']]],
 chaos:[[['summon','jump'],['dash','shoot'],['jump','dash']],[['summon','shoot'],['dash','jump'],['shoot','jump'],['jump','summon']]]
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function createBoss(n,x,groundY,world,id){
 const wi=((world%10)+10)%10,kind=KINDS[wi%5],variant=n%10===5?0:1,hp=clamp(3+Math.floor((n-5)/30),3,6);
 return{id,x,y:groundY,w:86,h:84,home:x,baseY:groundY,dir:-1,hp,maxHp:hp,clock:0,hit:0,alive:true,boss:true,kind,world:wi,n,variant,name:NAMES[wi][variant],color:COLORS[wi],pose:'sleep',phase:'idle',phaseTime:0,active:false,vulnerable:false,combatPhase:1,rage:false,attackPlan:[],comboIndex:0,arenaLeft:x-400,arenaRight:x+300,range:300,speed:390,attackIndex:0,attackKind:null,cycle:0,seenHp:hp,spawnSerial:0,spawnPoints:[],warnTargetX:x,warnTargetY:groundY-22,vx:0,vy:0,shot:0,landed:false};
}
function event(s,helpers,type,data){if(helpers&&typeof helpers.emit==='function')helpers.emit(s,type,{bossId:data?.bossId,...data});else{(s.events??=[]).push({type,...data})}}
function attackName(kind){return{dash:'Рывок! Приготовься прыгнуть.',jump:'Сейчас он прыгнет — отойди от метки!',summon:'Он зовёт помощников!',shoot:'Он готовит выстрел!'}[kind]}
function setPhase(e,phase){e.phase=phase;e.phaseTime=0;e.vulnerable=phase==='rest';e.pose=phase==='rest'?'tired':phase==='warn'?'prepare':phase;}
function warn(s,e,helpers){
 const patterns=e.combatPhase===2?PHASE_TWO[e.kind][e.variant]:PATTERNS[e.kind][e.variant];
 const next=patterns[e.attackIndex%patterns.length];e.attackPlan=Array.isArray(next)?next.slice():[next];e.attackIndex++;e.comboIndex=0;
 warnAttack(s,e,helpers);
}
function warnAttack(s,e,helpers){
 setPhase(e,'warn');e.attackKind=e.attackPlan[e.comboIndex];e.dir=Math.sign(s.player.x-e.x)||-1;
 e.warnTargetX=clamp(s.player.x,e.arenaLeft+65,e.arenaRight-65);e.warnTargetY=s.player.y-(s.player.h||44)/2;
 e.spawnPoints=[e.arenaLeft+90,e.arenaRight-90];e.warningDuration=Math.max(.75,e.n<=20?1.15:e.n<=60?1.0:.88);e.shot=0;e.landed=false;e.vx=0;e.vy=0;
 event(s,helpers,'bossWarn',{bossId:e.id,attack:e.attackKind,combatPhase:e.combatPhase,chainStep:e.comboIndex+1,chainLength:e.attackPlan.length,text:attackName(e.attackKind),x:e.warnTargetX,y:e.baseY});
}
function completeAttack(s,e,helpers){
 if(e.comboIndex+1<e.attackPlan.length){e.comboIndex++;warnAttack(s,e,helpers);event(s,helpers,'bossChain',{bossId:e.id,attack:e.attackKind,step:e.comboIndex+1,total:e.attackPlan.length,text:'Вторая атака! Следи за предупреждением.'});}
 else recovery(s,e,helpers);
}
function recovery(s,e,helpers){
 e.y=e.baseY;e.vx=e.vy=0;setPhase(e,'rest');e.restDuration=e.n<=20?1.6:e.n<=60?1.4:1.25;
 event(s,helpers,'bossRest',{bossId:e.id,text:'Он устал — прыгай сверху!',x:e.x,y:e.y});
}
function startAttack(s,e,helpers){
 setPhase(e,'attack');e.pose=e.attackKind;
 if(e.attackKind==='jump'){e.jumpFromX=e.x;e.jumpTargetX=e.warnTargetX;e.vy=-720;e.vx=(e.jumpTargetX-e.x)/(1440/1550);}
 event(s,helpers,'bossAttack',{bossId:e.id,attack:e.attackKind});
}
function makeWave(s,e,dir){(s.hazards??=[]).push({kind:'wave',x:e.x+dir*44,y:e.baseY,vx:dir*(195+Math.min(60,e.n*.65)),w:32,h:22,life:2.5,bossId:e.id,dead:false})}
function shoot(s,e){
 let sx=e.x+e.dir*50,sy=e.y-48,dx=e.warnTargetX-sx,dy=e.warnTargetY-sy,len=Math.hypot(dx,dy)||1,speed=200+Math.min(60,e.n*.6);
 (s.hazards??=[]).push({kind:'projectile',x:sx,y:sy,vx:dx/len*speed,vy:dy/len*speed,w:20,h:20,life:3.2,bossId:e.id,gravity:0,dead:false});
}
function summon(s,e,helpers){
 let current=(s.enemies||[]).filter(a=>a.alive&&a.summonedBy===e.id);let count=Math.max(0,2-current.length);
 for(let i=0;i<count;i++){let x=e.spawnPoints[i],kind=i===0?'walker':'jumper';
  (s.enemies??=[]).push({id:String(e.id)+'-minion-'+(++e.spawnSerial),x,y:e.baseY,w:34,h:30,home:x,baseY:e.baseY,range:60,dir:i===0?1:-1,speed:58+Math.min(30,e.n*.3),hp:1,maxHp:1,alive:true,clock:0,hit:.8,kind,summonedBy:e.id,spawnWarmup:.8});
 }
 event(s,helpers,'bossSummon',{bossId:e.id,x:e.x,y:e.y,count});
}
function advanceBoss(s,e,dt,helpers={}){
 if(!e.alive){e.vulnerable=false;e.pose='defeated';return;}
 if(!e.active){
  e.clock=0;e.phase='idle';e.phaseTime=0;e.pose='sleep';e.vulnerable=false;
  if(s.player.x<=e.arenaLeft+40||s.player.x>=e.arenaRight+100)return;
  e.active=true;e.seenHp=e.hp;e.cycle=0;warn(s,e,helpers);event(s,helpers,'bossActivate',{bossId:e.id,name:e.name,text:e.name+' проснулся!'});
 }
 // Core collision handling changes HP after this call. On the next tick seal recovery,
 // telegraph a new attack, and never allow a second hit in the same opening.
 if(e.hp<e.seenHp){
  e.seenHp=e.hp;e.cycle++;e.hit=Math.max(e.hit,.55);
  if(e.combatPhase===1&&e.hp*2<=e.maxHp){e.combatPhase=2;e.rage=true;e.attackIndex=0;event(s,helpers,'bossPhase',{bossId:e.id,phase:2,name:e.name,text:e.name+': вторая фаза! Теперь он сочетает две атаки.'});}
  warn(s,e,helpers);
 }
 e.clock+=dt;e.phaseTime+=dt;
 if(e.phase==='warn'){
  e.y=e.baseY;e.pose=e.attackKind==='jump'?'crouch':e.attackKind==='summon'?'call':e.attackKind==='shoot'?'aim':'prepare';
  if(e.phaseTime>=e.warningDuration)startAttack(s,e,helpers);
  return;
 }
 if(e.phase==='rest'){
  e.y=e.baseY;e.pose='tired';
  if(e.phaseTime>=e.restDuration){e.cycle++;warn(s,e,helpers)}
  return;
 }
 if(e.phase!=='attack')return;
 let t=e.phaseTime;
 if(e.attackKind==='dash'){
  // A second dash has its own .80s turn warning, rather than an instant reversal.
  if(t<.46){e.pose='dash';e.x+=e.dir*(360+Math.min(75,e.n*.75))*dt}
  else if(t<1.26){e.pose='turn';}
  else if(t<1.72){e.pose='dash';e.x-=e.dir*(360+Math.min(75,e.n*.75))*dt}
  else completeAttack(s,e,helpers);
  e.x=clamp(e.x,e.arenaLeft+58,e.arenaRight-58);
 }else if(e.attackKind==='jump'){
  e.pose='jump';e.vy+=1550*dt;e.y+=e.vy*dt;e.x=clamp(e.x+e.vx*dt,e.arenaLeft+65,e.arenaRight-65);
  if(e.y>=e.baseY&&e.vy>0){e.y=e.baseY;e.landed=true;makeWave(s,e,-1);makeWave(s,e,1);event(s,helpers,'bossLand',{bossId:e.id,x:e.x,y:e.y});completeAttack(s,e,helpers)}
 }else if(e.attackKind==='summon'){
  e.pose='call';if(!e.shot&&t>=.15){summon(s,e,helpers);e.shot=1;}if(t>=.95)completeAttack(s,e,helpers);
 }else if(e.attackKind==='shoot'){
  e.pose='shoot';let targetShots=e.variant===0?2:3;
  if(e.shot<targetShots&&t>=.12+e.shot*.5){shoot(s,e);e.shot++;event(s,helpers,'bossShot',{bossId:e.id,x:e.x,y:e.y})}
  if(t>=.18+(targetShots-1)*.5+.25)completeAttack(s,e,helpers);
 }
}
function resetBoss(s,e){
 e.x=e.home;e.y=e.baseY;e.hp=e.maxHp;e.seenHp=e.maxHp;e.alive=true;e.active=false;e.clock=0;e.hit=0;e.phase='idle';e.phaseTime=0;e.pose='sleep';e.vulnerable=false;e.combatPhase=1;e.rage=false;e.attackPlan=[];e.comboIndex=0;e.attackIndex=0;e.attackKind=null;e.cycle=0;e.vx=e.vy=0;e.spawnPoints=[];e.shot=0;e.landed=false;
 s.hazards=(s.hazards||[]).filter(h=>h.bossId!==e.id);s.enemies=(s.enemies||[]).filter(a=>a.summonedBy!==e.id);
 return e;
}
const api={createBoss,advanceBoss,resetBoss,KINDS,NAMES,PHASE_TWO};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GooCombat=api;
})(typeof globalThis!=='undefined'?globalThis:this);

