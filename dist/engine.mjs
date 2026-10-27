import {tickActionRepairs,actionPlatformSolid,returnCarriedPart} from './action-repairs.mjs?v=4.3a';
import {setupRepairStations} from './repair-stations.mjs?v=4.3a';
import {beginRepair,nearbyRepair} from './repairs.mjs?v=4.3a';
import {setupResearch,tickResearch} from './research.mjs?v=4.3a';
import {tickLab} from './laboratory.mjs?v=4.3a';
import {LEVELS} from './levels.mjs?v=4.3a';
import {clamp,overlap,approach} from './world.mjs?v=4.3a';
import {tickEnemies} from './enemies.mjs?v=4.3a';
import {tickRail,resetRail,railAt} from './rail.mjs?v=4.3a';
export {LEVELS,clamp,overlap,railAt};
export const VIEW={w:1200,h:600};
export const RULES={maxHP:6,boostDuration:9,boostSpeed:1.55,speed:290,gravity:1640,jump:625,airJump:555,pulse:2.8,cooldown:5.2};
const copy=o=>JSON.parse(JSON.stringify(o));
export function createGame(index=0,customLevel=null){
 const level=copy(customLevel||LEVELS[index]);
 level.platforms.forEach((a,i)=>Object.assign(a,{id:i,baseX:a.x,baseY:a.y,clock:0,dx:0,dy:0,crumble:0,missing:0}));
 level.enemies.forEach(e=>{e.baseX=e.x;});
 const g={level,index,player:{...level.spawn,w:28,h:40,vx:0,vy:0,hp:6,displayHP:6,hurtTimer:0,hurtFrom:6,hurtTo:6,boost:0,face:1,onGround:false,standing:null,coyote:0,jumps:0,buffer:0,invul:0,walk:0},time:0,elapsed:0,pulse:0,cooldown:0,camera:0,cameraY:0,checkpoint:false,respawn:{...level.spawn},chips:0,gears:0,deaths:0,lives:3,gameOver:false,finished:false,events:[],projectiles:[],shake:0,warp:0,progress:0,spawnGrace:1,cartCheckpoint:160};
 if(level.theme!=='fever'){setupRepairStations(g);setupResearch(g);level.platforms.forEach((a,i)=>{if(a.id===undefined)Object.assign(a,{id:i,baseX:a.x,baseY:a.y,clock:0,dx:0,dy:0,crumble:0,missing:0});});}
 if(level.cart)resetRail(g);return g;
}
export function emit(g,type,data={}){g.events.push({type,...data});}
export function respawn(g,cause='retry'){
 returnCarriedPart(g);g.repairSession=null;const p=g.player;
 if(cause==='fall'){p.hurtFrom=p.hp;p.hurtTo=Math.max(0,p.hp-1);p.hurtTimer=2.2;p.displayHP=p.hp;p.hp--;emit(g,'fall');}
 if(cause==='retry'||p.hp<=0){g.lives--;emit(g,'lifeLost',{lives:g.lives});if(g.lives<=0){g.gameOver=true;emit(g,'gameOver');return;}p.hp=6;p.displayHP=6;p.hurtTimer=0;}
 const hp=p.hp,displayHP=p.displayHP,hurtTimer=p.hurtTimer;
 Object.assign(g.player,{...g.respawn,vx:0,vy:0,hp,displayHP,hurtTimer,boost:0,invul:2,jumps:0,coyote:0,buffer:0,onGround:false,standing:null});
 for(const a of g.level.platforms)Object.assign(a,{x:a.baseX,y:a.baseY,clock:0,crumble:0,missing:0,dx:0,dy:0});
 for(const e of g.level.enemies)Object.assign(e,{x:e.baseX,y:e.baseY,state:'patrol',stateTime:0,clock:0,aim:null});
 if(g.level.cart)resetRail(g,g.cartCheckpoint);
 g.projectiles=[];g.pulse=0;g.cooldown=0;g.spawnGrace=2;g.deaths++;g.shake=.18;g.warp=0;
 g.camera=clamp(g.player.x-VIEW.w*.32,0,Math.max(0,g.level.width-VIEW.w));g.cameraY=clamp(g.player.y-310,g.level.minY,0);emit(g,'respawn');
}
function damage(g,x){
 const p=g.player;if(g.fever||p.invul>0||g.spawnGrace>0)return;
 p.hurtFrom=p.hp;p.hurtTo=p.hp-1;p.hurtTimer=2.2;p.displayHP=p.hp;p.hp--;p.invul=1.65;g.shake=.25;
 if(g.cart)g.cart.speed*=.8;else{p.vy=-300;p.vx=p.x<x?-210:210;p.onGround=false;p.standing=null;}
 emit(g,'hurt',{x:p.x+14,y:p.y-18});if(p.hp<=0)respawn(g,'damage');
}
export function lifeNotice(p){return p.hurtTimer>0?{from:p.hurtFrom,to:p.hurtTo,value:p.hurtTimer>1.95?p.hurtFrom:p.hurtTo,alpha:clamp(p.hurtTimer/.35,0,1),fraction:clamp(p.displayHP/6,0,1)}:null;}
export function laserPhase(g,l){return (g.time+(l.phase||0))%3.8;}
export function laserActive(g,l){const phase=laserPhase(g,l);return !g.level.relays.some(r=>r.mode==='timing'&&r.on)&&g.pulse<=0&&phase>=.65&&phase<2.2;}
export function printedPhase(a){return (a.clock+(a.phase||0))%(a.period||4.8);}
export function platformSolid(g,a){
 if(a.actionDevice)return actionPlatformSolid(g,a);
 if(a.requiresRepair){const r=g.level.relays.find(r=>r.id===a.group);return !!r?.on&&(!a.requiresRank||(r.repairRank||0)>=a.requiresRank);}
 if(a.type==='ghost')return g.pulse>0||!!(a.group&&g.level.relays.find(r=>r.id===a.group)?.on);
 if(a.type==='printed'&&g.level.relays.some(r=>r.mode==='timing'&&r.on))return true;
 if(a.type==='printed')return g.pulse>0||g.spawnGrace>0||printedPhase(a)>=1.4;
 if(a.type==='leaf')return a.missing<=0;
 return true;
}
export function pressState(g,h){
 if(g.level.pressCalibrated||g.level.relays.some(r=>r.mode==='sequence'&&r.on))return {warning:false,active:false,x:h.x,y:h.y,w:h.w,h:h.h};
 const phase=(h.clock??g.time)+(h.phase||0),v=phase%(h.period||3.8);
 const extension=v<.8?0:v<1.05?(v-.8)/.25:v<1.65?1:v<2.25?1-(v-1.65)/.6:0;
 return {warning:v<.8,active:v>=.8&&v<2.25&&g.pulse<=0&&!g.level.relays.some(r=>r.mode==='sequence'&&r.on),x:h.x,y:h.y,w:h.w,h:h.h+(h.floorY-h.y-h.h)*extension};
}
function updateMachinery(g,dt){
 const p=g.player,frozen=g.pulse>0;
 for(const a of g.level.platforms){
  const oldX=a.x,oldY=a.y;if(!frozen)a.clock+=dt;
  if((a.type==='moving'||a.type==='wave')&&!frozen){const v=Math.sin(a.clock/a.period*Math.PI*2+(a.phase||0))*a.range;a.x=a.baseX+(a.axis==='x'?v:0);a.y=a.baseY+(a.axis==='y'?v:0);}
  if(a.type==='leaf'&&!frozen){if(a.missing>0){a.missing=Math.max(0,a.missing-dt);if(a.missing===0)a.crumble=0;}else if(a.crumble>0){a.crumble+=dt;if(a.crumble>.8){a.missing=3.2;a.crumble=0;}}}
  a.dx=a.x-oldX;a.dy=a.y-oldY;
 }
 for(const l of g.level.lasers)if(l.nozzle&&!frozen)l.x=l.baseX+Math.sin(g.time*1.2+l.phase)*l.range;
 for(const h of g.level.presses){h.clock=h.clock||0;if(!frozen)h.clock+=dt;}
}
function walk(g,input,dt){
 const p=g.player,L=g.level;
 if(p.standing!==null){const a=L.platforms[p.standing];if(a&&platformSolid(g,a)){p.x+=a.dx+(a.belt||0)*dt;p.y+=a.dy;}else{p.onGround=false;p.standing=null;}}
 p.coyote=p.onGround?.12:Math.max(0,p.coyote-dt);p.buffer=input.jump?.13:Math.max(0,p.buffer-dt);
 const icy=p.standing!==null&&L.platforms[p.standing]?.type==='ice';
 const zone=L.gravityZones.find(z=>overlap(p,z));
 const speed=(g.fever?.speed||RULES.speed)*(p.boost>0&&!g.fever?RULES.boostSpeed:1),dir=(input.right?1:0)-(input.left?1:0);
 if(dir){p.vx=clamp(p.vx+dir*(p.onGround?(icy?650:2400):1850)*dt,-speed,speed);p.face=dir;}else p.vx=approach(p.vx,0,(p.onGround?(icy?170:2300):450)*dt);
 if(p.buffer>0&&(p.coyote>0||p.jumps<2)){const first=p.coyote>0||p.onGround;p.vy=-(first?RULES.jump:RULES.airJump)*(zone?.jumpScale||1);p.jumps=first?1:2;p.coyote=0;p.onGround=false;p.standing=null;p.buffer=0;emit(g,first?'jump':'doublejump',{x:p.x+14,y:p.y+40});}
 if(input.jumpRelease&&p.vy<-220)p.vy*=.5;
 let windy=false;for(const w of L.winds)if(overlap(p,w)){windy=true;p.vy-=2430*dt;}
 p.vy=clamp(p.vy+RULES.gravity*(zone?.scale||1)*dt,windy?-360:-1000,900);
 const oldX=p.x;p.x=clamp(p.x+p.vx*dt,0,L.width-p.w);
 for(const a of L.platforms){if(a.h<60||!platformSolid(g,a)||!overlap(p,a))continue;if(oldX+p.w<=a.x+1){p.x=a.x-p.w;p.vx=0;}else if(oldX>=a.x+a.w-1){p.x=a.x+a.w;p.vx=0;}}
 const oldBottom=p.y+p.h;p.oldBottom=oldBottom;p.y+=p.vy*dt;p.onGround=false;p.standing=null;let landing=null;
 for(const a of L.platforms){if(!platformSolid(g,a))continue;
  if(p.vy>=0&&p.x+p.w>a.x+3&&p.x<a.x+a.w-3&&oldBottom<=a.y-a.dy+7&&p.y+p.h>=a.y){if(!landing||a.y<landing.y)landing=a;}
  else if(a.h>=60&&p.vy<0&&overlap(p,a)){p.y=a.y+a.h;p.vy=0;}
 }
 if(landing){p.y=landing.y-p.h;p.vy=0;p.onGround=true;p.jumps=0;p.standing=landing.id;
  if(landing.type==='leaf'&&!landing.crumble)landing.crumble=.001;
  if(landing.type==='spring'){p.vy=-885;p.onGround=false;p.standing=null;p.jumps=1;emit(g,'spring',{x:p.x+14,y:p.y+40});}
 }
 if(p.y<L.minY-90){p.y=L.minY-90;p.vy=Math.max(0,p.vy);}p.walk+=Math.abs(p.vx)*dt;
}
function interactions(g,activated){
 const p=g.player,L=g.level;
 for(const c of L.chips)if(!c.got&&Math.hypot(p.x+14-c.x,p.y+20-c.y)<30){c.got=true;g.chips++;emit(g,'chip',c);}
 for(const c of L.drinks)if(!c.got&&Math.hypot(p.x+14-c.x,p.y+20-c.y)<36){c.got=true;p.boost=9;emit(g,'boost',c);}
 for(const c of L.gears)if(!c.got&&Math.hypot(p.x+14-c.x,p.y+20-c.y)<34){c.got=true;g.gears++;emit(g,'gear',c);}
 for(const r of L.relays)if(!r.portal&&!r.mode&&!r.on&&g.pulse>0&&Math.hypot(p.x+14-r.x,p.y+20-r.y)<190){r.on=true;emit(g,'relay',r);}
 if(activated){const portal=L.portals.find(r=>Math.hypot(p.x+14-r.x,p.y+20-r.y)<115);if(portal){portal.on=true;L.relays.find(r=>r.id===portal.id).on=true;p.x=portal.toX;p.y=portal.toY;p.vx=0;p.vy=0;p.onGround=false;p.standing=null;p.invul=1.5;g.respawn={x:p.x,y:p.y};g.checkpoint=true;g.warp=.6;g.camera=clamp(p.x-VIEW.w*.32,0,L.width-VIEW.w);g.cameraY=clamp(p.y-310,L.minY,0);emit(g,'portal',{x:p.x+14,y:p.y+20});}}
 for(const c of L.checkpoints)if(!c.active&&Math.abs(p.x-c.x)<60&&Math.abs(p.y+p.h-c.y)<70){c.active=true;g.checkpoint=true;g.respawn={x:c.x,y:c.y-40};p.hp=6;p.displayHP=6;p.hurtTimer=0;if(g.cart)g.cartCheckpoint=c.x;emit(g,'checkpoint',{x:c.x,y:c.y-50});}
 for(let i=0;i<L.route.length;i++){const r=L.route[i];if(Math.hypot(p.x+14-r.x,p.y+40-r.y)<150)g.progress=Math.max(g.progress,(i+1)/(L.route.length+1));}
 const goal=L.goal;if(Math.abs(p.x+14-goal.x)<75&&Math.abs(p.y+p.h-goal.y)<100){if(L.relays.every(r=>r.optional||r.on)&&(!L.boss||L.boss.repaired)){g.finished=true;g.progress=1;emit(g,'finish');}else if(!g.goalMessage||g.time-g.goalMessage>4){g.goalMessage=g.time;emit(g,'locked');}}
}
export function updateGame(g,input={},dt=1/120){
 if(g.finished||g.gameOver||g.repairSession)return;const p=g.player;g.time+=dt;g.elapsed+=dt;g.shake=Math.max(0,g.shake-dt);g.spawnGrace=Math.max(0,g.spawnGrace-dt);g.warp=Math.max(0,g.warp-dt);
 p.invul=Math.max(0,p.invul-dt);p.boost=Math.max(0,p.boost-dt);p.hurtTimer=Math.max(0,p.hurtTimer-dt);if(p.hurtTimer<1.95)p.displayHP+=(p.hp-p.displayHP)*Math.min(1,dt*7);
 g.pulse=Math.max(0,g.pulse-dt);g.cooldown=Math.max(0,g.cooldown-dt);const activated=input.pulse&&g.cooldown<=0;
 if(activated&&nearbyRepair(g)&&!nearbyRepair(g).optional){beginRepair(g,nearbyRepair(g));emit(g,'repairOpen');return;}
 if(activated){g.pulse=g.fever?.pulseDuration||RULES.pulse;g.cooldown=g.fever?.attackCooldown||RULES.cooldown;g.projectiles=[];emit(g,'pulse',{x:p.x+14,y:p.y+20});}
 updateMachinery(g,dt);p.oldBottom=p.y+p.h;
 if(g.cart)tickRail(g,input,dt);else walk(g,input,dt);
 tickEnemies(g,dt,damage);
 tickLab(g,input,activated,dt,damage);
 if(g.cart)for(const e of g.level.enemies)if(e.alive&&overlap({x:g.cart.x-g.cart.w/2,y:g.cart.y-32,w:g.cart.w,h:60},e)){e.alive=false;emit(g,'stomp',{x:e.x,y:e.y});}
 for(const e of g.level.enemies){if(!e.alive||!overlap(p,e))continue;if(g.fever){e.alive=false;emit(g,'feverKill',{x:e.x+16,y:e.y+14});continue;}
  if(p.vy>50&&p.oldBottom<=e.y+14&&(e.state!=='discharge'||g.pulse>0)){e.alive=false;if(g.cart){g.cart.vy=-360;g.cart.onRail=false;}else{p.vy=-440;p.jumps=1;}emit(g,'stomp',{x:e.x+16,y:e.y+14});}
  else if(g.pulse<=0)damage(g,e.x+16);
 }
 for(const l of g.level.lasers)if(laserActive(g,l)&&overlap(p,l))damage(g,l.x);
 for(const h of g.level.presses){const hit=pressState(g,h);if(hit.active&&overlap(p,hit))damage(g,h.x+h.w/2);}
 if(g.gameOver)return;
 interactions(g,activated);
 tickActionRepairs(g,input,activated,dt);
 tickResearch(g);
 if(p.y>g.level.killY){respawn(g,'fall');return;}
 const tx=clamp(p.x-VIEW.w*(g.cart?.35:.32),0,Math.max(0,g.level.width-VIEW.w));const ty=clamp(p.y-310,g.level.minY,0);
 g.camera+=(tx-g.camera)*Math.min(1,dt*6);g.cameraY+=(ty-g.cameraY)*Math.min(1,dt*4);
}
