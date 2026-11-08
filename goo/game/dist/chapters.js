/* Ten authored introductory expeditions and cross-room power mechanisms. */
(function(root){
'use strict';
const PLANS=[
 {name:'Две тропинки к свету',mode:'relay',rooms:[{type:'branch-hub',w:760,variant:'upper',source:true},'crate',{type:'power-vault',target:true},'rescue'],secrets:[0,2,3],friend:{room:3,spot:'high'}},
 {name:'Открытие на обратном пути',mode:'relay',rooms:[{type:'power-vault',target:true},{type:'branch-hub',w:900,variant:'lower',source:true},'laser','steps'],secrets:[0,2,3],friend:{room:1,spot:'high'}},
 {name:'Заряженный карман',mode:'battery',rooms:['keys',{type:'branch-hub',w:820,variant:'upper',source:true},{type:'power-vault',target:true},'moving','stomp'],secrets:[0,2,3],friend:{room:1,spot:'low'}},
 {name:'Сначала найди источник',mode:'battery',rooms:['sequence',{type:'power-vault',w:900,variant:'high',target:true},{type:'branch-hub',w:960,variant:'lower',source:true},'lift','laser'],secrets:[0,1,3],friend:{room:4,spot:'cell'}},
 {name:'Свет перед большой битвой',mode:'relay',rooms:[{type:'branch-hub',w:900,variant:'upper',source:true},'mirror',{type:'power-vault',w:900,variant:'high',target:true},'crumble','boss'],secrets:[0,2,4],friend:{room:1,spot:'cell'}},
 {name:'Батарея под корнями',mode:'battery',rooms:['tunnel',{type:'branch-hub',w:760,variant:'lower',source:true},'keys',{type:'power-vault',target:true},'fork'],secrets:[0,3,4],friend:{room:1,spot:'high'}},
 {name:'Ветер ведёт обратно',mode:'battery',rooms:[{type:'power-vault',target:true},'wind',{type:'branch-hub',w:960,variant:'upper',source:true},'sequence','rescue'],secrets:[0,2,4],friend:{room:4,spot:'high'}},
 {name:'Мост в соседнюю комнату',mode:'battery',rooms:[{type:'branch-hub',w:820,variant:'lower',source:true},'laser','lift',{type:'power-vault',w:900,variant:'high',target:true},'mirror','stomp'],secrets:[1,2,3],friend:{room:0,spot:'low'}},
 {name:'Три разных открытия',mode:'battery',rooms:['sequence',{type:'power-vault',target:true},'tunnel',{type:'branch-hub',w:900,variant:'upper',source:true},'gravity','keys'],secrets:[0,1,3],friend:{room:5,spot:'cell'}},
 {name:'Экспедиция хранителя',mode:'battery',rooms:[{type:'power-vault',w:900,variant:'high',target:true},{type:'branch-hub',w:960,variant:'lower',source:true},'mirror','spring','laser','boss'],secrets:[0,2,5],friend:{room:1,spot:'high'}}
];
function plan(n){return n>=1&&n<=10?PLANS[n-1]:null;}
function initialize(s){s.chapters=[];s.chapterSwitches=[];s.chapterDoors=[];s.chapterLinks=[];s.carriedBattery=null;}
function roomEntries(n){const a=plan(n);return a?a.rooms.map(r=>typeof r==='string'?{type:r}:{...r}):null;}
function build(s,type,x,room,t){
 if(!['branch-hub','power-vault'].includes(type))return false;
 const w=room.w;
 if(type==='branch-hub'){
  // Two genuine routes: a low shelf across the pit and a high staircase around the power source.
  t.floor(x,190);t.floor(x+w-190,190);
  const left=100,gap=(w-260)/4,high=[];
  for(let j=0;j<5;j++){const px=x+left+j*gap,py=[580,480,390,480,580][j],p=t.plat(px,py,140);high.push(p);t.line(px+30,py-30,2,35);}
  const low=[t.plat(x+180,740,180),t.plat(x+345,685,180),t.plat(x+510,660,Math.max(150,w-700))];
  room.highSpot={x:high[2].x+70,y:high[2].y-35};room.lowSpot={x:low[0].x+100,y:low[0].y-35};
  room.secretSpot=room.variant==='upper'?{...room.lowSpot}:{...room.highSpot};
  const sourcePlatform=room.variant==='lower'?low[0]:high[2];room.powerPoint={x:sourcePlatform.x+55,y:sourcePlatform.y};
  room.batteryPoint={x:sourcePlatform.x+115,y:sourcePlatform.y-27};
  // Keep a permanent 175-unit hatch above the low branch: powering a shortcut must never seal an uncollected secret below.
  const bridge=t.plat(x+365,675,w-555,18,{kind:'powered-bridge',gone:true,chapterPhase:'source',roomId:room.id});room.shortcutId=bridge.id;
  room.returnRoute={backward:[{x:low[2].x+50,y:660},{x:low[1].x+60,y:685},{x:low[0].x+65,y:740},{x:x+120,y:680}]};
  t.sign(x+35,580,'Здесь две тропинки. Где спрятан источник света?',false);
 }else{
  t.floor(x,w);
  const high=room.variant==='high',cx=x+(high?450:280),fy=high?390:520,roof=fy-180;
  // A closed upper cell has two doors and a solid base; flying or jumping underneath cannot collect its secret.
  t.wall(cx,roof,240,22,{kind:'chapter-roof',roomId:room.id});t.wall(cx,fy,240,22,{kind:'chapter-base',roomId:room.id});
  room.powerCell={x:cx,y:roof+22,w:240,h:fy-roof-22,floorY:fy};room.secretSpot={x:cx+125,y:fy-35};
  const route=high?[{x:x+30,y:590,w:135},{x:x+175,y:490,w:135},{x:x+320,y:390,w:130}]:[{x:x+10,y:600,w:130},{x:x+145,y:520,w:135}];
  for(const p of route){t.plat(p.x,p.y,p.w);t.line(p.x+25,p.y-30,2,38);}
  t.plat(cx+245,fy+80,110);if(high)t.plat(cx+310,fy+180,100);
  room.powerPoint={x:cx-65,y:fy};room.returnRoute={backward:route.slice().reverse().map(p=>({x:p.x+p.w/2,y:p.y}))};
  t.sign(x+35,580,'Верхняя ниша ждёт энергии из другой комнаты.',false);
 }
 return true;
}
function finalize(s){
 const a=plan(s.n);if(!a)return;
 const source=s.rooms.find(r=>r.source),target=s.rooms.find(r=>r.target);if(!source||!target)throw new Error('Authored chapter lacks source or target');
 const c={id:'chapter-'+s.n,roomId:target.id,kind:'power-chain',mode:a.mode,stage:0,required:true,solved:false,label:a.mode==='battery'?'Доставь заряженную батарею':'Соедини две комнаты светом',sourceRoomId:source.id,targetRoomId:target.id};s.chapters.push(c);
 const node=(kind,r,point,label)=>{const n={id:c.id+'-'+kind,chapterId:c.id,roomId:r.id,kind,x:point.x,y:point.y,label,activated:false};s.chapterSwitches.push(n);return n;};
 node('source',source,source.powerPoint,'Запустить источник энергии');
 if(c.mode==='battery')node('battery',source,source.batteryPoint,'Взять заряженную батарею');
 node('socket',target,target.powerPoint,c.mode==='battery'?'Установить батарею':'Подключить энергию комнаты');
 for(const side of [0,target.powerCell.w-24]){const d={id:c.id+'-door-'+side,chapterId:c.id,roomId:target.id,kind:'chapter',x:target.powerCell.x+side,y:target.powerCell.y,w:24,h:target.powerCell.h,open:false,color:'#f5d984'};s.chapterDoors.push(d);s.doors.push(d);}
 const sourceBridge=s.platforms.find(p=>p.id===source.shortcutId);if(sourceBridge)sourceBridge.chapterId=c.id;
 s.chapterLinks.push({chapterId:c.id,roomId:source.id,x1:source.powerPoint.x,y1:source.powerPoint.y-25,x2:source.powerPoint.x+60,y2:source.powerPoint.y-25,phase:'source',active:false});
 s.chapterLinks.push({chapterId:c.id,roomId:target.id,x1:target.powerPoint.x,y1:target.powerPoint.y-25,x2:target.powerCell.x,y2:target.powerPoint.y-25,phase:'complete',active:false});
 // Author the three discoveries and the child's location instead of repeating the generator's first two puzzle cells.
 s.gems=s.gems.filter(g=>!g.big);for(const index of a.secrets){const r=s.rooms[index],g={...r.secretSpot,big:true,taken:false,roomId:r.id,bossReward:r.type==='boss'};s.gems.push(g);}
 const r=s.rooms[a.friend.room],spot=a.friend.spot==='low'?r.lowSpot:a.friend.spot==='high'?r.highSpot:r.secretSpot;
 const fallback=spot||r.secretSpot;s.friends=[{x:fallback.x+20,y:fallback.y+35,rescued:false,roomId:r.id}];
 // Existing puzzle signs state only a goal on these ten courses; layered help explains the method on request.
 const goals={crate:'Запусти механизм и подними решётку.',laser:'Найди безопасный путь к закрытой нише.',mirror:'Зажги звёздочку-приёмник.',keys:'Открой цветные замки.',sequence:'Узнай порядок трёх знаков.'};
 for(const sign of s.signs){const rr=s.rooms.find(r=>sign.x>=r.x&&sign.x<r.x+r.w);if(goals[rr?.type]){sign.text=goals[rr.type];sign.voice=false;}}
 s.chapterName=a.name;s.chapterRoute=a.mode==='battery'?'source → battery → socket':'source → socket';apply(s);
}
function activeNode(s,n){const c=s.chapters.find(c=>c.id===n.chapterId);if(!c)return false;if(n.kind==='source')return !n.activated;if(n.kind==='battery')return c.stage>=1&&!n.carried&&!n.installed;if(n.kind==='socket')return !c.solved;return false;}
function getInteraction(s){if(!s.player)return null;let best=null,dist=Infinity;for(const n of s.chapterSwitches||[]){if(!activeNode(s,n))continue;const y=n.kind==='battery'?n.y:n.y-25,d=Math.hypot(s.player.x-n.x,s.player.y-s.player.h/2-y);if(d<88&&d<dist){best=n;dist=d;}}return best?{type:'chapter',id:best.id,x:best.x,y:best.y,label:best.label,roomId:best.roomId,chapterId:best.chapterId}:null;}
function apply(s){for(const c of s.chapters||[]){for(const d of s.chapterDoors)if(d.chapterId===c.id)d.open=c.solved;for(const f of s.platforms)if(f.chapterId===c.id)f.gone=f.chapterPhase==='source'?c.stage<1:!c.solved;for(const l of s.chapterLinks)if(l.chapterId===c.id)l.active=l.phase==='source'?c.stage>=1:c.solved;}}
function beforeStep(s,input,dt,api){if(!input.interactPressed)return;const a=getInteraction(s);if(!a)return;const n=s.chapterSwitches.find(n=>n.id===a.id),c=s.chapters.find(c=>c.id===n.chapterId),battery=s.chapterSwitches.find(n=>n.chapterId===c.id&&n.kind==='battery');
 if(n.kind==='source'){n.activated=true;c.stage=1;api.emit(s,'puzzleKey',{text:c.mode==='battery'?'Источник ожил. Теперь можно взять батарею.':'Свет пошёл в соседнюю комнату!'});}
 else if(n.kind==='battery'){if(s.player.form!=='normal'){api.emit(s,'hint',{text:'Батарею удобнее взять обычным Глазастиком.'});return;}n.carried=true;n.activated=true;s.carriedBattery=n.id;c.stage=2;api.emit(s,'puzzleKey',{text:'Батарея у тебя! Найди подходящий разъём.'});}
 else if(n.kind==='socket'){if(c.mode==='battery'&&s.carriedBattery!==battery.id){api.emit(s,'hint',{text:'В разъёме нет батареи. Где её можно зарядить?'});return;}if(c.mode==='relay'&&c.stage<1){api.emit(s,'hint',{text:'Провод пока тёмный. Найди источник в другой комнате.'});return;}n.activated=true;c.stage=3;c.solved=true;if(battery){battery.carried=false;battery.installed=true;s.carriedBattery=null;}api.emit(s,'puzzleSolved',{text:'Связь восстановлена! Ниша открыта, короткий мост включён.',x:n.x,y:n.y,chapterId:c.id});}
 apply(s);
}
function resetRoom(s,roomId){
 for(const c of s.chapters||[]){const source=s.chapterSwitches.find(n=>n.chapterId===c.id&&n.kind==='source'),socket=s.chapterSwitches.find(n=>n.chapterId===c.id&&n.kind==='socket'),battery=s.chapterSwitches.find(n=>n.chapterId===c.id&&n.kind==='battery');
  if(roomId===c.targetRoomId&&socket.activated){socket.activated=false;c.solved=false;if(battery){battery.installed=false;battery.carried=true;battery.activated=true;s.carriedBattery=battery.id;c.stage=2;}else c.stage=source.activated?1:0;}
  else if(roomId===c.sourceRoomId&&!c.solved&&c.stage===1&&!battery?.carried){source.activated=false;c.stage=0;}
 }
 apply(s);
}
function complete(s){return(s.chapters||[]).every(c=>!c.required||c.solved);}
function objective(s,room){const c=(s.chapters||[]).find(c=>room&&(c.sourceRoomId===room.id||c.targetRoomId===room.id));if(!c)return null;if(c.solved)return room.id===c.targetRoomId?'Ниша открыта — найди печать':'Короткий путь теперь открыт';if(room.id===c.sourceRoomId)return c.stage===0?'Найди источник на одной из тропинок':c.mode==='battery'&&c.stage===1?'Возьми заряженную батарею':'Энергия нужна в другой комнате';return c.mode==='battery'?'Доставь батарею в верхнюю нишу':'Подключи нишу к источнику света';}
function hint(s,room,stage){const c=(s.chapters||[]).find(c=>!c.solved);if(!c)return null;const source=s.rooms.find(r=>r.id===c.sourceRoomId),sourceNode=s.chapterSwitches.find(n=>n.chapterId===c.id&&n.kind==='source'),sourceX=sourceNode?.x??source.powerPoint?.x??source.x,toward=s.player.x<sourceX?'справа':'слева';if(stage===0){if(c.stage===0)return'У этой ниши есть провод. Где может быть его начало?';if(c.mode==='battery'&&c.stage===1)return'Рядом с источником появился переносимый предмет.';return'Свету нужен приёмник в другой комнате.';}if(stage===1){if(c.stage===0)return'Исследуй обе тропинки. Источник энергии '+toward+'.';if(c.mode==='battery'&&c.stage===1)return'Обычный Глазастик может взять заряженную батарею кнопкой действия.';return'Найди разъём у закрытой верхней ниши и подойди к нему.';}const n=s.chapterSwitches.find(n=>n.chapterId===c.id&&n.kind===(c.stage===0?'source':c.mode==='battery'&&c.stage===1?'battery':'socket'));return n?'Подойди к предмету '+(n.x<s.player.x?'слева':'справа')+' и нажми «Действие»: '+n.label.toLowerCase()+'.':'Вернись к источнику энергии.';}
const api={PLANS,plan,initialize,roomEntries,build,finalize,getInteraction,beforeStep,resetRoom,complete,objective,hint};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GooChapters=api;
})(typeof globalThis!=='undefined'?globalThis:this);
