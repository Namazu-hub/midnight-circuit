import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,updateGame,respawn} from '../dist/engine.mjs';
const step=(g,i={})=>{updateGame(g,i);g.events=[];};
function go(g,x,y){for(let f=0;f<2400;f++){const p=g.player,dx=x-p.x-14,dy=y-p.y-40;if(Math.abs(dx)<18&&Math.abs(dy)<10&&p.onGround)return;step(g,{right:dx>6,left:dx<-6,jump:p.onGround&&(dy<-35||Math.abs(dx)>150)||p.jumps===1&&p.vy>-60&&dy<-25,pulse:g.cooldown<=0});}throw Error(JSON.stringify({target:[x,y],p:g.player}));}
test('both service basements have an input-driven return to the surface without equipment or death',()=>{
 for(const [i,x,y] of [[0,3340,1340],[1,6050,1060]]){const g=createGame(0);Object.assign(g.player,{x,y,vx:0,vy:0});for(let n=0;n<30;n++)step(g);for(const [x,y] of g.level.benchReturns[i])go(g,x+65,y);go(g,i===0?4800:7250,510);assert.equal(g.deaths,0);assert.ok(g.player.y<530);assert.equal(g.player.boost,0);}
});
test('shaft descent is safe and vertical camera follows while ordinary gaps retain fall damage',()=>{
 const g=createGame(0);Object.assign(g.player,{x:3340,y:600});for(let n=0;n<150;n++)step(g);assert.equal(g.deaths,0);assert.ok(g.cameraY>100);const pit=createGame(0);Object.assign(pit.player,{x:2200,y:820});step(pit);assert.equal(pit.deaths,1);assert.equal(pit.player.hp,5);
});
test('map changes are confined to the workbench and preserve three collectibles and required repair IDs',()=>{const g=createGame(0);assert.equal(g.level.gears.length,3);assert.equal(g.level.relays.length,1);assert.equal(g.level.relays[0].id,'bench-wire');assert.equal(g.level.benchRooms.length,2);assert.ok(new Set(g.level.platforms.filter(p=>p.type==='ground').map(p=>p.y)).size>=3);for(let i=1;i<8;i++)assert.equal(createGame(i).level.benchMap,undefined);});

test('floor buttons reject wrong order, require leaving a button, and cannot be pulse repaired',()=>{
 const g=createGame(0),r=g.level.relays[0];
 const land=i=>{const b=g.level.wireButtons[i];Object.assign(g.player,{x:b.x+16,y:b.y-40,vx:0,vy:0,onGround:true,standing:null});step(g);};
 land(0);assert.equal(r.step,0);land(1);assert.equal(r.step,1);for(let i=0;i<40;i++)step(g);assert.equal(r.step,1);
 land(2);assert.equal(r.step,0);land(1);land(0);land(2);assert.ok(r.on);const cash=g.research.funds;land(1);land(0);land(2);assert.equal(g.research.funds,cash);
 const a=createGame(0);Object.assign(a.player,{x:7900,y:30});step(a,{pulse:true});assert.equal(a.level.relays[0].on,false);assert.ok(!a.repairSession);
});
test('server-room structural walls block lateral movement and have solid floors',()=>{
 for(const x of [3180,4720,5900,7150]){const g=createGame(0),wall=g.level.platforms.find(p=>p.benchWall&&p.x===x);Object.assign(g.player,{x:x-30,y:wall.y+80,vx:290,vy:0});step(g,{right:true});assert.ok(g.player.x+28<=x);}
 const g=createGame(0);assert.equal(g.level.wireHints.length,1);assert.ok(g.level.enemies.length>=30);assert.ok(!g.level.platforms.some(p=>p.x===260&&p.y===400));assert.equal(g.level.relays.length,1);
});


test('basements have distinct roles and a single hint location, with an occupied supply workshop',()=>{
 const L=createGame(0).level,[a,b]=L.benchRooms;
 assert.equal(a.role,'hint');assert.equal(b.role,'supply');assert.notEqual(a.accent,b.accent);
 assert.ok(L.wireHints.every(h=>h.x>a.x&&h.x<a.x+a.w));
 assert.ok(L.benchSupplies.every(c=>c.x>b.x&&c.x<b.x+b.w));
 assert.ok(L.students.some(s=>s.y===b.floorY&&s.name==='夜勤中の研究生'));
});
test('supply box pays once, retains a can when full, and remains collected through a fall',()=>{
 const g=createGame(0),b=g.level.benchSupplies[0];g.level.enemies=[];g.equipment.drinks=3;
 Object.assign(g.player,{x:b.x-14,y:b.y-40,vx:0,vy:0});updateGame(g,{});assert.equal(g.events.some(e=>e.type==='gear'),false);g.events=[];
 assert.equal(b.opened,true);assert.equal(b.drinkTaken,false);assert.equal(g.research.funds,50);
 step(g);assert.equal(g.research.funds,50);step(g,{drink:true});assert.equal(b.drinkTaken,true);assert.equal(g.equipment.drinks,3);
 respawn(g,'fall');Object.assign(g.player,{x:b.x-14,y:b.y-40,vx:0,vy:0});step(g);assert.equal(g.research.funds,40);assert.equal(g.equipment.drinks,3);
});
test('continuous workbench undersides, merged shelves, and furniture clear of risers',()=>{
 const L=createGame(0).level,decks=L.platforms.filter(p=>p.benchDeck),trays=L.platforms.filter(p=>p.type==='platform'&&p.h===20);
 for(const p of decks){assert.equal(p.y+p.h,690);assert.ok(Number.isInteger(p.x)&&Number.isInteger(p.w));}
 for(let i=0;i<trays.length;i++)for(let j=i+1;j<trays.length;j++){const a=trays[i],b=trays[j];assert.ok(!(Math.abs(a.y-b.y)<=12&&a.x<b.x+b.w&&b.x<a.x+a.w),'no doubled shelf faces');}
 for(const a of [...L.vendors,...L.students.filter(s=>s.y<700)]){const deck=decks.find(p=>a.x>=p.x&&a.x<p.x+p.w);assert.ok(deck);assert.equal(a.y,deck.y);assert.ok(a.x-38>=deck.x&&a.x+38<=deck.x+deck.w,'furniture clear of risers');}
 for(const v of L.vendors)for(const s of L.students)if(v.y===s.y)assert.ok(Math.abs(v.x-s.x)>=80);
 for(const coin of L.chips)for(const gear of L.gears)assert.ok(Math.abs(coin.y-gear.y)>25||Math.abs(coin.x-gear.x)>35,'pickups do not cover each other');
 for(const coin of L.chips)for(const s of L.students)assert.ok(Math.abs(coin.y-s.y+45)>25||Math.abs(coin.x-s.x)>45,'coins clear of laptops');
});

import {platformSolid,VIEW} from '../dist/engine.mjs';
function fixture(x,y){const g=createGame(0);g.level.enemies=[];g.research.funds=20;Object.assign(g.player,{x:x-14,y:y-40,vx:0,vy:0});return g;}
const frames=(g,n,input={})=>{for(let i=0;i<n;i++)step(g,input);};
test('rider-triggered tool lift reaches the collectible and toggles only on a new landing',()=>{
 const g=fixture(820,510),m=g.level.benchMachines[0];
 frames(g,36,{right:true});frames(g,300);assert.equal(m.on,true);assert.equal(g.player.y+40,290);
 assert.ok(g.player.onGround);assert.equal(g.level.relays[0].on,false);
 // Jump off and back on: a deliberate landing calls the lift down.
 step(g,{jump:true});frames(g,110);frames(g,280);assert.equal(m.on,false);assert.equal(g.player.y+40,510);
 go(g,800,510);frames(g,46,{right:true});frames(g,300);assert.equal(g.player.y+40,290);go(g,745,295);assert.equal(g.gears,1);assert.equal(g.deaths,0);
});
test('timed trays open by foot contact and can be traversed by normal jumps to a reward',()=>{
 const g=fixture(1870,510),m=g.level.benchMachines.find(m=>m.id==='bridge');
 const parts=g.level.platforms.filter(a=>a.benchMachine==='bridge');assert.ok(parts.every(a=>!platformSolid(g,a)));
 go(g,1930,510);assert.ok(m.timer>9);for(const a of parts)go(g,a.x+65,a.y);step(g,{jump:true,right:true});go(g,2510,240);
 assert.ok(g.chips>=2);assert.equal(g.deaths,0);frames(g,1300);assert.ok(parts.every(a=>!platformSolid(g,a)));
});
test('expired trays retain a standing rider, then retract, and can be retriggered after failure',()=>{
 const g=fixture(1930,510),m=g.level.benchMachines.find(m=>m.id==='bridge');frames(g,5);go(g,2050,390);
 frames(g,1400);assert.equal(m.timer,0);assert.equal(m.extended,true);assert.ok(g.player.onGround);
 go(g,1930,510);frames(g,5);assert.ok(m.timer>8);
 respawn(g,'fall');assert.equal(m.extended,false);assert.equal(g.player.hp,5);assert.equal(m.timer,0);
 // Returning to the same apparatus after a checkpoint reset has no consumed resource.
 Object.assign(g.player,{x:1916,y:470,vx:0,vy:0});frames(g,5);assert.ok(m.timer>9);
});
test('charging carrier transports a standing rider, permits a destination jump, and returns empty',()=>{
 const g=fixture(5180,430),m=g.level.benchMachines.find(m=>m.id==='shuttle'),a=g.level.platforms.find(a=>a.benchMachine==='shuttle');
 go(g,5255,430);frames(g,80);assert.ok(m.charge>0&&m.charge<1);
 frames(g,650);assert.equal(m.phase,'wait');assert.equal(a.x,m.endX);assert.equal(g.player.y+40,m.top);assert.ok(g.player.x>5650);
 go(g,5810,220);assert.ok(g.chips>0);frames(g,1100);assert.equal(m.phase,'idle');assert.equal(a.x,m.x);assert.equal(a.y,m.y);assert.equal(g.deaths,0);
});
test('descent camera keeps PICO visible at 900px/s and static scenery cannot alter gameplay',()=>{
 const g=fixture(3370,550);g.player.vy=900;
 for(let f=0;f<180;f++){step(g);assert.ok(g.player.y+40-g.cameraY<=VIEW.h-80);assert.ok(g.cameraY>=g.level.minY&&g.cameraY<=g.level.maxY);}
 assert.equal(g.deaths,0);assert.equal(g.level.relays.length,1);assert.equal(g.level.gears.length,3);
});
test('new controls work with the ordinary enemy population, with clear initial contact zones',()=>{
 for(const [id,x,y,n] of [['lift',885,470,330],['bridge',1916,470,60],['shuttle',5245,390,850]]){
  const g=createGame(0);g.research.funds=20;Object.assign(g.player,{x,y});frames(g,n);const m=g.level.benchMachines.find(m=>m.id===id);
  assert.equal(g.deaths,0);assert.equal(g.player.hp,6);assert.ok(id==='lift'?m.on:id==='bridge'?m.extended:m.phase==='wait');
 }
});
test('partial charge drains when stepping away; retry resets the carrier and costs no funds',()=>{
 const g=fixture(5255,430),m=g.level.benchMachines.find(m=>m.id==='shuttle');frames(g,65);assert.ok(m.charge>0&&m.charge<1);
 frames(g,35,{left:true});frames(g,180);assert.equal(m.phase,'idle');assert.equal(m.charge,0);
 respawn(g,'fall');const a=g.level.platforms.find(a=>a.benchMachine==='shuttle');assert.equal(a.x,m.x);assert.equal(a.y,m.y);assert.equal(g.research.funds,20);
 Object.assign(g.player,{x:5245,y:390});frames(g,850);assert.equal(m.phase,'wait');assert.equal(g.research.funds,20);
});
test('cabinet requires the paid lift, and a fall cannot charge its fare twice',()=>{
 const g=createGame(0),wall=g.level.platforms.find(a=>a.benchBarrier),m=g.level.benchMachines.find(a=>a.id==='lift');
 assert.ok(wall.y<290&&wall.y+wall.h===510);assert.ok(!g.level.platforms.some(a=>a.type==='ghost'));
 Object.assign(g.player,{x:885,y:470,onGround:true,standing:g.level.platforms.find(a=>a.benchMachine==='lift').id});
 step(g);assert.equal(m.on,false);assert.equal(m.paid,false);
 g.research.funds=10;step(g,{jump:true});frames(g,100);Object.assign(g.player,{x:885,y:470,vx:0,vy:0,onGround:true,standing:null});step(g);
 assert.equal(m.on,true);assert.equal(m.paid,true);assert.equal(g.research.funds,0);
 respawn(g,'fall');assert.equal(m.paid,true);Object.assign(g.player,{x:885,y:470,vx:0,vy:0,onGround:true,standing:null});step(g);assert.equal(m.on,true);assert.equal(g.research.funds,0);
});
test('Stage 1 drink consumes funds only on pickup and leaves a can if unaffordable',()=>{
 const g=createGame(0);g.level.enemies=[];g.level.drinks=[{x:104,y:490}];
 step(g);assert.equal(g.equipment.drinks,0);assert.equal(g.level.drinks[0].got,undefined);
 g.research.funds=10;step(g);assert.equal(g.equipment.drinks,1);assert.equal(g.research.funds,0);
});
test('Stage 1 enemies return offscreen on a timer without repeating the defeat grant',()=>{
 const g=createGame(0),e=g.level.enemies[0];g.level.enemies=[e];g.level.chips=[];g.level.drinks=[];Object.assign(g.player,{x:2500,y:470});e.alive=false;
 frames(g,5);assert.equal(e.rewardPaid,true);const earned=g.research.earned;
 frames(g,2200);assert.equal(e.alive,true);assert.equal(g.research.earned,earned);
 e.alive=false;frames(g,5);assert.equal(g.research.earned,earned);
});
