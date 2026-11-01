
"use strict";
/* Mini-games: one continuous touch stroke and tap-to-connect pairs. */
const HALL_TRACE_SHAPES={
 kostya:[
  {id:"a",label:"А",title:"букву А",path:[[.20,.82],[.50,.17],[.80,.82],[.66,.52],[.35,.52]]},
  {id:"m",label:"М",title:"букву М",path:[[.20,.82],[.20,.18],[.50,.62],[.80,.18],[.80,.82]]},
  {id:"o",label:"О",title:"букву О",path:Array.from({length:65},(_,i)=>[.5+.29*Math.cos(-Math.PI/2+i*2*Math.PI/64),.5+.32*Math.sin(-Math.PI/2+i*2*Math.PI/64)])},
  {id:"i",label:"И",title:"букву И",path:[[.22,.20],[.22,.82],[.78,.20],[.78,.82]]},
  {id:"l",label:"Л",title:"букву Л",path:[[.20,.82],[.50,.18],[.80,.82]]},
  {id:"t",label:"Т",title:"букву Т",path:[[.20,.20],[.80,.20],[.50,.20],[.50,.82]]}
 ],
 kirill:[
  {id:"circle",label:"○",title:"круг",path:Array.from({length:65},(_,i)=>[.5+.29*Math.cos(-Math.PI/2+i*2*Math.PI/64),.5+.29*Math.sin(-Math.PI/2+i*2*Math.PI/64)])},
  {id:"triangle",label:"△",title:"треугольник",path:[[.20,.78],[.50,.20],[.80,.78],[.20,.78]]},
  {id:"square",label:"□",title:"квадрат",path:[[.22,.22],[.78,.22],[.78,.78],[.22,.78],[.22,.22]]},
  {id:"wave",label:"〰",title:"волнистую линию",path:Array.from({length:47},(_,i)=>[.11+i*.78/46,.5+.17*Math.sin(i*3*Math.PI/46)])},
  {id:"arc",label:"⌒",title:"дугу",path:Array.from({length:45},(_,i)=>[.16+i*.68/44,.78-.52*Math.sin(i*Math.PI/44)])},
  {id:"zigzag",label:"⚡",title:"зигзаг",path:[[.15,.77],[.33,.23],[.50,.77],[.68,.23],[.86,.77]]}
 ]
};
let hallTraceIndex=0,hallTracePoints=[],hallTracePen=false,hallTracePointer=null,hallTraceSuccess=false;
function hallTraceShape(){return HALL_TRACE_SHAPES[state.active][hallTraceIndex]}
function hallTraceResample(path,step=.018){if(!Array.isArray(path)||!path.length)return[];const out=[path[0]];for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],length=Math.hypot(a[0]-b[0],a[1]-b[1]),n=Math.max(1,Math.ceil(length/step));for(let j=1;j<=n;j++){const f=j/n;out.push([a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f])}}return out}
function hallTraceLength(a){let total=0;for(let i=1;i<a.length;i++)total+=Math.hypot(a[i][0]-a[i-1][0],a[i][1]-a[i-1][1]);return total}
function hallTraceDist(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1])}
function hallTraceScore(guide,points){
 if(!Array.isArray(points)||points.length<6)return{ok:false,coverage:0,accuracy:0,reason:"Проведи линию пальцем от начала до конца."};
 const expected=hallTraceResample(guide,.015),actual=hallTraceResample(points,.015);
 const close=(p,array,radius)=>array.some(x=>hallTraceDist(p,x)<=radius);
 const coverage=expected.filter(x=>close(x,actual,.108)).length/expected.length;
 const accuracy=actual.filter(x=>close(x,expected,.108)).length/actual.length;
 const length=hallTraceLength(points),ideal=hallTraceLength(guide),ratio=length/Math.max(.01,ideal);
 const start=hallTraceDist(points[0],guide[0]),end=hallTraceDist(points[points.length-1],guide[guide.length-1]);
 const ok=coverage>=.75&&accuracy>=.72&&ratio>=.65&&ratio<=2.25&&start<=.18&&end<=.19;
 let reason=ok?"Отлично! Линия получилась!":coverage<.75?"Не все участки обведены. Попробуй ещё!":accuracy<.72?"Веди пальцем ближе к пунктиру.":start>.18?"Начни с зелёной точки.":end>.19?"Закончи у золотой точки.":ratio>2.25?"Постарайся вести линию без лишних петель.":"Попробуй провести линию ещё раз.";
 return{ok,coverage,accuracy,ratio,reason}
}
function hallStartTrace(){hallTraceIndex=0;hallSection("trace");hallShowTrace();if(state.settings.voice)speak("Начни с зелёной точки и веди пальцем по пунктиру.")}
function hallShowTrace(){
 const shapes=HALL_TRACE_SHAPES[state.active],root=$("hallTraceTargets");root.innerHTML="";
 for(let i=0;i<shapes.length;i++){const shape=shapes[i],b=document.createElement("button");b.textContent=shape.label;b.className=i===hallTraceIndex?"selected":"";b.setAttribute("aria-label","Обведи "+shape.title);b.onclick=()=>{hallTraceIndex=i;hallShowTrace();if(state.settings.voice)speak("Обведи "+shape.title)};root.appendChild(b)}
 hallTracePoints=[];hallTracePen=false;hallTraceSuccess=false;
 const target=hallTraceShape();$("hallTraceTitle").textContent="Обведи "+target.title;
 $("hallTraceFeedback").textContent=hallProfile().traceAwards[target.id]?"⭐ Эту линию ты уже обводил. Попробуй ещё!":"Начни с зелёной точки и не отрывай палец.";
 $("hallTraceCheck").classList.remove("hidden");$("hallTraceNext").classList.add("hidden");hallDrawCanvas()
}
function hallDrawCanvas(){
 const c=$("hallTraceCanvas"),ctx=c.getContext&&c.getContext("2d");if(!ctx)return;
 const w=c.width,h=c.height,g=hallTraceShape().path;
 ctx.clearRect(0,0,w,h);ctx.fillStyle="#fffef7";ctx.fillRect(0,0,w,h);
 ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#afb9cc";ctx.lineWidth=13;ctx.setLineDash([2,16]);ctx.beginPath();
 g.forEach((p,i)=>i?ctx.lineTo(p[0]*w,p[1]*h):ctx.moveTo(p[0]*w,p[1]*h));ctx.stroke();ctx.setLineDash([]);
 const first=g[0],last=g[g.length-1];ctx.fillStyle="#20ae81";ctx.beginPath();ctx.arc(first[0]*w,first[1]*h,12,0,2*Math.PI);ctx.fill();
 ctx.fillStyle="#ebb455";ctx.beginPath();ctx.arc(last[0]*w,last[1]*h,10,0,2*Math.PI);ctx.fill();
 if(hallTracePoints.length){ctx.strokeStyle="#3f80e5";ctx.lineWidth=10;ctx.beginPath();hallTracePoints.forEach((p,i)=>i?ctx.lineTo(p[0]*w,p[1]*h):ctx.moveTo(p[0]*w,p[1]*h));ctx.stroke()}
}
function hallTracePos(e){const rect=$("hallTraceCanvas").getBoundingClientRect();return[Math.max(0,Math.min(1,(e.clientX-rect.left)/Math.max(1,rect.width))),Math.max(0,Math.min(1,(e.clientY-rect.top)/Math.max(1,rect.height)))]}
function hallTraceDown(e){if(hallMode!=="trace")return;e.preventDefault();hallTracePen=true;hallTracePointer=e.pointerId;hallTracePoints=[hallTracePos(e)];hallTraceSuccess=false;try{$("hallTraceCanvas").setPointerCapture(e.pointerId)}catch(err){}$("hallTraceFeedback").textContent="Веди пальцем дальше...";$("hallTraceCheck").classList.remove("hidden");$("hallTraceNext").classList.add("hidden");hallDrawCanvas()}
function hallTraceMove(e){if(!hallTracePen||hallTracePointer!==e.pointerId)return;e.preventDefault();const p=hallTracePos(e),last=hallTracePoints[hallTracePoints.length-1];if(hallTraceDist(p,last)>=.002){hallTracePoints.push(p);hallDrawCanvas()}}
function hallTraceUp(e){if(!hallTracePen||hallTracePointer!==e.pointerId)return;if(e.type==="pointerup"){const p=hallTracePos(e),last=hallTracePoints[hallTracePoints.length-1];if(hallTraceDist(p,last)>=.002)hallTracePoints.push(p)}hallTracePen=false;hallTracePointer=null;hallDrawCanvas()}
function hallTraceCheck(){
 if(hallMode!=="trace")return;
 const shape=hallTraceShape(),r=hallTraceScore(shape.path,hallTracePoints);
 $("hallTraceFeedback").textContent=r.ok?"🌟 Замечательно! Получилось!":"💛 "+r.reason;
 if(!r.ok){if(window.AcademySound)window.AcademySound.cue("try");return}
 if(window.AcademySound)window.AcademySound.cue("good");hallTraceSuccess=true;
 if(!hallProfile().traceAwards[shape.id]){hallProfile().traceAwards[shape.id]=true;save();$("hallTraceFeedback").textContent="🎉 Новая звезда за "+shape.title+"!"}
 else $("hallTraceFeedback").textContent="🌟 Отличное повторение "+shape.title+"!";
 $("hallTraceCheck").classList.add("hidden");$("hallTraceNext").classList.remove("hidden");
 if(state.settings.voice)speak("Молодец! Линия получилась!")
}
/* Pair-matching: no visual correctness hints beyond matched pairs. */
const HALL_PAIR_SETS={
 kostya:[
  {name:"Буквы и животные",prompt:"Соедини первую букву и животное.",pairs:[["К","🐱"],["М","🐻"],["С","🐶"],["Л","🦊"]]},
  {name:"Счёт звёзд",prompt:"Соедини число с количеством звёзд.",pairs:[["1","⭐"],["2","⭐⭐"],["3","⭐⭐⭐"],["4","⭐⭐⭐⭐"]]},
  {name:"Слова и картинки",prompt:"Соедини слово и картинку.",pairs:[["КОТ","🐱"],["ДОМ","🏠"],["ЛЕС","🌲"],["СЫР","🧀"]]},
  {name:"Фигуры",prompt:"Найди картинки к названиям фигур.",pairs:[["Круг","🔵"],["Квадрат","🟦"],["Звезда","⭐"],["Треугольник","🔺"]]},
  {name:"Времена года",prompt:"Соедини время года и его символ.",pairs:[["Зима","❄️"],["Лето","☀️"],["Осень","🍂"],["Весна","🌷"]]},
  {name:"Животные и природа",prompt:"Подбери место для каждого животного.",pairs:[["🐟","🌊"],["🐻","🌲"],["🐮","🚜"],["🐝","🌻"]]}
 ],
 kirill:[
  {name:"Весёлые зверята",prompt:"Найди одинаковых зверят.",pairs:[["🐱","🐱"],["🐶","🐶"],["🐻","🐻"],["🐰","🐰"]]},
  {name:"Цветные шарики",prompt:"Найди одинаковые цвета.",pairs:[["🔴","🔴"],["🔵","🔵"],["🟡","🟡"],["🟢","🟢"]]},
  {name:"Фрукты",prompt:"Найди одинаковые фрукты.",pairs:[["🍎","🍎"],["🍌","🍌"],["🍐","🍐"],["🍓","🍓"]]},
  {name:"Игрушки",prompt:"Найди одинаковые игрушки.",pairs:[["🧸","🧸"],["⚽","⚽"],["🚗","🚗"],["🎈","🎈"]]},
  {name:"Волшебный сад",prompt:"Найди одинаковые картинки.",pairs:[["🌸","🌸"],["🍄","🍄"],["🌲","🌲"],["🌞","🌞"]]},
  {name:"Знаки Академии",prompt:"Найди одинаковые знаки.",pairs:[["⭐","⭐"],["🌙","🌙"],["❤️","❤️"],["🔺","🔺"]]}
 ]
};
let hallPairIndex=0,hallPairMatched=new Set(),hallPairSelected=null,hallPairButtons=null,hallPairRounds=0;
function hallStartPairs(){hallSection("pairs");const done=hallProfile().pairAwards,sets=HALL_PAIR_SETS[state.active];const next=sets.findIndex((_,i)=>!done.includes(i));hallPairIndex=next>=0?next:hallPairRounds++%sets.length;hallShowPairs();if(state.settings.voice)speak("Сначала выбери картинку слева, затем подходящую пару справа.")}
function hallShowPairs(){
 const set=HALL_PAIR_SETS[state.active][hallPairIndex],left=$("hallPairsLeft"),right=$("hallPairsRight");
 hallPairMatched=new Set();hallPairSelected=null;left.innerHTML="";right.innerHTML="";
 $("hallPairsTitle").textContent=set.name;$("hallPairsInstruction").textContent=set.prompt;$("hallPairsFeedback").textContent="Выбери предмет слева.";$("hallPairsNext").classList.add("hidden");
 hallPairButtons={left:[],right:[]};const seed=hallSeed(state.active,"pairs",hallPairIndex+hallPairRounds*13);const order=hallShuffle(hallRandom(seed),[0,1,2,3]);
 for(let i=0;i<4;i++){
  const b=document.createElement("button");b.textContent=set.pairs[i][0];b.className="hall-pair"+(String(b.textContent).length>3?" word":"");b.onclick=()=>hallPairPickLeft(i);left.appendChild(b);hallPairButtons.left[i]=b
 }
 for(const i of order){
  const b=document.createElement("button");b.textContent=set.pairs[i][1];b.className="hall-pair"+(String(b.textContent).length>3?" word":"");b.onclick=()=>hallPairPickRight(i,b);right.appendChild(b);hallPairButtons.right[i]=b
 }
 hallPairProgress()
}
function hallPairProgress(){const root=$("hallPairsProgress");root.innerHTML="";for(let i=0;i<4;i++){const b=document.createElement("span");b.className=hallPairMatched.has(i)?"done":"";root.appendChild(b)}}
function hallPairPickLeft(i){if(hallPairMatched.has(i))return;if(hallPairSelected!==null)hallPairButtons.left[hallPairSelected].classList.remove("active");hallPairSelected=i;hallPairButtons.left[i].classList.add("active");$("hallPairsFeedback").textContent="✨ Теперь найди пару справа.";if(state.settings.voice)speak(HALL_PAIR_SETS[state.active][hallPairIndex].pairs[i][0])}
function hallPairPickRight(i,button){
 if(hallPairSelected===null){$("hallPairsFeedback").textContent="Сначала выбери предмет слева.";return}
 if(hallPairMatched.has(i))return;
 const chosen=hallPairSelected;
 if(i!==chosen){if(window.AcademySound)window.AcademySound.cue("try");$("hallPairsFeedback").textContent="💛 Попробуй другой предмет справа.";button.classList.add("wrong");setTimeout(()=>button.classList.remove("wrong"),500);return}
 hallPairMatched.add(i);if(window.AcademySound)window.AcademySound.cue("good");hallPairButtons.left[i].classList.remove("active");hallPairButtons.left[i].classList.add("matched");hallPairButtons.left[i].disabled=true;
 button.classList.add("matched");button.disabled=true;hallPairSelected=null;hallPairProgress();
 if(hallPairMatched.size===4){
  const repeated=hallProfile().pairAwards.includes(hallPairIndex);
  if(!repeated){hallProfile().pairAwards.push(hallPairIndex);save()}
  $("hallPairsFeedback").textContent=repeated?"🌟 Ты снова нашёл все пары!":"🏆 Все четыре пары найдены! Четыре звезды знаний!";
  $("hallPairsNext").classList.remove("hidden");$("hallPairsNext").onclick=()=>{hallPairIndex=(hallPairIndex+1)%HALL_PAIR_SETS[state.active].length;hallPairRounds++;hallShowPairs()};
  if(state.settings.voice)speak("Ура! Все пары найдены!");
  if(!state.settings.reduceMotion&&typeof confetti==="function")confetti()
 }else $("hallPairsFeedback").textContent="✅ Найдено "+hallPairMatched.size+" из 4 пар."
}
function hallMiniWire(){
 const canvas=$("hallTraceCanvas");
 canvas.addEventListener("pointerdown",hallTraceDown);canvas.addEventListener("pointermove",hallTraceMove);canvas.addEventListener("pointerup",hallTraceUp);canvas.addEventListener("pointercancel",hallTraceUp);
 window.addEventListener("blur",()=>hallTracePen=false);
 $("hallTraceClear").onclick=()=>{hallTracePoints=[];hallTraceSuccess=false;$("hallTraceFeedback").textContent="Начни с зелёной точки."; $("hallTraceNext").classList.add("hidden");$("hallTraceCheck").classList.remove("hidden");hallDrawCanvas()};
 $("hallTraceCheck").onclick=hallTraceCheck;
 $("hallTraceNext").onclick=()=>{hallTraceIndex=(hallTraceIndex+1)%HALL_TRACE_SHAPES[state.active].length;hallShowTrace()};
 $("hallPairsSpeak").onclick=()=>speak(HALL_PAIR_SETS[state.active][hallPairIndex].prompt,true)
}
hallMiniWire();
