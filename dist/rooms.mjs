// Reusable, stage-local rooms. World state is shared; only the active bounds change.
import {clamp} from './world.mjs?v=4.5a';
export function setupRooms(g){if(!g.level.rooms)return;g.rooms={active:g.level.rooms[0].id,transition:null,cooldown:0,ride:null};}
export const roomAt=(g,x=g.player.x)=>g.level.rooms?.find(r=>x>=r.left&&x<r.right);
export const currentRoom=g=>g.level.rooms?.find(r=>r.id===g.rooms?.active);
export function doorReady(g,d){return !d.requires||d.requires.every(id=>g.level.relays.find(r=>r.id===id)?.on);}
export function roomControl(g){if(!g?.rooms||g.rooms.transition||g.rooms.cooldown>0||g.printer?.boss.active&&!g.printer.boss.done)return null;
 const p=g.player;return g.level.doors.find(d=>d.room===g.rooms.active&&Math.hypot(p.x+14-d.x,p.y+40-d.y)<80)||null;}
export function beginDoor(g,d){if(!d||!doorReady(g,d)||g.rooms.transition)return false;g.rooms.ride=null;g.rooms.transition={door:d,time:0,fromX:g.player.x,fromY:g.player.y,camera:g.camera,cameraY:g.cameraY,arrived:false};g.player.vx=0;g.player.vy=0;g.player.standing=null;g.events.push({type:'door'});return true;}
export function tickDoor(g,input,dt,viewWidth){if(!g.rooms)return false;g.rooms.cooldown=Math.max(0,g.rooms.cooldown-dt);
 if(!g.rooms.transition&&input.interact){const d=roomControl(g);if(d){if(!beginDoor(g,d))g.events.push({type:'doorLocked'});return true;}}
 const tr=g.rooms.transition;if(!tr)return false;tr.time+=dt;const p=g.player,d=tr.door;
 if(d.boss){const u=Math.min(1,tr.time/1.6);p.x=tr.fromX+(d.toX-tr.fromX)*u;p.y=d.toY-40;g.camera=tr.camera+(5400-tr.camera)*(u*u*(3-2*u));g.cameraY=tr.cameraY*(1-u);if(u===1){g.rooms.active=d.to;g.rooms.transition=null;g.rooms.cooldown=.8;g.printer.startBoss=true;}}
 else{if(d.lift&&tr.time<.6)p.y=tr.fromY-80*Math.min(1,tr.time/.6);if(tr.time<.4){p.x=tr.fromX+(d.x-14-tr.fromX)*tr.time/.4;}
  if(tr.time>=.6&&!tr.arrived){tr.arrived=true;g.rooms.active=d.to;p.x=d.toX-14;p.y=d.toY-40;p.onGround=false;p.jumps=0;p.invul=Math.max(p.invul,1);const r=currentRoom(g);g.camera=clamp(p.x-viewWidth*.32,r.left,Math.max(r.left,r.right-viewWidth));g.cameraY=clamp(p.y-310,r.minY||0,0);}
  if(tr.time>=1.15){g.rooms.transition=null;g.rooms.cooldown=.7;}}
 return true;}
export function roomFade(g){const tr=g.rooms?.transition;if(!tr)return 0;if(tr.door.boss)return Math.sin(Math.PI*Math.min(1,tr.time/1.6))*.25;return tr.time<.4?0:tr.time<.6?(tr.time-.4)/.2:Math.max(0,1-(tr.time-.72)/.43);}
export function constrainRoom(g){const r=currentRoom(g);if(r&&!g.rooms.transition)g.player.x=clamp(g.player.x,r.left+10,r.right-g.player.w-10);}
export function resetRooms(g){if(!g.rooms)return;g.rooms.active=roomAt(g,g.respawn.x)?.id||g.level.rooms[0].id;g.rooms.transition=null;g.rooms.ride=null;g.rooms.cooldown=.5;}
export function cableControl(g){if(!g?.rooms||g.rooms.ride)return null;return g.level.cables?.find(c=>c.room===g.rooms.active&&Math.hypot(g.player.x+14-c.x1,g.player.y+8-c.y1)<80)||null;}
export function tickCable(g,input,dt){if(!g.rooms)return false;const p=g.player;if(!g.rooms.ride&&input.interact){const c=cableControl(g);if(c){g.rooms.ride={c,u:0};p.standing=null;}}
 const ride=g.rooms.ride;if(!ride)return false;const c=ride.c;if(input.jump){g.rooms.ride=null;p.vx=300;p.vy=-625;p.jumps=1;p.onGround=false;return true;}
 ride.u=Math.min(1,ride.u+dt*360/Math.hypot(c.x2-c.x1,c.y2-c.y1));p.x=c.x1+(c.x2-c.x1)*ride.u-14;p.y=c.y1+(c.y2-c.y1)*ride.u+8;p.vx=0;p.vy=0;p.onGround=false;p.jumps=0;p.standing=null;if(ride.u>=1){g.rooms.ride=null;p.vx=160;p.invul=Math.max(p.invul,.3);}return true;}
