import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,updateGame} from '../dist/engine.mjs';
import {actionKeys,equipmentKeys} from '../dist/input-map.mjs';
import {collectDrink,drink,useTool,toolHit,EQUIPMENT} from '../dist/equipment.mjs';
import {purchase} from '../dist/research.mjs';
import {journeyAction,tickJourney} from '../dist/printer-journey.mjs';
import {platformSolid,respawn} from '../dist/engine.mjs';
test('explicit printer abyss costs one HP while a lower recovery deck is safe',()=>{
 const g=createGame(3);g.rooms.active='B';Object.assign(g.player,{x:2200,y:640,vy:0});g.spawnGrace=0;
 for(let i=0;i<120;i++)updateGame(g,{});assert.equal(g.player.hp,6);assert.equal(g.player.y+40,680);
 Object.assign(g.player,{x:2200,y:760,vy:100});updateGame(g,{});assert.equal(g.player.hp,5);assert.equal(g.deaths,1);assert.ok(g.player.invul>1.9);
 g.player.hp=1;g.rooms.active='B';Object.assign(g.player,{x:2200,y:760});updateGame(g,{});assert.equal(g.lives,2);assert.equal(g.player.hp,6);
});
test('keyboard retains C and adds F, with disjoint V and B item edges',()=>{
 assert.deepEqual(actionKeys,['KeyC','KeyF']);assert.equal(equipmentKeys.KeyV,'weapon');assert.equal(equipmentKeys.KeyB,'drink');
});
test('stored drinks cap at three, heal once and only explicit drinking can overload',()=>{
 const g=createGame(0);g.player.hp=4;for(let i=0;i<3;i++)assert.ok(collectDrink(g,{}));assert.equal(collectDrink(g,{}),false);assert.equal(g.player.boost,0);
 updateGame(g,{drink:true});assert.equal(g.player.hp,5);assert.equal(g.player.boost,9);assert.equal(g.equipment.drinks,2);
 drink(g);assert.equal(g.player.hp,5);drink(g);assert.equal(g.player.hp,4);assert.equal(g.equipment.consumed,3);assert.equal(drink(g),false);
 const uses=g.equipment.consumed;respawn(g,'fall');assert.equal(g.equipment.consumed,uses);assert.equal(g.player.boost,0);
 assert.equal(EQUIPMENT.speed,1.55);
});
test('overload at HP1 consumes a normal life and the boost still expires',()=>{
 const g=createGame(0);g.equipment.consumed=2;g.equipment.drinks=1;g.player.hp=1;updateGame(g,{drink:true});assert.equal(g.lives,2);assert.equal(g.player.hp,6);assert.equal(g.equipment.drinks,0);assert.equal(g.player.boost,0);
 g.equipment.drinks=1;g.equipment.consumed=0;updateGame(g,{drink:true});g.player.boost=.001;updateGame(g,{});assert.equal(g.player.boost,0);
});
test('tool purchases charge once, reject replacement and exhaust exact durability',()=>{
 for(const [id,cost,uses] of [['iron',60,3],['scraper',40,5],['heatgun',75,2]]){
 const g=createGame();g.research.funds=500;assert.ok(purchase(g,id).ok);assert.equal(g.research.funds,500-cost);assert.equal(purchase(g,id).ok,false);assert.equal(g.research.funds,500-cost);
 for(let i=0;i<uses;i++){g.equipment.cooldown=0;assert.ok(useTool(g));const t={x:g.player.x+40,y:g.player.y,w:20,h:20};assert.ok(toolHit(g,t,'a'));assert.equal(toolHit(g,t,'a'),0);}
 assert.equal(g.equipment.weapon,null);assert.equal(useTool(g),false);
 }
});
test('paid fabrication charges only on start; emergency material is not spendable cash',()=>{
 const g=createGame(3);g.level.relays[0].on=true;g.research.funds=60;
 journeyAction(g,'site-transfer');assert.equal(g.research.funds,30);journeyAction(g,'site-transfer');assert.equal(g.research.funds,30);tickJourney(g,3);assert.equal(g.research.funds,30);
 g.research.funds=0;journeyAction(g,'site-shelf');assert.equal(g.printer.journey.sites.shelf.active,false);
 journeyAction(g,'site-maze-stairs');assert.ok(g.printer.journey.sites['maze-stairs'].active);assert.equal(g.research.funds,0);assert.equal(g.printer.journey.sites['maze-stairs'].assistance,15);
 const a=g.level.platforms.find(a=>a.printSite==='maze-stairs');assert.equal(platformSolid(g,a),false);tickJourney(g,3);assert.equal(platformSolid(g,a),true);respawn(g,'fall');assert.equal(platformSolid(g,a),true);assert.equal(g.research.funds,0);
});
test('maze has three required print spans and does not remove the old room graph',()=>{
 const g=createGame(3),gate=g.level.platforms.find(a=>a.mazeLock);assert.ok(platformSolid(g,gate));
 for(const id of ['maze-stairs','maze-bridge','maze-ramp']){g.printer.journey.sites[id].progress=1;}
 assert.equal(platformSolid(g,gate),false);assert.ok(g.level.printSites.find(a=>a.id==='maze-bridge').blocks[0][2]>600);assert.ok(g.level.doors.find(d=>d.id==='gallery'));assert.ok(g.level.doors.find(d=>d.id==='dawn'));
});
