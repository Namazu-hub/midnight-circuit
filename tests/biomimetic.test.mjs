import {tickHandRigs} from '../dist/hand-machines.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,platformSolid,respawn} from '../dist/engine.mjs';
test('biomimetic stage has eight connected vertical districts, three branch parts and distinct enemies',()=>{const g=createGame(1),L=g.level;assert.equal(L.bioRooms.length,8);assert.equal(L.gears.length,3);assert.ok(L.gears.some(p=>p.y>700));assert.ok(L.gears.some(p=>p.y<-1200));assert.ok(L.enemies.some(e=>e.bioShape==='hand'));assert.ok(L.enemies.some(e=>e.bioShape==='bone'));assert.ok(L.platforms.some(a=>a.axis==='y'));assert.equal(g.research.funds,0);assert.ok(!createGame(0).level.biomimetic);});
test('tendon drive requires calibration, funding and a balanced lock, with free retries',()=>{
 const g=createGame(1),[rig]=g.level.handRigs,bridge=g.level.platforms.find(a=>a.bioFinger);
 Object.assign(g.player,{x:rig.x-14,y:rig.y-40});g.pulse=2;g.research.funds=60;
 const operate=()=>tickHandRigs(g,{interact:true},0);
 operate();assert.equal(rig.paid,false);
 g.level.relays[0].on=true;g.research.funds=59;operate();assert.equal(g.research.funds,59);
 g.research.funds=60;operate();assert.equal(rig.paid,true);assert.equal(g.research.funds,0);
 operate();assert.equal(rig.locked,false);assert.equal(platformSolid(g,bridge),false);
 tickHandRigs(g,{},.5);operate();assert.equal(rig.locked,true);assert.equal(platformSolid(g,bridge),false);
 tickHandRigs(g,{},1.5);assert.equal(platformSolid(g,bridge),true);
 g.research.funds=50;respawn(g);assert.equal(g.research.funds,0);assert.equal(platformSolid(g,bridge),true);
});
test('gripper waits for a rider, lifts the specimen, docks, and can be ridden again after recovery',()=>{
 const g=createGame(1),rig=g.level.handRigs[1],block=g.level.platforms.find(a=>a.gripSpecimen);
 Object.assign(g.player,{x:rig.x-14,y:470});g.level.relays[1].on=true;g.research.funds=89;
 tickHandRigs(g,{interact:true},0);assert.equal(rig.paid,false);assert.equal(g.research.funds,89);
 g.research.funds=140;tickHandRigs(g,{interact:true},0);tickHandRigs(g,{},10);assert.equal(rig.phase,'dock');
 g.player.standing=block.id;tickHandRigs(g,{},.9);tickHandRigs(g,{},2.5);
 assert.equal(block.y,block.baseY-145);assert.equal(block.x,block.baseX+300);
 tickHandRigs(g,{},2.5);assert.equal(rig.delivered,true);assert.equal(block.x,block.baseX+600);
 assert.equal(g.research.funds,50);respawn(g);assert.equal(rig.phase,'dock');
 assert.equal(block.x,block.baseX);assert.equal(rig.paid,true);assert.equal(g.research.funds,0);
 g.player.standing=block.id;tickHandRigs(g,{},1/120);assert.equal(rig.phase,'close');
});
