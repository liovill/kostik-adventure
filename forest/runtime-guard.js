/* v43 boot diagnostics, self-contained and safe for offline/static hosting. */
(function(win,doc){
"use strict";
let ready=false,displayed=false;
const faults=[];
function note(value){
 if(faults.length<5)faults.push(String(value||"Неизвестная ошибка").slice(0,450));
}
function show(){
 if(ready||displayed||!doc.body)return;
 displayed=true;
 const cover=doc.createElement("section");
 cover.id="academy-boot-recovery";
 cover.setAttribute("role","alert");
 cover.style.cssText="position:fixed;z-index:99999;inset:0;background:#0c233deF;display:flex;align-items:center;justify-content:center;padding:20px;color:#fff;font:16px/1.5 system-ui,sans-serif";
 const card=doc.createElement("div");
 card.style.cssText="max-width:420px;width:100%;background:#1c3952;border:2px solid #f3de9d;border-radius:24px;padding:24px;box-shadow:0 18px 45px #0008";
 const heading=doc.createElement("h2");heading.textContent="🛠️ Игра пока не загрузилась";heading.style.cssText="font-size:24px;margin:0 0 9px";
 const text=doc.createElement("p");text.textContent="Не переживай, сохранённые достижения останутся. Попробуй открыть игру ещё раз.";text.style.cssText="margin:0 0 18px;color:#e2eff4";
 const retry=doc.createElement("button");retry.textContent="🔄 Загрузить снова";
 retry.style.cssText="border:0;background:#ffe19e;color:#273f52;border-radius:14px;padding:13px;font-size:16px;font-weight:800;width:100%;cursor:pointer";
 retry.onclick=()=>win.location.reload();
 const home=doc.createElement("a");home.href="./";home.textContent="🏰 На главную Академии";
 home.style.cssText="display:block;text-align:center;color:#fff;text-decoration:underline;margin-top:14px";
 const details=doc.createElement("details");details.style.cssText="margin-top:14px;font-size:12px;color:#dbe9ec;overflow-wrap:anywhere";
 const summary=doc.createElement("summary");summary.textContent="Информация для родителей";
 const p=doc.createElement("p");
 p.textContent="Сборка v43. "+(faults.length?faults.join(" | "):"Не получен сигнал готовности приложения. Проверь подключение и обнови страницу.");
 details.appendChild(summary);details.appendChild(p);
 card.appendChild(heading);card.appendChild(text);card.appendChild(retry);card.appendChild(home);card.appendChild(details);
 cover.appendChild(card);doc.body.appendChild(cover)
}
win.addEventListener("error",event=>{
 const target=event.target;
 if(target&&target!==win&&target.tagName==="SCRIPT")note("Не загружен файл: "+(target.src||"script"));
 else if(event.error||event.message)note(event.message||event.error);
 if(!ready&&doc.readyState==="complete")win.setTimeout(show,700)
},true);
win.addEventListener("unhandledrejection",event=>{
 note(event.reason&&event.reason.message||event.reason);
 if(!ready&&doc.readyState==="complete")win.setTimeout(show,700)
});
doc.addEventListener("DOMContentLoaded",()=>win.setTimeout(show,5000));
win.AcademyBoot={ready:()=>{ready=true;const existing=doc.getElementById("academy-boot-recovery");if(existing)existing.remove()},issues:()=>faults.slice()};
})(window,document);
