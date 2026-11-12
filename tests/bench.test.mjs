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
 respawn(g,'fall');Object.assign(g.player,{x:b.x-14,y:b.y-40,vx:0,vy:0});step(g);assert.equal(g.research.funds,50);assert.equal(g.equipment.drinks,3);
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
