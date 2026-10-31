import {clamp,overlap} from './world.mjs?v=4.9c';
// Stage-local reusable feeder objects. Loss returns the object, never money.
export const PCB_SUPPLY={tray:{x:6740,y:300,w:64,h:24,material:'iron'},puck:{x:7590,y:470,w:46,h:40,material:'magnet',pole:1}};
export function resetPCBPart(p){const spec=PCB_SUPPLY[p.kind];Object.assign(p,spec,{vx:0,vy:0,held:false,returns:(p.returns||0)+1});}
export function setupPCBTransport(g){const s=g.pcb;s.polarity=1;s.supplies=Object.entries(PCB_SUPPLY).map(([kind,p])=>({...p,kind,vx:0,vy:0,returns:0}));s.exhaust=false;s.smoke=.5;s.thermal=[120,170,230,40];s.flow=0;s.insulation=0;
 const add=p=>g.level.platforms.push({type:'platform',h:14,pcbManaged:true,...p});
 for(let i=0;i<5;i++)add({x:6840+310*Math.cos(i*Math.PI*2/5),y:320+90*Math.sin(i*Math.PI*2/5),w:108,pcbRole:'carrier',pocket:i});
 add({x:8700,y:380,w:200,pcbRole:'cover'});
 add({x:9730,y:370,w:80,h:140,pcbRole:'scrap'});
}
export function movePCBTransport(g,dt){const s=g.pcb;if(!s)return;
 for(const a of g.level.platforms){if(!['carrier','cover'].includes(a.pcbRole))continue;const ox=a.x,oy=a.y;
 if(a.pcbRole==='carrier'){// Continuous oval including the winding arc; no teleporting rider.
  const u=(s.clock*.34+a.pocket*Math.PI*2/5)%(Math.PI*2);a.x=6840+310*Math.cos(u);a.y=320+90*Math.sin(u);
 }else {a.x=8700+Math.sin(s.clock*.35)*180;a.y=380;}
 a.dx=a.x-ox;a.dy=a.y-oy;
 }
 for(const p of s.supplies){if(g.rooms.active!=='D')continue;
  const nearMagnet=s.magnet&&Math.abs(p.x+ p.w/2-7420)<460;
  const attraction=p.material==='iron'||p.pole!==s.polarity;
  if(nearMagnet){p.vx=clamp((7420-p.x-p.w/2)*(attraction?1:-1),-120,120);p.vy=clamp((190-p.y)*(attraction?.6:-.5),-110,160);}else{p.vy=Math.min(300,p.vy+600*dt);p.vx=s.belt*50;}
  const oldBottom=p.y+p.h;p.x+=p.vx*dt;p.y+=p.vy*dt;
  // Bodies rest on delivered tape or the floor. PICO cannot permanently lose them.
  if(p.vy>=0)for(const a of g.level.platforms){if(a.pcbRole!=='carrier'&&!(a.baseX===6000&&a.h===200))continue;if(p.x+p.w>a.x&&p.x<a.x+a.w&&oldBottom<=a.y+4&&p.y+p.h>=a.y){p.y=a.y-p.h;p.vy=0;}}
  if(p.x<6200||p.x>7970||p.y>720)resetPCBPart(p);
 }
 if(g.rooms.active==='E'){
  s.smoke=clamp(s.smoke+(s.exhaust?-.7:.08)*dt,0,.65);
  const targets=s.fan?[65,85,25,25]:[120,170,230,40];s.thermal=s.thermal.map((v,i)=>v+clamp(targets[i]-v,-65*dt,35*dt));
  if(s.temp>180)s.flow=Math.min(1,s.flow+dt*.6);
 }
}
export function pcbTransportAction(g,id){const s=g.pcb;if(id==='polarity'){s.polarity=-s.polarity;return true;}if(id==='resupply'){for(const p of s.supplies)resetPCBPart(p);return true;}if(id==='exhaust'){s.exhaust=!s.exhaust;return true;}return false;}
export function tickPCBTransport(g,dt,hit){const s=g.pcb,p=g.player;if(g.rooms.active!=='E')return;
 const cover=g.level.platforms.find(a=>a.pcbRole==='cover');s.insulation=overlap({x:p.x,y:p.y,w:p.w,h:p.h},{x:cover.x,y:cover.y,w:cover.w,h:170})?1:0;
 // Radiation is telegraphed and only active inside the molten span. Cover protects
 // radiant heat, never direct molten-solder contact handled by the factory.
 if(p.x>8830&&p.x<9300&&p.y>350&&s.temp>180&&!s.insulation){s.heatExposure=(s.heatExposure||0)+dt;if(s.heatExposure>1.8){hit(g,p.x+40);s.heatExposure=0;}}else s.heatExposure=Math.max(0,(s.heatExposure||0)-dt*2);
}
export function drawPCBTransport(c,g){const s=g.pcb;if(!s)return;const room=g.rooms.active;c.save();
 if(room==='D'){
  c.strokeStyle='#476779';c.lineWidth=14;c.beginPath();c.ellipse(6894,327,310,90,0,0,Math.PI*2);c.stroke();
  for(const a of g.level.platforms.filter(a=>a.pcbRole==='carrier')){c.fillStyle='#7f9ca8';c.fillRect(a.x,a.y,a.w,18);c.fillStyle='#243f50';c.fillRect(a.x+12,a.y+3,a.w-24,11);c.fillStyle='#dcf2ce';c.fillRect(a.x,a.y,a.w,3);for(let i=0;i<5;i++)c.fillRect(a.x+6+i*20,a.y+15,3,3);}
  for(const p of s.supplies){c.fillStyle=p.material==='iron'?'#bac5c9':'#bf8fa5';c.fillRect(p.x,p.y,p.w,p.h);c.fillStyle='#21394b';c.font='16px monospace';c.fillText(p.material==='iron'?'Fe':p.pole>0?'N':'S',p.x+8,p.y+18);}
  c.fillStyle='#dac3e6';c.font='16px monospace';c.fillText(s.magnet?(s.polarity>0?'N':'S'):'OFF',7410,179);
  c.strokeStyle='#b7c5b8';c.lineWidth=8;c.beginPath();c.arc(7020,450,35,0,7);c.stroke();c.font='12px monospace';c.fillText('REWIND',6980,405);
 }
 if(room==='E'){
  const a=g.level.platforms.find(a=>a.pcbRole==='cover');c.fillStyle='#afbfbd';c.fillRect(a.x,a.y,a.w,20);c.fillStyle='#ffcf8c';for(let x=a.x;x<a.x+a.w;x+=24)c.fillRect(x,a.y+4,12,4);c.fillStyle='#8bdec215';c.fillRect(a.x,a.y+20,a.w,110);
  // Sparse bounded smoke leaves the active platform surface visible.
  c.fillStyle='#b3c1bc';c.globalAlpha=s.smoke*.22;for(let i=0;i<7;i++){c.beginPath();c.ellipse(8660+i*175+Math.sin(g.time+i)*22,270+Math.sin(g.time*.8+i)*45,70,50,0,0,7);c.fill();}c.globalAlpha=1;
  if(!s.popcornOpen){c.fillStyle='#725d50';c.fillRect(9730,370,80,140);c.strokeStyle='#e3c29a';c.strokeRect(9730,370,80,140);c.font='20px monospace';c.fillStyle='#f5dab3';c.fillText('!',9762,415);}
 }
 c.restore();
}
