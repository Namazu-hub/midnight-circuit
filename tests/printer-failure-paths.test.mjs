import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,updateGame} from '../dist/engine.mjs';
// Initial fixtures represent a missed upper platform. Recovery itself uses only
// ordinary inputs, including ACTION at the exit; no repairs or equipment granted.
function go(g,x,y){for(let i=0;i<1800;i++){const p=g.player,dx=x-p.x-14,dy=y-p.y-40;if(Math.abs(dx)<22&&Math.abs(dy)<6&&p.onGround)return true;updateGame(g,{left:dx<-6,right:dx>6,jump:p.onGround&&dy<-35||p.jumps===1&&p.vy>-60&&dy<-20,pulse:g.cooldown<=0});}return false;}
const cases=[
 ['S',8150,[[8180,510]],'secret-service'],
 ['C2',15420,[[15170,400],[15270,290],[15470,180]],'gallery-exit'],
 ['B2',12050,[[11850,400],[11950,290],[12050,180],[12280,180]],'duct-exit'],
 ['D2',18200,[[18330,400],[18030,290],[18100,180],[18460,180]],'tower-exit']
];
for(const [room,x,steps,exit]of cases)test(`${room}: a missed platform has an equipment-free return to a working door`,()=>{
 const g=createGame(3);g.rooms.active=room;Object.assign(g.player,{x,y:420,vy:100});g.respawn={x,y:470};g.research.funds=0;if(room==='C2')g.printer.incident=true;
 for(let i=0;i<120;i++)updateGame(g,{});
 for(const [xx,yy]of steps)assert.ok(go(g,xx,yy),`return failed at ${g.player.x},${g.player.y}`);
 assert.equal(g.equipment.weapon,null);assert.equal(g.deaths,0);
 const d=g.level.doors.find(d=>d.id===exit);updateGame(g,{interact:true});for(let i=0;i<180;i++)updateGame(g,{});
 assert.equal(g.rooms.active,d.to);assert.equal(g.deaths,0);
 if(room==='S')assert.equal(g.printer.journey.sites.shelf.progress,0,'optional fabrication must remain optional');
});
