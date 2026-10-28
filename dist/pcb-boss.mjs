import {clamp,overlap} from './world.mjs?v=4.9b';
import {grant} from './research.mjs?v=4.9b';
// Camera recognition -> placement -> combined equipment -> AOI rejection -> player hit.
export function tickPCBBoss(g,input,activated,dt,hit){const b=g.pcb.boss,p=g.player;if(b.done)return;if(!b.active){if(p.x<12300)return;b.active=true;b.target=p.x;g.respawn={x:12100,y:470};}
 b.age+=dt;b.clock+=dt;b.feed=Math.max(0,b.feed-dt);p.x=clamp(p.x,12280,13950);
 if(b.age<3)return;
 const phase=b.clock%4;
 if(phase<1){b.target=clamp(p.x+14,12400,13700);b.warning=true;}else b.warning=false;
 if(!b.fixed)b.headX+=clamp((b.phase===3&&b.belt===-1?12680:b.target)-b.headX,-dt*220,dt*220);
 b.headY=phase<1?100:phase<1.7?100+(phase-1)/.7*300:phase<2.3?400:400-(phase-2.3)/1.7*300;
 if(b.fixed&&b.phase<4)b.headY=200;
 if(b.phase<3){if(phase>=1.7&&phase<2.3&&overlap(p,{x:b.headX-65,y:b.headY,w:130,h:75}))hit(g,b.headX);
 if(phase>=2.3&&activated&&Math.hypot(p.x+14-b.headX,p.y+20-b.headY)<210){b.hp--;g.cooldown=Math.min(g.cooldown,1.2);if(b.hp<=4)b.phase=2;if(b.hp<=1){b.phase=3;b.parts=4;}g.events.push({type:'stomp',x:b.headX,y:b.headY});}
 if(b.phase===2&&b.feed<=0){b.printClock=(b.printClock||0)+dt;if(b.printClock>2.5){b.printClock=0;b.parts=Math.min(4,b.parts+1);}}
 }else if(b.phase===3){if(b.belt===-1&&b.magnet&&Math.abs(b.headX-12680)<60)b.fixed=true;if(b.fixed&&b.cool){b.temp=Math.max(25,b.temp-dt*65);if(b.temp<=55)b.phase=4;}}
 else if(b.ng){b.eject=(b.eject||0)+dt;b.headX=12680+Math.min(1,b.eject/1.5)*520;b.headY=250+Math.min(1,b.eject/1.5)*260;if(b.eject>1.5&&activated&&Math.hypot(p.x+14-13250,p.y+20-180)<110){b.done=true;g.level.relays.find(r=>r.id==='restored').on=true;grant(g,250,'PLACE-MASTER 復旧',13250,180);g.projectiles=[];g.events.push({type:'relay',x:13250,y:180});}}
}
