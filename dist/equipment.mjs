import {overlap} from './world.mjs?v=4.8a';
// Attempt-local inventory: room travel and HP falls retain it; game-over/new stage clears it.
export const EQUIPMENT=Object.freeze({drinkCap:3,duration:9,speed:1.55});
export const TOOLS=Object.freeze([
 {id:'iron',name:'はんだごてソード',cost:60,uses:3,range:96,damage:3},
 {id:'scraper',name:'造形剥がしスクレーパー',cost:40,uses:5,range:78,damage:2},
 {id:'heatgun',name:'ヒートガン',cost:75,uses:2,range:420,damage:3}
]);
export function setupEquipment(g){g.equipment={drinks:0,consumed:0,weapon:null,strike:null,cooldown:0,overload:0,shots:[],serial:0};}
export function collectDrink(g,at){const e=g.equipment;if(!e||e.drinks>=EQUIPMENT.drinkCap)return false;e.drinks++;g.events.push({type:'drinkPickup',...at});return true;}
export function drink(g){const e=g.equipment,p=g.player;if(!e?.drinks||g.fever)return false;e.drinks--;e.consumed++;p.boost=EQUIPMENT.duration;
 if(e.consumed===1){p.hp=Math.min(6,p.hp+1);p.displayHP=p.hp;p.hurtTimer=0;}
 if(e.consumed>=3){p.hurtFrom=p.hp;p.hurtTo=Math.max(0,p.hp-1);p.displayHP=p.hp;p.hurtTimer=2.2;p.hp--;e.overload=2.5;g.events.push({type:'overload',x:p.x+14,y:p.y});}
 g.events.push({type:'boost',x:p.x+14,y:p.y+20});return true;
}
export function equipTool(g,id){const tool=TOOLS.find(t=>t.id===id);if(!tool||g.equipment.weapon)return false;g.equipment.weapon={id,uses:tool.uses};return true;}
export function useTool(g){const e=g.equipment,w=e?.weapon;if(!w||e.cooldown>0||g.fever)return false;const def=TOOLS.find(t=>t.id===w.id);w.uses--;e.cooldown=.4;if(w.id==='heatgun'){e.shots??=[];e.shots.push({x:g.player.x+(g.player.face>0?30:-36),y:g.player.y+8,w:36,h:26,vx:g.player.face*520,travel:0,life:.85,hits:[],id:++e.serial});}e.strike={id:w.id,remaining:.22,age:0,damage:def.damage,range:def.range,hits:[],last:w.uses===0};g.events.push({type:'tool',x:g.player.x+14,y:g.player.y+20,last:w.uses===0});if(!w.uses)e.weapon=null;return true;}
export function tickEquipment(g,dt,solid=()=>false){const e=g.equipment;if(!e)return;for(const q of e.shots||[]){q.x+=q.vx*dt;q.travel+=Math.abs(q.vx*dt);q.life-=dt;if(g.level.platforms.some(a=>!a.printerEnemy&&solid(a)&&overlap(q,a)))q.life=0;}e.shots=(e.shots||[]).filter(q=>q.life>0&&q.travel<420);e.cooldown=Math.max(0,e.cooldown-dt);e.overload=Math.max(0,e.overload-dt);if(e.strike){e.strike.remaining-=dt;e.strike.age+=dt;if(e.strike.remaining<=0)e.strike=null;}}
export function toolBox(g){const s=g.equipment?.strike,p=g.player;if(!s||s.id==='heatgun')return null;const scraper=s.id==='scraper',width=scraper?78:96;return {x:p.face>0?p.x+15:p.x+13-width,y:p.y+(scraper?24:-20),w:width,h:scraper?25:88};}
export function toolHit(g,target,key){for(const q of g.equipment?.shots||[])if(q.life>0&&!q.hits.includes(key)&&overlap(q,target)){q.hits.push(key);q.life=0;return 3;}const s=g.equipment?.strike,box=toolBox(g);if(!s||!box||s.hits.includes(key)||!overlap(box,target))return 0;s.hits.push(key);return s.damage;}
