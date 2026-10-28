import {drawDragon as dragon,dragonPose} from './dragon.mjs?v=4.5.2a';
import {drawNewPrinterFoes,drawBenchy} from './printer-enemies.mjs?v=4.5.2a';
import {drawPrinterGuides} from './printer-visual.mjs?v=4.5.2a';
// Original procedural pixel art: silhouette polygons, mechanical joints and
// layered resin plates rendered on a 2px grid, with no external assets.
const poly=(c,pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
function cog(c,x,y,r,angle,col='#d7a961'){c.save();c.translate(x,y);c.rotate(angle);for(let i=0;i<12;i++){c.rotate(Math.PI/6);c.fillStyle=col;c.fillRect(r-5,-4,10,8);}c.fillStyle=col;c.beginPath();c.arc(0,0,r,0,7);c.fill();c.fillStyle='#142e40';c.beginPath();c.arc(0,0,r*.45,0,7);c.fill();c.restore();}
function label(c,x,y,text,color='#e8f2e7'){c.font='bold 13px sans-serif';c.textAlign='center';c.fillStyle='#102335e8';c.fillRect(x-115,y-17,230,25);c.fillStyle=color;c.fillText(text,x,y);}
function spool(c,e){c.save();c.translate(e.x+24,e.y+24);c.rotate(e.x/24);for(const [r,col] of [[25,'#162c3c'],[22,'#c4dbd6'],[18,'#c68060'],[15,'#f3ad78'],[11,'#a46b53'],[7,'#293e4a']]){c.fillStyle=col;c.beginPath();c.arc(0,0,r,0,7);c.fill();}c.fillStyle='#e5d8b9';for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.fillRect(9,-3,10,6);}c.restore();}
function head(c,x,y,hot=false){c.fillStyle='#708e9e';c.fillRect(x-20,y-60,8,58);c.fillRect(x+30,y-60,8,58);c.fillStyle='#bcd0d0';c.fillRect(x-18,y-12,76,40);c.fillStyle='#223c50';c.fillRect(x-10,y-5,58,23);c.fillStyle=hot?'#ff7460':'#86efd2';c.fillRect(x+2,y+1,32,8);poly(c,[[x+5,y+28],[x+35,y+28],[x+22,y+48]],'#e1aa73');}
export function drawPrinter(c,g){const s=g.printer;if(!s)return;const b=s.boss,t=g.time;c.save();
 for(const area of []){c.fillStyle='#6d9aab';c.font='bold 18px monospace';c.textAlign='left';c.fillText(area.name,area.x+70,90);}
 const on=id=>g.level.relays.find(r=>r.id===id).on;
 // Visible mechanical transmission: one mesh reverses the output, ratio 24:48.
 cog(c,1810,360,32,on('drive')?t*2:0);cog(c,1906,360,64,on('drive')?-t:0,'#7fabae');
 c.strokeStyle='#87afa9';c.lineWidth=9;c.beginPath();c.moveTo(840,420);c.lineTo(1000,300);c.lineTo(1160,300);c.stroke();
 for(let x=850;x<1140;x+=45)cog(c,x,320,12,on('feed')?t*3:0);
 for(const part of g.level.printerParts)if(part.state==='loose'){if(part.id==='gear')cog(c,part.x,part.y,18,t);else{c.fillStyle='#d5b378';c.fillRect(part.x-15,part.y-16,30,32);}label(c,part.x,part.y-30,part.id==='gear'?'運べる 24歯ギア':'代替の重り');}
 if(s.carried){if(s.carried==='gear')cog(c,g.player.x+14,g.player.y-18,12,t);else{c.fillStyle='#d5b378';c.fillRect(g.player.x+2,g.player.y-30,24,24);}}
 for(const x of [4280,4480,6290]){c.save();c.translate(x,x===4280?205:100);c.strokeStyle='#78a6ae';c.lineWidth=4;c.strokeRect(-34,-34,68,68);c.rotate(t*(x===6290?b.cooled:s.fans[x===4280?0:1]) *4);for(let i=0;i<4;i++){c.rotate(Math.PI/2);poly(c,[[0,0],[10,-25],[27,-25],[19,-3]],'#9bc4bd');}c.restore();}
 for(const p of g.level.platforms.filter(p=>p.printerPrint!==undefined||p.printerPattern!==undefined)){
  const pattern=p.printerPattern??1,v=s.patterns[pattern];if(v>=1||(!v&&pattern!==s.pattern))continue;
  c.save();c.globalAlpha=pattern===s.pattern?.8:.3;c.strokeStyle='#efc799';c.lineWidth=2;c.setLineDash([4,6]);c.strokeRect(p.x,p.y,p.w,p.h);c.setLineDash([]);
  const height=Math.max(24,p.h);c.fillStyle='#f3b27f';for(let k=0;k<Math.floor(v*height/3);k++)c.fillRect(p.x,p.y+height-k*3,p.w,2);
  if(pattern===s.pattern&&s.printing)head(c,p.x+(Math.sin(t*6)*.5+.5)*p.w,p.y+height-v*height-48,true);c.restore();
 }

 if(s.incident&&!s.safety){c.fillStyle='#e57758';for(let i=0;i<12;i++)c.fillRect(3200+i*7,510-i*16,110,10);}
 for(const e of s.foes){if(!e.alive||e.room!==g.rooms?.active)continue;if(e.kind==='spool')spool(c,e);else if(e.kind==='head'){head(c,e.x,e.y,e.warning);if(e.warning){c.fillStyle='#ff665433';c.fillRect(e.x, e.y+40,40,470-e.y);}}else if(e.kind==='tangle'){c.strokeStyle=e.disabled?'#53697a':'#e6ac80';c.lineWidth=4;c.beginPath();for(let i=0;i<45;i++){const x=e.x+20+Math.sin(i*1.7+t)*22,y=e.y+e.h-i/45*e.h;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}}
 // Door remains physically clamped while fighting.
 c.fillStyle=b.active&&!b.done?'#ba7661':'#416779';c.fillRect(5390,b.active&&!b.done?100:0,20,b.active&&!b.done?410:90);
 if(b.active){
  c.fillStyle='#102537';c.fillRect(5500,70,1000,22);c.fillStyle=b.phase===3?'#88e3d0':'#edac7c';c.fillRect(5504,74,992*(b.phase===3?b.frame:b.hp/18),14);label(c,6000,60,`DRAGON-01 · PHASE ${b.phase} · ${b.phase===3?'拘束 '+Math.round(b.frame*100)+'%':b.hp+' / 18'}`);
  c.fillStyle='#355362';c.fillRect(5480,520,1080,40);for(let x=5490;x<6560;x+=35){c.fillStyle='#e7b875';c.fillRect(x,523,18,5);}c.fillStyle='#dfbe7244';c.fillRect(5780,507,440,5);
  dragon(c,b,t);
  if(b.age<9){const nodes=dragonPose(b),idx=Math.min(13,Math.floor(b.age/.4)),n=nodes[13-idx];head(c,n.x+Math.sin(t*12)*28,n.y-90,true);c.fillStyle='#ffcda2';for(let j=0;j<4;j++)c.fillRect(n.x-36,n.y+35-j*5,72,1);label(c,6000,125,`${Math.min(100,Math.floor(b.age/9*100))}%`);}
  else if(b.vulnerable&&!b.done){const n=dragonPose(b)[0];c.strokeStyle='#b3fff1';c.lineWidth=3;c.beginPath();c.arc(n.x,n.y,50,0,7);c.stroke();}
  if(b.warning){c.fillStyle='#ffd39b';c.font='bold 30px monospace';c.textAlign='center';c.fillText('!',b.x,220);c.fillStyle='#ff665433';c.fillRect(b.target-70,496,140,14);}
  for(const job of b.jobs){head(c,job.x,330,true);c.fillStyle='#f0ba83';for(let i=0;i<Math.floor(job.progress*10);i++)c.fillRect(job.x-20,505-i*4,40,3);}
  for(const e of b.minions)if(e.alive){if(e.kind==='benchy'){drawBenchy(c,e.x,e.y,64,t);}else if(e.kind==='mini'){c.save();c.translate(e.x,e.y+40);c.scale(.16,.16);dragon(c,{...b,x:0,y:0,phase:1},t);c.restore();}else if(e.kind==='turret'){head(c,e.x,e.y,false);}else{c.strokeStyle='#efb97d';c.lineWidth=4;c.beginPath();for(let i=0;i<20;i++)c.lineTo(e.x+20+Math.sin(i+t)*20,e.y+i*2);c.stroke();}}
  if(b.centerLatch&&!b.route)label(c,6000,480,'▰ '+Math.ceil(b.centerLatch),'#ffe0a6');
  if(b.frame>0){c.fillStyle=b.cooled?'#98e9d1':'#eeb87d';const height=220*b.frame;for(let y=510;y>510-height;y-=7){c.fillRect(b.x-190,y,18,4);c.fillRect(b.x+165,y,18,4);if(y<510-height+8)c.fillRect(b.x-190,y,373,5);}head(c,b.x+(b.done?0:Math.sin(t*5)*190),460-height,!b.done);}
  if(b.done)label(c,6000,135,'SYSTEM RESTORED','#97ffcf');
 }
 for(const job of s.factory.jobs){head(c,job.x,380,true);c.save();c.beginPath();c.rect(job.x-20,510-60*job.progress,110,60*job.progress);c.clip();drawBenchy(c,job.x,462,64,t);c.restore();c.fillStyle='#ffe4ac';c.fillRect(job.x-10,510-60*job.progress,84,2);}
 drawNewPrinterFoes(c,g);drawPrinterGuides(c,g);
 for(const q of s.bolts){c.fillStyle='#ff9a60';c.fillRect(q.x,q.y,q.w,q.h);c.fillStyle='#ffe2ac';c.fillRect(q.x+3,q.y+3,q.w-6,4);}c.restore();
}
