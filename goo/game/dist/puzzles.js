/* Puzzle-room extension. Rendering contract is documented at the end of this file. */
(function(root){
'use strict';
const FLOOR=680, TYPES=['laser','mirror','crate','keys','sequence'];
function initialize(s){for(const k of ['puzzles','lasers','crates','plates','mirrors','receivers','switches','keyItems'])if(!Array.isArray(s[k]))s[k]=[];}
const rect=p=>({x:p.x-p.w/2,y:p.y-p.h,w:p.w,h:p.h});
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function id(s,prefix){return prefix+'-'+s.n+'-'+s.puzzles.length;}
function build(s,type,x,room,t){
 if(!TYPES.includes(type))return false;initialize(s);
 const p={id:id(s,type),roomId:room.id,type,x,w:700,solved:false,progress:0,clock:0,solution:[],message:'',variant:1,powerOn:true,needsPower:false};s.puzzles.push(p);room.puzzleId=p.id;
 t.floor(x,700);t.wall(x-5,250,710,25,{kind:'puzzle-ceiling',roomId:room.id});
 // The secret cell has a complete roof and two locked sides. It cannot be entered by flying around the puzzle.
 for(const side of [470,650])s.doors.push({id:p.id+'-gate-'+side,puzzleId:p.id,roomId:room.id,kind:'puzzle',x:x+side,y:275,w:26,h:405,open:false,color:side===470?'#9cf3d2':'#99caff'});
 room.secretSpot={x:x+574,y:FLOOR-48};p.secretSpot={...room.secretSpot};
 t.line(x+65,FLOOR-30,3);t.line(x+530,FLOOR-30,3);
 const sign=message=>t.sign(x+40,FLOOR-98,message,true);
 if(type==='laser'){
  t.plat(x+100,580,120);t.plat(x+270,485,140);
  s.switches.push({id:p.id+'-lever',puzzleId:p.id,roomId:room.id,kind:'lever',x:x+335,y:485,label:'Выключить лазер',activated:false});
  if(s.n>30){p.variant=2;s.switches.push({id:p.id+'-lever-two',puzzleId:p.id,roomId:room.id,kind:'lever',x:x+110,y:FLOOR,label:'Включить вспомогательный рычаг',activated:false});}
  s.lasers.push({id:p.id+'-pulse',puzzleId:p.id,roomId:room.id,kind:'pulse',x:x+240,y:525,w:9,h:155,clock:1.8,period:4.2,onTime:1.7,warning:.6,active:false,telegraph:false,disabled:false,color:'#ff6d90'});
  s.lasers.push({id:p.id+'-constant',puzzleId:p.id,roomId:room.id,kind:'constant',x:x+440,y:275,w:9,h:405,active:true,telegraph:false,disabled:false,color:'#ff6d90'});
  sign(s.n>30?'Две лампы охраняют секрет. Как отключить защиту?':'Костик, за лучами спрятан секрет. Найди способ убрать защиту.');p.hint=s.n>30?'Нужны оба рычага: один внизу, второй на верхней площадке.':'Найди рычаг наверху. Мигающий луч можно пересечь во время паузы.';
 }else if(type==='mirror'){
  t.plat(x+115,580,120);t.plat(x+245,500,170);
  s.mirrors.push({id:p.id+'-mirror',puzzleId:p.id,roomId:room.id,x:x+345,y:390,orientation:0,initialOrientation:0,label:'Повернуть зеркало'});
  s.receivers.push({id:p.id+'-receiver',puzzleId:p.id,roomId:room.id,x:x+345,y:310,r:17,powered:false});
  s.lasers.push({id:p.id+'-source',puzzleId:p.id,roomId:room.id,kind:'mirror-source',x:x+60,y:386,w:285,h:8,active:true,telegraph:false,disabled:false,color:'#ff8bba'});
  s.lasers.push({id:p.id+'-reflection',puzzleId:p.id,roomId:room.id,kind:'reflection',x:x+341,y:390,w:8,h:265,active:true,telegraph:false,disabled:false,color:'#ff8bba'});
  if(s.n>50){p.variant=2;p.needsPower=true;p.powerOn=false;s.switches.push({id:p.id+'-power',puzzleId:p.id,roomId:room.id,kind:'power',x:x+100,y:FLOOR,label:'Включить питание зеркала',activated:false});for(const l of s.lasers)if(l.puzzleId===p.id)l.active=false;}
  sign(s.n>50?'Источник погас, а приёмник ждёт свет. Верни энергию в комнату.':'Звёздочка-приёмник не горит. Ей нужен свет.');p.hint=s.n>50?'Рычаг внизу включает источник. Затем поверни зеркало к звёздочке.':'Подойди к зеркалу сбоку на верхней площадке и нажми «Действие».';
 }else if(type==='crate'){
  const c={id:p.id+'-crate',puzzleId:p.id,roomId:room.id,x:x+175,y:FLOOR-56,w:56,h:56,homeX:x+175,homeY:FLOOR-56,vy:0,minX:x+45,maxX:x+420};s.crates.push(c);
  s.plates.push({id:p.id+'-plate',puzzleId:p.id,roomId:room.id,x:x+350,y:FLOOR,w:90,h:10,pressed:false,hold:0,required:.45});
  sign('Плита у решётки не горит. Что сможет её удержать?');p.hint='Поставь ящик на подсвеченную плиту обычной формой. Удерживай его там немного.';
 }else if(type==='keys'){
  t.plat(x+95,580,135);t.plat(x+265,480,140);
  s.keyItems.push({id:p.id+'-red',puzzleId:p.id,roomId:room.id,x:x+162,y:550,color:'#ff9a9f',symbol:'△',name:'Красный ключ',collected:false});
  s.keyItems.push({id:p.id+'-blue',puzzleId:p.id,roomId:room.id,x:x+335,y:450,color:'#95ceff',symbol:'○',name:'Синий ключ',collected:false});
  if(s.n>60){p.variant=2;s.keyItems.push({id:p.id+'-gold',puzzleId:p.id,roomId:room.id,x:x+400,y:570,color:'#ffe397',symbol:'□',name:'Золотой ключ',collected:false});}
  s.switches.push({id:p.id+'-lock',puzzleId:p.id,roomId:room.id,kind:'key-lock',x:x+420,y:FLOOR,label:s.n>60?'Вставить три ключа':'Вставить оба ключа',activated:false});
  const doors=s.doors.filter(d=>d.puzzleId===p.id);doors[0].color='#ff9a9f';doors[0].symbol='△';doors[1].color='#95ceff';doors[1].symbol='○';
  sign(s.n>60?'У замков три разных знака. Исследуй комнату.':'У двух замков разные знаки. Что к ним подходит?');p.hint=s.n>60?'Третий золотой ключ спрятан под верхней площадкой. Нужны △, ○ и □.':'Найди ключи △ и ○ на площадках. Нажми действие у каждого, затем у замка внизу.';
 }else if(type==='sequence'){
  const symbols=['☀','◆','☾'],rot=((s.n||1)+room.id)%3;p.solution=[symbols[rot],symbols[(rot+2)%3],symbols[(rot+1)%3]];
  if(s.n>45){p.variant=2;p.solution=[symbols[rot],symbols[(rot+2)%3],symbols[rot],symbols[(rot+1)%3],symbols[(rot+2)%3]];}
  for(let j=0;j<3;j++)s.switches.push({id:p.id+'-symbol-'+j,puzzleId:p.id,roomId:room.id,kind:'symbol',x:x+145+j*120,y:FLOOR,symbol:symbols[j],label:'Нажать '+symbols[j],activated:false,flash:0});
  p.clue=p.solution.join('  →  ');p.clueX=x+265;p.clueY=FLOOR-140;
  sign('Терминал ждёт верный сигнал. Изучи рисунок.');p.hint='Нажимай кнопки по порядку: '+p.clue;
 }
 return true;
}
function solve(s,p,api,text){if(p.solved)return;p.solved=true;p.message=text||'Костик, загадка решена!';for(const d of s.doors)if(d.puzzleId===p.id)d.open=true;for(const l of s.lasers)if(l.puzzleId===p.id){l.active=false;l.disabled=true;l.telegraph=false;}api.emit(s,'puzzleSolved',{text:p.message,puzzleId:p.id,roomId:p.roomId,x:p.secretSpot.x,y:p.secretSpot.y});}
function getInteraction(s){
 initialize(s);if(!s.player)return null;const p=s.player,cx=p.x,cy=p.y-p.h/2;
 const candidates=[];
 for(const a of s.keyItems)if(!a.collected)candidates.push({...a,interaction:'key',label:'Взять '+a.name,target:a});
 for(const a of s.mirrors){const puzzle=s.puzzles.find(p=>p.id===a.puzzleId);if(!puzzle?.solved)candidates.push({...a,interaction:'mirror',target:a});}
 for(const a of s.switches){const puzzle=s.puzzles.find(p=>p.id===a.puzzleId);if(!puzzle?.solved&&!a.activated)candidates.push({...a,interaction:a.kind,target:a});}
 let best=null,bd=Infinity;for(const a of candidates){let dy=cy-(a.kind==='symbol'||a.kind==='key-lock'?a.y-25:a.kind==='lever'?a.y-25:a.y),d=Math.hypot(cx-a.x,dy);if(d<(a.interaction==='mirror'?115:92)&&d<bd){best=a;bd=d}}
 return best?{id:best.id,type:best.interaction,label:best.label,roomId:best.roomId,puzzleId:best.puzzleId,x:best.x,y:best.y}:null;
}
function interact(s,api){let a=getInteraction(s);if(!a)return;let p=s.puzzles.find(p=>p.id===a.puzzleId);if(!p||p.solved)return;
 if(a.type==='key'){const k=s.keyItems.find(k=>k.id===a.id);k.collected=true;api.emit(s,'puzzleKey',{text:'Костик, найден '+k.name.toLowerCase()+'!',x:k.x,y:k.y,key:k.id});}
 else if(a.type==='lever'){const sw=s.switches.find(k=>k.id===a.id);sw.activated=true;const controls=s.switches.filter(k=>k.puzzleId===p.id&&k.kind==='lever');if(controls.every(k=>k.activated))solve(s,p,api,'Костик, лазеры выключены! Забирай секрет.');else api.emit(s,'hint',{text:'Один рычаг готов! Найди второй.'});}
 else if(a.type==='power'){const sw=s.switches.find(k=>k.id===a.id);sw.activated=true;p.powerOn=true;api.emit(s,'hint',{text:'Питание включено! Теперь направь луч зеркалом.'});updateMirror(s,p,api);}
 else if(a.type==='mirror'){const m=s.mirrors.find(k=>k.id===a.id);m.orientation=1-m.orientation;updateMirror(s,p,api);api.emit(s,'mirrorTurn',{x:m.x,y:m.y,orientation:m.orientation});}
 else if(a.type==='key-lock'){const keys=s.keyItems.filter(k=>k.puzzleId===p.id);if(keys.every(k=>k.collected)){s.switches.find(k=>k.id===a.id).activated=true;solve(s,p,api,'Все ключи подошли! Проход открыт.');}else api.emit(s,'hint',{text:keys.length===3?'Нужны все три ключа: △, ○ и □.':'Нужны оба ключа: △ и ○.'});}
 else if(a.type==='symbol'){const sw=s.switches.find(k=>k.id===a.id);sw.flash=.45;if(sw.symbol===p.solution[p.progress]){p.progress++;api.emit(s,'sequenceStep',{text:'Верно! '+p.progress+' из '+p.solution.length+'.',progress:p.progress});if(p.progress===p.solution.length)solve(s,p,api,'Костик, ты разгадал порядок символов!');}else{p.progress=0;api.emit(s,'sequenceWrong',{text:'Попробуем ещё! Посмотри на рисунок над кнопками.'});}}
}
function updateMirror(s,p,api){const m=s.mirrors.find(a=>a.puzzleId===p.id),r=s.receivers.find(a=>a.puzzleId===p.id),l=s.lasers.find(a=>a.puzzleId===p.id&&a.kind==='reflection');if(!m||!r||!l)return;if(m.orientation===1){l.x=m.x-4;l.y=r.y;l.h=m.y-r.y;l.active=p.powerOn;r.powered=p.powerOn;if(p.powerOn)solve(s,p,api,'Звёздочка зажглась! Решётка открыта.');}else{l.x=m.x-4;l.y=m.y;l.h=FLOOR-25-m.y;r.powered=false;}}
function beforeStep(s,input,dt,api){initialize(s);s._puzzlePrevPlayer={x:s.player.x,y:s.player.y};for(const p of s.puzzles)p.clock+=dt;
 for(const sw of s.switches)if(sw.flash>0)sw.flash=Math.max(0,sw.flash-dt);
 for(const l of s.lasers){const pu=s.puzzles.find(p=>p.id===l.puzzleId);if(l.disabled||pu?.needsPower&&!pu.powerOn){l.active=false;l.telegraph=false;continue}if(l.kind==='pulse'){l.clock+=dt;let phase=l.clock%l.period;l.active=phase<l.onTime;l.telegraph=!l.active&&phase>l.period-l.warning;}else l.active=true;}
 for(const c of s.crates){let old=c.y+c.h;c.vy=Math.min(800,c.vy+1450*dt);c.y+=c.vy*dt;for(const f of [...s.platforms,...s.walls,...s.doors.filter(d=>!d.open)]){if(f.gone||c.x+c.w<=f.x||c.x>=f.x+f.w)continue;if(c.vy>=0&&old<=f.y+2&&c.y+c.h>=f.y){c.y=f.y-c.h;c.vy=0;}}if(c.y>FLOOR+180){c.x=c.homeX;c.y=c.homeY;c.vy=0;}}
 if(input.interactPressed)interact(s,api);
}
function afterStep(s,input,dt,api){initialize(s);const p=s.player,bbox=api.box||rect,collide=api.overlap||overlap,prev=s._puzzlePrevPlayer||{x:p.x,y:p.y};
 for(const c of s.crates){if(!collide(bbox(p),c))continue;if(prev.y<=c.y+4&&p.vy>=0){p.y=c.y;p.vy=0;p.onGround=true;p.ground=c.id;continue}let fromLeft=prev.x<c.x+c.w/2,dir=fromLeft?1:-1,walking=dir>0?input.right:input.left;
  if(p.form==='normal'&&walking){let wanted=dir>0?p.x+p.w/2-c.x:p.x-p.w/2-(c.x+c.w),nx=Math.max(c.minX,Math.min(c.maxX,c.x+wanted)),candidate={...c,x:nx};let blocked=[...s.walls,...s.doors.filter(d=>!d.open),...s.crates.filter(o=>o!==c)].some(o=>collide(candidate,o));if(!blocked)c.x=nx;}
  p.x=fromLeft?c.x-p.w/2:c.x+c.w+p.w/2;p.vx=0;
 }
 for(const plate of s.plates){let weighted=s.crates.some(c=>c.puzzleId===plate.puzzleId&&Math.abs(c.y+c.h-plate.y)<5&&c.x+c.w>plate.x+8&&c.x<plate.x+plate.w-8);plate.pressed=weighted;plate.hold=weighted?plate.hold+dt:0;let pu=s.puzzles.find(p=>p.id===plate.puzzleId);if(plate.hold>=plate.required&&pu&&!pu.solved)solve(s,pu,api,'Ящик удержал плиту! Костик, путь открыт.');}
 for(const l of s.lasers)if(l.active&&!l.disabled&&collide(bbox(p),l)){api.emit(s,'laserHit',{x:p.x,y:p.y});api.hit(s);break;}
}
function resetRoom(s,roomId){initialize(s);const ids=s.puzzles.filter(p=>p.roomId===roomId).map(p=>p.id);if(!ids.length)return false;
 for(const p of s.puzzles)if(ids.includes(p.id)){p.solved=false;p.progress=0;p.clock=0;p.message='';p.powerOn=!p.needsPower;}
 for(const d of s.doors)if(ids.includes(d.puzzleId))d.open=false;
 for(const c of s.crates)if(ids.includes(c.puzzleId)){c.x=c.homeX;c.y=c.homeY;c.vy=0;}
 for(const l of s.lasers)if(ids.includes(l.puzzleId)){const pu=s.puzzles.find(p=>p.id===l.puzzleId);l.disabled=false;l.clock=1.8;l.telegraph=false;l.active=l.kind!=='pulse'&&pu.powerOn;}
 for(const a of s.plates)if(ids.includes(a.puzzleId)){a.pressed=false;a.hold=0;}
 for(const a of s.mirrors)if(ids.includes(a.puzzleId))a.orientation=a.initialOrientation;
 for(const a of s.receivers)if(ids.includes(a.puzzleId))a.powered=false;
 for(const a of s.keyItems)if(ids.includes(a.puzzleId))a.collected=false;
 for(const a of s.switches)if(ids.includes(a.puzzleId)){a.activated=false;a.flash=0;}
 // Restore the unsolved reflection geometry without emitting a solve event.
 for(const p of s.puzzles)if(ids.includes(p.id)&&p.type==='mirror'){const m=s.mirrors.find(a=>a.puzzleId===p.id),l=s.lasers.find(a=>a.puzzleId===p.id&&a.kind==='reflection');l.x=m.x-4;l.y=m.y;l.h=FLOOR-25-m.y;}
 return true;
}
function objective(s,room){const p=s.puzzles.find(p=>p.roomId===room.id);if(!p)return null;if(p.solved)return'Загадка решена — исследуй тайник';return{laser:'Отключи защиту тайника',mirror:'Зажги приёмник',crate:'Подними решётку',keys:'Открой замки со знаками',sequence:'Отправь верный сигнал'}[p.type];}
/* Renderer contract:
 puzzles: type, roomId, x,w, solved, progress, solution[], clue/clueX/clueY (sequence), secretSpot, hint, variant1/2, needsPower,powerOn.
 lasers: rectangle x,y,w,h; kind constant/pulse/mirror-source/reflection; active damages, telegraph warns, disabled after solve.
 crates: top-left rectangle x,y,w,h; only normal form pushes. plates: x left,y floor,w,h,pressed,hold,required.
 mirrors: centre x,y; orientation0='\\' down,1='/' up. receivers: centre x,y,r,powered.
 switches: centre x,y (y is supporting floor), kind lever/power/key-lock/symbol,label,symbol?,activated,flash.
 keyItems: centre x,y,color,symbol,name,collected. Doors kind='puzzle', puzzleId, color,symbol? use normal renderer.
 Input: interactPressed is a one-tick rising-edge. All emit calls use emit(s,type,data); hit(s) is called on laser contact.
 getInteraction returns nearest available {id,type,label,roomId,puzzleId,x,y} or null within92 world units (mirror115).
 No reset changes gems/friends, and resetRoom only touches objects whose roomId matches the requested room.
*/
const api={initialize,build,beforeStep,afterStep,resetRoom,getInteraction,objective,TYPES};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GooPuzzles=api;
})(typeof globalThis!=='undefined'?globalThis:this);

