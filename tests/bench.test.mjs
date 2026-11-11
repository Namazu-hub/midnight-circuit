import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,updateGame} from '../dist/engine.mjs';
const step=(g,i={})=>{updateGame(g,i);g.events=[];};
function go(g,x,y){for(let f=0;f<2400;f++){const p=g.player,dx=x-p.x-14,dy=y-p.y-40;if(Math.abs(dx)<18&&Math.abs(dy)<10&&p.onGround)return;step(g,{right:dx>6,left:dx<-6,jump:p.onGround&&(dy<-35||Math.abs(dx)>150)||p.jumps===1&&p.vy>-60&&dy<-25,pulse:g.cooldown<=0});}throw Error(JSON.stringify({target:[x,y],p:g.player}));}
test('both service basements have an input-driven return to the surface without equipment or death',()=>{
 for(const [i,x,y] of [[0,3340,1340],[1,6050,1060]]){const g=createGame(0);Object.assign(g.player,{x,y,vx:0,vy:0});for(let n=0;n<30;n++)step(g);for(const [x,y] of g.level.benchReturns[i])go(g,x+65,y);go(g,i===0?4800:7250,510);assert.equal(g.deaths,0);assert.ok(g.player.y<530);assert.equal(g.player.boost,0);}
});
test('shaft descent is safe and vertical camera follows while ordinary gaps retain fall damage',()=>{
 const g=createGame(0);Object.assign(g.player,{x:3340,y:600});for(let n=0;n<150;n++)step(g);assert.equal(g.deaths,0);assert.ok(g.cameraY>100);const pit=createGame(0);Object.assign(pit.player,{x:2200,y:820});step(pit);assert.equal(pit.deaths,1);assert.equal(pit.player.hp,5);
});
test('map changes are confined to the workbench and preserve three collectibles and required repair IDs',()=>{const g=createGame(0);assert.equal(g.level.gears.length,3);assert.ok(g.level.relays.some(r=>r.id==='a'));assert.ok(g.level.relays.some(r=>r.id==='b'));assert.equal(g.level.benchRooms.length,2);assert.ok(new Set(g.level.platforms.filter(p=>p.type==='ground').map(p=>p.y)).size>=3);for(let i=1;i<8;i++)assert.equal(createGame(i).level.benchMap,undefined);});
