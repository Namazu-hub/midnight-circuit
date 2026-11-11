import {createGame} from '../dist/engine.mjs';
import {setupResearch} from '../dist/research.mjs';
export function legacyRepairGame(){const g=createGame(0);g.level.relays=[{id:'legacy-wire',x:360,y:480,on:false,mode:'sequence',puzzleType:'wiring',difficulty:1,repairRank:0}];setupResearch(g);return g;}
