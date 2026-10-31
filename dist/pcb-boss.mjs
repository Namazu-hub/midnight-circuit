import {clamp,overlap} from './world.mjs?v=4.9c';
import {grant} from './research.mjs?v=4.9c';
// Keep PICO and the active machine in view instead of following only PICO.
// The player always gets a margin even when a narrow test viewport cannot fit both.
export function pcbCameraTarget(g,width){const b=g.pcb?.boss;if(!b?.active||b.done)return null;
 const px=g.player.x+14,focus=b.phase===4&&b.ng?13250:b.headX;
 const center=(px+focus)/2-width/2,margin=Math.min(100,width*.15);
 return clamp(clamp(center,px-width+margin,px-margin),12200,Math.max(12200,14000-width));
}
// Camera recognition -> placement -> combined equipment -> AOI rejection -> player hit.
export function tickPCBBoss(g,input,activated,dt,hit){const b=g.pcb.boss,p=g.player;if(b.done)return;if(!b.active){if(p.x<12300)return;b.active=true;b.target=p.x;g.respawn={x:12100,y:470};}
 b.age+=dt;b.clock+=dt;b.feed=Math.max(0,b.feed-dt);p.x=clamp(p.x,12280,13950);
 if(b.age<3){if(!b.introSound){b.introSound=true;g.events.push({type:'coreInvasion'});}return;}
 const phase=b.clock%4;
 if(phase<1){b.target=clamp(p.x+14+(b.aimOffset||0),12400,13700);b.warning=true;}else b.warning=false;
 if(!b.fixed)b.headX+=clamp((b.phase===3&&b.belt===-1?12680:b.target)-b.headX,-dt*220,dt*220);
 b.headY=phase<1?100:phase<1.7?100+(phase-1)/.7*300:phase<2.3?400:400-(phase-2.3)/1.7*300;
 if(b.fixed&&b.phase<4)b.headY=200;
 if(b.phase<3){for(const head of pcbBossHeads(b).slice(1))if(head.striking&&overlap(p,{x:head.x-65,y:head.y,w:130,h:86}))hit(g,head.x);if(phase>=1.7&&phase<2.3&&overlap(p,{x:b.headX-65,y:b.headY,w:130,h:86}))hit(g,b.headX);
 if(phase>=2.3&&activated&&Math.hypot(p.x+14-b.headX,p.y+20-b.headY)<210){b.hp--;g.cooldown=Math.min(g.cooldown,1.2);if(b.hp<=4)b.phase=2;if(b.hp<=1){b.phase=3;b.parts=4;}g.events.push({type:'stomp',x:b.headX,y:b.headY});}
 if(b.phase===2&&b.feed<=0){b.printClock=(b.printClock||0)+dt;if(b.printClock>2.5){b.printClock=0;b.parts=Math.min(4,b.parts+1);}}
 }else if(b.phase===3){if(b.belt===-1&&b.magnet&&Math.abs(b.headX-12680)<60)b.fixed=true;if(b.fixed&&b.cool){b.temp=Math.max(25,b.temp-dt*65);if(b.temp<=55)b.phase=4;}}
 else if(b.ng){b.eject=(b.eject||0)+dt;b.headX=12680+Math.min(1,b.eject/1.5)*520;b.headY=250+Math.min(1,b.eject/1.5)*260;if(b.eject>1.5&&activated&&Math.hypot(p.x+14-13250,p.y+20-180)<110){b.done=true;g.level.relays.find(r=>r.id==='restored').on=true;grant(g,250,'PLACE-MASTER 復旧',13250,180);g.projectiles=[];g.events.push({type:'relay',x:13250,y:180});}}
}

// Shared pose/attack boxes for all visible heads. Secondary heads only work in phase 2.
export function pcbBossHeads(b){const heads=[{x:b.headX,y:b.headY||100,target:b.target,warning:!!b.warning,striking:b.clock%4>=1.7&&b.clock%4<2.3}];if(b.phase===2&&!b.done)for(const side of [-1,1]){const v=(b.clock+1.6)%4,x=clamp(b.headX+side*280,12400,13680);heads.push({x,y:v<1?110:v<1.7?110+(v-1)/.7*270:v<2.3?380:380-(v-2.3)/1.7*270,target:x,warning:v<1,striking:v>=1.7&&v<2.3});}return heads;}
