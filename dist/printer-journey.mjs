import {initNozzle,tickNozzle,nozzleAction} from './printer-nozzle.mjs?v=4.8a';
import {tetherAction} from './tether.mjs?v=4.8a';
import {initPeeling,tickPeeling,peelAction} from './printer-peeling.mjs?v=4.8a';
import {extendWorkshop,workshopAction} from './printer-workshop.mjs?v=4.8a';
import {extendChase,initChase,chaseAction,chaseSolid,tickChase} from './printer-chase.mjs?v=4.8a';
import {extendAdventure,initAdventure,adventureAction,adventureSolid,tickAdventure} from './printer-adventure.mjs?v=4.8a';
import {startFabrication} from './fabrication.mjs?v=4.8a';
// Stage-local story and fabrication state survives rooms and ordinary retries.
import {overlap} from './world.mjs?v=4.8a';
import {grant} from './research.mjs?v=4.8a';
export function extendJourney(L){
 L.fallZones=L.rooms.map(r=>({room:r.id,x:r.left,y:755,w:r.right-r.left,h:220}));
 for(const r of L.rooms)r.maxY=210;
 const pad=(x,y,w,extra={})=>L.platforms.push({x,y,w,h:18,type:'platform',...extra});
 L.printSites=[{id:'shelf',room:'S',x:7900,y:480,kind:'stairs',blocks:[[7980,400,120],[8100,300,120],[8220,200,160]]},{id:'transfer',room:'B2',x:10480,y:480,kind:'dock',blocks:[[10520,410,160],[10820,280,180]]},{id:'shelter',room:'C2',x:13060,y:480,kind:'shield',blocks:[[13130,380,36,130],[13020,380,150,18]]},{id:'chute',room:'D2',x:16940,y:480,kind:'ramp',blocks:[[17010,440,100],[17110,380,100],[17210,320,150]]}];
 for(const s of L.printSites){s.required=s.id!=='shelf';L.printerControls.push({id:'site-'+s.id,x:s.x,y:s.y,label:'造形 '+({stairs:'階段',dock:'搬送ドック',shield:'防護壁',ramp:'搬送段差'})[s.kind]});for(const [x,y,w,h] of s.blocks)pad(x,y,w,{h:h||18,printSite:s.id,shield:s.kind==='shield'});const last=s.blocks.at(-1);L.chips.push({x:last[0]+50,y:last[1]-30});L.drinks.push({x:last[0]+90,y:last[1]-30});}
 L.printerControls.push({id:'purge',x:14540,y:280,label:'非常用巻戻し'},{id:'spare',x:11450,y:480,label:'予備スプールを供給'});
 Object.assign(L.cables.find(c=>c.id==='escape-cable'),{x1:15000,y1:140,x2:14540,y2:240});pad(14620,300,300);pad(14920,260,150);
 // Dedicated cargo lane: the upper landing is reached by riding, not by the floor route.
 L.platforms=L.platforms.filter(a=>!(a.x>=10640&&a.x<11600&&a.y<340&&!a.printSite&&!a.benchy));
 L.platforms=L.platforms.filter(a=>!(a.benchy&&a.x===10600));
 L.cargoObstacles=[{x:11040,y:300,w:50,h:40},{x:11350,y:240,w:50,h:40}];
 L.cargoLane={room:'B2',start:10650,end:11550,y:370};
 pad(10650,370,200,{type:'platform',benchy:true,cargo:true,power:'feed'});pad(11150,260,180,{type:'platform',benchy:true,cargoSecond:true,power:'feed'});pad(11650,150,250);L.checkpoints.push({x:11730,y:150});
 L.chips.push(...[0,1,2,3,4,5].map(i=>({x:11680+i*30,y:120})));
 pad(6140,350,95,{defenseWall:true,shield:true});pad(6150,350,28,{h:160,defenseWall:true,shield:true});
 for(const [x,y] of [[5790,430],[5880,350],[6020,300]])pad(x,y,140,{coreStair:true});
 const designer=L.students.find(s=>s.name==='試作品の設計者');designer.color='#b4a3dd';designer.lines.unshift('「これ、何に使うの？」「知らん、作りたかった」');
 L.printerControls.find(c=>c.id==='stop').label='コア照明';
 extendAdventure(L);extendChase(L);extendWorkshop(L);
}
export function initJourney(g){g.printer.journey={progress:3,runawaySolved:false,capture:0,holder:false,holderSource:null,sites:Object.fromEntries(g.level.printSites.map(s=>[s.id,{progress:0,active:false,paid:false}])),cargo:{x:10650,waiting:true}};initAdventure(g);initPeeling(g);initNozzle(g);initChase(g);g.printer.ending={active:false,complete:false,age:0};}
export function journeySolid(g,a){const s=g.printer,j=s.journey;const chase=chaseSolid(g,a);if(chase!==null)return chase;const extra=adventureSolid(g,a);if(extra!==null)return extra;if(a.printSite)return j.sites[a.printSite].progress>=1;if(a.coreStair)return s.boss.cooled;return null;}
export function journeyAction(g,id){const s=g.printer,j=s.journey;if(nozzleAction(g,id))return true;if(tetherAction(g,id)){if(id==='fan1')g.printer.fans[0]=g.tethers[0].connected;return true;}if(peelAction(g,id))return true;if(workshopAction(g,id))return true;if(chaseAction(g,id))return true;if(adventureAction(g,id))return true;if(id.startsWith('site-')){const site=j.sites[id.slice(5)];if(site&&g.level.relays[0].on)startFabrication(g,g.level.printSites.find(s=>s.id===id.slice(5)),site);return true;}
 if(id==='purge'){if(s.incident){j.runawaySolved=true;s.factory.jobs=[];}return true;}
 if(id==='spare'){const e=s.foes.find(e=>e.kind==='spool'&&e.room==='B2');if(e&&!e.captured){e.alive=true;e.rewardPaid=true;e.x=11480;e.origin=11480;e.baseY=462;e.y=462;e.v=60;}return true;}
 return false;}
export function tickJourney(g,dt,hit=()=>{}){const s=g.printer,j=s.journey,b=s.boss,p=g.player;
 const target=b.done?100:b.active?99:g.level.relays[3].on?99:g.level.relays[2].on?92:s.safety?76:g.level.relays[1].on?37:g.level.relays[0].on?16:3;j.progress=Math.max(j.progress,target);
 if(s.safety&&!s.incident){s.incident=true;j.runawaySolved=false;g.events.push({type:'jobRunaway',x:p.x,y:p.y});}
 const roll=s.foes.find(e=>e.kind==='spool'&&e.room==='A'&&e.parked&&e.alive);if(roll&&!j.holder){j.holder=true;j.holderSource=roll.id;roll.captured=true;j.capture=0;}
 const spare=s.foes.find(e=>e.kind==='spool'&&e.room==='B2'&&e.alive&&!e.captured);if(spare&&Math.abs(spare.x+24-11880)<40&&!j.bonusHolder){spare.captured=true;spare.parked=true;spare.x=11856;spare.y=430;j.bonusHolder=true;j.progress=Math.max(j.progress,55);grant(g,20,'材料回収',11880,430);}
 if(g.level.relays[0].on&&!j.holder){j.holder=true;j.holderSource='reserve';}
 if(j.holder){j.capture=Math.min(1,j.capture+dt/.65);if(roll){roll.x+=(926-roll.x)*Math.min(1,dt*8);roll.y+=(430-roll.y)*Math.min(1,dt*8);}}
 for(const site of g.level.printSites){const state=j.sites[site.id];if(state.active&&state.progress<1){state.progress=Math.min(1,state.progress+dt/2.6);if(state.progress===1){for(const a of g.level.platforms.filter(a=>a.printSite===site.id))if(overlap(p,a)){p.y=a.y-p.h;p.vy=0;p.standing=a.id;p.onGround=true;}state.paid=true;}}}
 // The cargo starts when boarded, waits at both ends, and can always be recalled by boarding.
 const ship=g.level.platforms.find(a=>a.cargo),second=g.level.platforms.find(a=>a.cargoSecond),cargo=j.cargo;
 if(ship&&g.rooms.active==='B2'){for(const a of g.level.cargoObstacles)if(g.pulse<=0&&overlap(p,a))hit(g,a.x);const oldX=ship.x;if(p.standing===ship.id)cargo.waiting=false;if(!cargo.waiting){cargo.x=Math.min(11550,cargo.x+dt*125);if(cargo.x===11550)cargo.waiting=true;}ship.x=cargo.x;ship.dx=ship.x-oldX;ship.y=370-Math.max(0,cargo.x-10900)*.18;ship.dy=ship.y-(ship.lastY??ship.y);ship.lastY=ship.y;second.dx=0;second.dy=0;}
 tickNozzle(g,dt);tickPeeling(g,dt);tickAdventure(g,dt);tickChase(g,dt);
}
