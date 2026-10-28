import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,updateGame} from '../dist/engine.mjs';
import {actionKeys,equipmentKeys} from '../dist/input-map.mjs';
test('explicit printer abyss costs one HP while a lower recovery deck is safe',()=>{
 const g=createGame(3);g.rooms.active='B';Object.assign(g.player,{x:2200,y:640,vy:0});g.spawnGrace=0;
 for(let i=0;i<120;i++)updateGame(g,{});assert.equal(g.player.hp,6);assert.equal(g.player.y+40,680);
 Object.assign(g.player,{x:2200,y:760,vy:100});updateGame(g,{});assert.equal(g.player.hp,5);assert.equal(g.deaths,1);assert.ok(g.player.invul>1.9);
 g.player.hp=1;g.rooms.active='B';Object.assign(g.player,{x:2200,y:760});updateGame(g,{});assert.equal(g.lives,2);assert.equal(g.player.hp,6);
});
test('keyboard retains C and adds F, with disjoint V and B item edges',()=>{
 assert.deepEqual(actionKeys,['KeyC','KeyF']);assert.equal(equipmentKeys.KeyV,'weapon');assert.equal(equipmentKeys.KeyB,'drink');
});
