import {overlap,clamp} from './world.mjs?v=4.9c';
import {toolHit} from './equipment.mjs?v=4.9c';
import {grant} from './research.mjs?v=4.9c';
// Motion and rideable surfaces update BEFORE walk; attacks resolve AFTER walk.
// Paid survives conversions, so using an enemy as terrain cannot farm money.
export function setupPCBFoes(g){if(!g.pcb)return;g.pcb.foes=[
 ['ball',3400,'B'],['tombstone',3540,'B'],['tombstone',3650,'B'],['tombstone',3760,'B'],
 ['qfp',5300,'C'],['wick',6740,'D'],['feeder',6610,'D'],['drone',7650,'D'],['ball',7560,'D'],
 ['bridge',9050,'E'],['wick',8740,'E'],['popcorn',9580,'E'],['whisker',10850,'F']
 ].map(([kind,x,room],i)=>({id:i,kind,room,x,y:470,w:40,h:40,baseX:x,clock:0,alive:true,paid:false,down:0,converted:false,tip:0,burst:0}));
 for(const e of g.pcb.foes){if(!['qfp','tombstone','bridge','feeder'].includes(e.kind))continue;const a={x:e.x,y:e.y,w:e.w,h:12,type:'platform',pcbManaged:true,pcbRole:'foe-surface',foe:e.id};g.level.platforms.push(a);}
 g.pcb.heatDrops=[];
}
export function foeSurface(g,a){const e=g.pcb.foes.find(e=>e.id===a.foe);return !!e&&(e.kind==='qfp'&&e.alive||e.kind==='tombstone'&&e.down>0||e.kind==='bridge'&&e.alive&&g.pcb.temp<=55||e.kind==='feeder'&&e.converted);}
function reward(g,e){if(e.paid)return;e.paid=true;grant(g,15,'不良部品回収',e.x,e.y);}
function defeat(g,e){e.alive=false;reward(g,e);if(e.kind==='drone'&&!g.pcb.heatDrops.some(d=>d.source===e.id))g.pcb.heatDrops.push({source:e.id,x:e.x+20,y:475,got:false});g.events.push({type:'stomp',x:e.x,y:e.y});}
export function movePCBFoes(g,dt){const s=g.pcb,p=g.player;if(!s)return;
 for(const e of s.foes){if(e.room!==g.rooms.active||!e.alive&&!e.converted)continue;e.clock+=dt;e.down=Math.max(0,e.down-dt);e.warning=false;const phase=e.clock%4;
  if(e.kind==='ball'){const hot=e.room==='E'&&s.temp>55;e.x=e.baseX+Math.sin(e.clock*(hot?2:1.5))*90;e.y=470-Math.abs(Math.sin(e.clock*(hot?4:3)))*(hot?90:60);e.hot=hot;}
  if(e.kind==='tombstone'){
   if(!e.down&&(e.tip>0||Math.abs(p.x-e.x)<190))e.tip+=dt;
   e.warning=e.tip>0&&e.tip<.9;
   if(e.tip>=.9&&!e.down){e.down=8;e.tip=0;reward(g,e);for(const n of s.foes)if(n.kind==='tombstone'&&n!==e&&!n.down&&n.x>e.x&&n.x<e.x+145)n.tip=Math.max(n.tip,.5);}
   e.h=e.down?20:90;e.y=510-e.h;e.w=e.down?110:30;
  }
  if(e.kind==='qfp'){e.w=88;e.h=32;e.x=e.baseX+Math.sin((e.walkClock||0)*.9)*130;if(!e.down)e.walkClock=(e.walkClock||0)+dt;e.y=e.down?305:280;}
  if(e.kind==='wick'){const bridge=s.foes.find(n=>n.kind==='bridge'&&n.alive&&n.room===e.room&&Math.abs(n.x-e.x)<200);e.x+=clamp((bridge?.x??p.x)-e.x,-dt*35,dt*35);e.x=clamp(e.x,e.room==='E'?8500:6350,e.room==='E'?9350:7900);if(bridge&&Math.abs(bridge.x-e.x)<65){defeat(g,bridge);e.converted=true;e.alive=false;g.events.push({type:'relay',x:e.x,y:e.y});}}
  if(e.kind==='bridge'){e.w=120;e.h=s.temp<=55?15:35;e.y=s.temp<=55?495:475;e.warning=s.temp<=55;}
  if(e.kind==='popcorn'){if(!e.burst)e.burst=phase>2.5?.001:0;else e.burst+=dt;e.warning=e.burst>0;e.w=40+Math.min(1,e.burst)*20;if(e.burst>=1.1){e.explode=true;e.alive=false;reward(g,e);s.popcornOpen=true;g.events.push({type:'stomp',x:e.x,y:e.y});}}
  if(e.kind==='whisker'){e.h=phase<1?8:phase<3?70:8;e.y=510-e.h;e.warning=phase<1;}
  if(e.kind==='feeder'){
   e.w=120;e.h=22;
   if(e.converted){e.x=6820+Math.sin(e.clock*.6)*150;e.y=390-Math.abs(Math.sin(e.clock*.6))*110;}
   else{e.x+=clamp(p.x-e.x,-dt*75,dt*75);e.x=clamp(e.x,6420,7060);e.y=480;if(e.x>6960){e.converted=true;reward(g,e);g.events.push({type:'relay',x:e.x,y:e.y});}}
  }
  if(e.kind==='drone'){e.x=e.baseX+Math.sin(e.clock)*95;e.y=250+Math.sin(e.clock*2)*45;e.warning=phase<1;if(s.magnet){e.x=7420;e.y=205;e.warning=true;}}
  // Paste and active belts affect enemies too, but solder is never magnetic.
  if(e.room==='D'&&['ball','wick','feeder'].includes(e.kind)&&!e.converted)e.x+=s.belt*40*dt;
 }
 for(const a of g.level.platforms){if(a.pcbRole!=='foe-surface')continue;const e=s.foes.find(e=>e.id===a.foe),ox=a.x,oy=a.y;a.x=e.x;a.y=e.y;a.w=e.w;a.dx=a.x-ox;a.dy=a.y-oy;}
}
export function tickPCBFoes(g,activated,dt,hit){if(!g.pcb)return;const s=g.pcb,p=g.player;for(const e of s.foes){if(e.room!==g.rooms.active)continue;
 if(e.explode){e.explode=false;if(Math.hypot(p.x-e.x,p.y-e.y)<125)hit(g,e.x);}
 if(!e.alive||e.converted)continue;
 if(e.kind==='wick'&&Math.abs(e.x-p.x)<65)s.charge=0;
 const a=g.level.platforms.find(a=>a.foe===e.id&&a.pcbRole==='foe-surface'),riding=a&&p.standing===a.id;
 const stomp=riding&&p.oldBottom<e.y+8||p.vy>50&&p.oldBottom<=e.y+12&&overlap(p,e);
 const struck=toolHit(g,e,'pcb-foe-'+e.id)||activated&&Math.hypot(p.x+14-e.x,p.y+20-e.y)<(s.charge>0?260:180);
 if(struck){defeat(g,e);continue;}
 if(stomp){if(e.kind==='qfp'){if(!e.down){e.down=3;reward(g,e);g.events.push({type:'stomp',x:e.x,y:e.y});}}else if(e.kind==='tombstone'){e.down=8;reward(g,e);}else if(e.kind!=='bridge'){defeat(g,e);p.vy=-400;}continue;}
 if(!riding&&overlap(p,e)&&!e.warning&&!(e.kind==='tombstone'&&e.down))hit(g,e.x);
 }
 for(const d of s.heatDrops)if(!d.got&&Math.hypot(p.x+14-d.x,p.y+20-d.y)<45){d.got=true;s.heatRecovered=true;grant(g,10,'熱源部品回収',d.x,d.y);}
 if(activated)s.charge=0;
}
export function drawPCBFoes(c,g){if(!g.pcb)return;for(const e of g.pcb.foes){if(!e.alive&&!e.converted||e.room!==g.rooms.active)continue;c.save();c.translate(e.x,e.y);c.strokeStyle=e.warning?'#ffd28b':'#91cfc8';c.lineWidth=3;c.fillStyle='#365369';
 if(e.kind==='ball'){c.fillStyle=e.hot?'#ff9975':'#bdc8c9';c.beginPath();c.arc(20,20,20,0,7);c.fill();c.fillStyle='#eef9df';c.fillRect(10,5,9,6);}
 else if(e.kind==='feeder'||e.kind==='wick'){for(let i=0;i<8;i++){const y=e.converted?0:Math.sin(g.time*5+i)*6;c.fillStyle=e.kind==='wick'?'#c18b60':'#6c8e99';c.fillRect(i*15,y,14,18);c.fillStyle='#152c3d';c.fillRect(i*15+4,y+4,7,8);}if(e.converted){c.strokeStyle='#c7ffe0';c.beginPath();c.moveTo(0,0);c.lineTo(120,0);c.stroke();}}
 else if(e.kind==='whisker'){c.strokeStyle='#d4d6c4';for(let i=0;i<4;i++){c.beginPath();c.moveTo(i*10, e.h);c.lineTo(i*10+4,0);c.stroke();}}
 else if(e.kind==='drone'){c.fillStyle='#648899';c.fillRect(0,0,40,24);c.fillStyle='#ddd3a2';c.fillRect(14,24,12,30);c.fillStyle=e.warning?'#ffc997':'#ff7868';c.fillRect(17,54,6,17);c.strokeStyle='#adcad3';c.beginPath();c.moveTo(-12,-5);c.lineTo(52,-5);c.stroke();}
 else{c.fillStyle=e.kind==='bridge'?(g.pcb.temp>55?'#f2ad86':'#b2c7c6'):e.kind==='tombstone'?'#c5b391':'#263d4e';c.fillRect(0,0,e.w,e.h);c.strokeRect(0,0,e.w,e.h);for(let y=8;y<e.h;y+=12){c.strokeStyle='#a4c5b7';c.beginPath();c.moveTo(5,y);c.lineTo(e.w-5,y);c.stroke();}}
 if(e.kind==='qfp')for(let k=0;k<10;k++){c.strokeStyle='#d4dac6';c.beginPath();c.moveTo(k*8,28);c.lineTo(k*8+(e.down?9:Math.sin(g.time*10+k)*5),e.down?36:47);c.stroke();}if(e.warning){c.font='bold 21px monospace';c.fillStyle='#f0c596';c.fillText('!',12,-12);}c.restore();}
 for(const d of g.pcb.heatDrops)if(!d.got){c.fillStyle='#e9b16f';c.fillRect(d.x-10,d.y-12,20,24);}
}
