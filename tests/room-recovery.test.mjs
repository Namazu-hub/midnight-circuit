import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,updateGame,platformSolid} from '../dist/engine.mjs';
import {beginDoor,tickDoor} from '../dist/rooms.mjs';
import {tickPrinterChat} from '../dist/printer-visual.mjs';
// Fixtures isolate arrivals, not a substitute for the input-only full routes.
test('every printer doorway arrives within its room, above a real surface, without changing inventory',()=>{
 const g=createGame(3);for(const r of g.level.relays)r.on=true;Object.assign(g.printer.chase,{done:true});g.printer.nozzle.done=true;g.printer.peeling.targets.benchy.done=true;g.printer.journey.runawaySolved=true;g.printer.boss.done=true;
 const rooms=new Set();for(const d of g.level.doors){g.rooms.active=d.room;g.rooms.cooldown=0;g.rooms.transition=null;g.player.hp=4;g.research.funds=123;g.equipment.cans=2;const before=JSON.stringify(g.equipment);assert.ok(beginDoor(g,d),d.id);for(let i=0;i<210&&g.rooms.transition;i++)tickDoor(g,{},1/120,800);assert.equal(g.rooms.active,d.to,d.id);const room=g.level.rooms.find(r=>r.id===d.to);rooms.add(d.to);assert.ok(g.player.x>=room.left&&g.player.x+28<room.right,d.id);assert.ok(g.level.platforms.some(a=>platformSolid(g,a)&&g.player.x+28>a.x&&g.player.x<a.x+a.w&&Math.abs(a.y-(g.player.y+40))<3),`unsupported door ${d.id}`);assert.equal(g.player.hp,4);assert.equal(g.research.funds,123);assert.equal(JSON.stringify(g.equipment),before);}
 assert.equal(rooms.size,11);
});
test('all PCB rooms have readable chat; reject storage never references an absent line array',()=>{const g=createGame(5);for(const s of g.level.students){assert.ok(Array.isArray(s.lines)&&s.lines.length,s.room);g.rooms.active=s.room;g.player.x=s.x;g.player.y=s.y-40;tickPrinterChat(g,.01);assert.equal(typeof s.chat.text,'string');assert.ok(s.chat.text.length,s.room);}});
test('student dialogue changes after restoration and uses a cooldown instead of continuous repeated text',()=>{const g=createGame(5),s=g.level.students[0];g.player.x=s.x;tickPrinterChat(g,.01);const before=s.chat.text;g.level.relays.find(r=>r.id==='power').on=true;tickPrinterChat(g,.01);assert.notEqual(s.chat.text,before);assert.match(s.chat.text,/動いて/);tickPrinterChat(g,6.1);assert.equal(s.chat.visible,false);tickPrinterChat(g,4);assert.ok(s.chat.visible);});
