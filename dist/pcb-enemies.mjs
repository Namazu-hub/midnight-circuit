import {overlap,clamp} from './world.mjs?v=4.9b';
import {toolHit} from './equipment.mjs?v=4.9b';
import {grant} from './research.mjs?v=4.9b';
export function setupPCBFoes(g){if(!g.pcb)return;g.pcb.foes=[['ball',3400,'B'],['tombstone',3540,'B'],['qfp',5300,'C'],['wick',6740,'D'],['ball',7560,'D'],['bridge',9050,'E'],['popcorn',9580,'E'],['whisker',10850,'F']].map(([kind,x,room],i)=>({id:i,kind,room,x,y:470,w:40,h:40,baseX:x,clock:0,alive:true,paid:false}));}
export function tickPCBFoes(g,activated,dt,hit){if(!g.pcb)return;const s=g.pcb,p=g.player;for(const e of s.foes){if(!e.alive||e.room!==g.rooms.active)continue;e.clock+=dt;const phase=e.clock%4;e.warning=phase<1;
 if(e.kind==='ball'){e.x=e.baseX+Math.sin(e.clock*1.5)*90;e.y=470-Math.abs(Math.sin(e.clock*3))*60;}
 if(e.kind==='tombstone'){e.h=phase<2?90:20;e.y=510-e.h;e.w=phase<2?30:110;}
 if(e.kind==='qfp'){e.x=e.baseX+Math.sin(e.clock*.9)*130;e.y=280;if(s.magnet)e.x+=(7100-e.x)*dt;}
 if(e.kind==='wick'){e.x+=clamp(p.x-e.x,-dt*35,dt*35);if(Math.abs(e.x-p.x)<65)s.charge=0;}
 if(e.kind==='bridge'){e.solid=s.temp<=55;e.y=e.solid?510:480;if(e.solid)continue;}
 if(e.kind==='popcorn'){if(phase>2.5){e.warning=true;e.w=55;}if(phase>3.5){if(Math.abs(p.x-e.x)<120)hit(g,e.x);e.alive=false;g.events.push({type:'stomp',x:e.x,y:e.y});}}
 if(e.kind==='whisker'){e.h=phase<1?8:phase<3?70:8;e.y=510-e.h;}
 const struck=toolHit(g,e,'pcb-foe-'+e.id)||activated&&Math.hypot(p.x+14-e.x,p.y+20-e.y)<(s.charge>0?260:180)||p.vy>50&&p.oldBottom<=e.y+12&&overlap(p,e);
 if(struck){e.alive=false;p.vy=p.vy>50?-400:p.vy;g.events.push({type:'stomp',x:e.x,y:e.y});if(!e.paid){e.paid=true;grant(g,15,'不良部品回収',e.x,e.y);}}
 else if(overlap(p,e)&&!(e.warning||e.kind==='tombstone'&&phase>=2))hit(g,e.x);
 }if(activated)s.charge=0;}
export function drawPCBFoes(c,g){if(!g.pcb)return;for(const e of g.pcb.foes){if(!e.alive||e.room!==g.rooms.active)continue;c.save();c.translate(e.x,e.y);c.strokeStyle=e.warning?'#f6cb8b':'#91cfc8';c.lineWidth=3;c.fillStyle=e.kind==='ball'?'#bdc8c9':e.kind==='bridge'?'#b2c7c6':'#365369';if(e.kind==='ball'){c.beginPath();c.arc(20,20,20,0,7);c.fill();c.fillStyle='#eef9df';c.fillRect(10,5,9,6);}else{c.fillRect(0,0,e.w,e.h);c.strokeRect(0,0,e.w,e.h);for(let y=8;y<e.h;y+=12){c.strokeStyle='#a4c5b7';c.beginPath();c.moveTo(5,y);c.lineTo(e.w-5,y);c.stroke();}}if(e.kind==='qfp')for(let k=0;k<7;k++){c.strokeStyle='#d4dac6';c.beginPath();c.moveTo(k*6,35);c.lineTo(k*6+Math.sin(g.time*10+k)*5,50);c.stroke();}if(e.warning){c.font='bold 21px monospace';c.fillStyle='#f0c596';c.fillText('!',12,-12);}c.restore();}}
