import {clamp,approach,overlap} from './world.mjs?v=4.8a';
import {grant} from './research.mjs?v=4.8a';
import {killPrinterFoe} from './printer-enemies.mjs?v=4.8a';
export const CHASE=Object.freeze({left:20400,right:24100,release:20860,start:20580,holder:23730,radius:115,startSpeed:220,maxSpeed:335});
export function extendChase(L){
 const C=CHASE;L.width=C.right;L.rooms.push({id:'A2',left:C.left,right:C.right,minY:-80,maxY:160,name:'巨大材料搬送路'});
 const pad=(x,y,w,h=18,extra={})=>L.platforms.push({x,y,w,h,type:'platform',...extra});
 pad(C.left,300,620,220,{type:'ground'});
 for(let x=21020;x<23770;x+=30){if(x>=21800&&x<21890||x>=22910&&x<23000)continue;pad(x,chaseFloor(x),31,220,{type:'ground'});}
 pad(22910,chaseFloor(22910),90,18,{type:'leaf',chaseCrumble:true});
 pad(23750,510,350,220,{type:'ground'});
 L.chaseObstacles=[21450,22220,23140,23450].map(x=>({x,y:chaseFloor(x)-65,w:55,h:65,broken:false}));
 for(const [i,a] of L.chaseObstacles.entries())pad(a.x,a.y,a.w,a.h,{chaseObstacle:i});
 pad(23790,80,70,335,{chaseCeiling:true});
 L.printerControls.push({id:'release-spool',x:C.release,y:270,label:'固定ピン解除'});
 L.checkpoints.push({x:20750,y:300});L.fallZones.push({room:'A2',x:C.left,y:700,w:C.right-C.left,h:250});
 L.printerSpawns.push(...[['benchy',21600],['badBenchy',22680],['cube',23310]].map(([kind,x],i)=>({id:'chase-foe-'+i,kind,x,y:chaseFloor(x)-48,room:'A2',chase:true})));
 for(let i=0;i<10;i++)L.chips.push({x:21950+i*35,y:180});L.drinks.push({x:20810,y:265});
 const enter=L.doors.find(d=>d.id==='ab'),back=L.doors.find(d=>d.id==='ab-back');
 Object.assign(enter,{to:'A2',toX:20500,toY:300});Object.assign(back,{room:'A2',x:20500,y:300,to:'A',toX:1130,toY:510});
 L.doors.push({id:'chase-exit',room:'A2',x:24020,y:510,to:'B',toX:1260,toY:510,requiresChase:true,label:'搬送ハッチ'},
 {id:'chase-back',room:'B',x:1260,y:510,to:'A2',toX:24020,toY:510,label:'搬送ハッチ'});
}
export const chaseFloor=x=>Math.min(510,300+Math.max(0,x-21020)*.095);
export function initChase(g){g.printer.chase={active:false,done:false,x:CHASE.start,y:300-CHASE.radius,speed:0,age:0,attempts:0,paid:false,impact:0};}
export function resetChase(g){const c=g.printer?.chase;if(!c||!c.active||c.done)return;c.active=false;c.x=CHASE.start;c.y=300-CHASE.radius;c.speed=0;c.age=0;g.respawn={x:20810,y:260};
 for(const a of g.level.chaseObstacles)a.broken=false;
 for(const e of g.printer.foes.filter(e=>e.chase)){e.alive=true;e.x=e.origin;e.y=e.baseY;e.clock=0;e.v=0;}
}
export function chaseAction(g,id){if(id!=='release-spool')return false;const c=g.printer.chase;if(c.done||c.active)return true;c.active=true;c.age=0;c.attempts++;c.speed=0;g.respawn={x:20810,y:260};g.events.push({type:'chaseRelease',x:CHASE.start,y:c.y});return true;}
export function chaseSolid(g,a){if(a.chaseObstacle!==undefined)return !g.level.chaseObstacles[a.chaseObstacle].broken;return null;}
export function tickChase(g,dt){const c=g.printer.chase,p=g.player,C=CHASE;if(!c)return;c.impact=Math.max(0,c.impact-dt);
 if(!c.active||c.done||g.rooms.active!=='A2')return;c.age+=dt;if(c.age<(c.attempts>1?.25:.8))return;
 const gap=p.x-c.x;const target=clamp(245+(gap-360)*.16,C.startSpeed,C.maxSpeed);c.speed=approach(c.speed,target,dt*180);c.x=Math.min(C.holder,c.x+c.speed*dt);c.y=chaseFloor(c.x)-C.radius;
 const box={x:c.x-C.radius,y:c.y-C.radius,w:C.radius*2,h:C.radius*2};
 for(const a of g.level.chaseObstacles)if(!a.broken&&overlap(box,a)){a.broken=true;c.impact=.18;g.events.push({type:'chaseBreak',x:a.x,y:a.y});}
 for(const e of g.printer.foes)if(e.alive&&e.chase&&overlap(box,e))killPrinterFoe(g,e);
 const caught=Math.hypot(c.x-clamp(c.x,p.x,p.x+p.w),c.y-clamp(c.y,p.y,p.y+p.h))<C.radius-8;
 for(const a of g.level.platforms)if(a.chaseCrumble&&c.x>a.x)a.missing=Math.max(a.missing,1);
 if(c.x<C.holder&&caught&&p.invul<=0&&g.spawnGrace<=0){g.printer.forceFall=true;g.events.push({type:'chaseCaught',x:p.x,y:p.y});return;}
 if(c.x>=C.holder&&p.x>C.holder+130){c.active=false;c.done=true;c.impact=.5;g.printer.journey.progress=Math.max(g.printer.journey.progress,28);g.printer.journey.giantHolder=true;g.events.push({type:'chaseLoaded',x:C.holder,y:390});if(!c.paid){c.paid=true;grant(g,40,'材料搬送完了',C.holder,390);}}
}
