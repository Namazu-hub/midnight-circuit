import {overlap} from './world.mjs?v=4.7a';
// Attempt-local inventory: room travel and HP falls retain it; game-over/new stage clears it.
export const EQUIPMENT=Object.freeze({drinkCap:3,duration:9,speed:1.55});
export const TOOLS=Object.freeze([
 {id:'iron',name:'はんだごてソード',cost:60,uses:3,range:130,damage:3},
 {id:'scraper',name:'造形剥がしスクレーパー',cost:40,uses:5,range:105,damage:2},
 {id:'heatgun',name:'ヒートガン',cost:75,uses:2,range:230,damage:3}
]);
export function setupEquipment(g){g.equipment={drinks:0,consumed:0,weapon:null,strike:null,cooldown:0,overload:0};}
export function collectDrink(g,at){const e=g.equipment;if(!e||e.drinks>=EQUIPMENT.drinkCap)return false;e.drinks++;g.events.push({type:'drinkPickup',...at});return true;}
export function drink(g){const e=g.equipment,p=g.player;if(!e?.drinks||g.fever)return false;e.drinks--;e.consumed++;p.boost=EQUIPMENT.duration;
 if(e.consumed===1){p.hp=Math.min(6,p.hp+1);p.displayHP=p.hp;p.hurtTimer=0;}
 if(e.consumed>=3){p.hurtFrom=p.hp;p.hurtTo=Math.max(0,p.hp-1);p.displayHP=p.hp;p.hurtTimer=2.2;p.hp--;e.overload=2.5;g.events.push({type:'overload',x:p.x+14,y:p.y});}
 g.events.push({type:'boost',x:p.x+14,y:p.y+20});return true;
}
export function equipTool(g,id){const tool=TOOLS.find(t=>t.id===id);if(!tool||g.equipment.weapon)return false;g.equipment.weapon={id,uses:tool.uses};return true;}
export function useTool(g){const e=g.equipment,w=e?.weapon;if(!w||e.cooldown>0||g.fever)return false;const def=TOOLS.find(t=>t.id===w.id);w.uses--;e.cooldown=.4;e.strike={id:w.id,remaining:.22,age:0,damage:def.damage,range:def.range,hits:[],last:w.uses===0};g.events.push({type:'tool',x:g.player.x+14,y:g.player.y+20,last:w.uses===0});if(!w.uses)e.weapon=null;return true;}
export function tickEquipment(g,dt){const e=g.equipment;if(!e)return;e.cooldown=Math.max(0,e.cooldown-dt);e.overload=Math.max(0,e.overload-dt);if(e.strike){e.strike.remaining-=dt;e.strike.age+=dt;if(e.strike.remaining<=0)e.strike=null;}}
export function toolBox(g){const s=g.equipment?.strike,p=g.player;if(!s)return null;return {x:p.face>0?p.x+10:p.x+18-s.range,y:p.y-25,w:s.range,h:100};}
export function toolHit(g,target,key){const s=g.equipment?.strike,box=toolBox(g);if(!s||s.hits.includes(key)||!overlap(box,target))return 0;s.hits.push(key);return s.damage;}
