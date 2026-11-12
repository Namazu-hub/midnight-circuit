import {grant} from './research.mjs?v=4.9.1';
import {collectDrink} from './equipment.mjs?v=4.9.1';
// Optional supply stash: ordinary proximity pickup, no extra controls or repair.
export function tickBenchRoom(g){
 if(!g.level.benchMap)return;
 for(const box of g.level.benchSupplies){
  const p=g.player;if(Math.abs(p.x+14-box.x)>64||Math.abs(p.y+40-box.y)>55)continue;
  if(!box.opened){box.opened=true;grant(g,50,'保守室の備蓄',box.x,box.y-55);g.events.push({type:'actionStep',text:'保守室の備蓄を回収',x:box.x,y:box.y-45});}
  // A full inventory leaves the can visible in the open box for a later visit.
  if(!box.drinkTaken&&collectDrink(g,{x:box.x,y:box.y-45}))box.drinkTaken=true;
 }
}
