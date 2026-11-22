import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,updateGame} from '../dist/engine.mjs';

for(const index of [0,1])test(`stage ${index+1}: the trial requires actual boosted travel and supplies an empty inventory`,()=>{
 const g=createGame(index),track=g.level.boostCourse;
 if(track.room)g.rooms.active=track.room;
 g.level.enemies=[];g.level.chips=[];g.level.drinks=[];
 Object.assign(g.player,{x:track.start-78,y:track.floor-40});
 g.research.funds=track.fee;
 updateGame(g,{});
 assert.equal(g.equipment.drinks,1);
 assert.equal(g.research.funds,0);
 for(let i=0;i<480;i++)updateGame(g,{right:true,jump:i%90===0,pulse:true});
 assert.ok(g.player.x+14<=track.start+5);
 for(let i=0;i<720&&g.player.x+14<track.end;i++)updateGame(g,{right:true,drink:i===0});
 assert.ok(g.player.x+14>=track.end);
 assert.equal(g.equipment.consumed,1);
 assert.equal(g.deaths,0);
});
