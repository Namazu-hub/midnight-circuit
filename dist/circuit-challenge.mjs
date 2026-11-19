// Tower's second coil and relay yard. Uses the existing walk/collision system.
import {clamp} from './world.mjs?v=4.11.0';
export const BOOST=Object.freeze({speed:860,up:650,duration:.95});
// Three selectable gameplay time scales. With a full charge the relay drops
// out after about 3, 8 or 15 seconds at its 25% hold threshold.
export const HOLD_RC=[{rise:.35,fall:2.2},{rise:1,fall:6},{rise:2,fall:11}];
export const HOLD_THRESHOLD=.25;
export function relayYard(s){
 const fixed=id=>s.parts.find(e=>e.id===id).state==='locked';
 const feed=fixed('r2'),store=fixed('c2'),magnet=feed&&s.yardLoad==='magnet';
 const rail=store&&s.chargeLevel>=HOLD_THRESHOLD;
 return {feed,power:feed&&!magnet,magnet,store,rail,switch:fixed('sw'),ready:fixed('sw')&&store&&feed&&s.contactLatched};
}
export function moveRelayYard(g,dt){
 const s=g.circuit,p=g.player,resistor=s.parts.find(e=>e.id==='r2');
 const supply=relayYard(s),rc=HOLD_RC[resistor.band],charging=supply.power&&supply.store;
 const target=charging?1:0,tau=charging?rc.rise:rc.fall;
 s.chargeLevel=supply.store?target+(s.chargeLevel-target)*Math.exp(-dt/tau):0;
 const yard=relayYard(s);
 s.yard=yard;s.secondContact=p.onGround&&p.x+14>18250&&p.x+14<18360&&Math.abs(p.y+p.h+190)<8;
 // R supplies a conveyor elevator. C rides it as a physical load to the upper pad.
 s.carrierY??=-190;s.carrierDir??=-1;
 if(yard.power){s.carrierWait=Math.max(0,(s.carrierWait||0)-dt);if(!s.carrierWait){s.carrierY+=s.carrierDir*80*dt;if(s.carrierY<=-330){s.carrierY=-330;s.carrierDir=1;s.carrierWait=1.8;}if(s.carrierY>=-190){s.carrierY=-190;s.carrierDir=-1;s.carrierWait=1;}}}
 // An unpowered lift holds its position on the mechanical brake.
 const a=g.level.platforms.find(a=>a.pcbRole==='circuit-carrier'),old=a.y;a.y=s.carrierY;a.dy=a.y-old;
 const e=s.parts.find(e=>e.id==='c2');if(!['locked','seated','dead'].includes(e.state)){e.homeY=e.x>19650?-380:a.y-e.h;e.y=e.homeY;e.max=e.x>19650||a.y<-323?19770:19620;}
 // The charge rail becomes a walkable path for the switch creature, not a flag-only door.
 s.gate=yard.ready;
 if(s.dash>0&&p.onGround){s.dash=0;s.trail=[];g.events.push({type:'land',x:p.x,y:p.y+p.h});}
}
export function tickRelayYard(g,input,dt){const s=g.circuit,p=g.player;
 if(s.secondContact&&input.jump&&s.signal.stable&&s.forward&&s.arm>=.99){p.vx=BOOST.speed;p.vy=-BOOST.up;s.dash=BOOST.duration;s.boostSpeed=BOOST.speed;s.launched=true;s.launches++;s.secondLaunched=true;p.onGround=false;p.standing=null;p.jumps=1;g.events.push({type:'coilLaunch',x:p.x,y:p.y});}
}
