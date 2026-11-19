import {tickEnemies} from '../dist/enemies.mjs';
import {tickWireRun} from '../dist/bio-wire.mjs';
import {tickDoor,roomControl,constrainRoom} from '../dist/rooms.mjs';
import {traverseBio} from './bio-route.mjs';
import {tickResearch} from '../dist/research.mjs';
import {nearbyRepair,beginRepair} from '../dist/repairs.mjs';
import {tickSkeleton,exposedPin} from '../dist/wire-skeleton.mjs';
import {pendingHandTask,tickHandRigs} from '../dist/hand-machines.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,platformSolid,respawn,updateGame} from '../dist/engine.mjs';
test('biomimetic stage has nine connected vertical districts, three branch parts and distinct enemies',()=>{const g=createGame(1),L=g.level;assert.equal(L.rooms.length,9);assert.equal(L.gears.length,3);assert.ok(L.gears.some(p=>p.y>700));assert.ok(L.gears.some(p=>p.y<-1200));assert.ok(L.enemies.some(e=>e.bioShape==='hand'));assert.ok(L.enemies.some(e=>e.bioShape==='bone'));assert.equal(L.wireRuns.length,5);assert.equal(g.research.funds,0);assert.ok(!createGame(0).level.biomimetic);});
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

});
test('the skeleton exposes one cable after each strike and keeps a finished arena open on retry',()=>{
 const g=createGame(1),boss=g.level.skeleton,[bridge,grip]=g.level.handRigs;
 const pulse=()=>tickSkeleton(g,true,0,()=>{});
 g.rooms.active='skeleton';g.player.x=10328;tickSkeleton(g,false,0,()=>{});assert.equal(boss.active,false);
 bridge.locked=grip.delivered=true;
 for(let phase=0;phase<3;phase++){
  const pin=exposedPin(boss);Object.assign(g.player,{x:pin.x-14,y:pin.y-20});
  pulse();assert.equal(boss.phase,phase);
  boss.time=2.25;g.player.x-=160;pulse();assert.equal(boss.phase,phase);
  g.player.x+=160;pulse();assert.equal(boss.phase,phase+1);
 }
 assert.equal(boss.done,true);assert.ok(pendingHandTask(g));assert.ok(boss.pieces.some(p=>p.kind==='skull'));
 for(let i=0;i<360;i++)tickSkeleton(g,false,1/120,()=>assert.fail('defeated skeleton attacked'));
 for(const name of ['skeletonCut','skeletonImpact','skeletonVictory'])assert.equal(g.events.filter(e=>e.type===name).length,1);
 assert.equal(pendingHandTask(g),undefined);
 g.research.funds=50;respawn(g);assert.equal(boss.done,true);
 const retry=createGame(1);retry.level.handRigs[0].locked=retry.level.handRigs[1].delivered=true;
 Object.assign(retry.level.skeleton,{active:true,phase:1,time:2.5});retry.research.funds=50;
 respawn(retry);assert.equal(retry.level.skeleton.phase,0);assert.equal(retry.level.skeleton.active,false);
 assert.equal(retry.level.handRigs[1].delivered,true);assert.match(pendingHandTask(retry),/骨格/);
});

test('all doors enforce room bounds, requirements and a transition before arrival',()=>{
 const g=createGame(1),L=g.level;
 for(const d of L.doors){
  g.rooms.active=d.room;g.rooms.cooldown=0;
  const room=L.rooms.find(r=>r.id===d.room);
  g.player.x=room.right+90;constrainRoom(g);assert.ok(g.player.x+g.player.w<room.right);
  Object.assign(g.player,{x:d.x-14,y:d.y-40});assert.equal(roomControl(g),d);
  tickDoor(g,{interact:true},.01,1200);
  if(d.checks.length){assert.equal(g.rooms.transition,null);continue;}
  assert.equal(g.rooms.active,d.room);assert.ok(g.rooms.transition);
  tickDoor(g,{},.65,1200);assert.equal(g.rooms.active,d.to);
  assert.equal(g.player.x,d.toX-14);tickDoor(g,{},.6,1200);assert.equal(g.rooms.transition,null);
 }
});
test('ordinary inputs visit all nine rooms, use every wire course, power the rigs and defeat the skeleton',()=>{
 const {g,visited}=traverseBio();
 assert.equal(g.finished,true);assert.equal(visited.size,9);assert.ok(g.level.wireRuns.every(r=>r.cleared));
 assert.ok(g.level.handRigs.every(r=>r.paid));assert.equal(g.level.skeleton.phase,3);assert.equal(g.deaths,0);
});

test('a missed transfer swings back, a cleared wire works both ways, and jumping releases it',()=>{
 const g=createGame(1),run=g.level.wireRuns[0];g.rooms.active=run.room;
 const ride=(pulse,dt=0,jump=false)=>tickWireRun(g,{jump},pulse,dt);
 Object.assign(g.player,{x:run.points[0][0]-14,y:run.points[0][1]-20});
 assert.equal(ride(false),false);ride(true);ride(true,.1);
 assert.equal(g.rooms.swing.b,run.points[1]);assert.equal(run.cleared,false);
 ride(false,3.2);assert.ok(Math.abs(g.player.x+14-run.points[0][0])<1);
 ride(true,1.65);ride(true,1.65);assert.ok(run.cleared);assert.equal(g.rooms.swing,null);
 ride(true);assert.equal(g.rooms.swing.reverse,true);ride(true,1.65);
 assert.equal(g.rooms.swing.b,run.points[0]);ride(false,.2,true);assert.equal(g.rooms.swing,null);assert.ok(g.player.vy<0);
});

test('full-health pit falls spend exactly 500 or end the run in stage two',()=>{
 for(const funds of [499,500]){
  const g=createGame(1);g.rooms.active='pinch';g.research.funds=funds;
  g.player.x=16920;g.player.y=-655;
  updateGame(g,{},1/120);
  assert.equal(g.gameOver,funds<500);assert.equal(g.research.funds,funds<500?499:0);
  assert.equal(g.player.hp,funds<500?0:6);assert.equal(g.deaths,funds<500?0:1);
  assert.equal(g.events.filter(e=>e.type==='fall').length,1);
 }
});
test('bone throw, palm pounce and severable thread follow their telegraphs',()=>{
 for(const shape of ['thrower','palm','spinner']){
  const g=createGame(1),e=g.level.enemies.find(e=>e.bioShape===shape);
  g.level.enemies=[e];g.rooms.active=e.room;Object.assign(g.player,{x:e.x+90,y:e.y});
  let hits=0;const tick=n=>{for(let i=0;i<n;i++)tickEnemies(g,1/120,()=>hits++);};
  tick(55);assert.equal(e.state,'aim');tick(100);
  if(shape==='thrower'){assert.equal(g.projectiles[0].kind,'bone');const vy=g.projectiles[0].vy;tick(15);assert.ok(g.projectiles[0].vy>vy);}
  if(shape==='palm'){assert.equal(e.state,'pounce');assert.ok(e.y<e.baseY);tick(100);assert.equal(e.y,e.baseY);}
  if(shape==='spinner'){assert.equal(e.state,'extend');tick(36);assert.ok(hits>0);g.pulse=.1;tick(1);assert.equal(e.state,'recover');assert.equal(e.aim,null);}
 }
});
