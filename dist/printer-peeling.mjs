import {toolBox,equipTool,TOOLS} from './equipment.mjs?v=4.9a';
import {overlap} from './world.mjs?v=4.9a';
export function extendPeeling(L){
 L.peelTargets=[{id:'benchy',room:'C',x:2730,y:442,w:90,h:68,source:'scraper-C'},{id:'support',room:'E',x:5740,y:425,w:110,h:85,source:'scraper-E'}];
 for(const t of L.peelTargets)L.platforms.push({...t,type:'platform',peelTarget:t.id});
 for(const t of L.peelTargets)L.printerSpawns.push({id:t.source,kind:'scraperBot',x:t.room==='C'?2640:5510,y:462,room:t.room,supplyFor:t.id});
}
export function initPeeling(g){const reserve=g.printer.foes.find(e=>e.id==='scraper-E');reserve.alive=false;reserve.dropped=true;g.printer.peeling={targets:Object.fromEntries(g.level.peelTargets.map(t=>[t.id,{done:false,age:0}])),drops:[{room:'A',x:470,y:490,tool:'iron'},{room:'S',x:8800,y:490,tool:'heatgun'}],respawnClock:0};}
export function peelControl(g){const s=g.printer.peeling,p=g.player;return s.drops.find(d=>d.room===g.rooms.active&&Math.hypot(p.x+14-d.x,p.y+20-d.y)<65)?{id:'scraper-pickup',label:'工具を回収'}:null;}
export function peelAction(g,id){if(id!=='scraper-pickup')return false;const s=g.printer.peeling,p=g.player,d=s.drops.find(d=>d.room===g.rooms.active&&Math.hypot(p.x+14-d.x,p.y+20-d.y)<65);if(!d)return true;
 // Store the displaced tool at the same physical rack, rather than erasing it.
 const old=g.equipment.weapon;g.equipment.weapon=null;equipTool(g,d.tool||'scraper');if(d.uses)g.equipment.weapon.uses=d.uses;s.drops.splice(s.drops.indexOf(d),1);if(old)s.drops.push({...d,tool:old.id,uses:old.uses});g.events.push({type:'toolFound',tool:g.equipment.weapon.id,x:p.x,y:p.y});return true;}
export function tickPeeling(g,dt){const s=g.printer.peeling,p=g.player;
 for(const t of g.level.peelTargets){const state=s.targets[t.id],bot=g.printer.foes.find(e=>e.id===t.source);if(!bot.alive&&!bot.dropped){bot.dropped=true;s.drops.push({room:t.room,x:bot.x+20,y:bot.baseY+20,tool:'scraper'});}
 if(!state.done&&(t.id!=='support'||g.printer.boss.age>=9)&&g.rooms.active===t.room&&g.equipment.strike?.id==='scraper'&&overlap(toolBox(g),{x:t.x-15,y:t.y+t.h-20,w:t.w+30,h:35})){state.done=true;state.age=0;g.events.push({type:'peel',x:t.x,y:t.y});}
 if(state.done)state.age+=dt;
 const scraper=g.equipment.weapon?.id==='scraper'||s.drops.some(d=>d.room===t.room&&(d.tool||'scraper')==='scraper');
 if(g.rooms.active===t.room&&!state.done&&!scraper&&!bot.alive){bot.supplyWait=(bot.supplyWait||0)+dt;if(bot.supplyWait>2){bot.alive=true;bot.x=bot.origin;bot.y=bot.baseY;bot.clock=0;bot.dropped=false;bot.rewardPaid=true;bot.supplyWait=0;}}
 }
}
