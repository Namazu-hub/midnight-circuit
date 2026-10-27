import assert from 'node:assert/strict';
import {updateGame} from '../dist/engine.mjs';
import {calibrationReady} from '../dist/action-repairs.mjs';
export function playHand(g){
 const r=g.level.relays.find(r=>r.actionRepair),a=r.actionRepair;
 const step=input=>{updateGame(g,input,1/120);assert.ok(!g.gameOver);assert.ok(!g.repairSession);g.events=[];};
 function go(x,floor){
  for(let f=0;f<1800;f++){
   const p=g.player,dx=x-(p.x+14);
   if(Math.abs(dx)<12&&p.onGround&&Math.abs(p.y+40-floor)<3)return;
   const jump=(p.onGround&&p.y+40>floor+8)||(p.jumps===1&&p.vy>-60&&p.y+40>floor-35);
   step({left:dx<-5,right:dx>5,jump,pulse:g.cooldown<=0});
  }
  throw Error(`cannot reach ${x},${floor} from ${g.player.x},${g.player.y}`);
 }
 function lock(i){
  const n=a.nodes[i];go(n.x,n.floor);step({interact:true});assert.ok(n.installed,`pin ${i}`);
  for(let t=0;t<1200&&!n.locked;t++)step({pulse:g.cooldown<=0&&calibrationReady(g,r,i)});
  assert.ok(n.locked);for(let f=0;f<100;f++)step({});
 }
 go(630,380);lock(0);
 go(460,290);go(950,265);lock(1);
 go(650,180);go(1170,150);lock(2);
 return r;
}
