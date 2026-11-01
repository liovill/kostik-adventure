/* Академия: оригинальная музыкальная атмосфера и игровые звуки.
   Не использует внешние сервисы, трекеры или чужие мелодии. Запуск только после взаимодействия. */
(function(root){
"use strict";
const AudioContextClass=()=>root.AudioContext||root.webkitAudioContext||null;
const SCENES={
 grove:{base:196,filter:750,pad:[0,7,12],wind:.08,pace:8500},
 garden:{base:220,filter:1150,pad:[0,4,9],wind:.045,pace:7000},
 river:{base:174.61,filter:1480,pad:[0,5,12],wind:.11,pace:9200},
 clearing:{base:164.81,filter:820,pad:[0,7,11],wind:.06,pace:7800},
 academy:{base:196,filter:520,pad:[0,4,7],wind:.035,pace:9000}
};
const CUES={
 tap:[{f:523,t:0,d:.07,v:.12}],
 select:[{f:440,t:0,d:.07,v:.12},{f:660,t:.065,d:.10,v:.12}],
 good:[{f:392,t:0,d:.15,v:.16},{f:494,t:.12,d:.17,v:.16},{f:587,t:.24,d:.25,v:.15}],
 try:[{f:330,t:0,d:.12,v:.07},{f:311,t:.11,d:.20,v:.07}],
 firefly:[{f:720,t:0,d:.13,v:.11},{f:965,t:.11,d:.24,v:.1},{f:1235,t:.19,d:.27,v:.09}],
 flower:[{f:440,t:0,d:.18,v:.14},{f:554,t:.16,d:.18,v:.12},{f:659,t:.29,d:.31,v:.13}],
 bridge:[{f:155,t:0,d:.065,v:.18},{f:220,t:.09,d:.09,v:.11}],
 owl:[{f:294,t:0,d:.24,v:.08},{f:370,t:.23,d:.28,v:.09}],
 dragon:[{f:587,t:0,d:.15,v:.12},{f:740,t:.15,d:.15,v:.13},{f:880,t:.30,d:.20,v:.11},{f:1175,t:.47,d:.37,v:.09}],
 medal:[{f:392,t:0,d:.22,v:.10},{f:494,t:.16,d:.22,v:.10},{f:587,t:.32,d:.23,v:.10},{f:784,t:.51,d:.45,v:.12}]
};
let config=()=>({ambientOn:false,fxOn:true,audioVolume:.38}),persist=()=>{},onChange=()=>{};
let ctx=null,master=null,bus=null,ambient=null,noise=null,noiseFilter=null,noiseSource=null,pads=[],timer=0,scene="academy",unlocked=false,visible=true,ducked=false,busy=false;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const volume=()=>{const v=Number(config().audioVolume);return Number.isFinite(v)?clamp(v,.05,1):.38};
const support=()=>!!AudioContextClass();
function context(){
 if(ctx)return ctx;
 const Klass=AudioContextClass();if(!Klass)return null;
 try{
  ctx=new Klass();master=ctx.createGain();master.gain.value=volume();
  ambient=ctx.createGain();ambient.gain.value=0;
  bus=ctx.createGain();bus.gain.value=.55;
  ambient.connect(master);bus.connect(master);master.connect(ctx.destination);
  unlocked=true;
 }catch(e){ctx=null;master=null;ambient=null;bus=null;return null}
 return ctx
}
function resume(){
 const c=context();if(!c)return false;
 if(c.state==="suspended"&&c.resume){try{const result=c.resume();if(result&&typeof result.catch==="function")result.catch(()=>{})}catch(e){}}
 return true
}
function gainTo(param,value,duration=.25){
 if(!ctx||!param)return;
 try{param.cancelScheduledValues(ctx.currentTime);param.setTargetAtTime(value,ctx.currentTime,Math.max(.015,duration/3))}catch(e){param.value=value}
}
function pitch(f,at,duration=0.16,amp=.12,wave="sine",destination=bus){
 if(!ctx||!destination)return;
 try{
  const osc=ctx.createOscillator(),out=ctx.createGain(),now=ctx.currentTime+at;
  osc.type=wave;osc.frequency.setValueAtTime(f,now);
  out.gain.setValueAtTime(.0001,now);
  out.gain.exponentialRampToValueAtTime(Math.max(.001,amp),now+.02);
  out.gain.exponentialRampToValueAtTime(.0001,now+Math.max(.09,duration));
  osc.connect(out);out.connect(destination);
  osc.start(now);osc.stop(now+Math.max(.11,duration)+.025);
  osc.onended=()=>{try{osc.disconnect();out.disconnect()}catch(e){}}
 }catch(e){}
}
function cue(name){
 if(config().fxOn===false)return false;
 const sequence=CUES[name]||CUES.tap;
 if(!resume())return false;
 for(const note of sequence)pitch(note.f,note.t,note.d,note.v,"sine");
 return true
}
function ambientGain(){return config().ambientOn===true&&visible&&!ducked?.095:config().ambientOn===true&&visible?.025:0}
function makeNoise(){
 if(!ctx||noiseSource)return;
 try{
  const sr=Math.min(ctx.sampleRate||22050,44100),buffer=ctx.createBuffer(1,sr*2,sr),samples=buffer.getChannelData(0);
  let seed=0x9e3779b9;for(let i=0;i<samples.length;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;samples[i]=((seed>>>0)/2147483648-1)*.34}
  noiseFilter=ctx.createBiquadFilter();noiseFilter.type="lowpass";noiseFilter.frequency.value=SCENES[scene].filter;
  noise=ctx.createGain();noise.gain.value=SCENES[scene].wind;
  noiseSource=ctx.createBufferSource();noiseSource.buffer=buffer;noiseSource.loop=true;
  noiseSource.connect(noiseFilter);noiseFilter.connect(noise);noise.connect(ambient);
  noiseSource.start()
 }catch(e){noiseSource=null}
}
function makePad(){
 if(!ctx||pads.length)return;
 const info=SCENES[scene];
 for(let i=0;i<3;i++){
  try{
   const osc=ctx.createOscillator(),out=ctx.createGain();
   osc.type=i===0?"sine":"triangle";osc.frequency.value=info.base*Math.pow(2,info.pad[i]/12);
   out.gain.value=i===0?.23:.075;
   osc.connect(out);out.connect(ambient);osc.start();pads.push({osc,out,index:i})
  }catch(e){}
 }
}
function bloom(){
 if(!ctx||!config().ambientOn||!visible)return;
 const info=SCENES[scene];const k=info.base,now=ctx.currentTime;
 // Sparse original two-tone chimes with varying intervals.
 const n=(Math.floor(now*7)%3);pitch(k*Math.pow(2,(12+(n===0?0:n===1?4:7))/12),0,.23,.016,"sine",ambient);
 pitch(k*Math.pow(2,(19+(n===2?2:0))/12),.23,.31,.012,"sine",ambient);
}
function setScene(name){
 scene=SCENES[name]?name:"academy";
 if(!ctx)return;
 const info=SCENES[scene];
 for(const p of pads)gainTo(p.osc.frequency,info.base*Math.pow(2,info.pad[p.index]/12),1.8);
 if(noiseFilter)gainTo(noiseFilter.frequency,info.filter,.8);
 if(noise)gainTo(noise.gain,info.wind,.7);
 if(timer){root.clearInterval(timer);timer=0;if(config().ambientOn)timer=root.setInterval(bloom,info.pace)}
}
function startAmbientFromGesture(){
 if(!config().ambientOn)return false;
 if(!resume())return false;
 makeNoise();makePad();
 gainTo(ambient.gain,ambientGain(),.8);
 if(!timer)timer=root.setInterval(bloom,SCENES[scene].pace);
 return true
}
function stopAmbient(){
 if(timer){root.clearInterval(timer);timer=0}
 if(ambient&&ctx)gainTo(ambient.gain,0,.35)
}
function setAmbient(enabled){
 if(enabled&&!support())return false;
 config().ambientOn=!!enabled;
 try{persist()}catch(e){}
 try{onChange()}catch(e){}
 if(enabled){startAmbientFromGesture();cue("select")}else stopAmbient();
 return config().ambientOn
}
function setEffects(enabled){
 config().fxOn=!!enabled;
 try{persist()}catch(e){}
 try{onChange()}catch(e){}
 if(enabled)cue("select")
 return config().fxOn
}
function setVolume(value){
 config().audioVolume=clamp(Number(value)||.38,.05,1);
 if(master)gainTo(master.gain,volume(),.2);
 try{persist()}catch(e){}
 try{onChange()}catch(e){}
}
function duck(enable){
 ducked=!!enable;if(ambient)gainTo(ambient.gain,ambientGain(),.28)
}
function pause(){visible=false;if(ambient)gainTo(ambient.gain,0,.12);if(ctx&&ctx.suspend)try{ctx.suspend().catch(()=>{})}catch(e){}}
function unpause(){visible=true;if(ctx&&ctx.resume){try{ctx.resume().catch(()=>{})}catch(e){}}if(ambient)gainTo(ambient.gain,ambientGain(),.6)}
function configure(opts){
 if(opts&&typeof opts.getSettings==="function")config=opts.getSettings;
 if(opts&&typeof opts.save==="function")persist=opts.save;
 if(opts&&typeof opts.onChange==="function")onChange=opts.onChange;
 if(opts&&opts.scene)setScene(opts.scene);
 // Never start sounds automatically on page load. Restore on a genuine touch.
 const gesture=()=>{
  if(config().ambientOn)startAmbientFromGesture();
  document.removeEventListener("pointerdown",gesture);
  document.removeEventListener("keydown",gesture)
 };
 if(typeof document!=="undefined"){
  document.addEventListener("pointerdown",gesture,{once:true});
  document.addEventListener("keydown",gesture,{once:true});
 }
}
if(typeof document!=="undefined")document.addEventListener("visibilitychange",()=>{if(document.hidden)pause();else unpause()});
root.AcademySound={configure,cue,setScene,setAmbient,setEffects,setVolume,startAmbientFromGesture,stopAmbient,duck,support,stopAll:stopAmbient};
})(window);
