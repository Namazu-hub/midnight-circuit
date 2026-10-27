import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,platformSolid,respawn} from '../dist/engine.mjs';
import {beginRepair} from '../dist/repairs.mjs';
import {tickActionRepairs} from '../dist/action-repairs.mjs';
import {tickResearch,purchase} from '../dist/research.mjs';
import {playHand} from './hand-route.mjs';
const locate=(g,o)=>Object.assign(g.player,{x:o.x-14,y:o.y-20});
test('PICO completes all three joints using movement, double jumps, carry, install and pulse only',()=>{
 const g=createGame(3),r=playHand(g);assert.equal(r.on,true);assert.equal(r.repairRank,1);assert.equal(g.deaths,0);assert.equal(g.research.repairs,1);
 for(const p of g.level.platforms.filter(p=>p.actionDevice))assert.ok(platformSolid(g,p));
 const funds=g.research.funds;respawn(g,'fall');tickResearch(g);assert.equal(g.research.funds,funds);assert.equal(r.actionRepair.completed,3);locate(g,r);assert.ok(beginRepair(g,r));
});
test('unrepaired hand rejects precision bypass, distant inputs and ghost pulse shortcut',()=>{
 const g=createGame(3),r=g.level.relays.find(r=>r.actionRepair);locate(g,r);assert.equal(beginRepair(g,r),null);g.pulse=3;
 for(const p of g.level.platforms.filter(p=>p.actionDevice))assert.equal(platformSolid(g,p),false);
 tickActionRepairs(g,{interact:true},true,1);assert.equal(r.actionRepair.completed,0);
});
test('held part returns to its shelf after a fall; installed pin survives; only fresh green pulse locks',()=>{
 const g=createGame(3),r=g.level.relays.find(r=>r.actionRepair),a=r.actionRepair,p=a.parts[0],n=a.nodes[0];
 locate(g,p);tickActionRepairs(g,{},false,0);assert.equal(g.carriedPart,p.id);respawn(g,'fall');assert.equal(p.state,'loose');assert.equal(g.carriedPart,null);
 locate(g,p);tickActionRepairs(g,{},false,0);locate(g,n);tickActionRepairs(g,{interact:true},false,0);assert.ok(n.installed);respawn(g,'fall');assert.ok(n.installed);
 locate(g,n);g.time=0;tickActionRepairs(g,{},true,0);assert.equal(a.completed,0);g.time=1.6;g.pulse=2;tickActionRepairs(g,{},false,0);assert.equal(a.completed,0);
 tickActionRepairs(g,{},true,0);assert.equal(a.completed,1);assert.equal(platformSolid(g,g.level.platforms.find(p=>p.actionDevice)),false);tickActionRepairs(g,{},false,1);assert.equal(platformSolid(g,g.level.platforms.find(p=>p.actionDevice)),true);
});
test('purchased support widens timing but cannot auto-complete the action repair or charge twice',()=>{
 const g=createGame(3),r=g.level.relays.find(r=>r.actionRepair),v=g.level.vendors[0];locate(g,v);g.research.funds=200;
 assert.ok(purchase(g,'assist').ok);assert.ok(r.actionRepair.assisted);assert.equal(r.on,false);assert.equal(g.research.funds,120);assert.equal(purchase(g,'assist').ok,false);assert.equal(g.research.funds,120);
});
