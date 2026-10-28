import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,updateGame} from '../dist/engine.mjs';
import {actionKeys,equipmentKeys} from '../dist/input-map.mjs';
import {collectDrink,drink,useTool,toolHit,EQUIPMENT} from '../dist/equipment.mjs';
import {purchase} from '../dist/research.mjs';
import {journeyAction,tickJourney} from '../dist/printer-journey.mjs';
import {platformSolid,respawn} from '../dist/engine.mjs';
import {CHASE,chaseAction,tickChase} from '../dist/printer-chase.mjs';
import {beginDefense,tickDefense,coreReady} from '../dist/printer-defense.mjs';
import {dragonBoxes} from '../dist/dragon.mjs';
import {tickPrinter} from '../dist/printer.mjs';
import {beginDoor,doorReady,tickDoor} from '../dist/rooms.mjs';
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
test('giant spool is button-triggered, crushes props and resets a failed chase without refund farming',()=>{
 const g=createGame(3),c=g.printer.chase;g.rooms.active='A2';g.player.x=21000;tickChase(g,5);assert.equal(c.x,CHASE.start);assert.equal(c.active,false);
 chaseAction(g,'release-spool');assert.ok(c.active);c.age=2;c.x=21450;c.speed=220;g.player.x=22000;tickChase(g,.01);assert.ok(g.level.chaseObstacles[0].broken);
 const foe=g.printer.foes.find(e=>e.chase);c.x=foe.x;c.y=foe.y;tickChase(g,.01);assert.equal(foe.alive,false);const cash=g.research.funds;
 g.spawnGrace=0;g.player.invul=0;Object.assign(g.player,{x:c.x,y:c.y-20});updateGame(g,{});assert.equal(g.player.hp,5);assert.equal(g.rooms.active,'A2');assert.equal(c.active,false);assert.equal(c.x,CHASE.start);assert.ok(g.level.chaseObstacles.every(a=>!a.broken));assert.ok(g.player.invul>1.9);assert.equal(g.research.funds,cash);
});
test('giant loading is one-time and never re-awards the existing supply repair',()=>{
 const g=createGame(3);g.rooms.active='A2';const c=g.printer.chase;g.level.relays[0].on=true;g.level.relays[0].rewardPaid=true;chaseAction(g,'release-spool');c.age=20;c.x=CHASE.holder;g.player.x=24000;tickChase(g,.1);assert.ok(c.done);assert.equal(g.printer.journey.progress,28);const cash=g.research.funds;chaseAction(g,'release-spool');tickChase(g,30);assert.equal(g.research.funds,cash);assert.equal(c.active,false);
});
test('moving dragon body and either tail side use shared pose while cooled traversal is safe',()=>{
 for(const dir of [-1,1]){const g=createGame(3),b=g.printer.boss;g.rooms.active='E';b.active=true;b.age=10;b.phase=3;b.clock=3;b.turn.fill(dir);b.face=dir;g.player.x=b.x+500;let hits=0;const a=dragonBoxes(b)[7];Object.assign(g.player,{x:a.x+5,y:a.y+4});tickPrinter(g,{},false,1/120,()=>hits++);assert.ok(hits>0);hits=0;b.cooled=true;tickPrinter(g,{},false,1/120,()=>hits++);assert.equal(hits,0);}
});
test('cooled defense has two turrets and two flying minis, warnings, a capped build and pulse counterplay',()=>{
 const g=createGame(3),b=g.printer.boss;b.active=true;b.age=10;b.cooled=true;beginDefense(g);assert.equal(coreReady(b),false);Object.assign(g.player,{x:6000,y:100});
 for(let i=0;i<120*12;i++)tickDefense(g,{},false,1/120,()=>{});
 assert.ok(coreReady(b));assert.equal(b.minions.filter(e=>e.kind==='turret').length,2);assert.equal(b.minions.filter(e=>e.kind==='mini').length,2);assert.ok(b.jobs.length+b.minions.length<=4);assert.ok(g.printer.bolts.length);assert.ok(b.minions.filter(e=>e.kind==='mini').every(e=>e.y<470));
 const e=b.minions[0];g.player.x=e.x;g.player.y=e.y;tickDefense(g,{},true,1/120,()=>{});assert.ok(!b.minions.includes(e));
 const wall=b.defense.wall;wall.progress=1;g.printer.bolts.push({x:6152,y:400,w:12,h:12,vx:0,vy:0,life:3});tickDefense(g,{},false,.01,()=>{});assert.equal(g.printer.bolts.at(-1).life,0);
 respawn(g,'retry');assert.equal(g.printer.boss.defense,undefined);assert.equal(g.printer.boss.jobs.length,0);assert.equal(g.printer.bolts.length,0);assert.equal(g.lives,2);
});
test('dawn door remains locked until the physical boss finish and the next room is playable',()=>{
 const g=createGame(3),d=g.level.doors.find(d=>d.id==='dawn');assert.equal(doorReady(g,d),false);g.printer.boss.done=true;g.printer.boss.active=true;g.rooms.active='E';assert.ok(beginDoor(g,d));for(let i=0;i<150;i++)tickDoor(g,{},1/120,1200);assert.equal(g.rooms.active,'H');assert.equal(g.finished,false);const x=g.player.x;for(let i=0;i<120;i++)updateGame(g,{right:true});assert.ok(g.player.x>x+100);assert.equal(g.printer.ending.active,false);
});
