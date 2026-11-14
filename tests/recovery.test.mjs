import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,updateGame,respawn,VIEW,platformSolid} from '../dist/engine.mjs';
import {RECOVERY_COST} from '../dist/recovery.mjs';
import {recycleEnemies,ENEMY_RESPAWN_DELAY} from '../dist/enemy-respawn.mjs';
import {tickResearch,GOODS,purchase} from '../dist/research.mjs';
import {readProgress,blankProgress} from '../dist/progress.mjs';
import {killPrinterFoe} from '../dist/printer-enemies.mjs';
import {tickPCBFoes} from '../dist/pcb-enemies.mjs';
const step=(g,i={})=>{updateGame(g,i);g.events=[];};

test('all eight stages recover for exactly 50, including at a zero remaining balance',()=>{
 assert.equal(RECOVERY_COST,50);
 for(let i=0;i<8;i++)for(const cause of ['damage','retry','fall']){
  const g=createGame(i);g.research.funds=50;g.player.hp=cause==='damage'?0:1;
  respawn(g,cause);assert.equal(g.gameOver,false);assert.equal(g.research.funds,0);assert.equal(g.player.hp,6);
  assert.equal(g.research.recoveries,1);assert.equal(g.lives,undefined);
  respawn(g,'retry');assert.equal(g.gameOver,true);assert.equal(g.research.funds,0);
  const count=g.events.filter(e=>e.type==='gameOver').length;respawn(g,'retry');assert.equal(g.events.filter(e=>e.type==='gameOver').length,count);
 }
});
test('49 cannot buy recovery, but a nonfatal fall is still only one HP',()=>{
 const g=createGame();g.research.funds=49;respawn(g,'fall');assert.equal(g.player.hp,5);assert.equal(g.research.funds,49);assert.equal(g.gameOver,false);
 respawn(g,'retry');assert.equal(g.gameOver,true);assert.equal(g.research.funds,49);assert.equal(g.research.recoveries,undefined);
});
test('funds replace remaining lives without minting money or dropping old records and fever',()=>{
 const old={runLives:2,funds:125,completed:[true],gears:[3],best:[42],sound:true,lap:{number:3,seen:[true],won:true},pending:{index:0,phase:'intro',result:{gears:3,chips:4,elapsed:42}}};
 const p=readProgress(old,8);assert.equal(p.funds,125);assert.equal(p.runLives,undefined);assert.equal(p.runOver,false);assert.equal(p.completed[0],true);assert.equal(p.best[0],42);assert.deepEqual(p.pending,old.pending);assert.equal(p.lap.won,true);
 assert.equal(readProgress({...old,runLives:0},8).runOver,true);
 assert.equal(readProgress({...p,funds:0},8).runOver,false);
 assert.equal(readProgress(JSON.parse(JSON.stringify({...p,runOver:true})),8).runOver,true);
 assert.equal(blankProgress(8).runOver,false);assert.equal(blankProgress(8).funds,0);assert.ok(!GOODS.some(i=>i.id==='battery'));
});
test('ordinary enemies regenerate indefinitely offscreen and each new defeat pays once',()=>{
 for(const i of [0,1,2,4,6,7]){
  const g=createGame(i),e=g.level.enemies[0];g.level.chips=[];g.level.relays.forEach(r=>r.rewardPaid=true);
  for(let n=0;n<4;n++){
   e.alive=false;tickResearch(g);tickResearch(g);assert.equal(g.research.funds,15*(n+1));
   g.camera=e.baseX;g.cameraY=e.baseY;recycleEnemies(g,VIEW);g.time+=ENEMY_RESPAWN_DELAY+1;recycleEnemies(g,VIEW);assert.equal(e.alive,false,'no visible pop-in');
   g.camera=e.baseX+1500;g.cameraY=0;g.player.x=g.camera;recycleEnemies(g,VIEW);assert.equal(e.alive,true);
   tickResearch(g);assert.equal(g.research.funds,15*(n+1));
  }
 }
});
test('printer and PCB combat enemies replenish funds while tool and terrain actors stay excluded',()=>{
 for(const i of [3,5]){
  const g=createGame(i),stock=i===5?g.enemyStocks.find(s=>s.enemy.room==='A'):g.enemyStocks[0],e=stock.enemy;
  assert.ok(stock);
  assert.ok(!g.enemyStocks.some(s=>['spool','scraperBot','feeder','bridge','tombstone'].includes(s.enemy.kind)));
  for(let n=0;n<3;n++){
   if(i===3)killPrinterFoe(g,e);else{g.rooms.active=e.room;g.player.x=e.x;g.player.y=e.y;tickPCBFoes(g,true,1/120,()=>{});}
   assert.equal(e.alive,false);assert.equal(g.research.funds,15*(n+1));
   recycleEnemies(g,VIEW);g.time+=19;g.rooms.active='H';g.camera=19000;g.player.x=19000;recycleEnemies(g,VIEW);assert.equal(e.alive,true);
  }
 }
});
test('the initial lift can be funded after spending all money; its fare is still required',()=>{
 const g=createGame(0);g.research.funds=10;assert.ok(purchase(g,'hint').ok);assert.equal(g.research.funds,0);
 const e=g.level.enemies[0];e.alive=false;tickResearch(g);assert.equal(g.research.funds,15);
 const a=g.level.platforms.find(a=>a.benchMachine==='lift'),m=g.level.benchMachines[0];
 Object.assign(g.player,{x:890,y:470,onGround:true,standing:a.id});step(g);assert.equal(m.paid,true);assert.equal(g.research.funds,5);
});
test('unpaid lift barrier blocks boosted overpasses and below-floor approaches',()=>{
 for(const [y,vy] of [[470,-1100],[-290,0],[520,-555]]){
  const g=createGame(0);g.level.enemies=[];g.level.chips=[];g.level.drinks=[];
  Object.assign(g.player,{x:980,y,vy,vx:400,boost:9,jumps:1});
  let furthest=0;for(let n=0;n<150&&!g.deaths;n++){step(g,{right:true});furthest=Math.max(furthest,g.player.x+g.player.w);}
  assert.ok(furthest<=1010.01,`${y}: ${furthest}`);assert.equal(g.level.benchMachines[0].paid,false);
 }
});
test('a missed lift returns empty without recalling a standing rider or charging twice',()=>{
 const g=createGame(0);g.level.enemies=[];g.research.funds=10;
 const a=g.level.platforms.find(p=>p.benchMachine==='lift'),m=g.level.benchMachines[0];
 Object.assign(g.player,{x:890,y:470});for(let n=0;n<400;n++)step(g);assert.equal(a.y,290);assert.equal(g.player.standing,a.id);
 for(let n=0;n<150;n++)step(g,{left:true});for(let n=0;n<550;n++)step(g);assert.equal(a.y,510);assert.equal(m.on,false);assert.equal(m.paid,true);
});
test('wiring powers the actual exit bridge; pulse cannot bypass it and repair persists through recovery',()=>{
 const g=createGame(),a=g.level.platforms.find(a=>a.benchExitBridge),r=g.level.relays[0];
 g.pulse=2;assert.equal(platformSolid(g,a),false);
 for(const i of [1,0,2]){const b=g.level.wireButtons[i];Object.assign(g.player,{x:b.x+16,y:b.y-40,vx:0,vy:0,onGround:true});step(g);}
 assert.equal(r.on,true);assert.equal(platformSolid(g,a),true);const earned=g.research.earned;
 g.research.funds=50;respawn(g,'retry');assert.equal(platformSolid(g,a),true);tickResearch(g);assert.equal(g.research.earned,earned);
});
