import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,respawn,platformSolid} from '../dist/engine.mjs';
import {tickResearch,purchase,nearVendor,balance} from '../dist/research.mjs';
import {readProgress} from '../dist/progress.mjs';
test('grants for enemies, pickups and repairs occur once per attempt and survive retry',()=>{
 const g=createGame(0);g.level.enemies[0].alive=false;g.level.chips[0].got=true;g.level.relays[0].on=true;
 tickResearch(g);assert.equal(g.research.funds,60);assert.equal(g.research.kills,1);assert.equal(g.research.repairs,1);
 respawn(g);tickResearch(g);assert.equal(g.research.funds,60);
});
test('repair creates solid optional stairs; pulse cannot unlock them early',()=>{
 const g=createGame(0),r=g.level.relays.find(r=>r.researchLink.length),a=g.level.platforms[r.researchLink[0]];
 g.pulse=3;assert.equal(platformSolid(g,a),false);r.on=true;r.repairRank=2;tickResearch(g);assert.equal(platformSolid(g,a),true);
 const box=g.level.researchCaches.find(c=>c.device===r.id);g.player.x=box.x-14;g.player.y=box.y-20;tickResearch(g);const paid=g.research.funds;
 tickResearch(g);assert.equal(g.research.funds,paid);assert.equal(g.research.caches,1);respawn(g);assert.equal(platformSolid(g,a),true);
});
test('shop requires proximity and balance; useless purchases never charge',()=>{
 const g=createGame(0);g.research.funds=200;assert.ok(nearVendor(g));
 assert.equal(purchase(g,'heal').ok,false);assert.equal(g.research.funds,200);
 g.player.hp=2;assert.equal(purchase(g,'heal').ok,true);assert.equal(g.player.hp,5);assert.equal(g.research.funds,175);
 assert.equal(purchase(g,'drink').ok,true);assert.equal(g.player.boost,0);assert.equal(g.equipment.drinks,1);g.equipment.drinks=3;assert.equal(purchase(g,'drink').ok,false);
 g.player.x+=1000;const funds=g.research.funds;assert.equal(purchase(g,'battery').ok,false);assert.equal(g.research.funds,funds);
});
test('battery is capped and hints are optional; zero funds do not alter repairs',()=>{
 const g=createGame(0);g.research.funds=100;assert.equal(purchase(g,'battery').ok,false);g.lives=2;
 assert.equal(purchase(g,'battery').ok,true);assert.equal(g.lives,3);assert.equal(g.research.funds,0);
 assert.equal(purchase(g,'hint').ok,false);assert.ok(g.level.relays.every(r=>!r.on));
});
test('assistance pays one repair grant and updates linked platforms',()=>{
 const g=createGame(0),r=g.level.relays.find(r=>r.mode);g.level.vendors=[{x:r.x,y:r.y+40}];g.player.x=r.x;g.player.y=r.y;g.research.funds=200;
 assert.equal(purchase(g,'assist').ok,true);assert.equal(r.on,true);assert.equal(g.research.funds,160);tickResearch(g);assert.equal(g.research.funds,160);
});
test('old saves start with no funds, malformed balances are bounded',()=>{
 assert.equal(readProgress({},8).funds,0);assert.equal(readProgress({funds:Infinity},8).funds,0);
 assert.equal(readProgress({funds:9999999},8).funds,99999);assert.equal(balance(-3),0);
 assert.equal(readProgress(JSON.parse(JSON.stringify({funds:140})),8).funds,140);
});
