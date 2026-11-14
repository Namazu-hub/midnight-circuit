// Tower's second coil and relay yard. Uses the existing walk/collision system.
import {clamp} from './world.mjs?v=4.10.2';
export const BOOST=Object.freeze({speed:860,up:650,duration:.95});
export function relayYard(s){const get=id=>s.parts.find(e=>e.id===id)?.state==='locked';return {power:get('r2'),store:get('c2'),switch:get('sw'),ready:get('r2')&&get('c2')&&get('sw')};}
export function moveRelayYard(g,dt){const s=g.circuit,yard=relayYard(s),p=g.player;
 s.yard=yard;s.secondContact=p.onGround&&p.x+14>18250&&p.x+14<18360&&Math.abs(p.y+p.h+190)<8;
 // R supplies a conveyor elevator. C rides it as a physical load to the upper pad.
 s.carrierY??=-190;s.carrierDir??=-1;
 if(yard.power){s.carrierWait=Math.max(0,(s.carrierWait||0)-dt);if(!s.carrierWait){s.carrierY+=s.carrierDir*80*dt;if(s.carrierY<=-330){s.carrierY=-330;s.carrierDir=1;s.carrierWait=1.8;}if(s.carrierY>=-190){s.carrierY=-190;s.carrierDir=-1;s.carrierWait=1;}}}
 else s.carrierY+=clamp(-190-s.carrierY,-dt*80,dt*80);
 const a=g.level.platforms.find(a=>a.pcbRole==='circuit-carrier'),old=a.y;a.y=s.carrierY;a.dy=a.y-old;
 const e=s.parts.find(e=>e.id==='c2');if(!['locked','seated','dead'].includes(e.state)){e.homeY=e.x>19650?-380:a.y-e.h;e.y=e.homeY;e.max=e.x>19650||a.y<-323?19770:19620;}
 // The charge rail becomes a walkable path for the switch creature, not a flag-only door.
 s.gate=yard.ready;
 if(s.dash>0&&p.onGround){s.dash=0;s.trail=[];g.events.push({type:'land',x:p.x,y:p.y+p.h});}
}
export function tickRelayYard(g,input,dt){const s=g.circuit,p=g.player;
 if(s.secondContact&&input.jump&&s.signal.stable&&s.forward&&s.arm>=.99){p.vx=BOOST.speed;p.vy=-BOOST.up;s.dash=BOOST.duration;s.boostSpeed=BOOST.speed;s.launched=true;s.launches++;s.secondLaunched=true;p.onGround=false;p.standing=null;p.jumps=1;g.events.push({type:'coilLaunch',x:p.x,y:p.y});}
}
