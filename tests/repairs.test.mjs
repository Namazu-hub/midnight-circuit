import {completeHand} from './action-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,updateGame,respawn,platformSolid,pressState} from '../dist/engine.mjs';
import {tickResearch} from '../dist/research.mjs';
import {REPAIR_NAMES,createPuzzle,assessPuzzle,changePuzzle,gearRatio,titrationPH,beginRepair,commitRepair,jointPoints,truthTable} from '../dist/repairs.mjs';
import {solvePuzzle,solveSession} from './repair-inputs.mjs';
import {tickEnemies} from '../dist/enemies.mjs';
const approach=(g,r)=>Object.assign(g.player,{x:r.x-14,y:r.y-20});
test('all seven repair types at three difficulties start broken and solve through controls',()=>{
 for(const type of Object.keys(REPAIR_NAMES))for(let d=1;d<=3;d++){const s=createPuzzle(type,d);assert.equal(assessPuzzle(s).rank,0,`${type} ${d} starts broken`);solvePuzzle(s);assert.equal(assessPuzzle(s).rank,2,`${type} ${d} solves`);}
});
test('wiring enforces unique terminals and requires all three critical wires',()=>{
 const s=createPuzzle('wiring',3);changePuzzle(s,'wire',0,0);changePuzzle(s,'wire',0,1);assert.equal(s.connections[0],-1);
 for(let i=0;i<3;i++)changePuzzle(s,'wire',s.outputs.indexOf(s.labels[i]),i);assert.equal(assessPuzzle(s).rank,1);solvePuzzle(s);assert.equal(assessPuzzle(s).rank,2);
});
test('external gear speeds and direction follow tooth count and mesh count',()=>{
 assert.equal(gearRatio(24,48,0),-.5);assert.equal(gearRatio(24,48,1),.5);assert.equal(gearRatio(24,12,2),-2);
 const s=createPuzzle('gears',2);changePuzzle(s,'output',48);changePuzzle(s,'idlers',3);assert.equal(assessPuzzle(s).rank,1);changePuzzle(s,'idlers',1);assert.equal(assessPuzzle(s).rank,2);
});
test('titration matches strong acid/base examples and jumps near equivalence, without NaN',()=>{
 const s={acidConcentration:.1,acidVolume:25,acidAdded:0,baseConcentration:.1,baseVolume:0};
 assert.ok(Math.abs(titrationPH(s)-1)<1e-10);assert.ok(Math.abs(titrationPH(s,12.5)-Math.log10(30))<1e-8);assert.equal(titrationPH(s,25),7);
 assert.ok(titrationPH(s,25.01)-titrationPH(s,24.99)>4.5);assert.ok(Math.abs(titrationPH(s,37.5)-12.30103)<.00001);
 for(let i=0;i<=100;i+=.1)assert.ok(Number.isFinite(titrationPH(s,i)));
});
test('joint target uses relative forward kinematics; approximate pose is emergency repair',()=>{
 const points=jointPoints([90,-90]);assert.ok(Math.abs(points.at(-1).x-1)<1e-10);assert.ok(Math.abs(points.at(-1).y-1)<1e-10);
 const s=createPuzzle('joints');solvePuzzle(s);changePuzzle(s,'angle',s.target[0]+8,0);assert.equal(assessPuzzle(s).rank,1);
});
test('signal checks complete waveform, sensor checks both false alarms and missed objects',()=>{
 const s=createPuzzle('signal',3);changePuzzle(s,'phase',90);assert.equal(assessPuzzle(s).rank,0);solvePuzzle(s);assert.equal(assessPuzzle(s).rank,2);
 const sensor=createPuzzle('sensor',3);changePuzzle(sensor,'threshold',.5,0);assert.equal(assessPuzzle(sensor).rank,0); // Both sensors must reject independent false detections.
 changePuzzle(sensor,'threshold',.5,1);assert.equal(assessPuzzle(sensor).rank,2);
 changePuzzle(sensor,'threshold',1.4,1);assert.equal(assessPuzzle(sensor).rank,0);
});
test('logic circuit truth table and NOT handle all inputs',()=>{
 assert.deepEqual(truthTable({gates:['XOR'],invert:false},1),[0,1,1,0]);assert.deepEqual(truthTable({gates:['AND'],invert:true},1),[1,1,1,0]);
});
test('repair pauses physics, failed commit stays open, cancelled draft survives reopening',()=>{
 const g=createGame(0),r=g.level.relays.find(r=>r.puzzleType);approach(g,r);assert.ok(beginRepair(g,r));const time=g.time,x=g.player.x;updateGame(g,{right:true},1);assert.equal(g.time,time);assert.equal(g.player.x,x);
 assert.equal(commitRepair(g).ok,false);assert.ok(g.repairSession);changePuzzle(r.puzzle,'wire',0,0);g.repairSession=null;beginRepair(g,r);assert.equal(r.puzzle.connections[0],0);
});
test('complete repair rewards and grades persist through death and cannot pay twice',()=>{
 const g=createGame(0),r=g.level.relays.find(r=>r.puzzleType);approach(g,r);beginRepair(g,r);solveSession(g);tickResearch(g);assert.equal(g.research.funds,70);assert.equal(g.research.fullRepairs,1);
 beginRepair(g,r);solveSession(g);tickResearch(g);assert.equal(g.research.funds,70);respawn(g,'fall');tickResearch(g);assert.equal(r.repairRank,2);assert.equal(g.research.funds,70);
});
test('hand repair builds a bridge; lift calibration is idempotent; press and turret controls work',()=>{
 for(const [index,type] of [[4,'sensor'],[5,'joints'],[7,'logic']]){
  const g=createGame(index),r=g.level.relays.find(r=>r.puzzleType===type),p=g.level.platforms.find(p=>p.type==='moving');const range=p?.range;
  const bridge=g.level.platforms.find(p=>p.group===r.id);if(bridge)assert.equal(platformSolid(g,bridge),false);
  if(r.actionRepair)completeHand(g,r);approach(g,r);beginRepair(g,r);solveSession(g);tickResearch(g);tickResearch(g);
  if(bridge)assert.equal(platformSolid(g,bridge),true);if(index===4)assert.equal(p.range,range*.6);
  if(index===5){g.level.presses[0].clock=1.2;assert.equal(pressState(g,g.level.presses[0]).active,false);}
  if(index===7){const turret=g.level.enemies.find(e=>e.kind==='chip');approach(g,{x:turret.x,y:turret.y});for(let i=0;i<500;i++)tickEnemies(g,1/120,()=>{});assert.equal(g.projectiles.some(p=>p.kind==='bolt'),false);}
 }
});
test('gear repair restores a full brake without breaking cart rider or lane mechanics',()=>{
 const g=createGame(2),r=g.level.relays.find(r=>r.puzzleType==='gears');approach(g,r);beginRepair(g,r);solveSession(g);tickResearch(g);for(let i=0;i<240;i++)updateGame(g,{left:true});assert.equal(g.cart.speed,0);const x=g.cart.x;for(let i=0;i<60;i++)updateGame(g,{left:true});assert.equal(g.cart.x,x);
});
test('every repair family is placed in a course; repairs work with zero funds',()=>{
 const types=new Set();for(let i=0;i<8;i++){const g=createGame(i);for(const r of g.level.relays.filter(r=>r.puzzleType)){types.add(r.puzzleType);if(r.actionRepair)completeHand(g,r);approach(g,r);beginRepair(g,r);assert.ok(solveSession(g).ok);assert.equal(g.research.funds,0);}}
 assert.deepEqual([...types].sort(),Object.keys(REPAIR_NAMES).sort());
});
test('emergency repair upgrades once; full-repair cache stays locked until upgraded',()=>{
 const g=createGame(5),r=g.level.relays.find(r=>r.puzzleType==='joints');approach(g,r);beginRepair(g,r);solvePuzzle(r.puzzle);changePuzzle(r.puzzle,'angle',r.puzzle.target[0]+8,0);assert.equal(commitRepair(g).rank,1);tickResearch(g);assert.equal(g.research.funds,40);
 const box=g.level.researchCaches.find(b=>b.device===r.id);approach(g,box);tickResearch(g);assert.equal(box.got,false);
 approach(g,r);beginRepair(g,r);solveSession(g);tickResearch(g);assert.equal(g.research.funds,70);assert.equal(g.research.repairs,1);assert.equal(g.research.fullRepairs,1);
 approach(g,box);tickResearch(g);assert.equal(box.got,true);assert.equal(g.research.funds,145);tickResearch(g);assert.equal(g.research.funds,145);
});
