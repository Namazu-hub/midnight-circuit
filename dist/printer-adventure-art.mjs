import {PRINT_COST} from './fabrication.mjs?v=4.8a';
import {coreReady} from './printer-defense.mjs?v=4.8a';
import {drawDragon} from './dragon.mjs?v=4.8a';
import {CHASE} from './printer-chase.mjs?v=4.8a';
const line=(c,x,y,xx,yy,col,w=3)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
export function drawAdventure(c,g){if(!g.printer)return;const v=g.printer.adventure,r=g.rooms.active,j=g.printer.journey;c.save();
 if(r==='A2')drawChase(c,g);
 for(const site of g.level.printSites){if(site.room!==r)continue;const st=j.sites[site.id];c.font='bold 15px monospace';c.textAlign='center';c.fillStyle=st.progress>=1?'#9bdcc3':'#f2d39c';c.fillText(st.progress>=1?'✓':`¥${PRINT_COST[site.kind]}`,site.x,site.y-49);c.font='bold 17px monospace';c.fillText(({stairs:'▟',bridge:'━',shield:'▥',ramp:'◢',dock:'▰'})[site.kind],site.x,site.y-72);}
 if(r==='C'){c.fillStyle='#f1d09e';c.font='bold 14px monospace';c.textAlign='center';c.fillText('¥'+[15,25,10][g.printer.pattern],3180,100);}
 if(r==='C2'){line(c,13180,460,13490,150,'#667c8c',4);line(c,13490,150,14480,480,'#667c8c',4);const lock=g.level.platforms.find(a=>a.mazeLock);if(!['maze-stairs','maze-bridge','maze-ramp'].every(id=>j.sites[id].progress>=1)){c.fillStyle='#d5a87c';for(let y=-170;y<510;y+=28)c.fillRect(lock.x,y,lock.w,8);for(const [i,id] of ['maze-stairs','maze-bridge','maze-ramp'].entries()){c.fillStyle=j.sites[id].progress>=1?'#adffdb':'#c67d7b';c.fillRect(lock.x-20,200+i*23,12,12);}}}
 if(r==='E'&&g.printer.boss.defense&&!g.printer.boss.done){const b=g.printer.boss,d=b.defense;c.font='bold 17px monospace';c.fillStyle='#f4c8a2';c.textAlign='center';c.fillText('DEFENSE / '+d.wave,6000,175);for(const rain of d.rain){c.strokeStyle='#ffbd8d';c.lineWidth=3;c.setLineDash([6,8]);c.beginPath();c.moveTo(rain.x,105);c.lineTo(rain.x,490);c.stroke();c.setLineDash([]);c.strokeRect(rain.x-22,494,44,10);}if(!coreReady(b)){c.strokeStyle='#f3bba0';c.lineWidth=4;const n={x:b.x-35,y:b.y-180};c.beginPath();c.arc(n.x,n.y,48,0,Math.PI*2*Math.max(0,1-d.age/8));c.stroke();}if(d.wall.active&&d.wall.progress<1){c.fillStyle='#d8b799';for(let i=0;i<Math.floor(d.wall.progress*24);i++)c.fillRect(6150,510-i*7,28,3);}}
 if(r==='S'){c.font='bold 16px monospace';c.fillStyle='#b6e687';c.fillText('M  →  ◷',7460,425);if(v.sprint>0){c.fillStyle='#e9d29b';c.fillText(v.sprint.toFixed(1),7990,120);}if(!v.obstacleCleared){c.strokeStyle='#cfacc4';for(let y=400;y<510;y+=8)line(c,8520,y,8565,y-10,'#ac9ab3',6);}}
 c.restore();}
function drawChase(c,g){const s=g.printer.chase,t=g.time,r=CHASE.radius,x=s.x,y=s.y;c.save();
 line(c,CHASE.holder,70,CHASE.holder,390,'#476477',14);c.strokeStyle=s.done?'#a6f8d7':'#d6b283';c.lineWidth=14;c.beginPath();c.arc(CHASE.holder,510-r,r+15,0,7);c.stroke();
 if(s.done){line(c,CHASE.holder+80,380,23990,280,'#f4cc90',3);for(let i=0;i<5;i++){const xx=23890+i*30;c.fillStyle='#acd8c6';c.fillRect(xx,290,14,14);}}
 c.translate(x,y);c.rotate(s.done?t*1.8:(x-CHASE.start)/r);
 for(const [rr,col] of [[r,'#13283b'],[r-7,'#bbd4d0'],[r-18,'#8c6871'],[r-24,'#dc9674'],[r-37,'#e8ae82'],[r-54,'#b57a67'],[26,'#1c3b51']]){c.fillStyle=col;c.beginPath();c.arc(0,0,rr,0,7);c.fill();}
 for(let k=0;k<12;k++){c.rotate(Math.PI/6);c.fillStyle='#dae7d3';c.fillRect(34,-7,r-51,14);c.fillStyle='#784e58';c.fillRect(r-24,-5,11,10);}c.restore();
 if(!s.active&&!s.done){for(const dx of [-80,80]){c.fillStyle='#9eb5bd';c.fillRect(s.x+dx-9,s.y+50,18,80);}line(c,s.x+80,s.y+90,CHASE.release,270,'#ad8673',4);}
 for(const a of g.level.chaseObstacles){if(a.broken){c.fillStyle='#b29881';for(let k=0;k<5;k++)c.fillRect(a.x+k*13,a.y+a.h-10-(k%2)*5,8,8);}else{c.strokeStyle='#d3b48b';c.lineWidth=3;c.strokeRect(a.x,a.y,a.w,a.h);for(let yy=a.y+6;yy<a.y+a.h;yy+=12)line(c,a.x+5,yy,a.x+a.w-5,yy,'#638191',3);}}
 if(s.impact>0){c.strokeStyle='#ffe9b2';c.lineWidth=4;c.beginPath();c.arc(s.x,s.y,r+8+(1-s.impact/.5)*25,0,7);c.stroke();}
 c.fillStyle='#e9c798';c.font='bold 15px monospace';c.textAlign='center';c.fillText(s.done?'MATERIAL ONLINE':'3 kg · SILK PLA',CHASE.holder,110);
}
export function drawDawnRoom(c,g){if(g.rooms?.active!=='H')return;const x=18800;c.save();c.fillStyle='#7f8c9b';c.fillRect(x,0,1300,510);const sky=c.createLinearGradient(0,60,0,320);sky.addColorStop(0,'#a4b3ca');sky.addColorStop(1,'#f5d1aa');c.fillStyle=sky;c.fillRect(x+480,70,640,255);for(let i=0;i<4;i++)line(c,x+480+i*210,70,x+480+i*210,325,'#4a6072',10);line(c,x+480,200,x+1120,200,'#4a6072',8);c.fillStyle='#e8d0a622';c.beginPath();c.moveTo(x+500,325);c.lineTo(x+1100,325);c.lineTo(x+1290,510);c.lineTo(x+330,510);c.fill();
 c.fillStyle='#3b5364';c.fillRect(x+550,430,560,14);c.fillRect(x+565,444,10,66);c.fillRect(x+1080,444,10,66);c.fillStyle='#2b4454';c.fillRect(x+560,350,75,60);c.fillStyle='#a7c3bd';c.fillRect(x+567,356,60,45);c.fillStyle='#c1b997';c.fillRect(x+635,410,90,12);
 // A small printer, real tools and a finished articulated toy on the same desk.
 for(const xx of [x+940,x+1050])line(c,xx,310,xx,430,'#435c72',7);line(c,x+940,310,x+1050,310,'#435c72',7);line(c,x+930,423,x+1060,423,'#77999e',7);c.fillStyle='#d1b58e';c.fillRect(x+990,330,25,20);c.fillRect(x+690,414,28,6);c.fillRect(x+725,405,8,18);c.fillStyle='#b7a2cb';c.fillRect(x+430,450,55,60);
 c.save();c.translate(x+810,425);c.scale(.22,.22);drawDragon(c,{...g.printer.boss,x:0,y:0,age:10,phase:1,done:true,stoppedAge:3,clock:0},0);c.restore();c.font='16px monospace';c.fillStyle='#344e61';c.fillText('06:12  /  JOB COMPLETE',x+560,95);c.restore();}
