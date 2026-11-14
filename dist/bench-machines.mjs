// Stage 1's lift and optional experiments. Never count as another wiring repair.
import {approach} from './world.mjs?v=4.10.0';
export function installBenchMachines(L){
 const add=(id,x,y,w=120)=>{const p={x,y,w,h:20,type:'platform',benchMachine:id,benchSurface:true};L.platforms.push(p);return p;};
 // Leave a readable approach to each new experiment; combat resumes on the exit.
 const turret=L.enemies.find(e=>e.x===1920);if(turret)Object.assign(turret,{x:2080,min:2040,max:2090});
 const coil=L.enemies.find(e=>e.x===1750);if(coil)Object.assign(coil,{x:1650,min:1630,max:1680});
 const beaker=L.enemies.find(e=>e.x===5260);if(beaker)Object.assign(beaker,{x:5570,y:442,baseY:442,min:5500,max:5580});
 L.benchMachines=[
  {id:'lift',kind:'lift',label:'工具リフト',x:850,y:510,w:110,top:290,on:false,contact:false,price:10,paid:false},
  {id:'bridge',kind:'bridge',label:'延長トレー',x:1900,y:510,w:64,timer:0,contact:false,duration:10},
  {id:'shuttle',kind:'shuttle',label:'充電キャリア',x:5200,y:430,w:120,endX:5680,top:280,charge:0,phase:'idle',wait:0,contact:false}
 ];
 add('lift',850,510,110);
 for(const [x,y] of [[1990,390],[2140,310],[2290,250]])add('bridge',x,y,130);
 add('shuttle',5200,430);
 // A visible destination makes the effect useful, not merely a switch animation.
 L.platforms.push({x:2440,y:240,w:160,h:20,type:'platform',benchSurface:true},
 {x:5740,y:220,w:150,h:20,type:'platform',benchSurface:true});
 L.chips.push(...[2470,2510,2550].map(x=>({x,y:205})),...[5770,5810,5850].map(x=>({x,y:185})));
 L.drinks.push({x:2520,y:155});
}
export function benchMachineSolid(g,a){
 if(!a.benchMachine)return null;
 const m=g.level.benchMachines?.find(m=>m.id===a.benchMachine);
 return a.benchMachine!=='bridge'||!!m?.extended;
}
const pressed=(p,x,y,w)=>p.onGround&&Math.abs(p.y+p.h-y)<6&&p.x+p.w>x+8&&p.x<x+w-8;
export function moveBenchMachines(g,dt){
 if(!g.level.benchMachines)return;
 const p=g.player;
 for(const m of g.level.benchMachines){
  const parts=g.level.platforms.filter(a=>a.benchMachine===m.id),a=parts[0];
  const down=m.kind==='bridge'?pressed(p,m.x,m.y,m.w):pressed(p,a.x+a.w/2-27,a.y,54);
  const edge=down&&!m.contact;m.contact=down;m.flash=Math.max(0,(m.flash||0)-dt);
  if(edge){m.flash=.5;g.events.push({type:'benchButton',x:p.x+14,y:p.y+p.h});}
  if(m.kind==='lift'){
   // An empty raised car returns for a missed landing; a rider is never recalled.
   const riding=p.standing===a.id;
   m.emptyTime=m.on&&!riding?((m.emptyTime||0)+dt):0;
   if(m.emptyTime>1.5){m.on=false;m.emptyTime=0;}
   if(edge){
    // One fare per attempt; paid access survives a fall so a checkpoint
    // cannot strand PICO after all nearby one-time coins were collected.
    if(m.on)m.on=false;
    else if(m.paid||g.research?.funds>=m.price){
     if(!m.paid){g.research.funds-=m.price;m.paid=true;g.events.push({type:'funds',text:`リフト -¥${m.price}`,x:m.x+55,y:a.y-30});}
     m.on=true;
    }else g.events.push({type:'actionStep',text:`リフト ¥${m.price}：科研費を集めよう`,x:m.x+55,y:a.y-30});
   }
   const barrier=g.level.platforms.find(p=>p.benchBarrier);
   if(barrier){barrier.y=m.paid?230:-310;barrier.h=800-barrier.y;}
   const old=a.y;a.y=approach(a.y,m.on?m.top:m.y,105*dt);a.dy=a.y-old;a.dx=0;
  }else if(m.kind==='bridge'){
   if(edge)m.timer=m.duration;
   m.timer=Math.max(0,m.timer-dt);
   // Retraction waits for the passenger to leave. No invisible one-frame trap.
   const occupied=parts.some(a=>p.standing===a.id);
   m.extended=m.timer>0||occupied;
   for(const a of parts){a.dx=0;a.dy=0;}
  }else{
   if(m.phase==='idle'){
    m.charge=approach(m.charge,down?1:0,dt/1.2);
    if(m.charge>=1){m.phase='out';m.flash=.6;g.events.push({type:'spring',x:a.x+a.w/2,y:a.y});}
   }
   const oldX=a.x,oldY=a.y;
   if(m.phase==='out'){
    // Rise first, then traverse: no moving platform drives PICO through a riser.
    a.y=approach(a.y,m.top,110*dt);
    if(a.y===m.top)a.x=approach(a.x,m.endX,180*dt);
    if(a.x===m.endX){m.phase='wait';m.wait=3;}
   }else if(m.phase==='wait'){
    m.wait=Math.max(0,m.wait-dt);if(!m.wait)m.phase='back';
   }else if(m.phase==='back'){
    a.x=approach(a.x,m.x,140*dt);if(a.x===m.x)a.y=approach(a.y,m.y,100*dt);
    if(a.y===m.y&&a.x===m.x){m.phase='idle';m.charge=0;}
   }
   a.dx=a.x-oldX;a.dy=a.y-oldY;
  }
 }
}
export function resetBenchMachines(g){
 for(const m of g.level.benchMachines||[]){m.contact=false;m.on=false;m.timer=0;m.extended=false;m.charge=0;m.phase='idle';m.wait=0;m.flash=0;m.emptyTime=0;}
}
// Keep a fast basement descent inside the visible play area without changing physics.
export function frameBenchPlayer(g,height){
 if(!g.level.benchMap)return;
 const min=g.level.minY,max=g.level.maxY||0,p=g.player;
 g.cameraY=Math.max(min,Math.min(max,Math.max(p.y+p.h-height+85,Math.min(p.y-95,g.cameraY))));
}
