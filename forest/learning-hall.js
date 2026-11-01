
"use strict";
/* Academy v2.3: short, generative learning sessions. */
let hallMode="intro",hallOwner=null,hallLesson=null,hallTask=null,hallAnswered=false;
function hallProfile(hero){return state.hall.heroes[hero||state.active||"kostya"]}
function hallStars(hero){const p=hallProfile(hero);return Object.values(p.subjects).reduce((a,b)=>a+b,0)+Object.keys(p.traceAwards).filter(k=>p.traceAwards[k]).length+p.pairAwards.length*4}
function hallFamilyStars(){return hallStars("kostya")+hallStars("kirill")}
function hallResetForHero(){hallMode="intro";hallOwner=null;hallLesson=null;hallTask=null;hallAnswered=false;if(typeof hallWorkshopCurrent!=="undefined")hallWorkshopCurrent=null}
function hallSection(mode){hallMode=mode;const views={intro:"hallIntro",lesson:"hallLesson",complete:"hallComplete",trace:"hallTrace",pairs:"hallPairs",workshop:"hallWorkshop"};for(const key of Object.values(views))$(key).classList.toggle("hidden",key!==views[mode])}
function hallRender(){
 if(hallOwner!==state.active){hallResetForHero();hallOwner=state.active}
 $("hallHero").innerHTML=avatar(state.active);
 $("hallWelcome").textContent=state.active==="kostya"?"Выбирай башню знаний, разгадывай загадки и готовься к новым путешествиям!":"Играй вместе со взрослым. Выбирай картинки, узнавай животных и открывай волшебные цвета!";
 $("hallTotalXP").textContent="⭐ "+hallStars()+" звёзд знаний";
 const root=$("hallSubjects");root.innerHTML="";
 for(const subject of HALL_SUBJECTS){
  const btn=document.createElement("button");btn.className="hall-subject";btn.style.setProperty("--accent",subject.tone);
  const icon=document.createElement("span");icon.className="sub-icon";icon.textContent=subject.icon;
  const content=document.createElement("span");const title=document.createElement("strong");title.textContent=state.active==="kirill"?({math:"Ищем одинаковое",letters:"Картинки",logic:"Цвета и формы",nature:"Мир вокруг"}[subject.id]||subject.name):subject.name;const sub=document.createElement("small");sub.textContent=state.active==="kirill"?"Трогай большие картинки":subject.desc;const progress=document.createElement("span");progress.className="subject-progress";progress.textContent="⭐ "+hallProfile().subjects[subject.id]+" выполненных заданий";
  content.appendChild(title);content.appendChild(sub);content.appendChild(progress);btn.appendChild(icon);btn.appendChild(content);btn.onclick=()=>hallStartLesson(subject.id);root.appendChild(btn)
 }
 hallSection(hallMode);
 if(hallMode==="lesson"&&hallLesson){if(hallAnswered){if(hallLesson.step===4)hallCompleteLesson();else{hallLesson.step++;hallDrawLesson()}}else hallDrawLesson()}
 if(hallMode==="trace"&&typeof hallShowTrace==="function")hallShowTrace();
 if(hallMode==="pairs"&&typeof hallShowPairs==="function")hallShowPairs();
 if(hallMode==="workshop"&&typeof hallWorkshopRender==="function")hallWorkshopRender();
}
function hallStartLesson(subject){
 const item=HALL_SUBJECTS.find(s=>s.id===subject);if(!item)return;
 hallLesson={subject,step:0,earned:0};hallSection("lesson");hallDrawLesson();
 if(state.settings.voice)speak("Начинаем урок. "+item.name+". "+hallTask.say)
}
function hallDrawLesson(){
 if(!hallLesson)return;
 hallAnswered=false;
 const sub=HALL_SUBJECTS.find(s=>s.id===hallLesson.subject),count=hallProfile().subjects[sub.id];
 hallTask=generateHallTask(state.active,sub.id,count);
 $("hallLessonSubject").textContent=sub.icon+" "+(state.active==="kirill"?({math:"Группы предметов",letters:"Картинки",logic:"Цвета и формы",nature:"Мир вокруг"}[sub.id]||sub.name):sub.name);
 $("hallLessonStep").textContent="Задание "+(hallLesson.step+1)+" из 5";
 $("hallLessonBest").textContent="⭐ Выполнено: "+count;
 $("hallLessonProgress").style.width=(hallLesson.step*20)+"%";
 $("hallStageIcon").textContent=sub.icon;
 $("hallQuestion").textContent=hallTask.q;
 $("hallQuestionHint").textContent=state.active==="kirill"?"Нажми на такую же картинку. Можно вместе со взрослым!":"Подумай и выбери один правильный ответ";
 $("hallVisual").textContent=hallTask.visual||"";
 $("hallFeedback").textContent="";
 $("hallContinue").classList.add("hidden");
 const choices=$("hallAnswers");choices.innerHTML="";choices.classList.toggle("baby-mode",state.active==="kirill");
 for(const value of hallTask.options){
  const btn=document.createElement("button");btn.className="hall-answer"+(String(value).length>3?" word":"")+(state.active==="kirill"?" baby":"");
  btn.textContent=value;btn.onclick=()=>hallCheckAnswer(value,btn);choices.appendChild(btn)
 }
}
function hallCheckAnswer(value,btn){
 if(hallMode!=="lesson"||hallAnswered||!hallTask)return;
 if(String(value)!==hallTask.answer){
  btn.disabled=true;if(window.AcademySound)window.AcademySound.cue("try");btn.classList.add("wrong");$("hallFeedback").textContent="💛 Попробуй ещё! Ты обязательно справишься.";if(state.settings.voice)speak("Попробуй ещё.");return
 }
 hallAnswered=true;if(window.AcademySound)window.AcademySound.cue("good");btn.classList.add("correct");$("hallAnswers").querySelectorAll("button").forEach(b=>b.disabled=true);
 hallProfile().subjects[hallLesson.subject]+=1;hallLesson.earned++;save();
 $("hallFeedback").textContent="🌟 Молодец! Ещё одна звезда знаний!";
 $("hallTotalXP").textContent="⭐ "+hallStars()+" звёзд знаний";
 $("hallLessonProgress").style.width=((hallLesson.step+1)*20)+"%";
 const next=$("hallContinue");next.classList.remove("hidden");next.textContent=hallLesson.step===4?"🏆 Завершить урок":"Следующее задание ✨";
 next.onclick=()=>{
  if(hallLesson.step===4){hallCompleteLesson();return}
  hallLesson.step++;hallDrawLesson();if(state.settings.voice)speak(hallTask.say)
 };
 if(state.settings.voice)speak("Правильно! Молодец!")
}
function hallCompleteLesson(){
 if(!hallLesson)return;
 const sub=HALL_SUBJECTS.find(s=>s.id===hallLesson.subject);
 $("hallEarnedStars").textContent=hallLesson.earned;
 $("hallNewTotal").textContent=hallStars();
 $("hallFinishMessage").textContent=state.active==="kirill"?"Кирилл, ты здорово поиграл с картинками! Искрик гордится тобой.":NAMES[state.active]+", сегодня ты решил ещё пять заданий по теме «"+sub.name+"». Академия становится сильнее!";
 hallSection("complete");if(window.AcademySound)window.AcademySound.cue("medal");
 if(!state.settings.reduceMotion&&typeof confetti==="function")confetti();
 if(state.settings.voice)speak("Ура! Урок пройден!")
}
function hallBack(){hallLesson=null;hallTask=null;hallSection("intro");hallRender()}
function hallWire(){
 $("hallBackLesson").onclick=hallBack;$("hallFinishBack").onclick=hallBack;
 $("hallAgain").onclick=()=>hallStartLesson(hallLesson?hallLesson.subject:"math");
 $("hallSpeak").onclick=()=>{if(hallTask)speak(hallTask.say,true)};
 $("hallOpenTrace").onclick=()=>hallStartTrace();
 $("hallOpenPairs").onclick=()=>hallStartPairs();
 $("hallTraceBack").onclick=hallBack;$("hallPairsBack").onclick=hallBack
}
hallWire();
