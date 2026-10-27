// Original procedural pixel art: silhouette polygons, mechanical joints and
// layered resin plates rendered on a 2px grid, with no external assets.
const poly=(c,pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
function cog(c,x,y,r,angle,col='#d7a961'){c.save();c.translate(x,y);c.rotate(angle);for(let i=0;i<12;i++){c.rotate(Math.PI/6);c.fillStyle=col;c.fillRect(r-5,-4,10,8);}c.fillStyle=col;c.beginPath();c.arc(0,0,r,0,7);c.fill();c.fillStyle='#142e40';c.beginPath();c.arc(0,0,r*.45,0,7);c.fill();c.restore();}
function dragon(c,b,t){
 c.save();c.translate(Math.round(b.x/2)*2,b.y);const down=b.done?22:Math.sin(t*5)*2;c.translate(0,down);const sway=b.done?0:Math.sin(t*2)*6,wing=b.done?20:Math.sin(t*3)*16;
 // Back wing and articulated tail establish the silhouette before armor.
 poly(c,[[-25,-150],[90,-300],[160,-325],[144,-220],[240,-160],[130,-175],[95,-120]],'#283d59');
 poly(c,[[-15,-146],[90,-282],[132,-300],[118,-213],[210,-167],[110,-190],[74,-124]],'#648d9d');
 poly(c,[[30,-80],[140,-90],[220,-65],[290,-110],[320,-95],[260,-35],[170,-35],[65,-30]],'#2b465b');
 for(let i=0;i<8;i++){const x=100+i*24,y=-65+Math.sin(t*2-i*.4)*(b.done?0:10);c.fillStyle=i%2?'#93b9b7':'#638999';c.fillRect(x,y,22,17);c.fillStyle='#19384b';c.fillRect(x+6,y+5,8,6);}
 poly(c,[[-100,-45],[-115,-5],[-150,0],[-155,-16],[-135,-25],[-130,-90],[-85,-100]],'#799ea4');
 poly(c,[[55,-85],[105,-65],[95,-22],[130,-10],[130,0],[75,0],[65,-35],[25,-52]],'#8dafa9');
 for(const x of [-145,-128,95,112])poly(c,[[x,-14],[x+12,-5],[x+9,2],[x-8,2]],'#e5d4a4');
 poly(c,[[-100,-65],[-114,-130],[-66,-185],[20,-190],[93,-149],[105,-75],[56,-35],[-40,-32]],'#20394d');
 poly(c,[[-96,-75],[-100,-126],[-60,-172],[16,-177],[80,-140],[88,-78],[48,-48],[-38,-46]],b.invul>0?'#fff1c4':'#abcac1');
 for(let y=-160;y<-55;y+=8){c.fillStyle=y%16?'#7caaa9':'#c5dcd0';c.fillRect(-65,y,125,3);}
 // Neck: separated armor vertebrae with moving actuator gaps.
 for(let i=0;i<5;i++){const x=-82-i*13,y=-130-i*14+sway;c.fillStyle='#223b50';c.fillRect(x-23,y-17,48,33);c.fillStyle='#80a8ac';c.fillRect(x-20,y-14,40,24);c.fillStyle='#c5d7ca';c.fillRect(x-18,y-13,35,4);}
 c.save();c.translate(-143,-198+sway);
 poly(c,[[5,12],[-35,12],[-64,-1],[-75,-23],[-49,-30],[-31,-52],[4,-46],[26,-20],[22,8]],'#233d52');
 poly(c,[[4,4],[-32,4],[-60,-5],[-65,-20],[-41,-23],[-28,-42],[0,-37],[17,-18],[15,2]],b.invul>0?'#fff2ce':'#b1d0c5');
 poly(c,[[-29,-38],[-40,-70],[-16,-49]],'#e9dab5');poly(c,[[3,-32],[15,-61],[17,-26]],'#cbbd9c');
 c.fillStyle=b.done?'#364b58':'#ffbd6b';c.fillRect(-29,-24,18,8);c.fillStyle='#fff3cd';if(!b.done)c.fillRect(-24,-24,7,4);
 c.fillStyle='#183647';c.fillRect(-58,-12,32,5);for(let x=-57;x<-27;x+=10){poly(c,[[x,-7],[x+5,-7],[x+2,2]],'#fff2cf');}c.restore();
 // Forewing bones and membrane change pose continuously.
 poly(c,[[15,-145],[55,-240-wing],[128,-283-wing],[118,-201],[195,-148],[100,-166],[63,-112]],'#244458');
 poly(c,[[27,-148],[65,-230-wing],[112,-260-wing],[102,-194],[162,-157],[95,-181],[65,-130]],'#dfad76');
 c.strokeStyle='#e7d3a6';c.lineWidth=5;c.beginPath();c.moveTo(20,-143);c.lineTo(61,-236-wing);c.lineTo(120,-275-wing);c.moveTo(61,-236-wing);c.lineTo(100,-180);c.lineTo(173,-154);c.stroke();
 for(const [x,y] of [[-70,-65],[65,-70],[15,-145]]){c.fillStyle='#19394b';c.fillRect(x-12,y-12,24,24);c.fillStyle='#efbc76';c.fillRect(x-5,y-5,10,10);}
 if(b.phase>=2){poly(c,[[-20,-170],[10,-145],[-10,-125],[30,-100],[0,-70],[-40,-85],[-20,-120]],'#172d40');for(let i=0;i<4;i++){c.fillStyle='#e28b62';c.fillRect(-22+i*10,-140+i*17,14,5);}}
 c.fillStyle=b.done?'#3d6270':b.cooled?'#abffde':'#fc8d65';c.fillRect(-20,-119,36,35);c.fillStyle='#fff4d3';c.fillRect(-10,-110,16,16);c.restore();
}
function label(c,x,y,text,color='#e8f2e7'){c.font='bold 13px sans-serif';c.textAlign='center';c.fillStyle='#102335e8';c.fillRect(x-115,y-17,230,25);c.fillStyle=color;c.fillText(text,x,y);}
function spool(c,e){c.save();c.translate(e.x+24,e.y+24);c.rotate(e.x/24);for(const [r,col] of [[25,'#162c3c'],[22,'#c4dbd6'],[18,'#c68060'],[15,'#f3ad78'],[11,'#a46b53'],[7,'#293e4a']]){c.fillStyle=col;c.beginPath();c.arc(0,0,r,0,7);c.fill();}c.fillStyle='#e5d8b9';for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.fillRect(9,-3,10,6);}c.restore();}
function head(c,x,y,hot=false){c.fillStyle='#708e9e';c.fillRect(x-20,y-60,8,58);c.fillRect(x+30,y-60,8,58);c.fillStyle='#bcd0d0';c.fillRect(x-18,y-12,76,40);c.fillStyle='#223c50';c.fillRect(x-10,y-5,58,23);c.fillStyle=hot?'#ff7460':'#86efd2';c.fillRect(x+2,y+1,32,8);poly(c,[[x+5,y+28],[x+35,y+28],[x+22,y+48]],'#e1aa73');}
export function drawPrinter(c,g){const s=g.printer;if(!s)return;const b=s.boss,t=g.time;c.save();
 for(const area of g.level.sections){c.fillStyle='#6d9aab';c.font='bold 18px monospace';c.textAlign='left';c.fillText(area.name,area.x+70,90);}
 const on=id=>g.level.relays.find(r=>r.id===id).on;
 // Visible mechanical transmission: one mesh reverses the output, ratio 24:48.
 cog(c,1810,360,32,on('drive')?t*2:0);cog(c,1906,360,64,on('drive')?-t:0,'#7fabae');
 c.strokeStyle='#87afa9';c.lineWidth=9;c.beginPath();c.moveTo(840,420);c.lineTo(1000,300);c.lineTo(1160,300);c.stroke();
 for(let x=850;x<1140;x+=45)cog(c,x,320,12,on('feed')?t*3:0);
 for(const part of g.level.printerParts)if(part.state==='loose'){if(part.id==='gear')cog(c,part.x,part.y,18,t);else{c.fillStyle='#d5b378';c.fillRect(part.x-15,part.y-16,30,32);}label(c,part.x,part.y-30,part.id==='gear'?'運べる 24歯ギア':'代替の重り');}
 if(s.carried){cog(c,g.player.x+14,g.player.y-18,12,t);}
 for(const o of g.level.printerControls){if(Math.abs(o.x-g.player.x)>1400)continue;const enabled=['fan1','fan2'].includes(o.id)?s.fans[o.id==='fan1'?0:1]:false;c.fillStyle=enabled?'#79e3bf':'#577a91';c.fillRect(o.x-22,o.y-15,44,40);c.fillStyle='#132a3e';c.fillRect(o.x-16,o.y-9,32,18);c.fillStyle='#f3ca86';c.fillRect(o.x-3,o.y-5,6,10);label(c,o.id==='medic'?o.x+45:o.x,o.y-29,o.label);}
 for(const x of [4280,4480,6290]){c.save();c.translate(x,x===4280?205:100);c.strokeStyle='#78a6ae';c.lineWidth=4;c.strokeRect(-34,-34,68,68);c.rotate(t*(x===6290?b.cooled:s.fans[x===4280?0:1]) *4);for(let i=0;i<4;i++){c.rotate(Math.PI/2);poly(c,[[0,0],[10,-25],[27,-25],[19,-3]],'#9bc4bd');}c.restore();}
 for(const [i,p] of g.level.platforms.filter(p=>p.printerPrint!==undefined).entries()){const v=s.prints[i];c.fillStyle='#f3b27f';for(let k=0;k<Math.floor(v*9);k++)c.fillRect(p.x,p.y+20-k*3,p.w,2);if(s.target===i&&s.printing){head(c,p.x+(Math.sin(t*6)*.5+.5)*p.w,p.y-55-v*20,true);}}
 if(s.incident&&!s.safety){c.fillStyle='#e57758';for(let i=0;i<12;i++)c.fillRect(3200+i*7,510-i*16,110,10);label(c,3180,220,'供給暴走 · 中層スイッチへ','#ffb67b');}
 for(const e of s.foes){if(!e.alive)continue;if(e.kind==='spool')spool(c,e);else if(e.kind==='head'){head(c,e.x,e.y,e.warning);if(e.warning){c.fillStyle='#ff665433';c.fillRect(e.x, e.y+40,40,470-e.y);}}else{c.strokeStyle=e.disabled?'#53697a':'#e6ac80';c.lineWidth=4;c.beginPath();for(let i=0;i<45;i++){const x=e.x+20+Math.sin(i*1.7+t)*22,y=e.y+e.h-i/45*e.h;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}}
 // Door remains physically clamped while fighting.
 c.fillStyle=b.active&&!b.done?'#ba7661':'#416779';c.fillRect(5390,b.active&&!b.done?100:0,20,b.active&&!b.done?410:90);
 if(b.active){
  c.fillStyle='#102537';c.fillRect(5500,70,1000,22);c.fillStyle=b.phase===3?'#88e3d0':'#edac7c';c.fillRect(5504,74,992*(b.phase===3?b.frame:b.hp/18),14);label(c,6000,60,`DRAGON-01 · PHASE ${b.phase} · ${b.phase===3?'拘束 '+Math.round(b.frame*100)+'%':b.hp+' / 18'}`);
  c.fillStyle='#355362';c.fillRect(5480,520,1080,40);for(let x=5490;x<6560;x+=35){c.fillStyle='#e7b875';c.fillRect(x,523,18,5);}c.fillStyle='#dfbe7244';c.fillRect(5780,507,440,5);
  if(b.age<9){const top=510-360*Math.min(1,b.age/8);c.save();c.beginPath();c.rect(5450,top,1130,520-top);c.clip();dragon(c,b,0);c.fillStyle='#fff2c2';for(let y=top;y<510;y+=5)c.fillRect(b.x-150,y,280,1);c.restore();head(c,b.x+Math.sin(t*9)*170,top-55,true);c.strokeStyle='#ffb36a';c.lineWidth=3;c.beginPath();c.moveTo(b.x-150,top);c.lineTo(b.x+150,top);c.stroke();label(c,6000,125,`造形 ${Math.min(100,Math.floor(b.age/9*100))}% · DRAGON-01`);}
  else dragon(c,b,t);
  if(b.warning){label(c,b.x,130,b.warning,'#ffce8e');c.fillStyle='#ff665433';c.fillRect(b.target-70,496,140,14);}
  for(const job of b.jobs){head(c,job.x,330,true);c.fillStyle='#f0ba83';for(let i=0;i<Math.floor(job.progress*10);i++)c.fillRect(job.x-20,505-i*4,40,3);label(c,job.x,370,'造形中：パルスで阻止');}
  for(const e of b.minions)if(e.alive){if(e.kind==='mini'){c.save();c.translate(e.x,e.y+40);c.scale(.16,.16);dragon(c,{...b,x:0,y:0,phase:1},t);c.restore();}else if(e.kind==='turret'){head(c,e.x,e.y,false);}else{c.strokeStyle='#efb97d';c.lineWidth=4;c.beginPath();for(let i=0;i<20;i++)c.lineTo(e.x+20+Math.sin(i+t)*20,e.y+i*2);c.stroke();}}
  if(b.centerLatch&&!b.route)label(c,6000,480,'重量ロック '+Math.ceil(b.centerLatch)+'秒','#ffe0a6');
  if(b.frame>0){c.fillStyle=b.cooled?'#98e9d1':'#eeb87d';const height=220*b.frame;for(let y=510;y>510-height;y-=7){c.fillRect(b.x-190,y,18,4);c.fillRect(b.x+165,y,18,4);if(y<510-height+8)c.fillRect(b.x-190,y,373,5);}head(c,b.x+Math.sin(t*5)*190,460-height,true);}
  if(b.done)label(c,6000,135,'SYSTEM RESTORED','#97ffcf');
 }
 for(const q of s.bolts){c.fillStyle='#ff9a60';c.fillRect(q.x,q.y,q.w,q.h);c.fillStyle='#ffe2ac';c.fillRect(q.x+3,q.y+3,q.w-6,4);}c.restore();
}
