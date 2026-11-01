/* Decorative, deterministic parallax layers. No game state or collision changes. */
(function(root){
'use strict';
const TAU=Math.PI*2;
const mod=(x,n)=>((x%n)+n)%n;
function path(c,points,fill,stroke,width=1){c.beginPath();for(let i=0;i<points.length;i++)i?c.lineTo(points[i][0],points[i][1]):c.moveTo(points[i][0],points[i][1]);if(fill){c.closePath();c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function box(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke()}}
function ellipse(c,x,y,rx,ry,fill,stroke,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function glow(c,x,y,r,color,alpha=.2){c.save();c.globalAlpha*=alpha;let g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore()}
function tiles(c,w,step,scroll,fn){let first=Math.floor(scroll/step)-1,last=Math.ceil((scroll+w)/step)+1;for(let i=first;i<=last;i++)fn(i*step-scroll,i)}
function cable(c,x,y,length,swing,color,width=4){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-swing,y+length*.25,x+swing,y+length*.7,x-swing*.4,y+length);c.stroke()}
function arch(c,x,y,w,h,color,line){c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+w*.48);c.bezierCurveTo(x,y-w*.16,x+w,y-w*.16,x+w,y+w*.48);c.lineTo(x+w,y+h);if(color){c.fillStyle=color;c.fill()}if(line){c.strokeStyle=line;c.lineWidth=5;c.stroke()}}
function cog(c,x,y,r,rotation,color){c.save();c.translate(x,y);c.rotate(rotation);c.strokeStyle=color;c.lineWidth=r*.24;c.beginPath();c.arc(0,0,r*.68,0,TAU);c.stroke();for(let j=0;j<10;j++){c.rotate(TAU/10);c.fillStyle=color;c.fillRect(-r*.10,-r,r*.20,r*.33)}ellipse(c,0,0,r*.2,r*.2,color);c.restore()}
function tank(c,x,y,w,h,t){
 box(c,x,y,w,h,Math.min(w*.45,23),'#08273799','#82c9cb3a');
 let fluid=c.createLinearGradient(x,y,x+w,y);fluid.addColorStop(0,'#62e7cf07');fluid.addColorStop(.5,'#5ee8d72b');fluid.addColorStop(1,'#63c6ce0b');
 box(c,x+5,y+22,w-10,h-43,12,fluid);box(c,x-7,y-6,w+14,19,6,'#193440c9','#7bb1b52b');box(c,x-7,y+h-13,w+14,19,6,'#193440c9','#7bb1b52b');
 for(let j=0;j<4;j++)ellipse(c,x+w*(.25+.15*(j%3)),y+24+mod(j*53-t*15,h-55),2+j%2,2+j%2,null,'#a3f8e445',1);
 path(c,[[x+w*.26,y+29],[x+w*.26,y+h-37]],null,'#b8fff121',2);
}
function lab(c,v){let{w,h,sx,sy,t}=v;
 tiles(c,w,310,sx*.20,(x,i)=>{
  let y=-30-sy*.07;arch(c,x+27,y+75,222,h+110,'#071b2a39','#457c8833');
  box(c,x+8,y-20,25,h+190,8,'#102a37aa','#69909b24');
  for(let j=0;j<7;j++){box(c,x+5,y+j*94,31,11,3,'#34505c77');ellipse(c,x+12,y+j*94+5,1.8,1.8,'#8fa9a64a');ellipse(c,x+29,y+j*94+5,1.8,1.8,'#8fa9a64a')}
  tank(c,x+83,y+95+(i%2)*160,70,Math.max(190,h*.42),t+i);
  let pipeX=x+211;cable(c,pipeX,y+5,h+100,20,'#102632bb',14);cable(c,pipeX-4,y+5,h+100,20,'#91adac19',2);
  for(let j=0;j<3;j++){let yy=y+70+j*210;box(c,x+193,yy,29,37,6,'#253b4377');ellipse(c,x+208,yy+18,8,8,'#122a34','#648f9640');path(c,[[x+208,yy+18],[x+214,yy+12]],null,'#c4cba13d',1.5)}
  glow(c,x+57,y+55,66,'#68daca',.18);box(c,x+47,y+47,20,5,3,'#b3eee56e');
 });
 tiles(c,w,380,sx*.10,(x,i)=>{let y=h*.40-sy*.035+(i%2)*55;cable(c,x+40,-50,y+65,85,'#06182671',5);box(c,x+15,y,54,20,5,'#1d384966');box(c,x+25,y+6,34,5,3,'#c7b0743b');glow(c,x+42,y+14,65,'#e4ba6b',.12)});
}
function forest(c,v){let{w,h,sx,sy,t}=v;
 tiles(c,w,215,sx*.13,(x,i)=>{let y=-75-sy*.045;let bend=Math.sin(i*2.7)*38;
  c.strokeStyle='#143b3b9c';c.lineWidth=36+i%3*9;c.beginPath();c.moveTo(x+85,h+100);c.bezierCurveTo(x+70+bend,h*.68,x+125-bend,h*.36,x+77,y);c.stroke();
  c.strokeStyle='#68827625';c.lineWidth=3;c.beginPath();c.moveTo(x+78,h+40);c.bezierCurveTo(x+53,h*.63,x+110,h*.34,x+69,y);c.stroke();
  for(let j=0;j<3;j++){let yy=h*.24+j*h*.25;c.strokeStyle='#204a4488';c.lineWidth=11;c.beginPath();c.moveTo(x+90,yy+35);c.quadraticCurveTo(x+20,yy-10,x-50,yy-15);c.stroke();ellipse(c,x+25,yy-20,80,23,'#30584939');ellipse(c,x+110,yy-5,85,24,'#30584935')}
  cable(c,x+164,-30,h*.72,20,'#7190712b',3);for(let j=0;j<7;j++){let yy=j*67+20;ellipse(c,x+157+Math.sin(j+i)*8,yy,11,5,'#78af8935')}
 });
 tiles(c,w,170,sx*.21,(x,i)=>{let yy=h*.82+Math.sin(i*2)*80-sy*.06;path(c,[[x+10,yy+60],[x+18,yy-13]],null,'#637e7e38',10);ellipse(c,x+19,yy-15,40,16,'#9e85ba3d');glow(c,x+19,yy-10,66,'#aa87de',.11)});
 for(let j=0;j<16;j++){let x=mod(j*107-sx*.08+Math.sin(t*.5+j)*8,w),y=mod(j*73+t*6,h);glow(c,x,y,9,'#c6f39a',.17);ellipse(c,x,y,1.5,1.5,'#b4e29a5c')}
}
function dinosaur(c,v){let{w,h,sx,sy,t}=v;
 tiles(c,w,350,sx*.10,(x,i)=>{let top=-50+Math.sin(i*3.2)*90-sy*.025;path(c,[[x-60,h+60],[x-25,top+150],[x+30,top+50],[x+100,top],[x+146,top+80],[x+210,top+25],[x+275,top+180],[x+330,h+60]],'#3c435c64');path(c,[[x+105,top+20],[x+82,top+180],[x+118,top+370],[x+72,h]],null,'#c2ab9a13',4)});
 tiles(c,w,220,sx*.18,(x,i)=>{let yy=h*.83+Math.sin(i*2)*35-sy*.04;path(c,[[x+110,yy+80],[x+109,yy-230]],null,'#324f4b88',7);for(let j=0;j<7;j++){let y=yy-j*32;c.strokeStyle='#3d695246';c.lineWidth=4;c.beginPath();c.moveTo(x+110,y);c.quadraticCurveTo(x+35,y-55,x+18,y-18);c.moveTo(x+110,y);c.quadraticCurveTo(x+185,y-55,x+196,y-18);c.stroke()}
  if(mod(i,3)===1){c.strokeStyle='#c7b49b24';c.lineWidth=9;c.beginPath();c.arc(x+25,yy-80,45,Math.PI*.85,Math.PI*1.85);c.stroke();path(c,[[x-8,yy-80],[x+6,yy-29],[x+20,yy-20]],null,'#c7b49b24',7)}
 });
}
function ocean(c,v){let{w,h,sx,sy,t}=v;
 tiles(c,w,305,sx*.13,(x,i)=>{arch(c,x+30,-40-sy*.035,208,h+120,'#102e4666','#5b8c9d38');box(c,x+10,-30,32,h+110,9,'#22465a5b');for(let j=0;j<4;j++)box(c,x+6,70+j*180,40,12,5,'#69909d22');
  let root=h+40-sy*.03;for(let j=0;j<4;j++){let xx=x+50+j*45,hh=h*.35+(j%2)*120;cable(c,xx,root-hh,hh,35+Math.sin(t*.5+j)*4,'#397c7c45',6+j%3);for(let k=0;k<3;k++)ellipse(c,xx+Math.sin(k+j)*18,root-hh+k*80,18,5,'#5aaf9f21')}
 });
 for(let j=0;j<20;j++){let x=mod(j*131-sx*.07+Math.sin(t*.4+j)*10,w),y=h-mod(t*17+j*73,h);ellipse(c,x,y,2+j%4,2+j%4,null,'#a6e4ea36',1)}
 tiles(c,w,390,sx*.06,(x,i)=>{let y=h*.25+Math.sin(i)*80;ellipse(c,x+85,y,22,6,'#09324455');path(c,[[x+105,y],[x+117,y-8],[x+117,y+8]],'#09324455')});
}
function ice(c,v){let{w,h,sx,sy,t}=v;
 tiles(c,w,180,sx*.14,(x,i)=>{let len=h*.27+mod(i*83,170),y=-30-sy*.05;path(c,[[x-28,y],[x+90,y],[x+48,y+len]],'#6e9fb73d','#b9e4ed20',2);path(c,[[x+25,y],[x+48,y+len],[x+55,y]],'#d2f1f810');let by=h+45;path(c,[[x-20,by],[x+105,by],[x+51,by-len*.8]],'#42677c5c');path(c,[[x+51,by-len*.8],[x+31,by],[x+55,by]],'#c1e9f41b');
  if(i%2===0){let yy=h*.44;path(c,[[x+10,yy+100],[x+45,yy-60],[x+82,yy+75],[x+60,yy+170]],'#91bac627','#caf6ff21',1);glow(c,x+45,yy+25,75,'#b5efff',.10)}
 });
 for(let j=0;j<28;j++){let x=mod(j*79-sx*.04+t*3,w),y=mod(j*93+t*11,h);ellipse(c,x,y,1+j%2,1+j%2,'#d7eff340')}
}
function volcano(c,v){let{w,h,sx,sy,t}=v;
 tiles(c,w,290,sx*.12,(x,i)=>{let yy=-65+Math.sin(i*7)*85-sy*.03;path(c,[[x-90,h+80],[x-20,yy+140],[x+60,yy],[x+122,yy+92],[x+193,yy+40],[x+290,h+80]],'#302d3c86');
  c.save();c.globalAlpha*=.45;path(c,[[x+60,yy+55],[x+44,yy+172],[x+73,yy+221],[x+45,yy+330]],null,'#e3976a45',3);c.restore();glow(c,x+63,h*.74,85,'#e9834c',.08)
 });
 for(let j=0;j<17;j++){let x=mod(j*143-sx*.06+Math.sin(t*.6+j)*13,w),y=h-mod(t*(11+j%3*5)+j*57,h);ellipse(c,x,y,1.2+j%2,1.2+j%2,'#e7b07145')}
}
function factory(c,v){let{w,h,sx,sy,t}=v;
 tiles(c,w,270,sx*.17,(x,i)=>{let y=-45-sy*.06;box(c,x+9,y,30,h+130,4,'#263a4699','#6b84942b');for(let j=0;j<5;j++){let yy=y+35+j*145;box(c,x+8,yy,32,9,2,'#63798433');box(c,x+58,yy+10,114,77,8,'#12253155','#79939a27');for(let k=0;k<4;k++)path(c,[[x+70+k*25,yy+20],[x+70+k*25,yy+76]],null,'#a2aca720',4)}
  cable(c,x+220,y,h+120,8,'#17313eaa',24);cable(c,x+214,y,h+120,8,'#86aaad23',3);cog(c,x+105,y+h*.34,63,t*.08*(i%2?1:-1),'#85939131');cog(c,x+198,y+h*.43,46,-t*.11,'#8e989426');
  let yy=y+h*.72;box(c,x+62,yy,117,48,7,'#19303e99','#929d8c22');for(let j=0;j<3;j++)box(c,x+78+j*27,yy+14,13,18,3,j===mod(i,3)?'#d4b96c4c':'#76baba22');
 });
}
function space(c,v){let{w,h,sx,sy,t}=v;
 tiles(c,w,360,sx*.13,(x,i)=>{let y=-40-sy*.035;path(c,[[x-20,y],[x+54,y+h*.30],[x+48,y+h*.72],[x-20,y+h+100]],null,'#3d4e6a77',24);path(c,[[x+322,y],[x+255,y+h*.30],[x+260,y+h*.72],[x+322,y+h+100]],null,'#3d4e6a77',24);box(c,x+67,y+h*.19,175,h*.58,63,'#08172f33','#94a0c32b');
  for(let j=0;j<5;j++)box(c,x+30,y+65+j*135,25,5,3,'#accfe13d');cable(c,x+295,y,h+110,14,'#0d213685',10);
 });
 let px=w*.69-mod(sx*.025,w+400)+100,py=h*.28-sy*.02;ellipse(c,px,py,90,90,'#7993ba18','#c0c8e31a');c.save();c.translate(px,py);c.rotate(-.3);ellipse(c,0,0,140,26,null,'#c1c7e020',5);c.restore();
 for(let j=0;j<30;j++)ellipse(c,mod(j*137-sx*.03,w),mod(j*71-sy*.015,h),j%4===0?1.6:.8,j%4===0?1.6:.8,'#e1e9ff3c');
}
function castle(c,v){let{w,h,sx,sy,t}=v;
 tiles(c,w,255,sx*.14,(x,i)=>{let y=-30-sy*.04;arch(c,x+30,y+65,180,h+160,'#1a203c66','#9b83b634');arch(c,x+71,y+114,97,Math.max(210,h*.5),'#0b173766','#bf9ccc24');
  box(c,x+6,y,24,h+150,3,'#42405a59');for(let j=0;j<7;j++)box(c,x+3,y+j*110,30,10,2,'#a094b51b');
  let cx=x+205;cable(c,cx,y,h*.62,1,'#7e748d3d',3);for(let j=0;j<6;j++)ellipse(c,cx,y+20+j*57,5,11,null,'#9a8ca42b',2);
  let yy=h*.44+(i%2)*90;box(c,x+12,yy+12,17,25,4,'#57465e66');glow(c,x+21,yy+3,60,'#d49ed9',.14);ellipse(c,x+21,yy+3,5,12,'#d6a3dc42')
 });
}
function shafts(c,v){let{w,h,sx,t}=v;c.save();c.globalCompositeOperation='screen';tiles(c,w,450,sx*.06,(x,i)=>{let drift=Math.sin(t*.1+i)*12;let g=c.createLinearGradient(x+70,0,x+170,h);g.addColorStop(0,'#8de8ea0d');g.addColorStop(1,'#8de8ea00');path(c,[[x+65+drift,0],[x+95+drift,0],[x+310,h],[x+70,h]],g)});c.restore()}
function draw(ctx,opts={}){
 let scale=Math.max(.1,opts.scale||1),v={w:opts.width/scale,h:opts.height/scale,sx:opts.camX||0,sy:opts.camY||0,t:opts.time||0};if(!Number.isFinite(v.w)||!Number.isFinite(v.h)||v.w<=0||v.h<=0)return;
 let world=mod(Math.floor(opts.world||0),10);ctx.save();ctx.scale(scale,scale);ctx.globalAlpha*=.73;
 // Never draw over a parent foreground: these translucent layers belong directly after its image.
 [lab,forest,dinosaur,ocean,ice,volcano,factory,space,castle,(c,q)=>{lab(c,q);c.save();c.globalAlpha*=.47;space(c,q);c.restore()}][world](ctx,v);shafts(ctx,v);
 let fog=ctx.createLinearGradient(0,v.h*.55,0,v.h);fog.addColorStop(0,'#9fd6df00');fog.addColorStop(.75,'#9fd6df05');fog.addColorStop(1,'#12243200');ctx.fillStyle=fog;ctx.fillRect(0,v.h*.55,v.w,v.h*.45);ctx.restore();
}
function drawForeground(ctx,opts={}){
 let scale=Math.max(.1,opts.scale||1),w=opts.width/scale,h=opts.height/scale,t=opts.time||0,sx=opts.camX||0,world=mod(opts.world||0,10);if(!Number.isFinite(w)||!Number.isFinite(h))return;
 ctx.save();ctx.scale(scale,scale);ctx.globalAlpha*=.20;
 // Silhouettes occupy only the bottom 5% / outermost 3%, away from gameplay and touch controls.
 if([0,3,6,7,8,9].includes(world)){let dx=mod(sx*.4,90);path(ctx,[[-12,h+18],[-12,h-20],[30-dx*.08,h-20],[45,h+18]],'#061425');path(ctx,[[w+10,h+20],[w+10,h-35],[w-23,h-35],[w-40,h+20]],'#061425')}
 else{for(let side of [0,1]){let x=side?w+4:-4;ctx.strokeStyle='#061827';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x,h+15);ctx.quadraticCurveTo(x+(side?-18:18),h-20,x+(side?-28:28),h-44+Math.sin(t*.35)*2);ctx.stroke()}}
 ctx.restore();
}
const api={draw,drawForeground};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GooAtmosphere=api;
})(typeof globalThis!=='undefined'?globalThis:this);
