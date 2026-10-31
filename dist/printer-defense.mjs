import {overlap,clamp} from './world.mjs?v=4.9c';
import {grant} from './research.mjs?v=4.9c';
import {toolHit} from './equipment.mjs?v=4.9c';
import {startFabrication} from './fabrication.mjs?v=4.9c';
export const DEFENSE=Object.freeze({turrets:2,minis:2,coreOpen:8,build:2,shotPeriod:3.2,rainPeriod:3.8});
export const coreReady=b=>b.cooled&&!!b.defense&&b.defense.age>=DEFENSE.coreOpen;
export function beginDefense(g){const b=g.printer.boss;if(b.defense)return;b.defense={age:0,wave:1,miniStarted:false,rainClock:0,rain:[],wall:{progress:0,active:false},sequence:0};b.jobs=[];b.minions=[];
 for(const x of [5515,6430])b.jobs.push({x,y:365,progress:0,kind:'turret',defense:true});g.events.push({type:'defenseWake',x:b.x,y:220});
}
export function defenseWall(g){const d=g.printer.boss.defense;if(!d)return;startFabrication(g,{kind:'shield',required:true,x:6450,y:260},d.wall);}
export function tickDefense(g,input,activated,dt,hit){const s=g.printer,b=s.boss,p=g.player;if(!b.cooled||b.done)return;beginDefense(g);const d=b.defense;d.age+=dt;d.wave=d.age<4?1:d.age<8?2:3;
 if(d.age>=4&&!d.miniStarted){d.miniStarted=true;for(const x of [5620,6340])b.jobs.push({x,y:205,progress:0,kind:'mini',defense:true});}
 if(d.wall.active)d.wall.progress=Math.min(1,d.wall.progress+dt/2);
 for(const job of b.jobs){if(!job.defense)continue;const target={x:job.x,y:job.y,w:70,h:50};if(activated&&Math.hypot(p.x+14-job.x,p.y+20-job.y)<180||toolHit(g,target,'job-'+job.kind+job.x)){job.cancelled=true;grant(g,10,'援護造形阻止',job.x,job.y);}else job.progress+=dt/DEFENSE.build;
 if(job.progress>=1){b.minions.push({kind:job.kind,x:job.x,y:job.y,w:job.kind==='mini'?72:70,h:50,clock:0,alive:true,id:'defense-'+d.sequence++,defense:true,shot:0,aim:null});}}
 b.jobs=b.jobs.filter(j=>!j.cancelled&&j.progress<1);
 for(const e of b.minions){if(!e.defense||!e.alive)continue;e.clock+=dt;if(e.kind==='mini'){e.x+=clamp(p.x-e.x,-90*dt,90*dt);e.y+=clamp(p.y-45+Math.sin(e.clock*3)*24-e.y,-60*dt,60*dt);e.y=clamp(e.y,170,450);}
 else{e.shot+=dt;if(e.shot>DEFENSE.shotPeriod-.65&&!e.aim)e.aim={x:p.x+14,y:p.y+20};if(e.shot>=DEFENSE.shotPeriod){const dx=e.aim.x-e.x,dy=e.aim.y-e.y,len=Math.hypot(dx,dy)||1,arc=Math.floor(e.clock/DEFENSE.shotPeriod)%2===1;s.bolts.push({x:e.x+20,y:e.y+10,w:12,h:12,vx:dx/len*215,vy:arc?-180:dy/len*215,ay:arc?240:0,life:5,defense:true});e.shot=0;e.aim=null;}}
 if(activated&&Math.hypot(p.x+14-e.x,p.y+20-e.y)<180||toolHit(g,e,e.id)){e.alive=false;grant(g,15,'造形兵器回収',e.x,e.y);g.events.push({type:'stomp',x:e.x,y:e.y});}
 else if(g.pulse<=0&&overlap(p,e))hit(g,e.x);
 }
 b.minions=b.minions.filter(e=>e.alive);
 if(d.age>=8){d.rainClock+=dt;if(d.rainClock>=DEFENSE.rainPeriod){d.rainClock=0;d.rain.push({x:clamp(p.x+14,5470,6510),time:.9});}}
 for(const r of d.rain){r.time-=dt;if(r.time<=0&&!r.fired){r.fired=true;s.bolts.push({x:r.x-10,y:100,w:16,h:22,vx:0,vy:280,life:2,defense:true});}}
 d.rain=d.rain.filter(r=>!r.fired);
 // The same collision rectangle is used by the printed-wall graphics and resin.
 if(d.wall.progress>=1)for(const q of s.bolts)if(overlap(q,{x:6140,y:350,w:95,h:18})||overlap(q,{x:6150,y:350,w:28,h:160}))q.life=0;
}
