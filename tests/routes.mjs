import {traversePCB} from './pcb-route.mjs';
import {traversePrinter} from './printer-route.mjs';
import {solveSession} from './repair-inputs.mjs';
import {createGame,updateGame,platformSolid} from '../dist/engine.mjs';
export function traverse(index,{limit=180,trace=false}={}){
 if(index===3)return traversePrinter();
 if(index===5)return traversePCB();
 const g=createGame(index);let wp=0,maxY=0,oldDeaths=0,stuck=0,lastWP=0;
 for(let f=0;f<120*limit&&!g.finished;f++){
  if(g.repairSession)solveSession(g);
  const p=g.player,L=g.level;const target=L.route[wp]||L.goal;let dx=target.x-(p.x+14),dy=target.y-(p.y+40);
  if(g.deaths!==oldDeaths){oldDeaths=g.deaths;let closest=0,d=Infinity;for(let i=0;i<L.route.length;i++){const r=L.route[i],dd=Math.hypot(r.x-p.x,r.y-p.y-40);if(dd<d){d=dd;closest=i;}}wp=closest;}
  if((!target.portal&&Math.abs(dx)<65&&(target.service||index===4||index===7&&wp>=2&&wp<=9||index===6&&wp>=2&&wp<=9||index===3&&wp>=4&&wp<=9?p.onGround&&Math.abs(dy)<45:dy>-100))||(target.portal&&L.portals.find(r=>r.id===target.portal).on)){wp=Math.min(wp+1,L.route.length);}
  let left=dx<-22,right=dx>22,jump=false,pulse=false;
  const service=L.relays.find(r=>!r.optional&&!r.worldRepair&&r.mode&&!r.on&&Math.abs(r.x-p.x)<450&&Math.abs(r.y-p.y-20)<80);
  if(service){dx=service.x-p.x-14;left=dx<-18;right=dx>18;}
  const nearbyRelay=L.relays.find(r=>!r.optional&&!r.worldRepair&&!r.on&&!r.portal&&Math.hypot(r.x-p.x,r.y-p.y-20)<(r.mode?90:150));
  if(nearbyRelay){left=right=false;pulse=g.cooldown<=0;}
  const portal=target.portal&&L.portals.find(r=>r.id===target.portal);
  if(portal&&Math.abs(dx)<60){left=right=false;pulse=g.cooldown<=0;}
  if(g.cart){left=false;right=false;const rail=L.rails.find(r=>p.x+14>=r.x1&&p.x+14<=r.x2);const gap=rail&&!L.rails.some(r=>r.x1===rail.x2);jump=g.cart.onRail&&gap&&rail.x2-g.cart.x<65;pulse=g.cooldown<=0;}
  else{
   const a=p.standing===null?null:L.platforms[p.standing];const edge=a?(dx>=0?a.x+a.w-(p.x+14):p.x+14-a.x):999;
   const foe=L.enemies.find(e=>e.alive&&Math.abs(e.x-p.x)<100&&Math.abs(e.y-p.y)<75);
   if(p.onGround&&!nearbyRelay&&!portal){jump=(dy<-40&&Math.abs(dx)<330)||edge<95&&Math.abs(dx)>45||!!foe;}
   if(!p.onGround&&p.jumps===1&&p.vy>-50&&(dy<-20||Math.abs(dx)>90||index===6))jump=true;
   if(g.cooldown<=0&&(foe||L.lasers.some(l=>Math.abs(l.x-p.x)<200)||L.presses.some(h=>Math.abs(h.x-p.x)<180)||L.platforms.some(a=>['printed','ghost'].includes(a.type)&&Math.abs(a.x-p.x)<170)))pulse=true;
   // Wind column: steer into it at ground level, then hold its center while rising.
   if(index===1&&wp===5){left=p.x+14>2968;right=p.x+14<2952;jump=p.onGround;}
  }
  if(L.boss&&!L.boss.repaired&&p.x>7120){const b=L.boss,tx=b.hp>0?L.bossConsole.x:b.x+20;left=p.x+14>tx+15;right=p.x+14<tx-15;pulse=g.cooldown<=0;jump=b.hp>0&&b.state==='rush'&&Math.abs(b.x-p.x)<180&&p.onGround;}
  if(index===0&&!L.relays[0].on&&p.x>L.wireButtons[0].x-80&&p.y<32){
   const order=[1,0,2],b=L.wireButtons[order[L.relays[0].step]],tx=b.x+b.w/2;
   left=p.x+14>tx+5;right=p.x+14<tx-5;jump=L.relays[0].step===2&&p.onGround&&p.x<L.wireButtons[1].x+20;
  }
  // First cabinet cannot be cleared from the floor. Use the paid pressure
  // lift, wait for its ride, then jump its top; this remains ordinary input.
  if(index===0&&p.x>760&&p.x<1090&&wp>=1){
   const lift=L.benchMachines.find(m=>m.id==='lift');
   if(p.x<990&&(p.y+p.h>350||!lift.on||L.platforms.find(a=>a.benchMachine==='lift').y>300)){const tx=905;left=p.x+14>tx+6;right=p.x+14<tx-6;jump=false;}
   else{left=false;right=true;jump=p.onGround;}
  }
  if(index===0&&p.x>7350&&p.x<10520){
   const carriers=L.benchMachines.filter(m=>m.kind==='shuttle');
   const current=carriers.find(m=>L.platforms.find(a=>a.benchMachine===m.id).id===p.standing);
   let tx;
   if(current){const a=L.platforms.find(a=>a.benchMachine===current.id);tx=a.x+70;jump=false;
    if(current.phase==='wait'){const next=carriers[carriers.indexOf(current)+1];tx=next?next.x+50:10535;jump=p.onGround;}
   }else{const next=carriers.find(m=>p.x<m.x+140);tx=next?next.x+60:10535;jump=p.onGround;}
   left=p.x+14>tx+5;right=p.x+14<tx-5;pulse=g.cooldown<=0;
  }
  updateGame(g,{left,right,jump,pulse},1/120);g.events=[];maxY=Math.min(maxY,p.y);
  if(wp===lastWP)stuck++;else{lastWP=wp;stuck=0;}
  if(trace&&f%1200===0)console.log(index+1,(f/120).toFixed(0),wp,Math.round(p.x),Math.round(p.y),p.hp,g.deaths,'target',target.x,target.y);
 }
 return {g,wp,maxY};
}
if(process.argv[1]?.endsWith('/routes.mjs'))for(let i=0;i<8;i++){const {g,wp,maxY}=traverse(i,{trace:process.argv.includes('--trace')});console.log(JSON.stringify({stage:i+1,finish:g.finished,elapsed:g.elapsed,deaths:g.deaths,wp,position:[g.player.x,g.player.y],relays:g.level.relays.map(r=>r.on),maxY}));}
