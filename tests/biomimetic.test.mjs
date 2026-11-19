import {tickResearch} from '../dist/research.mjs';
import {nearbyRepair,beginRepair} from '../dist/repairs.mjs';
import {tickSkeleton,exposedPin} from '../dist/wire-skeleton.mjs';
import {pendingHandTask,tickHandRigs} from '../dist/hand-machines.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,platformSolid,respawn} from '../dist/engine.mjs';
test('biomimetic stage has nine connected vertical districts, three branch parts and distinct enemies',()=>{const g=createGame(1),L=g.level;assert.equal(L.bioRooms.length,9);assert.equal(L.gears.length,3);assert.ok(L.gears.some(p=>p.y>700));assert.ok(L.gears.some(p=>p.y<-1200));assert.ok(L.enemies.some(e=>e.bioShape==='hand'));assert.ok(L.enemies.some(e=>e.bioShape==='bone'));assert.ok(L.platforms.some(a=>a.axis==='y'));assert.equal(g.research.funds,0);assert.ok(!createGame(0).level.biomimetic);});
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

test('each calibration requires both room drums and pays its reward once',()=>{
 const g=createGame(1),controls=g.level.wireControls;
 for(const r of g.level.relays){
  const drums=controls.filter(o=>o.relay===r.id);
  assert.equal(drums.length,2);
  const funds=g.research.funds;
  for(const drum of drums){
   Object.assign(g.player,{x:drum.x-14,y:drum.y-40});
   assert.equal(nearbyRepair(g,true),null);assert.equal(beginRepair(g,r),null);
   assert.equal(r.on,false);
   for(let i=0;i<drum.target;i++){
    tickHandRigs(g,{},0,true);
    tickHandRigs(g,{},0,false);
    assert.equal(drum.angle,i+1);
   }
  }
  assert.equal(r.on,true);
  tickResearch(g);tickResearch(g);
  assert.equal(r.repairRank,2);assert.equal(g.research.funds,funds+70);
 }
 for(const hatch of controls.filter(o=>o.kind==='hatch')){
  Object.assign(g.player,{x:hatch.x-14,y:hatch.y-40});
  tickHandRigs(g,{},0,true);assert.equal(g.player.y,hatch.y-40);
  tickHandRigs(g,{interact:true},0);assert.equal(g.player.x,hatch.toX-14);assert.equal(g.player.y,hatch.toY-40);
 }
});
test('the skeleton exposes one cable after each strike and keeps a finished arena open on retry',()=>{
 const g=createGame(1),boss=g.level.skeleton,[bridge,grip]=g.level.handRigs;
 const pulse=()=>tickSkeleton(g,true,0,()=>{});
 g.player.x=10328;tickSkeleton(g,false,0,()=>{});assert.equal(boss.active,false);
 bridge.locked=grip.delivered=true;
 for(let phase=0;phase<3;phase++){
  const pin=exposedPin(boss);Object.assign(g.player,{x:pin.x-14,y:pin.y-20});
  pulse();assert.equal(boss.phase,phase);
  boss.time=2.25;g.player.x-=160;pulse();assert.equal(boss.phase,phase);
  g.player.x+=160;pulse();assert.equal(boss.phase,phase+1);
 }
 assert.equal(boss.done,true);assert.equal(pendingHandTask(g),undefined);
 g.research.funds=50;respawn(g);assert.equal(boss.done,true);
 const retry=createGame(1);retry.level.handRigs[0].locked=retry.level.handRigs[1].delivered=true;
 Object.assign(retry.level.skeleton,{active:true,phase:1,time:2.5});retry.research.funds=50;
 respawn(retry);assert.equal(retry.level.skeleton.phase,0);assert.equal(retry.level.skeleton.active,false);
 assert.equal(retry.level.handRigs[1].delivered,true);assert.match(pendingHandTask(retry),/骨格/);
});
