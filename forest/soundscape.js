/* Академия: авторская сказочная музыка с мелодией, арфой, флейтой и природными звуками.
 * Five original adaptive themes, no external media, analytics, or user-identifying data.
 * Start only on a user gesture; Web Audio remains muted until the player opts in.
 */
(function(root){
"use strict";
const AudioContextClass=()=>root.AudioContext||root.webkitAudioContext||null;
const THEMES={
 academy:{
  title:"Тайны волшебной Академии",icon:"🏰",bpm:81,tonic:60,air:560,
  chords:[[48,55,60,64],[45,52,57,60],[53,60,65,69],[55,62,67,71],[48,55,60,64],[57,64,69,72],[53,60,65,69],[55,62,67,71]],
  melody:[72,0,76,79,0,76,74,0,72,0,71,72,74,0,67,0,69,0,72,76,0,74,72,0,71,0,69,67,0,0,72,0],
  variation:[79,0,81,79,76,0,74,0,72,0,76,74,72,0,69,0,76,0,79,81,0,79,76,0,74,0,72,71,0,67,72,0],
  lead:"celesta",foliage:"tower"
 },
 grove:{
  title:"Шёпот древних деревьев",icon:"🌲",bpm:76,tonic:67,air:870,
  chords:[[43,50,55,59],[48,55,60,64],[40,47,52,55],[45,52,57,60],[43,50,55,59],[45,52,57,60],[48,55,60,64],[43,50,55,59]],
  melody:[74,0,79,81,0,79,76,0,74,0,72,74,0,71,67,0,72,0,74,76,0,74,72,0,69,0,71,72,0,0,74,0],
  variation:[79,0,81,83,0,81,79,0,76,0,79,76,0,74,72,0,74,0,76,79,0,76,74,0,72,0,71,69,0,0,74,0],
  lead:"flute",foliage:"birds"
 },
 garden:{
  title:"Танец просыпающихся цветов",icon:"🌷",bpm:91,tonic:72,air:1030,
  chords:[[48,55,60,64],[53,60,65,69],[45,52,57,60],[55,62,67,71],[48,55,60,64],[57,64,69,72],[53,60,65,69],[55,62,67,71]],
  melody:[76,79,0,81,79,0,76,72,74,0,76,79,0,0,76,0,81,0,79,76,74,0,72,0,74,76,0,79,0,76,72,0],
  variation:[79,81,0,84,81,0,79,76,77,0,79,81,0,0,79,0,84,0,83,81,79,0,76,0,77,79,0,81,0,79,76,0],
  lead:"musicbox",foliage:"garden"
 },
 river:{
  title:"Лунная мелодия ручья",icon:"🌊",bpm:72,tonic:69,air:1480,
  chords:[[45,52,57,60],[50,57,62,65],[41,48,53,57],[43,50,55,59],[45,52,57,60],[48,55,60,64],[41,48,53,57],[43,50,55,59]],
  melody:[72,0,76,74,0,72,69,0,71,0,72,76,0,74,72,0,69,0,72,74,0,76,74,0,72,0,69,71,0,0,69,0],
  variation:[76,0,79,77,0,76,72,0,74,0,76,79,0,77,76,0,72,0,74,76,0,79,77,0,76,0,72,74,0,0,72,0],
  lead:"harp",foliage:"water"
 },
 clearing:{
  title:"Пробуждение дракончика",icon:"🐲",bpm:83,tonic:65,air:900,
  chords:[[41,48,53,57],[48,55,60,64],[50,57,62,65],[46,53,58,62],[41,48,53,57],[45,52,57,60],[46,53,58,62],[48,55,60,64]],
  melody:[72,0,77,79,0,77,74,0,72,0,74,77,0,79,81,0,79,0,77,74,0,72,74,0,77,0,74,72,0,0,77,0],
  variation:[77,0,81,84,0,81,79,0,77,0,79,81,0,84,86,0,84,0,81,79,0,77,79,0,81,0,79,77,0,0,77,0],
  lead:"flute",foliage:"magic"
 }
};
const CUES={
 tap:[[523,0,.065,.12]],select:[[440,0,.085,.13],[659,.07,.16,.11]],
 good:[[392,0,.13,.16],[493.88,.14,.17,.14],[587.33,.30,.27,.13]],
 try:[[311.13,0,.1,.075],[293.66,.13,.14,.065]],
 firefly:[[783.99,0,.14,.13],[1046.5,.14,.2,.12],[1318.5,.28,.35,.1]],
 flower:[[440,0,.14,.12],[554.37,.13,.20,.11],[659.25,.28,.34,.13]],
 bridge:[[155.56,0,.08,.18],[220,.1,.15,.10]],
 owl:[[293.66,0,.21,.10],[369.99,.22,.28,.10]],
 dragon:[[523.25,0,.16,.13],[659.25,.16,.18,.12],[783.99,.32,.23,.1],[1046.5,.49,.39,.12]],
 medal:[[392,0,.20,.13],[493.88,.17,.19,.12],[587.33,.34,.26,.11],[783.99,.55,.48,.13]]
};
const SCALE={water:[0,2,4,7,9],birds:[0,2,4,7,11]};
const supported=()=>!!AudioContextClass();
let settings=()=>({ambientOn:false,fxOn:true,audioVolume:.38}),persist=()=>{},onChange=()=>{};
let ctx=null,master=null,compressor=null,ambient=null,effects=null,music=null,nature=null,room=null;
let noiseSource=null,noiseFilter=null,noiseGain=null,scoreTimer=null,nextStep=0,step=0,themeName="academy",isVisible=true,ducked=false,playing=false;
let soundSeed=193455829,disposed=false;
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const vol=()=>{const n=Number(settings().audioVolume);return Number.isFinite(n)?clamp(n,.05,1):.38};
const random=()=>{soundSeed=(Math.imul(soundSeed,1664525)+1013904223)>>>0;return soundSeed/4294967296};
const pitch=n=>440*Math.pow(2,(n-69)/12);
function gainNode(v=1){const a=ctx.createGain();a.gain.value=v;return a}
function context(){
 if(ctx)return ctx;
 const C=AudioContextClass();if(!C)return null;
 try{
  ctx=new C();
  master=gainNode(.84*vol());ambient=gainNode(0);effects=gainNode(.85);
  if(ctx.createDynamicsCompressor){
   compressor=ctx.createDynamicsCompressor();
   compressor.threshold.value=-16;compressor.knee.value=12;compressor.ratio.value=3;
   compressor.attack.value=.006;compressor.release.value=.19;
   master.connect(compressor);compressor.connect(ctx.destination)
  }else master.connect(ctx.destination);
  ambient.connect(master);effects.connect(master);
  music=gainNode(.78);music.connect(ambient);
  nature=gainNode(.36);nature.connect(ambient);
  createReverb();createNature();
  return ctx
 }catch(e){ctx=null;return null}
}
function resume(){
 const c=context();if(!c)return false;
 if(c.state==="suspended"&&c.resume)try{const p=c.resume();if(p?.catch)p.catch(()=>{})}catch(e){}
 return true
}
function paramTo(p,n,d=.18){
 if(!ctx||!p)return;
 try{
  p.cancelScheduledValues(ctx.currentTime);
  p.setTargetAtTime(n,ctx.currentTime,Math.max(.02,d/3))
 }catch(e){p.value=n}
}
function createReverb(){
 // Short stereo-esque room coloration, subtle enough to keep instructions intelligible.
 if(!ctx||!ctx.createDelay)return;
 try{
  const d=ctx.createDelay(.7),feedback=gainNode(.16),wet=gainNode(.11),filter=ctx.createBiquadFilter();
  filter.type="lowpass";filter.frequency.value=2400;
  d.delayTime.value=.18;d.connect(filter);filter.connect(wet);wet.connect(ambient);
  filter.connect(feedback);feedback.connect(d);room=d;
 }catch(e){room=null}
}
function note(dest,midi,when,duration,kind="harp",strength=.16){
 if(!ctx||!dest)return;
 if(midi<=0)return;
 const kinds={
  harp:{parts:[[1,1,"sine"],[2,.32,"triangle"],[3,.13,"sine"]],attack:.006,release:.45,decay:true},
  musicbox:{parts:[[1,1,"sine"],[2.01,.42,"sine"],[3.98,.15,"sine"]],attack:.008,release:.65,decay:true},
  celesta:{parts:[[1,1,"sine"],[2.005,.35,"sine"],[4.04,.12,"sine"]],attack:.008,release:.75,decay:true},
  flute:{parts:[[1,1,"sine"],[2,.09,"sine"],[3,.035,"sine"]],attack:.11,release:.23,decay:false},
  strings:{parts:[[1,.8,"triangle"],[2,.26,"sine"]],attack:.46,release:1.05,decay:false},
  bell:{parts:[[1,1,"sine"],[2.31,.43,"sine"],[4.18,.17,"sine"]],attack:.005,release:1.15,decay:true},
  bass:{parts:[[1,1,"sine"],[2,.14,"triangle"]],attack:.04,release:.48,decay:false}
 };
 const spec=kinds[kind]||kinds.harp;
 const t=Math.max(ctx.currentTime+.005,when),end=t+Math.max(.16,duration);
 const envelope=gainNode(.0001);envelope.connect(dest);
 let roomSend=null;
 if(room&&strength>.02){roomSend=gainNode(.22);envelope.connect(roomSend);roomSend.connect(room)}
 const gain=envelope.gain,attack=spec.attack;
 try{
  gain.setValueAtTime(.0001,t);
  gain.linearRampToValueAtTime(Math.max(.001,strength),t+attack);
  if(spec.decay)gain.exponentialRampToValueAtTime(.0001,end+spec.release);
  else{gain.setValueAtTime(Math.max(.001,strength),Math.max(t+attack,end-.08));gain.exponentialRampToValueAtTime(.0001,end+spec.release)}
 }catch(e){gain.value=strength}
 const base=pitch(midi);
 let liveParts=0;
 for(const [factor,weight,wave]of spec.parts){
  try{
   const osc=ctx.createOscillator(),level=gainNode(weight/spec.parts.length);
   osc.type=wave;
   osc.frequency.value=base*factor;
   osc.connect(level);level.connect(envelope);
   liveParts++;
   osc.onended=()=>{try{osc.disconnect();level.disconnect()}catch(e){}liveParts--;if(liveParts===0){try{envelope.disconnect();if(roomSend)roomSend.disconnect()}catch(e){}}};
   osc.start(t);osc.stop(end+spec.release+.06);
  }catch(e){}
 }
}
function chirp(when,scene){
 if(!ctx||!nature)return;
 try{
  const osc=ctx.createOscillator(),g=gainNode(.0001);
  osc.type="sine";osc.frequency.setValueAtTime(scene==="garden"?1040:1250,when);
  osc.frequency.exponentialRampToValueAtTime(scene==="garden"?1420:1770,when+.085);
  osc.frequency.exponentialRampToValueAtTime(scene==="garden"?910:1090,when+.22);
  g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(.11,when+.04);
  g.gain.exponentialRampToValueAtTime(.0001,when+.3);
  osc.connect(g);g.connect(nature);osc.start(when);osc.stop(when+.31)
 }catch(e){}
}
function droplet(when){
 if(!ctx||!nature)return;
 try{
  const osc=ctx.createOscillator(),gain=gainNode(.0001);
  osc.type="sine";osc.frequency.setValueAtTime(950+random()*420,when);
  osc.frequency.exponentialRampToValueAtTime(230+random()*80,when+.24);
  gain.gain.setValueAtTime(.0001,when);
  gain.gain.exponentialRampToValueAtTime(.14,when+.025);
  gain.gain.exponentialRampToValueAtTime(.0001,when+.31);
  osc.connect(gain);gain.connect(nature);
  osc.onended=()=>{try{osc.disconnect();gain.disconnect()}catch(e){}};
  osc.start(when);osc.stop(when+.33)
 }catch(e){}
}
function createNature(){
 if(!ctx||noiseSource||!ctx.createBufferSource)return;
 try{
  // Reproducible, gently filtered wind and river: no harsh full-range white noise.
  const rate=Math.min(ctx.sampleRate||22050,44100),samples=ctx.createBuffer(1,rate*2,rate),dest=samples.getChannelData(0);
  let brown=0;
  for(let i=0;i<dest.length;i++){brown=clamp(brown*.985+(random()*2-1)*.06,-.7,.7);dest[i]=brown}
  noiseSource=ctx.createBufferSource();noiseSource.buffer=samples;noiseSource.loop=true;
  noiseFilter=ctx.createBiquadFilter();noiseFilter.type="lowpass";noiseFilter.frequency.value=650;
  noiseGain=gainNode(.065);noiseSource.connect(noiseFilter);noiseFilter.connect(noiseGain);noiseGain.connect(nature);
  noiseSource.start();
 }catch(e){noiseSource=null}
}
function theme(){return THEMES[themeName]||THEMES.academy}
function ambienceLevel(){return !playing||!settings().ambientOn||!isVisible?0:ducked?.19:.75}
function applyMix(){if(master)paramTo(master.gain,.84*vol());if(ambient)paramTo(ambient.gain,ambienceLevel(),ducked?.28:.72)}
function scheduleTick(){
 if(!ctx||!playing||!isVisible)return;
 const scene=theme(),tick=60/scene.bpm/2,horizon=ctx.currentTime+.58;
 let guard=0;
 while(nextStep<horizon&&guard++<16){
  const i=step%64,measure=Math.floor(i/8),barStep=i%8,cycle=Math.floor(step/64);
  const chord=scene.chords[measure%scene.chords.length],motif=(measure>=4?scene.variation:scene.melody),lead=motif[i%32];
  if(barStep===0){
   for(let j=1;j<4;j++)note(music,chord[j]+12,nextStep,tick*7.1,"strings",.095);
   note(music,chord[0],nextStep,tick*6.6,"bass",.18);
  }
  if(i%2===0){
   const arpIndex=[1,2,3,2][Math.floor(i/2)%4],m=chord[arpIndex]+12+(measure%2===0?0:0);
   note(music,m,nextStep,tick*1.65,scene.lead==="harp"?"harp":"harp",.145);
  }
  if(lead){
   const accent=barStep===0?.28:.22;
   note(music,lead,nextStep,tick*(scene.lead==="flute"?2.75:1.85),scene.lead,accent);
  }
  if(i%16===14&&cycle%2===0)note(music,chord[3]+24,nextStep+.09,tick*3.2,"bell",.058);
  if(scene.foliage==="birds"&&i%24===5)chirp(nextStep+.14,"grove");
  if(scene.foliage==="garden"&&i%20===9)chirp(nextStep+.13,"garden");
  if(scene.foliage==="water"&&i%8===3){
   note(nature,chord[2]+24,nextStep+.1,tick*.8,"bell",.05);
   droplet(nextStep+.07)
  }
  if(scene.foliage==="birds"&&i%16===0&&noiseGain)paramTo(noiseGain.gain,.07+random()*.07,1.8);
  if(scene.foliage==="garden"&&i%16===0&&noiseGain)paramTo(noiseGain.gain,.06+random()*.04,1.5);
  if(scene.foliage==="magic"&&i%16===11){
   note(nature,chord[3]+24,nextStep,tick*4,"musicbox",.065)
  }
  step++;nextStep+=tick
 }
}
function startMusic(){
 if(!settings().ambientOn||!isVisible)return false;
 if(!resume())return false;
 if(!playing){
  playing=true;step=0;nextStep=ctx.currentTime+.12;
  if(scoreTimer!==null){root.clearInterval(scoreTimer);scoreTimer=null}
  scheduleTick();
  scoreTimer=root.setInterval(scheduleTick,185);
 }
 applyMix();return true
}
function stopMusic(){
 playing=false;
 if(scoreTimer!==null){root.clearInterval(scoreTimer);scoreTimer=null}
 applyMix()
}
function cue(kind){
 if(settings().fxOn===false)return false;
 if(!resume())return false;
 for(const [frequency,time,dur,amp]of CUES[kind]||CUES.tap){
  const midi=69+12*Math.log2(frequency/440);
  note(effects,midi,ctx.currentTime+time+.015,dur,"musicbox",amp*1.7)
 }
 return true
}
function setScene(name){
 themeName=THEMES[name]?name:"academy";
 if(!ctx)return;
 const t=theme();
 if(noiseFilter)paramTo(noiseFilter.frequency,t.air,.8);
 if(noiseGain)paramTo(noiseGain.gain,name==="river"?.17:name==="grove"?.1:name==="garden"?.075:.035,.8);
 if(playing){
  step=0;nextStep=ctx.currentTime+.14;
  scheduleTick()
 }
}
function startAmbientFromGesture(){return startMusic()}
function setAmbient(enabled){
 if(enabled&&!supported())return false;
 settings().ambientOn=!!enabled;
 try{persist()}catch(e){}
 try{onChange()}catch(e){}
 if(enabled){const ok=startMusic();if(ok)cue("select");return ok}
 stopMusic();return false
}
function setEffects(enabled){settings().fxOn=!!enabled;try{persist()}catch(e){}try{onChange()}catch(e){}if(enabled)cue("select");return settings().fxOn}
function setVolume(value){const n=Number(value);settings().audioVolume=Number.isFinite(n)?clamp(n,.05,1):.38;applyMix();try{persist()}catch(e){}try{onChange()}catch(e){}}
function duck(enabled){ducked=!!enabled;applyMix()}
function pause(){isVisible=false;applyMix();if(scoreTimer!==null){root.clearInterval(scoreTimer);scoreTimer=null}}
function unpause(){isVisible=true;if(playing&&ctx){nextStep=ctx.currentTime+.14;scoreTimer=root.setInterval(scheduleTick,185);applyMix()}else if(settings().ambientOn&&ctx)startMusic()}
function configure(opts){
 if(opts&&typeof opts.getSettings==="function")settings=opts.getSettings;
 if(opts&&typeof opts.save==="function")persist=opts.save;
 if(opts&&typeof opts.onChange==="function")onChange=opts.onChange;
 if(opts?.scene)setScene(opts.scene);
 // On iOS, audio must start from a tap. Do not produce sounds on initial load.
 if(typeof document!=="undefined"){
  const unlock=()=>{
   if(settings().ambientOn)startMusic();
   document.removeEventListener("pointerdown",unlock);
   document.removeEventListener("keydown",unlock)
  };
  document.addEventListener("pointerdown",unlock,{once:true});
  document.addEventListener("keydown",unlock,{once:true})
 }
}
if(typeof document!=="undefined")document.addEventListener("visibilitychange",()=>{if(document.hidden)pause();else unpause()});
root.AcademySound={configure,cue,setScene,setAmbient,setEffects,setVolume,startAmbientFromGesture,stopAmbient:stopMusic,duck,support:supported,stopAll:stopMusic,getSceneInfo:()=>({title:theme().title,icon:theme().icon,bpm:theme().bpm})};
})(window);
