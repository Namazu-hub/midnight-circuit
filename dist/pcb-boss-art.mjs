import {drawCore} from './core-art.mjs?v=4.9c';
import {pcbBossHeads} from './pcb-boss.mjs?v=4.9c';
const box=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
export function drawPlacementMachine(c,g){const b=g.pcb.boss,t=g.time;const alarm=b.active&&!b.done;c.save();
 // Structural rails, motor carriages and cable chain, rather than a scaled enemy.
 for(const x of [12300,13700]){box(c,x-20,70,58,445,'#263e50');box(c,x-11,80,12,420,'#91a7ad');for(let y=105;y<500;y+=65){box(c,x+15,y,9,6,'#d3c7a5');}box(c,x-35,493,92,18,'#9ba8a5');}
 box(c,12280,65,1460,45,'#758e9a');box(c,12280,79,1460,9,'#c3cfc9');
 for(let x=12320;x<13700;x+=32)box(c,x,99,18,5,'#172e43');
 const lit=b.done?'#80e7c4':alarm?'#df8ac5':'#c6b88a';
 for(let i=0;i<7;i++){const on=!alarm||b.age>.2*i;box(c,12360+i*195,50,38,9,on?lit:'#233b48');}
 if(!b.active){drawHead(c,{x:13000,y:135,warning:false},t,lit);c.restore();return;}
 for(const h of pcbBossHeads(b)){const top=110;
  box(c,h.x-48,top-15,96,25,'#a2b7bd');box(c,h.x-37,top-10,74,14,'#263e51');
  for(let y=top;y<h.y;y+=19){box(c,h.x-23,y,46,12,'#77959e');box(c,h.x-17,y+2,34,4,'#cad7d0');}
  c.strokeStyle='#cc9a60';c.lineWidth=5;c.beginPath();c.moveTo(h.x+43,top);c.bezierCurveTo(h.x+77,top+70,h.x+75,h.y-20,h.x+45,h.y+20);c.stroke();
  drawHead(c,h,t,lit);
  if(h.warning&&!b.done){c.save();c.strokeStyle='#f6b5a1';c.lineWidth=3;c.setLineDash([9,7]);c.strokeRect(h.target-65,405,130,103);c.beginPath();c.moveTo(h.x,h.y+70);c.lineTo(h.target,510);c.stroke();c.setLineDash([]);c.font='bold 14px monospace';c.fillStyle='#ffd7a1';c.fillText('▼',h.target-7,398);c.restore();}
 }
 // Fixing station joins the moving head to the actual magnet and solder locks.
 if(b.fixed){box(c,12565,170,230,24,'#9a9ea4');for(const x of [12565,12765]){box(c,x,170,30,125,'#8c75a3');box(c,x+5,185,20,90,b.temp>55?'#e4a27c':'#a7d9ce');}c.font='16px monospace';c.fillStyle='#dcf5db';c.fillText(Math.round(b.temp)+'°',12625,323);}
 box(c,13450,110,240,110,'#172c40');box(c,13460,120,220,90,'#0a1c2b');c.font='bold 14px monospace';c.fillStyle=lit;
 const lines=b.done?['SYSTEM RESTORED','CONTROL NODE: OFFLINE']:b.age<3?['TARGET COMPONENT: PICO','PLACEMENT REQUIRED']:b.phase===4&&b.ng?['INSPECTION RESULT: NG','REJECT ACTUATOR']:['COMPONENT ID: PICO',b.warning?'TARGET LOCKED':'PICK UP SEQUENCE'];lines.forEach((s,i)=>c.fillText(s,13470,148+i*27));
 if(b.age<3){const u=Math.min(1,Math.max(0,(b.age-.8)/1.5));drawCore(c,13710-710*u,125+70*u,t);if(u>.6){c.strokeStyle='#e58cda88';for(let i=0;i<4;i++){c.beginPath();c.moveTo(13000,195);c.lineTo(12450+i*230,100);c.stroke();}}}
 if(b.phase===4&&b.ng){drawCore(c,13250,180,t,b.done);if(!b.done){c.strokeStyle='#eea7e8';c.setLineDash([5,8]);c.beginPath();c.moveTo(13540,150);c.lineTo(13250,180);c.stroke();}}
 c.restore();
}
function drawHead(c,h,t,lit){const x=h.x,y=h.y;c.save();box(c,x-66,y,132,55,'#819ca8');box(c,x-58,y+7,116,36,'#334e65');box(c,x-69,y+48,138,14,'#b6c8c7');for(const dx of [-47,37]){box(c,x+dx,y+17,12,15,'#141f36');box(c,x+dx+3,y+20,6,6,lit);}box(c,x-21,y+62,42,13,'#b88d61');box(c,x-12,y+75,24,11,'#e7d8ad');c.strokeStyle='#bce8d5';c.lineWidth=2;c.beginPath();c.arc(x,y+27,13,0,7);c.stroke();c.fillStyle=h.warning?'#f8c29d':lit;c.beginPath();c.arc(x,y+27,6,0,7);c.fill();c.restore();}
