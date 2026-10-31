import {octopusPose,drawOctopus} from './octopus.mjs?v=4.9c';
import {toolHit} from './equipment.mjs?v=4.9c';
import {clamp,overlap} from './world.mjs?v=4.9c';
import {grant} from './research.mjs?v=4.9c';
const near=(p,e,r)=>Math.hypot(p.x+14-e.x-e.w/2,p.y+20-e.y-e.h/2)<r;
export function createPrinterFoe(kind,x,y,extra={}){return {kind,x,y,origin:x,baseY:y,alive:true,clock:0,v:0,vy:0,reach:15,warning:false,dx:0,dy:0,w:['benchy','badBenchy'].includes(kind)?64:48,h:48,...extra};}
export function attachPrinterSurface(g,e){
 if(e.surface!==undefined||!['benchy','cube','tree','octopus'].includes(e.kind))return;
 e.surface=g.level.platforms.length;const branch=['tree','octopus'].includes(e.kind),x=e.x+(branch?-30:10),y=e.y-(branch?35:0);
 g.level.platforms.push({id:e.surface,x,y,baseX:x,baseY:y,dx:0,dy:0,w:branch?115:e.w-20,h:12,type:'platform',printerEnemy:e.id});
}
export function setupPrinterFoes(g){g.printer.foes=g.level.printerSpawns.map(e=>createPrinterFoe(e.kind,e.x,e.y,e));for(const e of g.printer.foes)attachPrinterSurface(g,e);}
export function killPrinterFoe(g,e,reward=15){if(!e.alive)return;e.alive=false;e.deathTime=g.time;e.detached=g.equipment?.strike?.id==='scraper';if(!e.rewardPaid){e.rewardPaid=true;g.research.kills++;grant(g,reward,'造形物回収',e.x,e.y);}g.events.push({type:'stomp',x:e.x+20,y:e.y});}
export function movePrinterFoes(g,dt){const s=g.printer,p=g.player;for(const e of s.foes){if(!e.alive||e.captured||e.room!==g.rooms?.active||s.boss.active&&e.kind!=='scraperBot'||e.kind==='scraperBot'&&e.room==='E'&&s.boss.age<9)continue;const oldX=e.x,oldY=e.y;e.clock+=dt;const cycle=e.clock%3.4;e.warning=false;
 if(g.pulse>0){e.v*=.96;}else if(e.kind==='spool'){const slope=e.x>500&&e.x<720?100:0;e.v=clamp(e.v+(Math.sign(p.x-e.x)*100+slope)*dt,-220,220);if(!e.parked)e.x=clamp(e.x+e.v*dt,e.origin-250,e.origin+500);e.y=e.room==='A'&&e.x<720?462-Math.max(0,720-e.x)*.18:e.baseY;}
 else if(e.kind==='scraperBot'){e.warning=cycle>1.3&&cycle<2;e.v=cycle>=2?Math.sign(p.x-e.x)*230:0;e.x=clamp(e.x+e.v*dt,e.origin-100,e.origin+100);e.y=e.baseY-(cycle>=2.6?Math.sin((cycle-2.6)/.8*Math.PI)*80:0);}
 else if(['benchy','badBenchy','cube'].includes(e.kind)){e.warning=cycle>1.5&&cycle<2.2;const speed=cycle>2.2?180:40;e.v=Math.sign(p.x-e.x)*speed;e.x=clamp(e.x+e.v*dt,e.origin-220,e.origin+220);if((e.kind==='cube'||e.kind==='badBenchy')&&cycle>2.2){e.y=e.baseY-Math.sin((cycle-2.2)/1.2*Math.PI)*(e.kind==='cube'?85:145);}else e.y=e.baseY;}
 else if(e.kind==='head'){if(!s.safety)e.x=e.origin+Math.sin(e.clock*.9)*170;e.warning=!s.safety&&cycle>2.5;if(!s.safety&&Math.floor((e.clock-dt+.05)/3.4)!==Math.floor((e.clock+.05)/3.4))s.bolts.push({x:e.x+20,y:e.y+35,w:14,h:20,vx:0,vy:290,life:3,room:e.room});}
 else if(e.kind==='tangle'){e.disabled=s.safety;e.h=e.disabled?16:40+Math.max(0,Math.sin(e.clock*2))*65;e.y=e.baseY+40-e.h;}
 else if(e.kind==='tree'||e.kind==='octopus'){e.warning=cycle>1.5&&cycle<2.2;e.reach=cycle>=2.2?Math.sin((cycle-2.2)/1.2*Math.PI)*110:15;}
 e.dx=e.x-oldX;e.dy=e.y-oldY;if(e.surface!==undefined){const a=g.level.platforms[e.surface];const x=e.x+(['tree','octopus'].includes(e.kind)?-30:10),y=e.y-(['tree','octopus'].includes(e.kind)?35:0);if(e.kind==='octopus'){const pose=octopusPose(e);Object.assign(a,{...pose.surface});a.octopusActive=pose.mode==='platform';a.dx=0;a.dy=0;}else{a.dx=x-a.x;a.dy=y-a.y;a.x=x;a.y=y;}}
 if(e.kind==='cube'&&Math.abs(e.dx)>0){for(const other of s.foes)if(other!==e&&other.alive&&other.room===e.room&&overlap(e,other))other.x+=e.dx*1.5;for(const part of g.level.printerParts)if(part.state==='loose'&&Math.abs(part.x-e.x-24)<40&&Math.abs(part.y-e.y-24)<50)part.x+=e.dx;}
 // The player can lure moving toys onto the same plate used by the spare weight.
 if(e.kind==='spool'&&e.room==='A'&&Math.abs(e.x+e.w/2-950)<43){s.weightSignal=1;if(e.kind==='spool')e.parked=true;}
 if(e.kind==='spool'&&Math.abs(e.v)>90)for(const other of s.foes)if(other!==e&&other.alive&&other.room===e.room&&overlap(e,other))killPrinterFoe(g,other);
 }}
export function fightPrinterFoes(g,activated,hit){const p=g.player,s=g.printer;for(const e of s.foes){if(!e.alive||e.captured||e.room!==g.rooms?.active||s.boss.active&&e.kind!=='scraperBot'||e.kind==='scraperBot'&&e.room==='E'&&s.boss.age<9)continue;
 if(e.kind==='tangle'&&!e.disabled&&near(p,e,95))p.vx*=.97;
 if(toolHit(g,e,e.id)){killPrinterFoe(g,e);continue;}
 const riding=e.surface!==undefined&&p.standing===e.surface;
 if(activated&&near(p,e,170)){killPrinterFoe(g,e);continue;}
 if(!riding&&p.vy>40&&p.oldBottom<=e.y+16&&overlap(p,e)){killPrinterFoe(g,e);p.vy=-440;p.jumps=1;continue;}
 if(g.pulse<=0&&!riding&&!e.disabled&&!e.parked){if(overlap(p,e))hit(g,e.x);if(e.kind==='octopus'&&octopusPose(e).mode==='slam'&&octopusPose(e).segments.some(a=>overlap(p,a)))hit(g,e.x);if(e.kind!=='octopus'&&e.reach>20){const arm={x:e.x-e.reach,y:e.y+8,w:e.w+e.reach*2,h:18};if(overlap(p,arm))hit(g,e.x);}}
 }
 // Printed shield absorbs resin; resin can also destroy other manufactured toys.
 for(const q of s.bolts){for(const a of g.level.platforms)if(a.shield&&(a.printSite?s.journey.sites[a.printSite].progress>=1:s.patterns?.[2]>=1)&&overlap(q,a))q.life=0;for(const e of s.foes)if(e.alive&&e.kind!=='head'&&(!q.room||q.room===e.room)&&overlap(q,e)){killPrinterFoe(g,e);q.life=0;break;}}
}
const poly=(c,p,col)=>{c.fillStyle=col;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
export function drawBenchy(c,x,roof,w=64,t=0,bad=false){const scale=w/64;c.save();c.translate(x,roof);c.scale(scale,scale);poly(c,[[-10,22],[68,22],[58,48],[5,48]],bad?'#bd7fa1':'#71b2c4');poly(c,[[-10,22],[68,22],[50,31],[0,31]],'#b7e3df');c.fillStyle='#243f58';c.fillRect(13,3,36,20);c.fillStyle='#d9ede6';c.fillRect(10,0,44,4);c.fillStyle='#92c8cc';c.fillRect(17,6,10,13);c.fillRect(33,6,10,13);c.fillStyle='#d6b482';c.fillRect(20,-13,10,13);for(let y=34;y<46;y+=4){c.fillStyle='#34567566';c.fillRect(6,y,49,1);}for(const xx of [10,42]){c.fillStyle='#18394e';c.beginPath();c.arc(xx,37,4,0,7);c.fill();}if(bad){c.strokeStyle='#f4b7cf';c.lineWidth=2;c.beginPath();for(let i=0;i<30;i++)c.lineTo(i*2,8+Math.sin(i*2+t)*17);c.stroke();}c.restore();}
export function drawNewPrinterFoes(c,g){const s=g.printer,t=g.time;for(const e of s.foes){if(e.room!==g.rooms?.active)continue;if(!e.alive){const age=g.time-(e.deathTime||0);if(e.detached&&age<.65){for(let k=0;k<5;k++){c.fillStyle=k%2?'#c9dad8':'#927dbb';c.fillRect(e.x+24+(k-2)*age*85,e.y+20-age*90+age*age*130,13,10);}}continue;}
 c.strokeStyle=e.captured?'#9af0cc':'#ffb28c';c.lineWidth=2;c.beginPath();c.moveTo(e.x+e.w/2-7,e.y-10);c.lineTo(e.x+e.w/2,e.y-3);c.lineTo(e.x+e.w/2+7,e.y-10);c.stroke();
 if(e.kind==='benchy'||e.kind==='badBenchy'){c.save();c.translate(e.x+32,e.y+24);if(e.warning)c.rotate(Math.sin(e.clock*18)*.12);drawBenchy(c,-32,-24,e.w,t,e.kind==='badBenchy');c.restore();}
 if(e.kind==='scraperBot'){c.fillStyle='#b7c9d0';poly(c,[[e.x-12,e.y+46],[e.x+55,e.y+46],[e.x+45,e.y+34],[e.x,e.y+34]],'#c8d5d4');c.fillStyle='#866a80';c.fillRect(e.x+12,e.y+3,12,33);c.fillStyle='#ed8cff';c.fillRect(e.x+7,e.y+18,22,8);c.fillStyle='#15384b';c.fillRect(e.x+5,e.y+40,25,4);}
 if(e.kind==='cube'){c.save();c.translate(e.x+24,e.y+24);if(g.player.standing!==e.surface)c.rotate(Math.sin(e.clock*3)*.16);poly(c,[[-24,-24],[14,-29],[26,-17],[26,24],[-24,24]],'#7bc6c8');poly(c,[[14,-29],[26,-17],[26,24],[14,17]],'#3c7b96');c.fillStyle='#17394e';c.font='bold 26px monospace';c.textAlign='center';c.fillText('X',-2,10);c.strokeStyle='#c5fff3';c.lineWidth=3;c.strokeRect(-24,-24,38,42);c.restore();}
 if(e.kind==='tree'){c.strokeStyle='#c99abc';c.lineWidth=12;c.beginPath();c.moveTo(e.x+24,e.y+48);c.lineTo(e.x+22,e.y-35);c.moveTo(e.x-25,e.y-29);c.lineTo(e.x+80,e.y-29);c.moveTo(e.x+22,e.y);c.lineTo(e.x-e.reach,e.y+12);c.moveTo(e.x+22,e.y);c.lineTo(e.x+e.w+e.reach,e.y+12);c.stroke();c.fillStyle='#e0f9ef';c.fillRect(e.x-30,e.y-35,115,4);c.fillStyle='#ffb689';c.fillRect(e.x+12,e.y+25,24,18);}
 if(e.kind==='octopus')drawOctopus(c,e);
 if(e.warning){if(['tree','octopus'].includes(e.kind)){c.strokeStyle='#ffd0ad';c.lineWidth=4;c.strokeRect(e.x+8,e.y+15,32,7);}if(e.kind==='cube'){c.strokeStyle='#fff0c1';c.lineWidth=2;c.strokeRect(e.x-4+Math.sin(t*60)*2,e.y-4,e.w+8,e.h+8);}c.strokeStyle='#ffe8ab';c.lineWidth=2;c.beginPath();c.arc(e.x+e.w/2,e.y-15,12,0,7);c.stroke();c.fillStyle='#ffe8ab';c.font='bold 18px monospace';c.fillText('!',e.x+e.w/2-4,e.y-9);}
 }}
