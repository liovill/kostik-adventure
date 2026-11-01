/* Академия волшебства: единый голосовой движок, без внешних сервисов. */
(function(root){
 "use strict";
 const PRESETS={
  fairy:{name:"Сказочная история",rate:1.0,pitch:1.01},
  gentle:{name:"Спокойный голос",rate:.90,pitch:.98},
  clear:{name:"Чёткое объяснение",rate:1.08,pitch:1.00}
 };
 const ROLES={
  wizard:{name:"Звездочёт",rate:.98,pitch:.95},
  owl:{name:"Сова Луна",rate:1.02,pitch:1.07},
  dragon:{name:"Искрик",rate:1.08,pitch:1.12},
  helper:{name:"Помощник",rate:1.03,pitch:1.01}
 };
 const EXAMPLES={
  wizard:"Привет, юный волшебник! Перед нами новая загадка. Вместе мы обязательно её решим.",
  owl:"Добро пожаловать в Зачарованный лес! Прислушайся: волшебные деревья рассказывают нам сказку.",
  dragon:"Привет! Я Искрик! Давай вместе найдём что-нибудь удивительное!"
 };
 const ICON_WORDS=[
  ["🐱","котик"],["🐶","собачка"],["🐻","медведь"],["🐰","зайчик"],["🦉","сова"],["🐲","дракончик"],
  ["🐟","рыбка"],["🦊","лиса"],["🐸","лягушка"],["🦋","бабочка"],["🍎","яблоко"],["🍄","гриб"],
  ["🌲","ёлочка"],["⭐","звёздочка"],["☀️","солнышко"],["🌙","луна"],["❤️","сердечко"],["🔴","красный"],
  ["🔵","синий"],["🟢","зелёный"],["🟡","жёлтый"],["🟣","фиолетовый"]
 ];
 let readSettings=()=>({voice:true}),writeSettings=()=>{},onSettingsChange=()=>{},studio=null,speechSerial=0,currentUtterance=null;
 let voices=[],currentClip=null;
 const voiceSupported=()=>!!(root.speechSynthesis&&typeof root.SpeechSynthesisUtterance==="function");
 function config(settings){
  if(settings&&typeof settings.getSettings==="function")readSettings=settings.getSettings;
  if(settings&&typeof settings.save==="function")writeSettings=settings.save;
  if(settings&&typeof settings.onChange==="function")onSettingsChange=settings.onChange;
  refreshVoices()
 }
 function options(){return readSettings()||{voice:true}}
 function pickPreset(){return PRESETS[options().voicePreset]||PRESETS.fairy}
 function normalizedSpeed(){const s=Number(options().voiceSpeed);return Number.isFinite(s)?Math.max(.72,Math.min(1.12,s)):.94}
 function keyForVoice(v){return (v.voiceURI||v.name)+"|"+(v.lang||"")+"|"+v.name}
 function refreshVoices(){
  if(!voiceSupported()){voices=[];return voices}
  try{
   const all=root.speechSynthesis.getVoices()||[];
   voices=all.filter(v=>/^ru(?:-|_|$)/i.test(v.lang||"")).sort((a,b)=>{
    const quality=v=>(/premium|enhanced|natural|neural|siri/i.test(v.name)?2:0)+(v.localService?1:0);
    return quality(b)-quality(a)||a.name.localeCompare(b.name,"ru")
   });
  }catch(e){voices=[]}
  if(studio)refreshStudioVoiceChoices();
  return voices
 }
 function voiceForRole(role){
  const opts=options(),specified=role==="owl"?opts.voiceOwl:opts.voiceWizard;
  return voices.find(v=>keyForVoice(v)===specified)||voices[0]||null
 }
 function cleanText(text){
  let s=String(text==null?"":text);
  for(const [symbol,spoken]of ICON_WORDS)s=s.split(symbol).join(" "+spoken+" ");
  try{s=s.replace(/\p{Extended_Pictographic}/gu," ")}catch(e){}
  s=s.replace(/[\u200D\uFE0F\uFE0E]/g," ").replace(/[•·✦✧✨🌟]/g," ");
  s=s.replace(/[ \t]{2,}/g," ").replace(/\s*\n\s*/g,". ").trim();
  return s.slice(0,1300)
 }
 function updateStatus(message){
  if(!studio)return;
  const el=studio.querySelector("[data-voice-status]");
  if(el)el.textContent=message
 }
 function stopClip(){
  if(!currentClip)return;
  const c=currentClip;currentClip=null;
  try{c.onended=null;c.onerror=null;c.onplay=null;c.pause();c.currentTime=0}catch(e){}
 }
 function stop(){
  speechSerial++;
  currentUtterance=null;
  stopClip();
  if(root.AcademySound)root.AcademySound.duck(false);
  if(voiceSupported())try{root.speechSynthesis.cancel()}catch(e){}
  updateStatus("Воспроизведение остановлено.")
 }
 function speak(text,opts={}){
  const force=opts.force===true;
  if(!options().voice&&!force)return false;
  const spoken=cleanText(text);
  if(!spoken)return false;
  const role=ROLES[opts.role]?opts.role:"wizard";
  stopClip();
  if(root.AcademySound)root.AcademySound.duck(false);
  // Recorded clips take priority only if a real, explicitly listed local audio asset exists.
  if(opts.clip&&typeof root.Audio==="function"&&/^\.\/audio\/[\w\-\/]+\.(mp3|m4a|ogg|wav)$/i.test(opts.clip)){
   const token=++speechSerial;
   try{
    if(voiceSupported())root.speechSynthesis.cancel();
    const clip=new root.Audio(opts.clip);clip.preload="auto";clip.volume=1;currentClip=clip;
    clip.onplay=()=>{if(token===speechSerial){if(root.AcademySound)root.AcademySound.duck(true);updateStatus("🎙️ Звучит записанная реплика: "+ROLES[role].name)}};
    clip.onended=()=>{if(token===speechSerial){currentClip=null;if(root.AcademySound)root.AcademySound.duck(false);updateStatus("Реплика завершена.")}};
    clip.onerror=()=>{if(token===speechSerial){currentClip=null;if(root.AcademySound)root.AcademySound.duck(false);speak(text,{...opts,clip:null})}};
    const promise=clip.play();if(promise&&typeof promise.catch==="function")promise.catch(()=>{if(token===speechSerial){currentClip=null;if(root.AcademySound)root.AcademySound.duck(false);speak(text,{...opts,clip:null})}});
    return true
   }catch(e){currentClip=null}
  }
  if(!voiceSupported()){updateStatus("На устройстве нет системного голосового воспроизведения.");return false}
  const utterance=new root.SpeechSynthesisUtterance(spoken);
  const preset=pickPreset(),character=ROLES[role];
  utterance.lang="ru-RU";
  utterance.rate=Math.min(1.3,Math.max(.65,normalizedSpeed()*preset.rate*character.rate));
  utterance.pitch=Math.min(1.4,Math.max(.75,preset.pitch*character.pitch));
  utterance.volume=1;
  refreshVoices();
  const selected=voiceForRole(role);
  if(selected)utterance.voice=selected;
  const token=++speechSerial;
  utterance.onstart=()=>{if(token===speechSerial){if(root.AcademySound)root.AcademySound.duck(true);updateStatus("🔊 Звучит: "+character.name)}};
  utterance.onend=()=>{if(token===speechSerial){currentUtterance=null;if(root.AcademySound)root.AcademySound.duck(false);updateStatus("Готово. Можно послушать другой вариант.")}};
  utterance.onerror=event=>{
   if(token!==speechSerial||event.error==="interrupted"||event.error==="canceled")return;
   currentUtterance=null;
   if(root.AcademySound)root.AcademySound.duck(false);
   updateStatus("Звук не запустился. Проверь громкость и русский голос в настройках устройства.")
  };
  // iOS Safari generally requires this to run in the originating tap handler.
  try{
   root.speechSynthesis.cancel();
   currentUtterance=utterance;
   root.speechSynthesis.speak(utterance);
   updateStatus("Загружаю голос: "+character.name+"…");
   return true
  }catch(e){
   currentUtterance=null;
   if(root.AcademySound)root.AcademySound.duck(false);
   updateStatus("Не удалось запустить звук. Попробуй другой голос.");
   return false
  }
 }
 function line(id,opts={}){const item=root.AcademyVoiceLines&&root.AcademyVoiceLines[id];if(!item||typeof item.text!=="string")return false;return speak(item.text,{...opts,role:opts.role||item.role||"wizard",clip:item.file||null})}
 function setEnabled(enabled){
  options().voice=Boolean(enabled);
  try{writeSettings()}catch(e){}
  try{onSettingsChange()}catch(e){}
  if(!enabled)stop()
 }
 function setSetting(name,value){
  if(!["voicePreset","voiceSpeed","voiceWizard","voiceOwl"].includes(name))return;
  const s=options();s[name]=value;
  try{writeSettings()}catch(e){}
  try{onSettingsChange()}catch(e){}
 }
 function node(tag,cls,text){
  const n=document.createElement(tag);
  if(cls)n.className=cls;
  if(text!==undefined)n.textContent=text;
  return n
 }
 function field(labelText,control){
  const f=node("label","voice-field");
  f.appendChild(node("span","voice-label",labelText));
  f.appendChild(control);
  return f
 }
 function controlSelect(optionsList,value,onChange){
  const select=node("select","voice-select");
  optionsList.forEach(option=>{
   const n=node("option","",option.label);
   n.value=option.value;
   select.appendChild(n)
  });
  select.value=value;
  select.addEventListener("change",()=>onChange(select.value));
  return select
 }
 function createButton(label,onClick,cls="voice-action"){
  const b=node("button",cls,label);
  b.type="button";b.addEventListener("click",onClick);
  return b
 }
 function refreshStudioVoiceChoices(){
  if(!studio)return;
  for(const role of ["wizard","owl"]){
   const select=studio.querySelector('[data-voice-select="'+role+'"]');
   if(!select)continue;
   const keep=role==="owl"?options().voiceOwl:options().voiceWizard;
   select.replaceChildren();
   let fallback=node("option","",voices.length?"Автоматически: русский голос":"Системный голос (список пока пуст)");
   fallback.value="";select.appendChild(fallback);
   voices.forEach(v=>{
    const op=node("option","",v.name+" ("+v.lang+")");
    op.value=keyForVoice(v);
    select.appendChild(op)
   });
   select.value=voices.some(v=>keyForVoice(v)===keep)?keep:"";
  }
  const note=studio.querySelector("[data-voice-count]");
  if(note)note.textContent=voices.length?
   "Доступных русских голосов: "+voices.length+". Звучание зависит от установленных голосов устройства.":
   "Русские голоса ещё не найдены. iPhone может показать их после первого прослушивания; используется системный голос.";
 }
 function closeStudio(){
  stop();
  if(studio){studio.remove();studio=null}
  if(root.__academyVoicePreviousFocus)try{root.__academyVoicePreviousFocus.focus()}catch(e){}
 }
 function openStudio(){
  if(studio){closeStudio();return}
  root.__academyVoicePreviousFocus=document.activeElement;
  const overlay=node("div","voice-studio-overlay");
  overlay.setAttribute("role","presentation");
  const panel=node("section","voice-studio-panel");
  panel.setAttribute("role","dialog");
  panel.setAttribute("aria-modal","true");
  panel.setAttribute("aria-labelledby","voiceStudioTitle");
  overlay.appendChild(panel);
  const heading=node("div","voice-studio-heading");
  const headingText=node("div","");
  headingText.appendChild(node("div","voice-overline","МАСТЕРСКАЯ АКАДЕМИИ"));
  const title=node("h2","","🎙️ Студия голосов");title.id="voiceStudioTitle";
  headingText.appendChild(title);
  heading.appendChild(headingText);
  heading.appendChild(createButton("✕",closeStudio,"voice-close"));
  panel.appendChild(heading);
  panel.appendChild(node("p","voice-studio-description","Выбери тембр, темп и настроение речи. Послушай героев перед тем, как сохранить выбор."));
  const on=controlSelect([{label:"🔊 Голос включён",value:"on"},{label:"🔇 Голос выключен",value:"off"}],options().voice?"on":"off",v=>{setEnabled(v==="on");updateStatus(v==="on"?"Голос включён.":"Голос выключен.")});
  panel.appendChild(field("Озвучка",on));
  const preset=controlSelect(Object.entries(PRESETS).map(([value,v])=>({value,label:v.name})),options().voicePreset||"fairy",v=>setSetting("voicePreset",v));
  panel.appendChild(field("Манера речи",preset));
  const rate=node("input","voice-speed");
  rate.type="range";rate.min="0.72";rate.max="1.12";rate.step="0.02";rate.value=String(normalizedSpeed());
  const rateValue=node("span","voice-speed-label",Math.round(normalizedSpeed()*100)+"%");
  const speedField=field("Темп речи",rate);
  speedField.appendChild(rateValue);
  rate.addEventListener("input",()=>{setSetting("voiceSpeed",Number(rate.value));rateValue.textContent=Math.round(Number(rate.value)*100)+"%"});
  panel.appendChild(speedField);
  const speakers=node("div","voice-speakers");
  const wizard=controlSelect([{label:"Автоматически",value:""}],"",v=>setSetting("voiceWizard",v));
  const owl=controlSelect([{label:"Автоматически",value:""}],"",v=>setSetting("voiceOwl",v));
  wizard.setAttribute("data-voice-select","wizard");
  owl.setAttribute("data-voice-select","owl");
  speakers.appendChild(field("🧙‍♂️ Голос Звездочёта",wizard));
  speakers.appendChild(field("🦉 Голос совы Луны",owl));
  panel.appendChild(speakers);
  if(root.AcademySound){
   const ambience=controlSelect([{label:"🌲 Атмосфера включена",value:"on"},{label:"Тихо: без фоновых звуков",value:"off"}],options().ambientOn?"on":"off",v=>{
    const enabled=root.AcademySound.setAmbient(v==="on");
    if(v==="on"&&!enabled)ambience.value="off";
    updateStatus(enabled?"🌿 Играет тихая музыка леса.":v==="on"?"На этом устройстве пока недоступны фоновые звуки.":"Фоновые звуки выключены.")
   });
   panel.appendChild(field("🌿 Атмосфера волшебного мира",ambience));
   const effects=controlSelect([{label:"✨ Эффекты включены",value:"on"},{label:"Без звуков действий",value:"off"}],options().fxOn===false?"off":"on",v=>root.AcademySound.setEffects(v==="on"));
   panel.appendChild(field("✨ Звуки находок и волшебства",effects));
   const vol=node("input","voice-speed");
   vol.type="range";vol.min="0.10";vol.max="0.70";vol.step="0.05";vol.value=String(options().audioVolume||.38);
   const volLabel=node("span","voice-speed-label",Math.round(Number(vol.value)*100)+"%");
   const volumeField=field("Громкость атмосферы и эффектов",vol);
   volumeField.appendChild(volLabel);
   vol.addEventListener("input",()=>{root.AcademySound.setVolume(Number(vol.value));volLabel.textContent=Math.round(Number(vol.value)*100)+"%"});
   panel.appendChild(volumeField);
  }
  const note=node("p","voice-device-note","");
  note.setAttribute("data-voice-count","");
  panel.appendChild(note);
  const preview=node("div","voice-preview-buttons");
  preview.appendChild(createButton("🧙‍♂️ Звездочёт",()=>speak(EXAMPLES.wizard,{force:true,role:"wizard"})));
  preview.appendChild(createButton("🦉 Сова Луна",()=>speak(EXAMPLES.owl,{force:true,role:"owl"})));
  preview.appendChild(createButton("🐲 Искрик",()=>speak(EXAMPLES.dragon,{force:true,role:"dragon"})));
  panel.appendChild(preview);
  const status=node("p","voice-status","Нажми на героя, чтобы услышать его голос.");
  status.setAttribute("data-voice-status","");
  status.setAttribute("role","status");
  panel.appendChild(status);
  const footer=node("div","voice-studio-footer");
  footer.appendChild(createButton("⏹ Остановить",stop,"voice-action secondary"));
  footer.appendChild(createButton("✓ Готово",closeStudio,"voice-action primary"));
  panel.appendChild(footer);
  panel.appendChild(node("p","voice-studio-disclaimer","Сейчас голоса произносит устройство, а звуки и музыка созданы для Академии. Для настоящих актёрских голосов предусмотрена поддержка записанных реплик."));
  overlay.addEventListener("click",e=>{if(e.target===overlay)closeStudio()});
  overlay.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();closeStudio()}});
  document.body.appendChild(overlay);
  studio=overlay;
  refreshVoices();
  refreshStudioVoiceChoices();
  const focus=panel.querySelector(".voice-close");
  if(focus)focus.focus();
 }
 if(root.speechSynthesis){
  try{root.speechSynthesis.addEventListener("voiceschanged",refreshVoices)}catch(e){}
 }
 root.AcademyVoice={configure:config,speak,line,stop,setEnabled,openStudio,closeStudio,refreshVoices,cleanText,getVoices:()=>voices.slice(),voiceSupported};
})(window);
