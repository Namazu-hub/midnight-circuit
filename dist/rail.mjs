import {clamp,approach} from './world.mjs';
export function railAt(level,x,lane=1){
 const r=level.rails.find(r=>(r.lane??1)===lane&&x>=r.x1&&x<=r.x2);
 return r?{y:r.y1+(r.y2-r.y1)*(x-r.x1)/(r.x2-r.x1),slope:(r.y2-r.y1)/(r.x2-r.x1)}:null;
}
export function resetRail(g,x=160){
 const r=railAt(g.level,x);g.cart={lane:1,laneLatch:false,x,y:r.y-42,w:144,h:18,vy:0,speed:190,onRail:true,angle:Math.atan(r.slope),buffer:0};
 syncRider(g);
}
function syncRider(g){const c=g.cart,p=g.player;p.x=c.x-p.w/2;p.y=c.y-p.h;p.vx=c.speed;p.vy=c.vy;p.onGround=c.onRail;p.standing=null;p.jumps=c.onRail?0:1;p.face=1;}
export function tickRail(g,input,dt){
 const c=g.cart,p=g.player;
 const request=input.laneUp||input.laneDown;
 if(request&&!c.laneLatch&&g.level.branch&&c.x>=g.level.branch.start&&c.x<=g.level.branch.end&&c.onRail){const next=clamp(c.lane+(input.laneUp?-1:1),0,2);if(railAt(g.level,c.x,next)){c.lane=next;c.switching=.45;}}
 c.laneLatch=!!request;if(g.level.branch&&c.x>g.level.branch.end)c.lane=1;
 const target=(input.left?145:input.right?275:210)*(p.boost>0?1.25:1);
 c.speed=approach(c.speed,target,220*dt);c.buffer=input.jump?.15:Math.max(0,c.buffer-dt);
 if(c.buffer>0&&c.onRail){c.vy=-600;c.onRail=false;c.buffer=0;g.events.push({type:'jump',x:c.x,y:c.y});}
 const oldY=c.y,oldRail=railAt(g.level,c.x,c.lane);c.x=clamp(c.x+c.speed*dt,70,g.level.width-80);
 const r=railAt(g.level,c.x,c.lane);
 if(c.onRail&&r){if(c.switching>0){c.switching=Math.max(0,c.switching-dt);c.y=approach(c.y,r.y-42,420*dt);}else c.y=r.y-42;c.angle+= (Math.atan(r.slope)-c.angle)*Math.min(1,dt*14);}
 else{
   if(c.onRail){c.onRail=false;c.vy=(oldRail?.slope||0)*c.speed;}
   c.vy+=1240*dt;c.y+=c.vy*dt;c.angle=approach(c.angle,clamp(c.vy/1600,-.22,.28),dt*1.4);
   if(r&&c.vy>=0&&oldY+42<=r.y+Math.abs(r.slope*c.speed*dt)+7&&c.y+42>=r.y){c.y=r.y-42;c.vy=0;c.onRail=true;c.angle=Math.atan(r.slope);g.events.push({type:'railLand',x:c.x,y:c.y+42});}
 }
 syncRider(g);p.walk+=c.speed*dt;
}
