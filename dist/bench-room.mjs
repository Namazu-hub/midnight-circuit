import {grant} from './research.mjs?v=4.9.3';
import {collectDrink} from './equipment.mjs?v=4.9.3';
// Optional supply stash: ordinary proximity pickup, no extra controls or repair.
export function tickBenchRoom(g){
 if(!g.level.benchMap)return;
 for(const box of g.level.benchSupplies){
  const p=g.player;if(Math.abs(p.x+14-box.x)>64||Math.abs(p.y+40-box.y)>55)continue;
  if(!box.opened){box.opened=true;grant(g,50,'保守室の備蓄',box.x,box.y-55);g.events.push({type:'actionStep',text:'保守室の備蓄を回収',x:box.x,y:box.y-45});}
  // A full inventory leaves the can visible in the open box for a later visit.
  if(!box.drinkTaken&&g.research.funds>=10&&collectDrink(g,{x:box.x,y:box.y-45})){
   g.research.funds-=10;box.drinkTaken=true;
   g.events.push({type:'funds',text:'モンエナ -¥10',x:box.x,y:box.y-45});
  }
 }
}
