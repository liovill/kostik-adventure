/* Pure level construction and fixed-step simulation. No browser dependencies. */
(function(root){
'use strict';
const Puzzles=typeof module!=='undefined'?require('./puzzles.js'):root.GooPuzzles;
const Combat=typeof module!=='undefined'?require('./combat.js'):root.GooCombat;
const Chapters=typeof module!=='undefined'?require('./chapters.js'):root.GooChapters;
const GROUND=680,DT=1/120;
const THEMES=[
 {name:'Тайная лаборатория',short:'Лаборатория',icon:'⚗',bg:'#0c2036',mid:'#17475d',accent:'#74efd4',stone:'#296b7a',detail:'#88fcda',mechanic:'Двери, трубы и воздушные потоки'},
 {name:'Светящийся лес',short:'Лес',icon:'✿',bg:'#122b33',mid:'#285545',accent:'#cef689',stone:'#528663',detail:'#e4a8ff',mechanic:'Грибы-пружины и хрупкие мосты'},
 {name:'Долина динозавров',short:'Динозавры',icon:'🦕',bg:'#332c44',mid:'#72565f',accent:'#ffd48a',stone:'#a07860',detail:'#ffcfa0',mechanic:'Камни, погони и древние механизмы'},
 {name:'Космическая станция',short:'Космос',icon:'✦',bg:'#171d40',mid:'#3b3672',accent:'#c3afff',stone:'#6a69a1',detail:'#8bf1ff',mechanic:'Низкая гравитация и парящие платформы'},
 {name:'Затерянные миры',short:'Затерянный мир',icon:'◆',bg:'#281e3d',mid:'#613d62',accent:'#ffa5c6',stone:'#966483',detail:'#a8ffe1',mechanic:'Сочетай все способности Глазастика'}
];

const EXTRA=[
 ['Подводные тайны','Океан','≈','#0c2940','#236075','#83e9ed','#3c8193'],
 ['Ледяные пещеры','Лёд','❄','#182c4a','#426682','#b8f1ff','#6f9bac'],
 ['Вулканические руины','Вулкан','▲','#351f31','#713e48','#ffc085','#92595b'],
 ['Фабрика механизмов','Фабрика','⚙','#192d37','#3a5662','#f3d67d','#647d83'],
 ['Звёздная экспедиция','Космос','✦','#161d40','#3b3672','#c3afff','#6a69a1'],
 ['Замок теней','Замок','♜','#251e3e','#4f3b6b','#dca9ff','#77618b'],
 ['Перекрёсток миров','Финал','◆','#29213e','#634066','#ffaac8','#976683']
];
THEMES.splice(3,2,...EXTRA.map(([name,short,icon,bg,mid,accent,stone])=>({name,short,icon,bg,mid,accent,stone,detail:accent,mechanic:'Исследуй, решай загадки, спасай малышей'})));
const TITLES=['Первый секрет','Комната лучей','Пропавшие ключи','Скрытый механизм','Застава чудовища','Путь исследователя','Зеркальный лабиринт','По следам малышей','Тайна трёх печатей','Хранитель мира'];
const ORDER=[['crate','laser'],['keys','sequence'],['laser','mirror'],['sequence','crate'],['mirror','keys'],['crate','keys'],['mirror','sequence'],['laser','crate'],['keys','mirror'],['sequence','laser']];
const TRAVEL=['steps','fork','moving','lift','stomp','crumble','spring','tunnel','wind','gravity','chase'];
const COURSES=Array.from({length:100},(_,i)=>{let n=i+1,w=Math.floor(i/10),j=i%10,a=ORDER[(j+w)%10],pool=TRAVEL.filter(t=>!(n<6&&['tunnel','wind','gravity','chase','spring'].includes(t))&&!(n<7&&t==='wind'));let moves=[pool[(j+w*2)%pool.length],pool[(j*3+w+1)%pool.length]];let rooms=[moves[0],a[0],'rescue',moves[1],a[1]];if(n>30)rooms.splice(3,0,pool[(j*2+w+3)%pool.length]);if(n>60)rooms.splice(5,0,ORDER[(j+3)%10][0]);if(n%5===0)rooms.push('boss');else rooms.push(pool[(j+w+4)%pool.length]);return[THEMES[w].short+': '+TITLES[j],...rooms]});
for(let i=0;i<10;i++){const p=Chapters.plan(i+1);COURSES[i]=[p.name,...p.rooms.map(r=>typeof r==='string'?r:r.type)];}

const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function box(p){return{x:p.x-p.w/2,y:p.y-p.h,w:p.w,h:p.h}}
function makeLevel(n){
 n=clamp(Math.floor(n),1,100);let spec=COURSES[n-1],world=Math.floor((n-1)/10),difficulty=(n-1)/99;
 let s={n,name:spec[0],world,theme:THEMES[world],time:0,platforms:[],walls:[],gems:[],enemies:[],buttons:[],doors:[],winds:[],springs:[],flags:[],friends:[],keys:[],hazards:[],signs:[],particles:[],events:[],rooms:[],major:0,collected:0,rescued:0,defeated:0,hearts:3,maxHearts:3,healthPickups:[],attemptDeaths:0,spawn:{x:80,y:GROUND},status:'play',lowGravity:false,gravitySwitches:[],boss:null,combo:0,comboTimer:0};
 Puzzles.initialize(s);Chapters.initialize(s);let seq=0,smallCounter=0;
 const plat=(x,y,w,h=24,extra={})=>{let p={id:++seq,x,y,w,h,oneWay:true,...extra};s.platforms.push(p);return p};
 const floor=(x,w,y=GROUND)=>plat(x,y,w,100,{oneWay:false,kind:'ground'});
 const wall=(x,y,w,h,extra={})=>{let a={id:++seq,x,y,w,h,...extra};s.walls.push(a);return a};
 const gem=(x,y,big=false)=>{if(big||(++smallCounter%7===0&&s.gems.filter(g=>!g.big).length<20))s.gems.push({x,y,big,taken:false})};
 const line=(x,y,count,dx=42)=>{for(let j=0;j<count;j++)gem(x+j*dx,y)};
 const enemy=(x,y,kind='walker',extra={})=>{let e={id:++seq,x,y,w:38,h:34,kind,home:x,baseY:y,range:65,dir:-1,speed:65+difficulty*80,hp:1,alive:true,clock:0,hit:0,...extra};s.enemies.push(e);return e};
 const flag=(x,y)=>s.flags.push({x,y,active:false});
 const sign=(x,y,text,voice=false)=>s.signs.push({x,y,text,voice,read:false});
 floor(0,330);line(140,GROUND-30,4);sign(100,GROUND-90,n===1?'Костик, вперёд! Прыгай и собирай кристаллы.':spec[0],true);
 let offset=330;
 const patterns=Chapters.roomEntries(n)||spec.slice(1);
 patterns.forEach((entry,index)=>{
  const descriptor=typeof entry==='string'?{type:entry}:entry,type=descriptor.type,roomWidth=descriptor.w||700;
  let x=offset,id=index,room={...descriptor,id,type,x,w:roomWidth,spawn:{x:x+35,y:GROUND}};s.rooms.push(room);let elite=world>=2?'armored':world===1?'jumper':'walker';
  let platformStart=s.platforms.length;
  if(Chapters.build(s,type,x,room,{floor,plat,wall,gem,line,sign,enemy})){}else if(Puzzles.build(s,type,x,room,{floor,plat,wall,gem,line,sign,enemy})){}else if(type==='steps'){
   floor(x,roomWidth);plat(x+130,GROUND-100,130);plat(x+275,GROUND-200,140);plat(x+450,GROUND-110,120);line(x+145,GROUND-135,3);line(x+290,GROUND-235,3);line(x+460,GROUND-145,3);line(x+80,GROUND-28,12);
   if(n>10)enemy(x+500,GROUND,elite);
   sign(x+70,GROUND-80,index===0&&n===1?'Наверху тоже есть сокровища!':'Путь наверх');
  }else if(type==='fork'){
   floor(x,230);floor(x+350,350);plat(x+155,GROUND-100,140);plat(x+300,GROUND-200,160);plat(x+490,GROUND-110,120);plat(x+225,GROUND+65,140);line(x+175,GROUND-135,3);line(x+320,GROUND-235,3);line(x+500,GROUND-145,2);line(x+245,GROUND+30,3);line(x+390,GROUND-28,6);sign(x+65,GROUND-80,'Какой путь выберешь?');
  }else if(type==='stomp'){
   floor(x,roomWidth);enemy(x+205,GROUND,'walker',{range:35});enemy(x+445,GROUND,world>=1?'jumper':'walker',{range:45});plat(x+315,GROUND-120,140);line(x+110,GROUND-28,2);line(x+330,GROUND-155,3);line(x+515,GROUND-28,4);sign(x+30,GROUND-90,'Прыгай врагам на голову!',true);
  }else if(type==='gate'){
   floor(x,roomWidth);let door={id:'gate-'+id,x:x+490,y:GROUND-380,w:34,h:380,open:false,kind:'button'};s.doors.push(door);plat(x+105,GROUND-100,140);plat(x+265,GROUND-195,150);s.buttons.push({x:x+340,y:GROUND-195,w:50,h:12,doorId:door.id,pressed:false});line(x+125,GROUND-135,3);line(x+280,GROUND-230,3);line(x+560,GROUND-30,3);sign(x+40,GROUND-80,'Зелёная кнопка откроет дверь.',n===4);
  }else if(type==='lift'){
   floor(x,200);floor(x+550,150);let p=plat(x+245,GROUND-5,140,24,{kind:'lift',baseX:x+245,baseY:GROUND-5,axis:'y',travel:270,period:6.5,phase:0});plat(x+430,GROUND-260,130);plat(x+530,GROUND-135,100);line(x+450,GROUND-295,3);line(x+545,GROUND-170,2);s.winds.push({x:x+200,y:GROUND+40,w:350,h:100,power:0,decor:true});sign(x+60,GROUND-85,'Встань на лифт и подожди!',true);
  }else if(type==='tunnel'){
   floor(x,roomWidth);wall(x+180,GROUND-235,300,205,{kind:'tunnel'});line(x+205,GROUND-12,6);line(x+535,GROUND-28,3);plat(x+65,GROUND-105,110);plat(x+500,GROUND-105,110);sign(x+45,GROUND-78,'Сплющись, чтобы пролезть!','flat');
  }else if(type==='wind'){
   floor(x,230);floor(x+560,140);plat(x+340,GROUND-275,195);plat(x+505,GROUND-135,100);s.winds.push({x:x+155,y:GROUND-370,w:190,h:400,power:1800});line(x+220,GROUND-70,5,0);for(let j=0;j<5;j++)gem(x+240,GROUND-100-j*50);line(x+370,GROUND-310,3);sign(x+35,GROUND-85,'Надуйся и лети в потоке!','bubble');
  }else if(type==='rescue'){
   floor(x,roomWidth);plat(x+100,GROUND-100,120);plat(x+245,GROUND-200,130);plat(x+390,GROUND-295,140);plat(x+535,GROUND-155,110);s.friends.push({x:x+455,y:GROUND-295,rescued:false});line(x+115,GROUND-135,2);line(x+260,GROUND-235,3);line(x+405,GROUND-330,3);line(x+550,GROUND-190,2);sign(x+45,GROUND-85,'Малыш ждёт наверху. Найдёшь его?');
  }else if(type==='crumble'){
   floor(x,160);floor(x+555,145);for(let j=0;j<4;j++){plat(x+150+j*105,GROUND-70-(j%2)*65,115,24,{kind:'crumble',crack:0,gone:0});gem(x+200+j*105,GROUND-105-(j%2)*65)}sign(x+35,GROUND-85,'Мостик трещит — не стой долго!');
  }else if(type==='spring'){
   floor(x,230);floor(x+550,150);s.springs.push({x:x+165,y:GROUND,w:60,power:1000});plat(x+325,GROUND-315,170);plat(x+500,GROUND-160,120);line(x+345,GROUND-350,3);line(x+515,GROUND-195,2);for(let j=0;j<4;j++)gem(x+210+j*28,GROUND-90-j*55);sign(x+35,GROUND-85,'Гриб подбросит высоко-высоко!');
  }else if(type==='moving'){
   floor(x,175);floor(x+535,165);plat(x+200,GROUND-95,150,24,{kind:'moving',baseX:x+200,baseY:GROUND-95,axis:'x',travel:220,period:6,phase:0});plat(x+470,GROUND-185,120);line(x+485,GROUND-220,3);line(x+575,GROUND-28,2);sign(x+30,GROUND-85,'Поймай движущуюся платформу!');
  }else if(type==='gravity'){
   floor(x,roomWidth);plat(x+260,GROUND-255,180);plat(x+490,GROUND-130,120);s.gravitySwitches.push({x:x+140,y:GROUND-45,active:false});line(x+280,GROUND-290,4);line(x+505,GROUND-165,2);sign(x+25,GROUND-100,'Коснись звезды: прыжки станут выше!',true);
  }else if(type==='chase'){
   floor(x,240);floor(x+315,190);floor(x+575,125);plat(x+200,GROUND-95,125);plat(x+475,GROUND-105,125);line(x+100,GROUND-28,3);line(x+335,GROUND-28,4);line(x+500,GROUND-140,2);s.hazards.push({kind:'boulder',x:x-60,y:GROUND-32,w:64,h:64,start:x+140,end:x+650,home:x-60,speed:155+difficulty*50,active:false,dead:false});sign(x+20,GROUND-100,'Камень катится! Беги и прыгай!',true);
  }else if(type==='arena'){
   floor(x,roomWidth);plat(x+170,GROUND-110,120);plat(x+360,GROUND-160,130);enemy(x+210,GROUND,elite,{arena:id,range:45});enemy(x+420,GROUND,world>=3?'flyer':'jumper',{arena:id,range:65});if(world>=4)enemy(x+320,GROUND,'walker',{arena:id,range:40});s.doors.push({id:'arena-'+id,x:x+600,y:GROUND-380,w:30,h:380,kind:'arena',arena:id,open:false});line(x+185,GROUND-145,2);line(x+380,GROUND-195,3);sign(x+25,GROUND-85,'Победи стражей, чтобы открыть проход!',true);
  }else if(type==='boss'){
   room.w=1040;floor(x,1040);wall(x+95,100,790,24,{kind:'arena-ceiling',roomId:id});
   let e=Combat.createBoss(n,x+530,GROUND,world,'boss-'+id);e.room=id;s.enemies.push(e);s.boss=e;
   s.doors.push({id:'boss-entry',x:x+95,y:124,w:28,h:556,kind:'boss-entry',open:true,roomId:id});
   s.doors.push({id:'boss-door',x:x+850,y:124,w:32,h:556,kind:'boss',open:false,roomId:id});
   plat(x+220,GROUND-100,120);plat(x+640,GROUND-100,120);
   room.secretSpot={x:x+955,y:GROUND-45};room.spawn={x:x+45,y:GROUND};
   sign(x+45,GROUND-110,'Комната босса! Следи за атакой и жди, пока он устанет.',true);
   offset+=340;
  }
  // Return stairs make every required secret reachable from either side, in normal form.
  if(type==='lift'){plat(x+575,GROUND-70,100);plat(x+445,GROUND-170,105);plat(x+325,GROUND-260,110);plat(x+205,GROUND-170,100);plat(x+85,GROUND-80,100);room.returnRoute={backward:[{x:x+620,y:610},{x:x+490,y:510},{x:x+380,y:420},{x:x+250,y:510},{x:x+130,y:600}]}}
  if(type==='spring'){plat(x+580,GROUND-80,100);plat(x+470,GROUND-175,100);plat(x+380,GROUND-250,100);plat(x+270,GROUND-170,100);plat(x+80,GROUND-80,100);room.returnRoute={backward:[{x:x+620,y:600},{x:x+520,y:505},{x:x+440,y:430},{x:x+290,y:510},{x:x+130,y:600}]}}
  if(type==='wind'){plat(x+595,GROUND-80,100);plat(x+505,GROUND-180,105);plat(x+165,GROUND-90,110);room.returnRoute={backward:[{x:x+640,y:600},{x:x+555,y:500},{x:x+450,y:405},{x:x+220,y:590}]}}
  if(type==='moving'){plat(x+590,GROUND-80,100);plat(x+420,GROUND-150,110);plat(x+290,GROUND-100,115);plat(x+170,GROUND-70,115);room.returnRoute={backward:[{x:x+640,y:600},{x:x+490,y:495},{x:x+360,y:580},{x:x+220,y:610}]}}
  if(type==='rescue'){plat(x+580,GROUND-85,95);plat(x+470,GROUND-200,95)}
  if(type==='gravity'){s.gravitySwitches[s.gravitySwitches.length-1].roomId=id;plat(x+130,GROUND-100,100);plat(x+390,GROUND-170,100);room.gravityOn=false;}
  let elevated=s.platforms.slice(platformStart).filter(p=>p.oneWay&&!['lift','moving'].includes(p.kind)).sort((a,b)=>a.y-b.y);
  if(!room.secretSpot){let p=elevated[0];room.secretSpot=p?{x:p.x+p.w*.5,y:p.y-35}:{x:x+350,y:GROUND-45};}
  if(index%2===1&&type!=='boss')s.healthPickups.push({x:x+65,y:GROUND-35,taken:false,roomId:id});

  // World-specific creatures and hazards appear on ordinary floors, outside teaching courses.
  if(world>=1&&['fork','steps','rescue'].includes(type))enemy(x+585,GROUND,world===3?'flyer':world===2?'armored':'jumper',{range:42});
  flag(x+room.w-35,GROUND);offset+=roomWidth;
 });
 floor(offset,360);s.length=offset+360;s.goal={x:offset+240,y:GROUND};s.player={x:80,y:GROUND,w:36,h:44,vx:0,vy:0,form:'normal',ground:null,onGround:true,coyote:.14,inv:0,face:1,heldJump:false};
 s.minY=80;s.maxY=GROUND+200;
 // Three sealed or elevated discoveries; the last crystal is beyond the boss gate.
 let chosen=s.rooms.filter(r=>r.puzzleId).slice(0,2);let last=s.boss?s.rooms.find(r=>r.type==='boss'):s.rooms.filter(r=>!r.puzzleId).at(-1);
 while(chosen.length<2)chosen.push(s.rooms[chosen.length]);chosen.push(last);
 for(let r of chosen){gem(r.secretSpot.x,r.secretSpot.y,true);let g=s.gems.at(-1);g.roomId=r.id;g.bossReward=r.type==='boss';}
 if(!s.friends.length){let r=s.rooms.find(r=>r.type!=='boss');s.friends.push({x:r.secretSpot.x+25,y:r.secretSpot.y+35,rescued:false,roomId:r.id})}
 for(let f of s.friends)f.roomId=s.rooms.find(r=>f.x>=r.x&&f.x<r.x+r.w)?.id;
 s.portalReady=false;
 Chapters.finalize(s);
 return s;
}
function emit(s,type,data={}){s.events.push({type,...data})}
function setForm(s,form){let p=s.player;if(form==='flat'&&s.n<6||form==='bubble'&&s.n<7)return false;if(p.form===form)form='normal';let h=form==='flat'?20:form==='bubble'?50:44,w=form==='flat'?52:form==='bubble'?44:36,b={x:p.x-w/2,y:p.y-h,w,h};if([...s.walls,...s.doors.filter(d=>!d.open),...s.crates,...s.platforms.filter(f=>!f.oneWay)].some(a=>overlap(a,b))){emit(s,'hint',{text:'Здесь тесно. Сначала выберись из трубы!'});return false}if(form==='bubble'&&p.vy< -280)p.vy=-280;p.form=form;p.h=h;p.w=w;emit(s,'form',{form});return true}
function currentRoom(s){return s.rooms.find(r=>s.player.x>=r.x&&s.player.x<r.x+r.w)}
function canExit(s){return s.gems.filter(g=>g.big).length===3&&s.gems.filter(g=>g.big).every(g=>g.taken)&&s.friends.length>0&&s.friends.every(f=>f.rescued)&&s.puzzles.every(p=>p.solved)&&Chapters.complete(s)&&!s.enemies.some(e=>e.boss&&e.alive)&&!s.doors.some(d=>!d.open&&d.kind!=='boss-entry')}
function hit(s){let p=s.player;if(p.inv>0||s.status!=='play')return;let room=currentRoom(s);s.hearts--;s.attemptDeaths++;emit(s,'hurt');if(s.hearts<=0){s.status='lost';return}
 if(room){Puzzles.resetRoom(s,room.id);Chapters.resetRoom(s,room.id);if(room.type==='boss'&&s.boss?.alive){Combat.resetBoss(s,s.boss);s.doors.find(d=>d.kind==='boss-entry').open=true;}for(let b of s.buttons){let d=s.doors.find(d=>d.id===b.doorId);if(d&&d.x>=room.x&&d.x<room.x+room.w){b.pressed=false;d.open=false}}for(let g of s.gravitySwitches)if(g.roomId===room.id){g.active=false;room.gravityOn=false}emit(s,'puzzleReset',{text:'Минус сердечко. Начнём эту комнату заново.'})}
 let spawn=room?.spawn||s.spawn;p.x=spawn.x;p.y=spawn.y;p.vx=p.vy=0;p.form='normal';p.w=36;p.h=44;p.inv=2;p.ground=null;p.onGround=false;p.coyote=0;s.combo=0;for(let h of s.hazards)if(h.kind==='boulder'&&room&&h.start>=room.x&&h.start<room.x+room.w){h.active=false;h.dead=false;h.x=h.home}
}
function interaction(s){let chapter=Chapters.getInteraction(s);if(chapter)return chapter;let item=Puzzles.getInteraction(s);let g=s.gravitySwitches.find(g=>Math.hypot(s.player.x-g.x,s.player.y-s.player.h/2-g.y)<85);return g?{label:'Переключить притяжение',type:'gravity',target:g}:item}
function hint(s,stage=0){stage=clamp(Math.floor(stage),0,2);let room=currentRoom(s),missing=s.gems.filter(g=>g.big&&!g.taken);if(room){let puzzle=s.puzzles.find(p=>p.roomId===room.id&&!p.solved);if(puzzle){const hints={crate:['Какой предмет отличается от остальных?','Тяжёлый предмет может удержать плиту.','Верни обычную форму и толкай ящик на подсвеченную плиту.'],laser:['Посмотри, одинаково ли ведут себя лучи.','У одного луча есть пауза; рычаг связан с другим.','Поднимись к рычагу и нажми действие. Позже нужны два рычага.'],mirror:['Звёздочка-приёмник пока тёмная.','Луч должен изменить направление, чтобы попасть в неё.','Поднимись к зеркалу, включи питание, если нужно, и поверни его кнопкой действия.'],keys:['Сравни знаки на предметах и замке.','Нужны все ключи с подходящими знаками.','Подойди к каждому ключу и нажми действие, затем вставь ключи у замка.'],sequence:['На стене есть рисунок.','Рисунок показывает порядок нажатий, а не расположение кнопок.','Нажимай действие у символов в порядке: '+puzzle.solution.join(' → ')+'.']};return hints[puzzle.type][stage];}if(room.type==='boss'&&s.boss.alive)return stage===0?'Следи за предупреждением перед атакой.':stage===1?'После атаки хранитель ненадолго устаёт.':'Атакуй сверху, когда над хранителем появится звезда.';const ch=Chapters.hint(s,room,stage);if(ch&&(room.source||room.target))return ch;let friend=s.friends.find(f=>f.roomId===room.id&&!f.rescued);if(friend)return stage===0?'Малыш где-то в этой комнате.':stage===1?'Исследуй верхнюю и нижнюю тропинки.':'Малыш '+(friend.x<s.player.x?'слева':'справа')+' от тебя на высоте '+(friend.y<GROUND-100?'верхних площадок.':'нижней тропинки.');if(missing.some(g=>g.roomId===room.id))return stage===0?'Большой кристалл ещё в этой комнате.':stage===1?'Проверь пути, по которым ещё не ходил.':'Исследуй '+(missing.find(g=>g.roomId===room.id).y>GROUND?'нижнюю':'верхнюю')+' тропинку этой комнаты.';}const ch=Chapters.hint(s,room,stage);if(ch)return ch;if(missing.length){let dx=missing[0].x-s.player.x;return dx<0?'Один секрет остался позади. Вернись влево.':'Ещё один секрет впереди. Продолжай исследовать вправо.'}if(s.friends.some(f=>!f.rescued))return 'Все кристаллы найдены. Но один малыш всё ещё ждёт спасения!';return canExit(s)?'Портал открыт! Ищи его справа.':'Проверь, все ли механизмы включены.';}

function solids(s){return[...s.platforms.filter(f=>!f.gone),...s.walls,...s.doors.filter(d=>!d.open)]}
function step(s,input,dt=DT){
 if(s.status!=='play')return;s.time+=dt;let p=s.player,oldY=p.y;s.events.length=0;p.inv=Math.max(0,p.inv-dt);s.comboTimer=Math.max(0,s.comboTimer-dt);if(!s.comboTimer)s.combo=0;
 Puzzles.beforeStep(s,input,dt,{emit,hit,box,overlap});
 Chapters.beforeStep(s,input,dt,{emit,hit,box,overlap});
 if(input.interactPressed){let g=interaction(s);if(g?.type==='gravity'){let room=s.rooms.find(r=>r.id===g.target.roomId);room.gravityOn=!room.gravityOn;g.target.active=room.gravityOn;emit(s,'gravity',{text:room.gravityOn?'Притяжение ослабло в этой комнате.':'Притяжение вернулось.'})}}
 // Carry the rider with lifts before resolving this tick's movement.
 for(let f of s.platforms){let ox=f.x,oy=f.y;if(f.kind==='lift'||f.kind==='moving'){let q=(1-Math.cos(s.time*Math.PI*2/f.period))/2;if(f.axis==='y')f.y=f.baseY-f.travel*q;else f.x=f.baseX+f.travel*q}if(f.kind==='crumble'){if(f.gone){f.gone=Math.max(0,f.gone-dt);if(!f.gone)f.crack=0}else if(f.crack>0){f.crack+=dt;if(f.crack>.75){f.gone=3;emit(s,'crumble',{x:f.x+f.w/2,y:f.y})}}}if(p.ground===f.id&&!f.gone){p.x+=f.x-ox;p.y+=f.y-oy;oldY=p.y}}
 p.coyote=p.onGround?.13:Math.max(0,p.coyote-dt);
 if(input.jumpPressed)s.jumpBuffer=.16;else s.jumpBuffer=Math.max(0,(s.jumpBuffer||0)-dt);
 if(s.jumpBuffer>0&&p.coyote>0){p.vy=p.form==='flat'?-440:p.form==='bubble'?-280:-620;p.ground=null;p.onGround=false;p.coyote=0;s.jumpBuffer=0;emit(s,'jump')}
 let dir=Number(!!input.right)-Number(!!input.left),speed=p.form==='flat'?180:p.form==='bubble'?155:260;p.vx=dir*speed;if(dir)p.face=dir;
 let gravity=currentRoom(s)?.gravityOn?600:1450;if(p.form==='bubble')gravity=950;
 p.vy=Math.min(p.form==='bubble'?240:900,p.vy+gravity*dt);
 for(let w of s.winds)if(!w.decor&&overlap(box(p),w)){p.vy=Math.max(-460,p.vy-w.power*(p.form==='bubble'?1.4:.44)*dt);if(p.form!=='bubble'&&s.n>=7&&Math.sin(s.time)<-.98)emit(s,'hint',{text:'Надуйся кнопкой пузырька ○'})}
 let all=solids(s);p.x=clamp(p.x+p.vx*dt,p.w/2,s.length-p.w/2);
 for(let f of all){if(f.oneWay)continue;if(overlap(box(p),f)){if(p.vx>0)p.x=f.x-p.w/2;else if(p.vx<0)p.x=f.x+f.w+p.w/2}}
 oldY=p.y;p.y+=p.vy*dt;p.onGround=false;p.ground=null;
 for(let f of all){let b=box(p);if(b.x+3>=f.x+f.w||b.x+b.w-3<=f.x)continue;
  if(p.vy>=0&&oldY<=f.y+3&&p.y>=f.y){p.y=f.y;p.vy=0;p.onGround=true;p.ground=f.id;if(f.kind==='crumble'&&!f.crack)f.crack=.001}
  else if(!f.oneWay&&p.vy<0&&oldY-p.h>=f.y+f.h-3&&p.y-p.h<=f.y+f.h){p.y=f.y+f.h+p.h;p.vy=0}
 }
 for(let a of s.springs)if(p.vy>=0&&Math.abs(p.x-a.x-a.w/2)<a.w/2+12&&Math.abs(p.y-a.y)<10){p.vy=-Math.min(a.power,Math.sqrt(gravity*700));p.onGround=false;p.ground=null;emit(s,'spring',{x:p.x,y:p.y})}
 for(let b of s.buttons)if(!b.pressed&&Math.abs(p.x-b.x)<b.w/2+p.w/2&&Math.abs(p.y-b.y)<20){b.pressed=true;let d=s.doors.find(d=>d.id===b.doorId);if(d)d.open=true;emit(s,'button',{text:'Костик, дверь открыта!'})}
 Puzzles.afterStep(s,input,dt,{emit,hit,box,overlap});if(s.status!=='play')return;
 for(let h of s.healthPickups)if(!h.taken&&s.hearts<3&&Math.hypot(p.x-h.x,p.y-p.h/2-h.y)<32){h.taken=true;s.hearts++;emit(s,'health',{x:h.x,y:h.y,text:'Сердечко найдено!'})}

 for(let g of s.gems)if(!g.taken&&(!g.bossReward||!s.boss?.alive)&&Math.hypot(p.x-g.x,p.y-p.h/2-g.y)<(g.big?35:30)){g.taken=true;if(g.big)s.major++;else s.collected++;emit(s,g.big?'major':'gem',{x:g.x,y:g.y})}
 for(let f of s.friends)if(!f.rescued&&Math.hypot(p.x-f.x,p.y-p.h/2-(f.y-15))<45){f.rescued=true;s.rescued++;emit(s,'friend',{x:f.x,y:f.y,text:'Костик, ты нашёл малыша!'})}
 for(let f of s.flags)if(!f.active&&Math.abs(p.x-f.x)<35&&Math.abs(p.y-f.y)<55&&p.onGround){f.active=true;s.spawn={x:f.x,y:f.y};emit(s,'checkpoint')}
 for(let sign of s.signs)if(!sign.read&&Math.abs(p.x-sign.x)<100){sign.read=true;emit(s,'sign',{text:sign.text,voice:sign.voice})}
 updateEnemies(s,dt,oldY);if(s.status!=='play')return;
 for(let d of s.doors){if(d.kind==='arena'&&!s.enemies.some(e=>e.alive&&e.arena===d.arena))d.open=true;if(d.kind==='boss')d.open=!s.boss.alive;if(d.kind==='boss-entry')d.open=!s.boss.alive||!s.boss.active}
 for(let h of s.hazards){if(h.dead)continue;if(h.kind==='boulder'){if(p.x>h.start&&p.x<h.end)h.active=true;if(h.active){h.x+=h.speed*dt;if(h.x>h.end+120){h.dead=true;continue}if(Math.hypot(p.x-h.x,p.y-p.h/2-h.y)<p.w/2+26)hit(s)}}else if(h.kind==='projectile'){h.x+=h.vx*dt;h.y+=h.vy*dt;h.vy+=(h.gravity||0)*dt;h.life-=dt;if(h.life<=0)h.dead=true;if(overlap(box(p),{x:h.x-h.w/2,y:h.y-h.h/2,w:h.w,h:h.h}))hit(s)}else if(h.kind==='wave'){h.x+=h.vx*dt;h.life-=dt;if(h.life<=0)h.dead=true;if(overlap(box(p),{x:h.x-16,y:h.y-19,w:32,h:19}))hit(s)}}
 s.hazards=s.hazards.filter(h=>!h.dead||h.kind==='boulder');
 if(p.y>s.maxY)hit(s);
 s.portalReady=canExit(s);if(s.status==='play'&&Math.abs(p.x-s.goal.x)<42&&Math.abs(p.y-s.goal.y)<90&&s.portalReady){s.status='won';emit(s,'won')}
}
function updateEnemies(s,dt,oldY){let p=s.player;
 for(let e of s.enemies){if(!e.alive)continue;if(!e.boss)e.clock+=dt;e.hit=Math.max(0,e.hit-dt);let oldX=e.x;
  if(e.boss){Combat.advanceBoss(s,e,dt,{emit,hit,box,overlap});}else{e.x+=e.dir*e.speed*dt;if(e.x<e.home-e.range){e.x=e.home-e.range;e.dir=1}if(e.x>e.home+e.range){e.x=e.home+e.range;e.dir=-1}if(e.kind==='jumper')e.y=e.baseY-Math.max(0,Math.sin(e.clock*2.5))*90;if(e.kind==='flyer')e.y=e.baseY-90+Math.sin(e.clock*2)*45;
   if(e.kind==='armored'){e.vulnerable=e.clock%4>2;e.exposed=e.vulnerable}
  }
  let eb={x:e.x-e.w/2,y:e.y-e.h,w:e.w,h:e.h};if(!overlap(box(p),eb))continue;
  let stomp=p.vy>0&&oldY<=eb.y+18;
  if(stomp){if(e.hit>0){p.vy=-430;continue}if(e.boss&&!e.vulnerable||e.kind==='armored'&&!e.vulnerable){p.y=eb.y;p.vy=-450;emit(s,'shield',{x:e.x,y:eb.y,text:e.boss?'Подожди, пока он устанет!':'Броня открывается — лови момент!'});continue}
   e.hp--;e.hit=.5;p.y=eb.y;p.vy=-500;p.onGround=false;p.ground=null;s.combo++;s.comboTimer=2.5;emit(s,'stomp',{x:e.x,y:eb.y,combo:s.combo});if(e.hp<=0){e.alive=false;s.defeated++;s.collected+=e.boss?3:0;emit(s,'defeat',{x:e.x,y:e.y,boss:e.boss})}
  }else if(e.hit<=0)hit(s);
 }
}
function objective(s){let room=s.rooms.find(r=>s.player.x>=r.x&&s.player.x<r.x+r.w);if(!room)return canExit(s)?'Портал открыт!':'Найди 3 кристалла и всех малышей';let chapter=Chapters.objective(s,room);if(chapter)return chapter;let puzzle=Puzzles.objective(s,room);if(puzzle)return puzzle;if(room.type==='gate'&&!s.doors.find(d=>d.id==='gate-'+room.id)?.open)return'Нажми зелёную кнопку';if(room.type==='boss'&&s.boss.alive)return s.boss.phase==='rest'?'Босс устал — прыгай сверху!':'Увернись и дождись момента';if(room.type==='arena'&&s.enemies.some(e=>e.alive&&e.arena===room.id))return'Победи стражей';return{tunnel:'Сплющись кнопкой ▰',wind:'Надуйся кнопкой ○',lift:'Поднимись на лифте',rescue:'Найди малыша наверху',spring:'Прыгни на гриб',moving:'Поймай платформу',crumble:'Не задерживайся на мостике',chase:'Берегись катящегося камня',gravity:'Коснись звезды притяжения',fork:'Исследуй верхний путь',steps:'Ищи большие кристаллы',stomp:'Прыгай врагам на голову'}[room.type]||'Найди портал'}
const api={GROUND,DT,THEMES,COURSES,makeLevel,setForm,step,hit,box,overlap,objective,canExit,hint,interaction,currentRoom,Puzzles,Combat,Chapters};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GooCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);





