// v4.4 replaces the stage 4 timing-pin prototype with apparatus actions.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,updateGame,respawn,platformSolid} from '../dist/engine.mjs';
import {tickPrinter,printerControl} from '../dist/printer.mjs';
import {tickResearch,purchase} from '../dist/research.mjs';
const at=(g,id)=>{const c=g.level.printerControls.find(c=>c.id===id);Object.assign(g.player,{x:c.x-14,y:c.y-20,vx:0,vy:0});};
const tick=(g,interact=false,dt=1/120)=>tickPrinter(g,{interact},false,dt,()=>{});
test('roll weight switch and destroyed-roll fallback both restore supply',()=>{
 const a=createGame(3);a.printer.foes[0].x=926;tick(a);assert.ok(a.level.relays[0].on);
 const g=createGame(3),p=g.level.printerParts[0];g.printer.foes[0].alive=false;Object.assign(g.player,{x:p.x-14,y:p.y-20});tick(g);assert.equal(g.printer.carried,'weight');at(g,'weight');tick(g,true);assert.ok(g.level.relays[0].on);tickResearch(g);const funds=g.research.funds;tick(g,true);tickResearch(g);assert.equal(g.research.funds,funds);
});
test('gear and print repair require parts and physical controls, never timing pulses',()=>{
 const g=createGame(3);at(g,'drive');tick(g,true);assert.equal(g.level.relays[1].on,false);g.printer.gear=true;g.level.relays[0].on=true;tick(g,true);assert.ok(g.level.relays[1].on);
 const print=g.level.platforms.find(p=>p.printerPrint===0);g.pulse=3;assert.equal(platformSolid(g,print),false);at(g,'print');tick(g,true);assert.equal(g.printer.printing,undefined);at(g,'safety');tick(g,true);at(g,'print');tick(g,true);tick(g,false,3.1);assert.ok(platformSolid(g,print));assert.equal(g.level.relays[2].on,false);tick(g,true);tick(g,false,3.1);assert.ok(g.level.relays[2].on);
});
test('incident changes collision; cooling needs both fans; assistance cannot bypass repair',()=>{
 const g=createGame(3);g.player.x=2600;tick(g);const jam=g.level.platforms.find(p=>p.printerJam);assert.ok(platformSolid(g,jam));at(g,'safety');tick(g,true);assert.equal(platformSolid(g,jam),false);
 at(g,'cool');tick(g,true);assert.equal(g.level.relays[3].on,false);at(g,'fan1');tick(g,true);at(g,'fan2');tick(g,true);at(g,'cool');tick(g,true);assert.ok(g.level.relays[3].on);
 const v=g.level.vendors[0];Object.assign(g.player,{x:v.x-14,y:v.y-40});g.research.funds=200;assert.equal(purchase(g,'assist').ok,false);assert.equal(g.research.funds,200);
});
test('arena closes, retries reset battle but preserve repairs and consume normal lives',()=>{
 const g=createGame(3);g.level.relays.forEach(r=>r.on=true);at(g,'enter');tick(g,true);assert.ok(g.printer.boss.active);g.player.x=5200;tick(g);assert.ok(g.player.x>=5420);
 g.printer.boss.hp=7;g.printer.boss.jobs.push({x:5700,y:470,progress:.2});g.printer.boss.frame=.5;respawn(g,'retry');assert.equal(g.lives,2);assert.equal(g.player.x,5230);assert.equal(g.printer.boss.active,false);assert.equal(g.printer.boss.hp,18);assert.equal(g.printer.boss.jobs.length,0);assert.ok(g.level.relays.every(r=>r.on));
 at(g,'enter');tick(g,true);g.printer.seenIntro=true;assert.equal(printerControl(g).id,'skip');tick(g,true);assert.ok(g.printer.boss.age>=9);
});
test('boss cannot finish by HP alone; restraint, cooling, stop and reward are ordered',()=>{
 const g=createGame(3);g.level.relays.forEach(r=>r.on=true);const b=g.printer.boss;b.active=true;b.age=10;b.phase=3;b.hp=6;
 at(g,'stop');tick(g,true);assert.equal(b.done,false);at(g,'path');tick(g,true);assert.equal(b.route,false);at(g,'supply');tick(g,true);b.x=6000;at(g,'path');tick(g,true);assert.ok(b.route);at(g,'coolBoss');tick(g,true);assert.equal(b.cooled,false);tick(g,false,6.1);tick(g,true);assert.ok(b.cooled);at(g,'stop');tick(g,true);assert.ok(b.done);const funds=g.research.funds;tick(g,true);assert.equal(g.research.funds,funds);assert.equal(funds,250);
});
test('enemy manufacture is capped and fresh pulse can interrupt a printed enemy',()=>{
 const g=createGame(3),b=g.printer.boss;b.active=true;b.age=10;b.phase=2;g.player.x=5500;for(let i=0;i<100;i++)tick(g,false,.5);assert.ok(b.jobs.length+b.minions.filter(e=>e.alive).length<=3);
 b.jobs=[{x:5500,y:470,progress:.3,kind:'mini'}];g.player.y=470;tickPrinter(g,{},true,1/120,()=>{});assert.equal(b.jobs.length,0);assert.ok(g.research.funds>=10);
});
